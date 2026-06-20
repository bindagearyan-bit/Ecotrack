import React, { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';
import { CarbonProvider } from './context/CarbonContext';
import Sidebar from './components/common/Sidebar';
import Navbar from './components/common/Navbar';
import CustomCursor from './components/common/CustomCursor';
import { updateStreakOnLogin } from './lib/streakManager';

import ProtectedRoute from './components/ProtectedRoute';

// Lazy-loaded Pages for optimization
const Landing = lazy(() => import('./pages/Landing'));
const Auth = lazy(() => import('./pages/Auth'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Calculator = lazy(() => import('./pages/Calculator'));
const Forest = lazy(() => import('./pages/Forest'));
const Streaks = lazy(() => import('./pages/Streaks'));
const Notifications = lazy(() => import('./pages/Notifications'));
const ReportCard = lazy(() => import('./pages/ReportCard'));
const RoutePlanner = lazy(() => import('./pages/RoutePlanner'));

const LazyFallback = () => (
  <div className="min-h-screen flex flex-col justify-center items-center app-gradient">
    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-green mb-2"></div>
    <span className="text-xs font-semibold text-brand-green">Loading...</span>
  </div>
);

// General Layout Wrapper for internal app views (hides sidebar/navbar on Landing & Auth)
const AppLayout = () => {
  const location = useLocation();

  useEffect(() => {
    const checkAndUpdateStreak = async () => {
      try {
        await updateStreakOnLogin();
      } catch (err) {
        console.error("Failed to update streak on page load:", err);
      }
    };
    checkAndUpdateStreak();
  }, []);

  return (
    <div className="flex app-gradient min-h-screen text-brand-text dark:text-brand-darkText transition-colors duration-300">
      {/* Fixed Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 pl-[240px] flex flex-col min-h-screen">
        {/* Sticky Header Navbar */}
        <Navbar />

        {/* Dynamic page container */}
        <main className="p-8 flex-1 overflow-x-hidden">
          {/* Framer motion key triggers PageTransition animations */}
          <AnimatePresence mode="wait">
            <Outlet key={location.pathname} />
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <CarbonProvider>
      <CustomCursor />
      <Router>
        <Suspense fallback={<LazyFallback />}>
          <Routes>
            {/* External standalone pages */}
            <Route path="/" element={<ProtectedRoute><Landing /></ProtectedRoute>} />
            <Route path="/auth" element={<Auth />} />

            {/* Internal application layouts */}
            <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/calculator" element={<Calculator />} />
              <Route path="/forest" element={<Forest />} />
              <Route path="/streaks" element={<Streaks />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/report" element={<ReportCard />} />
              <Route path="/routes" element={<RoutePlanner />} />
            </Route>
          </Routes>
        </Suspense>
      </Router>

      {/* Toast Notification Mount */}
      <Toaster 
        position="top-right" 
        toastOptions={{ 
          duration: 4000,
          style: {
            fontFamily: 'Inter, sans-serif',
            fontSize: '13px',
            fontWeight: '600',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
          }
        }} 
      />
    </CarbonProvider>
  );
};

export default App;

