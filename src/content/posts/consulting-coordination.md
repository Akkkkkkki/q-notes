---
title: "The real AI bottleneck is not intelligence. It is coordination."
date: 2026-05-02
excerpt: "Most enterprise AI value is lost not to model limits but to the organisation around the model. Coordination, not intelligence, is the binding constraint."
image: /images/consulting-coordination.jpg
tags: ["English", "AI", "Notes"]
---

A useful way to summarise the last eighteen months of enterprise AI is that the question quietly changed. In late 2024 the question most enterprises asked was *can the model do this?* By mid-2026 the question is *can our organisation safely turn what the model can do into work?* These sound similar. They are not.

The first is a capability question, answerable by a benchmark. The second is an organisational question, answerable only by the slow process of figuring out who owns the output, who reviews it, who is accountable when it is wrong, how it integrates with existing workflows, who has access to the relevant data, what the audit trail looks like, and how the people whose jobs are touched by it actually feel about its presence. Most of the AI value enterprises have failed to capture lives in that second question. So does most of the consulting work that is going to matter for the next five years.

This is the third in a series. The first article argued that AI is changing what consulting was really selling. The second argued that the consulting business model is moving from selling effort to underwriting outcomes. This piece argues that even after those two shifts have played out, the real frontier is not AI capability — it is the work of making an organisation behave as though that capability exists.

## The bottleneck has moved

The phrase that has landed best in 2026 came from George Sivulka of Hebbia: *we have swapped the motor; we have not yet redesigned the factory.* AI has made individual knowledge workers, in the right conditions, dramatically more productive. The factory — the surrounding organisation of meetings, handoffs, document repositories, approval chains, and tribal knowledge — has not changed. So the productivity gain leaks out at every joint.

Sergei Sorokin at Highlight has framed the same observation in slightly different language: the limit on enterprise AI productivity is no longer about model capability — it is a coordination bottleneck. Arvind Jain at Glean has made a similar point about context: the gap is no longer model intelligence, it is the model not having the surrounding organisational context it needs to be useful. Bret Taylor of Sierra, sharper: companies ship their org charts. These voices do not agree on much, but they agree on this: the intelligence supply now exceeds the organisation's ability to consume it productively, and closing the gap is the next decade's work.

What this looks like in practice, in AI and data consulting projects: a client signs up for a generative AI initiative, deploys a model, sees individual employees become genuinely faster at certain tasks, and then discovers six months in that the firm-level metrics have not moved. Cycle times are similar. Headcount is similar. Time-to-decision is similar. The productivity exists somewhere — individual employees can name it — but it is not aggregating to the P&L. This is the coordination tax in operation, and it is the specific phenomenon that the MIT NANDA report's now-famous finding describes — that roughly 95% of enterprise AI initiatives produce no measurable P&L impact.

## What the 95% finding actually means

The 95% number is widely cited and slightly misunderstood. It does not mean that 95% of AI deployments are failing technically. The technology mostly works. It means that 95% of deployments are not changing the business in ways that show up in the financials. Those are different problems with different solutions.

Technical failures, when they happen, are addressed by better models, better evals, better data infrastructure, better prompting. The frontier labs are highly motivated to fix these and largely will. The 95% problem is a different shape. It is about what happens when capability lands in an organisation that does not change anything else about how it operates. The model gets used. Individuals benefit. The organisation does not.

The historical analogy most economists reach for is electrification. Factories did not become more productive when they replaced steam engines with electric motors. They became more productive twenty years later, when they redesigned the factory floor around the new fact that motors no longer needed to be near a central power source. The motor change was the easy part. The factory redesign was the hard part. AI is currently in the motor-change phase. The factory redesign is what most enterprises have not started.

This matters for consulting because the factory redesign — operating model change, role redesign, governance, evaluation, change management — is exactly what consulting has historically been good at and software companies have historically been bad at. The opportunity for the firms that figure this out is large. The risk for the firms that do not is that they get stuck selling AI deployment services into a market that has already learned deployment is not the bottleneck.

## Multi-agent systems: the debate, simplified

A specific technical fashion worth flagging is multi-agent architectures — the idea that complex AI work should be done by orchestrating multiple specialised agents (a researcher agent, a writer agent, a reviewer agent, and so on) rather than by a single agent with good tools. This has become the default architecture in a lot of consulting and enterprise sales pitches. It is not the consensus among practitioners.

Two reference points define the debate. Anthropic's multi-agent research system, described in mid-2025, showed that multi-agent setups can outperform single-agent ones by roughly 90% on complex research tasks — but at fifteen times the token cost, and only when the value of the task is high enough to justify the spend. Cognition Labs published a widely-read piece called *Don't Build Multi-Agents* arguing the opposite: that for almost all production use cases, a single well-equipped agent with strong context is more reliable, cheaper, and easier to debug than an orchestrated swarm.

