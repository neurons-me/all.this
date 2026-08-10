# Agent context — neurons-me / monad.ai mesh

You are working in a repo that is part of an active attempt at cumulative AI
coordination — see [The Meshia](https://suign.github.io/Meshia.html) for the concept
and why it matters. This file does not repeat that argument. It is the operational
counterpart: what is true about this codebase right now, and what to do with that.

## Before you start

Read, in this order:

1. `CLAUDE.md` in this repo — build commands, architecture layers, known
   architectural gaps, and the "key files to read first" table.
2. The current NRP spec: `modules/monad/Typescript/typedocs/NRP-v0.3.0.md`
   (normative). Not `Namespace-Protocol-Resolution.md` in isolation — that file is
   now an alias pointing to v0.3.0, kept only for link stability.
3. The live implementation status: `modules/monad/Typescript/typedocs/Mesh/status.md`.

If a running monad is available, you can query its actual state directly instead of
guessing:

```
GET /__surface                          — self description, continuity proof
GET /.mesh/monads                       — known monads on this surface
GET /.mesh/resolve?namespace=...        — who claims a namespace
GET /.mesh/weights?namespace=...        — current adaptive + namespace-local weights
GET /resolve?target=me://ns:read/path   — bridge a canonical NRP target
```

There is no `mesh` CLI with `resolve` / `history` / `update` subcommands. Don't invoke
one and don't invent one to make an instruction "work" — use the HTTP surface above,
or the actual per-package commands in `CLAUDE.md`.

## Current state (verify before trusting — this file goes stale)

| Area | State |
|---|---|
| Kernel (`.me`), `netget`, `cleaker` | Operating; core axioms covered by `me/Typescript/tests/axioms.test.ts` |
| Mesh — single-forward resolution | Implemented (Phases 1–9): parse → discover → filter → score → forward → learn → log |
| Mesh — synthesis by reduction | Implemented (Phase 10): top-N parallel forward, reduced to `public` / `opened` / `contested` / `closed`, `_synthesis` exposed on the wire |
| Adaptive weights | Implemented: global prior + namespace-local posterior, blended by `maturity = min(1, sampleCount/200)` |
| `SynthesisSource.disclosure` | **Implemented.** `modules/monad/Typescript/src/kernel/synthesis.ts` now carries per-source disclosure. Only `public`/`opened` sources are value-eligible for quorum; `closed`/`contested` sources remain visible in the audit trail without forming false null quorums. |
| Canonical namespace grammar | **Unified for the monad bridge.** `modules/monad/Typescript/src/runtime/bridge.ts` now imports `parseNrpTarget` from `cleaker`, a canonical NRP wrapper built on `parseNamespaceExpression`. The legacy `parseTarget` / `parseMeTarget` compatibility path remains available for older `cleaker("me://...")` callers. |
| Disclosure states, HTTP vs WebSocket | **Unified.** `http/nrpHandler.ts` now classifies internally (`public`/`stealth`/`closed`) and maps to the wire the same way `pathResolver.ts` does — `stealth` never leaves the process. `packages/GUI/Typescript/.../Beatle.types.ts`'s `NRPDisclosure` matches the canonical `public`/`opened`/`closed`/`contested` set; the `stealth` leak is closed. |
| Single-forward bridge value extraction | **Fixed.** `handlers/bridgeHandler.ts`'s single-forward path used to spread the upstream `payload` and then overwrite `patched.target` with `bridgeTarget`, silently discarding a real nested envelope's `target.value`. It now extracts `value` via `extractPayloadValue()` first, the same helper the synthesis path already used — both bridge response shapes now agree on what `target` means on the wire. |

## Priorities, in order

No open priorities right now. See "Open questions" below for decisions that need a
human.

## Open questions you can help resolve

These are not yours to decide unilaterally — surface a proposal, don't just implement
one, if you have an opinion:

- Should a shared branch's address (e.g. an audience scope) derive from its own
  membership, so any surface can rederive it independently — or from an assigned ID,
  which requires a registry? Affects whether accumulation can happen without central
  authority.
- Should namespace maturity be measured only by `sampleCount`, or also by whether
  disclosure was ever folded into a value quorum incorrectly? The current formula
  can't tell confident-and-correct apart from confident-and-incomplete.
- What, if anything, does the mesh owe to the humans whose resolutions seeded its
  history?

## Design principles

- No central authority — the mesh is distributed by design; don't introduce a
  registry or single point of truth to solve a hard problem quickly.
- Resolution is cumulative — a resolution that doesn't update anything durable isn't
  finished.
- Transparency is structural — `_synthesis` and equivalent audit fields are exposed
  on the wire, not hidden behind an opaque decision. Keep it that way.
- Participation is functional — what matters is whether a change reads from and
  writes to the shared history, not what produced it.

## When you finish something

Update this file's state table if you changed what it describes. If you fixed one of
the priorities above, remove it and say so in the commit message — this file is only
useful if it stays accurate to what's actually true, not to what was true when it was
written.
