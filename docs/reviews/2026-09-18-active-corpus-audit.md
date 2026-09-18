# Review — the 14 active English posts, and why nine of them read as machine-written

Reviewed 2026-09-18 against `research/human-voice.md`, `research/voice.md`,
`docs/material-form.md`, `docs/pipeline.md` §10, and `scripts/content-gate.mjs`.
Scope: every post with `editorialStatus: active`, which is all 28 files / 14
translation keys currently on `main`.

The short version: the corpus splits cleanly in two, the split is not stylistic, and
the lint was calibrated on the wrong half.

## 1. The finding

Nine of the fourteen active English posts read as machine-written. Five don't. The
line between them is not when the voice pass ran, not length, not tier, and not
topic. It is whether the author had said anything about the subject before the
draft existed.

| Post | Date | Author markers /1k | Single-sentence paragraphs | What the piece was drafted from |
|---|---|---|---|---|
| consulting-barbell | 04-18 | 0.5 | 11% | research only (pre-backlog) |
| consulting-outcomes | 04-25 | 0.8 | 18% | research only (pre-backlog) |
| consulting-coordination | 05-02 | **0.0** | 10% | research only (pre-backlog) |
| helpful-agents-authorization-bug | 06-23 | 0.9 | 17% | scout find, no author hook |
| agent-coordination-debt | 06-26 | 2.3 | 24% | 2026-06-19 inbox spark |
| pull-requests-are-knowledge-imports | 07-03 | 1.6 | **29%** | 2026-06-19 spark, "extends" |
| codebase-maps-are-agent-interfaces | 07-07 | 1.2 | 22% | published post (rung 4) |
| agent-prs-need-traffic-control | 07-10 | 2.0 | 13% | 2026-06-19 spark, "extends" |
| wallet-is-not-a-conscience | 08-18 | **0.0** | 0% | published post (rung 4) |
| taste-is-judgment | 07-20 | 21.3 | 0% | 2026-07-17 inbox spark |
| taste-is-a-bet | 07-31 | 12.9 | 10% | answered interview |
| ai-native-game-is-a-test | 08-05 | 5.9 | 25%¹ | 2026-07-22 inbox spark |
| decisiveness-is-not-a-skill | 08-11 | 18.6 | 0% | 2026-08-11 inbox spark |
| verification-gate-needs-a-name | 08-20 | 20.5 | 0% | answered interview |

¹ 2 of 8 paragraphs; too few paragraphs for the share to mean anything.

The author-marker column runs 0.0–2.3 in the top group and 5.9–21.3 in the bottom
one. Nothing lands in between. That is not a gradient with a judgment call in the
middle; it is two populations. The gap is a factor of 2.5 at its narrowest, with the
warning threshold sitting inside it at 3.0 — comfortable, but worth knowing that the
nearest post on the machine-written side is 2.3 and not 1.6, as an earlier draft of
this file said before the marker pattern was corrected to count sentence-initial
"My".

### It is not "had a spark" versus "didn't"

The obvious explanation is that the top group had no author input to draft from. That
explanation is wrong, and checking it is what makes the real one visible.

Three of the nine — `agent-coordination-debt`, `pull-requests-are-knowledge-imports`,
`agent-prs-need-traffic-control` — trace to an author hook in `research/backlog.md`.
All three trace to the **same** hook: the 2026-06-19 inbox spark, a long, specific,
firsthand account of visiting software companies where developers shipped high-value
proofs of concept into an org shape that hadn't moved. It is the best raw material in
the inbox.

What each piece did with it is the whole finding:

- `agent-coordination-debt` quotes it near-verbatim, in one paragraph, out of 37. That
  paragraph ("I keep coming back to a blunter version of this…") is the only place in
  the essay where anyone is present. The other five sections are OpenAI, DeepMind, and
  arXiv synthesis.
- `pull-requests-are-knowledge-imports` and `agent-prs-need-traffic-control` don't
  quote it at all. Their backlog hooks say they "extend" it — which here means the
  spark picked the topic and contributed no sentence, no example, and no observation to
  either piece.

The backlog itself already caught this. The 2026-08-28 candidate carries a
self-novelty caveat in its own Author hook: that spark "has already been used once,
quoted near-verbatim in the published `agent-coordination-debt` essay, so this
candidate has to earn a second use." One spark, stretched over three essays and a
fourth candidate.

