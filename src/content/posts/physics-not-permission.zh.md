---
title: "EDA 大厂造的不是物理关卡，是问责关卡"
date: 2026-08-06
excerpt: "DAC 2026 上，Synopsys、Cadence、Siemens 不约而同用物理验证给芯片设计智能体加了一道关卡，但这道关卡真正把关的，是谁要为流片失败负责。"
tags: ["ai", "software", "manufacturing", "governance", "note"]
lang: zh
translationKey: physics-not-permission
maturity: growing
definedTerm:
  term: "问责关卡"
  pos: "名词"
  definition: "一个智能体绕不过去的验证步骤。它存在，不是因为这道检查技术上有多难，而是因为出了问题，有一个具体的人要为此负责。"
prediction:
  statement: "下一个给智能体装上问责关卡的软件领域，不会按 bug 修复成本高低来选，而是按能不能揪出一个具体负责人来选：支付、医疗、基础设施代码会先有，通用型编程智能体产品会后有。"
  confidence: medium
  status: open
  falsifier: "如果一个主流的、不受监管的企业级编程智能体产品，比任何受监管领域更早给智能体写的代码装上了硬性的、绕不过去的验证关卡。"
  by: "2027 年底"
sources:
  - label: "techtimes.com"
    title: "Siemens Hooks Chip Design Agents to Physics Engines to Prevent Tapeout Errors"
    url: "https://www.techtimes.com/articles/321691/20260727/siemens-hooks-chip-design-agents-physics-engines-prevent-tapeout-errors.htm"
  - label: "prnewswire.com"
    title: "Synopsys Showcases Comprehensive Autonomous Engineering Workflows from Silicon to Systems"
    url: "https://www.prnewswire.com/news-releases/synopsys-showcases-comprehensive-autonomous-engineering-workflows-from-silicon-to-systems-developed-with-nvidia-technology-302834791.html"
  - label: "cadence.com"
    title: "Agentic AI for Chip and System Design"
    url: "https://www.cadence.com/en_US/home/ai/ai-for-design.html"
  - label: "anysilicon.com"
    title: "The Ultimate Signoff (TapeOut) Checklist"
    url: "https://anysilicon.com/the-ultimate-signoff-tapeout-checklist/"
  - label: "faa.gov"
    title: "AC 20-115D — Airborne Software Assurance (DO-178C)"
    url: "https://www.faa.gov/documentLibrary/media/Advisory_Circular/AC_20-115D.pdf"
connections:
  linksTo: ["helpful-agents-authorization-bug"]
---

一个客户的代码库，两个半月就变成了一团纠缠不清的烂摊子。原因很简单：AI 写的代码没有真正被把关过。我在咨询工作里亲眼见过这件事，不是听说的。事后拆开看，几乎没有哪一次改动单独拿出来算是"贵到回不了头"，每一次都便宜得很。可债务照样滚起来了，因为"这次改动回滚起来便宜"和"这件事本来就该发生"，根本是两回事，中间那个缺口没人管。

DAC 2026 大会上，Synopsys、Cadence、Siemens 在同一周先后发布"完全自主"的芯片设计智能体，按各家自己的说法，物理验证都挡在智能体的决定和下一步之间。[Siemens 把智能体输出接进 Calibre 和 Questa One](https://www.techtimes.com/articles/321691/20260727/siemens-hooks-chip-design-agents-physics-engines-prevent-tapeout-errors.htm)，不过关就不能往下走，这两个工具只认通过或不通过，不管模型自己觉得自己的推理有多合理。[Synopsys](https://www.prnewswire.com/news-releases/synopsys-showcases-comprehensive-autonomous-engineering-workflows-from-silicon-to-systems-developed-with-nvidia-technology-302834791.html) 给自己的"完全自主"验证智能体配了签核级别的检查，[Cadence](https://www.cadence.com/en_US/home/ai/ai-for-design.html) 则说每一步智能体动作都建立在它的物理仿真验证引擎之上。

干净的解释是：流片一旦出错，代价大到没法回头，硬件行业被逼着先把关再谈自主；软件没有这种代价，所以能跳过这道关。这个说法我以前信，现在不全信了。真正逼出这道关卡的，我现在觉得，是有没有一个具体的人要为它负责，不是错误能不能被挽回。不妨把这种东西叫「问责关卡」。

先说清楚一件事：硬件、芯片制造，我不懂，这篇文章里也不打算装懂。我能做的，是拿公开报道，去对比我真正看过的、不设防的 AI 编程。

芯片公司做不了"反正便宜，不用管"这种算法，跟硅片特不特殊无关，是设计送去代工厂之前要先过一道[正式的签核审查](https://anysilicon.com/the-ultimate-signoff-tapeout-checklist/)——一份有人签了名的清单，而且流片账单上摆着公司的名字，董事会一定会问。大多数企业里 AI 智能体写的代码，没有对等的审查关卡。它进了一个 PR，被匆匆扫一眼就合并了，出问题往往要等几个月后，变成一团理不清的乱麻，连是哪次改动埋的雷都追不回去，更别说追到人。

软件里其实也有一道差不多的关卡，只是不在 DAC 故事讲的地方。航空软件要过 [DO-178C](https://www.faa.gov/documentLibrary/media/Advisory_Circular/AC_20-115D.pdf) 认证，最后要由一个被联邦航空局专门授权的工程师复核签字，这个授权资格还能被吊销。扒开法律程序看本质，它跟 Calibre、Questa One 是同一套逻辑，只是换了层监管的外衣，不是技术的外衣。

一个说得通的反驳：这可能压根不是"问责"，只是监管和保险在按风险定价，我把制度自然长成这个样子读成了主观意图。我觉得这不影响结论。监管正是"谁要为此负责"被写下来、变得可执行的方式，不再只是一种感觉。

回到自己手边的 agent 工作流，问一句：如果它今天写错了，谁的饭碗真的会受影响？对大多数企业软件来说，老实的答案是没有具体的谁。我不觉得普通软件也该照搬芯片那套，但我敢打赌这道关卡已经藏在某个地方了：大概率是某份监管文件里，不会挂在哪个产品的官网首页上。
