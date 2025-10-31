import React from 'react';

const SmokeEffectFallback = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      {/* Subtle animated background as fallback */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/5 via-transparent to-teal-950/5 animate-pulse"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/2 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/2 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
    </div>
  );
};

export default SmokeEffectFallback;