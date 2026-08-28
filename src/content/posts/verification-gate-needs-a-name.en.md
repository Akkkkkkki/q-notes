---
title: "Verification gates are theater until someone can be fired for skipping one"
date: 2026-08-20
excerpt: "A verification gate is theater until someone can actually get fired for skipping it. Everything else — the checklist, the sign-off field, the \"please review this\" — is decoration around that one fact."
tags: ["ai", "software", "engineering", "note"]
lang: en
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

In late July, Synopsys, Cadence, and Siemens all showed agentic chip-design workflows built on NVIDIA's stack. Siemens describes a hard gate inside its own workflow: its agents must clear Calibre or Questa One physics verification before proceeding. I don't know semiconductors, manufacturing, or hardware well enough to say whether that gate holds up in practice, and I'm not going to pretend otherwise here. What I do know is a version of the same problem from software, and it comes down to one line: a verification gate is theater until someone actually gets fired for skipping it.

A colleague on my team turned in some work, said upfront that they'd used AI on it, and asked us to review it before we used it. That admission was enough to start a real argument: how much review does a sentence like that actually earn? Nobody on the team had a rule for it. We were making one up in the room, and it looked a lot like watching someone quietly avoid owning a decision they'd rather leave to "the process."

I've also watched an unverified, AI-written codebase turn into a disastrously messy, entangled myth in about two and a half months. That doesn't prove one missing gate caused the mess, or that a single review rule would have prevented it. It does show how quickly software risk can compound while each individual change still looks small enough to wave through.

That's what "theater until someone gets fired" means here. Not that every checklist is fake, and not that hardware has solved the problem. My claim is narrower: a gate becomes real when skipping it has a concrete consequence for someone named. Until then, process can look much firmer on paper than it is in practice.
