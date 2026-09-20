#!/usr/bin/env bash
# vm-bootstrap.sh -- stand up (or bring current) a netget gateway VM from the repo alone.
#
#   curl -fsSL https://raw.githubusercontent.com/neurons-me/all.this/main/scripts/vm-bootstrap.sh -o /tmp/vm-bootstrap.sh
#   bash /tmp/vm-bootstrap.sh --gateway-namespace netget.site --namespace cleaker:cleaker.me:8162
#
# What it leaves running: ONE runtime per namespace. The gateway's monad
# (netget, netget.site, :8161) also serves the gateway's API (netget/gateway);
# each --namespace name:namespace:port is a monad that serves that namespace and the
# Cleaker landing (its own front end). OpenResty (already installed) is configured
# from the domains registered in the gateway's kernel, and its config and Lua
# handlers are applied as a pair, validated, and undone if they do not validate.
#
# It never touches /etc/letsencrypt, OpenResty's binary, or anything that is not
# netget's. --wipe (with --yes-wipe) first removes netget's own software and state
# -- see WIPE below -- and is the only destructive thing here.
#
# Needs: linux, sudo without a password, git, curl, openssl, Node >= 22 (nvm's is found),
# pnpm 10, OpenResty installed (`netget init` installs it), ~3 GB free.
set -euo pipefail

ROOT="${ROOT:-/mnt/neuroverse/all.this}"
REPO="${REPO:-https://github.com/neurons-me/all.this.git}"
GATEWAY_NAMESPACE=""
GATEWAY_MONAD="${GATEWAY_MONAD:-netget}"
GATEWAY_PORT="${GATEWAY_PORT:-8161}"
NAMESPACES=()            # name:namespace:port
DRY=0; WIPE=0; YES_WIPE=0

usage() { sed -n '2,20p' "$0" | sed 's/^# \{0,1\}//'; exit "${1:-0}"; }
while [ $# -gt 0 ]; do
  case "$1" in
    --gateway-namespace) GATEWAY_NAMESPACE="$2"; shift 2;;
    --gateway-monad)     GATEWAY_MONAD="$2"; shift 2;;
    --gateway-port)      GATEWAY_PORT="$2"; shift 2;;
    --namespace)         NAMESPACES+=("$2"); shift 2;;
    --root)              ROOT="$2"; shift 2;;
    --wipe)              WIPE=1; shift;;
    --yes-wipe)          YES_WIPE=1; shift;;
    --dry-run)           DRY=1; shift;;
    -h|--help)           usage 0;;
    *) echo "unknown option: $1" >&2; usage 1;;
  esac
done
[ -n "$GATEWAY_NAMESPACE" ] || { echo "--gateway-namespace is required (e.g. netget.site)" >&2; exit 1; }

say()  { printf '\n\033[1m== %s\033[0m\n' "$*"; }
note() { printf '   %s\n' "$*"; }
run()  { if [ "$DRY" = 1 ]; then printf '   + %s\n' "$*"; else "$@"; fi; }
die()  { printf '\n!! %s\n' "$*" >&2; exit 1; }

