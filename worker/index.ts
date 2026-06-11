/**
 * Companion API — Phases 1 (Capture) and 2 (Interview).
 *
 * The only writable paths are hard-coded in their modules: this Worker is
 * the path allowlist (docs/companion-vision.md §5).
 *   - research/inbox.md                              (append-spark, below)
 *   - research/interviews/<date>-<slug>.md           (worker/interview.ts)
 *   - research/.companion/push-subscriptions.json    (worker/push.ts)
 *
 * Secrets (wrangler secret put …):
 *   GITHUB_TOKEN      — fine-grained PAT, this repo only, contents: read/write
 *   CAPTURE_TOKEN     — shared secret the pages / Shortcuts send as a Bearer token
 *   VAPID_PUBLIC_KEY,
 *   VAPID_PRIVATE_JWK — optional, for Tuesday-brief web push (scripts/generate-vapid.mjs)
 */

import type { Env } from './types';
import { getFile, putFile, todayIn, collapse, json } from './github';
import { getBrief, saveAnswer, closeBrief } from './interview';
import { getPublicKey, subscribe, notifyIfBriefOpen } from './push';

const INBOX_PATH = 'research/inbox.md';
const MAX_SPARK_LENGTH = 2000;
const MAX_URL_LENGTH = 500;

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/api/')) {
      return handleApi(request, url, env);
    }
    return env.ASSETS.fetch(request);
  },

  // Tuesday 08:30 Asia/Shanghai (00:30 UTC), see wrangler.jsonc triggers.
  async scheduled(_event: unknown, env: Env): Promise<void> {
    await notifyIfBriefOpen(env);
  },
};

async function handleApi(request: Request, url: URL, env: Env): Promise<Response> {
  if (!env.GITHUB_TOKEN || !env.CAPTURE_TOKEN) {
    return json({ error: 'Worker secrets not configured' }, 503);
  }
  if (!(await isAuthorized(request, env))) {
    return json({ error: 'Unauthorized' }, 401);
  }

  try {
    const route = `${request.method} ${url.pathname}`;
    switch (route) {
      case 'POST /api/spark':
        return await appendSpark(request, env);
      case 'GET /api/sparks':
        return await recentSparks(env);
      case 'GET /api/brief':
        return await getBrief(env);
      case 'POST /api/answer':
        return await saveAnswer(request, env);
      case 'POST /api/brief/close':
        return await closeBrief(request, env);
      case 'GET /api/push/key':
        return getPublicKey(env);
      case 'POST /api/push/subscribe':
        return await subscribe(request, env);
      case 'POST /api/push/unsubscribe':
        return await subscribe(request, env, true);
      default:
        return json({ error: 'Not found' }, 404);
    }
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : 'Internal error' }, 502);
  }
}

async function isAuthorized(request: Request, env: Env): Promise<boolean> {
  const header = request.headers.get('Authorization') ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) return false;

  const enc = new TextEncoder();
  const a = await crypto.subtle.digest('SHA-256', enc.encode(token));
  const b = await crypto.subtle.digest('SHA-256', enc.encode(env.CAPTURE_TOKEN));
  const av = new Uint8Array(a);
  const bv = new Uint8Array(b);
  let diff = 0;
  for (let i = 0; i < av.length; i++) diff |= av[i] ^ bv[i];
  return diff === 0;
}

async function appendSpark(request: Request, env: Env): Promise<Response> {
  let body: { text?: string; url?: string; date?: string };
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Body must be JSON' }, 400);
  }

  // One line per thought: collapse whatever arrives into a single line —
  // the provenance URL included, so no client can inject extra inbox lines.
  const text = collapse(body.text ?? '');
  if (!text) return json({ error: 'text is required' }, 400);
  if (text.length > MAX_SPARK_LENGTH) {
    return json({ error: `text exceeds ${MAX_SPARK_LENGTH} characters` }, 400);
  }

  const source = collapse(body.url ?? '');
  if (source.length > MAX_URL_LENGTH) {
    return json({ error: `url exceeds ${MAX_URL_LENGTH} characters` }, 400);
  }

  const date = /^\d{4}-\d{2}-\d{2}$/.test(body.date ?? '') ? body.date! : todayIn(env.SPARK_TIMEZONE);
  const line = source ? `${date} — ${text} ← ${source}` : `${date} — ${text}`;
  const message = `spark: ${text.length > 60 ? text.slice(0, 57) + '...' : text}`;

  // Retry once on a write conflict (a concurrent automation commit).
  for (let attempt = 0; attempt < 2; attempt++) {
    const file = await getFile(env, INBOX_PATH);
    if (!file) return json({ error: 'Inbox not found' }, 502);
    const content = file.content.endsWith('\n') ? file.content : file.content + '\n';
    const result = await putFile(env, INBOX_PATH, content + line + '\n', message, file.sha);
    if (result.ok) {
      return json({ ok: true, line, commit: result.commitUrl });
    }
    if (result.status !== 409) {
      return json({ error: `GitHub API error (${result.status})` }, 502);
    }
  }
  return json({ error: 'Write conflict, please retry' }, 409);
}

async function recentSparks(env: Env): Promise<Response> {
  const file = await getFile(env, INBOX_PATH);
  if (!file) return json({ sparks: [] });
  const sparks = file.content
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => /^\d{4}-\d{2}-\d{2}\s+—/.test(l));
  return json({ sparks: sparks.slice(-3).reverse() });
}
