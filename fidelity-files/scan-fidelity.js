'use strict';
const el=id=>document.getElementById(id);
const api=async(path,body)=>{
 const res=await fetch('/api/fidelity/'+path,body===undefined?{credentials:'same-origin'}:{credentials:'same-origin',method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
 const data=await res.json().catch(()=>({error:'Réponse illisible du serveur'}));
 if(!res.ok)throw new Error(data.error||'Opération impossible');return data;
};
function msg(text,good=false){const p=el('message');p.hidden=false;p.classList.toggle('good',good);p.textContent=text;}
function staffView(ok){el('staff-auth').hidden=ok;el('staff-app').hidden=!ok;if(!ok){el('customer').hidden=true;selected=null;}}
let scanner=null,running=false,selected=null,lock=false;
function loadScanner(){return new Promise((done,fail)=>{
 if(window.Html5Qrcode){done();return;}
 const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/html5-qrcode@2.3.8/html5-qrcode.min.js';s.async=true;
 s.onload=done;s.onerror=()=>fail(new Error('Module caméra inaccessible. Vérifiez la connexion.'));document.head.append(s);
});}
async function endCamera(){
 if(scanner&&running){try{await scanner.stop();}catch(_){/* device already stopped */}}
 running=false;el('stop-camera').disabled=true;el('start-camera').disabled=false;
 if(scanner){try{await scanner.clear();}catch(_){/* scan file may be active */}}
 scanner=null;
}
const looksLikeQR=value=>/^(WIZER-FIDELITY:V1:)?[a-f0-9]{64}$/.test((value||'').trim());
async function inspect(code){
 const cleaned=(code||'').trim();if(!looksLikeQR(cleaned)){msg('Ce QR code ne correspond pas à une carte Wizer.');return;}
 if(lock)return;lock=true;
 try{
  const data=await api('admin/lookup',{code:cleaned});selected=data.client;
  el('customer-name').textContent=`${selected.prenom} ${selected.nom}`;
  el('customer-points').textContent=String(selected.points);el('customer').hidden=false;
  msg('Carte reconnue. Vérifiez le client puis attribuez son point.',true);
  if(running)await endCamera();
 }catch(e){msg(e.message);el('customer').hidden=true;selected=null;}finally{lock=false;}
}
el('staff-form').addEventListener('submit',async e=>{
 e.preventDefault();const form=e.currentTarget,password=new FormData(form).get('password');
 el('loading').hidden=false;el('message').hidden=true;
 try{await api('admin/login',{password});form.reset();staffView(true);msg('Accès agent validé.',true);}catch(e){msg(e.message);}finally{el('loading').hidden=true;}
});
el('start-camera').addEventListener('click',async()=>{
 try{
  await loadScanner();el('start-camera').disabled=true;
  scanner=new Html5Qrcode('reader');
  await scanner.start({facingMode:'environment'},{fps:8,qrbox:{width:245,height:245}},code=>{inspect(code);},()=>{});
  running=true;el('stop-camera').disabled=false;
 }catch(e){msg('Caméra indisponible ou accès refusé. Essayez une photo.');await endCamera();}
});
el('stop-camera').addEventListener('click',()=>endCamera());
el('scan-file').addEventListener('change',async e=>{
 const file=e.target.files?.[0];if(!file)return;
 try{await loadScanner();await endCamera();scanner=new Html5Qrcode('reader');const code=await scanner.scanFile(file,true);await inspect(code);}catch(_){msg('QR code non détecté dans cette image.');}finally{e.target.value='';}
});
el('manual-form').addEventListener('submit',e=>{e.preventDefault();inspect(new FormData(e.currentTarget).get('code'));});
el('cancel').addEventListener('click',()=>{selected=null;el('customer').hidden=true;});
el('award').addEventListener('click',async()=>{
 if(!selected||lock)return;lock=true;const button=el('award');button.disabled=true;
 try{
  const d=await api('admin/award',{reference:selected.reference,operation_id:crypto.randomUUID()});
  el('customer-points').textContent=String(d.points);selected.points=d.points;msg(d.message,true);el('customer').hidden=true;selected=null;
 }catch(e){msg(e.message);}finally{button.disabled=false;lock=false;}
});
el('staff-logout').addEventListener('click',async()=>{
 await endCamera();try{await api('admin/logout',{});}catch(_){}staffView(false);msg('Session agent terminée.',true);
});
(async()=>{try{await api('admin/me');staffView(true);}catch(_){staffView(false);}})();
