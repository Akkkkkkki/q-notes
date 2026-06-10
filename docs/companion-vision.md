# q-notes Companion — product vision

A phone-first companion app for the q-notes editorial pipeline. Not a blog editor, not a
CMS — a tool that makes the author's three recurring touchpoints (capture a spark, answer
an interview, approve a ship) take two minutes from anywhere.

Status: vision. Builds on [`docs/pipeline.md`](./pipeline.md); references issues
[#7](https://github.com/Akkkkkkki/q-notes/issues/7) (bilingual site) and
[#8](https://github.com/Akkkkkkki/q-notes/issues/8) (inbox seeding).

---

## 1. Should this exist? The honest case

**The case for.** The pipeline deliberately compressed the author's role into three
phone-sized moments per week. Each one currently routes through GitHub's mobile UI,
which is built for code review, not for thought capture:

| Moment | Today | Friction |
|---|---|---|
| Capture a spark | GitHub app → repo → `research/inbox.md` → edit → commit | ~8 taps, a markdown editor, a commit dialog. Sparks die in transit. |
| Answer an interview | Find the file under `research/interviews/`, edit raw markdown between headings, commit | Editing *within* a structured file on a phone keyboard is genuinely hostile. This is the highest-leverage moment in the whole pipeline and currently the worst UX. |
| Approve a ship | Read a PR diff of two markdown files, merge | Diffs are the wrong reading surface for prose; the branch preview URL exists but is buried in a bot comment. |

The pipeline's health metrics (§9 of the pipeline doc) depend directly on these moments
happening. If capture costs 8 taps, the origination ratio target (≥60% author-rooted
pieces) will be missed — not because the author lacks thoughts, but because the funnel
leaks at the top.

**The case against — and the rule it produces.** A solo author building a custom app is
the classic procrastination trap: the tool becomes the project, and "I'll write once the
app is nicer" is perfectionism wearing a hoodie. So this vision adopts three hard rules:

1. **Repo-as-backend.** The app owns no data. It reads and writes the same files the
   automations use (`research/inbox.md`, `research/interviews/*`, content PRs) through
   the GitHub API. If the app dies tomorrow, nothing in the pipeline changes.
2. **Each phase fits in one weekend** and ships with a kill criterion (§7). Companion
   work never counts toward the publishing metrics, and a Companion phase may not start
   in any month where the publishing target was missed. Writing outranks tooling, always.
3. **Build nothing that an existing surface already does well.** Phase 0 is explicitly
   "try the no-code version first."

**Verdict: yes, build it — as a thin client over the repo, in phases, smallest first.**

## 2. What it is and is not

**It is** a PWA (installable from the browser, no app store) with exactly three surfaces
mapped to the three moments: **Capture**, **Interview**, **Desk**.

**It is not:**

- ✗ A markdown editor or writing app. Long-form writing on a phone is an anti-goal;
  structuring prose is the drafter automation's job. The author supplies raw thought.
- ✗ A CMS (Decap/Tina/etc. solve the wrong job — they make *editing posts* easier;
  our bottleneck is *capturing thinking*).
- ✗ A reader, analytics dashboard, comment system, or anything aimed at the audience.
- ✗ A second backend. No database, no user system, no sync engine. The git repo is the
  database; the automations are the application logic; this is a remote control.

## 3. The three surfaces

### 3.1 Capture — "thought to repo in under 15 seconds"

The app opens directly into a single text box with the keyboard up and the mic button
prominent. Type or dictate; hit send; done. The entry lands as a dated line in
`research/inbox.md` (committed via API with message `spark: <first words>`).

- **Voice-first**: OS dictation by default (free, offline, instant). A long-press
  "ramble mode" records audio and transcribes via the API proxy (Whisper or equivalent)
  for thoughts too messy to dictate linearly — the transcript lands as the spark, raw.
- **Share-sheet target**: share a URL, quote, or screenshot caption from any app →
  becomes a spark with the source attached (`2026-06-14 — <comment> ← <url>`). Half of
  good sparks are reactions to something just read; this captures the reaction *and* the
  provenance the scout needs.
- **Mixed-language as designed**: English, 中文, or both in one line — the pipeline
  already treats that as first-class input.
- **Offline queue**: sparks queue locally and commit when back online (subway-proof).
- After sending, show the last 3 sparks with their `→ where it went` annotations when
  the automations have consumed them. Seeing sparks *become posts* is the reward loop
  that keeps capture alive.

### 3.2 Interview — "answer five questions on a commute"

The week's interview brief, rendered as a conversation instead of a markdown file:
the three-sentence idea on top, then one question per card. Tap a card, dictate or type
an answer, move on. Partial answers save immediately (each answer commits into the
`## Author answers` section of the interview file, attributed per question).

- **Voice-dump quality is the contract** — the UI says so on every card. No formatting
  controls exist, deliberately: nothing to polish means nothing to procrastinate on.
- **One follow-up, max**: after an answer, the app may ask a single clarifying follow-up
  generated from the brief's counterargument ("You said X — what about <counterargument>?").
  Capped at one per question so the session stays under 30 minutes and interviewing
  never becomes interrogation.
- **Resumable**: answer two questions Tuesday, three Thursday morning; the drafter takes
  whatever exists at draft time, exactly as the pipeline already specifies.
- A skip button per question and a "not this topic" button for the whole brief (marks it
  closed, frees Thursday's drafter to use the fallback ladder). Declining must be as
  easy as answering — guilt is a churn mechanism.

### 3.3 Desk — "ship from the couch"

One card per open content PR, built from the ship gate's output:

- The verdict ("Ready to ship" / "Needs your call on: …"), the 3-bullet summary, tier,
  and maturity level.
- **Reader-mode preview, not a diff**: the card embeds the Cloudflare branch preview URL
  (already generated per PR) shown as the actual rendered post, with an EN ⇄ 中文 toggle
  once issue #7 lands. Prose should be approved as prose.
- Three buttons: **Ship** (merge), **One change** (free-text/dictated comment that the
  ship gate or drafter acts on next run), **Downgrade to note** (invokes the documented
  remedy). A fourth, smaller: **Kill**.
- Push notifications (web push) replace the email channel for the Tuesday brief, the
  Friday desk summary, and the monthly gardener report. Notification deep-links open the
  relevant surface directly.

## 4. Architecture

```
Phone (PWA: Capture / Interview / Desk)
   │  HTTPS + Cloudflare Access (author-only auth)
   ▼
Cloudflare Worker API proxy            ← same account already hosting the site
   │  fine-grained GitHub PAT (server-side only):
   │    contents: read/write on research/** and drafts/**
   │    pull_requests: read, merge, comment
   ▼
GitHub repo  ◄── automations 01–05 (unchanged)
```

Decisions and their reasons:

- **PWA, no app store.** Install from Safari/Chrome, web push works on modern iOS/Android,
  zero review process, one codebase. Static assets ship from the existing Worker.
- **Worker as the only secret-holder.** The PAT never reaches the phone. The Worker
  exposes ~6 narrow endpoints (`append-spark`, `get-brief`, `save-answer`, `list-desk`,
  `merge-pr`, `comment-pr`) rather than proxying the GitHub API generically — the app
  physically cannot do anything the pipeline didn't intend.
- **Cloudflare Access for auth** (free tier, one email): no password code to write, and
  a lost phone is revoked in the dashboard.
- **No framework ceremony.** Three screens of vanilla or near-vanilla code (e.g., one
  small Astro/Vite app in `companion/` in this repo). The repo already deploys on push;
  the Companion rides the same pipeline.
- **Transcription** (ramble mode) is the only model call the app makes, via the Worker.
  Everything generative stays in the scheduled automations, where it's reviewable.

## 5. What the best UX here actually is — design principles

1. **Two-minute ceilings.** Every surface is designed to be *completable* in one elevator
   ride (Capture) or one commute (Interview). If a session can't finish small, the
   surface is wrong.
2. **Voice before keyboard, keyboard before formatting, formatting never.** The app's
   entire job is lowering the fidelity the author owes. Raw thought in; the pipeline owes
   the polish.
3. **Close the loop visibly.** Sparks show where they went; interviews show the PR they
   became; the Desk shows the published URL after shipping. Momentum the author can *see*
   is the strongest anti-perfectionism force available.
4. **Declining is a first-class action.** Skip, "not this topic," downgrade, kill — all
   one tap. A system the author can cheaply say no to is one they'll keep saying yes to.
5. **The app never asks for writing.** If any future feature involves composing
   paragraphs on the phone, it violates the vision. (Editing a *sentence* in the One
   change flow is the permitted maximum.)

## 6. Phasing — smallest thing first, kill criteria attached

**Phase 0 — no code (now).** Wire a notification channel (email or a messaging
connector) for routines 02/04/05; bookmark `research/inbox.md` on the phone's home
screen via GitHub mobile; optionally a messaging-bot connector that appends sparks.
*Run for 2–3 weeks. Measure: sparks/week, interview answer rate.*
**Kill criterion for the whole Companion: if Phase 0 sustains ≥5 sparks/week and
interviews get answered, stop here — the app isn't needed.**

**Phase 1 — Capture (one weekend).** Single page + `append-spark` endpoint + share
target + offline queue. *Kill criterion: if sparks/week doesn't roughly double versus
Phase 0 within a month, stop building and keep what exists.*

**Phase 2 — Interview (one weekend).** Brief rendering + per-question answers + push
notification for the Tuesday brief. *Success: interview answer rate ≥3 of 4 weeks.*

**Phase 3 — Desk (one weekend).** PR cards + preview embed + Ship/One change/Downgrade
+ Friday push. *Success: median draft→publish drops below the 7-day target.*

**Phase 4 — only if earned**: ramble-mode transcription, EN⇄中文 preview toggle (after
issue #7), spark annotations surfaced in-app. Nothing else is currently imaginable that
wouldn't violate §5.

## 7. Success metrics

Companion metrics are *funnel* metrics; the pipeline's publishing metrics remain the
only ones that matter terminally.

| Metric | Phase 0 baseline → target |
|---|---|
| Sparks captured / week | measure → ≥2× baseline |
| Median capture time (open → committed) | n/a → <15 s |
| Interview briefs answered (≥3 questions) | measure → 3 of 4 weeks |
| Median draft PR → publish | ≤7 days (pipeline target, Desk should secure it) |
| Companion build time / month after Phase 3 | → ~0 (it's done; done is a feature) |

## 8. Risks

- **Tool-building as procrastination** — the central risk, mitigated structurally: §1
  rule 2 (weekend cap, publishing-first gate), §6 kill criteria, §7's "done is a feature."
- **PAT blast radius** — mitigated by fine-grained scopes, narrow Worker endpoints, and
  Cloudflare Access; rotating the token is a 2-minute dashboard task.
- **iOS PWA limitations** — web push and share targets work on current iOS but lag
  Android; Phase 0/1 designs assume nothing beyond "installable page with a text box,"
  so the floor is safe.
- **Drift between app and pipeline** — mitigated by repo-as-backend: the automations and
  the app share files, not APIs, so the pipeline doc stays the single contract.

## 9. Alternatives considered

- **GitHub mobile only** — the Phase 0 control group; wins if friction was imaginary.
- **Messaging bot (Telegram/WhatsApp/iMessage connector) as the whole product** — superb
  for Capture, plausible for Interview, weak for Desk (no preview, no safe merge button).
  Retained as a Phase 0 option and as the fallback if PWA push proves unreliable on iOS.
- **Off-the-shelf CMS (Decap, Tina, Obsidian+git, working-copy workflows)** — all
  optimize *editing files*, which is the one thing this vision forbids optimizing. Wrong
  job to be done.
- **Native app** — strictly worse on iteration speed and distribution for an audience
  of one.
