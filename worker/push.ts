import type { Env } from './types';
import { getFile, putFile, json } from './github';
import { latestBrief } from './interview';

/**
 * Web push for the Tuesday brief (Companion Phase 2). Repo-as-backend:
 * subscriptions live in a committed JSON file, not a database. Pushes are
 * sent without a payload — only a VAPID-signed wake-up — so no payload
 * encryption is needed; the service worker shows a fixed notification that
 * deep-links to /interview/.
 */

const SUBSCRIPTIONS_PATH = 'research/.companion/push-subscriptions.json';

interface PushSubscriptionJSON {
  endpoint: string;
  keys?: { p256dh?: string; auth?: string };
}

export function pushConfigured(env: Env): boolean {
  return Boolean(env.VAPID_PUBLIC_KEY && env.VAPID_PRIVATE_JWK);
}

export function getPublicKey(env: Env): Response {
  if (!pushConfigured(env)) return json({ error: 'Push not configured' }, 503);
  return json({ key: env.VAPID_PUBLIC_KEY });
}

export async function subscribe(request: Request, env: Env, remove = false): Promise<Response> {
  let sub: PushSubscriptionJSON;
  try {
    sub = await request.json();
  } catch {
    return json({ error: 'Body must be JSON' }, 400);
  }
  if (!sub.endpoint || !/^https:\/\//.test(sub.endpoint)) {
    return json({ error: 'Invalid subscription' }, 400);
  }

  for (let attempt = 0; attempt < 2; attempt++) {
    const file = await getFile(env, SUBSCRIPTIONS_PATH);
    const subs: PushSubscriptionJSON[] = file ? JSON.parse(file.content) : [];
    const others = subs.filter((s) => s.endpoint !== sub.endpoint);
    const next = remove ? others : [...others, sub];
    if (next.length === subs.length && !remove && subs.some((s) => s.endpoint === sub.endpoint)) {
      return json({ ok: true }); // already stored
    }
    const result = await putFile(
      env,
      SUBSCRIPTIONS_PATH,
      JSON.stringify(next, null, 2) + '\n',
      `companion: ${remove ? 'remove' : 'add'} push subscription`,
      file?.sha
    );
    if (result.ok) return json({ ok: true });
    if (result.status !== 409 && result.status !== 422) {
      return json({ error: `GitHub API error (${result.status})` }, 502);
    }
  }
  return json({ error: 'Write conflict, please retry' }, 409);
}

/**
 * Tuesday cron: if the latest brief is fresh, open, and not fully answered,
 * wake every subscribed device. Dead subscriptions (404/410) are pruned.
 */
export async function notifyIfBriefOpen(env: Env): Promise<void> {
  if (!pushConfigured(env)) return;

  const brief = await latestBrief(env);
  if (!brief || brief.closed) return;
  const ageDays = (Date.now() - Date.parse(brief.date)) / 86400000;
  if (!(ageDays >= 0 && ageDays <= 7)) return;
  if (!brief.questions.some((q) => q.answer === null)) return;

  const file = await getFile(env, SUBSCRIPTIONS_PATH);
  if (!file) return;
  const subs: PushSubscriptionJSON[] = JSON.parse(file.content);
  if (!subs.length) return;

  const dead: string[] = [];
  for (const sub of subs) {
    const status = await sendEmptyPush(sub.endpoint, env);
    if (status === 404 || status === 410) dead.push(sub.endpoint);
  }

  if (dead.length) {
    const next = subs.filter((s) => !dead.includes(s.endpoint));
    await putFile(
      env,
      SUBSCRIPTIONS_PATH,
      JSON.stringify(next, null, 2) + '\n',
      'companion: prune dead push subscriptions',
      file.sha
    );
  }
}

async function sendEmptyPush(endpoint: string, env: Env): Promise<number> {
  try {
    const audience = new URL(endpoint).origin;
    const jwt = await vapidJwt(audience, env);
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        TTL: '86400',
        Urgency: 'normal',
        Authorization: `vapid t=${jwt}, k=${env.VAPID_PUBLIC_KEY}`,
      },
    });
    return res.status;
  } catch {
    return 0; // unreachable push service — keep the subscription, try next week
  }
}

async function vapidJwt(audience: string, env: Env): Promise<string> {
  const header = b64url(JSON.stringify({ typ: 'JWT', alg: 'ES256' }));
  const claims = b64url(
    JSON.stringify({
      aud: audience,
      exp: Math.floor(Date.now() / 1000) + 12 * 3600,
      sub: env.VAPID_SUBJECT || 'https://notes.qiuyue.dev',
    })
  );
  const signingInput = `${header}.${claims}`;

  const key = await crypto.subtle.importKey(
    'jwk',
    JSON.parse(env.VAPID_PRIVATE_JWK!),
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign']
  );
  // WebCrypto ECDSA signatures are raw r||s — exactly the JWS ES256 format.
  const signature = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    key,
    new TextEncoder().encode(signingInput)
  );
  return `${signingInput}.${b64url(signature)}`;
}

function b64url(data: string | ArrayBuffer): string {
  const bytes = typeof data === 'string' ? new TextEncoder().encode(data) : new Uint8Array(data);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
