
import { useCallback, useEffect, useRef } from 'react';

type SoundType = 'shoot' | 'explosion' | 'gameOver' | 'start' | 'speedUp' | 'rumble';

export const useSound = () => {
  const audioRefs = useRef<Record<SoundType, HTMLAudioElement | null>>({
    shoot: null,
    explosion: null,
    gameOver: null,
    start: null,
    speedUp: null,
    rumble: null
  });

  // Initialize audio elements
  useEffect(() => {
    // Create audio elements for each sound
    audioRefs.current.shoot = new Audio('https://assets.mixkit.co/active_storage/sfx/2635/2635-preview.mp3');
    audioRefs.current.explosion = new Audio('https://assets.mixkit.co/active_storage/sfx/235/235-preview.mp3');
    audioRefs.current.gameOver = new Audio('https://assets.mixkit.co/active_storage/sfx/209/209-preview.mp3');
    audioRefs.current.start = new Audio('https://assets.mixkit.co/active_storage/sfx/219/219-preview.mp3');
    audioRefs.current.speedUp = new Audio('https://assets.mixkit.co/active_storage/sfx/255/255-preview.mp3');
    // Add rumble sound effect (a low-frequency rumble sound)
    audioRefs.current.rumble = new Audio('https://assets.mixkit.co/active_storage/sfx/209/209-preview.mp3');

    // Set audio volume levels - reducing the shooting sound volume
    if (audioRefs.current.shoot) {
      audioRefs.current.shoot.volume = 0.3; // Reduced from 0.8 to 0.3
    }
    if (audioRefs.current.explosion) {
      audioRefs.current.explosion.volume = 1.0; // Increased to maximum for when meteor is hit
    }
    if (audioRefs.current.gameOver) {
      audioRefs.current.gameOver.volume = 1.0; // Maximum volume
    }
    if (audioRefs.current.start) {
      audioRefs.current.start.volume = 0.7;
    }
    if (audioRefs.current.speedUp) {
      audioRefs.current.speedUp.volume = 0.6;
    }
    if (audioRefs.current.rumble) {
      audioRefs.current.rumble.volume = 1.0; // Maximum volume for rumble sound
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
        newAudio.volume = audio.volume; // Use the same lower volume
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
