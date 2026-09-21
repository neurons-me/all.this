// The REAL generated OpenResty (nginx.conf + netget_app.conf + the Lua handlers), on a disposable prefix and
// high ports, in front of the disposable monad from stack3.mts -- the same shape as the edge in production:
// default server -> domain-map.json (acme.test, *.acme.test) -> SNI certificate -> proxy to the monad.
// Run from modules/netget/Typescript (tsx). Long-running: writes /tmp/repro3-tls.env and stops nginx on SIGTERM.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import net from 'node:net';
import { execFileSync, spawn } from 'node:child_process';

const NETGET = '/Users/suign/Desktop/Neuroverse/all.this/modules/netget/Typescript';
const env = Object.fromEntries(fs.readFileSync('/tmp/repro3.env', 'utf8').trim().split('\n').map((l) => l.split('=')));
const HTTPS_PORT = 18443; const HTTP_PORT = 18080; const MONAD_PORT = 18461;
const openrestyBin = ['/opt/homebrew/bin/openresty', '/usr/local/bin/openresty', '/usr/bin/openresty'].find((p) => fs.existsSync(p));
if (!openrestyBin) { console.error('EDGE: no openresty on this machine'); process.exit(4); }
const lan = Object.values(os.networkInterfaces()).flat().find((i) => i && i.family === 'IPv4' && !i.internal)?.address;
if (!lan) { console.error('EDGE: no LAN address; the non-loopback peer cannot be tested'); process.exit(5); }

const home = path.join(env.TMP, 'home'); const dataDir = env.DATA;
process.env.HOME = home; process.env.NETGET_DATA_DIR = dataDir; process.env.NETGET_MAIN_SERVER_RECONCILE_MS = '0';
process.env.NETGET_MONAD_ORIGIN = `http://acme.test:${MONAD_PORT}`; process.env.NETGET_GATEWAY_UPSTREAM = `http://127.0.0.1:${MONAD_PORT}`;
process.env.NETGET_MONAD_NAMESPACE = 'acme.test';

const prefix = fs.mkdtempSync(path.join(os.tmpdir(), 'e2e-edge-'));
for (const d of ['conf', 'conf.d', 'logs', 'lua']) fs.mkdirSync(path.join(prefix, d), { recursive: true });
fs.mkdirSync(path.join(dataDir, 'runtime'), { recursive: true }); fs.mkdirSync(path.join(dataDir, 'html'), { recursive: true });
fs.writeFileSync(path.join(dataDir, 'html', 'index.html'), '<!doctype html><title>panel</title>');

// one certificate for the disposable namespace: BOTH acme.test and *.acme.test (a wildcard does not cover the apex)
const certDir = path.join(prefix, 'cert'); fs.mkdirSync(certDir);
const key = path.join(certDir, 'acme.key.pem'); const crt = path.join(certDir, 'acme.crt.pem');
execFileSync('openssl', ['req', '-x509', '-newkey', 'rsa:2048', '-nodes', '-keyout', key, '-out', crt, '-days', '2', '-subj', '/CN=acme.test',
  '-addext', 'subjectAltName=DNS:acme.test,DNS:*.acme.test'], { stdio: 'ignore' });
const sans = execFileSync('openssl', ['x509', '-in', crt, '-noout', '-text']).toString().match(/DNS:[^\n]+/)?.[0] || '';
if (!/DNS:acme\.test/.test(sans) || !/DNS:\*\.acme\.test/.test(sans)) { console.error('EDGE: certificate SANs wrong:', sans); process.exit(6); }
const pub = execFileSync('openssl', ['x509', '-in', crt, '-pubkey', '-noout']);
const der = execFileSync('openssl', ['pkey', '-pubin', '-outform', 'der'], { input: pub });
const spki = execFileSync('openssl', ['dgst', '-sha256', '-binary'], { input: der }).toString('base64');
// the default server needs its fallback certificate file to exist (as on any install)
fs.mkdirSync(path.join(home, '.netget', 'certs'), { recursive: true });
fs.copyFileSync(crt, path.join(home, '.netget', 'certs', 'local.netget.pem'));
fs.copyFileSync(key, path.join(home, '.netget', 'certs', 'local.netget-key.pem'));

// the routing table, in the schema runtime/domainMap.ts writes and the Lua reads
const route = { type: 'proxy', target: `127.0.0.1:${MONAD_PORT}`, protocol: 'http', ssl: { enabled: true, cert: crt, key } };
fs.writeFileSync(path.join(dataDir, 'runtime', 'domain-map.json'), JSON.stringify({ version: 1, generatedAt: new Date().toISOString(), node: { hostname: os.hostname() }, domains: { 'acme.test': route, '*.acme.test': route } }, null, 2));
fs.writeFileSync(path.join(dataDir, 'runtime', 'domain-map.version'), String(Date.now()));
fs.writeFileSync(path.join(dataDir, 'xConfig.json'), JSON.stringify({ localIP: lan }));

