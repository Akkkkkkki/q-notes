# Interview: "Embodied intelligence" is measured by the loop, not the sensor

**Source:** backlog item 2026-08-31 — "Embodied intelligence" is measured by the loop, not the sensor | inbox spark "有点烦 现在大家什么都要叫具身智能...我觉得我们应该写一篇文章来聊聊我认为的具身智能是什么" (2026-08-29)
**Status:** Answers in progress (2026-09-03)

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
