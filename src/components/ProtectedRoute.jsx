import React, { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Capacitor } from '@capacitor/core';
import { SplashScreen } from '@capacitor/splash-screen';
import rigyaLogo from '../assets/rigya.png';

const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  // 🟢 SEAMLESS SPLASH: Wait for Auth to finish, then hide the native splash screen!
  useEffect(() => {
    if (!loading && Capacitor.isNativePlatform()) {
      SplashScreen.hide().catch(console.error);
    }
  }, [loading]);

  if (loading) {
    return (
      // 🟢 Web View still gets the beautiful breathing logo! 
      // On mobile, the native splash screen completely covers this up so the user never sees it.
      <div className="h-[100dvh] w-full flex items-center justify-center bg-[#ebf8ff]">
        <img 
          src={rigyaLogo} 
          alt="Loading Rigya..." 
          className="w-20 sm:w-28 md:w-32 h-auto animate-pulse drop-shadow-md" 
        />
      </div>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/auth" replace />;
};

export default ProtectedRoute;