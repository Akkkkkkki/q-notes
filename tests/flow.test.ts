import { describe, it, expect, beforeEach, vi } from 'vitest';
import worker from '../worker/index';
import { parseBacklog, parseSparks } from '../worker/flow';
import { MockGitHub, makeEnv, call } from './mock-github';

/** Flow — GET /api/flow aggregation, GET /api/health, and the needs-you list. */

const DAY_MS = 86400000;

function daysAgo(n: number): string {
  return new Date(Date.now() - n * DAY_MS).toISOString().slice(0, 10);
}

function backlogFixture(): string {
  return `# Research Backlog

Preamble text.

## Backlog item template

\`\`\`md
## YYYY-MM-DD — Short working title

**Status:** Backlog | Drafted in \`src/content/posts/example.md\` on YYYY-MM-DD | Rejected
\`\`\`

## ${daysAgo(2)} — Fresh candidate

**Status:** Backlog

**One-line thesis:** A crisp claim.

**Draftability:** High, because reasons.

## ${daysAgo(18)} — Nearly expired candidate

**Status:** Backlog

**One-line thesis:** An aging claim.

**Draftability:** Medium, maybe.

## ${daysAgo(10)} — Already drafted

**Status:** Drafted in \`src/content/posts/x.en.md\` on ${daysAgo(3)}

**One-line thesis:** Done already.

## ${daysAgo(40)} — Long gone

**Status:** Expired (${daysAgo(19)})

**One-line thesis:** Too old.
`;
}

const BRIEF_PATH = 'research/interviews/2026-06-09-agents-as-clis.md';
const BRIEF = `# Interview: Agents as the new CLIs

**Status:** Awaiting answers

## The idea in three sentences

Agents are becoming the new command line.

## Questions

1. What changed your mind?
2. Strongest counterargument?

## Author answers

### Q1

my answer
`;

let gh: MockGitHub;

beforeEach(() => {
  gh = new MockGitHub();
  gh.seedFile(
    'research/inbox.md',
    `# Inbox\n\n<!-- ${daysAgo(30)} — Example: not a real spark -->\n` +
      `${daysAgo(30)} — old consumed spark → became a backlog item\n` +
      `${daysAgo(25)} — old waiting spark about org shape\n` +
      `${daysAgo(1)} — fresh spark\n`
  );
  gh.seedFile('research/backlog.md', backlogFixture());
  gh.seedFile(BRIEF_PATH, BRIEF);
  gh.repoCommits = [
    { message: 'Merge pull request #30 — ship the coordination essay', date: daysAgo(4) + 'T08:00:00Z' },
    { message: 'Add consulting essay pair', date: daysAgo(12) + 'T08:00:00Z' },
  ];
  vi.stubGlobal('fetch', gh.fetch);
});

describe('GET /api/health', () => {
  it('answers without auth and reports secret presence, never values', async () => {
    const { status, data } = await call(worker, makeEnv(), 'GET', '/api/health', undefined, null);
    expect(status).toBe(200);
    expect(data).toEqual({
      ok: true,
      secrets: { GITHUB_TOKEN: true, CAPTURE_TOKEN: true, webPush: false },
    });
  });

  it('says which secret is missing when the Worker is unconfigured', async () => {
    const env = makeEnv({ CAPTURE_TOKEN: '' as any });
    const { status, data } = await call(worker, env, 'GET', '/api/health', undefined, null);
    expect(status).toBe(200);
    expect(data.ok).toBe(false);
    expect(data.secrets.CAPTURE_TOKEN).toBe(false);
    expect(data.secrets.GITHUB_TOKEN).toBe(true);
  });
});

describe('parseBacklog', () => {
  it('parses items, skips the template block, and classifies statuses', () => {
    const items = parseBacklog(backlogFixture());
    expect(items.map((i) => i.status)).toEqual(['live', 'live', 'drafted', 'expired']);
    expect(items[0].title).toBe('Fresh candidate');
    expect(items[0].thesis).toBe('A crisp claim.');
    expect(items[0].draftability).toBe('High');
    expect(items[0].expiresInDays).toBe(19);
    expect(items[1].expiresInDays).toBe(3);
  });
});

describe('parseSparks', () => {
  it('reads dated lines, skips comments, and detects consumption', () => {
    const sparks = parseSparks(
      `# Inbox\n<!-- 2026-01-01 — Example: nope -->\n2026-01-02 — waiting\n2026-01-03 — used → posts/x.md\n`
    );
    expect(sparks).toHaveLength(2);
    expect(sparks[0].consumed).toBe(false);
    expect(sparks[1].consumed).toBe(true);
  });
});

