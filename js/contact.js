const contactMain = document.querySelector('#contact-main');
const contactSalons = document.querySelector('#contact-salons');

function socialLink(label, url) {
  if (!url || url === '#') return '';
  return `<a class="text-link" href="${url}" target="_blank" rel="noopener">${label}</a>`;
}

if (contactMain) {
  contactMain.innerHTML = `
    <article class="card contact-card">
      <h3>WhatsApp principal</h3>
      <p>${SITE_CONTACT.mainPhone}</p>
      <a class="button" href="${whatsappHref(SITE_CONTACT.mainWhatsapp, 'Bonjour, je souhaite avoir des informations sur Wizer.')}" target="_blank" rel="noopener">Écrire sur WhatsApp</a>
    </article>
    <article class="card contact-card">
      <h3>Email</h3>
      <p>${SITE_CONTACT.email}</p>
      <a class="text-link" href="mailto:${SITE_CONTACT.email}">Envoyer un email</a>
    </article>
    <article class="card contact-card">
      <h3>Réseaux sociaux</h3>
      <p> </p>
      ${socialLink('Instagram', SITE_CONTACT.instagramUrl)}
      <p> </p>
      ${socialLink('TikTok', SITE_CONTACT.tiktokUrl)}
      <p> </p>
      ${socialLink('Facebook', SITE_CONTACT.facebookUrl)}
    </article>
  `;
}

if (contactSalons) {
  const activeSalons = typeof getActiveSalons === 'function' ? getActiveSalons() : SALONS.filter(salon => salon.active !== false);

  contactSalons.innerHTML = activeSalons.map(salon => {
    const status = getOpenStatus(salon);
    return `
      <article class="salon-card">
        <p class="eyebrow">${salon.district || salon.city || 'Salon'}</p>
        <h3>${salon.name}</h3>
        <p>${salon.address}</p>
        <p class="${status.open ? 'open' : 'closed'}">${status.text}</p>
        <p class="salon-meta">Téléphone : ${salon.phone}</p>
        <div class="actions">
          <a class="text-link" href="${whatsappHref(salon.whatsapp, `Bonjour, je souhaite contacter ${salon.name}.`)}" target="_blank" rel="noopener">WhatsApp</a>
          <a class="text-link" href="${directionsUrl(salon)}" target="_blank" rel="noopener">Itinéraire</a>
        </div>
      </article>
    `;
  }).join('');
}