const { buildNginxConfigContent } = await import(`${NETGET}/src/modules/NetGetX/OpenResty/setNginxConfigFile.ts`);
const { getNetgetAppConfContent } = await import(`${NETGET}/src/modules/NetGetX/OpenResty/setNginxConfigRoutes.ts`);
const layout: any = {
  layoutKey: 'linux-source', configDir: path.join(prefix, 'conf'), confDDir: path.join(prefix, 'conf.d'), logDir: path.join(prefix, 'logs'),
  configFilePath: path.join(prefix, 'conf', 'nginx.conf'), luaDir: path.join(prefix, 'lua'),
  luaPackagePath: `${path.join(prefix, 'lua')}/?.lua;${path.join(prefix, 'lua')}/?/init.lua;/opt/homebrew/opt/openresty/site/lualib/?.lua;/opt/homebrew/opt/openresty/site/lualib/?/init.lua;;`, userDirective: '', isSupported: true,
};
const highPorts = (conf: string) => conf
  .replace(/^\s*listen \[::\]:\d+.*;\n/gm, '')
  .replace(/listen 80( default_server)?;/g, `listen ${HTTP_PORT}$1;`)
  .replace(/listen 443 ssl( default_server)?;/g, `listen ${HTTPS_PORT} ssl$1;`);
let main = highPorts(buildNginxConfigContent(layout)).replace(/^events \{/m, `pid ${path.join(prefix, 'logs', 'nginx.pid')};\nevents {`);
// The ONLY edit to the generated conf besides the ports: the monad must see the port the browser used (nginx on 443
// drops it; this one cannot bind 443), so the upstream Host is the client's own Host header.
const before = main;
main = main.replace(/proxy_set_header Host(\s+)\$host;/g, 'proxy_set_header Host$1$http_host;');
if (main === before) { console.error('EDGE: the upstream Host line was not found in the generated conf'); process.exit(7); }
fs.writeFileSync(path.join(prefix, 'conf', 'nginx.conf'), main);
fs.writeFileSync(path.join(prefix, 'conf.d', 'netget_app.conf'), highPorts(getNetgetAppConfContent(layout)));
fs.copyFileSync('/opt/homebrew/etc/openresty/mime.types', path.join(prefix, 'conf', 'mime.types'));
fs.cpSync(path.join(NETGET, 'src/modules/NetGetX/OpenResty/lua'), path.join(prefix, 'lua'), { recursive: true });

const full = { ...process.env, NETGET_DATA_DIR: dataDir };
const test = spawn(openrestyBin, ['-t', '-p', prefix, '-c', path.join(prefix, 'conf', 'nginx.conf')], { env: full });
let out = ''; test.stderr.on('data', (d) => { out += d; }); test.stdout.on('data', (d) => { out += d; });
if ((await new Promise((r) => test.on('close', r))) !== 0) { console.error('EDGE: openresty -t failed\n' + out); process.exit(8); }
const nginx = spawn(openrestyBin, ['-p', prefix, '-c', path.join(prefix, 'conf', 'nginx.conf')], { env: full, stdio: 'ignore' });
const up = (port: number) => new Promise<boolean>((r) => { const c = net.connect(port, '127.0.0.1', () => { c.destroy(); r(true); }); c.on('error', () => r(false)); });
for (let i = 0; i < 60 && !(await up(HTTPS_PORT)); i += 1) await new Promise((r) => setTimeout(r, 100));
if (!(await up(HTTPS_PORT))) { console.error('EDGE: openresty did not start'); process.exit(9); }

fs.writeFileSync('/tmp/repro3-tls.env', `SPKI=${spki}\nTLS_PID=${process.pid}\nLAN_IP=${lan}\nEDGE_LOG=${path.join(prefix, 'logs', 'access.log')}\nEDGE_ERR=${path.join(prefix, 'logs', 'error.log')}\nEDGE_SANS=${sans.replace(/,\s*/g, ',')}\n`);
console.log('EDGE READY', HTTPS_PORT, 'lan', lan);
const stop = () => { try { execFileSync(openrestyBin, ['-p', prefix, '-c', path.join(prefix, 'conf', 'nginx.conf'), '-s', 'stop'], { stdio: 'ignore', env: full }); } catch { /* not running */ } nginx.kill(); fs.rmSync(prefix, { recursive: true, force: true }); process.exit(0); };
process.on('SIGTERM', stop); process.on('SIGINT', stop);
setInterval(() => {}, 1 << 30);
