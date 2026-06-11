import { describe, it, expect, beforeEach, vi } from 'vitest';
import worker from '../worker/index';
import {
  parsePrBody,
  extractPreviewUrl,
  replaceTitle,
  lastParagraph,
  replaceLastParagraph,
} from '../worker/desk';
import { MockGitHub, makeEnv, call, REPO } from './mock-github';

/** Phase 3 — Desk: PR cards, ship, comments, kill, and the apply-slots writer. */

const PR_BODY = `Tier: essay. Thesis: agents are the new CLIs.

Came from rung 1 of the ladder (interview answers).

## Voice

### Verbatim spine (your words, kept)

- "perfectionism wearing a hoodie"
- "the funnel leaks at the top"
- "a remote control, not a CMS"

### Opinions I could not trace to author input

- "open-source agents will win the enterprise"

## Title options

- Agents are the new CLIs
- The command line grows a mouth
- Scripting your second brain
`;

const POST = `---
title: Agents are the new CLIs
date: 2026-06-11
excerpt: Power users script them.
tags: ["English", "AI", "essay"]
---

Agents are becoming the new command line.

The funnel leaks at the top, and everyone pretends otherwise.

So script your tools before they script you.
`;

const BRANCH = 'draft/agents-as-clis';

let gh: MockGitHub;

beforeEach(() => {
  gh = new MockGitHub();
  gh.seedPr({
    number: 42,
    title: 'Draft: Agents are the new CLIs',
    body: PR_BODY,
    head: { ref: BRANCH, repo: { full_name: REPO } },
    files: ['src/content/posts/agents-as-clis.md', 'drafts/zh/agents-as-clis.md', 'research/backlog.md'],
    comments: [
      'Cloudflare preview: https://pr-42.q-notes.workers.dev',
      '**Ready to ship**\n- Thesis: agents are the new CLIs\n- Second look: the enterprise claim\n- Maturity: growing',
    ],
  });
  gh.seedPr({
    number: 43,
    title: 'refactor: worker auth',
    body: 'code change',
    head: { ref: 'code-branch', repo: { full_name: REPO } },
    files: ['worker/index.ts'],
    comments: [],
  });
  gh.seedFile('src/content/posts/agents-as-clis.md', POST, BRANCH);
  vi.stubGlobal('fetch', gh.fetch);
});

describe('PR body parsing', () => {
  it('extracts tier, verbatim spine, voice flags, and title options', () => {
    const parsed = parsePrBody(PR_BODY);
    expect(parsed.tier).toBe('essay');
    expect(parsed.spine).toEqual([
      'perfectionism wearing a hoodie',
      'the funnel leaks at the top',
      'a remote control, not a CMS',
    ]);
    expect(parsed.flags).toEqual(['open-source agents will win the enterprise']);
    expect(parsed.titleOptions).toHaveLength(3);
  });

  it('treats an explicit "None" under untraceable opinions as an empty list', () => {
    const parsed = parsePrBody('## Voice\n\n### Opinions I could not trace to author input\n\n- None.\n');
    expect(parsed.flags).toEqual([]);
  });

  it('finds the branch preview URL buried in bot comments', () => {
    expect(extractPreviewUrl(['nothing', 'see https://pr-42.q-notes.workers.dev/posts/x ok'])).toBe(
      'https://pr-42.q-notes.workers.dev/posts/x'
    );
    expect(extractPreviewUrl(['no urls here'])).toBeNull();
  });
});

