// gui-catalog-pilot.mts — the real, scripted proof for Phase 2: the
// component-catalog app's composition lives in `.me` as data, read/written
// over the REAL monad HTTP transport (never an in-process kernel call),
// and GUI's shared runtime interprets it — not a compiled-in function.
//
// Proves, in order, against a real disposable monad.ai process (never the
// real ambient one):
//   1. open catalog (seed the default spec, only if nothing is there yet)
//   2. read it back over real NRP HTTP — confirms the default
//   3. modify the PERSISTED spec (a real signed commit write, not local state)
//   4. read it back — the change shows up with NOTHING recompiled
//   5. restart the monad process (stop, then start again — same name,
//      same namespace, same on-disk state dir)
//   6. run the exact same "seed if absent" boot logic again — it must NOT
//      clobber the modification, because the value is no longer absent
//   7. read it back once more — the MODIFIED value survived the restart
//
// Disposable throughout: isolated MONADS_HOME, a distinctively-named test
// monad/namespace/identity, deleted at the end. Never the real gateway,
// never the real ambient monad registry.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));

const monadsHome = fs.mkdtempSync(path.join(os.tmpdir(), 'gui-catalog-pilot-monads-'));
process.env.MONADS_HOME = monadsHome;

const { startMonadProcess, restartMonadProcess, deleteMonadProcess, readMonadRecord } =
  await import('monad.ai');
// Same reasoning as gateway-setup-session.test.ts's identical import:
// 'this.me' (published) lacks these newer primitives; reach the local
// workspace build directly.
// @ts-expect-error -- no .d.ts resolution across this relative path.
const { deriveBranchProofSeed, importEd25519SigningKey, normalizeProofMessage, signEd25519Proof } =
  await import(path.join(here, '../me/Typescript/dist/me.es.js'));

const MONAD_NAME = `gui-catalog-pilot-${process.pid}`;
const NAMESPACE = `gui-catalog-pilot-${process.pid}.local`;
const USERNAME = 'guicatalog';
const SECRET = 'gui-catalog-pilot-secret';
const SPEC_PATH = 'apps.gui.views.library';

function log(msg: string) {
  console.log(`[pilot] ${msg}`);
}

