import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ristretto255 } from '@noble/curves/ed25519.js';
import { sha256 } from '@noble/hashes/sha2.js';
import { hkdf } from '@noble/hashes/hkdf.js';
import { bytesToHex, randomBytes, utf8ToBytes } from '@noble/hashes/utils.js';
import {
  identity, audience, rotate, seal, open, unwrapDEK, decryptPayload,
  unsafeAudienceWithoutPoP, verifyPoP,
} from '../src/intersection.ts';

const Point = ristretto255.Point;
const ZERO = Point.ZERO.toBytes();
const add = (a: Uint8Array, b: Uint8Array) => Point.fromBytes(a).add(Point.fromBytes(b)).toBytes();
const WRONG = /partials do not combine/;

const alice = identity('alice');
const bob = identity('bob');
const carol = identity('carol');

test('A ∩ B: Alice alone ✗ (her partial alone, doubled, or padded cannot stand in for Bob)', () => {
  const AB = audience([alice, bob]);
  const c = seal(AB, 'secret');
  const pA = alice.partial(c);
  assert.throws(() => open(c, AB, [pA]), /need 2 partials/);
  assert.throws(() => open(c, AB, [pA, pA]), WRONG); // doubled
  assert.throws(() => open(c, AB, [pA, ZERO]), WRONG); // padded with identity point
  assert.throws(() => open(c, AB, [pA, add(pA, pA)]), WRONG);
  assert.throws(() => open(c, AB, [pA, Point.BASE.toBytes()]), WRONG);
});

test('A ∩ B: Bob alone ✗', () => {
  const AB = audience([alice, bob]);
  const c = seal(AB, 'secret');
  const pB = bob.partial(c);
  assert.throws(() => open(c, AB, [pB]), /need 2 partials/);
  assert.throws(() => open(c, AB, [pB, pB]), WRONG);
  assert.throws(() => open(c, AB, [pB, ZERO]), WRONG);
});

test('A ∩ B: Alice + Bob together ✓ returns "secret" (partial order does not matter)', () => {
  const AB = audience([alice, bob]);
  const c = seal(AB, 'secret');
  assert.equal(open(c, AB, [alice.partial(c), bob.partial(c)]), 'secret');
  assert.equal(open(c, AB, [bob.partial(c), alice.partial(c)]), 'secret');
});

test('partials are per-envelope: a stale partial (made for another envelope) ✗, and C0 partials cannot open C0\'', () => {
  const AB = audience([alice, bob]);
  const c0 = seal(AB, 'secret');
  const c0b = seal(AB, 'secret'); // same audience, same content, fresh R and DEK
  assert.throws(() => open(c0b, AB, [alice.partial(c0b), bob.partial(c0)]), WRONG); // Bob's is stale
  assert.throws(() => open(c0b, AB, [alice.partial(c0), bob.partial(c0)]), WRONG); // all from C0
  assert.equal(open(c0b, AB, [alice.partial(c0b), bob.partial(c0b)]), 'secret');
});

test('A ∩ B ∩ C (n-of-n): any 2 of 3 ✗, all 3 ✓', () => {
  const ABC = audience([alice, bob, carol]);
  const c = seal(ABC, 'secret');
  const [pA, pB, pC] = [alice, bob, carol].map((m) => m.partial(c));
  for (const pair of [[pA, pB], [pA, pC], [pB, pC]]) {
    assert.throws(() => open(c, ABC, pair), /need 3 partials/);
    assert.throws(() => open(c, ABC, [...pair, ZERO]), WRONG);
    assert.throws(() => open(c, ABC, [...pair, pair[0]]), WRONG);
  }
  assert.equal(open(c, ABC, [pC, pA, pB]), 'secret');
});

test('rogue-key attack: without PoP Mallory alone opens A ∩ "B\'"; audience() with PoP rejects X_B\'', () => {
  const mallory = identity('mallory');
  // Mallory publishes X_B' = X_M − X_A, so the joint key X_A + X_B' = X_M is hers alone.
  const XBprime = Point.fromBytes(mallory.X).subtract(Point.fromBytes(alice.X)).toBytes();

  const rogue = unsafeAudienceWithoutPoP([alice.X, XBprime]);
  const c = seal(rogue, 'secret');
  // Mallory: x_M·R = r·(X_A + X_B'), padded with a zero point to satisfy the count. Alice never participates.
  assert.equal(open(c, rogue, [mallory.partial(c), ZERO]), 'secret');

  // With PoP: Mallory cannot sign "pop:"+hex(X_B') because she doesn't know its discrete log.
  assert.throws(() => audience([alice, { X: XBprime, pop: mallory.pop }]), /invalid proof-of-possession/);
  assert.throws(() => audience([alice, { X: XBprime, pop: { R: Point.BASE.toBytes(), s: randomBytes(32) } }]), /invalid proof-of-possession/);
  assert.throws(() => audience([alice, { X: bob.X, pop: alice.pop }]), /invalid proof-of-possession/); // PoP not transferable
  assert.ok(verifyPoP(alice) && verifyPoP(bob) && verifyPoP(mallory));
});

