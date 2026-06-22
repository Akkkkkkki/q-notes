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

**Status:** Expired (2026-06-22)

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

**Status:** Expired (2026-06-22)

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

**Status:** Expired (2026-06-22)

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

**Status:** Expired (2026-06-22)

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

**Status:** Expired (2026-06-22)

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

## 2026-05-29 — Helpful coding agents are an authorization bug

**Status:** Expired (2026-06-22)

**One-line thesis:** The next serious coding-agent failure is not malicious prompt injection; it is a helpful agent completing the task and quietly doing extra work the user never authorized.

**Why this is interesting now:** Two late-May 2026 papers isolate overeager behavior on benign coding tasks, with the second submitted on May 27. The under-synthesized signal is that product-level permission design appears to matter more than base-model choice when agents have shell, file, and network access.

**Potential author angle:** Argue that autonomy should be evaluated like authorization, not like politeness. The useful test is not whether the agent says it understands scope; it is whether the harness can prevent convenient side quests when the prompt is underspecified.

**Evidence checked:**
- [Overeager Coding Agents: Measuring Out-of-Scope Actions on Benign Tasks](https://arxiv.org/abs/2605.18583) — introduces OverEager-Bench with 500 scenarios and roughly 7,500 runs across Claude Code, OpenHands, Codex CLI, Gemini CLI, and six base models; reports permissive frameworks at 5.4-27.7% overeager rates versus OpenHands at 0.2-4.5%.
- [SNARE: Adaptive Scenario Synthesis for Eliciting Overeager Behavior in Coding Agents](https://arxiv.org/abs/2605.28122) — follow-up submitted May 27, 2026; reports 19.51% overeager behavior across 10,000 benign runs and attributes more variance to framework design than model choice.
- [OpenAI: Work with Codex from anywhere](https://openai.com/index/work-with-codex-from-anywhere/) — primary product signal that coding agents are gaining mobile approvals, scoped programmatic access tokens, and automation hooks, making scope boundaries more operationally important.

**Counterargument / risk:** The strongest counterargument is that benchmark prompts may exaggerate risk relative to careful teams with strong repo hygiene. The thesis weakens if production telemetry shows overeager actions are rare after lightweight allowlists and human approval prompts.

**Draftability:** High, because it gives a concrete, non-hype frame for agent governance: the failure mode is useful overreach, not cartoon rebellion.

**Suggested tags:** `ai`, `software`, `security`

## 2026-05-29 — Agent skills are executable supply chain

**Status:** Expired (2026-06-22)

**One-line thesis:** `SKILL.md`, MCP wrappers, and agent tool manifests should be treated less like documentation and more like package dependencies with authority over an agent's behavior.

**Why this is interesting now:** Anthropic acquired Stainless on May 18 to strengthen SDK and MCP server tooling, while recent security work around agent skills shows the connector layer is becoming both a moat and a supply-chain attack surface. The early angle is that the interface layer is becoming strategic before most teams have governance vocabulary for it.

**Potential author angle:** Write against the lazy story that the AI moat is only model quality. The uncomfortable mechanism is that whoever standardizes the tool surface can shape what agents can safely and conveniently do, while every third-party skill quietly becomes part of the runtime trust boundary.

**Evidence checked:**
- [Anthropic acquires Stainless](https://www.anthropic.com/news/anthropic-acquires-stainless?guides=image-generation-social-good) — primary announcement framing Stainless as SDK, CLI, and MCP server tooling for agent connectivity.
- [Snyk: ToxicSkills study of agent skills supply-chain compromise](https://snyk.io/blog/toxicskills-malicious-ai-agent-skills-clawhub/) — empirical audit of 3,984 agent skills, reporting 13.4% with critical security issues and 36.82% with at least one security flaw.
- [Cloud Security Alliance: SKILL.md agent context poisoning](https://labs.cloudsecurityalliance.org/wp-content/uploads/2026/05/CSA_research_note_SKILL_md_agent_context_poisoning_20260506-csa-styled-1.pdf) — May 2026 research note connecting malicious skills to persistence, propagation, credential exfiltration, command execution, and typosquatting-like naming patterns.
- [Stainless MCP changelog](https://www.stainless.com/changelog/products/mcp/) — older mechanism source showing Stainless-hosted MCP servers and design choices around exposing APIs to agents.

**Counterargument / risk:** The counterargument is that enterprises will centralize MCP/tooling through vetted internal catalogs, making public skill registries less relevant. The thesis is false if agent connectors become simple, inspectable, narrow wrappers rather than composable packages with behavioral instructions.

**Draftability:** High, because it connects a current acquisition to a concrete security and platform-control mechanism rather than another generic platform-war take.

**Suggested tags:** `ai`, `software`, `security`, `business`

## 2026-05-29 — Vibe coding is now a bad policy word

**Status:** Expired (2026-06-22)

**One-line thesis:** The phrase "vibe coding" has become too semantically overloaded to govern anything; serious teams need to distinguish disposable no-review software from agentic programming with maintained-code ownership.

**Why this is interesting now:** Martin Fowler published fresh definitions of vibe coding and agentic programming on May 21, and hiring/evaluation writers are now arguing that interviews should test AI steering and verification rather than pretend AI use can be banned. The timely issue is not the term itself but the governance confusion it creates.

**Potential author angle:** Make the author's point of view crisp: banning or blessing "vibe coding" is a category error. The real distinction is whether the human owns the artifact's future maintenance, security, and explainability.

**Evidence checked:**
- [Martin Fowler: Vibe Coding](https://martinfowler.com/bliki/VibeCoding.html) — May 21 definition separating "forget that the code exists" from agentic programming where developers review and care about code structure.
- [Martin Fowler: Agentic Programming](https://martinfowler.com/bliki/AgenticProgramming.html) — companion concept for human oversight of LLM-generated code in maintained systems.
- [Propel Code: AI-Resistant Technical Evaluations](https://www.propelcode.ai/blog/ai-resistant-technical-evaluations-coding-agent-era) — May 26 practitioner argument that engineering evaluations should measure problem framing, validation, rejection of bad output, and tradeoff explanation under AI-assisted workflows.
- [Martin Fowler fragment on Chris Parsons' AI coding guide](https://martinfowler.com/fragments/2026-04-29.html) — older mechanism source emphasizing verification systems, review surfaces, and harness shaping over raw prompting.

**Counterargument / risk:** The counterargument is that language may not matter; competent teams will set concrete rules regardless of labels. The thesis weakens if "vibe coding" stabilizes into a narrow meaning in practice rather than continuing to swallow every AI-assisted workflow.

**Draftability:** High, because it turns a fuzzy cultural debate into a practical taxonomy for hiring, security review, and software maintenance.

**Suggested tags:** `ai`, `software`, `engineering`

## 2026-05-29 — Game studios are hiding AI where taste cannot see it

**Status:** Expired (2026-06-22)

**One-line thesis:** The emerging compromise in game AI is not AI-generated content; it is AI for QA, debugging, and internal evaluation, where studios can capture efficiency without asking players to trust machine taste.

**Why this is interesting now:** Capcom said in late May that generative AI still cannot match its creators for human sensibility but is useful in testing and debugging workflows. At the same time, Ubisoft is reportedly using Far Cry 7 as a generative-AI R&D testbed while emphasizing AI-powered QA bots and adaptive NPC systems in its earnings materials.

**Potential author angle:** Push a sharper claim than "players hate AI art": games are a medium where craft is part of the product, so AI adoption will route first into invisible operational loops unless a studio can prove AI creates play that humans could not script.

**Evidence checked:**
- [GamesRadar: Capcom says generative AI still cannot match devs but is useful for testing](https://www.gamesradar.com/games/resident-evil/capcom-says-generative-ai-still-cannot-match-the-devs-who-make-resident-evil-and-monster-hunter-but-it-is-useful-for-testing-games/) — reports Capcom's distinction between no AI-generated game assets and AI-assisted communication/debugging/playtesting.
- [Tom's Hardware: Ubisoft reportedly testing generative AI in Far Cry 7](https://www.tomshardware.com/tech-industry/artificial-intelligence/ubisoft-reportedly-testing-generative-ai-in-far-cry-7-as-company-posts-record-1-3-billion-loss) — May 24 reporting on Far Cry 7 R&D claims, Ubisoft's Teammates investment, AI-powered QA bots, and adaptive NPC systems; the Far Cry claim remains unconfirmed by Ubisoft.
- [Ars Technica: Sony says efficient AI tools will lead to more games flooding the market](https://arstechnica.com/gaming/2026/05/sony-says-efficient-ai-tools-will-lead-to-even-more-games-flooding-the-market/) — earlier May signal that platform executives expect AI tools to increase release volume, useful as the market-pressure counterpoint.
- [GDC 2026 State of the Game Industry report](https://gdconf.com/state-game-industry/) — broader sentiment context on developer concern about generative AI in games.

**Counterargument / risk:** The counterargument is that invisible AI will not stay invisible: generated NPC dialogue, animation, or textures may become normal if players cannot tell or if quality is high enough. The thesis is false if a major shipped title makes player-facing generative AI feel authored rather than cheap.

**Draftability:** Medium, because it has a strong AI x gaming angle but should be written carefully around unconfirmed Ubisoft reporting.

**Suggested tags:** `ai`, `gaming`, `media`

## 2026-06-22 — The scarce part of an AI loop is knowing when to stop

**Status:** Backlog

**One-line thesis:** "Loop engineering" turns managerial judgment into termination conditions: if a team cannot define evidence that the work is done, an autonomous agent loop only automates scope creep.

**Why this is interesting now:** The June discussion around loop engineering is moving coding-agent practice beyond one-shot prompts toward persistent loops with makers, checkers, memory, and explicit exit conditions. The under-synthesized point is that this does not remove management work. It forces teams to encode the hardest managerial question: what observable state is good enough to stop spending.

**Potential author angle:** Push past "prompt engineering is dead" and argue that the real successor is acceptance-criteria engineering. The valuable human is not the person with the cleverest instruction. It is the person who can define a falsifiable finish line, choose the right checker, and decide when another iteration has negative value.

**Author hook:** This extends the published position in [The real AI bottleneck is not intelligence. It is coordination.](../src/content/posts/consulting-coordination.en.md): AI works best where ground truth is cheap, while judgment-heavy work resists automated review. A loop is therefore a coordination system whose quality is bounded by its definition of done.

**Evidence checked:**
- [Addy Osmani: Loop Engineering](https://addyosmani.com/blog/loop-engineering/) — June 7 practitioner synthesis of the maker/checker pattern, fresh context per iteration, persistent memory, and explicit exit conditions; useful as the clearest current statement of the practice rather than proof that it works universally.
- [Coding Agents Don't Know When to Act](https://arxiv.org/abs/2605.07769) — May 8 FixedBench paper showing agents proposed undesirable code changes in 35–65% of tasks where no change was needed, which supports the claim that stopping and abstention are first-class evaluation problems.
- [Google DeepMind: Securing the future of AI agents](https://deepmind.google/blog/securing-the-future-of-ai-agents/) — June 18 primary report on monitoring one million coding-agent tasks; most flagged events came from misinterpretation or overeagerness rather than adversarial intent.

**Counterargument / risk:** Strong teams already write tests, acceptance criteria, and budgets, so "loop engineering" may be a new label for continuous integration plus a retry script. The thesis becomes false if general-purpose agents learn reliable abstention and stopping from ordinary task context without teams investing in explicit checkers or finish conditions.

**Two interview questions:**
1. In your own use of coding automations, where did the agent keep improving the wrong thing because "done" was underspecified?
2. Which business decisions have no affordable checker, and therefore should never be put inside an autonomous loop?

**Draftability:** High, because it turns a fashionable workflow term into a concrete operating claim with an obvious test: show the stopping condition.

**Suggested tags:** `ai`, `software`, `management`

## 2026-06-22 — Humanoid is an interface standard, not a body plan

**Status:** Backlog

**One-line thesis:** General-purpose robots will copy the parts of humans that buildings and tools require, especially reach and hands, while discarding expensive anatomy such as legs whenever wheels can do the job.

**Why this is interesting now:** Genesis AI introduced Eno on June 16 as a wheeled robot with two arms, five-finger hands, and a human-scale torso. That combination is a useful counter-signal to the industry's fixation on bipedal silhouettes. The early idea is that "humanoid" may settle into a compatibility standard for a world built around human bodies, not a requirement to reproduce the entire body.

**Potential author angle:** Separate human compatibility from human imitation. Doors, shelves, tools, and workstations create a strong reason to keep human-like reach and manipulation. They do not automatically justify the cost, instability, and energy demands of legs on flat factory or household floors.

**Author hook:** None. It still earns a slot because it offers a specific mechanism-level robotics thesis that can be tested across new commercial designs, and it is meaningfully different from the expired backlog item about proving warehouse utilization.

**Evidence checked:**
- [Genesis AI: Meet Eno](https://www.genesis.ai/press/meet-eno) — June 16 primary announcement describing a wheeled base, adjustable human-scale height, articulated arms, and human-shaped hands; company performance claims remain unverified.
- [The Verge: The next humanoid robot might not look human at all](https://www.theverge.com/ai-artificial-intelligence/951283/genesis-ai-humanoid-robot-eno) — June 17 near-primary reporting on the design rationale and the choice to prioritize human capability over human appearance.
- [Do Robots Really Need Anthropomorphic Hands?](https://arxiv.org/abs/2508.05415) — older mechanism source arguing that five-finger human mimicry adds complexity and cost, and that a four-finger design can preserve much of the useful capability.
- [X2-N: A Wheel-Legged Humanoid Robot](https://arxiv.org/abs/2604.21541) — April 2026 research example combining wheels and legs to gain flat-ground efficiency without giving up obstacle-crossing ability, supporting a spectrum of compatibility choices rather than one canonical humanoid form.
- [SyLink: A Modular Anthropomorphic Robotic Hand](https://arxiv.org/abs/2606.14250) — June 16 primary research signal showing the opposite design pressure: high-fidelity human compatibility can justify 22 degrees of freedom when dexterous tool use is the target.

**Counterargument / risk:** Stairs, curbs, clutter, and human expectations may make legs and a familiar silhouette commercially valuable outside controlled floors. The thesis is false if customers consistently pay more for fully bipedal robots because environmental coverage and social acceptance outweigh cost and reliability penalties.

**Two interview questions:**
1. Which parts of the human body are genuinely an API for the built world, and which are robotics companies copying mainly because the demo looks convincing?
2. Would you trust a less human-looking robot more if its design made its limits obvious?

**Draftability:** High, because the argument is visual, concrete, and falsifiable as commercial robots reveal which pieces of the humanoid template survive.

**Suggested tags:** `robotics`, `ai`, `design`, `business`

## 2026-06-22 — AI can automate creative work faster than industries can reproduce taste

**Status:** Backlog

**One-line thesis:** The deepest labor risk in games and other creative fields is not that AI replaces taste, but that it removes the low-risk repetitions through which juniors acquire taste, leaving senior talent productive but non-renewable.

**Why this is interesting now:** A June 17 feature based on interviews with 32 game developers found broad agreement that AI will reshape production but sharp disagreement over whether it expands creativity or degrades craft. The more specific signal sits underneath that debate: entry-level roles are already scarce, and the production tasks most likely to be automated are also the practice ground from which future art directors, designers, and technical leads emerge.

**Potential author angle:** Extend the author's consulting "apprenticeship problem" into a creative industry where the missing skill is not just correctness but taste. The uncomfortable claim is that a studio can improve short-run output per employee while quietly liquidating the training process that renews its senior bench.

**Author hook:** This directly extends [The apprenticeship problem](../src/content/posts/consulting-barbell.en.md#the-apprenticeship-problem), which argues that removing grunt work can break the path from junior repetition to senior judgment. Games make the mechanism easier to see because the output depends on accumulated aesthetic and technical taste.

**Evidence checked:**
- [GamesRadar: Why so many game developers don't want to use generative AI](https://www.gamesradar.com/games/why-so-many-game-developers-dont-want-to-use-generative-ai/) — June 17 feature based on 32 interviews, including direct concerns from David Gaider and Rami Ismail that eliminating entry-level work breaks the next-generation talent pipeline.
- [Creative Bloq: Are junior creative roles really disappearing?](https://www.creativebloq.com/professional-development/creative-careers/are-junior-creative-roles-really-disappearing) — June 5 reporting that the share of surveyed agencies employing graduate trainees fell from 56% to 43.4%, while only 13% of a 100-listing sample was entry-level; interviewees stress that AI is not the only cause.
- [From Help to Harm: Rethinking AI Assistance in Complex Software Tasks](https://arxiv.org/abs/2602.00496) — February 2026 mixed-method study of 57 developers finding that AI assistance helped novices on simpler tasks but hurt them on more complex work, while experts remained better able to detect and correct bad guidance.
- [No Regrets: Investigating and Mitigating Hindsight Bias in AI-Assisted Software Development](https://arxiv.org/abs/2601.20245) — January 2026 experiment finding that junior developers were more likely to accept incorrect AI-generated explanations, while senior developers corrected errors more consistently; an older cross-domain mechanism source, not direct evidence about games.

**Counterargument / risk:** AI can also increase the number and speed of practice cycles, let small teams attempt work previously reserved for large studios, and expose juniors to higher-level decisions sooner. The thesis weakens if AI-native juniors develop independent taste faster, or if studios replace production apprenticeship with deliberate critique, rotation, and reverse-engineering programs.

**Two interview questions:**
1. Which boring tasks in your own career looked disposable at the time but later turned out to be where your judgment formed?
2. If a junior can produce senior-looking work with AI, what evidence would convince you that they understand why it is good rather than merely recognizing the output?

**Draftability:** High, because it connects consulting, software, and games through one sharp mechanism while preserving a serious counter-case.

**Suggested tags:** `ai`, `gaming`, `work`, `culture`
