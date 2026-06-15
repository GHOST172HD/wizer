const galleryGrid = document.querySelector('#gallery-grid');
const filters = document.querySelector('#gallery-filters');
const socialGrid = document.querySelector('#social-grid');

const labels = {
  all: 'Tout',
  coiffure: 'Coiffure',
  manucure: 'Manucure',
  pedicure: 'Pédicure',
  'avant-apres': 'Avant / Après',
  soins: 'Soins'
};

let currentFilter = 'all';
let lightboxItems = [];
let lightboxIndex = 0;
let touchStartX = 0;
let touchStartY = 0;

function escapeHTML(value = '') {
  return String(value).replace(/[&<>'"]/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#039;',
    '"': '&quot;'
  }[char]));
}

function renderGallery(category = 'all') {
  if (!galleryGrid) return;

  const items = GALLERY_ITEMS.filter(item => category === 'all' || item.category === category);

  galleryGrid.innerHTML = items.map(item => `
    <button class="gallery-tile" type="button" data-gallery-id="${escapeHTML(item.id)}" aria-label="Agrandir ${escapeHTML(item.alt)}">
      <img loading="lazy" src="${escapeHTML(item.src)}" alt="${escapeHTML(item.alt)}">
      <span class="gallery-tile__tag">${item.viewer === 'single' ? 'Focus' : 'Collection'}</span>
    </button>
  `).join('');
}

function getItemById(id) {
  return GALLERY_ITEMS.find(item => item.id === id);
}

function getLightboxCollection(item) {
  if (!item) return [];

  if (item.viewer === 'single') {
    return [item];
  }

  const key = item.collectionKey || item.category;
  return GALLERY_ITEMS.filter(candidate => (candidate.collectionKey || candidate.category) === key);
}

function getModal() {
  let modal = document.querySelector('#gallery-modal');
  if (modal) return modal;

  modal = document.createElement('div');
  modal.id = 'gallery-modal';
  modal.className = 'gallery-modal';
  modal.setAttribute('aria-hidden', 'true');
  modal.innerHTML = `
    <div class="gallery-modal__backdrop" data-gallery-close></div>
    <div class="gallery-modal__shell" role="dialog" aria-modal="true" aria-label="Aperçu de la galerie">
      <button class="gallery-modal__close" type="button" data-gallery-close aria-label="Fermer">×</button>
      <button class="gallery-modal__nav gallery-modal__nav--prev" type="button" data-gallery-prev aria-label="Image précédente" data-viewer-prev>‹</button>
      <div class="gallery-modal__stage">
        <button class="gallery-modal__side gallery-modal__side--prev" type="button" data-gallery-prev aria-label="Image précédente" data-viewer-prev></button>
        <figure class="gallery-modal__center" data-gallery-center aria-label="Image suivante"></figure>
        <button class="gallery-modal__side gallery-modal__side--next" type="button" data-gallery-next aria-label="Image suivante" data-viewer-next></button>
      </div>
      <button class="gallery-modal__nav gallery-modal__nav--next" type="button" data-gallery-next aria-label="Image suivante" data-viewer-next>›</button>
      <p class="gallery-modal__counter" data-gallery-counter></p>
    </div>
  `;
  document.body.appendChild(modal);

  modal.addEventListener('click', event => {
    if (event.target.closest('[data-gallery-close]')) closeLightbox();
    if (event.target.closest('[data-gallery-prev]')) goLightbox(-1);
    if (event.target.closest('[data-gallery-next]')) goLightbox(1);
    if (event.target.closest('[data-gallery-center]') && lightboxItems.length > 1) goLightbox(1);
  });

  modal.addEventListener('touchstart', event => {
    touchStartX = event.changedTouches[0].clientX;
    touchStartY = event.changedTouches[0].clientY;
  }, { passive: true });

  modal.addEventListener('touchend', event => {
    const touch = event.changedTouches[0];
    const diffX = touch.clientX - touchStartX;
    const diffY = touch.clientY - touchStartY;

    if (Math.abs(diffX) > 45 && Math.abs(diffX) > Math.abs(diffY)) {
      goLightbox(diffX > 0 ? -1 : 1);
    }
  }, { passive: true });

  return modal;
}

