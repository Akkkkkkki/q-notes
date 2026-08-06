---
title: "EDA 大厂造的不是物理关卡，是问责关卡"
date: 2026-08-06
excerpt: "DAC 2026 上，Synopsys、Cadence、Siemens 不约而同用物理验证给芯片设计智能体加了一道关卡，但这道关卡真正把关的，是谁要为流片失败负责。"
tags: ["ai", "software", "manufacturing", "governance", "essay"]
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
  - label: "futurumgroup.com"
    title: "Synopsys, Cadence, and Siemens Take Agentic Chip Design Autonomous at DAC"
    url: "https://futurumgroup.com/insights/synopsys-cadence-and-siemens-take-agentic-chip-design-autonomous-at-dac/"
  - label: "nvidianews.nvidia.com"
    title: "NVIDIA Expands NVIDIA Agent Toolkit With NVIDIA PhysicsNeMo and CUDA-X Libraries"
    url: "https://nvidianews.nvidia.com/news/nvidia-expands-nvidia-agent-toolkit-with-nvidia-physicsnemo-and-cuda-x-libraries-to-transform-how-the-world-engineers-designs-and-builds"
  - label: "faa.gov"
    title: "AC 20-115D — Airborne Software Assurance (DO-178C)"
    url: "https://www.faa.gov/documentLibrary/media/Advisory_Circular/AC_20-115D.pdf"
connections:
  linksTo: ["helpful-agents-authorization-bug"]
---

一个客户的代码库，两个半月就变成了一团纠缠不清的烂摊子。原因很简单：AI 写的代码没有真正被把关过。我在咨询工作里亲眼见过这件事，不是听说的。事后拆开看，几乎没有哪一次改动单独拿出来算是"贵到回不了头"，每一次都便宜得很。可债务照样滚起来了，因为"这次改动回滚起来便宜"和"这件事本来就该发生"，根本是两回事，而中间那个缺口，没人管。

干净的解释是：流片一旦出错，代价大到没法回头，硬件行业被逼着先把关再谈自主；软件没有这种代价，所以能跳过这道关。这个说法我以前信，现在不全信了。真正逼出这道关卡的，我现在觉得，不是错误能不能被挽回。是有没有一个具体的人要为它负责——不妨把这种东西叫「问责关卡」：芯片设计已经有了，大多数软件 agent 的活儿还没有。

先说清楚一件事：硬件、芯片制造，我不懂，这篇文章里也不打算装懂。

我能做的，是把公开报道摆在一起看，再拿它跟我真正看过的、不设防的 AI 编程对比。

DAC 2026 大会上，Synopsys、Cadence、Siemens 在同一周先后发布"完全自主"的芯片设计智能体，都建在[英伟达同一套 agent 技术栈](https://nvidianews.nvidia.com/news/nvidia-expands-nvidia-agent-toolkit-with-nvidia-physicsnemo-and-cuda-x-libraries-to-transform-how-the-world-engineers-designs-and-builds)上。但没有一家敢跳过同一件事：智能体的每一步决定，都要先过一道硬性的物理验证关。[Siemens 把智能体输出接进 Calibre 和 Questa One](https://www.techtimes.com/articles/321691/20260727/siemens-hooks-chip-design-agents-physics-engines-prevent-tapeout-errors.htm)，不过关就不能往下走。[Synopsys 的"完全自主"验证智能体](https://www.prnewswire.com/news-releases/synopsys-showcases-comprehensive-autonomous-engineering-workflows-from-silicon-to-systems-developed-with-nvidia-technology-302834791.html)也配了签核级别的检查，号称把 RTL 验证提速最多 50 倍，覆盖率再提 20%。

## 大厂到底做了什么

去掉营销话术，事实是：三家公司在同一周收敛到同一个架构，全都还没正式发布，Synopsys 自己说客户还在评估阶段，更大范围的开放要等到 2026 下半年。50 倍、20% 这些数字，都是厂商自己报的，没有第三方审计过。Siemens 那个细节最值得琢磨：智能体的决定要过 Calibre 或 Questa One，这两个工具只认通过或不通过，不管模型自己觉得自己的推理有多合理。

这道关卡本身，我没意见。我不同意的，是"硬件有关卡、软件没有"背后那套解释。

## 不可逆这个说法站不住

按代价高低来定治理力度，这个方向我基本同意，但要打个折扣。折扣就是整篇文章要讲的事：软件出错的代价，从来不是统一便宜的。有些软件事故，代价跟一次流片失败一样大，甚至更大。客户数据泄露了，回滚代码解决不了。医疗设备固件、工业控制代码、汽车刹车系统里的安全故障，压根没有"撤销"这个选项。软件里其实已经有一个跟流片一样不可回头的领域。这个领域也早就有一道接近物理关卡的东西。航空软件要过 [DO-178C](https://www.faa.gov/documentLibrary/media/Advisory_Circular/AC_20-115D.pdf) 认证：软件的安全等级越高，结构化验证的要求就越严——测试和覆盖率分析是硬性门槛，形式化证明只是达到同一门槛的一条可选路径。最后要由一个被联邦航空局专门授权的工程师复核签字，这个授权资格还能被吊销。

所以分界线从来就不是硬件对软件，而是这个错误能不能被人挽回，说到底是有没有一个具体的人要为它负责——又是那道「问责关卡」，这次是监管机构装的。

## 真正逼出关卡的是什么

每一道验证关卡，在有人因为跳过它被开除之前，都只是个摆设。这个模式我在咨询工作里反复撞见，跟 EDA 大厂没什么关系：同事之间为了要不要认真审查一份"对方说是用 AI 做的、让我们签字就行"的交付物，真吵过架。这跟职场里那些不愿意担责任的人，本质上是同一种失败。审查之所以被省掉，是因为出了问题，没人的名字会被挂在上面。

芯片公司做不了这种取舍，跟硅片特不特殊无关，是流片账单上有公司的名字，董事会一定会问。流片失败天生就有主人。大多数企业里 AI 智能体写的代码没有。它进了一个 PR，被匆匆扫一眼就合并了，出问题往往要等几个月后，变成一团理不清的乱麻，连是哪次改动埋的雷都追不回去，更别说追到人。

DO-178C 不是反例，是同一套逻辑披了另一层制度外壳：认证工程师签字，联邦航空局能吊销他的签字资格。扒开法律程序看本质，它是问责关卡披了层技术外衣，跟 Calibre、Questa One 是一回事。

## 剩下的问题留给软件智能体

一个公平的反驳：这可能压根不是"问责"，只是监管和保险在按风险定价，我把制度惯性读成了主观意图。我觉得这不影响结论。监管正是"谁要为此负责"被写下来、变得可执行的方式，而不是停留在感觉上。逻辑是一样的：一道关卡真正立起来，是因为某个具体的人的结果跟这项检查绑在了一起，绑不上之前，它就只是摆设。

回到自己手边的 agent 工作流，问一句：如果它今天写错了，谁的饭碗真的会受影响？对大多数企业软件来说，老实的答案是没有具体的谁。我不觉得普通软件也该照搬芯片那套，但我敢打赌这道关卡已经藏在某个地方了：大概率是某份监管文件里，不会挂在哪个产品的官网首页上。
