import React, { useState, useEffect, useRef } from 'react';
import SmokeEffectFallback from './SmokeEffectFallback';

const LazySmokeEffect = React.lazy(() => import('./SmokeEffect'));

const SmokeEffectWrapper = () => {
  const [shouldLoad, setShouldLoad] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    // Only load smoke effect if user has decent hardware and prefers motion
    const shouldLoadEffect = () => {
      // Check for reduced motion preference
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return false;
      }

      // Check for low-end devices
      if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) {
        return false;
      }

      // Check for mobile devices - disabled by default for performance
      if (window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        return false;
      }

      // Check for slow connections
      if (navigator.connection && (navigator.connection.effectiveType === 'slow-2g' || navigator.connection.effectiveType === '2g')) {
        return false;
      }

      // Check for low memory devices
      if (navigator.deviceMemory && navigator.deviceMemory < 4) {
        return false;
      }

      // Check if page is loaded from cache (faster loading)
      if (performance.getEntriesByType && performance.getEntriesByType('navigation')[0]?.transferSize === 0) {
        return true; // Cached page, safe to load effects
      }

      // Check current performance
      if (performance.now && performance.now() > 3000) {
        return false; // Page took too long to load, skip heavy effects
      }

      return true;
    };

    if (shouldLoadEffect()) {
      // Delay loading to improve initial page load performance
      const loadTimeout = setTimeout(() => {
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                setShouldLoad(true);
                observer.disconnect();
              }
            });
          },
          { threshold: 0.1 }
        );

        if (containerRef.current) {
          observer.observe(containerRef.current);
        }

        return () => observer.disconnect();
      }, 1000); // Delay by 1 second to let other critical resources load first

      return () => clearTimeout(loadTimeout);
    }
  }, []);

  return (
    <div ref={containerRef} className="fixed inset-0 pointer-events-none z-0">
      {shouldLoad ? (
        <React.Suspense fallback={<SmokeEffectFallback />}>
          <LazySmokeEffect />
        </React.Suspense>
      ) : (
        <SmokeEffectFallback />
      )}
    </div>
  );
};

export default SmokeEffectWrapper;