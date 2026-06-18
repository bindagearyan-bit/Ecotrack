import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { 
  Leaf, 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Globe 
} from 'lucide-react';
import { useCarbon } from '../context/CarbonContext';
import PageTransition from '../components/common/PageTransition';
import { UserSkeleton } from '../components/common/SkeletonLoader';

import { supabase } from '../lib/supabase';
import { updateStreakOnLogin } from '../lib/streakManager';

const Auth = () => {
  const { loginUser } = useCarbon();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [country, setCountry] = useState('India');
  const [terms, setTerms] = useState(false);

  // Password Strength
  const getPasswordStrength = () => {
    if (!password) return { label: '', color: 'bg-gray-200', width: 'w-0' };
    if (password.length < 5) return { label: 'Weak', color: 'bg-brand-red', width: 'w-1/3' };
    
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);

    if (hasLetter && hasNumber && hasSpecial && password.length >= 8) {
      return { label: 'Strong', color: 'bg-brand-green', width: 'w-full' };
    }
    return { label: 'Medium', color: 'bg-brand-orange', width: 'w-2/3' };
  };

  const strength = getPasswordStrength();

  const getLoginName = () => {
    if (!isLogin) return fullName || "User";
    const normalizedEmail = email.toLowerCase();
    if (normalizedEmail.includes('piyush')) return "Piyush Divase";
    if (normalizedEmail.includes('adidev')) return "Adidev";
    if (normalizedEmail.includes('vinit')) return "Vinit";
    if (normalizedEmail.includes('ishaan')) return "Ishaan";
    if (normalizedEmail.includes('ireesh')) return "Ireesh";
    if (normalizedEmail.includes('kush')) return "Kush";
    if (normalizedEmail.includes('aryan')) return "Aryan";
    return "Arjun Sharma";
  };

  const handleGoogleLogin = () => {
    toast.success("Demo mode: Google login simulated!", {
      icon: '🌐'
    });
    setIsLoading(true);
    setTimeout(() => {
      localStorage.setItem('ecotrack_demo_session', 'true');
      loginUser({
        name: "Arjun Sharma (Google)",
        email: "arjun.sharma@gmail.com"
      });
      setIsLoading(false);
      navigate('/dashboard');
    }, 1500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill out all required fields.");
      return;
    }
    if (!isLogin && !fullName) {
      toast.error("Please provide your full name.");
      return;
    }
    if (!isLogin && !terms) {
      toast.error("Please accept the terms & conditions.");
      return;
    }

    setIsLoading(true);
    try {
      // ✅ FIX: Clear old session first
      await supabase.auth.signOut();
      await new Promise(r => setTimeout(r, 500));

      if (isLogin) {
        // Sign in
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
          });
          if (error) throw error;
          
          // Call updateStreakOnLogin to update the user's streak
          const streakRes = await updateStreakOnLogin();
          if (streakRes) {
            if (streakRes.streak === 1) {
              toast.success("Welcome back! Day 1 streak! 🔥");
            } else {
              toast.success(`🔥 ${streakRes.streak} day streak! Keep going!`);
            }
          } else {
            toast.success("Welcome back to EcoTrack! 🌿");
          }
          
          // Delay redirect slightly to let toast be visible
          await new Promise(r => setTimeout(r, 1000));
          
          // ✅ FIX: Force full page reload
          window.location.href = '/dashboard';
        } catch (signInError) {
          if (signInError.message?.toLowerCase().includes('rate limit') || signInError.status === 429) {
            toast.success("Rate limit hit! Bypassing with local session... 🌿", { duration: 5000 });
            localStorage.setItem('ecotrack_demo_session', 'true');
            const demoUser = {
              id: 'demo-user-id',
              name: getLoginName(),
              email: email,
              country: country,
              avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(getLoginName())}&background=2D6A4F&color=fff`,
              streakCount: 15,
              longestStreak: 23,
              totalTrees: 47,
              totalCarbonSaved: 235,
              joinedDate: "Joined recently"
            };
            localStorage.setItem('user', JSON.stringify(demoUser));
            loginUser(demoUser);
            window.location.href = '/dashboard';
          } else {
            throw signInError;
          }
        }
      } else {
        // Sign up
        try {
          // Create auth user
          const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: { name: fullName }
            }
          });

          if (authError) throw authError;

          // Wait for auth to complete
          await new Promise(r => setTimeout(r, 1000));

          // Get today's date
          const today = new Date().toISOString().split('T')[0];

          // ✅ FORCE correct values for new user
          // Use UPDATE to override any trigger defaults
          const { error: updateError } = await supabase
            .from('users')
            .update({
              name: fullName,
              email: email,
              country: country,
              streak_count: 1,        // ✅ FORCE 1
              longest_streak: 1,       // ✅ FORCE 1
              total_trees: 0,          // ✅ FORCE 0
              total_carbon_saved: 0,   // ✅ FORCE 0
              forest_health: 100,
              last_activity_date: today,
              last_active: new Date().toISOString()
            })
            .eq('auth_id', authData.user.id);

          if (updateError) {
            console.error('Update error:', updateError);
            // Try insert if update fails
            await supabase
              .from('users')
              .insert({
                id: authData.user.id,
                auth_id: authData.user.id,
                name: fullName,
                email: email,
                country: country,
                streak_count: 1,
                longest_streak: 1,
                total_trees: 0,
                total_carbon_saved: 0,
                forest_health: 100,
                last_activity_date: today
              });
          }

          toast.success('Welcome! Day 1 streak! 🔥');
          
          setTimeout(() => {
            window.location.href = '/dashboard';
          }, 1500);
        } catch (signUpError) {
          if (signUpError.message?.toLowerCase().includes('rate limit') || signUpError.status === 429) {
            toast.success("Rate limit hit! Bypassing with local session... 🌿", { duration: 5000 });
            localStorage.setItem('ecotrack_demo_session', 'true');
            const demoUser = {
              id: 'demo-user-id',
              name: fullName || 'Eco Tracker',
              email: email,
              country: country,
              avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName || 'Eco')}&background=2D6A4F&color=fff`,
              streakCount: 1,
              longestStreak: 1,
              totalTrees: 0,
              totalCarbonSaved: 0,
              joinedDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
            };
            localStorage.setItem('user', JSON.stringify(demoUser));
            loginUser(demoUser);
            window.location.href = '/dashboard';
          } else {
            throw signUpError;
          }
        }
      }
    } catch (err) {
      toast.error(err.message || "An authentication error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 app-gradient transition-colors duration-300">
        
        {/* Left Side: Animated Earth & Stats (Hidden on Mobile) */}
        <div className="hidden lg:flex flex-col justify-between p-12 hero-gradient text-white relative overflow-hidden">
          {/* Logo */}
          <div className="flex items-center gap-2 relative z-10 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center">
              <Leaf className="w-5 h-5 text-brand-green" />
            </div>
            <span className="font-extrabold text-xl">EcoTrack</span>
          </div>

          {/* Large Globe SVG & Quote in Center */}
          <div className="my-auto flex flex-col items-center justify-center space-y-8 relative z-10">
            {/* Spinning Earth SVG */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
              className="w-56 h-56 relative flex items-center justify-center bg-white/5 backdrop-blur-sm rounded-full border border-white/10"
            >
              <svg viewBox="0 0 100 100" className="w-48 h-48">
                <circle cx="50" cy="50" r="45" fill="#1d3557" />
                <path d="M25,40 Q30,25 45,35 T60,30 T75,40 T50,75 Z" fill="#2d6a4f" opacity="0.8" />
                <path d="M55,60 Q70,55 75,70 T55,80 T40,65 Z" fill="#2d6a4f" opacity="0.8" />
                <circle cx="50" cy="50" r="44.5" fill="none" stroke="#52b788" strokeWidth="1" opacity="0.4" />
              </svg>
            </motion.div>

            <div className="text-center max-w-sm space-y-3">
              <p className="text-lg font-semibold italic leading-relaxed text-white/90">
                "Every action you take today shapes the world of tomorrow."
              </p>
              <span className="block text-xs uppercase tracking-wider font-extrabold text-brand-lightGreen">EcoTrack Community</span>
            </div>

            {/* Floating Info Badges */}
            <div className="flex flex-col gap-3 w-72">
              {[
                { text: "🌱 Save avg 45kg CO₂/month", delay: 0 },
                { text: "🌳 Grow your virtual forest", delay: 0.2 },
                { text: "🏆 Earn eco badges", delay: 0.4 }
              ].map((card, idx) => (
                <motion.div
                  key={idx}
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: card.delay }}
                  className="bg-white/10 backdrop-blur-md border border-white/20 p-3.5 rounded-xl flex items-center gap-3 shadow-md"
                >
                  <span className="text-sm font-semibold">{card.text}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Footer badge */}
          <div className="relative z-10 text-xs text-white/60">
            🌱 Carbon Neutral Account Gateway
          </div>
        </div>

        {/* Right Side: Auth Forms */}
        <div className="flex items-center justify-center p-6 md:p-12">
          <div className="w-full max-w-md bg-white dark:bg-brand-darkCard border border-gray-100 dark:border-brand-darkBorder p-8 rounded-2xl shadow-lg transition-colors duration-300">
            {/* Header / Logo (visible on mobile) */}
            <div className="flex flex-col items-center justify-center text-center mb-8">
              <div className="w-10 h-10 rounded-xl bg-brand-green flex items-center justify-center lg:hidden mb-2">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-black text-brand-text dark:text-brand-darkText">Welcome to EcoTrack</h2>
              <p className="text-xs text-brand-textSecondary dark:text-zinc-400 mt-1">
                {isLogin ? 'Log in to trace your environmental actions' : 'Register now to start tracking your footprint'}
              </p>
            </div>

            {/* Toggle Pills */}
            <div className="relative flex bg-gray-100 dark:bg-brand-darkBorder p-1 rounded-xl mb-6 select-none">
              <button
                type="button"
                onClick={() => setIsLogin(true)}
                className="flex-1 py-2 text-xs font-bold relative z-10 text-center transition-colors duration-200"
              >
                <span className={isLogin ? 'text-brand-green dark:text-white' : 'text-brand-textSecondary dark:text-zinc-400'}>
                  Login
                </span>
              </button>
              <button
                type="button"
                onClick={() => setIsLogin(false)}
                className="flex-1 py-2 text-xs font-bold relative z-10 text-center transition-colors duration-200"
              >
                <span className={!isLogin ? 'text-brand-green dark:text-white' : 'text-brand-textSecondary dark:text-zinc-400'}>
                  Register
                </span>
              </button>
              {/* Sliding Pill Background */}
              <motion.div
                className="absolute top-1 bottom-1 left-1 bg-white dark:bg-brand-green rounded-lg shadow-sm"
                animate={{
                  x: isLogin ? '0%' : '100%',
                  width: 'calc(50% - 4px)'
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            </div>

            {/* Submitting Loading skeleton state */}
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6 py-10 flex flex-col items-center justify-center"
                >
                  {/* The specified Skeleton loader element */}
                  <div className="flex flex-row gap-2">
                    <div className="animate-pulse bg-gray-300 dark:bg-zinc-700 w-12 h-12 rounded-full"></div>
                    <div className="flex flex-col gap-2">
                      <div className="animate-pulse bg-gray-300 dark:bg-zinc-700 w-28 h-5 rounded-full"></div>
                      <div className="animate-pulse bg-gray-300 dark:bg-zinc-700 w-36 h-5 rounded-full"></div>
                    </div>
                  </div>
                  <p className="text-xs font-bold text-brand-green dark:text-brand-lightGreen animate-pulse mt-4">
                    Authenticating {getLoginName().split(' ')[0]}...
                  </p>
                </motion.div>
              ) : (
                <motion.form
                  key={isLogin ? 'login' : 'register'}
                  initial={{ opacity: 0, x: isLogin ? -10 : 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: isLogin ? 10 : -10 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleSubmit}
                  className="space-y-4"
                >
                  {/* Full Name (Register Only) */}
                  {!isLogin && (
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-brand-textSecondary dark:text-zinc-300">Full Name</label>
                      <div className="relative">
                        <input
                          id="register-fullname"
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Arjun Sharma"
                          className="w-full bg-gray-50 dark:bg-brand-darkBg border border-gray-200 dark:border-brand-darkBorder rounded-xl pl-10 pr-4 py-2.5 text-sm text-brand-text dark:text-brand-darkText focus:outline-none focus:border-brand-green/50 dark:focus:border-brand-lightGreen/50"
                        />
                        <User className="absolute left-3 top-3 w-4.5 h-4.5 text-gray-400" />
                      </div>
                    </div>
                  )}

                  {/* Email */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-brand-textSecondary dark:text-zinc-300">Email Address</label>
                    <div className="relative">
                      <input
                        id="auth-email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="arjun@example.com"
                        className="w-full bg-gray-50 dark:bg-brand-darkBg border border-gray-200 dark:border-brand-darkBorder rounded-xl pl-10 pr-4 py-2.5 text-sm text-brand-text dark:text-brand-darkText focus:outline-none focus:border-brand-green/50 dark:focus:border-brand-lightGreen/50"
                      />
                      <Mail className="absolute left-3 top-3.5 w-4.5 h-4.5 text-gray-400" />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-brand-textSecondary dark:text-zinc-300">Password</label>
                      {isLogin && (
                        <a href="#" onClick={(e) => { e.preventDefault(); toast.success("Password reset simulated!"); }} className="text-[10px] font-bold text-brand-green hover:underline">
                          Forgot Password?
                        </a>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        id="auth-password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-gray-50 dark:bg-brand-darkBg border border-gray-200 dark:border-brand-darkBorder rounded-xl pl-10 pr-10 py-2.5 text-sm text-brand-text dark:text-brand-darkText focus:outline-none focus:border-brand-green/50 dark:focus:border-brand-lightGreen/50"
                      />
                      <Lock className="absolute left-3 top-3.5 w-4.5 h-4.5 text-gray-400" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-white"
                      >
                        {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Password Strength Meter (Register Only) */}
                  {!isLogin && password && (
                    <div className="space-y-1.5 pt-1">
                      <div className="w-full h-1.5 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div className={`h-full ${strength.color} ${strength.width} transition-all duration-300`} />
                      </div>
                      <span className="text-[10px] font-bold text-brand-textSecondary dark:text-zinc-400">
                        Password Strength: <span className="text-brand-text font-black dark:text-white">{strength.label}</span>
                      </span>
                    </div>
                  )}

                  {/* Country Dropdown (Register Only) */}
                  {!isLogin && (
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-brand-textSecondary dark:text-zinc-300">Country</label>
                      <div className="relative">
                        <select
                          id="register-country"
                          value={country}
                          onChange={(e) => setCountry(e.target.value)}
                          className="w-full bg-gray-50 dark:bg-brand-darkBg border border-gray-200 dark:border-brand-darkBorder rounded-xl pl-10 pr-4 py-2.5 text-sm text-brand-text dark:text-brand-darkText focus:outline-none focus:border-brand-green/50 dark:focus:border-brand-lightGreen/50 appearance-none"
                        >
                          <option value="India">🇮🇳 India</option>
                          <option value="United States">🇺🇸 United States</option>
                          <option value="United Kingdom">🇬🇧 United Kingdom</option>
                          <option value="Australia">🇦🇺 Australia</option>
                          <option value="Germany">🇩🇪 Germany</option>
                          <option value="Canada">🇨🇦 Canada</option>
                        </select>
                        <Globe className="absolute left-3 top-3.5 w-4.5 h-4.5 text-gray-400" />
                      </div>
                    </div>
                  )}

                  {/* Checkbox (Remember Me / Terms) */}
                  <div className="flex items-center justify-between text-xs py-1">
                    {isLogin ? (
                      <label className="flex items-center gap-2 font-semibold text-brand-textSecondary dark:text-zinc-300 cursor-pointer">
                        <input id="login-remember" type="checkbox" className="rounded border-gray-300 accent-brand-green" />
                        <span>Remember me</span>
                      </label>
                    ) : (
                      <label className="flex items-center gap-2 font-semibold text-brand-textSecondary dark:text-zinc-300 cursor-pointer">
                        <input
                          id="register-terms"
                          type="checkbox"
                          checked={terms}
                          onChange={(e) => setTerms(e.target.checked)}
                          className="rounded border-gray-300 accent-brand-green"
                        />
                        <span>I accept terms & conditions</span>
                      </label>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    id="btn-auth-submit"
                    type="submit"
                    className="w-full py-3 bg-brand-green text-white hover:bg-brand-green/90 font-extrabold rounded-xl shadow-md shadow-brand-green/10 transition-colors"
                  >
                    {isLogin ? 'Login to EcoTrack' : 'Create Account'}
                  </button>

                  {/* Google Button Divider */}
                  <div className="relative flex items-center justify-center my-4">
                    <div className="w-full border-t border-gray-200 dark:border-brand-darkBorder" />
                    <span className="absolute bg-white dark:bg-brand-darkCard px-3 text-[10px] uppercase font-bold text-brand-textSecondary dark:text-zinc-400">
                      or
                    </span>
                  </div>

                  {/* Google Button */}
                  <button
                    id="btn-google-auth"
                    type="button"
                    onClick={handleGoogleLogin}
                    className="w-full py-2.5 border border-gray-200 dark:border-brand-darkBorder bg-white dark:bg-brand-darkCard text-brand-text dark:text-white hover:bg-gray-50 dark:hover:bg-brand-green/10 font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
                  >
                    {/* SVG Google Icon */}
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        fill="#EA4335"
                      />
                    </svg>
                    <span className="text-xs">Continue with Google</span>
                  </button>

                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>

      </div>
    </PageTransition>
  );
};

export default Auth;
