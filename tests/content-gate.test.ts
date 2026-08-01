import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

/**
 * Style checks in scripts/content-gate.mjs — the mechanical half of the human-voice
 * playbook (research/human-voice.md §3–§4). Every assertion here is a warning, never
 * an error: these checks make a reviewer look, they never block a merge.
 *
 * Each fixture is run through the real script so the thresholds under test are the
 * ones CI applies.
 */

let dir: string;
beforeAll(() => {
  dir = mkdtempSync(join(tmpdir(), 'gate-'));
});
afterAll(() => rmSync(dir, { recursive: true, force: true }));

/** Write a fixture post and return the gate's report for it. */
function gate(name: string, frontmatter: string, body: string): string {
  const path = join(dir, name);
  writeFileSync(path, `---\n${frontmatter}\n---\n${body}`);
  const run = spawnSync('node', ['scripts/content-gate.mjs', path], { encoding: 'utf8' });
  return run.stdout;
}

const EN_FM = [
  'title: "T"',
  'date: 2026-07-01',
  'excerpt: "e"',
  'tags: ["note"]',
  'lang: en',
  'translationKey: fixture-en',
  'maturity: seedling',
].join('\n');

const ZH_FM = EN_FM.replace('lang: en', 'lang: zh').replace('fixture-en', 'fixture-zh');

describe('contractions (human-voice §3.7)', () => {
  const expanded = `
It is clear the team does not agree. That is not the problem. It is the symptom.
They are still waiting, and we are not going to help. It is not obvious that is right.
There is no owner. You are guessing. I am not sure that is fair. It is late.
`;

  it('flags prose left uncontracted throughout', () => {
    expect(gate('a.en.md', EN_FM, expanded)).toContain('uncontracted English');
  });

  it('passes the same prose once it is contracted', () => {
    const contracted = `
It's clear the team doesn't agree. That's not the problem. It's the symptom.
They're still waiting, and we aren't going to help. It isn't obvious that's right.
There's no owner. You're guessing. I'm not sure that's fair. It's late.
`;
    expect(gate('b.en.md', EN_FM, contracted)).not.toContain('uncontracted English');
  });

  it('ignores a piece with too few expandable spots to judge', () => {
    expect(gate('c.en.md', EN_FM, 'It is late. That is all.')).not.toContain('uncontracted English');
  });
});

describe('corrective pivots (human-voice §3.2)', () => {
  it('allows one', () => {
    const body = "This isn't a speed problem. It's a review problem. The queue grew.";
    expect(gate('d.en.md', EN_FM, body)).not.toContain('corrective pivots');
  });

  it('sees pivots written in contracted form', () => {
    // The rest of §3 pushes drafts toward contractions, so a check that only
    // matched "It is not X. It is Y." would go blind on compliant posts.
    const body = `
This isn't a speed problem. It's a review problem.
That wasn't a clean win. It's a migration.
`;
    expect(gate('e2.en.md', EN_FM, body)).toContain('corrective pivots');
  });

  it('flags the stacked signature move', () => {
    const body = `
That is not a win. It is a migration. The cost moved.
This is not glamorous. It is where the leverage sits.
The fix isn't just tooling, but ownership.
`;
    expect(gate('e.en.md', EN_FM, body)).toContain('corrective pivots');
  });
});

describe('rhetorical questions (human-voice §3.2)', () => {
  it('flags a run of three', () => {
    const body =
      'How often did a task wait for a refactor? How often did two designs go to a human? How many PRs were stopped early? Nobody measured it.';
    expect(gate('f.en.md', EN_FM, body)).toContain('three questions in a row');
  });

  it('allows a single question that gets answered', () => {
    const body = 'So how often did a task wait? Roughly a third of the time, by their own logs.';
    expect(gate('g.en.md', EN_FM, body)).not.toContain('questions');
  });

  it('allows a contrastive pair — a real device, not a volley', () => {
    const body =
      "Review usually asks: is this PR correct? The earlier question is: should this work have started? That one matters more.";
    expect(gate('g2.en.md', EN_FM, body)).not.toContain('questions in a row');
  });
});

