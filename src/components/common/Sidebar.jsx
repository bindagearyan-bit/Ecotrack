import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useCarbon } from '../../context/CarbonContext';
import { supabase } from '../../lib/supabase';
import { 
  Home, 
  Calculator, 
  Trees, 
  Flame, 
  Bell, 
  BarChart3, 
  LogOut, 
  Leaf,
  Map
} from 'lucide-react';

const Sidebar = () => {
  const { darkMode, setDarkMode, setUser: setGlobalUser } = useCarbon();
  const [user, setUser] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    loadUserData();
    
    // Listen for auth changes
    const { data: authListener } = 
      supabase.auth.onAuthStateChange(
        (event, session) => {
          if (event === 'SIGNED_IN') {
            loadUserData();
          }
          if (event === 'SIGNED_OUT') {
            setUser(null);
            setUnreadCount(0);
          }
        }
      );

    const interval = setInterval(loadUserData, 5000);
    
    return () => {
      clearInterval(interval);
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  const loadUserData = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return;
    
    // Get user profile
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('auth_id', authUser.id)
      .single();
    
    if (profile) {
      setUser(profile);
      setGlobalUser({
        id: profile.id,
        name: profile.name,
        email: profile.email,
        country: profile.country || 'India',
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name || 'Eco')}&background=2D6A4F&color=fff`,
        streakCount: profile.streak_count || 0,
        longestStreak: profile.longest_streak || 0,
        totalTrees: profile.total_trees || 0,
        totalCarbonSaved: profile.total_carbon_saved || 0
      });
    }
    
    // Get unread notifications count
    const { count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', profile?.id)
      .eq('is_read', false);
    
    setUnreadCount(count || 0);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/auth';
  };

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: Home },
    { label: 'Calculator', path: '/calculator', icon: Calculator },
    { label: 'Forest', path: '/forest', icon: Trees },
    { label: 'Streaks', path: '/streaks', icon: Flame },
    { label: 'Routes', path: '/routes', icon: Map },
    { label: 'Notifications', path: '/notifications', icon: Bell, badge: unreadCount },
    { label: 'Report', path: '/report', icon: BarChart3 }
  ];

  return (
    <aside className="fixed top-0 left-0 h-screen w-[240px] bg-white dark:bg-brand-darkSidebar border-r border-gray-100 dark:border-brand-darkBorder flex flex-col justify-between z-30 transition-all duration-300">
      <div className="flex flex-col flex-1 py-6">
        {/* Logo */}
        <div 
          className="flex items-center gap-2 px-6 mb-8 cursor-pointer" 
          role="button"
          tabIndex={0}
          onClick={() => navigate('/dashboard')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              navigate('/dashboard');
            }
          }}
        >
          <div className="w-9 h-9 rounded-xl bg-brand-green flex items-center justify-center shadow-lg shadow-brand-green/20">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-brand-green dark:text-brand-lightGreen">EcoTrack</span>
        </div>

        {/* Navigation list */}
        <nav aria-label="Sidebar navigation" className="flex-1 px-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <NavLink
                key={item.path}
                id={`nav-${item.label.toLowerCase()}`}
                to={item.path}
                className={({ isActive }) =>
                  `sidebar-btn flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden ${
                    isActive ? 'sidebar-btn-active text-white' : 'text-brand-textSecondary dark:text-zinc-400'
                  }`
                }
              >
                <span className="sidebar-btn__halo" aria-hidden="true" />
                <div className="flex items-center gap-3 relative z-10">
                  <IconComponent className="w-5 h-5 sidebar-btn__icon group-hover:scale-110 transition-transform duration-200" />
                  <span className="font-medium text-sm sidebar-btn__text">{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="bg-brand-red text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-5 text-center relative z-10">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* User Section & Dark Mode Toggle at the Bottom */}
      <div className="p-4 border-t border-gray-100 dark:border-brand-darkBorder space-y-4">
        {/* Theme Toggle */}
        <div className="flex items-center justify-between w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-brand-darkBorder text-brand-textSecondary dark:text-zinc-300 transition-colors duration-200">
          <span className="text-xs font-semibold">
            {darkMode ? 'Dark Mode' : 'Light Mode'}
          </span>
          <div className="scale-90 origin-right">
            <div className="checkbox-apple">
              <input 
                className="yep" 
                id="sidebar-theme-toggle" 
                type="checkbox" 
                checked={darkMode}
                aria-label="Toggle dark mode"
                onChange={() => setDarkMode(!darkMode)}
              />
              <label htmlFor="sidebar-theme-toggle"><span className="sr-only">Toggle dark mode</span></label>
            </div>
          </div>
        </div>

        {user && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-green text-white flex items-center justify-center font-extrabold border border-brand-green/20 text-sm">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-brand-text dark:text-brand-darkText truncate">{user?.name || 'Loading...'}</p>
                <p className="text-xs text-brand-textSecondary dark:text-zinc-400 truncate">{user?.email}</p>
                <div className="text-xs font-bold text-brand-orange mt-0.5">Streak: {user?.streak_count || 0} 🔥</div>
              </div>
            </div>

            <button
              id="btn-logout"
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 w-full px-4 py-2 text-xs font-bold text-brand-red bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-950/40 rounded-xl transition-all duration-200"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
