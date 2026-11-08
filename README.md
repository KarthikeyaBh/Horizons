# Horizons

*L’heure dorée, pour vous* — The golden hour, for you.

Horizons helps people in Buffalo find a place and time that fit how they want an event to feel. Whether they’re planning a quiet proposal, a lively birthday, or a casual hangout, they can describe the mood they’re after and compare options based on the setting, weather, lighting, cost, and travel time. The goal is to help people choose the details they’ll remember without having to piece together maps, forecasts, and venue information on their own.

## Project structure

- `frontend/` contains the HTML entry point, a React component, and plain CSS. Vite runs the development server.
- `backend/` contains an Express server with a starter health endpoint at `/api/health`.
- The root `package.json` and `package-lock.json` manage dependencies for both folders.

## Run locally

Open the `Horizons` folder in VS Code. Use Node.js 22.12 or newer. In the terminal, run:

```powershell
npm.cmd ci
npm.cmd run build
npm.cmd start
```

Open http://127.0.0.1:3000. Visit http://127.0.0.1:3000/api/health to check the API. On macOS or Linux, replace `npm.cmd` with `npm`.

For development with live reload, run `npm.cmd run dev:api` in one terminal and `npm.cmd run dev` in another. Open the URL printed by Vite.
