import React, { useState } from 'react';
import logo from './assets/Horizons-Logo.svg';

export const blankProfile = { firstName: '', lastName: '', email: '', phone: '' };
export const startingAreas = ['Downtown', 'Elmwood', 'North Buffalo', 'South Buffalo', 'University District', 'West Side'];
export const buffaloToday = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York',
  year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
export function defaultDetails(today = buffaloToday()) {
  const tomorrow = new Date(Date.parse(today + 'T00:00:00Z') + 86400000).toISOString().slice(0, 10);
  return { date: tomorrow, endDate: '', earliest: '15:00', latest: '19:00', area: 'Downtown',
    travel: 25, budget: 25, setting: 'Any', weather: { sky: 'any', rain: 'any', temperature: 'any', wind: 'any' } };
}

const weatherChoices = [
  ['sky', 'Sky', [['any', 'Any'], ['clear', 'Clear'], ['partly', 'Partly cloudy'], ['overcast', 'Overcast']]],
  ['rain', 'Precipitation', [['any', 'Any'], ['dry', 'Prefer dry'], ['light', 'Light rain is okay']]],
  ['temperature', 'Temperature', [['any', 'Any'], ['cool', 'Cool'], ['mild', 'Mild'], ['warm', 'Warm']]],
  ['wind', 'Wind', [['any', 'Any'], ['calm', 'Prefer calm']]],
];

const arrows = { arrow: 'M4 12h16m-6-6 6 6-6 6', back: 'M20 12H4m6-6-6 6 6 6',
  profile: 'M16 7a4 4 0 1 1-8 0 4 4 0 1 1 8 0M4 21v-1a8 5 0 0 1 16 0v1',
  history: 'M21 12a9 9 0 1 1-18 0 9 9 0 1 1 18 0M12 7v5l3 2',
  weather: 'M7 17a4 4 0 1 1 1-8 5 5 0 0 1 9 2 3 3 0 0 1 0 6ZM6 8 4 6M10 6V3M14 7l2-2' };
function Icon({ name }) {
  return <svg className="plan-icon" viewBox="0 0 24 24" aria-hidden="true"><path d={arrows[name]} /></svg>;
}

export function PlannerHeader({ firstName, active }) {
  return <header className="plan-header">
    <a href="#home" aria-label="Horizons home"><img src={logo} alt="" width="182" height="44" /></a>
    <nav aria-label="Your account">
      <span>{firstName ? 'Welcome, ' + firstName : 'Welcome'}</span>
      <a href="#history" aria-current={active === 'history' ? 'page' : undefined}><Icon name="history" /> History</a>
      <a href="#profile" aria-current={active === 'profile' ? 'page' : undefined}><Icon name="profile" /> Profile</a>
    </nav>
  </header>;
}

function Heading({ step, title, children, action }) {
  return <div className="plan-heading">
    <div><p className="plan-kicker">{step}</p><h1>{title}</h1><p className="plan-muted">{children}</p></div>
    {action}
  </div>;
}

function Field({ name, label, suffix, ...props }) {
  return <label className="plan-field" htmlFor={name}>
    <span>{label}</span><span className="plan-input-wrap">
      <input id={name} name={name} {...props} />
      {suffix && <span className="plan-suffix" aria-hidden="true">{suffix}</span>}
    </span>
  </label>;
}

function Action({ children, href, quiet = false, arrow = false, ...props }) {
  const className = 'plan-action' + (quiet ? ' plan-action-quiet' : '');
  const content = <>{children}{arrow && <Icon name="arrow" />}</>;
  return href ? <a href={href} className={className} {...props}>{content}</a>
    : <button className={className} type="button" {...props}>{content}</button>;
}

