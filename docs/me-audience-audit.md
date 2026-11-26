# `.me` Audience Cryptography Audit: Intersection, Axioms, Phases
_Read-only audit, 2026-09-26 (CST). Machine: Suis-MacBook-Air (`c9436c62…`). Paths are relative to `~/Desktop/Neuroverse/` unless stated otherwise. `ME/` = `all.this/me/Typescript/`._

## 0. Repo state (local copy can differ from GitHub)
- `all.this` superproject: the submodule pointers for `me`, `modules/monad` and `modules/netget` are **modified**. `packages/GUI` has dirty files. Untracked: `ALL_THIS_OVERVIEW.md`, `docs/intersection.ts`, `docs/intersection.test.ts`, `docs/intersection-proof/`, `docs/intersection-proof.tar.gz`.
- `me` submodule: working tree clean at `fd181d5`, which equals `origin/main` (last fetch). The superproject still records `4b46d1d`, 51 commits behind. Between those two commits, `Typescript/src` has **no changes**. The only test change is a new file, `tests/ActiveGraph/secretDerivationReplay.test.ts`.
- `ME/dist` is gitignored (`ME/.gitignore:2`). It was already built at 10:42 today. I did **not** rebuild. All tests ran against that existing build. `git status` stayed clean afterward.
- Site repo `suign.github.io`: only `Equations.html` and `.DS_Store` are modified. The audited pages (SetChemistry/EncryptedAudiences/EncryptedIsland) are committed (last change 2026-08-14).

## (a) Verdict on intersection
**No form of intersection (joint decryption, "Alice AND Bob together") exists in the `.me` kernel.** That covers XOR splitting, a joint public key, threshold schemes, audience envelopes and epochs. Searching `ME/src` and `ME/index.ts` for `audience|intersection|threshold|shamir|revok|share` finds nothing. The only `epoch` is a cache counter (`secret-context.ts:159-178`), and the only `rotate` is identity-root rotation. The type `AudienceBlobV1` from SetChemistry.html is absent.

Even **union** exists only as a single-recipient primitive: `wrapSecretV1`/`unwrapSecretV1` (`crypto.ts:1422-1539`) plus a local keyspace (`core-keyspace.ts`). There is no multi-recipient envelope, no DEK+wraps format, and no link from an unwrapped secret into a `_` scope.

The only working intersection code is the **untracked, external PoC** at `all.this/docs/intersection-proof/`: n-of-n ElGamal-style partial decryption over ristretto255, with Schnorr proof-of-possession and epoch rotation, built on `@noble/*`. I copied it to my box and ran it: **9/9 tests pass**. It shares no code with the kernel, and the kernel's only runtime dependency is `js-sha3` (`ME/package.json`).

The published site pages describe union and intersection in the present tense (EncryptedIsland.html:229, 239, 251). SetChemistry.html:244-254 gives an XOR-split design, and none of it is implemented. The monorepo's own GUI findings log already says this correctly: `packages/GUI/.../Beatle/SetChemistry.findings.md:142-143` ("no multi-recipient key-wrap path"; "no threshold/XOR-share reconstruction anywhere in the kernel").

## (b) Axioms
The canonical list is `ME/docs/Axioms.md` (public copy) and `ME/typedocs/Axioms.md` (extended). Both contain A-struct-0 and A0–A9. `ME/tests/axioms.test.ts` also adds sub-cases **A3b** (nested secret owner reads) and **A3c** (nested secret plus same-node noise), for 13 cases in total. **13/13 pass** (`node tests/axioms.test.ts`).

Caveat: `axioms.test.ts` and `phases.test.js` are **not part of `npm test`** (`ME/package.json` `"test"` script). The `me` repo has no CI (no `.github/`).

