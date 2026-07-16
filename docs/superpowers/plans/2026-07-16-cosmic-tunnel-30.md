# Cosmic Tunnel 3.0 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add speed sensation, hit feedback, menacing meteor/ship visuals, vertical steering, and trajectory variety (diagonals, comets, graze bonus) to the Cosmic Tunnel arcade game.

**Architecture:** All changes stay inside the existing React/DOM game architecture: `useGameState.updateGame()` runs per frame from `Game.tsx`'s single rAF loop; visuals are CSS-animated DOM components. No new dependencies, no canvas rewrites (except existing TunnelMode canvas, untouched).

**Tech Stack:** Vite + React 18 + TypeScript, Tailwind + inline styles, CSS keyframe animations.

## Global Constraints

- Repo has NO test framework. Do NOT add a test framework.
- LINT BASELINE (clean tree, pre-existing, NOT introduced by this work): **11 errors + 12 warnings = 23 problems** total, across App.tsx, tailwind.config.ts, useGameState.tsx (incl. `602:9 prefer-const`), and other existing files. Verification per task = `npm run lint` shows **no NEW problems beyond this baseline** (a changed file must not add errors/warnings; ideally the total stays 23) + `npm run build` passes (chunk-size advisory is expected and fine) + the task's manual browser check. Do NOT attempt to fix the pre-existing 23 problems — they are out of scope.
- Do not touch: bosses' behavior, tunnel-mode canvas visuals, power-up configs, sounds, Supabase services, menu screens (StartScreen/VictoryScreen/etc.).
- Spec: `docs/superpowers/specs/2026-07-16-cosmic-tunnel-30-design.md`.
- Fonts/palette: in-game text uses `'Press Start 2P', monospace`; neon palette cyan `#00e5ff` / magenta `#ff2d95` / yellow `#ffff00`.
- Work on branch `feature/cosmic-30` (created in Task 1).
- Every commit message ends with the trailer line: `Co-Authored-By: WOZCODE <contact@withwoz.com>`
- Dev server: `npm run dev` (Vite, default port 8080 or as printed). Keep it running between tasks for manual checks.

---

### Task 1: Branch setup + scrolling parallax starfield (spec A1)

**Files:**
- Modify: `src/components/Tunnel.tsx` (replace static `Stars` with scrolling layers)
- Modify: `src/components/Game.tsx` (pass `speedMultiplier` prop)

**Interfaces:**
- Produces: `Tunnel` component signature becomes `({ speedMultiplier?: number })` (default 1). Later tasks don't depend on it, but Game.tsx renders `<Tunnel speedMultiplier={currentLevelData.speedMultiplier} />`.

- [ ] **Step 1: Setup**

```bash
cd ~/cosmic-tunnel && git checkout -b feature/cosmic-30 && npm install && npm run lint
```
Expected: lint passes on clean tree. Start `npm run dev` in background; open the printed localhost URL, confirm game loads.

- [ ] **Step 2: Replace the `Stars` component in `src/components/Tunnel.tsx`**

Delete `generateStars` and the `Stars` memo component. Insert:

```tsx
const STAR_LAYERS = [
  { count: 40, sizeMin: 1,   sizeMax: 2,   opacity: 0.45, baseDuration: 70 }, // far
  { count: 22, sizeMin: 1.5, sizeMax: 2.5, opacity: 0.7,  baseDuration: 34 }, // mid
  { count: 10, sizeMin: 2,   sizeMax: 3.5, opacity: 1,    baseDuration: 16 }, // near
];

const generateLayerStars = (count: number, sizeMin: number, sizeMax: number) =>
  Array.from({ length: count }).map((_, i) => ({
    id: i,
    size: Math.random() * (sizeMax - sizeMin) + sizeMin,
    left: Math.random() * 100,
    top: Math.random() * 100,
    color: i % 5 === 0 ? "#D6BCFA" : i % 3 === 0 ? "#9b87f5" : "#fff",
  }));

const ScrollingStars = memo(({ speedMultiplier }: { speedMultiplier: number }) => {
  const layers = React.useMemo(
    () => STAR_LAYERS.map((l) => ({ ...l, stars: generateLayerStars(l.count, l.sizeMin, l.sizeMax) })),
    []
  );
  return (
    <div className="absolute inset-0 overflow-hidden opacity-90">
      {layers.map((layer, li) => (
        <div
          key={li}
          className="absolute inset-x-0"
          style={{
            top: "-100%",
            height: "200%",
            animation: `starScroll ${layer.baseDuration / speedMultiplier}s linear infinite`,
            willChange: "transform",
          }}
        >
          {[0, 1].map((half) => (
            <div key={half} className="absolute inset-x-0" style={{ top: `${half * 50}%`, height: "50%" }}>
              {layer.stars.map((s) => (
                <div
                  key={s.id}
                  className="absolute rounded-full"
                  style={{
                    width: `${s.size}px`, height: `${s.size}px`,
                    background: s.color, opacity: layer.opacity,
                    left: `${s.left}%`, top: `${s.top}%`,
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      ))}
      {/* Speed lines at high velocity (level 7+, speedMultiplier >= 2) */}
      {speedMultiplier >= 2 &&
        Array.from({ length: 6 }).map((_, i) => (
          <div
            key={`sl-${i}`}
            className="absolute"
            style={{
              left: `${8 + i * 16}%`, top: "-20%", width: "1px", height: "90px",
              background: "linear-gradient(to bottom, transparent, rgba(255,255,255,0.35), transparent)",
              animation: `speedLine ${0.5 + (i % 3) * 0.2}s linear ${i * 0.13}s infinite`,
            }}
          />
        ))}
      <style>{`
        @keyframes starScroll { from { transform: translateY(0); } to { transform: translateY(50%); } }
        @keyframes speedLine { from { transform: translateY(0); } to { transform: translateY(140vh); } }
      `}</style>
    </div>
  );
});
```

