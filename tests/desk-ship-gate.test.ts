import { beforeEach, describe, expect, it, vi } from 'vitest';
import worker from '../worker/index';
import { MockGitHub, makeEnv, call, REPO } from './mock-github';

/** Runtime backstop for the #68 editorial-critic → ship-gate contract. */

describe('Desk ship endpoint requires a head-bound ship-gate Ready verdict', () => {
  let gh: MockGitHub;
  const head = 'draft/critic-gated-note';
  const marker = (sha: string, verdict: 'ready' | 'queued' | 'blocked') =>
    `<!-- q-notes: ship-gate head=${sha} verdict=${verdict} -->`;

  beforeEach(() => {
    gh = new MockGitHub();
    gh.seedPr({
      number: 77,
      title: 'Draft: critic-gated note',
      body: '## Form decision\n- Public tier: note\n',
      head: { ref: head, repo: { full_name: REPO } },
      files: ['src/content/posts/critic-gated-note.en.md', 'src/content/posts/critic-gated-note.zh.md'],
      comments: [],
    });
    vi.stubGlobal('fetch', gh.fetch);
  });

  it('fails closed when no ship-gate verdict exists', async () => {
    const { status, data } = await call(worker, makeEnv(), 'POST', '/api/desk/ship', { number: 77 });
    expect(status).toBe(409);
    expect(data.error).toMatch(/head-bound ship-gate Ready verdict/i);
    expect(gh.prs[0].merged).toBeFalsy();
  });

  it('does not accept a plain-text Ready-looking owner comment', async () => {
    gh.prs[0].comments.push({ body: '**Ready to ship?** Looks good to me.', login: 'owner' });
    const { status } = await call(worker, makeEnv(), 'POST', '/api/desk/ship', { number: 77 });
    expect(status).toBe(409);
    expect(gh.prs[0].merged).toBeFalsy();
  });

  it('does not accept a correctly shaped marker from another commenter', async () => {
    gh.prs[0].comments.push({
      body: `**Ready to ship**\n\n${marker(head, 'ready')}`,
      login: 'intruder',
    });
    const { status } = await call(worker, makeEnv(), 'POST', '/api/desk/ship', { number: 77 });
    expect(status).toBe(409);
    expect(gh.prs[0].merged).toBeFalsy();
  });

  it('refuses a Ready marker bound to an older PR head', async () => {
    gh.prs[0].comments.push({
      body: `**Ready to ship**\n\n${marker('old-head', 'ready')}`,
      login: 'owner',
    });
    const { status } = await call(worker, makeEnv(), 'POST', '/api/desk/ship', { number: 77 });
    expect(status).toBe(409);
    expect(gh.prs[0].merged).toBeFalsy();
  });

  it('refuses an older Ready when the latest gate marker is blocking', async () => {
    gh.prs[0].comments.push(
      '**Ready to ship**\n- old pass',
      '**Checklist fails**\n- critic KEEP is stale'
    );
    const { status } = await call(worker, makeEnv(), 'POST', '/api/desk/ship', { number: 77 });
    expect(status).toBe(409);
    expect(gh.prs[0].merged).toBeFalsy();
  });

  it('allows merge after the latest owner gate marker is Ready for the current head', async () => {
    gh.prs[0].comments.push('**Ready to ship**\n- critic KEEP checked\n- mechanical checks pass');
    const { status, data } = await call(worker, makeEnv(), 'POST', '/api/desk/ship', { number: 77 });
    expect(status).toBe(200);
    expect(data.merged).toBe(true);
  });

  it('allows an explicit cadence override from a current-head queued verdict', async () => {
    gh.prs[0].comments.push('**Ready — queued** until 2026-08-25.');
    const { status, data } = await call(worker, makeEnv(), 'POST', '/api/desk/ship', { number: 77 });
    expect(status).toBe(200);
    expect(data.merged).toBe(true);
  });

  it('invalidates approval when the PR head changes after the verdict', async () => {
    gh.prs[0].comments.push('**Ready to ship**\n- approved before ship-time edit');
    gh.prs[0].head!.sha = 'head-after-slot-edit';
    const { status, data } = await call(worker, makeEnv(), 'POST', '/api/desk/ship', { number: 77 });
    expect(status).toBe(409);
    expect(data.error).toMatch(/head-bound|changed after/i);
    expect(gh.prs[0].merged).toBeFalsy();
  });

  it('uses GitHub merge SHA precondition if the branch moves after the final guard read', async () => {
    gh.prs[0].comments.push('**Ready to ship**\n- current-head approval');
    const baseFetch = gh.fetch;
    vi.stubGlobal('fetch', async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = new URL(typeof input === 'string' || input instanceof URL ? String(input) : input.url);
      if (url.pathname.endsWith('/pulls/77/merge')) gh.prs[0].head!.sha = 'raced-head';
      return baseFetch(input, init);
    });

    const { status, data } = await call(worker, makeEnv(), 'POST', '/api/desk/ship', { number: 77 });
    expect(status).toBe(409);
    expect(data.error).toMatch(/changed|approval/i);
    expect(gh.prs[0].merged).toBeFalsy();
  });

  it('does not let a later Ready-looking comment hide feedback after approval', async () => {
    gh.prs[0].comments.push(
      '**Ready to ship**\n- approved',
      '**One change:** make the ending less broad\n\n_(via Desk)_',
      { body: '**Ready to ship?** asking, not approving', login: 'owner' }
    );
    const { status, data } = await call(worker, makeEnv(), 'POST', '/api/desk/ship', { number: 77 });
    expect(status).toBe(409);
    expect(data.error).toMatch(/feedback/i);
    expect(gh.prs[0].merged).toBeFalsy();
  });

  it('checks the complete comment history, not only the first page', async () => {
    gh.prs[0].comments.push(
      '**Ready to ship**\n- old pass',
      ...Array.from({ length: 100 }, (_, i) => `filler ${i}`),
      '**Needs your call**\n- unresolved scope decision'
    );
    const { status } = await call(worker, makeEnv(), 'POST', '/api/desk/ship', { number: 77 });
    expect(status).toBe(409);
    expect(gh.prs[0].merged).toBeFalsy();
  });

  it('fails closed if the comment history cannot be read', async () => {
    gh.failNextComments = true;
    const { status } = await call(worker, makeEnv(), 'POST', '/api/desk/ship', { number: 77 });
    expect(status).toBe(502);
    expect(gh.prs[0].merged).toBeFalsy();
  });
});
