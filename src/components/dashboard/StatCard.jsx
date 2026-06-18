import React, { useEffect, useRef } from 'react';
import { CountUp } from 'countup.js';
import { motion } from 'framer-motion';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

export const CountUpNumber = ({ end, decimals = 0, suffix = '', prefix = '' }) => {
  const elRef = useRef(null);

  useEffect(() => {
    if (elRef.current) {
      const c = new CountUp(elRef.current, end, {
        duration: 2.0,
        decimalPlaces: decimals,
        suffix: suffix,
        prefix: prefix
      });
      if (!c.error) {
        c.start();
      }
    }
  }, [end, decimals, suffix, prefix]);

  return <span ref={elRef}>0</span>;
};

const StatCard = ({ title, value, decimals = 0, suffix = '', icon: Icon, colorClass, type, trend, subtext, progress }) => {
  const sparkData = [
    { value: 120 },
    { value: 135 },
    { value: 128 },
    { value: 140 },
    { value: 145 }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{
        scale: 1.02,
        boxShadow: "0 8px 30px rgba(45, 106, 79, 0.12)"
      }}
      whileTap={{ scale: 0.98 }}
      className="p-6 bg-white dark:bg-brand-darkCard rounded-2xl border border-gray-100 dark:border-brand-darkBorder shadow-sm flex flex-col justify-between h-full relative overflow-hidden transition-all duration-300 card-hover-effect"
    >
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-semibold text-brand-textSecondary dark:text-zinc-400 uppercase tracking-wider block mb-1">
            {title}
          </span>
          <h3 className="text-2xl font-extrabold text-brand-text dark:text-brand-darkText">
            <CountUpNumber end={value} decimals={decimals} suffix={suffix} />
          </h3>
        </div>
        
        {/* Icon wrapper */}
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClass}`}>
          {Icon && <Icon className="w-6 h-6" />}
        </div>
      </div>

      {/* Dynamic Sub-elements */}
      <div className="mt-4">
        {type === 'carbon' && (
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-brand-green dark:text-brand-lightGreen">
              {trend}
            </span>
            <div className="w-24 h-8">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sparkData}>
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#52B788"
                    fill="rgba(82, 183, 136, 0.1)"
                    strokeWidth={1.5}
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {type === 'average' && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-brand-textSecondary dark:text-zinc-400">
              <span>{subtext}</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full h-1.5 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full bg-brand-green dark:bg-brand-lightGreen rounded-full"
              />
            </div>
          </div>
        )}

        {type === 'trees' && (
          <p className="text-xs font-medium text-brand-textSecondary dark:text-zinc-400">
            {subtext}
          </p>
        )}

        {type === 'streak' && (
          <div className="flex items-center gap-2">
            {/* Animated CSS SVG Flame */}
            <svg className="w-5 h-5 flame-particle" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M17.657 16.657L13.414 20.9M9.172 16.657L13.414 20.9M12 3C12 3 17 8 17 12C17 14.7614 14.7614 17 12 17C9.23858 17 7 14.7614 7 12C7 8 12 3 12 3Z"
                stroke="#F4A261"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="#F4A261"
              />
              <path
                d="M12 9C12 9 14.5 12 14.5 14C14.5 15.3807 13.3807 16.5 12 16.5C10.6193 16.5 9.5 15.3807 9.5 14C9.5 12 12 9 12 9Z"
                fill="#E63946"
              />
            </svg>
            <span className="text-xs text-brand-textSecondary dark:text-zinc-400 font-medium">
              {subtext}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default StatCard;
