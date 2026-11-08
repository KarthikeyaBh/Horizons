import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import OccasionPicker from './OccasionPicker.jsx';
import MoodPicker, { emptyMoodSelection } from './MoodPicker.jsx';
import { moodScenes } from './moodScenes.js';
import { blankProfile, buffaloToday, defaultDetails, History, PlannerHeader, Practical, Profile, Results, startingAreas } from './PlannerPages.jsx';
import './styles.css';

function AccountActions({ onOpenHistory, onOpenProfile }) {
  return (
    <div className="home-actions" role="group" aria-label="Account actions">
      <button className="home-icon-button" type="button" aria-label="Planning history" onClick={onOpenHistory}>
        <svg className="home-icon" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      </button>
      <button className="home-icon-button" type="button" aria-label="Profile" onClick={onOpenProfile}>
        <svg className="home-icon" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="7" r="3.5" />
          <path d="M5 21v-2a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v2" />
        </svg>
      </button>
    </div>
  );
}

function HomePage({ greeting, accountActions }) {
  return (
    <div className="home">
      <header className="home-header">
        <p className="home-welcome">{greeting}</p>
        {accountActions}
      </header>

      <main className="home-brand">
        <p className="home-location">Buffalo, New York</p>
        <h1 className="home-wordmark">Horizons</h1>
        <div className="home-slogan">
          <p className="home-tagline" lang="fr">L’heure dorée, pour vous</p>
          <p className="home-translation">The golden hour, for you</p>
        </div>
      </main>

      <footer className="home-footer">
        <a className="home-start" href="#occasion">
          <span>Start planning</span>
          <span className="home-arrow-slot">
            <svg className="home-icon home-arrow" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 5v14m-6-6 6 6 6-6" />
            </svg>
          </span>
        </a>
        <p className="home-hint">or scroll to begin</p>
      </footer>
    </div>
  );
}

function LandingPages({ page, onScrollPage, greeting, accountActions, pickerProps }) {
  const scroller = useRef(null);
  const occasion = useRef(null);
  const initialized = useRef(false);
  const settleTimer = useRef(null);
  const active = page === '#occasion';

  useLayoutEffect(() => {
    const target = active ? occasion.current.offsetTop : 0;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const top = scroller.current.scrollTop;
    // Preserve the scroll position inside a taller picker when the user scrolled there.
    if (active ? top < target - 2 : top > 2) {
      scroller.current.scrollTo({ top: target, behavior: initialized.current && !reduceMotion ? 'smooth' : 'instant' });
    }
    initialized.current = true;
    return () => clearTimeout(settleTimer.current);
  }, [active]);

  function syncScroll() {
    clearTimeout(settleTimer.current);
    settleTimer.current = setTimeout(() => {
      if (window.location.hash !== page) return;
      const top = scroller.current.scrollTop;
      if (top <= 2 && active) onScrollPage('#home');
      if (top >= occasion.current.offsetTop - 2 && !active) onScrollPage('#occasion');
    }, 140);
  }

  return <div className="landing-scroll" ref={scroller} onScroll={syncScroll}>
    <section aria-label="Home">
      <HomePage greeting={greeting} accountActions={accountActions} />
    </section>
    <section aria-label="Occasion" ref={occasion}>
      <OccasionPicker {...pickerProps} active={active} />
    </section>
  </div>;
}

async function api(path, method = 'GET', body) {
  let response;
  try {
    response = await fetch('/api' + path, {
      method,
      ...(body !== undefined && { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }),
    });
  } catch {
    throw new Error('Could not reach the Horizons server. Please try again.');
  }
  const data = await response.json().catch(() => null);
  if (!response.ok || data == null) throw new Error(data?.error ?? 'The Horizons server is unavailable. Please try again.');
  return data;
}

const go = page => { window.location.hash = page; };

