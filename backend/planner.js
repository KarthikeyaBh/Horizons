const { places, areas, scheduleExceptions } = require('./places');
const { localNow, toMinutes, solarEstimate } = require('./weather');

const preferences = {
  sky: ['any', 'clear', 'partly', 'overcast'],
  rain: ['any', 'dry', 'light'],
  temperature: ['any', 'cool', 'mild', 'warm'],
  wind: ['any', 'calm'],
};
const moodFamilies = [
  'golden aglow warm candlelit sunset sun-dappled glow',
  'quiet hushed serene still secluded peaceful tranquil unhurried',
  'romantic intimate cozy delicate dreamy dreamlike soft pastel',
  'open expansive airy sweeping breezy spacious',
  'woodsy verdant fresh rugged adventurous green earthy',
  'playful spirited electric lively jubilant colorful high-energy triumphant cheerful energetic',
  'cinematic dramatic striking inky moody atmospheric',
  'timeless nostalgic classic historic',
  'bright sunny crisp',
  'casual easygoing inviting welcoming relaxed',
].map(group => group.split(' '));
const validEvents = new Set(['other', ...places.flatMap(place => place.events)]);
const minuteLabel = min => String(Math.floor(min / 60)).padStart(2, '0') + ':' + String(min % 60).padStart(2, '0');
const dayMs = 86400000;
const dateStamp = day => new Date(day + 'T00:00:00Z').getTime();

function validate(input, now = localNow()) {
  if (!input || typeof input !== 'object') throw new Error('Enter your planning preferences.');
  const { occasion, moods, date, earliest, latest, area, travel, budget, setting } = input;
  const endDate = input.endDate || date;
  const isDate = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
    && Number.isFinite(dateStamp(value)) && new Date(dateStamp(value)).toISOString().slice(0, 10) === value;
  if (!validEvents.has(occasion?.id) || typeof occasion.label !== 'string' || !occasion.label.trim() || occasion.label.length > 80) {
    throw new Error('Choose a valid occasion.');
  }
  if (!Array.isArray(moods) || moods.length < 1 || moods.length > 12 || moods.some(m => typeof m !== 'string' || !m.trim() || m.length > 80)) {
    throw new Error('Pick at least one mood.');
  }
  if (!isDate(date) || !isDate(endDate) || date < now.date || endDate < date
      || dateStamp(endDate) - dateStamp(date) > 13 * dayMs || dateStamp(endDate) - dateStamp(now.date) > 365 * dayMs) {
    throw new Error('Choose today or a future date within one year, with a range of up to 14 days.');
  }
  const isTime = value => typeof value === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
  if (!isTime(earliest) || !isTime(latest) || toMinutes(latest) - toMinutes(earliest) < 60) {
    throw new Error('Allow at least one hour between the earliest start and latest end on the same day.');
  }
  if (!Object.hasOwn(areas, area) || !Number.isInteger(travel) || travel < 1 || travel > 120
      || (budget !== null && (!Number.isFinite(budget) || budget < 0 || budget > 1000))
      || !['Any', 'Indoor', 'Outdoor'].includes(setting)) {
    throw new Error('Check your starting area, travel limit, budget, and setting.');
  }
  const weather = Object.fromEntries(Object.entries(preferences).map(([key, options]) => {
    const choice = input.weather?.[key] ?? 'any';
    if (!options.includes(choice)) throw new Error('Choose a valid weather preference.');
    return [key, choice];
  }));
  return { occasion: { id: occasion.id, label: occasion.label.trim() }, moods: [...new Set(moods.map(m => m.trim()))],
    date, endDate, earliest, latest, area, travel, budget, setting, weather };
}

function driveEstimate(from, place) {
  const [lat, lon] = areas[from];
  const miles = Math.hypot((lat - place.lat) * 69, (lon - place.lon) * 50.5);
  return Math.round(4 + miles * 3.15);
}

function moodFit(moods, tags) {
  let points = 0;
  let interpreted = 0;
  const matched = [];
  for (const mood of moods) {
    const words = mood.toLowerCase().match(/[a-z]+(?:-[a-z]+)*/g) || [];
    const families = moodFamilies.filter(family => words.some(word => family.includes(word)));
    if (!families.length && !words.some(word => tags.includes(word))) continue;
    interpreted++;
    if (words.some(word => tags.includes(word))) {
      points += 1;
      matched.push(mood);
    } else if (families.some(family => tags.some(tag => family.includes(tag)))) {
      points += 0.82;
      matched.push(mood);
    }
  }
  return { value: interpreted ? points / interpreted : null, matched, interpreted };
}

function weatherFit(prefs, weather, setting, event) {
  if (!weather) return null;
  const scores = [];
  if (prefs.sky !== 'any') {
    const desired = { clear: 10, partly: 48, overcast: 92 }[prefs.sky];
    scores.push(Math.max(0, 1 - Math.abs(weather.clouds - desired) / 80));
  }
  if (prefs.rain !== 'any') scores.push(Math.max(0, 1 - Math.max(0, weather.precip - (prefs.rain === 'dry' ? 5 : 30)) / 80));
  if (prefs.temperature !== 'any') {
    const [low, high] = { cool: [40, 59], mild: [60, 74], warm: [75, 90] }[prefs.temperature];
    scores.push(Math.max(0, 1 - Math.max(0, low - weather.temp, weather.temp - high) / 30));
  }
  if (prefs.wind === 'calm') scores.push(Math.max(0, 1 - Math.max(0, weather.wind - 6) / 18));
  if (setting === 'Outdoor') scores.push(1 - weather.precip / 100);
  if (event === 'stargazing') scores.push(1 - weather.clouds / 100);
  return scores.length ? scores.reduce((sum, value) => sum + value, 0) / scores.length : null;
}

