---
title: All.This — a from-scratch stack for sovereign identity, semantic memory, and generative UI
published: false
tags: opensource, architecture, javascript, selfhosted
---

`all.this` is a monorepo for a stack that answers one question differently than most: **what if a person's identity, memory, and the apps that read it belonged to a namespace they controlled, not a platform?**

It's a pnpm workspace of five packages, each an independent git submodule, built bottom-up: a cryptographic memory kernel, an identity/namespace grammar on top of it, an HTTP runtime that serves it, a gateway that routes to it, and a React UI that renders it.

## The layers

```
Kernel     this.me     → cryptographic semantic memory
Identity   cleaker     → namespace grammar, claims
Runtime    monad.ai    → HTTP daemon, one kernel per process
Gateway    netget      → OpenResty routing, mesh registration
UI         this.gui    → Generative UI component library
```

### `this.me` — the kernel

A `new ME(seed)` call creates a kernel root. The 64-hex `seed` **is** the namespace authority — not a hostname, not a config value, the actual cryptographic root everything derives from:

- `identityHash = keccak256("this.me/identity:v1::" + seed)` — the public fingerprint
- Secret branches encrypt subtrees using key material chained from the seed
- A username+password pair can compound into a seed, giving a user an identity independent of any specific server

It has axiom-level test coverage most memory stores don't bother with: secret scopes return `undefined` on the public side (never leak *existence*, not just contents), noise resets cut derivation inheritance so a compromised branch can't compromise its parent, and every memory sits in a hash chain that can be walked and re-verified — not just written, but *audited*.

### `cleaker` — identity and namespace grammar

Defines the actual namespace expression language (`<handle>.<root>`, `/@handle/<path>`, `me.<namespace>.<path>`) and how identities claim namespaces. This is the layer that answers "who owns this name," independent of where it happens to be hosted right now.

### `monad.ai` — the runtime

An Express daemon that owns one kernel instance and serves it over HTTP with a strict disclosure contract on every read:

- public path → `200 { disclosure: "public", value }`
- a secret, or something adjacent to one → `200 { disclosure: "closed", value: null }`
- genuinely absent, nowhere near a secret → `404`

The middle case is the interesting one: a monad **never** tells you "there's a secret here" via a different status code than "there's nothing here at all near a secret." Both look identical from outside. That's the whole point — presence of a secret is itself information a stranger doesn't get for free.

Every monad process self-registers with the gateway via a heartbeat (`POST /apps/report`, every few seconds, expiring after four missed beats) — no manual service discovery, no static config pointing at ports.

### `netget` — the gateway

Generates real OpenResty/nginx config and implements request routing in Lua: `hostname → namespace → scan the mesh registry → pick whichever monad most recently reported for that namespace → proxy`. It also owns gateway-level authority — who can administer *this machine's* gateway (grant/revoke admin, transfer ownership) — as a signed delegation chain rooted in `.me` itself, not a bare config file anyone with disk access could edit.

### `this.gui` — Generative User Interface

A React component library, published to npm, that renders from a spec — a registry maps `type` strings to resolvers, and a runtime walks a JSON-like tree (`GuiNode`) calling them. The identity/claim UI (`CleakerLanding`), the namespace admin panel, the theme system, and a devtools inspector (spec vs. resolved props, click-to-select, kernel explain/lineage) all live here. Ships as ESM, CJS, and a UMD build any plain HTML page can `<script>`-tag in.

It just went through a **v3.0.0** release — a bundle-size pass found the production JS bundle for one of its consuming apps had somehow reached 16.65MB, dropped it to 2.39MB, and the fix (a `react-router-dom` v6→v7 peer bump) is exactly why it's a major version and not a patch.

## The protocol underneath: NRP

Reads and writes across this whole stack follow one protocol — a namespace resolves to a monad, a monad answers with the disclosure envelope above, and a mesh registry (populated by real heartbeats, never manually maintained) is how a gateway learns which monad currently serves which namespace. It's designed so **"where is this actually running right now"** and **"who is allowed to read/write it"** are two separate questions, answered by two separate layers, on purpose.

## What's real vs. what's still a gap

The project keeps an honest running list of architectural gaps instead of pretending they don't exist. Current state, briefly:

- **Surface identity is unclaimed.** Every gateway has a real, persistent Ed25519 keypair now (fixed — it used to be insecurely derived from the seed). What's still missing: nothing cryptographically binds that keypair to the namespace it claims to serve. A surface-level claim mechanism, mirroring the human-identity one, is designed but not built.
- **Gateway authority delegation is real, but single-monad.** Grant/revoke/transfer admin on a gateway is now a fully signed operation verified against `.me` itself (this replaced an older, actually-broken unsigned write path — confirmed broken in real runtime, not theoretical). The current model assumes the acting identity's keychain and the gateway's canonical record live on the same monad. A second admin on a genuinely different host is future work.
- **Mesh registration has two paths with different maturity.** The gateway-local one (`/apps/report`) is loopback-only and can't be reached remotely by design. A newer, cross-host-capable one (`/.mesh/announce`) is substantially hardened — signature verification, anti-squatting checks, a fail-closed trusted-key allowlist — but still can't cryptographically bind a signing key to the `.me` identity it claims to represent, for the same underlying reason as the surface-identity gap above.

None of these are "coming soon" marketing gaps — they're specific, named, and each one blocks a specific next capability (cross-host mesh work waits on surface claims; a second gateway admin on a different host waits on the delegation model extending past single-monad).

## Where it's headed

The immediate target isn't more features — it's taking the whole stack (identity, namespace, gateway, UI) from local disposable testing to a real VM, publishing `cleaker.me` and `netget.site` as the first real, non-local deployment. Deliberately *not* building cross-host synchronization as a prerequisite for that — publish first, sync later, once there's something real to sync between.

---

Repos: [this.me](https://github.com/neurons-me/.me), [cleaker](https://github.com/neurons-me/Cleaker), [monad.ai](https://github.com/neurons-me/monad), [netget](https://github.com/neurons-me/netget), [this.gui](https://github.com/neurons-me/GUI) ([npm](https://www.npmjs.com/package/this.gui))
