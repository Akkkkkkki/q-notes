---
title: "Cheap to reverse isn't the same as cheap to be wrong"
date: 2026-08-20
excerpt: "Hardware got a real verification gate at DAC 2026 because a bad tapeout is expensive to reverse. Software didn't — not because its failures are cheaper, but because usually nobody's on the hook when the check gets skipped."
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
---

A colleague on my team turned in some code, said upfront that they'd used AI to write it, and asked us to review it before it shipped. That admission was enough to start a real argument: how much review does a sentence like that actually earn? Nobody on the team had a rule for it. We were making one up in the room, and it looked a lot like watching someone quietly avoid owning a decision they'd rather leave to "the process."

Here's what I took from that argument, and I still think it's the whole thesis: a verification gate is theater until someone actually gets fired for skipping it. The checklist, the sign-off field, the "please review this" are decoration around that one fact.

In late July, Synopsys, Cadence, and Siemens all showed up at DAC with agentic chip-design tools built on NVIDIA's stack, and landed on the same idea within days of each other. Siemens' agents don't get to act until Calibre or Questa One physics verification returns a pass. No exceptions. I don't know semiconductors, manufacturing, or hardware well enough to tell you whether that gate holds up in practice or turns into a compliance checkbox once customers actually use it, and I'm not going to pretend otherwise here. But it's tempting to draw a conclusion from the outside anyway: hardware got a real gate because a bad tapeout is catastrophically expensive to reverse, and software never will, because reverting code is basically free.

I don't think software failure is any cheaper than hardware. Reversing the commit was never the actual stakes. What the failure touches is. I've watched an unverified, AI-written codebase turn into a disastrously messy, entangled myth in about two and a half months — every single change technically revertible, and the mess itself never was, because nobody was tracking what had compounded until it already had. That's just wasted engineering time. Plenty of software failures aren't reversible in any sense that matters at all: the ones that hit security, privacy, somebody's safety. `git revert` doesn't undo those any more than it undoes a bad chip.

One possibility: what actually predicts whether a check is real, in hardware or software, isn't the domain at all. It's whether skipping it would cost someone specifically named. Physics verification is unambiguous — Calibre either passes or it doesn't, and nobody has to make that judgment call. Software's stakes are diffuse and easy to argue away right up until the day they aren't, which might be exactly why the software version of this stays informal instead of disappearing.

I don't expect most software to ever get an explicit, hardware-style verification gate. But some version of it already exists, quietly, wherever a specific person would actually answer for the failure. It just never gets called a gate, so nobody outside that team ever sees it as one.