So the line isn't whether author material existed. It's whether the piece was **built
on it or decorated with it.** Every post in the bottom group is built on its material:
take the interview answers out of `taste-is-a-bet` or `verification-gate-needs-a-name`
and there is no piece left. Every post in the top group survives its source material
being removed, because the argument was assembled from research and the author's
contribution — where there was one — is a garnish. That is the same
irreplaceable-material test `docs/material-form.md` §2 already specifies, applied
after the fact to nine posts that predate it.

Two supporting facts, both still true: `research/interviews/` begins on 2026-07-20, so
every post in the top group was drafted with no interview available; and
`research/voice.md` is still empty scaffolding, with every entry under `## Stances` and
`## Signature moves` commented out and `research/positions.md` carrying no live
entries.

**This is a sourcing problem wearing a style problem's clothes.** The prose is not
bad. `consulting-outcomes` is genuinely well-reported. What's missing from it is a
person, and no amount of editing puts one there.

### Reproducing the table

```sh
# The gate reads posts through the same Markdown AST the site renders from, so this
# mirrors it rather than re-implementing a stripper. `npm i` first.
node --input-type=module -e '
import {fromMarkdown} from "mdast-util-from-markdown";
import fs from "node:fs";
const NONPROSE = new Set(["code","inlineCode","definition","yaml"]);
const SOURCE   = new Set(["blockquote","link","linkReference","image","imageReference"]);
const html = v => v.replace(/<!--[\s\S]*?-->/g," ").replace(/<[^>]*>/g," ");
const BLOCK = new Set(["paragraph","heading","listItem","tableCell","blockquote"]);
const collect = (n, skip, out) => {
  if (skip.has(n.type)) return out;
  if (n.type === "text") out.push(n.value);
  else if (n.type === "html" && typeof n.value === "string") out.push(html(n.value));
  for (const c of n.children ?? []) collect(c, skip, out);
  if (BLOCK.has(n.type)) out.push("\n\n");
  return out;
};
const M = /\b(?:I|I.m|I.ve|I.d|I.ll|[Mm]e|[Mm]y|[Mm]ine|[Mm]yself)\b/g;
const quoted = t => t
  .replace(/[\u201c"](?:[^\u201c\u201d"\n]|\n(?!\s*\n))*[\u201d"]/g," ")
  .replace(/\u2018(?:[^\u2018\u2019\n]|\n(?!\s*\n))*\u2019/g," ")
  .replace(/https?:\/\/\S+/g," ");
for (const f of fs.readdirSync("src/content/posts").filter(f=>f.endsWith(".en.md")).sort()) {
  const b = fs.readFileSync("src/content/posts/"+f,"utf8").split(/^---$/m).slice(2).join("---");
  const tree = fromMarkdown(b.replace(/<(a|blockquote|q)\b[^>]*>[\s\S]*?<\/\1>/gi," "));
  const prose = collect(fromMarkdown(b), NONPROSE, []).join(" ");
  const authored = quoted(collect(tree, new Set([...NONPROSE, ...SOURCE]), []).join(" "));
  const w = prose.trim().split(/\s+/).filter(Boolean).length;
  const m = (authored.match(M) || []).length;
  console.log(f, (1000*m/w).toFixed(1));
}'
```

The marker counts exclude block quotes, quoted spans, and links (label and target
both). Somebody else's "I" is not the author's presence, and this corpus is full of
it — Sternfels supplies two in one quoted sentence in `consulting-outcomes`, which is
why that post reads 0.8 rather than 1.9, and a PCGamer slug containing
`gives-me-a-headache` donates a `me` to `ai-native-game-is-a-test` if you don't strip
URLs, because a hyphen is a word boundary.

## 2. Two dialects of the same failure

The nine posts don't all sound alike, which is part of why this went unnoticed —
they fail in two different registers, and each one looks like a deliberate style
next to the other.

**The research memo** (`consulting-*`, April–May). Long paragraphs, wall-to-wall
named sources, analyst register. `consulting-coordination` runs 2,575 words and
never once says "I." These read like a very sharp equity-research note: correct,
sourced, and written by nobody in particular. The one first-person moment in the
whole cluster — "I should disclose that I work inside this model," in
`consulting-outcomes` — sits mid-paragraph, wedged between a quote from AlixPartners'
UK co-CEO and a "the question isn't X, it's Y" turn, which is what it looks like when
a disclosure is inserted rather than a perspective held.

