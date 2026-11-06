'use strict';
const params=new URLSearchParams(location.search),id=params.get('id'),token=params.get('token');
const message=document.getElementById('unsubscribe-message'),btn=document.getElementById('unsubscribe-confirm');
function notice(text,good=false){message.hidden=false;message.textContent=text;message.classList.toggle('good',good);}
if(!/^[0-9a-f-]{36}$/.test(id||'')||!/^[a-f0-9]{64}$/.test(token||'')){
 btn.disabled=true;notice('Ce lien est incomplet ou invalide. Vous pouvez aussi vous désabonner dans votre compte Fidelity.');
}
btn.addEventListener('click',async()=>{
 btn.disabled=true;
 try{
  const response=await fetch('/api/fidelity/marketing/unsubscribe',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({id,token})});
  const data=await response.json();if(!response.ok)throw Error(data.error||'Impossible de se désabonner.');
  notice('Vous ne recevrez plus d’emails promotionnels Wizer. Votre carte fidélité reste active.',true);
  history.replaceState(null,'',location.pathname);
 }catch(e){notice(e.message);btn.disabled=false;}
});