# ── node: nvm's newest if the PATH's is missing or too old ─────────────────────
node_major() { "$1" -p 'process.versions.node.split(".")[0]' 2>/dev/null || echo 0; }
NODE="$(command -v node || true)"
if [ -z "$NODE" ] || [ "$(node_major "$NODE")" -lt 22 ]; then
  for cand in "$HOME"/.nvm/versions/node/*/bin/node; do
    [ -x "$cand" ] && [ "$(node_major "$cand")" -ge 22 ] && NODE="$cand"
  done
fi
[ -n "$NODE" ] && [ "$(node_major "$NODE")" -ge 22 ] || die "Node >= 22 not found (install it with nvm)"
export PATH="$(dirname "$NODE"):$PATH"

NETGET="$ROOT/modules/netget/Typescript/bin/netget"
MONADS_CLI="$ROOT/modules/monad/Typescript/dist/src/cli/monads.js"
monads() { "$NODE" "$MONADS_CLI" "$@"; }
netget() { "$NETGET" "$@"; }
UI_DIST="$ROOT/modules/netget/Typescript/assets/main-server-ui/dist"

# ── WIPE: netget's own software and state, nothing else ────────────────────────
wipe_targets() {
  printf '%s\n' "$ROOT" "$HOME/netget" "$HOME/.get" "$HOME/.monad" "$HOME/.monad-secrets" "$HOME/.netget" "$HOME/deploy-backups" "/opt/.get"
}
if [ "$WIPE" = 1 ]; then
  # A script must not delete the directory it is running from.
  case "$(cd "$(dirname "$0")" && pwd)/" in
    "$ROOT"/*) tmp="$(mktemp /tmp/vm-bootstrap.XXXXXX.sh)"; cp "$0" "$tmp"; note "running from a copy ($tmp): $ROOT is about to be replaced"; exec bash "$tmp" "$@";;
  esac
  say "WIPE (netget's own software and state; never /etc/letsencrypt, OpenResty's binary, ollama, vscode)"
  wipe_targets | while read -r t; do [ -e "$t" ] && note "will remove: $t"; done
  [ "$YES_WIPE" = 1 ] || die "this deletes the paths above and cannot be undone. Run again with --yes-wipe (or without --wipe to keep them)."
  if [ -f "$MONADS_CLI" ]; then
    for d in "$HOME"/.monad/monads/*/; do [ -d "$d" ] && { n="$(basename "$d")"; note "stopping monad $n"; run monads stop "$n" >/dev/null 2>&1 || true; }; done
  fi
  run pkill -f 'dist/server.js' 2>/dev/null || true
  wipe_targets | while read -r t; do
    [ -e "$t" ] || continue
    if [ -w "$(dirname "$t")" ] && [ -w "$t" ]; then run rm -rf "$t"; else run sudo -n rm -rf "$t"; fi
  done
fi

# ── preflight ─────────────────────────────────────────────────────────────────
say "preflight"
[ "$(uname -s)" = Linux ] || { [ "$DRY" = 1 ] && note "(dry run: not linux, continuing)" || die "linux only"; }
for c in git curl openssl; do command -v "$c" >/dev/null || die "$c is required"; done
if ! command -v pnpm >/dev/null; then run npm install -g pnpm@10; fi
[ "$DRY" = 1 ] || sudo -n true 2>/dev/null || die "sudo without a password is required (nginx and /opt writes)"
[ "$DRY" = 1 ] || [ -x /usr/local/openresty/bin/openresty ] || die "OpenResty is not installed (run \`netget init\` once, or install it)"
probe_dir="$ROOT"; while [ ! -d "$probe_dir" ] && [ "$probe_dir" != / ]; do probe_dir="$(dirname "$probe_dir")"; done
free_kb="$(df -Pk "$probe_dir" 2>/dev/null | awk 'NR==2{print $4}' || true)"; free_kb="${free_kb:-0}"
[ "$free_kb" -ge 3000000 ] || [ "$DRY" = 1 ] || die "need ~3 GB free where $ROOT lives (have $((free_kb/1024)) MB)"
note "node $("$NODE" -v), pnpm $(pnpm -v 2>/dev/null || echo '?'), root $ROOT"

# ── the checkout: only the five submodules that are used ──────────────────────
say "checkout"
if [ ! -d "$ROOT/.git" ]; then
  run mkdir -p "$(dirname "$ROOT")"
  run git clone --no-recurse-submodules "$REPO" "$ROOT"
else
  run git -C "$ROOT" pull --ff-only --no-recurse-submodules
fi
run git -C "$ROOT" submodule update --init --checkout -- me modules/cleaker modules/monad modules/netget packages/GUI
run bash -c "cd '$ROOT' && pnpm install --frozen-lockfile"

# ── builds ────────────────────────────────────────────────────────────────────
say "build: .me, cleaker, monad (their test suites run as part of it)"
run bash -c "cd '$ROOT' && pnpm --filter 'monad.ai...' --workspace-concurrency=1 run build"
say "build: GUI library, then the front end that the monads serve"
run bash -c "cd '$ROOT/packages/GUI/Typescript' && npx vite build && npm run build:umd"
run bash -c "cd '$ROOT/modules/netget/Typescript/src/htmls/Netget-REACT/frontend_local' && npm install --no-package-lock --no-audit --no-fund && npx vite build"
[ "$DRY" = 1 ] || [ -f "$UI_DIST/index.html" ] || die "the front end was not built ($UI_DIST/index.html)"

# ── monads ────────────────────────────────────────────────────────────────────
has_seed() { monads env "$1" 2>/dev/null | grep -q '^SEED='; }
running()  { monads list 2>/dev/null | awk -v n="$1" '$1==n && $3=="online"{f=1} END{exit !f}'; }
wait_http() { # url, seconds
  local i; for i in $(seq 1 "$2"); do curl -fs -m 4 -o /dev/null "$1" && return 0; sleep 1; done; return 1
}

