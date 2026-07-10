---
title: "Agent teammates need traffic control"
date: 2026-07-10
excerpt: "The next bottleneck in agentic software work is not only reviewing each patch; it is sequencing many plausible patches before they collide."
tags: ["ai", "software", "engineering", "management", "essay"]
lang: en
translationKey: agent-prs-need-traffic-control
maturity: growing
---

The first practical failure of many coding agents may not look like bad code.

It may look like five good-enough pull requests arriving at once, each locally reasonable, each passing its own tests, and none of them aware that the others are trying to reshape the same repo.

That is a different problem from "can the agent write code?" It is closer to air traffic control. The scarce work is deciding which agent is allowed to touch which surface, in what order, with what merge budget, and under whose ownership.

Review is still necessary. But once autonomous contributors overlap, review is not enough. A codebase with many agent teammates needs traffic control.

## The data is moving from anecdotes to collisions

A July 6 paper on [AI-agent pull requests on GitHub](https://arxiv.org/abs/2607.04697) gives the cleanest current signal. The authors studied 33,596 agent-authored pull requests across 2,807 repositories.

Under the strictest definition, where two agent PRs are open at the exact same time, 40.2% of repositories had co-active agent PR pairs. Those co-active pairs accounted for 79.4% of all agent-submitted PRs in the sample. With a one-week collaboration window, the repo share rose to 53.4%, and 95% of agent PRs were co-active with another agent PR.

That matters because concurrent PRs are not just parallel work. They are competing edits to a shared object.

The paper replayed three-way git merges for 747 co-active pairs. Same-agent pairs had a 19.8% textual conflict rate. Cross-agent pairs had a 41.7% conflict rate. Cross-agent pairs were rare, only 0.5% of exact-overlap co-active pairs, but the direction is still useful: different automated workers can interfere with each other more sharply than a single platform producing multiple branches.

The conflicts were not mostly lockfile noise. The paper says 84.4% of conflicted files were source files. Nearly 42% of conflicts were structural: one branch deleted a file the other modified, or two branches independently added different versions of the same file.

That is the interesting part. The agents are not only fighting over lines. They are sometimes disagreeing about whether a thing should exist.

## Local correctness is not global order

The usual software review habit asks: is this PR correct?

Agent-heavy work adds a prior question: should this PR land before the others?

A patch can be right in isolation and expensive in sequence. One agent extracts a helper. Another rewrites the caller. A third updates tests against the old shape. A fourth fixes logging in a file that is about to disappear. Each change can be defensible. Together they create a merge queue that no one actually designed.

This is why agent output can feel productive while the repo becomes harder to govern. The issue is not only quality. It is timing, ownership, and surface area.

The broader ecosystem evidence points the same way. A June study, [*Augmentation with Dilution*](https://arxiv.org/abs/2606.26289), looked at 11,097 GitHub repositories from January 2023 to May 2026. It found that after AI-agent adoption, human contributor density fell, newcomer share dropped by 3.7 percentage points, and review depth increased by 5.3%. The authors' phrase is useful: augmentation with dilution. More generated work does not automatically mean more human understanding.

Another paper on [agent logging behavior](https://arxiv.org/abs/2604.09409) found that humans performed 72.5% of post-generation log repairs in the studied repos. That is a quiet kind of maintenance work. The PR may merge, but humans still clean up the observability decisions afterward.

Put those together and the pattern is clear: agents move work into the review and integration layer. The bottleneck does not disappear. It moves to the people and systems that decide how changes combine.

## The repo needs a control plane

Traffic control sounds grand, but the practical version is boring.

Agent platforms need to know which areas of a codebase are already claimed. A task should reserve a surface before it starts changing it. A second task touching the same surface should see the conflict early, not after both agents have spent tokens and created polished branches.

Teams also need merge-order rules. A refactor branch should probably land before feature branches that depend on the old structure. A schema change should have a named owner and a narrow window. A test-generation task should know whether the implementation it is testing is stable or about to be replaced.

This is not only a tooling problem. It is a management problem made visible in git.

Someone has to decide whether ten agent PRs represent ten independent improvements or one confused swarm around an underspecified goal. Someone has to kill overlapping work. Someone has to say, "this agent may update tests, but it may not create a new abstraction." Someone has to notice when the codebase is absorbing activity faster than it is absorbing intent.

That person may be a tech lead, code owner, product engineer, or manager. The title matters less than the function: sequencing autonomous work before it turns into shared-state clutter.

## Smaller PRs are not the whole answer

The obvious counterargument is that software teams already have tools for this. Use smaller PRs. Use merge queues. Use code owners. Use feature flags. Rebase often. Let CI catch the rest.

Yes. Those tools help. The July 6 paper measures textual conflict, not build conflict or semantic conflict, so we should not treat every conflict as a product failure. Some are trivial. Some are the ordinary cost of parallel development.

But that is not enough to dismiss the thesis. Existing tools were designed around scarce human contributors who usually know what else is happening, or at least can be asked. Agents change the rate of attempted work. They also make it easier for one human to launch several branches whose interactions no single human has fully considered.

Merge queues decide what can land. Agent traffic control has to decide what should be attempted at the same time.

That distinction matters. If two agents both try to improve onboarding, the problem is not only whether git can merge the files. The problem is whether the repo now contains two competing ideas of onboarding. If one agent deletes a helper while another builds on it, the problem is not only the conflict marker. It is that neither worker owned the architectural direction.

## The useful metric is collision avoided

The next serious agent platforms should not brag only about PR count. They should show collision avoided.

How often did the system detect overlapping work before branches diverged? How often did it route a task to wait behind a refactor? How often did it ask for a human decision because two agents wanted incompatible designs? How many agent PRs were killed early rather than polished into review burden?

That last number may become a sign of maturity. A team that kills agent work early is not wasting less creativity. It is refusing to convert cheap action into expensive integration.

Here is the prediction worth tracking: by the end of 2027, mature agentic software teams will treat branch claiming, merge sequencing, and conflict budgets as first-class product infrastructure. The winning workflow will not be "ten agents, ten PRs, one tired reviewer." It will be a repo-level scheduler that knows when the right answer is not another patch.

The code still has to be good. But in a world of agent teammates, good code arriving in the wrong order is just another form of mess.
