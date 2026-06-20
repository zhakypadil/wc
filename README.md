# World Cup 2026 Prediction Leaderboard

Live leaderboard for a ~20-friends prediction game. Reads each player's Excel file,
computes points against live API-Football results, and shows a ranked table with
per-player breakdowns.

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Add player Excel files

Drop each player's `.xlsx` file into:

```
data/predictions/
  alice.xlsx
  bob.xlsx
  ...
```

The app auto-discovers all `.xlsx`/`.xls` files in that directory. Player names are
read from **Home!C10** (the "Write your name" cell). If blank, it falls back to
**Pool!C5**, then to the filename.

### 3. Add player photos (optional)

Drop portrait photos into `/public/players/`:

```
public/players/
  alice.jpg
  bob.jpg
  ...
```

Then edit **`config/players-reveal.ts`** to map each letter to the correct name and
image path. This powers the A–Z letter-reveal board on the homepage.

### 4. Configure the app

Edit **`config/settings.ts`**:

```ts
export const API_FOOTBALL_KEY = 'your_key_here'   // api-sports.io
export const OPENFOOTBALL_URL = ''                 // optional fallback
export const RESULTS_REVALIDATE_SECONDS = 60       // cache TTL
```

**Free tier note:** api-sports.io free tier allows 100 requests/day.
At 60 s revalidation that's ~1 440 calls/day — set `RESULTS_REVALIDATE_SECONDS = 900`
(15 min) to stay under quota, or upgrade to a paid plan.

### 5. Run

```bash
npm run dev     # development
npm run build && npm start  # production
```

Open [http://localhost:3000](http://localhost:3000).

---

## Updating

| What changed | What to do |
|---|---|
| New player Excel file added | Drop the file in `data/predictions/`. Predictions cache expires in 1 hour, or call `POST /api/revalidate?tag=predictions` to bust immediately. |
| Player re-submitted their file | Replace the file and call `POST /api/revalidate?tag=predictions`. |
| Want fresh live scores now | Call `POST /api/revalidate?tag=results`. |
| Force full refresh | `POST /api/revalidate?tag=all` |
| Add/change player photo | Drop in `/public/players/`, update `config/players-reveal.ts`. |

---

## Caching strategy

| Cache | TTL | Tag |
|---|---|---|
| Excel predictions | 1 hour | `predictions` |
| Live results (API-Football) | 60 s (configurable) | `results` |
| Full leaderboard output | 60 s | `leaderboard` |

Caching uses Next.js 16 **Cache Components** (`'use cache'` directive). The
predictions and results caches are independent, so a file update only invalidates
`predictions` while live results remain cached.

On server restart all in-memory caches clear automatically.

---

## Scoring

### Group stage (per match)
Nested tiers — higher tiers include lower ones:

| Prediction | Points |
|---|---|
| Correct outcome only | 1 |
| Correct outcome + correct goal difference | 2 |
| Exact score | 3 |

### Knockout stage (per round)
Points for each correctly predicted team:

| Round | Points/team |
|---|---|
| Round of 32 (16-Finalist) | +3 |
| Round of 16 (8-Finalist) | +6 |
| Quarter-finals | +12 |
| Semi-finals | +24 |
| Final participants | +36 |
| 🥇 Champion | +48 |
| 🥉 Third place winner | +12 |

Rounds are only scored once all their matches have finished.

### Final score bonus
+8 points if the predicted winner **and** the exact goals in the final both match.

---

## Project structure

```
app/
  page.tsx                  Leaderboard homepage
  player/[name]/page.tsx    Per-player breakdown
  api/revalidate/route.ts   Cache-bust endpoint
lib/
  types.ts                  Shared TypeScript interfaces
  team-names.ts             Team name normalization (Türkiye ↔ Turkey, etc.)
  excel-parser.ts           Parse Pool sheet from player Excel files
  results-fetcher.ts        API-Football + openfootball fallback
  scorer.ts                 Pure scoring functions
  data.ts                   Cached data access layer
config/
  players-reveal.ts         Letter → player → photo mapping
components/
  LeaderboardTable.tsx      Ranked table with progress bars
  PlayerBreakdown.tsx       Per-match and per-round score detail
  LetterReveal.tsx          A–Z interactive reveal board (client component)
data/predictions/           Drop player .xlsx files here
public/players/             Drop player portrait photos here
```
