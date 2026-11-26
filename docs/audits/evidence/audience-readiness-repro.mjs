// Read-only kernel investigation. All state is synthetic and in memory.
// Usage: node audience-readiness-repro.mjs /absolute/path/to/dist/me.es.js
// Assertions characterize the audited baseline; fixes should change these expectations.
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
const { default: ME } = await import(pathToFileURL(process.argv[2]).href);

const me = new ME();
me.finance['_']('synthetic-secret');
me.finance.price(24.5);
me.invoice.fuel(10);
me.invoice['=']('cost', 'fuel * finance.price');
const snapshot = me.exportSnapshot();
const restored = new ME(); restored.hydrate(snapshot);
assert.equal(me.as(null)('invoice.cost'),245);
assert.equal(restored('invoice.cost'),245);
assert.equal(restored('finance.price'),undefined);
assert.ok(snapshot.memories.some(m=>m.path==='invoice.cost' && m.value===245));
console.log('CONFIRMED: public derived result survives export/hydrate while secret input is closed.');

const recipient=await ME.generateP256KeyPair(true,['deriveBits']);
const env=await ME.wrapSecretV1({secret:'synthetic-wrapped',recipientPublicKey:recipient.publicKey,kid:'original',class:'data-key'});
const modified=structuredClone(env);
modified.kid='other'; modified.class='identity-key'; modified.policy={usage:['sign'],hardwareBound:true};
assert.equal(await ME.unwrapSecretV1(modified,recipient.privateKey,'utf8'),'synthetic-wrapped');
console.log('CONFIRMED: kid/class/policy changes do not invalidate WrappedSecretV1.');

let unchanged=0, rejected=0;
for(let i=0;i<48;i++) {
 const e=await ME.wrapSecretV1({secret:'orgboat-super-secret',recipientPublicKey:recipient.publicKey,kid:'test',class:'data-key'});
 for(const field of ['ciphertext','tag']) {
  const t=structuredClone(e), original=t.encryption[field];
  t.encryption[field]=original.slice(0,-1)+(original.endsWith('A')?'B':'A');
  if(Buffer.from(original,'base64url').equals(Buffer.from(t.encryption[field],'base64url'))) {
   unchanged++;
   assert.equal(await ME.unwrapSecretV1(t,recipient.privateKey,'utf8'),'orgboat-super-secret');
  } else {
   rejected++;
   await assert.rejects(()=>ME.unwrapSecretV1(t,recipient.privateKey));
  }
 }
}
console.log('BASE64',JSON.stringify({unchangedBytes:unchanged,realChangesRejected:rejected,total:96}));

const k=new ME(); await k.createIdentityRoot('synthetic-password',210000);
k['_']('root-secret'); k.privateValue('before'); k.lockIdentity();
const k2=new ME(); k2.hydrate(k.exportSnapshot()); k2.privateValue('after');
assert.equal(k2('privateValue'),'after');
assert.ok(JSON.stringify(k2.exportSnapshot()).includes('after'));
console.log('CONFIRMED REGRESSION: root scope -> lock -> export -> hydrate -> write becomes public.');

const w=new ME(); w.installRecipientKey('recipient',recipient.privateKey);
w.storeWrappedKey('entry',env,{recipientKeyId:'recipient'});
await w.createIdentityRoot('synthetic-password',210000); w.lockIdentity();
assert.equal(await w.execute('me://self:open/keys/entry',{output:'utf8'}),'synthetic-wrapped');
console.log('CONFIRMED: lockIdentity does not disable the independent recipient keyring.');
