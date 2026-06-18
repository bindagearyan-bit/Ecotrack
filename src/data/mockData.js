export const mockUser = {
  name: "Arjun Sharma",
  email: "arjun@example.com",
  country: "India",
  avatar: "https://ui-avatars.com/api/?name=Arjun+Sharma&background=2D6A4F&color=fff",
  streakCount: 15,
  longestStreak: 23,
  totalTrees: 47,
  totalCarbonSaved: 235,
  joinedDate: "January 2024"
};

export const mockMonthlyStats = {
  totalCarbon: 145,
  dailyAverage: 4.8,
  treesNeeded: 6.2,
  streakDays: 15,
  percentageChange: -12,
  globalAverage: 800,
  nationalAverage: 450,
  goalTarget: 120,
  goalCurrent: 89,
  daysRemaining: 12
};

export const mockChartData = [
  { month: "Oct", carbon: 210, transport: 90, food: 75, energy: 45 },
  { month: "Nov", carbon: 195, transport: 85, food: 68, energy: 42 },
  { month: "Dec", carbon: 220, transport: 95, food: 82, energy: 43 },
  { month: "Jan", carbon: 180, transport: 78, food: 62, energy: 40 },
  { month: "Feb", carbon: 165, transport: 70, food: 58, energy: 37 },
  { month: "Mar", carbon: 145, transport: 52, food: 45, energy: 48 }
];

export const mockCategorySplit = [
  { name: "Transport", value: 52, color: "#1A759F" },
  { name: "Food", value: 45, color: "#F4A261" },
  { name: "Energy", value: 48, color: "#E63946" }
];

export const mockActivities = [
  { id: 1, icon: "🚗", name: "Drove to Office", category: "Transport", carbon: 2.1, time: "2 hours ago", type: "bad" },
  { id: 2, icon: "🥗", name: "Vegan Lunch", category: "Food", carbon: -0.8, time: "4 hours ago", type: "good" },
  { id: 3, icon: "💡", name: "Saved Electricity", category: "Energy", carbon: -0.3, time: "Yesterday", type: "good" },
  { id: 4, icon: "✈️", name: "Short Flight", category: "Transport", carbon: 45.2, time: "2 days ago", type: "bad" },
  { id: 5, icon: "🚴", name: "Cycled to Market", category: "Transport", carbon: 0, time: "3 days ago", type: "good" },
  { id: 6, icon: "🥩", name: "Red Meat Meal", category: "Food", carbon: 6.6, time: "3 days ago", type: "bad" },
  { id: 7, icon: "🚌", name: "Took the Bus", category: "Transport", carbon: 0.45, time: "4 days ago", type: "good" },
  { id: 8, icon: "♻️", name: "Recycled Waste", category: "Lifestyle", carbon: -0.5, time: "5 days ago", type: "good" }
];

export const mockAIInsights = [
  {
    id: 1,
    title: "Reduce Car Usage",
    description: "You drive 40km daily. Switching to public transport 3 days/week could save you significant emissions.",
    action: "Try bus this Monday",
    impact: "Save 45 kg CO₂/month",
    gradient: "from-green-400 to-emerald-600",
    icon: "🚗"
  },
  {
    id: 2,
    title: "Cut Red Meat",
    description: "Your food carbon is above average. Reducing red meat to 2 days per week makes a big difference.",
    action: "Try vegan Monday",
    impact: "Save 33 kg CO₂/month",
    gradient: "from-orange-400 to-red-500",
    icon: "🥩"
  },
  {
    id: 3,
    title: "Switch to LED Bulbs",
    description: "Your energy usage can be reduced easily with smart lighting choices at home.",
    action: "Replace 5 bulbs today",
    impact: "Save 8 kg CO₂/month",
    gradient: "from-blue-400 to-cyan-600",
    icon: "💡"
  }
];

export const mockGoalHistory = [
  { month: "October", year: 2023, target: 180, actual: 210, achieved: false },
  { month: "November", year: 2023, target: 175, actual: 195, achieved: false },
  { month: "December", year: 2023, target: 200, actual: 220, achieved: false },
  { month: "January", year: 2024, target: 160, actual: 180, achieved: false },
  { month: "February", year: 2024, target: 150, actual: 165, achieved: false },
  { month: "March", year: 2024, target: 120, actual: 89, achieved: true }
];

export const mockNotifications = [
  { id: 1, type: "tip", icon: "🌿", title: "Morning Eco Tip", message: "Planning to drive today? Try carpooling and save 1.2kg CO₂!", time: "2 hours ago", read: false },
  { id: 2, type: "achievement", icon: "🏆", title: "Badge Earned!", message: "You earned the Week Warrior badge! 7 day streak achieved!", time: "Yesterday", read: false },
  { id: 3, type: "warning", icon: "⚠️", title: "Goal Warning", message: "You are at 80% of your monthly carbon goal with 12 days remaining.", time: "2 days ago", read: true },
  { id: 4, type: "report", icon: "📊", title: "Weekly Report Ready", message: "Your week 11 report is ready! Carbon down 15% from last week.", time: "3 days ago", read: true },
  { id: 5, type: "ai", icon: "🤖", title: "New AI Insight", message: "Based on your patterns, switching transport mode could reduce your footprint by 30%.", time: "4 days ago", read: true },
  { id: 6, type: "tip", icon: "🌿", title: "Eco Tip", message: "It is sunny today! Perfect weather for cycling instead of driving.", time: "5 days ago", read: true }
];

