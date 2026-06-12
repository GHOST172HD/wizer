const galleryGrid=document.querySelector('#gallery-grid');
const filters=document.querySelector('#gallery-filters');
const socialGrid=document.querySelector('#social-grid');
const labels={all:'Tout',coiffure:'Coiffure',manucure:'Manucure',pedicure:'Pédicure','avant-apres':'Avant / Après',soins:'Soins'};
function renderGallery(category='all'){galleryGrid.innerHTML=GALLERY_ITEMS.filter(item=>category==='all'||item.category===category).map(item=>`<img loading="lazy" src="${item.src}" alt="${item.alt}">`).join('');
}if(filters){filters.innerHTML=Object.entries(labels).map(([key,label])=>`<button class="filter-button ${key==='all'?'active':''}" data-filter="${key}" type="button">${label}</button>`).join('');
filters.addEventListener('click',event=>{const button=event.target.closest('[data-filter]');
    if(!button)return;filters.querySelectorAll('.filter-button').forEach(btn=>btn.classList.remove('active'));button.classList.add('active');renderGallery(button.dataset.filter);
});
renderGallery();
}if(socialGrid){socialGrid.innerHTML=SOCIAL_ITEMS.map(item=>{if(item.type==='tiktok'&&item.videoId){return `<article class="social-card"><h3>${item.title}</h3><iframe loading="lazy" src="https://www.tiktok.com/player/v1/${item.videoId}?autoplay=0&loop=0" allow="encrypted-media; fullscreen" title="${item.title}"></iframe><a class="text-link" href="${item.url}" target="_blank" rel="noopener">Ouvrir sur TikTok →</a></article>`;
}return `<article class="social-card"><h3>${item.title}</h3><div class="embed-placeholder">Ajoute ici le code d’intégration d’une publication Instagram publique.<br><small>Consulte README.md pour la méthode.</small></div></article>`;
}).join('')
;}