Change `Tunnel`'s signature and render: `const Tunnel = ({ speedMultiplier = 1 }: { speedMultiplier?: number }) => ...` and replace `<Stars />` with `<ScrollingStars speedMultiplier={speedMultiplier} />`. Keep `Flashes` as-is. Note: `Tunnel` is currently wrapped in `memo` with no props — keep memo; prop changes only on level-up, so re-render cost is fine.

- [ ] **Step 3: Pass the prop from Game.tsx**

In `src/components/Game.tsx` (~line 232) change `<Tunnel />` to `<Tunnel speedMultiplier={currentLevelData.speedMultiplier} />`.

- [ ] **Step 4: Verify**

Run: `npm run lint && npm run build` → both pass. Browser: stars now drift downward continuously; play to Level 2 (score 500) and confirm scroll speed increases slightly. No jank in devtools performance tab (transform-only animation).

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "Add scrolling parallax starfield with level-scaled speed"
```
(remember trailer)

---

### Task 2: Meteor redesign — rocky, glowing, rotating, with fire trail (spec A3)

**Files:**
- Modify: `src/types/gameTypes.ts` (Obstacle: add `seed?: number`)
- Modify: `src/hooks/useObstacles.ts:27` (set seed at spawn)
- Modify: `src/components/Obstacles.tsx:97-121` (normal-asteroid branch)

**Interfaces:**
- Produces: `Obstacle.seed?: number` (0..1, set at spawn). Task 7/8 add more fields to the same interface.

- [ ] **Step 1: Add seed**

`gameTypes.ts` — in `interface Obstacle` add `seed?: number;` after `size`.
`useObstacles.ts` — change the return in `createObstacle` to `return { id: now, x, y: -5, size, seed: Math.random() } as Obstacle;`

- [ ] **Step 2: Replace the normal-asteroid visual in `Obstacles.tsx`**

Replace the block starting at the comment `// Normal asteroid with consistent gradient appearance` (the `<div className="w-full h-full relative">` with base meteor / inner gradient / crater divs) with:

```tsx
        // Rocky meteor: irregular shape, ember rim, fire trail, slow rotation
        (() => {
          const seed = obstacle.seed ?? 0.5;
          const spinDur = 6 + seed * 10;
          const spinDir = seed > 0.5 ? "normal" : "reverse";
          const br = `${38 + seed * 20}% ${62 - seed * 20}% ${45 + seed * 15}% ${55 - seed * 15}% / ${50 + seed * 12}% ${40 + seed * 18}% ${60 - seed * 18}% ${50 - seed * 12}%`;
          return (
            <div className="w-full h-full relative">
              {/* Fire trail — points up because meteors fall down; tilts with drift */}
              <div
                className="absolute left-1/2"
                style={{
                  width: "55%", height: "150%", bottom: "45%",
                  transform: `translateX(-50%) rotate(${(obstacle.vx ?? 0) * -150}deg)`,
                  transformOrigin: "bottom center",
                  background: "linear-gradient(to top, rgba(255,140,0,0.5) 0%, rgba(255,60,0,0.22) 45%, transparent 100%)",
                  filter: "blur(3px)", borderRadius: "50%",
                }}
              />
              {/* Rock body */}
              <div
                className="absolute inset-0"
                style={{
                  borderRadius: br,
                  background: `radial-gradient(circle at ${30 + seed * 20}% ${25 + seed * 20}%, #8a7060 0%, #4a3f38 45%, #201a16 100%)`,
                  boxShadow:
                    "0 0 12px rgba(255,120,0,0.55), inset -3px -4px 8px rgba(0,0,0,0.8), inset 2px 2px 4px rgba(255,160,60,0.28)",
                  border: "1px solid rgba(255,140,40,0.5)",
                  animation: `meteorSpin ${spinDur}s linear infinite ${spinDir}`,
                }}
              >
                <div className="absolute rounded-full bg-black/50" style={{ width: "24%", height: "24%", top: `${15 + seed * 20}%`, left: `${25 + seed * 25}%` }} />
                <div className="absolute rounded-full bg-black/40" style={{ width: "16%", height: "16%", top: `${55 + seed * 12}%`, left: `${60 - seed * 20}%` }} />
              </div>
            </div>
          );
        })()
