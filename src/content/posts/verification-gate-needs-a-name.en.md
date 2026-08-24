---
title: "Verification gates are theater until someone can be fired for skipping one"
date: 2026-08-20
excerpt: "A verification gate is theater until someone can actually get fired for skipping it. Everything else — the checklist, the sign-off field, the \"please review this\" — is decoration around that one fact."
tags: ["ai", "software", "engineering", "note"]
lang: en
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

In late July, Synopsys, Cadence, and Siemens all showed up at DAC with agentic chip-design tools built on NVIDIA's stack, and landed on the same idea within days of each other: no agent decision proceeds until Calibre or Questa One physics verification returns a pass. I don't know semiconductors, manufacturing, or hardware well enough to say whether that gate holds up in practice, and I'm not going to pretend otherwise here. What I do know is a version of the same problem from software, and it comes down to one line: a verification gate is theater until someone actually gets fired for skipping it.

A colleague on my team turned in some work, said upfront that they'd used AI on it, and asked us to review it before we used it. That admission was enough to start a real argument: how much review does a sentence like that actually earn? Nobody on the team had a rule for it. We were making one up in the room, and it looked a lot like watching someone quietly avoid owning a decision they'd rather leave to "the process."

The checklist, the sign-off field, the "please review this" are decoration around whatever the real rule turns out to be. I've watched what happens without one. An unverified, AI-written codebase turned into a disastrously messy, entangled myth in about two and a half months. Reverting a single change was trivial the whole time. Undoing the mess that had built up around all of them wasn't, because there was no one commit that caused it, and no one whose job it was to notice before it compounded.

That's what "theater until someone gets fired" cashes out to in practice. Not that the checklist is fake. That nobody's actually on the hook for what it's supposed to catch, until the day someone finally is.
