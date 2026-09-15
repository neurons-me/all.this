// second-app-harness-server.mts — a genuinely SECOND disposable monad, with
// a namespace/endpoint DIFFERENT from gui-catalog-harness-server.mts's
// defaults (gui-catalog-harness.local / 8162), used to prove the
// registration/resolution connection actually resolves per-app instead of
// always landing on the same destination.
//
// Its own real, unmodified netgetRegistration.ts client (auto-started by
// createMonadApp for every monad — see src/index.ts) self-registers via a
// REAL heartbeat (POST /apps/report) against the disposable netget harness
// (netget-gateway-harness-server.mjs, port 4603) — NOT a seeded/manual
// registry entry. NETGET_LOCAL below is what points that heartbeat there.
//
// Disposable: isolated MONADS_HOME, distinct name/namespace/port. Stop with
// Ctrl+C — SIGINT is handled by monad.ai's own persist.ts shutdown hook.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const monadsHome = path.join(os.tmpdir(), 'second-app-harness-monads');
fs.mkdirSync(monadsHome, { recursive: true });
process.env.MONADS_HOME = monadsHome;

// Where the real heartbeat lands — the disposable netget harness, not
// local.netget and not any real ambient gateway.
process.env.NETGET_LOCAL = process.env.NETGET_LOCAL || 'http://127.0.0.1:4603';
// Fast heartbeat for a short-lived verification run (default is 3000ms —
// this just makes "watch it appear" quicker to observe).
process.env.MONAD_NETGET_HEARTBEAT_MS = process.env.MONAD_NETGET_HEARTBEAT_MS || '2000';

const { startMonadProcess, stopMonadProcess } = await import('monad.ai');

const MONAD_NAME = 'second-app-harness-dev';
const NAMESPACE = 'second-app-harness.local';

const start = await startMonadProcess({ name: MONAD_NAME, namespace: NAMESPACE });
if (!start.healthy) {
  console.error('[second-app-harness] disposable monad failed to start:', start.error || start.status);
  process.exit(1);
}

console.log(`[second-app-harness] monad running at ${start.record.endpoint}`);
console.log(`[second-app-harness] namespace: ${NAMESPACE}`);
console.log(`[second-app-harness] MONAD_NAME (app id it reports as): ${MONAD_NAME}`);
console.log(`[second-app-harness] heartbeat target (NETGET_LOCAL): ${process.env.NETGET_LOCAL}`);
console.log(`[second-app-harness] MONADS_HOME (disposable): ${monadsHome}`);
console.log('[second-app-harness] Ctrl+C to stop');

process.on('SIGINT', async () => {
  console.log('\n[second-app-harness] stopping...');
  try {
    await stopMonadProcess(MONAD_NAME, { status: 'stopped' });
  } catch (e) {
    console.error('[second-app-harness] stop error:', e);
  }
  process.exit(0);
});
