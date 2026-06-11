import { describe, it, expect, beforeEach, vi } from 'vitest';
import worker from '../worker/index';
import { collapse, todayIn } from '../worker/github';
import { MockGitHub, makeEnv, call, TOKEN } from './mock-github';

/** Phase 1 — Capture: POST /api/spark, GET /api/sparks, auth, inbox invariants. */

const INBOX = 'research/inbox.md';

let gh: MockGitHub;

beforeEach(() => {
  gh = new MockGitHub();
  gh.seedFile(INBOX, '# Inbox\n\n2026-06-01 — an older spark\n');
  vi.stubGlobal('fetch', gh.fetch);
});

describe('auth', () => {
  it('rejects requests without a token', async () => {
    const { status } = await call(worker, makeEnv(), 'POST', '/api/spark', { text: 'x' }, null);
    expect(status).toBe(401);
  });

  it('rejects a wrong token', async () => {
    const { status } = await call(worker, makeEnv(), 'POST', '/api/spark', { text: 'x' }, 'wrong');
    expect(status).toBe(401);
  });

  it('returns 503 when Worker secrets are missing', async () => {
    const env = makeEnv({ CAPTURE_TOKEN: '' as any });
    const { status } = await call(worker, env, 'POST', '/api/spark', { text: 'x' });
    expect(status).toBe(503);
  });

  it('404s unknown API routes', async () => {
    const { status } = await call(worker, makeEnv(), 'GET', '/api/nope');
    expect(status).toBe(404);
  });
});

describe('POST /api/spark', () => {
  it('appends a dated one-line spark to the inbox', async () => {
    const { status, data } = await call(worker, makeEnv(), 'POST', '/api/spark', {
      text: 'agents are the new CLIs',
    });
    expect(status).toBe(200);
    const today = todayIn('Asia/Shanghai');
    expect(data.line).toBe(`${today} — agents are the new CLIs`);
    expect(gh.files.get(INBOX)).toContain(`\n${today} — agents are the new CLIs\n`);
    expect(gh.commits[0].message).toBe('spark: agents are the new CLIs');
  });

  it('collapses multi-line input to one line — the inbox invariant', async () => {
    const { data } = await call(worker, makeEnv(), 'POST', '/api/spark', {
      text: 'line one\nline two\n\n# not a heading',
    });
    expect(data.line).toContain('line one line two # not a heading');
    expect(gh.files.get(INBOX)!.match(/line one/g)).toHaveLength(1);
  });

  it('records share-target provenance after the spark text', async () => {
    const { data } = await call(worker, makeEnv(), 'POST', '/api/spark', {
      text: 'sharp take',
      url: 'https://example.com/post',
    });
    expect(data.line).toMatch(/sharp take ← https:\/\/example\.com\/post$/);
  });

  it('rejects empty and oversized sparks', async () => {
    expect((await call(worker, makeEnv(), 'POST', '/api/spark', { text: '   ' })).status).toBe(400);
    expect(
      (await call(worker, makeEnv(), 'POST', '/api/spark', { text: 'x'.repeat(2001) })).status
    ).toBe(400);
  });

  it('retries once on a write conflict, then succeeds', async () => {
    gh.putConflicts = 1;
    const { status } = await call(worker, makeEnv(), 'POST', '/api/spark', { text: 'retry me' });
    expect(status).toBe(200);
    expect(gh.files.get(INBOX)).toContain('retry me');
  });

  it('gives up with 409 when the conflict persists', async () => {
    gh.putConflicts = 5;
    const { status } = await call(worker, makeEnv(), 'POST', '/api/spark', { text: 'never lands' });
    expect(status).toBe(409);
  });
});

describe('GET /api/sparks', () => {
  it('returns the last three sparks, newest first', async () => {
    for (const t of ['one', 'two', 'three']) {
      await call(worker, makeEnv(), 'POST', '/api/spark', { text: t });
    }
    const { data } = await call(worker, makeEnv(), 'GET', '/api/sparks');
    expect(data.sparks).toHaveLength(3);
    expect(data.sparks[0]).toContain('three');
    expect(data.sparks[2]).toContain('one');
  });
});

describe('helpers', () => {
  it('collapse flattens whitespace', () => {
    expect(collapse('  a\n\tb   c \n')).toBe('a b c');
  });

  it('todayIn formats as YYYY-MM-DD', () => {
    expect(todayIn('Asia/Shanghai')).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
