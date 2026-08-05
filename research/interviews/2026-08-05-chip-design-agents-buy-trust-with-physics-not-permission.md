# Interview: Chip design agents buy trust with physics, not permission

**Source:** backlog item 2026-08-05 — Chip design agents buy trust with physics, not permission | inbox spark "Can we think about how AI in software development life cycle mean for manufacturing customers for example in semiconductor in car manufacturers etc or even robotics industry... I need to ask some intelligence questions or things that only a deep industry expert can have a very good point of view on" (2026-07-17)
**Status:** Answers in progress (2026-08-05)

## The idea in three sentences

At DAC 2026, Synopsys, Cadence, and Siemens all pitched "fully autonomous" chip-design agents, but the trust mechanism none of them will actually ship without is a hard physics-verification gate — proof that the cost of reversing a mistake, not model quality or permission scopes, is what forces real governance. All three vendors converged on the same design within days of each other in late July, built on NVIDIA's shared agentic stack, with general availability still six-plus months out — so the industry's real answer to "how much autonomy" shows up in the product architecture before the marketing catches up to it. The strongest objection is that this is trade-show messaging from vendors with every incentive to claim autonomy, and the "physics gate" could turn out to be a thin compliance checkbox once customers actually use these tools, with the headline performance numbers still unaudited.

## Questions

1. In consulting or software work you've actually seen, when has a team's "we verify before we ship" claim turned out to be marketing dressed up as governance — and how did you catch it?
   → an audit that found the "signoff" step was a checkbox nobody enforced
   → or: a QA gate you personally pushed back on because it looked real but wasn't
   → push: every verification gate is theater until someone gets fired for skipping it

2. Semiconductor tapeout is catastrophically expensive to reverse. A bad software PR usually isn't. Where have you seen agents, or people, get away with weaker verification specifically because the mistake was cheap to undo — and is that laziness, or a legitimately correct tradeoff?

3. Which part of this thesis do you think is wrong or overstated: that the cost of reversing a mistake is what predicts how much verification-before-autonomy an industry actually enforces, rather than something else entirely — regulation, headline risk, insurance, or just vendor incentive?

4. What's the version of this prediction you'd be willing to be wrong about in public — something like "software coding agents won't get a hard, physics-equivalent verification gate until an agent-caused production incident costs a company real, visible money"?
   → happy to commit to a date
   → or: I don't think software ever gets an equivalent gate, cheap reversal is permanent
   → or: it already exists somewhere and nobody's calling it that

5. In "Helpful agents are an authorization bug" you wrote: "Approval isn't a magic word... the product still needs to show what authority is being granted, what files are in scope, what commands are dangerous, and what can be rolled back." The EDA vendors' answer isn't a better approval UI — it's removing the model's word entirely and gating on a hard physics check instead. Does that hold up as the right fix for software too, or does software's cheap-reversal problem mean it never earns an equivalent gate?

6. （可跳过，2 分钟）用你自己的话，把 *Helpful agents are an authorization bug* 的核心论点讲给一个朋友听 — two or three sentences, any language，微信语音的随意程度就行。

## Author answers
_Answer in English, 中文, or both mixed. Fragments and voice-dump quality are exactly right — the drafter will do the structuring. 15–30 minutes is enough._

### Q1

every verification gate is theater until someone gets fired for skipping it. We had arguments with colleagues on the amount of effort we should spend in reviewing the work from someone who explicitly said they used AI and asked us to review before using the content. It's the same as people who "don't taking any ownership" at work

### Q2

It's cheaper, but it scales at exponential speed. Ive seen a client's codebase becoming a disastrously messy entangled myth within 2.5 months using uncontrolled unverified AI coding

### Q3

I'd tend to agree, with caveats

### Q4

Don't think it should happen but I'm sure it's already hidden somewhere
