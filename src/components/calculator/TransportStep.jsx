import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Car, 
  Bus, 
  Train, 
  Plane, 
  Bike, 
  Footprints, 
  Check, 
  Plus, 
  Trash2 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';

const TransportStep = ({ trips, setTrips, onNext }) => {
  const [activeCelebrate, setActiveCelebrate] = useState(false);

  const transportModes = [
    { name: 'Car', icon: Car, desc: 'Personal vehicle' },
    { name: 'Bus', icon: Bus, desc: 'Public bus transit' },
    { name: 'Train', icon: Train, desc: 'Metro or regional rail' },
    { name: 'Flight', icon: Plane, desc: 'Commercial flights' },
    { name: 'Cycling', icon: Bike, desc: 'Pedal bicycle', eco: true },
    { name: 'Walking', icon: Footprints, desc: 'By foot', eco: true }
  ];

  const handleSelectMode = (index, modeObj) => {
    const updated = [...trips];
    updated[index] = {
      ...updated[index],
      mode: modeObj.name,
      distance: 0,
      fuel: modeObj.name === 'Car' ? 'Petrol' : '',
      flightType: modeObj.name === 'Flight' ? 'Short' : '',
      flightsNum: modeObj.name === 'Flight' ? 1 : 0
    };
    setTrips(updated);

    if (modeObj.eco) {
      setActiveCelebrate(true);
      confetti({
        particleCount: 80,
        spread: 60,
        colors: ['#2D6A4F', '#52B788', '#1A759F']
      });
      setTimeout(() => setActiveCelebrate(false), 4000);
    }
  };

  const updateTripValue = (index, field, value) => {
    const updated = [...trips];
    updated[index] = { ...updated[index], [field]: value };
    setTrips(updated);
  };

  const addTrip = () => {
    setTrips([...trips, { mode: 'Car', distance: 50, fuel: 'Petrol', flightType: '', flightsNum: 0 }]);
  };

  const removeTrip = (index) => {
    if (trips.length === 1) return; // Keep at least one
    const updated = trips.filter((_, i) => i !== index);
    setTrips(updated);
  };

  // Calculate quick carbon preview
  const getCarbonValue = (trip) => {
    const distance = parseFloat(trip.distance) || 0;
    if (trip.mode === 'Car') {
      const fuelFactor = trip.fuel === 'Diesel' ? 0.22 : trip.fuel === 'Electric' ? 0.05 : 0.20;
      return parseFloat((distance * fuelFactor).toFixed(1));
    }
    if (trip.mode === 'Bus') return parseFloat((distance * 0.09).toFixed(1));
    if (trip.mode === 'Train') return parseFloat((distance * 0.04).toFixed(1));
    if (trip.mode === 'Flight') {
      const count = parseInt(trip.flightsNum) || 0;
      return count * (trip.flightType === 'Long' ? 600 : 150);
    }
    return 0; // Cycling, Walking
  };

  const totalTransportCarbon = trips.reduce((sum, t) => sum + getCarbonValue(t), 0);

  // Recharts preview data
  const chartData = trips.map((t, idx) => ({
    name: `${t.mode} #${idx + 1}`,
    carbon: getCarbonValue(t),
    color: t.mode === 'Car' || t.mode === 'Flight' ? '#E63946' : t.mode === 'Bus' || t.mode === 'Train' ? '#1A759F' : '#52B788'
  }));

  return (
    <div className="space-y-6">
      <div className="text-center max-w-md mx-auto mb-6">
        <h3 className="text-lg font-bold text-brand-text dark:text-brand-darkText">How did you get around this week?</h3>
        <p className="text-xs text-brand-textSecondary dark:text-zinc-400">Log your weekly travel trips to estimate carbon emissions.</p>
      </div>

      {/* Hero Eco Banner */}
      {activeCelebrate && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="p-4 bg-green-50 dark:bg-emerald-950/20 border border-brand-lightGreen rounded-xl text-center"
        >
          <span className="text-sm font-bold text-brand-green dark:text-brand-lightGreen block">
            Zero emissions! You are a hero! 🌱
          </span>
          <span className="text-xs text-brand-textSecondary dark:text-zinc-400">Your choice prevents air pollution and preserves our climate.</span>
        </motion.div>
      )}

      {/* Trips list */}
      <div className="space-y-6">
        {trips.map((trip, idx) => (
          <div 
            key={idx} 
            className="p-6 bg-white dark:bg-brand-darkCard border border-gray-100 dark:border-brand-darkBorder rounded-2xl shadow-sm relative space-y-4"
          >
            {/* Remove button */}
            {trips.length > 1 && (
              <button
                type="button"
                onClick={() => removeTrip(idx)}
                className="absolute top-4 right-4 text-gray-400 hover:text-brand-red p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition-all"
              >
                <Trash2 className="w-4.5 h-4.5" />
              </button>
            )}

            <span className="text-xs font-bold text-brand-green uppercase tracking-wider block">Trip #{idx + 1}</span>

            {/* Mode selection Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
              {transportModes.map((mode) => {
                const Icon = mode.icon;
                const isSelected = trip.mode === mode.name;
                return (
                  <button
                    key={mode.name}
                    type="button"
                    onClick={() => handleSelectMode(idx, mode)}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center gap-2 transition-all ${
                      isSelected
                        ? 'border-brand-green bg-brand-green/5 dark:border-brand-lightGreen dark:bg-brand-green/10 text-brand-green dark:text-brand-lightGreen'
                        : 'border-gray-200 dark:border-brand-darkBorder bg-white dark:bg-brand-darkCard hover:bg-gray-50 dark:hover:bg-brand-green/5 text-brand-textSecondary dark:text-zinc-400'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-xs font-extrabold">{mode.name}</span>
                    {isSelected && (
                      <span className="w-4 h-4 bg-brand-green dark:bg-brand-lightGreen rounded-full flex items-center justify-center text-white text-[10px]">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Sub fields depending on selection */}
            <div className="pt-2">
              {trip.mode === 'Car' && (
                <div className="space-y-4">
                  {/* Fuel Toggle */}
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold text-brand-textSecondary dark:text-zinc-400 block">Fuel Type</span>
                    <div className="flex gap-2">
                      {['Petrol', 'Diesel', 'Electric'].map(f => (
                        <button
                          key={f}
                          type="button"
                          onClick={() => updateTripValue(idx, 'fuel', f)}
                          className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                            trip.fuel === f
                              ? 'bg-brand-green text-white border-brand-green shadow-sm'
                              : 'bg-white dark:bg-brand-darkBg text-brand-textSecondary border-gray-200 dark:border-brand-darkBorder dark:text-zinc-400'
                          }`}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Distance Slider */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-bold text-brand-textSecondary dark:text-zinc-300">
                      <span>Distance Driven</span>
                      <span className="text-brand-green dark:text-brand-lightGreen">{trip.distance} km</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="500"
                      value={trip.distance}
                      onChange={(e) => updateTripValue(idx, 'distance', parseInt(e.target.value))}
                      className="w-full accent-brand-green bg-gray-100 dark:bg-zinc-800 rounded-lg h-1.5 appearance-none"
                    />
                  </div>
                </div>
              )}

              {(trip.mode === 'Bus' || trip.mode === 'Train') && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs font-bold text-brand-textSecondary dark:text-zinc-300">
                    <span>Distance Traveled</span>
                    <span className="text-brand-green dark:text-brand-lightGreen">{trip.distance} km</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="500"
                    value={trip.distance}
                    onChange={(e) => updateTripValue(idx, 'distance', parseInt(e.target.value))}
                    className="w-full accent-brand-green bg-gray-100 dark:bg-zinc-800 rounded-lg h-1.5 appearance-none"
                  />
                </div>
              )}

              {trip.mode === 'Flight' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Flight Distance Toggle */}
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold text-brand-textSecondary dark:text-zinc-400 block">Flight Length</span>
                    <div className="flex gap-2">
                      {['Short', 'Long'].map(fl => (
                        <button
                          key={fl}
                          type="button"
                          onClick={() => updateTripValue(idx, 'flightType', fl)}
                          className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${
                            trip.flightType === fl
                              ? 'bg-brand-green text-white border-brand-green'
                              : 'bg-white dark:bg-brand-darkBg text-brand-textSecondary border-gray-200 dark:border-brand-darkBorder dark:text-zinc-400'
                          }`}
                        >
                          {fl} ({fl === 'Short' ? '< 3 hours' : '> 3 hours'})
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Flight number */}
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold text-brand-textSecondary dark:text-zinc-400 block">Number of Flights</span>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={trip.flightsNum}
                      onChange={(e) => updateTripValue(idx, 'flightsNum', parseInt(e.target.value) || 0)}
                      className="w-full bg-gray-50 dark:bg-brand-darkBg border border-gray-200 dark:border-brand-darkBorder rounded-xl px-4 py-2 text-sm text-brand-text dark:text-brand-darkText focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {(trip.mode === 'Cycling' || trip.mode === 'Walking') && (
                <div className="text-center py-2 text-xs text-brand-textSecondary dark:text-zinc-400 font-bold">
                  Zero carbon emissions! Safe and healthy travel mode. 🌱
                </div>
              )}
            </div>

          </div>
        ))}
      </div>

      {/* Add trip button */}
      <button
        type="button"
        onClick={addTrip}
        className="w-full py-3 border-2 border-dashed border-gray-300 dark:border-brand-darkBorder hover:border-brand-green rounded-xl flex items-center justify-center gap-2 text-xs font-bold text-brand-textSecondary dark:text-zinc-400 hover:text-brand-green transition-all"
      >
        <Plus className="w-4 h-4" />
        <span>+ Add another trip</span>
      </button>

      {/* Live Preview Card */}
      <div className="p-6 bg-white dark:bg-brand-darkCard border border-gray-100 dark:border-brand-darkBorder rounded-2xl shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <div>
          <span className="text-xs font-bold text-brand-textSecondary dark:text-zinc-400 block">Estimated Transport Carbon</span>
          <h4 className="text-2xl font-black text-brand-green dark:text-brand-lightGreen mt-1">
            {totalTransportCarbon} kg CO₂
          </h4>
          <p className="text-[10px] text-brand-textSecondary dark:text-zinc-400 mt-1">Based on active carbon footprint coefficients.</p>
        </div>

        {/* Small horizontal Recharts bar */}
        <div className="h-24 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ left: -10, right: 10, top: 0, bottom: 0 }}>
              <XAxis type="number" fontSize={9} stroke="#888" tickLine={false} axisLine={false} />
              <YAxis dataKey="name" type="category" fontSize={9} stroke="#888" width={60} tickLine={false} axisLine={false} />
              <Bar dataKey="carbon" radius={[0, 4, 4, 0]} barSize={8}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex justify-end pt-4">
        <button
          type="button"
          onClick={onNext}
          className="px-6 py-3 bg-brand-green text-white hover:bg-brand-green/90 font-extrabold rounded-xl shadow-md transition-colors"
        >
          Next: Food →
        </button>
      </div>

    </div>
  );
};

export default TransportStep;
