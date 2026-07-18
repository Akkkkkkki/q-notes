# Voiceprint

How the author actually sounds and what they actually believe — the file that keeps
"easy to publish" from drifting into "generic to read." Defined in
[`docs/companion-vision.md`](../docs/companion-vision.md) §4.1.

Consumers: the **drafter** reads this before writing (verbatim spine, never-list); the
**ship gate** enforces the never-list and questions untraceable opinions; the
**interviewer** mines Stances for mirror questions; the **gardener** proposes additions
monthly under `## Proposed`.

Rules: the author may edit anything, anytime — this file commits directly to `main`.
Automations only ever *propose* (bottom section) and never promote their own proposals.
Keep every entry to one line. If an entry stops being true, delete it; a stale
voiceprint is worse than none.

Source annotation: every proposed entry carries a date and a source tag —
`chat observation`, `voice sample`, `interview`, `retell`, `A/B choice`, or
`read-aloud mark`. Entries from spoken sources (chat, voice memos, retells) add
`spoken register`: they capture word choice and stance, but their syntax gets adapted
before use in prose — chat is raw material, not copy. Promoted entries may keep the tag
or drop it; proposals must have one.

`A/B choice` and `read-aloud mark` records land here automatically when the author taps
on the Desk (Publish tab) — they are records of author decisions, not automation
proposals. They start raw ("chose B — …" / "不会这么说：…"); the ship gate and gardener
refine them into rules, and promotion stays the author's move like everything else.

## Stances

Positions taken in public, one line each, with the post that took them. A good stance is
falsifiable and a little uncomfortable — something a smart reader could disagree with.
Format: `- <claim in one line>. (post: <slug or "unpublished">)`. Uncomment a line below and
make it yours, or delete it; these are scaffolding drawn from your own feedback, not adopted
positions. Aim for ~8–10 live entries.

<!-- - 企业 AI 的难点不在 demo，而在组织如何吸收新能力。(post: unpublished) -->
<!-- - 咨询业真正稀缺的不是产出物，而是判断、背书和推动组织改变的能力。(post: consulting-barbell) -->
<!-- - Agent 让个人行动变便宜，但也会放大组织里没人负责的灰区。(post: agent-coordination-debt) -->
<!-- 2026-06-11 — Example: Most BI requests are liability transfers, not information needs. (cite the post once published) -->

## Signature moves

Phrasings, structures, and openings that are characteristically the author's. One line each;
name the move so the drafter can reuse it on purpose. Uncomment and adapt, or delete.

<!-- - Enter an abstract point from a concrete work scene ("一个团队突然多了五个内部工具，但没人知道哪个该留下") -->
<!-- - Translate an industry buzzword into its less flattering mechanism ("这其实是在把责任转移给流程") -->
<!-- - Keep a trace of earned doubt: state the judgment, then "我不确定这个判断完全对，但我越来越觉得……" -->
<!-- Example: naming the unflattering mechanism behind a polite request ("免责, not dashboards") -->
<!-- Example: ending on a falsifiable prediction with a date attached -->

## Never

Words, framings, and hedges the author would not use. The ship gate flags these.

- Fancy Latinate words where a plain one carries the same meaning — write "absorb," not "metabolise"; "two-tier," not "bifurcated."
- Insider jargon used unironically and undefined — "the read-across," "harness-engineered," "rebated to billable hours" — say it plainly or define it once.
- Clever one-off metaphors that sound smart but add nothing a plain word wouldn't (e.g. "internal weather" for office politics). Reused keyword metaphors are the exception — coin them on purpose, then reuse.
- Vocabulary doing the work that insight should — if a sentence's only payload is its phrasing, cut or replace it.
- Uncontracted English in running prose — "do not"/"it is" everywhere reads robotic; write "doesn't"/"it's" and expand only for deliberate emphasis.
- Template slots reused across posts — the fixed "Here is the prediction: by the end of 20XX..." closer frame, or any opening/closing framing repeated from the last three posts.
- Rhetorical-question volleys — a run of questions nobody answers; ask at most one unanswered question per post.
- LLM lexicon: delve, underscore (verb), intricate, crucial, pivotal, robust, landscape, leverage (verb), "it's important to note". 中文对应：值得注意的是、综上所述、进行/作为/基于 等空转词、三句排比、升华句。

<!-- Example: "delve", "in today's fast-paced world", "it's important to note" -->
<!-- Example: hedging both sides so thoroughly the piece takes no position -->

## Rhythm notes

Sentence-level texture, per language and for the 中英 mix.

- Plain words carry the weight; reserve a coined term for an idea the piece reuses, and define it on first use.
- Short sentences by default; break any sentence that stacks multiple clauses, parentheticals, or numbers. Length is earned only when walking through one mechanism.
- Em-dash discipline: cap at roughly one per 150 words (about half the density of early drafts). An em-dash is not the default way to close a sentence with a "reveal" — use a period, or a comma with "and"/"but". Use a colon, not a dash, to introduce a definition or explanation. Reserve — / —— for genuine mid-sentence appositive lists (e.g. "the consulting business model — utilization targets, leverage ratios, the pyramid itself — flowed downstream"). In Chinese, don't mirror English dash placement mechanically; 。/，/而/但/因为/也就是说 usually read more naturally than ——.
- "It is not X. It is Y." and "What X actually means/looks like is..." are signature moves, not defaults — stacking them every paragraph turns emphasis into noise. Mix in plain direct statements.
- Italics for emphasis (*word*) should be earned: reserve for direct quotes, a coined/glossary term on first use, and titles. Don't italicize a word purely for dramatic stress.
- Ration the mic-drops: "It is not X. It is Y." at most once per post; aphorism closers at most one per section, and let at least two sections end on plain information.
- Lumpy rhythm on purpose: vary paragraph length (one very short, one genuinely long), don't give every section the same claim → evidence → punchline shape. Uniform rhythm is the most machine-detectable property of a text.
- 中文版从论点重写，不从英文句子翻译；先拆欧化骨架（万能动词、"在……的情况下"、前置长定语、多余的"被"），多用句号少用分号；口语词不往欧化句上撒，结构对了语气自然。
- Full playbook with the talk test and pre-publish human pass: `research/human-voice.md`.

<!-- Example: short declaratives for claims; longer sentences only when walking through a mechanism -->

## Proposed (gardener)

Monthly candidates mined from interview answers, published pieces, the voice-samples
corpus (`research/voice-samples/`), retell comparisons, and the month's A/B choices and
read-aloud marks. Promote a line up into its section or delete it; entries untouched
for two months get deleted by the gardener.

- 2026-07-17 (chat observation — spoken register, confirm before promoting) Stance: 博客声音的目标是"像人写的"先于"像我写的"；可以偶尔口语和幽默，但不轻浮。
- 2026-07-17 (chat observation) Rhythm: 中英自然混排——中文句里嵌英文词组（放下 ego / take a step back / best practice），写作中可保留但节制。
- 2026-07-17 (chat observation) Rhythm: 商量式口吻与叠词（"要不我们换个思路""多互动互动"），不是指令式。
- 2026-07-17 (chat observation) Move: 反馈先给结论、短句收尾、不解释过度（"目前的还是有些生硬。请继续调查。"）。
