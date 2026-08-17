# q-notes 编辑流程（中文版）

一个用来稳定产出中英双语笔记与文章的闭环系统：自动化负责所有重活，作者只提供唯一重要的东西——自己的观点。

> 本文是 [`docs/pipeline.md`](./pipeline.md)（英文，权威版本）的中文对照。如有冲突，以英文版为准。各阶段可直接运行的提示词在 [`automations/`](../automations/)；旧的 `.codex/automations/` 提示词已被本流程取代。

`docs/material-form.md` 是材料/形式的规范补充。`docs/editorial-critic.md` 定义独立编辑批评器：它位于起草与发稿闸之间，专门检查论点、范围、证据和自我新意是否真的由材料支撑。

---

## 1. 为什么之前的设置什么都没产出

话题侦察本身工作正常。它在 2026-05-28 和 2026-05-29 跑过两次，产出了 8 个研究充分的候选话题，然后系统沉默了。失败是结构性的，不是质量问题：

| 失败 | 机制 |
|---|---|
| **开环** | 想法流进 `research/backlog.md`，却没有阶段有义务把它们取出来。 |
| **默认跳过的起草者** | 起草者被告知“没有草稿好过一份弱草稿”，于是最理性的行为变成每次都跳过。 |
| **真实性缺口** | 草稿主要由外部来源合成，像信息聚合，不像作者自己的思考。 |
| **没有过期** | 有时效的话题永不过期，队列悄悄腐烂。 |
| **处处都要审核** | 连 backlog 元数据也走 PR，人工审批点太多。 |

下面每个设计决定都在补这些缺口。

## 2. 设计原则

1. **作者是声音；AI 是其余一切。** 自动化负责侦察、核查、访谈、结构、编辑和翻译。发表作品里的观点必须源自作者，不能由模型冒充作者补出来。
2. **流程永远产出它能诚实支撑的最小可发布物。** 任何阶段都不能静默跳过。短笔记胜过没有文章。
3. **每件产物都有时钟。** backlog 21 天过期；草稿 PR 第 7 天降级、第 14 天关闭。
4. **分层的完成定义。** 不再用一个隐含的“伟大文章”门槛来喂养完美主义。清单通过就发，进一步改善放在发表后。
5. **一篇作品一个 PR，两种语言都在里面。** 中英文共享主张和证据，不要求共享同一套提纲、标题或段落顺序。
6. **只有内容走 PR。** backlog、inbox、访谈、词表等研究文件直接提交到 `main`；人工审核留给真正会公开的文字。
7. **声音靠机制，不靠感觉。** `research/voice.md` 记录作者的立场、标志性措辞和禁用词；声音问题塑造作者的五分钟审核，但普通风格问题不拦住一篇材料与逻辑已经成立的稿子。
8. **“文章范围值不值得发”与“现在就发出去”分开审核。** 起草者天然会把稿子做完整；发稿闸天然负责抗完美主义与吞吐。所以中间加入独立的 03b 编辑批评器，只检查这份材料是否真的挣到了当前论点、范围、证据强度与形式。只有一个对当前语义草稿仍有效的 `KEEP` 才能进入 04 发稿闸。

## 3. 内容层级

| 层级 | 标签 | 长度 | 门槛 | 目标节奏 |
|---|---|---|---|---|
| **笔记** | `note` | 300–700 词 | 一个核心点 + 至少一个真正承重的具体例子、机制、亲历或案例。 | ≥ 2 / 月 |
| **文章** | `essay` | 800–1,500 词 | 多个独立承重材料相互作用，形成机制层面的论证。 | ≥ 1 / 月 |
| **预测追踪** | `tracker` | 不限 | 回看旧文里的可证伪预测，按新证据诚实打分。 | 有机会就做 |

历史长度区间是描述性范围和上限，不是最低字数。Note 的反面观点是条件性的，Essay 的预测也是机会性的；这些规则以 `docs/material-form.md` 为准。

frontmatter 还带成熟度：

- `maturity: seedling`：提前放出的想法，可能明显改变。
- `maturity: growing`：已有论证和来源，但仍开放。
- `maturity: evergreen`：作者按现状为它背书。

