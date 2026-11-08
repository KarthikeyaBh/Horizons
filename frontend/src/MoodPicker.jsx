import React, { useEffect, useRef, useState } from 'react';
import logo from './assets/Horizons-Logo.svg';
import { moodScenes } from './moodScenes.js';

export const emptyMoodSelection = { presets: [], custom: [] };

function Arrow({ back = false }) {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true">
      <path d={back ? 'M20 12H4m7-7-7 7 7 7' : 'M4 12h16m-7-7 7 7-7 7'} />
    </svg>
  );
}

function CustomMoodDialog({ dialogRef, selection, onChange }) {
  const [word, setWord] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  function addWord(event) {
    event.preventDefault();
    const nextWord = word.trim();
    if (!nextWord) {
      setError('Enter a word or short phrase.');
      inputRef.current?.focus();
      return;
    }
    if ([...selection.presets, ...selection.custom].some(
      (existing) => existing.toLowerCase() === nextWord.toLowerCase()
    )) {
      setError('You already selected that mood.');
      return;
    }
    onChange({ ...selection, custom: [...selection.custom, nextWord] });
    dialogRef.current.close();
  }

  return (
    <dialog
      className="mood-dialog"
      ref={dialogRef}
      aria-labelledby="custom-mood-title"
      onClose={() => {
        setWord('');
        setError('');
      }}
    >
      <form onSubmit={addWord}>
        <div className="mood-dialog-heading">
          <h2 id="custom-mood-title">Describe your mood</h2>
          <button className="mood-close" type="button" aria-label="Close" onClick={() => dialogRef.current.close()}>×</button>
        </div>
        <p>Your words leave the background as it is.</p>
        <label htmlFor="custom-mood-word">Mood word or phrase</label>
        <input
          id="custom-mood-word"
          ref={inputRef}
          value={word}
          onChange={(event) => {
            setWord(event.target.value);
            setError('');
          }}
          placeholder="e.g. nostalgic, slow-paced"
          maxLength={40}
          required
        />
        {error && <p role="alert">{error}</p>}
        <button className="mood-dialog-submit" type="submit">Add mood</button>
      </form>
    </dialog>
  );
}

export default function MoodPicker({ occasion, selection, onChange, onContinue }) {
  const scene = moodScenes[occasion.id] ?? moodScenes.other;
  const latestPreset = selection.presets.at(-1);
  const grade = scene.presets.find((preset) => preset.word === latestPreset);
  const dialogRef = useRef(null);
  const headingRef = useRef(null);
  const dropTimer = useRef(null);
  const [leaving, setLeaving] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
    return () => clearTimeout(dropTimer.current);
  }, []);

  function togglePreset(word) {
    if (selection.presets.includes(word)) {
      onChange({ ...selection, presets: selection.presets.filter((preset) => preset !== word) });
      return;
    }
    onChange({
      presets: [...selection.presets, word],
      custom: selection.custom.filter((customWord) => customWord.toLowerCase() !== word.toLowerCase()),
    });
  }

  return (
    <div className={leaving ? 'mood-page mood-leaving' : 'mood-page'} onPointerMove={event => {
      if (event.pointerType !== 'mouse' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const page = event.currentTarget;
      const frame = page.getBoundingClientRect();
      page.style.setProperty('--scene-x', ((event.clientX - frame.left) / frame.width - .5) * -13 + 'px');
      page.style.setProperty('--scene-y', ((event.clientY - frame.top) / frame.height - .5) * -9 + 'px');
    }} onPointerLeave={event => {
      event.currentTarget.style.removeProperty('--scene-x');
      event.currentTarget.style.removeProperty('--scene-y');
    }} style={{
      '--mood-tint': grade?.color ?? 'transparent',
      '--mood-opacity': grade?.opacity ?? 0,
      '--mood-brightness': grade?.brightness ?? 1,
      '--mood-saturation': grade?.saturation ?? 1,
      '--mood-contrast': grade?.contrast ?? 1,
    }}>
      <div className="mood-background">
        {!imageFailed && (
          <img src={scene.image} alt={scene.alt} fetchPriority="high" onError={() => setImageFailed(true)} />
        )}
        <div className="mood-color-grade" aria-hidden="true" />
        <div className="mood-scrim" aria-hidden="true" />
      </div>

      <header className="mood-header">
        <a href="#home" className="mood-logo" aria-label="Horizons home">
          <img src={logo} alt="" width="182" height="44" />
        </a>
      </header>

      <main className="mood-content">
        <a className="mood-back" href="#occasion"><Arrow back /> Occasion</a>

        <div className="mood-intro">
          <p className="mood-step">02 / {occasion.label}</p>
          <h1 ref={headingRef} tabIndex={-1}>How should<br />it feel?</h1>
          <p>Pick a mood and watch the scene change.</p>
        </div>

        <div className="mood-options" role="group" aria-label="Suggested moods">
          {scene.presets.map((preset) => (
            <button
              key={preset.word}
              className="mood-option"
              type="button"
              aria-pressed={selection.presets.includes(preset.word)}
              style={{ '--mood-swatch': preset.color }}
              onClick={() => togglePreset(preset.word)}
            >
              <span>{preset.word}</span>
              <small>{preset.detail}</small>
            </button>
          ))}
          <button className="mood-other" type="button" aria-haspopup="dialog" onClick={() => dialogRef.current.showModal()}>
            Other mood <span aria-hidden="true">+</span>
          </button>
        </div>

        {selection.custom.length > 0 && (
          <ul className="mood-custom-list" aria-label="Your custom moods">
            {selection.custom.map((word) => (
              <li key={word}>
                <button type="button" aria-label={`Remove ${word}`} onClick={() => onChange({
                  ...selection,
                  custom: selection.custom.filter((customWord) => customWord !== word),
                })}>
                  {word} <span aria-hidden="true">×</span>
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="mood-footer">
          <button
            className="mood-continue"
            type="button"
            disabled={leaving || (!selection.presets.length && !selection.custom.length)}
            onClick={() => {
              if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                onContinue();
              } else {
                setLeaving(true);
                dropTimer.current = setTimeout(onContinue, 440);
              }
            }}
          >
            Practical details <Arrow />
          </button>
        </div>
      </main>

      <CustomMoodDialog dialogRef={dialogRef} selection={selection} onChange={onChange} />
    </div>
  );
}

