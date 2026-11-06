'use strict';
const el=id=>document.getElementById(id);
async function call(path,data){
 const res=await fetch('/api/fidelity/'+path,data===undefined?{credentials:'same-origin'}:{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
 const answer=await res.json().catch(()=>({error:'Réponse serveur illisible.'}));
 if(!res.ok)throw Error(answer.error||'Opération impossible.');return answer;
}
function feedback(message,success=false){const e=el('market-message');e.textContent=message;e.hidden=false;e.classList.toggle('good',success);e.scrollIntoView({behavior:'smooth',block:'nearest'});}
function view(authorized){el('market-auth').hidden=authorized;el('market-app').hidden=!authorized;}
function substitute(text){return String(text||'').replace(/\{\{\s*(prenom|nom|points)\s*\}\}/gi,(_,k)=>({prenom:'Marie',nom:'Exemple',points:'6'})[k.toLowerCase()]);}
function preview(){
 el('preview-subject').textContent=substitute(el('campaign-subject').value);
 el('preview-message').textContent=substitute(el('campaign-message').value);
 el('preview-button').textContent=substitute(el('campaign-button-label').value);
 const link=el('campaign-button-url').value.trim();
 el('preview-button').href=/^https:\/\//i.test(link)?link:'https://wizer-kin.com/';
}
async function overview(){
 const data=await call('admin/marketing/overview');
 el('stat-registered').textContent=data.registered;el('stat-subscribed').textContent=data.subscribed;
 const list=el('campaign-list');list.replaceChildren();
 if(!data.campaigns.length){const p=document.createElement('p');p.className='market-empty';p.textContent='Aucune campagne pour le moment.';list.append(p);return;}
 for(const c of data.campaigns){
  const article=document.createElement('article'),h=document.createElement('strong'),details=document.createElement('small');article.className='market-campaign';
  h.textContent=c.subject;details.textContent=`${new Date(c.created_at*1000).toLocaleString('fr-CD')} · ${c.sent} envoyé(s), ${c.pending} en attente, ${c.failed} en échec, ${c.skipped} ignoré(s) / ${c.total}`;
  article.append(h,details);list.append(article);
 }
}
el('market-login').addEventListener('submit',async e=>{
 e.preventDefault();const form=e.currentTarget,button=form.querySelector('[type=submit]');button.disabled=true;
 try{await call('admin/login',{password:new FormData(form).get('password')});form.reset();view(true);await overview();feedback('Accès autorisé.',true);}catch(error){feedback(error.message);}finally{button.disabled=false;}
});
el('market-logout').addEventListener('click',async()=>{try{await call('admin/logout',{});}finally{view(false);feedback('Déconnexion effectuée.',true);}});
el('refresh-campaigns').addEventListener('click',()=>overview().catch(e=>feedback(e.message)));
for(const id of ['campaign-subject','campaign-message','campaign-button-label','campaign-button-url'])el(id).addEventListener('input',preview);
for(const b of document.querySelectorAll('[data-token]'))b.addEventListener('click',()=>{
 const input=el('campaign-message'),t=b.dataset.token,start=input.selectionStart,end=input.selectionEnd;
 input.value=input.value.slice(0,start)+t+input.value.slice(end);input.focus();input.setSelectionRange(start+t.length,start+t.length);preview();
});
el('campaign-form').addEventListener('submit',async e=>{
 e.preventDefault();const button=el('campaign-send');
 const data={subject:el('campaign-subject').value,message:el('campaign-message').value,button_label:el('campaign-button-label').value,button_url:el('campaign-button-url').value};
 if(!/^https:\/\//i.test(data.button_url)){feedback('Le bouton doit avoir une URL HTTPS.');return;}
 const count=el('stat-subscribed').textContent;
 if(!confirm(`Envoyer cette campagne personnalisée aux ${count} abonnés actuellement consentants ?\n\nLa campagne ne pourra plus être annulée après confirmation.`))return;
 button.disabled=true;button.textContent='Préparation de la campagne…';
 try{const answer=await call('admin/marketing/campaign',data);feedback(`${answer.queued} email(s) mis en file d'attente. Les envois sont automatisés et visibles dans le suivi.`,true);await overview();}
 catch(error){feedback(error.message);}finally{button.disabled=false;button.textContent='Envoyer aux clientes abonnées';}
});
preview();
(async()=>{try{await call('admin/me');view(true);await overview();}catch(_){view(false);}})();
