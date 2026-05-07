import { useCallback } from 'react';

export type SoundType =
  | 'shoot' | 'explosion' | 'gameOver' | 'start' | 'speedUp' | 'rumble'
  | 'crash' | 'atmosphere' | 'levelUp' | 'powerUpCollect' | 'achievementUnlock'
  | 'menuMusic' | 'voidSpawn' | 'voidCoreHit' | 'voidCountdown' | 'voidAllCores';

// ---------------------------------------------------------------------------
// Module-level singleton — audio elements live for the entire page session.
// This avoids the "too far from user gesture" problem that kills useEffect-
// based audio initialisation, and survives component mount/unmount cycles.
// ---------------------------------------------------------------------------

interface TrackConfig {
  url: string;
  volume: number;
  loop?: boolean;
}

const TRACKS: Record<SoundType, TrackConfig> = {
  shoot:             { url: 'https://filedn.com/lQQF6SFSgwj0ab00vQxYlGF/Game%20sound/lazercannon-37980.mp3', volume: 0.3 },
  explosion:         { url: 'https://assets.mixkit.co/active_storage/sfx/235/235-preview.mp3', volume: 1.0 },
  gameOver:          { url: 'https://assets.mixkit.co/active_storage/sfx/1204/1204-preview.mp3', volume: 1.0 },
  start:             { url: 'https://filedn.com/lQQF6SFSgwj0ab00vQxYlGF/Game%20sound/gamestart-272829.mp3', volume: 0.7 },
  speedUp:           { url: 'https://assets.mixkit.co/active_storage/sfx/255/255-preview.mp3', volume: 0.6 },
  rumble:            { url: 'https://assets.mixkit.co/active_storage/sfx/2573/2573-preview.mp3', volume: 1.0 },
  crash:             { url: 'https://filedn.com/lQQF6SFSgwj0ab00vQxYlGF/Game%20sound/game-over-classic-206486.mp3', volume: 1.0 },
  atmosphere:        { url: 'https://filedn.com/lQQF6SFSgwj0ab00vQxYlGF/Game%20sound/atmosphere-sound-effect-239969.mp3', volume: 0.6, loop: true },
  levelUp:           { url: 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3', volume: 0.7 },
  powerUpCollect:    { url: 'https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3', volume: 0.5 },
  achievementUnlock: { url: 'https://assets.mixkit.co/active_storage/sfx/2018/2018-preview.mp3', volume: 0.8 },
  menuMusic:         { url: 'https://filedn.com/lQQF6SFSgwj0ab00vQxYlGF/Game%20sound/Cosmic%20Tunnel/Arcade%20Mobile%20Game%20Background%20loop.wav', volume: 0.5, loop: true },
  voidSpawn:         { url: 'https://filedn.com/lQQF6SFSgwj0ab00vQxYlGF/Game%20sound/Cosmic%20Tunnel/IMPACT_Sub_Boom_Tonal_Deep_Space.wav', volume: 0.9 },
  voidCoreHit:       { url: 'https://filedn.com/lQQF6SFSgwj0ab00vQxYlGF/Game%20sound/Cosmic%20Tunnel/DroneReactor_BW.43983.wav', volume: 0.8 },
  voidCountdown:     { url: 'https://filedn.com/lQQF6SFSgwj0ab00vQxYlGF/Game%20sound/Cosmic%20Tunnel/BEEPTimer_Digital%20Timer%20Beeping%20Bomb%20Clock_GENHD1-07734.wav', volume: 0.6, loop: true },
  voidAllCores:      { url: 'https://filedn.com/lQQF6SFSgwj0ab00vQxYlGF/Game%20sound/Cosmic%20Tunnel/8-Bit%20135%20MIX%20Loop%20Version%201.mp3', volume: 1.0 },
};

// Build audio elements once at module load time (no user gesture needed just to create them)
const audioElements = {} as Record<SoundType, HTMLAudioElement>;
for (const [key, cfg] of Object.entries(TRACKS) as [SoundType, TrackConfig][]) {
  const el = new Audio(cfg.url);
  el.volume = cfg.volume;
  if (cfg.loop) el.loop = true;
  el.preload = 'auto';
  audioElements[key] = el;
}

// ---------------------------------------------------------------------------
// Unlock audio on first user interaction (required by browsers / iOS Safari).
// Uses the standard silent-buffer trick that reliably unblocks HTMLAudioElement
// playback on iOS Safari and Chrome's autoplay policy.
// ---------------------------------------------------------------------------
let unlocked = false;
export const unlockAudio = () => {
  if (unlocked) return;
  unlocked = true;
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioCtx();
    // Play a silent 1-sample buffer — this is the standard iOS unlock pattern
    const buf = ctx.createBuffer(1, 1, 22050);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.connect(ctx.destination);
    src.start(0);
    ctx.resume();
  } catch (_) { /* not all browsers support AudioContext */ }
};

// Loop sounds that should only start if not already playing
const LOOP_TYPES = new Set<SoundType>(['atmosphere', 'menuMusic', 'voidCountdown']);

export const soundManager = {
  play(type: SoundType) {
    const audio = audioElements[type];
    if (!audio) return;
    if (LOOP_TYPES.has(type)) {
      if (!audio.paused) return; // already playing
      if (audio.readyState >= 2) {
        // Audio is buffered enough — play immediately
        audio.play().catch(() => {});
      } else {
        // Not loaded yet — wait for enough data then play
        const onReady = () => {
          audio.play().catch(() => {});
          audio.removeEventListener('canplay', onReady);
        };
        audio.addEventListener('canplay', onReady);
        audio.load(); // kick off loading if not started
      }
    } else if (type === 'shoot') {
      // Allow overlapping shots by cloning
      const clone = new Audio(audio.src);
      clone.volume = audio.volume;
      clone.play().catch(() => {});
    } else {
      audio.currentTime = 0;
      audio.play().catch(() => {});
    }
  },
  stop(type: SoundType) {
    const audio = audioElements[type];
    if (audio && !audio.paused) {
      audio.pause();
      audio.currentTime = 0;
    }
  },
  stopAll() {
    for (const audio of Object.values(audioElements)) {
      if (!audio.paused) {
        audio.pause();
        audio.currentTime = 0;
      }
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
