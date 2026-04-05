# RBLX Valuation Model

A React + Vite app for modeling Roblox (NYSE: RBLX) valuation, with an AI-powered narrative analysis feature backed by the Claude API.

## Features

- **DCF model** — 10-year discounted cash flow with adjustable growth, margin, WACC, and SBC assumptions
- **Trading comps** — EV/Bookings peer comparison with implied price at various multiples
- **Sensitivity heatmaps** — color-coded tables across WACC/TGR and growth/margin axes
- **Scenario analysis** — five pre-built cases from deep bear to deep bull
- **AI Analysis** — Claude generates a sell-side equity memo tailored to your exact assumptions

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure the Anthropic API key

The AI Analysis tab calls the Anthropic API. You need to provide your API key.

**For local development**, create a `.env` file in the project root:

```
VITE_ANTHROPIC_API_KEY=sk-ant-...
```

Then update `src/hooks/useNarrative.js` to read it:

```js
headers: {
  'Content-Type': 'application/json',
  'x-api-key': import.meta.env.VITE_ANTHROPIC_API_KEY,
  'anthropic-version': '2023-06-01',
  'anthropic-dangerous-direct-browser-access': 'true',
},
```

> **Note**: For production, you should proxy the API call through your own backend to avoid exposing your key in the browser. See the section below.

### 3. Run locally

```bash
npm run dev
```

Open http://localhost:5173

### 4. Build for production

```bash
npm run build
```

Deploy the `dist/` folder to Vercel, Netlify, or any static host.

---

## Deploying to Vercel (recommended)

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import your repo
3. Add `VITE_ANTHROPIC_API_KEY` as an environment variable in Vercel project settings
4. Deploy — Vercel handles the build automatically

---

## Production: proxying the API (recommended)

For a production app, create a simple serverless function so your API key stays server-side:

**`api/analyze.js`** (Vercel serverless function):

```js
export default async function handler(req, res) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(req.body),
  })
  const data = await response.json()
  res.json(data)
}
```

Then change the fetch URL in `useNarrative.js` from `https://api.anthropic.com/v1/messages` to `/api/analyze`.

---

## Project structure

```
src/
  lib/
    dcf.js              # Pure DCF math, scenarios, comps data, formatters
  hooks/
    useNarrative.js     # Claude API hook — sends assumptions + gets memo
  components/
    UI.jsx              # Shared primitives: Card, MetricCard, SliderRow, Tab, Badge
    AssumptionsPanel.jsx
    DCFPanel.jsx
    CompsPanel.jsx
    SensitivityPanel.jsx
    ScenariosPanel.jsx
    NarrativePanel.jsx  # AI analysis UI
  App.jsx               # Layout, tab routing, shared state
  main.jsx
  index.css
```

---

## Key modeling notes

- All margins are expressed as **% of bookings** (not GAAP revenue), since bookings captures actual cash receipts before deferred revenue accounting
- SBC haircut: 0% = ignore SBC entirely (common bull framing); 100% = treat as full economic cost
- Terminal value typically represents 70–80% of total DCF value — WACC and TGR are the most mechanically sensitive inputs
- Current price reference: **$55** (update `ACTUALS.currentPrice` in `src/lib/dcf.js`)
- FY2025 actuals: bookings $6.8B, revenue $4.9B, op. cash flow $1.8B, DAUs 144M

---

*Not financial advice. For educational purposes.*