`seedling` 是成功，不是妥协。它让“暂时够好”成为对读者诚实的契约。

### 可选的阅读布局 frontmatter

只有在材料自然存在时才使用：

- `definedTerm: { term, pos, definition }`
- `prediction: { statement, confidence, falsifier, status }`
- `sources: [{ label, title, url }]`
- `connections: { linksTo: [translationKey], citedBy: [translationKey] }`

中英文保持语义一致；不要为了填结构而制造这些块。

## 4. 每周循环

作者总时间：**每周约 45–75 分钟**。其余全部自动化。

```text
周一  侦察 → backlog.md
周二  访谈者 → research/interviews/<date>-<slug>.md + 通知
周二–周四  作者倾倒（15–30 分钟，任何语言）
周四 08:00  起草者 → 中英双语 PR
周四 16:00  独立编辑批评器 → KEEP / CUT / DOWNGRADE / SPLIT / SKIP
周五 08:00  发稿闸 → 机械/清单裁决 + 作者 5 分钟批准
每月  园丁 → 统计、过期、旧文挖掘、批评器校准
```

### 4.1 周一 — 侦察（`automations/01-topic-scout.md`）

- **强制过期。** 超过 21 天的 live backlog 条目标记为过期。
- **锚定作者。** ≤3 个新候选里至少一个连接 `research/inbox.md` 里的想法或作者已明确采纳的立场。
- **寻找分歧。** 找一个当下、有质量、作者很可能不同意的观点，推动真正的原创思考。
- **直接提交到 `main`。** backlog 元数据不走 PR。

### 4.2 周二 — 访谈者（`automations/02-interview-brief.md`）

挑出最强的 live candidate，写访谈提纲：

- 候选论点与最强反驳；
- 五个尖锐问题，专门挖只有作者能补的东西：亲历、分歧、风险、判断、什么会改变想法；
- 空白 `## Author answers`；
- 可选 `→ ` 作答方向：它们是提示，不是作者的话。

作者可以用碎片、中英混排、错别字回答。`Ready to draft` 只代表作者同意这些材料可以用于公开写作，**不代表材料自动够写 Essay**。有答案但未 Ready 的 brief 最多只能作为 Note 材料，而且状态不能被自动改掉。

### 4.3 周四 — 起草者（`automations/03-drafter.md`）

起草者按回退阶梯选择材料诚实支撑的最高一级：

1. Ready brief → 先建 Author Kernel、重验外部来源，再选最小诚实形式；
2. 有答案但未 Ready → 最多 Note，优先等作者完成；
3. 没可用答案但 inbox 有好想法 → Note；
4. 都没有 → 合法的 Tracker 或与旧文后续相关的 Note；
5. 真正没有可发布物 → 留一份运行报告，不能静默。

任何正文之前，起草者都要建立：

- **Author Kernel**：只来自当前作者输入、`research/positions.md` 已采纳内容、或 `research/voice.md ## Stances` 明确晋升的立场；
- **Claim Ledger**：所有承重主张拿到稳定 `C1`、`C2`……ID，并分类成 `Q-explicit / Q-derived / External / Model-hypothesis`；
- **Material Audit** 与 **Form decision**：先判断材料密度，再定形式与层级；
- 双语共享同一语义材料包，但分别自然成文，最后按 Claim ID 做一致性检查。

起草者开一个 ready（非 draft）的 PR，并在 PR 正文保留 Material Audit、Form decision、Author Kernel、Claim ledger、Bilingual parity、Voice、Candidate hypotheses、A/B calibration 和中英各三个标题选项。

### 4.3b 周四 — 独立编辑批评器（`automations/03b-editorial-critic.md`）

它在草稿 PR 之后、发稿闸之前运行。它不是第二个起草者，也不是另一个机械检查器。它只问：

> 这篇文章现在的论点、范围、证据强度和形式，真的由作者与材料挣到了吗？还是模型把一个好想法补成了一篇更完整、更顺、更像“文章”的东西？

