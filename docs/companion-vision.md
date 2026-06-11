# q-notes Companion — product vision

A phone-first companion app for the q-notes editorial pipeline. Not a blog editor, not a
CMS — a tool that makes the author's three recurring touchpoints (capture a spark, answer
an interview, approve a ship) take two minutes from anywhere.

Status: vision (revised 2026-06-11 — added the voice mechanisms in §4, listen-to-review,
walk-mode interviews, ship-time author slots, and the spark echo). **Phase 1 (Capture)
is built**: the `/capture` PWA and the `append-spark` Worker endpoint live in this repo
(`src/pages/capture.astro`, `worker/index.ts`); setup steps are in the README. Builds on
[`docs/pipeline.md`](./pipeline.md); references issues
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
  provenance the scout needs. Android only via the Web Share Target API; iOS Safari does
  not support it, so on iPhone this ships as an Apple Shortcuts share-sheet action
  posting to the same `append-spark` endpoint (see §9).
- **Mixed-language as designed**: English, 中文, or both in one line — the pipeline
  already treats that as first-class input.
- **Offline queue**: sparks queue locally and commit when back online (subway-proof).
- After sending, show the last 3 sparks with their `→ where it went` annotations when
  the automations have consumed them. Seeing sparks *become posts* is the reward loop
  that keeps capture alive.
- **Spark echo** (Phase 4): in that same after-send slot, at most once a day, one aged
  unconsumed spark comes back as a question — *"Three weeks ago: '…'. Still true?"* —
  with three one-tap answers: **still true** / **wrong now** / **drop** (§4.4). The
  inbox composts instead of rotting, and "wrong now" turns the author's past self into
  a co-author. It never appears before sending; capture speed is sacred.

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
- **Walk mode** (Phase 4): press play and pocket the phone. On-device text-to-speech
  reads the three-sentence idea, then each question aloud; the author rambles; a pause
  or a tap advances to the next question. The whole brief fits a 25-minute walk, hands-
  and eyes-free. People think differently — better — while walking than while staring
  at a text box; this is the feature most likely to turn the pipeline's highest-leverage
  moment into something the author looks forward to.
- **Mirror question card**: when the brief quotes one of the author's own published
  sentences back at them (§4.4), it renders as a distinct quote card — visually, the
  author being interviewed by their own archive.
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
- **Listen-to-review** (Phase 4): a play button reads the draft aloud (on-device
  text-to-speech, en or zh). Tapping once while listening pins a dictated note to the
  paragraph being read; each pin becomes a paragraph-anchored One-change comment. The
  ear catches voice-fakeness the skimming eye forgives, and it turns review into a walk
  instead of a squint.
- **Voice panel**: each card shows the drafter's verbatim-spine list — *your words,
  kept* — and one flag per opinion the drafter could not trace to the author's input,
  rendered as a question ("Says X — yours?") with **keep** / **cut** buttons (§4.2).
- Three buttons: **Ship** (merge), **One change** (free-text/dictated comment that the
  ship gate or drafter acts on next run), **Downgrade to note** (invokes the documented
  remedy). A fourth, smaller: **Kill**.
- **Ship-time slots**: tapping Ship offers the two author-owned slots — the title pick
  and the last line (§4.3). Each is skippable in one tap and the drafter's defaults
  stand; shipping is never blocked.
- Push notifications (web push) replace the email channel for the Tuesday brief, the
  Friday desk summary, and the monthly gardener report. Notification deep-links open the
  relevant surface directly.

## 4. Keeping it human — voice mechanisms

Making writing easier has a known failure mode: pieces get easier to ship and less worth
shipping, because the author's opinions come out laundered into model-smooth consensus
prose. The pipeline already guards the *origin* of every opinion (interview answers,
sparks). This section guards its *texture* — and the guards are mechanisms, not vibes.

The striking thing: the highest-leverage mechanisms cost **zero app code**. They are
prompt and file changes to the existing automations, and they land now, before Phase 1.

### 4.1 The voiceprint — `research/voice.md`

A living file of the author's public stances, signature phrasings, never-say terms, and
rhythm notes. The drafter consults it before writing; the ship gate enforces the
never-list; the interviewer mines the stances for mirror questions; the gardener
proposes additions monthly (mined from that month's interview answers and published
pieces) under a `Proposed` heading the author promotes or deletes. Repo-as-backend,
again: the author's voice is a versioned file, not a vibe the model is asked to imagine.

### 4.2 The verbatim spine

The drafter must carry at least three of the author's own phrases — from interview
answers or sparks — into the draft verbatim, list them in the PR body, and separately
declare any opinion it *cannot* trace to author input (a list that should be empty).
The Desk renders this as the voice panel: *your words, kept*, plus one tap-to-resolve
question per untraceable opinion. The author never has to wonder which sentences are
theirs; the system shows them.

