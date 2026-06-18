import React, { useState, useEffect } from 'react';
import { 
  Leaf, 
  BarChart2, 
  Trees, 
  Flame 
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import StatCard from '../components/dashboard/StatCard';
import CarbonChart from '../components/dashboard/CarbonChart';
import AIInsights from '../components/dashboard/AIInsights';
import PageTransition from '../components/common/PageTransition';
import { 
  StatCardSkeleton, 
  ChartSkeleton 
} from '../components/common/SkeletonLoader';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalCarbon: 0,
    dailyAverage: 0,
    treesNeeded: 0,
    treesEquivalent: 0,
    streakDays: 0,
    totalTrees: 0
  });
  const [activities, setActivities] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    
    // Get current user
    const { data: { user: authUser } } = await supabase.auth.getUser();
    
    if (!authUser) {
      setLoading(false);
      return;
    }
    
    // Get user profile
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('auth_id', authUser.id)
      .single();
    
    if (!profile) {
      setLoading(false);
      return;
    }
    
    setUser(profile);
    
    // Get this month's carbon logs
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const { data: logs } = await supabase
      .from('carbon_logs')
      .select('*')
      .eq('user_id', profile.id)
      .gte('logged_at', startOfMonth.toISOString())
      .order('logged_at', { ascending: false });
    
    // Calculate stats
    const totalCarbon = (logs || []).reduce(
      (sum, log) => sum + parseFloat(log.carbon_kg),
      0
    );
    
    const daysInMonth = new Date().getDate();
    const dailyAvg = daysInMonth > 0 
      ? totalCarbon / daysInMonth 
      : 0;
    
    setStats({
      totalCarbon: totalCarbon.toFixed(0),
      dailyAverage: dailyAvg.toFixed(1),
      treesNeeded: (totalCarbon / 22).toFixed(0),
      treesEquivalent: (totalCarbon / 22).toFixed(0),
      streakDays: profile.streak_count || 0,
      totalTrees: profile.total_trees || 0
    });
    
    // Recent activities
    setActivities((logs || []).slice(0, 8));
    
    // Chart data (last 6 months)
    await loadChartData(profile.id);
    
    // Category data
    await loadCategoryData(profile.id, logs);
    
    setLoading(false);
  };

  const loadChartData = async (userId) => {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(
      sixMonthsAgo.getMonth() - 6
    );
    
    const { data: allLogs } = await supabase
      .from('carbon_logs')
      .select('carbon_kg, logged_at')
      .eq('user_id', userId)
      .gte('logged_at', sixMonthsAgo.toISOString());
    
    const monthly = {};
    (allLogs || []).forEach(log => {
      const date = new Date(log.logged_at);
      const key = date.toLocaleString(
        'default', { month: 'short' }
      );
      if (!monthly[key]) monthly[key] = 0;
      monthly[key] += parseFloat(log.carbon_kg);
    });
    
    const chartArray = Object.entries(monthly)
      .map(([month, carbon]) => ({
        month,
        carbon: parseFloat(carbon.toFixed(1))
      }));
    
    setChartData(chartArray);
  };

  const loadCategoryData = async (userId, logs) => {
    const categories = {};
    (logs || []).forEach(log => {
      if (!categories[log.category]) {
        categories[log.category] = 0;
      }
      categories[log.category] += 
        parseFloat(log.carbon_kg);
    });
    
    const colors = {
      transport: '#1A759F',
      food: '#F4A261',
      energy: '#E63946'
    };
    
    const catArray = Object.entries(categories)
      .map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() 
              + name.slice(1),
        value: parseFloat(value.toFixed(1)),
        color: colors[name] || '#52B788'
      }));
    
    setCategoryData(catArray);
  };

  if (loading) {
    return (
      <PageTransition>
        <div className="space-y-6">
          {/* Stats Cards Skeletons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </div>

          {/* Charts Row Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ChartSkeleton />
            </div>
            <div>
              <ChartSkeleton />
            </div>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        
        {/* Welcome Greeting */}
        <div className="flex flex-col gap-1 mb-2">
          <h1 className="text-2xl font-black text-brand-text dark:text-white">Good Morning, {user?.name || 'User'} 🌿</h1>
          <p className="text-xs text-brand-textSecondary dark:text-zinc-400">Here is your live carbon summary for this month.</p>
        </div>

        {/* Row 1: Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Monthly Carbon"
            value={stats.totalCarbon}
            suffix=" kg CO₂"
            icon={Leaf}
            colorClass="bg-brand-green/10 text-brand-green dark:bg-brand-green/20 dark:text-brand-lightGreen"
            type="carbon"
            trend="↓ 12% from last month"
          />
          <StatCard
            title="Daily Average"
            value={stats.dailyAverage}
            suffix=" kg/day"
            icon={BarChart2}
            colorClass="bg-brand-blue/10 text-brand-blue dark:bg-brand-blue/20"
            type="average"
            subtext="Global avg: 8.5 kg"
            progress={Math.round((stats.dailyAverage / 8.5) * 100)}
          />
          <StatCard
            title="Trees Equivalent"
            value={stats.treesNeeded}
            suffix=" trees"
            icon={Trees}
            colorClass="bg-brand-green/10 text-brand-green dark:bg-brand-green/20 dark:text-brand-lightGreen"
            type="trees"
            subtext={`You have planted ${stats.totalTrees} 🌳`}
          />
          <StatCard
            title="Active Streak"
            value={stats.streakDays}
            suffix=" days"
            icon={Flame}
            colorClass="bg-brand-orange/10 text-brand-orange dark:bg-brand-orange/20"
            type="streak"
            subtext="Keep it up! 🔥"
          />
        </div>

        {/* Row 2: Recharts Trend & Category Donut */}
        <CarbonChart chartDataList={chartData} categorySplitList={categoryData} />

        {/* Row 3: Activities list */}
        <div className="grid grid-cols-1 gap-6">
          
          {/* Left: Recent Activities */}
          <div className="p-6 bg-white dark:bg-brand-darkCard border border-gray-150 dark:border-brand-darkBorder rounded-2xl shadow-sm flex flex-col justify-between transition-colors duration-300">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-brand-text dark:text-brand-darkText">Recent Activities</h3>
                <span className="text-xs text-brand-textSecondary dark:text-zinc-400 font-semibold">
                  Showing last {activities.length} actions
                </span>
              </div>

              <div className="divide-y divide-gray-100 dark:divide-brand-darkBorder overflow-y-auto max-h-[380px] pr-2">
                {activities.length === 0 ? (
                  <div className="text-center py-12 text-sm text-brand-textSecondary">
                    No activities yet. Add some via calculator!
                  </div>
                ) : (
                  activities.map((act) => (
                    <div 
                      key={act.id} 
                      className="py-3 flex items-center justify-between hover:bg-brand-green/5 dark:hover:bg-brand-green/10 px-2 rounded-xl transition-all duration-150"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-brand-darkBg flex items-center justify-center text-lg shadow-inner">
                          {act.activity_icon || '🌿'}
                        </div>
                        <div>
                          <span className="block text-sm font-semibold text-brand-text dark:text-brand-darkText">{act.activity_name}</span>
                          <span className="block text-[10px] text-brand-textSecondary dark:text-zinc-400 font-bold uppercase tracking-wider">{act.category}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className={`text-sm font-extrabold ${
                          parseFloat(act.carbon_kg) < 0 
                            ? 'text-brand-green dark:text-brand-lightGreen' 
                            : parseFloat(act.carbon_kg) === 0 
                              ? 'text-brand-blue' 
                              : 'text-brand-red'
                        }`}>
                          {parseFloat(act.carbon_kg) > 0 ? `+${act.carbon_kg}` : act.carbon_kg} kg
                        </span>
                        <span className="block text-[10px] text-brand-textSecondary dark:text-zinc-500 font-semibold">
                          {new Date(act.logged_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Row 4: AI Insights */}
        <AIInsights />

      </div>
    </PageTransition>
  );
};

export default Dashboard;
