const mapElement = document.querySelector('#map');
const list = document.querySelector('#salons-list');
const locateButton = document.querySelector('#locate-button');
const statusMessage = document.querySelector('#location-status');

let map;
let userMarker;
const salonMarkers = new Map();

function setStatus(message) {
  if (statusMessage) statusMessage.textContent = message;
}

function createMap() {
  if (!mapElement || typeof L === 'undefined') return;

  const center = LOCATION_SETTINGS?.defaultCenter || [-4.325, 15.31];
  const zoom = LOCATION_SETTINGS?.defaultZoom || 12;

  map = L.map(mapElement).setView(center, zoom);

  L.tileLayer(LOCATION_SETTINGS.tileUrl, {
    maxZoom: 19,
    attribution: LOCATION_SETTINGS.tileAttribution
  }).addTo(map);
}

function createMarkers() {
  if (!map) return;

  SALONS.filter(hasCoordinates).forEach(salon => {
    const status = getOpenStatus(salon);
    const marker = L.marker([Number(salon.lat), Number(salon.lng)])
      .addTo(map)
      .bindPopup(`
        <strong>${salon.name}</strong><br>
        ${salon.address}<br>
        <span class="${status.open ? 'open' : 'closed'}">${status.text}</span><br>
        <a href="${directionsUrl(salon)}" target="_blank" rel="noopener">Itinéraire</a>
      `);

    salonMarkers.set(salon.id, marker);
  });
}

function salonCard(salon, closest = false) {
  const status = getOpenStatus(salon);
  const distance = Number.isFinite(salon.distance)
    ? `<p class="salon-meta">Distance approximative : ${salon.distance.toFixed(1)} km</p>`
    : '';

  return `
    <article class="salon-card ${closest ? 'closest' : ''}">
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
        <a class="text-link" href="${directionsUrl(salon)}" target="_blank" rel="noopener">Itinéraire</a>
        <a class="text-link" href="${whatsappHref(salon.whatsapp, `Bonjour, je souhaite réserver au ${salon.name}.`)}" target="_blank" rel="noopener">WhatsApp</a>
        <a class="text-link" href="reservation.html?salon=${salon.id}">Réserver</a>
      </div>
    </article>
  `;
}

function renderSalonList(items = SALONS) {
  if (!list) return;

  list.innerHTML = items.map((salon, index) => {
    const isClosest = index === 0 && Number.isFinite(salon.distance);
    return salonCard(salon, isClosest);
  }).join('');
}

function focusOnSalon(salon) {
  const marker = salonMarkers.get(salon.id);
  if (!map || !marker) return;

  map.setView([Number(salon.lat), Number(salon.lng)], 15, { animate: true });
  marker.openPopup();
}

function locateUser() {
  if (!navigator.geolocation) {
    setStatus('La géolocalisation n’est pas disponible sur cet appareil.');
    return;
  }

  setStatus('Recherche de votre position…');

  navigator.geolocation.getCurrentPosition(position => {
    const { latitude, longitude } = position.coords;

    if (map) {
      if (userMarker) userMarker.remove();
      userMarker = L.marker([latitude, longitude]).addTo(map).bindPopup('Votre position').openPopup();
    }

    const sortedSalons = SALONS.map(salon => ({
      ...salon,
      distance: hasCoordinates(salon)
        ? haversine(latitude, longitude, Number(salon.lat), Number(salon.lng))
        : Infinity
    })).sort((a, b) => a.distance - b.distance);

    renderSalonList(sortedSalons);

    if (map) {
      const bounds = [[latitude, longitude]];
      sortedSalons.filter(hasCoordinates).forEach(salon => bounds.push([Number(salon.lat), Number(salon.lng)]));
      map.fitBounds(bounds, { padding: [35, 35] });
    }

    const closest = sortedSalons[0];
    setStatus(`Salon le plus proche : ${closest.name} à environ ${closest.distance.toFixed(1)} km.`);
    focusOnSalon(closest);
  }, () => {
    setStatus('Position non disponible. Autorise la localisation dans ton navigateur ou consulte la liste des salons.');
  }, {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 60000
  });
}

createMap();
createMarkers();
renderSalonList();

if (locateButton) {
  locateButton.addEventListener('click', locateUser);
}
