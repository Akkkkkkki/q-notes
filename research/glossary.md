# Bilingual glossary (EN ↔ 中文)

Canonical renderings for recurring terms, so the Chinese versions read consistently over
time. The drafter consults this before transcreating and appends new decisions in the
same PR as the post that introduced them. Rules of thumb:

- Prefer the rendering used by the mainstream Chinese tech community over invented
  translations; keep widely-used English terms in English where that is the natural usage
  (e.g., "prompt", "token" often stay untranslated in running text).
- Record deliberate non-translations too, so they stay deliberate.
- Terms listed here are the sanctioned "deliberate keywords" exempt from the plain-language
  rule (`AGENTS.md`, `docs/pipeline.md` §5): define them on first use, then reuse on
  purpose. A coinage that isn't a reused keyword and isn't here should be a plain word
  instead.

| English | 中文 | Notes |
|---|---|---|
| agent / agentic | 智能体 / 智能体的 | Keep "agent" in English when naming products (e.g., coding agent → 编程智能体 or 编程 agent, judgment call per sentence rhythm). |
| large language model (LLM) | 大语言模型 | LLM acceptable on second mention. |
| forward-deployed engineer (FDE) | 驻场工程师 | Keep "(FDE)" on first mention. |
| reward hacking | 奖励欺骗 | Keep English in parentheses on first mention. |
| prompt injection | 提示词注入 | |
| benchmark | 基准测试 | "Benchmark" alone acceptable in casual contexts. |
| consulting / professional services | 咨询 / 专业服务 | |
| engagement manager (EM) | 项目经理（EM） | MBB-specific; keep "EM". |
| pipeline (editorial) | 流程 / 工作流 | Avoid 管道 in editorial contexts. |
| note / essay / tracker (content tiers) | 笔记 / 文章 / 预测追踪 | |
| seedling / growing / evergreen (maturity) | 幼苗 / 生长中 / 常青 | Shown to readers; keep gentle, not cute. |
| barbell (strategy shape) | 杠铃 / 杠铃结构 | "Barbell" as in barbell strategy — squeezed middle, repriced extremes. |
| conversion layer | 转化层 | Coined in the "consulting barbell" essay for the analyst/manager/EM tier that converts ambiguity into standard outputs. |
| service-as-software | 服务即软件 | Keep English term in parentheses on first mention. |
| outcome underwriting / outcome pricing | 结果担保 / 结果定价 | "Underwrite outcomes" → 为结果提供担保. |
| skin in the game | 切身利益 | Keep English in parentheses on first mention. |
| authorization bug | 授权漏洞 | Coined framing for agent scope failures; keep English in parentheses on first mention in zh. |
| coordination debt | 协同债 | Coined in the "cheap agents create coordination debt" essay for the backlog of unresolved decisions created when action becomes cheaper than alignment; parallel to 技术债. |
| agent traffic control | agent 交通管制 | Coined in the "Coding agents need traffic control" essay for coordinating task scope, ownership, and merge order before concurrent agent work collides. |
| taste (as domain judgment) | 品味 | Reused keyword in the "taste is just judgment, renamed" note: taste is the creative-world name for domain judgment. Keep 品味 for that sense. Superseded as a definition by the row below — the note's equation is the one the essay corrects — but 品味 stays the rendering. |
| domain judgment | 领域判断力 | The plain term the "taste" note resolves taste into — knowing what's good enough and appropriate in a context; 判断力 alone when context is clear. Pairs with 品味. |
| taste vs. judgment (the split) | 品味 / 判断力 之分 | Refined in the "taste is a bet on a standard that doesn't exist yet" essay, from the author's own answers: **judgment** applies a standard that already exists (按社会已有的标准); **taste** is a call with no wrong answer at the time, settled only when people gradually converge (更长期来看人们才慢慢发现该这么走). Render the pair as 判断力 / 品味 and keep the split explicit — don't collapse them back into one word. |
| standard that hasn't formed yet | 还没成形的标准 | The thing taste bets on, in the same essay. Avoid 尚未形成的标准 (欧化); 还没成形 reads plainer. |
| consequence gate | 问责关卡 | Coined in the "physics gate is actually an accountability gate" essay: a verification step no agent output can skip, that exists because a named person answers for the failure, not because the check is technically hard. |