async function post(origin: string, urlPath: string, body: unknown) {
  const res = await fetch(`${origin}${urlPath}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => null);
  return { status: res.status, json: json as any };
}

// Exact port of replay.ts's own toStableJson() -- the commit endpoint's
// signature is verified against THIS canonicalization, not
// normalizeProofMessage's (a different, unrelated contract used by the
// keychain/claim endpoints). Recursive, sorted keys, no whitespace.
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
    operation: 'claim',
    namespace,
    secret,
    identityHash,
    proof: { message: proofMessage, signature: proofSignature, publicKey: publicKeyRaw, timestamp },
  });
  if (claimRes.status !== 201) {
    throw new Error(`Test setup failed: identity claim returned ${claimRes.status} ${JSON.stringify(claimRes.json)}`);
  }
  return {
    namespace,
    identityHash,
    sign: (message: string) => signEd25519Proof(privateKey, message),
  };
}

type Identity = Awaited<ReturnType<typeof claimTestIdentity>>;

// The one real write path this pilot proves: a signed commit to
// /api/v1/commit (syncHandler.ts's commitHandler), never a direct
// in-process kernel call -- this is the actual HTTP transport a real
// browser-side app would use to persist an edited spec.
async function commitWrite(origin: string, identity: Identity, dotPath: string, data: unknown) {
  const events = [{ namespace: identity.namespace, path: dotPath, data }];
  const signedFields = { events, identityHash: identity.identityHash, namespace: identity.namespace };
  const canonicalBody = toStableJson(signedFields);
  const signature = await identity.sign(canonicalBody);
  const res = await post(origin, '/api/v1/commit', { ...signedFields, signature, signedPayload: canonicalBody });
  if (res.status !== 201 || !res.json?.ok) {
    throw new Error(`commit write failed: ${res.status} ${JSON.stringify(res.json)}`);
  }
  return res.json;
}

// The one real read path this pilot proves: a plain NRP GET (the same
// disclosure envelope pathResolver.ts always returns), never a direct
// in-process kernel read.
async function nrpRead(origin: string, identity: Identity, dotPath: string): Promise<{ found: boolean; value: unknown }> {
  const res = await fetch(`${origin}/${dotPath}`, {
    headers: { 'x-forwarded-host': identity.namespace },
    cache: 'no-store',
  });
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

// The exact boot-time behavior being proven safe across a restart: called
// every time the app starts, but must never clobber an already-modified
// spec -- same "check the real state before initializing" discipline as
// GatewayClaimsManager.bootstrapOwner()'s ledger-authoritative fix earlier
// this session, applied here to .me itself instead of a local claims file.
async function seedDefaultSpecIfAbsent(origin: string, identity: Identity): Promise<'seeded' | 'already-present'> {
  const existing = await nrpRead(origin, identity, SPEC_PATH);
  if (existing.found && existing.value !== undefined) return 'already-present';
  await commitWrite(origin, identity, SPEC_PATH, DEFAULT_SPEC);
  return 'seeded';
}

let monadName: string | null = null;
try {
  // ── 1. Start the disposable monad, claim the test identity ────────────
  const start = await startMonadProcess({ name: MONAD_NAME, namespace: NAMESPACE });
  monadName = MONAD_NAME;
  assert.ok(start.healthy, `disposable monad must actually start: ${start.error || JSON.stringify(start.status)}`);
  const origin = start.record.endpoint;
  log(`disposable monad running at ${origin} (namespace ${NAMESPACE})`);

  const identity = await claimTestIdentity(origin, USERNAME, SECRET, NAMESPACE);
  log(`claimed identity ${identity.namespace} (identityHash=${identity.identityHash})`);

  // ── 2. "Open catalog" for the first time -- seeds the default ─────────
  const firstBoot = await seedDefaultSpecIfAbsent(origin, identity);
  assert.equal(firstBoot, 'seeded', 'first boot must seed the default spec (nothing was there yet)');
  log('first boot: seeded default spec');

  const afterSeed = await nrpRead(origin, identity, SPEC_PATH);
  assert.ok(afterSeed.found, 'default spec must be readable over real NRP HTTP right after seeding');
  assert.deepEqual(afterSeed.value, DEFAULT_SPEC);
  log('confirmed default spec reads back correctly over NRP');

  // ── 3. Modify the PERSISTED spec -- a real signed write, not local state ─
  const MODIFIED_SPEC = {
    ...DEFAULT_SPEC,
    children: [
      DEFAULT_SPEC.children[0],
      { type: 'Typography', props: { variant: 'body2', children: 'EDITED: this text was changed by a real commit write, not a code change.' } },
    ],
  };
  await commitWrite(origin, identity, SPEC_PATH, MODIFIED_SPEC);
  log('committed a modified spec (changed subtitle text)');

  // ── 4. Read it back -- the change shows up with nothing recompiled ────
  const afterModify = await nrpRead(origin, identity, SPEC_PATH);
  assert.deepEqual(afterModify.value, MODIFIED_SPEC);
  log('confirmed modified spec reads back correctly -- no code changed, only data');

  // ── 5. Restart the monad process -- same name, same namespace, same
  // on-disk state dir. This sends a real SIGTERM (persist.ts's own
  // shutdown handler saves the snapshot before the process exits) and
  // starts a fresh process afterward.
  log('restarting the monad process...');
  const restarted = await restartMonadProcess(MONAD_NAME);
  assert.ok(restarted.healthy, `monad must come back up after restart: ${restarted.error || JSON.stringify(restarted.status)}`);
  const restartedOrigin = restarted.record.endpoint;
  assert.equal(restartedOrigin, origin, 'restart must land on the exact same origin (same port, reused)');
  log(`monad restarted, still at ${restartedOrigin}`);

  // ── 6. Run the exact same boot logic again -- must NOT clobber the
  // modification, because the value is no longer absent.
  const secondBoot = await seedDefaultSpecIfAbsent(restartedOrigin, identity);
  assert.equal(secondBoot, 'already-present', 'boot logic must detect the existing (modified) value and skip seeding');
  log('second boot: correctly detected existing spec, did NOT reseed the default');

  // ── 7. The MODIFIED value survived the restart — the actual proof ─────
  const afterRestart = await nrpRead(restartedOrigin, identity, SPEC_PATH);
  assert.deepEqual(afterRestart.value, MODIFIED_SPEC, 'the modified spec must survive a real process restart, unchanged');
  log('CONFIRMED: modified spec survived a real monad restart, unmodified');

  console.log('\ngui-catalog-pilot: ALL ASSERTIONS PASSED');
  console.log('The composition of this view lives in .me as data; the shared GUI runtime interprets it. Nothing here was recompiled between steps 3 and 7.');
} finally {
  if (monadName) {
    try {
      await deleteMonadProcess(monadName);
      log(`cleaned up disposable monad "${monadName}"`);
    } catch (e) {
      console.error('[pilot] cleanup warning:', e);
    }
  }
  fs.rmSync(monadsHome, { recursive: true, force: true });
}