export function Practical({ occasion, moods, details, setDetails, today, areas, busy, error, submit }) {
  const field = name => ({ name, value: details[name], onChange: event => setDetails({ ...details, [name]: event.target.value }) });
  return <main className="plan-main plan-practical">
    <a className="plan-back" href="#mood"><Icon name="back" /> Mood</a>
    <Heading step="03 / THE DETAILS" title="What works for you?">
      Set your limits, then tell us what you’d like the weather to feel like.
    </Heading>
    <div className="plan-tags">{[occasion.label, ...moods].map((name, i) => <span key={i}>{name}</span>)}</div>
    <form onSubmit={event => { event.preventDefault(); submit(); }}>
      <div className="details-grid">
        <section className="plan-panel">
          <h2>When &amp; where</h2><p className="plan-muted">Choose a single date or a range of up to 14 days.</p>
          <div className="plan-fields">
            <Field {...field('date')} label="Start date" type="date" min={today} required />
            <Field {...field('endDate')} label="End date · optional" type="date" min={details.date} />
            <Field {...field('earliest')} label="Earliest start (ET)" type="time" required />
            <Field {...field('latest')} label="Latest end (ET)" type="time" required />
            <label className="plan-field"><span>Starting area</span><select {...field('area')}>
              {areas.map(area => <option key={area}>{area}</option>)}
            </select></label>
            <label className="plan-field"><span>Setting</span><select {...field('setting')}>
              {['Any', 'Indoor', 'Outdoor'].map(setting => <option key={setting}>{setting}</option>)}
            </select></label>
            <Field {...field('travel')} label="Maximum drive" type="number" min="1" max="120" suffix="min" required />
            <Field {...field('budget')} label="Budget per person" type="number" min="0" max="1000" step=".01" suffix="USD" placeholder="Any budget" />
          </div>
        </section>
        <section className="plan-panel weather-panel">
          <div className="panel-title"><h2>Preferred weather</h2><Icon name="weather" /></div>
          <p className="plan-muted">Optional. These preferences help us rank plans.</p>
          {weatherChoices.map(([name, label, options]) => <fieldset className="weather-options" key={name}>
            <legend>{label}</legend>
            <div>{options.map(([value, description]) => <label key={value}>
              <input type="radio" name={name} value={value} checked={details.weather[name] === value}
                onChange={() => setDetails({ ...details, weather: { ...details.weather, [name]: value } })} />
              <span>{description}</span>
            </label>)}</div>
          </fieldset>)}
        </section>
      </div>
      {error && <p className="plan-error" role="alert">{error}</p>}
      <div className="plan-form-footer"><p className="plan-muted">We’ll look for up to five Buffalo plans within your limits.</p>
        <Action type="submit" arrow disabled={busy}>{busy ? 'Looking for matches…' : 'Find my plans'}</Action>
      </div>
    </form>
  </main>;
}

const dateLong = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', timeZone: 'UTC' });
const dateShort = new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' });
const timeShort = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: 'numeric', timeZone: 'UTC' });
const fmtDate = (day, format = dateShort) => format.format(new Date(day + 'T12:00:00Z'));
const fmtTime = time => timeShort.format(new Date('2000-01-01T' + time + ':00Z'));
const timeWindow = plan => fmtTime(plan.start) + '–' + fmtTime(plan.end) + ' ET';
const costs = plan => 'Est. ' + plan.travelMinutes + ' min drive · '
  + (plan.cost == null ? 'Request a quote' : plan.cost ? '$' + plan.cost + '/' + (plan.costUnit ?? 'person') : 'Free');
const forecastLine = forecast => forecast
  ? forecast.sky + ' · ' + Math.round(forecast.temp) + '°F · ' + forecast.precip + '% precip. · ' + Math.round(forecast.wind) + ' mph wind'
  : 'Forecast unavailable for this time';

function MatchReason({ plan, search }) {
  return <p className="match-reason">
    {plan.note}{plan.matchedMoods.length > 0 && <> Fits <strong>{plan.matchedMoods.join(', ')}</strong>.</>}
    {!plan.directEventFit && ' An alternative setting for your occasion.'}
    {plan.interpretedMoods < search.preferences.moods.length && ' Some mood words could not be scored.'}
  </p>;
}

function MatchCard({ plan, i, search, onChoose, busy }) {
  const selected = search.chosenId === plan.id;
  return <article className="match-card">
    <p className="plan-kicker">{String(i + 1).padStart(2, '0')}</p>
    <div>
      <h3><a href={plan.url} target="_blank" rel="noreferrer">{plan.name}</a></h3>
      <p className="match-time">{fmtDate(plan.date)} · {timeWindow(plan)}</p>
      <p className="plan-muted">{forecastLine(plan.weather)}</p>
      <p className="plan-muted">{costs(plan)}</p>
      <MatchReason plan={plan} search={search} />
      <Action quiet disabled={busy} onClick={() => onChoose(plan)}>{selected ? 'View in history' : 'Choose this plan'}</Action>
    </div>
    <span className="match-score">{plan.score}% match</span>
  </article>;
}

