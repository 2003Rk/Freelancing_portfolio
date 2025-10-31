import React, { useState, useEffect, useRef } from 'react';

const OptimizedImage = ({ 
  src, 
  alt, 
  className = '', 
  loading = 'lazy', 
  placeholder = 'blur',
  onLoad,
  onError,
  ...props 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(loading === 'eager');
  const imgRef = useRef(null);

  useEffect(() => {
    if (loading === 'lazy' && imgRef.current) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setShouldLoad(true);
              observer.disconnect();
            }
          });
        },
        { 
          rootMargin: '50px' // Start loading 50px before the image enters viewport
        }
      );

      observer.observe(imgRef.current);

      return () => observer.disconnect();
    }
  }, [loading]);

  const handleLoad = (e) => {
    setIsLoaded(true);
    if (onLoad) onLoad(e);
  };

  const handleError = (e) => {
    setIsError(true);
    if (onError) onError(e);
  };

  if (isError) {
    return (
      <div className={`${className} flex items-center justify-center bg-zinc-800/50 text-zinc-600 text-sm`}>
        Failed to load image
      </div>
    );
  }

  return (
    <div ref={imgRef} className={`relative ${className}`} {...props}>
      {/* Placeholder/Loading state */}
      {!isLoaded && shouldLoad && (
        <div className="absolute inset-0 bg-zinc-800/50 animate-pulse flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin opacity-60"></div>
        </div>
      )}
      
      {/* Skeleton placeholder before loading */}
      {!shouldLoad && (
        <div className="absolute inset-0 bg-zinc-800/30 animate-pulse"></div>
      )}
      
      {/* Actual image */}
      {shouldLoad && (
        <img
          src={src}
          alt={alt}
          className={`${className} transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          loading={loading}
          decoding="async"
          onLoad={handleLoad}
          onError={handleError}
          style={{ 
            contentVisibility: 'auto',
            contain: 'layout style paint'
          }}
        />
      )}
    </div>
  );
};

export default OptimizedImage;