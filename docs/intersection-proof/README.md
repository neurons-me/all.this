# intersection-proof — neurons.me demo #1

Executable proof of "Set-Chemistry": data sealed to an audience **A ∩ B** opens only
when **every** member cooperates, and rotating the audience locks a revoked member out
of every future epoch.

```sh
npm install
npm test      # node:test, 9 claims
npm run demo  # narrative with ✓ / ✗
```

## The primitive

ristretto255 (`@noble/curves`), HKDF-SHA256 (`@noble/hashes`), XChaCha20-Poly1305 (`@noble/ciphers`).

- **Identity**: `x = HKDF(seed, "neurons.me/intersection:v1/enc") mod L`, `X = x·G`, plus a
  Schnorr **proof-of-possession** over `"pop:" + hex(X)`. `x` stays inside a closure; the
  identity only exposes `X`, `pop`, and `partial(envelope)`.
- **Audience**: verify every PoP, sort pubkeys, joint key `P = ΣXᵢ`,
  `audienceId = SHA-256(domain ‖ epoch ‖ sorted pubkeys)`.
- **Seal**: random DEK encrypts the payload (AAD = audienceId). The DEK is wrapped ElGamal-style:
  fresh `r`, `R = r·G`, `S = r·P`, `KEK = HKDF(S, salt = audienceId, info = "wrap" ‖ R)`.
- **Partial**: member *i* returns `xᵢ·R`, useful only for that envelope's `R`.
- **Open**: exactly one partial per member, `S' = Σ xᵢ·R = r·P`, derive KEK, unwrap DEK
  (AEAD failure ⇒ ✗), decrypt payload.
- **Rotate**: `epoch + 1` with the new member set. Every `seal` draws a fresh random DEK;
  no DEK is ever derived from a previous one.

## Invariants the tests prove

1. A ∩ B: Alice alone ✗, Bob alone ✗ (a doubled or padded partial can't stand in for the other
   member), Alice + Bob ✓.
2. Partials only work for one envelope: a partial made for C0 can't open a different C0′ sealed
   to the same audience.
3. n-of-n: for A ∩ B ∩ C, any 2 ✗, all 3 ✓.
4. Rogue key: without PoP, Mallory publishes `X_B′ = X_M − X_A` and opens "A ∩ B′" by herself.
   `audience()` rejects `X_B′` because she can't produce a PoP for it.
5. Rotation: after A ∩ B → A ∩ C, `K0 ≠ K1`, `K0` can't decrypt C1, A + B ✗ on C1
   (wrong audience, wrong count, or forced math), A + C ✓.
6. **Honest limit**: B, who kept `K0`, can still read C0. Revocation isn't retroactive.
7. Secret scalars are never exchanged. Identities expose only `X`, `pop`, `partial()`, and
   `open()` receives only points.

## Non-goals and caveats

1. **The combiner learns the DEK.** Whoever sums the partials gets that envelope's DEK.
   "A + B" means A and B jointly agree to release it to the combiner, whether that's one of
   them or a third party.
2. **Revocation protects future epochs**, not data someone already read. `revoke(B)` means B
   can't derive any future epoch key. It doesn't make old data unreadable.
3. **PoP is mandatory.** Without it, key aggregation is open to rogue-key attacks (test 4).
4. **Proof of concept, not audited.** Demo seeds are low-entropy names. Partials carry no DLEQ
   proof, so a bad partial makes `open` fail without showing which member sent it.
   Nothing is constant-time beyond what the noble libraries provide.
5. **This is n-of-n, not threshold (t-of-n).** A t-of-n variant needs Shamir/Feldman (or
   Pedersen DKG) secret shares with Lagrange interpolation of the partials.
