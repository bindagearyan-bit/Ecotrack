import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import { Trees, Shield, Wind, Calendar, Share2, ClipboardCheck } from 'lucide-react';
import { useCarbon } from '../context/CarbonContext';
import ForestScene from '../components/forest/ForestScene';
import PageTransition from '../components/common/PageTransition';
import { CountUpNumber } from '../components/dashboard/StatCard';
import { supabase } from '../lib/supabase';

const Forest = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [treesList, setTreesList] = useState([]);
  const [loadingActionId, setLoadingActionId] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const formatTrees = (actionsData) => {
    const typeMap = ['pine', 'oak', 'cherry'];
    const sizeMap = ['small', 'medium', 'large'];

    return (actionsData || []).map((act, index) => ({
      id: act.id,
      type: typeMap[index % 3],
      x: Math.floor(Math.random() * 85) + 5,
      size: sizeMap[index % 3],
      action: act.action_type
    }));
  };

  const loadData = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;

      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', authUser.id)
        .single();

      if (profile) {
        setCurrentUser(profile);
        
        const { data: actionsData } = await supabase
          .from('eco_actions')
          .select('*')
          .eq('user_id', profile.id)
          .order('performed_at', { ascending: false });

        setTreesList(formatTrees(actionsData));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const ecoActions = [
    { id: 1, name: 'Cycled instead of drove', category: 'Transport', emoji: '🚴', treeType: 'pine', size: 'large' },
    { id: 2, name: 'Ate plant-based today', category: 'Food', emoji: '🥗', treeType: 'oak', size: 'medium' },
    { id: 3, name: 'Recycled my waste today', category: 'Lifestyle', emoji: '♻️', treeType: 'cherry', size: 'medium' },
    { id: 4, name: 'Saved electricity today', category: 'Energy', emoji: '💡', treeType: 'pine', size: 'small' },
    { id: 5, name: 'Took a short shower', category: 'Lifestyle', emoji: '🚿', treeType: 'oak', size: 'small' }
  ];

  const handleLogAction = async (action) => {
    setLoadingActionId(action.id);
    try {
      if (!currentUser) return;

      // Insert eco action
      const { error: insertError } = await supabase
        .from('eco_actions')
        .insert({
          user_id: currentUser.id,
          action_type: action.category.toLowerCase(),
          description: action.name,
          trees_earned: 1,
          carbon_saved: 1.5
        });

      if (insertError) throw insertError;
      
      // Update user tree count and carbon saved
      const newTrees = (currentUser.total_trees || 0) + 1;
      const newCarbonSaved = parseFloat(((currentUser.total_carbon_saved || 0) + 1.5).toFixed(1));
      
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          total_trees: newTrees,
          total_carbon_saved: newCarbonSaved
        })
        .eq('id', currentUser.id);

      if (updateError) throw updateError;

      toast.success("Eco action logged! 🌳 Virtual tree planted!", {
        style: {
          background: '#2D6A4F',
          color: '#FFFFFF'
        }
      });

      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#2D6A4F', '#52B788', '#1A759F', '#F4A261']
      });

      await loadData();
    } catch (err) {
      toast.error("Failed to log action: " + err.message);
    } finally {
      setLoadingActionId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-green mb-2"></div>
        <span className="text-xs font-semibold text-brand-green">Loading Forest...</span>
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
              <span>Your Virtual Forest 🌳</span>
            </h2>
            <p className="text-xs text-brand-textSecondary dark:text-zinc-400">Every logged eco-action plants a virtual tree offset.</p>
          </div>
          <button
            id="btn-share-forest"
            onClick={() => setShowShareModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 dark:border-brand-darkBorder hover:bg-gray-50 dark:hover:bg-brand-green/10 text-xs font-bold text-brand-textSecondary dark:text-zinc-300 rounded-xl transition-all"
          >
            <Share2 className="w-4 h-4" />
            <span>📸 Share My Forest</span>
          </button>
        </div>

        {/* Forest Scene SVG canvas */}
        <ForestScene trees={treesList} />

        {/* Layout split: nursery statistics vs Action loggers */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Nursery stats */}
          <div className="lg:col-span-1 p-6 bg-white dark:bg-brand-darkCard border border-gray-100 dark:border-brand-darkBorder rounded-2xl shadow-sm space-y-5 transition-colors duration-300">
            <h3 className="text-sm font-bold text-brand-text dark:text-white uppercase tracking-wider border-b border-gray-50 dark:border-brand-darkBorder pb-2.5">
              Nursery Statistics
            </h3>

            <div className="space-y-4">
              {/* Stat 1: Trees count */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-green/10 text-brand-green flex items-center justify-center">
                  <Trees className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-brand-textSecondary block">Total Trees Grown</span>
                  <span className="text-sm font-extrabold text-brand-text dark:text-white">
                    <CountUpNumber end={treesList.length} /> Trees
                  </span>
                </div>
              </div>

              {/* Stat 2: Forest health */}
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-lightGreen/10 text-brand-lightGreen flex items-center justify-center">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-brand-textSecondary block">Forest Health</span>
                    <span className="text-sm font-extrabold text-brand-text dark:text-white">85% Vitality</span>
                  </div>
                </div>
                <div className="w-full h-1.5 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden mt-1.5">
                  <div className="h-full bg-brand-lightGreen rounded-full" style={{ width: '85%' }} />
                </div>
              </div>

              {/* Stat 3: CO2 offset equivalent */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-blue/10 text-brand-blue flex items-center justify-center">
                  <Wind className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-brand-textSecondary block">CO₂ Offset Equivalent</span>
                  <span className="text-sm font-extrabold text-brand-text dark:text-white">
                    <CountUpNumber end={currentUser?.totalCarbonSaved || 0} /> kg CO₂
                  </span>
                </div>
              </div>

              {/* Stat 4: Age */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-550/10 text-brand-orange flex items-center justify-center bg-brand-orange/15">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-brand-textSecondary block">Nursery Age</span>
                  <span className="text-sm font-extrabold text-brand-text dark:text-white">45 days active</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Loggers */}
          <div className="lg:col-span-2 p-6 bg-white dark:bg-brand-darkCard border border-gray-100 dark:border-brand-darkBorder rounded-2xl shadow-sm space-y-4 transition-colors duration-300">
            <div>
              <h3 className="text-sm font-bold text-brand-text dark:text-white uppercase tracking-wider border-b border-gray-50 dark:border-brand-darkBorder pb-2.5">
                Earn trees by taking action
              </h3>
              <p className="text-[10px] text-brand-textSecondary dark:text-zinc-400 mt-1">Select an action to plant a tree and boost your offset totals.</p>
            </div>

            <div className="divide-y divide-gray-100 dark:divide-brand-darkBorder overflow-y-auto max-h-[300px] pr-2">
              {ecoActions.map((act) => {
                const isLoading = loadingActionId === act.id;
                return (
                  <div 
                    key={act.id} 
                    className="py-3 flex items-center justify-between hover:bg-brand-green/5 dark:hover:bg-brand-green/10 px-2 rounded-xl transition-all duration-150"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-brand-darkBg flex items-center justify-center text-lg shadow-inner">
                        {act.emoji}
                      </div>
                      <div>
                        <span className="block text-sm font-semibold text-brand-text dark:text-white">{act.name}</span>
                        <span className="block text-[9px] text-brand-textSecondary dark:text-zinc-500 font-bold uppercase tracking-wider">{act.category}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="bg-brand-green/10 text-brand-green font-extrabold text-[10px] px-2 py-0.5 rounded">
                        +1 🌳
                      </span>
                      <button
                        id={`btn-log-forest-action-${act.id}`}
                        disabled={loadingActionId !== null}
                        onClick={() => handleLogAction(act)}
                        className="flex items-center gap-1 bg-brand-green text-white hover:bg-brand-green/90 px-3 py-1.5 text-xs font-bold rounded-xl transition-colors disabled:opacity-50"
                      >
                        {isLoading ? (
                          <>
                            {/* Simple spin loader */}
                            <svg className="animate-spin -ml-1 mr-1 h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            <span>Planting...</span>
                          </>
                        ) : (
                          <>
                            <ClipboardCheck className="w-3.5 h-3.5" />
                            <span>Log Action</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
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
              <h4 className="text-base font-extrabold text-brand-text dark:text-white">Share Your Virtual Nursery</h4>
              <p className="text-xs text-brand-textSecondary dark:text-zinc-400">
                You currently have {treesList.length} trees growing in your virtual forest, offsetting {currentUser?.totalCarbonSaved || 0} kg CO₂!
              </p>
              
              <div className="bg-gray-50 dark:bg-brand-darkBg p-3 rounded-xl border dark:border-brand-darkBorder text-[10px] font-bold text-brand-green italic">
                "Share coming soon! 🌿 EcoTrack Nursery snapshot captured."
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

export default Forest;