export function Results({ search, onChoose, onEdit, busy, error }) {
  const [top, ...rest] = search.results;
  const prefs = search.preferences;
  return <main className="plan-main plan-results">
    <Heading step="04 / YOUR TOP FIVE" title="Your best matches"
      action={<Action href="#details" quiet onClick={onEdit}>Edit preferences</Action>}>
      Buffalo · {prefs.occasion.label} · {prefs.moods.join(' & ')} · {fmtDate(prefs.date)}
      {prefs.endDate !== prefs.date ? ' – ' + fmtDate(prefs.endDate) : ''}
    </Heading>
    {error && <p className="plan-error" role="alert">{error}</p>}
    {!top && <section className="plan-panel plan-empty"><h2>No matches within your limits</h2>
      <p>Try a wider time window, a longer drive, or a different setting. Leave the budget blank to include venues that require a quote.</p>
      <Action href="#details" arrow onClick={onEdit}>Adjust preferences</Action>
    </section>}
    {top && <>
      <article className="top-match">
        <div><p className="plan-kicker">01 / BEST OVERALL MATCH</p>
          <h2><a href={top.url} target="_blank" rel="noreferrer">{top.name}</a></h2>
          <p className="top-cost">{top.area} · {costs(top)}</p>
          <MatchReason plan={top} search={search} />
        </div>
        <div className="top-timing">
          <div className="panel-title"><p className="plan-kicker">RECOMMENDED WINDOW</p><span className="match-score">{top.score}% match</span></div>
          <h3>{fmtDate(top.date, dateLong)}</h3>
          <p className="match-time">{timeWindow(top)}</p>
          <p className="top-weather"><Icon name="weather" />{forecastLine(top.weather)}</p>
          <Action arrow onClick={() => onChoose(top)} disabled={busy}>{search.chosenId === top.id ? 'View in history' : 'Choose this plan'}</Action>
        </div>
      </article>
      {rest.length > 0 && <><p className="plan-kicker more-matches">MORE MATCHES</p>
        <div className="match-grid">{rest.map((plan, i) => <MatchCard key={plan.id} plan={plan} i={i + 1}
          search={search} onChoose={onChoose} busy={busy} />)}</div></>}
      <div className="results-notes plan-muted">
        <p>A match percentage shows how well a plan fits the factors we could assess. When a forecast is unavailable, weather is excluded from the score.</p>
        <p>{search.forecastAt && <>Forecasts by <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">Open-Meteo</a>. </>}
          Check current weather, travel, venue hours, fees, and any reservation requirements before heading out.</p>
      </div>
    </>}
  </main>;
}

export function Profile({ profile, save }) {
  const [draft, setDraft] = useState(profile);
  const [status, setStatus] = useState({ busy: false, message: '', error: false });
  const field = name => ({ name, value: draft[name], onChange: e => {
    setDraft({ ...draft, [name]: e.target.value }); setStatus({ busy: false, message: '', error: false });
  } });
  async function submit(event) {
    event.preventDefault();
    setStatus({ busy: true, message: '', error: false });
    try {
      const result = await save(draft);
      setDraft(result);
      setStatus({ busy: false, message: 'Profile saved.', error: false });
    } catch (error) {
      setStatus({ busy: false, message: error.message, error: true });
    }
  }
  return <main className="plan-main profile-main">
    <Heading step="YOUR ACCOUNT" title="Your profile">Manage your name and contact details.</Heading>
    <form className="plan-panel profile-panel" onSubmit={submit}>
      <h2>Personal details</h2><p className="plan-muted">Your first name is used in your welcome message.</p>
      <div className="plan-fields">
        <Field {...field('firstName')} label="First name" autoComplete="given-name" maxLength={60} required disabled={status.busy} />
        <Field {...field('lastName')} label="Last name" autoComplete="family-name" maxLength={60} required disabled={status.busy} />
        <Field {...field('email')} label="Email address" type="email" autoComplete="email" maxLength={254} required disabled={status.busy} />
        <Field {...field('phone')} label="Phone number · optional" type="tel" autoComplete="tel" maxLength={35} disabled={status.busy} />
      </div>
      <div className="plan-form-footer">
        <p className={status.error ? 'plan-error' : 'plan-muted'} role={status.error ? 'alert' : 'status'}>{status.message}</p>
        <Action type="submit" arrow disabled={status.busy}>{status.busy ? 'Saving…' : 'Save profile'}</Action>
      </div>
    </form>
  </main>;
}

function ReviewForm({ search, save, close }) {
  const [rating, setRating] = useState(search.review?.rating ?? 0);
  const [comment, setComment] = useState(search.review?.comment ?? '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    try { await save(search.id, { rating, comment }); close(); }
    catch (err) { setError(err.message); setBusy(false); }
  }
  return <form className="review-form" onSubmit={submit}>
    <fieldset className="weather-options"><legend>How did it go?</legend><div>
      {[1, 2, 3, 4, 5].map(value => <label key={value}>
        <input type="radio" name="rating" value={value} checked={rating === value}
          onChange={() => setRating(value)} required aria-label={value + ' out of 5'} />
        <span>{value}</span>
      </label>)}
    </div></fieldset>
    <label className="plan-field"><span>What matched the mood? · optional</span>
      <textarea value={comment} maxLength={800} onChange={event => setComment(event.target.value)} />
    </label>
    {error && <p className="plan-error" role="alert">{error}</p>}
    <div className="history-actions"><Action quiet onClick={close} disabled={busy}>Cancel</Action>
      <Action type="submit" disabled={!rating || busy}>{busy ? 'Saving…' : 'Save review'}</Action></div>
  </form>;
}

const buffaloClock = new Intl.DateTimeFormat('en-GB', { timeZone: 'America/New_York', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
export function History({ history, open, newPlan, saveReview, today }) {
  const [reviewing, setReviewing] = useState(null);
  return <main className="plan-main">
    <Heading step="YOUR PLANS" title="Planning history" action={<Action onClick={newPlan} arrow>Start a new plan</Action>}>
      Reopen a search, revisit a chosen plan, or share how it went.
    </Heading>
    <p className="plan-kicker history-caption">RECENT ACTIVITY</p>
    <div className="history-list">
      {!history.length && <section className="plan-panel plan-empty"><h2>Your plans will show up here</h2>
        <p>Run a search to add it to your planning history.</p><Action onClick={newPlan} arrow>Start planning</Action></section>}
      {history.map(search => {
        const chosen = search.results.find(plan => plan.id === search.chosenId);
        const past = chosen && (chosen.date < today || (chosen.date === today && chosen.end <= buffaloClock.format(new Date())));
        return <article className="history-entry" key={search.id}>
          <div className="history-row"><div>
            <p className="plan-kicker">{chosen ? (past ? 'PAST CHOSEN PLAN' : 'CHOSEN PLAN') : 'PAST SEARCH'}</p>
            <h2>{chosen?.name ?? search.preferences.occasion.label}</h2>
            <p className="plan-muted">{chosen ? search.preferences.occasion.label + ' · ' : ''}{search.preferences.moods.join(', ')}</p>
            <p className="plan-muted">{chosen
              ? fmtDate(chosen.date) + ' · ' + timeWindow(chosen) + ' · ' + chosen.area
              : 'Searched ' + new Date(search.createdAt).toLocaleDateString('en-US', { timeZone: 'America/New_York' }) + ' · ' + search.results.length + ' matches'}</p>
            {search.review && <p className="plan-muted">Your review · {search.review.rating}/5 {search.review.comment && '· ' + search.review.comment}</p>}
          </div>
          <div className="history-actions">
            {past && <Action quiet onClick={() => setReviewing(search.id)}>{search.review ? 'Edit review' : 'Leave a review'}</Action>}
            <Action quiet arrow onClick={() => open(search)}>{chosen ? 'View plan' : 'View results'}</Action>
          </div></div>
          {reviewing === search.id && <ReviewForm search={search} save={saveReview} close={() => setReviewing(null)} />}
        </article>;
      })}
    </div>
  </main>;
}
