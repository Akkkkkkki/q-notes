import { describe, it, expect, beforeEach, vi } from 'vitest';
import worker from '../worker/index';
import { parseAbQuestions, answeredAbQuestions } from '../worker/desk';
import { appendProposed } from '../worker/voice';
import { MockGitHub, makeEnv, call, REPO } from './mock-github';

/** Issue #44 Phase 2 — A/B calibration, read-aloud marks, voiceprint records. */

const AB_BODY = `Tier: note. Thesis: something sharp.

## Voice

### Verbatim spine (your words, kept)

- "one kept phrase"

## A/B calibration

哪个像你说的？点选或回复编号（例：1B）；跳过也是有效回答。

1. en opening
   - A. Consulting outcomes are unfalsifiable, and everyone in the room knows it.
   - B. Nobody can falsify a consulting outcome — and the room knows.
2. zh 结尾
   - A. 判断力才是稀缺品。
   - B. 稀缺的从来不是产出物，是判断。
   - C. 产出物不稀缺，判断才稀缺。

## Title options

- Something sharp
`;

const VOICE_MD = `# Voiceprint

Rules: blah.

## Stances

- existing stance

## Proposed (gardener)

- 2026-07-17 (chat observation) existing proposal
`;

const POST = `---
title: Something sharp
date: 2026-07-18
---

First paragraph, two sentences. Second one here.

第二段。中文句子。

Last paragraph.
`;

const BRANCH = 'draft/something-sharp';

let gh: MockGitHub;

beforeEach(() => {
  gh = new MockGitHub();
  gh.seedPr({
    number: 7,
    title: 'Draft: Something sharp',
    body: AB_BODY,
    head: { ref: BRANCH, repo: { full_name: REPO } },
    files: ['src/content/posts/something-sharp.md', 'research/backlog.md'],
    comments: [],
  });
  gh.seedFile('research/voice.md', VOICE_MD);
  gh.seedFile('src/content/posts/something-sharp.md', POST, BRANCH);
  vi.stubGlobal('fetch', gh.fetch);
});

describe('parseAbQuestions', () => {
  it('parses numbered questions with lettered options', () => {
    const qs = parseAbQuestions(AB_BODY);
    expect(qs).toHaveLength(2);
    expect(qs[0]).toMatchObject({ n: 1, label: 'en opening' });
    expect(qs[0].options.map((o) => o.letter)).toEqual(['A', 'B']);
    expect(qs[1].options).toHaveLength(3);
    expect(qs[1].options[2].text).toBe('产出物不稀缺，判断才稀缺。');
  });

  it('ignores a question with fewer than two options and caps at three questions', () => {
    const body =
      '## A/B calibration\n\n' +
      '1. lonely\n   - A. only one option\n' +
      [2, 3, 4, 5].map((n) => `${n}. q${n}\n   - A. aa\n   - B. bb`).join('\n');
    const qs = parseAbQuestions(body);
    expect(qs.map((q) => q.n)).toEqual([2, 3, 4]);
  });

  it('returns nothing when the PR body has no A/B section', () => {
    expect(parseAbQuestions('## Voice\n\n- something')).toEqual([]);
  });

  it('spots already-answered questions in Desk comments', () => {
    expect(
      answeredAbQuestions(['**A/B calibration — Q1: B.** “Nobody can…”\n\n_(via Desk)_', 'unrelated'])
    ).toEqual([1]);
    expect(answeredAbQuestions(['no answers here'])).toEqual([]);
  });
});

describe('GET /api/desk with A/B questions', () => {
  it('exposes questions and the answered set on the card', async () => {
    gh.prs[0].comments.push('**A/B calibration — Q1: B.** “Nobody can…”');
    const { data } = await call(worker, makeEnv(), 'GET', '/api/desk');
    expect(data.prs[0].ab.questions).toHaveLength(2);
    expect(data.prs[0].ab.answered).toEqual([1]);
  });
});