test('revocation/epochs: after rotating A∩B → A∩C, B (even holding K0) cannot open C1; A+C ✓', () => {
  const t0 = audience([alice, bob], 0);
  const c0 = seal(t0, 'secret');
  const K0 = unwrapDEK(c0, t0, [alice.partial(c0), bob.partial(c0)]); // legitimate open; combiner (B) learns K0
  assert.equal(decryptPayload(c0, K0), 'secret');

  const t1 = rotate(t0, [alice, carol]); // revoke B, add C
  assert.equal(t1.epoch, 1);
  const c1 = seal(t1, 'secret'); // same content, fresh random DEK K1
  const K1 = unwrapDEK(c1, t1, [alice.partial(c1), carol.partial(c1)]);

  assert.notEqual(bytesToHex(K0), bytesToHex(K1)); // K0 ≠ K1
  assert.throws(() => decryptPayload(c1, K0), /wrong data key/); // B alone with K0 ✗ on C1
  // A+B on C1: via the old audience → id mismatch; via the new one → count mismatch / forced math fails.
  assert.throws(() => open(c1, t0, [alice.partial(c1), bob.partial(c1)]), /different audience/);
  assert.throws(() => open(c1, t1, [alice.partial(c1), carol.partial(c1), bob.partial(c1)]), /need 2 partials/);
  assert.throws(() => open(c1, t1, [alice.partial(c1), bob.partial(c1)]), WRONG);
  assert.equal(open(c1, t1, [alice.partial(c1), carol.partial(c1)]), 'secret'); // A+C ✓
});

test('honest limit — revocation is not retroactive: B who kept K0 can still read C0', () => {
  const t0 = audience([alice, bob], 0);
  const c0 = seal(t0, 'secret');
  const K0 = unwrapDEK(c0, t0, [alice.partial(c0), bob.partial(c0)]);
  rotate(t0, [alice, carol]);
  // Intended invariant: revoke(B) ⇒ B cannot derive any FUTURE epoch key. Data B already read stays read.
  assert.equal(decryptPayload(c0, K0), 'secret');
});

test('private keys never leave: identities expose only X, pop, partial(); open() receives only points', () => {
  const AB = audience([alice, bob]);
  const c = seal(AB, 'secret');
  for (const id of [alice, bob]) {
    assert.deepEqual(Object.keys(id).sort(), ['X', 'partial', 'pop']);
    assert.ok(Object.isFrozen(id));
  }
  const partials = [alice.partial(c), bob.partial(c)];
  for (const p of partials) {
    assert.equal(p.length, 32);
    Point.fromBytes(p); // a valid ristretto255 point encoding, not a scalar
    assert.ok(![alice.X, bob.X].some((X) => bytesToHex(X) === bytesToHex(p)));
  }
  // Recompute Alice's secret scalar from the documented derivation and check it appears nowhere
  // in anything that is published or exchanged (identity public fields, audience, envelope, partials).
  const wide = hkdf(sha256, utf8ToBytes('alice'), utf8ToBytes('neurons.me/intersection:v1/seed'),
    utf8ToBytes('neurons.me/intersection:v1/enc'), 64);
  let x = 0n;
  for (let i = 63; i >= 0; i--) x = (x << 8n) | BigInt(wide[i]);
  x %= Point.Fn.ORDER;
  assert.equal(bytesToHex(Point.BASE.multiply(x).toBytes()), bytesToHex(alice.X)); // derivation matches
  const xHex = x.toString(16).padStart(64, '0');
  const xLE = xHex.match(/../g)!.reverse().join('');
  const exchanged = [alice.X, alice.pop.R, alice.pop.s, AB.id, AB.P, ...AB.members,
    c.R, c.wrappedDEK, c.payload, ...partials].map(bytesToHex).join('|');
  assert.ok(!exchanged.includes(xHex) && !exchanged.includes(xLE));
});
