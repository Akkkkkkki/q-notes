# Human-voice playbook (EN + 中文)

Why our published posts read as machine-written, and the concrete habits that prevent
it. This is about sounding *human*, not about imitating one specific persona — the
voiceprint (`research/voice.md`) handles the author's identity; this file handles the
baseline texture any human writer has and current drafts lack.

Consumers: the **drafter** runs the human pass (§4) as a revision step on every draft,
in both languages; the **ship gate** spot-checks against the tells in §1 and flags hits
as advisory questions, same as other voice flags. The author edits this file freely.

The one-line version: **don't let a sentence through unless it's the way you'd say it
to a smart friend.** Everything below is that rule, made checkable.

## 1. Diagnosis — the tells in our own published posts

These are quoted from posts live on the site as of July 2026. None of them is "wrong."
The problem is the density: each device appears in every section of every post, which
produces the even, airless rhythm readers clock as machine writing.

**The corrective pivot, stacked.** "It is not X. It is Y." and its cousins:

> "This was not a large jump in intelligence. It was a reduction in wasted movement."
> "That is not a clean victory or a clean warning. It is a bottleneck migration."
> "That is not glamorous. It is also where a lot of leverage will sit."

One per post is emphasis. One per section is a metronome. This construction is now a
documented signature of LLM prose — models reach for it no matter the prompt.

**Every paragraph lands an aphorism.** "Some speed is fake." "Cheap code is not useful
when it creates expensive cleanup." "Agents do not remove the work of reviewing and
combining changes. They send more work there." Each is fine alone. When every second
paragraph closes with a mic-drop line, none of them drops. Humans save the punch for
the one place it matters and let the rest of the prose just carry information.

**No contractions, ever.** The English posts say "do not," "cannot," "it is," "that
is" throughout. No human essayist writes this way; even formal writers contract in
running prose. This alone accounts for much of the stiffness.

**Template slots.** The closer "Here is the prediction: by the end of 2027..." appears
nearly verbatim across posts. The prediction is good editorial policy; the fixed frame
around it is a template a reader notices by the second post.

**Rhetorical-question volleys.** "How often did a task wait for a refactor? How often
did two competing designs go to a human? How many PRs were stopped early?" Humans ask
one question and answer it. A run of unanswered questions is a model filling space.

**Uniform burstiness.** Paragraphs run 1–3 sentences each, sections all follow the same
claim → evidence → aphorism shape, sentence lengths cluster tightly. Human prose is
lumpy: an aside, a long winding sentence, a two-word paragraph. Predictable rhythm at
every scale is the single most machine-detectable property of a text.

**Nobody home.** Across the recent posts the author appears exactly once ("I expect").
No scene, no firsthand detail, no "I watched a team do exactly this," no earned doubt.
The posts read as very good literature reviews — because that's what they are. This is
the root cause, not a style bug: **`research/voice.md` is still empty scaffolding**
(every stance and signature move is commented out), so the drafter has no human
material to carry and fills the space with competent synthesis. Style rules below help,
but nothing substitutes for the author's stances, phrases, and firsthand details
actually existing in the voiceprint and interview answers.

