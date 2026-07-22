import { describe, it, expect, beforeEach, vi } from 'vitest';
import worker from '../worker/index';
import { parseBrief } from '../worker/interview';
import { MockGitHub, makeEnv, call } from './mock-github';

/** Phase 2 — Interview: brief parsing, per-question answer commits, close. */

const BRIEF_PATH = 'research/interviews/2026-06-09-agents-as-clis.md';

const BRIEF = `# Interview: Agents as the new CLIs

**Status:** Awaiting answers

## The idea in three sentences

Agents are becoming the new command line.
Power users script them.
Everyone else gets a worse deal.

## Questions

1. What changed your mind here?
   → a specific project where you flipped
   → or: you didn't flip, you just found better words
   → push: steelman the view that nothing actually changed
   → read: Simon Willison — CLIs for agents — https://simonwillison.net/agents
2. Give one concrete example from consulting
   where this already happened.
3. What's the strongest counterargument?

## Author answers
`;

let gh: MockGitHub;

beforeEach(() => {
  gh = new MockGitHub();
  gh.seedFile('research/interviews/2026-06-02-older-brief.md', '# Interview: Older\n\n**Status:** Drafted\n');
  gh.seedFile(BRIEF_PATH, BRIEF);
  vi.stubGlobal('fetch', gh.fetch);
});

describe('parseBrief', () => {
  it('extracts title, status, idea, and questions (multi-line included)', () => {
    const brief = parseBrief(BRIEF_PATH, BRIEF);
    expect(brief.title).toBe('Agents as the new CLIs');
    expect(brief.date).toBe('2026-06-09');
    expect(brief.closed).toBe(false);
    expect(brief.idea).toContain('Power users script them.');
    expect(brief.questions.map((q) => q.n)).toEqual([1, 2, 3]);
    expect(brief.questions[1].text).toBe(
      'Give one concrete example from consulting where this already happened.'
    );
    expect(brief.questions.every((q) => q.answer === null)).toBe(true);
  });

  it('sorts → directions into choices / pushback / reading without polluting question text', () => {
    const brief = parseBrief(BRIEF_PATH, BRIEF);
    const q1 = brief.questions[0];
    expect(q1.choices).toEqual([
      'a specific project where you flipped',
      "or: you didn't flip, you just found better words",
    ]);
    expect(q1.pushback).toEqual(['steelman the view that nothing actually changed']);
    expect(q1.reading).toEqual([
      { title: 'Simon Willison — CLIs for agents', url: 'https://simonwillison.net/agents' },
    ]);
    expect(q1.text).toBe('What changed your mind here?');
    const q2 = brief.questions[1];
    expect(q2.choices).toEqual([]);
    expect(q2.pushback).toEqual([]);
    expect(q2.reading).toEqual([]);
  });

  it('reads a reading direction with no link as a bare title', () => {
    const withReading = parseBrief(
      'research/interviews/2026-06-09-x.md',
      `# Interview: X\n\n**Status:** Awaiting answers\n\n## Questions\n\n1. A question?\n   → read: Paul Graham — "Taste for Makers"\n\n## Author answers\n`
    );
    expect(withReading.questions[0].reading).toEqual([
      { title: 'Paul Graham — "Taste for Makers"', url: '' },
    ]);
  });

  it('marks a brief ready when the author has signed off', () => {
    expect(parseBrief(BRIEF_PATH, BRIEF).ready).toBe(false);
    const ready = BRIEF.replace('Awaiting answers', 'Ready to draft (2026-06-11)');
    const brief = parseBrief(BRIEF_PATH, ready);
    expect(brief.ready).toBe(true);
    expect(brief.closed).toBe(false);
  });

  it('attributes existing answers to their questions', () => {
    const withAnswer = BRIEF + '\n### Q2\n\nthe ERP migration story\n';
    const brief = parseBrief(BRIEF_PATH, withAnswer);
    expect(brief.questions[1].answer).toBe('the ERP migration story');
    expect(brief.questions[0].answer).toBeNull();
  });

  it('marks closed briefs', () => {
    const closed = BRIEF.replace('Awaiting answers', 'Closed (not this topic, 2026-06-10)');
    expect(parseBrief(BRIEF_PATH, closed).closed).toBe(true);
  });
});

describe('GET /api/brief', () => {
  it('returns the latest brief by filename date', async () => {
    const { status, data } = await call(worker, makeEnv(), 'GET', '/api/brief');
    expect(status).toBe(200);
    expect(data.brief.path).toBe(BRIEF_PATH);
    expect(data.brief.questions).toHaveLength(3);
  });

  it('returns null when no briefs exist', async () => {
    gh.files.clear();
    const { data } = await call(worker, makeEnv(), 'GET', '/api/brief');
    expect(data.brief).toBeNull();
  });
});

