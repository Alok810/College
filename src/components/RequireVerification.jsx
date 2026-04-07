// src/components/RequireVerification.jsx
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Lock } from 'lucide-react';

const RequireVerification = ({ children }) => {
  const { authData, loading } = useAuth();

  if (loading) return null;

  // Check roles and verification status
  const isOfficial = authData?.userType === "Institute" || authData?.role === "admin" || authData?.role === "superadmin";
  const isVerified = authData?.isVerifiedByInstitute === true;

  // If they are a student and NOT verified, show the lock screen
  if (!isOfficial && !isVerified) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] w-full p-6 animate-in fade-in duration-300">
        <div className="bg-white p-8 sm:p-10 rounded-[2rem] border border-slate-200 shadow-sm max-w-md text-center flex flex-col items-center">
           <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mb-6 border-4 border-amber-100">
             <Lock className="w-10 h-10 text-amber-500" />
           </div>
           <h1 className="text-xl sm:text-2xl font-black text-slate-900 mb-2">Account Pending</h1>
           <p className="text-slate-500 font-medium text-sm">
             Your account is currently waiting for verification from the Institute Administration. You will gain access to this feature once approved.
           </p>
        </div>
      </div>
    );
  }

  // If they ARE verified (or an official), render the actual page content
  return children;
};

export default RequireVerification;