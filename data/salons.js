/*
  Données de localisation faciles à modifier.

  Tu ne dois pas ajouter un lien Google Business séparé.
  Mets simplement le lien Google Maps officiel du salon dans googleMapsUrl.

  Méthode simple :
  1. Crée ou ouvre la fiche du salon dans Google Business / Google Maps.
  2. Clique sur Partager.
  3. Copie le lien Google Maps.
  4. Colle-le dans googleMapsUrl.

  Pour la carte Leaflet et le calcul de distance, mets aussi lat et lng.
  Dans une URL Google Maps, tu peux parfois voir un morceau comme :
  @-4.32512,15.31288,17z
  Donc lat = -4.32512 et lng = 15.31288.
*/
const LOCATION_SETTINGS = {
  defaultCenter: [-4.347158431021283, 15.28376598585388],
  defaultZoom: 15,
  tileUrl: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  tileAttribution: '&copy; OpenStreetMap contributors'
};

/*
  IMPORTANT :
  - active: true  = le salon apparaît sur la carte, dans Contact et Réservation.
  - active: false = le salon reste enregistré mais est ignoré partout.
  Cela évite qu'une adresse d'exemple soit choisie comme "salon le plus proche".
*/
const SALONS = [
  {
    id: 'bandal',
    active: true,
    name: 'WIZER INSTITUT - Bandal',
    district: 'Funa',
    address: 'Nº 114, Rue Tumba, Quartier Bisengo, Commune de Bandalungwa, Kinshasa',
    city: 'Kinshasa',
    lat: -4.347158431021283,
    lng: 15.28376598585388,
    phone: '+243820068211',
    whatsapp: '243820068211',
    email: '',
    googleMapsUrl: 'https://maps.app.goo.gl/5Cyzsa9coMH7wuqN6',
    hours: {
      Monday: { open: '08:00', close: '18:30' },
      Tuesday: { open: '08:00', close: '18:30' },
      Wednesday: { open: '08:00', close: '18:30' },
      Thursday: { open: '08:00', close: '18:30' },
      Friday: { open: '08:00', close: '18:30' },
      Saturday: { open: '08:00', close: '18:30' },
      Sunday: { open: '13:00', close: '18:30' },
    }
  },
  {
    id: 'limete',
    active: false, // Exemple désactivé : active seulement quand les vraies données sont prêtes.
    name: 'Wizer — Limete',
    district: '',
    address: 'Adresse exemple, Limete, Kinshasa',
    city: 'Kinshasa',
    lat: -4.3576,
    lng: 15.3384,
    phone: '+243820068211',
    whatsapp: '243820068211',
    email: 'saintchristduga172@gmail.com',
    googleMapsUrl: '',
    hours: {
      monday: { open: '08:30', close: '18:00' },
      tuesday: { open: '08:30', close: '18:00' },
      wednesday: { open: '08:30', close: '18:00' },
      thursday: { open: '08:30', close: '18:00' },
      friday: { open: '08:30', close: '18:00' },
      saturday: { open: '09:00', close: '16:30' },
      sunday: null
    }
  },
  {
    id: 'ngaliema',
    active: false, // Exemple désactivé : active seulement quand les vraies données sont prêtes.
    name: 'Wizer — Ngaliema',
    district: '',
    address: 'Adresse exemple, Ngaliema, Kinshasa',
    city: 'Kinshasa',
    lat: -4.3428,
    lng: 15.2512,
    phone: '+243820068211',
    whatsapp: '243820068211',
    email: 'saintchristduga172@gmail.com',
    googleMapsUrl: '',
    hours: {
      monday: { open: '09:00', close: '17:30' },
      tuesday: { open: '09:00', close: '17:30' },
      wednesday: { open: '09:00', close: '17:30' },
      thursday: { open: '09:00', close: '17:30' },
      friday: { open: '09:00', close: '17:30' },
      saturday: { open: '09:00', close: '15:00' },
      sunday: null
    }
  }
];
