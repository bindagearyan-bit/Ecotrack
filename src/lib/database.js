import { supabase } from './supabase';

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

// 1. Get current authenticated user and their DB profile
export async function getCurrentUser() {
  const isLocalDemo = localStorage.getItem('ecotrack_demo_session') === 'true';
  
  if (isLocalDemo) {
    const savedUser = localStorage.getItem('user');
    const parsedUser = savedUser ? JSON.parse(savedUser) : null;
    return parsedUser || {
      id: 'demo-user-id',
      email: 'demo@ecotrack.org',
      name: 'Demo Eco Tracker',
      country: 'India',
      avatar: 'https://ui-avatars.com/api/?name=Demo&background=2D6A4F&color=fff',
      streakCount: 5,
      longestStreak: 10,
      totalTrees: 3,
      totalCarbonSaved: 15.5,
      joinedDate: 'Joined recently'
    };
  }

  const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
  if (authError || !authUser) return null;

  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('*')
    .eq('id', authUser.id)
    .maybeSingle();

  if (profileError || !profile) {
    return {
      id: authUser.id,
      email: authUser.email,
      name: authUser.user_metadata?.name || 'Eco Tracker',
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(authUser.email || 'Eco')}&background=2D6A4F&color=fff`,
      streakCount: 0,
      longestStreak: 0,
      totalTrees: 0,
      totalCarbonSaved: 0,
      joinedDate: 'Joined recently'
    };
  }

  const joinedDate = profile.created_at
    ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'Recently';

  return {
    id: profile.id,
    name: profile.name,
    email: profile.email,
    country: profile.country || 'India',
    avatar: profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name || 'Eco')}&background=2D6A4F&color=fff`,
    streakCount: profile.streak_count || 0,
    longestStreak: profile.longest_streak || 0,
    totalTrees: profile.total_trees || 0,
    totalCarbonSaved: parseFloat((profile.total_carbon_saved || 0).toFixed(1)),
    joinedDate
  };
}

// 2. Logout user
export async function logout() {
  localStorage.removeItem('ecotrack_demo_session');
  localStorage.removeItem('user');
  localStorage.removeItem('activities');
  localStorage.removeItem('monthlyStats');
  localStorage.removeItem('forestTrees');
  localStorage.removeItem('notifications');
  return supabase.auth.signOut();
}

// 3. Get Dashboard statistics
export async function getDashboardStats() {
  const user = await getCurrentUser();
  if (!user) return null;

  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const isLocalDemo = localStorage.getItem('ecotrack_demo_session') === 'true';
  if (isLocalDemo || user.id === 'demo-user-id') {
    const statsSaved = localStorage.getItem('monthlyStats');
    const parsedStats = statsSaved ? JSON.parse(statsSaved) : null;
    
    return {
      totalCarbon: parsedStats ? parsedStats.goalCurrent : 89,
      dailyAverage: parsedStats ? parseFloat((parsedStats.goalCurrent / now.getDate()).toFixed(1)) : 4.8,
      treesNeeded: parsedStats ? parseFloat((parsedStats.goalCurrent / 23.4).toFixed(1)) : 6.2,
      streakDays: user.streakCount || 0,
      totalTrees: user.totalTrees || 0,
      percentageChange: -12,
      globalAverage: 800,
      nationalAverage: 450,
      goalTarget: parsedStats ? parsedStats.goalTarget : 120,
      goalCurrent: parsedStats ? parsedStats.goalCurrent : 89,
      daysRemaining: new Date(year, month, 0).getDate() - now.getDate()
    };
  }

  // Fetch current goal
  let { data: goal } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', user.id)
    .eq('month', month)
    .eq('year', year)
    .maybeSingle();

  if (!goal) {
    const { data: newGoal } = await supabase
      .from('goals')
      .insert({
        user_id: user.id,
        month,
        year,
        target: 120, // default target
        current: 0,
        achieved: false
      })
      .select()
      .maybeSingle();
    if (newGoal) goal = newGoal;
  }

  const daysActive = now.getDate();
  const dailyAverage = goal ? parseFloat((goal.current / daysActive).toFixed(1)) : 0;
  const treesNeeded = goal ? parseFloat((goal.current / 23.4).toFixed(1)) : 0;

  return {
    totalCarbon: goal ? goal.current : 0,
    dailyAverage,
    treesNeeded,
    streakDays: user.streakCount || 0,
    totalTrees: user.totalTrees || 0,
    percentageChange: -12, // static benchmark comparing vs last month
    globalAverage: 800,
    nationalAverage: 450,
    goalTarget: goal ? goal.target : 120,
    goalCurrent: goal ? goal.current : 0,
    daysRemaining: new Date(year, month, 0).getDate() - now.getDate()
  };
}

