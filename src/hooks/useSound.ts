import { useCallback, useEffect, useRef } from 'react';

type SoundType = 'shoot' | 'explosion' | 'gameOver' | 'start' | 'speedUp' | 'rumble' | 'crash' | 'atmosphere' | 'levelUp' | 'powerUpCollect' | 'achievementUnlock' | 'menuMusic' | 'voidSpawn' | 'voidCoreHit' | 'voidCountdown' | 'voidAllCores';

export const useSound = () => {
  const audioRefs = useRef<Record<SoundType, HTMLAudioElement | null>>({
    shoot: null,
    explosion: null,
    gameOver: null,
    start: null,
    speedUp: null,
    rumble: null,
    crash: null,
    atmosphere: null,
    levelUp: null,
    powerUpCollect: null,
    achievementUnlock: null,
    menuMusic: null,
    voidSpawn: null,
    voidCoreHit: null,
    voidCountdown: null,
    voidAllCores: null,
  });

  // Initialize audio elements
  useEffect(() => {
    // Create audio elements for each sound with more reliable URLs
    audioRefs.current.shoot = new Audio('https://filedn.com/lQQF6SFSgwj0ab00vQxYlGF/Game%20sound/lazercannon-37980.mp3');
    audioRefs.current.explosion = new Audio('https://assets.mixkit.co/active_storage/sfx/235/235-preview.mp3');
    audioRefs.current.gameOver = new Audio('https://assets.mixkit.co/active_storage/sfx/1204/1204-preview.mp3'); // Fixed game over sound
    audioRefs.current.start = new Audio('https://filedn.com/lQQF6SFSgwj0ab00vQxYlGF/Game%20sound/gamestart-272829.mp3');
    audioRefs.current.speedUp = new Audio('https://assets.mixkit.co/active_storage/sfx/255/255-preview.mp3');
    audioRefs.current.rumble = new Audio('https://assets.mixkit.co/active_storage/sfx/2573/2573-preview.mp3'); // Changed to working sound
    // Using the provided crash sound
    audioRefs.current.crash = new Audio('https://filedn.com/lQQF6SFSgwj0ab00vQxYlGF/Game%20sound/game-over-classic-206486.mp3');
    // Adding the new atmosphere sound
    audioRefs.current.atmosphere = new Audio('https://filedn.com/lQQF6SFSgwj0ab00vQxYlGF/Game%20sound/atmosphere-sound-effect-239969.mp3');

    // Set audio volume levels
    if (audioRefs.current.shoot) {
      audioRefs.current.shoot.volume = 0.3;
    }
    if (audioRefs.current.explosion) {
      audioRefs.current.explosion.volume = 1.0;
    }
    if (audioRefs.current.gameOver) {
      audioRefs.current.gameOver.volume = 1.0;
    }
    if (audioRefs.current.start) {
      audioRefs.current.start.volume = 0.7;
    }
    if (audioRefs.current.speedUp) {
      audioRefs.current.speedUp.volume = 0.6;
    }
    if (audioRefs.current.rumble) {
      audioRefs.current.rumble.volume = 1.0;
    }
    if (audioRefs.current.crash) {
      audioRefs.current.crash.volume = 1.0; // Full volume for crash sound
    }
    if (audioRefs.current.atmosphere) {
      audioRefs.current.atmosphere.volume = 0.6; // Increased volume for atmosphere sound
      audioRefs.current.atmosphere.loop = true; // Make atmosphere sound loop continuously
    }
    
    // New sound effects
    audioRefs.current.levelUp = new Audio('https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3');
    audioRefs.current.powerUpCollect = new Audio('https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3');
    audioRefs.current.achievementUnlock = new Audio('https://assets.mixkit.co/active_storage/sfx/2018/2018-preview.mp3');
    
    if (audioRefs.current.levelUp) {
      audioRefs.current.levelUp.volume = 0.7;
    }
    if (audioRefs.current.powerUpCollect) {
      audioRefs.current.powerUpCollect.volume = 0.5;
    }
    if (audioRefs.current.achievementUnlock) {
      audioRefs.current.achievementUnlock.volume = 0.8;
    }

    // Menu / start screen music
    audioRefs.current.menuMusic = new Audio('https://filedn.com/lQQF6SFSgwj0ab00vQxYlGF/Game%20sound/Cosmic%20Tunnel/Arcade%20Mobile%20Game%20Background%20loop.wav');
    if (audioRefs.current.menuMusic) {
      audioRefs.current.menuMusic.volume = 0.5;
      audioRefs.current.menuMusic.loop = true;
    }

    // Void Awakens event sounds
    audioRefs.current.voidSpawn = new Audio('https://filedn.com/lQQF6SFSgwj0ab00vQxYlGF/Game%20sound/Cosmic%20Tunnel/IMPACT_Sub_Boom_Tonal_Deep_Space.wav');
    audioRefs.current.voidCoreHit = new Audio('https://filedn.com/lQQF6SFSgwj0ab00vQxYlGF/Game%20sound/Cosmic%20Tunnel/DroneReactor_BW.43983.wav');
    audioRefs.current.voidCountdown = new Audio('https://filedn.com/lQQF6SFSgwj0ab00vQxYlGF/Game%20sound/Cosmic%20Tunnel/BEEPTimer_Digital%20Timer%20Beeping%20Bomb%20Clock_GENHD1-07734.wav');
    audioRefs.current.voidAllCores = new Audio('https://filedn.com/lQQF6SFSgwj0ab00vQxYlGF/Game%20sound/Cosmic%20Tunnel/8-Bit%20135%20MIX%20Loop%20Version%201.mp3');
    if (audioRefs.current.voidSpawn) audioRefs.current.voidSpawn.volume = 0.9;
    if (audioRefs.current.voidCoreHit) audioRefs.current.voidCoreHit.volume = 0.8;
    if (audioRefs.current.voidCountdown) {
      audioRefs.current.voidCountdown.volume = 0.6;
      audioRefs.current.voidCountdown.loop = true;
    }
    if (audioRefs.current.voidAllCores) audioRefs.current.voidAllCores.volume = 1.0;

    // Preload audio (load only — play() without user gesture is blocked by browsers)
    Object.values(audioRefs.current).forEach(audio => {
      if (audio) audio.load();
    });

    // Clean up function
    return () => {
      Object.values(audioRefs.current).forEach(audio => {
        if (audio) {
          audio.pause();
          audio.src = '';
        }
      });
    };
  }, []);

  const playSound = useCallback((type: SoundType) => {
    const audio = audioRefs.current[type];
    if (!audio) return;
    if (type === 'shoot') {
      const newAudio = new Audio(audio.src);
      newAudio.volume = audio.volume;
      newAudio.play().catch(() => {});
    } else if (type === 'atmosphere' || type === 'menuMusic' || type === 'voidCountdown') {
      // Looping sounds — only start if not already playing
      if (audio.paused) {
        audio.play().catch(() => {});
      }
    } else {
      audio.currentTime = 0;
      audio.play().catch(() => {});
    }
  }, []);

  const stopSound = useCallback((type: SoundType) => {
    const audio = audioRefs.current[type];
    if (audio && !audio.paused) {
      audio.pause();
      audio.currentTime = 0;
    }
  }, []);

  return { playSound, stopSound };
};
