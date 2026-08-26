const mainWhatsapp = (typeof SITE_CONTACT !== 'undefined' && SITE_CONTACT.mainWhatsapp) ? SITE_CONTACT.mainWhatsapp : '243820068211';
const salonSelect = document.querySelector('#booking-salon');
const serviceSelect = document.querySelector('#booking-service');
const form = document.querySelector('#booking-form');
const ACTIVE_SALONS = typeof getActiveSalons === 'function' ? getActiveSalons() : SALONS.filter(salon => salon.active !== false);

if (salonSelect) {
  salonSelect.innerHTML = '<option value="">Choisir un salon</option>'
    + ACTIVE_SALONS.map(salon => `<option value="${salon.id}">${salon.name}</option>`).join('');
}

if (serviceSelect) {
  serviceSelect.innerHTML = '<option value="">Choisir un service</option>'
    + SERVICES.flatMap(group => group.items.map(item => `
      <option value="${item.name}">${group.category} — ${item.name}</option>
    `)).join('');
}

const params = new URLSearchParams(location.search);
if (params.get('salon') && salonSelect) salonSelect.value = params.get('salon');
if (params.get('service') && serviceSelect) serviceSelect.value = params.get('service');

if (form) {
  form.addEventListener('submit', event => {
    event.preventDefault();

    const data = new FormData(form);
    const salon = ACTIVE_SALONS.find(s => s.id === data.get('salon'));
    const targetWhatsapp = salon?.whatsapp || mainWhatsapp;

    const message = [
      'Bonjour, je souhaite réserver.',
      '',
      `Nom : ${data.get('name')}`,
      `Téléphone : ${data.get('phone')}`,
      '',
      `Salon : ${salon ? salon.name : data.get('salon')}`,
      '',
      `Service : ${data.get('service')}`,
      '',
      `Date : ${data.get('date') ? data.get('date').split('-').reverse().join('/') : ''}`,
      '',
      `Heure : ${data.get('time')}`,
      '',
      `Message et précision : ${data.get('message') || 'Aucun'}`
    ].join('\n');

    const url = typeof whatsappHref === 'function'
      ? whatsappHref(targetWhatsapp, message)
      : `https://wa.me/${targetWhatsapp}?text=${encodeURIComponent(message)}`;

    window.open(url, '_blank', 'noopener');
  });
}