// 4. Get recent activities (carbon logs)
export async function getRecentActivities(limit = 8) {
  const user = await getCurrentUser();
  if (!user) return [];

  const isLocalDemo = localStorage.getItem('ecotrack_demo_session') === 'true';
  if (isLocalDemo || user.id === 'demo-user-id') {
    const saved = localStorage.getItem('activities');
    if (saved) {
      return JSON.parse(saved).slice(0, limit);
    }
    // Return standard mock activities initially
    const mock = [
      { id: 1, icon: "🚗", name: "Drove to Office", category: "Transport", carbon: 2.1, time: "2 hours ago", type: "bad" },
      { id: 2, icon: "🥗", name: "Vegan Lunch", category: "Food", carbon: -0.8, time: "4 hours ago", type: "good" },
      { id: 3, icon: "💡", name: "Saved Electricity", category: "Energy", carbon: -0.3, time: "Yesterday", type: "good" }
    ];
    localStorage.setItem('activities', JSON.stringify(mock));
    return mock;
  }

  const { data, error } = await supabase
    .from('carbon_logs')
    .select('*')
    .eq('user_id', user.id)
    .order('logged_at', { ascending: false })
    .limit(limit);

  if (error || !data) return [];

  const iconMap = {
    Transport: '🚗',
    Food: '🥗',
    Energy: '💡',
    Lifestyle: '♻️'
  };

  return data.map(log => {
    const carbonVal = log.carbon !== undefined ? log.carbon : (log.kg !== undefined ? log.kg : 0);
    const category = log.category || 'Lifestyle';
    return {
      id: log.id,
      icon: iconMap[category] || '🌿',
      name: log.activity_name || 'Logged Carbon Activity',
      category,
      carbon: carbonVal,
      time: formatTimeAgo(log.logged_at),
      type: carbonVal <= 0 ? 'good' : 'bad'
    };
  });
}

// 5. Get chart data (monthly emissions)
export async function getChartData() {
  const user = await getCurrentUser();
  if (!user) return [];

  const isLocalDemo = localStorage.getItem('ecotrack_demo_session') === 'true';
  if (isLocalDemo || user.id === 'demo-user-id') {
    return [
      { month: "Jan", carbon: 180, transport: 78, food: 62, energy: 40 },
      { month: "Feb", carbon: 165, transport: 70, food: 58, energy: 37 },
      { month: "Mar", carbon: 145, transport: 52, food: 45, energy: 48 }
    ];
  }

  const { data: logs, error } = await supabase
    .from('carbon_logs')
    .select('*')
    .eq('user_id', user.id);

  if (error || !logs || logs.length === 0) return [];

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthlyGroups = {};

  logs.forEach(log => {
    const date = new Date(log.logged_at);
    const monthStr = months[date.getMonth()];
    const carbonVal = log.carbon !== undefined ? log.carbon : (log.kg !== undefined ? log.kg : 0);
    
    if (!monthlyGroups[monthStr]) {
      monthlyGroups[monthStr] = { month: monthStr, carbon: 0, transport: 0, food: 0, energy: 0 };
    }
    
    monthlyGroups[monthStr].carbon = parseFloat((monthlyGroups[monthStr].carbon + carbonVal).toFixed(1));
    const cat = (log.category || '').toLowerCase();
    if (cat === 'transport') {
      monthlyGroups[monthStr].transport = parseFloat((monthlyGroups[monthStr].transport + carbonVal).toFixed(1));
    } else if (cat === 'food') {
      monthlyGroups[monthStr].food = parseFloat((monthlyGroups[monthStr].food + carbonVal).toFixed(1));
    } else if (cat === 'energy') {
      monthlyGroups[monthStr].energy = parseFloat((monthlyGroups[monthStr].energy + carbonVal).toFixed(1));
    }
  });

  return Object.values(monthlyGroups);
}