它读取中英正文、Author Kernel、Claim Ledger、Material Audit、Form decision、Candidate hypotheses，并把最近/最相关的 Q-notes 当作**历史与自我新意比较材料**。严格 v1 provenance 下，旧文章正文不能单独授权当前 `Q-explicit` 立场。

PR 对外只允许一个紧凑契约：

```md
## Editorial critic

<!-- q-notes: editorial-critic head=<full PR head SHA> -->

### Verdict
KEEP | CUT | DOWNGRADE | SPLIT | SKIP

### Strongest single idea
<一句话>

### Blocking reasoning failures
- <只有需要改变论点/范围/归属/证据/形式的问题>

### Required scope cuts / splits
- <哪些部分应离开，以及为什么>

### Optional warnings
- <确有价值时才写>
```

五种裁决：

- `KEEP`：当前范围已经挣到，可以进入发稿闸；
- `CUT`：核心成立，但有为了“完整”而存在的材料必须删；
- `DOWNGRADE`：材料更适合更小的公开形式，如 Essay → Note；
- `SPLIT`：至少两个有价值的点不该被包装成同一篇；
- `SKIP`：现在还没有值得单独发布的形状，或只是把旧框架套到新事件上，没有足够新的东西。

`CUT / DOWNGRADE / SPLIT / SKIP` 都是正常成功结果，不是自动化失败。

批评器先**独立判断，再编辑**。只有初始裁决已经发出后，它才可以在非常窄的情况下自己做纯减法修复：删除通用后半段、删掉没挣到的预测、Essay 降 Note 并裁掉无关段落。不能写新理论、补新证据、替作者做判断。任何语义修复后都要重新跑，并在新 head SHA 上留下新的结果。

批评器重点看：

- 最强单一想法到底是什么；
- 哪些章节在 Author Kernel / Material Audit / Claim Ledger 之外；
- 如果 mentally cut 20–30%，哪些只是“文章家具”；
- 文章真正的自然终点在哪里；
- 是否把 observation → root cause、correlation → mechanism、analogy → target-domain conclusion；
- 是否把 `tentative` / `domain-limit` / 未回答判断整理成了漂亮但未经作者拥有的结论；
- 是否只是把旧 Q-notes 框架套到新事件；
- 是否重复整篇文章的固定 choreography，而不是材料自然决定结构。

marker 把裁决绑到被审核的**语义草稿**。以下变化通常要求重新跑：论点、Claim Ledger、证据、Material Audit/Form decision、层级、主要章节、实质改变标题主张、采纳假说导致正文变化、预测/反驳/框架范围变化。纯 typo、格式、链接/build 修复、保持同一主张的声音修改，不必机械地再花一次模型审核；04 必须明确确认语义范围没变后才能沿用旧 `KEEP`。

`docs/editorial-critic.md` 是这一步的专门规范。#87–#97 后续落地时，其信号都汇入**同一个** #68 critic，不得给内容 PR 再堆一排顶级 audit section。

### 4.4 周五 — 发稿闸（`automations/04-ship-gate.md`）

发稿闸负责抗完美主义、机械就绪、作者反馈与吞吐，**不重新审判 03b 的范围判断**。

对每个开放内容 PR：

- **先处理作者反馈。** `One change`、A/B 选择、读稿标记、Voice keep/cut、Downgrade、Adopt/Reject hypothesis 都要先落地，再出新裁决。
- **要求最新适用的 critic verdict 是 `KEEP`。** 没有 critic、或最新适用结果是 `CUT / DOWNGRADE / SPLIT / SKIP`，都不能显示 Ready。若语义正文在 `KEEP` 后改变，回到 03b，而不是由 04 自己解释为什么“应该也没问题”。
- 跑 `docs/material-form.md` 修订后的 tier checklist。
- 按 Claim Ledger ID 跑中英一致性；顺序、标题、段落、长度不同不是 parity failure。
- 跑声音检查；普通声音/风格问题是 advisory，能安全修的直接修。
- 跑 ownership check；未采纳 `Model-hypothesis` 不能伪装成作者当前信念。若修复改变承重语义，再回 03b。
- PR >7 天 → 裁成最强单点 Note，然后让新版重新过 critic；>14 天 → 关闭并记录 kill。

