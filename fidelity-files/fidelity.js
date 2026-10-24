'use strict';
const byId=id=>document.getElementById(id);
const forms=['login-form','register-form','forgot-form','reset-form'];
const api=async(path,data)=>{
 const options=data===undefined?{credentials:'same-origin'}:{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)};
 const res=await fetch('/api/fidelity/'+path,options);
 const obj=await res.json().catch(()=>({error:'Réponse inattendue du serveur'}));
 if(!res.ok)throw new Error(obj.error||'Impossible de contacter le service fidélité.');return obj;
};
const notice=(text,good=false)=>{const p=byId('message');p.textContent=text;p.classList.toggle('good',good);p.hidden=false;};
const quiet=()=>{byId('message').hidden=true;};
const choose=tab=>{quiet();byId('auth').hidden=false;byId('account').hidden=true;
 for(const f of forms)byId(f).hidden=f!==tab+'-form';
 byId('tab-login').classList.toggle('current',tab==='login');byId('tab-register').classList.toggle('current',tab==='register');
};
function script(url){return new Promise((resolve,reject)=>{
 const s=document.createElement('script');s.src=url;s.async=true;s.onload=resolve;s.onerror=()=>reject(new Error('Bibliothèque QR inaccessible. Réessayez avec une connexion Internet.'));document.head.append(s);
});}
let currentQR='';
async function account(data){
 byId('auth').hidden=true;byId('account').hidden=false;quiet();
 byId('welcome').textContent=`${data.prenom} ${data.nom}`;byId('points').textContent=String(data.points);currentQR=data.qr;
 const holder=byId('qr');holder.replaceChildren();
 try{
  if(!window.QRCode)await script('https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js');
  new QRCode(holder,{text:currentQR,width:212,height:212,colorDark:'#070707',colorLight:'#ffffff',correctLevel:QRCode.CorrectLevel.H});
 }catch(e){notice(e.message);}
}
async function sending(form,path,build,done){
 const btn=form.querySelector('[type=submit]');btn.disabled=true;const old=btn.textContent;btn.textContent='Traitement…';quiet();
 try{await done(await api(path,build(new FormData(form))));}catch(e){notice(e.message);}finally{btn.disabled=false;btn.textContent=old;}
}
byId('tab-login').addEventListener('click',()=>choose('login'));
byId('tab-register').addEventListener('click',()=>choose('register'));
byId('show-forgot').addEventListener('click',()=>choose('forgot'));
byId('forgot-back').addEventListener('click',()=>choose('login'));
byId('login-form').addEventListener('submit',e=>{e.preventDefault();sending(e.currentTarget,'login',f=>({email:f.get('email'),password:f.get('password')}),d=>account(d.account));});
byId('register-form').addEventListener('submit',e=>{e.preventDefault();sending(e.currentTarget,'register',f=>({prenom:f.get('prenom'),nom:f.get('nom'),telephone:f.get('telephone'),email:f.get('email'),password:f.get('password'),accept:f.get('accept')!==null}),d=>account(d.account));});
byId('forgot-form').addEventListener('submit',e=>{e.preventDefault();sending(e.currentTarget,'forgot',f=>({email:f.get('email')}),d=>notice(d.message,true));});
byId('reset-form').addEventListener('submit',e=>{e.preventDefault();const token=new URLSearchParams(location.search).get('reset');sending(e.currentTarget,'reset',f=>({token,password:f.get('password')}),()=>{history.replaceState(null,'',location.pathname);choose('login');notice('Mot de passe changé. Connectez-vous.',true);});});
byId('logout').addEventListener('click',async()=>{try{await api('logout',{});choose('login');notice('Déconnexion réussie.',true);}catch(e){notice(e.message);}});
byId('download').addEventListener('click',()=>{
 const img=byId('qr').querySelector('img'),canvas=byId('qr').querySelector('canvas');
 const url=(img&&img.src.startsWith('data:')?img.src:null)||(canvas?canvas.toDataURL('image/png'):null);
 if(!url){notice('QR code indisponible.');return;}
 const a=document.createElement('a');a.href=url;a.download='wizer-fidelity-qr.png';document.body.append(a);a.click();a.remove();
});
(async()=>{
 const reset=new URLSearchParams(location.search).get('reset');if(reset){choose('reset');return;}
 try{const d=await api('me');await account(d.account);}catch(_){choose('login');}
})();
