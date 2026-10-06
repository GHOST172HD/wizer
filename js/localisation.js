const mapElement = document.querySelector('#map');
const list = document.querySelector('#salons-list');
const locateButton = document.querySelector('#locate-button');
const statusMessage = document.querySelector('#location-status');
const mapTileStatus = document.querySelector('#map-tile-status');

let map = null;
let userMarker = null;
let userAccuracyCircle = null;
let nearestLine = null;
let currentNearestSalonId = null;

const salonMarkers = new Map();

function setStatus(message, type = '') {
  if (!statusMessage) return;
  statusMessage.textContent = message;
  statusMessage.dataset.status = type;
}

function setMapTileStatus(message) {
  if (!mapTileStatus) return;
  if (!message) {
    mapTileStatus.hidden = true;
    mapTileStatus.textContent = '';
    mapTileStatus.removeAttribute('data-status');
    return;
  }
  mapTileStatus.hidden = false;
  mapTileStatus.textContent = message;
  mapTileStatus.dataset.status = 'error';
}

// Fournisseurs de tuiles, du principal au filet de secours. Esri "Light Gray Canvas"
// est utilisé en premier : contrairement à tile.openstreetmap.org (serveur gratuit mais
// explicitement déconseillé par OpenStreetMap pour un usage commercial en production, et
// qui peut bloquer l'accès sans prévenir en cas de pic de charge), ce fond de carte Esri
// est prévu pour l'affichage public de sites comme celui-ci, sans clé API. En dernier
// recours uniquement, si Esri devient indisponible, on retombe sur OpenStreetMap.
const TILE_PROVIDERS = [
  {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    maxZoom: 16,
    attribution: '&copy; <a href="https://www.esri.com" target="_blank" rel="noopener">Esri</a>, HERE, Garmin, &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors'
  },
  {
    url: LOCATION_SETTINGS.tileUrl,
    maxZoom: 19,
    attribution: LOCATION_SETTINGS.tileAttribution
  }
];

function validActiveSalons() {
  const activeSalons = typeof getActiveSalons === 'function'
    ? getActiveSalons()
    : (Array.isArray(SALONS) ? SALONS.filter(salon => salon.active !== false) : []);

  return activeSalons.filter(hasCoordinates);
}

let activeTileLayer = null;
let tileProviderIndex = 0;

// Installe le fournisseur de tuiles à l'index donné. Si une tuile échoue à charger, on
// retente une seule fois (connexion lente/instable). Si plusieurs tuiles échouent malgré
// le retry, le fournisseur actif est considéré indisponible : on bascule automatiquement
// sur le suivant dans TILE_PROVIDERS. Seul l'épuisement de tous les fournisseurs affiche
// un message, sans jamais bloquer le reste de la page (liste des salons, Google Maps…).
function attachTileProvider(index) {
  const provider = TILE_PROVIDERS[index];
  if (!provider || !map) return;

  if (activeTileLayer) {
    activeTileLayer.remove();
  }

  tileProviderIndex = index;
  let tilesFailedAfterRetry = 0;

  activeTileLayer = L.tileLayer(provider.url, {
    maxZoom: provider.maxZoom,
    attribution: provider.attribution
  }).addTo(map);

  activeTileLayer.on('tileerror', event => {
    const tile = event.tile;
    if (!tile) return;

    if (tile.dataset.wizerRetried === '1') {
      tilesFailedAfterRetry += 1;
      if (tilesFailedAfterRetry >= 3) {
        const nextIndex = tileProviderIndex + 1;
        if (nextIndex < TILE_PROVIDERS.length) {
          attachTileProvider(nextIndex);
        } else {
          setMapTileStatus('La carte interactive est momentanément indisponible. Utilisez la liste des salons ci-dessous ou le lien Google Maps pour vous y rendre.');
        }
      }
      return;
    }

    tile.dataset.wizerRetried = '1';
    const base = tile.src.split('?')[0];
    window.setTimeout(() => {
      tile.src = `${base}?retry=${Date.now()}`;
    }, 1200);
  });

  activeTileLayer.on('tileload', () => {
    tilesFailedAfterRetry = 0;
    setMapTileStatus(null);
  });
}

