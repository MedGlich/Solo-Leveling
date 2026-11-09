# Shadow Academy — Personal Monarch Path Dashboard

A standalone, offline-first progressive web app for tracking study, focus, and daily habits. It uses no external dependencies, CDN fonts, or borrowed artwork. Its dark-fantasy theme and visual identity are original. Activities are habit-organization tools, not medical advice.

## Run the app

- **Quick start:** Open `index.html` directly. The JavaScript files are classic scripts, so the core logic also works from `file://`. Browser storage for file URLs may be limited or vary by browser; use a local server or GitHub Pages for reliable storage and PWA installation.
- **Local server:** From the project directory, run `python -m http.server 8000`, then open `http://localhost:8000`.
- **PWA and service worker:** Run over HTTPS (including GitHub Pages) or localhost. Service workers do not run from `file://`.

## Publish with GitHub Pages

1. Push this directory to a new GitHub repository. For example:
   ```sh
   git init
   git add .
   git commit -m "Create Shadow Academy PWA"
   git branch -M main
   git remote add origin https://github.com/USERNAME/REPOSITORY.git
   git push -u origin main
   ```
2. In the repository, open **Settings → Pages**. Under **Build and deployment**, select **Deploy from a branch**, choose `main` and `/ (root)`, then save.
3. When deployment finishes, open the published URL. Assets use relative (`./`) paths, so the app also works from a repository subpath.

## Features and progression

- The current date uses the device's local time zone. The Persian calendar day number is obtained with `Intl.DateTimeFormat('en-US-u-ca-persian')` to choose even/odd workout days. If the browser does not support the calendar, a Gregorian fallback is clearly identified.
- The start date is saved on first launch as local `YYYY-MM-DD`. Elapsed days are calculated in UTC from date-only values; the three-year milestone uses calendar-year arithmetic.
- Daily activities include two 45-minute study blocks from six named subjects, 15-minute active recall, a rotating 14-day focus and reading plan, meditation, gamified exercise, and optional habits.
- Study and recall have the highest base XP. Daily XP is derived from current statuses: checking a task again does not duplicate points, and unchecking removes them. Water and sugar tracking award or deduct no XP.
- Ranks require both XP and elapsed time. S-Rank requires at least 150,000 XP and 548 days. The top rank requires 210,000 XP and the three-year milestone (1,095 displayed days minimum). Weekly rewards are 250 XP for five study days and 150 XP for three focus days. A weekly claim is available once; if both rewards are unlocked, both are granted together.
- Includes versioned JSON export/import, confirmation before replacing or clearing data, an editable profile, weight history, weekly history, and a focus timer.

## Safety, health, and realism

Swimming, sit-ups, and planks are displayed as elapsed days plus a starting value. Unlimited daily increases are not a safe training plan; these values are game targets, not clinical prescriptions. Stop exercising if you feel pain and rest or choose a lower-intensity alternative. Recovery mode is not counted as a full completion and awards less XP. Match exercise intensity to your fitness; an hour is not mandatory.

The app does not assume an age or gender, provide a diagnostic BMI or set a calorie goal. Calorie logging is only a personal journal. Nutrition and sleep needs vary; consult a qualified professional for medical decisions. Meditation is optional and should be stopped if uncomfortable. Third-eye, chakra, magic, and necromancy themes are symbolic or fictional goals; no supernatural powers are guaranteed or established. Avoid rituals or practices that disrupt sleep.

General references for safety and evidence:
- CDC, physical activity guidelines for adults: https://www.cdc.gov/physical-activity-basics/guidelines/adults.html
- ACSM, resistance training (2026 update): https://acsm.org/education-resources/trending-topics-resources/physical-activity-guidelines/
- Research review related to exercise and cognition, PMID 30127731: https://pubmed.ncbi.nlm.nih.gov/30127731/
- Research review related to physical activity, PMID 41021694: https://pubmed.ncbi.nlm.nih.gov/41021694/

## Data and privacy

There is no server, account, or cloud sync. State is stored in the browser's `localStorage` for the same device and origin. Clearing browser data, using private browsing, or changing origin may make data unavailable. Export a JSON backup before changing devices or clearing data. Imports must have `schemaVersion: 1` and valid data; only import files you trust.

## Development and tests

Requires Node.js 18 or later; no dependency installation is needed:

```sh
npm test
```

Core logic lives in `logic.js`. It exposes `window.ShadowLogic` for classic-script browser compatibility and CommonJS for Node.js tests.
