import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Leaf, 
  Calculator, 
  LayoutDashboard, 
  Trees, 
  Target, 
  Navigation, 
  BarChart3, 
  UserPlus, 
  ClipboardList, 
  Sparkles, 
  ArrowRight,
  Globe,
  Award,
  TrendingDown,
  Users
} from 'lucide-react';
import { mockTestimonials } from '../data/mockData';
import { CountUpNumber } from '../components/dashboard/StatCard';
import PageTransition from '../components/common/PageTransition';

const Landing = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  // Particles generator
  const [particles, setParticles] = useState([]);
  useEffect(() => {
    const temp = [];
    for (let i = 0; i < 20; i++) {
      temp.push({
        id: i,
        left: `${Math.random() * 100}%`,
        size: `${Math.random() * 8 + 4}px`,
        delay: `${Math.random() * 8}s`,
        duration: `${Math.random() * 10 + 10}s`
      });
    }
    setParticles(temp);

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    { icon: Calculator, title: 'Smart Calculator', desc: 'Calculate your carbon footprint in minutes with our user-friendly sliders.' },
    { icon: LayoutDashboard, title: 'Live Dashboard', desc: 'Track progress with live charts and real-time category breakdowns.' },
    { icon: Trees, title: 'Virtual Forest', desc: 'Watch your forest grow daily as you log sustainable activities.' },
    { icon: BarChart3, title: 'Report Card', desc: 'Get monthly grade assessments and AI-powered recommendations.' }
  ];

  const steps = [
    { icon: UserPlus, title: 'Create Account', desc: 'Sign up free in 30 seconds and setup your country profile.' },
    { icon: ClipboardList, title: 'Log Activities', desc: 'Track your daily transit, food choices, and home electricity usage.' },
    { icon: Sparkles, title: 'Get AI Insights', desc: 'Get customized tips powered by Gemini AI to minimize your footprint.' }
  ];

  // Helper to fade in H1 words
  const titleText = "Track Your Carbon. Save Our Planet.";
  const words = titleText.split(" ");

  return (
    <PageTransition>
      <div className="min-h-screen app-gradient transition-colors duration-300">
        
        {/* Sticky Navbar */}
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled 
            ? 'bg-white/95 dark:bg-brand-darkSidebar/95 shadow-md py-3' 
            : 'bg-transparent py-5'
        }`}>
          <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <div className="w-9 h-9 rounded-xl bg-brand-green flex items-center justify-center">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <span className={`text-xl font-black transition-colors duration-300 ${scrolled ? 'text-brand-green dark:text-white' : 'text-white'}`}>EcoTrack</span>
            </div>

            <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-600 dark:text-zinc-300">
              <a href="#features" className="hover:text-brand-green transition-colors">Features</a>
              <a href="#how-it-works" className="hover:text-brand-green transition-colors">How It Works</a>
              <a href="#testimonials" className="hover:text-brand-green transition-colors">Testimonials</a>
            </div>

            <div className="flex items-center gap-4">
              <button
                id="btn-landing-login"
                onClick={() => navigate('/auth')}
                className="px-4 py-2 border border-brand-green dark:border-brand-lightGreen text-brand-green dark:text-brand-lightGreen hover:bg-brand-green/10 text-sm font-bold rounded-xl transition-all duration-200"
              >
                Login
              </button>
              <button
                id="btn-landing-getstarted"
                onClick={() => navigate('/auth')}
                className="px-5 py-2 bg-brand-green text-white hover:bg-brand-green/90 text-sm font-bold rounded-xl shadow-md shadow-brand-green/15 transition-all duration-200"
              >
                Get Started
              </button>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center pt-24 pb-16 overflow-hidden hero-gradient text-white">
          {/* Animated Particles */}
          {particles.map(p => (
            <div
              key={p.id}
              className="particle"
              style={{
                left: p.left,
                width: p.size,
                height: p.size,
                animationDelay: p.delay,
                animationDuration: p.duration
              }}
            />
          ))}

          <div className="max-w-7xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
            {/* Left Side */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20">
                <Globe className="w-4 h-4 text-brand-lightGreen" />
                <span className="text-xs font-bold uppercase tracking-wider">🌍 AI-Powered Tracker</span>
              </div>

              {/* Animated Heading Word by Word */}
              <h1 className="text-4xl sm:text-6xl font-black leading-tight">
                {words.map((word, index) => (
                  <motion.span
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.15, duration: 0.4 }}
                    className="inline-block mr-3"
                  >
                    {word}
                  </motion.span>
                ))}
              </h1>

              <p className="text-lg text-white/80 max-w-lg leading-relaxed">
                Join 150,000+ eco-warriors tracking, understanding, and actively reducing their daily carbon emissions with smart, personalized analytics.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  id="btn-hero-start"
                  onClick={() => navigate('/auth')}
                  className="flex items-center gap-2 bg-white text-brand-green hover:bg-brand-bg px-6 py-3.5 rounded-xl font-extrabold shadow-lg shadow-black/10 transition-all duration-200"
                >
                  <span>Start Tracking Free</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  id="btn-hero-demo"
                  onClick={() => navigate('/auth')}
                  className="border border-white/40 hover:border-white hover:bg-white/10 px-6 py-3.5 rounded-xl font-bold transition-all duration-200"
                >
                  Watch Demo
                </button>
              </div>

              <div className="flex items-center gap-6 text-sm text-white/70 pt-4 font-semibold">
                <span>✓ Free Forever</span>
                <span>✓ No Card Needed</span>
                <span>✓ Takes 2 minutes</span>
              </div>
            </div>

            {/* Right Side - SVG Globe Illustration */}
            <div className="flex justify-center">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="w-80 h-80 sm:w-96 sm:h-96 relative flex items-center justify-center bg-white/5 backdrop-blur-sm rounded-full border border-white/10"
              >
                {/* Floating Preview Card Mockup */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute -top-4 -left-4 bg-white/95 dark:bg-zinc-900 text-brand-text dark:text-white p-4 rounded-2xl shadow-xl border border-white/20 flex items-center gap-3 z-20"
                >
                  <div className="w-10 h-10 rounded-xl bg-brand-lightGreen/15 flex items-center justify-center text-brand-green dark:text-brand-lightGreen">
                    <TrendingDown className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-brand-textSecondary block">Your Progress</span>
                    <span className="text-sm font-extrabold">-23% CO₂ saved!</span>
                  </div>
                </motion.div>

                {/* SVG Spinning Earth Globe */}
                <svg viewBox="0 0 100 100" className="w-64 h-64 animate-spin-slow">
                  <circle cx="50" cy="50" r="45" fill="#1d3557" />
                  {/* Mock Continents */}
                  <path d="M25,40 Q30,25 45,35 T60,30 T75,40 T50,75 Z" fill="#2d6a4f" opacity="0.85" />
                  <path d="M55,60 Q70,55 75,70 T55,80 T40,65 Z" fill="#2d6a4f" opacity="0.85" />
                  <path d="M15,50 Q25,60 30,50 T15,40 Z" fill="#2d6a4f" opacity="0.85" />
                  {/* Atmosphere glow */}
                  <circle cx="50" cy="50" r="44.5" fill="none" stroke="#52b788" strokeWidth="1" opacity="0.5" />
                </svg>

                {/* Second Floating Mockup */}
                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                  className="absolute -bottom-6 -right-6 bg-brand-green text-white p-4 rounded-2xl shadow-xl flex items-center gap-3 z-20"
                >
                  <div className="text-2xl">🌳</div>
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-white/75 block">Forest nursery</span>
                    <span className="text-sm font-extrabold">47 Trees Grown</span>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Stats bar */}
        <section className="bg-white dark:bg-brand-darkSidebar py-10 border-y border-gray-100 dark:border-brand-darkBorder transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div className="space-y-1">
              <div className="text-2xl sm:text-4xl font-extrabold text-brand-green dark:text-brand-lightGreen">
                🌳 <CountUpNumber end={2400000} suffix="+" />
              </div>
              <p className="text-xs font-semibold text-brand-textSecondary dark:text-zinc-400">Total Trees Saved</p>
            </div>
            <div className="space-y-1">
              <div className="text-2xl sm:text-4xl font-extrabold text-brand-green dark:text-brand-lightGreen">
                👥 <CountUpNumber end={150000} suffix="+" />
              </div>
              <p className="text-xs font-semibold text-brand-textSecondary dark:text-zinc-400">Active Users Tracking</p>
            </div>
            <div className="space-y-1">
              <div className="text-2xl sm:text-4xl font-extrabold text-brand-green dark:text-brand-lightGreen">
                📉 <CountUpNumber end={45} suffix="%" />
              </div>
              <p className="text-xs font-semibold text-brand-textSecondary dark:text-zinc-400">Average Carbon Reduction</p>
            </div>
            <div className="space-y-1">
              <div className="text-2xl sm:text-4xl font-extrabold text-brand-green dark:text-brand-lightGreen">
                🌍 <CountUpNumber end={120} suffix="+" />
              </div>
              <p className="text-xs font-semibold text-brand-textSecondary dark:text-zinc-400">Countries Engaged</p>
            </div>
          </div>
        </section>

        {/* Features section */}
        <section id="features" className="py-20 max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-3xl font-black text-brand-text dark:text-brand-darkText">Everything you need to go green</h2>
            <p className="text-sm text-brand-textSecondary dark:text-zinc-400">
              EcoTrack integrates smart tooling to make carbon reductions interactive, rewarding, and scientific.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((f, i) => {
              const IconComponent = f.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  whileHover={{ y: -8 }}
                  className="p-8 bg-white dark:bg-brand-darkCard border border-gray-100 dark:border-brand-darkBorder rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 card-hover-effect"
                >
                  <div className="w-12 h-12 rounded-xl bg-brand-green/10 dark:bg-brand-green/20 flex items-center justify-center text-brand-green dark:text-brand-lightGreen mb-6">
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <h3 className="font-extrabold text-lg text-brand-text dark:text-brand-darkText mb-2">{f.title}</h3>
                  <p className="text-xs text-brand-textSecondary dark:text-zinc-400 leading-relaxed">{f.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* How It Works section */}
        <section id="how-it-works" className="py-20 bg-gray-50 dark:bg-brand-darkSidebar/30 border-y border-gray-100 dark:border-brand-darkBorder transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
              <h2 className="text-3xl font-black text-brand-text dark:text-brand-darkText">Start reducing in 3 simple steps</h2>
              <p className="text-sm text-brand-textSecondary dark:text-zinc-400">We make footprint adjustments hassle-free and fun.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
              {/* Decorative Connecting Dotted line */}
              <div className="hidden md:block absolute top-12 left-20 right-20 h-0.5 border-t-2 border-dashed border-brand-green/30 z-0" />
              
              {steps.map((s, i) => {
                const IconComponent = s.icon;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.2, duration: 0.6 }}
                    className="flex flex-col items-center text-center relative z-10 group"
                  >
                    <div className="w-16 h-16 rounded-full bg-brand-green text-white flex items-center justify-center shadow-lg shadow-brand-green/25 group-hover:scale-110 transition-transform duration-300 mb-6">
                      <IconComponent className="w-7 h-7" />
                    </div>
                    <span className="text-xs font-bold text-brand-green dark:text-brand-lightGreen uppercase tracking-wider mb-1">Step {i + 1}</span>
                    <h3 className="font-extrabold text-lg text-brand-text dark:text-brand-darkText mb-2">{s.title}</h3>
                    <p className="text-xs text-brand-textSecondary dark:text-zinc-400 max-w-xs leading-relaxed">{s.desc}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Testimonials section */}
        <section id="testimonials" className="py-20 overflow-hidden">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3 px-6">
            <h2 className="text-3xl font-black text-brand-text dark:text-brand-darkText">Loved by eco-warriors worldwide</h2>
            <p className="text-sm text-brand-textSecondary dark:text-zinc-400">Read what members of the EcoTrack community have to say.</p>
          </div>

          {/* Continuous scrolling testimonials band */}
          <div className="scroll-container">
            <div className="scroll-content">
              {/* Render twice for continuous loop effect */}
              {[...mockTestimonials, ...mockTestimonials].map((t, idx) => (
                <div 
                  key={idx} 
                  className="w-[300px] flex-shrink-0 p-6 bg-white dark:bg-brand-darkCard border border-gray-150 dark:border-brand-darkBorder rounded-2xl shadow-sm flex flex-col justify-between"
                >
                  <div>
                    {/* Stars */}
                    <div className="flex gap-1 mb-3">
                      {[1, 2, 3, 4, 5].map(star => (
                        <span key={star} className="text-amber-400 text-sm">★</span>
                      ))}
                    </div>
                    <p className="text-xs italic text-brand-text dark:text-brand-darkText font-medium leading-relaxed mb-4">
                      "{t.quote}"
                    </p>
                  </div>

                  <div className="flex items-center justify-between border-t border-gray-100 dark:border-brand-darkBorder pt-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-brand-green/10 dark:bg-brand-green/20 text-brand-green dark:text-brand-lightGreen flex items-center justify-center text-xs font-bold font-sans">
                        {t.avatar}
                      </div>
                      <div className="min-w-0">
                        <span className="block text-xs font-bold text-brand-text dark:text-brand-darkText truncate">{t.name}</span>
                        <span className="block text-[10px] text-brand-textSecondary dark:text-zinc-400 truncate">{t.location}</span>
                      </div>
                    </div>
                    <span className="bg-brand-green/15 text-brand-green dark:bg-brand-green/20 dark:text-brand-lightGreen text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {t.saved}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="bg-gradient-to-br from-brand-green to-brand-lightGreen py-20 text-center text-white">
          <div className="max-w-4xl mx-auto px-6 space-y-6">
            <h2 className="text-4xl font-extrabold">Ready to make a difference?</h2>
            <p className="text-base text-white/90 max-w-lg mx-auto">
              Join thousands of users planting forests and minimizing carbon footprints. Start tracking in under 2 minutes.
            </p>
            <div className="pt-4">
              <button
                id="btn-cta-getstarted"
                onClick={() => navigate('/auth')}
                className="bg-white text-brand-green hover:bg-brand-bg px-8 py-4 rounded-xl font-extrabold shadow-lg shadow-black/10 transition-all text-base"
              >
                Start Free Today
              </button>
            </div>
            <p className="text-xs text-white/80 font-medium pt-2">No credit card • Free forever • Instant access</p>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-white dark:bg-brand-darkSidebar py-12 border-t border-gray-100 dark:border-brand-darkBorder transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-green flex items-center justify-center">
                <Leaf className="w-4.5 h-4.5 text-white" />
              </div>
              <span className="font-black text-lg text-brand-green dark:text-white transition-colors duration-300">EcoTrack</span>
            </div>

            <div className="flex gap-8 text-xs font-semibold text-brand-textSecondary dark:text-zinc-400">
              <a href="#features" className="hover:text-brand-green">Features</a>
              <a href="#how-it-works" className="hover:text-brand-green">About</a>
              <a href="#testimonials" className="hover:text-brand-green">Contact</a>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-[10px] bg-brand-green/10 text-brand-green dark:bg-brand-green/20 dark:text-brand-lightGreen font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                <span>🌱 Carbon Neutral Website</span>
              </span>
              <span className="text-xs text-brand-textSecondary dark:text-zinc-400">
                &copy; 2024 EcoTrack.
              </span>
            </div>
          </div>
        </footer>

      </div>
    </PageTransition>
  );
};

export default Landing;