function createMap() {
  if (!mapElement) {
    console.error('Carte impossible : élément #map introuvable.');
    return false;
  }

  if (typeof L === 'undefined') {
    setStatus('La carte ne s’est pas chargée. Vérifiez votre connexion Internet.', 'error');
    console.error('Leaflet (L) est introuvable.');
    return false;
  }

  const configuredCenter = Array.isArray(LOCATION_SETTINGS?.defaultCenter)
    ? LOCATION_SETTINGS.defaultCenter.map(Number)
    : [-4.325, 15.31];

  const centerIsValid = configuredCenter.length === 2
    && configuredCenter.every(Number.isFinite);

  const center = centerIsValid ? configuredCenter : [-4.325, 15.31];
  const zoom = Number.isFinite(Number(LOCATION_SETTINGS?.defaultZoom))
    ? Number(LOCATION_SETTINGS.defaultZoom)
    : 12;

  map = L.map(mapElement, {
    zoomControl: true,
    attributionControl: true
  }).setView(center, zoom);

  attachTileProvider(0);

  map.whenReady(() => {
    window.setTimeout(() => map.invalidateSize(), 100);
  });

  window.addEventListener('resize', () => {
    window.clearTimeout(window.__wizerMapResizeTimer);
    window.__wizerMapResizeTimer = window.setTimeout(() => {
      if (map) map.invalidateSize();
    }, 180);
  });

  return true;
}

function salonMarkerStyle(isNearest = false) {
  return {
    radius: isNearest ? 11 : 8,
    color: isNearest ? '#fff1f8' : '#ff9cca',
    weight: isNearest ? 3 : 2,
    fillColor: isNearest ? '#ff3f98' : '#d9468b',
    fillOpacity: 0.96
  };
}

function userMarkerStyle() {
  return {
    radius: 9,
    color: '#ffffff',
    weight: 3,
    fillColor: '#4da3ff',
    fillOpacity: 1
  };
}

function popupMarkup(salon, nearest = false) {
  const status = getOpenStatus(salon);

  return `
    <div class="map-popup">
      ${nearest ? '<strong class="map-popup__nearest">Salon le plus proche</strong><br>' : ''}
      <strong>${salon.name}</strong><br>
      ${salon.address}<br>
      <span class="${status.open ? 'open' : 'closed'}">${status.text}</span><br>
      <a href="${directionsUrl(salon)}" target="_blank" rel="noopener">Ouvrir dans Google Maps</a>
    </div>
  `;
}

function createSalonMarkers() {
  if (!map) return;

  salonMarkers.forEach(marker => marker.remove());
  salonMarkers.clear();

  const salons = validActiveSalons();

  salons.forEach(salon => {
    const marker = L.circleMarker(
      [Number(salon.lat), Number(salon.lng)],
      salonMarkerStyle(false)
    )
      .addTo(map)
      .bindPopup(popupMarkup(salon, false));

    marker.on('click', () => {
      focusOnSalon(salon, true);
    });

    salonMarkers.set(salon.id, marker);
  });

  if (salons.length === 1) {
    map.setView([Number(salons[0].lat), Number(salons[0].lng)], 15);
  } else if (salons.length > 1) {
    const bounds = L.latLngBounds(
      salons.map(salon => [Number(salon.lat), Number(salon.lng)])
    );
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
  }
}

// La distance vient du calcul haversine (ligne droite, "à vol d'oiseau") appliqué à la
// position GPS brute du navigateur. Cette position a elle-même une marge d'erreur
// (`accuracyMeters`, fournie par l'API de géolocalisation) : l'afficher à côté de la
// distance évite de donner une fausse impression de précision (ex. "0.1 km" alors que
// la position peut être incertaine de plusieurs dizaines ou centaines de mètres), et
// précise que ce n'est pas une distance par la route.
function formatDistanceWithMargin(distanceKm, accuracyMeters) {
  if (!Number.isFinite(distanceKm)) return '';
  const base = `${distanceKm.toFixed(1)} km à vol d'oiseau`;
  if (!Number.isFinite(accuracyMeters) || accuracyMeters <= 0) return base;
  const marginKm = accuracyMeters / 1000;
  const marginText = marginKm < 1 ? marginKm.toFixed(2) : marginKm.toFixed(1);
  return `${base} (marge d'erreur ≈ ± ${marginText} km, précision GPS ± ${Math.round(accuracyMeters)} m)`;
}

function salonCard(salon, closest = false) {
  const status = getOpenStatus(salon);
  const distance = Number.isFinite(salon.distance)
    ? `<p class="salon-meta">Distance approximative : ${formatDistanceWithMargin(salon.distance, salon.distanceAccuracy)}</p>`
    : '';

  return `
    <article
      class="salon-card ${closest ? 'closest' : ''}"
      data-salon-id="${salon.id}"
      tabindex="0"
      aria-label="Afficher ${salon.name} sur la carte">
      ${closest ? '<p class="nearest-badge">Le plus proche</p>' : ''}
      <p class="eyebrow">${salon.district || salon.city || 'Salon'}</p>
      <h3>${salon.name}</h3>
      <p>${salon.address}</p>
      ${distance}
      <p class="${status.open ? 'open' : 'closed'}">${status.text}</p>
      <details class="hours-details">
        <summary>Voir les horaires</summary>
        <ul>${formatWeekHours(salon).map(line => `<li>${line}</li>`).join('')}</ul>
      </details>
      <div class="actions">
        <a class="button" href="${directionsUrl(salon)}" target="_blank" rel="noopener">Google Maps</a>
        <a class="button button-light" href="${whatsappHref(salon.whatsapp, `Bonjour, je souhaite réserver au ${salon.name}.`)}" target="_blank" rel="noopener">WhatsApp</a>
        <a class="button button-outline" href="reservation.html?salon=${encodeURIComponent(salon.id)}">Réserver</a>
      </div>
    </article>
  `;
}

