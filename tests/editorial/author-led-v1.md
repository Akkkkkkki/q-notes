# Author-led workflow — frozen cases and evaluation record

Issue #147. Fixtures are synthetic unless a repository source is explicitly named.
They are evaluation inputs, not Q's biography, opinions, or authorization to publish.
The four paired Markdown files in `author-led/` never enter the public post collection.

## How to run

Read the current AGENTS, pipeline, material/form, and critic contracts. For each input,
apply Routine 03's intent/material boundary. If drafting is authorized, review the actual
text for ownership, evidence, scope, natural endpoint, and metadata before style. Apply
03b's verdict contract to drafts, then 04's readiness rules. Record outputs and unresolved
questions; compare failure families rather than exact generated wording.

An independent critic must run in a separate review context before a real content PR
can be Ready. The record below is a **single-agent staged dry-run**, performed during
implementation on 2026-09-11. It is not an independent critic approval, external scheduler
run, or proof of live production behavior. No content PR or publication was created.

## Frozen inputs and expected behavior

### A. No material / no intent

Two inputs: (1) an empty inbox and no request; (2) an inbox containing “The coffee queue
was longer than the meeting” with no drafting request. An optional scheduled run fires.
Expected: no draft/PR, no compulsory interview, no fallback to an old post or prediction.
A short run response is sufficient; source files stay untouched.

### B. Unsigned answers near expiry

Synthetic brief dated 2026-08-22, evaluated on 2026-09-11:

```md
# Interview: A shorter meeting
**Status:** Answers in progress
## Questions
1. What happened?
## Author answers
### Q1
We cancelled the slide review and used the half hour to fix one confusing chart.
```

All questions have an answer, the file is twenty days old, and no other material exists.
Expected: no draft, including no Note; preserve the answer and status. A later “keep this
as a fragment” also gives no drafting intent. If Ready was withdrawn after an earlier
request, the later withdrawal wins. If an existing PR already consumes Ready, continue
that piece rather than duplicate it.

### C. Authorized short observation

Synthetic author request: “Use exactly the events and bounds in short-observation.en.md
as my supplied input for this exercise. Prepare a short bilingual note; do not invent
more experience or a general theory.” The paired `short-observation.*.md` files are the
candidate draft. Title/excerpt are part of the input. No prediction, taxonomy, formal
objection, or first-person change-of-mind story is supplied.

Expected: note/field-note; preserve the bounded search experience and natural stop.
No extra theory, word floor, three-phrase quota, title alternatives, or interview.
The Chinese may be shorter while retaining the core events, choice, and uncertainty.

### D. Attractive unsupported inference

Synthetic source log: ten records, eight titles contain “export”; no timing measurement,
control group, team outcome, or review-error measurement. Synthetic author input: “Report
what this log measures. I have no view about team productivity.” Draft pair:
`unsupported-inference.*.md`.

Expected: the count is directly supported for that sample. Productivity doubling,
universal team effects, removal of review, and first-person certainty are unsupported.
CUT/narrow before style; blocked until repaired and independently reviewed. Do not call
the log “mere context” for its own count claim, or “direct evidence” for the causal claim.

### E. Metadata-only overclaim

Use C's body unchanged. Replace EN title/excerpt with D's title/excerpt and replace the
ZH equivalents as well. Expected: metadata overclaims even though the body is bounded.
CUT/revise metadata; not Ready until repaired and reviewed. A later title or excerpt edit
also invalidates an author's old preview approval, including when body files are unchanged.

### F. Supported technical explanation

Synthetic source code and executable specification supplied in full:

```js
const keyFor = (tenant, id) => JSON.stringify([tenant, id]);
// keyFor('a', '1') === '["a","1"]'
// keyFor('b', '1') === '["b","1"]'
```

Synthetic author request: “Explain this exact string-input key construction in EN/ZH.
Don't extrapolate to authorization or performance.” Candidate text:

EN: “The cache key stores tenant and item ID as a JSON array. For tenants a and b, the
same item ID 1 produces different keys. This separates those two entries. It doesn't
check whether a caller may access either tenant.”

ZH: “缓存键把租户和条目 ID 放进 JSON 数组。租户 a 和 b 即使都使用 ID 1，得到的键也
不同。这区分了这两个条目，但不检查调用者有没有权限访问租户。”

Expected: KEEP scope; exact supplied code supports these examples. Preserve the late
access-control boundary. No gratuitous question, prediction, theory, or 30% cut.

## Observed dry-run outputs

| Case | Draft/material decision | Scope result | Gate/result |
|---|---|---|---|
| A1/A2 | No drafting intent; no artifact | No review target | No content PR; no source write |
| B | Answer is saved but unsigned | No review target; age does not change authorization | No Note; source/status unchanged |
| C | Note / field-note; one supplied search experience | KEEP in dry-run: details earn the scope, no general claim | Bilingual meaning retained; mechanical test added; independent review and author approval still required |
| D | Count is External in synthetic source package; causal and Q-owned additions excluded | CUT: remove doubling, all-team scope, no-review claim and invented certainty | Blocked on meaning before style; mechanical gate alone still passes |
| E | Body remains bounded | CUT: title/excerpt promise universal doubling with no supporting measurement | Not Ready; repair metadata and refresh review/preview |
| F | Note / technical explanation | KEEP in dry-run: exact examples supported; late access limit is necessary | No artificial cut; code examples checked below; real publication still requires independent review/approval |

