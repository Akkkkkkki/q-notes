---
title: "改起来便宜，不等于错起来便宜"
date: 2026-08-20
excerpt: "DAC 2026 上，硬件拿到了真的验证关卡，因为流片错了改不起。软件没有，不是因为软件的错不心疼。有一种可能：是因为跳过检查通常没人担责。"
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
---

验证关卡是不是演戏，只看一件事：跳过它，会不会真的有人因此被开除。别的都是装饰，打钩的清单，还有"麻烦帮忙 review 一下"这句话本身。

这是我从团队最近一次争论里得出的结论。有同事交东西的时候先说了一句，这是他用 AI 做的，麻烦帮忙看看再用。就这一句话，团队里吵了起来，吵的是这句话到底该配多少审查。没人有规矩，大家是在当场现造一个。某种程度上，这跟平时看到有人不担责任、把决定推给"流程"，没什么两样。

七月底，Synopsys、Cadence、Siemens 三家 EDA 厂商在 DAC（设计自动化大会）上前后脚发布了基于 NVIDIA 那一整套 agent 技术栈的芯片设计智能体，不约而同做了同一件事。Siemens 的智能体要先过 Calibre 或 Questa One 的物理验证，没过就不能往下走，没有例外。半导体、制造、硬件我完全不懂，这篇文章开始之前就该说清楚，这里也不会假装自己懂。但从外面看很容易得出一个结论：硬件行业有了真的验证关卡，是因为流片错了改起来贵得要命；软件没有，是因为代码想改随时能改，几乎不要钱。

我不同意后半句。改代码从来不是真正的赌注，失败会碰到什么才是。我见过一个客户的代码库，没人把关，AI 随便写，两个半月就变成一团乱麻。单次改动想撤销并不难，但滚成这样的乱撤销不了，因为压根没有哪一次改动能算是罪魁祸首。这还只是在浪费工程时间。有些软件故障根本不可逆，碰到安全、隐私、人的生命的那种。git revert 救不了这些，跟救不了一颗错的芯片一样。

有一种可能：真正决定一道验证关卡是不是真的，不管是硬件还是软件，看的不是这个领域改错了能不能挽回，而是跳过它会不会让一个具体的人为此担责。物理验证，至少 Siemens 自己是这么说的，结果就是过或不过。这道检查再往上游走，比如怎么配置、什么才算过、不过之后又会怎样，是不是也需要人临场判断，硬件我不懂，说不清楚。软件的风险很分散，能一直拖到出事那天才现出原形，这大概也是为什么软件版本的这道关卡一直是潜规则，而不是干脆不存在。

我不觉得大多数软件会等来一个像硬件那样写明白的验证关卡。但某种版本的它已经在某些地方存在，只要那里有个具体的人，出了事真的要担责。只是没人把它叫做"关卡"，团队外面的人也就看不出那是一道关卡。