function renderSalonList(items = validActiveSalons()) {
  if (!list) return;

  if (!items.length) {
    list.innerHTML = '<p class="status-message">Aucun salon actif avec des coordonnées valides.</p>';
    return;
  }

  list.innerHTML = items.map((salon, index) => {
    const isClosest = index === 0 && Number.isFinite(salon.distance);
    return salonCard(salon, isClosest);
  }).join('');
}

function resetSalonMarkerStyles() {
  salonMarkers.forEach(marker => {
    marker.setStyle(salonMarkerStyle(false));
  });
}

function highlightNearestSalon(salon) {
  resetSalonMarkerStyles();
  currentNearestSalonId = salon?.id || null;

  if (!salon) return;

  const marker = salonMarkers.get(salon.id);
  if (marker) {
    marker.setStyle(salonMarkerStyle(true));
    marker.bringToFront();
  }
}

function focusOnSalon(salon, openPopup = true) {
  const marker = salonMarkers.get(salon.id);
  if (!map || !marker || !hasCoordinates(salon)) return;

  map.flyTo(
    [Number(salon.lat), Number(salon.lng)],
    Math.max(map.getZoom(), 15),
    { animate: true, duration: 0.65 }
  );

  if (openPopup) {
    marker.setPopupContent(popupMarkup(salon, salon.id === currentNearestSalonId));
    marker.openPopup();
  }
}

function removeUserLayers() {
  if (userMarker) {
    userMarker.remove();
    userMarker = null;
  }

  if (userAccuracyCircle) {
    userAccuracyCircle.remove();
    userAccuracyCircle = null;
  }

  if (nearestLine) {
    nearestLine.remove();
    nearestLine = null;
  }
}

function showUserPosition(latitude, longitude, accuracy) {
  if (!map) return;

  removeUserLayers();

  userMarker = L.circleMarker(
    [latitude, longitude],
    userMarkerStyle()
  )
    .addTo(map)
    .bindPopup('<strong>Votre position</strong>');

  if (Number.isFinite(accuracy) && accuracy > 0) {
    userAccuracyCircle = L.circle(
      [latitude, longitude],
      {
        radius: accuracy,
        color: '#79b8ff',
        weight: 1,
        opacity: 0.55,
        fillColor: '#4da3ff',
        fillOpacity: 0.08
      }
    ).addTo(map);
  }
}

function frameUserAndNearest(latitude, longitude, nearest) {
  if (!map || !nearest || !hasCoordinates(nearest)) return;

  const userPoint = L.latLng(latitude, longitude);
  const salonPoint = L.latLng(Number(nearest.lat), Number(nearest.lng));

  nearestLine = L.polyline(
    [userPoint, salonPoint],
    {
      color: '#ff75b5',
      weight: 3,
      opacity: 0.8,
      dashArray: '8 10'
    }
  ).addTo(map);

  const bounds = L.latLngBounds([userPoint, salonPoint]);

  map.fitBounds(bounds, {
    paddingTopLeft: [35, 75],
    paddingBottomRight: [35, 55],
    maxZoom: 16,
    animate: true
  });

  window.setTimeout(() => {
    const nearestMarker = salonMarkers.get(nearest.id);
    if (nearestMarker) {
      nearestMarker.setPopupContent(popupMarkup(nearest, true));
      nearestMarker.openPopup();
    }
  }, 450);
}

function geolocationErrorMessage(error) {
  if (!error) return 'Position non disponible.';

  switch (error.code) {
    case error.PERMISSION_DENIED:
      return 'Localisation refusée. Autorise la position dans les réglages du navigateur puis réessaie.';
    case error.POSITION_UNAVAILABLE:
      return 'Le téléphone ou l’ordinateur n’arrive pas à déterminer votre position.';
    case error.TIMEOUT:
      return 'La recherche de position a pris trop de temps. Réessaie près d’une fenêtre ou avec le GPS activé.';
    default:
      return 'Position non disponible. Vérifie les autorisations de localisation.';
  }
}

function getPosition(options) {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, options);
  });
}

