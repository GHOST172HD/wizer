// Node >=22: node --experimental-sqlite tests/integration.mjs
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import assert from 'node:assert/strict';
import {onRequest, purgeExpiredFidelity} from '../functions/api/fidelity/[[path]].js';
import worker from '../worker/index.js';
const schema=readFileSync(new URL('../database/fidelity_schema.sql',import.meta.url),'utf8');
const sqlite=new DatabaseSync(':memory:');
sqlite.exec(schema);
// Une base existante avant la mise à jour peut recevoir la colonne sans
// modifier artificiellement les coûts PBKDF2 d'anciens comptes.
const previousSchema=schema.replace('  mot_de_passe_iterations INTEGER NOT NULL DEFAULT 100000 CHECK(mot_de_passe_iterations BETWEEN 1 AND 1000000),\n','');
const legacy=new DatabaseSync(':memory:');legacy.exec(previousSchema);
legacy.exec(readFileSync(new URL('../database/fidelity_migration_pbkdf2.sql',import.meta.url),'utf8'));
assert(legacy.prepare('PRAGMA table_info(clients)').all().some(c=>c.name==='mot_de_passe_iterations'&&String(c.dflt_value)==='600000'));
legacy.close();
const db={
 prepare(sql){return {
   bind(...args){const st=sqlite.prepare(sql);return {first:async()=>st.get(...args)||null,run:async()=>{const r=st.run(...args);return {meta:{changes:Number(r.changes)}};}};}
 };},
 batch:async(sts)=>{
  sqlite.exec('BEGIN');try{const r=[];for(const st of sts)r.push(await st.run());sqlite.exec('COMMIT');return r;}catch(e){sqlite.exec('ROLLBACK');throw e;}
 }
};
const env={FIDELITY_DB:db,FIDELITY_ADMIN_PASSWORD:'a-very-long-unique-secret-for-testing',
 FIDELITY_ENC_KEY:randomBytes(32).toString('base64'),FIDELITY_INDEX_KEY:randomBytes(32).toString('base64'),
 FIDELITY_PEPPER:randomBytes(32).toString('hex'),RESEND_API_KEY:'test',FIDELITY_EMAIL_FROM:'Wizer <hello@wizer-kin.com>'};
