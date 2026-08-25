/*
  Galerie Wizer

  Catégories utilisées :
  - coiffure-tresse
  - manucure
  - pedicure
  - soins
  - avant-apres

  viewer: 'collection'
  → ouvre toutes les images ayant la même collectionKey.

  viewer: 'single'
  → agrandit seulement cette image.
*/

const GALLERY_ITEMS = [
  {
    id: 'coiffure-tresse-01',
    src: 'assets/images/galerie/coiffure-tresse-01.webp',
    category: 'coiffure-tresse',
    collectionKey: 'coiffure-tresse',
    viewer: 'collection',
  },
  {
    id: 'coiffure-tresse-02',
    src: 'assets/images/galerie/coiffure-tresse-02.webp',
    category: 'coiffure-tresse',
    collectionKey: 'coiffure-tresse',
    viewer: 'collection',
  },
  {
    id: 'coiffure-tresse-06',
    src: 'assets/images/galerie/lokkat.webp',
    category: 'coiffure-tresse',
    collectionKey: 'coiffure-tresse',
    viewer: 'collection',
  },
  {
    id: 'coiffure-tresse-04',
    src: 'assets/images/galerie/lookat.webp',
    category: 'coiffure-tresse',
    collectionKey: 'coiffure-tresse',
    viewer: 'collection',
  },
  {
    id: 'coiffure-tresse-03',
    src: 'assets/images/galerie/lookat4.webp',
    category: 'coiffure-tresse',
    collectionKey: 'coiffure-tresse',
    viewer: 'collection',
  },
  {
    id: 'coiffure-tresse-09',
    src: 'assets/images/galerie/looks-03.webp',
    category: 'coiffure-tresse',
    collectionKey: 'coiffure-tresse',
    viewer: 'collection',
  },

  {
    id: 'manucure-01',
    src: 'assets/images/galerie/manucure-01.webp',
    category: 'manucure',
    collectionKey: 'manucure',
    viewer: 'collection',
  },
  {
    id: 'manucure-02',
    src: 'assets/images/galerie/manucure-02.webp',
    category: 'manucure',
    collectionKey: 'manucure',
    viewer: 'collection',
  },
  {
    id: 'manucure-03',
    src: 'assets/images/galerie/manucure-03.webp',
    category: 'manucure',
    collectionKey: 'manucure',
    viewer: 'collection',
  },
  {
    id: 'manucure-04',
    src: 'assets/images/galerie/manucure-04.webp',
    category: 'manucure',
    collectionKey: 'manucure',
    viewer: 'collection',
  },
  {
    id: 'manucure-05',
    src: 'assets/images/galerie/manucure-05.webp',
    category: 'manucure',
    collectionKey: 'manucure',
    viewer: 'collection',
  },
  {
    id: 'manucure-06',
    src: 'assets/images/galerie/manucure-06.webp',
    category: 'manucure',
    collectionKey: 'manucure',
    viewer: 'collection',
  },
  {
    id: 'manucure-07',
    src: 'assets/images/galerie/manucure-07.webp',
    category: 'manucure',
    collectionKey: 'manucure',
    viewer: 'collection',
  },
  {
    id: 'manucure-08',
    src: 'assets/images/galerie/manucure-08.webp',
    category: 'manucure',
    collectionKey: 'manucure',
    viewer: 'collection',
  },
  {
    id: 'manucure-09',
    src: 'assets/images/galerie/manucure-09.webp',
    category: 'manucure',
    collectionKey: 'manucure',
    viewer: 'collection',
  },
  {
    id: 'manucure-10',
    src: 'assets/images/galerie/manucure-10.webp',
    category: 'manucure',
    collectionKey: 'manucure',
    viewer: 'collection',
  },
  {
    id: 'manucure-11',
    src: 'assets/images/galerie/manucure-11.webp',
    category: 'manucure',
    collectionKey: 'manucure',
    viewer: 'collection',
  },
  {
    id: 'manucure-12',
    src: 'assets/images/galerie/manucure-12.webp',
    category: 'manucure',
    collectionKey: 'manucure',
    viewer: 'collection',
  },
  {
    id: 'pedicure-1',
    src: 'assets/images/galerie/pied3.webp',
    category: 'pedicure',
    collectionKey: 'pedicure',
    viewer: 'collection',
  },
  {
    id: 'pedicure-2',
    src: 'assets/images/galerie/looks-04.webp',
    category: 'pedicure',
    collectionKey: 'pedicure',
    viewer: 'collection',
  },

  {
    id: 'soins-01',
    src: 'assets/images/galerie/soins-01.webp',
    category: 'soins',
    collectionKey: 'soins',
    viewer: 'collection',
  },
  {
    id: 'soins-02',
    src: 'assets/images/galerie/soins-02.webp',
    category: 'soins',
    collectionKey: 'soins',
    viewer: 'collection',
  },
  {
    id: 'soins-03',
    src: 'assets/images/galerie/soinstout.webp',
    category: 'soins',
    collectionKey: 'soins',
    viewer: 'collection',
  },
  {
    id: 'soins-04',
    src: 'assets/images/galerie/soinsjamb.webp',
    category: 'soins',
    collectionKey: 'soins',
    viewer: 'collection',
  },
  {
    id: 'soins-05',
    src: 'assets/images/galerie/soinpied.webp',
    category: 'soins',
    collectionKey: 'soins',
    viewer: 'collection',
  },
  {
    id: 'soins-06',
    src: 'assets/images/services/Soins.webp',
    category: 'soins',
    collectionKey: 'soins',
    viewer: 'collection',
  },
];