| ID | Statement (docs/Axioms.md) | Enforcement (file:line) | Tests | Status | Relevance to intersection / multi-party |
|---|---|---|---|---|---|
| A-struct-0 | One value is both callable and infinitely chainable (`:15-29`) | `me.ts:384-386` (root proxy), `proxy.ts:256-281` (`createProxy`) | axioms A-struct-0 | enforced + tested | **Stressed.** `me("path")` is synchronous. Joint decryption needs contributions from other parties, so it is inherently async and multi-round. It cannot happen inside `readPath`. It needs an async API like `prove()` (`me.ts:656`) or `self:open/keys` (`core-keyspace.ts:104-126`, which returns a Promise). |
| A0 | Secret subtree readable by full path; root invisible (`:31-43`) | `core.ts:304-306` (`path.length === scope.length → undefined`), `core-write.ts:305-311` (`registerStealthScope`), guest barrier `core-read.ts:29-57` / `me.ts:1504-1523` | axioms A0; phases Phase 0; Security `scopes-and-noise`, `leakage` | enforced + tested | **Stressed by metadata.** SetChemistry's `AudienceBlobV1` puts each member's `identityHash` in the clear (SetChemistry.html:273-276), which reveals who is in the audience. The joint key stays hidden, but the membership does not. |
| A1 | `@` claims normalized/validated before commit (`:45-55`) | `operators.ts:90-101` (`normalizeAndValidateUsername`), `:171-190` (`isIdentityCall`) | axioms A1 | enforced + tested | Indirect. Audience members must be keyed by a cryptographic identity (`identityHash` plus an encryption public key), not by the username A1 normalizes. |
| A2 | Secrecy is path-bound, not a global toggle (`:57-69`) | `operators.ts:130-141`; `secret-context.ts:231-249` (`resolveBranchScope`); `secret-context.ts:261-287` (v3 chain = domain, mode, scope, anchor, noise boundary, lineage secrets) | axioms A2; `secret-blob-hardening.contract` (blob copied to a sibling path fails) | enforced + tested | **Core tension.** Today a scope key is *derived* from path lineage plus secret strings the kernel holds (`deriveBlobV3Keys`, `crypto.ts:489-506`). An intersection key cannot be derived by any single kernel. It has to be a random DEK carried in an envelope. The path binding survives only if the envelope's AAD includes the path (SetChemistry proposes no AAD). v4 keys are HMAC-keyed by a private identity root (`crypto.ts:719-742`), so they can never be shared. |
| A3 | `~` resets derivation at a boundary (`:71-87`) | `core-write.ts:1085-1091` (noise stored, epoch bump, memory logged as `***`); `secret-context.ts:103-157`, `:180-229` | axioms A3/A3b/A3c (the test only checks that the FNV `effectiveSecret` differs, `axioms.test.ts:259`); `secret-blob-v3.read.test.ts` ("wrong noise … fails closed") | enforced + tested | **Does not give audience rotation.** A random DEK is unaffected by `~` (SetChemistry.html:289 itself says "boundary applies to path anchor, not to S"). Epochs need their own mechanism. Symbol clash: NRP's `~` means complement (`SetChemistry.findings.md:145`). |
| A4 | Pointers are data; traversal dereferences (`:89-103`) | `core.ts:342`, `:348-359`; `operators.ts:156-169` | axioms A4 | enforced + tested | **Stressed.** "Automatically dereferenced" cannot hold for a target that needs other parties' contributions. A pointer into an intersection scope must resolve to closed (`undefined`/`null`). |
| A5 | Queries recorded as memory events (`:105-116`) | `core-write.ts:1068-1077` | axioms A5 | enforced + tested | Neutral. An "open" event could be logged, but never the partials themselves (see A8). |
| A6 | Deletion auditable, read-time irreversible via tombstones (`:118-129`) | `core-write.ts:1098-1197` (`removeSubtree`, `-` memory) | axioms A6 | enforced + tested | A tombstone is **not** revocation. It is local only; copies held elsewhere or by other members are unaffected. |
| A7 | Private ops never leak into or corrupt the public view (`:131-144`) | `core-index.ts:159+` (`rebuildIndex`), branch plane separate (`me.ts:311-317`) | axioms A7 | enforced + tested | Compatible, as long as audience envelopes live in the branch plane or as opaque values. |
| A8 | Tamper-evident hash chain; public surface redacted (`:146-159`) | `core-write.ts:466-501`, `:1169-1194`; `hashFn` = **32-bit FNV-1a** (`utils.ts:7-14`) | axioms A8 (recomputes with the same FNV) | enforced + tested, **but weak** | **Stressed.** (1) The hash is non-cryptographic and 32 bits, so it is forgeable. (2) The hash input includes `effectiveSecret`, which is stripped from public memories and snapshots (`memory-redaction.ts:7-10`, `core-snapshot.ts:44-57`; verified live). Other parties therefore cannot recompute the hashes of secret-scoped entries. (3) Partials must never be logged: log plus partials yields the DEK. SetChemistry.html:291 says A8 is "extended" to audience blobs; it is not implemented. `NRP-Kernel-Role.md:42` says NRP "can verify freshness" from A8, which the code does not support. |
| A9 | Deterministic LWW. docs/Axioms.md:163 says `(timestamp, hash)` (**stale**); typedocs/Axioms.md:222-232 says `(seq, hash)` | `core-index.ts:58-78` (`compareLWW`), `:137-147` (live apply) | axioms A9; Security `lww-index-consistency.test.ts` | enforced + tested | **Stressed.** `seq` is a per-instance counter, not merged across kernels. Multi-writer is explicitly unsupported (`tests/Security/README.md:51`), and there is **no anti-rollback/freshness** (`README.md:62-68`). Concurrent audience rotations would be settled by a hash tiebreak, and an old epoch envelope that still includes a revoked member can be replayed as current. SetChemistry.html:292 also repeats the stale timestamp rule. |

