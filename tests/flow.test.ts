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

## ${daysAgo(6)} — Passed over

**Status:** Rejected (${daysAgo(1)}, passed via Today)

**One-line thesis:** Not mine.
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
    expect(items.map((i) => i.status)).toEqual(['live', 'live', 'drafted', 'expired', 'rejected']);
    expect(items[0].title).toBe('Fresh candidate');
    expect(items[0].thesis).toBe('A crisp claim.');
    expect(items[0].draftability).toBe('High');
    expect(items[0].expiresInDays).toBe(19);
    expect(items[1].expiresInDays).toBe(3);
  });

  it('projects the 21-day clock: a still-Backlog item past expiry reads as expired', () => {
    // The scout marks these Expired in the file, but it's an external routine;
    // until it runs the file still says Backlog. The view must not leave the
    // item stuck in the live queue at "expires in 0d".
    const items = parseBacklog(
      `# Research Backlog\n\n## ${daysAgo(21)} — Aged out, scout hasn't run\n\n**Status:** Backlog\n\n**One-line thesis:** Past its clock.\n`
    );
    expect(items[0].status).toBe('expired');
    expect(items[0].expiresInDays).toBeLessThanOrEqual(0);
  });

  it('does not expire an in-flight interview whose topic date is past 21 days', () => {
    // The interviewer stamps `Interviewing since ...`; the brief may still be
    // awaiting answers. The clock projection is scoped to raw `Backlog` (like
    // the scout), so an active interview never decays out of the live queue.
    const items = parseBacklog(
      `# Research Backlog\n\n## ${daysAgo(30)} — Being interviewed right now\n\n**Status:** Interviewing since ${daysAgo(2)}\n\n**One-line thesis:** Still live.\n`
    );
    expect(items[0].status).toBe('live');
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
    // Two published pairs on disk → the belt's last node reads 2, not 4.
    for (const slug of ['taste-is-judgment', 'consulting-barbell']) {
      gh.seedFile(`src/content/posts/${slug}.en.md`, '# en\n');
      gh.seedFile(`src/content/posts/${slug}.zh.md`, '# zh\n');
    }

    const { status, data } = await call(worker, makeEnv(), 'GET', '/api/flow');
    expect(status).toBe(200);

    expect(data.sparks.unconsumed).toBe(2);
    expect(data.sparks.consumed).toBe(1);
    expect(data.sparks.recent[0].text).toBe('fresh spark');

    expect(data.backlog.live).toHaveLength(2);
    expect(data.backlog.draftedCount).toBe(1);
    expect(data.backlog.expiredCount).toBe(1);
    expect(data.backlog.passedCount).toBe(1);

    expect(data.interview).toMatchObject({ path: BRIEF_PATH, answered: 1, total: 2 });

    expect(data.desk).toHaveLength(1);
    expect(data.desk[0]).toMatchObject({ number: 7, tier: 'essay', verdict: 'ready' });

    expect(data.published).toHaveLength(2);
    expect(data.published[0].date).toBe(daysAgo(4));
    expect(data.publishedTotal).toBe(2); // one per en/zh pair

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

  it('raises author feedback that no gate pass has answered, above a stale ready verdict', async () => {
    gh.seedPr({
      number: 9,
      title: 'Note with feedback',
      body: 'Tier: note.',
      files: ['src/content/posts/c.en.md'],
      comments: [
        'Ready to ship — 3 bullets.',
        '**A/B calibration — Q1: C.** “…”\n\n_(via Desk)_',
        '**One change:** more real examples, deeper research.\n\n_(via Desk)_',
      ],
    });

    const { data } = await call(worker, makeEnv(), 'GET', '/api/flow');
    const item = data.needsYou.find((n: any) => n.text.includes('#9'));
    expect(item.urgency).toBe('now');
    expect(item.text).toMatch(/2 notes from you not worked in yet/);
    // The verdict predates the feedback, so it must not read as a go-ahead.
    expect(data.needsYou.filter((n: any) => n.text.includes('#9'))).toHaveLength(1);
    expect(item.text).not.toMatch(/ready to ship/i);
  });

  it('keeps the downgrade clock visible on an aging PR that also has pending feedback', async () => {
    gh.seedPr({
      number: 10,
      title: 'Aging note with feedback',
      body: 'Tier: note.',
      created_at: new Date(Date.now() - 8 * DAY_MS).toISOString(),
      files: ['src/content/posts/d.en.md'],
      comments: ['**One change:** tighten the closer.\n\n_(via Desk)_'],
    });

    const { data } = await call(worker, makeEnv(), 'GET', '/api/flow');
    const items = data.needsYou.filter((n: any) => n.text.includes('#10'));
    expect(items).toHaveLength(2);
    expect(items.some((n: any) => /1 note from you/.test(n.text))).toBe(true);
    expect(items.some((n: any) => /7-day mark/.test(n.text))).toBe(true);
  });

  it('keeps prompting for the green light when every question is answered but the brief is not ready', async () => {
    gh.seedFile(
      BRIEF_PATH,
      BRIEF.replace('## Author answers\n', '## Author answers\n\n### Q1\n\na\n\n### Q2\n\nb\n')
    );
    const { data } = await call(worker, makeEnv(), 'GET', '/api/flow');
    expect(data.interview).toMatchObject({ answered: 2, total: 2, ready: false });
    const item = data.needsYou.find((n: any) => n.href === '/interview/');
    expect(item).toBeDefined();
    expect(item.text).toMatch(/Ready to draft/);
    expect(item.text).toMatch(/form and scope still follow the material/i);
    expect(item.text).not.toMatch(/full Essay/i);
  });

  it('does not promise an Essay before all interview questions are answered', async () => {
    const { data } = await call(worker, makeEnv(), 'GET', '/api/flow');
    const item = data.needsYou.find((n: any) => n.href === '/interview/');
    expect(item).toBeDefined();
    expect(item.text).toMatch(/authorizes use of what you supplied/i);
    expect(item.text).toMatch(/form and scope still follow the material/i);
    expect(item.text).not.toMatch(/full Essay/i);
  });

  it('drops the interview from needsYou once the brief is marked ready to draft', async () => {
    gh.seedFile(BRIEF_PATH, BRIEF.replace('Awaiting answers', 'Ready to draft (2026-06-11)'));
    const { data } = await call(worker, makeEnv(), 'GET', '/api/flow');
    expect(data.interview.ready).toBe(true);
    expect(data.needsYou.some((n: any) => n.href === '/interview/')).toBe(false);
  });

  it('flags a stall when a green-lit brief has sat through a drafter slot with no PR', async () => {
    gh.seedFile(BRIEF_PATH, BRIEF.replace('Awaiting answers', `Ready to draft (${daysAgo(21)})`));
    const { data } = await call(worker, makeEnv(), 'GET', '/api/flow');
    const stall = data.needsYou.find((n: any) => /drafter has still opened no PR/.test(n.text));
    expect(stall).toBeDefined();
    expect(stall.urgency).toBe('now');
    expect(stall.href).toBe('/desk/');
    expect(stall.text).toMatch(/routine 03/);
  });

  it('does not cry stall while a PR opened since the green light is on the Desk', async () => {
    gh.seedFile(BRIEF_PATH, BRIEF.replace('Awaiting answers', `Ready to draft (${daysAgo(21)})`));
    gh.seedPr({
      number: 9,
      title: 'The essay the drafter produced',
      body: 'Tier: essay.',
      created_at: new Date(Date.now() - 3 * DAY_MS).toISOString(),
      files: ['src/content/posts/a.en.md'],
      comments: [],
    });
    const { data } = await call(worker, makeEnv(), 'GET', '/api/flow');
    expect(data.needsYou.some((n: any) => /drafter has still opened no PR/.test(n.text))).toBe(false);
  });

  it('still flags the stall when the only open PR predates the green light', async () => {
    gh.seedFile(BRIEF_PATH, BRIEF.replace('Awaiting answers', `Ready to draft (${daysAgo(21)})`));
    // An unrelated PR that has been sitting there since before the author
    // green-lit this brief says nothing about whether the drafter ever ran.
    gh.seedPr({
      number: 9,
      title: 'An older piece nobody has shipped',
      body: 'Tier: note.',
      created_at: new Date(Date.now() - 30 * DAY_MS).toISOString(),
      files: ['src/content/posts/a.en.md'],
      comments: [],
    });
    const { data } = await call(worker, makeEnv(), 'GET', '/api/flow');
    expect(data.needsYou.some((n: any) => /drafter has still opened no PR/.test(n.text))).toBe(true);
  });

  it('drops a brief the drafter has already shipped off the actionable list', async () => {
    gh.seedFile(
      BRIEF_PATH,
      BRIEF.replace('Awaiting answers', 'Drafted in `src/content/posts/x.en.md` on 2026-06-12')
    );
    const { data } = await call(worker, makeEnv(), 'GET', '/api/flow');
    // Terminal like `closed`: no badge, no green-light prompt, no stall warning.
    expect(data.interview).toBeNull();
    expect(data.needsYou.some((n: any) => n.href === '/interview/')).toBe(false);
    expect(data.needsYou.some((n: any) => /drafter has still opened no PR/.test(n.text))).toBe(false);
  });

  it('gives a freshly green-lit brief until its drafter slot before calling it stalled', async () => {
    gh.seedFile(BRIEF_PATH, BRIEF.replace('Awaiting answers', `Ready to draft (${daysAgo(0)})`));
    const { data } = await call(worker, makeEnv(), 'GET', '/api/flow');
    expect(data.interview.readyDate).toBe(daysAgo(0));
    expect(data.needsYou.some((n: any) => /drafter has still opened no PR/.test(n.text))).toBe(false);
  });

  it('shows the author’s takes back on their topic card', async () => {
    gh.files.set(
      'research/inbox.md',
      `# Inbox\n\n` +
        `${daysAgo(1)} — On “Fresh candidate”: my firsthand story ← https://x.test/a\n` +
        `${daysAgo(1)} — On "Fresh candidate": consumed take → interviews/x.md\n` +
        `${daysAgo(1)} — On “Fresh candidate”: sourced take ← https://x.test/b → interviews/x.md\n` +
        `${daysAgo(1)} — an unrelated spark\n`
    );
    const { data } = await call(worker, makeEnv(), 'GET', '/api/flow');
    const fresh = data.backlog.live.find((i: any) => i.title === 'Fresh candidate');
    expect(fresh.takes).toEqual([
      { date: daysAgo(1), text: 'my firsthand story' },
      { date: daysAgo(1), text: 'consumed take' },
      { date: daysAgo(1), text: 'sourced take' },
    ]);
    const aging = data.backlog.live.find((i: any) => i.title === 'Nearly expired candidate');
    expect(aging.takes).toEqual([]);
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