```

Note `obstacle.vx` doesn't exist until Task 7 — TypeScript will error. Add `vx?: number;` to the Obstacle interface NOW (Task 7 wires up behavior). At the bottom of the `ObstaclesProps`-file's default export area add a shared style block once (inside the outer fragment returned by `Obstacles`):

```tsx
<style>{`@keyframes meteorSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
```

Leave the bonus-round coin branch, dimension styles, and explosion branch untouched.

- [ ] **Step 3: Verify**

`npm run lint && npm run build` → pass. Browser: meteors are now dark craggy rocks with orange glowing rim, upward fire trail, slowly rotating, each slightly different shape. Explosions unchanged. Bonus-round coins unchanged.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "Redesign meteors as rotating rocky bodies with ember glow and fire trail"
```

---

### Task 3: Pixel-art spaceship with banking; remove floating Zap icon (spec A4)

**Files:**
- Modify: `src/components/SpaceshipVessel.tsx` (full rewrite of visual)
- Modify: `src/components/Spaceship.tsx` (banking tilt)

**Interfaces:**
- Produces: `Spaceship` still takes `{ position, isExploding?, isInvulnerable? }` (Task 6 adds `vertical`). `SpaceshipVessel` keeps `{ isInvulnerable }`.

- [ ] **Step 1: Rewrite `SpaceshipVessel.tsx`**

Replace the whole component body (keep memo + props) with a crisp pixel SVG. Remove the `Zap` import entirely.

```tsx
const SpaceshipVessel: React.FC<SpaceshipVesselProps> = memo(({ isInvulnerable }) => {
  return (
    <div className={`relative w-full h-full ${isInvulnerable ? "animate-pulse opacity-80" : ""}`}>
      <svg viewBox="0 0 16 16" className="w-full h-full" style={{ shapeRendering: "crispEdges" }}>
        {/* nose */}
        <rect x="7" y="0" width="2" height="2" fill="#ffffff" />
        <rect x="7" y="2" width="2" height="1" fill="#9be8ff" />
        {/* body */}
        <rect x="6" y="3" width="4" height="6" fill="#00e5ff" />
        <rect x="6" y="3" width="1" height="6" fill="#7df4ff" />
        {/* cockpit */}
        <rect x="7" y="4" width="2" height="2" fill="#ff2d95" />
        <rect x="7" y="4" width="1" height="1" fill="#ff8ec6" />
        {/* wings */}
        <rect x="2" y="7" width="4" height="2" fill="#6E59A5" />
        <rect x="10" y="7" width="4" height="2" fill="#6E59A5" />
        <rect x="1" y="8" width="2" height="2" fill="#00e5ff" />
        <rect x="13" y="8" width="2" height="2" fill="#00e5ff" />
        {/* gun tips */}
        <rect x="2" y="6" width="1" height="1" fill="#ffff00" />
        <rect x="13" y="6" width="1" height="1" fill="#ffff00" />
        {/* engine block */}
        <rect x="5" y="9" width="6" height="2" fill="#1A1F2C" />
        <rect x="6" y="11" width="4" height="1" fill="#2b3245" />
        {/* flame frame A */}
        <g className="flameA">
          <rect x="6" y="12" width="4" height="2" fill="#F97316" />
          <rect x="7" y="14" width="2" height="1" fill="#ffff00" />
        </g>
        {/* flame frame B */}
        <g className="flameB">
          <rect x="6" y="12" width="4" height="1" fill="#F97316" />
          <rect x="7" y="13" width="2" height="2" fill="#ff4500" />
          <rect x="7" y="15" width="2" height="1" fill="#ffff00" />
        </g>
      </svg>
      {isInvulnerable && (
        <div
          className="absolute inset-0 rounded-full border-2 border-cyan-300 animate-ping opacity-70"
          style={{ transform: "scale(1.3)", borderStyle: "dashed" }}
        />
      )}
      <style>{`
        .flameA { animation: flameFlickA 0.22s steps(1) infinite; }
        .flameB { animation: flameFlickB 0.22s steps(1) infinite; }
        @keyframes flameFlickA { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0; } }
        @keyframes flameFlickB { 0%, 49% { opacity: 0; } 50%, 100% { opacity: 1; } }
      `}</style>
    </div>
  );
});
```

- [ ] **Step 2: Banking in `Spaceship.tsx`**

Convert the memoized component to track movement delta:

```tsx
const Spaceship: React.FC<SpaceshipProps> = memo(({ position, isExploding = false, isInvulnerable = false }) => {
  const prevPosRef = React.useRef(position);
  const [tilt, setTilt] = React.useState(0);
  const tiltResetRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    const delta = position - prevPosRef.current;
    prevPosRef.current = position;
    if (Math.abs(delta) > 0.05) {
      setTilt(Math.max(-18, Math.min(18, delta * 9)));
      if (tiltResetRef.current) window.clearTimeout(tiltResetRef.current);
      tiltResetRef.current = window.setTimeout(() => setTilt(0), 150);
    }
  }, [position]);

  return (
    <div
      className="absolute w-16 h-16 cursor-pointer"
      style={{
        bottom: "20%",
        left: `${position}%`,
        transform: `translateX(-50%) rotate(${tilt}deg)`,
        transition: "transform 120ms ease-out",
        willChange: "left, transform",
        zIndex: isExploding ? 3 : 60,
      }}
    >
      {isExploding ? <SpaceshipExplosion /> : <SpaceshipVessel isInvulnerable={isInvulnerable} />}
    </div>
  );
});
```

(The Tailwind classes `transform -translate-x-1/2` are removed in favor of the inline transform.)

- [ ] **Step 3: Verify**

`npm run lint && npm run build` → pass. Browser: ship is a crisp pixel ship matching the menu aesthetic; flame flickers between two frames; moving mouse left/right visibly banks the ship and it straightens when stopping; no ⚡ icon; shield ring still shows after a hit.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "Replace spaceship with pixel-art SVG vessel with banking and animated flame"
```