// 6. Get category splits
export async function getCategorySplit() {
  const user = await getCurrentUser();
  if (!user) return [];

  const isLocalDemo = localStorage.getItem('ecotrack_demo_session') === 'true';
  if (isLocalDemo || user.id === 'demo-user-id') {
    return [
      { name: 'Transport', value: 52, color: '#1A759F' },
      { name: 'Food', value: 45, color: '#F4A261' },
      { name: 'Energy', value: 48, color: '#E63946' }
    ];
  }

  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const { data: logs, error } = await supabase
    .from('carbon_logs')
    .select('*')
    .eq('user_id', user.id)
    .gte('logged_at', firstDayOfMonth);

  const split = {
    Transport: { name: 'Transport', value: 0, color: '#1A759F' },
    Food: { name: 'Food', value: 0, color: '#F4A261' },
    Energy: { name: 'Energy', value: 0, color: '#E63946' }
  };

  if (!error && logs) {
    logs.forEach(log => {
      const carbonVal = log.carbon !== undefined ? log.carbon : (log.kg !== undefined ? log.kg : 0);
      const cat = log.category;
      if (split[cat]) {
        split[cat].value = parseFloat((split[cat].value + Math.max(0, carbonVal)).toFixed(1));
      }
    });
  }

  return Object.values(split);
}

// 7. Save Carbon Log (with fallback column checks)
export async function saveCarbonLog(category, name, kg) {
  const user = await getCurrentUser();
  if (!user) return null;

  const isLocalDemo = localStorage.getItem('ecotrack_demo_session') === 'true';
  if (isLocalDemo || user.id === 'demo-user-id') {
    const saved = localStorage.getItem('activities');
    const activities = saved ? JSON.parse(saved) : [];
    const newAct = {
      id: Date.now(),
      icon: category === 'Transport' ? '🚗' : category === 'Food' ? '🥗' : '💡',
      name,
      category,
      carbon: kg,
      time: 'Just now',
      type: kg <= 0 ? 'good' : 'bad'
    };
    localStorage.setItem('activities', JSON.stringify([newAct, ...activities]));

    // Update stats
    const statsSaved = localStorage.getItem('monthlyStats');
    const stats = statsSaved ? JSON.parse(statsSaved) : { goalCurrent: 89, goalTarget: 120 };
    stats.goalCurrent = parseFloat((stats.goalCurrent + kg).toFixed(1));
    localStorage.setItem('monthlyStats', JSON.stringify(stats));

    // Update user profile total carbon saved if offset
    if (kg < 0) {
      user.totalCarbonSaved = parseFloat(((user.totalCarbonSaved || 0) + Math.abs(kg)).toFixed(1));
      localStorage.setItem('user', JSON.stringify(user));
    }

    return { data: [newAct], error: null };
  }

  // Insert log
  const { data, error } = await supabase.from('carbon_logs').insert({
    user_id: user.id,
    category,
    activity_name: name,
    carbon: kg
  }).select();

  let logData = data;
  let logError = error;

  if (error && (error.message.includes('carbon') || error.code === 'PGRST204')) {
    const res = await supabase.from('carbon_logs').insert({
      user_id: user.id,
      category,
      activity_name: name,
      kg
    }).select();
    logData = res.data;
    logError = res.error;
  }

  // Update current goal
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  let { data: goal } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', user.id)
    .eq('month', month)
    .eq('year', year)
    .maybeSingle();

  if (goal) {
    const newCurrent = parseFloat((goal.current + kg).toFixed(1));
    const achieved = newCurrent <= goal.target;
    await supabase
      .from('goals')
      .update({ current: newCurrent, achieved })
      .eq('id', goal.id);
  } else {
    await supabase
      .from('goals')
      .insert({
        user_id: user.id,
        month,
        year,
        target: 120,
        current: kg,
        achieved: kg <= 120
      });
  }

  // If offset activity (kg < 0), update total carbon saved in user profile
  if (kg < 0) {
    const savedAmount = Math.abs(kg);
    const newSaved = parseFloat(((user.totalCarbonSaved || 0) + savedAmount).toFixed(1));
    await supabase
      .from('users')
      .update({ total_carbon_saved: newSaved })
      .eq('id', user.id);
  }

  return { data: logData, error: logError };
}

