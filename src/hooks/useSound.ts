import { useCallback } from 'react';

export type SoundType =
  | 'shoot' | 'explosion' | 'gameOver' | 'start' | 'speedUp' | 'rumble'
  | 'crash' | 'atmosphere' | 'levelUp' | 'powerUpCollect' | 'achievementUnlock'
  | 'menuMusic' | 'voidSpawn' | 'voidCoreHit' | 'voidCountdown' | 'voidAllCores'
  | 'laserBeastCharge' | 'laserBeastExplosion';

// ---------------------------------------------------------------------------
// HYBRID audio engine — bulletproof on desktop AND mobile.
//
// Primary path: Web Audio API. One AudioContext is unlocked once on the first
// user gesture, after which every sound plays through it freely and overlaps
// cleanly (perfect for rapid fire) with no per-shot allocation. This is what
// fixes laser + music on iOS/Android.
//
// Fallback path: HTML <audio>. If a track can't be fetched+decoded for Web
// Audio (e.g. the CDN doesn't send CORS headers), we fall back to a plain
// <audio> element. Crucially, on the unlock gesture we now play()+pause()
// EVERY element (the missing piece in the old code — it only unlocked the
// AudioContext, never the individual <audio> elements, so most sounds stayed
// muted on mobile).
// ---------------------------------------------------------------------------

interface TrackConfig {
  url: string;
  volume: number;
  loop?: boolean;
}

