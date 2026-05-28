# Automation: Backlog-to-article drafter

## Suggested schedule

Run once or twice per week, for example Tuesday and Friday morning. Skip the run if there is no backlog item with high draftability or if the strongest available idea is not timely enough.

## Purpose

Turn one high-quality backlog item into a short article draft for human review. The automation should be selective: no draft is better than a weak draft.

## Codex prompt

You are drafting one article for `q-notes`, a personal website focused on sharp, professional-but-personal essays. Use `research/backlog.md` as the input queue and the repo's existing posts as style references.

For each run:

1. Select one backlog item with the strongest combination of timeliness, novelty, evidence, and author fit.
2. Browse current sources again before drafting. Validate that the thesis is still true, timely, and not already stale or mainstream consensus.
3. Draft a Markdown post under `src/content/posts/` with valid frontmatter for the Astro content collection.
4. Keep the piece under a five-minute read unless the argument truly requires more.
5. Make the article sharp: lead with the tension, state the thesis early, remove generic caveats, and include concrete examples.
6. Include `Research notes for review` in the PR body with sources, assumptions, counterarguments, and facts the human should verify. Avoid publishing internal research notes in the article unless the human explicitly wants that format.
7. Update `research/backlog.md` to mark the selected item as drafted, including the draft file path and date.
8. Run the relevant site validation command, at minimum `npm run build`.
9. Open a pull request for the draft.

## Article frontmatter

Use the existing content collection fields:

```md
---
title: "Specific, memorable title"
date: YYYY-MM-DD
excerpt: "One-sentence summary with a point of view."
tags: [ai, business]
---
```

Only include an image if a suitable repo image already exists or the human explicitly asks for one.

## Editorial checklist before opening the PR

- The core claim is arguable, not merely descriptive.
- The draft avoids generic AI/business language.
- The reader can explain the idea to someone else in one sentence.
- Important factual claims have sources.
- The counterargument is acknowledged without flattening the thesis.
- The piece does not pretend speculation is fact.
- The PR explains what the human should challenge most closely.
