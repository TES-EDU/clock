import { useCallback } from 'react';
import { useGameStore } from '../stores/gameStore';
import {
  playClickSound,
  playCorrectSound,
  playWrongSound,
  playPauseSound,
  playGameOverSound,
} from '../utils/sound';

interface UseSoundReturn {
  playClick: () => void;
  playCorrect: () => void;
  playWrong: () => void;
  playPause: () => void;
  playGameOver: () => void;
}

export function useSound(): UseSoundReturn {
  const soundEnabled = useGameStore((s) => s.soundEnabled);
  const soundVolume = useGameStore((s) => s.soundVolume);

  const playClick = useCallback(() => {
    if (soundEnabled) playClickSound(soundVolume);
  }, [soundEnabled, soundVolume]);

  const playCorrect = useCallback(() => {
    if (soundEnabled) playCorrectSound(soundVolume);
  }, [soundEnabled, soundVolume]);

  const playWrong = useCallback(() => {
    if (soundEnabled) playWrongSound(soundVolume);
  }, [soundEnabled, soundVolume]);

  const playPause = useCallback(() => {
    if (soundEnabled) playPauseSound(soundVolume);
  }, [soundEnabled, soundVolume]);

  const playGameOver = useCallback(() => {
    if (soundEnabled) playGameOverSound(soundVolume);
  }, [soundEnabled, soundVolume]);

  return {
    playClick,
    playCorrect,
    playWrong,
    playPause,
    playGameOver,
  };
}
