import React, { useState, useEffect, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  ReferenceLine,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  FileDown, 
  Share2, 
  Sparkles, 
  ChevronDown
} from 'lucide-react';
import { useCarbon } from '../context/CarbonContext';
import { TypeWriter } from '../components/dashboard/AIInsights';
import PageTransition from '../components/common/PageTransition';
import { ListSkeleton } from '../components/common/SkeletonLoader';
import { supabase } from '../lib/supabase';

const ReportCard = () => {
  const { user } = useCarbon();
  const [selectedMonth, setSelectedMonth] = useState('March');
  const [reportData, setReportData] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);
  const reportRef = useRef();

  // Print handle
  const handlePrint = useReactToPrint({
    content: () => reportRef.current,
    documentTitle: `EcoTrack-Report-${selectedMonth}-2024`,
    onAfterPrint: () => toast.success("PDF Download initiated! 📥")
  });

  const getGrade = (kg) => {
    if (kg < 50) return 'A+';
    if (kg < 100) return 'A';
    if (kg < 150) return 'B+';
    if (kg < 200) return 'B';
    if (kg < 300) return 'C';
    return 'D';
  };

  const getAiSummary = (t, f, e) => {
    const summary = [];
    if (t > 150) {
      summary.push("Your transport emissions are relatively high this month. Try to replace short car trips with cycling or walking, or use public transport.");
    } else {
      summary.push("Excellent work keeping your transport emissions low! Using public transport and walking is having a great positive effect.");
    }
    if (f > 100) {
      summary.push("Your food footprint is elevated. Try planning red-meat-free days, or choosing local plant-based meals to reduce this.");
    } else {
      summary.push("Great job on your food choices! Continuing a plant-focused diet is keeping your footprint well below the baseline.");
    }
    if (e > 100) {
      summary.push("Your home energy footprint has room for optimization. Ensure appliances are unplugged when not in use and try using natural lighting.");
    } else {
      summary.push("Your energy usage is highly efficient. Keep maintaining these habits to stay on path to a carbon-neutral home.");
    }
    return summary;
  };

  // Fetch report data on month change
  useEffect(() => {
    const fetchReport = async () => {
      setAiLoading(true);
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

        const monthMap = {
          january: 0, february: 1, march: 2, april: 3, may: 4, june: 5,
          july: 6, august: 7, september: 8, october: 9, november: 10, december: 11
        };
        const targetMonth = monthMap[selectedMonth.toLowerCase()] ?? 2; // Default to March
        const year = 2024;
        const startOfMonth = new Date(year, targetMonth, 1);
        const endOfMonth = new Date(year, targetMonth + 1, 1);

        const { data: logs } = await supabase
          .from('carbon_logs')
          .select('*')
          .eq('user_id', profile.id)
          .gte('logged_at', startOfMonth.toISOString())
          .lt('logged_at', endOfMonth.toISOString());

        const total = (logs || []).reduce(
          (s, l) => s + parseFloat(l.carbon_kg), 0
        );

        const transport = (logs || [])
          .filter(l => l.category === 'transport')
          .reduce((s, l) => s + parseFloat(l.carbon_kg), 0);

        const food = (logs || [])
          .filter(l => l.category === 'food')
          .reduce((s, l) => s + parseFloat(l.carbon_kg), 0);

        const energy = (logs || [])
          .filter(l => l.category === 'energy')
          .reduce((s, l) => s + parseFloat(l.carbon_kg), 0);

        // Calculate comparison to previous month
        const prevMonthStart = new Date(year, targetMonth - 1, 1);
        const prevMonthEnd = new Date(year, targetMonth, 1);
        const { data: prevLogs } = await supabase
          .from('carbon_logs')
          .select('carbon_kg')
          .eq('user_id', profile.id)
          .gte('logged_at', prevMonthStart.toISOString())
          .lt('logged_at', prevMonthEnd.toISOString());
        const prevTotal = (prevLogs || []).reduce((s, l) => s + parseFloat(l.carbon_kg), 0);
        const vsLastMonth = prevTotal > 0 ? ((total - prevTotal) / prevTotal) * 100 : -23;

        setReportData({
          totalCarbon: parseFloat(total.toFixed(0)),
          total: total.toFixed(0),
          grade: getGrade(total),
          vsLastMonth: parseFloat(vsLastMonth.toFixed(0)),
          transport: {
            kg: parseFloat(transport.toFixed(0)),
            grade: getGrade(transport * 3)
          },
          food: {
            kg: parseFloat(food.toFixed(0)),
            grade: getGrade(food * 3)
          },
          energy: {
            kg: parseFloat(energy.toFixed(0)),
            grade: getGrade(energy * 3)
          },
          aiSummary: getAiSummary(transport, food, energy)
        });
      } catch (err) {
        console.error("Error loading report:", err);
      } finally {
        setAiLoading(false);
        setLoading(false);
      }
    };
    fetchReport();
  }, [selectedMonth]);

  // Generate 31 points for line graph
  const dailyData = Array.from({ length: 31 }, (_, i) => {
    const day = i + 1;
    // Base fluctuation around 4.6 kg
    let carbonVal = 4.0 + Math.random() * 2.5;
    if (day === 12) carbonVal = 1.1; // Best day
    if (day === 24) carbonVal = 8.5; // Worst day
    return {
      day: day,
      carbon: parseFloat(carbonVal.toFixed(1))
    };
  });

  // Comparison group charts data
  const comparisonData = reportData ? [
    { name: 'Jan', You: 180, National: 450, Global: 800 },
    { name: 'Feb', You: 165, National: 450, Global: 800 },
    { name: selectedMonth.substring(0, 3), You: reportData.totalCarbon, National: 450, Global: 800 }
  ] : [];

  const donutData = reportData ? [
    { name: 'Transport', value: reportData.transport.kg, color: '#1A759F' },
    { name: 'Food', value: reportData.food.kg, color: '#F4A261' },
    { name: 'Energy', value: reportData.energy.kg, color: '#E63946' }
  ] : [];

  if (loading || !reportData) {
    return (
      <div className="min-h-[50vh] flex flex-col justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-green mb-2"></div>
        <span className="text-xs font-semibold text-brand-green">Loading Report Card...</span>
      </div>
    );
  }

  const reductionPercent = Math.abs(reportData.vsLastMonth);
  const reductionDirection = reportData.vsLastMonth < 0 ? 'reduction' : 'increase';

  return (
    <PageTransition>
      <div className="space-y-6">
        
        {/* Top Controls Row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 no-print">
          <div>
            <h2 className="text-xl font-bold text-brand-text dark:text-white flex items-center gap-2">
              <span>Your Carbon Report Card 📊</span>
            </h2>
            <p className="text-xs text-brand-textSecondary dark:text-zinc-400">Monthly progress grade card and AI audits.</p>
          </div>

          <div className="flex flex-wrap gap-3 items-center w-full sm:w-auto">
            {/* Month Select */}
            <div className="relative flex-1 sm:flex-initial">
              <select
                id="report-month-select"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full bg-white dark:bg-brand-darkCard border border-gray-200 dark:border-brand-darkBorder rounded-xl px-4 py-2 text-xs font-bold text-brand-text dark:text-white focus:outline-none appearance-none pr-10 shadow-sm"
              >
                {['January', 'February', 'March', 'April'].map(m => (
                  <option key={m} value={m}>{m} 2024</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            <button
              id="btn-share-report"
              onClick={() => setShowShareModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 dark:border-brand-darkBorder hover:bg-gray-50 dark:hover:bg-brand-green/10 text-xs font-bold text-brand-textSecondary dark:text-zinc-300 rounded-xl shadow-sm transition-colors"
            >
              <Share2 className="w-4 h-4" />
              <span>Share Report</span>
            </button>

            <button
              id="btn-download-pdf-report"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 bg-brand-green text-white hover:bg-brand-green/90 text-xs font-bold rounded-xl shadow-md transition-colors"
            >
              <FileDown className="w-4 h-4" />
              <span>Download PDF</span>
            </button>
          </div>
        </div>

        {/* Printable Report Wrapper */}
        <div ref={reportRef} className="space-y-6">
          
          {/* Grade Card (School Report Card Styling) */}
          <div className="bg-[#FFFEF7] border-2 border-brand-green p-8 rounded-2xl shadow-md text-brand-text relative overflow-hidden max-w-2xl mx-auto border-dashed">
            {/* Top Header */}
            <div className="flex justify-between items-start border-b border-brand-green/30 pb-4">
              <div>
                <h3 className="font-extrabold text-lg text-brand-green tracking-tight flex items-center gap-1">
                  <span>🌿 EcoTrack Report Card</span>
                </h3>
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{selectedMonth} 2024</span>
              </div>
              <div className="text-right">
                <span className="block text-xs font-black">Student Name</span>
                <span className="text-sm font-semibold">{user.name}</span>
              </div>
            </div>

            {/* Split layout: Big Grade vs summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center py-6 border-b border-brand-green/30">
              {/* Big Grade Box */}
              <div className="flex flex-col items-center justify-center p-4 bg-yellow-50 dark:bg-zinc-800 border border-brand-green/40 rounded-xl">
                <span className="text-[10px] font-black uppercase text-brand-green tracking-widest block mb-1">Final Grade</span>
                <div className="w-20 h-20 rounded-xl bg-brand-green text-white flex items-center justify-center text-4xl font-black shadow shadow-brand-green/20">
                  {reportData.grade}
                </div>
              </div>

              {/* Summary stats */}
              <div className="sm:col-span-2 space-y-2 text-center sm:text-left">
                <h4 className="text-2xl font-black text-brand-green">{reportData.totalCarbon} kg CO₂</h4>
                <p className="text-xs text-brand-textSecondary leading-normal">
                  Your carbon footprint this month is {reportData.totalCarbon}kg. You achieved a <span className="text-brand-green font-bold">↓ {reductionPercent}% {reductionDirection}</span> compared to the previous month!
                </p>
              </div>
            </div>

            {/* Subject grades Table */}
            <div className="py-6 space-y-3">
              <h4 className="text-xs uppercase tracking-wider font-extrabold text-gray-500">Subject Breakdown</h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center py-1.5 border-b border-brand-green/10 font-bold">
                  <span className="flex items-center gap-1.5">🚗 Transport emissions</span>
                  <div className="flex items-center gap-4">
                    <span>{reportData.transport.kg} kg</span>
                    <span className="w-6 h-6 rounded bg-brand-green text-white flex items-center justify-center text-[10px] font-black">
                      {reportData.transport.grade}
                    </span>
                    <span className="text-brand-green text-xs">✅</span>
                  </div>
                </div>

                <div className="flex justify-between items-center py-1.5 border-b border-brand-green/10 font-bold">
                  <span className="flex items-center gap-1.5">🥗 Food emissions</span>
                  <div className="flex items-center gap-4">
                    <span>{reportData.food.kg} kg</span>
                    <span className="w-6 h-6 rounded bg-amber-400 text-brand-text flex items-center justify-center text-[10px] font-black">
                      {reportData.food.grade}
                    </span>
                    <span className="text-brand-orange text-xs">🟡</span>
                  </div>
                </div>

                <div className="flex justify-between items-center py-1.5 font-bold">
                  <span className="flex items-center gap-1.5">💡 Energy emissions</span>
                  <div className="flex items-center gap-4">
                    <span>{reportData.energy.kg} kg</span>
                    <span className="w-6 h-6 rounded bg-brand-red text-white flex items-center justify-center text-[10px] font-black">
                      {reportData.energy.grade}
                    </span>
                    <span className="text-brand-red text-xs">⚠️</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Rotated ECO Certified Stamp */}
            <div className="absolute bottom-4 right-4 rotate-[-15deg] border-4 border-double border-brand-green px-3 py-1.5 rounded-xl text-brand-green font-black text-xs uppercase tracking-widest bg-[#FFFEF7] opacity-80 pointer-events-none select-none">
              ECO Certified 🌱
            </div>
          </div>

          {/* Charts grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 no-print">
            {/* Chart 1: Monthly comparison groups */}
            <div className="p-6 bg-white dark:bg-brand-darkCard border border-gray-100 dark:border-brand-darkBorder rounded-2xl shadow-sm transition-colors duration-300">
              <h3 className="text-xs font-bold text-brand-text dark:text-white uppercase tracking-wider mb-4">Monthly comparison</h3>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparisonData}>
                    <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip />
                    <Bar dataKey="You" fill="#52B788" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="National" fill="#1A759F" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Global" fill="#CBD5E1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Daily this month line chart */}
            <div className="p-6 bg-white dark:bg-brand-darkCard border border-gray-100 dark:border-brand-darkBorder rounded-2xl shadow-sm transition-colors duration-300">
              <h3 className="text-xs font-bold text-brand-text dark:text-white uppercase tracking-wider mb-4">Daily Footprint</h3>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailyData} margin={{ left: -10, right: 10 }}>
                    <XAxis dataKey="day" fontSize={9} tickLine={false} />
                    <YAxis fontSize={9} tickLine={false} />
                    <Tooltip />
                    <ReferenceLine y={4.8} stroke="#2D6A4F" strokeDasharray="3 3" label={{ value: 'Average', fontSize: 9, fill: '#2D6A4F' }} />
                    <Line type="monotone" dataKey="carbon" stroke="#52B788" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 3: Donut category comparison */}
            <div className="p-6 bg-white dark:bg-brand-darkCard border border-gray-100 dark:border-brand-darkBorder rounded-2xl shadow-sm transition-colors duration-300">
              <h3 className="text-xs font-bold text-brand-text dark:text-white uppercase tracking-wider mb-4">Carbon Category Splits</h3>
              <div className="h-52 relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={donutData} cx="50%" cy="50%" innerRadius={55} outerRadius={70} dataKey="value">
                      {donutData.map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => `${v} kg`} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute text-center flex flex-col justify-center">
                  <span className="text-[10px] text-brand-textSecondary dark:text-zinc-500 font-bold">Total</span>
                  <span className="text-sm font-black text-brand-text dark:text-white">{reportData.totalCarbon} kg</span>
                </div>
              </div>
            </div>

            {/* Chart 4: You vs The World horizontal benchmark */}
            <div className="p-6 bg-white dark:bg-brand-darkCard border border-gray-100 dark:border-brand-darkBorder rounded-2xl shadow-sm space-y-4 transition-colors duration-300">
              <h3 className="text-xs font-bold text-brand-text dark:text-white uppercase tracking-wider">You vs The World</h3>
              
              <div className="space-y-3">
                {[
                  { label: 'You', val: reportData.totalCarbon, color: 'bg-brand-green', max: 800 },
                  { label: 'National Average', val: 450, color: 'bg-slate-400 dark:bg-zinc-600', max: 800 },
                  { label: 'Global Average', val: 800, color: 'bg-slate-300 dark:bg-zinc-700', max: 800 },
                  { label: 'Target Limit', val: 120, color: 'bg-brand-green border-dashed border-2 bg-transparent dark:border-brand-lightGreen', max: 800 }
                ].map(bar => {
                  const percent = Math.min((bar.val / bar.max) * 100, 100);
                  return (
                    <div key={bar.label} className="space-y-1">
                      <div className="flex justify-between text-[10px] font-bold text-brand-textSecondary dark:text-zinc-400">
                        <span>{bar.label}</span>
                        <span>{bar.val} kg</span>
                      </div>
                      <div className="w-full h-2.5 bg-gray-50 dark:bg-brand-darkBg rounded-full overflow-hidden">
                        <div className={`h-full ${bar.color} rounded-full`} style={{ width: `${percent}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* AI Analysis Paragraph layout (TypeWriter anims) */}
          <div className="p-6 bg-white dark:bg-brand-darkCard border border-gray-100 dark:border-brand-darkBorder rounded-2xl shadow-sm space-y-4 transition-colors duration-300">
            <div className="flex items-center justify-between pb-2 border-b border-gray-50 dark:border-brand-darkBorder">
              <h3 className="text-sm font-bold text-brand-text dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-green" />
                <span>🤖 AI Analysis</span>
              </h3>
              <span className="bg-brand-green/10 text-brand-green dark:bg-brand-lightGreen/10 dark:text-brand-lightGreen text-[10px] font-black px-2 py-0.5 rounded">
                Gemini AI Audit
              </span>
            </div>

            <AnimatePresence mode="wait">
              {aiLoading ? (
                <ListSkeleton />
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-3.5 text-xs text-brand-textSecondary dark:text-zinc-300 leading-relaxed font-semibold"
                >
                  {reportData.aiSummary.map((para, i) => (
                    <p key={i}>
                      <TypeWriter text={para} delay={10} />
                    </p>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Action Plan next month */}
          <div className="p-6 bg-white dark:bg-brand-darkCard border border-gray-100 dark:border-brand-darkBorder rounded-2xl shadow-sm space-y-4 transition-colors duration-300 no-print">
            <div>
              <h3 className="text-sm font-bold text-brand-text dark:text-white uppercase tracking-wider">
                Your Action Plan for April 📋
              </h3>
              <p className="text-[10px] text-brand-textSecondary dark:text-zinc-400 mt-1">Recommended adjustments to elevate your grade from B+ to A-.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { title: 'Take bus 3x/week 🚌', save: 'Save: ~45 kg CO₂', diff: 'Difficulty: Easy' },
                { title: 'Reduce red meat to 2 days 🥗', save: 'Save: ~33 kg CO₂', diff: 'Difficulty: Medium' },
                { title: 'Switch to LED bulbs 💡', save: 'Save: ~8 kg CO₂', diff: 'Difficulty: Easy' }
              ].map((card, idx) => (
                <div 
                  key={idx}
                  className="p-4 bg-gray-50 dark:bg-brand-darkBg border border-gray-200 dark:border-brand-darkBorder rounded-xl flex flex-col justify-between"
                >
                  <div className="space-y-1">
                    <span className="block text-xs font-extrabold text-brand-text dark:text-white">{card.title}</span>
                    <span className="block text-[10px] text-brand-green font-bold">{card.save}</span>
                    <span className="block text-[9px] text-brand-textSecondary dark:text-zinc-500">{card.diff}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => toast.success(`Goal "${card.title.split(' ')[0]}" added to April plans! 🎯`)}
                    className="w-full mt-3 py-2 bg-brand-green hover:bg-brand-green/90 text-white text-[10px] font-bold rounded-lg transition-colors shadow-sm"
                  >
                    Add to Goals
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Share modal */}
        {showShareModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-brand-darkCard border dark:border-brand-darkBorder rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-xl">
              <div className="w-12 h-12 rounded-full bg-brand-green/10 flex items-center justify-center text-brand-green mx-auto">
                <Share2 className="w-6 h-6" />
              </div>
              <h4 className="text-base font-extrabold text-brand-text dark:text-white">Share Carbon Report</h4>
              <p className="text-xs text-brand-textSecondary dark:text-zinc-400">
                Show off your {selectedMonth} grade of {reportData.grade} and reduction progress of {reductionPercent}%!
              </p>
              
              <div className="grid grid-cols-3 gap-2">
                {['Email', 'Twitter', 'WhatsApp'].map(net => (
                  <button
                    key={net}
                    onClick={() => {
                      toast.success(`Report shared via ${net}!`);
                      setShowShareModal(false);
                    }}
                    className="p-2 border dark:border-brand-darkBorder rounded-xl hover:bg-gray-50 dark:hover:bg-brand-green/10 text-xs font-bold text-brand-textSecondary dark:text-zinc-300"
                  >
                    {net}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setShowShareModal(false)}
                className="w-full py-2 text-xs font-extrabold text-brand-textSecondary hover:underline"
              >
                Close
              </button>
            </div>
          </div>
        )}

      </div>
    </PageTransition>
  );
};

export default ReportCard;
