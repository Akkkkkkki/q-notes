---
title: "EDA vendors built a physics gate. What they actually built is an accountability gate."
date: 2026-08-06
excerpt: "Synopsys, Cadence, and Siemens all pitched autonomous chip-design agents at DAC 2026, gated on physics verification — but the real trust mechanism is who answers for the tapeout, not the physics."
tags: ["ai", "software", "manufacturing", "governance", "note"]
lang: en
translationKey: physics-not-permission
maturity: growing
definedTerm:
  term: "consequence gate"
  pos: "n."
  definition: "a verification step no agent output can skip, that exists not because the check is technically hard but because a specific named person answers for what happens if it's wrong."
prediction:
  statement: "The next software domain to get an agent-proof consequence gate won't be chosen by how expensive the bug is to fix. It'll be chosen by whether a named person can be held to account for it — expect it in payments, healthcare, or infrastructure code before it shows up in general-purpose coding-agent products."
  confidence: medium
  status: open
  falsifier: "if a mainstream, unregulated enterprise coding-agent product ships a hard, non-bypassable verification gate before any regulated domain requires one for agent-authored code."
  by: "end of 2027"
sources:
  - label: "techtimes.com"
    title: "Siemens Hooks Chip Design Agents to Physics Engines to Prevent Tapeout Errors"
    url: "https://www.techtimes.com/articles/321691/20260727/siemens-hooks-chip-design-agents-physics-engines-prevent-tapeout-errors.htm"
  - label: "faa.gov"
    title: "AC 20-115D — Airborne Software Assurance (DO-178C)"
    url: "https://www.faa.gov/documentLibrary/media/Advisory_Circular/AC_20-115D.pdf"
connections:
  linksTo: ["helpful-agents-authorization-bug"]
---

At DAC 2026, Synopsys, Cadence, and Siemens all pitched "fully autonomous" chip-design agents within days of each other. None of them ships without the same feature: every agent decision has to clear a hard physics-verification check first. Siemens routes agent output through [Calibre and Questa One](https://www.techtimes.com/articles/321691/20260727/siemens-hooks-chip-design-agents-physics-engines-prevent-tapeout-errors.htm) before it can proceed, tools that return a pass-or-fail owed nothing to a model's opinion of its own work.

The tidy reading is that a bad tapeout is catastrophically expensive and physically irreversible, so hardware gets a gate that software skips. I used to buy that story. What actually forces a gate like this, I've come to think, is whether a specific, named person answers for it, not the cost of reversing the mistake.

Call that a *consequence gate*.

I don't know hardware or chip manufacturing, and I'm not pretending otherwise here. What I can compare is the public reporting on these launches with what I've actually watched happen with unverified AI coding, which is the part I do know.

A client's codebase turned into a disastrously messy entangled myth within two and a half months of letting AI coding run without real verification. Nobody thought any single change was expensive to reverse. They were mostly right, sentence by sentence. The debt compounded anyway, because "cheap to reverse" and "cheap to have happened at all" are different claims, and nobody owned the gap between them.

A chip company can't get away with that math, not because silicon is special, but because the company has a name on the tapeout bill and a board that will ask about it. A tapeout failure has an owner by construction. Most AI-agent-authored code at a normal software company doesn't. It lands in a PR, gets a skim review, and if it's wrong, the cost shows up months later as a mess nobody can trace back to a decision-maker.

Software does have an equivalent consequence gate, just not where the DAC story looks. Aviation software has to clear [DO-178C](https://www.faa.gov/documentLibrary/media/Advisory_Circular/AC_20-115D.pdf): a certifying engineer the FAA has specifically authorized signs off, and the FAA can revoke that authorization. Strip the legal machinery away and it's the same mechanism as Calibre and Questa One, wearing a regulatory costume instead of a technical one.

The fair objection: maybe this isn't accountability at all, just regulation and insurance doing ordinary risk pricing, and I'm reading intention into how institutions just drift into that shape. I don't think that changes much. Regulation is how "someone gets fired for this" gets written down and made enforceable instead of staying a vibe.

Ask what would need to be true before your own agent setup got an equivalent gate, and the uncomfortable version of the question is this: whose job is actually on the line if the agent's output is wrong, right now, today? For most enterprise coding-agent work, the honest answer is nobody's in particular. I don't think this gate should exist for ordinary software the way it does for chips, but I'd bet it's already hidden somewhere, probably in a regulator's paperwork, not a vendor's product page.
