# Disposable two-label hosts check

Drives the sign-in / claim flow in a real browser on `acme.test`, `www.acme.test` and
`jabellae.acme.test` (the hosts that failed in production), against a throwaway in-process monad. It
never touches a real gateway, monad, data directory or setup code.

```
./run-e2e.sh <apex|www|handle>          # plain http, Chrome told to treat the origins as secure
TLS=1 ./run-e2e.sh <apex|www|handle>    # https through tls-proxy.mjs, Chrome pinned to a generated cert
EDGE=1 ./run-e2e.sh <apex|www|handle>   # https through the REAL generated OpenResty (edge.mts), from a non-loopback peer
```

`CLAIM_AT` (the argument) picks the origin that signs and completes the gateway claim. `www` also runs
the door checks: an identity registered at the apex is not openable at `www` (and says why), a complete
name is not suffixed twice, and a name under another namespace is refused before any request.

## What each mode proves

| | plain | `TLS=1` | `EDGE=1` |
|---|---|---|---|
| Names: short and complete, never doubled; foreign refused | yes | yes | yes |
| Claim signed and returned in the same document, session kept | yes | yes | yes |
| Everything carrying a code, signature or write stays on the origin that served the client | yes | yes | yes |
| Real TLS handshake, real secure context, no "treat as secure" flag | no | yes | yes |
| No mixed content; the monad names the `https` origin behind a proxy sending `X-Forwarded-Proto` | no | yes | yes |
| The generated `nginx.conf` / `netget_app.conf` / Lua route the namespace (default server, `domain-map.json`, SNI certificate, `@server` proxy) | no | no | yes |
| Registration, key recovery and `/setup/*` writes pass the edge from a **non-loopback peer** (the machine's LAN address), and the operator-only rules stay closed to that same peer | no | no | yes |
| One certificate covering **both** `acme.test` and `*.acme.test` (a wildcard does not cover the apex; `edge.mts` refuses to start otherwise) | no | yes | yes |

`EDGE=1` needs OpenResty (`/opt/homebrew/bin/openresty`) and a LAN address. The only edits to the generated
conf are the two disposable ports and the upstream `Host`, which keeps the client's own port (nginx on 443
drops it; this one cannot bind 443).

## What neither mode proves

Marking an origin secure for Chrome is not TLS, and even `TLS=1` is not production HTTPS:

- The certificate is a self-signed one generated per run and Chrome is pinned to it. **No public CA
  validation, no HSTS, no redirect from http to https, no certificate renewal.**
- `TLS=1` uses a few lines of Node, **not nginx/OpenResty**. `EDGE=1` does use the real generated conf and
  Lua, but on a disposable prefix, with a hand-written `domain-map.json` (in the schema
  `runtime/domainMap.ts` writes) rather than one projected from the domain store, and without the VM's
  actual domain records, `NETGET_GATEWAY_ORIGINS`, main-server name, `xConfig.json` or installed Lua.
- Both keep the port in `Host` (they cannot bind 443); nginx's `$host` drops it.
- No WebSocket (`wss://<namespace>/nrp`, which Beatle tries) and no browser on a real network.
- Only the monad's own front end is served; whatever else a real host serves is not here.

## A finding the edge run makes visible

From a `www` or handle page the client reads a few public things from the apex (`/__surface`,
`/gateway-identity`, the sidebar's `itemIds`). The gateway module's origin guard answers those `403
ORIGIN_NOT_ALLOWED` unless the origin is the request's own host, a local one, or listed in
`NETGET_GATEWAY_ORIGINS`. This happens with or without nginx, and it does not touch the claim (which runs
same-origin); it means the sidebar/root verification quietly degrades on those doors. The run prints these
as `INFO`, not as failures.

So a green run here means the flow and the scheme-sensitive client logic hold; it does not replace
running the flow on the real deployment's HTTPS edge before relying on it.

## Parts

- `stack3.mts` — in-process monad for root `acme.test` with the gateway module, the front end built at
  `/tmp/fe-local` (`npx vite build --outDir /tmp/fe-local` in
  `modules/netget/Typescript/src/htmls/Netget-REACT/frontend_local`), and a seeded app registry. It maps
  `*.acme.test` to loopback for its own fetches.
- `hosts-e2e.cjs` — Playwright driving Chrome for Testing (`--headless=new`; the headless shell ignores
  the secure-context flag). Uses `--host-resolver-rules` to resolve the disposable names.
- `tls-proxy.mjs` — the TLS terminator for `TLS=1`.
- `edge.mts` — the real generated OpenResty for `EDGE=1` (long-running; stops nginx on SIGTERM).
- `run-e2e.sh` — a fresh monad per run, then the script, then cleanup.

Paths are absolute to this machine, and the browser is the Chrome for Testing revision cached under
`~/Library/Caches/ms-playwright/chromium-1208`.
