import React, { useState, useEffect } from 'react';
import { Sparkles, RotateCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { mockAIInsights } from '../../data/mockData';
import { ListSkeleton } from '../common/SkeletonLoader';

export const TypeWriter = ({ text, delay = 20 }) => {
  const [displayed, setDisplayed] = useState('');

  useEffect(() => {
    let i = 0;
    setDisplayed('');
    const timer = setInterval(() => {
      setDisplayed((prev) => text.slice(0, i));
      i++;
      if (i > text.length) {
        clearInterval(timer);
      }
    }, delay);
    return () => clearInterval(timer);
  }, [text, delay]);

  return <span>{displayed}</span>;
};

const AIInsights = () => {
  const [loading, setLoading] = useState(false);
  const [insightList, setInsightList] = useState(mockAIInsights);

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // Shuffle insights slightly to simulate refresh
      const shuffled = [...mockAIInsights].sort(() => Math.random() - 0.5);
      setInsightList(shuffled);
    }, 1500);
  };

  return (
    <div className="space-y-4">
      {/* Header Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-bold text-brand-text dark:text-brand-darkText">🤖 AI-Powered Insights</h3>
          <span className="bg-brand-green/10 text-brand-green dark:bg-brand-lightGreen/10 dark:text-brand-lightGreen text-[10px] px-2 py-0.5 font-bold rounded-full border border-brand-green/20">
            Powered by Gemini AI
          </span>
        </div>

        <button
          id="btn-refresh-insights"
          disabled={loading}
          onClick={handleRefresh}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-brand-darkBorder hover:bg-gray-50 dark:hover:bg-brand-green/10 text-xs text-brand-textSecondary dark:text-zinc-300 font-bold transition-all disabled:opacity-50"
        >
          <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Loading & Card render logic */}
      {loading ? (
        <ListSkeleton />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {insightList.map((insight, index) => (
            <motion.div
              key={`${insight.id}-${index}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{
                scale: 1.02,
                boxShadow: '0 8px 30px rgba(45, 106, 79, 0.12)'
              }}
              className={`p-6 rounded-2xl bg-gradient-to-br ${insight.gradient} text-white shadow-sm flex flex-col justify-between h-56 card-hover-effect`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl">{insight.icon}</span>
                  <Sparkles className="w-4 h-4 text-white/75" />
                </div>
                <h4 className="font-extrabold text-base mb-1">{insight.title}</h4>
                <p className="text-xs text-white/90 leading-relaxed font-medium">
                  {/* Typewriter animation only for refreshed items or initial */}
                  <TypeWriter text={insight.description} delay={15} />
                </p>
              </div>

              <div className="flex items-center justify-between mt-4 border-t border-white/20 pt-3">
                <span className="text-[11px] font-bold bg-white/25 px-2 py-1 rounded-lg">
                  💚 {insight.impact}
                </span>
                <button
                  id={`btn-insight-action-${insight.id}`}
                  onClick={() => alert(`Demonstration: Initializing action "${insight.action}"`)}
                  className="text-xs font-bold bg-white text-brand-green px-3 py-1.5 rounded-xl shadow-sm hover:bg-brand-bg transition-colors"
                >
                  Take Action →
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AIInsights;
