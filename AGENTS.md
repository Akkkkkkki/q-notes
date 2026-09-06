# q-notes Agent Instructions

This repository is a personal website for publishing sharp notes, opinions, essays, and blog posts. Treat it as an editorial system, not as a generic application repo.

The editorial pipeline — content tiers, weekly automation loop, definitions of done, and the bilingual contract — is defined in `docs/pipeline.md`. **`docs/material-form.md` is the normative material/form addendum for Issue #67 and amends the tier-length, counterpoint, prediction, and form-fit rules in `docs/pipeline.md` §3/§5. Where those older checklist bullets conflict, the addendum wins.** `docs/editorial-critic.md` defines the independent scope/novelty review introduced by Issue #68. **`docs/evidence-roles.md` is the normative evidence-role contract for Issue #87; it defines what external sources can establish for each Claim Ledger claim and prevents topical source breadth from being treated as causal depth.** Runnable stage prompts live in `automations/`. Any agent drafting or editing content must read the applicable canonical documents and follow them together.

**Phase-0 strict-v1 provenance override (#98/#97): until #97 is fully implemented and the canonical docs are consolidated, published article bodies are archive/context only and never authorize a current `Q-explicit` position by themselves. This override takes precedence over broader legacy wording in `docs/pipeline.md` §10. Current author positions may be authorized only by current author interview/capture/input, explicitly adopted `research/positions.md` entries, or explicitly promoted `research/voice.md ## Stances`.**

## Editorial north star

- Prioritize clear, opinionated writing over safe, generic synthesis.
- Challenge weak logic, vague claims, fashionable consensus, and wording that sounds smart but says little.
- Prefer specific claims, concrete mechanisms, and crisp tradeoffs. Use falsifiable predictions when the material naturally earns one; never manufacture a prediction to complete an Essay shape.
- Keep the tone slightly more professional than personal, but do not remove the author's voice.
- Favor topics around AI, technology, software, business, robotics, consulting/professional services, gaming intersecting with AI, and occasional philosophy, media, or culture when there is a strong idea.
- Avoid publishing "correct but useless" observations: every piece should contain a point of view a thoughtful reader can argue with or remember.
- **Material decides form.** `Ready to draft` authorizes supplied material; it does not select Essay. Before choosing tier, form, or outline, run the Material Audit in `docs/material-form.md`. Choose the smallest honest form the material supports.
- **Scope earns shipping separately from polish.** Every content PR must receive the independent editorial critic in `automations/03b-editorial-critic.md` before Routine 04 can say Ready. The critic may return `KEEP`, `CUT`, `DOWNGRADE`, `SPLIT`, or `SKIP`. Only a current applicable `KEEP` advances to the ship gate.
- The editorial critic owns thesis/scope/evidence/novelty decisions; deterministic build/parity/mechanical checks and ordinary voice polish stay with the content/ship gates. Do not collapse the two roles.

## Research standards

- Browse current primary or near-primary sources when researching timely topics.
- Look for early, high-signal perspectives before they become mainstream reports, especially from respected operators, researchers, founders, investors, engineers, independent analysts, Substack writers, podcasts/transcripts, GitHub discussions, technical forums, and X posts when accessible.
- Validate novelty by checking whether the idea has already become mainstream consensus in major consulting, analyst, venture, or AI-lab discourse.
- Separate facts, interpretations, and speculation.
- Include source links for claims that depend on current events, market data, public statements, or technical releases.
- Surface counterarguments and conditions under which the thesis would be wrong when they are genuinely live. Do not create an objection merely because a template has a counterpoint slot.
- A source's topical relevance does not increase its evidentiary role. Do not use several adjacent sources, an analogy, or connective prose to make a causal mechanism look directly evidenced.
- For every external source that carries a load-bearing Claim Ledger claim, assign an evidence role from `docs/evidence-roles.md` **before** using it as support. Record what the source actually establishes. `context`, `example`, `analogy`, and `hypothesis-source` never silently upgrade to `direct-evidence` through repetition or prose.
- Once a research package exists, search for the missing evidence role rather than more topical links. If the thesis needs direct measurement and the package has only context/examples, search specifically for direct measurement/case evidence, narrow the claim, keep it hypothetical, or leave it unresolved. Citation count is not material density.

## Article style

- Target a reading time under 5 minutes unless explicitly asked otherwise. Length is an output of the material, not a floor to fill.
- Open with the strongest claim or tension; avoid throat-clearing.
- Use sections only when each section contains material that could not have been written before the interview/research. If a section is generic connective tissue, cut it.
- End when the material is done. A memorable implication, unresolved question, or prediction tracker is useful when earned; a neat conclusion is not mandatory. The editorial critic explicitly tests whether a late third act is separable.
- Make the argument sharper during revision: remove generic framing, reduce caveats that do not change the conclusion, and replace abstractions with concrete examples.
- Write in plain language. Prefer the common word over the fancy one; cut any term that sounds clever but adds no meaning a smart non-specialist couldn't already follow (e.g. "metabolise" → "absorb", "bifurcated" → "two-tier", "the read-across" → "the parallel"). The only exception is a deliberately reused keyword or a `research/glossary.md` term: coin those sparingly, define them on first use, then reuse them on purpose. The measure of a piece is insight conveyed, not vocabulary.
- Keep sentences short and readable. One idea per sentence by default; break up any long, dense run-on that stacks several clauses, mid-sentence parentheticals, or back-to-back statistics. Reserve a long sentence for walking through one mechanism, and even then keep it clean.
- Write like you talk (`research/human-voice.md` is the full playbook). Contractions by default in English. Ration signature devices: "It is not X. It is Y." at most once per post, aphorism closers at most one per section, one unanswered rhetorical question per post. Treat suspiciously uniform paragraph/sentence rhythm as a diagnostic; do not insert a tiny paragraph, long paragraph, joke, or aside just to satisfy a style quota. Don't reuse an opening or closing frame from recent posts. 中文版从论点重写而不是从英文句子翻译：拆欧化句式（万能动词、"在……的情况下"、前置长定语、多余的"被"），多用句号，口语词不硬加，不排比，不升华。
- Preserve the author's vivid phrases from interview answers and inbox sparks verbatim where usable, and follow `research/voice.md` (stances, signature moves, never-say terms). Classify every load-bearing claim as `Q-explicit`, `Q-derived`, `External`, or `Model-hypothesis` (`docs/pipeline.md` §10). Under the Phase-0 strict-v1 provenance rule, a published article body is **context/history only**: it can support self-novelty, continuity, or source discovery, but it cannot by itself make a claim `Q-explicit`. Only current author input, an adopted `research/positions.md` entry, or a promoted `research/voice.md ## Stances` entry can authorize a current author position. A `Model-hypothesis` never becomes an unqualified first-person author belief without an adoption record. An untraceable judgment gets cut or recast as an open question.
- Keep evidence roles attached to the Claim Ledger source relationship, not to whole papers or paragraphs. A source can be `direct-evidence` for one claim and `context` for another. Before outlining, verify that each load-bearing external claim has a source, role, and short `establishes` statement. If the prose needs a stronger role than the evidence has, change the claim or evidence rather than smoothing the transition.
- Draft posts under `src/content/posts/` with frontmatter compatible with the site's content collection.

## Independent editorial critic

After the bilingual draft PR exists and before the ship gate can post Ready, run `automations/03b-editorial-critic.md` using `docs/editorial-critic.md` as the canonical contract.

The PR-facing output stays compact and singular:

```md
## Editorial critic

<!-- q-notes: editorial-critic head=<full PR head SHA> -->

### Verdict
KEEP | CUT | DOWNGRADE | SPLIT | SKIP

### Strongest single idea
<one sentence>

### Blocking reasoning failures
- ...

### Required scope cuts / splits
- ...

### Optional warnings
- ...
```

Do not add a family of permanent top-level audit sections as later v3 rules land. Evidence role, inference distance, article spine, natural endpoint, analogy, taxonomy, title, objection, prediction, and archive-provenance signals feed the same critic internally. Issue #68 owns severity and integration.

For evidence-role review, compare each load-bearing external claim with the role recorded in the Claim Ledger. A role upgrade is a reasoning failure when prose treats `context`, `example`, `analogy`, or `hypothesis-source` as stronger evidence than it is. Report the affected Claim ID and the specific upgrade inside the existing critic sections. Phrases such as “same direction” or “confirms the thesis” are inspection prompts, not banned strings; judge the underlying evidence relationship.

A critic `KEEP` is valid only for the semantic draft reviewed. A thesis, Claim Ledger, evidence, form/tier, major-scope, hypothesis-adoption, or other substantive reasoning change requires a fresh pass. Purely mechanical typo/format/link/build or claim-preserving voice edits do not force another model review; Routine 04 must verify that they changed no semantic scope before carrying a `KEEP` forward.

## Bilingual contract

- Every published piece has an English and a Chinese version, shipped in the same PR as one editorial unit.
- The two versions are transcreations, not literal translations. They share one Claim Ledger and must preserve the same thesis, required factual claims, numbers/dates, source support, causal direction, stance/uncertainty, and maturity/public meaning.
- Their rhetorical structure is independent by language: claim order, section order, headings, paragraph boundaries, openings/closers, connective scaffolding, and length may differ. Matching structure is allowed when it is naturally best, but it is never required for parity.
- Draft the second language from the shared source package (Author Kernel + Claim Ledger + sources/glossary + Material Audit), not by following the first language's sentence or section order. Run the final parity check by Claim Ledger ID.
- Evidence-bearing examples stay aligned unless the Claim Ledger marks them optional/non-load-bearing. Purely rhetorical illustrations may adapt by language only when they add no new factual claim, change no thesis, and invent no firsthand experience.
- Recurring terms use the renderings in `research/glossary.md`; new term decisions are appended there in the same PR.
- The author's voice may originate in either language or both mixed; draft first in the language the input leans toward.

## Pull request expectations

- For article drafts, open a PR rather than committing directly to main publishing flow.
- In the PR body, include `## Material Audit` and `## Form decision` in the exact shapes defined by `docs/material-form.md`, plus the thesis, why it is timely, key sources checked, unresolved doubts, and what the human should review most carefully.
- The Claim Ledger must expose each load-bearing external source's evidence role and a short statement of what it establishes, following `docs/evidence-roles.md`. This is internal review metadata; do not add evidence-role labels to the published article.
- A declared form/tier may not exceed the Material Audit's density judgment. If it does, trim or downgrade; do not add generic sections, predictions, counterpoints, citations, or filler to justify the higher tier.
- Before any ship verdict, the PR must have an applicable `## Editorial critic` result with verdict `KEEP`. `CUT`, `DOWNGRADE`, `SPLIT`, and `SKIP` are scope actions, not advisory voice flags.
- Editorial-critic comments are internal PR metadata. Never copy them into the public article.
