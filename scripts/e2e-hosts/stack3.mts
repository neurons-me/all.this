// Disposable gateway monad, in this process, with a monad RECORD on disk (so netget's claim commit finds its
// own monad the way it does under the process manager) -- on *.localhost, serving the real front end.
import dns from "node:dns"; import fs from "node:fs"; import os from "node:os"; import path from "node:path";
// The disposable domain resolves to loopback for THIS process too (the monad fetches itself by name).
const realLookup = dns.lookup.bind(dns);
(dns as any).lookup = (host: string, opts: any, cb: any) => {
  if (typeof opts === "function") { cb = opts; opts = {}; }
  if (host === "acme.test" || String(host).endsWith(".acme.test")) {
    return opts && opts.all ? cb(null, [{ address: "127.0.0.1", family: 4 }]) : cb(null, "127.0.0.1", 4);
  }
  return (realLookup as any)(host, opts, cb);
};
const NETGET = "/Users/suign/Desktop/Neuroverse/all.this/modules/netget/Typescript";
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "repro2-"));
const data = path.join(tmp, "data"); fs.mkdirSync(path.join(data, "runtime"), { recursive: true });
const monadsHome = path.join(tmp, "monads"); fs.mkdirSync(monadsHome, { recursive: true });
process.env.HOME = path.join(tmp, "home"); fs.mkdirSync(process.env.HOME, { recursive: true });
process.env.MONADS_HOME = monadsHome; process.env.NETGET_DATA_DIR = data; process.env.NETGET_MAIN_SERVER_RECONCILE_MS = "0";
const ROOT = process.env.ROOT_NS || "acme.test"; const PORT = Number(process.env.PORT || 18461); const NAME = "t1";
process.env.NETGET_MONAD_NAME = NAME; process.env.NETGET_MONAD_NAMESPACE = ROOT;
const runtimeDir = path.join(monadsHome, NAME); const stateDir = path.join(runtimeDir, "state"); const claimDir = path.join(runtimeDir, "claims");
fs.mkdirSync(stateDir, { recursive: true }); fs.mkdirSync(claimDir, { recursive: true });
const selfConfigPath = path.join(runtimeDir, "self.json");
fs.writeFileSync(path.join(runtimeDir, "monad.json"), JSON.stringify({
  name: NAME, identity_hash: "", identity: ROOT, namespace: ROOT, surface: NAME, port: PORT, pid: process.pid,
  endpoint: `http://${ROOT}:${PORT}`, cwd: NETGET, startedAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  status: "running", runtimeDir, stateDir, claimDir, selfConfigPath,
  stdoutLog: path.join(runtimeDir, "stdout.log"), stderrLog: path.join(runtimeDir, "stderr.log"),
}, null, 2));
process.env.NETGET_MONAD_ORIGIN = `http://${ROOT}:${PORT}`;
const ids = (process.env.IDS || "probe3.localhost").split(",");
fs.writeFileSync(path.join(data, "runtime", "apps.json"), JSON.stringify({ version: 1, updatedAt: new Date().toISOString(), apps: { [NAME]: {
  id: NAME, name: NAME, host: "127.0.0.1", port: PORT, lastSeenMs: Date.now(), ttlMs: 3600000, trust: "owner", tags: [],
  metadata: { namespace: ROOT, endpoint: `http://${ROOT}:${PORT}`, directEndpoint: `http://${ROOT}:${PORT}`, aliases: ids, claimedNamespaces: ids, claimed_namespaces: ids } } } }));
const { createMonadApp } = await import(path.join(NETGET, "node_modules/monad.ai/dist/src/index.js"));
const app: any = await createMonadApp({
  cwd: NETGET, seed: "repro2-seed-" + Date.now(), namespace: ROOT, stateDir, claimDir, selfConfigPath,
  selfIdentity: ROOT, selfHostname: ROOT, selfEndpoint: `http://${ROOT}:${PORT}`, selfTags: ["local"], port: PORT,
  guiPkgDistDir: runtimeDir, mePkgDistDir: runtimeDir, cleakerPkgDistDir: runtimeDir, reactUmdDir: runtimeDir, reactDomUmdDir: runtimeDir,
  routesPath: path.join(runtimeDir, "routes.js"), frontendDir: "/tmp/fe-local", modules: ["netget/gateway"], logger: false,
});
// DIFFERENT content in the root's tree and in a user's: what a door shows can only be right if the right tree
// was read, not just if an error went away. Each declares one sidebar item.
const memory: any = await import(path.join(NETGET, "node_modules/monad.ai/dist/src/claim/memoryStore.js"));
const declare = (namespace: string, id: string, label: string, to: string) => {
  const base = "layout.sidebar.scopes.root";
  memory.appendSemanticMemory({ namespace, path: `${base}.itemIds`, operator: "=", data: [id], timestamp: Date.now() });
  memory.appendSemanticMemory({ namespace, path: `${base}.items.${id}`, operator: "=", data: { type: "link", props: { id, label, to, icon: "home" } }, timestamp: Date.now() });
};
declare(ROOT, "rootitem", "Root Item", "/root-item");
declare(`jabellae.${ROOT}`, "handleitem", "Handle Item", "/handle-item");
console.log("modules:", JSON.stringify(app.monadModules));
const server = app.listen(PORT, "127.0.0.1", () => console.log(`STACK READY http://${ROOT}:${PORT}`));
fs.writeFileSync("/tmp/repro3.env", `TMP=${tmp}\nDATA=${data}\nMONADS_HOME=${monadsHome}\nPID=${process.pid}\n`);
process.on("SIGTERM", () => { server.close(); process.exit(0); });
