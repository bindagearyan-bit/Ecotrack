import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import supabase from '../lib/supabase';
import { ListSkeleton } from './common/SkeletonLoader';

const ProtectedRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    let authSubscription;

    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const isLocalDemo = localStorage.getItem('ecotrack_demo_session') === 'true';
        setAuthenticated(!!session || isLocalDemo);
      } catch (err) {
        const isLocalDemo = localStorage.getItem('ecotrack_demo_session') === 'true';
        setAuthenticated(isLocalDemo);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const isLocalDemo = localStorage.getItem('ecotrack_demo_session') === 'true';
      setAuthenticated(!!session || isLocalDemo);
      setLoading(false);
    });
    authSubscription = subscription;

    return () => {
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center p-8 bg-gray-50 dark:bg-brand-darkBg transition-colors duration-300">
        <div className="w-full max-w-md space-y-4">
          <div className="flex items-center gap-3 justify-center mb-6">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-green"></div>
            <span className="font-extrabold text-xl text-brand-green dark:text-brand-lightGreen animate-pulse">EcoTrack</span>
          </div>
          <ListSkeleton />
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return <Navigate to="/auth" replace />;
  }

  return children;
};

export default ProtectedRoute;
