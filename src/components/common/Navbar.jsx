import React, { useState, useEffect } from 'react';
import { Search, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { getStreakStatus } from '../../lib/streakManager';

const Navbar = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [greeting, setGreeting] = useState('');
  const [streakCount, setStreakCount] = useState(0);
  const navigate = useNavigate();

  const loadNavbarData = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) {
      setCurrentUser(null);
      setUnreadCount(0);
      setGreeting('Welcome back!');
      setStreakCount(0);
      return;
    }

    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('auth_id', authUser.id)
      .single();

    if (!profile) {
      setCurrentUser(null);
      setUnreadCount(0);
      setGreeting('Welcome back!');
      setStreakCount(0);
      return;
    }

    setCurrentUser({
      name: profile.name,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name || 'Eco')}&background=2D6A4F&color=fff`,
      streakCount: profile.streak_count || 0
    });

    // Load streak status dynamically
    const streakStatus = await getStreakStatus();
    if (streakStatus) {
      setStreakCount(streakStatus.current);
    }

    const { count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', profile.id)
      .eq('is_read', false);

    setUnreadCount(count || 0);

    const name = profile.name.split(' ')[0]; // Use first name
    const hr = new Date().getHours();
    if (hr < 12) {
      setGreeting(`Good Morning, ${name} 🌿`);
    } else if (hr < 17) {
      setGreeting(`Good Afternoon, ${name} 🌞`);
    } else {
      setGreeting(`Good Evening, ${name} 🌙`);
    }
  };

  useEffect(() => {
    loadNavbarData();

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN') {
          loadNavbarData();
        }
        if (event === 'SIGNED_OUT') {
          setCurrentUser(null);
          setUnreadCount(0);
          setGreeting('Welcome back!');
          setStreakCount(0);
        }
      }
    );

    const interval = setInterval(loadNavbarData, 5000);

    // Refresh streak status every 30 seconds
    const fetchStreak = async () => {
      const status = await getStreakStatus();
      if (status) {
        setStreakCount(status.current);
      }
    };
    const streakInterval = setInterval(fetchStreak, 30000);

    return () => {
      clearInterval(interval);
      clearInterval(streakInterval);
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  return (
    <header className="sticky top-0 right-0 h-16 w-full bg-white/80 dark:bg-brand-darkBg/80 backdrop-blur-md border-b border-gray-100 dark:border-brand-darkBorder flex items-center justify-between px-8 z-20 transition-all duration-300">
      {/* Welcome Greeting */}
      <div>
        <h2 className="text-lg font-bold text-brand-text dark:text-brand-darkText">
          {greeting || 'Welcome back!'}
        </h2>
        <p className="text-xs text-brand-textSecondary dark:text-zinc-400">
          Ready to save carbon today?
        </p>
      </div>

      {/* Action Row */}
      <div className="flex items-center gap-6">
        {/* Decorative Search */}
        <div className="relative hidden md:block w-64">
          <input
            id="nav-search-bar"
            type="text"
            placeholder="Search eco actions..."
            aria-label="Search eco actions"
            className="w-full bg-gray-50 dark:bg-brand-darkCard border border-gray-200 dark:border-brand-darkBorder rounded-xl pl-10 pr-4 py-2 text-sm text-brand-text dark:text-brand-darkText focus:outline-none focus:border-brand-green/50 dark:focus:border-brand-lightGreen/50 focus:bg-white transition-all duration-200"
          />
          <Search className="absolute left-3 top-2.5 w-4.5 h-4.5 text-gray-400" />
        </div>

        {/* Notifications Icon */}
        <button
          id="btn-navbar-notif"
          onClick={() => navigate('/notifications')}
          aria-label={`${unreadCount} unread notifications`}
          className="relative p-2 rounded-xl text-gray-500 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-brand-green/10 transition-colors duration-200"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 bg-brand-red text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
              {unreadCount}
            </span>
          )}
        </button>

        {/* User Quick Info */}
        {currentUser && (
          <div 
            onClick={() => navigate('/streaks')} 
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                navigate('/streaks');
              }
            }}
            role="button"
            tabIndex={0}
            className="flex items-center gap-2 border border-gray-100 dark:border-brand-darkBorder pl-2 pr-3 py-1 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-brand-green/10 transition-all duration-200"
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-7 h-7 rounded-full object-cover"
            />
            <span className="text-xs font-semibold text-brand-text dark:text-brand-darkText hidden sm:inline">
              Streak: {streakCount} 🔥
            </span>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