Doc drift across axiom sources: `docs/Axioms.md:163` vs `typedocs/Axioms.md:222` (A9 mechanism). `NRP-Kernel-Role.md:40` labels A3 "Nested secrets", but nesting is A3b; A3 is noise.

Beyond the axioms, one README invariant matters: "The seed is derived locally and is never transmitted by the kernel" (`ME/README.md:138-139`). The README's "Cryptographic Set-Chemistry" snippet, `audienceSeed = keccak256(sorted seeds)` (`ME/README.md:339-351`), and the "derived shared space" idea (`typedocs/Algebra-of-Contexts.md:89-101`) both require **pooling every member's seed** in one place. As an intersection mechanism, that violates the invariant. The snippet appears only in the README and its test (`tests/readme.examples.test.mjs:128-136`), not in `src`.

**Conclusion for intersection:** no axiom is formally violated *if* intersection is added as a separate envelope type, opened through an async API, stored as opaque ciphertext, and never logs partials. It does stress A-struct-0, A2, A4, A8 and A9. A0's spirit is stressed if the member list is published in the clear.

## (c) Phases: the word has several meanings
1. **Semantic kernel phases 0–8** (`ME/typedocs/Phases.md`, contract `ME/tests/phases.test.js`, **11/11 pass**). The test runs Phase 0 (identity + secret scope), 1 (`[]` selectors), 2 (`[i]` broadcast + `=`), 3 (logical filters), 3.1 (filtered broadcast), 4 (range/multi-select), 5 (transform projection), 6 (cross-scope public+secret contract), 7A (replay), 7B (snapshot) and 8 (incremental recompute + explain with masked secret origins). The doc skips 3.1, 4 and 5 (`Phases.md:62→73`). `Phases.md:113` claims 7B "preserves … secrets, and noises exactly", which contradicts `phases.test.js:204-212` (Option B: snapshots carry only redacted placeholders). Crypto appears in Phases 0, 6, 7B and 8. **No audience or multi-party phase exists.**
2. **Kernel performance phases 1–3, closed** (`ME/typedocs/kernel/Benchmarks.md:9-65`; files in `ME/tests/Phases/Phase.*`): 1 = batch write/journal, 2 = bounded residency + columnar *encrypted* vector corpus, 3 = exact + IVF search (commit `c5da616` "close Phase 3"). No audience work.
3. **Mesh phases 1–10 in monad, all done** (`modules/monad/Typescript/typedocs/Mesh/status.md:51-66`; `all.this/AGENTS.md:39-40`): Phase 2 = self mapping / monad identity / `__surface`; Phase 10 = Total Monad Synthesis. Their crypto is Ed25519 surface identity only.
4. **"Corte 4"** (Spanish: cutover): v3 became the default blob format (`crypto.ts:682`, `kernel-state.ts:69`, `types.ts:776`).
5. **Identity-Bound Secrets "this phase"** (`ME/typedocs/Identity-Bound-Secrets.md:588-606`): rotate-and-re-encrypt, social recovery and HTTP unlock routes are deferred.

