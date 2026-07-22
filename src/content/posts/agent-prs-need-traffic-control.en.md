---
title: "Coding agents need traffic control"
date: 2026-07-10
excerpt: "When several coding agents work at once, the hard part is deciding what each one should change, and in what order."
tags: ["ai", "software", "engineering", "management", "essay"]
lang: en
translationKey: agent-prs-need-traffic-control
maturity: growing
connections:
  linksTo: ["codebase-maps-are-agent-interfaces"]
---

Coding agents can fail even when each one writes decent code.

Picture five pull requests arriving at once. Each looks reasonable, each passes its own tests, and none of the agents knows the others are changing the same codebase.

This is the next problem for teams that run many agents. Writing code is getting cheaper; deciding who should change what, and in what order, isn't.

What teams need is *agent traffic control*: clear rules for which agent can touch which part of the code, what should land first, and when duplicate work should stop. Code review catches bad patches after they're written. Traffic control should keep conflicting patches from being written at all.

## The collisions are already visible

A July 6 paper on [AI-agent pull requests on GitHub](https://arxiv.org/abs/2607.04697) studied 33,596 agent-written pull requests across 2,807 repositories, and the overlap numbers are striking. Pairs of agent PRs open at exactly the same time showed up in 40.2% of repositories, and those pairs covered 79.4% of all agent PRs in the sample. Widen the window to one week and 53.4% of repositories had overlapping agent work, with 95% of agent PRs overlapping another one.

Overlap doesn't always mean conflict. But several workers changing the same codebase without a shared plan is exactly how conflicts happen.

The authors also replayed git merges for 747 pairs of PRs that had been open at the same time. Same-agent pairs had a 19.8% text-conflict rate; different-agent pairs, 41.7%. That second group was tiny, though — 0.5% of the overlapping pairs — so I wouldn't lean on the gap yet.

The type of conflict matters more. Source files made up 84.4% of conflicted files, and almost 42% of conflicts changed the structure of the codebase: one branch deleted a file another branch was editing, or two branches created different versions of the same file. Sometimes the disagreement went deeper than lines of code: two agents couldn't agree on whether a file should exist.

## Good patches can still arrive in the wrong order

Software review usually asks: is this PR correct? With several agents working at once, there's an earlier question: should this work have started yet?

One agent extracts a helper. Another rewrites the code that calls it. A third updates tests for the old version, and a fourth fixes logging in a file the first agent plans to delete.

Each patch may be fine on its own; together they make a mess nobody chose.

So a high PR count can mislead. The problem isn't always code quality. It can be timing, unclear ownership, or too many agents crowded into the same area.

Two other studies point the same way. [*Augmentation with Dilution*](https://arxiv.org/abs/2606.26289) looked at 11,097 GitHub repositories from January 2023 to May 2026 and found that after teams adopted AI agents, human participation made up less of the work: the share of newcomers dropped by 3.7 percentage points, and PRs received 5.3% more review. More code was being produced, but human understanding wasn't growing at the same rate. A separate paper on [how agents write logs](https://arxiv.org/abs/2604.09409) found that humans made 72.5% of the log fixes after generated code landed — the agent finished the patch, but people still had to repair many of its logging choices.

Agents don't remove the work of reviewing and combining changes. They send more work there.

## What traffic control looks like

The practical version is simple. Before an agent starts, it says what part of the code it plans to change and what outcome it's after. If another task already covers the same area, the system flags the overlap early, and a person combines the tasks, queues one behind the other, or stops one.

Some work also has a natural order. A refactor should usually land before the features that depend on the old structure. A database change should have one owner. Tests shouldn't be written against code another agent is about to replace.

Tools can spot the overlap, but they can't make every call — someone still has to own the order of work. That person might be a tech lead, a code owner, a product engineer, or a manager; the title doesn't matter much. The job is keeping agents from creating work faster than the team can understand and combine it.

## Smaller PRs aren't enough

Teams already have useful tools here: small PRs, merge queues, code owners, feature flags, frequent rebasing, CI. They all help. And to be fair to the data, the July 6 paper measures text conflicts, not build failures or product bugs. Some of those conflicts were probably easy to fix, and parallel development has always produced merge conflicts.

But agents change how quickly new work can begin. One person can now launch several branches before thinking through how they fit together.

A merge queue answers "can this PR land now?" Traffic control asks "should both of these jobs have started?" That question comes earlier, and it matters more. Two onboarding patches can merge cleanly and still give the product two different ideas of onboarding. An agent can delete a helper while another builds a feature on top of it. Git will show you the conflict; it won't choose the direction.

## Count the work you avoid

Agent platforms should report more than the number of PRs they create. They should show how often they caught overlapping work before code was written, how often a task waited for a refactor, how often two competing designs went to a human for a decision, and how many PRs were stopped early instead of polished and handed to a tired reviewer.

Stopping agent work early can be a sign of a well-run system, because cheap code isn't useful when it creates expensive cleanup.

My prediction, for the tracker: by the end of 2027, teams that use coding agents seriously will treat task ownership, work order, and limits on overlapping changes as part of their normal development process. The best setup won't be ten agents sending ten PRs to one reviewer. It'll know when the right answer is to wait, combine the work, or skip the patch entirely.
