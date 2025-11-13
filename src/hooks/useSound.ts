import { useCallback, useEffect, useRef } from 'react';

type SoundType = 'shoot' | 'explosion' | 'gameOver' | 'start' | 'speedUp' | 'rumble' | 'crash' | 'atmosphere' | 'levelUp' | 'powerUpCollect' | 'achievementUnlock';

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
    achievementUnlock: null
  });

  // Initialize audio elements
  useEffect(() => {
    // Create audio elements for each sound with more reliable URLs
    audioRefs.current.shoot = new Audio('https://filedn.com/lQQF6SFSgwj0ab00vQxYlGF/Game%20sound/lazercannon-37980.mp3');
    audioRefs.current.explosion = new Audio('https://assets.mixkit.co/active_storage/sfx/235/235-preview.mp3');
    audioRefs.current.gameOver = new Audio('https://assets.mixkit.co/active_storage/sfx/1204/1204-preview.mp3'); // Fixed game over sound
    audioRefs.current.start = new Audio('https://filedn.com/lQQF6SFSgwj0ab00vQxYlGF/Game%20sound/gamestart-272829.mp3');
    audioRefs.current.speedUp = new Audio('https://assets.mixkit.co/active_storage/sfx/255/255-preview.mp3');
    audioRefs.current.rumble = new Audio('https://assets.mixkit.co/active_storage/sfx/209/209-preview.mp3');
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

    // Preload audio
    Object.values(audioRefs.current).forEach(audio => {
      if (audio) {
        audio.load();
        // Enable sound on mobile by playing silently once
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              audio.pause();
              audio.currentTime = 0;
            })
            .catch(err => {
              console.log('Preload audio error:', err);
            });
        }
      }
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
    if (audio) {
      // Create a new instance for overlapping sounds
      if (type === 'shoot') {
        const newAudio = new Audio(audio.src);
        newAudio.volume = audio.volume;
        newAudio.play().catch(err => {
          console.error(`Error playing ${type} sound:`, err);
        });
      } else if (type === 'atmosphere') {
        // For atmosphere sound, ensure it's not already playing before starting
        if (audio.paused) {
          console.log('Starting atmosphere sound...');
          audio.play().catch(err => {
            console.error(`Error playing atmosphere sound:`, err);
          });
        } else {
          console.log('Atmosphere sound is already playing');
        }
      } else {
        // For other sounds, reset and play the existing audio
        audio.currentTime = 0;
        audio.play().catch(err => {
          console.error(`Error playing ${type} sound:`, err);
        });
      }
    }
  }, []);

  return { playSound };
};
