import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

function ClockIcon() {
  return (
    <svg className="home-icon" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function ProfileIcon() {
  return (
    <svg className="home-icon" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="7" r="3.5" />
      <path d="M5 21v-2a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v2" />
    </svg>
  );
}

function ArrowDownIcon() {
  return (
    <svg className="home-icon home-arrow" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 5v14m-6-6 6 6 6-6" />
    </svg>
  );
}

function HomePage({
  firstName,
  onStartPlanning,
  onOpenHistory,
  onOpenProfile,
}) {
  const name = firstName?.trim();

  return (
    <div className="home">
      <header className="home-header">
        <p className="home-welcome">{name ? `Welcome, ${name}` : 'Welcome'}</p>

        <div className="home-actions" role="group" aria-label="Account actions">
          <button
            className="home-icon-button"
            type="button"
            aria-label="Planning history"
            onClick={onOpenHistory}
          >
            <ClockIcon />
          </button>

          <button
            className="home-icon-button"
            type="button"
            aria-label="Profile"
            onClick={onOpenProfile}
          >
            <ProfileIcon />
          </button>
        </div>
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
        <button className="home-start" type="button" onClick={onStartPlanning}>
          <span>Start planning</span>
          <span className="home-arrow-slot">
            <ArrowDownIcon />
          </span>
        </button>

        <p className="home-hint home-hint-desktop">or scroll to begin</p>
        <p className="home-hint home-hint-mobile">or swipe up to begin</p>
      </footer>
    </div>
  );
}

createRoot(document.getElementById('root')).render(
  <HomePage firstName="Alex" />
);