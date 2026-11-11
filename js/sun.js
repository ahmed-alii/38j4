// Solar position from the NOAA "General Solar Position Calculations" approximations.
// Accurate to well under a degree, which is plenty for shading studies.

const rad = (d) => (d * Math.PI) / 180;
const deg = (r) => (r * 180) / Math.PI;

function dayOfYear(year, month, day) {
  return Math.round((Date.UTC(year, month - 1, day) - Date.UTC(year, 0, 0)) / 86400000);
}

/**
 * @param {{year:number, month:number, day:number}} date  local calendar date at the site
 * @param {number} hours  local clock time in decimal hours (e.g. 15.5 = 3:30 pm)
 * @returns {{altitude:number, azimuth:number}} degrees; azimuth clockwise from true north
 */
export function sunPosition(date, hours, { lat, lon, tzHours }) {
  const doy = dayOfYear(date.year, date.month, date.day);
  const g = ((2 * Math.PI) / 365) * (doy - 1 + (hours - 12) / 24);
  const eqTime = 229.18 * (0.000075 + 0.001868 * Math.cos(g) - 0.032077 * Math.sin(g)
    - 0.014615 * Math.cos(2 * g) - 0.040849 * Math.sin(2 * g));
  const decl = 0.006918 - 0.399912 * Math.cos(g) + 0.070257 * Math.sin(g)
    - 0.006758 * Math.cos(2 * g) + 0.000907 * Math.sin(2 * g)
    - 0.002697 * Math.cos(3 * g) + 0.00148 * Math.sin(3 * g);
  const trueSolarMin = hours * 60 + eqTime + 4 * lon - 60 * tzHours;
  const ha = rad(trueSolarMin / 4 - 180);
  const phi = rad(lat);
  const cosZen = Math.sin(phi) * Math.sin(decl) + Math.cos(phi) * Math.cos(decl) * Math.cos(ha);
  const altitude = 90 - deg(Math.acos(Math.min(1, Math.max(-1, cosZen))));
  const az = deg(Math.atan2(Math.sin(ha), Math.cos(ha) * Math.sin(phi) - Math.tan(decl) * Math.cos(phi))) + 180;
  return { altitude, azimuth: (az + 360) % 360 };
}

/** Sunrise / sunset in local decimal hours (refraction-corrected horizon −0.833°). */
export function sunTimes(date, loc) {
  let rise = null, set = null, prev = sunPosition(date, 0, loc).altitude;
  for (let m = 1; m <= 24 * 60; m++) {
    const h = m / 60;
    const a = sunPosition(date, h, loc).altitude;
    if (prev < -0.833 && a >= -0.833 && rise === null) rise = h;
    if (prev >= -0.833 && a < -0.833) set = h;
    prev = a;
  }
  return { rise, set };
}

/** Unit vector pointing from the ground towards the sun, in scene axes (x east, y up, z south). */
export function sunVector(altitude, azimuth, gridRotationDeg = 0) {
  const a = rad(altitude);
  const z = rad(azimuth - gridRotationDeg);
  const east = Math.sin(z) * Math.cos(a);
  const north = Math.cos(z) * Math.cos(a);
  return { x: east, y: Math.sin(a), z: -north };
}

export function compassName(az) {
  const names = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  return names[Math.round(az / 22.5) % 16];
}

export function fmtClock(h) {
  if (h === null) return '—';
  const total = Math.round(h * 60);
  const hh = Math.floor(total / 60) % 24;
  const mm = total % 60;
  const ampm = hh < 12 ? 'am' : 'pm';
  const h12 = hh % 12 === 0 ? 12 : hh % 12;
  return `${h12}:${String(mm).padStart(2, '0')} ${ampm}`;
}
