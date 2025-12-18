# Vercel-ready Weather App (static + serverless)

This repo is a Vercel-friendly version of your project:
- Static frontend at `/public/index.html`
- Serverless endpoint at `/api/weather`

## Local run (optional)
You can open `public/index.html` directly in a browser, or use any static server.

## Deploy to Vercel
1. Create a new Vercel project from this folder (GitHub upload or drag-and-drop).
2. Framework preset: **Other** (static)
3. No build command needed.
4. Deploy.

Then visit:
- `https://<your-app>.vercel.app/` for the UI
- `https://<your-app>.vercel.app/api/weather?city=Baltimore` for the API

## Notes
- The API returns simulated weather data (no API keys required).
