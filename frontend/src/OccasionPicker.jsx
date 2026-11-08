import React, { useEffect, useRef, useState } from 'react';
import logo from './assets/Horizons-Logo.svg';

const categories = [
  {
    name: 'Celebrations',
    events: [
      ['proposal', 'Proposal', 'A moment for two'],
      ['birthday', 'Birthday', 'Cake, guests, and photos'],
      ['party', 'Party', 'Music, dancing, or mingling'],
      ['graduation', 'Graduation celebration', 'Room for family and friends'],
      ['wedding', 'Small wedding ceremony', 'A backdrop for the ceremony'],
      ['shower', 'Baby or bridal shower', 'A seated gathering with gifts'],
    ],
  },
  {
    name: 'Time together',
    events: [
      ['date', 'Date', 'Somewhere to linger'],
      ['hangout', 'Hangout', 'A casual spot for friends'],
      ['picnic', 'Picnic', 'Room for a blanket or table'],
      ['family', 'Family outing', 'A place for different ages'],
      ['dog', 'Dog outing', 'Space to walk or play'],
      ['meetup', 'Club or community meetup', 'A meeting point for a group'],
    ],
  },
  {
    name: 'Outdoors',
    events: [
      ['sightseeing', 'Sightseeing', 'Landmarks and viewpoints'],
      ['sunrise-sunset', 'Sunrise or sunset watching', 'An open view of the horizon'],
      ['stargazing', 'Stargazing', 'A dark, open sky'],
      ['hiking', 'Hiking or nature walk', 'A route that fits your pace'],
      ['birdwatching', 'Birdwatching', 'Quiet spots with clear views'],
      ['sports', 'Outdoor games or sports', 'Room to play'],
      ['campfire', 'Campfire gathering', 'A designated fire area'],
    ],
  },
];

function DirectionArrow({ left = false }) {
  return (
    <svg className="picker-arrow" viewBox="0 0 24 24" aria-hidden="true">
      <path d={left ? 'M20 12H4m7-7-7 7 7 7' : 'M4 12h16m-7-7 7 7-7 7'} />
    </svg>
  );
}

export default function OccasionPicker({ accountActions, selectedOccasion, onSelectOccasion }) {
  const [categoryIndex, setCategoryIndex] = useState(() => Math.max(0, categories.findIndex(
    (category) => category.events.some(([id]) => id === selectedOccasion?.id)
  )));
  const [showOther, setShowOther] = useState(false);
  const [customName, setCustomName] = useState('');
  const titleRef = useRef(null);

  useEffect(() => {
    titleRef.current?.focus({ preventScroll: true });
  }, [showOther]);

  function submitOther(event) {
    event.preventDefault();
    const label = customName.trim();
    if (!label) return;
    onSelectOccasion({ id: 'other', label });
    setShowOther(false);
  }

  return (
    <div
      className="picker-page"
      onWheel={(event) => {
        if (!showOther && !event.ctrlKey && event.deltaY < -15
          && Math.abs(event.deltaY) > Math.abs(event.deltaX) && window.scrollY === 0) {
          window.location.hash = 'home';
        }
      }}
    >
      <header className="picker-header">
        <a className="picker-logo" href="#home" aria-label="Horizons home">
          <img src={logo} alt="" width="182" height="44" />
        </a>
        {accountActions}
      </header>

      <main className={showOther ? 'picker-content picker-content-custom' : 'picker-content'}>
        {showOther ? (
          <button className="picker-back" type="button" onClick={() => setShowOther(false)}>
            <DirectionArrow left /> Occasions
          </button>
        ) : (
          <a className="picker-back" href="#home"><DirectionArrow left /> Home</a>
        )}

        <div className="picker-intro">
          <p className="picker-step">01 / Occasion</p>
          <h1 ref={titleRef} tabIndex={-1}>
            {showOther ? 'Name your event' : 'What are you planning?'}
          </h1>
          <p>{showOther ? 'Give your occasion a name to make it yours.' : 'Choose the closest fit for your event.'}</p>
        </div>

        {showOther ? (
          <form className="picker-custom" onSubmit={submitOther}>
            <label htmlFor="custom-event-name">Event name</label>
            <input
              id="custom-event-name"
              value={customName}
              onChange={(event) => setCustomName(event.target.value)}
              maxLength={80}
              placeholder="e.g., A neighborhood block party"
              required
            />
            <button type="submit" disabled={!customName.trim()}>Set the mood</button>
          </form>
        ) : (
          <>
            <div className="picker-categories" role="group" aria-label="Event categories">
              {categories.map(({ name }, index) => (
                <button
                  key={name}
                  type="button"
                  aria-pressed={index === categoryIndex}
                  onClick={() => setCategoryIndex(index)}
                >
                  {name}
                </button>
              ))}
            </div>

            <div className="picker-events" aria-label={categories[categoryIndex].name}>
              {categories[categoryIndex].events.map(([id, label, detail]) => (
                <button
                  className="picker-card"
                  type="button"
                  key={id}
                  aria-pressed={selectedOccasion?.id === id}
                  onClick={() => onSelectOccasion({ id, label })}
                >
                  <span>{label}</span>
                  <small>{detail}</small>
                </button>
              ))}
            </div>

            <button className="picker-card picker-other" type="button" onClick={() => {
              setCustomName(selectedOccasion?.id === 'other' ? selectedOccasion.label : '');
              setShowOther(true);
            }}>
              <span className="picker-other-copy">
                <span>Other</span>
                <small>Name your own event</small>
              </span>
              <DirectionArrow />
            </button>

            <p className="picker-status" role="status">
              {selectedOccasion ? `Selected: ${selectedOccasion.label}` : ''}
            </p>
          </>
        )}
      </main>
    </div>
  );
}
