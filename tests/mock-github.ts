import type { Env } from '../worker/types';

/**
 * In-memory stand-in for the slice of the GitHub API the Worker uses
 * (contents, pulls, issue comments). Tests point the Worker at it via the
 * `Env.GITHUB_API` override and a stubbed global fetch.
 */

export const API_BASE = 'https://gh.test';
export const REPO = 'owner/repo';

export interface MockComment {
  body: string;
  /** Defaults to the repository owner. Use another login for spoof/untrusted-comment tests. */
  login?: string;
}

type MockCommentValue = string | MockComment;

export interface MockPr {
  number: number;
  state: 'open' | 'closed';
  title: string;
  body: string | null;
  draft?: boolean;
  created_at?: string;
  head?: { ref: string; sha?: string; repo: { full_name: string } | null };
  files: string[];
  comments: MockCommentValue[];
  merged?: boolean;
}

/**
 * Most older Desk tests use terse string fixtures for Routine-04 verdicts.
 * Routine 04 now emits a machine-readable head-bound marker with every verdict,
 * so stamp those trusted owner-authored fixture strings at insertion time. Tests
 * that need exact raw/spoofed GitHub comments use `{ body, login }` objects.
 *
 * Keep this as a plain Array with only its instance `push` wrapped. Subclassing
 * Array breaks `slice`/`map` species construction and turns unrelated mock API
 * reads into 502s.
 */
function makeMockComments(
  headSha: () => string,
  initial: MockCommentValue[] = []
): MockCommentValue[] {
  const comments: MockCommentValue[] = [];
  const rawPush = Array.prototype.push.bind(comments) as (...items: MockCommentValue[]) => number;
  comments.push = (...items: MockCommentValue[]) => {
    const head = headSha();
    return rawPush(...items.map((item) => (typeof item === 'string' ? stampGateFixture(item, head) : item)));
  };
  comments.push(...initial);
  return comments;
}

