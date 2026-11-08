const timeZone = 'America/New_York';
const formatter = new Intl.DateTimeFormat('en-CA', {
  timeZone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
});
const hourly = ['temperature_2m', 'precipitation_probability', 'weather_code', 'cloud_cover', 'wind_speed_10m'];
let cached;
let pending;

function localNow(now = new Date()) {
  const parts = Object.fromEntries(formatter.formatToParts(now).map(({ type, value }) => [type, value]));
  return { date: parts.year + '-' + parts.month + '-' + parts.day, minute: +parts.hour * 60 + +parts.minute };
}

function sky(code) {
  if (code === 0) return 'Clear';
  if (code <= 2) return 'Partly cloudy';
  if (code === 3) return 'Overcast';
  if (code <= 48) return 'Fog';
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return 'Snow';
  if (code >= 95) return 'Thunderstorms';
  return 'Rain or showers';
}

async function requestForecast() {
  const params = new URLSearchParams({
    latitude: '42.8864', longitude: '-78.8784', timezone: timeZone, forecast_days: '16',
    hourly: hourly.join(','), daily: 'sunrise,sunset', temperature_unit: 'fahrenheit', wind_speed_unit: 'mph',
  });
  const response = await fetch('https://api.open-meteo.com/v1/forecast?' + params, { signal: AbortSignal.timeout(5000) });
  if (!response.ok) throw new Error('Forecast service returned ' + response.status);
  const data = await response.json();
  const windows = new Map();
  const solar = new Map();
  data.hourly.time.forEach((time, i) => {
    const values = hourly.map(key => data.hourly[key]?.[i]);
    if (!values.every(Number.isFinite)) return;
    const [temp, precip, code, clouds, wind] = values;
    windows.set(time, { temp, precip, code, clouds, wind, sky: sky(code) });
  });
  data.daily.time.forEach((day, i) => {
    if (data.daily.sunrise[i] && data.daily.sunset[i]) {
      solar.set(day, [toMinutes(data.daily.sunrise[i].slice(11)), toMinutes(data.daily.sunset[i].slice(11))]);
    }
  });
  if (!windows.size) throw new Error('Forecast contains no usable hours');
  return { windows, solar, fetchedAt: new Date().toISOString() };
}

function getForecast() {
  if (cached && Date.now() - cached.when < 15 * 60_000) return Promise.resolve(cached.data);
  if (!pending) {
    pending = requestForecast().then(data => {
      cached = { when: Date.now(), data };
      return data;
    }).catch(() => null).finally(() => { pending = null; });
  }
  return pending;
}

function toMinutes(time) {
  const [hour, minute] = time.split(':').map(Number);
  return hour * 60 + minute;
}

// Estimate solar times for dates outside the weather forecast using solar declination and local UTC offset.
function solarEstimate(day) {
  const date = new Date(day + 'T12:00:00Z');
  const yearStart = Date.UTC(date.getUTCFullYear(), 0, 1, 12);
  const angle = 2 * Math.PI * ((date.getTime() - yearStart) / 86400000) / 365.25;
  const eq = 229.18 * (0.000075 + 0.001868 * Math.cos(angle) - 0.032077 * Math.sin(angle)
    - 0.014615 * Math.cos(2 * angle) - 0.040849 * Math.sin(2 * angle));
  const decl = 0.006918 - 0.399912 * Math.cos(angle) + 0.070257 * Math.sin(angle)
    - 0.006758 * Math.cos(2 * angle) + 0.000907 * Math.sin(2 * angle)
    - 0.002697 * Math.cos(3 * angle) + 0.00148 * Math.sin(3 * angle);
  const lat = 42.8864 * Math.PI / 180;
  const span = Math.acos(Math.cos(90.833 * Math.PI / 180) / (Math.cos(lat) * Math.cos(decl)) - Math.tan(lat) * Math.tan(decl)) * 720 / Math.PI;
  const noon = 720 + 4 * 78.8784 - eq + localNow(date).minute - 720;
  return [Math.round(noon - span), Math.round(noon + span)];
}

module.exports = { getForecast, localNow, toMinutes, solarEstimate };
