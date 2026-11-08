'use strict';
const byId=id=>document.getElementById(id);
async function agentApi(path,body){
  const response=await fetch('/api/fidelity/'+path, body===undefined
    ? {credentials:'same-origin'}
    : {method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
  const data=await response.json().catch(()=>({error:'Réponse illisible du serveur.'}));
  if(!response.ok){const error=new Error(data.error||'Opération impossible.');error.status=response.status;throw error;}
  return data;
}
function notify(message,ok=false){
  const target=byId('agent-message');target.textContent=message;target.hidden=false;target.classList.toggle('good',ok);
}
function setAccess(connected){byId('agent-auth').hidden=connected;byId('agent-dashboard').hidden=!connected;}
byId('agent-form').addEventListener('submit',async event=>{
  event.preventDefault();const form=event.currentTarget,button=form.querySelector('[type=submit]');
  button.disabled=true;byId('agent-message').hidden=true;
  try{
    await agentApi('admin/login',{password:new FormData(form).get('password')});
    form.reset();setAccess(true);
  }catch(error){notify(error.message);}
  finally{button.disabled=false;}
});
byId('agent-logout').addEventListener('click',async()=>{
  const button=byId('agent-logout');button.disabled=true;byId('agent-message').hidden=true;
  try{await agentApi('admin/logout',{});setAccess(false);notify('Déconnexion effectuée.',true);}
  catch(error){notify(error.message);}
  finally{button.disabled=false;}
});
(async()=>{
  try{await agentApi('admin/me');setAccess(true);}
  catch(error){setAccess(false);if(error.status!==401)notify(error.message);}
  finally{byId('agent-loading').hidden=true;}
})();
