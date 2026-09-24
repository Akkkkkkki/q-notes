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

describe('word ceiling (docs/pipeline.md §11: length is an output, not a target)', () => {
  it('does not flag a note well under the typical band', () => {
    const body = Array.from({ length: 420 }, (_, i) => `word${i}`).join(' ');
    expect(gate('v.en.md', EN_FM, body)).not.toContain('outside the');
    expect(gate('v.en.md', EN_FM, body)).not.toContain('ceiling');
  });

  it('does not flag an essay under its typical band', () => {
    const fm = EN_FM.replace('["note"]', '["essay"]');
    const body = Array.from({ length: 760 }, (_, i) => `word${i}`).join(' ') + ' https://example.com';
    expect(gate('w.en.md', fm, body)).not.toContain('ceiling');
  });

  it('still flags an essay well over its ceiling', () => {
    const fm = EN_FM.replace('["note"]', '["essay"]');
    const body = Array.from({ length: 1700 }, (_, i) => `word${i}`).join(' ') + ' https://example.com';
    expect(gate('x.en.md', fm, body)).toContain('over the essay ceiling of 1500');
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

describe('fabricated intellectual autobiography (docs/pipeline.md §10)', () => {
  it('flags a change-of-mind construction the ledger has to source', () => {
    const body = "I used to buy that story. What actually forces a gate like this, I've come to think, is accountability.";
    expect(gate('r.en.md', EN_FM, body)).toContain('mental-history claim');
  });

  it('does not flag plain present-tense opinion', () => {
    const body = "I think the gate matters more than the story around it. It's the accountability that forces the behavior.";
    expect(gate('s.en.md', EN_FM, body)).not.toContain('mental-history claim');
  });

  it('flags the zh construction', () => {
    const body = '我以前认为这只是流程问题，后来我才意识到问题出在责任归属上。';
    expect(gate('t.zh.md', ZH_FM, body)).toContain('mental-history claim');
  });

  it('does not flag plain zh opinion', () => {
    const body = '我觉得这主要是责任归属的问题，不是流程本身。';
    expect(gate('u.zh.md', ZH_FM, body)).not.toContain('mental-history claim');
  });
});

describe('nobody home (human-voice §1, §3.5)', () => {
  /** A cited argument of `words` length with `authorMarkers` first-person markers. */
  const research = (words: number, authorMarkers: number) => {
    const filler = Array.from({ length: words - authorMarkers * 4 }, (_, i) => `word${i}`).join(' ');
    const mine = Array.from({ length: authorMarkers }, () => 'I have seen this.').join(' ');
    return `${mine} ${filler}\n\nSee [one](https://example.com/a) and [two](https://example.com/b).`;
  };

  it('flags a research-carried piece with no author on the page', () => {
    expect(gate('na.en.md', EN_FM, research(600, 0))).toContain('nobody home');
  });

  it('passes the same length once the author is actually in it', () => {
    expect(gate('nb.en.md', EN_FM, research(600, 6))).not.toContain('nobody home');
  });

  it('treats bare URLs as citations, like the essay source check does', () => {
    const filler = Array.from({ length: 560 }, (_, i) => `word${i}`).join(' ');
    const body = `${filler}\n\nSources: https://example.com/a and https://example.com/b`;
    expect(gate('nh.en.md', EN_FM, body)).toContain('nobody home');
  });

  it('counts a sentence-initial My as the author', () => {
    const filler = Array.from({ length: 560 }, (_, i) => `word${i}`).join(' ');
    const body =
      `My bet is that this holds. My claim is narrower than it sounds. ` +
      `Me, though, I would not ship it. ${filler}\n\n` +
      'See [one](https://example.com/a) and [two](https://example.com/b).';
    expect(gate('nj.en.md', EN_FM, body)).not.toContain('nobody home');
  });

  it('does not count an HTML anchor label as the author', () => {
    const filler = Array.from({ length: 560 }, (_, i) => `word${i}`).join(' ');
    const body =
      `${filler}\n\n<a href="https://example.com/a">Why I built my tool</a> and ` +
      '<a href="https://example.com/b">What my team learned</a>';
    expect(gate('nl.en.md', EN_FM, body)).toContain('nobody home');
  });

  it('treats an HTML href as a citation', () => {
    const filler = Array.from({ length: 560 }, (_, i) => `word${i}`).join(' ');
    const body = `${filler}\n\n<a href="https://example.com/a">one</a> and <a href="https://example.com/b">two</a>`;
    expect(gate('nk.en.md', EN_FM, body)).toContain('nobody home');
  });

  it('counts one URL linked twice as a single source', () => {
    const filler = Array.from({ length: 300 }, (_, i) => `word${i}`).join(' ');
    const body = `${filler}\n\nSee [the survey](https://example.com/a) and again [the survey](https://example.com/a).`;
    expect(gate('nq.en.md', EN_FM, body)).not.toContain('nobody home');
  });

  it('does not count a code example toward the length that triggers the check', () => {
    const code = Array.from({ length: 900 }, (_, i) => `token${i}`).join(' ');
    const body = `A short field note about one team. Nobody had a rule for it.\n\n\`\`\`js\n${code}\n\`\`\``;
    expect(gate('np.en.md', EN_FM, body)).not.toContain('nobody home');
  });

  it('reads prose inside an MDX block component', () => {
    // Without the MDX extensions the whole component is one html node, proseWords is 0,
    // and the check silently skips — a gate passing what it should question.
    const filler = Array.from({ length: 560 }, (_, i) => `word${i}`).join(' ');
    const body = `<Callout>\n${filler}\nSee [one](https://example.com/a) and [two](https://example.com/b).\n</Callout>`;
    expect(gate('oa.en.mdx', EN_FM, body)).toContain('nobody home');
  });

  it('reads prose wrapped in a raw HTML container', () => {
    // A `.md` block element with no blank line inside is one html node, text and all.
    // Dropping the node dropped the post: zero prose words, and the check skipped.
    const filler = Array.from({ length: 560 }, (_, i) => `word${i}`).join(' ');
    const body = `<div class="lede">\n${filler}\nSources: https://example.com/a and https://example.com/b\n</div>`;
    expect(gate('oc.en.md', EN_FM, body)).toContain('nobody home');
  });

  it('counts the author inside a raw HTML container', () => {
    const filler = Array.from({ length: 536 }, (_, i) => `word${i}`).join(' ');
    const mine = Array.from({ length: 6 }, () => 'I have seen this.').join(' ');
    const body = `<div class="lede">\n${mine} ${filler}\nSources: https://example.com/a and https://example.com/b\n</div>`;
    expect(gate('od.en.md', EN_FM, body)).not.toContain('nobody home');
  });

  it('still keeps an anchor label out of the author count inside that container', () => {
    const filler = Array.from({ length: 560 }, (_, i) => `word${i}`).join(' ');
    const body =
      `<div class="lede">\n${filler}\n` +
      '<a href="https://example.com/a">Why I built my tool</a>\n' +
      '<a href="https://example.com/b">What my team learned</a>\n</div>';
    expect(gate('oe.en.md', EN_FM, body)).toContain('nobody home');
  });

  it('treats an MDX JSX href as a citation', () => {
    // In .mdx an anchor is a JSX element: the target is an attribute, so it is in no
    // node url and no node value. Missing it skipped the check on a cited post.
    const filler = Array.from({ length: 560 }, (_, i) => `word${i}`).join(' ');
    const body = `${filler}\n\n<a href="https://example.com/a">one</a> and <a href="https://example.com/b">two</a>`;
    expect(gate('of.en.mdx', EN_FM, body)).toContain('nobody home');
  });

  it('does not count a component setting as a citation', () => {
    // A URL in a component's configuration addresses a resource, not a source. Reading
    // every JSX attribute made a short note look research-carried.
    const filler = Array.from({ length: 300 }, (_, i) => `word${i}`).join(' ');
    const body = `${filler}\n\n<Demo endpoint="https://example.com/a" backup="https://example.com/b" />`;
    expect(gate('og.en.mdx', EN_FM, body)).not.toContain('nobody home');
  });

  it('does not count a URL in an HTML comment as a citation', () => {
    const filler = Array.from({ length: 300 }, (_, i) => `word${i}`).join(' ');
    const body = `${filler}\n\n<!-- check https://example.com/a and https://example.com/b -->`;
    expect(gate('oh.en.md', EN_FM, body)).not.toContain('nobody home');
  });

  it('does not count an inline HTML quotation as the author', () => {
    // `<q>` is the inline half of `<blockquote>`: somebody else's sentence, and this
    // corpus quotes people who say "I" and "my" constantly.
    const filler = Array.from({ length: 560 }, (_, i) => `word${i}`).join(' ');
    const mine = Array.from({ length: 6 }, () => 'One of them said <q>I built this for my own team.</q>').join(' ');
    const body = `${mine} ${filler}\n\nSee [one](https://example.com/a) and [two](https://example.com/b).`;
    expect(gate('oi.en.md', EN_FM, body)).toContain('nobody home');
  });

  it('does not count a component resource as a citation', () => {
    // JSX's own line: a lowercase name is an intrinsic HTML element, a capitalised one
    // is a component. `<Image src>` configures a resource; `<a href>` cites a source.
    const filler = Array.from({ length: 300 }, (_, i) => `word${i}`).join(' ');
    const body = `${filler}\n\n<Image src="https://example.com/a" />\n\n<Image src="https://example.com/b" />`;
    expect(gate('oj.en.mdx', EN_FM, body)).not.toContain('nobody home');
  });

  it('strips a quotation longer than a sentence or two', () => {
    // A fixed character cap meant a long quotation was not stripped at all, and the
    // speaker's first person landed in the author's column.
    const long = Array.from({ length: 120 }, (_, i) => `said${i}`).join(' ');
    const filler = Array.from({ length: 420 }, (_, i) => `word${i}`).join(' ');
    const quote = `One of them told me: "I ${long} and my team saw it too, I think, and I still do."`;
    const body = `${quote} ${filler}\n\nSee [one](https://example.com/a) and [two](https://example.com/b).`;
    expect(gate('ok.en.md', EN_FM, body)).toContain('nobody home');
  });

  it('does not let an unpaired quote mark eat the author across a paragraph break', () => {
    const filler = Array.from({ length: 540 }, (_, i) => `word${i}`).join(' ');
    const body =
      `They called it a "productivity story.\n\n` +
      `I have watched this happen twice. My own team shipped it. I would not do it again. ` +
      `I said so at the time, and I was right." ${filler}\n\n` +
      'See [one](https://example.com/a) and [two](https://example.com/b).';
    expect(gate('ol.en.md', EN_FM, body)).not.toContain('nobody home');
  });

  it('does not count a URL inside a raw script block as a citation', () => {
    const filler = Array.from({ length: 300 }, (_, i) => `word${i}`).join(' ');
    const body =
      `${filler}\n\n<script>\nfetch("https://example.com/a");\nfetch("https://example.com/b");\n</script>`;
    expect(gate('om.en.md', EN_FM, body)).not.toContain('nobody home');
  });

  it('counts two anchors on one document as one source', () => {
    // Distinct sources, not distinct link targets.
    const filler = Array.from({ length: 300 }, (_, i) => `word${i}`).join(' ');
    const body =
      `${filler}\n\nSee [the method](https://example.com/report#method) and ` +
      '[the results](https://example.com/report#results).';
    expect(gate('on.en.md', EN_FM, body)).not.toContain('nobody home');
  });

  it('still counts two genuinely different documents', () => {
    const filler = Array.from({ length: 300 }, (_, i) => `word${i}`).join(' ');
    const body =
      `${filler}\n\nSee [one](https://example.com/report-a#method) and ` +
      '[two](https://example.com/report-b#method).';
    expect(gate('oo.en.md', EN_FM, body)).toContain('nobody home');
  });

  it('does not count a URL in inline code as a source', () => {
    const body = 'A short field note about one team. Nobody had a rule for it. Try `https://example.com/a` and `https://example.com/b`.';
    expect(gate('ob.en.md', EN_FM, body)).not.toContain('nobody home');
  });

  it('does not count a code block nested in a list as prose', () => {
    const code = Array.from({ length: 900 }, (_, i) => `token${i}`).join(' ');
    const body = `A short field note about one team. Nobody had a rule for it.\n\n- Example:\n\n      fetch("https://example.com/a");\n      fetch("https://example.com/b");\n      ${code}`;
    expect(gate('ny.en.md', EN_FM, body)).not.toContain('nobody home');
  });

  it('does not count a lazy blockquote continuation as the author', () => {
    const filler = Array.from({ length: 560 }, (_, i) => `word${i}`).join(' ');
    const body =
      `${filler}\n\n> The founder said\nI built this because my team needed it\n\n` +
      'See [one](https://example.com/a) and [two](https://example.com/b).';
    expect(gate('nz.en.md', EN_FM, body)).toContain('nobody home');
  });

  it('keeps an indented list continuation, which is prose', () => {
    // The dangerous direction: stripping this deletes the author's own words and
    // manufactures the very warning the check exists to earn.
    const filler = Array.from({ length: 560 }, (_, i) => `word${i}`).join(' ');
    const body =
      `- Context\n\n    My experience with this was different, and I would not ship it. ` +
      `I watched my team hit it twice.\n\n${filler}\n\n` +
      'See [one](https://example.com/a) and [two](https://example.com/b).';
    expect(gate('nw.en.md', EN_FM, body)).not.toContain('nobody home');
  });

  it('strips an indented fence delimiter too', () => {
    const code = Array.from({ length: 900 }, (_, i) => `token${i}`).join(' ');
    const body = `A short field note about one team. Nobody had a rule for it.\n\n   ~~~js\n   fetch("https://example.com/a");\n   fetch("https://example.com/b");\n   ${code}\n   ~~~`;
    expect(gate('nx.en.md', EN_FM, body)).not.toContain('nobody home');
  });

  it('strips a four-space indented code block too', () => {
    const code = Array.from({ length: 900 }, (_, i) => `    token${i}`).join('\n');
    const body = `A short field note about one team. Nobody had a rule for it.\n\n${code}\n    fetch("https://example.com/a");\n    fetch("https://example.com/b");`;
    expect(gate('nu.en.md', EN_FM, body)).not.toContain('nobody home');
  });

  it('does not count an HTML blockquote body as the author', () => {
    const filler = Array.from({ length: 560 }, (_, i) => `word${i}`).join(' ');
    const body =
      `${filler}\n\n<blockquote>I built this because my team needed it</blockquote>\n\n` +
      '<blockquote>My team learned it the hard way</blockquote>\n\n' +
      'See [one](https://example.com/a) and [two](https://example.com/b).';
    expect(gate('nv.en.md', EN_FM, body)).toContain('nobody home');
  });

  it('strips a tilde-fenced code example too', () => {
    const code = Array.from({ length: 900 }, (_, i) => `token${i}`).join(' ');
    const body = `A short field note about one team. Nobody had a rule for it.\n\n~~~js\nfetch("https://example.com/a");\nfetch("https://example.com/b");\n${code}\n~~~`;
    expect(gate('ns.en.md', EN_FM, body)).not.toContain('nobody home');
  });

  it('matches a shortcut reference label case-insensitively', () => {
    const filler = Array.from({ length: 580 }, (_, i) => `word${i}`).join(' ');
    const body =
      `${filler}\n\nSee [Why I built this for my team] and [What my team learned].\n\n` +
      '[WHY I BUILT THIS FOR MY TEAM]: https://example.com/a\n[what my team learned]: https://example.com/b';
    expect(gate('nt.en.md', EN_FM, body)).toContain('nobody home');
  });

  it('does not treat a URL in a code sample as a citation', () => {
    const filler = Array.from({ length: 300 }, (_, i) => `word${i}`).join(' ');
    const body = `${filler}\n\n\`\`\`js\nfetch("https://example.com/a");\nfetch("https://example.com/b");\n\`\`\``;
    expect(gate('no.en.md', EN_FM, body)).not.toContain('nobody home');
  });

  it('leaves a short uncited field note alone', () => {
    const body = 'A colleague turned in some work and said upfront that AI wrote it. Nobody had a rule for it.';
    expect(gate('nc.en.md', EN_FM, body)).not.toContain('nobody home');
  });

  it('still flags a long piece that cites nothing and contains no author', () => {
    const body = Array.from({ length: 900 }, (_, i) => `word${i}`).join(' ');
    expect(gate('nd.en.md', EN_FM, body)).toContain('nobody home');
  });

  it('never tells the drafter to add first person', () => {
    expect(gate('ne.en.md', EN_FM, research(600, 0))).toContain('Do NOT fix this by adding');
  });

  it('does not count a shortcut reference label as the author', () => {
    const filler = Array.from({ length: 580 }, (_, i) => `word${i}`).join(' ');
    const body =
      `${filler}\n\nSee [Why I built this for my team] and [What my team learned].\n\n` +
      '[Why I built this for my team]: https://example.com/a\n[What my team learned]: https://example.com/b';
    expect(gate('nr.en.md', EN_FM, body)).toContain('nobody home');
  });

  it('does not count a reference-style link label as the author', () => {
    const filler = Array.from({ length: 580 }, (_, i) => `word${i}`).join(' ');
    const body =
      `${filler}\n\nSee [Why I built this for my team][one] and [the survey][two].\n\n` +
      '[one]: https://example.com/a\n[two]: https://example.com/b';
    expect(gate('ni.en.md', EN_FM, body)).toContain('nobody home');
  });

  it('does not count a link label or slug as the author', () => {
    const filler = Array.from({ length: 580 }, (_, i) => `word${i}`).join(' ');
    const body =
      `${filler}\n\nSee [Why I built this for my team](https://example.com/a) ` +
      'and [the survey](https://example.com/it-gives-me-a-headache-just-thinking-about-it).';
    expect(gate('ng.en.md', EN_FM, body)).toContain('nobody home');
  });

  it('does not count curly single-quoted speech as the author', () => {
    const filler = Array.from({ length: 560 }, (_, i) => `word${i}`).join(' ');
    const body =
      `${filler}\n\nThe founder said \u2018I built this because my team needed it.\u2019\n\n` +
      'See [one](https://example.com/a) and [two](https://example.com/b).';
    expect(gate('nm.en.md', EN_FM, body)).toContain('nobody home');
  });

  it('does not treat a contraction apostrophe as a quote delimiter', () => {
    const filler = Array.from({ length: 560 }, (_, i) => `word${i}`).join(' ');
    // Curly apostrophes in contractions must not swallow the author's own markers.
    const body =
      `I don\u2019t think that\u2019s right, and my read is that it isn\u2019t close. ` +
      `I wouldn\u2019t ship it. ${filler}\n\n` +
      'See [one](https://example.com/a) and [two](https://example.com/b).';
    expect(gate('nn.en.md', EN_FM, body)).not.toContain('nobody home');
  });

  it('does not count a quoted source\'s first person as the author', () => {
    const filler = Array.from({ length: 560 }, (_, i) => `word${i}`).join(' ');
    const body =
      `${filler}\n\n> "I built this because my team needed it," the vendor said.\n\n` +
      'The founder added that "I would not ship my own code that way."\n\n' +
      'See [one](https://example.com/a) and [two](https://example.com/b).';
    expect(gate('nf.en.md', EN_FM, body)).toContain('nobody home');
  });
});

describe('punchline metronome (human-voice §1, §3.2)', () => {
  const paras = (n: number, solo: number) =>
    Array.from({ length: n }, (_, i) =>
      i < solo ? `Some speed is fake number ${i}.` : `The team shipped the change on ${i}. Review took a week. Nobody owned the result.`
    ).join('\n\n');

  it('flags an aphorism dropped every third paragraph', () => {
    expect(gate('ma.en.md', EN_FM, paras(20, 8))).toContain('punchline metronome');
  });

  it('leaves a piece with a couple of short paragraphs alone', () => {
    expect(gate('mb.en.md', EN_FM, paras(20, 2))).not.toContain('punchline metronome');
  });

  it('counts a sentence that ends inside a quotation', () => {
    // Each paragraph is two sentences, both ending in a closing quote. Counting the
    // terminator alone would read every one as a single-sentence punchline.
    const body = Array.from({ length: 20 }, (_, i) =>
      `The founder said "It worked in ${i}." The customer said "It failed."`
    ).join('\n\n');
    expect(gate('md.en.md', EN_FM, body)).not.toContain('punchline metronome');
  });

  it('does not judge the share on a handful of paragraphs', () => {
    expect(gate('mc.en.md', EN_FM, paras(8, 5))).not.toContain('punchline metronome');
  });
});

describe('template closers across the corpus (human-voice §3.4)', () => {
  it('flags a closer the published corpus already uses', () => {
    const body = 'Agents make the bottleneck visible.\n\nBy the end of 2027, serious teams will treat ownership as part of the process.';
    expect(gate('ca.en.md', EN_FM, body)).toContain('template closer');
  });

  it('leaves a dated sentence with no forecast verb alone', () => {
    const body = 'Agents make the bottleneck visible.\n\nIf by 2028 I still cannot find that link, the other piece was closer to right.';
    expect(gate('cb.en.md', EN_FM, body)).not.toContain('template closer');
  });

  it('does not let a conditional exempt the frame', () => {
    // The frame is the closing move, hedged or not. Each shape below was once exempted
    // or special-cased by a conditional carve-out that never fired on a real post.
    const closers = [
      'By 2027, if adoption continues, teams will treat ownership as part of the process.',
      'By 2027, teams will treat ownership as part of the process if adoption continues.',
      'If by 2028 the metric still will not appear, the other piece was closer to right.',
      'By 2027, teams will know if agents need owners.',
      'By the end of 2027, teams will stop debating whether agents need owners.',
      'Whether this launch succeeds is beside the point; by 2027, teams will treat ownership as part of the process.',
      'If this launch fails, we will revisit it, but by 2027 serious teams will treat ownership as part of the process.',
    ];
    closers.forEach((closer, i) => {
      const body = `Agents make the bottleneck visible.\n\n${closer}`;
      expect(gate(`cx${i}.en.md`, EN_FM, body), closer).toContain('template closer');
    });
  });

  it('honours a lifecycle value with an inline YAML comment', () => {
    const fm = `${EN_FM}\neditorialStatus: archived # withdrawn, kept for the URL`;
    const body = 'Agents make the bottleneck visible.\n\nBy the end of 2027, serious teams will treat ownership as part of the process.';
    expect(gate('cp.en.md', fm, body)).not.toContain('template closer');
  });

  it('does not let trailing reference definitions displace the closer', () => {
    const body =
      'Agents make the bottleneck visible.\n\nBy the end of 2027, serious teams will treat ownership as part of the process.\n\n' +
      '[a]: https://example.com/a\n\n[b]: https://example.com/b\n\n[c]: https://example.com/c';
    expect(gate('cs.en.md', EN_FM, body)).toContain('template closer');
  });

  it('does not let trailing HTML comments displace the closer', () => {
    const body =
      'Agents make the bottleneck visible.\n\nBy the end of 2027, serious teams will treat ownership as part of the process.\n\n' +
      '<!-- todo: revisit after the next launch -->\n\n<!-- note: check the numbers -->\n\n<!-- and one more -->';
    expect(gate('ct.en.md', EN_FM, body)).toContain('template closer');
  });

  it('keeps an emphasised paragraph in the comparison corpus', () => {
    const body = 'Agents make the bottleneck visible.\n\n---\n\n**Prediction tracker**\n\n*Claim:* By the end of 2027, serious teams will treat ownership as part of the process.';
    expect(gate('cq.en.md', EN_FM, body)).toContain('template closer');
  });

  it('keeps a year-led paragraph in the comparison corpus', () => {
    // The closer is the last paragraph either way; this asserts the year-led one
    // before it is treated as prose rather than dropped as a list item.
    const body = 'Agents make the bottleneck visible.\n\n2026 exposed the bottleneck.\n\nBy the end of 2027, serious teams will treat ownership as part of the process.';
    expect(gate('cl.en.md', EN_FM, body)).toContain('template closer');
  });

  it('honours a quoted lifecycle value', () => {
    const fm = `${EN_FM}\neditorialStatus: "archived"\narchiveReason: "withdrawn"`;
    const body = 'Agents make the bottleneck visible.\n\nBy the end of 2027, serious teams will treat ownership as part of the process.';
    expect(gate('ci.en.md', fm, body)).not.toContain('template closer');
  });

  it('does not ask a withdrawn post to rewrite its closer', () => {
    const fm = `${EN_FM}\neditorialStatus: archived\narchiveReason: "superseded by the interview"`;
    const body = 'Agents make the bottleneck visible.\n\nBy the end of 2027, serious teams will treat ownership as part of the process.';
    expect(gate('cg.en.md', fm, body)).not.toContain('template closer');
  });

  it('counts only active posts, and says so', () => {
    // Every corpus post sharing this frame is active today, so the count alone cannot
    // prove the filter runs. The wording can: it is produced on the same code path as
    // the editorialStatus check, so a regression that drops the filter drops this too.
    const body = 'Agents make the bottleneck visible.\n\nBy the end of 2027, serious teams will treat ownership as part of the process.';
    expect(gate('cd.en.md', EN_FM, body)).toContain('other active posts also end on');
  });

  it('ignores the frame when it is not in the closer', () => {
    const body =
      'By the end of 2027, serious teams will treat ownership as part of the process.\n\n' +
      Array.from({ length: 5 }, (_, i) => `A paragraph about the mechanism, number ${i}. It runs two sentences.`).join('\n\n');
    expect(gate('cc.en.md', EN_FM, body)).not.toContain('template closer');
  });
});
