import React from 'react';

const SmokeEffectFallback = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 smoke-fallback">
      {/* Very subtle animated background as fallback */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/3 via-transparent to-teal-950/3 animate-pulse"></div>
      <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-emerald-500/1 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }}></div>
      <div className="absolute bottom-1/3 right-1/3 w-64 h-64 bg-teal-500/1 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s', animationDuration: '4s' }}></div>
    </div>
  );
};

export default SmokeEffectFallback;