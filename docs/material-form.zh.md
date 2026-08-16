# 由材料决定形式 —— pipeline 补充规则

本文是 Issue #67 在 editorial-quality v2（#70）下的规范性补充。它建立在 `docs/pipeline.md` §10 的 Author Kernel / ownership 模型，以及目前已经使用的来源置信度标签之上；不替代 Claim Ledger，也不改变 #69 的中英 claim parity 规则。

如果本文与 `docs/pipeline.md` §3 / §5 的旧 tier 描述冲突，**以本文为准**。尤其是：字数区间没有最低字数要求；Note 不必为了格式硬塞一个反方观点；Essay 也不必为了格式硬造预测。

## 1. Ready 只是授权，不是 tier

`Status: Ready to draft` 的意思是：作者允许这些回答被用于可发布内容。它不代表：

- 材料已经够写 Essay；
- 所有问题都必须被回答；
- 外部研究可以替作者补上判断；
- drafter 应该把材料补成一个“完整论证”。

Ready 的 brief 完全可能最后变成 Note、field note、correction、question memo、application note、Essay，或者暂时什么都不发。`domain-limit`、`tentative`、作者尚未回答的判断题、很薄的 firsthand 材料仍然是范围边界。

## 2. Material Audit：先审材料，再选 tier / form / outline

先完成 Author Kernel 和 Claim Ledger，然后在选公开 tier、内部 form、标题和结构之前做 Material Audit。它不是再抄一遍素材清单，而是判断：现有材料到底能承载多完整的论证。

PR body 使用固定格式：

```md
## Material Audit

### Author-owned specifics
- <第一手观察 / 决定 / 具体例子 / 有辨识度的原话>

### Research specifics
- <真正改变论证的来源、事实、机制、案例或反例>

### Open gaps
- <作者尚未回答的判断、domain-limit、tentative 机制、缺少的研究>

### Density judgment
- Supported by this material: <fragment | note | essay>
- Why: <2–4 句，说明什么材料撑得起这个密度，以及还缺什么>
```

不要按 bullet 数量打分。一个很扎实的 firsthand 案例，可能比六条泛泛事实更能撑起文章；十个重复同一主流观点的引用，也不会自动变成 Essay。

三个 density judgment：

- **fragment**：有一个值得保留的纠正、观察、问题或应用，但还不足以在不靠 AI 综合填充的情况下形成独立 Note。可以保留为碎片 / question memo，也可以先补采访或研究再润色。
- **note**：一个可争论的观点，至少有一个不可替代的具体机制、第一手例子或 research case 支撑，不需要再人工制造“第二幕”。
- **essay**：有多块互相作用的实质材料。论点有机制；真正存在的反方观点或边界能被认真处理；多个 section 各自都有采访/研究前写不出来的证据或经验。

### 不可替代材料测试

对每个准备写成主要 section 的部分问：

> 如果模型从没读过这次采访和这次研究，一个能力不错的模型是不是也能写出这一节？

如果答案是“能”，这节大概率只是通用脚手架。只有在现有材料里确实有具体案例、机制、firsthand 细节或真正改变论证的来源时才补进去；否则直接删掉。不要为了保住 outline 去制造材料。

概念、过渡、背景铺垫和泛泛的“这意味着什么”本身不算 material density。

## 3. 内部 editorial form

选能容纳现有材料的最小 form。它们只用于 PR body 和编辑推理，不扩大公开 frontmatter 的 `note` / `essay` / `tracker` schema。

- **`correction`** → 通常是 `note`。精准纠正过去的观点。不能虚构“我以前怎么想、后来怎么改变”的心路；§10 ownership 仍然生效。
- **`field-note`** → `note`。第一手观察或一个窄案例就是主体，不要硬推广成大理论。
- **`argument-note`** → `note`。一个观点 + 一个机制/案例。只有真正存在强反对意见时才处理 counterpoint。
- **`question-memo`** → 通常是 `note`，也可能只是 fragment / 暂不发布。诚实结尾可以是一个尚未解决的问题。研究可以把已知事实整理清楚，不能替作者下判断。
- **`application-note`** → `note`。把已经拥有的观点用到一个具体情境，不把这次应用包装成新的普遍理论。
- **`essay`** → `essay`。只有 Material Audit 判断为 `essay` 才能选。
- Tracker 仍然用于复盘过去的可证伪预测；不能因为新 Essay 恰好有预测就自动把它变成 Tracker。

PR body 固定格式：

```md
## Form decision
- Chosen form: <correction | field-note | argument-note | question-memo | application-note | essay>
- Public tier: <note | essay | tracker>
- Strongest available material: <真正承载这篇内容的材料>
- Material deliberately not expanded: <刻意不替作者补齐的缺口 / 边界 / 问题>
```

`Ready to draft` 绝不能成为选择 `essay` 的理由。

## 4. 对 tier 完成条件的修订

以下规则修订 `docs/pipeline.md` §5 的旧表述。

### Note

Note 需要：

