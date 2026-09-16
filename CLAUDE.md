# CLAUDE.md
This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Repo Structure

`all.this` is a **pnpm monorepo** where every subdirectory is also an independent **git submodule**. The two systems are orthogonal: git submodules handle source control; pnpm workspaces handle local JS dependency linking.

```
all.this/
  me/Typescript/          → this.me kernel (.me)
  modules/
    cleaker/Typescript/   → namespace / identity layer
    monad/Typescript/     → HTTP runtime daemon (monad.ai)
    netget/Typescript/    → gateway + OpenResty config generator
  packages/
    GUI/Typescript/       → React component library (UMD + Vite)
```

Turbo is the task runner. Build order is enforced by `turbo.json` (`^build` dependency chain): `.me` → `cleaker` → `monad` → `netget`.

---

## Commands

### Root (turbo)
```bash
pnpm install          # install all workspaces
pnpm build            # build all packages in dependency order
pnpm test             # test all packages
pnpm dev              # start all persistent dev watchers
```

### `me/Typescript` — the .me semantic kernel
```bash
npm run build         # tsc + vite
npm run test          # runs all axiom + contract suites
npm run test:prebuild # pre-build contract checks
```
Run a single test file directly:
```bash
node tests/axioms.test.ts
node tests/fire.test.ts
node tests/Phases/Phase.2.0.smoke.test.js
```

### `modules/monad/Typescript` — monad daemon
```bash
npm run dev           # tsx watch server.ts  (auto-reload)
npm run build         # tsc → dist/
npm test              # vitest run (all)
npm run test:netget   # vitest run tests/netgetRegistration.test.ts
npm run test:claims   # tsx tests/claim_test_verification.ts
```
Run a single vitest file:
```bash
npx vitest run tests/netgetRegistration.test.ts
```

### `modules/netget/Typescript` — gateway / NRP infrastructure
```bash
npm run dev           # tsx src/netget.cli.ts
npm run build         # tsc -p tsconfig.lib.json
npm test              # runs 6 tsx test files
npm run test:nrp:curl # end-to-end NRP curl suite (needs live stack)
```
Override NRP curl test targets:
```bash
NRP_HANDLE=jabellae npm run test:nrp:curl
NRP_HOST=my-host.local NRP_SCHEME=https npm run test:nrp:curl
```

### `modules/cleaker/Typescript`
```bash
npm run build         # typecheck + vite build + types
npm test              # tsx test suite (axioms, bind, namespace, me-target, space, fallback)
npm run test:axioms   # tsx tests/axioms.test.ts
```

### `packages/GUI/Typescript` — React UI library
```bash
npm run build         # vite build + types + UMD bundles
npm run dev           # vite dev server (HMR)
npm run build:umd     # rebuild UMD bundles only
```
After rebuilding GUI, sync UMD to both netget asset locations:
```bash
# dist/this.gui.umd.js must be copied to:
# modules/netget/Typescript/assets/namespace-surface/assets/this.gui.umd.js
# modules/netget/assets/namespace-surface/assets/this.gui.umd.js
```

---

## Architecture

### Layer model (bottom → top)

| Layer | Package | Role |
|---|---|---|
| **Kernel** | `this.me` | Cryptographic semantic memory. All data, secrets, and identity are rooted here. |
| **Identity** | `cleaker` | Namespace grammar, `parseNamespaceExpression`, `composeNamespace`. |
| **Runtime** | `monad.ai` | Express HTTP daemon. Owns one `ME` kernel instance. Serves `me://` paths over HTTP. |
| **Gateway** | `netget` | OpenResty config generation. Routes hostnames → monads via `surface_proxy.lua`. |
| **UI** | `GUI` | React component library compiled to UMD, loaded by monad's HTML shell. |

### No module owns a domain — `window.location` is the only anchor

Confirmed 2026-09-16, after removing the last hardcoded root
(`local.cleaker`/`cleaker.me`) from `CleakerLanding.tsx`: none of the
layers above are tied to a specific hostname, and none should be. Each is
a direct, portable load — `this.me`, `cleaker`, `monad.ai`, `netget`, `GUI`
(and the in-progress `this.url`/`this.DOM`, see
`packages/GUI/Typescript/src/gui/All.This/NRP/Beatle/SetChemistry.findings.md`)
all run identically regardless of which domain they're served from. The
one legitimate exception is the physical location of whatever's currently
running — `window.location` in a browser, `req.headers['host']` in a
server process (`window` doesn't exist in Node; `nrpHandler.ts`'s own
`deriveEndpoints()` already reads the request's Host header for exactly
this reason). Neither is a hardcoded value; both are a physical fact about
the current page/request, safe to read for "where am I" (never for "what
does this namespace mean," which is a protocol question, not a location
one — see SetChemistry.findings.md's "relative-name resolution context"
case for why guessing the second from the first is wrong even when it
looks convenient).

