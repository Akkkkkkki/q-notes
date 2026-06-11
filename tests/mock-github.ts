import type { Env } from '../worker/types';

/**
 * In-memory stand-in for the slice of the GitHub API the Worker uses
 * (contents, pulls, issue comments). Tests point the Worker at it via the
 * `Env.GITHUB_API` override and a stubbed global fetch.
 */

export const API_BASE = 'https://gh.test';
export const REPO = 'owner/repo';

export interface MockPr {
  number: number;
  state: 'open' | 'closed';
  title: string;
  body: string | null;
  draft?: boolean;
  created_at?: string;
  head?: { ref: string; repo: { full_name: string } | null };
  files: string[];
  comments: string[];
  merged?: boolean;
}

export class MockGitHub {
  /** Default-branch files, keyed by path. */
  files = new Map<string, string>();
  /** Branch files, keyed by `branch:path`. */
  branchFiles = new Map<string, string>();
  prs: MockPr[] = [];
  /** Commit messages of every contents write, in order. */
  commits: Array<{ path: string; message: string; branch?: string }> = [];
  /** Force the next N contents writes to fail with 409 (concurrent-commit simulation). */
  putConflicts = 0;

  private shas = new Map<string, string>();
  private shaCounter = 0;

  seedFile(path: string, content: string, branch?: string) {
    const store = branch ? this.branchFiles : this.files;
    store.set(branch ? `${branch}:${path}` : path, content);
    this.shas.set(branch ? `${branch}:${path}` : path, this.nextSha());
  }

  seedPr(pr: Partial<MockPr> & { number: number }) {
    this.prs.push({
      state: 'open',
      title: `PR #${pr.number}`,
      body: null,
      draft: false,
      created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
      head: { ref: `draft/pr-${pr.number}`, repo: { full_name: REPO } },
      files: [],
      comments: [],
      ...pr,
    });
  }

  fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const url = new URL(typeof input === 'string' || input instanceof URL ? String(input) : input.url);
    const method = (init?.method ?? (typeof input === 'object' && 'method' in input ? input.method : 'GET')).toUpperCase();
    const prefix = `/repos/${REPO}/`;
    if (url.origin !== API_BASE || !url.pathname.startsWith(prefix)) {
      return new Response('{"message":"Not Found"}', { status: 404 });
    }
    const path = url.pathname.slice(prefix.length);
    const body = init?.body ? JSON.parse(String(init.body)) : undefined;

    if (path.startsWith('contents/')) {
      return this.contents(method, decodeURIComponent(path.slice('contents/'.length)), url, body);
    }

    let m: RegExpMatchArray | null;
    if (path === 'pulls' && method === 'GET') {
      const state = url.searchParams.get('state') ?? 'open';
      return ok(this.prs.filter((p) => p.state === state).map((p) => this.prJson(p)));
    }
    if ((m = path.match(/^pulls\/(\d+)\/files$/)) && method === 'GET') {
      const pr = this.pr(Number(m[1]));
      return pr ? ok(pr.files.map((filename) => ({ filename }))) : notFound();
    }
    if ((m = path.match(/^pulls\/(\d+)\/merge$/)) && method === 'PUT') {
      const pr = this.pr(Number(m[1]));
      if (!pr || pr.state !== 'open') return new Response('{}', { status: 405 });
      pr.merged = true;
      pr.state = 'closed';
      return ok({ merged: true, sha: this.nextSha() });
    }
    if ((m = path.match(/^pulls\/(\d+)$/))) {
      const pr = this.pr(Number(m[1]));
      if (!pr) return notFound();
      if (method === 'PATCH') {
        if (body?.state) pr.state = body.state;
        return ok(this.prJson(pr));
      }
      return ok(this.prJson(pr));
    }
    if ((m = path.match(/^issues\/(\d+)\/comments$/))) {
      const pr = this.pr(Number(m[1]));
      if (!pr) return notFound();
      if (method === 'POST') {
        pr.comments.push(body.body);
        return new Response(JSON.stringify({ id: pr.comments.length }), { status: 201 });
      }
      return ok(pr.comments.map((c) => ({ body: c })));
    }
    return notFound();
  };

  private contents(method: string, filePath: string, url: URL, body?: any): Response {
    if (method === 'GET') {
      const ref = url.searchParams.get('ref');
      const key = ref ? `${ref}:${filePath}` : filePath;
      const store = ref ? this.branchFiles : this.files;
      const content = store.get(key);
      if (content !== undefined) {
        return ok({ content: Buffer.from(content, 'utf8').toString('base64'), sha: this.shas.get(key) });
      }
      // Directory listing.
      const entries = [...store.keys()]
        .filter((k) => k.startsWith((ref ? `${ref}:` : '') + filePath + '/'))
        .map((k) => k.slice(((ref ? `${ref}:` : '') + filePath + '/').length))
        .filter((rest) => rest && !rest.includes('/'))
        .map((name) => ({ name, type: 'file' }));
      return entries.length ? ok(entries) : notFound();
    }
    if (method === 'PUT') {
      if (this.putConflicts > 0) {
        this.putConflicts--;
        return new Response('{"message":"conflict"}', { status: 409 });
      }
      const branch = body?.branch as string | undefined;
      const key = branch ? `${branch}:${filePath}` : filePath;
      const store = branch ? this.branchFiles : this.files;
      const currentSha = this.shas.get(key);
      if (currentSha && body?.sha !== currentSha) {
        return new Response('{"message":"sha mismatch"}', { status: 409 });
      }
      store.set(key, Buffer.from(body.content, 'base64').toString('utf8'));
      this.shas.set(key, this.nextSha());
      this.commits.push({ path: filePath, message: body.message, branch });
      return ok({ commit: { html_url: `${API_BASE}/commit/${this.shas.get(key)}` } });
    }
    return notFound();
  }

  private prJson(pr: MockPr) {
    return {
      number: pr.number,
      state: pr.state,
      title: pr.title,
      body: pr.body,
      draft: pr.draft ?? false,
      html_url: `https://github.com/${REPO}/pull/${pr.number}`,
      created_at: pr.created_at,
      head: pr.head,
      merged: pr.merged ?? false,
    };
  }

  private pr(n: number) {
    return this.prs.find((p) => p.number === n);
  }

  private nextSha() {
    return `sha-${++this.shaCounter}`;
  }
}

function ok(data: unknown): Response {
  return new Response(JSON.stringify(data), { status: 200 });
}

function notFound(): Response {
  return new Response('{"message":"Not Found"}', { status: 404 });
}

export const TOKEN = 'test-capture-token';

export function makeEnv(overrides: Partial<Env> = {}): Env {
  return {
    ASSETS: { fetch: async () => new Response('asset') },
    GITHUB_TOKEN: 'gh-token',
    CAPTURE_TOKEN: TOKEN,
    GITHUB_REPO: REPO,
    SPARK_TIMEZONE: 'Asia/Shanghai',
    GITHUB_API: API_BASE,
    ...overrides,
  } as Env;
}

/** Call the Worker's fetch handler as the Companion pages do. */
export async function call(
  worker: { fetch(req: Request, env: Env): Promise<Response> },
  env: Env,
  method: string,
  path: string,
  body?: unknown,
  token: string | null = TOKEN
): Promise<{ status: number; data: any }> {
  const res = await worker.fetch(
    new Request(`https://app.test${path}`, {
      method,
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),
    env
  );
  return { status: res.status, data: await res.json().catch(() => null) };
}
