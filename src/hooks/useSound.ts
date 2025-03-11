
import { useCallback, useEffect, useRef } from 'react';

type SoundType = 'shoot' | 'explosion' | 'gameOver' | 'start' | 'speedUp' | 'rumble' | 'crash' | 'atmosphere';

export const useSound = () => {
  const audioRefs = useRef<Record<SoundType, HTMLAudioElement | null>>({
    shoot: null,
    explosion: null,
    gameOver: null,
    start: null,
    speedUp: null,
    rumble: null,
    crash: null,
    atmosphere: null
  });

  // Initialize audio elements
  useEffect(() => {
    // Create audio elements for each sound with more reliable URLs
    audioRefs.current.shoot = new Audio('https://assets.mixkit.co/active_storage/sfx/2635/2635-preview.mp3');
    audioRefs.current.explosion = new Audio('https://assets.mixkit.co/active_storage/sfx/235/235-preview.mp3');
    audioRefs.current.gameOver = new Audio('https://assets.mixkit.co/active_storage/sfx/1204/1204-preview.mp3'); // Fixed game over sound
    audioRefs.current.start = new Audio('https://assets.mixkit.co/active_storage/sfx/219/219-preview.mp3');
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
      audioRefs.current.atmosphere.volume = 0.7; // Setting appropriate volume for atmosphere sound
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