const TRACKS: Record<SoundType, TrackConfig> = {
  shoot:             { url: '/sounds/lazercannon-37980.mp3', volume: 0.3 },
  explosion:         { url: 'https://assets.mixkit.co/active_storage/sfx/235/235-preview.mp3', volume: 1.0 },
  gameOver:          { url: 'https://assets.mixkit.co/active_storage/sfx/1204/1204-preview.mp3', volume: 1.0 },
  start:             { url: '/sounds/gamestart-272829.mp3', volume: 0.7 },
  speedUp:           { url: 'https://assets.mixkit.co/active_storage/sfx/255/255-preview.mp3', volume: 0.6 },
  rumble:            { url: 'https://assets.mixkit.co/active_storage/sfx/2573/2573-preview.mp3', volume: 1.0 },
  crash:             { url: '/sounds/game-over-classic-206486.mp3', volume: 1.0 },
  atmosphere:        { url: '/sounds/atmosphere-sound-effect-239969.mp3', volume: 0.6, loop: true },
  levelUp:           { url: 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3', volume: 0.7 },
  powerUpCollect:    { url: 'https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3', volume: 0.5 },
  achievementUnlock: { url: 'https://assets.mixkit.co/active_storage/sfx/2018/2018-preview.mp3', volume: 0.8 },
  menuMusic:         { url: '/sounds/Arcade Mobile Game Background loop.mp3', volume: 0.5, loop: true },
  voidSpawn:         { url: '/sounds/IMPACT_Sub_Boom_Tonal_Deep_Space.mp3', volume: 0.9 },
  voidCoreHit:       { url: '/sounds/DroneReactor_BW.43983.mp3', volume: 0.8 },
  voidCountdown:     { url: '/sounds/BEEPTimer_Digital Timer Beeping Bomb Clock_GENHD1-07734.mp3', volume: 0.6, loop: true },
  voidAllCores:      { url: '/sounds/8-Bit 135 MIX Loop Version 1.mp3', volume: 1.0 },
  laserBeastCharge:  { url: '/sounds/gregorquendel-laser-charge-175727.mp3', volume: 0.7, loop: true },
  laserBeastExplosion: { url: '/sounds/dragon-studio-massive-explosion-2-397983.mp3', volume: 1.0 },
};

const LOOP_TYPES = new Set<SoundType>(['atmosphere', 'menuMusic', 'voidCountdown', 'laserBeastCharge']);

// ---------------------------------------------------------------------------
// Web Audio state
// ---------------------------------------------------------------------------
let audioCtx: AudioContext | null = null;
const buffers = {} as Record<SoundType, AudioBuffer | undefined>;
const bufferFailed = {} as Record<SoundType, boolean>; // CORS/network failure → use HTML fallback
const activeLoops = {} as Record<SoundType, { src: AudioBufferSourceNode } | undefined>;

const getCtx = (): AudioContext | null => {
  if (audioCtx) return audioCtx;
  try {
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new Ctor();
  } catch {
    audioCtx = null;
  }
  return audioCtx;
};

const loadBuffer = async (type: SoundType): Promise<AudioBuffer | undefined> => {
  if (buffers[type]) return buffers[type];
  if (bufferFailed[type]) return undefined;
  const ctx = getCtx();
  if (!ctx) { bufferFailed[type] = true; return undefined; }
  try {
    const res = await fetch(TRACKS[type].url, { mode: 'cors' });
    if (!res.ok) throw new Error('fetch failed');
    const arr = await res.arrayBuffer();
    const decoded = await ctx.decodeAudioData(arr);
    buffers[type] = decoded;
    return decoded;
  } catch {
    // Likely CORS — mark so we use the HTML fallback for this track.
    bufferFailed[type] = true;
    return undefined;
  }
};

let preloadStarted = false;
const preloadAll = () => {
  if (preloadStarted) return;
  preloadStarted = true;
  (Object.keys(TRACKS) as SoundType[]).forEach((t) => { void loadBuffer(t); });
};

// ---------------------------------------------------------------------------
// HTML <audio> fallback state
// ---------------------------------------------------------------------------
const htmlElements = {} as Record<SoundType, HTMLAudioElement>;
const getHtmlElement = (type: SoundType): HTMLAudioElement => {
  let el = htmlElements[type];
  if (!el) {
    const cfg = TRACKS[type];
    el = new Audio(cfg.url);
    el.volume = cfg.volume;
    el.preload = 'auto';
    if (cfg.loop) el.loop = true;
    htmlElements[type] = el;
  }
  return el;
};

// Small pool for the rapid-fire shoot sound in HTML fallback mode.
const SHOOT_POOL_SIZE = 6;
const shootPool: HTMLAudioElement[] = [];
let shootPoolIndex = 0;

const playHtml = (type: SoundType) => {
  if (type === 'shoot') {
    if (shootPool.length === 0) {
      for (let i = 0; i < SHOOT_POOL_SIZE; i++) {
        const el = new Audio(TRACKS.shoot.url);
        el.volume = TRACKS.shoot.volume;
        shootPool.push(el);
      }
    }
    const el = shootPool[shootPoolIndex];
    shootPoolIndex = (shootPoolIndex + 1) % SHOOT_POOL_SIZE;
    el.currentTime = 0;
    el.play().catch(() => {});
    return;
  }
  const el = getHtmlElement(type);
  if (LOOP_TYPES.has(type)) {
    if (!el.paused) return;
    el.play().catch(() => {});
  } else {
    el.currentTime = 0;
    el.play().catch(() => {});
  }
};

// ---------------------------------------------------------------------------
// Unlock — called from a user gesture. Unlocks BOTH engines.
// ---------------------------------------------------------------------------
export const unlockAudio = () => {
  const ctx = getCtx();
  if (ctx) {
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    try {
      const buf = ctx.createBuffer(1, 1, 22050);
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.connect(ctx.destination);
      src.start(0);
    } catch { /* ignore */ }
  }
  // Unlock every HTML element (and the shoot pool) within the gesture —
  // play then immediately pause so they're permitted to play later on mobile.
  (Object.keys(TRACKS) as SoundType[]).forEach((t) => {
    const el = getHtmlElement(t);
    el.play().then(() => {
      if (!LOOP_TYPES.has(t)) { el.pause(); el.currentTime = 0; }
      else { el.pause(); } // loops: leave position, will play() fresh later
    }).catch(() => {});
  });
  if (shootPool.length === 0) {
    for (let i = 0; i < SHOOT_POOL_SIZE; i++) {
      const el = new Audio(TRACKS.shoot.url);
      el.volume = TRACKS.shoot.volume;
      el.play().then(() => { el.pause(); el.currentTime = 0; }).catch(() => {});
      shootPool.push(el);
    }
  }
  preloadAll();
};

const playBuffer = (type: SoundType, buffer: AudioBuffer) => {
  const ctx = getCtx();
  if (!ctx) return;
  const cfg = TRACKS[type];
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  const gain = ctx.createGain();
  gain.gain.value = cfg.volume;
  src.connect(gain);
  gain.connect(ctx.destination);
  if (cfg.loop) {
    src.loop = true;
    activeLoops[type] = { src };
  }
  try { src.start(0); } catch { /* ignore */ }
};

export const soundManager = {
  play(type: SoundType) {
    const ctx = getCtx();
    if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => {});

    // Don't restart a Web Audio loop already playing.
    if (LOOP_TYPES.has(type) && activeLoops[type]) return;

    // Buffer ready → Web Audio. Failed (CORS) → HTML. Not loaded yet → load then route.
    const cached = buffers[type];
    if (cached) {
      playBuffer(type, cached);
    } else if (bufferFailed[type]) {
      playHtml(type);
    } else {
      void loadBuffer(type).then((buf) => {
        if (buf) {
          if (LOOP_TYPES.has(type) && activeLoops[type]) return;
          playBuffer(type, buf);
        } else {
          playHtml(type);
        }
      });
    }
  },

  stop(type: SoundType) {
    const loop = activeLoops[type];
    if (loop) {
      try { loop.src.stop(); } catch { /* ignore */ }
      activeLoops[type] = undefined;
    }
    const el = htmlElements[type];
    if (el && !el.paused) { el.pause(); el.currentTime = 0; }
  },

  stopAll() {
    (Object.keys(activeLoops) as SoundType[]).forEach((t) => soundManager.stop(t));
    (Object.keys(htmlElements) as SoundType[]).forEach((t) => {
      const el = htmlElements[t];
      if (el && !el.paused) { el.pause(); el.currentTime = 0; }
    });
  },

  // Resume atmosphere from a user gesture (re-checked on every interaction).
  resumeAtmosphere() {
    const ctx = getCtx();
    if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => {});
    const playingWebAudio = !!activeLoops['atmosphere'];
    const htmlEl = htmlElements['atmosphere'];
    const playingHtml = htmlEl && !htmlEl.paused;
    if (!playingWebAudio && !playingHtml) {
      soundManager.play('atmosphere');
    }
  },
};

// ---------------------------------------------------------------------------
// React hook wrapper — stable references, no useEffect needed.
// ---------------------------------------------------------------------------
export const useSound = () => {
  const playSound = useCallback((type: SoundType) => soundManager.play(type), []);
  const stopSound = useCallback((type: SoundType) => soundManager.stop(type), []);
  return { playSound, stopSound };
};
