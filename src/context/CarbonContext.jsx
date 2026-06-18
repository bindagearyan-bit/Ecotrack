import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import { 
  mockUser, 
  mockMonthlyStats, 
  mockActivities, 
  mockNotifications, 
  mockForestTrees,
  mockBadges,
  mockGoalHistory
} from '../data/mockData';

const CarbonContext = createContext();

export const useCarbon = () => {
  const context = useContext(CarbonContext);
  if (!context) {
    throw new Error('useCarbon must be used within a CarbonProvider');
  }
  return context;
};

export const CarbonProvider = ({ children }) => {
  // Theme Dark Mode
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark';
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Auth User state
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : mockUser;
  });

  const loginUser = (userData) => {
    const updated = { ...mockUser, ...userData };
    setUser(updated);
    localStorage.setItem('user', JSON.stringify(updated));
  };

  const logoutUser = () => {
    setUser(null);
    localStorage.removeItem('user');
    toast.success('Logged out successfully!');
  };

  // Activities
  const [activities, setActivities] = useState(() => {
    const saved = localStorage.getItem('activities');
    return saved ? JSON.parse(saved) : mockActivities;
  });

  const addActivity = (activity) => {
    const newAct = {
      id: Date.now(),
      time: 'Just now',
      ...activity
    };
    const updated = [newAct, ...activities];
    setActivities(updated);
    localStorage.setItem('activities', JSON.stringify(updated));
    
    // Dynamically adjust user total saved
    if (activity.carbon < 0) {
      const savedAmount = Math.abs(activity.carbon);
      const updatedUser = {
        ...user,
        totalCarbonSaved: parseFloat((user.totalCarbonSaved + savedAmount).toFixed(1))
      };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  // Forest state
  const [forestTrees, setForestTrees] = useState(() => {
    const saved = localStorage.getItem('forestTrees');
    return saved ? JSON.parse(saved) : mockForestTrees;
  });

  const plantTree = (type, size, action) => {
    const newTree = {
      id: Date.now(),
      type,
      x: Math.floor(Math.random() * 85) + 5, // random x percentage position (5% to 90%)
      size,
      action
    };
    const updated = [...forestTrees, newTree];
    setForestTrees(updated);
    localStorage.setItem('forestTrees', JSON.stringify(updated));

    // Update user tree counts
    const updatedUser = {
      ...user,
      totalTrees: user.totalTrees + 1
    };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));

    // Confetti celebration
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#2D6A4F', '#52B788', '#1A759F', '#F4A261']
    });
  };

  // Goals
  const [monthlyStats, setMonthlyStats] = useState(() => {
    const saved = localStorage.getItem('monthlyStats');
    return saved ? JSON.parse(saved) : mockMonthlyStats;
  });

  const updateGoal = (target, current = monthlyStats.goalCurrent) => {
    const updated = {
      ...monthlyStats,
      goalTarget: target,
      goalCurrent: current
    };
    setMonthlyStats(updated);
    localStorage.setItem('monthlyStats', JSON.stringify(updated));
  };

  // Notifications
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('notifications');
    return saved ? JSON.parse(saved) : mockNotifications;
  });

  const markAsRead = (id) => {
    const updated = notifications.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    );
    setNotifications(updated);
    localStorage.setItem('notifications', JSON.stringify(updated));
  };

  const markAllRead = () => {
    const updated = notifications.map(notif => ({ ...notif, read: true }));
    setNotifications(updated);
    localStorage.setItem('notifications', JSON.stringify(updated));
    toast.success('All notifications marked as read! ✅', {
      style: {
        background: '#2D6A4F',
        color: '#FFFFFF'
      }
    });
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  // Badges list
  const [badges, setBadges] = useState(() => {
    const saved = localStorage.getItem('badges');
    return saved ? JSON.parse(saved) : mockBadges;
  });

  const earnBadge = (id) => {
    const updated = badges.map(b => {
      if (b.id === id && !b.earned) {
        toast.success(`🏆 Milestone Achieved: ${b.name}!`, {
          duration: 5000,
          icon: '🎉'
        });
        // confetti
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.5 }
        });
        return { ...b, earned: true, date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) };
      }
      return b;
    });
    setBadges(updated);
    localStorage.setItem('badges', JSON.stringify(updated));
  };

  // Goal history
  const [goalHistory, setGoalHistory] = useState(mockGoalHistory);

  return (
    <CarbonContext.Provider value={{
      darkMode,
      setDarkMode,
      user,
      setUser,
      loginUser,
      logoutUser,
      activities,
      addActivity,
      forestTrees,
      plantTree,
      monthlyStats,
      setMonthlyStats,
      updateGoal,
      notifications,
      setNotifications,
      markAsRead,
      markAllRead,
      unreadCount,
      badges,
      earnBadge,
      goalHistory,
      setGoalHistory
    }}>
      {children}
    </CarbonContext.Provider>
  );
};
