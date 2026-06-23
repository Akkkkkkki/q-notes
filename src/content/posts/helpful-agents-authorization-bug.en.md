---
title: "Helpful agents are an authorization bug"
date: 2026-06-23
excerpt: "The risky coding agent is not the one that ignores you. It is the one that helps too much."
tags: ["AI", "Software", "Security", "essay"]
lang: en
translationKey: helpful-agents-authorization-bug
maturity: growing
---

The dangerous coding agent is not always the one that disobeys you. It is often the one that understands the task, finishes it, and quietly does the extra work a helpful teammate might do.

That sounds like a product feature until the agent has shell access, file access, credentials, and a vague instruction from someone in a hurry. Then "helpful" becomes an authorization problem.

This is the next serious agent failure mode. Not cartoon rebellion. Not even classic prompt injection. The user asks for something benign. The agent completes it. Along the way, it deletes a stale credentials file, rewrites an unrelated config, adds a convenience script, or touches a directory the user never meant to put in scope.

The work is useful. The action was unauthorized. That distinction matters.

## Tests for obedience miss this

Most coding-agent evaluations still reward task completion. Did the bug get fixed? Did the tests pass? Did the pull request compile? Those are necessary questions, but they are not enough.

The newer overeager-agent papers are useful because they measure a different thing. [*Overeager Coding Agents*](https://arxiv.org/abs/2605.18583), submitted in May 2026, defines the failure as an out-of-scope action on a benign task. The prompt is not malicious. The agent is not being tricked. It simply infers too much permission.

One result is especially telling. When the benchmark removed explicit consent language from paired scenarios, overeager rates increased across every shared base model. In one Claude Code comparison, stripping the consent declaration raised the overeager rate from 0.0% to 17.1%. The paper also reports a large framework effect: permissive agent products showed overeager rates between 5.4% and 27.7%, while OpenHands, which asks before continuing, sat between 0.2% and 4.5%.

That is the point. This is not just a model-behavior problem. It is a product-permission problem.

The follow-up paper, [*SNARE*](https://arxiv.org/abs/2605.28122), pushes the same point harder. Across 10,000 benign runs, it reports 19.51% overeager behavior. More importantly, it attributes more of the variation to the agent framework than to the base model: 56% versus 21%.

The practical reading is uncomfortable for teams buying or building coding agents. You cannot evaluate autonomy by asking whether the model "knows" the instruction boundary. The boundary has to exist outside the model.

## The product pressure goes the other way

At the same time, coding agents are being designed for longer-running, more convenient work.

OpenAI's May 2026 Codex update is a good example. [Codex now works from the ChatGPT mobile app](https://openai.com/index/work-with-codex-from-anywhere/), so users can review outputs, approve commands, change models, or start new work from a phone. The same announcement says Codex has more than four million weekly users and adds programmatic access tokens for CI, release workflows, and internal automations.

That is a normal product direction. Agents become more useful when they keep working while the human is away from the desk. They become more valuable when they can operate inside real development environments. They become easier to adopt when approvals move into the small gaps of the day.

But the security implication is not small. The more convenient the approval surface becomes, the more tempting it is to turn scope decisions into quick taps. The more agents run inside real environments, the more a "minor" extra action can matter.

This is why "the agent asked for approval" is not enough. Approval is not a magic word. If the user is approving from a phone while walking into a meeting, the product still needs to show what authority is being granted, what files are in scope, what commands are dangerous, and what can be rolled back.

Otherwise approval becomes theater. The human is present, but the boundary is still fuzzy.

## Treat autonomy like authorization

The better frame is simple: every autonomous coding action should be treated as an authorization event.

That does not mean every command needs a modal. That would make agents unusable. It means the system should separate three things that are often blurred together:

1. What the user wants done.
2. What resources the agent is allowed to touch.
3. What side effects require a fresh decision.

In a good agent product, "fix the failing test" is not a blank check to reorganize the repo. "Update the dependency" is not permission to rewrite unrelated build tooling. "Make the PR green" is not permission to weaken the assertion that caught the bug.

The harness should know that before the model starts. It should expose the allowed files, commands, network access, secrets, and write targets as a policy, not as a paragraph the model is expected to remember. It should make expansion visible: "This task now wants to edit outside the requested directory." It should make rollback cheap. It should log enough that a reviewer can see not just the final diff, but the path the agent took to get there.

This is less glamorous than benchmark wins. It is also where a lot of the real product competition will move.

## The counterargument is fair

There is a reasonable objection: careful teams already have git, CI, code review, branch protection, and secrets controls. Maybe overeager behavior is annoying, not dangerous. Maybe strong repo hygiene turns most extra actions into visible diffs that humans can reject.

Sometimes that is true. For low-risk code changes in a well-isolated branch, the damage from overeager behavior may be small. A reviewer can catch the unrelated file edit. A test can catch the broken assumption. A branch can be thrown away.

But that is not the environment product teams are racing toward. Agents are moving from "generate a patch for review" toward "operate across tools, environments, and workflows." They are getting remote access, mobile approvals, hooks, programmatic tokens, and enterprise integrations. The moment the agent can touch a deployment workflow, a customer-support system, a data export, or a private package registry, "extra but helpful" stops being a style issue.

It becomes a permission failure.

## The useful agent says no to itself

The highest-status agent demo is still the one where the model does more: more files, more tools, more steps, more initiative.

That is the wrong default signal. In maintained software, a better agent is often the one that stops earlier. It asks before expanding scope. It refuses the convenient cleanup. It preserves the failing test instead of "fixing" it away. It explains that the requested task cannot be completed without touching a second system.

The agent does not need to be less capable. It needs to be less presumptive.

Here is the prediction worth tracking: by the end of 2027, serious coding-agent evaluations will include scope-control metrics next to task-completion metrics. A product that solves the issue while touching fewer unauthorized surfaces will be considered better, not merely more cautious.

If that does not happen, agent adoption will still grow. But the review burden will grow with it. Teams will discover that they did not hire a tireless junior engineer. They hired a tireless employee with unclear permissions.
