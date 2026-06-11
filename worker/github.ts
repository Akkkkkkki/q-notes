import type { Env } from './types';

/**
 * GitHub Contents API helpers. Every write in the Companion goes through
 * these, and every caller hard-codes its path — the Worker is the path
 * allowlist (docs/companion-vision.md §5).
 */

export async function getFile(
  env: Env,
  path: string
): Promise<{ content: string; sha: string } | null> {
  const res = await github(env, 'GET', path);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GitHub read failed (${res.status})`);
  const data = (await res.json()) as { content: string; sha: string };
  return { content: fromBase64(data.content), sha: data.sha };
}

export async function putFile(
  env: Env,
  path: string,
  content: string,
  message: string,
  sha?: string
): Promise<{ ok: boolean; status: number; commitUrl?: string }> {
  const res = await github(env, 'PUT', path, {
    message,
    content: toBase64(content),
    ...(sha ? { sha } : {}),
  });
  if (!res.ok) return { ok: false, status: res.status };
  const data = (await res.json()) as { commit?: { html_url?: string } };
  return { ok: true, status: res.status, commitUrl: data.commit?.html_url };
}

export async function listDir(env: Env, path: string): Promise<string[]> {
  const res = await github(env, 'GET', path);
  if (res.status === 404) return [];
  if (!res.ok) throw new Error(`GitHub list failed (${res.status})`);
  const data = (await res.json()) as Array<{ name: string; type: string }>;
  return data.filter((e) => e.type === 'file').map((e) => e.name);
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

export function todayIn(timeZone: string): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: timeZone || 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

/** Collapse arbitrary input to a single line — the inbox's one-line invariant. */
export function collapse(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
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