describe('never-list lexicon and STE word rules', () => {
  it('flags marketing and LLM-lexicon words', () => {
    const out = gate('h.en.md', EN_FM, "The robust pipeline offers a seamless workflow.");
    expect(out).toContain('never-list word "robust"');
    expect(out).toContain('never-list word "seamless"');
  });

  it('flags a nominalisation', () => {
    expect(gate('i.en.md', EN_FM, 'The team will perform an analysis of the logs.')).toContain(
      'nominalisation "perform an analysis"'
    );
  });

  it('does not flag an ordinary verb followed by an abstract noun', () => {
    // "makes judgment cheap" is not "makes a judgment" — the article is what
    // separates the nominalisation from normal prose.
    expect(gate('j.en.md', EN_FM, 'Cheap action makes judgment scarce.')).not.toContain('nominalisation');
  });

  it('flags "leverage" as a verb but not as a noun', () => {
    expect(gate('h2.en.md', EN_FM, 'The firm is leveraging armies of MBAs.')).toContain(
      '"leveraging"'
    );
    // "leverage ratios" and "a source of leverage" are ordinary consulting nouns.
    expect(gate('h3.en.md', EN_FM, 'Utilization targets and leverage ratios drove it.')).not.toContain(
      'never-list'
    );
  });

  it('flags a stiff sentence-initial connective', () => {
    expect(gate('k.en.md', EN_FM, 'The tools shipped. However, nobody used them.')).toContain(
      'sentence-initial "However"'
    );
  });
});

describe('one name for one thing', () => {
  const fm = `${EN_FM}\ndefinedTerm:\n  term: "coordination debt"\n  pos: "n."\n  definition: "d"`;

  it('flags a coined term that is defined and then dropped', () => {
    expect(gate('l.en.md', fm, 'Teams accumulate coordination debt. Then other things happen.')).toContain(
      'coined term "coordination debt" appears 1×'
    );
  });

  it('accepts a coined term that is reused on purpose', () => {
    const body = 'Teams accumulate coordination debt. That coordination debt compounds every sprint.';
    expect(gate('m.en.md', fm, body)).not.toContain('coined term');
  });
});

describe('rhythm', () => {
  it('flags prose whose sentences are all the same length', () => {
    // Twenty-six sentences of eight words each: exactly what STE asks for, and
    // exactly the uniformity that reads as machine-written here.
    const body = Array.from(
      { length: 26 },
      (_, i) => `The team shipped the change on day ${i} now.`
    ).join(' ');
    expect(gate('n.en.md', EN_FM, body)).toContain('even sentence rhythm');
  });

  it('counts questions that are wrapped in emphasis', () => {
    // "*Who owns this?*" ends in "*", so without stripping the markers the
    // splitter never sees the question mark.
    const body =
      'The old question was *can the model do this?* Then *who owns the output?* And *who reviews it?* Nobody said.';
    expect(gate('n2.en.md', EN_FM, body)).toContain('three questions in a row');
  });

  it('does not flag a heading as a run-on sentence', () => {
    const body = '## Codifying tacit knowledge is harder than it looks\n\nIt broke.';
    expect(gate('o.en.md', EN_FM, body)).not.toContain('long sentence');
  });
});

describe('pre-contract exemption', () => {
  const tierless = (key: string, date: string) =>
    [
      'title: "T"',
      `date: ${date}`,
      'excerpt: "e"',
      'tags: ["ai"]', // deliberately no tier
      'lang: en',
      `translationKey: ${key}`,
      'maturity: seedling',
    ].join('\n');

  it('exempts a genuine legacy post from the tier check', () => {
    const out = gate('consulting-barbell.en.md', tierless('consulting-barbell', '2026-04-18'), 'Body.');
    expect(out).not.toContain('tags must include a tier');
    expect(out).toContain('pre-contract post');
  });

  it('does not let a new post claim the exemption via translationKey', () => {
    // translationKey is author-controlled frontmatter. Claiming a legacy key from a
    // different file must not buy a tier-check bypass.
    const out = gate('brand-new-post.en.md', tierless('consulting-barbell', '2026-08-01'), 'Body.');
    expect(out).toContain('tags must include a tier');
  });

  it('does not exempt a legacy filename republished with a new date', () => {
    const out = gate('consulting-barbell.en.md', tierless('consulting-barbell', '2026-08-01'), 'Body.');
    expect(out).toContain('tags must include a tier');
  });
});

describe('中文 万能动词', () => {
  it('flags stacked empty verbs', () => {
    const body = '团队进行研究之后，又作出决定，再进行分析，最后加以改进。';
    expect(gate('p.zh.md', ZH_FM, body)).toContain('万能动词');
  });

  it('does not flag 做出来 (a directional complement)', () => {
    expect(gate('q.zh.md', ZH_FM, '他做出来的东西很好。')).not.toContain('万能动词');
  });
});
