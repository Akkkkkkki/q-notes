// Generates the VAPID keypair for Tuesday-brief web push. Run once:
//   node scripts/generate-vapid.mjs
// then store each value with `npx wrangler secret put <NAME>`.

const pair = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, [
  'sign',
  'verify',
]);

const raw = new Uint8Array(await crypto.subtle.exportKey('raw', pair.publicKey));
const publicKey = Buffer.from(raw).toString('base64url');
const privateJwk = JSON.stringify(await crypto.subtle.exportKey('jwk', pair.privateKey));

console.log('VAPID_PUBLIC_KEY:\n' + publicKey + '\n');
console.log('VAPID_PRIVATE_JWK:\n' + privateJwk);
