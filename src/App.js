import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Github, Linkedin, Mail, Star, Code, Briefcase, Users, ArrowUpRight, ChevronDown, Terminal, Sparkles, ChevronRight, ChevronLeft, X, ExternalLink } from 'lucide-react';
import { fetchClientsData, fetchReviewsData } from './services/firebaseService';
import SmokeEffectWrapper from './components/SmokeEffectWrapper';
import OptimizedImage from './components/OptimizedImage';

export default function App() {
  const [scrolled, setScrolled] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedProofCard, setSelectedProofCard] = useState(null);
  const [modalImageIndex, setModalImageIndex] = useState(0);
  const [clientsData, setClientsData] = useState([]);
  const [loadingClients, setLoadingClients] = useState(true);
  const [reviewsData, setReviewsData] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [clientScrollIndex, setClientScrollIndex] = useState(0);
  const [testimonialScrollIndex, setTestimonialScrollIndex] = useState(0);
  const [isClientAutoPlaying, setIsClientAutoPlaying] = useState(true);
  const [isTestimonialAutoPlaying, setIsTestimonialAutoPlaying] = useState(true);
  const [clientTouchStart, setClientTouchStart] = useState(null);
  const [testimonialTouchStart, setTestimonialTouchStart] = useState(null);
  const gradientRef = useRef(null);
  const clientScrollRef = useRef(null);
  const testimonialScrollRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Preload critical images
  useEffect(() => {
    const preloadImage = (src) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      document.head.appendChild(link);
    };

    // Preload profile image
    preloadImage('/IMG_8706.PNG');
  }, []);

  // Client scroll functions
  const scrollClientsLeft = useCallback(() => {
    setIsClientAutoPlaying(false);
    setClientScrollIndex((prev) => Math.max(0, prev - 1));
    setTimeout(() => setIsClientAutoPlaying(true), 5000); // Resume auto-play after 5s
  }, []);

  const scrollClientsRight = useCallback(() => {
    setIsClientAutoPlaying(false);
    const maxIndex = Math.max(0, clientsData.length - 3); // Show 3 cards at once
    setClientScrollIndex((prev) => Math.min(maxIndex, prev + 1));
    setTimeout(() => setIsClientAutoPlaying(true), 5000); // Resume auto-play after 5s
  }, [clientsData.length]);

  // Testimonial scroll functions
  const scrollTestimonialsLeft = useCallback(() => {
    setIsTestimonialAutoPlaying(false);
    setTestimonialScrollIndex((prev) => Math.max(0, prev - 1));
    setTimeout(() => setIsTestimonialAutoPlaying(true), 5000); // Resume auto-play after 5s
  }, []);

  const scrollTestimonialsRight = useCallback(() => {
    setIsTestimonialAutoPlaying(false);
    const maxIndex = Math.max(0, reviewsData.length - 3); // Show 3 cards at once
    setTestimonialScrollIndex((prev) => Math.min(maxIndex, prev + 1));
    setTimeout(() => setIsTestimonialAutoPlaying(true), 5000); // Resume auto-play after 5s
  }, [reviewsData.length]);

  // Touch/Swipe handlers for mobile
  const handleTouchStart = (setTouchStart) => (e) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchMove = (touchStart, scrollLeft, scrollRight, setAutoPlay) => (e) => {
    if (!touchStart) return;
    const touchEnd = e.touches[0].clientX;
    const diff = touchStart - touchEnd;
    
    if (Math.abs(diff) > 50) { // Minimum swipe distance
      setAutoPlay(false);
      if (diff > 0) {
        scrollRight();
      } else {
        scrollLeft();
      }
    }
  };

  // Optimized modal handlers to prevent lag
  const handleCategorySelect = useCallback((category) => {
    // Use requestAnimationFrame for smooth modal opening
    requestAnimationFrame(() => {
      setSelectedCategory(category);
    });
  }, []);

  const handleModalClose = useCallback(() => {
    setSelectedCategory(null);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      
      switch(e.key) {
        case 'ArrowLeft':
          if (e.shiftKey) {
            scrollTestimonialsLeft();
          } else {
            scrollClientsLeft();
          }
          break;
        case 'ArrowRight':
          if (e.shiftKey) {
            scrollTestimonialsRight();
          } else {
            scrollClientsRight();
          }
          break;
        default:
          // No action needed for other keys
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [scrollClientsLeft, scrollClientsRight, scrollTestimonialsLeft, scrollTestimonialsRight]);

  // Performance monitoring (development only)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🚀 App initialized at:', performance.now(), 'ms');
      
      // Monitor Core Web Vitals
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'largest-contentful-paint') {
            console.log('📊 LCP:', entry.startTime, 'ms');
          }
          if (entry.entryType === 'first-input') {
            console.log('🖱️ FID:', entry.processingStart - entry.startTime, 'ms');
          }
        }
      });
      
      try {
        observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input'] });
      } catch (e) {
        // Browser doesn't support these metrics
      }

      // Log SmokeEffect loading time
      const smokeLoadStart = performance.now();
      const checkSmokeLoad = () => {
        const smokeCanvas = document.querySelector('canvas');
        if (smokeCanvas && smokeCanvas.style.opacity === '1') {
          console.log('💨 SmokeEffect loaded in:', performance.now() - smokeLoadStart, 'ms');
        } else {
          requestAnimationFrame(checkSmokeLoad);
        }
      };
      setTimeout(checkSmokeLoad, 1000);

      return () => observer.disconnect();
    }
  }, []);

  // Fast smooth scroll for anchor links
  useEffect(() => {
    const handleAnchorClick = (e) => {
      const target = e.target.closest('a[href^="#"]');
      if (target && e.type === 'click') {
        // Only prevent default for actual clicks, not touch events during scrolling
        if (!e.touches) {
          e.preventDefault();
          const id = target.getAttribute('href').slice(1);
          const element = document.getElementById(id);
          if (element) {
            element.scrollIntoView({
              behavior: 'smooth',
              block: 'start',
            });
          }
        }
      }
    };

    document.addEventListener('click', handleAnchorClick);
    return () => document.removeEventListener('click', handleAnchorClick);
  }, []);

  // Manage body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      // Don't prevent body scrolling on mobile when menu is open
      // This allows users to still scroll the page
      return;
    }
  }, [mobileMenuOpen]);

  // Smooth mouse gradient animation
  useEffect(() => {
    let targetX = 50, targetY = 50, currentX = 50, currentY = 50;
    let animationId;
    let mouseTimer;

    const handleMouseMove = (e) => {
      // Only handle mouse events, not touch events to avoid mobile scrolling issues
      if (e.type === 'mousemove' && !('ontouchstart' in window)) {
        targetX = (e.clientX / window.innerWidth) * 100;
        targetY = (e.clientY / window.innerHeight) * 100;
      }
    };

    const animate = () => {
      currentX += (targetX - currentX) * 0.1;
      currentY += (targetY - currentY) * 0.1;

      const color1 = `hsl(${(currentX * 3.6) % 360}, 100%, 60%)`;
      const color2 = `hsl(${(currentY * 3.6 + 120) % 360}, 100%, 50%)`;
      const color3 = `hsl(${(currentX * 3.6 + 240) % 360}, 100%, 40%)`;

      if (gradientRef.current) {
        gradientRef.current.style.background = `
          radial-gradient(circle at ${currentX}% ${currentY}%, ${color1}, ${color2}, ${color3})
        `;
      }

      animationId = requestAnimationFrame(animate);
    };

    document.addEventListener('mousemove', handleMouseMove);
    animationId = requestAnimationFrame(animate);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(mouseTimer);
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, []);

  // Fetch clients data from Firebase
  useEffect(() => {
    const loadClientsData = async () => {
      try {
        console.log('Starting to fetch client data from Firebase...');
        setLoadingClients(true);
        const data = await fetchClientsData();
        console.log('Client data fetched successfully:', data);
        setClientsData(data);
        
        if (data.length === 0) {
          console.warn('No clients found in Firestore collection "clients"');
        }
      } catch (error) {
        console.error('Failed to load clients data:', error);
        console.error('Error message:', error.message);
      } finally {
        setLoadingClients(false);
      }
    };

    loadClientsData();
  }, []);

  // Fetch reviews data from Firebase
  useEffect(() => {
    const loadReviewsData = async () => {
      try {
        console.log('Starting to fetch reviews data from Firebase...');
        setLoadingReviews(true);
        const data = await fetchReviewsData();
        console.log('Reviews data fetched successfully:', data);
        setReviewsData(data);
        
        if (data.length === 0) {
          console.warn('No reviews found in Firestore collection "reviews"');
        }
      } catch (error) {
        console.error('Failed to load reviews data:', error);
        console.error('Error message:', error.message);
      } finally {
        setLoadingReviews(false);
      }
    };

    loadReviewsData();
  }, []);

  // Auto-scroll functionality for testimonials (similar to clients section)
  useEffect(() => {
    let testimonialInterval;
    
    if (isTestimonialAutoPlaying && reviewsData.length > 3) {
      testimonialInterval = setInterval(() => {
        setTestimonialScrollIndex((prevIndex) => {
          const maxIndex = Math.max(0, reviewsData.length - 3);
          return prevIndex >= maxIndex ? 0 : prevIndex + 1;
        });
      }, 4000); // Auto-scroll every 4 seconds
    }

    return () => {
      if (testimonialInterval) {
        clearInterval(testimonialInterval);
      }
    };
  }, [isTestimonialAutoPlaying, reviewsData.length]);

  // Auto-scroll functionality for client proof section  
  useEffect(() => {
    let clientInterval;
    
    if (isClientAutoPlaying && clientsData.length > 3) {
      clientInterval = setInterval(() => {
        setClientScrollIndex((prevIndex) => {
          const maxIndex = Math.max(0, clientsData.length - 3);
          return prevIndex >= maxIndex ? 0 : prevIndex + 1;
        });
      }, 5000); // Auto-scroll every 5 seconds (slightly slower than testimonials)
    }

    return () => {
      if (clientInterval) {
        clearInterval(clientInterval);
      }
    };
  }, [isClientAutoPlaying, clientsData.length]);

  const projectCategories = [
    {
      name: "Mobile App Development",
      icon: "📱",
      gradient: "from-purple-500/20 to-pink-500/20",
      borderGradient: "from-purple-500 to-pink-500",
      bgGradient: "from-purple-900/20 to-pink-900/20",
      accentColor: "purple-400",
      description: "Native & cross-platform mobile applications with stunning UI/UX",
      technologies: ["React Native", "Flutter", "iOS", "Android"],
      projects: [
        {
          title: "Fibuddy",
          description: "FitBuddy — your all-in-one AI-powered fitness companion for workouts, meals, and progress tracking.",
          tech: ["Flutter", "Firebase", "Python" , "Django"],
          features: ["All Body Workouts", "Meal Planner", "Stretching Routines"],
          duration: "4 months",
          github: "https://github.com/2003Rk/FitBuddy-Ftiness-App"
        },
        {
          title: "Resume2Job",
          description: "Resume-Based Job Finder is an AI-powered app that analyzes resumes using NLP and ML to score ATS compatibility and recommend matching jobs from multiple platforms.",
          tech: ["Flutter", "Firebase", "Django" , "Python"],
          features: ["Resume AI analysis", "Job recommendations", "NLP parsing"],
          duration: "3 months",
          github: "https://github.com/2003Rk/Resume2Job"
        },
        {
          title: "Pucket Crypto App",
          description: "CryptoApp is designed for both beginners and experienced traders, combining wallet management, real-time market data, secure transactions, and AI-assisted guidance to deliver a seamless crypto experience.",
          tech: ["Flutter", "Riverpod", "Firebase" ],
          features: ["Secure wallet", "Progress analytics", "Real time stock tracking"],
          duration: "2 months",
          github: "https://github.com/2003Rk/Pucket-Crypto-app"
        },
        {
          title: "Japanese Music App",
          description: "A modern web app built with React and Firebase for streaming and enjoying Japanese music with a sleek, responsive design",
          tech: ["React Native", "Firebase"],
          features: ["music search ", "Real time music", "Smooth Ui"],
          duration: "1 months",
          github: "https://github.com/2003Rk/japan_music_app"
        },
          {
          title: "PawKit",
          description: "A Pet Food Delivery app that brings your pet's favorite food and treats straight to your door!",
          tech: ["React Native", "Firebase" , "FirebasePushnotifications"],
          features: ["Real-time tracking", "Easy reordering", "Personalized recommendations"],
          duration: "2 months",
          github: "https://pawkit.co/"
        }
      ]
    },
    {
      name: "Web Development",
      icon: "🌐",
      gradient: "from-blue-500/20 to-cyan-500/20",
      borderGradient: "from-blue-500 to-cyan-500",
      bgGradient: "from-blue-900/20 to-cyan-900/20",
      accentColor: "blue-400",
      description: "Full-stack web applications with modern technologies",
      technologies: ["React", "Next.js", "Node.js", "GraphQL"],
      projects: [
        {
          title: "VeriFil — Crypto ",
          description: "Analyze Ethereum wallets. Detect scams, honeypots, and risky tokens — all in one place. Built with Next.js + Tailwind frontend and a Python Flask backend.",
          tech: ["Next.js", "React", "Tailwind CSS", "Framer Motion" , "Python Flask"],
          features: ["Real-time analysis", "Risk assessment", "user-friendly UI"],
          duration: "2 months",
          github: "https://cryptowebsiite-yh1p.vercel.app/"
        },
        {
          title: "Scam_detection",
          description: "ScamShield is an AI-powered scam detection platform that uses machine learning, NLP, and computer vision to protect users from fraud in real time",
          tech: ["HTML5", "Python", "CSS3", "JavaScript" , " Flask " , "librosa" , "speechrecognition" , "NumPy"],
          features: ["Real-time monitoring", "Voice analysis", "Image Analysis" , "NLP detection"],
          duration: "1 months",
          github: "https://github.com/2003Rk/Scam_detection"
        },
        {
          title: "Estate Strapi Website",
          description: "A real estate website built with Strapi and Next.js, featuring property listings, user authentication, and a responsive design.",
          tech: ["Firebase Firestore", "Strapi CMS", "Tailwind CSS"],
          features: ["Property listings", "User authentication", "Responsive design"],
          duration: "3 months",
          github: "https://github.com/2003Rk/STRAPI"
        },
        {
          title: " Bittensor Transaction Tracker & Twitter Bot",
          description: "A full-stack transaction monitoring system for Bittensor (TAO) that tracks transfers between Bittensor and Solana networks and automatically posts real-time updates to Twitter (X).",
          tech: ["Flask", "Python", "Twitter API", "WebSocket", "Next.js"],
          features: ["Real-time tracking", "Cross-chain support", "Automated Twitter updates"],
          duration: "8 months",
          github: "https://github.com/2003Rk/edulearn-platform"
        }
      ]
    }
  ];



  const stats = [
    { icon: <Briefcase className="w-6 h-6" />, value: "10+", label: "Projects" },
    { icon: <Users className="w-6 h-6" />, value: "10+", label: "Clients" },
    { icon: <Star className="w-6 h-6" />, value: "4.7", label: "Rating" },
    { icon: <Code className="w-6 h-6" />, value: "4+", label: "Years" }
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">

      {/* Header */}
      <header className={`fixed top-0 w-full z-40 transition-all duration-500 ${scrolled ? 'bg-zinc-950/90 backdrop-blur-xl border-b border-zinc-800/50' : 'bg-transparent'}`}>
        <nav className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 flex justify-between items-center">
          <div className="flex items-center gap-2 text-lg sm:text-xl font-light tracking-wider">
            <Terminal className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
            <span className="text-zinc-400">nevix</span>
            <span className="text-emerald-400">.</span>
            <span className="text-zinc-100">Dev</span>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex gap-6 lg:gap-10 text-sm tracking-wide">
            <a href="#about" className="text-zinc-400 hover:text-emerald-400 transition-colors duration-300">About</a>
            <a href="#projects" className="text-zinc-400 hover:text-emerald-400 transition-colors duration-300">Work</a>
            <a href="#clients" className="text-zinc-400 hover:text-emerald-400 transition-colors duration-300">Clients</a>
            <a href="#testimonials" className="text-zinc-400 hover:text-emerald-400 transition-colors duration-300">Testimonials</a>
            <a href="#contact" className="text-zinc-400 hover:text-emerald-400 transition-colors duration-300">Contact</a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden w-8 h-8 flex flex-col justify-center items-center gap-1.5 focus:outline-none"
          >
            <span className={`w-5 h-0.5 bg-zinc-400 transition-all duration-300 ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
            <span className={`w-5 h-0.5 bg-zinc-400 transition-all duration-300 ${mobileMenuOpen ? 'opacity-0' : ''}`}></span>
            <span className={`w-5 h-0.5 bg-zinc-400 transition-all duration-300 ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
          </button>
        </nav>

        {/* Mobile Menu */}
        <div className={`md:hidden transition-all duration-300 overflow-hidden ${mobileMenuOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'} bg-zinc-950/95 backdrop-blur-xl border-b border-zinc-800/50`}>
          <div className="container mx-auto px-4 py-4 space-y-3">
            <a href="#about" onClick={() => setMobileMenuOpen(false)} className="block text-zinc-400 hover:text-emerald-400 transition-colors duration-300 py-2">About</a>
            <a href="#projects" onClick={() => setMobileMenuOpen(false)} className="block text-zinc-400 hover:text-emerald-400 transition-colors duration-300 py-2">Work</a>
            <a href="#clients" onClick={() => setMobileMenuOpen(false)} className="block text-zinc-400 hover:text-emerald-400 transition-colors duration-300 py-2">Clients</a>
            <a href="#testimonials" onClick={() => setMobileMenuOpen(false)} className="block text-zinc-400 hover:text-emerald-400 transition-colors duration-300 py-2">Testimonials</a>
            <a href="#contact" onClick={() => setMobileMenuOpen(false)} className="block text-zinc-400 hover:text-emerald-400 transition-colors duration-300 py-2">Contact</a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center px-4 sm:px-6 relative overflow-x-hidden bg-black">
        {/* Smoke Cursor Effect */}
        <SmokeEffectWrapper />

        <div className="container mx-auto text-center relative z-10">
          {/* Profile Photo with Floating Animation */}
          <div className="mb-8 sm:mb-12 flex justify-center">
            <div className="relative group">
              {/* Animated rings */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-500/20 to-teal-500/20 blur-2xl group-hover:blur-3xl transition-all duration-500 animate-pulse"></div>
              <div className="absolute inset-0 rounded-full border-2 border-emerald-500/30 animate-ping"></div>
              
              {/* Photo container */}
              <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-emerald-500/50 p-1 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 backdrop-blur-sm hover:border-emerald-400 transition-all duration-500 hover:scale-105 group-hover:shadow-2xl group-hover:shadow-emerald-500/30">
                <OptimizedImage 
                  src="/IMG_8706.PNG"
                  alt="Rahul Kumar - Software Engineer"
                  className="w-full h-full rounded-full object-cover"
                  loading="eager"
                />
                {/* Active status indicator */}
                <div className="absolute bottom-2 right-2 w-4 h-4 sm:w-5 sm:h-5 bg-emerald-400 rounded-full border-2 sm:border-4 border-zinc-950 animate-pulse"></div>
              </div>
            </div>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-light mb-4 sm:mb-6 tracking-tight">
            <span className="text-zinc-400">Software</span>
            <br />
            <span className="font-normal text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-500">Engineer</span>
          </h1>
          
          <p className="text-xl text-zinc-400 mb-12 max-w-2xl mx-auto font-light leading-relaxed">
            I’m Rahul Kumar, a full-stack and <br />mobile app developer creating innovative digital experiences.
          </p>

          <div className="flex items-center gap-6 justify-center mb-16">
            <a href="#contact" className="group px-8 py-4 bg-emerald-500 text-zinc-950 rounded-full hover:bg-emerald-400 transition-all duration-300 flex items-center gap-2 font-medium">
              Start a Project
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
            </a>
            <a href="#projects" className="px-8 py-4 border border-zinc-700 rounded-full hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all duration-300 font-medium">
              View Work
            </a>
          </div>

          <div className="flex gap-6 justify-center">
            {[
              { Icon: Github, link: "https://github.com/2003Rk" },
              { Icon: Linkedin, link: "https://www.linkedin.com/in/rahul-kr2000/" },
              { Icon: Mail, link: "mailto:rahulkr99222@gmail.com" }
            ].map(({ Icon, link }, i) => (
              <a key={i} href={link} className="w-12 h-12 border border-zinc-800 rounded-full flex items-center justify-center hover:border-emerald-500 hover:bg-emerald-500/5 transition-all duration-300 group">
                <Icon className="w-5 h-5 text-zinc-400 group-hover:text-emerald-400 transition-colors duration-300" />
              </a>
            ))}
          </div>

          <div className="absolute bottom-14 left-1/2 -translate-x-1/2 animate-bounce">
            <ChevronDown className="w-6 h-6 text-zinc-600" />
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 border-y border-zinc-800/50 bg-zinc-900/30">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="text-center group">
                <div className="flex justify-center mb-2 sm:mb-3 text-emerald-400 group-hover:scale-110 transition-transform duration-300">
                  {stat.icon}
                </div>
                <div className="text-2xl sm:text-4xl font-light mb-1 text-zinc-100">{stat.value}</div>
                <div className="text-xs sm:text-sm text-zinc-500 tracking-wider uppercase">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 sm:py-24 lg:py-32 px-4 sm:px-6 relative overflow-x-hidden">
        <div className="container mx-auto max-w-5xl relative z-10">
          <div className="grid md:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
            <div>
              <div className="text-xs sm:text-sm text-emerald-400 mb-4 tracking-wider uppercase">About Me</div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light mb-6 sm:mb-8 text-zinc-100">
                Building the future,<br />one line at a time.
              </h2>
              <p className="text-zinc-400 mb-6 leading-relaxed">
                I'm a Software Engineer with expertise in Full-Stack and Mobile App Development. With over 6 years of experience, I've built and delivered numerous projects as a freelancer for clients across diverse industries.
              </p>
              <p className="text-zinc-400 mb-8 leading-relaxed">
                I focus on crafting scalable, high-performing applications that solve real-world problems and provide seamless user experiences. My approach blends technical precision, creative thinking, and client-focused execution to ensure every project exceeds expectations.
              </p>
              <a href="#contact" className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors duration-300 group">
                Let's collaborate
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
              </a>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {["React", "Node.js", "Python", "MongoDB", "PostgreSQL" , "Firebase",  "TypeScript", "Next.js", "React Native", "Flutter" , "Android Studio"].map((skill, i) => (
                <div key={skill} className="p-4 border border-zinc-800 rounded-lg hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all duration-300 text-center group" style={{ animationDelay: `${i * 50}ms` }}>
                  <div className="text-sm text-zinc-400 group-hover:text-emerald-400 transition-colors duration-300">{skill}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="py-32 px-6 bg-zinc-900/30 relative overflow-x-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto relative z-10">
          <div className="text-center mb-20">
            <div className="text-sm text-emerald-400 mb-4 tracking-wider uppercase flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4" />
              Portfolio Showcase
            </div>
            <h2 className="text-5xl md:text-6xl font-light mb-6">Featured Projects</h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">Click on any category to explore projects</p>
          </div>
          
          {/* Category Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto justify-items-center">
            {projectCategories.map((category, index) => (
              <button
                key={index}
                onClick={() => handleCategorySelect(category)}
                className="group relative p-8 rounded-3xl border border-zinc-800 bg-zinc-950/50 hover:border-emerald-500/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-emerald-500/10 text-left"
              >
                {/* Background Gradient */}
                <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${category.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-2xl`}></div>
                
                {/* Icon */}
                <div className={`text-6xl mb-6 transform group-hover:scale-110 transition-transform duration-300`}>
                  {category.icon}
                </div>
                
                {/* Title */}
                <h3 className="text-2xl font-light mb-3 text-zinc-100 group-hover:text-emerald-400 transition-colors duration-300">
                  {category.name}
                </h3>
                
                {/* Description */}
                <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
                  {category.description}
                </p>
                
                {/* Stats */}
                <div className="flex items-center justify-between mb-6 pb-6 border-b border-zinc-800">
                  <div>
                    <div className="text-2xl font-light text-zinc-100">{category.totalProjects}</div>
                    <div className="text-xs text-zinc-500 uppercase tracking-wider">Projects</div>
                  </div>
                  <div className={`px-4 py-2 rounded-full bg-gradient-to-r ${category.borderGradient} text-white text-xs font-medium`}>
                    View All
                  </div>
                </div>
                
                {/* Technologies */}
                <div className="flex flex-wrap gap-2">
                  {category.technologies.map((tech, i) => (
                    <span key={i} className="px-2 py-1 text-xs rounded-md bg-zinc-900 border border-zinc-800 text-zinc-400">
                      {tech}
                    </span>
                  ))}
                </div>
                
                {/* Arrow */}
                <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <ChevronRight className="w-6 h-6 text-emerald-400" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Project Modal */}
      {selectedCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 modal-backdrop" onClick={handleModalClose}>
          <div className="relative w-full max-w-6xl max-h-[90vh] overflow-y-auto bg-zinc-950 rounded-3xl border border-zinc-800 shadow-2xl modal-container modal-enter" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className={`sticky top-0 z-10 p-8 border-b border-zinc-800 bg-gradient-to-r ${selectedCategory.bgGradient}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-5xl">{selectedCategory.icon}</div>
                  <div>
                    <h3 className="text-3xl font-light text-zinc-100">{selectedCategory.name}</h3>
                    <p className="text-zinc-400 text-sm mt-1">{selectedCategory.projects.length} completed projects</p>
                  </div>
                </div>
                <button
                  onClick={handleModalClose}
                  className="w-10 h-10 rounded-full border border-zinc-700 hover:border-emerald-500 hover:bg-emerald-500/10 transition-all duration-300 flex items-center justify-center"
                >
                  <X className="w-5 h-5 text-zinc-400 hover:text-emerald-400" />
                </button>
              </div>
            </div>

            {/* Projects List */}
            <div className="p-8 space-y-6">
              {selectedCategory.projects.map((project, index) => (
                <div
                  key={index}
                  className="group p-6 rounded-2xl border border-zinc-800 bg-zinc-900/30 hover:border-emerald-500/50 hover:bg-zinc-900/50 transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-2xl font-light text-zinc-100 group-hover:text-emerald-400 transition-colors duration-300">
                          {project.title}
                        </h4>
                       
                      </div>
                      <p className="text-zinc-400 leading-relaxed mb-4">
                        {project.description}
                      </p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6 mb-6">
                    {/* Features */}
                    <div>
                      <div className="text-xs text-zinc-500 uppercase tracking-wider mb-3">Key Features</div>
                      <div className="space-y-2">
                        {project.features.map((feature, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm text-zinc-400">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                            {feature}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Tech Stack */}
                    <div>
                      <div className="text-xs text-zinc-500 uppercase tracking-wider mb-3">Technologies</div>
                      <div className="flex flex-wrap gap-2">
                        {project.tech.map((tech, i) => (
                          <span key={i} className="px-2 py-1 text-xs rounded-md bg-zinc-800 border border-zinc-700 text-zinc-400">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Stats */}
                    <div>
                      <div className="text-xs text-zinc-500 uppercase tracking-wider mb-3">Project Stats</div>
                      <div className="space-y-3">
                        
                        <div className="flex items-center gap-2">
                          <Terminal className="w-4 h-4 text-emerald-400" />
                          <span className="text-sm text-zinc-300">{project.duration}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Project Action Buttons */}
                  <div className="space-y-3">
                    <a 
                      href={project.github} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={`w-full py-3 rounded-xl border border-zinc-800 text-sm font-medium text-zinc-300 hover:bg-gradient-to-r ${selectedCategory.borderGradient} hover:text-white hover:border-transparent transition-all duration-300 flex items-center justify-center gap-2 group/btn`}
                    >
                      <ExternalLink className="w-4 h-4" />
                      Project Details
                      <ArrowUpRight className="w-4 h-4 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform duration-300" />
                    </a>
                   
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

     
      
      {/* Auto-Scrolling Client Proof Section */}
      <section id="clients" className="py-32 px-6 overflow-x-hidden">
        <div className="container mx-auto mb-16">
          <div className="text-center mb-12">
            <div className="text-sm text-emerald-400 mb-4 tracking-wider uppercase">Client Proof</div>
            <h2 className="text-5xl font-light mb-6">Real Results, Real Clients</h2>
            <p className="text-zinc-400 mb-2">Chat screenshots and payment confirmations from satisfied clients</p>
            <p className="text-xs text-zinc-600">💡 Use arrow keys or click the navigation buttons to browse manually</p>
          </div>
        </div>

        {/* Auto-scrolling container with manual controls */}
        <div className="relative">
          {/* Gradient overlays */}
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-zinc-950 to-transparent z-10 pointer-events-none"></div>
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-zinc-950 to-transparent z-10 pointer-events-none"></div>
          
          {/* Manual Navigation Buttons */}
          {!loadingClients && clientsData.length > 3 && (
            <>
              <button
                onClick={scrollClientsLeft}
                disabled={clientScrollIndex === 0}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-zinc-900/90 border border-zinc-700 hover:border-emerald-500 hover:bg-emerald-500/10 transition-all duration-300 flex items-center justify-center group z-20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-6 h-6 text-zinc-400 group-hover:text-emerald-400 transition-colors" />
              </button>
              <button
                onClick={scrollClientsRight}
                disabled={clientScrollIndex >= Math.max(0, clientsData.length - 3)}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-zinc-900/90 border border-zinc-700 hover:border-emerald-500 hover:bg-emerald-500/10 transition-all duration-300 flex items-center justify-center group z-20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-6 h-6 text-zinc-400 group-hover:text-emerald-400 transition-colors" />
              </button>
            </>
          )}

          {/* Loading State */}
          {loadingClients ? (
            <div className="flex gap-6 justify-center">
              {[1, 2, 3].map((i) => (
                <div key={`loading-${i}`} className="flex-shrink-0 w-80 h-96 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 animate-pulse">
                  <div className="flex items-center gap-3 mb-4 pb-4 border-b border-zinc-800">
                    <div className="w-10 h-10 rounded-full bg-zinc-800"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-zinc-800 rounded w-24 mb-2"></div>
                      <div className="h-3 bg-zinc-800 rounded w-20"></div>
                    </div>
                  </div>
                  <div className="flex-1 bg-zinc-800 rounded-xl mb-4 h-48"></div>
                  <div className="h-12 bg-zinc-800 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : clientsData.length === 0 ? (
            <div className="text-center text-zinc-500 py-20">
              No client data available yet.
            </div>
          ) : (
            <div 
              ref={clientScrollRef}
              className={`flex gap-6 transition-transform duration-500 ${isClientAutoPlaying ? 'animate-scroll' : ''}`}
              style={{
                transform: `translateX(-${clientScrollIndex * (320 + 24)}px)`, // 320px card width + 24px gap
                animationPlayState: isClientAutoPlaying ? 'running' : 'paused'
              }}
              onMouseEnter={() => setIsClientAutoPlaying(false)}
              onMouseLeave={() => setIsClientAutoPlaying(true)}
              onTouchStart={handleTouchStart(setClientTouchStart)}
              onTouchMove={handleTouchMove(clientTouchStart, scrollClientsLeft, scrollClientsRight, setIsClientAutoPlaying)}
              onTouchEnd={() => setClientTouchStart(null)}
            >
              {/* Client proof cards from Firebase */}
              {clientsData.map((client, index) => (
                <div 
                  key={`proof-${client.id}`} 
                  onClick={() => {
                    setSelectedProofCard(client);
                    setModalImageIndex(0);
                  }}
                  className="flex-shrink-0 w-80 h-96 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-emerald-500/50 transition-all duration-300 group cursor-pointer hover:scale-105 transform"
                >
                  <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-4 pb-4 border-b border-zinc-800">
                      <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-medium uppercase">
                        {client.clientName?.substring(0, 2) || 'CL'}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-zinc-300">{client.clientName || 'Anonymous'}</div>
                        <div className="text-xs text-zinc-500 capitalize">{client.projectType || 'Project'}</div>
                      </div>
                      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                    </div>

                    {/* Auto-scrolling Image Carousel */}
                    <div className="flex-1 relative rounded-xl overflow-hidden mb-4 border border-zinc-800 group-hover:border-emerald-500/30 transition-colors duration-300">
                      {client.images && client.images.length > 0 ? (
                        <>
                          {/* Image Container with Auto-scroll */}
                          <div className="flex h-full animate-scroll-images">
                            {client.images.map((image, imgIndex) => (
                              <div key={imgIndex} className="flex-shrink-0 w-full h-full bg-zinc-800/50 flex items-center justify-center p-2">
                                <img 
                                  src={image.url} 
                                  alt={image.fileName || `Client proof ${imgIndex + 1}`}
                                  className="w-full h-full object-cover rounded-lg"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                  }}
                                />
                                <div className="hidden w-full h-full items-center justify-center text-zinc-600 text-sm">
                                  Image {imgIndex + 1}
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          {/* Image indicators */}
                          {client.images.length > 1 && (
                            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
                              {client.images.map((_, idx) => (
                                <div key={idx} className={`w-2 h-2 rounded-full ${idx === 0 ? 'bg-emerald-400' : 'bg-zinc-600'}`}></div>
                              ))}
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="flex items-center justify-center h-full text-zinc-600 text-sm">
                          No images available
                        </div>
                      )}
                    </div>

                    {/* Payment Info */}
                    <div className="flex items-center justify-between px-4 py-3 bg-zinc-800/50 rounded-lg border border-zinc-800 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all duration-300">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 group-hover:animate-pulse"></div>
                        <span className="text-xs text-zinc-400 group-hover:text-emerald-400 transition-colors capitalize">
                          {client.paymentType || 'Payment'} 
                        </span>
                      </div>
                      <span className="text-sm font-medium text-emerald-400 group-hover:scale-110 transition-transform">
                        ${client.totalBudget || 0}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Duplicate for seamless scrolling */}
              {clientsData.map((client, index) => (
                <div 
                  key={`proof-duplicate-${client.id}`} 
                  onClick={() => {
                    setSelectedProofCard(client);
                    setModalImageIndex(0);
                  }}
                  className="flex-shrink-0 w-80 h-96 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-emerald-500/50 transition-all duration-300 group cursor-pointer hover:scale-105 transform"
                >
                  <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-4 pb-4 border-b border-zinc-800">
                      <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-medium uppercase">
                        {client.clientName?.substring(0, 2) || 'CL'}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-zinc-300">{client.clientName || 'Anonymous'}</div>
                        <div className="text-xs text-zinc-500 capitalize">{client.projectType || 'Project'}</div>
                      </div>
                      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                    </div>

                    {/* Auto-scrolling Image Carousel */}
                    <div className="flex-1 relative rounded-xl overflow-hidden mb-4 border border-zinc-800 group-hover:border-emerald-500/30 transition-colors duration-300">
                      {client.images && client.images.length > 0 ? (
                        <>
                          {/* Image Container with Auto-scroll */}
                          <div className="flex h-full animate-scroll-images">
                            {client.images.map((image, imgIndex) => (
                              <div key={imgIndex} className="flex-shrink-0 w-full h-full bg-zinc-800/50 flex items-center justify-center p-2">
                                <img 
                                  src={image.url} 
                                  alt={image.fileName || `Client proof ${imgIndex + 1}`}
                                  className="w-full h-full object-cover rounded-lg"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                  }}
                                />
                                <div className="hidden w-full h-full items-center justify-center text-zinc-600 text-sm">
                                  Image {imgIndex + 1}
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          {/* Image indicators */}
                          {client.images.length > 1 && (
                            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
                              {client.images.map((_, idx) => (
                                <div key={idx} className={`w-2 h-2 rounded-full ${idx === 0 ? 'bg-emerald-400' : 'bg-zinc-600'}`}></div>
                              ))}
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="flex items-center justify-center h-full text-zinc-600 text-sm">
                          No images available
                        </div>
                      )}
                    </div>

                    {/* Payment Info */}
                    <div className="flex items-center justify-between px-4 py-3 bg-zinc-800/50 rounded-lg border border-zinc-800 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all duration-300">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 group-hover:animate-pulse"></div>
                        <span className="text-xs text-zinc-400 group-hover:text-emerald-400 transition-colors capitalize">
                          {client.paymentType || 'Payment'} 
                        </span>
                      </div>
                      <span className="text-sm font-medium text-emerald-400 group-hover:scale-110 transition-transform">
                        ${client.totalBudget || 0}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Scroll Indicators */}
        {!loadingClients && clientsData.length > 3 && (
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: Math.max(0, clientsData.length - 2) }).map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setIsClientAutoPlaying(false);
                  setClientScrollIndex(index);
                  setTimeout(() => setIsClientAutoPlaying(true), 5000);
                }}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  clientScrollIndex === index 
                    ? 'bg-emerald-400 w-8' 
                    : 'bg-zinc-600 hover:bg-zinc-500'
                }`}
              />
            ))}
          </div>
        )}
      </section>

      {/* 3D Zoomed Client Proof Modal */}
      {selectedProofCard && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md" 
          onClick={() => setSelectedProofCard(null)}
        >
          <div 
            className="relative w-full max-w-md modal-3d-enter modal-float"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setSelectedProofCard(null)}
              className="absolute top-2 right-2 z-20 w-10 h-10 rounded-full bg-zinc-900/90 border-2 border-zinc-700 hover:border-emerald-500 hover:bg-emerald-500/10 transition-all duration-300 flex items-center justify-center group backdrop-blur-sm shadow-lg"
            >
              <X className="w-5 h-5 text-zinc-400 group-hover:text-emerald-400 transition-colors duration-300" />
            </button>

            {/* 3D Card */}
            <div className="bg-zinc-900 border-2 border-emerald-500/50 rounded-2xl p-4 shadow-2xl shadow-emerald-500/20 transform transition-all duration-500 hover:shadow-emerald-500/30">
              <div className="flex flex-col h-full">
                {/* Enhanced Header */}
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-zinc-800">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-zinc-950 font-bold text-lg shadow-lg uppercase">
                    {selectedProofCard.clientName?.substring(0, 2) || 'CL'}
                  </div>
                  <div className="flex-1">
                    <div className="text-lg font-medium text-zinc-100">{selectedProofCard.clientName || 'Anonymous Client'}</div>
                    <div className="text-xs text-emerald-400">✓ Verified</div>
                    <div className="text-xs text-zinc-400 capitalize">{selectedProofCard.projectType || 'Project'}</div>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse mb-1"></div>
                    <div className="text-xs text-zinc-400">Active</div>
                  </div>
                </div>

                {/* Image Carousel */}
                <div className="relative mb-4">
                  {/* Carousel Container */}
                  <div className="relative bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 rounded-xl border border-zinc-700 shadow-inner overflow-hidden h-96">
                    {selectedProofCard.images && selectedProofCard.images.length > 0 ? (
                      <>
                        {/* Images */}
                        <div className="relative w-full h-full">
                          {selectedProofCard.images.map((image, imgIndex) => (
                            <div 
                              key={imgIndex}
                              className={`absolute inset-0 transition-all duration-500 ${
                                modalImageIndex === imgIndex 
                                  ? 'opacity-100 translate-x-0' 
                                  : modalImageIndex < imgIndex 
                                    ? 'opacity-0 translate-x-full' 
                                    : 'opacity-0 -translate-x-full'
                              }`}
                            >
                              <div className="w-full h-full flex items-center justify-center p-2">
                                <img 
                                  src={image.url} 
                                  alt={image.fileName || `Client proof ${imgIndex + 1}`}
                                  className="w-full h-full object-contain rounded-lg"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                  }}
                                />
                                <div className="hidden w-full h-full items-center justify-center text-zinc-600">
                                  Image {imgIndex + 1}
                                </div>
                              </div>
                              
                              {/* Image Label */}
                              <div className="absolute bottom-4 left-0 right-0 text-center">
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900/90 border border-emerald-500/20 rounded-full text-emerald-400 text-xs backdrop-blur-sm">
                                  <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                                  {image.fileName || `Image ${imgIndex + 1}`}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Navigation Arrows */}
                        {selectedProofCard.images.length > 1 && (
                          <>
                            <button
                              onClick={() => setModalImageIndex((prev) => 
                                prev === 0 ? selectedProofCard.images.length - 1 : prev - 1
                              )}
                              className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-zinc-900/90 border border-zinc-700 hover:border-emerald-500 hover:bg-emerald-500/10 transition-all duration-300 flex items-center justify-center group z-10"
                            >
                              <ChevronLeft className="w-5 h-5 text-zinc-400 group-hover:text-emerald-400 transition-colors" />
                            </button>
                            <button
                              onClick={() => setModalImageIndex((prev) => 
                                prev === selectedProofCard.images.length - 1 ? 0 : prev + 1
                              )}
                              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-zinc-900/90 border border-zinc-700 hover:border-emerald-500 hover:bg-emerald-500/10 transition-all duration-300 flex items-center justify-center group z-10"
                            >
                              <ChevronRight className="w-5 h-5 text-zinc-400 group-hover:text-emerald-400 transition-colors" />
                            </button>

                            {/* Image Indicators */}
                            <div className="absolute top-4 left-0 right-0 flex justify-center gap-2 z-10">
                              {selectedProofCard.images.map((_, index) => (
                                <button
                                  key={index}
                                  onClick={() => setModalImageIndex(index)}
                                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                    modalImageIndex === index 
                                      ? 'bg-emerald-400 w-8' 
                                      : 'bg-zinc-600 hover:bg-zinc-500'
                                  }`}
                                />
                              ))}
                            </div>
                          </>
                        )}
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-600">
                        No images available
                      </div>
                    )}
                  </div>
                </div>

                {/* Enhanced Payment Section */}
                <div className="bg-gradient-to-r from-emerald-900/30 to-teal-900/30 rounded-xl p-4 border border-emerald-500/30 hover:border-emerald-500/60 hover:from-emerald-900/40 hover:to-teal-900/40 transition-all duration-300">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse transition-transform"></div>
                      <span className="text-xs font-medium text-emerald-400 transition-colors capitalize">
                        {selectedProofCard.paymentType || 'Payment'} 
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-emerald-400 transition-transform">
                        ${selectedProofCard.totalBudget || 0}
                      </div>
                      <div className="text-xs text-zinc-400">USD</div>
                    </div>
                  </div>
                  
                  {/* Additional Info */}
                  <div className="pt-3 border-t border-emerald-500/20">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-400">Project Type:</span>
                      <span className="text-zinc-300 capitalize">{selectedProofCard.projectType || 'N/A'}</span>
                    </div>
                   
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Testimonials Section */}
      <section id="testimonials" className="py-32 px-6 bg-zinc-900/30 relative overflow-x-hidden">
        {/* Background Elements */}
        <div className="absolute top-10 left-10 w-72 h-72 bg-emerald-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto relative z-10">
          <div className="text-center mb-20">
            <div className="text-sm text-emerald-400 mb-4 tracking-wider uppercase flex items-center justify-center gap-2">
              <Star className="w-4 h-4" />
              Client Testimonials
            </div>
            <h2 className="text-5xl md:text-6xl font-light mb-6">What Clients Say</h2>
            <p className="text-zinc-400 max-w-2xl mx-auto mb-2">
              Real feedback from satisfied clients across the globe. Each review represents a successful project and lasting partnership.
            </p>
            <p className="text-xs text-zinc-600">💡 Use arrow keys or click the navigation buttons to browse manually</p>
            
            {/* Stats Bar */}
            <div className="flex items-center justify-center gap-8 mt-12 p-6 bg-zinc-800/30 border border-zinc-800 rounded-2xl backdrop-blur-sm max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-2xl font-light text-emerald-400">{reviewsData.length || 0}+</div>
                <div className="text-xs text-zinc-500 uppercase tracking-wider">Reviews</div>
              </div>
              <div className="w-px h-8 bg-zinc-700"></div>
              <div className="text-center">
                <div className="text-2xl font-light text-emerald-400">
                  {reviewsData.length > 0 
                    ? (reviewsData.reduce((sum, t) => sum + (t.rating || 0), 0) / reviewsData.length).toFixed(1)
                    : '5.0'
                  }
                </div>
                <div className="text-xs text-zinc-500 uppercase tracking-wider">Average Rating</div>
              </div>
              <div className="w-px h-8 bg-zinc-700"></div>
              <div className="text-center">
                <div className="text-2xl font-light text-emerald-400">
                  ${reviewsData.length > 0 
                    ? (reviewsData.reduce((sum, t) => sum + (parseInt(t.amount) || 0), 0) / 1000).toFixed(0)
                    : '0'
                  }K+
                </div>
                <div className="text-xs text-zinc-500 uppercase tracking-wider">Projects Value</div>
              </div>
            </div>
          </div>
          
          {/* Animated Testimonials Scrolling Container */}
          <div className="relative overflow-hidden mb-12">
            {/* Gradient Overlays */}
            <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-zinc-950 to-transparent z-10 pointer-events-none"></div>
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-zinc-950 to-transparent z-10 pointer-events-none"></div>
            
            {/* Manual Navigation Buttons */}
            {!loadingReviews && reviewsData.length > 3 && (
              <>
                <button
                  onClick={scrollTestimonialsLeft}
                  disabled={testimonialScrollIndex === 0}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-zinc-900/90 border border-zinc-700 hover:border-emerald-500 hover:bg-emerald-500/10 transition-all duration-300 flex items-center justify-center group z-20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-6 h-6 text-zinc-400 group-hover:text-emerald-400 transition-colors" />
                </button>
                <button
                  onClick={scrollTestimonialsRight}
                  disabled={testimonialScrollIndex >= Math.max(0, reviewsData.length - 3)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-zinc-900/90 border border-zinc-700 hover:border-emerald-500 hover:bg-emerald-500/10 transition-all duration-300 flex items-center justify-center group z-20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-6 h-6 text-zinc-400 group-hover:text-emerald-400 transition-colors" />
                </button>
              </>
            )}
            
            {/* Loading State */}
            {loadingReviews ? (
              <div className="flex gap-6 justify-center">
                {[1, 2, 3].map((i) => (
                  <div key={`loading-testimonial-${i}`} className="flex-shrink-0 w-96 h-80 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 animate-pulse">
                    <div className="flex gap-1 mb-4">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <div key={s} className="w-4 h-4 bg-zinc-800 rounded"></div>
                      ))}
                    </div>
                    <div className="space-y-3 mb-4">
                      <div className="h-3 bg-zinc-800 rounded w-full"></div>
                      <div className="h-3 bg-zinc-800 rounded w-5/6"></div>
                      <div className="h-3 bg-zinc-800 rounded w-4/6"></div>
                    </div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-zinc-800"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-zinc-800 rounded w-24 mb-2"></div>
                        <div className="h-3 bg-zinc-800 rounded w-20"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : reviewsData.length === 0 ? (
              <div className="text-center text-zinc-500 py-20">
                No reviews available yet.
              </div>
            ) : (
              <div 
                ref={testimonialScrollRef}
                className={`flex gap-6 transition-transform duration-500 ${isTestimonialAutoPlaying ? 'animate-scroll-testimonials' : ''}`}
                style={{
                  transform: `translateX(-${testimonialScrollIndex * (320 + 24)}px)`, // 320px card width + 24px gap (same as client proof)
                  animationPlayState: isTestimonialAutoPlaying ? 'running' : 'paused'
                }}
                onMouseEnter={() => setIsTestimonialAutoPlaying(false)}
                onMouseLeave={() => setIsTestimonialAutoPlaying(true)}
                onTouchStart={handleTouchStart(setTestimonialTouchStart)}
                onTouchMove={handleTouchMove(testimonialTouchStart, scrollTestimonialsLeft, scrollTestimonialsRight, setIsTestimonialAutoPlaying)}
                onTouchEnd={() => setTestimonialTouchStart(null)}
              >
                {/* First Set - Real Firebase Data */}
                {reviewsData.map((review, i) => (
                  <div key={`first-${review.id || i}`} className="flex-shrink-0 w-80 h-96 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-emerald-500/50 transition-all duration-300 group cursor-pointer hover:scale-105 transform">
                    <div className="flex flex-col h-full">
                      {/* Header with client info */}
                      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-zinc-800">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-medium uppercase">
                          {review.clientName?.substring(0, 2) || 'CL'}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-zinc-300">{review.clientName || 'Anonymous'}</div>
                          <div className="text-xs text-zinc-500 capitalize">{review.projectType || 'Project'}</div>
                        </div>
                        <div className="flex gap-1">
                          {[...Array(review.rating || 5)].map((_, starIndex) => (
                            <Star key={starIndex} className="w-3 h-3 fill-emerald-400 text-emerald-400" />
                          ))}
                        </div>
                      </div>
                    
                      {/* Review content area */}
                      <div className="flex-1 relative rounded-xl overflow-hidden mb-4 border border-zinc-800 group-hover:border-emerald-500/30 transition-colors duration-300 p-4 bg-zinc-800/50">
                        <p className="text-zinc-300 leading-relaxed text-sm">
                          "{review.review || 'Great experience working together! Professional, reliable, and delivered exactly what we needed.'}"
                        </p>
                      </div>

                      {/* Payment info footer */}
                      <div className="flex items-center justify-between px-4 py-3 bg-zinc-800/50 rounded-lg border border-zinc-800 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all duration-300">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-emerald-400 group-hover:animate-pulse"></div>
                          <span className="text-xs text-zinc-400 group-hover:text-emerald-400 transition-colors capitalize">
                            {review.projectType || 'Project'} 
                          </span>
                        </div>
                        <span className="text-sm font-medium text-emerald-400 group-hover:scale-110 transition-transform">
                          ${review.amount || '0'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Second Set (for seamless loop) */}
                {reviewsData.map((review, i) => (
                  <div key={`second-${review.id || i}`} className="flex-shrink-0 w-80 h-96 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-emerald-500/50 transition-all duration-300 group cursor-pointer hover:scale-105 transform">
                    <div className="flex flex-col h-full">
                      {/* Header with client info */}
                      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-zinc-800">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-medium uppercase">
                          {review.clientName?.substring(0, 2) || 'CL'}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-zinc-300">{review.clientName || 'Anonymous'}</div>
                          <div className="text-xs text-zinc-500 capitalize">{review.projectType || 'Project'}</div>
                        </div>
                        <div className="flex gap-1">
                          {[...Array(review.rating || 5)].map((_, starIndex) => (
                            <Star key={starIndex} className="w-3 h-3 fill-emerald-400 text-emerald-400" />
                          ))}
                        </div>
                      </div>
                    
                      {/* Review content area */}
                      <div className="flex-1 relative rounded-xl overflow-hidden mb-4 border border-zinc-800 group-hover:border-emerald-500/30 transition-colors duration-300 p-4 bg-zinc-800/50">
                        <p className="text-zinc-300 leading-relaxed text-sm">
                          "{review.review || 'Great experience working together! Professional, reliable, and delivered exactly what we needed.'}"
                        </p>
                      </div>

                      {/* Payment info footer */}
                      <div className="flex items-center justify-between px-4 py-3 bg-zinc-800/50 rounded-lg border border-zinc-800 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all duration-300">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-emerald-400 group-hover:animate-pulse"></div>
                          <span className="text-xs text-zinc-400 group-hover:text-emerald-400 transition-colors capitalize">
                            {review.projectType || 'Project'} 
                          </span>
                        </div>
                        <span className="text-sm font-medium text-emerald-400 group-hover:scale-110 transition-transform">
                          ${review.amount || '0'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Scroll Indicators */}
          {!loadingReviews && reviewsData.length > 3 && (
            <div className="flex justify-center gap-2 mb-8">
              {Array.from({ length: Math.max(0, reviewsData.length - 2) }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setIsTestimonialAutoPlaying(false);
                    setTestimonialScrollIndex(index);
                    setTimeout(() => setIsTestimonialAutoPlaying(true), 5000);
                  }}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    testimonialScrollIndex === index 
                      ? 'bg-emerald-400 w-8' 
                      : 'bg-zinc-600 hover:bg-zinc-500'
                  }`}
                />
              ))}
            </div>
          )}
          
          {/* Call to Action */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-800/50 border border-zinc-700 rounded-full text-sm text-zinc-400 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all duration-300 cursor-pointer group">
              <span>Want to be the next success story?</span>
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-32 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="text-sm text-emerald-400 mb-4 tracking-wider uppercase">Get In Touch</div>
          <h2 className="text-6xl font-light mb-8">Let's create something<br />amazing together.</h2>
          <p className="text-xl text-zinc-400 mb-12 max-w-2xl mx-auto">
            I'm currently available for freelance projects and full-time opportunities.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="mailto:rahulkr99222@gmail.com" className="group px-8 py-4 bg-emerald-500 text-zinc-950 rounded-full hover:bg-emerald-400 transition-all duration-300 flex items-center justify-center gap-2 font-medium">
              <Mail className="w-5 h-5" />
              Send an Email
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
            </a>
            <a href="https://www.linkedin.com/in/rahul-kr2000/" className="px-8 py-4 border border-zinc-700 rounded-full hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all duration-300 flex items-center justify-center gap-2 font-medium">
              <Linkedin className="w-5 h-5" />
              Connect on LinkedIn
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-zinc-800/50">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 text-sm font-light text-zinc-500">
            <Terminal className="w-4 h-4" />
            © 2025 All rights reserved
          </div>
          <div className="flex gap-6">
            <a href="https://github.com/2003Rk" className="text-zinc-500 hover:text-emerald-400 transition-colors duration-300 text-sm">Github</a>
            <a href="https://www.linkedin.com/in/rahul-kr2000/" className="text-zinc-500 hover:text-emerald-400 transition-colors duration-300 text-sm">LinkedIn</a>
           
          </div>
        </div>
      </footer>
    </div>
  );
}