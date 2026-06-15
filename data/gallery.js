/*
  Galerie Wizer
  - viewer: 'collection' => l'image ouvre toutes les images de la même collectionKey.
  - viewer: 'single'     => l'image s'agrandit seule, sans carousel.
  - collectionKey sert à regrouper des images même si tu changes leur catégorie.
*/
const GALLERY_ITEMS = [
  {
    id: 'coiffure-01',
    src: 'assets/images/galerie/look-01.svg',
    alt: 'Exemple de coiffure',
    category: 'coiffure',
    collectionKey: 'coiffure',
    viewer: 'collection',
    title: 'Exemple de coiffure'
  },
  {
    id: 'manucure-02',
    src: 'assets/images/galerie/look-02.svg',
    alt: 'Exemple de manucure',
    category: 'manucure',
    collectionKey: 'manucure',
    viewer: 'collection',
    title: 'Exemple de manucure'
  },
  {
    id: 'coiffure-03',
    src: 'assets/images/galerie/look-03.svg',
    alt: 'Exemple de tresses',
    category: 'coiffure',
    collectionKey: 'coiffure',
    viewer: 'collection',
    title: 'Exemple de tresses'
  },
  {
    id: 'pedicure-04',
    src: 'assets/images/galerie/look-04.svg',
    alt: 'Exemple de pédicure',
    category: 'pedicure',
    collectionKey: 'pedicure',
    viewer: 'collection',
    title: 'Exemple de pédicure'
  },
  {
    id: 'avant-apres-05',
    src: 'assets/images/galerie/look-05.svg',
    alt: 'Exemple avant après',
    category: 'avant-apres',
    collectionKey: 'avant-apres',
    viewer: 'single',
    title: 'Exemple avant après'
  },
  {
    id: 'soins-06',
    src: 'assets/images/galerie/look-06.svg',
    alt: 'Exemple de soin',
    category: 'soins',
    collectionKey: 'soins',
    viewer: 'single',
    title: 'Exemple de soin'
  }
];
