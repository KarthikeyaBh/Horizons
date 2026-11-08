const express = require('express');
const path = require('node:path');
const fs = require('node:fs');
const crypto = require('node:crypto');
const { areas } = require('./places');
const { getForecast, localNow, toMinutes } = require('./weather');
const { validate, rank } = require('./planner');

const app = express();
const storePath = path.resolve(process.env.HORIZONS_DATA_FILE || path.join(__dirname, 'data/accounts.json'));
const blank = () => ({ profile: { firstName: '', lastName: '', email: '', phone: '' }, history: [] });
let accounts;
try {
  accounts = JSON.parse(fs.readFileSync(storePath, 'utf8'));
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
  accounts = {};
}
app.disable('x-powered-by');
app.use('/api', express.json({ limit: '32kb' }));
app.use('/api', (_req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok' });
});

app.use('/api', (req, res, next) => {
  const token = req.headers.cookie?.match(/(?:^|;\s*)horizons_session=([a-f0-9]{64})(?:;|$)/)?.[1];
  req.accountId = token || crypto.randomBytes(32).toString('hex');
  if (!token) res.cookie('horizons_session', req.accountId, {
    httpOnly: true, sameSite: 'strict', secure: req.secure, maxAge: 365 * 86400000,
  });
  next();
});

const accountOf = req => accounts[req.accountId] || blank();
function writeAccount(req, account) {
  const next = { ...accounts, [req.accountId]: account };
  fs.mkdirSync(path.dirname(storePath), { recursive: true });
  const temp = storePath + '.tmp';
  fs.writeFileSync(temp, JSON.stringify(next), { mode: 0o600 });
  fs.renameSync(temp, storePath);
  accounts = next;
}

app.get('/api/account', (req, res) => {
  res.json({ ...accountOf(req), today: localNow().date, areas: Object.keys(areas) });
});

app.put('/api/profile', (req, res) => {
  const profile = {};
  for (const [key, limit] of Object.entries({ firstName: 60, lastName: 60, email: 254, phone: 35 })) {
    const value = req.body?.[key] ?? '';
    if (typeof value !== 'string' || value.trim().length > limit) return res.status(400).json({ error: 'Check your contact details.' });
    profile[key] = value.trim();
  }
  if (!profile.firstName || !profile.lastName || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)
      || (profile.phone && !/^[+\d(). -]{7,35}$/.test(profile.phone))) {
    return res.status(400).json({ error: 'Enter your first name, last name, and a valid email. Phone is optional.' });
  }
  writeAccount(req, { ...accountOf(req), profile });
  return res.json(profile);
});

app.post('/api/recommendations', async (req, res) => {
  const now = localNow();
  let preferences;
  try {
    preferences = validate(req.body, now);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
  const forecast = await getForecast();
  const search = {
    id: crypto.randomUUID(), createdAt: new Date().toISOString(), preferences,
    results: rank(preferences, forecast, localNow()), chosenId: null, review: null,
    forecastAt: forecast?.fetchedAt ?? null,
  };
  const account = accountOf(req);
  writeAccount(req, { ...account, history: [search, ...account.history].slice(0, 50) });
  return res.status(201).json(search);
});

function updateSearch(req, res, update) {
  const account = accountOf(req);
  const i = account.history.findIndex(search => search.id === req.params.id);
  if (i < 0) return res.status(404).json({ error: 'That search could not be found.' });
  const result = update(account.history[i]);
  if (result.error) return res.status(400).json({ error: result.error });
  const history = [...account.history];
  history[i] = result;
  writeAccount(req, { ...account, history });
  return res.json(result);
}

app.put('/api/history/:id/choice', (req, res) => updateSearch(req, res, search => {
  const id = req.body?.placeId;
  if (!search.results.some(plan => plan.id === id)) return { error: 'Choose a plan from these results.' };
  if (search.review && search.chosenId !== id) return { error: 'This plan already has a review. Start a new search to choose another.' };
  return { ...search, chosenId: id };
}));

app.put('/api/history/:id/review', (req, res) => updateSearch(req, res, search => {
  const chosen = search.results.find(plan => plan.id === search.chosenId);
  const now = localNow();
  if (!chosen || chosen.date > now.date || (chosen.date === now.date && toMinutes(chosen.end) > now.minute)) {
    return { error: 'You can leave a review after the chosen time ends.' };
  }
  const { rating, comment = '' } = req.body || {};
  if (!Number.isInteger(rating) || rating < 1 || rating > 5 || typeof comment !== 'string' || comment.trim().length > 800) {
    return { error: 'Choose a rating from 1 to 5 and enter up to 800 characters.' };
  }
  return { ...search, review: { rating, comment: comment.trim(), updatedAt: new Date().toISOString() } };
}));

app.use('/api', (_req, res) => res.status(404).json({ error: 'Endpoint not found.' }));
app.use(express.static(path.join(__dirname, '../frontend/dist')));
app.use((err, _req, res, _next) => {
  if (err.status === 400 || err.status === 413) return res.status(err.status).json({ error: 'Invalid request.' });
  console.error(err.message);
  return res.status(500).json({ error: 'Horizons could not complete that request. Try again.' });
});

if (require.main === module) {
  const port = Number(process.env.PORT || 3000);
  const server = app.listen(port, '127.0.0.1', (error) => {
    if (error) {
      console.error('Could not start the Horizons server:', error.message);
      process.exitCode = 1;
      return;
    }
    console.log('Horizons is running at http://127.0.0.1:' + server.address().port);
  });
}

module.exports = app;
