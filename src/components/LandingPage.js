import React, { useState, useEffect } from 'react';

const LandingPage = ({ onComplete }) => {
  const [currentLanguage, setCurrentLanguage] = useState(0);
  const [showWelcome, setShowWelcome] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  const languages = [
    { text: "Hi", lang: "English" },
    { text: "नमस्ते", lang: "Hindi" },
    { text: "Hola", lang: "Spanish" },
    { text: "Bonjour", lang: "French" },
    { text: "Hallo", lang: "German" },
    { text: "こんにちは", lang: "Japanese" },
    { text: "你好", lang: "Chinese" },
    { text: "Olá", lang: "Portuguese" },
    { text: "Ciao", lang: "Italian" },
    { text: "Привет", lang: "Russian" },
    { text: "مرحبا", lang: "Arabic" },
    { text: "안녕하세요", lang: "Korean" }
  ];

  useEffect(() => {
    const languageInterval = setInterval(() => {
      setCurrentLanguage((prev) => (prev + 1) % languages.length);
    }, 400);

    // Show welcome message after cycling through languages
    const welcomeTimer = setTimeout(() => {
      setShowWelcome(true);
    }, languages.length * 400 + 500);

    // Start fade out and complete
    const completeTimer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(onComplete, 800);
    }, languages.length * 400 + 3000);

    return () => {
      clearInterval(languageInterval);
      clearTimeout(welcomeTimer);
      clearTimeout(completeTimer);
    };
  }, [languages.length, onComplete]);

  return (
    <div className={`fixed inset-0 z-50 bg-gray-900 flex items-center justify-center transition-opacity duration-800 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-purple-900/20 to-blue-900/20 animate-gradient-x"></div>
      
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white/10 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 text-center px-8">
        {/* Main "Hi" text in different languages */}
        <div className="mb-8">
          <h1 className="text-6xl md:text-8xl font-bold text-white mb-2 transition-all duration-300 transform hover:scale-105">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent animate-pulse">
              {languages[currentLanguage].text}
            </span>
          </h1>
          <p className="text-purple-300/70 text-sm font-medium tracking-wider">
            {languages[currentLanguage].lang}
          </p>
        </div>

        {/* Welcome message */}
        <div className={`transition-all duration-1000 transform ${
          showWelcome ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <div className="mb-6">
            <h2 className="text-2xl md:text-4xl font-semibold text-white mb-2">
              Welcome to{' '}
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Nevix Dev
              </span>
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-blue-500 mx-auto rounded-full animate-pulse"></div>
          </div>

          {/* Loading indicator */}
          <div className="flex items-center justify-center space-x-2 text-purple-300/60">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <span className="text-sm font-medium ml-3">Loading Experience...</span>
          </div>
        </div>
      </div>

      {/* Glowing orb effect */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
    </div>
  );
};

export default LandingPage;