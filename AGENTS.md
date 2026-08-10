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
| Mesh — synthesis by reduction | Implemented (Phase 10): top-N parallel forward, reduced to `public` / `contested` / `closed`, `_synthesis` exposed on the wire |
| Adaptive weights | Implemented: global prior + namespace-local posterior, blended by `maturity = min(1, sampleCount/200)` |
| `SynthesisSource.disclosure` | **Missing.** `modules/monad/Typescript/src/kernel/synthesis.ts` — the type carries `value`, `ok`, `score`, `latencyMs`, not `disclosure`. A quorum can currently form over `closed`/absent sources without that fact being visible to the reduction. |
| Canonical namespace grammar | **Unified for the monad bridge.** `modules/monad/Typescript/src/runtime/bridge.ts` now imports `parseNrpTarget` from `cleaker`, a canonical NRP wrapper built on `parseNamespaceExpression`. The legacy `parseTarget` / `parseMeTarget` compatibility path remains available for older `cleaker("me://...")` callers. |
| Disclosure states, HTTP vs WebSocket | **Inconsistent.** `http/pathResolver.ts` correctly collapses `stealth` to `closed` on the wire. `http/nrpHandler.ts` (the `/nrp` WebSocket path) still carries all four states including `stealth` — and that leak reaches `packages/GUI/Typescript/.../Beatle.types.ts`. |

## Priorities, in order

1. Add `disclosure` to `SynthesisSource`, and make quorum reduction respect it —
   `public`/`opened` sources should be eligible for a value quorum; `closed` sources
   should be visible in the audit trail but not silently treated as agreeing nulls.
2. Unify disclosure state across HTTP and WebSocket — `nrpHandler.ts` should map
   `stealth` to `closed` the same way `pathResolver.ts` already does, and the leak
   into `Beatle.types.ts` should close with it.

Do these in this order. Disclosure reduction should be fixed before the WebSocket/UI
cleanup, so the wire-visible states and the synthesis audit trail converge together
instead of drifting again.

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
