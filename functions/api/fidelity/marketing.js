/**
 * Wizer Marketing : consentements distincts, campagnes destinées uniquement
 * aux abonnés, fichiers privés dans le Worker, envoi asynchrone via Cron/D1.
 * Ne jamais importer ce module depuis les fichiers du répertoire dist/.
 */
const now = () => Math.floor(Date.now()/1000);
const uid = () => crypto.randomUUID();
const encoder = new TextEncoder();
const esc = value => String(value).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const isURL = value => typeof value==='string' && value.length<=400 && /^https:\/\/[^\s<>"']{4,}$/i.test(value) && (()=>{try{return new URL(value).protocol==='https:'}catch{return false}})();
const sample = {prenom:'Marie',nom:'Exemple',points:6};
const interpolate = (content, values) => content.replace(/\{\{\s*(prenom|nom|points)\s*\}\}/gi,(_,k)=>String(values[k.toLowerCase()] ?? ''));
const textToHtml = content => {
  // Pas de HTML arbitraire injecté: texte échappé + HTTPS cliquables automatiquement.
  const safe=esc(content);
  return safe.replace(/https:\/\/[^\s<]+/g, raw=>{
    const url=raw.replace(/[.,;!?]+$/,'');
    return isURL(url)?`<a href="${url}" target="_blank" rel="noopener noreferrer" style="color:#e54a51;text-decoration:underline">${url}</a>${raw.slice(url.length)}`:raw;
  }).replace(/\n/g,'<br>');
};
const unsubscribeLink = (origin,clientId,token) => `${origin}/fidelity-files/desabonnement.html?id=${encodeURIComponent(clientId)}&token=${encodeURIComponent(token)}`;
async function signUnsubscribe(clientId,key){
 const k=await crypto.subtle.importKey('raw',Uint8Array.from(atob(key),x=>x.charCodeAt(0)),{name:'HMAC',hash:'SHA-256'},false,['sign']);
 const sig=await crypto.subtle.sign('HMAC',k,encoder.encode('wizer-optout-v1:'+clientId));
 return [...new Uint8Array(sig)].map(x=>x.toString(16).padStart(2,'0')).join('');
}
const validClientId = id => typeof id==='string' && /^[0-9a-f-]{36}$/.test(id);
const info = async (db,id) => (await db.prepare('SELECT subscribed FROM marketing_preferences WHERE client_id=?').bind(id).first())?.subscribed===1;
const clean = e => String(e||'Erreur').slice(0,150).replace(/[\r\n]/g,' ');
export async function marketingRequest(ctx,path,h){
 const {json,err,bodyJson,session,secureCompare,sec}=h;
 const db=ctx.env.FIDELITY_DB,method=ctx.request.method;
 if(path==='marketing/unsubscribe'){
  if(method!=='POST')return err('Méthode interdite',405);
  const b=await bodyJson(ctx.request);
  if(!validClientId(b.id)||typeof b.token!=='string'||!/^[0-9a-f]{64}$/.test(b.token))return err('Lien invalide.',422);
  const expected=await signUnsubscribe(b.id,ctx.env.FIDELITY_INDEX_KEY);
  if(!secureCompare(expected,b.token))return err('Lien invalide.',403);
  // Même une seconde désinscription est idempotente et réussit.
  await db.prepare(`INSERT INTO marketing_preferences(client_id,subscribed,subscribed_at,unsubscribed_at,source)
    SELECT id,0,NULL,?,'lien-email' FROM clients WHERE id=?
    ON CONFLICT(client_id) DO UPDATE SET subscribed=0,unsubscribed_at=excluded.unsubscribed_at,source='lien-email'`)
    .bind(sec(),b.id).run();
  await db.prepare("UPDATE marketing_deliveries SET state='skipped',updated_at=? WHERE client_id=? AND state='pending'").bind(sec(),b.id).run();
  return json({ok:true,message:'Votre désabonnement est enregistré.'});
 }
 if(path==='marketing/preferences'){
  const current=await session(ctx,'client');
  if(!current)return err('Connectez-vous à votre carte fidélité.',401);
  if(method==='GET')return json({ok:true,subscribed:await info(db,current.client_id)});
  if(method==='POST'){
   const b=await bodyJson(ctx.request);
   if(typeof b.subscribed!=='boolean')return err('Choix invalide.',422);
   const yes=b.subscribed,at=sec();
   await db.prepare(`INSERT INTO marketing_preferences(client_id,subscribed,subscribed_at,unsubscribed_at,source)
    VALUES(?,?,?,?,?) ON CONFLICT(client_id) DO UPDATE SET subscribed=excluded.subscribed,
    subscribed_at=CASE WHEN excluded.subscribed=1 THEN excluded.subscribed_at ELSE marketing_preferences.subscribed_at END,
    unsubscribed_at=CASE WHEN excluded.subscribed=0 THEN excluded.unsubscribed_at ELSE NULL END,
    source='compte'`).bind(current.client_id,yes?1:0,yes?at:null,yes?null:at,'compte').run();
   if(!yes)await db.prepare("UPDATE marketing_deliveries SET state='skipped',updated_at=? WHERE client_id=? AND state='pending'").bind(at,current.client_id).run();
   return json({ok:true,subscribed:yes});
  }
  return err('Méthode interdite',405);
 }
 // Tous les endpoints qui suivent nécessitent le cookie de session du scanner.
 if(!(await session(ctx,'agent')))return err('Accès agent interdit.',401);
 if(path==='admin/marketing/overview'&&method==='GET'){
  const registered=await db.prepare('SELECT COUNT(*) AS n FROM clients').first();
  const subscribed=await db.prepare('SELECT COUNT(*) AS n FROM marketing_preferences WHERE subscribed=1').first();
  const q=await db.prepare(`SELECT c.id,c.subject,c.status,c.created_at,
    COUNT(d.client_id) AS total,
    COALESCE(SUM(CASE WHEN d.state='sent' THEN 1 ELSE 0 END),0) AS sent,
    COALESCE(SUM(CASE WHEN d.state IN ('pending','sending') THEN 1 ELSE 0 END),0) AS pending,
    COALESCE(SUM(CASE WHEN d.state='failed' THEN 1 ELSE 0 END),0) AS failed,
    COALESCE(SUM(CASE WHEN d.state='skipped' THEN 1 ELSE 0 END),0) AS skipped
    FROM marketing_campaigns c LEFT JOIN marketing_deliveries d ON d.campaign_id=c.id
    GROUP BY c.id ORDER BY c.created_at DESC LIMIT 12`).all();
  return json({ok:true,registered:registered?.n||0,subscribed:subscribed?.n||0,campaigns:q.results||[]});
 }
 if(path==='admin/marketing/campaign'&&method==='POST'){
  if(!ctx.env.RESEND_API_KEY||!ctx.env.FIDELITY_EMAIL_FROM)return err('Resend doit être configuré sur Cloudflare.',503);
  const b=await bodyJson(ctx.request);
  const subject=b.subject?.trim(),message=b.message?.trim(),buttonLabel=(b.button_label||'Découvrir Wizer').trim(),buttonUrl=(b.button_url||'https://wizer-kin.com/').trim();
  if(typeof subject!=='string'||subject.length<3||subject.length>140||/[\r\n<>]/.test(subject))return err('Objet invalide (3–140 caractères).',422);
  if(typeof message!=='string'||message.length<8||message.length>3500)return err('Message invalide (8–3500 caractères).',422);
  if(typeof buttonLabel!=='string'||buttonLabel.length<2||buttonLabel.length>80||/[<>\r\n]/.test(buttonLabel))return err('Libellé du bouton invalide.',422);
  if(!isURL(buttonUrl))return err('Le bouton doit contenir une adresse HTTPS valide.',422);
  const audience=await db.prepare('SELECT COUNT(*) AS n FROM marketing_preferences WHERE subscribed=1').first();
  if(!audience?.n)return err('Aucune cliente abonnée aux promotions. Demandez d’abord leur accord.',409);
  const campaignId=uid(),time=sec();
  // Une campagne = une seule insertion SQL d'audience, pas une boucle par cliente.
  await db.batch([
   db.prepare(`INSERT INTO marketing_campaigns(id,subject,message,button_label,button_url,status,created_at)
     VALUES(?,?,?,?,?,'queued',?)`).bind(campaignId,subject,message,buttonLabel,buttonUrl,time),
   db.prepare(`INSERT INTO marketing_deliveries(campaign_id,client_id,state,updated_at)
     SELECT ?,client_id,'pending',? FROM marketing_preferences WHERE subscribed=1
     AND client_id IN (SELECT id FROM clients)`).bind(campaignId,time)
  ]);
  // Accélération facultative de la première vague ; le Cron poursuit même après fermeture de la page.
  if(ctx.context?.waitUntil)ctx.context.waitUntil(processMarketingQueue(ctx.env));
  return json({ok:true,campaign_id:campaignId,queued:audience.n,message:'Campagne enregistrée. Les envois seront traités automatiquement.'},201);
 }
 return err('Route inconnue',404);
}

function renderEmail(campaign, client, link){
 const person={prenom:client.prenom,nom:client.nom,points:client.total_points};
 const subject=interpolate(campaign.subject,person);
 const message=interpolate(campaign.message,person);
 const ctaLabel=interpolate(campaign.button_label,person);
 const button=esc(campaign.button_url);
 const html=`<!doctype html><html lang="fr"><head><meta charset="utf-8"></head><body style="background:#100b0d;color:#f8f1f1;padding:20px;font-family:Arial,Helvetica,sans-serif">
 <div style="max-width:590px;margin:auto;background:#211317;border:1px solid #623239;border-radius:16px;padding:28px">
 <p style="font-weight:bold;color:#ef515b;letter-spacing:2px">WIZER INSTITUT · FIDELITY</p>
 <h1 style="color:white;font-size:26px">${esc(subject)}</h1>
 <p style="color:#f3eeee;font-size:16px;line-height:1.75">${textToHtml(message)}</p>
 <p style="margin:30px 0"><a href="${button}" style="background:#b4111c;color:white;padding:15px 24px;text-decoration:none;border-radius:10px;font-weight:700">${esc(ctaLabel)}</a></p>
 <hr style="border:0;border-top:1px solid #63474b;margin-top:36px">
 <p style="color:#e6cdd0;font-size:12px;line-height:1.8">Wizer Institut, Kinshasa · Vous recevez cet email car vous êtes abonné(e) aux offres Wizer Fidelity.<br><a href="${esc(link)}" style="color:#ffc2c5">Se désabonner gratuitement</a></p></div></body></html>`;
 const plain=`${subject}\n\n${message}\n\n${ctaLabel} : ${campaign.button_url}\n\nWizer Institut - Kinshasa\nSe désabonner gratuitement : ${link}`;
 return {subject,html,text:plain};
}

export async function processMarketingQueue(env){
 if(!env?.FIDELITY_DB||!env?.RESEND_API_KEY||!env?.FIDELITY_EMAIL_FROM)return {processed:0,reason:'marketing-not-configured'};
 const db=env.FIDELITY_DB,time=now();
 // Rattrape un envoi interrompu après 10 min. L'idempotency-key protège les doublons chez Resend.
 const batch=await db.prepare(`SELECT d.campaign_id,d.client_id,d.attempts,d.state,
   c.subject,c.message,c.button_label,c.button_url,
   u.prenom_chiffre,u.nom_chiffre,u.email_chiffre,u.total_points
   FROM marketing_deliveries d
   JOIN marketing_campaigns c ON c.id=d.campaign_id
   JOIN clients u ON u.id=d.client_id
   LEFT JOIN marketing_preferences p ON p.client_id=u.id
   WHERE ((d.state='pending' AND d.retry_at<=?) OR (d.state='sending' AND d.updated_at<?))
   ORDER BY d.updated_at ASC LIMIT 12`).bind(time,time-600).all();
 let processed=0;
 const decipher=async value => {
  const [iv,body]=value.split('.');
  const key=await crypto.subtle.importKey('raw',Uint8Array.from(atob(env.FIDELITY_ENC_KEY),x=>x.charCodeAt(0)),'AES-GCM',false,['decrypt']);
  return new TextDecoder().decode(await crypto.subtle.decrypt({name:'AES-GCM',iv:Uint8Array.from(atob(iv),x=>x.charCodeAt(0))},key,Uint8Array.from(atob(body),x=>x.charCodeAt(0))));
 };
 for(const d of batch.results||[]){
  // Claim atomique: deux cron jobs concurrents ne récupèrent pas la même ligne.
  const lock=await db.prepare(`UPDATE marketing_deliveries SET state='sending',attempts=attempts+1,updated_at=?
    WHERE campaign_id=? AND client_id=?
    AND ((state='pending' AND retry_at<=?) OR (state='sending' AND updated_at<?))`)
    .bind(now(),d.campaign_id,d.client_id,time,time-600).run();
  if(lock.meta.changes!==1)continue;
  const subscription=await db.prepare('SELECT subscribed FROM marketing_preferences WHERE client_id=?').bind(d.client_id).first();
  if(subscription?.subscribed!==1){
   await db.prepare("UPDATE marketing_deliveries SET state='skipped',updated_at=? WHERE campaign_id=? AND client_id=?").bind(now(),d.campaign_id,d.client_id).run();
   continue;
  }
  try{
   const client={prenom:await decipher(d.prenom_chiffre),nom:await decipher(d.nom_chiffre),total_points:d.total_points};
   const email=await decipher(d.email_chiffre);
   const token=await signUnsubscribe(d.client_id,env.FIDELITY_INDEX_KEY);
   const link=unsubscribeLink('https://wizer-kin.com',d.client_id,token);
   const mail=renderEmail(d,client,link);
   // La clé demeure stable entre tentatives: pas de double courrier en cas d'erreur D1 après envoi.
   const response=await fetch('https://api.resend.com/emails',{
    method:'POST',headers:{Authorization:'Bearer '+env.RESEND_API_KEY,'Content-Type':'application/json',
      'Idempotency-Key':`wizer-${d.campaign_id}-${d.client_id}`},
    body:JSON.stringify({from:env.FIDELITY_EMAIL_FROM,to:[email],...mail,
       headers:{'List-Unsubscribe':`<${link}>`}})
   });
   if(response.ok){
    await db.prepare("UPDATE marketing_deliveries SET state='sent',updated_at=?,last_error=NULL WHERE campaign_id=? AND client_id=?")
      .bind(now(),d.campaign_id,d.client_id).run();processed++;
   }else{
    const retryable=response.status===429||response.status>=500;
    const attempts=d.attempts+1;
    const state=retryable&&attempts<4?'pending':'failed';
    const retry=now()+(response.status===429?3600:Math.min(3600,180*attempts));
    await db.prepare('UPDATE marketing_deliveries SET state=?,retry_at=?,updated_at=?,last_error=? WHERE campaign_id=? AND client_id=?')
     .bind(state,retry,now(),`Resend HTTP ${response.status}`,d.campaign_id,d.client_id).run();
    // Un quota dépassé: ne pas déclencher des requêtes inutiles pour le reste du lot.
    if(response.status===429)break;
   }
  }catch(e){
   const state=d.attempts+1<4?'pending':'failed';
   await db.prepare('UPDATE marketing_deliveries SET state=?,retry_at=?,updated_at=?,last_error=? WHERE campaign_id=? AND client_id=?')
    .bind(state,now()+Math.min(3600,180*(d.attempts+1)),now(),clean(e?.message),d.campaign_id,d.client_id).run();
  }
 }
 await db.prepare(`UPDATE marketing_campaigns SET status='completed' WHERE status='queued' AND id IN (
    SELECT id FROM marketing_campaigns c WHERE NOT EXISTS(
      SELECT 1 FROM marketing_deliveries d WHERE d.campaign_id=c.id AND d.state IN ('pending','sending')
    )
  )`).run();
 return {processed};
}
