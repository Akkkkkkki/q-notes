---
title: "Coding agents need traffic control"
date: 2026-07-10
excerpt: "When several coding agents work at once, the hard part is deciding what each one should change, and in what order."
tags: ["ai", "software", "engineering", "management", "essay"]
lang: en
translationKey: agent-prs-need-traffic-control
maturity: growing
---

Coding agents can fail even when each one writes decent code.

Picture five pull requests arriving at once. Each looks reasonable. Each passes its own tests. But none of the agents knows that the others are changing the same codebase.

This is the next problem for teams using many agents. Writing code is getting cheaper. Deciding who should change what, and in what order, is not.

Teams need *agent traffic control*: clear rules for which agent can touch which part of the code, what should go first, and when duplicate work should stop.

Code review catches bad patches after they are written. Traffic control should prevent conflicting patches from being written in the first place.

## The collisions are already visible

A July 6 paper on [AI-agent pull requests on GitHub](https://arxiv.org/abs/2607.04697) studied 33,596 agent-written pull requests across 2,807 repositories.

The authors first looked for pairs of agent PRs that were open at exactly the same time. They found such pairs in 40.2% of repositories. Those overlapping pairs included 79.4% of all agent PRs in the sample.

When the authors widened the window to one week, 53.4% of repositories had overlapping agent work. In that wider window, 95% of agent PRs overlapped with another agent PR.

Overlap does not always mean conflict. But it creates the chance for conflict, because several workers are changing the same codebase without sharing one plan.

The paper also replayed git merges for 747 pairs of PRs that had been open at the same time. Pairs from the same agent had a 19.8% text-conflict rate. Pairs from different agents had a 41.7% rate. The second group was small, only 0.5% of the overlapping pairs, so we should not make too much of that gap yet.

The type of conflict matters more. Source files made up 84.4% of conflicted files. Almost 42% of conflicts changed the structure of the codebase: one branch deleted a file that another branch changed, or two branches created different versions of the same file.

The agents were not just editing the same lines. Sometimes they disagreed about whether a file should exist at all.

## Good patches can still arrive in the wrong order

Software review usually asks: is this PR correct?

With several agents working at once, teams need to ask an earlier question: should this work have started yet?

One agent extracts a helper. Another rewrites the code that calls it. A third updates tests for the old version. A fourth fixes logging in a file that the first agent plans to delete.

Each patch may be fine on its own. Together, they create a mess that nobody chose.

This is why a high PR count can be misleading. The problem is not always code quality. It can be poor timing, unclear ownership, or too many agents working in the same area.

Two other studies point in the same direction. [*Augmentation with Dilution*](https://arxiv.org/abs/2606.26289) studied 11,097 GitHub repositories from January 2023 to May 2026. After teams adopted AI agents, human participation made up less of the work. The share of newcomers dropped by 3.7 percentage points, and PRs received 5.3% more review.

More code was being produced, but human understanding did not grow at the same rate.

A separate paper on [how agents write logs](https://arxiv.org/abs/2604.09409) found that humans made 72.5% of the log fixes that happened after generated code was added. The agent finished the patch, but people still had to repair many of its logging choices.

Agents do not remove the work of reviewing and combining changes. They send more work there.

## What traffic control looks like

The practical version is simple.

Before an agent starts, it should say what part of the code it plans to change and what outcome it is trying to reach. If another task already covers the same area, the system should flag the overlap early. A person can then combine the tasks, put one behind the other, or stop one of them.

Some work also has a clear order. A refactor should usually land before features that depend on the old structure. A database change should have one owner. Tests should not be written against code that another agent is about to replace.

Tools can spot the overlap, but they cannot make every decision. Someone still has to own the order of work.

That person may be a tech lead, code owner, product engineer, or manager. The title does not matter much. The job is to stop agents from creating work faster than the team can understand and combine it.

## Smaller PRs are not enough

Teams already have useful tools: small PRs, merge queues, code owners, feature flags, frequent rebasing, and CI.

They all help. The July 6 paper measures text conflicts, not build failures or product bugs. Some of those conflicts were probably easy to fix. Parallel development has always produced merge conflicts.

But agents change how quickly new work can begin. One person can now launch several branches before thinking through how they fit together.

A merge queue answers, "Can this PR land now?" Agent traffic control asks, "Should both of these jobs have started?"

That question comes earlier, and it matters more. Two onboarding patches may merge cleanly while still giving the product two different ideas of onboarding. An agent may delete a helper while another builds a new feature on top of it. Git can show the conflict, but it cannot choose the direction.

## Count the work you avoid

Agent platforms should report more than the number of PRs they create.

They should show how often they caught overlapping work before code was written. How often did a task wait for a refactor? How often did two competing designs go to a human for a decision? How many PRs were stopped early instead of being polished and handed to a reviewer?

Stopping agent work early can be a sign of a well-run system. Cheap code is not useful when it creates expensive cleanup.

Here is the prediction: by the end of 2027, teams that use coding agents seriously will make task ownership, work order, and limits on overlapping changes part of their normal development process. The best setup will not be ten agents sending ten PRs to one tired reviewer. It will know when the right answer is to wait, combine the work, or not write another patch at all.
