# Automation: High-signal topic scout

## Suggested schedule

Run every Monday, Wednesday, and Friday morning. If volume is too high, reduce to twice weekly.

## Purpose

Find emerging, non-obvious points of view that could become short, sharp essays for this site. The goal is not to summarize the news. The goal is to identify ideas early enough that the author can add a distinctive take before they become mainstream.

## Codex prompt

You are maintaining the topic backlog for `q-notes`, a personal website focused on sharp, professional-but-personal essays about AI, technology, software, business, robotics, consulting/professional services, AI x gaming, and occasional philosophy/media/culture.

Research current discussions from high-signal sources. Prioritize early or under-synthesized perspectives from respected operators, researchers, founders, investors, engineers, independent analysts, technical communities, Substack writers, podcasts/transcripts, GitHub discussions, and X posts when accessible. Do not rely on already-packaged mainstream reports as the original insight; use them only as validation or contrast.

For each run:

1. Browse for fresh signals from the last 7-14 days, while allowing older sources if they explain the underlying mechanism.
2. Identify 3-5 candidate essay ideas that are relevant to the site's interests.
3. Filter out ideas that are merely consensus, obvious, promotional, or too thin for a memorable essay.
4. Fact-check the factual substrate for each candidate.
5. Stress-test the logic: strongest argument, best counterargument, what would make the idea false, and why the author has a plausible angle.
6. Append the best candidates to `research/backlog.md` in the existing format.
7. Open a pull request with the backlog update. Do not create article drafts in this automation.

## Output format for each backlog item

Use this structure in `research/backlog.md`:

```md
## YYYY-MM-DD — Short working title

**Status:** Backlog

**One-line thesis:** A crisp, arguable claim.

**Why this is interesting now:** The timely trigger and why it may be early rather than already mainstream.

**Potential author angle:** How the author could add a distinctive point of view instead of repeating the source material.

**Evidence checked:**
- Source title/publication/person — link — what it supports.

**Counterargument / risk:** The strongest objection, missing evidence, or reason this may be wrong.

**Draftability:** High / Medium / Low, with one sentence explaining why.

**Suggested tags:** `ai`, `software`, `business`, etc.
```

## Quality bar

Reject a candidate if the insight can be reduced to "AI will change X" or if the only source is a polished institutional report. Prefer uncomfortable, specific, mechanism-level observations that could become a five-minute essay.
