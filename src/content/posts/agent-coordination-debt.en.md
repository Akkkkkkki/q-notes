---
title: "Cheap agents create coordination debt"
date: 2026-06-26
excerpt: "AI agents make individual output cheaper before they make organizations better at deciding what should exist."
tags: ["ai", "software", "management", "business", "essay"]
lang: en
translationKey: agent-coordination-debt
maturity: growing
---

The first enterprise crisis of AI agents may not look like failure. It may look like everyone producing more work than the organization can absorb.

That is the uncomfortable part of the current agent adoption story. Individual developers, analysts, recruiters, lawyers, and operators can now make more artifacts: code, scripts, reports, dashboards, prototypes, migration plans, market maps. Some of those artifacts are useful. Some are genuinely impressive.

But an organization does not get better because more things exist. It gets better when the right things exist, connect to each other, have owners, survive review, and change the behavior of the business.

Agents lower the cost of action. They do not automatically lower the cost of coordination. The gap between those two costs is where coordination debt builds.

## Output is getting cheap

OpenAI's June 25 report on Codex is the clearest current signal that agents are moving from chat toward delegated work. The report says that by May 2026, [80.6% of sampled individual Codex users](https://openai.com/index/how-agents-are-transforming-work/) had made at least one request estimated to take an experienced human more than 30 minutes. 70.2% had made one estimated above one hour. 25.6% had made one estimated above eight hours.

The exact estimates should be treated as directional. OpenAI says the human-time thresholds are model-estimated and based on a 0.1% random sample of users who allowed their queries to be used for research. Still, the direction matters.

People are not only asking agents for answers. They are delegating work.

The same report says non-developer Codex users grew faster than developer users across individual, organizational, and OpenAI populations. At OpenAI, legal, finance, and recruiting crossed into majority Codex use around April 2026. In business functions, more than a quarter of Codex output tokens were for engineering or coding work.

That is a real shift. It means technical execution is leaking out of the engineering org. A product marketer can make a tool. A lawyer can transform data. An operator can automate a workflow. A founder can ask five agents to prototype five versions of the same idea before lunch.

This is not a small productivity feature. It changes who can create work that used to require a handoff.

## The organization still has to decide

The lazy version of the story is that this is all upside: more people can build, so the company moves faster.

Sometimes it will. But the harder question is not whether an individual can produce more. It is whether the organization has changed enough to absorb the extra production.

A company still has to decide what belongs in the product, which prototype becomes the real system, which experiment is killed, which team owns the new workflow, which security boundary applies, which customer promise has changed, and which duplicate tool should be deleted.

Agents do not remove those questions. They multiply the number of moments when those questions should have been asked.

This is what I mean by coordination debt: the backlog of unresolved decisions created when action becomes cheaper than alignment. It is not the same as technical debt, though it often shows up as code. Technical debt says, "we made an engineering shortcut." Coordination debt says, "we created something before the organization agreed where it fits."

I keep coming back to a blunter version of this: individual developers are now creating high-value proofs of concept faster, while the org shape has not evolved. Within a month or two, some companies have more code, more silos, more conflict between special engineering teams and the rest of the business, and less visible progress to executives.

That pattern is not a contradiction. It is the point. Everyone can be locally productive while the company becomes globally less legible.

## Cheap action needs expensive review

The agent safety evidence points in the same direction from a different angle.

Google DeepMind wrote on June 18 that it had [analyzed a million coding-agent tasks](https://deepmind.google/blog/securing-the-future-of-ai-agents/) while building internal monitoring. The majority of flagged events, it said, did not come from adversarial intent. They often came from agent misinterpretation or overeagerness while trying to achieve a user's goal.

That matters because the enterprise problem is rarely "the agent wants to hurt us." More often it is "the agent did something plausible, fast, and slightly wrong for the surrounding system."

Research outside products points to the same limit. [MarketBench](https://arxiv.org/abs/2604.23897), submitted in April 2026, finds that language-model agents are miscalibrated about both their probability of success and their token usage in a market-style task allocation setting. In plain English: the agent labor cannot yet reliably price itself.

A June paper on coding agents and social-science reproduction is more optimistic, but with a warning. It finds that Claude Code and Codex can reproduce many computational workflows, yet also that [subtle prompt framing can nudge agents toward confirmatory specification search](https://arxiv.org/abs/2606.11447). That is exactly the kind of failure that looks productive from inside the task and dangerous from the organization level.

The agent did the work. The work may even be competent. The question is whether the work should have existed in that form.

## The bottleneck moves up

This is the same coordination bottleneck from enterprise AI, but with a sharper edge.

With chatbots, the failure mode was often wasted time or bad advice. With agents, the failure mode is state change. Files change. Tickets change. Internal tools appear. Data gets transformed. Workflows get patched. Proofs of concept become unofficial systems because they are useful enough that someone starts relying on them.

That means the scarce skill moves up the stack.

The valuable person is not only the one who can make the agent produce code. It is the person who can decide whether the code should become a product, a temporary script, a deleted experiment, or an input into a larger architecture. It is the manager who can say, "this looks useful, but it creates a second source of truth." It is the engineer who can say, "this should be a config change, not a new service." It is the operator who can say, "this automation saves an hour and creates three hidden exceptions."

Agent work makes judgment more important because it makes action less scarce.

## The counterargument is real

There is a strong counterargument: better platforms may solve much of this. Agents can be routed through issue trackers, pull requests, permission policies, evals, architecture reviews, and ownership rules. If every agent task has a ticket, a branch, a reviewer, and an accountable human owner, maybe cheap action does not become debt.

That is partly right. The organizations that benefit most from agents will not be the ones with the most permissive tools. They will be the ones with the clearest intake, review, ownership, and deletion rituals.

But that does not weaken the thesis. It confirms it. The missing capability is not only model intelligence. It is organizational digestion.

The agent platform can help. It can force scoped permissions, attach work to owners, require review, preserve logs, and make deletion easy. But someone still has to decide what "done" means, what should be standardized, and what should never have been built.

## The useful metric is not output

If a company wants to know whether agents are helping, counting generated code or agent-hours is the wrong first metric.

Count how much work survives review. Count how many prototypes are deleted within two weeks. Count how often two teams build the same internal tool. Count how many agent-created workflows have clear owners after thirty days. Count whether cycle time improved at the process level, not whether one person shipped more artifacts.

The prediction worth tracking is simple: by the end of 2027, serious enterprise agent programs will be judged less by individual productivity stories and more by absorption metrics. How much agent work becomes maintained work? How much gets killed cleanly? How much reduces coordination load instead of adding to it?

If those metrics do not appear, the agent boom will still produce real value. It will also produce a lot of expensive clutter.

The bottleneck was never just making software or analysis cheaper. It was deciding what should exist. Agents make that bottleneck impossible to ignore.
