# Companion ops runbook — tokens, secrets, and the health check

The Companion has exactly two secrets, both living **on the Cloudflare Worker**,
never on the phone:

| Secret | What it is | Who uses it |
|---|---|---|
| `GITHUB_TOKEN` | Fine-grained PAT scoped to this repo (contents + pull requests, read/write) | The Worker, to read/write repo files and PRs |
| `CAPTURE_TOKEN` | Any long random string (`openssl rand -hex 24`) | Your phone sends it as `Authorization: Bearer …`; the Worker compares it |

The phone stores only `CAPTURE_TOKEN`, in `localStorage`, once. Everything else
is server-side.

## Why the tokens kept "disappearing"

This repo deploys automatically: a merge to `main` triggers a build that runs
`wrangler deploy` (and manual `npx wrangler deploy` does the same). **Every
such deploy replaces the Worker's plain-text environment variables with the
`vars` block in `wrangler.jsonc`.** So a token added in the Cloudflare
dashboard as a **Text** variable survives only until the next merge — often a
scout or drafter PR you didn't even touch — and then silently vanishes. That
is the "I added it multiple times and it kept disappearing without any manual
effort" mystery: nothing was removing it maliciously; every routine deploy was.

Two defenses are now in place, but the first rule matters most:

1. **Always store the tokens as *Secrets*, never as Text variables.**
   Encrypted secrets are not touched by deploys, by design.
2. `wrangler.jsonc` now sets `"keep_vars": true`, so even a Text variable
   added in the dashboard survives a deploy. Treat this as a seatbelt, not an
   invitation — secrets belong in Secrets.

## Setting the secrets (the reliable way)

From a machine with wrangler auth (`npx wrangler login`):

```bash
npx wrangler secret put GITHUB_TOKEN    # paste the fine-grained PAT
npx wrangler secret put CAPTURE_TOKEN   # paste the shared secret
```

Or in the dashboard: Workers & Pages → `q-notes` → Settings → Variables and
Secrets → Add → **type: Secret** (this is the crucial dropdown — "Text" is the
trap) → Deploy.

No redeploy of the code is needed afterwards; secrets attach to the Worker.

## Verifying in 10 seconds

The Worker exposes an unauthenticated health check that reports *presence*
booleans only (never values):

```bash
curl -s https://notes.qiuyue.dev/api/health
# {"ok":true,"secrets":{"GITHUB_TOKEN":true,"CAPTURE_TOKEN":true,"webPush":false}}
```

- `ok: false` → the server side is broken; fix the secrets as above.
- `ok: true` but the phone still says **token needed** (HTTP 401) → the token
  on that device really doesn't match `CAPTURE_TOKEN`; re-paste it once.

The Companion pages call this endpoint themselves: when the server has lost
its secrets they show a red **"The server lost its secrets"** banner instead
of asking for your token, because re-pasting the token cannot fix a 503.

`/api/health` is the *only* authority on that question. Not every 503 means the
secrets are gone — an unconfigured optional feature answers 503 on its own
while the rest of the app is healthy, and today that means web push:
`GET /api/push/key` 503s with `code: "push_unconfigured"` whenever the VAPID
keys are unset (`webPush: false` above). The pages therefore confirm against
`/api/health` before showing the banner. **If the banner ever names secrets
that `/api/health` reports as `true`, believe the health check** — the secrets
are fine and something else 503'd.

## Web push: silent until the VAPID keys are set

`webPush: false` in the health check is not cosmetic — it disables **both** cron
nudges. `notifyIfBriefOpen` and `notifyIfDeskOpen` (`worker/push.ts`) return
immediately unless `pushConfigured(env)` is true, so the Tuesday "your brief is
waiting" and Friday "the Desk has something" pushes never leave the Worker.
A phone that never buzzes is easy to read as "nothing happened this week".

To turn them on, from a machine with wrangler auth:

```bash
node scripts/generate-vapid.mjs        # prints the key pair
npx wrangler secret put VAPID_PUBLIC_KEY
npx wrangler secret put VAPID_PRIVATE_JWK
```

Then re-check `curl -s https://notes.qiuyue.dev/api/health` — `webPush` should
read `true` — and re-subscribe once from the Answer page.

Two things to know even after the keys are set:

- The Tuesday nudge only fires for a brief **0–7 days old**
  (`worker/push.ts`). A brief that goes unanswered past its first week stops
  nudging exactly when it most needs one. Known and deliberate for now; if
  briefs start aging out silently, widen that window.
- Push is a convenience, never the source of truth. The Today tab's
  `needsYou` list is — it is computed on every load and does not depend on a
  subscription, a service worker, or OS notification permission.

## Symptom → cause table

| Symptom | Meaning | Fix |
|---|---|---|
| Red banner "server lost its secrets" / `/api/health` says `ok:false` | A deploy wiped dashboard Text vars, or secrets were never set | Re-add both as **Secrets** (above) |
| "token needed" keeps reappearing, health says `ok:true` | This device's stored token ≠ `CAPTURE_TOKEN` | Paste the current token once; it sticks |
| Red banner but `/api/health` says `ok:true` | Some other endpoint 503'd (e.g. web push unconfigured) — the secrets are fine | Nothing to re-add; reload the page |
| "Notifications unavailable" on the Answer page | `VAPID_PUBLIC_KEY`/`VAPID_PRIVATE_JWK` are unset (`webPush: false`) | Optional: `node scripts/generate-vapid.mjs`, then `wrangler secret put` both |
| Sparks say "queued" | Phone offline, or server 503 | They flush automatically once send succeeds |
| Everything 401s right after rotating `CAPTURE_TOKEN` | Expected — each device holds the old token | Paste the new one on each device |

## Rotation

Rotate either secret any time: set the new value (`wrangler secret put`), then
paste the new `CAPTURE_TOKEN` once on each device. The GitHub PAT has an
expiry — when GitHub emails you about it, mint a new fine-grained PAT with the
same two permissions and `wrangler secret put GITHUB_TOKEN` again.