// 8. Log Eco Action (virtual forest planting)
export async function logEcoAction(actionType, description) {
  const user = await getCurrentUser();
  if (!user) return null;

  const isLocalDemo = localStorage.getItem('ecotrack_demo_session') === 'true';
  if (isLocalDemo || user.id === 'demo-user-id') {
    const saved = localStorage.getItem('forestTrees');
    const trees = saved ? JSON.parse(saved) : [];
    const newTree = {
      id: Date.now(),
      type: 'pine',
      x: Math.floor(Math.random() * 85) + 5,
      size: 'medium',
      action: actionType
    };
    localStorage.setItem('forestTrees', JSON.stringify([...trees, newTree]));
    
    // Update user tree counts
    user.totalTrees = (user.totalTrees || 0) + 1;
    localStorage.setItem('user', JSON.stringify(user));

    return { data: newTree, error: null };
  }

  const { data, error } = await supabase
    .from('eco_actions')
    .insert({
      user_id: user.id,
      action_type: actionType,
      category: 'Lifestyle',
      description
    })
    .select()
    .single();

  if (!error && data) {
    // Increment total trees planted in user profile
    const newTrees = (user.totalTrees || 0) + 1;
    await supabase
      .from('users')
      .update({ total_trees: newTrees })
      .eq('id', user.id);
  }

  return { data, error };
}

// 9. Get all logged eco actions
export async function getEcoActions() {
  const user = await getCurrentUser();
  if (!user) return [];

  const isLocalDemo = localStorage.getItem('ecotrack_demo_session') === 'true';
  if (isLocalDemo || user.id === 'demo-user-id') {
    const saved = localStorage.getItem('forestTrees');
    return saved ? JSON.parse(saved) : [
      { id: 1, type: "pine", x: 10, size: "large", action: "Cycled to work" },
      { id: 2, type: "oak", x: 20, size: "medium", action: "Vegan meal" }
    ];
  }

  const { data, error } = await supabase
    .from('eco_actions')
    .select('*')
    .eq('user_id', user.id);

  if (error || !data) return [];
  
  // Format for virtual forest rendering
  const typeMap = ['pine', 'oak', 'cherry'];
  const sizeMap = ['small', 'medium', 'large'];

  return data.map((act, index) => ({
    id: act.id,
    type: typeMap[index % 3],
    x: Math.floor(Math.random() * 85) + 5,
    size: sizeMap[index % 3],
    action: act.action_type
  }));
}