**The staccato explainer** (the agent posts, June–July). Everything the research
memo isn't: two-sentence paragraphs, a punchline every third one, and a section
whose entire job is walking through four arXiv abstracts in a row.
`pull-requests-are-knowledge-imports` is 29% single-sentence
paragraphs — "Agents break that signal." / "Those questions didn't get cheaper just
because the first patch did." / "Some speed is fake." Each is fine alone. Eleven
of them in 38 paragraphs is a drum machine, and §1 of the playbook already predicted
exactly this: "when every second paragraph closes with a mic-drop line, none of them
drops."

Five of these posts also end the same way: "by the end of 2027, [serious teams /
serious projects / serious programs / serious evaluations] will [do the thing this
post recommends]." Same year, same adjective, same verb slot, five times over. The
playbook bans this in §3.4 — "the framing sentence must differ from the last three
posts" — and it is the one rule in the playbook that cannot be checked by reading
one file, which is why nothing checked it.

## 3. Why the machinery didn't catch it

The repo has an unusually thorough theory of this problem. `human-voice.md` §1
diagnoses the corrective pivot, the aphorism metronome, missing contractions,
template slots, question volleys, uniform burstiness, and "nobody home" — by name,
with quotes pulled from these same posts. `material-form.md` adds the
irreplaceable-material test. `pipeline.md` §10 adds the ownership model. And
`content-gate.mjs` enforces the countable half in CI.

