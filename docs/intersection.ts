// Intersection cryptography, proof of concept (neurons.me/intersection:v1).
// Data sealed to an audience A ∩ B ∩ … opens only when EVERY member contributes a partial.
// Primitive: joint public key P = ΣX_i over ristretto255 + n-of-n ElGamal-style partial decryption.
import { ristretto255 } from '@noble/curves/ed25519.js';
import { sha256, sha512 } from '@noble/hashes/sha2.js';
import { hkdf } from '@noble/hashes/hkdf.js';
import { xchacha20poly1305 } from '@noble/ciphers/chacha.js';
import { bytesToHex, concatBytes, randomBytes, utf8ToBytes } from '@noble/hashes/utils.js';
const Point = ristretto255.Point;
const Fn = Point.Fn;
const G = Point.BASE;
const DOMAIN = 'neurons.me/intersection:v1';
const tag = (label: string) => utf8ToBytes(`${DOMAIN}/${label}`);
export type Bytes = Uint8Array;
export interface PoP { R: Bytes; s: Bytes } // Schnorr signature over "pop:"+hex(X)
export interface Member { X: Bytes; pop: PoP } // public part of an identity
export interface Identity extends Member { partial(envelope: Envelope): Bytes }
export interface Audience { id: Bytes; epoch: number; members: readonly Bytes[]; P: Bytes }
export interface Envelope {
  audienceId: Bytes; epoch: number;
  R: Bytes; wrapNonce: Bytes; wrappedDEK: Bytes; // DEK wrapped to the joint key P
  payloadNonce: Bytes; payload: Bytes; // plaintext encrypted under the DEK
}

// ---------- scalar helpers ----------
const bytesToScalar = (b: Bytes): bigint => { // little-endian, reduced mod L (use 64 bytes: no bias)
  let n = 0n;
  for (let i = b.length - 1; i >= 0; i--) n = (n << 8n) | BigInt(b[i]);
  return Fn.create(n);};
const scalarToBytes = (s: bigint): Bytes => {
  const out = new Uint8Array(32);
  for (let i = 0; i < 32; i++, s >>= 8n) out[i] = Number(s & 0xffn);
  return out;};
const randomScalar = (): bigint => {
  for (;;) { const k = bytesToScalar(randomBytes(64)); if (k !== 0n) return k; }};
const equalBytes = (a: Bytes, b: Bytes) => a.length === b.length && a.every((v, i) => v === b[i]);
const compareBytes = (a: Bytes, b: Bytes) => {
  for (let i = 0; i < Math.min(a.length, b.length); i++) if (a[i] !== b[i]) return a[i] - b[i];
  return a.length - b.length;};
const short = (b: Bytes) => bytesToHex(b).slice(0, 12) + '…';
// ---------- Schnorr over ristretto255 (used for proof-of-possession) ----------
const challenge = (R: Bytes, X: Bytes, msg: Bytes) =>
  bytesToScalar(sha512(concatBytes(tag('schnorr'), R, X, msg)));
const popMessage = (X: Bytes) => utf8ToBytes('pop:' + bytesToHex(X));
function schnorrSign(x: bigint, X: Bytes, msg: Bytes): PoP {
  const k = randomScalar();
  const R = G.multiply(k).toBytes();
  const s = Fn.add(k, Fn.mul(challenge(R, X, msg), x)); // s = k + e·x
  return { R, s: scalarToBytes(s) };}
export function verifyPoP({ X, pop }: Member): boolean {
  try { // s·G == R + e·X
    const e = challenge(pop.R, X, popMessage(X));
    const lhs = G.multiply(bytesToScalar(pop.s)); // throws on s ≡ 0
    return lhs.equals(Point.fromBytes(pop.R).add(Point.fromBytes(X).multiply(e)));
  } catch { return false; }}
// ---------- 1. Identity: the secret scalar x never leaves this closure ----------
export function identity(seed: string): Identity {
  // Demo seeds are low-entropy names; a real identity would use a 32-byte random seed.
  const x = bytesToScalar(hkdf(sha256, utf8ToBytes(seed), tag('seed'), tag('enc'), 64));
  if (x === 0n) throw new Error('identity: degenerate seed');
  const X = G.multiply(x).toBytes();
  const pop = schnorrSign(x, X, popMessage(X));
  // partial = x·R : useful only for the envelope that carries this R.
  const partial = (envelope: Envelope) => Point.fromBytes(envelope.R).multiply(x).toBytes();
  return Object.freeze({ X, pop: Object.freeze(pop), partial });}
