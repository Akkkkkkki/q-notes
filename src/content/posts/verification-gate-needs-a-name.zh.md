---
title: "验证是不是演戏，看有没有人真的会因此被开除"
date: 2026-08-20
excerpt: "验证关卡是不是演戏，只看一件事：跳过它，会不会真的有人因此被开除。别的都是装饰。"
tags: ["ai", "software", "engineering", "note"]
lang: zh
translationKey: verification-gate-needs-a-name
maturity: seedling
sources:
  - label: "news.siemens.com"
    title: "Siemens advances self-verifying agentic AI workflows for semiconductor and PCB design"
    url: "https://news.siemens.com/en-us/siemens-nvidia-dac-2026/"
  - label: "news.synopsys.com"
    title: "Synopsys Showcases Comprehensive Autonomous Engineering Workflows from Silicon to Systems, Developed with NVIDIA Technology"
    url: "https://news.synopsys.com/2026-07-26-Synopsys-Showcases-Comprehensive-Autonomous-Engineering-Workflows-from-Silicon-to-Systems,-Developed-with-NVIDIA-Technology"
---

七月底，Synopsys、Cadence、Siemens 三家 EDA 厂商在 DAC（设计自动化大会）上前后脚发布了基于 NVIDIA 那套 agent 技术栈的芯片设计智能体，做的是同一件事：没过 Calibre 或 Questa One 的物理验证，智能体的决定就不能往下走。半导体、制造、硬件我完全不懂，这里也不会假装自己懂。我懂的是软件这边同一个问题的另一个版本，说穿了就一句话：验证关卡是不是演戏，只看有没有人会真的因为跳过它被开除。

有同事交东西的时候先说了一句，这是他用 AI 做的，麻烦帮忙看看再用。就这一句话，团队里吵了起来，吵的是这句话到底该配多少审查。没人有规矩，大家是在当场现造一个。某种程度上，这跟平时看到有人不担责任、把决定推给"流程"，没什么两样。

打钩的清单、"麻烦帮忙看看"这句话本身，都是装饰，装饰背后到底有没有真规矩才是关键。我见过没有真规矩会怎样。一个客户的代码库，没人把关，AI 随便写，两个半月就变成一团乱麻。单次改动想撤销并不难，但滚成这样的乱撤销不了，因为压根没有哪一次改动能算是罪魁祸首，也没人的活儿是盯着它一点点滚起来。

"跳过就该被开除"落到实处，说的不是清单是假的。是没人真的会为它担责，直到有一天终于有人会。
