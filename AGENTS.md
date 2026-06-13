# q-notes Agent Instructions

This repository is a personal website for publishing sharp notes, opinions, essays, and blog posts. Treat it as an editorial system, not as a generic application repo.

The editorial pipeline — content tiers, weekly automation loop, definitions of done, and the bilingual contract — is defined in `docs/pipeline.md`. Runnable stage prompts live in `automations/`. Any agent drafting or editing content must follow that document; the rules below are the always-on summary.

## Editorial north star

- Prioritize clear, opinionated writing over safe, generic synthesis.
- Challenge weak logic, vague claims, fashionable consensus, and wording that sounds smart but says little.
- Prefer specific claims, concrete mechanisms, falsifiable predictions, and crisp tradeoffs.
- Keep the tone slightly more professional than personal, but do not remove the author's voice.
- Favor topics around AI, technology, software, business, robotics, consulting/professional services, gaming intersecting with AI, and occasional philosophy, media, or culture when there is a strong idea.
- Avoid publishing "correct but useless" observations: every piece should contain a point of view a thoughtful reader can argue with or remember.

## Research standards

- Browse current primary or near-primary sources when researching timely topics.
- Look for early, high-signal perspectives before they become mainstream reports, especially from respected operators, researchers, founders, investors, engineers, independent analysts, Substack writers, podcasts/transcripts, GitHub discussions, technical forums, and X posts when accessible.
- Validate novelty by checking whether the idea has already become mainstream consensus in major consulting, analyst, venture, or AI-lab discourse.
- Separate facts, interpretations, and speculation.
- Include source links for claims that depend on current events, market data, public statements, or technical releases.
- Surface counterarguments and conditions under which the thesis would be wrong.

## Article style

- Target a reading time under 5 minutes unless explicitly asked otherwise.
- Open with the strongest claim or tension; avoid throat-clearing.
- Use short sections with meaningful headings.
- Make the argument sharper during revision: remove generic framing, reduce caveats that do not change the conclusion, and replace abstractions with concrete examples.
- Write in plain language. Prefer the common word over the fancy one; cut any term that sounds clever but adds no meaning a smart non-specialist couldn't already follow (e.g. "metabolise" → "absorb", "bifurcated" → "two-tier", "the read-across" → "the parallel"). The only exception is a deliberately reused keyword or a `research/glossary.md` term: coin those sparingly, define them on first use, then reuse them on purpose. The measure of a piece is insight conveyed, not vocabulary.
- Preserve the author's vivid phrases from interview answers and inbox sparks verbatim where usable, and follow `research/voice.md` (stances, signature moves, never-say terms). Every opinion in a draft must trace to the author's input or published positions; an untraceable judgment gets cut or recast as an open question.
- End with a memorable implication, question, or prediction tracker when useful.
- Draft posts under `src/content/posts/` with frontmatter compatible with the site's content collection.

## Bilingual contract

- Every published piece has an English and a Chinese version, shipped in the same PR as one editorial unit.
- The two versions are transcreations, not literal translations: thesis, structure, factual claims, numbers, and source links must be identical; idioms, rhythm, and titles adapt to each language.
- Recurring terms use the renderings in `research/glossary.md`; new term decisions are appended there in the same PR.
- The author's voice may originate in either language or both mixed; draft first in the language the input leans toward.

## Pull request expectations

- For article drafts, open a PR rather than committing directly to main publishing flow.
- In the PR body, include the thesis, why it is timely, key sources checked, unresolved doubts, and what the human should review most carefully.
