# Disposable two-label hosts check

Drives the sign-in / claim flow in a real browser on `acme.test`, `www.acme.test` and
`jabellae.acme.test` (the hosts that failed in production), against a throwaway in-process monad. It
never touches a real gateway, monad, data directory or setup code.

```
./run-e2e.sh <apex|www|handle>          # plain http, Chrome told to treat the origins as secure
TLS=1 ./run-e2e.sh <apex|www|handle>    # https through tls-proxy.mjs, Chrome pinned to a generated cert
```

`CLAIM_AT` (the argument) picks the origin that signs and completes the gateway claim. `www` also runs
the door checks: an identity registered at the apex is not openable at `www` (and says why), a complete
name is not suffixed twice, and a name under another namespace is refused before any request.

## What each mode proves

| | plain (`run-e2e.sh`) | `TLS=1` |
|---|---|---|
| Names: short and complete, never doubled; foreign refused | yes | yes |
| Claim signed and returned in the same document, session kept | yes | yes |
| Everything carrying a code, signature or write stays on the origin that served the client | yes | yes |
| Real TLS handshake, real secure context, no "treat as secure" flag | **no** | yes |
| No mixed content; the monad names the `https` origin behind a proxy that sends `X-Forwarded-Proto` | **no** | yes |

## What neither mode proves

Marking an origin secure for Chrome is not TLS, and even `TLS=1` is not production HTTPS:

- The certificate is a self-signed one generated per run and Chrome is pinned to it. **No public CA
  validation, no HSTS, no redirect from http to https, no certificate renewal.**
- The proxy is a few lines of Node, **not nginx/OpenResty**: none of the generated confs, Lua handlers,
  `limit_except` rules, `Host` handling, header stripping or `X-Forwarded-*` policy that run on the VM.
  (The edge rules are exercised by `modules/netget/Typescript/tests/gateway-edge-access.test.ts` on a
  disposable OpenResty; the browser flow has not been run through that OpenResty.)
- The proxy keeps the port in `Host` (it cannot bind 443); nginx's `$host` drops it.
- No WebSocket (`wss://<namespace>/nrp`, which Beatle tries) and no browser on a real network.
- Only the monad's own front end is served; whatever else a real host serves is not here.

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
- `run-e2e.sh` — a fresh monad per run, then the script, then cleanup.

Paths are absolute to this machine, and the browser is the Chrome for Testing revision cached under
`~/Library/Caches/ms-playwright/chromium-1208`.