`window.location`'s own two-part shape (client-side; the server-side
equivalent is just `req.url`/`req.headers['host']` split the same way)
mirrors NRP's `me://namespace/path` almost exactly: `location.origin` is
the namespace-context anchor (which root you're standing on),
`location.pathname` is where locally-resolved state actually lives —
bookmarkable, shareable, refresh-safe. `CleakerLanding.tsx`'s
own routes (`/users`, `/blockchain`, `/keychain`, `/url`) are exactly this:
each one a `path` segment carrying real resolved context, the same
relationship `me://` has to its own path component, just reflected in the
one URL bar a browser tab actually has.

`new ME(seed)` creates the kernel root. The `seed` (64-hex string) is the **namespace authority** — it is not the hostname. Everything cryptographic derives from it:

- `identityHash = keccak256("this.me/identity:v1::" + seed)` — public fingerprint
- Secret branches: `me.path["_"]("key")` encrypts that subtree using key material derived from `seed` + the scope secret chain
- `me[ME_RESEED]("username", "password")` → compound seed = `keccak256("me.seed/compound:v1::username::password")` — user identity independent of any monad

Key axioms tested in `me/Typescript/tests/axioms.test.ts`:
- **A0/A2**: Secret scope root returns `undefined` (stealth) — never leaks existence
- **A3/A3b**: Nested secrets; `~` noise reset cuts derivation inheritance
- **A8**: Hash-chain integrity across all memories
- **A9**: LWW deterministic conflict resolution

### `monad.ai` request lifecycle

```
HTTP request
  → Express app (app.ts)
  → requestLogger + createDisclosureMiddleware
  → createMonadsControlRouter   (/.monads/*)
  → createProviderSurface        (GUI bootstrap)
  → ledger.atPath / ledger.blockchain / ledger.root
       ↳ createPathResolverHandler  (semantic reads)
  → meCommandHandler             (/me/*)
  → createClaimsRouter           (/claims/*)
  → createMeshResolveRouter      (/resolve?target=me://...)
```

**Kernel access**: `getKernel()` in `src/kernel/manager.ts` is a singleton. It reads `process.env.SEED` (or `ME_SEED`) once. Namespace routing: `namespaceToKernelPrefix("jabellae.suis-macbook-air.local")` → `"users.jabellae"`. All user data lives at `users.<handle>.*` within one root kernel.

**Snapshot persistence**: `saveSnapshot()` writes `me-state/snapshot.json`. The monad hydrates from this on startup. Writes to the kernel must call `saveSnapshot()` or they are lost on restart.

**NRP disclosure contract** (`src/http/pathResolver.ts`):
- public path → `200 { disclosure:"public", value }`
- stealth/secret/absent-near-secret → `200 { disclosure:"closed", value:null }`
- genuinely absent (not near any secret scope) → `404`

Never return `"stealth"` on the wire — `"closed"` is the correct external label.

### NetGet / OpenResty routing

`setNginxConfigRoutes.ts` generates `netget_app.conf` (never edit the installed `.conf` by hand). The Lua handler `surface_proxy.lua` implements "Total monad synthesis":

```
request host → rootspace_of(host) → scan apps.json → pick monad with highest lastSeenMs → proxy_pass
```

Monads register by POSTing to `/apps/report` at the netget endpoint (default `local.netget`). The heartbeat interval is controlled by `MONAD_NETGET_HEARTBEAT_MS` (default 3000ms). An entry expires after `4 × heartbeatMs`.

### Environment variables (monad)

| Var | Purpose |
|---|---|
| `SEED` / `ME_SEED` | Namespace authority key — required |
| `ME_NAMESPACE` | Canonical rootspace name (e.g. `suis-macbook-air.local`) |
| `MONAD_NAME` | Human name of this surface instance (e.g. `macbook`) |
| `MONAD_PRIVATE_KEY` | Ed25519 surface identity key — if absent, **incorrectly** derived from `SEED` |
| `ME_STATE_DIR` | Where `snapshot.json` lives (default: `me-state/`) |
| `MONAD_SELF_CONFIG_PATH` | Path to `env/self.json` surface config |

Surface config lives in `modules/monad/Typescript/env/self.json` (not committed; see `self.example.json`).

### Known architectural gaps

1. **Surface identity is unclaimed** (as of 2026-08-28; supersedes an older "surface key derivation bug" note). The old bug is fixed: `ensureCleakerIdentityConfig()` in `selfMapping.ts` always generates a fresh Ed25519 keypair and persists it to `self.keys.json` on first run — never derives it from `SEED`/`NAMESPACE_SEED` (the old HKDF-from-seed path, `deriveEd25519KeyPairFromSeed()`, is dead code — zero callers in `src/`, worth deleting). So every surface already has a strong, persistent, non-collidable identity keypair. What's still missing: nothing cryptographically binds that keypair to the namespace it claims to serve — there is no `cleaker(me)`-style claim for surfaces the way there is for human namespaces. See `modules/cleaker/Typescript/typedocs/Surface-Identity-Claims.md` (design, not yet implemented).

2. **`surface_proxy.lua` ranks trust, it does not verify claims**: it now has a trust-tier system (`owner > admin > peer > guest`, computed at registration time by `apps.lua`'s `derive_trust()` against `gateway-claims.json`) and logs a `WARNING` when two same-tier candidates disagree on `identityHash` for the same host — better than the old silent string-only match, but still not verification. Routing is decided by relative registration-time trust ranking, not by checking that a candidate's `identityHash` holds an actual, currently-valid claim for the namespace it's answering for. Two different namespaces with the same hostname string and the same trust tier are still indistinguishable — the mismatch is only ever logged, never rejected. Closing this depends on gap #1 above (surface claims) existing first.

   **Now directly load-bearing (2026-09-12), not just a routing-time concern**: `netget`'s own gateway-setup claim flow (`gatewaySetupSession.ts`'s `commitSignedClaim`) resolves which monad serves a namespace via `resolveSurface()` — reading the same `apps.json` this gap describes. The claim flow's own signature/claim-identity verification is real and independently checked, but it trusts `resolveSurface()`'s answer to know *which* monad to check against; if this gap let a rogue local reporter win the trust/recency reduction, it would redirect that check to a fabricated origin. Contained today only because mesh registration is hard-loopback-enforced on both the monad client (`netgetRegistration.ts`) and netget's Lua ingest (`apps.lua`'s `is_local_request()`) — exploiting it needs code execution on the same machine. That containment disappears the moment cross-host mesh work begins, so closing this gap (signed heartbeats) is a hard prerequisite before that work, not an optional hardening pass. See `gatewaySetupSession.ts`'s own comment at its `resolveSurface()` call site, and session memory `project_netget_gateway_claim_authority.md`/`project_mesh_roadmap_phases.md`.

