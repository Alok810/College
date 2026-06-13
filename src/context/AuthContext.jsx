/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUserProfile, getInstituteByRegNumber } from '../api';
import rigyaLogo from '../assets/rigya.png'; // 🟢 IMPORT THE LOGO HERE!

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Start these as 'null' instead of '{}' so our lazy-fetch 
  // checks in Chat/Friends know for a fact when the user is logged out.
  const [authData, setAuthData] = useState(null);
  const [instituteData, setInstituteData] = useState(null);

  // This function will fetch and set all auth data
  const fetchAuthData = async () => {
    try {
      const userResponse = await getUserProfile();
      
      // Check if userResponse actually exists! (It will be null if they aren't logged in)
      if (userResponse && userResponse.success) {
        setIsAuthenticated(true);
        const userData = userResponse.user;
        setAuthData(userData);

        if (userData.userType !== 'Institute' && userData.instituteRegistrationNumber) {
          const instituteResponse = await getInstituteByRegNumber(userData.instituteRegistrationNumber);
          if (instituteResponse.success) {
            setInstituteData(instituteResponse.institute);
          } else {
            console.error("Failed to fetch institute details:", instituteResponse.message);
            setInstituteData(null); // Reset to null on failure
          }
        } else if (userData.userType === 'Institute') {
          setInstituteData({
            instituteName: userData.instituteName,
            instituteLogo: userData.logo?.url,
          });
        } else {
          setInstituteData(null);
        }
      } else {
         // If userResponse is null (user is not logged in)
         setIsAuthenticated(false);
         setAuthData(null);
         setInstituteData(null);
      }
    } catch (error) {
      // We will only hit this catch block now if the server actually crashes (e.g. 500 error)
      setIsAuthenticated(false);
      setAuthData(null);      // Explicitly nullify
      setInstituteData(null); // Explicitly nullify
      console.error("Auth check failed (Server error):", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuthData();
  }, []);

  const value = {
    isAuthenticated,
    setIsAuthenticated,
    loading,
    authData,
    instituteData,
    fetchAuthData,
  };

  // 🟢 THE GLOBAL LOADING FIX: This blocks the rest of the app from rendering
  // and completely overrides any generic spinners hiding in other files!
  if (loading) {
    return (
      <div className="h-[100dvh] w-full flex items-center justify-center bg-[#ebf8ff] fixed inset-0 z-[9999]">
        <img 
          src={rigyaLogo} 
          alt="Loading Rigya..." 
          className="w-20 sm:w-28 md:w-32 h-auto animate-pulse drop-shadow-md" 
        />
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};