### 4.3 Author-owned slots

At ship time, two optional ten-second touches: pick the **title** (three drafter options
per language, or dictate your own) and the **last line** (keep it, or dictate a
replacement). Skipping either is one tap and the defaults stand — but when touched,
every published piece carries a deliberately human fingerprint in exactly the two
positions readers remember. This stays inside the "one sentence is the editing maximum"
ceiling (§6); it is the floor of authorship, not the start of a phone editor.

### 4.4 The author as their own interlocutor

Two mechanisms, one idea — nothing generates original writing more reliably than
disagreement, and the cheapest person to disagree with is yourself, last month:

- **Mirror questions**: the interview brief quotes one sentence the author actually
  published against the new thesis ("In *Consulting outcomes* you wrote '…' — does that
  survive here?"). The archive becomes the sharpest interviewer in the room.
- **Spark echo**: Capture occasionally resurfaces one aged, unconsumed spark as a
  question with **still true** (annotates and bumps it for the scout) / **wrong now**
  (appends the disagreement as a fresh spark — the most honest tracker fuel there is) /
  **drop** (archives it).

### The guardrail over all of it

**The anti-perfectionism contract outranks the voice contract.** No voice mechanism may
block a ship or add a required step: every flag resolves in one tap, every slot has a
default, and the voiceprint is maintained by the gardener's proposals rather than author
diligence. If a voice check ever stalls a passing checklist, that is a prompt bug to
fix, not a feature.

## 5. Architecture

```
Phone (PWA: Capture / Interview / Desk)
   │  HTTPS + Cloudflare Access (author-only auth)
   ▼
Cloudflare Worker API proxy            ← same account already hosting the site
   │  fine-grained GitHub PAT (server-side only), repo-scoped:
   │    contents: read/write — GitHub cannot scope tokens to paths,
   │      so the Worker enforces a path allowlist (research/**, drafts/**)
   │    pull_requests: read, merge, comment
   ▼
GitHub repo  ◄── automations 01–05 (unchanged)
```

Decisions and their reasons:

- **PWA, no app store.** Install from Safari/Chrome, web push works on modern iOS/Android,
  zero review process, one codebase. Static assets ship from the existing Worker.
- **Worker as the only secret-holder, and the only path enforcer.** The PAT never
  reaches the phone. Fine-grained PATs scope to repositories and permission classes,
  not paths — `contents: write` can touch any file in the repo — so the blast-radius
  containment lives in the Worker: it exposes ~7 narrow endpoints (`append-spark`,
  `get-brief`, `save-answer`, `list-desk`, `merge-pr`, `comment-pr`, `apply-slots`), hard-codes the
  writable paths (`research/**`, `drafts/**`, plus one narrowly scoped `src/content/**`
  exception granted only to `apply-slots` — next bullet), and never proxies the GitHub API
  generically. Branch protection on `main` (PRs only for `src/content/**`) backs this
  up at the repo level. If endpoint sprawl ever makes this allowlist hard to audit,
  graduate to a GitHub App with short-lived installation tokens.
- **Ship-time slots get one dedicated endpoint**, `apply-slots` — the only writer that
  ever touches `src/content/**`, and it is constrained to PR branches (never `main`),
  to the title frontmatter line and the final paragraph only, applied immediately before
  the merge the author just approved. The narrowness is the point: it cannot become a
  phone editor by accident.
- **Cloudflare Access for auth** (free tier, one email): no password code to write, and
  a lost phone is revoked in the dashboard.
- **No framework ceremony.** Three screens of vanilla or near-vanilla code (e.g., one
  small Astro/Vite app in `companion/` in this repo). The repo already deploys on push;
  the Companion rides the same pipeline.
- **Transcription** (ramble and walk modes) is the only model call the app makes, via
  the Worker. Text-to-speech (listen-to-review, walk-mode prompts) stays on-device via
  the Web Speech API — free, offline, private. Everything generative stays in the
  scheduled automations, where it's reviewable.

## 6. What the best UX here actually is — design principles

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
   paragraphs on the phone, it violates the vision. (Editing a *sentence* — the One
   change flow, the ship-time title and last-line slots — is the permitted maximum.)
6. **The phone's superpowers are the mouth, the ear, and the pocket — not the screen.**
   Capture dictates, Interview walks, Desk listens. Any flow that requires sustained
   staring at a phone screen is competing with a laptop and will lose; flows built on
   speech and movement have no desktop equivalent to lose to.

## 7. Phasing — smallest thing first, kill criteria attached

**Phase 0 — no code (now).** Wire a notification channel (email or a messaging
connector) for routines 02/04/05; bookmark `research/inbox.md` on the phone's home
screen via GitHub mobile; optionally a messaging-bot connector that appends sparks.
**Also now, costing no weekend:** the pipeline-side voice mechanisms (§4) — the
voiceprint file, the drafter's verbatim spine, the ship gate's voice check, mirror
questions, the gardener's voiceprint maintenance — are prompt and file edits to
automations 02–05, not Companion code. They ship with this revision.
*Run for 2–3 weeks. Measure: sparks/week, interview answer rate.*
**Kill criterion for the whole Companion: if Phase 0 sustains ≥5 sparks/week and
interviews get answered, stop here — the app isn't needed.**

**Phase 1 — Capture (one weekend).** Single page + `append-spark` endpoint + share
target + offline queue. *Kill criterion: if sparks/week doesn't roughly double versus
Phase 0 within a month, stop building and keep what exists.*

**Phase 2 — Interview (one weekend).** Brief rendering + per-question answers + push
notification for the Tuesday brief. *Success: interview answer rate ≥3 of 4 weeks.*

**Phase 3 — Desk (one weekend).** PR cards + preview embed + Ship/One change/Downgrade
+ voice panel + ship-time slots (the panel renders straight from the PR body; the slots
ride the merge flow — no new backend beyond `apply-slots`) + Friday push.
*Success: median draft→publish drops below the 7-day target.*

**Phase 4 — only if earned**, one weekend per item, picked by whichever funnel metric
is weakest: ramble-mode transcription; **walk-mode interviews** (§3.2); **listen-to-review**
(§3.3); EN⇄中文 preview toggle (after issue #7); spark annotations surfaced in-app plus
the **spark echo** (§4.4); and — pure reward, strictly last — **the garden**: a home
screen that renders the published archive from its existing maturity field (seedling 🌱 /
growing 🌿 / evergreen 🌳), where tapping a seedling asks "has this grown?" and the
answer lands as a spark. Each item still rides the same rules: publishing targets first,
and anything that asks the author to compose paragraphs stays banned (§6).

## 8. Success metrics

Companion metrics are *funnel* metrics; the pipeline's publishing metrics remain the
only ones that matter terminally.

| Metric | Phase 0 baseline → target |
|---|---|
| Sparks captured / week | measure → ≥2× baseline |
| Median capture time (open → committed) | n/a → <15 s |
| Interview briefs answered (≥3 questions) | measure → 3 of 4 weeks |
| Median draft PR → publish | ≤7 days (pipeline target, Desk should secure it) |
| Untraceable opinions surviving to publish | 0 — every voice flag resolved (keep/cut) before merge |
| Author-owned slots touched (title or last line) | watch only — a mirror, never a quota |
| Companion build time / month after Phase 3 | → ~0 (it's done; done is a feature) |

## 9. Risks

- **Tool-building as procrastination** — the central risk, mitigated structurally: §1
  rule 2 (weekend cap, publishing-first gate), §7 kill criteria, §8's "done is a feature."
- **Easy becoming generic** — the failure mode §4 exists for, handled by mechanism
  (verbatim spine, voice check) rather than reviewer vigilance. The residual risk is
  gaming — a drafter satisfying the letter by keeping three trivial phrases — so the
  ship gate spot-checks that the kept phrases carry the piece's actual claims.
- **Voice mechanisms becoming homework** — every mechanism defaults to ship-anyway, and
  the voiceprint is fed by gardener proposals rather than author diligence (§4
  guardrail). If a voice flag ever blocks a passing checklist, that's a prompt bug.
- **PAT blast radius** — mitigated by fine-grained scopes, narrow Worker endpoints, and
  Cloudflare Access; rotating the token is a 2-minute dashboard task.
- **iOS PWA limitations** — web push works on current iOS for installed PWAs, but the
  Web Share Target API is unsupported in iOS Safari, so share-sheet capture is an
  Android-only progressive enhancement. The iOS floor is "installable page with a text
  box" plus an Apple Shortcuts share action (or the messaging bot) hitting
  `append-spark`; Phase 1 must not assume more than that.
- **Drift between app and pipeline** — mitigated by repo-as-backend: the automations and
  the app share files, not APIs, so the pipeline doc stays the single contract.

## 10. Alternatives considered

- **GitHub mobile only** — the Phase 0 control group; wins if friction was imaginary.
- **Messaging bot (Telegram/WhatsApp/iMessage connector) as the whole product** — superb
  for Capture, plausible for Interview, weak for Desk (no preview, no safe merge button).
  Retained as a Phase 0 option and as the fallback if PWA push proves unreliable on iOS.
- **Off-the-shelf CMS (Decap, Tina, Obsidian+git, working-copy workflows)** — all
  optimize *editing files*, which is the one thing this vision forbids optimizing. Wrong
  job to be done.
- **Native app** — strictly worse on iteration speed and distribution for an audience
  of one.