const domain='https://wizer-kin.com';
let mail='';
globalThis.fetch=async (url,options)=>{assert.equal(url,'https://api.resend.com/emails');mail=JSON.parse(options.body).text;return new Response('{}',{status:200});};
async function request(path,obj,cookie='',headers={}){
 const method=obj===undefined?'GET':'POST';const body=method==='POST'?JSON.stringify(obj):undefined;
 const req=new Request(domain+'/api/fidelity/'+path,{method,body,headers:{...(method==='POST'?{'Content-Type':'application/json',Origin:domain}:{}),...(cookie?{Cookie:cookie}:{}),'CF-Connecting-IP':'192.0.2.5',...headers}});
 const res=await onRequest({request:req,env}),data=await res.json();
 return {status:res.status,body:data,cookie:res.headers.get('set-cookie')?.split(';')[0]||''};
}
async function main(){
 const noSecrets=await onRequest({request:new Request(domain+'/api/fidelity/me'),env:{}});
 assert.equal(noSecrets.status,503);
 const reg=await request('register',{prenom:'Marie',nom:'Test',telephone:'+243820123456',email:'MaRiE@example.net',password:'S0lid-Password-2030',accept:true});
 assert.equal(reg.status,201,JSON.stringify(reg.body));assert.equal(reg.body.account.points,0);
 assert.match(reg.body.account.qr,/^WIZER-FIDELITY:V1:[a-f0-9]{64}$/);
 const row=sqlite.prepare('SELECT * FROM clients').get();
 assert.equal(row.mot_de_passe_iterations,100000);
 assert(!JSON.stringify(row).includes('Marie'));assert(!JSON.stringify(row).includes('example.net'));
 assert(!JSON.stringify(row).includes('S0lid-Password-2030'));
 const me=await request('me',undefined,reg.cookie);assert.equal(me.status,200);assert.equal(me.body.account.nom,'Test');
 const invalid=await request('login',{email:'marie@example.net',password:'bad-password'});assert.equal(invalid.status,401);
 const login=await request('login',{email:'marie@example.net',password:'S0lid-Password-2030'});assert.equal(login.status,200);
 const staffUnauthorized=await request('admin/lookup',{code:reg.body.account.qr});assert.equal(staffUnauthorized.status,401);
 const denied=await request('admin/login',{password:'incorrect'});assert.equal(denied.status,401);
 const staff=await request('admin/login',{password:env.FIDELITY_ADMIN_PASSWORD});assert.equal(staff.status,200);
 const looked=await request('admin/lookup',{code:reg.body.account.qr},staff.cookie);assert.equal(looked.status,200);
 const ref=looked.body.client.reference;
 const op='12345678-1234-4123-8123-123456789abc';
 const award=await request('admin/award',{reference:ref,operation_id:op},staff.cookie);assert.equal(award.status,200,JSON.stringify(award.body));assert.equal(award.body.points,1);
 const repeat=await request('admin/award',{reference:ref,operation_id:op},staff.cookie);assert.equal(repeat.status,409);
 const quick=await request('admin/award',{reference:ref,operation_id:'abcdefab-1234-4123-8123-123456789abc'},staff.cookie);assert.equal(quick.status,409);
 const reloaded=await request('me',undefined,login.cookie);assert.equal(reloaded.body.account.points,1);
 const forgot=await request('forgot',{email:'marie@example.net'});assert.equal(forgot.status,200);
 const resetToken=mail.match(/reset=([a-f0-9]{64})/)?.[1];assert(resetToken);
 const reset=await request('reset',{token:resetToken,password:'New-S0lid-Password-2030'});assert.equal(reset.status,200);
 const used=await request('reset',{token:resetToken,password:'New-S0lid-Password-2030'});assert.equal(used.status,410);
 const oldLogin=await request('login',{email:'marie@example.net',password:'S0lid-Password-2030'});assert.equal(oldLogin.status,401);
 const newLogin=await request('login',{email:'marie@example.net',password:'New-S0lid-Password-2030'});assert.equal(newLogin.status,200);
 assert.equal(sqlite.prepare('SELECT mot_de_passe_iterations FROM clients').get().mot_de_passe_iterations,100000);
 const oldCookie=await request('me',undefined,reg.cookie);assert.equal(oldCookie.status,401);
 const rewards=sqlite.prepare('SELECT COUNT(*) AS count FROM recompenses WHERE active=1').get();assert.equal(rewards.count,0);
 const unauthorized=await request('admin/award',{reference:ref,operation_id:op},'',{Origin:'https://attacker.example'});assert.equal(unauthorized.status,403);
 // Les corps HTTP malformés ou trop gros ne doivent pas produire 500.
 async function rawPost(path,body){
  const res=await onRequest({env,request:new Request(domain+'/api/fidelity/'+path,{method:'POST',body,headers:{Origin:domain,'Content-Type':'application/json','CF-Connecting-IP':'192.0.2.6'}})});
  return {status:res.status,body:await res.json()};
 }
 assert.equal((await rawPost('login','{')).status,400);
 assert.equal((await rawPost('login','null')).status,400);
 assert.equal((await rawPost('login','[]')).status,400);
 assert.equal((await rawPost('login','"hello"')).status,400);
 assert.equal((await rawPost('login',JSON.stringify({email:'a'.repeat(10000)}))).status,413);
 // Vérifier la purge, y compris via le gestionnaire scheduled du Worker.
 const now=Math.floor(Date.now()/1000);
 sqlite.prepare("INSERT INTO sessions(identifiant_hash,type_session,expire_le) VALUES('expired-test','agent',?)").run(now-10);
 sqlite.prepare("INSERT INTO tentatives_connexion(cle_hash,nombre,debut_fenetre) VALUES('old-test',1,?)").run(now-1000);
 sqlite.prepare("INSERT INTO reinitialisations(jeton_hash,client_id,expire_le) VALUES('old-reset',?,?)").run(ref,now-1);
 await worker.scheduled({cron:'23 3 * * *'},env,{});
 assert.equal(sqlite.prepare("SELECT 1 FROM sessions WHERE identifiant_hash='expired-test'").get(),undefined);
 assert.equal(sqlite.prepare("SELECT 1 FROM tentatives_connexion WHERE cle_hash='old-test'").get(),undefined);
 assert.equal(sqlite.prepare("SELECT 1 FROM reinitialisations WHERE jeton_hash='old-reset'").get(),undefined);
 assert.equal((await request('me',undefined,newLogin.cookie)).status,200);
 // Suppression authentifiée : ne supprime pas les autres sessions agents.
 assert.equal((await request('account/delete',{password:'wrong'},newLogin.cookie)).status,401);
 assert.equal((await request('account/delete',{password:'New-S0lid-Password-2030'},'',{Origin:'https://attacker.example'})).status,403);
 const del=await request('account/delete',{password:'New-S0lid-Password-2030'},newLogin.cookie);
 assert.equal(del.status,200,JSON.stringify(del.body));
 assert.match(del.cookie,/wizer_client=/);
 for(const table of ['clients','mouvements_points','sessions','reinitialisations','utilisations_recompenses']){
   const sql='SELECT COUNT(*) AS n FROM '+table+(table==='sessions'?" WHERE type_session='client'":'');
   assert.equal(sqlite.prepare(sql).get().n,0,table);
 }
 assert.equal((await request('me',undefined,newLogin.cookie)).status,401);
 assert.equal((await request('admin/me',undefined,staff.cookie)).status,200);
 console.log('PASS: auth, hash cost, schema migration, AES, sessions, agent, points, replay, email reset, invalid JSON 400, oversize 413, scheduled purge, secure account delete, CSRF.');
}
main().catch(e=>{console.error('FAILED',e);process.exitCode=1;});
