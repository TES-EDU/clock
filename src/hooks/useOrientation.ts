import { useState, useEffect } from 'react';

interface OrientationResult {
  isPortrait: boolean;
}

export function useOrientation(): OrientationResult {
  const [isPortrait, setIsPortrait] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(orientation: portrait)').matches;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(orientation: portrait)');

    const handleChange = (e: MediaQueryListEvent) => {
      setIsPortrait(e.matches);
    };

    const handleResize = () => {
      setIsPortrait(mediaQuery.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    window.addEventListener('resize', handleResize);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return { isPortrait };
}
