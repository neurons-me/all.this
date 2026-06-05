<img src="https://res.cloudinary.com/dkwnxf6gm/image/upload/v1765903003/all.this_sr55ml.webp" style="width: 21%" />

# all.this
**Sovereign semantic compute. Identity, namespace, runtime — owned by you.**

The complete [neurons.me](https://neurons.me) stack in one monorepo.

---

## What is this?

`all.this` is a **pnpm monorepo** where every subdirectory is also an independent git submodule. It contains the full neurons.me stack — from kernel to gateway to UI.

| Layer | Package | Role |
|---|---|---|
| **Kernel** | [`this.me`](https://neurons-me.github.io/.me/) | Schema-free reactive memory. O(K) reactivity. Works offline. |
| **Identity** | [`cleaker`](https://neurons-me.github.io/Cleaker/) | Namespace resolver. *Who am I, here.* |
| **Runtime** | [`monad`](https://neurons-me.github.io/monad/) | HTTP daemon. Exposes namespace over HTTP. Runs the mesh. |
| **Gateway** | [`netget`](https://neurons-me.github.io/netget/) | Routes hostnames to monads via OpenResty. |
| **Interface** | [`this.gui`](https://neurons-me.github.io/GUI/) | React component library. Renders the surface. |

---

## Benchmarks 𓋹

Verified live — `pnpm test` from this repo root, Node.js v24, MacBook Air M-series.

| Test | Result | What it proves |
|---|---|---|
| **1M nodes, 1 mutation** | **2.687ms** | O(K) reactivity — only 6 nodes recomputed |
| **100k fan-out** | 10.3s total setup | 1 root write → 100,000 dependents update |
| **Concurrent storm** | **5,872 events/sec** | 1,000 mutations in 170ms |
| **Vector search p50** | **0.32ms** | IVF sidecar, recall = 1.0 |
| **Structural privacy** | `●●●●` masked | Guest sees `undefined`, not 403 |
| **Test suite** | **303 tests passing** | Algebra + Chemistry + Privacy |
| **Turbo CI** | **4/4 packages** | All packages green, 1m22s |

```
Hemisphere Scale: 1M Nodes
Mutate geo[777777].powerUp: 2.687ms
explain().k: 6
explain().recomputed: ["geo.777777.blackout", "gridlock", "hospitalAlert", "grid.78.zoneDown", "traffic.emergencyReroute", "services.generatorMode"]

PASS: 1 sensor → 6 nodes → hemisphere reacted in 2.687ms
```

---

## Run the tests

```bash
git clone --recurse-submodules https://github.com/neurons-me/all.this.git
cd all.this
pnpm install
pnpm test       # all 5 packages in parallel
pnpm build      # prebuild tests → build in dependency order
pnpm validate   # full suite: tests + builds
```

---

## Architecture

```
this.me    → sovereign kernel. (who, secret) → compound seed → identity.
cleaker    → resolver. projects .me into a namespace. emits fallback events.
monad.ai   → daemon. exposes namespace over HTTP. runs the mesh.
netget     → gateway. routes hostnames → monads via OpenResty/Nginx.
this.gui   → React UI. renders the semantic surface.
```

Two independent systems, same files:

**git submodules** — source control, independent repos, GitHub pushes

**pnpm workspace** — links JS dependencies locally for cross-package imports

They don't conflict. Submodules handle source control. pnpm handles local JS wiring.

---

## Key properties

**O(K) Reactivity** — when a value changes, only its actual dependents recompute. Not the whole graph. 1M nodes, change 1, only K recompute.

**Structural Privacy** — private data is invisible by structure, not by rules. `me.wallet["_"].balance` returns `undefined` to any observer. No 403. Honest absence.

**Explain** — every derived value can explain how it was computed. `me.explain("city.density")` returns expression, inputs, dependsOn. Full auditability.

**Subjective Reality** — same object means different things in different contexts. The same canister is "a box" for the loader and "biohazard risk" for the surgeon. Context shapes meaning.

**Sovereign Identity** — `me('suign', 'secret')` derives a deterministic cryptographic identity offline. No server. No account. No revocation authority.

---

𓂀 𓋹 𓅓 𓆣 𓇯 𓁹 𓎛 𓆙 𓅱 𓏏 𓍢 𓈖

MIT License · [neurons.me](https://neurons.me)
