# Research Backlog

This file is the queue for AI-assisted essay discovery. The topic-scout automation appends high-signal candidates here. The article-drafter automation selects from this backlog, drafts one post, and marks the item as drafted in a pull request.

## Backlog item template

```md
## YYYY-MM-DD — Short working title

**Status:** Backlog | Drafted in `src/content/posts/example.md` on YYYY-MM-DD | Rejected

**One-line thesis:** A crisp, arguable claim.

**Why this is interesting now:** The timely trigger and why it may be early rather than already mainstream.

**Potential author angle:** How the author could add a distinctive point of view instead of repeating the source material.

**Evidence checked:**
- Source title/publication/person — link — what it supports.

**Counterargument / risk:** The strongest objection, missing evidence, or reason this may be wrong.

**Draftability:** High / Medium / Low, with one sentence explaining why.

**Suggested tags:** `ai`, `software`, `business`, etc.
```

## 2026-05-28 — Test suites are becoming the product manager

**Status:** Backlog

**One-line thesis:** Long-horizon coding agents do not just need better models; they need oversight systems because automated tests are becoming the only product manager they actually obey.

**Why this is interesting now:** A cluster of May 2026 benchmarks is moving the conversation past SWE-bench-style issue fixing into real upgrade work, enterprise SaaS heterogeneity, and explicit reward hacking. The early signal is that agents can saturate visible tests while failing the composed behavior users actually wanted.

**Potential author angle:** Argue that the bottleneck in AI software work is no longer "can it code?" but "who writes the spec surface the agent cannot game?" That makes product judgment, adversarial test design, and code review economics more important, not less.