describe('GET /api/desk', () => {
  it('lists only content PRs, with verdict, preview, voice panel, and slots data', async () => {
    const { status, data } = await call(worker, makeEnv(), 'GET', '/api/desk');
    expect(status).toBe(200);
    expect(data.prs).toHaveLength(1); // the code PR (#43) never reaches the Desk
    const card = data.prs[0];
    expect(card.number).toBe(42);
    expect(card.tier).toBe('essay');
    expect(card.verdict).toContain('Ready to ship');
    expect(card.previewUrl).toBe('https://pr-42.q-notes.workers.dev');
    expect(card.voice.spine).toHaveLength(3);
    expect(card.voice.flags).toEqual(['open-source agents will win the enterprise']);
    expect(card.titleOptions).toContain('The command line grows a mouth');
    expect(card.lastLines).toEqual([
      {
        path: 'src/content/posts/agents-as-clis.md',
        text: 'So script your tools before they script you.',
      },
    ]);
  });

  it('still finds a content PR buried behind many newer code PRs', async () => {
    const codePrs = Array.from({ length: 12 }, (_, i) => ({
      number: 100 + i,
      state: 'open' as const,
      title: `code PR ${i}`,
      body: null,
      created_at: new Date().toISOString(),
      head: { ref: `code-${i}`, repo: { full_name: REPO } },
      files: ['worker/index.ts'],
      comments: [],
    }));
    gh.prs.unshift(...codePrs);
    const { data } = await call(worker, makeEnv(), 'GET', '/api/desk');
    expect(data.prs.map((p: any) => p.number)).toEqual([42]);
  });

  it('fails closed on a PR whose file list fills the first page', async () => {
    gh.seedPr({
      number: 50,
      files: Array.from({ length: 120 }, (_, i) => `src/content/posts/post-${i}.md`),
    });
    const { data } = await call(worker, makeEnv(), 'GET', '/api/desk');
    expect(data.prs.map((p: any) => p.number)).toEqual([42]);
    expect((await call(worker, makeEnv(), 'POST', '/api/desk/ship', { number: 50 })).status).toBe(400);
  });
});

describe('POST /api/desk/ship', () => {
  it('merges an open content PR', async () => {
    const { status, data } = await call(worker, makeEnv(), 'POST', '/api/desk/ship', { number: 42 });
    expect(status).toBe(200);
    expect(data.merged).toBe(true);
    expect(gh.prs[0].merged).toBe(true);
  });

  it('refuses to merge a PR that touches code — the phone cannot ship code', async () => {
    const { status } = await call(worker, makeEnv(), 'POST', '/api/desk/ship', { number: 43 });
    expect(status).toBe(400);
    expect(gh.prs[1].merged).toBeFalsy();
  });

  it('refuses unknown or closed PRs', async () => {
    expect((await call(worker, makeEnv(), 'POST', '/api/desk/ship', { number: 999 })).status).toBe(400);
    gh.prs[0].state = 'closed';
    expect((await call(worker, makeEnv(), 'POST', '/api/desk/ship', { number: 42 })).status).toBe(400);
  });
});

describe('POST /api/desk/comment', () => {
  it('posts a One-change comment the next automation run acts on', async () => {
    const { status } = await call(worker, makeEnv(), 'POST', '/api/desk/comment', {
      number: 42,
      kind: 'one-change',
      text: 'soften the enterprise claim in the last section',
    });
    expect(status).toBe(200);
    expect(gh.prs[0].comments.at(-1)).toContain('**One change:** soften the enterprise claim');
  });

  it('resolves a voice flag with keep or cut', async () => {
    await call(worker, makeEnv(), 'POST', '/api/desk/comment', {
      number: 42,
      kind: 'voice',
      decision: 'cut',
      text: 'open-source agents will win the enterprise',
    });
    expect(gh.prs[0].comments.at(-1)).toMatch(/Voice flag — cut.*open-source agents/);

    const bad = await call(worker, makeEnv(), 'POST', '/api/desk/comment', {
      number: 42,
      kind: 'voice',
      decision: 'maybe',
      text: 'x',
    });
    expect(bad.status).toBe(400);
  });

  it('posts the downgrade-to-note remedy', async () => {
    await call(worker, makeEnv(), 'POST', '/api/desk/comment', { number: 42, kind: 'downgrade' });
    expect(gh.prs[0].comments.at(-1)).toContain('**Downgrade to note**');
  });

  it('rejects unknown kinds and missing text', async () => {
    expect((await call(worker, makeEnv(), 'POST', '/api/desk/comment', { number: 42, kind: 'rant', text: 'x' })).status).toBe(400);
    expect((await call(worker, makeEnv(), 'POST', '/api/desk/comment', { number: 42, kind: 'one-change' })).status).toBe(400);
  });
});

