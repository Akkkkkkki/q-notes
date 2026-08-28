---
title: "验证是不是演戏，看有没有人真的会因此被开除"
date: 2026-08-20
excerpt: "验证关卡是不是演戏，只看一件事：跳过它，会不会真的有人因此被开除。别的都是装饰。"
tags: ["ai", "software", "engineering", "note"]
lang: zh
translationKey: verification-gate-needs-a-name
maturity: seedling
connections:
  linksTo: ["helpful-agents-authorization-bug"]
sources:
  - label: "news.siemens.com"
    title: "Siemens advances self-verifying agentic AI workflows for semiconductor and PCB design"
    url: "https://news.siemens.com/en-us/siemens-nvidia-dac-2026/"
  - label: "news.synopsys.com"
    title: "Synopsys Showcases Comprehensive Autonomous Engineering Workflows from Silicon to Systems, Developed with NVIDIA Technology"
    url: "https://news.synopsys.com/2026-07-26-Synopsys-Showcases-Comprehensive-Autonomous-Engineering-Workflows-from-Silicon-to-Systems,-Developed-with-NVIDIA-Technology"
  - label: "futurumgroup.com"
    title: "Synopsys, Cadence, and Siemens Take Agentic Chip Design Autonomous at DAC"
    url: "https://futurumgroup.com/insights/synopsys-cadence-and-siemens-take-agentic-chip-design-autonomous-at-dac/"
---

七月底，Synopsys、Cadence、Siemens 三家 EDA 厂商都发布了基于 NVIDIA 技术栈的 agent 芯片设计工作流。Siemens 在自己的工作流里描述了一道硬关卡：智能体必须先通过 Calibre 或 Questa One 的物理验证，才能继续往下走。半导体、制造、硬件我完全不懂，所以我不会假装知道这道关卡在真实使用里到底有多硬。我懂的是软件这边同一个问题的另一个版本，说穿了就一句话：验证关卡是不是演戏，只看有没有人会真的因为跳过它被开除。

有同事交东西的时候先说了一句，这是他用 AI 做的，麻烦帮忙看看再用。就这一句话，团队里吵了起来，吵的是这句话到底该配多少审查。没人有规矩，大家是在当场现造一个。某种程度上，这跟平时看到有人不担责任、把决定推给“流程”，没什么两样。

我也见过一个没人认真把关、AI 大量参与的代码库，在大约两个半月里变成一团乱麻。这不能证明是缺了某一道关卡才造成了结果，也不能证明加一条 review 规则就一定能阻止它。它能说明的是，软件里的风险可以很快累积，而每一次单独看起来都还小到让人觉得“这次先过吧”。

所以我说“跳过没人被开除，这道关卡就是演戏”，不是说所有清单都是假的，也不是说硬件已经解决了这个问题。我的判断更窄：当跳过一道关卡会让一个具体的人承担具体后果，这道关卡才开始变成真的。否则，流程写在纸上可以很硬，实际执行却未必。