async function checkGeolocationPermission() {
  // Pré-vérification facultative : si le navigateur la supporte et que la permission est
  // déjà refusée, on le dit tout de suite au lieu d'attendre un nouveau délai pour rien.
  if (!navigator.permissions?.query) return null;

  try {
    const status = await navigator.permissions.query({ name: 'geolocation' });
    return status.state; // 'granted' | 'denied' | 'prompt'
  } catch {
    return null; // API non supportée pour 'geolocation' (ex. Safari) : on continue normalement.
  }
}

async function locateUser() {
  if (!navigator.geolocation) {
    setStatus('La géolocalisation n’est pas disponible sur cet appareil.', 'error');
    return;
  }

  const salons = validActiveSalons();

  if (!salons.length) {
    setStatus('Aucun salon actif ne possède de coordonnées GPS valides.', 'error');
    renderSalonList([]);
    return;
  }

  const permissionState = await checkGeolocationPermission();
  if (permissionState === 'denied') {
    setStatus('Localisation refusée. Autorise la position dans les réglages du navigateur puis réessaie.', 'error');
    return;
  }

  locateButton?.setAttribute('disabled', '');
  if (locateButton) locateButton.textContent = 'Recherche en cours…';
  setStatus('Recherche de votre position…', 'loading');

  // Filet de sécurité uniquement : si aucune des deux tentatives ne répond jamais
  // (cas anormal), le bouton se réactive quand même au lieu de rester bloqué.
  let settled = false;
  const safetyTimer = window.setTimeout(() => {
    if (settled) return;
    settled = true;
    locateButton?.removeAttribute('disabled');
    if (locateButton) locateButton.textContent = 'Actualiser ma position';
  }, 22000);

  const finishAttempt = () => {
    if (settled) return;
    settled = true;
    window.clearTimeout(safetyTimer);
    locateButton?.removeAttribute('disabled');
    if (locateButton) locateButton.textContent = 'Actualiser ma position';
  };

  let position;
  try {
    position = await getPosition({ enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 });
  } catch (firstError) {
    if (firstError?.code === firstError?.PERMISSION_DENIED) {
      finishAttempt();
      setStatus(geolocationErrorMessage(firstError), 'error');
      return;
    }

    // Le GPS précis a expiré ou est indisponible (fréquent en intérieur ou sur ordinateur) :
    // on retente une fois avec une position approximative, souvent plus rapide à obtenir.
    setStatus('Signal GPS faible : nouvelle tentative avec une position approximative…', 'loading');

    try {
      position = await getPosition({ enableHighAccuracy: false, timeout: 10000, maximumAge: 0 });
    } catch (secondError) {
      finishAttempt();
      setStatus(geolocationErrorMessage(secondError), 'error');
      return;
    }
  }

  finishAttempt();

  const latitude = Number(position.coords.latitude);
  const longitude = Number(position.coords.longitude);
  const accuracy = Number(position.coords.accuracy);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    setStatus('La position reçue est invalide. Réessaie.', 'error');
    return;
  }

  showUserPosition(latitude, longitude, accuracy);

  const sortedSalons = salons
    .map(salon => ({
      ...salon,
      distance: haversine(
        latitude,
        longitude,
        Number(salon.lat),
        Number(salon.lng)
      ),
      distanceAccuracy: accuracy
    }))
    .sort((a, b) => a.distance - b.distance);

  const nearest = sortedSalons[0];

  renderSalonList(sortedSalons);
  highlightNearestSalon(nearest);
  frameUserAndNearest(latitude, longitude, nearest);

  setStatus(
    `Salon le plus proche : ${nearest.name}, à ${formatDistanceWithMargin(nearest.distance, accuracy)}.`,
    'success'
  );
}

if (list) {
  list.addEventListener('click', event => {
    if (event.target.closest('a, button, summary, details')) return;

    const card = event.target.closest('[data-salon-id]');
    if (!card) return;

    const salon = validActiveSalons().find(item => item.id === card.dataset.salonId);
    if (salon) focusOnSalon(salon, true);
  });

  list.addEventListener('keydown', event => {
    if (event.key !== 'Enter' && event.key !== ' ') return;

    const card = event.target.closest('[data-salon-id]');
    if (!card) return;

    event.preventDefault();
    const salon = validActiveSalons().find(item => item.id === card.dataset.salonId);
    if (salon) focusOnSalon(salon, true);
  });
}

const mapCreated = createMap();

if (mapCreated) {
  createSalonMarkers();
  renderSalonList();

  window.addEventListener('load', () => {
    window.setTimeout(() => map?.invalidateSize(), 150);
  });
}

if (locateButton) {
  locateButton.addEventListener('click', locateUser);
}
