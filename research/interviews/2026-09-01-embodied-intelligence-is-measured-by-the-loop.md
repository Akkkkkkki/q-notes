# Interview: "Embodied intelligence" is measured by the loop, not the sensor

**Source:** backlog item 2026-08-31 — "Embodied intelligence" is measured by the loop, not the sensor | inbox spark "有点烦 现在大家什么都要叫具身智能...我觉得我们应该写一篇文章来聊聊我认为的具身智能是什么" (2026-08-29)
**Status:** Drafted (2026-09-17, second attempt — see run note below)

## The idea in three sentences

"Embodied intelligence" (具身智能) started as a specific technical claim — that intelligence emerges from a tight perception-decision-action-feedback loop coupling a body to its environment — and that academic framing has stayed stable even as China's embodied-intelligence sector pulled in tens of billions of yuan in 2026 and pushed 25-plus startups past RMB 10 billion valuations. Marketing usage has drifted so far from that definition that a 14-year-old parenting-app company launched an "AI具身智能婴儿床" (AI embodied-intelligence baby crib) in August 2026, explicitly claiming to complete a "perception-decision-execution-feedback closed loop" — the exact academic vocabulary, applied to a crib, while analysts separately flag "concept-chasing and homogenization" (概念滥用与同质化) across the sector. The strongest counter is that the terminology fight may be genuinely unsettled rather than bad-faith labeling: even careful technical writers use "embodied AI," "physical AI," and "robotics" inconsistently, so the author's own dividing line risks being as fuzzy as the marketing usage it critiques.

## Questions

1. Which specific product, ad, or pitch made you write "有点烦"? Not necessarily the baby crib — what's the most absurd "具身智能" label you've personally run into, and what does the thing actually do when it hits a situation nobody scripted for it?
   → a smart-hardware or IoT product with a sensor and a preset rule, no real feedback loop
   → a wearable or app with an LLM bolted on
   → a warehouse or logistics robot you'd actually say clears the bar

2. What's the one test you'd actually apply — the simplest thing a product has to do before you'll call it real 具身智能 instead of a sensor plus a rule? Try to state it as a single sentence a reader could point at a product they've never seen before.

3. Where does your own line get fuzzy? Is there a specific product or demo you're genuinely unsure about — where you can't tell if it has a real perception-decision-action-feedback loop or just a well-rehearsed demo script?

4. In *"AI-native game" is a test, not a vibe* you wrote: "here's the question nobody's answering: what actually makes a game 'AI-native'?" — and answered it with one checkable test, pull the model out and see if the thing still works. Does 具身智能 need the same kind of pull-it-out test, or does "the loop has to change behavior in real time" already make it a different, harder test than the games one?

5. Which of the adjacent terms — embodied AI, physical AI, smart hardware, IoT, plain robotics — do people conflate with 具身智能 most often, and where has that confusion actually cost someone something: an investor overpaying, a buyer disappointed, a team building the wrong thing?

6. （可跳过，2 分钟）用你自己的话，把 *"AI-native game" is a test, not a vibe* 的核心论点讲给一个朋友听 — two or three sentences, any language，微信语音的随意程度就行。

## Author answers
_Answer in English, 中文, or both mixed. Fragments and voice-dump quality are exactly right — the drafter will do the structuring. 15–30 minutes is enough._

### Q1

<!-- q-notes: answer-provenance=free -->

I just really dislike calling everything with a fancy word that isn't the right description at all. People don't even think about the fact that it's "an intelligence that is enbodied" i.e. the focus is intelligence, not the "body"

### Q2

<!-- q-notes: answer-provenance=free -->

It should be an impressive piece of intelligence no matter what "body" you put it in, or, even if you don't see a body for it. Now, I'm not saying just some science fiction terms, I want to be practical and talk in commercial world too. But just a simple hardware with a bit of sensor and some small statistical models or even just basic analytics, doesn't really count - even if you remove the "intelligence" part it still serves the user. People are just generalising the term as "hardware with a bit of software, where hardware may not even be electronic...it might just be any physical object"