---

### Task 4: Hit feedback — screen shake, red flash, hit-stop (spec A2)

**Files:**
- Modify: `src/hooks/useGameState.tsx` (`handleShipHit` ~line 202, `updateGame` top ~line 337, return object)
- Modify: `src/components/Game.tsx` (shake/flash rendering)
- Modify: `src/index.css` (keyframes)

**Interfaces:**
- Produces: `useGameState()` returns new field `hitFlash: number` (timestamp of last life lost, 0 initially). Consumed by Game.tsx only.

- [ ] **Step 1: useGameState changes**

Add state + ref near other state (~line 60): `const [hitFlash, setHitFlash] = useState(0);` and `const hitStopUntilRef = useRef(0);`

In `handleShipHit` (line 202), right after the `if (isInvulnerable || gameOverRef.current) return;` guard add:

```tsx
    setHitFlash(Date.now());
    hitStopUntilRef.current = Date.now() + 120;
```

At the very top of `updateGame` (line ~338), after `if (gameOverRef.current) return;` add:

```tsx
    if (Date.now() < hitStopUntilRef.current) return; // brief hit-stop after losing a life
```

Add `hitFlash,` to the returned object (near `comboNotice`). In `resetGame`, add `setHitFlash(0); hitStopUntilRef.current = 0;`

- [ ] **Step 2: Game.tsx shake + flash**

Destructure `hitFlash` from `useGameState()`. Add below the `isMobile` line:

```tsx
  const [shaking, setShaking] = useState(false);
  const [flashVisible, setFlashVisible] = useState(false);
  useEffect(() => {
    if (!hitFlash) return;
    setShaking(true);
    setFlashVisible(true);
    const t1 = setTimeout(() => setShaking(false), 450);
    const t2 = setTimeout(() => setFlashVisible(false), 250);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [hitFlash]);
```

(`useState` is already imported? Game.tsx imports only `useEffect, useRef` — extend the React import to `import React, { useEffect, useRef, useState } from "react";`)

Boss-death small shake (spec A2): add a second, milder effect keyed on the existing `bossDefeatedNotice` prop value already destructured in Game.tsx:

```tsx
  const [shakingSm, setShakingSm] = useState(false);
  useEffect(() => {
    if (!bossDefeatedNotice) return;
    setShakingSm(true);
    const t = setTimeout(() => setShakingSm(false), 350);
    return () => clearTimeout(t);
  }, [bossDefeatedNotice]);
```

Container className: `${shaking ? "game-shake" : shakingSm ? "game-shake-sm" : ""}`

Container: change `className="relative w-full h-full overflow-hidden bg-black"` to:

```tsx
      className={`relative w-full h-full overflow-hidden bg-black ${shaking ? "game-shake" : ""}`}
```

Add flash overlay just before `<GameUI`:

```tsx
      {flashVisible && (
        <div
          className="absolute inset-0 pointer-events-none z-[70]"
          style={{ background: "radial-gradient(ellipse at center, rgba(255,0,0,0.28) 0%, rgba(255,0,0,0.55) 100%)", animation: "hitFlashFade 0.25s ease-out forwards" }}
        />
      )}
```

- [ ] **Step 3: Keyframes in `src/index.css`** (append at end)

```css
@keyframes gameShake {
  10% { transform: translate(-7px, 4px); }
  20% { transform: translate(6px, -5px); }
  30% { transform: translate(-5px, -3px); }
  40% { transform: translate(5px, 4px); }
  50% { transform: translate(-4px, 2px); }
  60% { transform: translate(3px, -2px); }
  70% { transform: translate(-2px, 1px); }
  80% { transform: translate(2px, 1px); }
  100% { transform: translate(0, 0); }
}
.game-shake { animation: gameShake 0.45s linear; }
@keyframes gameShakeSm {
  20% { transform: translate(-3px, 2px); }
  40% { transform: translate(3px, -2px); }
  60% { transform: translate(-2px, 1px); }
  80% { transform: translate(2px, -1px); }
  100% { transform: translate(0, 0); }
}
.game-shake-sm { animation: gameShakeSm 0.35s linear; }
@keyframes hitFlashFade { from { opacity: 1; } to { opacity: 0; } }
```

- [ ] **Step 4: Verify**

