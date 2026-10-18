# Chess Dojo

A personal chess practice site:

- **Today** – a daily checklist that links out to external training (Lichess mate-in-1, Gotham Chess, chess.com bots). Progress resets at local midnight; a 28-day strip shows your streak.
- **Opening Drill** – Stockfish plays White from the book in `opening-identification/phase-1.json`. You play Black and name each opening as it appears (multiple choice). When the book line ends, the game continues as free play against Stockfish. Playing outside Phase 1 stops the drill; you can keep playing or start a new one.
- **Play** – a regular game against Stockfish as either color.

Stockfish 19 (lite, single-threaded WASM) runs entirely in your browser. All progress is stored in `localStorage`.

## Run locally

```bash
npm install      # also copies the Stockfish engine into public/engine
npm run dev      # http://localhost:5173
npm test         # opening tree + drill state machine tests
npm run build    # static site in dist/
```

## Customising

- **Daily tasks:** edit `src/data/todos.json` (`id`, `title`, `url`, `target`). A target of 1 shows a checkbox; larger targets show a counter.
- **Multiple-choice filler names:** `src/data/distractors.json`.
- **Opening phases:** add `opening-identification/phase-2.json` in the same format, then register it in `src/openings/phases.ts`. Lines are validated with chess.js at startup and in `npm test`.

## Engine strength

The slider runs from ~800 to 3000 Elo.

- At Stockfish's calibrated floor (1320) and above, it uses `UCI_LimitStrength` + `UCI_Elo`.
- Below that, it uses `Skill Level 0` with a shallow depth cap. Those Elo labels are rough estimates.

Strength changes take effect on Stockfish's next move, including mid-game.

## Deploy

The build is fully static and uses hash routing plus a relative base path, so it works on any static host:

- **GitHub Pages:** push to `main`; `.github/workflows/deploy.yml` tests, builds and publishes. In the repo settings, set Pages → Source to "GitHub Actions".
- **Netlify / Cloudflare Pages:** build command `npm run build`, output directory `dist`.
