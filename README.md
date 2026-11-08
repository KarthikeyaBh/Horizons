# Horizons

**L’heure dorée, pour vous** · The golden hour, for you

Horizons is a desktop event planner for Buffalo, New York. Pick an occasion and the mood you want, then compare Buffalo-area places and time windows within your planning limits.

## Run locally

Use Node.js 20.19+ or 22.12+ and npm. From the project folder:

```sh
npm ci
npm run build
npm start
```

Open http://127.0.0.1:3000. For live editing, run `npm run dev:api` and `npm run dev` in separate terminals, then open the Vite URL.

## What the app does

- Choose from 19 occasions or enter your own. Each occasion has a full-screen scene with several mood grades. Custom mood words leave the current tint in place.
- Set a Buffalo date or date range, time window, starting neighborhood, maximum estimated drive, budget, and indoor/outdoor preference. Sky, precipitation, temperature, and wind preferences are optional. Leave the budget blank to include venues that require a quote.
- Compare up to five distinct venues, with the strongest window for each. Choose a plan to keep it in history and optionally leave a review after the chosen window ends.
- Save a name, email, and optional phone in Profile. The same browser can reopen searches, chosen plans, and reviews.

## Recommendations and data

The curated catalog is in `backend/places.js`. It contains 22 Buffalo-area venues with source links, approximate opening windows, planning cost estimates, and occasion and mood tags. Drive times use an approximate distance formula from the selected neighborhood. Hours, availability, costs, parking, permits, and reservations should be confirmed with the venue.

The planner first filters by dates, hours, drive limit, setting, and known cost within the budget. It then scores occasion fit, travel, daylight/timing, recognized mood tags, and available weather. The percentage is a fit score, not a probability that an event will go as planned. Unknown custom words remain visible. They are excluded from scoring when the tag vocabulary can't interpret them.

Hourly Buffalo forecasts are supplied by [Open-Meteo](https://open-meteo.com/en/docs), cached for 15 minutes. Coverage is up to 16 days and varies by forecast availability. For dates beyond coverage or a service outage, the planner leaves weather out of the score and marks the forecast unavailable. Solar times are estimated when the feed doesn't supply them. Conditions are regional and can vary around Lake Erie.

Venue sources include [Buffalo Waterfront](https://buffalowaterfront.com/outer-harbor), [Buffalo Olmsted Parks](https://www.bfloparks.org/), [Tifft Nature Preserve](https://www.tifft.org/), [New York State Parks](https://parks.ny.gov/visit/state-parks/evangola-state-park), [Buffalo AKG](https://buffaloakg.org/visit), and [the Botanical Gardens](https://www.buffalogardens.com/plan-your-visit/).

## Storage

This hackathon build runs as a single local Express server. An anonymous browser cookie identifies the local profile. There is no sign-in or cross-device sync. Profiles, the latest 50 searches per browser, and reviews are stored in `backend/data/accounts.json`, which is ignored by Git. You can set `HORIZONS_DATA_FILE` to use a separate local file. Do not commit that data file or reuse this local storage setup as a public account system.

The Italiana font is distributed with its SIL Open Font License in `frontend/public/Italiana-OFL.txt`.
