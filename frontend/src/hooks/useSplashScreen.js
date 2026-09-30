import { useState, useEffect, useCallback } from 'react';

export function useSplashScreen(duration = 2700) {
  const [splashCounter, setSplashCounter] = useState(1);
  const [showSplash, setShowSplash] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [roleStep, setRoleStep] = useState(0);

  const dismissSplash = useCallback(() => {
    setIsFadingOut(true);
    setTimeout(() => {
      setShowSplash(false);
    }, 400);
  }, []);

  const triggerSplash = useCallback(() => {
    setSplashCounter((c) => c + 1);
  }, []);

  useEffect(() => {
    // Reset state for new run
    setShowSplash(true);
    setIsFadingOut(false);
    setRoleStep(0);

    // Escape key listener to allow fast skip for developers & power users
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        dismissSplash();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    // Staggered role activation milestones
    const t1 = setTimeout(() => setRoleStep(1), 600);
    const t2 = setTimeout(() => setRoleStep(2), 1150);
    const t3 = setTimeout(() => setRoleStep(3), 1700);
    const t4 = setTimeout(() => setRoleStep(4), 2200);

    // Smooth transition into Login Page
    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, Math.max(1000, duration - 450));

    const completeTimer = setTimeout(() => {
      setShowSplash(false);
    }, duration);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [splashCounter, duration, dismissSplash]);

  return {
    showSplash,
    isFadingOut,
    roleStep,
    triggerSplash,
    dismissSplash
  };
}
