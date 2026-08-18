import { beforeEach, describe, expect, it, vi } from 'vitest';
import worker from '../worker/index';
import { API_BASE, MockGitHub, REPO, call, makeEnv } from './mock-github';

describe('Desk ship gate PR lookup failures', () => {
  let gh: MockGitHub;

  beforeEach(() => {
    gh = new MockGitHub();
    gh.seedPr({
      number: 77,
      title: 'Draft: guarded note',
      body: '## Form decision\n- Public tier: note\n',
      head: { ref: 'draft/guarded-note', repo: { full_name: REPO } },
      files: ['src/content/posts/guarded-note.en.md'],
      comments: ['**Ready to ship**\n- approved'],
    });
  });

  it('fails closed when the initial PR lookup errors even if a retry would succeed', async () => {
    const baseFetch = gh.fetch;
    let directPrGets = 0;
    vi.stubGlobal('fetch', async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = new URL(typeof input === 'string' || input instanceof URL ? String(input) : input.url);
      const method = (init?.method ?? (typeof input === 'object' && 'method' in input ? input.method : 'GET')).toUpperCase();
      if (url.origin === API_BASE && method === 'GET' && url.pathname.endsWith('/pulls/77')) {
        directPrGets++;
        if (directPrGets === 1) {
          return new Response(JSON.stringify({ message: 'simulated transient outage' }), { status: 500 });
        }
      }
      return baseFetch(input, init);
    });

    const { status, data } = await call(worker, makeEnv(), 'POST', '/api/desk/ship', { number: 77 });

    expect(status).toBe(502);
    expect(data.error).toMatch(/GitHub PR fetch failed \(500\)/i);
    expect(directPrGets).toBe(1); // no legacy shipPr retry/fallback
    expect(gh.prs[0].merged).toBeFalsy();
  });
});