function App() {
  const [page, setPage] = useState(window.location.hash);
  const [selectedOccasion, setSelectedOccasion] = useState(null);
  const [moodSelection, setMoodSelection] = useState(emptyMoodSelection);
  const [details, setDetails] = useState(() => defaultDetails());
  const [account, setAccount] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const loaded = useRef(null);
  const today = buffaloToday();

  function loadAccount() {
    if (!loaded.current) {
      setLoadError('');
      loaded.current = api('/account').then(data => { setAccount(data); return data; }).catch(error => {
        loaded.current = null;
        setLoadError(error.message);
        throw error;
      });
    }
    return loaded.current;
  }
  useEffect(() => { loadAccount().catch(() => {}); }, []);

  useEffect(() => {
    const updatePage = () => {
      setPage(window.location.hash);
      setError('');
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', updatePage);
    return () => window.removeEventListener('hashchange', updatePage);
  }, []);

  const firstName = account?.profile.firstName.trim();
  const greeting = firstName ? `Welcome, ${firstName}` : 'Welcome Guest';
  const accountActions = <AccountActions onOpenHistory={() => go('history')} onOpenProfile={() => go('profile')} />;
  const plannerHeader = <PlannerHeader greeting={greeting} active={page.slice(1)} />;
  const moods = [...moodSelection.presets, ...moodSelection.custom];
  const searchId = page.startsWith('#results/') ? page.slice(9) : null;
  const search = searchId && account?.history.find(item => item.id === searchId);

  function chooseOccasion(occasion) {
    if (selectedOccasion?.id !== occasion.id || selectedOccasion?.label !== occasion.label) {
      setMoodSelection(emptyMoodSelection);
    }
    setSelectedOccasion(occasion);
    go('mood');
  }

  function updateSearch(item) {
    setAccount(previous => ({ ...previous, history: [item, ...previous.history.filter(entry => entry.id !== item.id)]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 50) }));
  }

  async function findPlans() {
    setBusy(true);
    setError('');
    try {
      await loadAccount();
      const result = await api('/recommendations', 'POST', { ...details, occasion: selectedOccasion, moods,
        travel: Number(details.travel), budget: details.budget === '' || details.budget == null ? null : Number(details.budget) });
      updateSearch(result);
      if (window.location.hash === '#details') go('results/' + result.id);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  function loadPreferences(item) {
    const { occasion, moods: words, ...settings } = item.preferences;
    setSelectedOccasion(occasion);
    const allowed = new Set(moodScenes[occasion.id]?.presets.map(preset => preset.word));
    setMoodSelection({ presets: words.filter(word => allowed.has(word)), custom: words.filter(word => !allowed.has(word)) });
    setDetails({ ...settings, budget: settings.budget ?? '', date: settings.date < today ? today : settings.date,
      endDate: settings.endDate > settings.date && settings.endDate >= today ? settings.endDate : '' });
  }

  async function choosePlan(plan) {
    if (search.chosenId === plan.id) { go('history'); return; }
    setBusy(true);
    setError('');
    try {
      updateSearch(await api('/history/' + search.id + '/choice', 'PUT', { placeId: plan.id }));
      if (window.location.hash === page) go('history');
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }

  async function saveReview(id, review) {
    updateSearch(await api('/history/' + id + '/review', 'PUT', review));
  }

  async function saveProfile(profile) {
    await loadAccount();
    const saved = await api('/profile', 'PUT', profile);
    setAccount(previous => ({ ...previous, profile: saved }));
    return saved;
  }

  function newPlan() {
    setSelectedOccasion(null);
    setMoodSelection(emptyMoodSelection);
    setDetails(defaultDetails());
    go('occasion');
  }

  const needsAccount = ['#profile', '#history'].includes(page) || searchId;
  let content;
  if (needsAccount && !account) {
    content = <main className="plan-main"><p role="status">{loadError || 'Loading your plans…'}</p>
      {loadError && <button className="plan-action" onClick={() => loadAccount().catch(() => {})}>Try again</button>}
    </main>;
  } else if (page === '#profile') {
    content = <Profile profile={account?.profile ?? blankProfile} save={saveProfile} />;
  } else if (page === '#history') {
    content = <History history={account.history} today={today} newPlan={newPlan} saveReview={saveReview}
      open={item => { loadPreferences(item); go('results/' + item.id); }} />;
  } else if (searchId) {
    content = search ? <Results search={search} busy={busy} error={error} onChoose={choosePlan}
      onEdit={() => loadPreferences(search)} /> : <main className="plan-main"><h1>Search unavailable</h1><a href="#history">Planning history</a></main>;
  } else if (page === '#details' && selectedOccasion && moods.length) {
    content = <Practical occasion={selectedOccasion} moods={moods} details={details} setDetails={setDetails}
      today={today} areas={account?.areas ?? startingAreas} busy={busy} error={error} submit={findPlans} />;
  }
  if (content) return <div className="planner-page" key={page}>
    {plannerHeader}{content}
  </div>;

  if (['#mood', '#details'].includes(page) && selectedOccasion) {
    return (
      <MoodPicker
        key={selectedOccasion.id}
        header={plannerHeader}
        occasion={selectedOccasion}
        selection={moodSelection}
        onChange={setMoodSelection}
        onContinue={() => go('details')}
      />
    );
  }

  const pickerProps = { header: plannerHeader, selectedOccasion, onSelectOccasion: chooseOccasion };
  if (['#mood', '#details'].includes(page)) return <OccasionPicker {...pickerProps} />;

  return <LandingPages page={page} onScrollPage={next => {
    window.history.pushState(null, '', next);
    setPage(next);
  }} greeting={greeting} accountActions={accountActions} pickerProps={pickerProps} />;
}

createRoot(document.getElementById('root')).render(<App />);
