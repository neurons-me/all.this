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

Turbo is the task runner. Build order is enforced by `turbo.json` (`^build` dependency chain): `this.me` → `cleaker` → `monad` → `netget`.

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

### `this.me` kernel

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

1. **Surface key derivation bug**: if `MONAD_PRIVATE_KEY` is absent, `selfMapping.ts` derives the Ed25519 keypair from `SEED` via HKDF. Two monads with the same namespace seed get the same surface identity. Fix: always generate and persist a fresh `MONAD_PRIVATE_KEY` per surface instance.

2. **`surface_proxy.lua` does not verify `identityHash`**: it matches only on `metadata.namespace`. The `identityHash` is present in `apps.json` but unused. Two different namespaces with the same hostname string are silently indistinguishable at the proxy layer.

3. **`modules/monad/npm` must not exist**: if you see a process started from that path, it is a zombie from when `npm` was a symlink to `Typescript`. Kill it and restart from `modules/monad/Typescript/`.

---

## Key files to read first for any area

| Task | Files |
|---|---|
| Kernel internals | `me/Typescript/src/me.ts`, `core-write.ts`, `secret-context.ts` |
| Axioms / invariants | `me/Typescript/tests/axioms.test.ts`, `me/Typescript/docs/Axioms.md` |
| Monad HTTP routing | `modules/monad/Typescript/src/app.ts`, `handlers/ledgerHandler.ts` |
| Namespace resolution | `modules/monad/Typescript/src/kernel/manager.ts`, `namespace/identity.ts` |
| NRP protocol spec | `modules/monad/Typescript/docs/Namespace-Protocol-Resolution.md` |
| NRP implementation status | `modules/monad/Typescript/docs/NRP/status.md` |
| Disclosure envelope | `modules/monad/Typescript/src/http/pathResolver.ts`, `http/disclosure.ts` |
| Surface registration | `modules/monad/Typescript/src/runtime/netgetRegistration.ts` |
| Monad mesh scoring | `modules/monad/Typescript/src/kernel/scoring.ts`, `meshSelect.ts`, `patchBay.ts` |
| OpenResty routing | `modules/netget/Typescript/src/modules/NetGetX/OpenResty/setNginxConfigRoutes.ts` |
| Lua proxy | `modules/netget/Typescript/src/modules/NetGetX/OpenResty/lua/handlers/surface_proxy.lua` |
| Algebra of contexts | `me/Typescript/docs/Algebra-of-Contexts.md` |
