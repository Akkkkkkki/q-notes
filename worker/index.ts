/**
 * Companion API — Phases 1 (Capture), 2 (Interview), and 3 (Desk).
 *
 * The only writable paths are hard-coded in their modules: this Worker is
 * the path allowlist (docs/companion-vision.md §5).
 *   - research/inbox.md                              (append-spark, below)
 *   - research/backlog.md                            (pass-backlog, worker/backlog.ts)
 *   - research/interviews/<date>-<slug>.md           (worker/interview.ts)
 *   - research/voice.md                              (Proposed records only, worker/voice.ts)
 *   - research/.companion/push-subscriptions.json    (worker/push.ts)
 *   - src/content/** and drafts/** on PR branches    (apply-slots only, worker/desk.ts)
 *
 * Secrets (wrangler secret put …):
 *   GITHUB_TOKEN      — fine-grained PAT, this repo only,
 *                       contents: read/write + pull requests: read/write
 *   CAPTURE_TOKEN     — shared secret the pages / Shortcuts send as a Bearer token
 *   VAPID_PUBLIC_KEY,
 *   VAPID_PRIVATE_JWK — optional, for Tuesday/Friday web push (scripts/generate-vapid.mjs)
 */

import type { Env } from './types';
import { getFile, putFile, todayIn, collapse, json } from './github';
import { getBrief, saveAnswer, closeBrief, setBriefReady } from './interview';
import { passBacklogItem } from './backlog';
import { listDesk, shipPr, commentPr, killPr, applySlots, getDraft } from './desk';
import { getFlow } from './flow';
import { getPublicKey, subscribe, notifyIfBriefOpen, notifyIfDeskOpen } from './push';

const INBOX_PATH = 'research/inbox.md';
const MAX_SPARK_LENGTH = 2000;
const MAX_URL_LENGTH = 500;
// A tidied capture can split into several thoughts; cap it so one request
// can't append an unbounded block to the inbox.
const MAX_SPARK_LINES = 20;
const SPARK_KINDS = ['spark', 'question', 'quote', 'link'] as const;
type SparkKind = (typeof SPARK_KINDS)[number];

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/api/')) {
      return handleApi(request, url, env);
    }
    return env.ASSETS.fetch(request);
  },

  // Tuesday 08:30 Asia/Shanghai: brief nudge. Friday 08:30: desk summary.
  // (Both 00:30 UTC, see wrangler.jsonc triggers.)
  async scheduled(event: { cron?: string }, env: Env): Promise<void> {
    if (event?.cron === '30 0 * * 5') {
      await notifyIfDeskOpen(env);
    } else {
      await notifyIfBriefOpen(env);
    }
  },
};

async function handleApi(request: Request, url: URL, env: Env): Promise<Response> {
  // Health is deliberately unauthenticated and answers before the secrets
  // check: it exists precisely for the state where the secrets are gone
  // (a deploy wiped dashboard vars) and every other endpoint 503s. It
  // reports presence booleans only, never values.
  if (request.method === 'GET' && url.pathname === '/api/health') {
    return json({
      ok: !!(env.GITHUB_TOKEN && env.CAPTURE_TOKEN),
      secrets: {
        GITHUB_TOKEN: !!env.GITHUB_TOKEN,
        CAPTURE_TOKEN: !!env.CAPTURE_TOKEN,
        webPush: !!(env.VAPID_PUBLIC_KEY && env.VAPID_PRIVATE_JWK),
      },
    });
  }
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
      case 'POST /api/backlog/pass':
        return await passBacklogItem(request, env);
      case 'GET /api/brief':
        return await getBrief(env);
      case 'POST /api/answer':
        return await saveAnswer(request, env);
      case 'POST /api/brief/close':
        return await closeBrief(request, env);
      case 'POST /api/brief/ready':
        return await setBriefReady(request, env);
      case 'GET /api/desk':
        return await listDesk(env);
      case 'GET /api/desk/draft':
        return await getDraft(env, url);
      case 'GET /api/flow':
        return await getFlow(env);
      case 'POST /api/desk/ship':
        return await shipPr(request, env);
      case 'POST /api/desk/comment':
        return await commentPr(request, env);
      case 'POST /api/desk/kill':
        return await killPr(request, env);
      case 'POST /api/desk/slots':
        return await applySlots(request, env);
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
  let body: { text?: string; lines?: string[]; kind?: string; url?: string; date?: string };
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Body must be JSON' }, 400);
  }

  // A capture is one thought (`text`) or several (`lines`, the tidied split).
  // Each line is collapsed to a single line — the inbox invariant — so no
  // client can inject extra entries; the whole capture lands in one commit.
  const raw = Array.isArray(body.lines) && body.lines.length ? body.lines : [body.text ?? ''];
  const texts = raw.map((t) => collapse(typeof t === 'string' ? t : '')).filter(Boolean);
  if (!texts.length) return json({ error: 'text is required' }, 400);
  if (texts.length > MAX_SPARK_LINES) {
    return json({ error: `too many lines (max ${MAX_SPARK_LINES})` }, 400);
  }
  for (const t of texts) {
    if (t.length > MAX_SPARK_LENGTH) {
      return json({ error: `text exceeds ${MAX_SPARK_LENGTH} characters` }, 400);
    }
  }

  const kind: SparkKind = (SPARK_KINDS as readonly string[]).includes(body.kind ?? '')
    ? (body.kind as SparkKind)
    : 'spark';

  const source = collapse(body.url ?? '');
  if (source.length > MAX_URL_LENGTH) {
    return json({ error: `url exceeds ${MAX_URL_LENGTH} characters` }, 400);
  }

  const date = /^\d{4}-\d{2}-\d{2}$/.test(body.date ?? '') ? body.date! : todayIn(env.SPARK_TIMEZONE);
  // Provenance rides the first line only — the source belongs to the lead thought.
  const lines = texts.map((t, i) => `${date} — ${decorateSpark(t, kind, i === 0 ? source : '')}`);
  const lead = texts[0];
  const message = `spark: ${lead.length > 57 ? lead.slice(0, 54) + '...' : lead}${
    texts.length > 1 ? ` (+${texts.length - 1})` : ''
  }`;

  // Retry once on a write conflict (a concurrent automation commit).
  for (let attempt = 0; attempt < 2; attempt++) {
    const file = await getFile(env, INBOX_PATH);
    if (!file) return json({ error: 'Inbox not found' }, 502);
    const content = file.content.endsWith('\n') ? file.content : file.content + '\n';
    const result = await putFile(env, INBOX_PATH, content + lines.join('\n') + '\n', message, file.sha);
    if (result.ok) {
      return json({ ok: true, line: lines[0], lines, commit: result.commitUrl });
    }
    if (result.status !== 409) {
      return json({ error: `GitHub API error (${result.status})` }, 502);
    }
  }
  return json({ error: 'Write conflict, please retry' }, 409);
}

/**
 * Render one thought for the inbox, tagged by capture kind and carrying its
 * source. The inbox is format-free by design, so the tags stay light and
 * human-readable: a question keeps a `Q:` lead, a quote gets curly quotes, and
 * a link (like any capture) records provenance with `← <url>`.
 */
function decorateSpark(text: string, kind: SparkKind, source: string): string {
  let out = text;
  if (kind === 'question') out = /^q:\s/i.test(out) ? out : `Q: ${out}`;
  else if (kind === 'quote') out = /^[“"].*[”"]$/.test(out) ? out : `“${out}”`;
  return source ? `${out} ← ${source}` : out;
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
