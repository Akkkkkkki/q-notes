import { describe, it, expect, beforeEach, vi } from 'vitest';
import worker from '../worker/index';
import { rejectItem } from '../worker/backlog';
import { todayIn } from '../worker/github';
import { MockGitHub, makeEnv, call } from './mock-github';

/** Backlog — POST /api/backlog/pass, the Today tab's "pass on a topic" action. */

const BACKLOG = 'research/backlog.md';
const DAY_MS = 86400000;

function daysAgo(n: number): string {
  return new Date(Date.now() - n * DAY_MS).toISOString().slice(0, 10);
}

function fixture(): string {
  return `# Research Backlog

## Backlog item template

\`\`\`md
## YYYY-MM-DD — Short working title

**Status:** Backlog | Drafted in \`src/content/posts/example.md\` on YYYY-MM-DD | Rejected
\`\`\`

## ${daysAgo(2)} — Fresh candidate

**Status:** Backlog

**One-line thesis:** A crisp claim.

## ${daysAgo(10)} — Already drafted

**Status:** Drafted in \`src/content/posts/x.en.md\` on ${daysAgo(3)}

**One-line thesis:** Done already.

## ${daysAgo(5)} — Already passed

**Status:** Rejected (${daysAgo(1)}, passed via Today)

**One-line thesis:** Not this one.
`;
}

let gh: MockGitHub;

beforeEach(() => {
  gh = new MockGitHub();
  gh.seedFile(BACKLOG, fixture());
  vi.stubGlobal('fetch', gh.fetch);
});

describe('POST /api/backlog/pass', () => {
  it('requires auth', async () => {
    const { status } = await call(worker, makeEnv(), 'POST', '/api/backlog/pass',
      { date: daysAgo(2), title: 'Fresh candidate' }, null);
    expect(status).toBe(401);
  });

  it('flips a live item to Rejected and touches nothing else', async () => {
    const { status } = await call(worker, makeEnv(), 'POST', '/api/backlog/pass', {
      date: daysAgo(2),
      title: 'Fresh candidate',
    });
    expect(status).toBe(200);

    const today = todayIn('Asia/Shanghai');
    const content = gh.files.get(BACKLOG)!;
    expect(content).toContain(`**Status:** Rejected (${today}, passed via Today)`);
    expect(content).not.toContain('**Status:** Backlog\n'); // the only live item flipped
    expect(content).toContain('**One-line thesis:** A crisp claim.'); // rest of the block intact
    expect(gh.commits[0].message).toBe('backlog: pass "Fresh candidate"');

    // The flow sees it as rejected: no live items remain.
    const { data } = await call(worker, makeEnv(), 'GET', '/api/flow');
    expect(data.backlog.live).toHaveLength(0);
  });

  it('records the optional reason on the status line', async () => {
    await call(worker, makeEnv(), 'POST', '/api/backlog/pass', {
      date: daysAgo(2),
      title: 'Fresh candidate',
      reason: 'already wrote about this',
    });
    expect(gh.files.get(BACKLOG)).toContain('passed via Today: already wrote about this)');
  });

  it('404s a topic that is not in the backlog', async () => {
    const { status } = await call(worker, makeEnv(), 'POST', '/api/backlog/pass', {
      date: daysAgo(2),
      title: 'Never existed',
    });
    expect(status).toBe(404);
  });

  it('refuses to pass a drafted item', async () => {
    const { status, data } = await call(worker, makeEnv(), 'POST', '/api/backlog/pass', {
      date: daysAgo(10),
      title: 'Already drafted',
    });
    expect(status).toBe(400);
    expect(data.error).toMatch(/Publish tab/);
  });

  it('409s an item that was already passed', async () => {
    const { status } = await call(worker, makeEnv(), 'POST', '/api/backlog/pass', {
      date: daysAgo(5),
      title: 'Already passed',
    });
    expect(status).toBe(409);
  });

  it('validates the date and title', async () => {
    expect((await call(worker, makeEnv(), 'POST', '/api/backlog/pass',
      { date: 'YYYY-MM-DD', title: 'Short working title' })).status).toBe(400);
    expect((await call(worker, makeEnv(), 'POST', '/api/backlog/pass',
      { date: daysAgo(2), title: '  ' })).status).toBe(400);
  });

  it('retries once on a write conflict, then gives up with 409', async () => {
    gh.putConflicts = 1;
    const first = await call(worker, makeEnv(), 'POST', '/api/backlog/pass', {
      date: daysAgo(2),
      title: 'Fresh candidate',
    });
    expect(first.status).toBe(200);

    gh.seedFile(BACKLOG, fixture());
    gh.putConflicts = 5;
    const second = await call(worker, makeEnv(), 'POST', '/api/backlog/pass', {
      date: daysAgo(2),
      title: 'Fresh candidate',
    });
    expect(second.status).toBe(409);
  });
});

describe('rejectItem', () => {
  it('inserts a Status line when the block has none', () => {
    const content = `# Backlog\n\n## 2026-07-01 — No status here\n\n**One-line thesis:** Bare block.\n`;
    const result = rejectItem(content, '2026-07-01', 'No status here', '**Status:** Rejected (x)');
    expect(result).toHaveProperty('content');
    const next = (result as { content: string }).content;
    expect(next.indexOf('**Status:** Rejected (x)')).toBeGreaterThan(next.indexOf('## 2026-07-01'));
    expect(next.indexOf('**Status:** Rejected (x)')).toBeLessThan(next.indexOf('Bare block'));
  });
});
