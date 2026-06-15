const DAY_KEYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const DAY_LABELS = {
  monday: 'lundi',
  tuesday: 'mardi',
  wednesday: 'mercredi',
  thursday: 'jeudi',
  friday: 'vendredi',
  saturday: 'samedi',
  sunday: 'dimanche'
};

function cleanPhone(value = '') {
  return String(value).replace(/[^0-9]/g, '');
}

function phoneHref(value = '') {
  const cleaned = cleanPhone(value);
  return cleaned ? `tel:+${cleaned}` : '#';
}

function whatsappHref(number = '', message = '') {
  const cleaned = cleanPhone(number);
  const query = message ? `?text=${encodeURIComponent(message)}` : '';
  return cleaned ? `https://wa.me/${cleaned}${query}` : '#';
}

function formatHour(hour = '') {
  const [h = '00', m = '00'] = String(hour).split(':');
  return `${h} h ${m}`;
}

function toMinutes(hour = '') {
  const [h = 0, m = 0] = String(hour).split(':').map(Number);
  return h * 60 + m;
}

function getTodayKey(date = new Date()) {
  return DAY_KEYS[date.getDay()];
}

function getScheduleForDate(salon, date = new Date()) {
  const key = getTodayKey(date);
  return salon.hours?.[key] || null;
}

function findNextOpening(salon, date = new Date()) {
  for (let offset = 1; offset <= 7; offset += 1) {
    const nextDate = new Date(date);
    nextDate.setDate(date.getDate() + offset);

    const key = getTodayKey(nextDate);
    const schedule = salon.hours?.[key];

    if (schedule?.open) {
      return {
        day: offset === 1 ? 'demain' : DAY_LABELS[key],
        hour: schedule.open
      };
    }
  }

  return null;
}

function getOpenStatus(salon, date = new Date()) {
  const schedule = getScheduleForDate(salon, date);

  if (!schedule?.open || !schedule?.close) {
    const next = findNextOpening(salon, date);
    return {
      open: false,
      text: next ? `Fermé · ouvre ${next.day} à ${formatHour(next.hour)}` : 'Horaires à confirmer'
    };
  }

  const now = date.getHours() * 60 + date.getMinutes();
  const start = toMinutes(schedule.open);
  const end = toMinutes(schedule.close);

  if (now >= start && now < end) {
    return {
      open: true,
      text: `Ouvert jusqu’à ${formatHour(schedule.close)}`
    };
  }

  if (now < start) {
    return {
      open: false,
      text: `Fermé · ouvre aujourd’hui à ${formatHour(schedule.open)}`
    };
  }

  const next = findNextOpening(salon, date);
  return {
    open: false,
    text: next ? `Fermé · ouvre ${next.day} à ${formatHour(next.hour)}` : 'Horaires à confirmer'
  };
}

function formatWeekHours(salon) {
  return DAY_KEYS.slice(1).concat('sunday').map(key => {
    const schedule = salon.hours?.[key];
    const label = DAY_LABELS[key];
    return schedule?.open && schedule?.close
      ? `${label} : ${formatHour(schedule.open)} – ${formatHour(schedule.close)}`
      : `${label} : fermé`;
  });
}

function hasCoordinates(salon) {
  return Number.isFinite(Number(salon.lat)) && Number.isFinite(Number(salon.lng));
}

function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const rad = value => value * Math.PI / 180;
  const dLat = rad(lat2 - lat1);
  const dLng = rad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLng / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function directionsUrl(salon) {
  if (salon.googleMapsUrl && salon.googleMapsUrl !== '#') return salon.googleMapsUrl;
  if (hasCoordinates(salon)) return `https://www.google.com/maps/dir/?api=1&destination=${salon.lat},${salon.lng}`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${salon.name} ${salon.address}`)}`;
}
