import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import { Target, AlertTriangle, CheckCircle, Award, Star, Calendar } from 'lucide-react';
import { useCarbon } from '../context/CarbonContext';
import PageTransition from '../components/common/PageTransition';

const Goals = () => {
  const { monthlyStats, updateGoal, goalHistory } = useCarbon();

  // Local sliders state
  const [mainTarget, setMainTarget] = useState(monthlyStats.goalTarget);
  const [transportTarget, setTransportTarget] = useState(60);
  const [foodTarget, setFoodTarget] = useState(45);
  const [energyTarget, setEnergyTarget] = useState(40);

  // Sync sliders if context updates
  useEffect(() => {
    setMainTarget(monthlyStats.goalTarget);
  }, [monthlyStats.goalTarget]);

  // Goal ring math
  const goalPercent = Math.min(Math.round((monthlyStats.goalCurrent / monthlyStats.goalTarget) * 100), 100);
  const circ = 2 * Math.PI * 50; // circumference 314.15
  const [offset, setOffset] = useState(circ);

  useEffect(() => {
    // Animate stroke-dashoffset on mount / update
    const calculatedOffset = circ - (circ * goalPercent) / 100;
    setOffset(calculatedOffset);
  }, [goalPercent]);

  // Set Ring color based on percentage
  const getRingColor = (p) => {
    if (p < 60) return '#52B788'; // green
    if (p < 80) return '#F4A261'; // yellow
    return '#E63946'; // red
  };

  const getTargetLabel = (val) => {
    if (val <= 70) return '🌱 Climate Activist';
    if (val <= 120) return '🌿 Eco Champion';
    if (val <= 180) return '🌍 Eco Aware';
    if (val <= 250) return 'Getting Started';
    return '⚠️ High Impact';
  };

  const handleSaveGoal = () => {
    updateGoal(mainTarget, monthlyStats.goalCurrent);
    toast.success("Goal settings updated! 🎯", {
      style: {
        background: '#2D6A4F',
        color: '#FFFFFF'
      }
    });
    // confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        
        {/* Row 1: Top Hero - Goal Ring & Quick Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Circular Ring widget */}
          <div className="md:col-span-1 p-6 bg-white dark:bg-brand-darkCard border border-gray-100 dark:border-brand-darkBorder rounded-2xl shadow-sm flex flex-col items-center justify-center text-center transition-colors duration-300">
            <h3 className="text-sm font-bold text-brand-textSecondary dark:text-zinc-400 uppercase tracking-wider mb-4">March Goal Status</h3>
            
            <div className="relative w-40 h-40 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90">
                <circle cx="80" cy="80" r="50" fill="transparent" stroke="#E5E7EB" className="dark:stroke-zinc-800" strokeWidth="8" />
                <motion.circle
                  cx="80"
                  cy="80"
                  r="50"
                  fill="transparent"
                  stroke={getRingColor(goalPercent)}
                  strokeWidth="8"
                  strokeDasharray={circ}
                  animate={{ strokeDashoffset: offset }}
                  transition={{ duration: 1.5, ease: 'easeOut' }}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute text-center flex flex-col items-center">
                <span className="text-2xl font-black text-brand-text dark:text-white">
                  {monthlyStats.goalCurrent} kg
                </span>
                <span className="text-[10px] font-semibold text-brand-textSecondary dark:text-zinc-400">
                  of {monthlyStats.goalTarget} kg
                </span>
                <span 
                  className="text-xs font-bold mt-1" 
                  style={{ color: getRingColor(goalPercent) }}
                >
                  {goalPercent}% used
                </span>
              </div>
            </div>
          </div>

          {/* AI Banner and status card */}
          <div className="md:col-span-2 p-6 bg-white dark:bg-brand-darkCard border border-gray-100 dark:border-brand-darkBorder rounded-2xl shadow-sm flex flex-col justify-between transition-colors duration-300">
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-brand-text dark:text-brand-white">Monthly Projection</h3>
              <p className="text-xs text-brand-textSecondary dark:text-zinc-400 font-semibold">12 days remaining in March budget period</p>
            </div>

            {/* Projection status detail */}
            <div className="bg-brand-green/10 dark:bg-brand-green/20 p-4 rounded-xl border border-brand-green/25 mt-4">
              <div className="flex gap-3">
                <span className="text-2xl">🤖</span>
                <div>
                  <h4 className="text-xs font-extrabold text-brand-green dark:text-brand-lightGreen">You are on track!</h4>
                  <p className="text-[10px] text-brand-textSecondary dark:text-zinc-300 leading-relaxed mt-0.5">
                    At your current rate, you will successfully achieve your March goal of staying under {monthlyStats.goalTarget} kg. Keep choosing green transit options to secure your grade!
                  </p>
                </div>
              </div>
            </div>

            {/* Quick offset stat */}
            <div className="flex items-center justify-between text-xs text-brand-textSecondary dark:text-zinc-400 font-bold border-t border-gray-100 dark:border-brand-darkBorder pt-4 mt-4">
              <span>Days Active: 18 / 31</span>
              <span>Streaks: 15 days 🔥</span>
            </div>
          </div>

        </div>

        {/* Row 2: Category breakdown & Target sliders */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Left: Category Progress Bars */}
          <div className="p-6 bg-white dark:bg-brand-darkCard border border-gray-100 dark:border-brand-darkBorder rounded-2xl shadow-sm space-y-6 transition-colors duration-300">
            <div>
              <h3 className="text-base font-extrabold text-brand-text dark:text-white">Category Budgets</h3>
              <p className="text-xs text-brand-textSecondary dark:text-zinc-400">Carbon allocations vs current usage this month</p>
            </div>

            <div className="space-y-6">
              {/* Transport */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-brand-text dark:text-white flex items-center gap-1">🚗 Transport</span>
                  <span className="text-brand-textSecondary dark:text-zinc-400">52 of 60 kg</span>
                </div>
                <div className="w-full h-2.5 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-orange rounded-full" style={{ width: '87%' }} />
                </div>
                <span className="text-[10px] font-bold text-brand-orange flex items-center gap-1 mt-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Almost at limit! ⚠️
                </span>
              </div>

              {/* Food */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-brand-text dark:text-white flex items-center gap-1">🥗 Food</span>
                  <span className="text-brand-textSecondary dark:text-zinc-400">28 of 45 kg</span>
                </div>
                <div className="w-full h-2.5 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-green rounded-full" style={{ width: '62%' }} />
                </div>
                <span className="text-[10px] font-bold text-brand-green dark:text-brand-lightGreen flex items-center gap-1 mt-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Good progress! ✅
                </span>
              </div>

              {/* Energy */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-brand-text dark:text-white flex items-center gap-1">💡 Energy</span>
                  <span className="text-brand-textSecondary dark:text-zinc-400">9 of 40 kg</span>
                </div>
                <div className="w-full h-2.5 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-blue rounded-full" style={{ width: '23%' }} />
                </div>
                <span className="text-[10px] font-bold text-brand-blue flex items-center gap-1 mt-1">
                  <Star className="w-3.5 h-3.5 fill-current" /> Excellent! 🌟
                </span>
              </div>
            </div>
          </div>

          {/* Right: Set Goal Panel */}
          <div className="p-6 bg-white dark:bg-brand-darkCard border border-gray-100 dark:border-brand-darkBorder rounded-2xl shadow-sm space-y-6 transition-colors duration-300">
            <div>
              <h3 className="text-base font-extrabold text-brand-text dark:text-white">Update Monthly Goal</h3>
              <p className="text-xs text-brand-textSecondary dark:text-zinc-400">Change your targets to adjust your carbon footprints</p>
            </div>

            <div className="space-y-4">
              {/* Main Target */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-brand-text dark:text-white">Monthly Target</span>
                  <span className="text-brand-green dark:text-brand-lightGreen">{mainTarget} kg CO₂</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="500"
                  value={mainTarget}
                  onChange={(e) => setMainTarget(parseInt(e.target.value))}
                  className="w-full accent-brand-green bg-gray-100 dark:bg-zinc-800 rounded-lg h-1.5 appearance-none"
                />
                <div className="flex justify-between text-[9px] font-bold text-brand-textSecondary dark:text-zinc-500 mt-1">
                  <span>50 kg</span>
                  <span className="text-brand-green dark:text-brand-lightGreen font-black">{getTargetLabel(mainTarget)}</span>
                  <span>500 kg</span>
                </div>
              </div>

              {/* Category Sliders */}
              <div className="grid grid-cols-3 gap-4 pt-2">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-brand-textSecondary dark:text-zinc-400 block text-center">🚗 Transport</span>
                  <input
                    type="range"
                    min="20"
                    max="150"
                    value={transportTarget}
                    onChange={(e) => setTransportTarget(parseInt(e.target.value))}
                    className="w-full accent-brand-green"
                  />
                  <span className="text-[10px] font-extrabold block text-center text-brand-text dark:text-white">{transportTarget} kg</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-brand-textSecondary dark:text-zinc-400 block text-center">🥗 Food</span>
                  <input
                    type="range"
                    min="20"
                    max="150"
                    value={foodTarget}
                    onChange={(e) => setFoodTarget(parseInt(e.target.value))}
                    className="w-full accent-brand-green"
                  />
                  <span className="text-[10px] font-extrabold block text-center text-brand-text dark:text-white">{foodTarget} kg</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-brand-textSecondary dark:text-zinc-400 block text-center">💡 Energy</span>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={energyTarget}
                    onChange={(e) => setEnergyTarget(parseInt(e.target.value))}
                    className="w-full accent-brand-green"
                  />
                  <span className="text-[10px] font-extrabold block text-center text-brand-text dark:text-white">{energyTarget} kg</span>
                </div>
              </div>

              {/* Save Button */}
              <button
                id="btn-save-goal-settings"
                onClick={handleSaveGoal}
                className="w-full py-3 bg-brand-green text-white hover:bg-brand-green/90 font-extrabold rounded-xl text-xs transition-colors mt-2"
              >
                Save Target Settings
              </button>
            </div>
          </div>

        </div>

        {/* Row 3: Goal History */}
        <div className="space-y-3">
          <h3 className="text-base font-extrabold text-brand-text dark:text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-brand-green" />
            <span>Your Goal History 📅</span>
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {goalHistory.map((hist, idx) => {
              const diff = hist.actual - hist.target;
              const isAchieved = hist.achieved;
              return (
                <div 
                  key={idx}
                  className={`p-4 rounded-xl border flex flex-col justify-between ${
                    isAchieved
                      ? 'bg-green-50/50 dark:bg-emerald-950/10 border-brand-green/30'
                      : 'bg-red-50/50 dark:bg-red-950/10 border-brand-red/30'
                  }`}
                >
                  <div>
                    <span className="text-xs font-extrabold text-brand-text dark:text-white block">{hist.month}</span>
                    <span className="text-[9px] font-bold text-brand-textSecondary dark:text-zinc-500">{hist.year}</span>
                  </div>

                  <div className="my-3 space-y-1 text-xs">
                    <div className="flex justify-between font-semibold text-brand-textSecondary dark:text-zinc-400">
                      <span>Target:</span>
                      <span>{hist.target}kg</span>
                    </div>
                    <div className="flex justify-between font-bold text-brand-text dark:text-white">
                      <span>Actual:</span>
                      <span>{hist.actual}kg</span>
                    </div>
                  </div>

                  <div className="border-t border-gray-150 dark:border-brand-darkBorder/40 pt-2.5 flex items-center justify-between">
                    <span className={`text-[10px] font-black ${isAchieved ? 'text-brand-green' : 'text-brand-red'}`}>
                      {isAchieved ? '✅ Achieved' : '❌ Missed'}
                    </span>
                    <span className={`text-[9px] font-bold ${diff > 0 ? 'text-brand-red' : 'text-brand-green'}`}>
                      {diff > 0 ? `+${diff}kg` : `${diff}kg`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </PageTransition>
  );
};

export default Goals;