export const mockBadges = [
  { id: 1, name: "First Step", icon: "🌱", description: "Logged first action", earned: true, date: "Jan 15, 2024" },
  { id: 2, name: "Week Warrior", icon: "🌿", description: "7 day streak", earned: true, date: "Feb 3, 2024" },
  { id: 3, name: "Forest Starter", icon: "🌳", description: "Planted 10 trees", earned: true, date: "Feb 20, 2024" },
  { id: 4, name: "Carbon Cutter", icon: "✂️", description: "Reduced by 20%", earned: true, date: "Mar 1, 2024" },
  { id: 5, name: "Month Master", icon: "🏆", description: "30 day streak", earned: false, progress: "15/30 days" },
  { id: 6, name: "Eco Legend", icon: "⚡", description: "100 day streak", earned: false, progress: "15/100 days" }
];

export const mockHeatmapData = () => {
  const data = [];
  const today = new Date();
  for (let i = 364; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toISOString().split("T")[0],
      count: Math.floor(Math.random() * 5),
      level: Math.floor(Math.random() * 5)
    });
  }
  return data;
};

export const mockForestTrees = [
  { id: 1, type: "pine", x: 10, size: "large", action: "Cycled to work" },
  { id: 2, type: "oak", x: 20, size: "medium", action: "Vegan meal" },
  { id: 3, type: "pine", x: 32, size: "small", action: "Saved electricity" },
  { id: 4, type: "cherry", x: 45, size: "large", action: "7 day streak!" },
  { id: 5, type: "oak", x: 58, size: "medium", action: "Used public transport" },
  { id: 6, type: "pine", x: 70, size: "large", action: "Recycled waste" },
  { id: 7, type: "oak", x: 82, size: "small", action: "Short shower" },
  { id: 8, type: "cherry", x: 90, size: "medium", action: "Planted real tree!" }
];

export const mockRoutes = {
  origin: "Connaught Place, Delhi",
  destination: "India Gate, Delhi",
  options: [
    { mode: "Walking", icon: "🚶", distance: "3.2 km", time: "38 mins", carbon: 0, label: "ZERO EMISSIONS", color: "green", bgColor: "#F0FDF4", borderColor: "#52B788", barWidth: "0%" },
    { mode: "Cycling", icon: "🚴", distance: "3.2 km", time: "14 mins", carbon: 0, label: "ZERO EMISSIONS", color: "green", bgColor: "#F0FDF4", borderColor: "#52B788", barWidth: "0%" },
    { mode: "Bus", icon: "🚌", distance: "4.1 km", time: "22 mins", carbon: 0.37, label: "LOW CARBON", color: "blue", bgColor: "#EFF6FF", borderColor: "#1A759F", barWidth: "18%" },
    { mode: "Car", icon: "🚗", distance: "3.8 km", time: "12 mins", carbon: 2.1, label: "HIGH CARBON", color: "red", bgColor: "#FFF5F5", borderColor: "#E63946", barWidth: "100%" }
  ]
};

export const mockReportData = {
  month: "March",
  year: 2024,
  grade: "B+",
  totalCarbon: 145,
  transport: { kg: 52, grade: "A" },
  food: { kg: 45, grade: "B" },
  energy: { kg: 48, grade: "C+" },
  vsLastMonth: -23,
  aiSummary: [
    "This month you showed great improvement in your transport habits, reducing car usage by 35% compared to February. Your decision to use public transport 3 times a week saved approximately 28kg of CO₂.",
    "Your food choices still have room for improvement. Red meat consumption on 4 days per week contributes significantly to your food carbon score. Even reducing by 2 days could save an additional 26kg monthly.",
    "For April, focus on your energy usage at home. Setting your AC to 24°C instead of 20°C and switching to LED bulbs could reduce your energy carbon by 40%, pushing your overall grade from B+ to A-."
  ]
};

export const mockTestimonials = [
  { name: "Priya S.", location: "Mumbai, India", quote: "Reduced my carbon by 40% in just 3 months!", saved: "180kg saved", avatar: "PS" },
  { name: "Alex M.", location: "London, UK", quote: "The virtual forest keeps me motivated every day!", saved: "220kg saved", avatar: "AM" },
  { name: "Raj K.", location: "Delhi, India", quote: "Best sustainability app I have ever used.", saved: "95kg saved", avatar: "RK" },
  { name: "Sarah L.", location: "New York, USA", quote: "AI insights are incredibly accurate and helpful!", saved: "310kg saved", avatar: "SL" },
  { name: "Chen W.", location: "Singapore", quote: "Finally understand my environmental impact.", saved: "145kg saved", avatar: "CW" },
  { name: "Fatima A.", location: "Dubai, UAE", quote: "Route planner saved me 2kg CO₂ every day!", saved: "260kg saved", avatar: "FA" }
];
