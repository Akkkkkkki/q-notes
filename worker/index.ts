/**
 * Companion API — Phase 1 (Capture).
 *
 * The only writer is `POST /api/spark`, which appends a dated line to
 * `research/inbox.md` via the GitHub Contents API. The path is hard-coded:
 * this Worker is the path allowlist (docs/companion-vision.md §5).
 *
 * Secrets (wrangler secret put …):
 *   GITHUB_TOKEN  — fine-grained PAT, this repo only, contents: read/write
 *   CAPTURE_TOKEN — shared secret the capture page / Shortcuts send as a Bearer token
 */

interface Env {
  ASSETS: { fetch: typeof fetch };
  GITHUB_TOKEN: string;
  CAPTURE_TOKEN: string;
  GITHUB_REPO: string;
  SPARK_TIMEZONE: string;
  /** Override for local testing against a mock; defaults to api.github.com. */
  GITHUB_API?: string;
}

const INBOX_PATH = 'research/inbox.md';
const MAX_SPARK_LENGTH = 2000;

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname.startsWith('/api/')) {
      return handleApi(request, url, env);
    }
    return env.ASSETS.fetch(request);
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
    if (url.pathname === '/api/spark' && request.method === 'POST') {
      return await appendSpark(request, env);
    }
    if (url.pathname === '/api/sparks' && request.method === 'GET') {
      return await recentSparks(env);
    }
    return json({ error: 'Not found' }, 404);
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

  // One line per thought: collapse whatever arrives into a single line.
  const text = (body.text ?? '').replace(/\s+/g, ' ').trim();
  if (!text) return json({ error: 'text is required' }, 400);
  if (text.length > MAX_SPARK_LENGTH) {
    return json({ error: `text exceeds ${MAX_SPARK_LENGTH} characters` }, 400);
  }

  const source = (body.url ?? '').trim();
  const date = /^\d{4}-\d{2}-\d{2}$/.test(body.date ?? '') ? body.date! : todayIn(env.SPARK_TIMEZONE);
  const line = source ? `${date} — ${text} ← ${source}` : `${date} — ${text}`;
  const message = `spark: ${text.length > 60 ? text.slice(0, 57) + '...' : text}`;

  // Retry once on a write conflict (a concurrent automation commit).
  for (let attempt = 0; attempt < 2; attempt++) {
    const file = await getInbox(env);
    const content = file.content.endsWith('\n') ? file.content : file.content + '\n';
    const result = await putInbox(env, content + line + '\n', message, file.sha);
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
  const file = await getInbox(env);
  const sparks = file.content
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => /^\d{4}-\d{2}-\d{2}\s+—/.test(l));
  return json({ sparks: sparks.slice(-3).reverse() });
}

async function getInbox(env: Env): Promise<{ content: string; sha: string }> {
  const res = await github(env, 'GET', INBOX_PATH);
  if (!res.ok) throw new Error(`GitHub read failed (${res.status})`);
  const data = (await res.json()) as { content: string; sha: string };
  return { content: fromBase64(data.content), sha: data.sha };
}

async function putInbox(
  env: Env,
  content: string,
  message: string,
  sha: string
): Promise<{ ok: boolean; status: number; commitUrl?: string }> {
  const res = await github(env, 'PUT', INBOX_PATH, {
    message,
    content: toBase64(content),
    sha,
  });
  if (!res.ok) return { ok: false, status: res.status };
  const data = (await res.json()) as { commit?: { html_url?: string } };
  return { ok: true, status: res.status, commitUrl: data.commit?.html_url };
}

function github(env: Env, method: string, path: string, body?: unknown): Promise<Response> {
  const base = env.GITHUB_API || 'https://api.github.com';
  return fetch(`${base}/repos/${env.GITHUB_REPO}/contents/${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${env.GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'q-notes-companion',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}

function todayIn(timeZone: string): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: timeZone || 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

function toBase64(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000) {
    bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(bin);
}

function fromBase64(b64: string): string {
  const bin = atob(b64.replace(/\s/g, ''));
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
