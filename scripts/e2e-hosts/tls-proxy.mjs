// A TLS-terminating reverse proxy in front of the disposable monad, the way nginx sits in front of it in
// production: it speaks https to the browser and plain http to the monad, and says so in X-Forwarded-*.
// The certificate is generated per run (SAN acme.test, *.acme.test) and Chrome is pinned to its public
// key, so the browser performs a real TLS handshake and a real secure context -- no "treat as secure" flag.
//
// It is NOT nginx/OpenResty: no Lua, no location rules, no ACLs, no redirect, no public CA, no HSTS.
import https from 'node:https';
import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const [TLS_PORT, UPSTREAM_PORT, STATE] = [Number(process.argv[2]), Number(process.argv[3]), process.argv[4]];
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'e2e-tls-'));
const key = path.join(dir, 'key.pem'); const crt = path.join(dir, 'crt.pem');
execFileSync('openssl', ['req', '-x509', '-newkey', 'rsa:2048', '-nodes', '-keyout', key, '-out', crt, '-days', '2', '-subj', '/CN=acme.test',
  '-addext', 'subjectAltName=DNS:acme.test,DNS:*.acme.test'], { stdio: 'ignore' });
const pub = execFileSync('openssl', ['x509', '-in', crt, '-pubkey', '-noout']);
const der = execFileSync('openssl', ['pkey', '-pubin', '-outform', 'der'], { input: pub });
const spki = execFileSync('openssl', ['dgst', '-sha256', '-binary'], { input: der }).toString('base64');

const server = https.createServer({ key: fs.readFileSync(key), cert: fs.readFileSync(crt) }, (req, res) => {
  const upstream = http.request({
    host: '127.0.0.1', port: UPSTREAM_PORT, method: req.method, path: req.url,
    headers: { ...req.headers, 'x-forwarded-proto': 'https', 'x-forwarded-for': req.socket.remoteAddress || '', 'x-monad-internal-token': '' },
  }, (up) => { res.writeHead(up.statusCode || 502, up.headers); up.pipe(res); });
  upstream.on('error', () => { res.statusCode = 502; res.end('bad gateway'); });
  req.pipe(upstream);
});
server.listen(TLS_PORT, '127.0.0.1', () => {
  fs.writeFileSync(STATE, `SPKI=${spki}\nTLS_DIR=${dir}\nTLS_PID=${process.pid}\n`);
  console.log('TLS PROXY READY', TLS_PORT);
});
process.on('SIGTERM', () => { server.close(); fs.rmSync(dir, { recursive: true, force: true }); process.exit(0); });
