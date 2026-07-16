# Cosmic Tunnel 3.0 — "Fuld skrue" design
**Dato:** 2026-07-16 · **Status:** Godkendt af Lars

## Baggrund
Kreativ gennemgang (kode + live playtest) viste: menuer og indholdsbredde er stærke,
men spillefeltet mangler fartfornemmelse, meteorerne ser harmløse ud, skibet matcher
ikke pixel-identiteten, død mangler feedback, og skibet kan kun styre venstre/højre.

## A) Fart & Juice
1. **Parallax-stjernefelt:** 3 lag stjerner scroller nedad (CSS transform-loop, 2 stakkede
   kopier pr. lag). Hastighed via CSS-var koblet til level `speedMultiplier`. Fartstriber fra level 7+.
2. **Hit-feedback:** Ved tab af liv: screen shake (400ms), rød radial flash, 120ms hit-stop
   (updateGame springes over). Mindre shake ved boss-død.
3. **Meteor-redesign:** Uregelmæssig border-radius, sten-gradienter, orange ember-kant,
   ild-hale (blurred gradient over meteoren), langsom rotation. Seed pr. obstacle ved spawn.
4. **Pixel-art skib:** Inline-SVG, skarp pixel-stil, cyan/magenta-palet, flakkende pixel-flamme.
   Skibet krænger op til ±18° efter X-hastighed. Svævende ⚡-ikon fjernes.
5. **Storm-varsel:** Blinkende "⚠ METEOR STORM ⚠" pixel-banner + kraftigere vignet.

## B) Op/ned-styring
- Ny state `shipVertical` (top-%, clamp 35–88, default 80). Rendering: `top: %` i stedet for fast `bottom: 20%`.
- Input: mus-Y, ArrowUp/ArrowDown (STEP 1.8 %/frame), touch-Y, tilt-beta på mobil (gamma forbliver X).
- `checkShipCollision(obstacles, shipX, shipY, ...)` — shipY parameter erstatter hardcoded 85 (useCollisions.ts:13).
- Projektiler spawner ved `100 - shipY` (useProjectiles createProjectile får shipY-param).
- UFO-kugler, boss-lasere, power-up-opsamling, gravity well tjekker mod aktuel shipY i useGameState.
- Balance: obstacle-spawn-rate ×1.15.

## C) Bane-variation
- `Obstacle` udvides: `vx?: number`, `kind?: 'meteor' | 'comet'`, `seed?: number`.
- Diagonale meteorer fra level 3+: ~25% spawner med vx ±0.05–0.15 %/frame; fjernes off-screen i siderne.
- Kometer fra level 4+: hver ~15–25s, 2.5× hastighed, stejl diagonal, cyan glød-hale, 150 point hvis skudt.
- GRAZE-bonus: passerer en meteor inden for (radius-sum + 3%) af skibet uden kollision og forbi skibets Y
  → +25 × multiplier, lille "GRAZE!"-tekst ved skibet, flag `grazed` så den kun tæller én gang.

## Berørte filer
Tunnel.tsx, Game.tsx, useGameState.tsx, useObstacles.ts, Obstacles.tsx, Spaceship.tsx,
SpaceshipVessel.tsx, useCollisions.ts, useProjectiles.ts, GameUI.tsx, gameTypes.ts

## Ikke-mål
Bosser, tunnel-mode-visuals, power-ups, lyd, Supabase og menuer røres ikke (udover storm-banner i GameUI).
Ingen refactor af useGameState udover det nødvendige.

## Verifikation
Ingen testinfrastruktur i repoet → manuel verifikation: lokal dev-server, playtest i Chrome
(desktop + smal viewport), screenshots pr. pakke. Lint skal bestå (`npm run lint`).
