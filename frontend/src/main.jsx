import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

function App() {
  return (
    <main>
      <p className="location">Buffalo, New York</p>
      <h1>Horizons</h1>
      <p className="tagline" lang="fr">L’heure dorée, pour vous</p>
      <p>The golden hour, for you</p>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