function timingFit(event, moods, start, rise, set) {
  const mid = start + 30;
  if (event === 'stargazing') return mid >= set + 90 || mid <= rise - 90 ? 1 : 0.72;
  if (event === 'sunrise-sunset') return Math.max(0.35, 1 - Math.min(Math.abs(mid - rise), Math.abs(mid - set)) / 150);
  if (event === 'birdwatching') return Math.max(0.55, 1 - Math.abs(mid - rise - 70) / 660);
  if (moods.some(m => /golden|aglow|candlelit|cinematic|sunset/i.test(m))) {
    return Math.max(0.55, 1 - Math.abs(mid - (set - 15)) / 360);
  }
  return 1;
}

function rank(prefs, forecast, now = localNow()) {
  const suggestions = [];
  const event = prefs.occasion.id;
  const strictActivity = ['stargazing', 'campfire', 'hiking', 'birdwatching', 'sunrise-sunset', 'sports', 'dog', 'wedding', 'shower'].includes(event);
  for (const place of places) {
    const travelMinutes = driveEstimate(prefs.area, place);
    const suitable = place.events.includes(event);
    if (travelMinutes > prefs.travel || (prefs.budget !== null && (place.cost == null || place.cost > prefs.budget))
        || (strictActivity && !suitable) || (prefs.setting !== 'Any' && place.setting !== prefs.setting && place.setting !== 'Mixed')) continue;
    const mood = moodFit(prefs.moods, place.tags);
    let best;
    for (let time = dateStamp(prefs.date); time <= dateStamp(prefs.endDate); time += dayMs) {
      const d = new Date(time);
      if (place.days && !place.days.includes(d.getUTCDay())) continue;
      const date = d.toISOString().slice(0, 10);
      const exceptions = scheduleExceptions[place.id];
      const hours = exceptions && Object.hasOwn(exceptions, date) ? exceptions[date] : place.hours;
      if (!hours) continue;
      if (event === 'campfire') {
        const year = d.getUTCFullYear();
        const oct1 = new Date(Date.UTC(year, 9, 1)).getUTCDay();
        const secondMonday = 8 + (8 - oct1) % 7;
        if (date.slice(5) < '05-15' || date.slice(5) > '10-' + secondMonday) continue;
      }
      const [rise, set] = forecast?.solar.get(date) ?? solarEstimate(date);
      const [open, close] = hours === 'daylight' ? [rise, set] : hours.map(hour => hour * 60);
      const earliest = Math.max(open, toMinutes(prefs.earliest), date === now.date ? now.minute + 1 : 0);
      const latest = Math.min(close, toMinutes(prefs.latest));
      const starts = new Set([earliest, latest - 60]);
      for (let start = Math.ceil(earliest / 30) * 30; start + 60 <= latest; start += 30) starts.add(start);
      for (const start of [...starts].sort((a, b) => a - b)) {
        if (start < earliest || start + 60 > latest) continue;
        if (event === 'stargazing' && !(start >= set + 45 || start + 60 <= rise - 45)) continue;
        const hour = minuteLabel(start);
        const weather = forecastAt(forecast, date, start);
        if (place.setting === 'Outdoor' && weather?.code >= 95) continue;
        const weatherScore = weatherFit(prefs.weather, weather, place.setting, event);
        const factors = [
          [40, suitable || event === 'other' ? 1 : 0.52],
          [15, 1 - 0.3 * (travelMinutes / prefs.travel)],
          [10, timingFit(event, prefs.moods, start, rise, set)],
          [25, mood.value],
          [30, weatherScore],
        ].filter(([, value]) => value != null);
        const score = Math.round(100 * factors.reduce((sum, [weight, value]) => sum + weight * value, 0)
          / factors.reduce((sum, [weight]) => sum + weight, 0));
        // Favor forecast coverage when a date range spans the edge of the weather feed.
        const priority = score - (weather ? 0 : 6);
        if (best && best.priority >= priority) continue;
        best = { priority, score, id: place.id, name: place.name, area: place.area, url: place.url, note: place.note,
          setting: place.setting, date, start: hour, end: minuteLabel(start + 60), cost: place.cost,
          costUnit: place.id === 'evangola' ? 'site' : ['harbor', 'beaver'].includes(place.id) ? 'vehicle' : 'person', travelMinutes,
          weather, matchedMoods: mood.matched, interpretedMoods: mood.interpreted, directEventFit: suitable || event === 'other' };
      }
    }
    if (best) suggestions.push(best);
  }
  return suggestions.sort((a, b) => b.priority - a.priority || a.travelMinutes - b.travelMinutes || a.name.localeCompare(b.name))
    .slice(0, 5).map(({ priority, ...plan }) => plan);
}

function forecastAt(forecast, date, start) {
  if (!forecast) return null;
  const startHour = Math.floor(start / 60) * 60;
  const at = min => forecast.windows.get(date + 'T' + minuteLabel(min));
  const first = at(startHour);
  const last = at(startHour + 60);
  const extra = start % 60 ? at(startHour + 120) : null;
  if (!first || !last || (start % 60 && !extra)) return null;
  const precip = Math.max(last.precip, extra?.precip ?? 0);
  const wind = Math.max(first.wind, last.wind, extra?.wind ?? 0);
  const storm = [first, last, extra].find(hour => hour?.code >= 95);
  return { ...(storm || last), precip, wind };
}

module.exports = { validate, rank };
