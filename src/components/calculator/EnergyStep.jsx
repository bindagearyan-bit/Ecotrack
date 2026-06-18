import React from 'react';
import { Sparkles } from 'lucide-react';

const EnergyStep = ({
  energyInputs,
  setEnergyInputs,
  onBack,
  onCalculate
}) => {
  const sources = [
    { name: 'Grid Power', desc: 'Standard utility grid', factor: 0.6 },
    { name: 'Solar Energy', desc: 'Rooftop PV solar panels', factor: 0.08 },
    { name: 'Wind Energy', desc: 'Turbine wind contracts', factor: 0.04 },
    { name: 'Mixed Sources', desc: 'Combined utility grid & solar', factor: 0.3 }
  ];

  const appliancesList = [
    { name: 'Washing Machine', carbon: 2.1 },
    { name: 'Dishwasher', carbon: 1.8 },
    { name: 'EV Charger', carbon: 8.4 },
    { name: 'Desktop Computer', carbon: 3.2 },
    { name: 'Gaming Console', carbon: 2.6 }
  ];

  const updateField = (field, val) => {
    setEnergyInputs({ ...energyInputs, [field]: val });
  };

  const toggleAppliance = (name) => {
    const active = [...energyInputs.appliances];
    if (active.includes(name)) {
      updateField('appliances', active.filter(a => a !== name));
    } else {
      updateField('appliances', [...active, name]);
    }
  };

  // Quick live carbon math
  const getEnergyCarbon = () => {
    const billVal = parseFloat(energyInputs.bill) || 0;
    const usd = energyInputs.currency === '₹' ? billVal / 80 : billVal;
    
    const sourceObj = sources.find(s => s.name === energyInputs.source) || sources[0];
    const sourceFactor = sourceObj.factor;
    
    let total = (usd * sourceFactor) / (energyInputs.householdSize || 1);
    
    // AC heating (hours * 0.4kg * 30 days)
    total += energyInputs.acHours * 0.4 * 30;
    
    // Appliances
    energyInputs.appliances.forEach(app => {
      const match = appliancesList.find(a => a.name === app);
      if (match) {
        total += match.carbon;
      }
    });

    return parseFloat(total.toFixed(1));
  };

  const liveEnergyCarbon = getEnergyCarbon();

  return (
    <div className="space-y-6">
      <div className="text-center max-w-md mx-auto mb-6">
        <h3 className="text-lg font-bold text-brand-text dark:text-brand-darkText">Tell us about your home energy</h3>
        <p className="text-xs text-brand-textSecondary dark:text-zinc-400">Home heating and utilities contribute up to 35% of total carbon footprint.</p>
      </div>

      {/* Row 1: Bill Input & Currency */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-5 bg-white dark:bg-brand-darkCard border border-gray-100 dark:border-brand-darkBorder rounded-2xl shadow-sm space-y-3">
          <label className="text-xs font-bold text-brand-textSecondary dark:text-zinc-400 block">Monthly Electricity Bill</label>
          <div className="flex gap-2 items-center">
            {/* Currency toggle */}
            <div className="flex bg-gray-100 dark:bg-brand-darkBorder p-1 rounded-xl">
              {['$', '₹'].map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => updateField('currency', c)}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                    energyInputs.currency === c
                      ? 'bg-white dark:bg-brand-green text-brand-green dark:text-white shadow-sm'
                      : 'text-brand-textSecondary dark:text-zinc-400'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            {/* Input field */}
            <input
              type="number"
              min="0"
              value={energyInputs.bill}
              onChange={(e) => updateField('bill', parseInt(e.target.value) || 0)}
              className="flex-1 bg-gray-50 dark:bg-brand-darkBg border border-gray-200 dark:border-brand-darkBorder rounded-xl px-4 py-2.5 text-sm text-brand-text dark:text-brand-darkText focus:outline-none"
            />
          </div>
        </div>

        {/* Household Size */}
        <div className="p-5 bg-white dark:bg-brand-darkCard border border-gray-100 dark:border-brand-darkBorder rounded-2xl shadow-sm space-y-3">
          <label className="text-xs font-bold text-brand-textSecondary dark:text-zinc-400 block">People in Household</label>
          <div className="flex justify-between gap-1 bg-gray-50 dark:bg-brand-darkBg p-1.5 rounded-xl border border-gray-200 dark:border-brand-darkBorder">
            {[1, 2, 3, 4, 5, 6].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => updateField('householdSize', num)}
                className={`flex-1 py-2 text-xs font-extrabold rounded-lg transition-all ${
                  energyInputs.householdSize === num
                    ? 'bg-brand-green text-white shadow-sm'
                    : 'text-brand-textSecondary hover:bg-gray-100 dark:hover:bg-brand-green/10 dark:text-zinc-400'
                }`}
              >
                {num === 6 ? '6+' : num}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2: Grid sources card radios */}
      <div className="space-y-3">
        <label className="text-xs font-bold text-brand-textSecondary dark:text-zinc-400 block">Home Energy Source</label>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {sources.map(src => {
            const isSelected = energyInputs.source === src.name;
            return (
              <button
                key={src.name}
                type="button"
                onClick={() => updateField('source', src.name)}
                className={`p-4 rounded-xl border text-left flex flex-col justify-between h-24 transition-all ${
                  isSelected
                    ? 'border-brand-green bg-brand-green/5 dark:border-brand-lightGreen dark:bg-brand-green/10 text-brand-green dark:text-brand-lightGreen'
                    : 'border-gray-200 dark:border-brand-darkBorder bg-white dark:bg-brand-darkCard hover:bg-gray-50 dark:hover:bg-brand-green/5 text-brand-textSecondary dark:text-zinc-400'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-extrabold text-brand-text dark:text-white truncate block">{src.name}</span>
                  {isSelected && <span className="w-2 h-2 rounded-full bg-brand-green dark:bg-brand-lightGreen" />}
                </div>
                <p className="text-[9px] text-brand-textSecondary dark:text-zinc-400 leading-tight">
                  {src.desc}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Row 3: AC/Heating Hours slider */}
      <div className="p-5 bg-white dark:bg-brand-darkCard border border-gray-100 dark:border-brand-darkBorder rounded-2xl shadow-sm space-y-3 transition-colors duration-300">
        <div className="flex justify-between items-center text-xs font-bold text-brand-textSecondary dark:text-zinc-300">
          <span>Daily AC / Heating usage</span>
          <span className="text-brand-green dark:text-brand-lightGreen">{energyInputs.acHours} hours/day</span>
        </div>
        <input
          type="range"
          min="0"
          max="24"
          value={energyInputs.acHours}
          onChange={(e) => updateField('acHours', parseInt(e.target.value))}
          className="w-full accent-brand-green bg-gray-100 dark:bg-zinc-800 rounded-lg h-1.5 appearance-none"
        />
      </div>

      {/* Row 4: Appliances Checklist */}
      <div className="p-5 bg-white dark:bg-brand-darkCard border border-gray-100 dark:border-brand-darkBorder rounded-2xl shadow-sm space-y-3 transition-colors duration-300">
        <span className="text-xs font-bold text-brand-textSecondary dark:text-zinc-400 block">Check active heavy appliances</span>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {appliancesList.map(app => {
            const isChecked = energyInputs.appliances.includes(app.name);
            return (
              <label
                key={app.name}
                className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                  isChecked
                    ? 'border-brand-green bg-brand-green/5 text-brand-green dark:border-brand-lightGreen dark:bg-brand-green/10 dark:text-brand-lightGreen'
                    : 'border-gray-200 dark:border-brand-darkBorder bg-white dark:bg-brand-darkCard hover:bg-gray-50 text-brand-textSecondary dark:text-zinc-400'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleAppliance(app.name)}
                  className="rounded border-gray-300 accent-brand-green"
                />
                <span>{app.name} <span className="text-[10px] font-normal text-brand-textSecondary dark:text-zinc-500">+{app.carbon}kg</span></span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Energy Live Preview Card */}
      <div className="p-5 bg-white dark:bg-brand-darkCard border border-gray-100 dark:border-brand-darkBorder rounded-2xl shadow-sm text-center transition-colors duration-300">
        <span className="text-xs font-semibold text-brand-textSecondary dark:text-zinc-400">Estimated Energy Carbon</span>
        <h4 className="text-2xl font-black text-brand-green dark:text-brand-lightGreen mt-1">
          {liveEnergyCarbon} kg CO₂ <span className="text-xs text-brand-textSecondary font-semibold">this month</span>
        </h4>
      </div>

      {/* Buttons */}
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
          onClick={onCalculate}
          className="flex items-center gap-2 px-6 py-3 bg-brand-green text-white hover:bg-brand-green/90 font-extrabold rounded-xl shadow-md transition-colors"
        >
          <Sparkles className="w-4 h-4" />
          <span>Calculate Results →</span>
        </button>
      </div>

    </div>
  );
};

export default EnergyStep;
