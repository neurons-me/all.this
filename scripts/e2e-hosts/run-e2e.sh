#!/usr/bin/env bash
# One disposable monad per run; never touches the real gateway or data.
SP=$(cd "$(dirname "$0")" && pwd)
[ -f /tmp/repro3.env ] && { source /tmp/repro3.env; kill $PID 2>/dev/null; sleep 1; rm -rf "$TMP" /tmp/repro3.env; }
cd /Users/suign/Desktop/Neuroverse/all.this/modules/netget/Typescript
IDS=jabellae.acme.test,probe5.acme.test,probe6.acme.test,www.acme.test ROOT_NS=acme.test PORT=18461 nohup npx tsx $SP/stack3.mts > /tmp/stack3.log 2>&1 &
for i in $(seq 1 40); do grep -q "STACK READY" /tmp/stack3.log 2>/dev/null && break; sleep 1; done
grep -q "STACK READY" /tmp/stack3.log || { echo "stack did not start"; tail -5 /tmp/stack3.log; exit 3; }
if [ "$EDGE" = "1" ]; then
  rm -f /tmp/repro3-tls.env
  (cd /Users/suign/Desktop/Neuroverse/all.this/modules/netget/Typescript && nohup npx tsx $SP/edge.mts > /tmp/edge.log 2>&1 &)
  for i in $(seq 1 60); do [ -f /tmp/repro3-tls.env ] && break; sleep 1; done
  [ -f /tmp/repro3-tls.env ] || { echo "edge did not start"; tail -15 /tmp/edge.log; exit 4; }
elif [ "$TLS" = "1" ]; then
  rm -f /tmp/repro3-tls.env
  node $SP/tls-proxy.mjs 18443 18461 /tmp/repro3-tls.env > /tmp/tls-proxy.log 2>&1 &
  for i in $(seq 1 20); do [ -f /tmp/repro3-tls.env ] && break; sleep 1; done
fi
CLAIM_AT=$1 node $SP/hosts-e2e.cjs; CODE=$?
[ -f /tmp/repro3-tls.env ] && { source /tmp/repro3-tls.env; kill $TLS_PID 2>/dev/null; rm -f /tmp/repro3-tls.env; }
source /tmp/repro3.env; kill $PID 2>/dev/null; sleep 1; rm -rf "$TMP" /tmp/repro3.env
exit $CODE
