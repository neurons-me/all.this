#!/usr/bin/env bash
# verify-gateway-clients.sh -- disposable end-to-end check of the AUTHORIZED, non-browser clients of the
# gateway's mutating routes (the netget CLI's code path, the bootstrap script's curl), with the real process
# manager (`monads`) starting the monad -- not an in-process test. Everything lives in a temp dir; needs
# the monad built (npm run build in modules/monad/Typescript) and tsx. Run it before restarting a real monad
# on the security change: it proves the token is where the clients look for it.
set -uo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MONADS="node $ROOT/modules/monad/Typescript/dist/src/cli/monads.js"
NETGET_TS=$ROOT/modules/netget/Typescript
TMP=$(mktemp -d); export HOME=$TMP/home; mkdir -p "$HOME"
export MONADS_HOME=$TMP/monads NETGET_DATA_DIR=$TMP/data; mkdir -p "$NETGET_DATA_DIR/runtime"
PORT=$(node -e "const s=require('net').createServer().listen(0,'127.0.0.1',()=>{console.log(s.address().port);s.close()})")
pass=0; fail=0
ok()   { echo "  ok   - $1"; pass=$((pass+1)); }
bad()  { echo "  FAIL - $1"; fail=$((fail+1)); }
cleanup() { $MONADS stop t1 >/dev/null 2>&1; pkill -f "monads.*t1" 2>/dev/null; rm -rf "$TMP"; }
trap cleanup EXIT

openssl rand -hex 32 | $MONADS env t1 --seed-from-stdin >/dev/null 2>&1
$MONADS env t1 "MONAD_MODULES=$NETGET_TS/src/gateway/monadModule.mjs" "NETGET_DATA_DIR=$NETGET_DATA_DIR" "NETGET_MONAD_NAME=t1" >/dev/null 2>&1
$MONADS start t1 --namespace t1.test --port "$PORT" >"$TMP/start.log" 2>&1
for i in $(seq 1 60); do curl -s -m 2 "http://127.0.0.1:$PORT/healthcheck" >/dev/null 2>&1 && break; sleep 0.5; done
echo "monad started by the process manager on :$PORT"

TOKFILE="$MONADS_HOME/t1/internal.token"
[ -f "$TOKFILE" ] && ok "the monad wrote its token at \$MONADS_HOME/<name>/internal.token" || { bad "no token at $TOKFILE"; ls -R "$MONADS_HOME" | head -20; }
[ "$(stat -f %Lp "$TOKFILE" 2>/dev/null || stat -c %a "$TOKFILE")" = "600" ] && ok "token file is 0600" || bad "token file mode"

# the path expression vm-bootstrap.sh uses (fixed: MONADS_HOME already includes /monads)
BOOT_PATH="${MONADS_HOME:-$HOME/.monad/monads}/t1/internal.token"
[ "$BOOT_PATH" = "$TOKFILE" ] && ok "vm-bootstrap.sh's path expression finds it" || bad "bootstrap path $BOOT_PATH != $TOKFILE"

body='{"domain":"boot.test","type":"proxy","owner":"netget"}'
code=$(curl -s -o /dev/null -w '%{http_code}' -X POST -H 'content-type: application/json' -d "$body" "http://127.0.0.1:$PORT/add-domain")
[ "$code" = "401" ] && ok "anonymous POST /add-domain -> 401" || bad "anonymous add-domain answered $code"
code=$(curl -s -o /dev/null -w '%{http_code}' -X POST -H 'content-type: application/json' -H "x-monad-internal-token: $(cat "$BOOT_PATH")" -d "$body" "http://127.0.0.1:$PORT/add-domain")
[ "$code" = "200" ] && ok "the bootstrap script's curl (token from the file) -> 200" || bad "bootstrap-style add-domain answered $code"

# a separate OS process -- the netget CLI's own code path (domainStore) -- with NO token in its environment
cat >"$TMP/cli.mts" <<'TS'
const store = await import(process.env.STORE!);
await store.registerDomain(process.env.DOM!, undefined, undefined, undefined, undefined, undefined, undefined, 'proxy', undefined, 'netget');
const all = await store.getDomains();
console.log(JSON.stringify(all.map((d: any) => d.domain).sort()));
TS
run_cli() { ( cd "$NETGET_TS" && env -u MONAD_INTERNAL_TOKEN STORE="$NETGET_TS/src/kernel/domainStore.ts" NETGET_MONAD_NAME=t1 NETGET_MONAD_ORIGIN="http://127.0.0.1:$PORT" NETGET_MONAD_NAMESPACE=t1.test "$@" npx tsx "$TMP/cli.mts" 2>&1 ); }
out=$(run_cli DOM=cli.test MONADS_HOME="$MONADS_HOME")
echo "$out" | grep -q '"cli.test"' && ok "a separate CLI process registers a domain (token found in the file)" || bad "CLI process: $(echo "$out" | head -12)"
out=$(run_cli DOM=intruder.test MONADS_HOME="$TMP/somewhere-else")
echo "$out" | grep -qE "GATEWAY_ROUTING_RECORDS_REQUIRE_INTERNAL_CALLER|Write failed \(403\)" && ok "the same process without access to the token file is refused" || bad "without the token it was NOT refused: [$(echo "$out" | head -8)]"

# the routes the UI clients use, with no credential (what the old admin screens send)
for spec in "POST /update-domain" "POST /delete-domain" "POST /provision-cert" "POST /openresty-restart" "POST /frontend-mode" "POST /domains/metadata"; do
  set -- $spec
  code=$(curl -s -o /dev/null -w '%{http_code}' -X "$1" -H 'content-type: application/json' -d '{}' "http://127.0.0.1:$PORT$2")
  echo "  info - $1 $2 with no credential -> $code"
done
echo "pass=$pass fail=$fail"
[ "$fail" = 0 ]
