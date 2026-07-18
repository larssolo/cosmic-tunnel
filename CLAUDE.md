# Cosmic Tunnel — projektregler

Retro-arcade browserspil (React + Vite + Tailwind, Supabase leaderboard).
Live: https://cosmic-tunnelgame.vercel.app — deployes automatisk fra `main`
via Vercels Git-integration.

## Versionering (VIGTIGT)

**Bump altid versionen i `package.json` når feature- eller fix-ændringer
merges til `main`** (`npm version <ny-version> --no-git-tag-version` i samme
PR som ændringen):

- Nye features / gameplay-ændringer → minor (3.1.0 → 3.2.0)
- Rene bugfixes / småjusteringer → patch (3.1.0 → 3.1.1)

Start-skærmen viser `v{__APP_VERSION__}` (injiceret fra `package.json` i
`vite.config.ts`) — versionsnummeret er brugerens eneste måde at se, om den
nyeste version er live på telefonen. Et merge uden versions-bump er derfor
ufuldstændigt.

## Konventioner

- Al spil-UI bruger arcade-æstetikken: 'Press Start 2P', neon-farver
  (#ff00ff / #00ffff / #ffff00), sort baggrund — ingen generiske
  afrundede paneler.
- Mobil styres med relativ drag (fingeren behøver ikke dække skibet) og
  auto-fire mens fingeren holdes nede. Desktop: mus + klik/Space.
- `npm run build` skal være fri for advarsler (chunk-splitting er sat op i
  `vite.config.ts` med manualChunks).
- Lokal test kræver dummy-env: opret `.env.local` med `VITE_SUPABASE_URL`
  og `VITE_SUPABASE_PUBLISHABLE_KEY` (må ikke committes).