describe('POST /api/desk/kill', () => {
  it('comments and closes — killed is a valid outcome', async () => {
    const { status } = await call(worker, makeEnv(), 'POST', '/api/desk/kill', {
      number: 42,
      reason: 'thesis no longer holds',
    });
    expect(status).toBe(200);
    expect(gh.prs[0].state).toBe('closed');
    expect(gh.prs[0].comments.at(-1)).toMatch(/Killed \d{4}-\d{2}-\d{2} via Desk: thesis no longer holds/);
  });
});

describe('POST /api/desk/slots — the only src/content writer', () => {
  it('applies the title and last-line slots on the PR branch only', async () => {
    const { status, data } = await call(worker, makeEnv(), 'POST', '/api/desk/slots', {
      number: 42,
      path: 'src/content/posts/agents-as-clis.md',
      title: 'The command line grows a mouth',
      lastLine: 'Script your tools — or be the one getting scripted.',
    });
    expect(status).toBe(200);
    expect(data.changed).toBe(true);

    const content = gh.branchFiles.get(`${BRANCH}:src/content/posts/agents-as-clis.md`)!;
    expect(content).toContain('title: "The command line grows a mouth"');
    expect(content).not.toContain('title: Agents are the new CLIs');
    expect(content.trimEnd().endsWith('Script your tools — or be the one getting scripted.')).toBe(true);
    expect(content).toContain('The funnel leaks at the top'); // body above the last paragraph untouched
    expect(content).not.toContain('So script your tools before they script you.');

    expect(gh.files.has('src/content/posts/agents-as-clis.md')).toBe(false); // never main
    expect(gh.commits.at(-1)).toMatchObject({ branch: BRANCH, message: 'desk: ship-time slots (#42)' });
  });

  it('edits only the frontmatter title line, never a body line', () => {
    const next = replaceTitle(POST, 'New title')!;
    expect(next).toContain('title: "New title"');
    expect(next).toContain('Agents are becoming the new command line.');
    expect(replaceTitle('no frontmatter here', 'x')).toBeNull();
  });

  it('replaces exactly the final paragraph', () => {
    expect(lastParagraph(POST)).toBe('So script your tools before they script you.');
    const next = replaceLastParagraph(POST, 'A new ending.');
    expect(next.trimEnd().endsWith('A new ending.')).toBe(true);
    expect(next).toContain('The funnel leaks at the top');
  });

  it('rejects files outside the PR diff or outside content paths', async () => {
    for (const path of [
      'src/content/posts/other-post.md', // not in this PR's diff
      'research/backlog.md', // in the diff, but not slot-writable
      'worker/index.ts',
    ]) {
      const { status } = await call(worker, makeEnv(), 'POST', '/api/desk/slots', {
        number: 42,
        path,
        title: 'x',
      });
      expect(status, path).toBe(400);
    }
  });

  it('rejects a lastLine that tries to be more than one paragraph', async () => {
    for (const lastLine of [
      '## A heading\nsneaking in structure',
      'first paragraph\n\nsecond paragraph',
      'first\n   \nsecond, blank line disguised with spaces',
    ]) {
      const { status } = await call(worker, makeEnv(), 'POST', '/api/desk/slots', {
        number: 42,
        path: 'src/content/posts/agents-as-clis.md',
        lastLine,
      });
      expect(status, JSON.stringify(lastLine)).toBe(400);
    }
  });

  it('refuses to write to a fork branch', async () => {
    gh.prs[0].head = { ref: BRANCH, repo: { full_name: 'someone/else' } };
    const { status } = await call(worker, makeEnv(), 'POST', '/api/desk/slots', {
      number: 42,
      path: 'src/content/posts/agents-as-clis.md',
      title: 'x',
    });
    expect(status).toBe(400);
  });
});
