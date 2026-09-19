const menuToggle = document.querySelector('.menu-toggle');
const menu = document.querySelector('.main-menu');

if (menuToggle && menu) {
  menuToggle.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.textContent = open ? '✕' : '☰';

    // Synchronisation de l'animation du bouton Réserver
    const buttonBounce = menu.querySelector('.button-bounce');
    if (buttonBounce) {
      if (open) {
        // 1. On retire temporairement l'animation au cas où elle y était déjà
        buttonBounce.style.animation = 'none';
        
        // 2. On force un "reflow" (un rafraîchissement forcé pour le navigateur)
        buttonBounce.offsetHeight; 
        
        // 3. On réapplique l'animation propre sans le mot "infinite"
        buttonBounce.style.animation = 'bounce-top 1.5s ease-in-out both';
      } else {
        // Quand on ferme le menu, on nettoie le style
        buttonBounce.style.animation = 'none';
      }
    }
  });
}

document.querySelectorAll('[data-year]').forEach(el => el.textContent = new Date().getFullYear());
