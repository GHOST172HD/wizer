const MAIN_WHATSAPP='243976938179';
const salonSelect=document.querySelector('#booking-salon');
const serviceSelect=document.querySelector('#booking-service');
const form=document.querySelector('#booking-form');
salonSelect.innerHTML='<option value="">Choisir un salon</option>'+SALONS.map(s=>`<option value="${s.id}">${s.name}</option>`).join('');serviceSelect.innerHTML='<option value="">Choisir un service</option>'+SERVICES.flatMap(group=>group.items.map(item=>`<option value="${item.name}">${group.category} — ${item.name}</option>`)).join('');
const params=new URLSearchParams(location.search);
if(params.get('salon'))salonSelect.value=params.get('salon');
if(params.get('service'))serviceSelect.value=params.get('service');
form.addEventListener
(
    'submit',event=>{event.preventDefault();
    const data=new FormData(form);const salon=SALONS.find(s=>s.id===data.get('salon'));
    const text=`Bonjour, je souhaite réserver.%0A%0ANom : ${data.get('name')}%0ATéléphone : ${data.get('phone')}%0ASalon : ${salon?salon.name:data.get('salon')}%0AService : ${data.get('service')}%0ADate : ${data.get('date')}%0AHeure : ${data.get('time')}%0AMessage : ${data.get('message')||'Aucun'}`;
    window.open(`https://wa.me/${MAIN_WHATSAPP}?text=${text}`,'_blank','noopener');
});
