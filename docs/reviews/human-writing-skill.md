# Review — the `human-writing` skill (KKKKhazix/human-writing v1.1.0)

Reviewed 2026-08-05 against our own pipeline (`docs/pipeline.md`), the human-voice
playbook (`research/human-voice.md`), the voiceprint (`research/voice.md`), and the
content gate (`scripts/content-gate.mjs`).

## What it is

A Chinese-only writing skill: `SKILL.md` plus five reference files (forum prose,
reality/fact-checking, fiction, formats, revision), a distilled paste-in version, and a
639-line Python linter (`scripts/check_prose.py`). Its default register is the Chinese
long-form forum post — 知乎回答, 论坛长帖, 公众号. Both 1.0.0 and 1.1.0 shipped on
2026-08-05, so it has no track record, and one threshold is justified by a citation
("CCL 2023 人机中文对照研究") we haven't verified. Treat every number in it as a
starting guess, not a calibrated one — the same standard we held ourselves to in
`research/human-voice.md` §5.

## Verdict

We already have the better half of this. Our diagnosis of AI slop is more specific than
theirs (§1 of the human-voice playbook names the tells in our own published posts), our
enforcement is wired into CI, and we cover both languages. What the skill has that we
don't is **a stricter, more mechanically detectable model of Chinese slop**, and one
structural idea we're missing entirely.

Concrete test: we ran their linter over all ten published `.zh.md` posts, then ran our
own gate over the same files. Ours reported zero style warnings. Theirs found 20
corrective pivots, 46 insight signposts, four three-way parallel runs, and 51 sentences
where four or more 的 push the subject and verb past the reader. Those are real defects
in shipped work, and our gate is blind to all of them.

So: take the detectors, take one workflow rule, leave the register and the philosophy.

## Absorb

### 1. The material count before drafting (the one big idea)

Their strongest rule has nothing to do with prose. Before writing anything over ~1,200
characters, list at least five specific pieces of material — an action, a number, a
date, a quote, a failure, a consequence — and name where each came from. Fewer than
five and you don't get to write the long version: research more, ask up to three
questions, or ship something shorter. "Explaining the same three abstract points four
ways" does not count as material. Neither does a plausible-sounding invented example.

This is the direct fix for the root cause we already named ourselves: "the posts read as
very good literature reviews, because that's what they are." Our drafter's fallback
ladder decides *which tier* to write based on whether a brief is signed off, but nothing
checks whether there's enough concrete material to fill 800–1,500 words once it starts.
An Essay-length slot with Note-sized material is exactly how you get competent synthesis.

Proposal: add a material inventory to the drafter as a gate, not a suggestion. Count the
traceable specifics from the interview and research; under five, drop a tier and say so
in the PR body. Length is the target, material is the floor.

### 2. Pivot detection that actually fires

Our gate has a zh check for 不是…而是. It has never fired, on any post, ever. The regex
is `不是[^，。、]{1,20}而是` — the character class excludes the comma that nearly every
real instance contains. Nineteen live instances in `src/content/posts/`, zero detected.
Their patterns catch the comma form, the cross-sentence form (`。而是`), 并非…而是,
不在于…而在于, 与其说…不如说, and the dropped-而 variant (不是A，是B).

Fix the regex, and mirror the English budget: our rule is ≤1 corrective pivot per post,
and the zh side should be held to the same number rather than the current ≥3 threshold
that never triggers anyway.

### 3. 洞察路标 — the insight signpost

Phrases that promise depth in place of delivering it: 真正…的是, 本质上, 这意味着,
更微妙的是, 值得注意的是, 还有一层, 从某种意义上说. We have no zh check for these at
all. Their linter counts 46 across our corpus, 14 in `consulting-outcomes.zh.md` alone.
This is the Chinese cousin of the English template-slot problem we already police.

### 4. 重定语句 — four or more 的 before the verb

A long sentence with four-plus 的 usually means a stacked pre-modifier and a subject the
reader reaches too late. This is 余光中's 前置长定语, which our own playbook already
names in §12 — as prose guidance only. Their check makes it countable, and it fires 51
times across our posts (18 in `consulting-coordination.zh.md`). Our zh gate measures
sentence *length* (>90 Han chars) but not 的-stacking, so a 60-character sentence with
five 的 sails through.

### 5. 同构排比 — three-plus parallel clauses

`AGENTS.md` says 不排比. Nothing enforces it. Their check finds runs like
"更多文件、更多工具、更多步骤、更多主动" and caps at two. Cheap to port.

### 6. Part of the jargon list

赋能, 抓手, 降本增效, 底层逻辑, 顶层设计, 组合拳, 全链路 — consulting-Chinese filler
that we're unusually exposed to given our topics. One already shipped (赋能 in
`consulting-coordination.zh.md`). Take the obvious ones as hard fails.