Before this PR, that gate reported **three** substantive warnings across all fourteen
English posts: one on `taste-is-a-bet` (a mental-history flag that is correctly
sourced — it's a real author correction) and two on `wallet-is-not-a-conscience`.
Eight of the nine got nothing at all. It certified the corpus clean. Three reasons:

**The lint was calibrated on the failure.** Its own comment says the thresholds are
"calibrated against the nine published English posts so that a warning means a real
hit rather than background noise." Those nine posts *are* the nine posts in the top
half of the table. Calibrating to a corpus makes that corpus the definition of
normal — which is correct for a texture rule ("is this unusual for us?") and exactly
backwards for a structural one, because the thing being measured was the baseline.

**Every check was inside one file.** The single loudest tell in the corpus is five
posts sharing a closer. No per-file check can see that, so §3.4 was the one playbook
rule with no mechanical backing at all.

**It measured sentences, and the problem was sourcing.** Contractions, pivots,
burstiness, and lexicon are all real tells and all downstream. A post can pass every
one of them and still have nobody in it. `wallet-is-not-a-conscience` is the proof
in the other direction: published 2026-08-18, well after the voice pass, and it
scores a flat 0.0 on author presence — matching `consulting-coordination`, a post
from four months earlier and seven times its length. The pipeline was running correctly by its own lights
and shipped a post with no author in it anyway.

Worth naming: the August gardener retro found that two of four August posts shipped
with no editorial-critic pass at all, after the ship gate named that exact blocker
in writing. So the human-judgment layer that was supposed to catch what the lint
can't was also not running. Both halves of the check failed on the same pieces.

## 4. What this PR changes

Three checks added to `scripts/content-gate.mjs`, each calibrated against the *split*
in the corpus rather than against the corpus. The split they are calibrated against is
the one in §1 as corrected — pieces built on author material versus pieces assembled
from research — not a simple "had a spark" binary, which three of the nine would
falsify. Tests in `tests/content-gate.test.ts`;
table rows in `human-voice.md` §5.

| Check | Threshold | Fires on |
|---|---|---|
| Nobody home | ≥ 3 author markers / 1k words, on a cited or long piece | 9 posts |
| Punchline metronome | ≤ 20% single-sentence paragraphs | 3 posts |
| Template closer | ≤ 2 other posts share the closer's frame | 5 posts |

After: 9 of 14 posts trip at least one of the three, and the 5 that clear all three
are exactly the 5 whose argument is built on author material. The gate now reproduces
the split in §1 without being told about it.

Fixing the sentence counter these checks share (it was missing a terminator that sits
inside a quotation) also woke the gate's existing paragraph-shape check on
`wallet-is-not-a-conscience`: with quoted dialogue counted correctly, no paragraph in
that post runs shorter than three sentences. That is a true positive the old counter
was hiding, and it is the fourth warning on the one post published after the voice pass
that skipped the interview step.

The "nobody home" check carries a deliberate hazard, and its warning text addresses
it directly: **the remedy is never a first-person sentence.** §3.5 and
`material-form.md` §5 both say a person on the page must trace to author input and
must never be manufactured to satisfy a rule. A drafter that reads this check as a
quota and salts "I think" through a piece it has no standing to write in the first
person has made the corpus worse, not better — that is the manufactured-burstiness
failure with higher stakes, because it fabricates authorship rather than rhythm. The
warning says so in the string.

## 5. How to fix the nine posts

Split by what's actually wrong with them.

**Mechanically fixable now, no author input needed** (`human-voice.md` §4 already
authorizes these as direct edits):

- `wallet-is-not-a-conscience.en.md`: 7 uncontracted forms, 0 contractions.
- The five template closers: the *framing* can be varied without touching the
  claim. This is worth doing only alongside whatever happens below, though — a post
  with a fresh closer and still nobody in it is the same post.
- Typography on the three `consulting-*.zh.md` files: 88 / 134 / 193 unspaced
  CJK–Latin boundaries ("在2024年末", "大约95%"), against 0–6 in every post written
  after the voice pass. Purely a house-style inconsistency, not a voice problem, but
  it's the most visible bulk-translation tell on the Chinese side and it's a
  scripted fix.

**Not fixable by editing.** The other nine warnings need material that doesn't
exist. `pipeline.md` §10 and `human-voice.md` §3.5 both forbid the only edit that
would clear them: inventing a firsthand detail, a scene, or a change-of-mind story.
So a rewrite pass on these posts is not available, and proposing one would be
proposing to violate the repo's own ownership rule. There are three honest options
per post, and the new lifecycle machinery (#134) exists for exactly this:

1. **Re-interview and supersede.** The topic is still live and the author has a real
   position on it. Run `02-interview-brief` against the published post, draft the
   successor from the answers, and mark the original `superseded` with
   `supersededBy`. Best candidates: `agent-coordination-debt` (its "coordination
   debt" coinage is genuinely reused across the corpus and is worth owning properly)
   and `helpful-agents-authorization-bug` (already has an unanswered follow-up
   interview sitting in `research/interviews/2026-08-11-agent-retaliation-beyond-scope.md`).
2. **Archive.** The piece is a competent survey of a moment that has passed and the
   author has nothing to add. `editorialStatus: archived` with an `archiveReason`
   keeps the URL and drops it from the home page, RSS, and recommendations. Most
   likely candidates: the three `consulting-*` posts — 7,167 words of April–May 2026
   reporting with one disclosure sentence of author presence between them.
3. **Leave it.** It's honest research and the byline is the only problem. Costs
   nothing but keeps the front page reading the way it currently reads.

**This is the author's call, not the pipeline's, and it is not made in this PR.**
Marking nine of fourteen posts non-active changes what the site is; no automation
should do that on its own.

## 6. The upstream fix that matters more

The nine posts are a symptom with a date range attached: they stop the week
`research/interviews/` starts. The pipeline already fixed the supply problem for new
work — that's what the interview loop is — and the fix held everywhere it ran. All
five clean posts came from an inbox spark or an answered interview.

But the loop is not sufficient on its own, and §1 says why: three of the nine also came
from an inbox spark, the richest one in the file, and still read as machine-written,
because the spark set the topic instead of carrying the argument. What changed around
2026-07-20 was not that author material started existing — it was that the interview
step started producing enough of it to build on, and `material-form.md` §2 started
demanding that the draft actually do so.

Two things still leak:

- **`research/voice.md` is still empty.** Every entry under `## Stances` and
  `## Signature moves` is commented out, five months and fourteen posts into the
  blog, with twelve `## Proposed` entries queued behind them waiting for a promotion
  only the author can make. §1 of the playbook named this as the root cause in July and it is
  still true: "nothing substitutes for the author's stances, phrases, and firsthand
  details actually existing in the voiceprint." Promoting the proposed entries
  that are accurate is the single highest-leverage hour available here.
- **Rung 4 is still reachable.** `wallet-is-not-a-conscience` shipped from a current
  event connected to an old stance, with no fresh author input, and nothing blocked
  it. Three interview briefs are sitting unanswered
  (`agent-retaliation-beyond-scope`, `manufacturers-need-a-handoff-rule`,
  `coordination-is-the-risk`). Publishing on rung 4 while answered material is
  scarce is how the corpus got here; the new "nobody home" warning makes the next
  one visible at gate time, but it's advisory, and August already demonstrated that
  an advisory blocker doesn't stop a merge.
