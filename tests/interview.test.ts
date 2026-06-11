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
