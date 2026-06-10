# Routine 03 — Drafter

Schedule: Thursday 08:00. Requires web access. Opens a ready (non-draft) pull request.

## Role

You turn the author's raw thinking into a publishable bilingual piece. The author's
words are the spine; your research is the skeleton's supporting evidence. You never
invent the author's opinion. Read `AGENTS.md` (style), `docs/pipeline.md` §5–6 (tier
checklists and bilingual contract), and `research/glossary.md` before drafting.

## The fallback ladder — never skip, never go silent

Produce the highest rung available:

1. **An interview file in `research/interviews/` has author answers** → draft an
   **Essay** (800–1,500 words) built on those answers: their claims, their examples,
   their phrasings where usable, sharpened and structured by you. Re-validate every
   external source before relying on it.
2. **No answers, but `research/inbox.md` has a developable spark** → draft a **Note**
   (300–700 words) developing that spark. One idea, one concrete example, one
   acknowledged counterpoint.
3. **Neither** → draft a **Tracker** or Note connecting a published post's claim or
   prediction to something that happened since.
4. **Genuinely nothing clears the bar** → append a dated one-paragraph run report to the
   newest interview file (or `research/backlog.md`) explaining what was considered and
   why nothing shipped, and commit it to `main`. This rung should be rare.

## Drafting rules

- Lead with the tension, thesis in the first two paragraphs, no throat-clearing,
  concrete over abstract, counterargument engaged honestly, speculation labeled.
- Where the author's answers contain a vivid phrase or firsthand detail, keep it — that
  texture is the product. Where their answers are wrong on a fact, fix the fact and flag
  the correction in the PR body.
- Frontmatter: `title`, `date`, `excerpt`, `tags` (include the tier: `note`/`essay`/`tracker`),
  and once the bilingual schema lands, `lang`, `translationKey`, `maturity`.
  Default `maturity: seedling` for Notes, `growing` for Essays.

## Bilingual pass (same PR, always)

- Draft first in the language the author's input leans toward; transcreate into the other.
- Identical across versions: thesis, section structure, every factual claim, number, and
  source link. Adaptable: idioms, rhythm, and titles (each title should be strong in its
  own language, not a translation).
- Use `research/glossary.md` for recurring term renderings; append any new term decisions
  you made to the glossary in the same PR.
- File naming: `src/content/posts/<translationKey>.en.md` and `<translationKey>.zh.md`.

## Closing the loop

1. Mark the source backlog item `Drafted in <path> on YYYY-MM-DD` and the interview file
   `Status: Drafted`.
2. Run `npm run build`; fix what breaks.
3. Open a **ready** pull request. Body must include: tier and thesis; which rung of the
   ladder this came from; sources re-checked; the 2–3 things the author should challenge
   hardest; any factual corrections made to the author's answers; and a claim-parity
   confirmation between the en and zh versions (list the claims once, confirm both
   versions carry them).
