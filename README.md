# TenSyGrid x VeraGrid Live Leaderboard

A lightweight, responsive leaderboard for the **TenSyGrid x VeraGrid 1-day hackathon challenge**, held on 26 November 2026 and organised by UPC, CITCEA, eRoots, and the CETPartnership Horizon Europe consortium.

The application displays the live ranking for the dynamic topology optimisation and converter tuning challenge. It is a fully static website built with HTML5, CSS3, and Vanilla JavaScript—no framework, build step, backend, database, or external API is required.

## TenSyGrid consortium

The project partners represented on the website are:

- Fraunhofer Institute for Wind Energy Systems IWES
- Universitat Politècnica de Catalunya (UPC)
- Hamburg University of Applied Sciences (HAW Hamburg)
- eRoots Analytics
- University of Malta

CETPartnership is presented separately as the co-funding programme.

## Features

- Automatic ranking by weighted total score
- Real-time team search that preserves each team's global position
- Percentage formatting for all four evaluation metrics
- Gold, silver, and bronze podium highlights
- Warning state for teams with an unstable mode (`damping === 0`)
- Manual data refresh without reloading the page
- Cache-busting requests for newly deployed ranking data
- Responsive table with horizontal scrolling on small screens
- Accessible labels, status announcements, and keyboard focus states
- Official TenSyGrid, VeraGrid, and CETPartnership visual identity

## Project structure

```text
.
├── index.html                  # Page structure and accessible content
├── style.css                  # Responsive TenSyGrid-inspired styling
├── app.js                     # Data loading, scoring, sorting, and filtering
├── ranking.json               # Team metrics and names
├── images/
│   ├── cetpartnership-logo.png
│   ├── eroots_logos/
│   │   └── eRoots_logo_final_v2_landscape_fullColor.png
│   ├── partner-fraunhofer-iwes.png
│   ├── partner-haw-hamburg.png
│   ├── partner-university-malta.png
│   ├── partner-upc.png
│   ├── tensygrid-icon.png
│   ├── tensygrid-logo.png
│   └── veragrid-logo.png
├── fonts/
│   ├── raleway-bold.ttf
│   ├── raleway-regular.ttf
│   └── raleway-semibold.ttf
└── .gitignore
```

## Scoring formula

Every metric must be normalised to the range `[0, 1]`. The browser calculates the total score dynamically on a 100-point scale:

```text
Score = (
  0.35 × damping +
  0.25 × loss +
  0.25 × robustness +
  0.15 × changes
) × 100
```

| Metric | Description | Weight |
| --- | --- | ---: |
| `damping` | Dynamic stability and modal damping margin | 35% |
| `loss` | Static transmission loss reduction | 25% |
| `robustness` | Share of stable, voltage-compliant scenarios | 25% |
| `changes` | Linear score for structural network changes | 15% |

A `damping` value of `0` indicates an unstable mode and is highlighted in red.

## Ranking data

Edit [`ranking.json`](ranking.json) to update the leaderboard. Each array item represents one team:

```json
{
  "name": "Grid Guardians",
  "damping": 0.94,
  "loss": 0.88,
  "robustness": 0.92,
  "changes": 0.81
}
```

Requirements:

- `name` must be a non-empty string.
- All four metrics must be numbers between `0` and `1`, inclusive.
- Do not add a position or total score; both are calculated automatically.
- Team names should be unique to avoid ambiguity in the ranking.

Invalid data is rejected and an error message is shown instead of a partial ranking.

## Run locally

Because the page fetches `ranking.json`, it must be served over HTTP rather than opened directly from the filesystem.

From the project root, run:

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

No dependency installation or build command is needed.

## Update the live leaderboard

1. Edit `ranking.json`.
2. Check the result locally.
3. Commit and push the change:

```bash
git add ranking.json
git commit -m "Update leaderboard results"
git push
```

Vercel will create a new deployment automatically when the GitHub repository is connected. The application requests:

```js
fetch(`ranking.json?t=${Date.now()}`, { cache: "no-store" })
```

This prevents the browser from displaying an outdated ranking after deployment.

## Deploy to Vercel

1. Push the repository to GitHub.
2. In Vercel, select **Add New → Project**.
3. Import the GitHub repository.
4. Select **Other** as the framework preset.
5. Leave the build command and output directory empty.
6. Select **Deploy**.

The files are served directly from the repository root, so no `vercel.json` configuration is required.

## Technology

- Semantic HTML5
- CSS3 with locally hosted Raleway fonts
- Vanilla JavaScript using the Fetch API and DOM APIs
- Static JSON data
- Vercel static hosting