**Fabricated intellectual autobiography.** A different failure the tells above don't catch,
because the prose is clean and the scene isn't invented — the *mental history* is. A real
draft (PR #62) wrote: "I used to buy that story. What actually forces a gate like this, I've
come to think..." The interview behind it had strong material — a line about verification
theater, a client codebase that turned into "a disastrously messy entangled myth," an
explicit "I don't know hardware" boundary — but no author-supplied "I used to believe X, then
changed my mind" story. The sentence reads as a human voice; it is synthetic authorship. See
`docs/pipeline.md` §10 for the ownership model this feeds.

**中文版的对应问题。** 中文版语法干净，但骨架仍是英文：句序、段落节奏、每段结尾的
金句位置都与英文版一一对应，读起来像高质量译文而不是中文写作。中文的"AI 味"
本质上就是翻译腔，病根在句子结构，不在用词：万能动词（进行 / 作出）、
"在……的情况下"式的介词架子、前置长定语、多余的"被"、逻辑每一步都靠"然而"
"因此"标出来（中文靠语序就够了），再加上和英文版完全同步的警句节奏与英文式的
分号冒号。一个已经踩过的坑：往欧化句子上撒"说白了""其实"之类的口语词治不了
翻译腔，只会更刻意——"公平地说"这种词本身就是 to be fair 的直译。

## 2. What the best tech blogs do differently

Practices worth borrowing, from writers whose blogs people actually read for pleasure.

- **Paul Graham / YC: write like you talk.** His stated method: write a normal draft,
  then interrogate every sentence — "Is this the way I'd say this if I were talking to
  a friend?" If not, replace it with what you'd say. He reads essays aloud before
  publishing and fixes anything that doesn't sound like conversation. Informal language
  is "the athletic clothing of ideas." Short words, contractions, direct address.
- **Ben Horowitz / a16z: personal experience as evidence.** Posts open with a story or
  a rap lyric and argue from "when I was CEO of Opsware, this happened." The authority
  comes from having been there, not from citation density. Data supports the scar
  tissue; it never replaces it.
- **Ben Thompson / Stratechery: first-person reasoning, shown.** Authoritative "I
  think" voice, strong opinions weakly held, and — crucially — he shows the reasoning
  path, including where he changed his mind or got it wrong before. Recurring named
  frameworks (Aggregation Theory) reward regular readers; that's our glossary-keyword
  move, validated.
- **Patrick McKenzie / Bits about Money: dry asides and ruthless specificity.** Humor
  lives in parenthetical asides and footnotes, never in the thesis. Claims come with
  named companies, real numbers, and "I did this myself" detail.
- **Julia Evans: honest confusion.** "I was confused about X for years; here's what
  finally made it click." Admitting confusion and delight is the most human register
  available to a technical writer, and it costs nothing in authority.
- **阮一峰（科技爱好者周刊）：短句、白话、第一人称。** 中文技术写作的常青样本：
  句子短，用词平，直接说"我觉得""我最近看到"，不排比，不升华，结尾常常就停在
  事实或一个具体链接上。可读性来自克制，不来自修辞。

The common thread: these writers are *present* in their prose (experience, doubt,
humor), and their rhythm is irregular because it follows thought, not template.

## 3. Borrowed practices, as rules

### Both languages

1. **The talk test is the master rule.** Every sentence must survive "would I say it
   this way to a smart friend?" Run the draft aloud (or subvocalize) once, end to end.
2. **Ration the signature moves.** Corrective pivot ("not X, but Y"): at most one per
   post. Aphorism/mic-drop closers: at most one per section, and at least two sections
   should end on plain information instead. Unanswered rhetorical questions: at most
   one per post.
3. **Vary the rhythm on purpose.** At least one one-sentence paragraph, at least one
   genuinely long paragraph, sentence lengths that don't cluster. If every section has
   the same internal shape, restructure one.
4. **No template slots.** Predictions stay where the tier calls for one (the Essay
   checklist requires a falsifiable statement; Notes and Trackers don't — never add a
   prediction just to fill the slot), but the framing sentence must differ from the
   last three posts. Same for openings.
5. **Person on the page — never faked.** Each piece should carry at least one
   first-person moment: a firsthand detail, an earned doubt ("我不确定这个判断完全对，
   但……"), a reaction to the evidence ("what surprised me in this paper was...").
   These must trace to author input, like every opinion. If the interview answers
   contain no such moment, that's an interview gap to flag in the PR body — **never
   invent a scene or anecdote**. A traceable "this is the part I find hard to believe"
   beats a fabricated client story every time. This extends to mental history: "I used
   to think...", "I've come to think...", "I changed my mind...", "what convinced me
   was...", "the correction came when..." are factual claims about the author's past
   beliefs, not sentence-level style — write them only when the source material
   actually contains that change-of-mind story (`docs/pipeline.md` §10).
6. **Casualness budget.** One or two light touches per piece — an aside, a dry joke,
   a parenthetical — where they occur naturally. Zero is stiff; three is trying.

### English

7. **Contract by default.** "Doesn't," "it's," "that's," "won't." Expand only for
   deliberate emphasis (at most once or twice a piece).
8. **Plain connectives.** "But" and "so" over "however" and "therefore," including at
   sentence start.
9. **Kill the LLM lexicon.** Never: delve, underscore, intricate, crucial, pivotal,
   robust, landscape, leverage (verb), "it's important to note," "in today's
   fast-paced world." (Extends the voiceprint never-list.)

### 中文

10. **从想法重写，不从英文句子翻译。** 转写中文版时，先合上英文版，凭论点和事实
    清单重写；写完再对照检查 claim parity。句子结构与英文版对得越齐，翻译腔越重。
11. **拆链成饼。** 思果的比喻：英文长句是链条，环环相扣；中文是糕饼，一块一块。
    多用句号，分句短，靠语序衔接（中文重意合）。少用分号，冒号后面别挂一长串。
    句序能表达的逻辑，连接词直接删——不必每一步都写"然而""因此""此外"。
12. **过一遍欧化清单（余光中）。** 万能动词还原：进行研究→研究，作出反应→反应
    热烈；名词化还原为动词："有很多问题存在"→"问题很多"，"造成 98 人死亡"→
    "死了 98 人"；删介词架子："在……的情况下""当……的时候""基于""关于"；
    "被"字能省就省，受事可以直接做主语（"饭吃完了"）；慎用"之一""们""性"；
    前置长定语拆开或缩短（"只有在团队里待了很久的人才懂的部分"→"老成员才摸得清
    的角落"）。
13. **口语词不能撒。** "说白了""其实""换句话说"治不了翻译腔：欧化句子加口语词
    只会更刻意。先把句子改成中文骨架，语气自然就对了。语气词同理——结构对了才会
    偶尔自然出现，不当调味料加。也不排比、不升华：三句一组的排比和把技术观察拔高
    成人生道理的结尾，都是中文 AI 味的标志。结尾停在具体的预测、事实或问题上。

## 4. The human pass (pre-publish checklist)

The drafter runs this as a named revision step after the draft is complete, per
language. The ship gate spot-checks the same list; hits are advisory questions, never
blockers — except that an unambiguous fix (a contraction, a deleted 空转词) is just
made directly, like other mechanical fixes.

- [ ] Read the piece aloud once; rewrite anything you wouldn't say to a friend.
- [ ] Corrective pivots ≤ 1; unanswered rhetorical questions ≤ 1; at least two
      sections end on plain information, not an aphorism.
- [ ] Rhythm is lumpy: paragraph lengths vary; one long paragraph and one very short
      one exist; no two adjacent sections share the same internal shape.
- [ ] Opening and closing don't reuse the framing of the last three posts.
- [ ] EN: contractions used by default; no LLM-lexicon words.
- [ ] 中文：不是英文句子的对齐翻译；句子是中文骨架——无"在……的情况下"式介词架、
      无万能动词和名词化、无前置长定语、"被"字省得掉就省；多用句号，少用分号，
      连接词能删则删；无排比、无升华句；口语词只在整句本来就口语时出现，不是撒
      上去的。
- [ ] At least one traceable first-person moment (or the gap is flagged in the PR
      body); nothing firsthand is invented.
- [ ] Every "I used to think" / "I've come to think" / change-of-mind sentence traces to
      an author-supplied history, not to narrative glue connecting a model-built claim.
- [ ] One or two natural light touches; none forced.

## 5. What the linter checks, and what it can't

`scripts/content-gate.mjs` now enforces the countable half of §3 so the rules don't
depend on the same model that wrote the draft noticing it broke them. Run
`node scripts/content-gate.mjs <file>` before opening a PR. Everything below is a
**warning**, never a merge blocker — the thresholds are calibrated against our own
published posts so a hit means something real rather than background noise.

| Rule | Threshold | Corpus before the July 2026 voice pass |
|---|---|---|
| Contractions by default (§3.7) | contractions ≥ half of contractible spots | 6 of 9 posts failed (0.00–0.11) |
| Corrective pivots (§3.2) | ≤ 1 per post, counted per paragraph | 4 posts at 2–3 |
| Rhetorical-question volley (§3.2) | no run of 3; ≤ 3 questions total | 3 posts failed |
| Lumpy rhythm (§3.3) | sentence-length variation ≥ 0.45 | all passed (0.53–0.74) |
| Paragraph shape (§3.3) | spread ≥ 3 sentences, one paragraph ≤ 2 | 1 post failed |
| Never-list and marketing words (§3.9) | zero | all passed |
| "leverage" as a verb (§3.9) | zero | 1 post ("leveraging armies of MBAs") |
| Nominalisations, stiff connectives | zero | all passed |
| One name for one thing | a coined term is reused, not just defined | all passed |
| 长句 / 万能动词 / 翻译腔模板 (§11–13) | see the zh thresholds in the script | 9 hits across 5 zh posts |
| Mental-history claim ("I used to think...", 我以前认为…) | flag every hit, capped at 3 | 1 post (`taste-is-a-bet`, a real author correction) |

Every one of those is now clear. That pass is the "after" column: 26 style warnings across the
eighteen published files, down to zero, with every number and source link byte-identical.

**Why these thresholds are trusted.** Commit `Apply the human pass to the two most
recent posts` (2026-07-17) ran §4 by hand over two posts and nothing else, which makes
a clean before/after on identical content. The lint reports six warnings on the
pre-pass versions and two on the post-pass versions: both contraction warnings and the
question volley cleared, and the two survivors are paragraph shape, which that pass
never addressed. Across the whole corpus the contraction check partitions the nine
posts exactly along "did a human pass touch this file" — 3 for 3 and 6 for 6 — with no
knowledge of the git history. The lint agrees with the human editor where the editor
looked, and catches what the editor skipped. That is the case for automating it.

What it can't check, and what the ship gate and the author still own: whether a
sentence survives the talk test, whether the first-person moment is real or invented,
whether an opening reuses a recent frame, and whether the 中文版 was rewritten from the
argument or aligned to the English sentence by sentence. The lint removes the form of
slop. It cannot tell you the piece is worth reading.

**On Simplified Technical English.** The lint borrows ASD-STE100's method — a
self-lint of numeric rules rather than an instruction to write well — and two of its
word rules (use the verb, not the nominalisation; ban marketing adjectives). We
deliberately reject the rest. STE bans contractions and caps sentences at 20–25 words
with a six-sentence paragraph maximum, which produces exactly the even, airless rhythm
§1 diagnoses as our core problem. STE is written so a mechanic can follow a maintenance
procedure under time pressure; uniformity is the goal there and the failure mode here.
Our burstiness check is that cap inverted: it fails prose that is *too* even. Use strict
STE for runbooks and error messages (`docs/ops-runbook.md`), never for a post.

## Sources

- Paul Graham, [Write Like You Talk](https://www.paulgraham.com/talk.html) and
  [Writing, Briefly](https://www.paulgraham.com/writing44.html)
- Wikipedia, [Signs of AI writing](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing)
  — the most complete catalog of LLM prose tells (lexicon, negative parallelism,
  rule-of-three, section-summary habits)
- iMEdD Lab, [How AI-generated prose diverges from human writing](https://lab.imedd.org/en/how-ai-generated-prose-diverges-from-human-writing-and-why-it-matters/)
  — uniform sentence length / low burstiness as the measurable machine signature
- 余光中，[《怎样改进英式中文？——论中文的常态与变态》](https://www.translators.com.cn/archives/2007/10/1071)
  — 欧化病症的原始清单：万能动词、名词成灾、"之一"、"被"字、的的不休、前置长定语
- 思果，《翻译研究》——"翻译要像中文"；英文长句是链条，中文是糕饼，拆链成饼
- [欧化中文（维基百科）](https://zh.wikipedia.org/zh-cn/%E6%AD%90%E5%8C%96%E4%B8%AD%E6%96%87)
  — 病症的系统整理；形合（英文靠连接词）与意合（中文靠语序）的差别是拆句的理论根据
- 中文写作社区对"AI 味 = 翻译腔"的分析，如
  [写作中的 AI 味是哪儿来的](https://yage.ai/share/ai-chinese-translationese-20260418.html)、
  [中文去 AI 味写作指南](https://www.jamecling.com/archives/1175)
- Stratechery [About](https://stratechery.com/about/); Ben Horowitz, *The Hard Thing
  About Hard Things* (blog-first chapters); Bits about Money; jvns.ca; 阮一峰的网络日志