3. **`modules/monad/npm` must not exist**: if you see a process started from that path, it is a zombie from when `npm` was a symlink to `Typescript`. Kill it and restart from `modules/monad/Typescript/`.

4. **`monad.ai`'s own `/.mesh/announce` (2026-09-12): substantially hardened, one gap deliberately not closeable here.** This is a genuinely different, cross-host-capable registration path from netget's loopback-locked `/apps/report` (gap #2 above) — distinguished this session after independent review found it was previously wide open (no auth, no destination validation). Now closed: signature verification (`status: 'pending'|'verified'` on `MonadIndexEntry`), first-key-wins re-announce protection (checked regardless of whether the LATER announce itself verifies — an earlier version of this fix had a real bypass here, found in review and fixed), a squatting check applied identically to both `claimed_namespaces` and the primary `namespace` field (an unclaimed namespace passes through, a namespace someone else genuinely holds does not), a hard-coded block on the cloud metadata address in `bridgeHandler.ts`, an operator-configurable trusted-key allowlist that fails closed (not open) when misconfigured, and the pending-gate applied to every selection path including the explicit `?monad=name` shortcut. **Not closed**: `identity_hash` is now included in the signed payload (can't be swapped post-signing), but nothing cryptographically binds a signing key to the `.me` identity it claims to speak for — that's gap #1 above (surface identity is unclaimed), not something this pass could close without inventing a real delegation mechanism. See `modules/monad/Typescript/src/http/meshAnnounce.ts`'s own doc comments and `tests/NRP/meshAnnounce.test.ts` for the exact guarantees and their tests.

5. **RESOLVED 2026-09-13 — namespace-derived gateway claims used to break `grantAdmin`/`revokeAdmin`/`transferOwner` in real runtime.** `GatewayClaimsManager`'s three methods wrote through the OLD model — `commitSnapshot()` → `writeLedger()` → an UNSIGNED `writeToMonad()` HTTP call — correct only when netget owned a dedicated, unclaimed monad; once the monad genuinely held a `.me` claim, `commandHandler.ts`'s write-auth gate rejected it with `NAMESPACE_WRITE_FORBIDDEN` (confirmed live pre-fix). **Fix — the E+A signed-delegation mechanism**: canonical owner/admins/grants state now lives in `.me` itself, in a new kernel-root, namespace-independent branch (`daemon.gateways.<gatewayId>`, deliberately not nested under any user's `users.<handle>` tree — see `modules/monad/Typescript/src/claim/gatewayAuthority.ts`'s own header comment), mutated only via signed grant/revoke/transfer/bootstrap calls verified independently by whichever monad holds that branch (never trusting netget's own prior check). Two checks per mutation, never conflated: "vigencia" (is the signing keychain key currently active) and "autorización" (does that identity currently hold gateway authority, per the branch's OWN state — never the keychain's own `admin` bit, which means something narrower). Netget's `GatewayClaimsManager.materializeFromGatewayAuthority()` only ever reads this branch back to refresh the local `gateway-claims.json` cache Lua consumes — read access, never write permission. The OLD unsigned methods (`bootstrapOwner`/`grantAdmin`/`revokeAdmin`/`transferOwner`) are kept, doc-commented LEGACY, for `gateway-claims.test.ts`'s own self-owned-ledger model coverage only. **Behavior change worth knowing**: deleting `gateway-claims.json` locally no longer means "unbound" — the canonical branch on the monad is the real source of truth now (see `gateway-setup-session.test.ts`'s case 7h). **MVP scope**: assumes the acting identity's keychain and the gateway's canonical branch live on the SAME monad (today's real single-operator setup) — a second admin on a genuinely different host is future work, not solved here. See `modules/netget/Typescript/tests/gateway-claims-live-write-integration.test.ts` and `modules/monad/Typescript/tests/gatewayAuthority.test.ts` for the live-verified guarantees, and session memory `project_mesh_announce_trust_hardening.md`'s "RESOLVED" section for the full design rationale (options A-E considered, why E+A was chosen).

   **Hardening pass, 2026-09-13 (before any UI/VM work) — three guarantees investigated and live-verified, disposable infra + real process restarts, not just unit coverage**: (1) `bootstrapGatewayAuthority` now also requires the claiming namespace to be rooted in this installation's own configured identity (`isNamespaceLocalToThisInstallation`, reusing `kernel/manager.ts`'s `isRecognizedOwnRootConstant`) — investigation found the specific attack this closes (claim a foreign namespace here, bootstrap someone else's gatewayId) was already unreachable via the standard claim+keychain flow (a separate, pre-existing guard blocks obtaining an active key for a genuinely foreign namespace), so this is explicit defense-in-depth, not a newly-closed live exploit; concurrent bootstrap requests for the same gatewayId are confirmed atomic (exactly one winner) via a live two-request race test. (2) `GatewayClaimsManager.materializeFromGatewayAuthority()` had a real bug — any unreachable/wrong/non-OK response silently downgraded the local cache to an empty "needs bootstrap" snapshot; fixed to preserve the existing local cache whenever the canonical branch can't be verified, confirmed via a real killed-and-relaunched monad process (not just a new JS object) that the canonical branch alone restores the original owner after the local cache is wiped. (3) revoking gateway-admin status is confirmed to kill an already-issued, still-signing-key-valid admin session on its very next use, while an identity that retains authority is unaffected. A minor, unrelated robustness gap was also found and spun off separately (not fixed here): registering a keychain key for a namespace foreign to a monad's own root crashes with an uncaught 500 instead of a clean 4xx.

---

## Key files to read first for any area

| Task | Files |
|---|---|
| Kernel internals | `me/Typescript/src/me.ts`, `core-write.ts`, `secret-context.ts` |
| Axioms / invariants | `me/Typescript/tests/axioms.test.ts`, `me/Typescript/docs/Axioms.md` |
| Monad HTTP routing | `modules/monad/Typescript/src/app.ts`, `handlers/ledgerHandler.ts` |
| NRP protocol spec (normative) | `modules/monad/Typescript/typedocs/NRP-v0.3.0.md` — canonical source lives with the implementation (monad), not the public site |
| NRP implementation status | `modules/monad/Typescript/typedocs/Mesh/status.md` |
| NRP public overview (non-canonical) | `https://neurons-me.github.io/NRP/` — thin index/map only, links back to the above; never the source of truth |
| Disclosure envelope | `modules/monad/Typescript/src/http/pathResolver.ts`, `http/disclosure.ts` |
| Surface registration | `modules/monad/Typescript/src/runtime/netgetRegistration.ts` |
| Monad mesh scoring | `modules/monad/Typescript/src/kernel/scoring.ts`, `meshSelect.ts`, `patchBay.ts` |
| OpenResty routing | `modules/netget/Typescript/src/modules/NetGetX/OpenResty/setNginxConfigRoutes.ts` |
| Lua proxy | `modules/netget/Typescript/src/modules/NetGetX/OpenResty/lua/handlers/surface_proxy.lua` |
| Algebra of contexts | `me/Typescript/docs/Algebra-of-Contexts.md` |
