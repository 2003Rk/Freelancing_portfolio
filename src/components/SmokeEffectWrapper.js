import React, { useState, useEffect, useRef } from 'react';
import SmokeEffectFallback from './SmokeEffectFallback';

// Import directly for faster loading instead of lazy loading
import SmokeEffect from './SmokeEffect';

const LazySmokeEffect = SmokeEffect;

const SmokeEffectWrapper = () => {
  const [shouldLoad, setShouldLoad] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    // Preload immediately on component mount for faster loading
    const shouldLoadEffect = () => {
      // Only check for the most critical conditions
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return false;
      }

      // Only disable on very old or very slow devices
      if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 2) {
        return false;
      }

      // Allow on mobile but with reduced settings (handled in SmokeEffect.js)
      return true;
    };

    // Load immediately without any delays for better reliability
    const timer = setTimeout(() => {
      if (shouldLoadEffect()) {
        setShouldLoad(true);
      }
    }, 0); // Immediate execution

    return () => clearTimeout(timer);
  }, []);

  return (
    <div ref={containerRef} className="fixed inset-0 pointer-events-none z-0">
      <SmokeEffectFallback />
      {shouldLoad && <LazySmokeEffect />}
    </div>
  );
};

export default SmokeEffectWrapper;