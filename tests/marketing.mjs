// node --experimental-sqlite tests/marketing.mjs
import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import {randomBytes} from 'node:crypto';
import assert from 'node:assert/strict';
import {onRequest} from '../functions/api/fidelity/[[path]].js';
import {processMarketingQueue} from '../functions/api/fidelity/marketing.js';
const sqlite=new DatabaseSync(':memory:');
const schema=readFileSync(new URL('../database/fidelity_schema.sql',import.meta.url),'utf8');
// Verify additive migration can run on an old schema, preserving the old account.
const old=readFileSync(new URL('../database/fidelity_schema.sql',import.meta.url),'utf8').split('-- Nouveau module Marketing')[0];
sqlite.exec(old);
const existing=sqlite.prepare('SELECT COUNT(*) AS n FROM clients').get();assert.equal(existing.n,0);
sqlite.prepare(`INSERT INTO clients(id,email_index,prenom_chiffre,nom_chiffre,telephone_chiffre,email_chiffre,mot_de_passe_sel,mot_de_passe_empreinte,qr_code,cree_le)
VALUES('0ff00100-0000-4000-8000-000000000000','legacy-idx','hidden','hidden','hidden','hidden','a','b','a'.repeat(64),1)`.replace("'a'.repeat(64)",`'${'a'.repeat(64)}'`)).run();
sqlite.exec(readFileSync(new URL('../database/marketing_migration.sql',import.meta.url),'utf8'));
sqlite.exec(readFileSync(new URL('../database/marketing_migration.sql',import.meta.url),'utf8'));
assert.equal(sqlite.prepare('SELECT COUNT(*) AS n FROM clients').get().n,1,'migration did not delete original');
const db={
 prepare(sql){const st=sqlite.prepare(sql);const bound=(args)=>({first:async()=>st.get(...args)||null,all:async()=>({results:st.all(...args)}),run:async()=>{const r=st.run(...args);return {meta:{changes:Number(r.changes)}};}});return {...bound([]),bind(...args){return bound(args)}};},
 batch:async st=>{sqlite.exec('BEGIN');try{const results=[];for(const q of st)results.push(await q.run());sqlite.exec('COMMIT');return results;}catch(e){sqlite.exec('ROLLBACK');throw e;}}
};
const env={FIDELITY_DB:db,FIDELITY_ADMIN_PASSWORD:'test-staff-password-unique-2026',
 FIDELITY_ENC_KEY:randomBytes(32).toString('base64'),FIDELITY_INDEX_KEY:randomBytes(32).toString('base64'),
 FIDELITY_PEPPER:randomBytes(32).toString('hex'),RESEND_API_KEY:'fake-token',FIDELITY_EMAIL_FROM:'Wizer <hello@wizer-kin.com>'};
