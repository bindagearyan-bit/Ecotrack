import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FoodStep = ({ foodDays, setFoodDays, onBack, onNext }) => {
  const [factIndex, setFactIndex] = useState(0);

  const facts = [
    "🐄 One beef burger = driving 15km in a standard petrol car",
    "🌱 Adopting a vegan diet cuts food carbon emissions by up to 73%",
    "🐟 Fish production has 10x less CO₂ footprint than beef",
    "🥛 Dairy production contributes significantly due to livestock methane emissions"
  ];

  // Rotate facts every 5s
  useEffect(() => {
    const interval = setInterval(() => {
      setFactIndex((prev) => (prev + 1) % facts.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const updateFoodDay = (key, val) => {
    setFoodDays({ ...foodDays, [key]: val });
  };

  // Live Carbon calculation
  const getCarbonValue = (key, days) => {
    const factors = {
      redMeat: 6.61,
      poultry: 2.15,
      fish: 1.45,
      dairy: 1.80,
      vegan: 0.40
    };
    return parseFloat((days * (factors[key] || 0)).toFixed(1));
  };

  const foodItems = [
    { key: 'redMeat', label: 'Red Meat', emoji: '🥩', desc: 'Beef, pork, mutton', color: 'red', coef: 6.61 },
    { key: 'poultry', label: 'Poultry', emoji: '🍗', desc: 'Chicken, turkey', color: 'orange', coef: 2.15 },
    { key: 'fish', label: 'Fish', emoji: '🐟', desc: 'Seafood and freshwater fish', color: 'yellow', coef: 1.45 },
    { key: 'dairy', label: 'Dairy products', emoji: '🥛', desc: 'Milk, cheese, butter, yogurt', color: 'orange', coef: 1.80 },
    { key: 'vegan', label: 'Vegan/Vegetables', emoji: '🥗', desc: 'Plants, legumes, grains, fruits', color: 'green', coef: 0.40, positiveNote: "Great choice! 🌱" }
  ];

  const totalFoodCarbon = Object.keys(foodDays).reduce(
    (sum, key) => sum + getCarbonValue(key, foodDays[key]),
    0
  );

  return (
    <div className="space-y-6">
      <div className="text-center max-w-md mx-auto mb-6">
        <h3 className="text-lg font-bold text-brand-text dark:text-brand-darkText">What did you eat this week?</h3>
        <p className="text-xs text-brand-textSecondary dark:text-zinc-400">Estimate food emissions based on consumption days.</p>
      </div>

      {/* Rotating Fun Fact Box */}
      <div className="bg-brand-blue/5 dark:bg-brand-blue/10 border border-brand-blue/20 rounded-2xl p-5 relative overflow-hidden h-20 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={factIndex}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
            className="text-xs font-bold text-brand-blue text-center leading-relaxed max-w-lg"
          >
            {facts[factIndex]}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Food Sliders list */}
      <div className="space-y-4">
        {foodItems.map((item) => {
          const days = foodDays[item.key] || 0;
          const carbon = getCarbonValue(item.key, days);
          
          let colorLabelClass = 'text-brand-red';
          if (item.color === 'orange') colorLabelClass = 'text-brand-orange';
          if (item.color === 'yellow') colorLabelClass = 'text-yellow-600 dark:text-yellow-500';
          if (item.color === 'green') colorLabelClass = 'text-brand-green dark:text-brand-lightGreen';

          return (
            <div 
              key={item.key} 
              className="p-5 bg-white dark:bg-brand-darkCard border border-gray-100 dark:border-brand-darkBorder rounded-2xl shadow-sm space-y-3 transition-colors duration-300"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{item.emoji}</span>
                  <div>
                    <span className="block text-sm font-extrabold text-brand-text dark:text-white">{item.label}</span>
                    <span className="block text-[10px] text-brand-textSecondary dark:text-zinc-400">{item.desc}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`text-xs font-extrabold ${colorLabelClass}`}>
                    {days} days × {item.coef} = {carbon} kg
                  </span>
                  {item.positiveNote && days > 3 && (
                    <span className="block text-[9px] font-black text-brand-green dark:text-brand-lightGreen mt-0.5">
                      {item.positiveNote}
                    </span>
                  )}
                </div>
              </div>

              {/* Slider bar */}
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="0"
                  max="7"
                  value={days}
                  aria-label={`Days eating ${item.label} per week`}
                  onChange={(e) => updateFoodDay(item.key, parseInt(e.target.value))}
                  className="w-full accent-brand-green bg-gray-100 dark:bg-zinc-800 rounded-lg h-1.5 appearance-none"
                />
                <span className="text-xs font-bold text-brand-textSecondary dark:text-zinc-300 w-12 text-right">
                  {days} {days === 1 ? 'day' : 'days'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Food Live Preview Card */}
      <div className="p-5 bg-white dark:bg-brand-darkCard border border-gray-100 dark:border-brand-darkBorder rounded-2xl shadow-sm text-center transition-colors duration-300">
        <span className="text-xs font-semibold text-brand-textSecondary dark:text-zinc-400">Estimated Food Carbon</span>
        <h4 className="text-2xl font-black text-brand-green dark:text-brand-lightGreen mt-1">
          {totalFoodCarbon.toFixed(1)} kg CO₂ <span className="text-xs text-brand-textSecondary font-semibold">this week</span>
        </h4>
      </div>

      {/* Buttons footer */}
      <div className="flex justify-between pt-4">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-3 border border-gray-200 dark:border-brand-darkBorder hover:bg-gray-50 dark:hover:bg-brand-green/10 text-xs font-bold rounded-xl text-brand-textSecondary dark:text-zinc-300 transition-colors"
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={onNext}
          className="px-6 py-3 bg-brand-green text-white hover:bg-brand-green/90 font-extrabold rounded-xl shadow-md transition-colors"
        >
          Next: Energy →
        </button>
      </div>

    </div>
  );
};

export default FoodStep;
