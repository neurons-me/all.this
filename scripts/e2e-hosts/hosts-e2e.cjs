// Disposable end-to-end check on real two-label hosts: acme.test, www.acme.test, jabellae.acme.test.
// CLAIM_AT=apex|www|handle picks which origin signs and completes the gateway claim in this run.
const { createRequire } = require('module');
const { execSync } = require('child_process');
const fs = require('fs');
const GUI = '/Users/suign/Desktop/Neuroverse/all.this/packages/GUI/Typescript/';
const { chromium } = createRequire(GUI)('playwright');

const PORT = 18461; // the monad
const EDGE = process.env.EDGE === '1'; // through the real generated OpenResty (edge.mts); implies TLS
const TLS = EDGE || process.env.TLS === '1'; // real TLS via tls-proxy.mjs / OpenResty instead of a "treat as secure" flag
const BROWSER_PORT = TLS ? 18443 : PORT;
const SCHEME = TLS ? 'https' : 'http';
const ORIGINS = { apex: `${SCHEME}://acme.test:${BROWSER_PORT}`, www: `${SCHEME}://www.acme.test:${BROWSER_PORT}`, handle: `${SCHEME}://jabellae.acme.test:${BROWSER_PORT}` };
const tlsState = TLS ? Object.fromEntries(fs.readFileSync('/tmp/repro3-tls.env', 'utf8').trim().split('\n').map((l) => l.split(/=(.*)/s).slice(0, 2))) : {};
const CLAIM_AT = process.env.CLAIM_AT || 'handle';
const env = Object.fromEntries(fs.readFileSync('/tmp/repro3.env', 'utf8').trim().split('\n').map((l) => l.split('=')));
const results = [];
const check = (name, ok, detail = '') => { results.push({ name, ok }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  -- ' + detail : ''}`); };
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await_(chromium.launch({
  executablePath: process.env.HOME + '/Library/Caches/ms-playwright/chromium-1208/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing',
  args: [
    '--headless=new',
    // EDGE: resolve to this machine's LAN address so nginx sees a non-loopback peer, as it does in production
    `--host-resolver-rules=MAP acme.test ${EDGE ? tlsState.LAN_IP : '127.0.0.1'}, MAP *.acme.test ${EDGE ? tlsState.LAN_IP : '127.0.0.1'}`,
    ...(TLS ? [`--ignore-certificate-errors-spki-list=${tlsState.SPKI}`] : [`--unsafely-treat-insecure-origin-as-secure=${Object.values(ORIGINS).join(',')}`]),
  ],
}));
function await_(p) { return p; }

(async () => {
  const b = await browser;
  const ctx = await b.newContext();
  const page = await ctx.newPage();
  const requests = [];
  const responses = [];
  page.on('request', (r) => requests.push({ method: r.method(), url: r.url() }));
  const surfaceNamespaces = [];
  page.on('response', (r) => {
    responses.push({ url: r.url(), status: r.status() });
    if (/^https?:\/\/[^/]+\/__surface(\?|$)/.test(r.url()) && r.status() === 200) r.json().then((j) => surfaceNamespaces.push({ url: r.url(), ns: j && j.target && j.target.namespace && j.target.namespace.me })).catch(() => {});
  });
  const off = async () => { await page.evaluate(() => { window.dispatchEvent(new CustomEvent('this.gui:inspector:set', { detail: { enabled: false } })); window.dispatchEvent(new CustomEvent('this.gui:inspector:set', { detail: false })); }).catch(() => {}); };
  const open = async (origin, path = '/') => { await page.goto(origin + path); await page.waitForLoadState('networkidle').catch(() => {}); await wait(600); await off(); };
  const bodyText = () => page.evaluate(() => document.body.innerText);

  async function signIn(name, secret) {
    await page.getByLabel('Username').fill(name);
    await page.getByLabel('Secret').fill(secret);
    await page.getByRole('button', { name: '.me', exact: true }).click();
    await wait(2500);
  }
  async function signOut() {
    const b2 = page.getByRole('button', { name: /Sign out/i });
    if (await b2.count()) { await b2.first().click(); await wait(1200); }
  }
  async function register(name, secret) {
    await page.getByText('New here? Register').click();
    await wait(600);
    await page.getByLabel('Username').fill(name);
    await page.getByLabel('Secret', { exact: true }).fill(secret);
    await page.getByLabel('Confirm Secret').fill(secret);
    await page.getByRole('button', { name: 'Claim Username' }).click();
    await page.getByText(/Back Up Your Identity/).waitFor({ timeout: 15000 });
    const claimed = (await bodyText()).match(/Claimed ([^\s]+)\./)?.[1] || '';
    await page.getByText(/written down my 12 words/i).click();
    await page.getByRole('button', { name: 'Continue' }).click();
    await wait(1500);
    return claimed;
  }
  async function makeKey(secret) {
    await page.locator('a[href="/keychain"]').first().click();
    await wait(1500);
    await page.getByText(/Recover with your recovery phrase/i).click();
    await page.getByLabel('Name the new key this creates').fill('probe key');
    await page.getByLabel('Encrypt this key locally with').fill(secret);
    await page.getByRole('button', { name: /Revoke every key and recover/i }).click();
    await page.getByText('probe key').first().waitFor({ timeout: 15000 });
    await wait(800);
  }
  const setupCode = () => {
    const out = execSync(`cd /Users/suign/Desktop/Neuroverse/all.this/modules/netget/Typescript && HOME=${env.TMP}/home NETGET_DATA_DIR=${env.DATA} MONADS_HOME=${env.MONADS_HOME} NETGET_MONAD_NAME=t1 npx tsx src/netget.cli.ts setup-code --json 2>&1`, { encoding: 'utf8' });
    return JSON.parse(out.split('\n').filter((l) => l.includes('"code"')).pop()).code;
  };
  const sameOriginOnly = (origin, label, from = 0) => {
    // what carries a secret, a signature or a session: must never leave the origin that served the client
    const carries = requests.slice(from).filter((r) => /\/(setup|claims|api\/v1\/keychain|admin-session)/.test(r.url) || (r.method !== 'GET' && r.method !== 'OPTIONS' && r.method !== 'HEAD'));
    const foreign = carries.filter((r) => !r.url.startsWith(origin + '/'));
    check(`${label}: every request that carries a code, signature or write stays on ${origin}`, carries.length > 0 && foreign.length === 0, foreign.length ? foreign.map((f) => f.method + ' ' + f.url).join(' ') : `${carries.length} requests`);
    // reads too: nothing is sent to another door of the namespace (the apex from www/a handle page used to be),
    // and nothing is refused
    const sinceReqs = requests.slice(startIdx); // from the first load of the origin under test: the page load is where the sidebar and root are first read
    const elsewhere = [...new Set(sinceReqs.filter((r) => /^https?:\/\/[^/]*acme\.test/.test(r.url) && !r.url.startsWith(origin + '/')).map((r) => r.method + ' ' + r.url.replace(/\?.*/, '')))];
    check(`${label}: no request goes to another host of the namespace (reads use the transport the page has)`, elsewhere.length === 0, elsewhere.join(', '));
    const refused = responses.filter((r) => r.status === 401 || r.status === 403).map((r) => r.status + ' ' + r.url.replace(/\?.*/, ''));
    // the two deliberate wrong-door sign-ins are the monad's own 403 on /claims/signIn (www run only)
    const unexpectedRefused = refused.filter((x) => !/\/claims\/signIn$/.test(x));
    check(`${label}: no read or write was refused with 401/403 (apart from the deliberate wrong-door sign-ins)`, unexpectedRefused.length === 0, unexpectedRefused.slice(0, 4).join(', '));
    const sameOriginSurface = responses.filter((r) => r.url.startsWith(origin + '/__surface'));
    const sidebarReads = sinceReqs.filter((r) => /\/layout\/sidebar\//.test(r.url));
    // what the page's own transport says it resolved the request to: the namespace at apex and www, the handle's at a handle door
    const expectedAnswer = label === 'handle' ? 'jabellae.acme.test' : 'acme.test';
    const answers = [...new Set(surfaceNamespaces.filter((x) => x.url.startsWith(origin + '/')).map((x) => x.ns))];
    check(`${label}: the page origin's /__surface resolves the request to ${expectedAnswer}`, answers.length > 0 && answers.every((a) => a === expectedAnswer), answers.join(','));
    if (label === 'handle') {
      check('handle: the page origin answers for the handle, not the namespace, so the sidebar tree of the namespace is not read from it', sameOriginSurface.length > 0 && sidebarReads.length === 0, `${sameOriginSurface.map((r) => r.status).join(',')} surface, ${sidebarReads.length} sidebar reads`);
    } else {
      check(`${label}: the namespace's sidebar is read from the page's own origin, confirmed`, sameOriginSurface.some((r) => r.status === 200) && sidebarReads.length > 0 && sidebarReads.every((r) => r.url.startsWith(origin + '/')), `${sidebarReads.length} sidebar reads`);
    }
  };

  let startIdx = 0; // requests made while the page is on the origin under test (the www run first visits the apex on purpose)
  const claimOrigin = ORIGINS[CLAIM_AT];
  const claimName = CLAIM_AT === 'handle' ? 'jabellae' : CLAIM_AT === 'www' ? 'probe6.acme.test' : 'probe5';
  const claimNs = CLAIM_AT === 'handle' ? 'jabellae.acme.test' : CLAIM_AT === 'www' ? 'probe6.acme.test' : 'probe5.acme.test';
  const secret = 'probe-secret-7788';

  // ── door differences, only on the first run (www) ───────────────────────────────────────────
  if (CLAIM_AT === 'www') {
    await open(ORIGINS.apex);
    const namespaceAtApex = await register('probe5', secret);
    check('apex: short name registers as probe5.acme.test', namespaceAtApex === 'probe5.acme.test', namespaceAtApex);
    await signOut();
    startIdx = requests.length;
    await open(ORIGINS.www);
    let n0 = requests.length;
    await signIn('probe5', secret);
    let t = await bodyText();
    check('www: same identity without a local key says so (no generic error)', /no key for that identity on this address/i.test(t), t.slice(0, 0));
    await signOut().catch(() => {});
    await page.getByLabel('Username').fill('probe5.acme.test'); await page.getByLabel('Secret').fill(secret);
    await page.getByRole('button', { name: '.me', exact: true }).click(); await wait(2500);
    check('www: complete name gives the same message (not doubled)', /no key for that identity on this address/i.test(await bodyText()));
    n0 = requests.length;
    await page.getByLabel('Username').fill('probe5.other.me'); await page.getByLabel('Secret').fill(secret);
    await page.getByRole('button', { name: '.me', exact: true }).click(); await wait(1500);
    t = await bodyText();
    check('www: a name under another namespace is refused, with a clear message', /under a different namespace/i.test(t) && /not available yet/i.test(t));
    check('www: the refused name sent no claim/open request', requests.slice(n0).filter((r) => /\/claims/.test(r.url)).length === 0);
  }

  // ── claim at the chosen origin ─────────────────────────────────────────────────────────────
  await open(claimOrigin);
  const from = requests.length;
  const claimed = await register(claimName, secret);
  check(`${CLAIM_AT}: registers as ${claimNs} (never doubled)`, claimed === claimNs, claimed);
  const vaultKeys = await page.evaluate(() => Object.keys(localStorage).filter((k) => k.includes('identity-vault')));
  check(`${CLAIM_AT}: local vault is keyed ${claimNs}`, vaultKeys.length === 1 && vaultKeys[0].endsWith(claimNs), vaultKeys.join(','));
  await makeKey(secret);

  await page.locator('a[href="/netget"]').first().click();
  await wait(2500);
  const hasSetup = await page.getByLabel('Setup code').count();
  check(`${CLAIM_AT}: Netget shows the setup field (the gateway answers at this origin)`, hasSetup === 1);
  const code = setupCode();
  await page.evaluate(() => { window.__doc = 'same-document'; });
  await page.getByLabel('Setup code').fill(code);
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByText('Claim gateway').waitFor({ timeout: 15000 });
  const claimUrl = new URL(page.url());
  check(`${CLAIM_AT}: the signing page is on the same origin`, claimUrl.origin === claimOrigin && claimUrl.pathname === '/keychain/claim', page.url().slice(0, 60));
  await page.getByText('probe key').first().click();
  await page.getByLabel('Passphrase').fill(secret);
  await page.getByRole('button', { name: 'Sign and continue' }).click();
  await page.getByText(/Claimed by|CLAIMED/).first().waitFor({ timeout: 20000 }).catch(() => {});
  await wait(1500);
  const marker = await page.evaluate(() => window.__doc || 'RELOADED');
  check(`${CLAIM_AT}: signing and return happen without a page reload (session kept)`, marker === 'same-document', marker);
  check(`${CLAIM_AT}: back on /netget of the same origin`, new URL(page.url()).origin === claimOrigin && new URL(page.url()).pathname === '/netget', page.url().slice(0, 60));
  const identity = await (await fetch(`http://127.0.0.1:${PORT}/gateway-identity`, { headers: { host: `acme.test:${PORT}` } })).json();
  check(`${CLAIM_AT}: the gateway has an owner and is bootstrapped`, !!identity.owner && identity.bootstrapped === true, `adminCount=${identity.adminCount}`);
  sameOriginOnly(claimOrigin, CLAIM_AT, from);

  if (EDGE) {
    const log = fs.readFileSync(tlsState.EDGE_LOG, 'utf8').split('\n').filter(Boolean);
    const parse = (l) => { const m = l.match(/^(\S+) .*?"(\S+) (\S+) [^"]*" (\d{3}) /); return m ? { peer: m[1], method: m[2], path: m[3], status: Number(m[4]) } : null; };
    const rows = log.map(parse).filter(Boolean);
    const writes = rows.filter((r) => r.method !== 'GET' && r.method !== 'HEAD' && r.method !== 'OPTIONS');
    const paths = [...new Set(writes.map((r) => `${r.method} ${r.path.split('?')[0]}`))];
    console.log(`INFO  edge: writes that went through nginx: ${paths.join(', ')}`);
    for (const p of ['/setup/verify-code', '/setup/challenge', '/setup/verify-callback', '/setup/claim']) {
      const hits = writes.filter((r) => r.path.split('?')[0] === p);
      check(`edge: POST ${p} went through nginx and was answered 2xx`, hits.length > 0 && hits.every((h) => h.status >= 200 && h.status < 300), hits.map((h) => h.status).join(','));
    }
    // The www run signs in twice, on purpose, with an identity that only the apex holds a key for; the monad
    // answers those 403 (its own IDENTITY_MISMATCH), and the edge must pass them through unchanged. Any other
    // refused write is a failure.
    const deliberate = CLAIM_AT === 'www' ? 2 : 0;
    const refusedWrites = writes.filter((r) => r.status >= 400);
    const unexpected = refusedWrites.filter((r) => !(r.path.split('?')[0] === '/claims/signIn' && r.status === 403));
    const signInRefusals = refusedWrites.length - unexpected.length;
    check('edge: no write the flow made was refused, except the monad\'s own 403 to the deliberate wrong-door sign-ins (registration, key recovery, setup, claim)',
      writes.length > 0 && unexpected.length === 0 && signInRefusals === deliberate,
      unexpected.slice(0, 4).map((r) => `${r.method} ${r.path} ${r.status}`).join(' ') || `${writes.length} writes, ${signInRefusals} deliberate 403 (expected ${deliberate})`);
    const peers = [...new Set(rows.filter((r) => r.method === 'POST').map((r) => r.peer))];
    check('edge: nginx saw a non-loopback peer for the writes (the operator-only rules were not bypassed by loopback)', peers.length > 0 && peers.every((p) => p === tlsState.LAN_IP), peers.join(','));
    // the operator-only control routes stay closed to this same non-loopback peer, through the same edge
    const https = require('https');
    const probe = (method, p) => new Promise((resolve) => { const r = https.request({ host: tlsState.LAN_IP, port: BROWSER_PORT, method, path: p, servername: 'acme.test', rejectUnauthorized: false, headers: { host: `acme.test:${BROWSER_PORT}`, 'content-type': 'application/json' } }, (res) => { res.resume(); resolve(res.statusCode); }); r.on('error', () => resolve(0)); r.end(method === 'POST' ? '{}' : undefined); });
    const gw = await probe('POST', '/__gateway/claim');
    check('edge: the monad-internal /__gateway/claim is not a success through the edge for this peer', gw >= 400, `status ${gw}`);
    const cert = tlsState.EDGE_SANS || '';
    check('edge: the certificate carries both acme.test and *.acme.test', /DNS:acme\.test/.test(cert) && /DNS:\*\.acme\.test/.test(cert), cert.slice(0, 60));
  }
  if (TLS) {
    const secure = await page.evaluate(() => [location.protocol, window.isSecureContext, !!(crypto && crypto.subtle)]);
    check('tls: the page is https and a genuine secure context (no "treat as secure" flag)', secure[0] === 'https:' && secure[1] === true && secure[2] === true, secure.join(','));
    const plain = requests.filter((r) => /^http:\/\/[^/]*acme\.test/.test(r.url));
    check('tls: no request to the namespace over plain http (no mixed content, no downgraded origin)', plain.length === 0, plain.slice(0, 3).map((r) => r.url).join(' '));
    const boot = await page.evaluate(() => window.__MONAD_NAMESPACE_PROVIDER_BOOT__ && window.__MONAD_NAMESPACE_PROVIDER_BOOT__.apiOrigin);
    check('tls: behind the proxy the monad names the https origin the page came from', boot === claimOrigin, String(boot));
  }
  await b.close();
  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} passed`);
  process.exit(failed.length ? 1 : 0);
})().catch(async (e) => { console.error('SCRIPT ERROR', e.message.split('\n')[0]); try { (await browser).close(); } catch {} process.exit(2); });
