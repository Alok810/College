/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUserProfile, getInstituteByRegNumber } from '../api';
import rigyaLogo from '../assets/rigya.png'; 
import { App as CapacitorApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { SplashScreen } from '@capacitor/splash-screen'; // 🟢 ADDED: Import Splash Screen here!

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [authData, setAuthData] = useState(null);
  const [instituteData, setInstituteData] = useState(null);

  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [downloadLink, setDownloadLink] = useState("");

  const fetchAuthData = async () => {
    try {
      const userResponse = await getUserProfile();
      
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
            setInstituteData(null); 
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
         setIsAuthenticated(false);
         setAuthData(null);
         setInstituteData(null);
      }
    } catch (error) {
      setIsAuthenticated(false);
      setAuthData(null);      
      setInstituteData(null); 
      console.error("Auth check failed (Server error):", error.message);
    }
    // Note: We removed finally { setLoading(false) } from here so we can control it better in the init block!
  };

  useEffect(() => {
    const initializeApp = async () => {
      let needsUpdate = false;

      // 🟢 1. Check for updates first
      if (Capacitor.isNativePlatform()) {
        try {
          const appInfo = await CapacitorApp.getInfo();
          const response = await fetch('https://api.rigya.in/api/v1/config/latest-version');
          const data = await response.json();

          if (data.success && data.latestVersion !== appInfo.version) {
            setDownloadLink(data.downloadUrl);
            setUpdateAvailable(true);
            needsUpdate = true;
          }
        } catch (error) {
          console.error("Failed to check for updates:", error);
        }
      }

      // 🟢 2. Only fetch auth data if NO update is required
      if (!needsUpdate) {
        await fetchAuthData();
      }

      // 🟢 3. Everything is loaded (either the app or the update screen). Turn off the loading UI!
      setLoading(false);

      // 🟢 4. Drop the native Android Splash Screen seamlessly!
      if (Capacitor.isNativePlatform()) {
        SplashScreen.hide().catch(console.error);
      }
    };

    initializeApp();
  }, []);

  const value = {
    isAuthenticated,
    setIsAuthenticated,
    loading,
    authData,
    instituteData,
    fetchAuthData,
  };

  // ==========================================
  // RENDER INTERCEPTORS
  // ==========================================

  if (updateAvailable) {
    return (
      <div className="h-[100dvh] w-full flex items-center justify-center bg-indigo-950/90 fixed inset-0 z-[99999] px-6">
        <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center">
            <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🚀</span>
            </div>
            <h2 className="text-xl font-black text-slate-800 mb-2">Update Available!</h2>
            <p className="text-sm text-slate-600 mb-6 font-medium">
                A newer, faster version of Rigya is ready. Please update to continue!
            </p>
            <a 
                href={downloadLink}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md active:scale-95"
            >
                Download New Version
            </a>
        </div>
      </div>
    );
  }

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