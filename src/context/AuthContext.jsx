/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUserProfile, getInstituteByRegNumber } from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // 🟢 Start these as 'null' instead of '{}' so our lazy-fetch 
  // checks in Chat/Friends know for a fact when the user is logged out.
  const [authData, setAuthData] = useState(null);
  const [instituteData, setInstituteData] = useState(null);

  // This function will fetch and set all auth data
  const fetchAuthData = async () => {
    try {
      const userResponse = await getUserProfile();
      
      // 🟢 THE FIX: Check if userResponse actually exists! (It will be null if they aren't logged in)
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

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};