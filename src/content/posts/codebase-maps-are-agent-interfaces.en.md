---
title: "The best agent interface is a map"
date: 2026-07-07
excerpt: "Coding agents need more than context; they need codebases that make the right place to work clear."
tags: ["ai", "software", "engineering", "essay"]
lang: en
translationKey: codebase-maps-are-agent-interfaces
maturity: growing
connections:
  citedBy: ["agent-coordination-debt", "agent-prs-need-traffic-control"]
---

Coding agents often fail before they write bad code. They fail when they can't tell where the work belongs.

A senior engineer knows which module owns a feature, which tests define the contract, and which directory only looks relevant. Much of that knowledge isn't in the code at all — it sits in people's heads, old pull requests, and review habits. An agent doesn't share that history. If the repository doesn't show its structure, the agent has to guess from search results and nearby files.

The point is simple: an agent-ready codebase isn't one with a longer prompt. It's one that makes the right place to work clear.

## More context is not a map

The July 2 revision of [*How Much Static Structure Do Code Agents Need?*](https://arxiv.org/abs/2606.26979) tested a practical idea: give coding agents simple information about call relationships, inheritance, and configuration dependencies, and see what happens.

The gains weren't huge, but they were useful. Function-level localization improved by 2.2 percentage points, agent runs got 1.6 interaction rounds shorter, and results varied less between runs. On medium-sized repositories, Pass@1 improved by 3.4 percentage points at the cost of about 10% more input tokens. Mostly, what the map bought was less wasted movement.

That matters because many teams still treat agent failure as a prompt problem. They add instructions, paste more files, or ask the model to reason longer. Those steps can help, but a larger context window doesn't explain who owns a decision or which test is the real contract.

When an agent keeps editing the wrong files, the repository may be the problem.

## The codebase is the interface

For a human, a good codebase already works like an interface: names, folders, module boundaries, tests, and architecture records show where to look and what not to change. Agents make the gaps in that interface easier to see, because they struggle with exactly the parts of the system that only long-serving team members understand.

A useful codebase map doesn't need to be a new visual tool. It can be a set of clear answers: which module owns this behavior, what calls this function, which configuration controls it, which tests define the contract, which decision record explains the tradeoff, and who should review the change.

This is ordinary engineering work. The difference is that agents make its value easier to measure.

## Plans and checks are part of the map

The [*Spec Growth Engine*](https://arxiv.org/abs/2606.27045) paper comes at the same problem through specifications. It argues that agent work creates two risks — too much context, and quiet drift between the code and the original plan — and its proposed system gives the agent only the relevant part of a machine-readable specification, then blocks a merge when code and spec move apart. The full framework is probably more than most teams need, but the core idea stands on its own: an agent needs to know both where to work and what the change is allowed to mean.

The same pattern shows up in larger technical tasks. [Reboot](https://arxiv.org/abs/2606.27122), a system for translating C interpreters into safe Rust, broke the work into complete, testable features, and that improved validation pass rates by 6 to 20 percentage points compared with multi-agent translation alone. [NOVA](https://arxiv.org/abs/2606.27243), built for architecture work in industrial recommender systems, routes tasks by risk, runs several levels of checks, records paths the agent shouldn't take, and sends high-risk work to people. In one task, the paper reports a 13-fold reduction in human-attended time while reducing silent failures against its coding-agent baselines.

Different systems, same lesson: autonomy works better when the route, the limits, and the checks are explicit.

## Better models will still need clear codebases

The fair counterargument is that models will get better at reading a repository and building their own map. They can inspect history, run tests, ask questions. Maybe codebase maps are just temporary support for today's weaker agents.

Better models will need less help, sure. But a strong engineer can also work through a messy codebase, and we still document ownership and architecture — because repeated inference is slow, inconsistent, and hard to review. The same rule applies to agents. A map created inside one agent run is private and temporary; a map held in the repository can be checked, improved, and reused by everyone.

## Agent readiness is good engineering

The practical conclusion is less exciting than a new agent product: teams can improve agent performance by making the repository easier to understand. Clear module ownership, small vertical slices, contract tests, current architecture records, explicit dependency boundaries. This work helps new engineers too. If a person or an agent can't quickly answer where a behavior lives, what must not change, and how the change will be checked, the codebase is hiding important operating knowledge.

By the end of 2027, I expect serious software teams to treat "agent readiness" less as prompt writing and more as repository quality. The teams that get the most from coding agents won't be the ones with the longest instructions but the ones whose codebases make the responsible change easy to find.

The best agent interface may be the codebase itself.