function stampGateFixture(body: string, head: string): string {
  if (/q-notes:\s*ship-gate/i.test(body) || !head) return body;
  let verdict: 'ready' | 'queued' | 'blocked' | null = null;
  if (/^[\s>#*_]*ready to ship\b/i.test(body)) verdict = 'ready';
  else if (/^[\s>#*_]*ready\s*[—–-]\s*queued\b/i.test(body)) verdict = 'queued';
  else if (/^[\s>#*_]*(?:needs your call|checklist fails|downgraded)\b/i.test(body)) verdict = 'blocked';
  return verdict
    ? `${body}\n\n<!-- q-notes: ship-gate head=${head} verdict=${verdict} -->`
    : body;
}

export class MockGitHub {
  /** Default-branch files, keyed by path. */
  files = new Map<string, string>();
  /** Branch files, keyed by `branch:path`. */
  branchFiles = new Map<string, string>();
  prs: MockPr[] = [];
  /** Commit messages of every contents write, in order. */
  commits: Array<{ path: string; message: string; branch?: string }> = [];
  /** Repo history served by GET /commits (the Flow "published" rail). */
  repoCommits: Array<{ message: string; date: string }> = [];
  /** Force the next N contents writes to fail with 409 (concurrent-commit simulation). */
  putConflicts = 0;
  /** Force the next issue-comments GET to fail with 500 (API-outage simulation). */
  failNextComments = false;

  private shas = new Map<string, string>();
  private shaCounter = 0;

  seedFile(path: string, content: string, branch?: string) {
    const store = branch ? this.branchFiles : this.files;
    store.set(branch ? `${branch}:${path}` : path, content);
    this.shas.set(branch ? `${branch}:${path}` : path, this.nextSha());
  }

  seedPr(pr: Partial<MockPr> & { number: number }) {
    const seeded: MockPr = {
      state: 'open',
      title: `PR #${pr.number}`,
      body: null,
      draft: false,
      created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
      head: { ref: `draft/pr-${pr.number}`, repo: { full_name: REPO } },
      files: [],
      comments: [],
      ...pr,
    } as MockPr;
    const initial = [...(pr.comments ?? [])];
    seeded.comments = makeMockComments(() => seeded.head?.sha ?? seeded.head?.ref ?? '', initial);
    this.prs.push(seeded);
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
    if (path === 'commits' && method === 'GET') {
      return ok(
        this.repoCommits.map((c) => ({
          commit: { message: c.message, committer: { date: c.date } },
        }))
      );
    }
    if (path === 'pulls' && method === 'GET') {
      const state = url.searchParams.get('state') ?? 'open';
      return ok(this.prs.filter((p) => p.state === state).map((p) => this.prJson(p)));
    }
    if ((m = path.match(/^pulls\/(\d+)\/files$/)) && method === 'GET') {
      const pr = this.pr(Number(m[1]));
      if (!pr) return notFound();
      const perPage = Number(url.searchParams.get('per_page') ?? 30);
      return ok(pr.files.slice(0, perPage).map((filename) => ({ filename })));
    }
    if ((m = path.match(/^pulls\/(\d+)\/merge$/)) && method === 'PUT') {
      const pr = this.pr(Number(m[1]));
      if (!pr || pr.state !== 'open') return new Response('{}', { status: 405 });
      const currentHead = pr.head?.sha ?? pr.head?.ref;
      if (body?.sha && body.sha !== currentHead) return new Response('{}', { status: 409 });
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
      if (this.failNextComments) {
        this.failNextComments = false;
        return new Response(JSON.stringify({ message: 'simulated outage' }), { status: 500 });
      }
      // Real per_page/page slicing, so a caller that paginates past 100 comments
      // is exercised the same way it would be against the real API.
      const perPage = Number(url.searchParams.get('per_page') ?? 30);
      const page = Number(url.searchParams.get('page') ?? 1);
      const start = (page - 1) * perPage;
      return ok(
        pr.comments.slice(start, start + perPage).map((comment) => {
          if (typeof comment === 'string') {
            return { body: comment, user: { login: 'owner' } };
          }
          return { body: comment.body, user: { login: comment.login ?? 'owner' } };
        })
      );
    }
    return notFound();
  };

  private contents(method: string, filePath: string, url: URL, body?: any): Response {
    if (method === 'GET') {
      const ref = url.searchParams.get('ref');
      let resolvedRef = ref;
      if (ref && !this.branchFiles.has(`${ref}:${filePath}`)) {
        const pr = this.prs.find((candidate) => candidate.head?.sha === ref);
        if (pr?.head?.ref) resolvedRef = pr.head.ref;
      }
      const key = resolvedRef ? `${resolvedRef}:${filePath}` : filePath;
      const store = resolvedRef ? this.branchFiles : this.files;
      const content = store.get(key);
      if (content !== undefined) {
        return ok({ content: Buffer.from(content, 'utf8').toString('base64'), sha: this.shas.get(key) });
      }
      // Directory listing.
      const prefix = (resolvedRef ? `${resolvedRef}:` : '') + filePath + '/';
      const entries = [...store.keys()]
        .filter((k) => k.startsWith(prefix))
        .map((k) => k.slice(prefix.length))
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
      const commitSha = this.nextSha();
      if (branch) {
        for (const pr of this.prs) {
          if (pr.head?.ref === branch) pr.head.sha = commitSha;
        }
      }
      this.commits.push({ path: filePath, message: body.message, branch });
      return ok({ commit: { html_url: `${API_BASE}/commit/${commitSha}`, sha: commitSha } });
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
      // Like the real API, head carries both the branch name and the commit
      // SHA; the default aliases sha to the ref so branch-keyed seeds resolve.
      head: pr.head ? { ...pr.head, sha: pr.head.sha ?? pr.head.ref } : pr.head,
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
