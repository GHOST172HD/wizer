/* Wizer Fidelity — Cloudflare Pages Function. NE PAS copier dans le répertoire public. */
const enc = new TextEncoder();
const dec = new TextDecoder();
const sec = () => Math.floor(Date.now() / 1000);
const bytes = n => crypto.getRandomValues(new Uint8Array(n));
const hex = arr => [...new Uint8Array(arr)].map(x => x.toString(16).padStart(2,'0')).join('');
const unhex = h => new Uint8Array(h.match(/.{2}/g).map(a => parseInt(a,16)));
const id = () => crypto.randomUUID();
const json = (data, status=200, extra={}) => new Response(JSON.stringify(data), {
  status, headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...extra}
});
const err = (message,status=400) => json({ok:false,error:message},status);
const b64 = x => btoa(String.fromCharCode(...x));
const unb64 = x => Uint8Array.from(atob(x), c=>c.charCodeAt(0));
const cookie = (name,val,age) => `${name}=${val}; Path=/; Secure; HttpOnly; SameSite=Strict; Max-Age=${age}`;
const secureCompare = (a,b) => {
  if(typeof a!=='string'||typeof b!=='string')return false;
  const x=enc.encode(a),y=enc.encode(b);let z=x.length^y.length;
  for(let i=0;i<Math.max(x.length,y.length);i++)z|=(x[i]||0)^(y[i]||0);
  return z===0;
};
const sha = async s => hex(await crypto.subtle.digest('SHA-256',enc.encode(s)));
async function keyedIndex(value,key){
  const k=await crypto.subtle.importKey('raw',unb64(key),{name:'HMAC',hash:'SHA-256'},false,['sign']);
  return hex(await crypto.subtle.sign('HMAC',k,enc.encode(value)));
}
async function cipher(value,key){
  const iv=bytes(12),k=await crypto.subtle.importKey('raw',unb64(key),'AES-GCM',false,['encrypt']);
  const body=new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv},k,enc.encode(value)));
  return `${b64(iv)}.${b64(body)}`;
}
async function decipher(value,key){
  const [iv,body]=value.split('.');const k=await crypto.subtle.importKey('raw',unb64(key),'AES-GCM',false,['decrypt']);
  return dec.decode(await crypto.subtle.decrypt({name:'AES-GCM',iv:unb64(iv)},k,unb64(body)));
}
const CYCLES=600000;
async function passwordHash(password,salt,pepper){
  const base=await crypto.subtle.importKey('raw',enc.encode(password+pepper),'PBKDF2',false,['deriveBits']);
  return hex(await crypto.subtle.deriveBits({name:'PBKDF2',salt:unhex(salt),iterations:CYCLES,hash:'SHA-256'},base,256));
}
function environment(env){
  return env.FIDELITY_DB && env.FIDELITY_ENC_KEY && env.FIDELITY_INDEX_KEY && env.FIDELITY_PEPPER && env.FIDELITY_ADMIN_PASSWORD
    && unb64(env.FIDELITY_ENC_KEY).length===32 && unb64(env.FIDELITY_INDEX_KEY).length===32 && env.FIDELITY_PEPPER.length>=32 && env.FIDELITY_ADMIN_PASSWORD.length>=16;
}
function sameOrigin(req){
  const origin=req.headers.get('Origin'),target=new URL(req.url);
  return !!origin && origin===target.origin && req.headers.get('content-type')?.toLowerCase().startsWith('application/json');
}
async function bodyJson(req){
  if(Number(req.headers.get('content-length')||0)>8192)throw new Error('Requête trop volumineuse');
  const s=await req.text();if(s.length>8192)throw new Error('Requête trop volumineuse');return JSON.parse(s||'{}');
}
function getCookie(req,key){
  const item=(req.headers.get('Cookie')||'').split(';').map(x=>x.trim()).find(x=>x.startsWith(key+'='));
  return item?item.slice(key.length+1):'';
}
async function session(ctx,kind){
  const token=getCookie(ctx.request,kind==='agent'?'wizer_staff':'wizer_client');
  if(!/^[a-f0-9]{64}$/.test(token))return null;
  const row=await ctx.env.FIDELITY_DB.prepare('SELECT * FROM sessions WHERE identifiant_hash=? AND type_session=? AND expire_le>?')
    .bind(await sha(token),kind,sec()).first();
  return row||null;
}
async function newSession(ctx,kind,clientId=null){
  const token=hex(bytes(32));const life=kind==='agent'?8*3600:30*86400;
  await ctx.env.FIDELITY_DB.prepare('INSERT INTO sessions(identifiant_hash,type_session,client_id,expire_le) VALUES(?,?,?,?)')
    .bind(await sha(token),kind,clientId,sec()+life).run();
  return cookie(kind==='agent'?'wizer_staff':'wizer_client',token,life);
}
async function dismissSession(ctx,kind){
  const token=getCookie(ctx.request,kind==='agent'?'wizer_staff':'wizer_client');
  if(/^[a-f0-9]{64}$/.test(token))await ctx.env.FIDELITY_DB.prepare('DELETE FROM sessions WHERE identifiant_hash=?').bind(await sha(token)).run();
  return cookie(kind==='agent'?'wizer_staff':'wizer_client','',0);
}
function contactIP(req){return (req.headers.get('CF-Connecting-IP')||'unknown').slice(0,70);}
async function throttle(ctx,kind,label){
  const key=await keyedIndex(kind+':'+label,ctx.env.FIDELITY_INDEX_KEY);const now=sec();
  const row=await ctx.env.FIDELITY_DB.prepare('SELECT nombre,debut_fenetre FROM tentatives_connexion WHERE cle_hash=?').bind(key).first();
  return row&&now-row.debut_fenetre<900&&row.nombre>=6;
}
async function hit(ctx,kind,label){
  const key=await keyedIndex(kind+':'+label,ctx.env.FIDELITY_INDEX_KEY), now=sec();
  await ctx.env.FIDELITY_DB.prepare(`INSERT INTO tentatives_connexion(cle_hash,nombre,debut_fenetre) VALUES(?,1,?)
    ON CONFLICT(cle_hash) DO UPDATE SET nombre=CASE WHEN ?-debut_fenetre>=900 THEN 1 ELSE nombre+1 END,
    debut_fenetre=CASE WHEN ?-debut_fenetre>=900 THEN ? ELSE debut_fenetre END`)
    .bind(key,now,now,now,now).run();
}
async function clearHit(ctx,kind,label){
  const key=await keyedIndex(kind+':'+label,ctx.env.FIDELITY_INDEX_KEY);
  await ctx.env.FIDELITY_DB.prepare('DELETE FROM tentatives_connexion WHERE cle_hash=?').bind(key).run();
}
function validEmail(v){return typeof v==='string'&&v.length<=200&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);}
function validName(v){return typeof v==='string'&&v.trim().length>=2&&v.trim().length<=80&&!/[<>\x00-\x1f]/.test(v);}
function validPass(v){return typeof v==='string'&&v.length>=12&&v.length<=128&&enc.encode(v).length<=256;}
async function brief(ctx,row){
  return {prenom:await decipher(row.prenom_chiffre,ctx.env.FIDELITY_ENC_KEY),
    nom:await decipher(row.nom_chiffre,ctx.env.FIDELITY_ENC_KEY),
    email:await decipher(row.email_chiffre,ctx.env.FIDELITY_ENC_KEY),
    telephone:await decipher(row.telephone_chiffre,ctx.env.FIDELITY_ENC_KEY),
    points:row.total_points,qr:'WIZER-FIDELITY:V1:'+row.qr_code};
}
async function sendEmail(ctx,email,subject,plain){
  if(!ctx.env.RESEND_API_KEY||!ctx.env.FIDELITY_EMAIL_FROM)return false;
  const r=await fetch('https://api.resend.com/emails',{
    method:'POST',headers:{'Authorization':'Bearer '+ctx.env.RESEND_API_KEY,'Content-Type':'application/json'},
    body:JSON.stringify({from:ctx.env.FIDELITY_EMAIL_FROM,to:[email],subject,text:plain})
  });return r.ok;
}
const noStore='no-store';
export async function onRequest(ctx){
  const req=ctx.request,path=new URL(req.url).pathname.replace(/^\/api\/fidelity\/?/,'').replace(/\/$/,'');
  const method=req.method,db=ctx.env.FIDELITY_DB;
  if(!environment(ctx.env))return err('Fidélité non configurée sur Cloudflare : accès désactivé.',503);
  if(method==='OPTIONS')return new Response(null,{status:405,headers:{Allow:'GET, POST'}});
  if(method!=='GET'&&method!=='POST')return err('Méthode interdite',405);
  if(method==='POST'&&!sameOrigin(req))return err('Origine ou type de requête refusé',403);
  try{
    if(method==='GET'&&path==='config')return json({ok:true,reinitialisation_disponible:!!(ctx.env.RESEND_API_KEY&&ctx.env.FIDELITY_EMAIL_FROM)});
    if(method==='POST'&&path==='register'){
      const b=await bodyJson(req),ip=contactIP(req);
      if(await throttle(ctx,'registration',ip))return err('Trop de demandes. Réessayez plus tard.',429);
      const name=b.nom?.trim(),first=b.prenom?.trim(),tel=b.telephone?.trim(),email=b.email?.trim().toLowerCase(),pwd=b.password;
      if(!validName(name)||!validName(first)||!validEmail(email)||!/^\+?[0-9 ()-]{8,22}$/.test(tel||'')||!validPass(pwd)||b.accept!==true){return err('Vérifie les renseignements et accepte la politique de confidentialité. Mot de passe : 12 caractères minimum.',422);}
      await hit(ctx,'registration',ip);
      const eidx=await keyedIndex(email,ctx.env.FIDELITY_INDEX_KEY);
      if(await db.prepare('SELECT id FROM clients WHERE email_index=?').bind(eidx).first())return err('Ce compte existe déjà. Connectez-vous.',409);
      const salt=hex(bytes(16)),hash=await passwordHash(pwd,salt,ctx.env.FIDELITY_PEPPER);
      const [f,n,t,e]=await Promise.all([first,name,tel,email].map(x=>cipher(x,ctx.env.FIDELITY_ENC_KEY)));
      const customerId=id(), qr=hex(bytes(32));
      await db.prepare(`INSERT INTO clients(id,email_index,prenom_chiffre,nom_chiffre,telephone_chiffre,email_chiffre,mot_de_passe_sel,mot_de_passe_empreinte,qr_code,cree_le) VALUES(?,?,?,?,?,?,?,?,?,?)`)
        .bind(customerId,eidx,f,n,t,e,salt,hash,qr,sec()).run();
      const set=await newSession(ctx,'client',customerId);
      return json({ok:true,account:{prenom:first,nom:name,telephone:tel,email,points:0,qr:'WIZER-FIDELITY:V1:'+qr}},201,{'Set-Cookie':set});
    }
    if(method==='POST'&&path==='login'){
      const b=await bodyJson(req),email=(b.email||'').trim().toLowerCase(),pwd=b.password||'';
      if(!validEmail(email)||typeof pwd!=='string'||pwd.length>128)return err('Identifiants incorrects',401);
      const key=contactIP(req)+':'+email;
      if(await throttle(ctx,'client-login',key)||await throttle(ctx,'ip-login',contactIP(req)))return err('Trop de tentatives. Réessayez dans 15 minutes.',429);
      const eidx=await keyedIndex(email,ctx.env.FIDELITY_INDEX_KEY);
      const row=await db.prepare('SELECT * FROM clients WHERE email_index=?').bind(eidx).first();
      const salt=row?.mot_de_passe_sel||'00'.repeat(16);
      const computed=await passwordHash(pwd,salt,ctx.env.FIDELITY_PEPPER);
      if(!row||!secureCompare(computed,row.mot_de_passe_empreinte)){
        await hit(ctx,'client-login',key);await hit(ctx,'ip-login',contactIP(req));return err('Identifiants incorrects',401);
      }
      await clearHit(ctx,'client-login',key);await clearHit(ctx,'ip-login',contactIP(req));
      return json({ok:true,account:await brief(ctx,row)},200,{'Set-Cookie':await newSession(ctx,'client',row.id)});
    }
    if(method==='GET'&&path==='me'){
      const s=await session(ctx,'client');if(!s)return err('Session expirée',401);
      const row=await db.prepare('SELECT * FROM clients WHERE id=?').bind(s.client_id).first();
      return row?json({ok:true,account:await brief(ctx,row)}):err('Compte indisponible',404);
    }
    if(method==='POST'&&path==='logout')return json({ok:true},200,{'Set-Cookie':await dismissSession(ctx,'client')});
    if(method==='POST'&&path==='forgot'){
      const b=await bodyJson(req),email=(b.email||'').trim().toLowerCase(),ip=contactIP(req);
      if(!validEmail(email))return err('Adresse email invalide.',422);
      if(!ctx.env.RESEND_API_KEY||!ctx.env.FIDELITY_EMAIL_FROM)return err('La récupération par email n’est pas encore activée.',503);
      if(await throttle(ctx,'forgot',ip))return err('Trop de demandes. Réessayez plus tard.',429);
      await hit(ctx,'forgot',ip);
      const idx=await keyedIndex(email,ctx.env.FIDELITY_INDEX_KEY);
      const user=await db.prepare('SELECT id FROM clients WHERE email_index=?').bind(idx).first();
      if(user){
        const token=hex(bytes(32)),hashed=await sha(token),expiry=sec()+1200;
        await db.prepare('INSERT INTO reinitialisations(jeton_hash,client_id,expire_le) VALUES(?,?,?)').bind(hashed,user.id,expiry).run();
        const url=new URL('https://wizer-kin.com/fidelity-files/fidelity.html');url.searchParams.set('reset',token);
        try{await sendEmail(ctx,email,'Wizer — Réinitialisation du mot de passe',`Bonjour,\n\nPour changer votre mot de passe Wizer, ouvrez ce lien valable 20 minutes :\n${url.href}\n\nSi vous n'avez rien demandé, ignorez cet email.`);}catch(_){ /* ne pas révéler l'existence du compte */ }
      }
      return json({ok:true,message:'Si ce compte existe, un email de récupération sera envoyé.'});
    }
    if(method==='POST'&&path==='reset'){
      const b=await bodyJson(req),token=b.token||'',pwd=b.password;
      if(!/^[a-f0-9]{64}$/.test(token)||!validPass(pwd))return err('Lien invalide ou mot de passe trop court (12 caractères minimum).',422);
      const entry=await db.prepare('SELECT * FROM reinitialisations WHERE jeton_hash=? AND expire_le>? AND utilise_le IS NULL').bind(await sha(token),sec()).first();
      if(!entry)return err('Ce lien a expiré ou a déjà été utilisé.',410);
      const salt=hex(bytes(16)),hash=await passwordHash(pwd,salt,ctx.env.FIDELITY_PEPPER),now=sec();
      const results=await db.batch([
        db.prepare(`UPDATE clients SET mot_de_passe_sel=?, mot_de_passe_empreinte=? WHERE id=?
          AND EXISTS(SELECT 1 FROM reinitialisations WHERE jeton_hash=? AND utilise_le IS NULL AND expire_le>?)`).bind(salt,hash,entry.client_id,entry.jeton_hash,now),
        db.prepare(`UPDATE reinitialisations SET utilise_le=? WHERE jeton_hash=? AND utilise_le IS NULL AND expire_le>?`).bind(now,entry.jeton_hash,now),
        db.prepare('DELETE FROM sessions WHERE client_id=?').bind(entry.client_id)
      ]);
      if(results[0].meta.changes!==1||results[1].meta.changes!==1)return err('Ce lien a déjà été utilisé.',410);
      return json({ok:true,message:'Mot de passe mis à jour. Connectez-vous.'});
    }
    if(method==='POST'&&path==='admin/login'){
      const b=await bodyJson(req),pwd=b.password||'',ip=contactIP(req);
      if(typeof pwd!=='string'||pwd.length>256)return err('Accès refusé.',401);
      if(await throttle(ctx,'agent',ip))return err('Trop de tentatives. Réessayez dans 15 minutes.',429);
      const a=await sha(pwd),z=await sha(ctx.env.FIDELITY_ADMIN_PASSWORD);
      if(!secureCompare(a,z)){await hit(ctx,'agent',ip);return err('Accès refusé.',401);}
      await clearHit(ctx,'agent',ip);
      return json({ok:true},200,{'Set-Cookie':await newSession(ctx,'agent')});
    }
    if(method==='POST'&&path==='admin/logout')return json({ok:true},200,{'Set-Cookie':await dismissSession(ctx,'agent')});
    if(path.startsWith('admin/')&&!(await session(ctx,'agent')))return err('Accès agent interdit.',401);
    if(method==='GET'&&path==='admin/me')return json({ok:true,role:'agent'});
    if(method==='POST'&&path==='admin/lookup'){
      const b=await bodyJson(req),code=b.code;
      if(typeof code!=='string'||!/^(WIZER-FIDELITY:V1:)?[a-f0-9]{64}$/.test(code))return err('QR code Wizer invalide.',422);
      const qr=code.replace(/^WIZER-FIDELITY:V1:/,'');
      const row=await db.prepare('SELECT id,prenom_chiffre,nom_chiffre,total_points FROM clients WHERE qr_code=?').bind(qr).first();
      if(!row)return err('Carte inconnue.',404);
      return json({ok:true,client:{reference:row.id,prenom:await decipher(row.prenom_chiffre,ctx.env.FIDELITY_ENC_KEY),nom:await decipher(row.nom_chiffre,ctx.env.FIDELITY_ENC_KEY),points:row.total_points}});
    }
    if(method==='POST'&&path==='admin/award'){
      const b=await bodyJson(req),ref=b.reference;
      if(typeof ref!=='string'||!/^[0-9a-f-]{36}$/.test(ref)||typeof b.operation_id!=='string'||!/^[0-9a-f-]{36}$/.test(b.operation_id))return err('Opération invalide.',422);
      const now=sec(),movement=id();
      // Une visite = au maximum 1 point par client durant 10 minutes, même après rafraîchissement.
      const q1=db.prepare(`INSERT OR IGNORE INTO mouvements_points(id,client_id,type_mouvement,quantite,cree_le,operation_id)
         SELECT ?,id,'gain',1,?,? FROM clients WHERE id=?
         AND NOT EXISTS (SELECT 1 FROM mouvements_points WHERE client_id=? AND type_mouvement='gain' AND cree_le>?)`)
        .bind(movement,now,b.operation_id,ref,ref,now-600);
      const q2=db.prepare('UPDATE clients SET total_points=total_points+1 WHERE id=(SELECT client_id FROM mouvements_points WHERE id=?)').bind(movement);
      const results=await db.batch([q1,q2]);
      if(results[0].meta.changes!==1)return err('Point déjà attribué récemment (10 minutes) ou opération répétée.',409);
      const row=await db.prepare('SELECT total_points FROM clients WHERE id=?').bind(ref).first();
      return json({ok:true,points:row.total_points,message:'1 point ajouté et inscrit dans l’historique.'});
    }
    return err('Route inconnue',404);
  }catch(e){
    console.error('Fidelity error:',e?.name||'Error');
    return err('Une erreur serveur est survenue. Vérifiez la configuration et réessayez.',500);
  }
}