所有检查通过后，04 才能发 `Ready to ship` 或受 7 天节奏约束的 `Ready — queued`。它只给作者手机可读的简短摘要，不重复 03b 的整套分析。

### 4.5 每月 — 园丁（`automations/05-gardener.md`）

每月一号：

- **吞吐报告**：按层级/语言发表数量、草稿到发表的中位天数、过期/终止、作者输入来源比例；
- **批评器校准**：初始/最终 `KEEP/CUT/DOWNGRADE/SPLIT/SKIP`、作者反转、critic KEEP 之后才出现的“太泛/需要真实例子/改成 Note”、发稿闸抓到的 stale KEEP、旧框架应用被改成 application Note/Tracker/skip 的数量；
- **旧文挖掘**：找已经可以检验的预测、被新事实证实/挑战的旧论点；
- **声纹维护**：从访谈、已发表内容、A/B 与读稿标记中提炼 1–3 条候选；
- **卫生**：词表、死链、backlog、重复/格式错误的 critic contract。

critic 的非 KEEP 比例不是 KPI。一个永远 KEEP 的 critic 可疑，一个永远 DOWNGRADE 的 critic 也可疑。真正看的是：作者后期“救稿”是否下降，同时好文章有没有被系统性缩小。

## 5. 完成定义

一篇作品在对应 tier checklist 通过，且当前语义草稿有适用的 critic `KEEP` 时才可以发。

**笔记**

- [ ] 一个可争论、可复述的主张，或一个确实有价值的未解决问题；
- [ ] 至少一个不可替代的具体例子、机制、亲历或证据案例；
- [ ] 作者归属和认知边界清楚；
- [ ] 普通读者能读懂，句子不堆满从句/统计/插入语；
- [ ] human-voice pass 已跑，中英文都不是模板化翻译；
- [ ] 中英按 Claim Ledger ID 语义一致；
- [ ] 没有未采纳 `Model-hypothesis` 被写成作者信念，也没有无来源的“我以前怎么想”；
- [ ] 对当前语义草稿适用的 Editorial critic verdict = `KEEP`；
- [ ] build 通过。

Note 的 counterpoint 是条件性的，不是固定槽位。

**文章**

包含 Note 的要求，并且：

- [ ] 多个独立承重材料确实支持多个章节；
- [ ] 论点有机制层面的支撑；
- [ ] 当下事实需要时有重新校验的来源；
- [ ] 真正 live 的最强反驳/边界被认真处理；
- [ ] 推测明确标成推测。

Essay 不要求为了 tracker fuel 强行加一个预测。

**预测追踪**

主任务是给旧的可证伪主张/预测诚实打分，链接原文，并说明新证据带来了什么。中英文都有。这就是门槛。

明确不在任何清单上的：作者重读五遍、每段都抛光、覆盖所有角度。如果材料、critic、机械检查都过了但作者仍犹豫，`maturity: seedling` 是约定好的泄压阀。

## 6. 双语设计（中英双语）

### 编辑契约

每一篇发表作品都有英文版和中文版，写成**转创（transcreation）而非直译**。共同真相来源是 Claim Ledger，不是两篇文章共用同一种结构。

- **含义必须一致**：论点、必需主张、事实、数字/日期、来源支撑、因果方向、立场/不确定程度，以及成熟度/公开含义。
- **每种语言独立决定**：主张顺序、章节结构/顺序、标题及数量、段落边界、开头/结尾、连接骨架、长度。
- **不设硬长度比例**：检查的是 Claim coverage，不是词数/字数。
- **受词表约束**：复用术语按 `research/glossary.md`。

### 共享材料包，独立成文

在任一种语言开始写正文前，先冻结：

- Author Kernel；
- Claim Ledger；
- 来源链接与事实支撑；
- source-confidence/domain-limit；
- glossary 决定；
- Material Audit 与 Form decision。

先用作者原材料更偏向的语言自然起草。第二种语言从同一共享材料包 clean-room 成文，不照着第一版句子/章节顺序翻。两篇都存在后再按 Claim ID 做 parity。