The 2026 evidence is leaning toward Cognition's side for production work. LangChain, the canonical open-source agent framework, has visibly retreated from multi-agent enthusiasm toward what its founder Harrison Chase calls "context engineering" — the discipline of giving a single agent the right information, tools, and scaffolding rather than splitting work across many agents. Bret Taylor, who runs both Sierra and the OpenAI board, has said publicly that he has grown more skeptical of the multi-agent vision and now thinks it was overrated. Flo Crivello at Lindy has been candid that his company's first version overestimated agent autonomy and has since been rebuilt around more deterministic scaffolding. Tomasz Tunguz: roughly two-thirds of his agent's workflow now runs as non-AI code.

The consulting implication of this debate is unromantic but important. Most enterprise AI projects do not need multi-agent orchestration. They need a single, well-scoped agent with clean access to the right data, careful evaluation, deterministic guardrails for the parts that should not be left to the model, and a clear human review point where it matters. The firms selling "agentic AI transformation" with elaborate multi-agent diagrams are mostly selling architecture that does not yet work as advertised. The firms doing useful enterprise AI work are mostly building harness-engineered single agents with good context. Knowing which of these you are buying is one of the most important questions a CIO should be asking in 2026.

## AI reviewing AI: where it works and where it does not

The natural extension of agentic enthusiasm is the idea of "AI reviewing AI" — using one model to check another's output, in the hope that this drives quality up without requiring human review. Anthropic released a code-review tool in March 2026 that does exactly this for code. The pattern works well for programming because code has a cheap ground truth: it either runs and passes the tests or it does not.

The pattern works much less well outside that condition. For consulting work — strategic recommendations, market analyses, client communications — there is rarely a cheap ground truth. An AI reviewer can check for internal consistency, factual claims against retrieved sources, formatting compliance, and a few other surface-level properties. It cannot check whether the analysis is *the right analysis* for the client's situation, or whether the recommendation will land in the boardroom, or whether the framing is going to get the consultant fired. Those are exactly the judgment calls that, as the first article in this series argued, are concentrating premium value on a small group of senior people.

So "AI reviewing AI" is a useful technique in narrow domains and a misleading framing for consulting work generally. The honest version is: AI doing first-pass review on the parts that have ground truth, humans doing review on the parts that do not. That is not as catchy a slide title.

## Codifying tacit knowledge: harder than it looks

A persistent fantasy in enterprise AI is that an organisation's most senior practitioners can be cloned by capturing their judgment in a system — through fine-tuning, eval rubrics, agent persona prompts, or some other mechanism — and that the resulting digital twin will be close enough to the human to scale their value across the firm. The cleanest articulation comes from Wang Xiaochuan, the former Sogou CEO now running Baichuan, who has argued that the conventional wisdom is wrong: data is not the key, finding top experts to design the evaluation system is. The idea is sophisticated. Senior expert value lies less in producing exemplar outputs than in defining what good looks like, and that definition can be partially captured.

Two things are true at once. The first is that this approach genuinely works, at least partially, for well-bounded domains where good and bad are reasonably specifiable. Eval rubrics built by senior experts do raise the floor on AI output in a way that lower-quality training data does not. The second is that the moment the rubric exists, the senior expert's judgment has been partially extracted from them. They no longer fully own the thing they were paid for. This is an unresolved tension at the heart of every "let's productise our methodology" conversation inside a consulting firm.

It is also why several senior figures who have done this work have ended up leaving their firms to run product companies built on the methodology they codified. The economics of being the person who wrote the rubric are very different inside a partnership than they are outside one. Most consulting firms have not faced this publicly.

For clients, the takeaway is more practical: codification of senior judgment is a real source of leverage, but it is partial, lossy, and dated as soon as the underlying environment changes. Eval rubrics for last year's market conditions are imperfect for this year's. Tacit knowledge that took twenty years to accumulate cannot be fully encoded in six months of effort. The codification project is worth doing, with realistic expectations about what it produces — a useful augmentation, not a replacement for the senior people involved.

## The real consulting opportunity

Pulling all of this together, the most defensible consulting work for the next several years has a specific shape. It is not "deploy this model." That work is being commoditised by the model providers themselves. It is the work of redesigning the factory around the new motor — operating model change, role redesign, evaluation infrastructure, governance, change management, and the careful translation of AI capability into actually-different organisational behaviour.

That work has four properties. It is *long-cycle*, taking quarters or years rather than weeks. It is *politically loaded*, because it touches who does what and who is accountable. It is *high-context*, depending on understanding the specific organisation rather than just the technology. And it is *outcome-attributable*, because the change either shows up in the metrics or it does not. These four properties happen to be exactly the ones that are hardest for AI to do alone and easiest for an experienced human consultant to lead. They are also the work that traditional management consulting was originally designed for, before it drifted toward selling slide production.

The honest version of "AI is reshaping consulting" is therefore not that consulting is dying. It is that consulting is being given a chance to do the work it has always claimed to do — operating model change, governance design, organisational behaviour change — and to do that work without the camouflage of producing a thousand pages of slides along the way. Whether the industry takes that chance is an open question. The opportunity is real, the bottleneck is real, and the firms that figure out how to underwrite outcomes on factory redesign rather than effort on motor installation will be doing the most valuable work of the decade.

The bottleneck is not intelligence. It is coordination. That is good news, because coordination has always been what the best consultants were actually selling.