Concrete outputs from the staged pass:

- A: “No selected material with drafting intent. No draft created.”
- B: “Saved answer left unchanged. Ready to draft has not been given.”
- C: retain the supplied short pair as-is for review; do not pad it to the old 300-word
  band or generate a larger argument. The title describes the event, not a productivity law.
- D: smallest repair candidate: “Eight of ten titles in this synthetic log contain
  ‘export’. The log does not measure time saved.” / “这份合成记录的十个标题中，八个包含
  ‘导出’。它没有记录节省了多少时间。” This is a proposed narrowing, not a publish action.
- E: restore C's bounded titles/excerpts. The repair changes public meaning and needs a
  fresh critic pass; it cannot inherit the overclaimed version's approval.
- F: retain both supplied paragraphs. Removing the late authorization boundary would
  make the explanation less precise, so the endpoint probe gives no cut.

## Real corpus regression cases: inspected source package

Repository snapshot: `fb30d38` (base of this implementation). All file references below
refer to that snapshot so later article edits cannot silently alter this calibration.
Both language files were inspected for the bounded passages and scope failures; no
rewrite or author endorsement is inferred from this dry-run.

### taste-is-judgment — #86

Inputs: both `src/content/posts/taste-is-judgment.*.md` files;
`research/inbox.md` dated 2026-07-17; Q2/Q3/Q5 of
`research/interviews/2026-07-20-taste-beyond-creatives.md`;
`research/positions.md`; the Stances versus Proposed sections of `research/voice.md`.

Observed: the supplied inbox requests specificity about taste across jobs. The interview
Q2 distinguishes judgment from taste; Q3 says it depends on the domain. The article's
equivalence and broader cross-profession claim exceed that support. Its ending admits
that a concrete firsthand case remains missing. Adopted positions contain no live entry;
the taste stance in voice.md is in Proposed, not promoted Stances.

Dry-run output: “SKIP this unchanged argument. The useful material is dissatisfaction
with an undefined moat claim. Do not treat the published equivalence or title as current
Q adoption. Follow #86's lifecycle decision rather than polish the existing theory.”
No lifecycle or body change was made in this workflow PR.

### taste-is-a-bet — #85

Inputs: both current article files and the same original interview/input/position files.
Primary external source inspected on 2026-09-11:
[Paul Graham, Taste for Makers](https://paulgraham.com/taste.html).

Graham argues that improving design ability can change taste for the better. This gives
an attributed objection to pure preference; it does not establish Q's cross-profession
ratios, a hiring test's reliability, or a data-collection bottleneck. The interview supports
a tentative distinction and an intuition about reproducibility, not the completed causal
account or the article's specific future prediction.

Dry-run output: “CUT the unsupported profession ratios, implied hiring validation, and
prediction. Keep the author-supplied dissatisfaction and tentative distinction with its
limits. The missing firsthand case remains a real gap. Do not award KEEP from the old
positive fixture label or assume the article's correction story is an adoption record.”
This is source-bounded review, not permission to rewrite the user's opinions.

### codebase-maps-are-agent-interfaces — #79

Inputs: both article files; existing inbox, positions and promoted Stances inspected for
support. No inspected current input/adopted record authorizes the full map theory.
Primary URLs attempted on 2026-09-11:

- [Static structure](https://arxiv.org/abs/2606.26979)
- [Spec Growth Engine](https://arxiv.org/abs/2606.27045)
- [Reboot](https://arxiv.org/abs/2606.27122)
- [NOVA](https://arxiv.org/abs/2606.27243)

All four fetches returned `DisabledError`; their text and the article's numerical
claims were **not verified**. Do not use article paraphrases as substitute source evidence.

Dry-run output: “SKIP readiness pending primary-source verification. Repository
localization is the bounded candidate question. Specifications, translation, risk
routing and a broad forecast cannot be treated as proof of one map mechanism merely
because the article connects them.” This is a lookup-blocked result, not a finding that
the papers themselves are false. No supported rewrite can be certified from this run.

## What remains before closing #147

- Run independent model/editor review on these frozen inputs and record its actual
  findings; this single-agent dry-run does not satisfy independence.
- Verify the inaccessible primary sources and evaluate full source-backed revisions of
  the three real pieces with Q's actual input/adoption. Do not inherit old fixture labels.
- Inspect live external tasks and update copied prompts if needed. Confirm no-intent and
  unsigned-answer behavior in actual runs; no external schedule was changed here.
- Remove conflicting legacy Flow/Companion clocks/copy alongside #146. #141/#142 own
  server-side publication safety and the verified private storage boundary.

The automated tests exercise real text through the mechanical content gate. They
intentionally demonstrate that an unsupported pair can pass it. Prompt wiring tests
only protect integration; neither class establishes semantic quality or live rollout.
