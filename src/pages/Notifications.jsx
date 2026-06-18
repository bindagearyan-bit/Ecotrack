import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Bell, BellOff } from 'lucide-react';
import PageTransition from '../components/common/PageTransition';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

// Helper to format timestamps to relative time matching UI mock values (e.g., "2 hours ago", "Yesterday")
function formatTimeAgo(dateString) {
  if (!dateString) return 'some time ago';
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  return `${diffDays}d ago`;
}

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All'); // All | Unread | Tips | Achievements | Warnings

  const loadNotifications = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', authUser.id)
        .single();

      if (!profile) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading notifications:', error);
        toast.error('Failed to load notifications');
      } else {
        const formatted = (data || []).map(item => ({
          id: item.id,
          type: item.type,
          icon: item.icon,
          title: item.title,
          message: item.message,
          read: item.is_read,
          time: formatTimeAgo(item.created_at)
        }));
        setNotifications(formatted);
      }
    } catch (err) {
      console.error("Error loading notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);

      if (!error) {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      }
    } catch (err) {
      console.error("Error marking notification read:", err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;

      const { data: profile } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', authUser.id)
        .single();

      if (!profile) return;

      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', profile.id);

      if (!error) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        toast.success('All notifications marked as read! ✅', {
          style: {
            background: '#2D6A4F',
            color: '#FFFFFF'
          }
        });
      }
    } catch (err) {
      console.error("Error marking all read:", err);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const getFilteredNotifications = () => {
    switch (filter) {
      case 'Unread':
        return notifications.filter(n => !n.read);
      case 'Tips':
        return notifications.filter(n => n.type === 'tip');
      case 'Achievements':
        return notifications.filter(n => n.type === 'achievement');
      case 'Warnings':
        return notifications.filter(n => n.type === 'warning');
      case 'All':
      default:
        return notifications;
    }
  };

  const filteredList = getFilteredNotifications();

  // Mapping emojis / circles
  const getBadgeConfig = (type) => {
    switch (type) {
      case 'tip':
        return { bg: 'bg-green-100 dark:bg-emerald-950 text-brand-green', emoji: '🌿' };
      case 'achievement':
        return { bg: 'bg-amber-100 dark:bg-amber-950 text-amber-500', emoji: '🏆' };
      case 'warning':
        return { bg: 'bg-red-100 dark:bg-red-950 text-brand-red', emoji: '⚠️' };
      case 'report':
        return { bg: 'bg-blue-100 dark:bg-blue-950 text-brand-blue', emoji: '📊' };
      case 'ai':
        return { bg: 'bg-purple-100 dark:bg-purple-950 text-purple-500', emoji: '🤖' };
      default:
        return { bg: 'bg-gray-100 dark:bg-zinc-800 text-gray-400', emoji: '🔔' };
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-green mb-2"></div>
        <span className="text-xs font-semibold text-brand-green">Loading Notifications...</span>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-brand-text dark:text-white flex items-center gap-2">
              <span>Smart Nudges & Alerts 🔔</span>
            </h2>
            <p className="text-xs text-brand-textSecondary dark:text-zinc-400">Personalized insights to keep you on track.</p>
          </div>

          <button
            id="btn-mark-all-read"
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0}
            className="flex items-center gap-1.5 px-4 py-2 bg-brand-green text-white hover:bg-brand-green/90 text-xs font-bold rounded-xl shadow-md transition-all disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
            <span>Mark All Read</span>
          </button>
        </div>

        {/* Filter Pills row */}
        <div className="flex bg-white dark:bg-brand-darkCard border border-gray-100 dark:border-brand-darkBorder p-1.5 rounded-2xl shadow-sm overflow-x-auto gap-2 select-none transition-colors duration-300">
          {['All', 'Unread', 'Tips', 'Achievements', 'Warnings'].map((tab) => {
            const count = tab === 'All' 
              ? notifications.length 
              : tab === 'Unread' 
                ? unreadCount 
                : tab === 'Tips' 
                  ? notifications.filter(n => n.type === 'tip').length
                  : tab === 'Achievements'
                    ? notifications.filter(n => n.type === 'achievement').length
                    : notifications.filter(n => n.type === 'warning').length;

            return (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 whitespace-nowrap flex items-center gap-2 ${
                  filter === tab
                    ? 'bg-brand-green text-white shadow-sm'
                    : 'text-brand-textSecondary dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-brand-green/5'
                }`}
              >
                <span>{tab}</span>
                {count > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
                    filter === tab ? 'bg-white text-brand-green' : 'bg-gray-100 dark:bg-brand-darkBorder text-brand-textSecondary dark:text-zinc-400'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Unread count detail label */}
        <span className="text-xs text-brand-textSecondary dark:text-zinc-400 block font-semibold">
          {unreadCount} unread notifications
        </span>

        {/* Notification list cards */}
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filteredList.length > 0 ? (
              filteredList.map((notif, index) => {
                const config = getBadgeConfig(notif.type);
                return (
                  <motion.div
                    key={notif.id}
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.25, delay: index * 0.05 }}
                    onClick={() => !notif.read && handleMarkAsRead(notif.id)}
                    className={`p-5 rounded-2xl shadow-sm border transition-all duration-300 relative flex items-start gap-4 cursor-pointer select-none ${
                      notif.read
                        ? 'bg-white dark:bg-brand-darkCard border-gray-150 dark:border-brand-darkBorder'
                        : 'bg-blue-50/50 dark:bg-blue-950/20 border-brand-blue border-l-4'
                    }`}
                  >
                    {/* Circle icon */}
                    <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-lg ${config.bg}`}>
                      {config.emoji}
                    </div>

                    {/* Content details */}
                    <div className="flex-grow min-w-0 pr-4 space-y-1">
                      <h4 className={`text-sm font-extrabold truncate ${notif.read ? 'text-brand-text dark:text-white' : 'text-brand-blue'}`}>
                        {notif.title}
                      </h4>
                      <p className="text-xs text-brand-textSecondary dark:text-zinc-300 font-semibold leading-relaxed line-clamp-2">
                        {notif.message}
                      </p>
                      <span className="block text-[10px] text-brand-textSecondary dark:text-zinc-500 font-semibold pt-1">
                        {notif.time}
                      </span>
                    </div>

                    {/* Unread dot indicator */}
                    {!notif.read ? (
                      <span className="absolute top-5 right-5 w-2.5 h-2.5 bg-brand-blue rounded-full animate-ping" />
                    ) : (
                      <Check className="w-4.5 h-4.5 text-gray-400 absolute top-5 right-5" />
                    )}
                  </motion.div>
                );
              })
            ) : (
              /* Empty state placeholder */
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-10 bg-white dark:bg-brand-darkCard border border-gray-150 dark:border-brand-darkBorder rounded-2xl shadow-sm text-center space-y-2.5 transition-colors duration-300"
              >
                <div className="w-12 h-12 rounded-full bg-brand-green/10 flex items-center justify-center text-brand-green mx-auto">
                  <BellOff className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-extrabold text-brand-text dark:text-white">No notifications here! 🌿</h4>
                <p className="text-xs text-brand-textSecondary dark:text-zinc-400 max-w-xs mx-auto">
                  You are all caught up. New updates, achievements, or carbon alerts will appear here.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </PageTransition>
  );
};

export default Notifications;