describe('POST /api/desk/comment kind=ab', () => {
  it('records the choice as a PR comment and a raw voice.md Proposed record', async () => {
    const { status, data } = await call(worker, makeEnv(), 'POST', '/api/desk/comment', {
      number: 7,
      kind: 'ab',
      question: 2,
      choice: 'B',
      why: '不喜欢"才是"的强调',
    });
    expect(status).toBe(200);
    expect(data.voiceprint).toBe(true);

    const comment = gh.prs[0].comments.at(-1)!;
    expect(comment).toContain('**A/B calibration — Q2: B.**');
    expect(comment).toContain('稀缺的从来不是产出物，是判断。');
    expect(comment).toContain('Why: 不喜欢"才是"的强调');

    const voice = gh.files.get('research/voice.md')!;
    expect(voice).toContain('(A/B choice, PR #7) zh 结尾: chose B');
    expect(voice).toContain('existing proposal'); // append, never rewrite
    expect(gh.commits.at(-1)?.message).toBe('desk: voice signal (#7)');
  });

  it('quotes the server-side option text, not whatever the client sends', async () => {
    await call(worker, makeEnv(), 'POST', '/api/desk/comment', {
      number: 7,
      kind: 'ab',
      question: 1,
      choice: 'A',
      text: 'client-injected nonsense',
    });
    const comment = gh.prs[0].comments.at(-1)!;
    expect(comment).toContain('Consulting outcomes are unfalsifiable');
    expect(comment).not.toContain('client-injected');
  });

  it('rejects a choice that does not exist in the PR body', async () => {
    for (const bad of [
      { question: 9, choice: 'A' },
      { question: 1, choice: 'C' }, // Q1 only has A/B
      { question: 1, choice: 'x' },
    ]) {
      const { status } = await call(worker, makeEnv(), 'POST', '/api/desk/comment', {
        number: 7,
        kind: 'ab',
        ...bad,
      });
      expect(status, JSON.stringify(bad)).toBe(400);
    }
    expect(gh.prs[0].comments).toHaveLength(0);
  });

  it('still succeeds when voice.md is missing — the comment is the primary record', async () => {
    gh.files.delete('research/voice.md');
    const { status, data } = await call(worker, makeEnv(), 'POST', '/api/desk/comment', {
      number: 7,
      kind: 'ab',
      question: 1,
      choice: 'B',
    });
    expect(status).toBe(200);
    expect(data.voiceprint).toBe(false);
    expect(gh.prs[0].comments).toHaveLength(1);
  });

  it('survives a concurrent voice.md commit via retry', async () => {
    gh.putConflicts = 1;
    const { data } = await call(worker, makeEnv(), 'POST', '/api/desk/comment', {
      number: 7,
      kind: 'ab',
      question: 1,
      choice: 'B',
    });
    expect(data.voiceprint).toBe(true);
    expect(gh.files.get('research/voice.md')).toContain('(A/B choice, PR #7)');
  });
});

describe('POST /api/desk/comment kind=marks', () => {
  it('posts one 读稿标记 comment and one voice.md record per mark', async () => {
    const { status, data } = await call(worker, makeEnv(), 'POST', '/api/desk/comment', {
      number: 7,
      kind: 'marks',
      marks: ['Second one here.', '中文句子。'],
    });
    expect(status).toBe(200);
    expect(data.voiceprint).toBe(true);

    const comment = gh.prs[0].comments.at(-1)!;
    expect(comment).toContain('**读稿标记 — 我不会这么说：**');
    expect(comment).toContain('- “Second one here.”');
    expect(comment).toContain('- “中文句子。”');

    const voice = gh.files.get('research/voice.md')!;
    expect(voice).toContain('(read-aloud mark, PR #7) 不会这么说：“Second one here.”');
    expect(voice).toContain('(read-aloud mark, PR #7) 不会这么说：“中文句子。”');
  });

  it('rejects empty, oversized, or overlong mark lists', async () => {
    for (const marks of [[], ['  '], Array.from({ length: 31 }, (_, i) => `s${i}`), ['x'.repeat(601)]]) {
      const { status } = await call(worker, makeEnv(), 'POST', '/api/desk/comment', {
        number: 7,
        kind: 'marks',
        marks,
      });
      expect(status).toBe(400);
    }
  });
});

describe('GET /api/desk/draft', () => {
  it('returns the draft paragraphs with frontmatter stripped', async () => {
    const { status, data } = await call(
      worker,
      makeEnv(),
      'GET',
      '/api/desk/draft?number=7&path=' + encodeURIComponent('src/content/posts/something-sharp.md')
    );
    expect(status).toBe(200);
    expect(data.paragraphs).toEqual([
      'First paragraph, two sentences. Second one here.',
      '第二段。中文句子。',
      'Last paragraph.',
    ]);
  });

  it('rejects files outside the PR diff or outside content paths', async () => {
    for (const path of [
      'src/content/posts/other.md',
      'research/backlog.md', // in the diff, but not a slot-writable content file
      'worker/index.ts',
    ]) {
      const { status } = await call(
        worker,
        makeEnv(),
        'GET',
        `/api/desk/draft?number=7&path=${encodeURIComponent(path)}`
      );
      expect(status, path).toBe(400);
    }
  });
});

describe('appendProposed', () => {
  it('creates the Proposed heading when the file lacks one', async () => {
    gh.seedFile('research/voice.md', '# Voiceprint\n\n## Stances\n\n- a stance\n');
    const ok = await appendProposed(makeEnv(), ['- 2026-07-18 (A/B choice) test'], 'msg');
    expect(ok).toBe(true);
    const voice = gh.files.get('research/voice.md')!;
    expect(voice).toContain('## Proposed (gardener)');
    expect(voice.trimEnd().endsWith('- 2026-07-18 (A/B choice) test')).toBe(true);
  });
});