结构恰好相同并不自动错误；过度整齐的 1:1 镜像只是一个值得检查的信号。

### 按 Claim ID 检查一致性

Parity 意味着：

- `Required in: EN + ZH` 的 claim 两边都有；
- 数字/日期一致；
- 来源支撑同一个事实；
- 因果方向不反转；
- 立场/不确定性等价；
- `Model-hypothesis` 不会只在一边悄悄变成已采纳立场。

不意味着 claim order、标题、段落、反驳位置、开头结尾、长度必须一致。

```md
## Bilingual parity

| ID | Claim | EN | ZH | Notes |
|---|---|---|---|---|
| C1 | <简短主张> | ✅ | ✅ | 中文先给结论，再补背景 |
| C2 | <简短主张> | ✅ | ✅ | 英文单独成段 |
```

证据例子两边保留，除非 ledger 明确标可选；纯修辞例子可以各自本地化，但不能增加事实、改变论点或虚构亲历。

### 内容模型（Phase 2，独立 PR）

目标：

1. `src/content.config.ts` 加 `lang: z.enum(['en', 'zh'])` 和 `translationKey`；
2. 文件变为 `<translationKey>.en.md` / `.zh.md`；
3. 英文 URL 保持 `/posts/<slug>`，中文 `/zh/posts/<slug>`；
4. 英/中各自 RSS；
5. 校验 CJK 排版；
6. 回填现有文章中文版。

Phase 2 之前，中文草稿继续停在 `drafts/zh/<slug>.md`，避免被英文 collection 意外发布。

## 7. 捕获作者自己的想法

`research/inbox.md` 是无摩擦捕获文件，一行一个想法。可以直接从 GitHub 手机端编辑，也可以经笔记/语音连接器同步。

侦察和起草者把 inbox 想法当作一等材料：一个半成形的作者原创想法，按政策高于一个打磨过的外部聚合品。

`research/voice.md` 捕获作者**怎么说**；`research/positions.md` 捕获作者**明确采纳了什么**。两者不要混在一起。

## 8. 执行：接线这些例程

`automations/` 里的文件都是自包含提示词，交给具备 repo/PR 权限的定时 agent。写好 markdown **不等于排好了班**。

| 例程 | 作者本地时间 | Cron（UTC） | 网络 | 通知 | 写入 |
|---|---|---|---|---|---|
| 01 话题侦察 | 周一 08:00 | `0 0 * * 1` | 是 | 否 | `main` |
| 02 访谈提纲 | 周二 08:00 | `0 0 * * 2` | 轻 | 是 | `main` + 通知 |
| 03 起草者 | 周四 08:00 | `0 0 * * 4` | 是 | 否 | PR |
| 03b 编辑批评器 | 周四 16:00 | `0 8 * * 4` | 按需 | 否 | PR critic comment / 窄范围纯减法修改 |
| 04 发稿闸 | 周五 08:00 | `0 0 * * 5` | 否 | 是 | PR 评论/编辑 + 通知 |
| 05 园丁 | 每月 1 日 09:00 | `0 1 1 * *` | 轻 | 是 | 提交 + 通知 |

Cron 仍按文档现有假设 `Asia/Shanghai`（UTC+8）计算。若作者时区改变，需要一起重算。

每次触发都开**全新会话**。03、03b、04 都需要 GitHub repo + PR 权限；03 与 03b 在当前来源/归档验证需要时还需要网络。第一次实际触发后必须核验它真的能评论/编辑，而不是只看“例程已创建”。

启动顺序：第一周 01 + 02；第二周有答案后加入 03 + 03b + 04；第一个月后加入 05。旧 `.codex` 例程全部停用。

### 硬闸：Content gate CI

03b 和 04 都是 prompt-based review，所以 `.github/workflows/content-gate.yml` 继续承担不可跳过的机械硬闸：`scripts/content-gate.mjs` + `npm run build`。在 `main` 分支保护里把它设为 required status check。

CI 不取代 03b 的语义批评；03b 也不能把 build/parity/格式问题包装成“Blocking reasoning failures”。

## 9. 健康指标