say "gateway monad: $GATEWAY_MONAD ($GATEWAY_NAMESPACE, :$GATEWAY_PORT)"
# Its environment is written BEFORE its first start, so it never runs on the default
# seed (its namespace's name, which is public). Its seed is netget's own persisted identity.
run netget gateway-adopt "$GATEWAY_MONAD" --namespace "$GATEWAY_NAMESPACE" --port "$GATEWAY_PORT" \
    --main-server-name "$GATEWAY_NAMESPACE" --use-gateway-seed
if running "$GATEWAY_MONAD"; then note "already running"; else
  run monads start "$GATEWAY_MONAD" --namespace "$GATEWAY_NAMESPACE" --port "$GATEWAY_PORT"
fi
[ "$DRY" = 1 ] || wait_http "http://127.0.0.1:$GATEWAY_PORT/healthcheck" 90 || die "the gateway monad did not come up (monads logs $GATEWAY_MONAD --tail)"

for spec in "${NAMESPACES[@]:-}"; do
  [ -n "$spec" ] || continue
  IFS=: read -r name ns port <<<"$spec"
  say "namespace monad: $name ($ns, :$port)"
  if [ "$DRY" = 1 ] || ! has_seed "$name"; then
    run bash -c "openssl rand -hex 32 | \"$NODE\" \"$MONADS_CLI\" env '$name' --seed-from-stdin >/dev/null"
  else note "seed already stored"; fi
  run monads env "$name" "MONAD_FRONTEND_DIR=$UI_DIST"
  if running "$name"; then note "already running"; else run monads start "$name" --namespace "$ns" --port "$port"; fi
  [ "$DRY" = 1 ] || wait_http "http://127.0.0.1:$port/" 90 || die "monad $name did not come up (monads logs $name --tail)"
done

# ── domains: the gateway's own name and each namespace, in the kernel ─────────
say "domains (registered in the gateway's kernel; certificates already on disk are used as they are)"
add_domain() { # domain type
  local d="$1" t="$2" live="/etc/letsencrypt/live/$1" body code
  body="{\"domain\":\"$d\",\"type\":\"$t\",\"owner\":\"netget\""
  if [ -f "$live/fullchain.pem" ]; then body="$body,\"sslMode\":\"letsencrypt\",\"sslCertificate\":\"$live/fullchain.pem\",\"sslCertificateKey\":\"$live/privkey.pem\""; fi
  body="$body}"
  if [ "$DRY" = 1 ]; then note "+ POST /add-domain $body"; return; fi
  code="$(curl -s -m 30 -o /dev/null -w '%{http_code}' -X POST -H 'content-type: application/json' -d "$body" "http://127.0.0.1:$GATEWAY_PORT/add-domain")"
  case "$code" in 200) note "added $d";; 409) note "$d already registered";; *) die "add-domain $d answered $code";; esac
}
add_domain "$GATEWAY_NAMESPACE" main_server
for spec in "${NAMESPACES[@]:-}"; do [ -n "$spec" ] || continue; IFS=: read -r _ ns _ <<<"$spec"; add_domain "$ns" proxy; done

# ── nginx: conf + Lua together, validated, undone if invalid ──────────────────
say "OpenResty"
run netget gateway-adopt "$GATEWAY_MONAD" --apply-nginx

# ── what to check, and what is left for a person ──────────────────────────────
say "check"
if [ "$DRY" = 0 ]; then
  for d in "$GATEWAY_NAMESPACE" $(for s in "${NAMESPACES[@]:-}"; do [ -n "$s" ] && { IFS=: read -r _ ns _ <<<"$s"; echo "$ns"; }; done); do
    printf '   %-24s https -> %s\n' "$d" "$(curl -sk -m 15 -o /dev/null -w '%{http_code}' --resolve "$d:443:127.0.0.1" "https://$d/")"
  done
fi
cat <<MSG

Done. What is left is yours:
  1. Claim the gateway:   netget setup-code     then open https://$GATEWAY_NAMESPACE/ and enter it
  2. Add the other domains and their certificates from the gateway (or POST /add-domain on
     127.0.0.1:$GATEWAY_PORT); certificates issued by hand are used from /etc/letsencrypt.
MSG