- 一个读者能复述的可争论观点，**或者**一个确实有价值、目前尚未解决的问题；
- 至少一个不可替代的具体例子、机制、firsthand 观察或证据案例；
- 清楚的 ownership 与 epistemic boundary；
- 中英两版按 Claim Ledger 做 parity；
- build 通过。

counterpoint 是**条件项**。当一个有水平的读者确实会反驳、证据明显混合、或 Note 提出了较宽的因果判断时才写。窄 field note、correction、question memo、application note 不一定需要。不要为了打勾写一个假的“当然另一方面”。

### Essay

Essay 包含 Note 的要求，并且材料必须真的足以支撑多个不同 section、机制层面的论证、需要时的当前来源，以及对最强**真实存在**的反方观点 / 边界的处理。

可证伪陈述或 prediction 是**机会型**内容。如果论证自然产生一个，就记录到 frontmatter / tracker 机制里；如果没有，Essay 仍然可以通过。不能因为 checklist 想要 tracker fuel 就硬写一个“到 2027 年会怎样”的预测。

### 长度

历史上的 `Note 300–700`、`Essay 800–1,500` 是常见范围和有用的上限，不是最低目标。420 词的 Note、760 词的 Essay 都可能已经完整。content gate 只在超过 ceiling 时提示。内容短时应该问“密度够不够”，而不是“怎么加字数”。

超过 ceiling 时先删。如果确实有额外不可替代材料需要这些长度，PR body 里说明。

## 5. Human-style 规则只用于诊断，不用于生成

段落长度太统一、句长太统一、不用 contractions、反复使用 corrective pivot、模板化结尾，都可以作为 AI 味诊断。但这些诊断**不能**变成要求模型硬插入：

- 一个两三个词的短段落；
- 一个刻意拉长的段落；
- 一两个笑话 / aside / 括号；
- 一个 rhetorical question；
- 一个“金句式”收尾。

如果某个节奏变化或口语点只是为了满足 checklist，它应该被删掉。人为制造的 burstiness 本身也是 AI tell。

## 6. Drafter 的顺序

outline 必须在 Material Audit 和 Form decision **之后**：

1. Author Kernel + confidence tags + Claim Ledger。
2. Material Audit。
3. 选择 internal form 和 public tier。
4. 用“不可替代材料测试”决定哪些 section 值得存在。
5. 从 shared package 自然写第一种语言。
6. 第二种语言从同一 shared package clean-room 重写，保持 #69 的 claim parity，但不复制结构。
7. human pass 只做诊断和编辑，不拿来填配额。

没有漂亮结尾也没关系。“现在还不知道”可以是诚实结尾。研究可以把事实说清楚，但不能替作者产生一个 author-owned resolution。

## 7. Ship gate：form fit 是硬门槛

ship gate 在给出 `Ready to ship` 之前检查 PR 的 `## Material Audit` 与 `## Form decision`。

**form / tier mismatch 会阻止发布。** 如果 audit 只支持 `fragment` 或 `note`，PR 却声明 `essay`，checklist 就没有通过。这不是 voice flag 那样的 advisory。

修复顺序：

1. 删掉通用脚手架；
2. 缩到最强的材料；
3. 降 form / tier；
4. 如果缺失材料确实必要，先回去补作者输入 / research，再继续 polish。

绝不能通过制造“缺失家具”来过 gate：不硬造 counterargument、prediction、额外例子、漂亮结尾，也不为了最低字数加 filler。

坏链接、Claim Ledger parity、build error 等 mechanical failure 仍然可以直接修。真正需要作者判断的 gap 只向作者问一个精确问题。

## 8. Retro signal

gardener 统计作者的 `Downgrade to note` 评论和 >7 天 gate downgrade，并按 drafter 最初声明的 form / tier 拆分。Essay → Note 比例过高说明 upstream 仍然在 over-tier，不说明作者“太挑剔”。

## 9. Regression fixtures

- **PR #62**：真正有价值的是窄的 firsthand 观察和明确的 hardware/domain boundary。应该早期识别为 `field-note` / `note`，而不是为了“完整”扩展成 DAC vendor architecture、DO-178C、一个新框架再加预测。
- **PR #58**：中心判断如果还缺 author-owned / evidenced mechanism，应该先判为 `fragment`，补研究或采访，再 polish；不该用更顺滑的过渡句掩盖材料不足。
- **`taste-is-a-bet`**：如果有作者自己提供的 correction story、多个具体例子、互相作用的 claims，仍然可以自然得到 `essay`。目标不是偏爱短文，而是要求长文每一段都用材料付费。

## 与 sibling issues 的关系

- #66 / §10 仍然是 ownership 边界；Material Audit 读取 Author Kernel，不另造一套 inventory。
- #71 的 `firsthand` / `position` / `tentative` / `domain-limit` 是 audit 的输入；`domain-limit` 会缩小范围，不是加免责声明就能绕过去。
- #69 仍然按 shared Claim Ledger 做中英 parity，两种语言的 rhetoric / structure 独立。material density 在 shared package 上判断一次，不按中英字数是否对称判断。
- #68 后续 editorial critic 可以直接读取固定的 `## Material Audit` / `## Form decision`，无需再造 schema。
