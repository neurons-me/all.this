// Disposable end-to-end check on real two-label hosts: acme.test, www.acme.test, jabellae.acme.test.
// CLAIM_AT=apex|www|handle picks which origin signs and completes the gateway claim in this run.
const { createRequire } = require('module');
const { execSync } = require('child_process');
const fs = require('fs');
const GUI = '/Users/suign/Desktop/Neuroverse/all.this/packages/GUI/Typescript/';
const { chromium } = createRequire(GUI)('playwright');

const PORT = 18461; // the monad
const TLS = process.env.TLS === '1'; // real TLS via tls-proxy.mjs instead of a "treat as secure" flag
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
    '--host-resolver-rules=MAP acme.test 127.0.0.1, MAP *.acme.test 127.0.0.1',
    ...(TLS ? [`--ignore-certificate-errors-spki-list=${tlsState.SPKI}`] : [`--unsafely-treat-insecure-origin-as-secure=${Object.values(ORIGINS).join(',')}`]),
  ],
}));
function await_(p) { return p; }

(async () => {
  const b = await browser;
  const ctx = await b.newContext();
  const page = await ctx.newPage();
  const requests = [];
  page.on('request', (r) => requests.push({ method: r.method(), url: r.url() }));
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
    // public reads that go elsewhere are listed, not judged
    const reads = [...new Set(requests.slice(from).filter((r) => r.method === 'GET' && /^https?:\/\/[^/]*acme\.test/.test(r.url) && !r.url.startsWith(origin + '/')).map((r) => 'GET ' + r.url.replace(/\?.*/, '')))];
    console.log(`INFO  ${label}: public reads to other hosts of the namespace: ${reads.length ? reads.join(', ') : 'none'}`);
  };

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
