import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import rigyaLogo from '../assets/rigya.png'; // 🟢 Make sure this path correctly points to your assets folder!

const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      // 🟢 Full-screen, perfectly centered loading screen matching your app's background color
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