`npm run lint && npm run build` → pass. Browser: fly into a meteor → screen shakes, red flash fades out, game freezes for a barely-perceptible beat, then invulnerability blink as before. Game over still works (3 hits + continue screen). (Boss small-shake is hard to reach manually here — it is re-verified in Task 10's full playtest at L5.)

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "Add screen shake, red flash and hit-stop feedback on life lost"
```

---

### Task 5: Stronger meteor-storm-active visual (spec A5)

**Files:**
- Modify: `src/components/GameUI.tsx:146-152` (meteorStormActive overlay)

**Interfaces:** none (props unchanged; warning banner at lines 129-144 already exists and stays).

- [ ] **Step 1: Replace the active-storm overlay**

Replace the current `meteorStormActive` div with:

```tsx
      {meteorStormActive && !gameOver && (
        <>
          <div
            className="absolute inset-0 pointer-events-none z-10"
            style={{ boxShadow: "inset 0 0 110px rgba(255,0,0,0.55)", animation: "stormPulse 0.6s ease-in-out infinite alternate" }}
          />
          <div
            className="absolute inset-0 pointer-events-none z-10 opacity-[0.07]"
            style={{
              background: "repeating-linear-gradient(115deg, transparent 0px, transparent 18px, #ff2200 19px, transparent 20px)",
              animation: "stormStreak 0.4s linear infinite",
            }}
          />
          <style>{`@keyframes stormStreak { from { background-position: 0 0; } to { background-position: -40px 20px; } }`}</style>
        </>
      )}
```

- [ ] **Step 2: Verify**

`npm run lint && npm run build` → pass. Browser: survive ~30-60s until METEOR STORM triggers → screen edge glows clearly red + faint diagonal streaks race across; warning banner beforehand unchanged.

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "Intensify meteor storm active visuals with stronger vignette and streaks"
```

---

### Task 6: Vertical steering (spec B)

**Files:**
- Modify: `src/hooks/useGameState.tsx` (new state, replace 7 hardcoded `85`s, wire params, balance)
- Modify: `src/hooks/useCollisions.ts:13` (shipY parameter)
- Modify: `src/hooks/useProjectiles.ts` (spawn at ship height)
- Modify: `src/hooks/useObstacles.ts:11` (baseInterval 1500 → 1300, balance)
- Modify: `src/components/Game.tsx` (Y inputs: mouse, ArrowUp/Down, touch, tilt-beta; tunnel-mode lock)
- Modify: `src/components/Spaceship.tsx` (top-based positioning)

**Interfaces:**
- Produces: `useGameState()` returns `shipVertical: number` (ship CENTER as % from top, clamped 35–88, default 82) and `moveShipVertical(pos: number): void`. `checkShipCollision(obstacles, shipPosition, shipY, gameOver, isTunnelMode)`. `createProjectile(shipPosition, shipY, gameOver, rapidFire, tripleShot)`. `Spaceship` gains required prop `vertical: number`. Task 9 consumes `shipVerticalRef` semantics via `shipVertical`.

- [ ] **Step 1: useGameState — state + moveShipVertical**

Near `shipPosition` state (line 31):

```tsx
  const [shipVertical, setShipVertical] = useState(82); // ship center, % from top
```
Near `shipPositionRef` (line 97): `const shipVerticalRef = useRef(82);`

Next to `moveShip` (line 320):

```tsx
  const moveShipVertical = useCallback((pos: number) => {
    const clamped = Math.max(35, Math.min(88, pos));
    shipVerticalRef.current = clamped;
    setShipVertical(clamped);
  }, []);
```

In `resetGame` add: `setShipVertical(82); shipVerticalRef.current = 82;`
Export `shipVertical` and `moveShipVertical` in the return object.

- [ ] **Step 2: Replace every hardcoded ship Y (grep `= 85` / `- 85`)**

All in `useGameState.tsx` — replace with `shipVerticalRef.current`:
1. Line ~404 (power-up collection): `const shipY = 85;` → `const shipY = shipVerticalRef.current;`
2. Line ~568 (boss body collision): same replacement.
3. Line ~663 (UFO bullets): same replacement.
4. Line ~808 (speed ring): `Math.abs(newY - 85) < 7` → `Math.abs(newY - shipVerticalRef.current) < 7`
5. Line ~1036-1038 (void consumption): the check comparing void rise against ship at 85 — replace `85` with `shipVerticalRef.current` in the ship-consumed comparison ONLY (the `voidProgress * 85` rise-height math at 1036 is the void's own geometry — leave it).
6. Line ~1104 (bonus-round coin collection): `const shipY = 85;` → `const shipY = shipVerticalRef.current;`
7. Line ~1099: `checkShipCollision(obstacles, shipPosition, gameOverRef.current, isTunnelMode && tunnelActive)` → `checkShipCollision(obstacles, shipPosition, shipVerticalRef.current, gameOverRef.current, isTunnelMode && tunnelActive)`

- [ ] **Step 3: useCollisions.ts new signature**

```tsx
  const checkShipCollision = useCallback((
    obstacles: Obstacle[],
    shipPosition: number,
    shipY: number,
    gameOver: boolean,
    isTunnelMode: boolean = false
  ) => {
    if (gameOver) return false;
    const shipSize = isTunnelMode ? 5 : 6;
    // ... rest unchanged (delete the old `const shipY = 85;` line)
```

- [ ] **Step 4: useProjectiles.ts spawn height**

```tsx
  const createProjectile = useCallback((
    shipPosition: number,
    shipY: number,
    gameOver: boolean,
    rapidFire: boolean = false,
    tripleShot: boolean = false
  ): Projectile | Projectile[] | null => {
    ...
      const spawnY = 100 - shipY + 5; // projectile y counts from bottom; 82 → 23
      if (tripleShot) {
        return [
          { id: now,     x: shipPosition - 6, y: spawnY },
          { id: now + 1, x: shipPosition,     y: spawnY },
          { id: now + 2, x: shipPosition + 6, y: spawnY },
        ];
      }
      return { id: now, x: shipPosition, y: spawnY };
```

Caller in useGameState `shootProjectile` (line 327): `createProjectile(shipPosition, shipVerticalRef.current, gameOverRef.current, rapidFire, tripleShot)`.

- [ ] **Step 5: Balance — useObstacles.ts line 11**

`const baseInterval = 1500;` → `const baseInterval = 1300; // tightened: vertical dodging made the game easier`

- [ ] **Step 6: Game.tsx — vertical inputs**

Add refs next to the existing ones: `const kbVertRef = useRef<number>(82);`, `const moveShipVertRef = useRef<(pos: number) => void>(() => {});`, `const isTunnelModeRef = useRef<boolean>(false);`
Wire: `moveShipVertRef.current = moveShipVertical;` (destructure `moveShipVertical, shipVertical` from the hook) and `kbVertRef.current = shipVertical;` (sync like kbPosRef). After computing `isTunnelMode` add `isTunnelModeRef.current = isTunnelMode;` — note `isTunnelMode` is computed during render below the effects; assign there.

In the mount-once movement effect, extend `handleMove` to `(clientX: number, clientY?: number)`:

```tsx
      if (clientY !== undefined && !isTunnelModeRef.current) {
        moveShipVertRef.current(((clientY - rect.top) / rect.height) * 100);
      }
```
Call sites: `handleMove(e.clientX, e.clientY)` for pointermove; `handleMove(e.touches[0].clientX, e.touches[0].clientY)` for touchmove. Same for the inline `onPointerMove` JSX handler.

Orientation handler — after the gamma X mapping add:

```tsx
      if (e.beta !== null && !isTunnelModeRef.current) {
        const beta = Math.max(20, Math.min(70, e.beta)); // 45° ≈ neutral grip
        moveShipVertRef.current(35 + ((beta - 20) / 50) * 53);
      }
```

Keyboard: in `handleKeyDown`/`handleKeyUp` extend the arrow condition to include `"ArrowUp"`/`"ArrowDown"`. In the game loop, next to the left/right block:

```tsx
        if ((keys.has("ArrowUp") || keys.has("ArrowDown")) && !isTunnelModeRef.current) {
          if (keys.has("ArrowUp"))   kbVertRef.current = Math.max(35, kbVertRef.current - STEP);
          if (keys.has("ArrowDown")) kbVertRef.current = Math.min(88, kbVertRef.current + STEP);
          moveShipVertRef.current(kbVertRef.current);
        }
```

Tunnel-mode lock (vertical steering is a corridor no-go): add effect

```tsx
  useEffect(() => {
    if (isTunnelMode) moveShipVertical(82);
  }, [isTunnelMode, moveShipVertical]);
```

Pass to ship: `<Spaceship position={shipPosition} vertical={shipVertical} ... />`

- [ ] **Step 7: Spaceship.tsx — top positioning**

Props: add `vertical: number;`. Container style: replace `bottom: "20%"` with `top: \`${vertical}%\``, transform becomes `translate(-50%, -50%) rotate(${tilt}deg)`, willChange `"left, top, transform"`.

- [ ] **Step 8: Verify (thorough — this is the risky task)**

`npm run lint && npm run build` → pass. Browser checklist:
- Mouse: ship follows Y between ~35% and ~88%; default position ≈ same as before this task.
- ArrowUp/ArrowDown move ship; diagonals work (Left+Up).
- Shooting: projectiles leave from the ship's nose at ANY height (fly high, shoot — no gap).
- Fly into a meteor while high up → hit registers at the ship, not at old bottom position.
- Collect a power-up at mid-height → works.
- GAME still winnable/playable; obstacle pressure feels slightly higher (1300 interval).
- Level 6 tunnel (or temporarily set `requiredScore: 50` for Cyber Wormhole in `levels.ts`, test, then REVERT): ship locks back to 82 and Y-input is ignored in tunnel; after tunnel ends, vertical control returns.

- [ ] **Step 9: Commit**

```bash
git add -A && git commit -m "Add vertical steering: mouse/touch Y, arrow keys, tilt; shipY-aware collisions"
```

---

### Task 7: Diagonal drifting meteors from level 3 (spec C1)

**Files:**
- Modify: `src/types/gameTypes.ts` (Obstacle: `vx?: number`, `kind?: 'meteor' | 'comet'`, `grazed?: boolean` — add all three now)
- Modify: `src/hooks/useObstacles.ts` (spawn vx, apply drift)

**Interfaces:**
- Produces: `Obstacle.vx` (%/frame horizontal), `Obstacle.kind`, `Obstacle.grazed`. Task 8 uses `kind === 'comet'` fall multiplier already wired here.

- [ ] **Step 1: Types** — add to `Obstacle`:

```tsx
  vx?: number;               // horizontal drift, % per frame
  kind?: 'meteor' | 'comet';
  grazed?: boolean;          // graze bonus already awarded
```
(If `vx` was already added in Task 2, just add the missing two.)

- [ ] **Step 2: useObstacles.ts — spawn drift + apply movement**

Import: `import { getLevelByScore } from "@/config/levels";`

In `createObstacle`, before the return:

```tsx
      const level = getLevelByScore(scoreRef.current!).level;
      const vx = level >= 3 && Math.random() < 0.25
        ? (Math.random() < 0.5 ? -1 : 1) * (0.05 + Math.random() * 0.10)
        : undefined;
      return { id: now, x, y: -5, size, seed: Math.random(), vx } as Obstacle;
```

In `updateObstacles`, in BOTH branches (exploding and normal), apply drift and cull side exits. Normal branch becomes:

```tsx
        const fallMult = obstacle.kind === 'comet' ? 2.5 : 1;
        const newY = obstacle.y + (baseSpeed + speedRef.current! * speedFactor) * fallMult * slowMotionMultiplier;
        const newX = obstacle.x + (obstacle.vx ?? 0) * slowMotionMultiplier;
        if (newY > 105 || newX < -10 || newX > 110) return null;
        return { ...obstacle, y: newY, x: newX };
```
Exploding branch: keep its existing y math, add the same `newX` computation and include `x: newX` in the returned object.

- [ ] **Step 3: Verify**

`npm run lint && npm run build` → pass. Browser: reach Level 3 (score 1500) → roughly a quarter of meteors drift sideways as they fall; their fire trails tilt against the drift direction (from Task 2's `rotate((vx) * -150deg)` — if trails lean the WRONG way, flip the sign to `* 150`). Meteors exiting a side edge disappear (watch obstacle count in React devtools if in doubt).

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "Add diagonal drifting meteors from level 3"
```

---

### Task 8: Comets — rare fast diagonal streakers worth 150 (spec C2)

**Files:**
- Modify: `src/hooks/useGameState.tsx` (spawn timer + kill bonus)
- Modify: `src/components/Obstacles.tsx` (comet visual branch)

**Interfaces:**
- Consumes: `Obstacle.kind === 'comet'` fall multiplier (Task 7), `scoreMultiplierRef` (exists, line ~101).
- Produces: nothing further.

- [ ] **Step 1: Spawn logic in useGameState**

Ref near the other timers (~line 88): `const nextCometTimeRef = useRef<number>(Date.now() + 25000);`

In `updateGame`, right before the obstacle spawn block (~line 899 `} else {` standard-mode branch — place just above `const newObstacle = createObstacle(...)`):

```tsx
      // Comet: rare, fast, steep diagonal, high reward (level 4+)
      const nowLevel = getLevelByScore(scoreRef.current!).level;
      if (nowLevel >= 4 && currentTime >= nextCometTimeRef.current && !bonusRoundEndTimeRef.current && !bossRef.current) {
        nextCometTimeRef.current = currentTime + 15000 + Math.random() * 10000;
        const fromLeft = Math.random() < 0.5;
        const comet = {
          id: currentTime + 0.5,
          x: fromLeft ? -5 : 105,
          y: 2 + Math.random() * 18,
          size: 5,
          seed: Math.random(),
          kind: 'comet' as const,
          vx: (fromLeft ? 1 : -1) * (0.45 + Math.random() * 0.15),
        };
        setObstacles(prev => [...prev, comet]);
      }
```
(`getLevelByScore` is already imported in useGameState.) In `resetGame` add `nextCometTimeRef.current = Date.now() + 25000;`

- [ ] **Step 2: Kill bonus**

At the meteor-destruction site — right after the destructuring `const { hitCount: meteorHitCount, destroyedObstacles, newProjectilesList } = ...` (~line 915) — add:

```tsx
    const cometKills = destroyedObstacles.filter(o => o.kind === 'comet').length;
    if (cometKills > 0) {
      setScore(prev => prev + 150 * cometKills * scoreMultiplierRef.current);
    }
```

- [ ] **Step 3: Comet visual in Obstacles.tsx**

Add a branch ABOVE the dimension/normal logic, right after the bonus-round branch:

```tsx
  if (obstacle.kind === 'comet' && !obstacle.isExploding) {
    const angleDeg = (obstacle.vx ?? 0) > 0 ? -60 : 60; // trail points back along travel
    return (
      <div
        className="absolute"
        style={{
          width: `${obstacle.size}%`, height: `${obstacle.size}%`, aspectRatio: "1 / 1",
          left: `${obstacle.x}%`, top: `${obstacle.y}%`, transform: "translate(-50%, -50%)",
        }}
      >
        <div
          className="absolute left-1/2 top-1/2"
          style={{
            width: "45%", height: "320%",
            transform: `translate(-50%, -100%) rotate(${angleDeg}deg)`,
            transformOrigin: "bottom center",
            background: "linear-gradient(to top, rgba(120,255,255,0.75) 0%, rgba(0,200,255,0.3) 40%, transparent 100%)",
            filter: "blur(4px)", borderRadius: "50%",
          }}
        />
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: "radial-gradient(circle at 40% 40%, #ffffff 0%, #aef4ff 45%, #00c8ff 100%)",
            boxShadow: "0 0 16px #7df4ff, 0 0 34px rgba(0,200,255,0.6)",
          }}
        />
      </div>
    );
  }
```

- [ ] **Step 4: Verify**

`npm run lint && npm run build` → pass. Browser: at Level 4+ (score 3000; or temporarily lower `requiredScore` — REVERT afterwards) a bright cyan comet streaks diagonally every ~15-25s; shooting it explodes it and score jumps by 150×multiplier (watch the score HUD); getting hit by it costs a life; trail points away from travel direction.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "Add comets: rare fast diagonal obstacles worth 150 points"
```

---

### Task 9: GRAZE bonus — reward near-misses (spec C3)

**Files:**
- Modify: `src/hooks/useGameState.tsx` (graze detection + notice state)
- Modify: `src/components/Game.tsx` (GRAZE! text)

**Interfaces:**
- Consumes: `shipVerticalRef` (Task 6), `Obstacle.grazed` (Task 7), `scoreMultiplierRef`, `safeTimeout` (existing).
- Produces: `useGameState()` returns `grazeNotice: boolean`.

- [ ] **Step 1: State + detection**

State near comboNotice (~line 57): `const [grazeNotice, setGrazeNotice] = useState(false);`
Reset in `resetGame`: `setGrazeNotice(false);`

In `updateGame`, extend the ship-collision block at ~line 1099. After the existing `if (shipCollided && !isInvulnerable) { ... }` block, add an `else` branch:

```tsx
    } else if (!bonusRoundEndTimeRef.current && !(isTunnelMode && tunnelActive)) {
      // GRAZE: near-miss bonus — obstacle passes within a whisker of the ship
      const shipY = shipVerticalRef.current;
      const grazedIds: number[] = [];
      for (const o of obstacles) {
        if (o.isExploding || o.grazed) continue;
        const xDiff = Math.abs(o.x - shipPosition);
        const yDiff = Math.abs(o.y - shipY);
        const collisionX = o.size / 2 + 3; // mirrors checkShipCollision thresholds
        if (yDiff < 5 && xDiff > collisionX && xDiff < collisionX + 4) grazedIds.push(o.id);
      }
      if (grazedIds.length > 0) {
        setScore(prev => prev + 25 * grazedIds.length * scoreMultiplierRef.current);
        setObstacles(prev => prev.map(o => (grazedIds.includes(o.id) ? { ...o, grazed: true } : o)));
        setGrazeNotice(true);
        safeTimeout(() => setGrazeNotice(false), 600);
      }
    }
```

Export `grazeNotice` in the return object.

- [ ] **Step 2: GRAZE text in Game.tsx**

Destructure `grazeNotice`. Render after the Spaceship element:

```tsx
      {grazeNotice && (
        <div
          className="absolute pointer-events-none z-[65]"
          style={{
            left: `${shipPosition}%`, top: `${shipVertical - 9}%`,
            transform: "translateX(-50%)",
            fontFamily: "'Press Start 2P', monospace", fontSize: "10px",
            color: "#7df4ff", textShadow: "0 0 8px #00e5ff, 2px 2px 0 #000",
            animation: "comboPop 0.6s ease-out forwards",
          }}
        >
          GRAZE! +25
        </div>
      )}
```
(`comboPop` keyframes already exist for the combo notice — reuse.)

- [ ] **Step 3: Verify**

`npm run lint && npm run build` → pass. Browser: deliberately skim close past falling meteors → "GRAZE! +25" flashes at the ship and score bumps by 25 (×multiplier). Verify a single meteor can only award it once, an actual collision NEVER also awards a graze, and nothing fires during bonus round or tunnel mode.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "Add GRAZE near-miss bonus rewarding risky flying"
```

---

### Task 10: Full playtest, version bump, ship it

**Files:**
- Modify: `package.json` (version `2.12.0` → `3.0.0`)

- [ ] **Step 1: Full regression playtest** (desktop viewport AND narrow ~500px viewport):

1. Start screen → enter name → START works; audio plays.
2. Stars scroll; ship banks; meteors are rocks with trails; some drift diagonally (L3+).
3. Vertical: mouse Y + ArrowUp/Down; shooting from any height; power-up pickup mid-screen.
4. Take a hit → shake/flash/hit-stop → invulnerability.
5. Meteor storm → strong red visuals; warning banner first.
6. Comet appears (L4+), can be shot for +150×mult.
7. Graze works, once per meteor.
8. Boss at L5 still functions (spawns, hits ship, can be killed).
9. Game over → score submits → high score list shows entry. Continue screen works.
10. `npm run lint && npm run build` → both pass.

- [ ] **Step 2: Version bump + commit**

```bash
cd ~/cosmic-tunnel && npm pkg set version=3.0.0
git add -A && git commit -m "Bump version to 3.0.0 — speed, feel, vertical steering, trajectory variety"
```

- [ ] **Step 3: Integration**

Use superpowers:finishing-a-development-branch — offer Lars: push branch + open PR to `larssolo/cosmic-tunnel` main (repo's normal flow, PRs #1-50 all merged via branches), or merge locally. PR body in the repo's usual concise style; end with the WOZCODE attribution line.

