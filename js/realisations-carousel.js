/*
  Carrousel "Un aperçu de nos réalisations" — page d'accueil uniquement.
  Duplique une seule fois les images de chaque ligne : la ligne obtient alors
  exactement deux fois sa largeur d'origine, ce qui permet à l'animation CSS
  (translateX(0) -> translateX(-50%), voir css/realisations-carousel.css) de
  boucler sans aucune coupure visible.
*/
document.addEventListener('DOMContentLoaded', () => {
  const tracks = document.querySelectorAll('.realisations-track');
  if (!tracks.length) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return; // pas d'animation : pas besoin de doubler les images

  tracks.forEach(track => {
    const originalImages = [...track.children];
    originalImages.forEach(img => {
      track.appendChild(img.cloneNode(true));
    });
  });
});