describe('GET /api/flow', () => {
  it('requires auth', async () => {
    const { status } = await call(worker, makeEnv(), 'GET', '/api/flow', undefined, null);
    expect(status).toBe(401);
  });

  it('aggregates every stage of the pipeline', async () => {
    gh.seedPr({
      number: 7,
      title: 'Add agents essay',
      body: 'Tier: essay.',
      files: ['src/content/posts/agents.en.md', 'src/content/posts/agents.zh.md'],
      comments: ['Ready to ship — checklist passes.'],
    });

    const { status, data } = await call(worker, makeEnv(), 'GET', '/api/flow');
    expect(status).toBe(200);

    expect(data.sparks.unconsumed).toBe(2);
    expect(data.sparks.consumed).toBe(1);
    expect(data.sparks.recent[0].text).toBe('fresh spark');

    expect(data.backlog.live).toHaveLength(2);
    expect(data.backlog.draftedCount).toBe(1);
    expect(data.backlog.expiredCount).toBe(1);

    expect(data.interview).toMatchObject({ path: BRIEF_PATH, answered: 1, total: 2 });

    expect(data.desk).toHaveLength(1);
    expect(data.desk[0]).toMatchObject({ number: 7, tier: 'essay', verdict: 'ready' });

    expect(data.published).toHaveLength(2);
    expect(data.published[0].date).toBe(daysAgo(4));

    expect(data.schedule.map((s: any) => s.routine)).toEqual([
      'Scout',
      'Interviewer',
      'Drafter',
      'Ship gate',
    ]);
  });

  it('puts a ready-to-ship PR and an aging PR at the top of needsYou', async () => {
    gh.seedPr({
      number: 7,
      title: 'Ready essay',
      body: 'Tier: essay.',
      files: ['src/content/posts/a.en.md'],
      comments: ['Ready to ship — 3 bullets.'],
    });
    gh.seedPr({
      number: 8,
      title: 'Stale note',
      body: 'Tier: note.',
      created_at: new Date(Date.now() - 8 * DAY_MS).toISOString(),
      files: ['src/content/posts/b.en.md'],
      comments: [],
    });

    const { data } = await call(worker, makeEnv(), 'GET', '/api/flow');
    const urgencies = data.needsYou.map((n: any) => n.urgency);
    expect(urgencies.slice(0, 2)).toEqual(['now', 'now']);
    expect(data.needsYou[0].text).toContain('#7');
    expect(data.needsYou[0].text).toMatch(/ready to ship/i);
    expect(data.needsYou[1].text).toContain('#8');
    expect(data.needsYou[1].text).toMatch(/7-day mark/);
    // The half-answered brief is also on the list, pointing at the Interview.
    expect(data.needsYou.some((n: any) => n.href === '/interview/')).toBe(true);
    // Urgencies are sorted now → soon → later.
    const rank = { now: 0, soon: 1, later: 2 } as Record<string, number>;
    const ranks = data.needsYou.map((n: any) => rank[n.urgency]);
    expect(ranks).toEqual([...ranks].sort((a: number, b: number) => a - b));
  });

  it('nudges capture when the inbox has no waiting sparks', async () => {
    gh.files.set('research/inbox.md', `# Inbox\n\n${daysAgo(5)} — consumed → posts/x.md\n`);
    const { data } = await call(worker, makeEnv(), 'GET', '/api/flow');
    const nudge = data.needsYou.find((n: any) => n.href === '/capture/');
    expect(nudge).toBeDefined();
    expect(nudge.urgency).toBe('later');
  });

  it('surfaces an aged unconsumed spark as a still-true question', async () => {
    gh.files.set(
      'research/inbox.md',
      `# Inbox\n\n${daysAgo(30)} — a very old thought about org design\n`
    );
    const { data } = await call(worker, makeEnv(), 'GET', '/api/flow');
    const echo = data.needsYou.find((n: any) => /still true\?/.test(n.text));
    expect(echo).toBeDefined();
    expect(echo.text).toContain('org design');
  });

  it('keeps working when the commits API is unavailable', async () => {
    gh.repoCommits = null as any; // route will throw → recentPublishes catches
    const { status, data } = await call(worker, makeEnv(), 'GET', '/api/flow');
    expect(status).toBe(200);
    expect(data.published).toEqual([]);
  });
});
