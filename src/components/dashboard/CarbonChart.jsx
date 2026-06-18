import React, { useState, useEffect } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { useCarbon } from '../../context/CarbonContext';
import { mockChartData, mockCategorySplit } from '../../data/mockData';
import { getChartData as fetchChartData, getCategorySplit as fetchCategorySplit } from '../../lib/database';

const CarbonChart = ({ chartDataList: propChartData, categorySplitList: propCategorySplit }) => {
  const [range, setRange] = useState('Month'); // Week | Month | Year
  const [activeIndex, setActiveIndex] = useState(null);
  const [chartDataList, setChartDataList] = useState([]);
  const [categorySplitList, setCategorySplitList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (propChartData && propChartData.length > 0) {
      setChartDataList(propChartData);
    }
    if (propCategorySplit && propCategorySplit.length > 0) {
      setCategorySplitList(propCategorySplit);
    }
    
    if (propChartData && propChartData.length > 0 && propCategorySplit && propCategorySplit.length > 0) {
      setLoading(false);
      return;
    }

    const loadChartData = async () => {
      try {
        const cData = await fetchChartData();
        const split = await fetchCategorySplit();
        if (!propChartData || propChartData.length === 0) {
          setChartDataList(cData);
        }
        if (!propCategorySplit || propCategorySplit.length === 0) {
          setCategorySplitList(split);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadChartData();
  }, [propChartData, propCategorySplit]);

  // Generate range datasets dynamically
  const getChartData = () => {
    if (range === 'Week') {
      return [
        { month: "Mon", carbon: 4.8, transport: 1.2, food: 1.8, energy: 1.8 },
        { month: "Tue", carbon: 5.2, transport: 2.1, food: 1.5, energy: 1.6 },
        { month: "Wed", carbon: 3.5, transport: 0.5, food: 1.2, energy: 1.8 },
        { month: "Thu", carbon: 6.1, transport: 3.0, food: 1.3, energy: 1.8 },
        { month: "Fri", carbon: 4.2, transport: 1.0, food: 1.6, energy: 1.6 },
        { month: "Sat", carbon: 2.8, transport: 0.2, food: 0.8, energy: 1.8 },
        { month: "Sun", carbon: 3.1, transport: 0.0, food: 1.3, energy: 1.8 }
      ];
    }
    if (range === 'Year') {
      return [
        { month: "Apr 23", carbon: 240, transport: 110, food: 80, energy: 50 },
        { month: "Jun 23", carbon: 220, transport: 100, food: 75, energy: 45 },
        { month: "Aug 23", carbon: 230, transport: 105, food: 80, energy: 45 },
        { month: "Oct", carbon: 210, transport: 90, food: 75, energy: 45 },
        { month: "Nov", carbon: 195, transport: 85, food: 68, energy: 42 },
        { month: "Dec", carbon: 220, transport: 95, food: 82, energy: 43 },
        { month: "Jan", carbon: 180, transport: 78, food: 62, energy: 40 },
        { month: "Feb", carbon: 165, transport: 70, food: 58, energy: 37 },
        { month: "Mar", carbon: 145, transport: 52, food: 45, energy: 48 }
      ];
    }
    return chartDataList.length > 0 ? chartDataList : mockChartData; // Month
  };

  const getDisplayCategorySplit = () => {
    const hasData = categorySplitList.some(item => item.value > 0);
    return hasData ? categorySplitList : mockCategorySplit;
  };

  const handlePieClick = (_, index) => {
    setActiveIndex(index === activeIndex ? null : index);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Area Chart: Carbon Trend */}
      <div className="lg:col-span-2 p-6 bg-white dark:bg-brand-darkCard rounded-2xl border border-gray-100 dark:border-brand-darkBorder shadow-sm flex flex-col justify-between transition-all duration-300">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-brand-text dark:text-brand-darkText">Carbon Trend 📈</h3>
            <p className="text-xs text-brand-textSecondary dark:text-zinc-400">Your total emissions trend over time</p>
          </div>
          
          {/* Time range pills */}
          <div className="flex bg-gray-100 dark:bg-brand-darkBorder p-1 rounded-xl">
            {['Week', 'Month', 'Year'].map(t => (
              <button
                key={t}
                onClick={() => setRange(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                  range === t 
                    ? 'bg-white dark:bg-brand-green text-brand-green dark:text-white shadow-sm' 
                    : 'text-brand-textSecondary dark:text-zinc-400 hover:text-brand-text dark:hover:text-brand-darkText'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Recharts Area Chart */}
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={getChartData()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCarbon" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#52B788" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#52B788" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="month" 
                stroke="#6B7280" 
                fontSize={11} 
                tickLine={false} 
                axisLine={false} 
              />
              <YAxis 
                stroke="#6B7280" 
                fontSize={11} 
                tickLine={false} 
                axisLine={false} 
                unit={range === 'Week' ? 'kg' : 'kg'} 
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  color: '#1A1A2E'
                }}
                labelClassName="font-bold text-xs"
              />
              <Area 
                type="monotone" 
                dataKey="carbon" 
                name="Total CO2 (kg)"
                stroke="#52B788" 
                strokeWidth={2.5} 
                fillOpacity={1} 
                fill="url(#colorCarbon)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pie Chart: Sources Donut */}
      <div className="p-6 bg-white dark:bg-brand-darkCard rounded-2xl border border-gray-100 dark:border-brand-darkBorder shadow-sm flex flex-col justify-between transition-all duration-300">
        <div>
          <h3 className="text-lg font-bold text-brand-text dark:text-brand-darkText">Carbon Sources 🍩</h3>
          <p className="text-xs text-brand-textSecondary dark:text-zinc-400">Emission split by categories this month</p>
        </div>

        {/* Donut Chart */}
        <div className="h-56 relative flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={getDisplayCategorySplit()}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
                onClick={handlePieClick}
              >
                {getDisplayCategorySplit().map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color} 
                    stroke={activeIndex === index ? '#2D6A4F' : 'transparent'}
                    strokeWidth={activeIndex === index ? 3 : 0}
                    style={{ outline: 'none', cursor: 'pointer' }}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [`${value} kg`, 'CO2 Offset']}
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                  border: 'none', 
                  borderRadius: '12px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)' 
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          
          {/* Donut Center Display */}
          <div className="absolute text-center flex flex-col items-center pointer-events-none">
            {activeIndex !== null ? (
              <>
                <span className="text-xs text-brand-textSecondary dark:text-zinc-400 font-semibold">
                  {getDisplayCategorySplit()[activeIndex].name}
                </span>
                <span className="text-lg font-extrabold text-brand-text dark:text-brand-darkText">
                  {getDisplayCategorySplit()[activeIndex].value} kg
                </span>
              </>
            ) : (
              <>
                <span className="text-xs text-brand-textSecondary dark:text-zinc-400 font-semibold">Total</span>
                <span className="text-xl font-black text-brand-text dark:text-brand-darkText">
                  {getDisplayCategorySplit().reduce((sum, item) => sum + item.value, 0).toFixed(1)} kg
                </span>
              </>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="flex justify-center gap-4 text-xs font-semibold mt-2">
          {getDisplayCategorySplit().map((item, index) => (
            <div 
              key={item.name} 
              onClick={() => handlePieClick(null, index)}
              className={`flex items-center gap-1.5 cursor-pointer px-2 py-1 rounded-lg transition-colors ${
                activeIndex === index ? 'bg-gray-100 dark:bg-brand-darkBorder' : ''
              }`}
            >
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-brand-textSecondary dark:text-zinc-300">{item.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CarbonChart;
