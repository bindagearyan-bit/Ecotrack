import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { 
  Check, 
  Leaf, 
  Share2, 
  RefreshCw, 
  Download, 
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCarbon } from '../context/CarbonContext';
import { supabase } from '../lib/supabase';
import { 
  calculateTransportCarbon, 
  calculateFoodCarbon, 
  calculateEnergyCarbon 
} from '../utils/carbonCalc';
import { mockAIInsights } from '../data/mockData';
import TransportStep from '../components/calculator/TransportStep';
import FoodStep from '../components/calculator/FoodStep';
import EnergyStep from '../components/calculator/EnergyStep';
import PageTransition from '../components/common/PageTransition';
import { StatCardSkeleton } from '../components/common/SkeletonLoader';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { CountUpNumber } from '../components/dashboard/StatCard';

const Calculator = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Transport, 2: Food, 3: Energy, 4: Results
  const [resultsLoading, setResultsLoading] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [saving, setSaving] = useState(false);

  // Calculator form inputs
  const [trips, setTrips] = useState([
    { mode: 'Car', distance: 120, fuel: 'Petrol', flightType: '', flightsNum: 0 }
  ]);
  const [foodDays, setFoodDays] = useState({
    redMeat: 2,
    poultry: 3,
    fish: 1,
    dairy: 4,
    vegan: 2
  });
  const [energyInputs, setEnergyInputs] = useState({
    bill: 3200,
    currency: '₹',
    source: 'Grid Power',
    householdSize: 4,
    acHours: 6,
    appliances: ['Washing Machine', 'Desktop Computer']
  });

  // Calculate finals
  const transportVal = calculateTransportCarbon(trips);
  const foodVal = calculateFoodCarbon(foodDays);
  const energyVal = calculateEnergyCarbon(energyInputs);
  const totalCarbon = parseFloat((transportVal + foodVal + energyVal).toFixed(1));

  // Step 4 results loading simulation
  const handleCalculate = () => {
    setStep(4);
    setResultsLoading(true);
    setTimeout(() => {
      setResultsLoading(false);
    }, 2000);
  };

  const handleSaveToDashboard = async () => {
    setSaving(true);
    try {
      // Get current user
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (!authUser) {
        toast.error('Please login first');
        navigate('/auth');
        return;
      }
      
      // Get user profile
      const { data: profile } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', authUser.id)
        .single();
      
      if (!profile) {
        toast.error('User profile not found');
        return;
      }
      
      // Save transport entry
      if (transportVal > 0) {
        await supabase
          .from('carbon_logs')
          .insert({
            user_id: profile.id,
            category: 'transport',
            activity_name: 'Calculator: Transport',
            activity_icon: '🚗',
            carbon_kg: transportVal
          });
      }
      
      // Save food entry  
      if (foodVal > 0) {
        await supabase
          .from('carbon_logs')
          .insert({
            user_id: profile.id,
            category: 'food',
            activity_name: 'Calculator: Food',
            activity_icon: '🍔',
            carbon_kg: foodVal
          });
      }
      
      // Save energy entry
      if (energyVal > 0) {
        await supabase
          .from('carbon_logs')
          .insert({
            user_id: profile.id,
            category: 'energy',
            activity_name: 'Calculator: Energy',
            activity_icon: '⚡',
            carbon_kg: energyVal
          });
      }
      
      toast.success('Saved to dashboard! 🌿');
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
      
    } catch (error) {
      toast.error('Failed to save: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  // Footprint Rating Classifications
  const getRating = (val) => {
    if (val < 100) return { label: 'Carbon Hero!', color: 'text-brand-green bg-green-50 dark:bg-emerald-950/20 border-brand-green', emoji: '🟢' };
    if (val < 200) return { label: 'Eco Aware', color: 'text-brand-blue bg-blue-50 dark:bg-blue-950/20 border-brand-blue', emoji: '🟡' };
    if (val < 300) return { label: 'Room to Improve', color: 'text-brand-orange bg-orange-50 dark:bg-amber-950/20 border-brand-orange', emoji: '🟠' };
    return { label: 'High Impact', color: 'text-brand-red bg-red-50 dark:bg-red-950/20 border-brand-red', emoji: '🔴' };
  };

  const rating = getRating(totalCarbon);

  // Donut chart details
  const donutData = [
    { name: 'Transport', value: transportVal, color: '#1A759F' },
    { name: 'Food', value: foodVal, color: '#F4A261' },
    { name: 'Energy', value: energyVal, color: '#E63946' }
  ].filter(d => d.value > 0);

  // Handle printing
  const handlePrint = () => {
    window.print();
  };

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Step Progress Bar Header */}
        {step < 4 && (
          <div className="bg-white dark:bg-brand-darkCard border border-gray-100 dark:border-brand-darkBorder p-6 rounded-2xl shadow-sm transition-colors duration-300">
            <div className="flex items-center justify-between relative max-w-lg mx-auto">
              {/* Connector lines */}
              <div className="absolute left-0 right-0 top-4 h-0.5 bg-gray-100 dark:bg-zinc-800 -z-1" />
              <div 
                className="absolute left-0 top-4 h-0.5 bg-brand-green transition-all duration-300 -z-1" 
                style={{ width: `${((step - 1) / 2) * 100}%` }}
              />

              {[
                { s: 1, label: 'Transport' },
                { s: 2, label: 'Food' },
                { s: 3, label: 'Energy' }
              ].map(item => {
                const isCompleted = step > item.s;
                const isActive = step === item.s;
                return (
                  <div key={item.s} className="flex flex-col items-center gap-1.5 relative z-10">
                    <button
                      type="button"
                      onClick={() => step > item.s && setStep(item.s)}
                      disabled={step <= item.s}
                      className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs border transition-all duration-300 ${
                        isCompleted
                          ? 'bg-brand-green border-brand-green text-white shadow-md'
                          : isActive
                            ? 'bg-white dark:bg-brand-darkCard border-brand-green dark:border-brand-lightGreen text-brand-green dark:text-brand-lightGreen ring-4 ring-brand-green/10'
                            : 'bg-white dark:bg-brand-darkCard border-gray-200 dark:border-brand-darkBorder text-gray-400'
                      }`}
                    >
                      {isCompleted ? <Check className="w-4.5 h-4.5 stroke-[3]" /> : item.s}
                    </button>
                    <span className={`text-[10px] font-extrabold uppercase tracking-wider ${
                      isActive ? 'text-brand-green dark:text-brand-lightGreen' : 'text-brand-textSecondary'
                    }`}>
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Step Views */}
        <div className="print-container">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
              >
                <TransportStep trips={trips} setTrips={setTrips} onNext={() => setStep(2)} />
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
              >
                <FoodStep foodDays={foodDays} setFoodDays={setFoodDays} onBack={() => setStep(1)} onNext={() => setStep(3)} />
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
              >
                <EnergyStep
                  energyInputs={energyInputs}
                  setEnergyInputs={setEnergyInputs}
                  onBack={() => setStep(2)}
                  onCalculate={handleCalculate}
                />
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
              >
                {resultsLoading ? (
                  /* Loading Skeletons for Results */
                  <div className="space-y-6 p-8 bg-white dark:bg-brand-darkCard rounded-2xl border dark:border-brand-darkBorder shadow-sm">
                    <div className="flex flex-row gap-2">
                      <div className="animate-pulse bg-gray-300 dark:bg-zinc-700 w-12 h-12 rounded-full"></div>
                      <div className="flex flex-col gap-2">
                        <div className="animate-pulse bg-gray-300 dark:bg-zinc-700 w-28 h-5 rounded-full"></div>
                        <div className="animate-pulse bg-gray-300 dark:bg-zinc-700 w-36 h-5 rounded-full"></div>
                      </div>
                    </div>
                    <div className="animate-pulse bg-gray-200 dark:bg-zinc-800 h-32 rounded-2xl" />
                    <StatCardSkeleton />
                  </div>
                ) : (
                  /* Actual Results Content */
                  <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between no-print">
                      <button
                        onClick={() => setStep(3)}
                        className="flex items-center gap-1.5 text-xs font-bold text-brand-textSecondary dark:text-zinc-300 hover:text-brand-green"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to Inputs</span>
                      </button>
                      <span className="text-xs font-extrabold text-brand-green bg-brand-green/10 px-3 py-1 rounded-full uppercase tracking-wider">
                        Calculation Complete 🌿
                      </span>
                    </div>

                    {/* Results Hero */}
                    <div className="bg-white dark:bg-brand-darkCard border border-gray-100 dark:border-brand-darkBorder p-8 rounded-2xl shadow-sm text-center space-y-4 transition-colors duration-300">
                      <div>
                        <span className="text-xs font-bold text-brand-textSecondary dark:text-zinc-400 uppercase tracking-widest block">Your Monthly Footprint</span>
                        <h2 className="text-4xl sm:text-5xl font-black text-brand-green dark:text-brand-lightGreen mt-1.5">
                          <CountUpNumber end={totalCarbon} suffix=" kg CO₂" />
                        </h2>
                      </div>

                      {/* Rating Badge */}
                      <div className={`inline-flex items-center gap-1.5 px-4 py-2 border rounded-xl font-black text-xs ${rating.color}`}>
                        <span>{rating.emoji}</span>
                        <span>{rating.label}</span>
                      </div>
                    </div>

                    {/* Layout Split: Bars vs Donut */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* You vs World Comparison Bars */}
                      <div className="p-6 bg-white dark:bg-brand-darkCard border border-gray-100 dark:border-brand-darkBorder rounded-2xl shadow-sm space-y-6 transition-colors duration-300">
                        <h3 className="text-sm font-extrabold text-brand-text dark:text-white">Comparative Benchmark</h3>
                        
                        <div className="space-y-4">
                          {[
                            { label: 'You', val: totalCarbon, color: 'bg-brand-green', max: 800 },
                            { label: 'India Average', val: 450, color: 'bg-slate-400 dark:bg-zinc-600', max: 800 },
                            { label: 'World Average', val: 800, color: 'bg-slate-300 dark:bg-zinc-700', max: 800 },
                            { label: 'Best Target', val: 80, color: 'bg-brand-blue', max: 800 }
                          ].map(bar => {
                            const percent = Math.min((bar.val / bar.max) * 100, 100);
                            return (
                              <div key={bar.label} className="space-y-1.5">
                                <div className="flex justify-between text-xs font-bold text-brand-textSecondary dark:text-zinc-300">
                                  <span>{bar.label}</span>
                                  <span>{bar.val} kg</span>
                                </div>
                                <div className="w-full h-3 bg-gray-50 dark:bg-brand-darkBg rounded-full overflow-hidden">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${percent}%` }}
                                    transition={{ duration: 1.2, ease: 'easeOut' }}
                                    className={`h-full ${bar.color} rounded-full`}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Category Donut chart */}
                      <div className="p-6 bg-white dark:bg-brand-darkCard border border-gray-100 dark:border-brand-darkBorder rounded-2xl shadow-sm flex flex-col justify-between transition-colors duration-300">
                        <h3 className="text-sm font-extrabold text-brand-text dark:text-white mb-2">Category Breakdown</h3>
                        
                        <div className="h-44 relative flex items-center justify-center">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={donutData}
                                cx="50%"
                                cy="50%"
                                innerRadius={45}
                                outerRadius={60}
                                dataKey="value"
                              >
                                {donutData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip formatter={(v) => `${v} kg`} />
                            </PieChart>
                          </ResponsiveContainer>
                          
                          <div className="absolute text-center flex flex-col justify-center">
                            <span className="text-xs text-brand-textSecondary dark:text-zinc-400 font-bold">Total</span>
                            <span className="text-base font-black text-brand-text dark:text-white">{totalCarbon} kg</span>
                          </div>
                        </div>

                        {/* Legend */}
                        <div className="flex justify-center gap-4 text-[10px] font-bold mt-2">
                          {donutData.map(item => (
                            <div key={item.name} className="flex items-center gap-1">
                              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                              <span className="text-brand-textSecondary dark:text-zinc-300">{item.name} ({item.value} kg)</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* AI Actions to reduce */}
                    <div className="p-6 bg-white dark:bg-brand-darkCard border border-gray-100 dark:border-brand-darkBorder rounded-2xl shadow-sm space-y-4 transition-colors duration-300">
                      <h3 className="text-sm font-extrabold text-brand-text dark:text-white flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-brand-green" />
                        <span>💡 Top Actions to Reduce</span>
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {mockAIInsights.map(tip => (
                          <div 
                            key={tip.id} 
                            className="p-4 bg-gray-50 dark:bg-brand-darkBg border border-gray-200 dark:border-brand-darkBorder rounded-xl space-y-2 flex flex-col justify-between"
                          >
                            <div>
                              <div className="flex justify-between items-center text-lg mb-1">
                                <span>{tip.icon}</span>
                                <span className="text-[10px] bg-brand-green/10 text-brand-green font-bold px-1.5 py-0.5 rounded">
                                  {tip.impact.split(' ')[1]} {tip.impact.split(' ')[2]}
                                </span>
                              </div>
                              <h4 className="text-xs font-bold text-brand-text dark:text-white mb-1">{tip.title}</h4>
                              <p className="text-[10px] text-brand-textSecondary dark:text-zinc-400 leading-normal">{tip.description}</p>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                updateGoal(120, totalCarbon - 15);
                                toast.success(`Added action "${tip.action}" to your goals!`);
                              }}
                              className="w-full mt-3 py-1.5 bg-brand-green text-white hover:bg-brand-green/90 text-[10px] font-bold rounded-lg transition-colors"
                            >
                              Add to Goals
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action buttons footer */}
                    <div className="flex flex-wrap gap-4 items-center justify-between no-print pt-2">
                      <button
                        id="btn-results-reset"
                        onClick={() => setStep(1)}
                        className="px-5 py-3 border border-gray-200 dark:border-brand-darkBorder hover:bg-gray-50 dark:hover:bg-brand-green/10 text-xs font-bold text-brand-textSecondary dark:text-zinc-300 rounded-xl flex items-center gap-1.5 transition-colors"
                      >
                        <RefreshCw className="w-4 h-4" />
                        <span>Start Over</span>
                      </button>

                      <div className="flex flex-wrap gap-3">
                        <button
                          id="btn-results-share"
                          onClick={() => setShowShareModal(true)}
                          className="px-5 py-3 border border-gray-200 dark:border-brand-darkBorder hover:bg-gray-50 dark:hover:bg-brand-green/10 text-xs font-bold text-brand-textSecondary dark:text-zinc-300 rounded-xl flex items-center gap-1.5 transition-colors"
                        >
                          <Share2 className="w-4 h-4" />
                          <span>Share Result</span>
                        </button>
                        <button
                          id="btn-results-print"
                          onClick={handlePrint}
                          className="px-5 py-3 border border-gray-200 dark:border-brand-darkBorder hover:bg-gray-50 dark:hover:bg-brand-green/10 text-xs font-bold text-brand-textSecondary dark:text-zinc-300 rounded-xl flex items-center gap-1.5 transition-colors"
                        >
                          <Download className="w-4 h-4" />
                          <span>Download Report</span>
                        </button>
                        <button
                          id="btn-results-save"
                          onClick={handleSaveToDashboard}
                          disabled={saving}
                          className="px-6 py-3 bg-brand-green hover:bg-brand-green/90 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-brand-green/10 transition-all disabled:opacity-50"
                        >
                          <Check className="w-4 h-4 stroke-[3]" />
                          <span>{saving ? 'Saving...' : 'Save to Dashboard'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Share Modal Dialog */}
        {showShareModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-brand-darkCard border dark:border-brand-darkBorder rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-xl">
              <div className="w-12 h-12 rounded-full bg-brand-green/10 flex items-center justify-center text-brand-green mx-auto">
                <Share2 className="w-6 h-6" />
              </div>
              <h4 className="text-base font-extrabold text-brand-text dark:text-white">Share Carbon Summary</h4>
              <p className="text-xs text-brand-textSecondary dark:text-zinc-400">
                Show off your {totalCarbon} kg CO₂ footprint and inspire your friends to plant forests!
              </p>
              
              <div className="grid grid-cols-3 gap-2">
                {['WhatsApp', 'Twitter', 'LinkedIn'].map(net => (
                  <button
                    key={net}
                    onClick={() => {
                      toast.success(`Shared on ${net}!`);
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
                className="w-full mt-2 py-2 text-xs font-extrabold text-brand-textSecondary hover:underline"
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

export default Calculator;
