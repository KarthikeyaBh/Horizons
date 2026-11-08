import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import OccasionPicker from './OccasionPicker.jsx';
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

function HomePage({ firstName, accountActions }) {
  const name = firstName?.trim();

  return (
    <div className="home" onWheel={(event) => {
      if (!event.ctrlKey && event.deltaY > 15 && event.deltaY > Math.abs(event.deltaX)) {
        window.location.hash = 'occasion';
      }
    }}>
      <header className="home-header">
        <p className="home-welcome">{name ? `Welcome, ${name}` : 'Welcome'}</p>
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

function App() {
  const [page, setPage] = useState(window.location.hash);
  const [selectedOccasion, setSelectedOccasion] = useState(null);

  useEffect(() => {
    const updatePage = () => {
      window.scrollTo(0, 0);
      setPage(window.location.hash);
    };
    window.addEventListener('hashchange', updatePage);
    return () => window.removeEventListener('hashchange', updatePage);
  }, []);

  const accountActions = <AccountActions />;

  if (page === '#occasion') {
    return (
      <OccasionPicker
        accountActions={accountActions}
        selectedOccasion={selectedOccasion}
        onSelectOccasion={setSelectedOccasion}
      />
    );
  }

  return <HomePage firstName="Alex" accountActions={accountActions} />;
}

createRoot(document.getElementById('root')).render(<App />);
