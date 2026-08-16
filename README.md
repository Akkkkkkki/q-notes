# q-notes

Source for [Q's Notes](https://notes.qiuyue.dev) — a personal, bilingual (English / 中文)
blog for notes, essays, and opinions on AI, technology, software, business, consulting,
and the occasional aside on games, books, films, or culture.

## What's in this repo

This repo is two things layered together:

1. **A small Astro site** — the blog itself: posts, layouts, pages, and styles.
2. **An editorial pipeline** — automation prompts that scout topics, interview the
   author, draft bilingual posts, and run a weekly publish loop, so writing the
   author's own point of view is the only manual step. If you're an agent (or human)
   working on content here, start with [`AGENTS.md`](./AGENTS.md).

## Stack

- [Astro](https://astro.build/) (static output) + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com/)
- Astro content collections for posts
- Deployed to Cloudflare Workers via [Wrangler](https://developers.cloudflare.com/workers/wrangler/)

## Development

```bash
npm install
npm run dev          # http://localhost:4321
npm run build        # production build to dist/
npm run preview      # preview the production build
npm run deploy:check # build + dry-run Wrangler deploy
npm test             # Companion Worker API test suite (vitest)
```

## Project structure

```
├── automations/        # Editorial pipeline prompts (scout, interview, drafter, ship gate, gardener)
├── docs/
│   ├── pipeline.md          # Editorial pipeline design - source of truth
│   ├── material-form.md     # Normative material/form addendum (Issue #67)
│   ├── material-form.zh.md  # Simplified Chinese companion to material-form.md
│   ├── pipeline.zh.md       # Simplified Chinese companion to pipeline.md
│   ├── companion-vision.md  # Vision for a phone-first companion app
│   └── ops-runbook.md       # Worker secrets: setup, health check, why tokens vanish
├── research/
│   ├── backlog.md           # Topic backlog
│   ├── inbox.md             # Author's raw idea inbox
│   ├── voice.md             # Voiceprint: stances, signature phrasing, never-say terms
│   ├── human-voice.md       # Human-voice playbook: machine-tell diagnosis + pre-publish human pass
│   ├── glossary.md          # EN <-> 中文 glossary for transcreation
│   └── interviews/          # Interview briefs + author answers
├── src/
│   ├── components/      # Astro components (post cards, lists, dark mode toggle, ...)
│   ├── content/posts/   # Blog posts (Markdown)
│   ├── layouts/         # Base + post layouts
│   ├── pages/           # Routes (home, journal, posts, tags, about, RSS)
│   ├── styles/
│   └── utils/
├── public/              # Static assets (fonts, images, favicon, Capture PWA manifest + SW)
├── scripts/             # One-off helpers (VAPID keygen for web push)
├── tests/               # Companion Worker API tests (vitest, mocked GitHub API)
├── worker/              # Companion API (Cloudflare Worker: capture, interview, desk, push)
├── astro.config.mjs
└── wrangler.jsonc       # Cloudflare Workers deploy config
```

## Writing a post

Posts live in `src/content/posts/` as Markdown, with frontmatter validated by
`src/content.config.ts`:

```yaml
---
title: Post title
date: 2026-06-01
excerpt: One- or two-sentence summary used in lists, RSS, and OG tags.
image: /images/my-image.jpg   # optional
tags: ["ai", "software", "essay"]   # include a tier tag: note / essay / tracker
lang: en                            # en | zh
translationKey: post-slug           # shared by the en/zh pair; also the URL slug
maturity: growing                   # seedling | growing | evergreen
---
```

The reading layout also surfaces four **optional** structured blocks when present —
`definedTerm`, `prediction`, `sources`, and `connections` (the note graph, by
`translationKey`). See the frontmatter contract in
[`docs/pipeline.md`](./docs/pipeline.md#optional-reading-layout-frontmatter).

Images referenced from frontmatter or post content go in `public/images/`.

## Editorial pipeline

Most posts here come out of a weekly automation loop (scout -> interview -> author
braindump -> draft -> ship gate, plus a monthly gardener pass) rather than ad hoc
writing. The full design — content tiers (note / essay / tracker), the bilingual
transcreation contract, and per-tier definitions of done — lives in
[`docs/pipeline.md`](./docs/pipeline.md). The material-driven form rules in
[`docs/material-form.md`](./docs/material-form.md) normatively amend the older tier
wording: Ready-to-draft is authorization, not an Essay selection; Material Audit runs
before form/tier/outline; length has ceilings rather than minimum fill targets; and the
ship gate trims/downgrades instead of inventing missing editorial furniture.
[`AGENTS.md`](./AGENTS.md) is the always-on summary any agent should read before drafting
or editing content, and [`docs/companion-vision.md`](./docs/companion-vision.md) sketches
a possible phone-first companion app for the pipeline's recurring author touchpoints.

## Companion — Today + Capture + Answer + Publish

The phone-first companion app from [`docs/companion-vision.md`](./docs/companion-vision.md)
exists as its first three phases plus a pipeline overview, installable as one PWA.
Repo-as-backend: the app owns no data; everything reads and writes the same files the
automations use.

All four screens share one shell (`src/layouts/CompanionLayout.astro`): a bottom tab
bar sized for thumbs, count badges fed by `GET /api/flow` (cached a few minutes so
Capture stays fast), one "Connect this phone" onboarding for the device key, one
plain-language banner when the Worker loses its secrets (ops detail folded behind a
"how to fix" disclosure), a header **EN / 中 language toggle** for the app chrome
(English or Simplified Chinese, remembered per device via a centralized `QN.t`
dictionary), and shared `window.QN` helpers (auth'd fetch, status line,
Web Speech dictation). On-screen copy speaks plain language — thoughts, questions,
drafts — while URLs, file formats, and the API keep the pipeline's original names.

**Today** (`/flow`) — the home screen; the whole pipeline at a glance:

- **Up to you**: a prioritized list computed from the pipeline's clocks — PRs the
  ship gate marked ready, PRs approaching the 7-day downgrade / 14-day close, the
  week's half-answered brief (with days until Thursday's drafter), backlog items
  within 5 days of their 21-day expiry, and one aged unconsumed spark resurfaced as a
  "still true?" question.
- **The stage rail**: your thoughts → topic queue → this week's questions → waiting
  to publish → published, each with counts, items, and the schedule of the automation
  that moves things along (scout Mon, interviewer Tue, drafter Thu, gate Fri) — plus
  a "How this works" disclosure explaining the weekly rhythm in plain words.
- **Quick capture**: a one-line spark box riding the same `POST /api/spark` writer.
- Everything read-only otherwise (`GET /api/flow`); items deep-link into Capture /
  Answer / Publish for the actual actions.

**Capture** (`/capture`) — "thought to repo in under 15 seconds":

- One text box with a dictation mic and an EN/中 language toggle (Web Speech API where
  available; OS keyboard dictation works everywhere). English, 中文, or mixed — one
  line per thought, landing as a dated line in `research/inbox.md` (commit message
  `spark: <first words>`).
- **Tidy into lines**: a **Tidy** toggle segments a voice dump into numbered lines —
  your words kept, only split at sentence boundaries — each landing as its own inbox
  spark in one commit (tap a number to split, hold to merge, tap text to edit). **Raw**
  keeps it as one thought.
- **Kind**: a chip row (Spark / Question / Quote / Link) tags the capture so the inbox
  carries the author's framing; the inbox stays format-free and the tags stay light.
- **Offline queue**: sparks queue in the browser and send when back online.
- **Share target**: on Android, share a URL or quote from any app into Capture; the
  source lands as provenance (`… ← <url>`). On iOS, an Apple Shortcut can POST to the
  same endpoint (see below).
- **Reward loop**: after sending, the last three sparks are shown, including any
  `→ where it went` annotations once automations consume them.

**Answer** (`/interview`) — "answer five questions on a commute":

- The week's brief from `research/interviews/` rendered as a conversation: the
  three-sentence idea on top, a progress line, one card per question with its own
  dictation mic. Dictate or type; each answer commits immediately into the brief's
  `## Author answers` section, attributed per question — resumable across days,
  exactly as the drafter expects.
- **Answer directions**: where the interviewer offered them, a question surfaces them by
  type — **choices** (stances to take, as chips), a **push-back** (a steelman to argue
  against, in an amber callout), and a **reading** (one link worth a look). Tapping a
  choice or push-back seeds the box with an opening to edit or talk over — a prompt for
  when a cold question is the hard part, never an answer put in your mouth. One question
  is open at a time; answered ones collapse with a check.
- **Ready to draft**: answering is never automatically consumed. Answer some now,
  finish later, and tap **Ready to draft** when *you* decide. That green light authorizes
  the supplied answers for publishable use; it does **not** select Essay or promise a
  complete argument. Thursday runs the Material Audit and chooses the smallest honest
  form the material supports — a Note/field note/question memo may be the right result,
  and a real Essay still has to earn its density. Leave the brief un-marked and the
  drafter will not build an Essay on answers you did not sign off; reopen a ready brief
  any time to keep editing.
- Skipping a question is just not answering it; **Not this topic** closes the whole
  brief in one tap, freeing Thursday's drafter to use the fallback ladder.
- **Tuesday push** (optional): a cron checks every Tuesday 08:30 whether the fresh
  brief is still unanswered and wakes subscribed devices via web push. Enable it from
  the Answer page once VAPID keys are configured.

**Publish** (`/desk`) — "ship from the couch":

- One card per open **content** PR (a PR qualifies only if every changed file lives
  under `src/content/`, `drafts/`, `research/`, or `public/images/` — the phone can
  never see or merge a code PR). Each card leads with a plain-language status derived
  from the ship gate's verdict (**Ready to publish** / **Needs your call** / **Not
  checked yet**, full verdict behind a disclosure), tier, age, and a big "Read it"
  button to the rendered branch preview — prose approved as prose, not as a diff.
- **Voice panel**: the drafter's verbatim-spine list (*your words, kept*) and one
  "is that yours?" question per untraceable opinion, resolved with one-tap
  **Keep** / **Cut** (lands as a PR comment the next automation run acts on).
- **Publish** offers the two author-owned slots — pick a title (the drafter's three
  options, or type your own) and dictate a replacement last line — both skippable in
  one tap, then merges. The slots ride `POST /api/desk/slots`, the only writer that
  ever touches `src/content/**`: PR branches only, title frontmatter line and final
  paragraph only.
- **Ask for one change** (a dictated sentence as a PR comment), **Make it a note**
  (invokes the documented downgrade remedy), and **Discard** (comments and closes —
  letting one go is a valid outcome).
- **Friday push** (optional): after the ship gate's Friday-morning pass, a 08:30 cron
  wakes subscribed devices if anything is sitting on the desk.

### One-time setup

1. Create a fine-grained GitHub PAT scoped to **this repo only**, with
   **Contents: read and write** and **Pull requests: read and write** as its only
   permissions.
2. Set the Worker secrets:
   ```bash
   npx wrangler secret put GITHUB_TOKEN    # the PAT
   npx wrangler secret put CAPTURE_TOKEN   # any long random string, e.g. `openssl rand -hex 24`
   ```
   **As Secrets, never as dashboard Text variables** — every deploy (including
   git-triggered ones) replaces Text variables with the `vars` block in
   `wrangler.jsonc`, which is how tokens silently disappear. Check any time with
   `curl https://<site>/api/health`. Full story: [`docs/ops-runbook.md`](./docs/ops-runbook.md).
3. Deploy (`npm run build && npx wrangler deploy`), open `/capture` on the phone,
   paste the `CAPTURE_TOKEN` once into the "Connect this phone" card (stored
   on-device), and add to home screen.
4. Optional web push: `node scripts/generate-vapid.mjs`, store the two values with
   `npx wrangler secret put VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_JWK`, redeploy, then tap
   "Notify me when questions arrive" on `/interview` (requires the PWA to be installed
   on iOS).
5. Optional hardening: put Cloudflare Access in front of `/capture`, `/interview`,
   `/desk`, and `/api/*`.
6. Optional iOS share sheet: an Apple Shortcut that sends
   `POST /api/spark` with header `Authorization: Bearer <CAPTURE_TOKEN>` and JSON body
   `{"text": "...", "url": "..."}`.

The API surface stays small, and every writable path is hard-coded in the Worker:
`GET /api/health` (unauthenticated presence booleans, for diagnosing lost secrets);
`POST /api/spark` → `research/inbox.md`; `GET /api/sparks`; `GET /api/flow`
(read-only aggregation); `GET /api/brief`,
`POST /api/answer`, `POST /api/brief/close`, `POST /api/brief/ready` →
`research/interviews/*.md`;
`GET /api/desk`; `POST /api/desk/{ship,comment,kill}` → content PRs only;
`POST /api/desk/slots` → `src/content/**` / `drafts/**` on PR branches only;
`GET /api/push/key`, `POST /api/push/{subscribe,unsubscribe}` →
`research/.companion/push-subscriptions.json`. Local dev: put the secrets in
`.dev.vars` and run `npx wrangler dev` after a build.

## Content gate (CI)

`.github/workflows/content-gate.yml` runs on every PR. It runs
`scripts/content-gate.mjs` over the posts the PR adds, changes, or deletes —
checking the tier tag, the bilingual pair (including orphaning by deletion), and
that essays carry a source link (plus advisory over-ceiling / em-dash / run-on
warnings) — and then a full `npm run build`. Errors block; warnings don't. A PR
that changes no posts passes cheaply, so it's safe to make this a required check.

To make review-before-publish a hard rule, set this as a **required status check** in
GitHub branch protection for `main` (Settings → Branches → Add rule → require the
`Content gate / gate` check). Then a content PR cannot merge until the gate passes, and
the only path to the live site is through a PR — reviewed on the `/desk` surface or on
GitHub. Run it locally before pushing with `node scripts/content-gate.mjs <files>`.

## Deployment

The site builds to static files (`npm run build`) and deploys to Cloudflare Workers
using the config in `wrangler.jsonc`. `npm run deploy:check` runs a build and a
dry-run upload to catch configuration issues before a real deploy.
