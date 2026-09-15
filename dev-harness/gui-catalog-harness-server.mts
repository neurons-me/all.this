// gui-catalog-harness-server.mts — long-lived companion to
// gui-catalog-pilot.mts, for the VISUAL half of the same proof: starts the
// same kind of disposable monad, claims the same kind of test identity,
// seeds the default spec (only if absent — same idempotent boot logic),
// and then just prints connection info and stays running, so
// demo/catalog.html (a real browser page) has something real to read
// from and write to.
//
// Disposable: isolated MONADS_HOME, distinctively-named monad/namespace.
// Stop with Ctrl+C — SIGINT is handled by monad.ai's own persist.ts
// shutdown hook, which saves the snapshot before the child process exits.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));

// Fixed (not mkdtemp'd) so stopping and restarting THIS harness across
// separate invocations keeps the same monad state -- unlike
// gui-catalog-pilot.mts, where the restart-preserves-state proof happens
// within one script run and a fresh dir each run is correct there. Still
// never the real ambient ~/.monad registry.
const monadsHome = path.join(os.tmpdir(), 'gui-catalog-harness-monads-fixed');
fs.mkdirSync(monadsHome, { recursive: true });
process.env.MONADS_HOME = monadsHome;

const { startMonadProcess, stopMonadProcess } = await import('monad.ai');
// @ts-expect-error -- no .d.ts resolution across this relative path.
const { deriveBranchProofSeed, importEd25519SigningKey, normalizeProofMessage, signEd25519Proof } =
  await import(path.join(here, '../me/Typescript/dist/me.es.js'));

const MONAD_NAME = 'gui-catalog-harness-dev';
const NAMESPACE = 'gui-catalog-harness.local';
const USERNAME = 'guicatalog';
const SECRET = 'gui-catalog-harness-secret';
const SPEC_PATH = 'apps.gui.views.library';

async function post(origin: string, urlPath: string, body: unknown) {
  const res = await fetch(`${origin}${urlPath}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => null);
  return { status: res.status, json: json as any };
}

function toStableJson(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(toStableJson).join(',')}]`;
  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj).sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${toStableJson(obj[k])}`).join(',')}}`;
}

async function claimTestIdentity(origin: string, username: string, secret: string, rootNamespace: string) {
  const namespace = `${username}.${rootNamespace}`;
  const identityHash = username;
  const branchSeed = await deriveBranchProofSeed(secret, username);
  const { privateKey, publicKey } = await importEd25519SigningKey(branchSeed);
  const publicKeyRaw = Buffer.from(await crypto.subtle.exportKey('raw', publicKey)).toString('base64url');
  const timestamp = Date.now();
  const proofPayload = { identityHash, expression: username, namespace, rootNamespace, challenge: null, timestamp };
  const proofMessage = normalizeProofMessage(proofPayload);
  const proofSignature = await signEd25519Proof(privateKey, proofMessage);
  const claimRes = await post(origin, '/', {
    operation: 'claim', namespace, secret, identityHash,
    proof: { message: proofMessage, signature: proofSignature, publicKey: publicKeyRaw, timestamp },
  });
  // 409 = already claimed from a PRIOR run of this same harness (this
  // monad's own namespace is fixed on purpose -- see MONAD_NAME's own
  // rationale in the other harnesses this session -- so re-running this
  // script against a still-live snapshot re-claims the same identity).
  if (claimRes.status !== 201 && claimRes.status !== 409) {
    throw new Error(`identity claim returned ${claimRes.status} ${JSON.stringify(claimRes.json)}`);
  }
  return { namespace, identityHash, sign: (message: string) => signEd25519Proof(privateKey, message) };
}

async function commitWrite(origin: string, identity: { namespace: string; identityHash: string; sign(m: string): Promise<string> }, dotPath: string, data: unknown) {
  const events = [{ namespace: identity.namespace, path: dotPath, data }];
  const signedFields = { events, identityHash: identity.identityHash, namespace: identity.namespace };
  const canonicalBody = toStableJson(signedFields);
  const signature = await identity.sign(canonicalBody);
  return post(origin, '/api/v1/commit', { ...signedFields, signature, signedPayload: canonicalBody });
}

async function nrpRead(origin: string, namespace: string, dotPath: string) {
  const res = await fetch(`${origin}/${dotPath}`, { headers: { 'x-forwarded-host': namespace }, cache: 'no-store' });
  if (res.status === 404) return { found: false, value: undefined };
  const body = await res.json();
  if (body.disclosure && body.disclosure !== 'public') return { found: false, value: undefined };
  return { found: true, value: body.target?.value };
}

const DEFAULT_SPEC = {
  type: 'Box',
  props: {},
  children: [
    { type: 'Typography', props: { variant: 'h4', children: 'Component Library' } },
    { type: 'Typography', props: { variant: 'body2', children: 'Browse every registered GUI component.' } },
  ],
};

const start = await startMonadProcess({ name: MONAD_NAME, namespace: NAMESPACE });
if (!start.healthy) {
  console.error('[harness] disposable monad failed to start:', start.error || start.status);
  process.exit(1);
}
const origin = start.record.endpoint;
const identity = await claimTestIdentity(origin, USERNAME, SECRET, NAMESPACE);

const existing = await nrpRead(origin, identity.namespace, SPEC_PATH);
if (!existing.found || existing.value === undefined) {
  await commitWrite(origin, identity, SPEC_PATH, DEFAULT_SPEC);
  console.log('[harness] seeded default spec (nothing was there yet)');
} else {
  console.log('[harness] existing spec found — left untouched (this is the idempotent boot guard working)');
}

console.log(`[harness] monad running at ${origin}`);
console.log(`[harness] identity namespace: ${identity.namespace}`);
console.log(`[harness] spec path: ${SPEC_PATH}`);
console.log(`[harness] MONADS_HOME (disposable): ${monadsHome}`);
console.log('[harness] Ctrl+C to stop (snapshot saves on SIGINT before exit)');

process.on('SIGINT', async () => {
  console.log('\n[harness] stopping (state kept — run again to resume where you left off)...');
  await stopMonadProcess(MONAD_NAME).catch(() => {});
  process.exit(0);
});
