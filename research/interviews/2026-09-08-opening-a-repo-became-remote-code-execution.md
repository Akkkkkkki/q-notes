# Interview: Opening a repo became remote code execution across seven coding agents

**Source:** backlog item 2026-09-07 — Opening a repo became remote code execution across seven coding agents
**Status:** Awaiting answers

## The idea in three sentences

GitSpawn shows the newest coding-agent attack surface isn't the model or the prompt — it's git's own decades-old `core.fsmonitor` setting, which let a repository's own config silently run an attacker-chosen command the instant seven major agents (Claude Code, Codex, Cursor, Goose, Hermes Agent, Qwen Code, Grok Build) refreshed its index on an ordinary `git status` or `git diff`, before any task, prompt, or diff existed to review. Manifold Security disclosed eight such flaws in the first days of September 2026, OpenAI shipped three of its own CVEs for the identical bug class the same day from three unrelated research groups, and as of the September 1 retest four of the eight flaws were still exploitable. The strongest counter is that exploitation needs the `.git` directory to survive intact — something an ordinary `git clone` strips out — so the real blast radius may be narrower than "seven agents affected" implies, and several vendors already shipped fixes inside a normal disclosure window.

## Questions

1. You use coding agents like this one daily. Before this disclosure, did you ever think twice about pointing an agent at an unfamiliar or forked repo — or did "it's just `git status`, not real work yet" feel safe by default?
   → I treat a fresh clone or unfamiliar repo as safe until I've actually read a diff
   → I've had a real scare with an untrusted repo or package before
   → push: reviewing the diff was always enough, because nothing was supposed to run before I approved anything

2. GitSpawn breaks before there's a diff to review — the code runs the moment routine bookkeeping touches the index. What's the boundary you'd actually want a harness to draw: never let an agent read an unfamiliar repo's own git config, sandbox all git plumbing by default regardless of trust, or something else?
   → the harness should distrust repo-local config the same way it distrusts repo-local code
   → this is a git problem, not an agent problem — fix it upstream and move on
   → or: some background command should just never be allowed to execute anything, full stop

3. Four of the eight flaws were still exploitable at the September 1 retest, and OpenAI, Manifold, and others found the same obscure setting independently in the same week. Is "several unrelated teams needed one disclosure to notice this" itself the interesting part to you, or is that just how the CVE process normally works and you don't read much into it?

4. In *Helpful agents are an authorization bug* you wrote: "The better frame is simple: every autonomous coding action should be treated as an authorization event." GitSpawn runs through git commands nobody consciously authorized — background bookkeeping the agent does just to see where it is, before any "action" exists to authorize. Does that frame survive here, or does the boundary need to move earlier, to trusting the repo's own configuration in the first place?

5. The fair counterargument: this could be one narrow, now-patched git quirk rather than a recurring pattern, since a normal `git clone` doesn't even preserve the vulnerable state and multiple vendors patched fast. What would it take for you to believe this is actually a recurring class — old, unaudited developer tooling becoming an unreviewed agent trust boundary — rather than a one-off embarrassing CVE?

6. （可跳过，2 分钟）用你自己的话，把 *Helpful agents are an authorization bug* 的核心论点讲给一个朋友听 — two or three sentences, any language，微信语音的随意程度就行。

## Author answers
_Answer in English, 中文, or both mixed. Fragments and voice-dump quality are exactly right — the drafter will do the structuring. 15–30 minutes is enough._