// 10. Get streak and milestone badges
export async function getStreakData() {
  const user = await getCurrentUser();
  if (!user) return null;

  const isLocalDemo = localStorage.getItem('ecotrack_demo_session') === 'true';
  if (isLocalDemo || user.id === 'demo-user-id') {
    return {
      streakCount: user.streakCount,
      longestStreak: user.longestStreak,
      badges: [
        { id: 1, name: "First Step", icon: "🌱", description: "Logged first action", earned: true, date: "Jan 15, 2026" },
        { id: 2, name: "Week Warrior", icon: "🌿", description: "7 day streak", earned: false, progress: "5/7 days" },
        { id: 3, name: "Forest Starter", icon: "🌳", description: "Planted 10 trees", earned: false, progress: `${user.totalTrees}/10 trees` },
        { id: 4, name: "Carbon Cutter", icon: "✂️", description: "Reduced by 20%", earned: false, progress: "0%" },
        { id: 5, name: "Month Master", icon: "🏆", description: "30 day streak", earned: false, progress: `${user.streakCount}/30 days` },
        { id: 6, name: "Eco Legend", icon: "⚡", description: "100 day streak", earned: false, progress: `${user.streakCount}/100 days` }
      ]
    };
  }

  const { data: badgesData, error: badgesError } = await supabase
    .from('badges')
    .select('*')
    .eq('user_id', user.id);

  const earnedBadges = badgesData || [];

  // Build standard list of badges with earned status mapped from DB
  const defaultBadges = [
    { id: 1, name: "First Step", icon: "🌱", description: "Logged first action" },
    { id: 2, name: "Week Warrior", icon: "🌿", description: "7 day streak" },
    { id: 3, name: "Forest Starter", icon: "🌳", description: "Planted 10 trees" },
    { id: 4, name: "Carbon Cutter", icon: "✂️", description: "Reduced by 20%" },
    { id: 5, name: "Month Master", icon: "🏆", description: "30 day streak", progress: `${user.streakCount}/30 days` },
    { id: 6, name: "Eco Legend", icon: "⚡", description: "100 day streak", progress: `${user.streakCount}/100 days` }
  ];

  const mappedBadges = defaultBadges.map(b => {
    const earnedObj = earnedBadges.find(eb => eb.badge_name === b.name);
    return {
      ...b,
      earned: !!earnedObj,
      date: earnedObj ? new Date(earnedObj.earned_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : null
    };
  });

  return {
    streakCount: user.streakCount,
    longestStreak: user.longestStreak,
    badges: mappedBadges
  };
}

// 11. Get notifications
export async function getNotifications() {
  const user = await getCurrentUser();
  if (!user) return [];

  const isLocalDemo = localStorage.getItem('ecotrack_demo_session') === 'true';
  if (isLocalDemo || user.id === 'demo-user-id') {
    const saved = localStorage.getItem('notifications');
    if (saved) {
      return JSON.parse(saved);
    }
    const mock = [
      { id: 1, type: "tip", icon: "🌿", title: "Morning Eco Tip", message: "Planning to drive today? Try carpooling and save 1.2kg CO₂!", time: "2 hours ago", read: false },
      { id: 2, type: "achievement", icon: "🏆", title: "Badge Earned!", message: "You earned the Week Warrior badge! 7 day streak achieved!", time: "Yesterday", read: false }
    ];
    localStorage.setItem('notifications', JSON.stringify(mock));
    return mock;
  }

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error || !data) return [];

  return data.map(item => ({
    id: item.id,
    type: item.type,
    icon: item.icon,
    title: item.title,
    message: item.message,
    read: item.is_read,
    time: formatTimeAgo(item.created_at)
  }));
}

// 12. Mark notification read
export async function markNotificationRead(id) {
  const isLocalDemo = localStorage.getItem('ecotrack_demo_session') === 'true';
  if (isLocalDemo) {
    const saved = localStorage.getItem('notifications');
    const notifications = saved ? JSON.parse(saved) : [];
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    localStorage.setItem('notifications', JSON.stringify(updated));
    return { data: updated, error: null };
  }

  return supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', id)
    .select();
}

// 13. Mark all read
export async function markAllRead() {
  const user = await getCurrentUser();
  if (!user) return null;

  const isLocalDemo = localStorage.getItem('ecotrack_demo_session') === 'true';
  if (isLocalDemo || user.id === 'demo-user-id') {
    const saved = localStorage.getItem('notifications');
    const notifications = saved ? JSON.parse(saved) : [];
    const updated = notifications.map(n => ({ ...n, read: true }));
    localStorage.setItem('notifications', JSON.stringify(updated));
    return { data: updated, error: null };
  }

  return supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', user.id)
    .select();
}

// 14. Get unread notifications count
export async function getUnreadCount() {
  const user = await getCurrentUser();
  if (!user) return 0;

  const isLocalDemo = localStorage.getItem('ecotrack_demo_session') === 'true';
  if (isLocalDemo || user.id === 'demo-user-id') {
    const saved = localStorage.getItem('notifications');
    const notifications = saved ? JSON.parse(saved) : [];
    return notifications.filter(n => !n.read).length;
  }

  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('is_read', false);

  if (error) return 0;
  return count || 0;
}

// 15. Get Monthly Report
const monthMap = {
  january: 1, feb: 2, february: 2, mar: 3, march: 3, apr: 4, april: 4, may: 5, jun: 6, june: 6,
  jul: 7, july: 7, aug: 8, august: 8, sep: 9, september: 9, oct: 10, october: 10, nov: 11, november: 11, dec: 12, december: 12
};