function imageMarkup(item) {
  return item ? `<img src="${escapeHTML(item.src)}" alt="${escapeHTML(item.alt)}">` : '';
}

function renderLightbox() {
  const modal = getModal();
  const current = lightboxItems[lightboxIndex];
  const previous = lightboxItems[(lightboxIndex - 1 + lightboxItems.length) % lightboxItems.length];
  const next = lightboxItems[(lightboxIndex + 1) % lightboxItems.length];
  const hasMany = lightboxItems.length > 1;

  modal.querySelector('[data-gallery-center]').innerHTML = `
    <img src="${escapeHTML(current.src)}" alt="${escapeHTML(current.alt)}">
    <figcaption>
      <strong>${escapeHTML(current.title || current.alt)}</strong>
      <span>${escapeHTML(labels[current.category] || current.category)}</span>
    </figcaption>
  `;

  modal.querySelector('.gallery-modal__side--prev').innerHTML = hasMany ? imageMarkup(previous) : '';
  modal.querySelector('.gallery-modal__side--next').innerHTML = hasMany ? imageMarkup(next) : '';
  modal.querySelector('[data-gallery-counter]').textContent = hasMany
    ? `${lightboxIndex + 1} / ${lightboxItems.length} · Clique l’image centrale ou swipe pour avancer`
    : 'Image unique';

  modal.querySelectorAll('[data-gallery-prev], [data-gallery-next]').forEach(button => {
    button.hidden = !hasMany;
  });
}

function openLightbox(item) {
  lightboxItems = getLightboxCollection(item);
  lightboxIndex = Math.max(0, lightboxItems.findIndex(candidate => candidate.id === item.id));

  if (!lightboxItems.length) return;

  const modal = getModal();
  renderLightbox();
  modal.classList.add('is-open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
}

function closeLightbox() {
  const modal = getModal();
  modal.classList.remove('is-open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
}

function goLightbox(direction) {
  if (lightboxItems.length <= 1) return;
  lightboxIndex = (lightboxIndex + direction + lightboxItems.length) % lightboxItems.length;
  renderLightbox();
}

if (filters) {
  filters.innerHTML = Object.entries(labels).map(([key, label]) => `
    <button class="filter-button ${key === 'all' ? 'active' : ''}" data-filter="${key}" type="button">${label}</button>
  `).join('');

  filters.addEventListener('click', event => {
    const button = event.target.closest('[data-filter]');
    if (!button) return;

    currentFilter = button.dataset.filter;
    filters.querySelectorAll('.filter-button').forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    renderGallery(currentFilter);
  });

  renderGallery();
}

if (galleryGrid) {
  galleryGrid.addEventListener('click', event => {
    const tile = event.target.closest('[data-gallery-id]');
    if (!tile) return;

    const item = getItemById(tile.dataset.galleryId);
    openLightbox(item);
  });
}

document.addEventListener('keydown', event => {
  const modal = document.querySelector('#gallery-modal.is-open');
  if (!modal) return;

  if (event.key === 'Escape') closeLightbox();
  if (event.key === 'ArrowRight') goLightbox(1);
  if (event.key === 'ArrowLeft') goLightbox(-1);
});

if (socialGrid) {
  socialGrid.innerHTML = SOCIAL_ITEMS.map(item => {
    if (item.type === 'tiktok' && item.videoId) {
      return `
        <article class="social-card">
          <h3>${escapeHTML(item.title)}</h3>
          <iframe loading="lazy" src="https://www.tiktok.com/player/v1/${escapeHTML(item.videoId)}?autoplay=0&loop=0" allow="encrypted-media; fullscreen" title="${escapeHTML(item.title)}"></iframe>
          <a class="text-link" href="${escapeHTML(item.url)}" target="_blank" rel="noopener">Ouvrir sur TikTok →</a>
        </article>
      `;
    }

    return `
      <article class="social-card">
        <h3>${escapeHTML(item.title)}</h3>
        <div class="embed-placeholder">Ajoute ici le code d’intégration d’une publication Instagram publique.<br><small>Consulte README.md pour la méthode.</small></div>
      </article>
    `;
  }).join('');
}