Not the whole list. 技术底座, 技术主权, 单点风险 are legitimate vocabulary in an
AI-policy post; they belong in the context-check bucket, not the ban list.

### 7. Two prose rules worth stealing verbatim

- **假具体.** Precise times, weather, expressions, room details with no source are fake
  detail, and the more specific the fake detail, the more machine-written it reads. We
  say "never invent a scene"; they explain why it backfires.
- **Don't repair anonymity with pronouns.** Adding 我觉得 / 说真的 doesn't create a
  voice; the voice comes from what you chose to include. This is the same trap our
  playbook flags for 口语词 ("撒口语词治不了翻译腔"), extended to first person — and
  worth stating, because "add a first-person moment" is exactly the instruction a model
  will satisfy the lazy way.

## Absorb with changes

**Their tone is absolute; ours shouldn't be.** Every one of these lands in our gate as a
warning, not a blocker, and every threshold gets calibrated against our own corpus
before it ships — the method from `research/human-voice.md` §5. Their linter fails a
draft outright on a colon. That's a fine choice for a single-author forum-post tool and
a bad one for a CI gate that has to run on someone else's essay at 8am Thursday.

**Keep the corrective pivot at one, not zero.** They ban 翻案腔 entirely, including
earned self-correction, unless it's rephrased out of every known form. Our voiceprint
lists "It is not X. It is Y." as a signature move rationed to once per post. Take their
detector, keep our budget. The failure mode we've actually observed is stacking, not
existence.

**Skip the script, port the checks.** `check_prose.py` is Python in a Node repo with its
own CI, its own thresholds, and no English coverage. Running two linters means two sets
of numbers to keep honest and one of them silently drifting. Port the four detectors
above into `scripts/content-gate.mjs` so the zh side finally has warnings with teeth and
we keep one gate, one report, one calibration table.

## Don't absorb

**The colon and dash bans.** Their linter flags 24–34 colons per post on our essays and
fails the draft. Our voiceprint says the opposite in as many words: "Use a colon, not a
dash, to introduce a definition or explanation." Their ban makes sense for a forum post
that should sound spoken. Ours are analytical essays with defined terms, source links,
and an English twin that uses the same punctuation. Adopting this creates hundreds of
warnings, all noise, and the first thing anyone does with a linter that cries wolf is
stop reading it. We already have a calibrated em-dash density rule; that stays.

**The forum register.** The default speaker is someone answering a 知乎 question, and
the reference file is built around it: 回答体, 长帖体, 楼主, worked examples about
buying a camera and 老周 opening a scooter repair shop. `AGENTS.md` puts us "slightly
more professional than personal." Their prose advice is good *for their register*, and
importing it wholesale would flatten ours toward a genre we deliberately didn't pick.

**"不建立长期作者画像，不生成个人规则库。"** The skill explicitly refuses to build an
author profile. That's the correct default for a general-purpose tool used by strangers,
and it is precisely backwards for us. Our documented root cause is that
`research/voice.md` was empty scaffolding, so the drafter had no human material and
filled the gap with synthesis. The voiceprint, the interview loop, and the gardener
exist to fix that. This clause is the single most incompatible line in the skill.

**Chinese-only.** There is no English coverage at all — no contraction rule, no LLM
lexicon, nothing. Half of every post we publish is English, and our English tells (no
contractions, template closers, question volleys) are the ones we measured and fixed.
This can supplement the zh half of our system. It cannot replace the system.

**The blanket ending rule.** They delete 时代/未来/世界 from any ending the body didn't
sustain. Our Essay checklist *requires* a falsifiable prediction, which routinely carries
a date and a horizon. Useful as an advisory nudge, wrong as a hard rule.

**`fiction.md`, `formats.md` (poetry/screenplay/口播), the distilled paste-in version.**
Not our surface area.

## What it can't fix

Their revision file admits it near the end, and it's the honest part: the script finds
shapes, not people. It can tell you a sentence is stacked, and it cannot tell you whether
the author actually believes the claim. Our own playbook reached the same conclusion —
"the lint removes the form of slop, it cannot tell you the piece is worth reading."

Which is why the material rule matters more than the other six items combined. The
detectors clean up 中文 texture that our gate genuinely misses today. But a post reads as
machine-written mostly because nobody is home, and the fix for that is the interview
answers, the traceable first-person moment, and the willingness to ship 600 words when
the material only supports 600 words.

## Suggested order

1. Fix the broken zh pivot regex. One line, nineteen live misses.
2. Port 洞察路标, 重定语句, 同构排比, and the safe half of the jargon list as warnings,
   calibrated against our corpus, with a before/after table like §5 of the playbook.
3. Add the five-material count to the drafter, with tier demotion as the consequence.
4. Add 假具体 and the pronoun-anonymity note to `research/human-voice.md` §3.
