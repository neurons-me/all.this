// neurons.me — intersection cryptography demo: data sealed to A ∩ B opens only when A and B both cooperate.
import { identity, audience, rotate, seal, open, unwrapDEK, decryptPayload } from './src/intersection.ts';

const try_ = (label: string, fn: () => string) => {
  try { console.log(`  ✓ ${label.padEnd(30)} → "${fn()}"`); }
  catch (e) { console.log(`  ✗ ${label.padEnd(30)} → ${(e as Error).message}`); }
};

const [A, B, C] = ['alice', 'bob', 'carol'].map(identity);

console.log('t0  audience = A ∩ B   (epoch 0)');
const t0 = audience([A, B], 0);
const c0 = seal(t0, 'secret');
try_('Alice alone', () => open(c0, t0, [A.partial(c0)]));
try_('Alice + Alice (padding)', () => open(c0, t0, [A.partial(c0), A.partial(c0)]));
try_('Bob alone', () => open(c0, t0, [B.partial(c0)]));
try_('Alice + Bob', () => open(c0, t0, [A.partial(c0), B.partial(c0)]));
const K0 = unwrapDEK(c0, t0, [A.partial(c0), B.partial(c0)]); // Bob combined, so Bob now holds K0

console.log('\nt1  revoke B, rotate → audience = A ∩ C   (epoch 1, fresh DEK)');
const t1 = rotate(t0, [A, C]);
const c1 = seal(t1, 'secret');
try_('Bob + K0 on C1', () => decryptPayload(c1, K0));
try_('Alice + Bob on C1', () => open(c1, t1, [A.partial(c1), B.partial(c1)]));
try_('Bob + K0 on C0 (honest limit)', () => decryptPayload(c0, K0));
try_('Alice + Carol on C1', () => open(c1, t1, [A.partial(c1), C.partial(c1)]));
console.log('\n  revoke(B) ⇒ B cannot derive future epoch keys; data B already read is not un-read.');