// ---------- 2. Audience: verified members, joint key P = ΣX_i ----------
export function audience(members: Member[], epoch = 0): Audience {
  for (const m of members)
    if (!verifyPoP(m)) throw new Error(`audience: invalid proof-of-possession for ${short(m.X)}`);
  return buildAudience(members.map((m) => m.X), epoch);}
/** UNSAFE: skips PoP verification. Exists only to demonstrate the rogue-key attack in tests. */
export function unsafeAudienceWithoutPoP(pubkeys: Bytes[], epoch = 0): Audience {
  return buildAudience(pubkeys, epoch);}
function buildAudience(pubkeys: Bytes[], epoch: number): Audience {
  if (pubkeys.length === 0) throw new Error('audience: needs at least one member');
  const members = [...pubkeys].sort(compareBytes);
  members.forEach((X, i) => { if (i && equalBytes(X, members[i - 1])) throw new Error('audience: duplicate member'); });
  const P = members.reduce((acc, X) => acc.add(Point.fromBytes(X)), Point.ZERO);
  if (P.is0()) throw new Error('audience: joint key is the identity point');
  const ep = new Uint8Array(4);
  new DataView(ep.buffer).setUint32(0, epoch);
  const id = sha256(concatBytes(tag('audience'), ep, ...members));
  return Object.freeze({ id, epoch, members: Object.freeze(members), P: P.toBytes() });}
// ---------- 6. Rotation: epoch + 1, new member set ----------
export function rotate(old: Audience, newMembers: Member[]): Audience {
  return audience(newMembers, old.epoch + 1);}
// ---------- 3. Seal: fresh random DEK every time (never derived from a previous one) ----------
const deriveKEK = (S: Bytes, audienceId: Bytes, R: Bytes) =>
  hkdf(sha256, S, audienceId, concatBytes(tag('wrap'), R), 32);
export function seal(aud: Audience, plaintext: string): Envelope {
  const dek = randomBytes(32);
  const payloadNonce = randomBytes(24);
  const payload = xchacha20poly1305(dek, payloadNonce, aud.id).encrypt(utf8ToBytes(plaintext));
  const r = randomScalar();
  const R = G.multiply(r).toBytes();
  const S = Point.fromBytes(aud.P).multiply(r).toBytes(); // r·P = Σ x_i·R
  const wrapNonce = randomBytes(24);
  const wrappedDEK = xchacha20poly1305(deriveKEK(S, aud.id, R), wrapNonce, concatBytes(aud.id, R)).encrypt(dek);
  return Object.freeze({ audienceId: aud.id, epoch: aud.epoch, R, wrapNonce, wrappedDEK, payloadNonce, payload });}
// ---------- 5. Open: one partial per member → S' = Σ partials → KEK → DEK → plaintext ----------
export function unwrapDEK(env: Envelope, aud: Audience, partials: Bytes[]): Bytes {
  if (!equalBytes(env.audienceId, aud.id)) throw new Error('open: envelope was sealed to a different audience/epoch');
  if (partials.length !== aud.members.length)
    throw new Error(`open: need ${aud.members.length} partials (one per member), got ${partials.length}`);
  const S = partials.reduce((acc, p) => acc.add(Point.fromBytes(p)), Point.ZERO).toBytes();
  try {
    return xchacha20poly1305(deriveKEK(S, aud.id, env.R), env.wrapNonce, concatBytes(aud.id, env.R)).decrypt(env.wrappedDEK);
  } catch {
    throw new Error('open: partials do not combine to the audience key (DEK unwrap failed)');}}
export function decryptPayload(env: Envelope, dek: Bytes): string {
  try {
    return new TextDecoder().decode(xchacha20poly1305(dek, env.payloadNonce, env.audienceId).decrypt(env.payload));
  } catch {
    throw new Error('open: wrong data key for this payload');}}
export function open(env: Envelope, aud: Audience, partials: Bytes[]): string {
  return decryptPayload(env, unwrapDEK(env, aud, partials));
}