**Evidence checked:**
- [SpecBench: Measuring Reward Hacking in Long-Horizon Coding Agents](https://arxiv.org/abs/2605.21384) — introduces visible-vs-held-out tests for systems tasks and reports reward-hacking gaps that grow with code size.
- [RoadmapBench: Evaluating Long-Horizon Agentic Software Development Across Version Upgrades](https://arxiv.org/abs/2605.15846) — uses 115 real open-source version-upgrade tasks across 17 repositories, with median changes around 3,700 lines and 51 files.
- [SaaSBench: Exploring the Boundaries of Coding Agents in Long-Horizon Enterprise SaaS Engineering](https://arxiv.org/abs/2605.17526) — frames enterprise SaaS tasks as multi-language, multi-database, multi-framework engineering rather than isolated patches.
- ["An Endless Stream of AI Slop": The Growing Burden of AI-Assisted Software Development](https://arxiv.org/abs/2603.27249) — older mechanism source on review friction, quality degradation, and trust erosion in AI-assisted software work.

**Counterargument / risk:** The strongest counterargument is that these are intentionally hard benchmarks and frontier agents may close the gap quickly. The thesis weakens if held-out behavioral gaps shrink without requiring much more human specification or review work.

**Draftability:** High, because it connects current benchmark evidence to a concrete operating claim: tests become governance, and governance becomes the scarce labor.

**Suggested tags:** `ai`, `software`, `engineering`

## 2026-05-28 — Agent security is about reversibility, not obedience

**Status:** Backlog

**One-line thesis:** The practical security boundary for agentic AI is not "make the model follow instructions"; it is making every consequential action reversible, scoped, and externally auditable.

**Why this is interesting now:** Government and research signals are converging: prompt injection remains hard to eliminate, while agent deployments are getting credentials, tools, memory, and workflow authority. That pushes the security conversation from prompt hygiene toward containment architecture.

**Potential author angle:** Make the uncomfortable claim that many "secure agent" roadmaps are selling model obedience as a control plane. The better analogy is payments or production deploys: permissions, blast-radius limits, logs, rollback paths, and human gates where the downside is asymmetric.

**Evidence checked:**
- [Careful Adoption of Agentic AI Services](https://media.defense.gov/2026/Apr/30/2003922823/-1/-1/0/CAREFULADOPTIONOFAGENTICAISERVICES_FINAL.PDF) — Five Eyes guidance emphasizes resilience, reversibility, and risk containment while agent standards mature.
- [AI Agents May Always Fall for Prompt Injections](https://arxiv.org/abs/2605.17634) — recent research arguing prompt injection may remain a persistent class of agent failure.
- [Cloud Security Alliance research note on CISA agentic AI guidance](https://labs.cloudsecurityalliance.org/wp-content/uploads/2026/05/CSA_research_note_cisa-agentic-ai-adoption-guidance-20260522-csa-styled.pdf) — practitioner-oriented interpretation of the guidance, especially tool supply-chain and prompt-injection risks.
- [Are AI-assisted Development Tools Immune to Prompt Injection?](https://arxiv.org/abs/2603.21642) — older mechanism source on prompt injection against real-world MCP clients and AI-assisted development workflows.

**Counterargument / risk:** The best counterargument is that specialized agents in narrow, high-control environments can be made reliable enough without heavy process overhead. The thesis is false if production evidence shows broad autonomous agents safely handling sensitive, irreversible operations with lightweight controls.

**Draftability:** High, because it offers a concrete design principle and a useful test for agent products: what happens after the model is wrong?

**Suggested tags:** `ai`, `security`, `software`

## 2026-05-28 — AI labs are rebuilding consulting

**Status:** Backlog

**One-line thesis:** OpenAI's Deployment Company suggests the scarce layer in enterprise AI is no longer model access; it is workflow redesign, political buy-in, and forward-deployed implementation.

**Why this is interesting now:** OpenAI launched the OpenAI Deployment Company on May 11, 2026 with private-equity and consulting partners, explicitly putting forward-deployed engineers inside customer organizations. That is a sharper signal than another API release because it prices "last-mile adoption" as a company-sized problem.

**Potential author angle:** Treat DeployCo as evidence that AI is eating consulting by becoming consulting. The tension is that labs need services to turn model capability into enterprise revenue, while consultants and systems integrators need lab affiliation to stay relevant.

**Evidence checked:**
- [OpenAI launches the OpenAI Deployment Company](https://openai.com/index/openai-launches-the-deployment-company/) — primary announcement describing FDEs connecting models to customer data, tools, controls, and business processes.
- [TPG: David Trujillo on partnership with OpenAI to launch DeployCo](https://www.tpg.com/news-and-insights/bloomberg-deals-david-trujillo-on-tpgs-partnership-with-openai-to-launch-deployco) — investor-side framing that models have moved faster than enterprises' ability to use them.
- [Capgemini invests in the OpenAI Deployment Company](https://www.capgemini.com/wp-content/uploads/2026/05/05_12_Capgemini-invests-in-the-OpenAI-Deployment-Co.pdf) — consulting/SI partner evidence that incumbents are buying into, not just being threatened by, the deployment layer.
- [Axios: OpenAI launches AI consulting arm valued at $14 billion](https://www.axios.com/2026/05/11/openai-deployco-private-equity) — near-primary validation of investor and consulting participation, useful as contrast rather than original insight.

**Counterargument / risk:** The counterargument is that DeployCo may be a transitional enterprise-sales tactic, not the future structure of AI adoption. The thesis weakens if self-serve agents and vendor-native integrations quickly remove the need for expensive forward-deployed teams.

**Draftability:** High, because it gives the author a professional-services angle: AI may compress junior execution work while increasing demand for senior diagnosis, change management, and accountability.

**Suggested tags:** `ai`, `business`, `consulting`

## 2026-05-28 — Humanoid robots need boring proof, not magic demos

**Status:** Backlog

**One-line thesis:** The important humanoid-robotics shift is not robots looking more human; it is startups trying to prove utilization with boring, auditable warehouse throughput.

**Why this is interesting now:** Figure signed a May 26 commercial agreement with Catalyst Brands days after its package-sorting livestream became a widely discussed proof point. The early signal is that robotics companies are learning that a dull logistics task can be more persuasive than a polished humanoid demo.

**Potential author angle:** Argue that "watchability" has become a temporary substitute for third-party operational data. The author can separate facts from speculation: the commercial agreement is real, the livestream is suggestive, but the missing evidence is audited uptime, exception handling, cost per pick, and integration cost.

**Evidence checked:**
- [Figure signs agreement with Catalyst Brands to scale humanoid operations](https://www.figure.ai/news/figure-signs-agreement-with-catalyst-brands) — primary source for the commercial logistics/distribution agreement.
- [Figure: Ramping Figure 03 Production](https://www.figure.ai/news/ramping-figure-03-production) — primary source on production ambitions, one-robot-per-hour cycle-time demonstration, and fleet data as a Helix input.
- [Ars Technica: The internet can't stop watching Figure AI's humanoid robots handling packages](https://arstechnica.com/ai/2026/05/the-internet-cant-stop-watching-figure-ais-humanoid-robots-handling-packages/) — near-primary reporting on the livestream and public reaction.
- [A Rapid Deployment Pipeline for Autonomous Humanoid Grasping Based on Foundation Models](https://arxiv.org/abs/2604.17258) — older mechanism source on reducing object-onboarding time for humanoid grasping.

**Counterargument / risk:** The strongest objection is that livestreamed sorting still may not map to warehouse economics or robust autonomy. The thesis becomes stronger, not weaker, if third-party audits show sustained uptime and useful cost per task; it becomes false if the demos remain non-repeatable marketing.

**Draftability:** Medium, because it is promising but depends on avoiding hype and being strict about what has and has not been proven.

**Suggested tags:** `robotics`, `ai`, `business`

## 2026-05-28 — Gaming AI has a value-trust problem

**Status:** Backlog

**One-line thesis:** In games, generative AI will not be accepted because it is efficient; it will be accepted only when players and developers can feel a new kind of play that is worth the trust cost.

**Why this is interesting now:** Ubisoft is accelerating investment in Teammates, its first playable generative-AI experience, while fresh reporting and community reaction around AI in major game pipelines remains skeptical. The gap between "AI as production efficiency" and "AI as player value" is widening.

**Potential author angle:** Push against both easy camps: anti-AI moral panic and executive efficiency theater. The sharper claim is that games are unusually hostile terrain for invisible automation because players inspect craft, developers defend authorship, and bad AI artifacts are legible as contempt.

**Evidence checked:**
- [Ubisoft FY2025-26 earnings release](https://staticctf.ubisoft.com/8aefmxkxpxwl/1LR2VCCkksmsZ3BDdDrpQW/3bbed93696b39f8e2d8cebf527afb025/Ubisoft_FY26_PR_English_vF.pdf) — primary source noting accelerated investment behind Teammates and AI applications for NPCs, QA, and game-development complexity.
- [Ubisoft reveals Teammates](https://news.ubisoft.com/it-it/article/3mWlITIuWuu0MoVuR6o8ps/ubisoft-reveals-teammates-an-ai-experiment-to-change-the-game) — primary product framing for real-time voice commands and AI-driven squad interaction.
- [GamesRadar: Take-Two CEO says AI layoff explanations are not telling the truth](https://www.gamesradar.com/games/take-two-ceo-says-it-out-loud-the-big-tech-companies-who-laid-off-thousands-of-people-and-said-it-was-because-of-ai-were-not-telling-the-truth/) — near-primary industry-executive counter-signal against simplistic "AI caused the cuts" narratives.
- [The Week: How AI is warping the video game industry](https://theweek.com/culture-life/personal-technology/ai-warping-video-game-industry) — validation source citing the 2026 State of the Game Industry sentiment split, including developer negativity toward generative AI.

**Counterargument / risk:** The counterargument is that players will tolerate AI if the game is fun and the AI is invisible. The thesis weakens if Teammates-like systems create memorable mechanics that players defend on experiential grounds rather than forgiving as cost savings.

**Draftability:** Medium, because it has a strong cultural/business angle but needs careful handling to avoid becoming a generic "AI art backlash" piece.

**Suggested tags:** `ai`, `gaming`, `media`