function calculateOverallGrade(g1, g2, g3) {
  const scoreMap = { 'A+': 12, 'A': 11, 'A-': 10, 'B+': 9, 'B': 8, 'B-': 7, 'C+': 6, 'C': 5, 'C-': 4, 'D': 3, 'F': 1 };
  const grades = [g1, g2, g3].map(g => scoreMap[g] || 8);
  const avg = Math.round(grades.reduce((a, b) => a + b, 0) / 3);
  const revMap = { 12: 'A+', 11: 'A', 10: 'A-', 9: 'B+', 8: 'B', 7: 'B-', 6: 'C+', 5: 'C', 4: 'C-', 3: 'D', 2: 'D', 1: 'F' };
  return revMap[avg] || 'B';
}

export async function getMonthlyReport(month, year) {
  const user = await getCurrentUser();
  if (!user) return null;

  const isLocalDemo = localStorage.getItem('ecotrack_demo_session') === 'true';
  if (isLocalDemo || user.id === 'demo-user-id') {
    return {
      month: month,
      year: year,
      grade: 'B+',
      totalCarbon: 145,
      transport: { kg: 52, grade: 'A' },
      food: { kg: 45, grade: 'B' },
      energy: { kg: 48, grade: 'C+' },
      vsLastMonth: -23,
      aiSummary: [
        "This month you showed great improvement in your transport habits, reducing car usage by 35% compared to last month. Your decision to use public transport 3 times a week saved approximately 28kg of CO₂.",
        "Your food choices still have room for improvement. Red meat consumption on 4 days per week contributes significantly to your food carbon score. Even reducing by 2 days could save an additional 26kg monthly.",
        "For next month, focus on your energy usage at home. Setting your AC to 24°C instead of 20°C and switching to LED bulbs could reduce your energy carbon by 40%, pushing your overall grade from B+ to A-."
      ]
    };
  }

  let monthInt = month;
  if (typeof month === 'string') {
    const norm = month.toLowerCase().trim();
    if (monthMap[norm]) {
      monthInt = monthMap[norm];
    } else {
      monthInt = parseInt(month, 10) || 1;
    }
  }

  const { data, error } = await supabase
    .from('monthly_reports')
    .select('*')
    .eq('user_id', user.id)
    .eq('month', monthInt)
    .eq('year', year)
    .maybeSingle();

  if (error || !data) {
    return {
      month: month,
      year: year,
      grade: 'B+',
      totalCarbon: 145,
      transport: { kg: 52, grade: 'A' },
      food: { kg: 45, grade: 'B' },
      energy: { kg: 48, grade: 'C+' },
      vsLastMonth: -23,
      aiSummary: [
        "This month you showed great improvement in your transport habits, reducing car usage by 35% compared to last month. Your decision to use public transport 3 times a week saved approximately 28kg of CO₂.",
        "Your food choices still have room for improvement. Red meat consumption on 4 days per week contributes significantly to your food carbon score. Even reducing by 2 days could save an additional 26kg monthly.",
        "For next month, focus on your energy usage at home. Setting your AC to 24°C instead of 20°C and switching to LED bulbs could reduce your energy carbon by 40%, pushing your overall grade from B+ to A-."
      ]
    };
  }

  let aiSummary = data.ai_summary;
  if (typeof aiSummary === 'string') {
    try {
      aiSummary = JSON.parse(aiSummary);
    } catch (e) {
      aiSummary = [aiSummary];
    }
  }

  return {
    month: month,
    year: year,
    grade: calculateOverallGrade(data.transport_grade, data.food_grade, data.energy_grade),
    totalCarbon: data.total_carbon || 0,
    transport: { kg: 52, grade: data.transport_grade || 'B' },
    food: { kg: 45, grade: data.food_grade || 'B' },
    energy: { kg: 48, grade: data.energy_grade || 'B' },
    vsLastMonth: data.vs_last_month || -23,
    aiSummary: Array.isArray(aiSummary) ? aiSummary : [aiSummary]
  };
}
