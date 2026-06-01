# ✨ Magic Maths — Vedic & Mental Maths for every age (5 to grown-up)

A colourful, friendly web app to **learn and practise Vedic Maths and mental-maths
shortcuts**. You type your name, pick your age, and get a dashboard of techniques —
each one a mini-course with a guide, diagrams and read-aloud, followed by an **endless,
auto-generated question bank** at three levels.

Content spans **young children right through to adults**, grouped into four tiers
(Starter · Junior · Teen · Master) so everyone sees the right material first.

Share it by link with anyone. No accounts, no ads.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/mayank201181/VedicMaths)

---

## What it does

- **Name to start**, then an **age-band picker** (5–6 / 7–8 / 9–10 / 11–12 / 13–16 / 16+)
  that sets the starting difficulty and opens the matching tier first.
- **Techniques grouped into tiers** (Starter · Junior · Teen · Master) on the dashboard;
  the tier for your age opens automatically and the rest are one tap away.
- Each technique is a **mini-course**: intro, step-by-step method, worked examples, an
  **SVG diagram** and a 🔊 **read-aloud** button.
- **Three levels per technique:**
  - 🟢 **Basic** — multiple choice (tap the answer)
  - 🟡 **Intermediate** & 🔴 **Advanced** — type the answer (lenient checking)
- **💡 Hint** on every question and a **step-by-step explanation** after every answer
  (read aloud when wrong) so kids learn the *why*.
- **Endless practice:** 25 questions to start, then **“Add 25 more”** or **“a bit harder ⬆️”**.
- **Crowns 👑 + stars ⭐** for motivation, plus a lightweight **grown-ups** progress screen.
- Works **offline** (local cache) and **syncs across devices** when Vercel KV is configured.

### Techniques included

- **Starter (5–8):** Friends of 10 & 100 (*all from 9, last from 10*) · Doubling & Halving ·
  Quick Adding · Clever Subtracting · ×10/100/1000 · the 5 / 9 / 11 tricks.
- **Junior (9–12):** Squares ending in 5 (*Ekādhikena*) · Near a Base (*Nikhilam*) ·
  Vertically & Crosswise (*Ūrdhva-Tiryak*) · Square Any 2-Digit · Easy Percentages.
- **Teen (13–16):** Multiply Any Numbers · Difference of Squares · Cubes · Square Roots ·
  Divisibility Tricks.
- **Master (16+):** Cube Roots · Quick Dividing (÷5/25/50) · Day of the Week · Discounts
  & Percentage Changes.

> Questions are **generated in code**, not stored in lists — so practice is infinite and
> each harder batch simply scales the numbers up. See `js/vedic.js`.

---

## Architecture

Pure web app, **no framework and no build step**. Vanilla JS ES modules + one CSS file.
The backend is a **tiny, zero-dependency Node** layer shared between a local server and
Vercel serverless functions.

```
index.html                 # loads js/app.js as a module
css/styles.css
vercel.json                # static js/ & css/ + /api routing  (required!)
server.js                  # local Node server (node server.js)
server/core.js             # shared request logic (local + serverless)
server/store.js            # Vercel KV / Upstash, else a JSON file
api/content.js             # GET /api/content   (config + technique metadata)
api/question.js            # GET /api/question?topic&difficulty&level
api/player.js              # GET/POST /api/player/:name
js/app.js                  # screens + ONE shared quiz engine
js/content.js              # techniques, guides, SVG diagrams, word-banks, regions
js/vedic.js                # procedural question generators (shared with the API)
js/generators.js           # shared helpers (choices, lenient answer checking)
js/state.js                # player-state shape + ensureShape() migration
js/storage.js              # browser localStorage cache
js/api.js                  # client ↔ server with offline fallback
test/                      # sweep + API + (optional) jsdom UI tests
```

The **same** `js/vedic.js` runs in the browser *and* in the Node API, so questions are
identical everywhere.

---

## Run locally

```bash
node server.js          # → http://localhost:3000
# or: npm start
```

No `npm install` needed to run the app (zero dependencies).

### Tests

```bash
npm test                # generator sweep (660k questions) + API handler tests
# optional headless UI click-through:
npm install --no-save jsdom && node test/ui.test.js
```

---

## Deploy to Vercel

1. Push this repo to GitHub and **import it into Vercel** (no build settings needed).
2. Deploy. `vercel.json` already serves `/js/**` and `/css/**` and routes `/api/*`.
3. After deploy, sanity-check:

```bash
curl -sI https://<your-app>.vercel.app/js/app.js | grep -i content-type   # text/javascript
curl -sI https://<your-app>.vercel.app/css/styles.css | grep -i content-type
curl -s  https://<your-app>.vercel.app/api/content | head -c 80
```

> ⚠️ `vercel.json` is **required** — without it the page can deploy but render blank
> because the JS/CSS 404.

### Optional cross-device sync (Vercel KV)

By default each device keeps its own progress in `localStorage` (and the server falls back
to a JSON file locally). To sync progress across devices:

1. Vercel project → **Storage** → **Create Database** → **KV** → connect to the project.
2. This sets `KV_REST_API_URL` and `KV_REST_API_TOKEN`. **Redeploy.**
3. `server/store.js` detects those vars automatically and switches from the JSON file to KV.

---

## Customising

- **Add a technique:** add an entry to `TECHNIQUES` in `js/content.js` (guide + diagram)
  and a matching generator in `js/vedic.js`. `ensureShape()` backfills old saves so nothing
  breaks. Bump `APP.version` in `js/content.js`.
- **Localise:** word-banks, the currency/region table (`£ / $ / ₹`) and age bands all live
  as plain data at the top of `js/content.js`.