describe('POST /api/answer', () => {
  it('commits the answer into ## Author answers, attributed per question', async () => {
    const { status } = await call(worker, makeEnv(), 'POST', '/api/answer', {
      path: BRIEF_PATH,
      question: 2,
      text: 'the ERP migration — client scripted the agent themselves',
    });
    expect(status).toBe(200);
    const content = gh.files.get(BRIEF_PATH)!;
    expect(content).toMatch(/### Q2\n\nthe ERP migration — client scripted the agent themselves/);
    expect(content).toMatch(/\*\*Status:\*\* Answers in progress \(\d{4}-\d{2}-\d{2}\)/);
    expect(gh.commits.at(-1)!.message).toBe('interview: answer Q2 (2026-06-09-agents-as-clis)');
  });

  it('updates an existing answer in place', async () => {
    await call(worker, makeEnv(), 'POST', '/api/answer', { path: BRIEF_PATH, question: 1, text: 'first take' });
    await call(worker, makeEnv(), 'POST', '/api/answer', { path: BRIEF_PATH, question: 1, text: 'better take' });
    const content = gh.files.get(BRIEF_PATH)!;
    expect(content).toContain('better take');
    expect(content).not.toContain('first take');
    expect(content.match(/### Q1/g)).toHaveLength(1);
  });

  it('escapes heading-like lines so a dictated answer cannot split the file', async () => {
    await call(worker, makeEnv(), 'POST', '/api/answer', {
      path: BRIEF_PATH,
      question: 3,
      text: '## strongest counter\nit cuts both ways',
    });
    const content = gh.files.get(BRIEF_PATH)!;
    expect(content).toContain('\\## strongest counter');
  });

  it('rejects paths outside research/interviews — the path allowlist', async () => {
    for (const path of [
      'research/inbox.md',
      'research/interviews/../inbox.md',
      'src/content/posts/consulting-barbell.md',
      'research/interviews/nested/2026-06-09-x.md',
    ]) {
      const { status } = await call(worker, makeEnv(), 'POST', '/api/answer', { path, question: 1, text: 'x' });
      expect(status, path).toBe(400);
    }
  });

  it('rejects invalid question numbers and empty text', async () => {
    expect((await call(worker, makeEnv(), 'POST', '/api/answer', { path: BRIEF_PATH, question: 0, text: 'x' })).status).toBe(400);
    expect((await call(worker, makeEnv(), 'POST', '/api/answer', { path: BRIEF_PATH, question: 21, text: 'x' })).status).toBe(400);
    expect((await call(worker, makeEnv(), 'POST', '/api/answer', { path: BRIEF_PATH, question: 1, text: '  ' })).status).toBe(400);
  });
});

describe('POST /api/brief/close', () => {
  it('marks the brief closed — declining is a first-class action', async () => {
    const { status } = await call(worker, makeEnv(), 'POST', '/api/brief/close', { path: BRIEF_PATH });
    expect(status).toBe(200);
    expect(gh.files.get(BRIEF_PATH)).toMatch(/\*\*Status:\*\* Closed \(not this topic, \d{4}-\d{2}-\d{2}\)/);
    const { data } = await call(worker, makeEnv(), 'GET', '/api/brief');
    expect(data.brief.closed).toBe(true);
  });
});

describe('POST /api/brief/ready', () => {
  it('marks the brief ready to draft — the author-controlled green light', async () => {
    const { status, data } = await call(worker, makeEnv(), 'POST', '/api/brief/ready', { path: BRIEF_PATH, ready: true });
    expect(status).toBe(200);
    expect(data.ready).toBe(true);
    expect(gh.files.get(BRIEF_PATH)).toMatch(/\*\*Status:\*\* Ready to draft \(\d{4}-\d{2}-\d{2}\)/);
    const brief = (await call(worker, makeEnv(), 'GET', '/api/brief')).data.brief;
    expect(brief.ready).toBe(true);
  });

  it('defaults to marking ready when ready is omitted', async () => {
    await call(worker, makeEnv(), 'POST', '/api/brief/ready', { path: BRIEF_PATH });
    expect(gh.files.get(BRIEF_PATH)).toMatch(/\*\*Status:\*\* Ready to draft/);
  });

  it('reopens a ready brief back to answers in progress', async () => {
    await call(worker, makeEnv(), 'POST', '/api/brief/ready', { path: BRIEF_PATH, ready: true });
    const { data } = await call(worker, makeEnv(), 'POST', '/api/brief/ready', { path: BRIEF_PATH, ready: false });
    expect(data.ready).toBe(false);
    expect(gh.files.get(BRIEF_PATH)).toMatch(/\*\*Status:\*\* Answers in progress \(\d{4}-\d{2}-\d{2}\)/);
  });

  it('does not touch the author answers when flipping ready', async () => {
    await call(worker, makeEnv(), 'POST', '/api/answer', { path: BRIEF_PATH, question: 1, text: 'my take' });
    await call(worker, makeEnv(), 'POST', '/api/brief/ready', { path: BRIEF_PATH, ready: true });
    expect(gh.files.get(BRIEF_PATH)).toContain('my take');
  });

  it('rejects paths outside research/interviews', async () => {
    const { status } = await call(worker, makeEnv(), 'POST', '/api/brief/ready', { path: 'research/inbox.md', ready: true });
    expect(status).toBe(400);
  });
});