园丁每月报告；连续三个月 miss 某个 target，诊断对象是**流程设计**，不是作者。

| 指标 | 目标 |
|---|---|
| 每月发表 | ≥ 3（任意层级组合），其中 ≥ 1 Essay |
| 草稿 PR → 发表中位天数 | ≤ 7 |
| 双语完整率 | 100% |
| 源自作者输入的作品 | ≥ 60% |
| >21 天 backlog | 0 |
| 起草者静默无产出 | 0 |
| `Model-hypothesis` 被误写成作者立场 | 0 |
| 语义改变后 stale critic KEEP 被放行 | 0 |

`KEEP/CUT/DOWNGRADE/SPLIT/SKIP` 的比例不是目标。它们只用于校准 critic 是否有用。

## 10. 思想归属

写得像作者，不代表想法真的属于作者。更隐蔽的失败是：模型把旧立场当许可，补出新的机制、预测、框架，甚至虚构“我以前这么想，后来改变了”的心路历程。

> 允许 AI 帮忙把想法写清楚，不允许它替作者把没想完的地方想完。

这条规则管起草者（§4.3）、独立 critic（§4.3b）、发稿闸（§4.4）和园丁（§4.5）。

### Author Kernel

只从当前作者输入、`research/positions.md` 已采纳条目、或 `research/voice.md ## Stances` 明确晋升立场中建立。研究来源能支撑事实，但不能进入 `Explicit positions`。

严格 v1 下，**已发表文章正文只是历史/context**，不能单独授权当前 `Q-explicit`。

```md
## Author Kernel

### Explicit positions
-

### Concrete material
-

### Epistemic boundaries
-

### Unresolved doubts
-

### Characteristic wording worth preserving
- "..."
```

Kernel 不要被模型“整理得更完整”。“我不知道”“我只是猜”“这个问题还没想完”都是一等内容。

### Claim Ledger — 四类归属

```md
## Claim ledger

C1. <claim> — Q-explicit (interview Q1) — Required in: EN + ZH
C2. <claim> — External (<source>) — Required in: EN + ZH
C3. <optional item> — Q-derived (...) — Required in: optional
```

1. **`Q-explicit`**：当前作者输入、已采纳 `positions.md`、或已晋升 Stance 直接授权的立场。
2. **`Q-derived`**：极近的推论，不增加新的价值判断或因果理论。若一个理性读者可以接受 parent claim 却拒绝这个推论，它就不够近。
3. **`External`**：有来源的事实或明确归属给外部人的观点。
4. **`Model-hypothesis`**：模型新提出的机制、因果、框架、预测、分类、跨领域类比或“真正原因是……”重构。不能静默变成作者第一人称立场。删掉或明确写成可能性，并在 `## Candidate hypotheses — not yet yours` 里给 `Hn`。

Claim Ledger 同时是双语 parity 的真相来源。

### 不虚构作者心路历程

`I used to think... / I've come to think... / I changed my mind...` 等句子是关于作者历史的事实，不是文风。只有原始作者材料真的记录过这段变化时才允许。

### 采纳协议

作者在 PR 里回复：

```md
**Adopt hypothesis — H1**
```

或：

```md
**Reject hypothesis — H1**
```

采纳后记录直接进 `research/positions.md` 的 `main`；拒绝则从草稿移除，不进入 canon。采纳如果改变公开语义范围，发稿闸要判断是否需要新一轮 03b critic。

### 校准案例

- **PR #62**：软件亲历 + 明确硬件边界不应被补成完整跨领域 `consequence gate` 理论。预期 critic 为 `DOWNGRADE` 或 aggressive `CUT`。
- **PR #64**：保留 taste/judgment/decisiveness 的已挣到区分；pricing/compensation/2028 falsifier 若未单独挣到，应 cut/split/保持 hypothesis。
- **真实纠错**：作者明确说“我之前的定义错了”时，change-of-mind 是 `Q-explicit`。critic 应把真正的纠错/深化视为 self-novelty，而不是因为复用旧术语就处罚。

更完整的 #68 语义回归集合见 `tests/editorial/critic-v2.md`。