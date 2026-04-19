import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUserProfile, getInstituteByRegNumber } from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // 🟢 THE FIX: Start these as 'null' instead of '{}' so our lazy-fetch 
  // checks in Chat/Friends know for a fact when the user is logged out.
  const [authData, setAuthData] = useState(null);
  const [instituteData, setInstituteData] = useState(null);

  // This function will fetch and set all auth data
  const fetchAuthData = async () => {
    try {
      const userResponse = await getUserProfile();
      if (userResponse.success) {
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
      }
    } catch (error) {
      // 🟢 Normal expected behavior for logged-out users!
      setIsAuthenticated(false);
      setAuthData(null);      // Explicitly nullify
      setInstituteData(null); // Explicitly nullify
      // We can console.log this, but it's safe to ignore when users are on the login screen.
      console.log("Auth check failed (User is likely logged out):", error.message);
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