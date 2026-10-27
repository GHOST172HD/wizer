document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-year]').forEach((el) => { el.textContent = String(new Date().getFullYear()); });
  const menuToggle = document.querySelector('.menu-toggle');
  const mainMenu = document.querySelector('#main-menu');

  if (menuToggle && mainMenu) {
    menuToggle.addEventListener('click', () => {
      // Ouvre ou ferme le menu
      const isOpen = mainMenu.classList.toggle('open');
      
      // Anime le bouton hamburger en croix
      menuToggle.classList.toggle('active', isOpen);
      
      // Accessibilité : indique aux lecteurs d'écran l'état du menu
      menuToggle.setAttribute('aria-expanded', isOpen);
    });
  }
});