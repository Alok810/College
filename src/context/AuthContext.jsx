import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUserProfile, getInstituteByRegNumber } from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authData, setAuthData] = useState({});
  const [instituteData, setInstituteData] = useState({});

  // This function will fetch and set all auth data
  const fetchAuthData = async () => {
    try {
      const userResponse = await getUserProfile();
      if (userResponse.success) {
        setIsAuthenticated(true);
        const userData = userResponse.user;
        setAuthData(userData);

        if (userData.userType !== 'Institute' && userData.instituteRegistrationNumber) {
          // CORRECTED: Pass the registration number to the API function
          const instituteResponse = await getInstituteByRegNumber(userData.instituteRegistrationNumber);
          if (instituteResponse.success) {
            setInstituteData(instituteResponse.institute);
          } else {
            console.error("Failed to fetch institute details:", instituteResponse.message);
            setInstituteData({});
          }
        } else if (userData.userType === 'Institute') {
          setInstituteData({
            instituteName: userData.instituteName,
            instituteLogo: userData.logo?.url,
          });
        } else {
          setInstituteData({});
        }
      }
    } catch (error) {
      setIsAuthenticated(false);
      setAuthData({});
      setInstituteData({});
      console.error("Auth check failed:", error);
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