const domain='https://wizer-kin.com';
const mails=[];
globalThis.fetch=async (url,options)=>{assert.equal(url,'https://api.resend.com/emails');mails.push({body:JSON.parse(options.body),key:options.headers['Idempotency-Key']});return new Response('{"id":"mock"}',{status:200});};
async function request(path,b,cookie=''){
 const req=new Request(domain+'/api/fidelity/'+path,{method:b===undefined?'GET':'POST',body:b===undefined?undefined:JSON.stringify(b),headers:{...(b===undefined?{}:{Origin:domain,'Content-Type':'application/json'}),...(cookie?{Cookie:cookie}:{}),'CF-Connecting-IP':'192.0.2.8'}});
 const res=await onRequest({request:req,env});const result=await res.json();return {code:res.status,result,cookie:res.headers.get('set-cookie')?.split(';')[0]||''};
}
const password='test-customer-password-2026';
let a=await request('register',{prenom:'Marie',nom:'Exemple',email:'marie@example.com',telephone:'+243820123400',password,accept:true});
assert.equal(a.code,201,JSON.stringify(a));const aCookie=a.cookie;
let b=await request('register',{prenom:'Zoé',nom:'NonAbonnée',email:'zoe@example.com',telephone:'+243820123401',password,accept:true,marketing:false});
assert.equal(b.code,201);
assert.equal((await request('marketing/preferences',undefined,aCookie)).result.subscribed,false);
assert.equal((await request('marketing/preferences',undefined,b.cookie)).result.subscribed,false);
const admin=await request('admin/login',{password:env.FIDELITY_ADMIN_PASSWORD});assert.equal(admin.code,200);
const adminCookie=admin.cookie;
assert.equal((await request('admin/marketing/overview',undefined,'')).code,401);
assert.equal((await request('admin/marketing/overview',undefined,adminCookie)).result.registered,3);
assert.equal((await request('admin/marketing/campaign',{subject:'Hello',message:'Bonjour {{prenom}} ceci est un test',button_url:'https://wizer-kin.com',button_label:'Voir'},adminCookie)).code,409,'no sending without consent');
const set=await request('marketing/preferences',{subscribed:true},aCookie);assert.equal(set.code,200,JSON.stringify(set));
assert.equal((await request('marketing/preferences',undefined,aCookie)).result.subscribed,true);
const first=await request('admin/marketing/campaign',{subject:'Bonjour {{prenom}}',message:'Bonjour {{prenom}} {{nom}}, vos points : {{points}}\n\nhttps://wizer-kin.com/services.html\n\n&lt;test&gt;',button_url:'https://wizer-kin.com/',button_label:'Voir notre site'},adminCookie);
assert.equal(first.code,201,JSON.stringify(first));assert.equal(first.result.queued,1);
assert.equal(sqlite.prepare('SELECT COUNT(*) AS n FROM clients').get().n,3);
assert.equal(sqlite.prepare('SELECT COUNT(*) AS n FROM marketing_deliveries').get().n,1);
let run=await processMarketingQueue(env);assert.equal(run.processed,1);assert.equal(mails.length,1);
assert.equal(mails[0].body.to[0],'marie@example.com');
assert.equal(mails[0].body.subject,'Bonjour Marie');
assert(mails[0].body.text.includes('Marie Exemple, vos points : 0'));
assert(mails[0].body.html.includes('&amp;lt;test&amp;gt;'));
assert(mails[0].body.text.includes('Se désabonner gratuitement'));
assert(!JSON.stringify(mails[0]).includes('zoe@example.com'));
assert.equal((await processMarketingQueue(env)).processed,0,'no duplicate sends');
const url=mails[0].body.text.match(/https:\/\/wizer-kin\.com\/fidelity-files\/desabonnement\.html\?[^\s]+/)[0];
const args=new URL(url).searchParams;
const bad=await request('marketing/unsubscribe',{id:args.get('id'),token:'f'.repeat(64)});assert.equal(bad.code,403);
const unsub=await request('marketing/unsubscribe',{id:args.get('id'),token:args.get('token')});assert.equal(unsub.code,200,JSON.stringify(unsub));
assert.equal((await request('marketing/preferences',undefined,aCookie)).result.subscribed,false);
assert.equal((await request('admin/marketing/campaign',{subject:'Hello',message:'Vous avez des nouvelles Wizer',button_url:'https://wizer-kin.com',button_label:'Voir'},adminCookie)).code,409);
assert.equal(sqlite.prepare('SELECT COUNT(*) AS n FROM clients').get().n,3,'unsubscribe preserves all accounts');
assert.equal(sqlite.prepare('SELECT COUNT(*) AS n FROM marketing_preferences WHERE subscribed=1').get().n,0);
// Self-serve re-subscribe and re-send; old client row is not migrated to marketing automatically.
assert.equal((await request('marketing/preferences',{subscribed:true},aCookie)).code,200);
const last=await request('admin/marketing/campaign',{subject:'Rebonjour {{prenom}}',message:'Une promotion et un lien https://wizer-kin.com/',button_url:'https://wizer-kin.com',button_label:'Visiter'},adminCookie);
assert.equal(last.code,201);
assert.equal((await processMarketingQueue(env)).processed,1);
assert.equal(mails.length,2);
assert.equal(new Set(mails.map(m=>m.key)).size,2);
console.log('PASS marketing: migration additive idempotente, anciens comptes, consentement facultatif, restrictions agent, inscription sans opt-in, ciblage, personnalisation, email/html échappé, lien de désabonnement signé, double envoi évité, réabonnement.');
sqlite.close();