Audience/intersection work is **not scheduled in any phase**. The closest item is an open question in `all.this/AGENTS.md:57-60` (should a shared branch's address derive from its membership or from an assigned ID?).

## (d) Crypto inventory
| Primitive | Location | What it does | Public API | Tests | Status |
|---|---|---|---|---|---|
| Secret scope `_` | `operators.ts:130-141`; `core-write.ts:305-311`, `:965`; `core.ts:304-346` | Marks a path; descendants go into encrypted branch chunks; root is stealth | DSL `me.x["_"](s)` | axioms A0/A2, phases 0/6, Security battery | implemented + tested |
| Noise `~` | `core-write.ts:1085-1091`; `secret-context.ts:103-157` | Cuts lineage inheritance | DSL `["~"]` | axioms A3*, `secret-blob-v3.read` | implemented + tested |
| `effectiveSecret` (legacy) | `secret-context.ts:180-229` | FNV-1a-32 chain of secrets; used for v2 keys and memory hashes | internal (`_memories`) | axioms A3/A8, `secret-material-v3` | implemented + tested (weak, 32-bit) |
| `collectSecretChainV3` | `secret-context.ts:261-287` | Ordered transcript: domain, mode, scope, anchor, noise boundary, lineage | internal | `secret-material-v3.test.ts` (passes, not in `npm test`) | implemented + tested |
| `deriveSecretMaterialV3` / `deriveBlobV3Keys` | `crypto.ts:664-680`, `:489-506` | keccak256 over transcript → HMAC-Keccak enc/mac keys bound to path | exported from crypto.ts, not the package barrel | same + `secret-blob-v3.*` | implemented + tested |
| `encryptBlobV3` / `decryptBlobV3` | `crypto.ts:945-1107` | Keccak counter keystream XOR + HMAC-Keccak tag (encrypt-then-MAC, 16-byte nonce, 16-byte tag, AAD = header+nonce+path) | internal | `secret-blob-v3.read/write`, `secret-blob-hardening.contract` | implemented + tested |
| v4 identity-bound (`deriveSecretMaterialV4`, `encrypt/decryptBlobV4`) | `crypto.ts:719-943`; `secret-context.ts:327-392`; write choice `core-write.ts:627-632` | Same codec, HMAC-keyed by a random per-identity root | `createIdentityRoot`/`unlockIdentity`/… | `identity-bound-secrets.test.ts` (11/11), Security battery (all pass) | implemented + tested (**not shareable by design**) |
| Identity root envelope | `identity-root.ts:179-340` | PBKDF2-SHA256 (600k default) → AES-256-GCM, **with AAD = rootId** | `generateIdentityRoot`, `wrapIdentityRoot`, … (index.ts:28-33) | Security `crypto-tamper.test.ts:252-300` | implemented + tested |
| `rotateIdentityRoot` | `identity-context.ts:200-232` | New root; old v4 data becomes unreadable (no re-encryption) | `me.rotateIdentityRoot` | Security `root-lifecycle` | implemented + tested (not audience rotation) |
| `identityHash` | `me.ts:148-150` (`keccak256("this.me/identity:v1::"+seed)`) | Public fingerprint | `me["!"].identity()` | README tests | implemented + tested |
| Ed25519 proofs `prove()` | `me.ts:656-690`; `crypto.ts:1259-1350` (HKDF seed+expression → Ed25519) | Signs `{identityHash, namespace, challenge, ts}` | `prove`, `verifyEd25519Signature` (index.ts:19-25) | No runnable kernel test found. `tests/bind-namespace.test.ts` crashes under plain Node (TS `enum` in strip-only mode) and references the removed `bindNamespace` | implemented, **kernel test not verified** |
| P-256 keygen / import / export | `crypto.ts:1372-1420` | **Random** ECDH keypair (WebCrypto); no seed derivation | `ME.generateP256KeyPair` etc. (static, `@internal`, `me.ts:247-251`) | wrapped-secret contracts | implemented + tested (single use) |
| `wrapSecretV1` / `unwrapSecretV1` | `crypto.ts:1422-1539` | ECDH-ES P-256 (ephemeral) → HKDF-SHA-256 (random 32-byte salt, info `this.me/wrapped-secret/v1`) → AES-256-GCM, 12-byte IV. **No AAD**: `kid`, `class`, `policy`, `publicKey` are unauthenticated (verified: a forged kid/class/policy still unwraps) | `ME.wrapSecretV1/unwrapSecretV1` (static, `@internal`, `me.ts:253-270`) | `wrapped-secret.contract` (passes), `wrapped-secret-negative.contract` (**flaky**, see e), `keyspace.contract` (passes). **None are in `run-contracts.mjs`** (only dsl, secret-blob-hardening, pointer-category) | implemented, weakly tested |
| Keyspace (`storeWrappedKey`, recipient keyring, `me://self:{read,write,open,use}/keys`) | `core-keyspace.ts:9-126`; snapshot `core-snapshot.ts:51,94` | Stores one `WrappedSecretV1` per keyId; opens with an installed/inline private key | `me.execute("me://self:…/keys…")` | `keyspace.contract` (passes, unwired) | implemented + tested (unwired) |
| Union (multi-recipient: DEK + N wraps) | — | — | — | — | **absent** (primitive only) |
| Intersection (XOR split / joint key / n-of-n) | — (PoC only, untracked `all.this/docs/intersection-proof/`) | — | — | PoC 9/9 on box | **absent in kernel**; documented in SetChemistry.html:244-254 |
| Threshold k-of-n | — | — | — | — | **absent**; docs say it would need Shamir (SetChemistry.html:253-254) |
| Set difference / revocation / audience rotation / epochs | — (only cache `secretEpoch`, `secret-context.ts:159`) | — | — | — | **absent**; documented only (SetChemistry.html:257-261) |
| `AudienceBlobV1` | — (only SetChemistry.html:267-276) | — | — | — | **absent** |
| Legacy v2 / XOR | `crypto.ts:330-662`, `:1109-1123` | v2 keys from the 32-bit `effectiveSecret`; legacy repeating-key XOR | internal (read compat) | `secret-blob-v3.write` (migration) | legacy |
| Rust port | `me/Rust/src/kernel/wrapped_secret.rs` | Single-recipient wrap parity. `compatibility/README.md:53-55`: "Audience composition not proven in TypeScript must not be invented in Rust" | — | parity fixtures | single-recipient only |

Direct answers:
- **Union:** implemented and tested only as a *single-recipient* wrap. No multi-recipient envelope.
- **Intersection:** not implemented anywhere in the kernel, cleaker or monad. Only the external PoC.
- **Threshold:** absent.
- **Difference / revocation / rotation of audiences:** absent (identity-root rotation exists, but it is a different thing).
- **`AudienceBlobV1` in code:** no.

## (e) The failing negative test: a test bug, not an AEAD bug
Test: `ME/tests/contracts/wrapped-secret-negative.contract.test.mjs:40-58` (ciphertext) and `:61-77` (tag). It replaces the **last Base64URL character** with `"B"` if that character is `"A"`, otherwise with `"A"`.

Why that is unsound:
- The secret `"orgboat-super-secret"` is 20 bytes. Its Base64URL form is 27 chars = 162 bits, so the last char carries 2 unused bits. `bytesToBase64Url` (`crypto.ts:1140-1152`) emits canonical output with those bits set to 0, so the last char is one of 16 letters (A, E, I, M, …). When it is `A`, swapping to `B` flips only an unused bit. `base64UrlToBytes` (`crypto.ts:1154-1168`, Node `Buffer.from(…,"base64")`) is lenient and decodes it to **identical bytes**. AES-GCM then verifies, unwrap succeeds, and the assertion fails. Probability 1/16.
- The tag is 16 bytes: 22 chars, 4 unused bits, last char ∈ {A, Q, g, w}. P(`A`) = 1/4, same failure mode.
- Expected failure rate per run: 1 − (15/16)(3/4) ≈ **29.7%**.

Empirical check. I ran an inline `node -e` script from `/tmp` against the existing `dist`; no files were written.
- 400 envelopes. Ciphertext case: "tamper" not detected **31/400 (7.75%)**, and in **all 31** the tampered string decoded to the same bytes. Tag case: **100/400 (25%)**, again all byte-identical.
- In 800 checks there were **0 real AEAD failures**. Flipping a real bit in the last decoded ciphertext byte was rejected **50/50** times.
- Running the actual test 40 times: **26 pass / 14 fail (35%)**, consistent with ≈29.7%.

The reviewer who saw the ciphertext case fail hit the 1/16 case: the ciphertext ended in `A`.

Fix: tamper decoded bytes, as the Security battery already does (`tests/Security/helpers.ts:77-93`, `tamperB64u`/`tamperB64uAt`), or change a non-final character. Also wire the wrapped-secret and keyspace contracts into `run-contracts.mjs`.

Related real findings:
1. `wrapSecretV1` has **no AAD**, so its metadata is malleable (verified).
2. Base64URL decoding accepts non-canonical encodings, so one envelope has several string forms. That matters wherever envelopes are hashed, signed, content-addressed or deduplicated *as strings* (e.g. the A8 JSON hash).

## (f) Where docs and site claim more than the code does
1. **EncryptedIsland.html:10/17/33 (meta), 227-230, 238-239, 251**: the audience is "composable by union or intersection"; "`wrapSecretV1` over `identityHash(K)` extends single-owner A to union/intersection across kernels". Present tense, not implemented. Lines 373-380 do list limits but still presuppose the constructions exist.
2. **SetChemistry.html:199**: `generateP256KeyPair(HKDF(K.seed,"this.me/p256/v1"))`. In the code the keypair is random (`crypto.ts:1372-1385`), and `this.me/p256/v1` appears nowhere in src.
3. **SetChemistry.html:228-261, 266-280**: union envelope, XOR intersection, difference and `AudienceBlobV1` "stored at the target path in the kernel's encrypted branch". None exist.
4. **SetChemistry.html:285-292**: axiom compatibility table. A8 "extended" is not implemented. A9 "timestamp + hash" is stale (now `seq`).
5. **SetChemistry.html:215**: wrap output listed as `{ephemeralPublicKey, iv, ciphertext, tag}`. The real shape is `{version, class, kid, publicKey?, encryption:{kex,kdf,aead,iv,salt,tag,ciphertext,ephemeralPK}, policy?}` (`crypto.ts:1468-1484`).
6. **EncryptedAudiences.html:216-223**: "A scope secret wrapped to a recipient's public key transmits membership … Tested against correct and corrupted recipients." Nothing connects a wrapped secret to `_` scope membership; the application would have to unwrap it and call `_()` itself. The corrupted-recipient test is flaky (e) and not part of any test runner.
7. **EncryptedAudiences.html:270-271**: "Every scoped access performs real key derivation — no cached policy decision". The v3/v4 keys and decrypted chunks are LRU-cached (`secret-context.ts:294-317`, `:364-392`; `secret-storage.ts:346-405`). Guest reads are gated by comparing the raw secret string in-process (`core-read.ts:29-50`, `me.ts:1504-1523`), which is a policy check, not a derivation.
8. **EncryptedAudiences.html:259**: "shared — |A| ≥ 2 (via key wrapping)" is not a kernel construct.
9. **`ME/typedocs/Algebra-of-Contexts.md:169-170`**: "`A` is enforced cryptographically here, inside `.me` itself, via scope-secret key-wrapping". Scope secrets are derived, not wrapped (see item 6). `:144` `A = {me ∪ wife}` has no kernel implementation.
10. **`ME/typedocs/NRP-Kernel-Role.md:30-31`**: the kernel owns "Audience rules" and "Capabilities". No capability code exists in `ME/src`. `:42`: "A8 … NRP can verify freshness without trusting the transport" contradicts the FNV-32 hash, redacted `effectiveSecret`, no signatures, and the documented absence of freshness (`tests/Security/README.md:62-68`). `:40` mislabels A3.
11. **`ME/README.md:92`**: "Only this audience can read it" in a single-secret example. `:330-353` "Multiple parties can derive a shared namespace without a server": a README snippet, not kernel code, and it requires pooling seeds (see b).
12. **`all.this/CLAUDE.md:142`**: secret branches encrypt "using key material derived from `seed` + the scope secret chain". v3 does not use the seed (`secret-context.ts:279-286`). v4 uses a separate random identity root, not the seed.
13. **`ME/typedocs/Phases.md:113`** (7B preserves secrets) vs `phases.test.js:204-212`. Also Phases 3.1/4/5 are missing from the doc.
14. **`ME/docs/Axioms.md:163`**: stale A9 rule.
15. **Layering contradiction in the docs themselves**: `modules/monad/Typescript/typedocs/architecture/nrp-chemistry.md:135-153` says audience chemistry "lives entirely in the NRP / cleaker layer — not in `.me`" and that `.me` has "no social chemistry". Algebra-of-Contexts.md:169 and SetChemistry.html:278-280 place audience enforcement and blobs inside the kernel.
16. SetChemistry.html:309-311 quotes NRP's "namespace key distribution across monads" exclusion. That text is in `NRP-v0.2.1.md:570`. The normative `NRP-v0.3.0.md` has no audience or key-distribution section at all.

## (g) Layering recommendation (evidence-backed; the recommendation itself is inference)
Evidence on what layers exist:
- The kernel already hosts local, pure crypto primitives: WebCrypto wrap/unwrap, keyspace `open` returning a Promise, the identity-root lifecycle and Ed25519 `prove()`. It does no network I/O (`ME/README.md:316-317`, `index.ts:2`).
- **Monad** publishes only **Ed25519** keys: the `/__surface` entry carries `cleaker(monad)` proofs with an Ed25519 SPKI PEM (`modules/monad/Typescript/src/http/selfMapping.ts:34-51`). `/claims` has only POST routes (`modules/monad/Typescript/src/http/claims.ts:252-254`). The claim proof from `prove()` carries an Ed25519 `publicKey` (`modules/cleaker/Typescript/src/binder.ts:45-70`; `monad/src/claim/records.ts:137`).
- No P-256/X25519 encryption key is published or discoverable anywhere. Searching cleaker/monad `src` for wrap/audience-encryption turns up only signature "audience binding" (domain separation, `cleaker binder.ts:465`, `monad claim/records.ts:282-372`) and NRP-grammar `∩` handling that never resolves composites (`monad src/http/nrpHandler.ts:113-128`).
- Cleaker groups are anchored membership records with no crypto (`modules/cleaker/Typescript/src/group/types.ts:1-18`). SetChemistry.html:297-315's statement that key discovery is unsolved **holds**.

Recommended split:
1. **Kernel (`.me`), pure and local, no network:**
   - The opening-condition expression type (any / all / k-of-n over principal public keys) and the envelope format, with strict canonical encoding.
   - `seal()`, `producePartial(envelope, ownKey)`, `verifyPartial()`, `combine()` and `open()` as pure functions.
   - Deterministic derivation of a member's encryption key from the seed, analogous to `deriveBranchProofSeed` (`crypto.ts:1259-1272`).
   - AAD binding of audienceId, epoch, path and member index.

   This extends what `wrapSecretV1` and the keyspace already are. Storage: the envelope as an opaque value in the branch plane, never in `_memories`, and never logging partials. Reads of a closed envelope should resolve as closed through the existing stealth-null path, opened through a separate async API.

   Constraints: WebCrypto cannot add points. A joint-key design (the PoC) therefore needs a new curve dependency (noble) in a kernel that currently depends only on `js-sha3`. The XOR-split design needs only existing WebCrypto, but it requires a `wrapSecretV2` with AAD, and it costs O(n) wraps.
2. **Transport of contributions (NRP / monad runtime):** a new NRP message type (e.g. over `/nrp` WebSocket) carrying envelope-bound partials, with replay protection. The normative spec currently has nothing here (`NRP-v0.3.0.md` sections 0-12).
3. **Identity binding and public-key discovery (cleaker):** publish `(identityHash, encPub, signature by the prove key)` as part of the claim. Replace the seed-pooling `surface[a+b]` / `audienceSeed` derivation with a hash of sorted, PoP-verified public keys.
4. **Enforcement and policy (monad):** who may request partials, rate limits, audit logging. Confidentiality itself stays cryptographic.

Before any of this, resolve the doc contradiction between nrp-chemistry.md:135-153 and Algebra-of-Contexts.md:169, e.g. "primitives in the kernel; resolution/derivation in cleaker/NRP".

## (h) Open questions the audience-algebra document must answer
1. Grammar and semantics of the opening condition: `any`, `all`, `k-of-n`, nesting. How does it map to NRP `+`/`∩`? How do you disambiguate cleaker's unrelated `∩` (namespace refinement) and the `~` noise/complement clash (`SetChemistry.findings.md:7-16, 145`)?
2. What is a principal: per-seed, per-namespace (prove keys are per-expression), per-device? How do multi-device identities join?
3. Encryption key: which curve (P-256 vs X25519 vs ristretto255)? Deterministic from the seed (HKDF domain) or random and backed up via the identity root? How does member key rotation work?
4. Construction: XOR-split per-member wraps (O(n), WebCrypto-only) or joint-key ElGamal (O(1) wrap, new dependency, PoP mandatory)? Who is the combiner? The combiner learns the DEK (PoC README "Non-goals" item 1). Is that acceptable?
5. Binding and integrity: what goes in the AAD (audienceId, epoch, path, member index, envelope id)? Should `wrapSecretV1` metadata malleability be closed in a V2? DLEQ proofs to blame bad partials?
6. Canonical encoding: strict Base64URL, canonical JSON for hashing and signing envelopes.
7. Membership privacy: publish member identityHashes in the clear, or use blinded or anonymous recipients? Is that compatible with A0?
8. Epochs: who may rotate? Ordering of concurrent rotations, given that A9 `seq` is per-instance. What prevents rollback to an old epoch? (Security README says no freshness mechanism exists.)
9. Revocation and difference: forward-only semantics; eager vs lazy re-encryption; what does `A \ B` mean formally?
10. Threshold: Shamir/Feldman with a dealer, or a DKG? How is the share holder list published?
11. Relation to `_`/v3/v4: is an audience scope a `_` path? How does `~` interact with it? v4 identity-root binding makes kernel keys unshareable, so where does the DEK live (branch vs value)?
12. Surface semantics: the async open API vs synchronous `me(path)` (A-struct-0). What does a closed read return (`undefined` vs `null`; disclosure `closed`)? What do pointers into audience scopes do (A4)? What does `explain()` show?
13. Audit: which events go into the hash chain (envelopes, open events, never partials)? Replace FNV-32 with a cryptographic hash? Sign entries so other parties can verify (A8)?
14. Transport: NRP message schema for partials, replay/nonce rules, relay blindness, timeouts, partial liveness.
15. Key discovery and binding: where encryption keys are published (cleaker claim? `/__surface`?), signed by which key, and how trust in them is established (TOFU vs signed claim).
16. Shared-space addressing (`AGENTS.md:57-60`): derived (hash of sorted *public keys*, not seeds) vs anchored (cleaker group). How do the two coexist?
17. Metadata leakage: sizes, member counts, access timing (already out of scope for single-owner scopes, `Identity-Bound-Secrets.md:267-275`).
18. Test and parity plan: TS reference vectors with positive and negative fixtures before any Rust port (`compatibility/README.md:53-55`). Wire the contracts into `npm test`, and fix the Base64URL tamper test.
