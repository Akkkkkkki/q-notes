import { beforeEach, describe, expect, it, vi } from 'vitest';
import worker from '../worker/index';
import { MockGitHub, makeEnv, call, REPO } from './mock-github';

/** Runtime backstop for the #68 editorial-critic → ship-gate contract. */

describe('Desk ship endpoint requires a ship-gate Ready verdict', () => {
  let gh: MockGitHub;

  beforeEach(() => {
    gh = new MockGitHub();
    gh.seedPr({
      number: 77,
      title: 'Draft: critic-gated note',
      body: '## Form decision\n- Public tier: note\n',
      head: { ref: 'draft/critic-gated-note', repo: { full_name: REPO } },
      files: ['src/content/posts/critic-gated-note.en.md', 'src/content/posts/critic-gated-note.zh.md'],
      comments: [],
    });
    vi.stubGlobal('fetch', gh.fetch);
  });

  it('fails closed when no ship-gate verdict exists', async () => {
    const { status, data } = await call(worker, makeEnv(), 'POST', '/api/desk/ship', { number: 77 });
    expect(status).toBe(409);
    expect(data.error).toMatch(/ship-gate Ready verdict/i);
    expect(gh.prs[0].merged).toBeFalsy();
  });

  it('refuses an older Ready when the latest gate verdict is blocking', async () => {
    gh.prs[0].comments.push(
      '**Ready to ship**\n- old pass',
      '**Checklist fails**\n- critic KEEP is stale'
    );
    const { status } = await call(worker, makeEnv(), 'POST', '/api/desk/ship', { number: 77 });
    expect(status).toBe(409);
    expect(gh.prs[0].merged).toBeFalsy();
  });

  it('allows merge after the latest gate verdict is Ready', async () => {
    gh.prs[0].comments.push('**Ready to ship**\n- critic KEEP checked\n- mechanical checks pass');
    const { status, data } = await call(worker, makeEnv(), 'POST', '/api/desk/ship', { number: 77 });
    expect(status).toBe(200);
    expect(data.merged).toBe(true);
  });

  it('allows an explicit cadence override from a queued Ready verdict', async () => {
    gh.prs[0].comments.push('**Ready — queued** until 2026-08-25.');
    const { status, data } = await call(worker, makeEnv(), 'POST', '/api/desk/ship', { number: 77 });
    expect(status).toBe(200);
    expect(data.merged).toBe(true);
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