### Q3

<!-- q-notes: answer-provenance=free -->

Not yet but I welcome your view

### Q4

<!-- q-notes: answer-provenance=free -->

I think so, and my previous responses may have answered it. The line blurs when you have an unexplainably huge complex model (over the traditional models) dictating the behaviour of the obejct / subject, maybe. Similar to data science / machine learning models start to be considered "intelligence" when they became so huge (e.g. our LLMs nowadays) that most people thought them having genuine intelligence

### Q5

<!-- q-notes: answer-provenance=free -->

All of them, yes. It may cause hype and bubbles (and I may have a small sense of jealousy due to the fact that I don't want to make these bubbly claims to win attention but they work).

## Drafter run report — 2026-09-03

Rung 1 and rung 2 are both unavailable, for the second consecutive week. All four open
interview files — `2026-08-11-agent-retaliation-beyond-scope.md` (23 days old),
`2026-08-18-manufacturers-need-a-handoff-rule.md` (16 days), `2026-08-25-coordination-is-the-risk.md`
(9 days), and this file (created on schedule Tuesday 2026-09-01, 2 days old) — have an
empty `## Author answers` section. None is `Ready to draft`; none has even a partial
answer to use as unsigned Note material. Rung 3 is unavailable, and not merely because
`research/inbox.md`'s sparks carry `→` pointers — a pointer records where a spark went,
it doesn't by itself disqualify the source. The 2026-08-29 具身智能 spark specifically
was re-audited on its own merits: it supplies an arguable complaint and one concrete
anchor (the AI 睡眠舱 crib), but not the thing the piece actually needs — the author's own
test for what clears the "real embodied intelligence" bar. `research/backlog.md`'s own
entry for this item says so directly: "the interview needs to extract the author's
dividing line and boundary cases, not have the model supply one." Per
`docs/material-form.md` §2, that gap puts this spark's Material Audit at `fragment`, not
`note` — a sharp complaint without yet enough owned material to carry a standalone
argued Note — and a `fragment` audit means research/interview more before polish, not
draft anyway. That is exactly why the interviewer escalated it past rung 3 into the
interview this file already is (`Status: Interviewing` in the backlog), rather than
leaving it as a bare inbox line. Drafting a Note straight from the raw spark now would
mean supplying the author's own dividing line myself — the one thing this interview
exists to extract and the one thing `docs/pipeline.md` §10 forbids. The 2026-07-17 manufacturing/robotics spark needed the same re-audit, not a pointer
check, and its pointer had a real gap: it named only the software-half Note, not the
2026-08-28 backlog item ("A robot that scores worse can be the more capable system")
that was built from its unanswered robotics/manufacturing half — now added. That backlog
item is still `Status: Backlog`, not yet interviewed, and its own text recommends an
interview rather than a direct draft: the spark itself says this needs "intelligence
questions... only a deep industry expert can have a good point of view on," an explicit
author domain-limit, and the only material available to fill it is External research
(NVIDIA/Arm papers) — drafting a Note from that now would be external synthesis wearing
the author's voice, the exact "authenticity gap" `docs/pipeline.md` §1 names as the
original failure mode this pipeline exists to prevent. The remaining two sparks carry
pointers into genuinely completed work and need no further audit, except the 2026-07-22
line ("Agent rollouts spread through coworkers before policy catches up"), which needs
none for a different reason — the author declined it in its own text ("we don't have
much to say about it that is new"). Rung 4 was checked, not skipped. This also covers
the third 2026-08-28 backlog item, "The first patch is only a price check if you can
throw it away" — it looks like a rung-4 candidate because it shares the 2026-06-19
firsthand spark with the published `agent-coordination-debt`, but it isn't scoring or
connecting a published claim to new evidence; it's a new thesis about experiment
disposal and ownership. Its own self-novelty caveat says a second use of that spark "has
to earn a second use by adding the rejection/ownership mechanism rather than restating
the original observation," and its own interview questions ask for exactly that
mechanism ("who could kill it... what made deletion harder than creation?"), which the
June spark never answers. Drafting it now would mean inventing the rejection/ownership
mechanism myself. Same stage as the other two Aug 28 items: `Status: Backlog`, not yet
interviewed.
The two formal tracked predictions (`agent-coordination-debt`, due end of 2027;
`taste-is-a-bet`, due end of 2028) are not yet due, and scoring either now would be the
premature "too early" filler `docs/material-form.md` §2 explicitly forbids. I re-opened
the specific rung-4 candidate the 2026-08-27 run identified and declined — a connecting
Note using the 2026-08-26 METR/Redwood investigation into the OpenAI–Hugging Face
coordination incident against the published `agent-prs-need-traffic-control` thesis
("Tools can spot the overlap, but they can't make every call — someone still has to own
the order of work.") — because the `coordination-is-the-risk` interview asks this exact
question (Q2, Q4) and, a week later, still has zero answers. Drafting that connection
without an author judgment on whether the incident breaks, narrows, or confirms the
published claim would mean the model supplying the point of view `docs/pipeline.md` §10
reserves for the author, so it stays declined. I also checked whether any other
since-2026-08-28 development connects to a published claim with enough author material
to draft from (`verification-gate-needs-a-name`, `helpful-agents-authorization-bug`,
`wallet-is-not-a-conscience`): every live thread from those posts routes back to one of
the same three still-unanswered interviews, so the same author-judgment gap blocks all
of them structurally, not by topic. Rung 5 is the rung that applies. No `## Material
Audit`, `## Form decision`, `## Bilingual parity`, `## A/B calibration`, or `## Claim
ledger` sections follow — there is no draft to audit.

**What the human should review:** this is the second straight week with no draft PR,
though not the pipeline-health failure that phrase might suggest — `docs/pipeline.md` §9
counts a drafter run as producing "nothing" only when it has "no artifact, no report,"
and both weeks filed the required rung-5 report, so that metric is still at zero. The
real signal is upstream of the drafter: no interview has been touched since the last
run. `agent-retaliation-beyond-scope` and
`manufacturers-need-a-handoff-rule` are now 23 and 16 days old with nothing under
`## Author answers`; worth a call on whether those two topics are still wanted, or
whether narrowing the queue to the two fresher briefs (`coordination-is-the-risk`,
`embodied-intelligence-is-measured-by-the-loop`) would make the Tuesday braindump less
overwhelming. The fastest path back to a real draft next week is 15–30 minutes on
whichever of the four briefs is easiest to answer cold — `embodied-intelligence` has the
most concrete anchor (the AI 睡眠舱 crib) and the author's own spark already states the
thesis, so it may be the quickest to turn around.

## Drafter run report — 2026-09-17

Second attempt at this interview. The first (PR #139, opened 2026-09-10) was closed
unmerged by the author the same day, as part of a broader content-quality reset
(#140/#143), for three specific reasons that survived an earlier round of Codex-review
fixes: (1) both excerpts asserted the crib actually fails the removal test, when the
body only supported a hypothetical — listing the crib's sensors/actions never
established that a fixed-rule substitute would perform equivalently; (2) the closing
paragraphs (EN and ZH) still tied the "embodied intelligence" vocabulary to
valuations/funding as if causal, reintroducing a claim already challenged in review;
(3) the opening overclaimed ("most" labeled products) and invoked an author history
("As I keep telling people") not established by the interview, and the piece conflated
"not intelligent" with "not a loop" — a fixed-rule controller can have feedback too, so
lacking intelligence doesn't by itself mean lacking a loop. The author's close comment
directed a revisit "as a short, explicitly bounded note from current author input, with
aligned excerpts/body, verified external claims."

This redo keeps the interview's rung-1 status (`Ready to draft`, 2026-09-03) and the
same Author Kernel and Claim Ledger as the first attempt — nothing in the author's
answers changed — but rewrites both language versions to fix exactly those three
points:

1. The removal-test application to the crib is now explicitly framed as an open,
   unresolved question ("I don't know whether the same actions would still fire... Nobody's
   published that comparison, including me") rather than an assertion that the crib
   fails. The crib's documented sensing/action set is kept as verified fact; only the
   claim about what a fixed-rule substitute would do is hedged.
2. The funding/valuation figure (re-verified this run: 22 China-based embodied-
   intelligence unicorns above ¥10B in H1 2026, ¥93.5B total sector financing — see
   Sources below) is kept only as background with an explicit correlation-not-causation
   hedge, and the word "valuation" was cut entirely from both closing paragraphs so
   nothing reads as "the term makes valuations hold up."
3. The opening drops "most" and the invented "As I keep telling people" framing. A new
   paragraph in both languages makes the loop/intelligence distinction explicit — a
   thermostat has a feedback loop and nobody calls it embodied intelligence, so the test
   is whether the *decision* step is doing real work, not whether a feedback loop exists
   in the engineering sense.

No new load-bearing claim was introduced (the Claim Ledger below is unchanged from the
first attempt except C4's number, corrected from "close to twenty" to the verified 22),
so this stays a claim-preserving/voice-and-precision revision of the same semantic
draft, not a new thesis, scope, or form decision.

**Sources re-checked this run** (both blocked for direct fetch by network egress
policy; re-verified via search-result summaries, consistent with how the original
backlog research was sourced):
- Crib product and its "感知-决策-执行-反馈" closed-loop marketing claim, confirmed via
  中国日报网 (2026-08-18) and corroborating 科技日报/界面新闻/凤凰网 coverage; launch
  confirmed as **July 2026** (press coverage followed in August).
- Funding scale, confirmed via search summaries of 搜狐网/新浪财经/IT之家/36氪 coverage
  of the same H1-2026 data: **22** China-based embodied-intelligence companies valued
  above ¥10 billion (up from 3 in 2025), **¥93.5 billion** total sector financing, 322
  financing events (+137% YoY).

## Material Audit

### Author-owned specifics
- The author's own removal test, in their own words (Q2).
- A vivid, self-aware admission of "jealousy" toward hype-makers (Q5) — real firsthand
  texture, not invented.
- An explicit, named epistemic boundary: no fuzzy case yet (Q3).
- A tentative, hedged hunch about scale and perceived intelligence (Q4), explicitly tied
  back by the author to the removal test in "AI-native game is a test, not a vibe."

### Research specifics
- The 亲宝宝 AI睡眠舱 crib: a dated, concrete, currently-marketed instance of the exact
  overreach the author's inbox spark named, re-validated this run.
- H1-2026 embodied-intelligence financing scale, re-validated this run and corrected to
  the verified figure, used only as one hedged clause of background, not as an argument
  pillar or a causal claim.

### Open gaps
- No author-supplied fuzzy boundary case (Q3) — an explicit domain-limit, kept open
  rather than filled by research or model invention.
- No specific "most absurd label" example beyond the crib (Q1 offered directions; none
  picked a concrete instance beyond what the interview brief itself supplied).

### Density judgment
- Supported by this material: **note**
- Why: unchanged from the first attempt — one arguable, repeatable claim (the removal
  test) backed by the author's own words, one irreplaceable concrete case (the crib,
  re-validated), a genuine live epistemic boundary the piece respects rather than
  resolves, and one real firsthand admission. Not enough for an essay: no second
  interacting mechanism, no engaged live counterargument beyond the author's own hedge.

## Form decision
- Chosen form: argument-note
- Public tier: note
- Strongest available material: the author's own removal test (Q2) plus the crib as a
  case whose pass/fail is honestly unresolved, closed by the author's own tentative
  doubt (Q4) and open question (Q3).
- Material deliberately not expanded: no taxonomy of embodied AI vs. physical AI vs. IoT
  beyond the author's own one-line list (Q5); no boundary case invented for Q3; no
  claim that the crib actually fails the removal test, since that was never verified.

## Claim ledger

C1. "Embodied intelligence" is a claim about the intelligence, not about having a body — Q-explicit (interview Q1) — Required in: EN + ZH
C2. The test: remove the intelligence and see if the product still serves the user the same way; whether that changes anything for a given product (e.g. the crib) is a separate, unresolved empirical question, not asserted either way — Q-explicit (interview Q2) — Required in: EN + ZH
C3. The 亲宝宝 "AI睡眠舱" crib, on sale July 2026, marketed as completing a "perception-decision-execution-feedback" closed loop, with a documented sensing/action set — External (中国日报网 et al., re-validated) — Required in: EN + ZH
C4. China's embodied-intelligence sector added 22 new ¥10B+ unicorns in H1 2026 (¥93.5B total financing) — External (搜狐/新浪财经/IT之家/36氪, re-validated) — Required in: optional (background clause, explicitly hedged as correlation not causation, non-load-bearing)
C5. The removal test gets harder to apply once an unexplainably huge, hard-to-explain model drives the behavior, echoing how LLM scale made "intelligence" read as description rather than metaphor — Q-explicit, tentative (interview Q4) — Required in: EN + ZH
C6. The author has no settled fuzzy-boundary case yet and says so explicitly, leaving it an open question — Q-explicit (interview Q3) — Required in: EN + ZH
C7. Adjacent terms (embodied AI, physical AI, smart hardware, IoT, robotics) get conflated with 具身智能, fueling hype/bubbles; the author admits a personal "small sense of jealousy" toward hype-makers — Q-explicit (interview Q5) — Required in: EN + ZH
C8. A feedback loop existing in the engineering sense (sensor → rule → actuator → sensor) is not the same question as whether the decision step is intelligent — a thermostat has the former without qualifying for either "intelligence" or "embodied intelligence" — Q-derived (a precision drawn from C1+C2 to avoid conflating "not intelligent" with "not a loop"; adds no new value judgment) — Required in: EN + ZH

No `Model-hypothesis` claims exist in this draft — C5 originates from the author's own
hedge (Q4), and C8 is a conservative near-inference from C1+C2, not a model-built
theory — so no `## Candidate hypotheses` section follows.

## Bilingual parity

| ID | Claim | EN | ZH | Notes |
|---|---|---|---|---|
| C1 | Intelligence, not body | ✅ | ✅ | zh opens from the original 2026-08-29 inbox spark instead of the definition; en opens from the general irritation |
| C2 | Removal test (unresolved for the crib) | ✅ | ✅ | both explicitly hedge "I don't know" / "我不知道" rather than asserting a result |
| C3 | Crib example | ✅ | ✅ | same source, same figures, both languages |
| C4 | Funding scale (optional, hedged) | ✅ | ✅ | both explicitly say correlation isn't causation; neither ties the term to valuation |
| C5 | Scale blurs the test (tentative) | ✅ | ✅ | equivalent hedge ("我说不准" / "I don't have a settled answer") |
| C6 | No settled boundary case yet | ✅ | ✅ | equivalent open invitation in both |
| C7 | Term conflation + jealousy admission | ✅ | ✅ | zh folds the funding-deck/headline examples into a short clause instead of en's parallel pair, to avoid a 排比 construction in Chinese |
| C8 | Loop ≠ intelligence (thermostat) | ✅ | ✅ | same thermostat example, both languages |

## Voice

Verbatim spine kept (EN): "the emphasis belongs on the first word, not the second";
"even if you remove the intelligence part it still serves the user" (Q2, echoed in the
loop/intelligence paragraph); "an unexplainably huge complex model"; "a small sense of
jealousy."

Verbatim spine kept (ZH, from the 2026-08-29 inbox spark): "有点烦"; "加了点传感器和算法的婴儿床"; "这个词炒得有些过热了" (grammar-smoothed from "炒的").

Opinions not traceable to author input: **none** — every load-bearing claim traces to an
interview answer, the inbox spark, or a re-validated External source stated as fact and
explicitly hedged where the author's own material was itself tentative.

Human pass (`research/human-voice.md` §4) ran on both language versions after drafting:
- Talk test: read aloud; the opening was trimmed of an unsupported "As I keep telling
  people" aside and a "most products" overclaim that didn't survive the talk test either.
- EN: contractions by default throughout; one corrective pivot ration observed; `node
  scripts/content-gate.mjs` flagged em-dash density (9 in 540 words) and paragraph
  clustering on the first pass — both fixed directly: four dash pairs converted to
  colons/periods (kept two genuine appositive-list pairs per voice.md's exception), and
  a one-sentence paragraph ("Nobody's published that comparison, including me.") split
  out as the isolated-verdict move already scaffolded in `research/voice.md ## Proposed`
  (2026-09-01 entry), not manufactured filler.
- ZH: rewritten from the argument, not translated from the English sentence order —
  opens from the original Chinese inbox spark rather than the English opening. The gate
  flagged 6 dashes in 909 Han chars on the first pass; all six converted to
  colons/periods per voice.md's explicit "破折号能用逗号就用逗号" rule, none left
  standing. One remaining advisory (0 concrete-scene words against a work-scene keyword
  list calibrated for office settings) is left standing: the list (团队/客户/会议/PR/...)
  doesn't fit a consumer-hardware piece, and inserting one of those words would be
  artificial stuffing, not real grounding — the piece's concrete grounding is the
  crib/thermostat mechanism itself.
- One firsthand moment present in both languages (the "jealousy" admission), directly
  traceable to Q5; no invented scene.
- No mental-history claims ("I used to think...") anywhere in either version.
- `node scripts/content-gate.mjs` run on both files after fixes: zero warnings except
  the one documented above.

## A/B calibration

哪个像你说的？点选或回复编号（例：1B）；跳过也是有效回答。

1. en opening
   - A. "I keep running into products wearing "具身智能," or embodied intelligence, like a sticker, and it's starting to bug me."
   - B. "There's a word I keep seeing slapped on things that don't deserve it: 具身智能, embodied intelligence."
   - C. "Here's a test I keep applying to anything marketed as "embodied intelligence": what's left if you pull the intelligence out?"

2. zh 结尾
   - A. "老实说，这里面也有我自己一点不太体面的小心思：我不想讲那种能把泡泡吹大的话，虽然我知道它们确实好使。"
   - B. "说白了我也有点羡慕：不想吹泡泡，但吹泡泡的人确实拿到了关注。"
   - C. "我知道这么说不太体面：我不想讲能把泡泡吹大的话，可它们确实好使，这我承认。"

3. en closer
   - A. "And if I'm honest, there's a small sense of jealousy in there too: I don't want to make the claims that inflate a bubble. They obviously work."
   - B. "And, honestly, some of that irritation is jealousy. I don't want to make the bubbly claims. They work anyway."
   - C. "There's a smaller, less flattering feeling under the irritation too — something close to jealousy. I don't make the bubbly claims. They still work."

## Title options

**English** (used first):
1. Embodied intelligence is the intelligence, not the body
2. A crib is not embodied intelligence, yet
3. Pull the intelligence out and see what's left

**中文**（已用的排第一）：
1. 具身智能，是智能，不是身体
2. 婴儿床算不上具身智能：现在还不算
3. 把智能拿掉，看还剩下什么

**What the human should review:** whether the crib is the strongest available anchor, or
whether the author has since run into a sharper example; whether the loop/intelligence
distinction (C8) reads as a fair, non-invented precision rather than a new claim; and
the three A/B choices above.
