import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { subscribeToOSNotifications } from "../../utils/pushNotifications";
import { useGoogleLogin } from "@react-oauth/google"; 
import { api } from "../../api";
import { Capacitor } from '@capacitor/core';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth'; 

import EyeIcon from "../../assets/eye.png";
import HiddenIcon from "../../assets/hidden.png";
import AppPromoBanner from "../../components/AppPromoBanner";

export default function LoginForm({
  formData,
  handleChange,
  showPassword,
  setShowPassword,
  mathQuestion,
  generateNewCaptcha,
  setShowForgotPassword,
  resetForm
}) {
  const navigate = useNavigate();
  const { setIsAuthenticated, fetchAuthData } = useAuth();
  
  const isNativeApp = Capacitor.isNativePlatform();

  useEffect(() => {
    if (isNativeApp) {
      GoogleAuth.initialize({
        clientId: '762569744606-vjfc9pmmipo6naord6f3aqotscfobfti.apps.googleusercontent.com', 
        scopes: ['profile', 'email'],
        grantOfflineAccess: true,
      });
    }
  }, [isNativeApp]);

  const handleNativeGoogleLogin = async () => {
    try {
      try {
        await GoogleAuth.signOut();
      } catch (signOutError) {}

      const googleUser = await GoogleAuth.signIn();

      const { data } = await api.post("/auth/google-login", { 
        token: googleUser.authentication.idToken 
      });

      if (data.success) {
        localStorage.setItem("token", data.token);
        await fetchAuthData();
        setIsAuthenticated(true);
        subscribeToOSNotifications();
        navigate("/");
      }
    } catch (error) {
      console.error("Native Google Login Error:", error);
      const errorMessage = String(error.message || error).toLowerCase();
      if (!errorMessage.includes('canceled') && error.type !== 'user_cancelled') {
        alert("Google Sign-In failed. Please try again.");
      }
    }
  };

  const handleWebGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const { data } = await api.post("/auth/google-login", { 
          token: tokenResponse.access_token 
        });

        if (data.success) {
          localStorage.setItem("token", data.token);
          await fetchAuthData();
          setIsAuthenticated(true);
          subscribeToOSNotifications();
          navigate("/");
        }
      } catch (error) {
        console.error("Web Google Login Error:", error);
        alert(error.response?.data?.message || "Account not found. Please register manually first.");
      }
    },
    onError: () => {
      alert("Google Login popup was closed or failed.");
    }
  });

  return (
    <div className="flex flex-col gap-4 md:gap-3 w-full max-w-md mx-auto px-2 sm:px-0 mt-2 md:mt-0">
      
      {/* Email Field */}
      <div>
        <label className="block text-[15px] md:text-sm font-semibold text-gray-700 mb-1.5 md:mb-1 ml-1">
          Email Address
        </label>
        <input
          name="email"
          type="email"
          value={formData.email}
          placeholder="alok@gmail.com"
          onChange={handleChange}
          autoComplete="email"
          className="w-full px-3 py-3 md:py-2 bg-gray-50/50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-inset focus:ring-purple-500 focus:border-purple-500 transition-all outline-none text-gray-800 shadow-sm text-sm sm:text-base md:text-sm"
          required
        />
      </div>

      {/* Password Field */}
      <div>
        <div className="flex justify-between items-center mb-1.5 md:mb-1 ml-1">
          <label className="block text-[15px] md:text-sm font-semibold text-gray-700">
            Password
          </label>
          <p 
            className="text-xs md:text-[14px] font-semibold text-purple-600 cursor-pointer hover:text-purple-800 transition-colors" 
            onClick={() => { setShowForgotPassword(true); resetForm(); }}
          >
            Forgot Password?
          </p>
        </div>
        <div className="relative shadow-sm rounded-xl">
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            placeholder="••••••••"
            onChange={handleChange}
            autoComplete="current-password"
            className="w-full px-3 py-3 md:py-2 bg-gray-50/50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-inset focus:ring-purple-500 focus:border-purple-500 transition-all outline-none text-gray-800 pr-10 text-sm sm:text-base md:text-sm"
            required
          />
          <div 
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 cursor-pointer hover:bg-gray-200 rounded-full transition-colors"
            onClick={() => setShowPassword(!showPassword)}
          >
            <img
              src={showPassword ? HiddenIcon : EyeIcon}
              alt="toggle password visibility"
              className="w-5 h-5 md:w-4 md:h-4 opacity-60"
            />
          </div>
        </div>
      </div>

      {/* Security Captcha Box */}
      <div className="bg-gradient-to-br from-purple-50 to-indigo-50/50 p-3.5 md:p-2.5 rounded-xl border border-purple-100 shadow-sm w-full">
        <label className="block text-sm md:text-xs font-medium text-gray-700 mb-2 md:mb-1.5 ml-1">
          Security Check: Solve <span className="font-bold text-lg md:text-base text-purple-700 ml-1 drop-shadow-sm">{mathQuestion.question}</span>
        </label>
        <div className="flex gap-2">
          <input
            name="captcha"
            value={formData.captcha}
            placeholder="Enter answer"
            onChange={handleChange}
            className="flex-1 px-3 py-2 md:py-1.5 bg-white border border-purple-200 rounded-lg focus:ring-2 focus:ring-inset focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-gray-800 font-medium shadow-inner text-sm"
            required
          />
          <button
            type="button"
            onClick={generateNewCaptcha}
            className="px-4 md:px-3 bg-white border border-indigo-200 text-indigo-600 rounded-lg hover:bg-indigo-50 hover:border-indigo-300 transition-colors shadow-sm font-bold text-lg md:text-base flex items-center justify-center flex-shrink-0"
            title="Get a new question"
          >
            ↻
          </button>
        </div>
      </div>

      {/* Submit Button */}
      <button 
        type="submit" 
        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-[15px] md:text-sm py-3 md:py-2 rounded-xl shadow-md hover:shadow-lg hover:from-purple-700 hover:to-indigo-700 active:scale-[0.98] transition-all"
      >
        SIGN IN
      </button>

      {/* Modern Divider */}
      <div className="relative flex items-center my-3 md:my-1.5">
        <div className="flex-grow border-t border-gray-200"></div>
        <span className="flex-shrink-0 mx-4 md:mx-3 text-xs md:text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
          or continue with
        </span>
        <div className="flex-grow border-t border-gray-200"></div>
      </div>

      {/* 🟢 NEW: Grouped Google Button and App Promo Banner inside a stacked flex column */}
      <div className="flex flex-col items-center gap-3 w-full">
        <button
          type="button"
          onClick={isNativeApp ? handleNativeGoogleLogin : handleWebGoogleLogin}
          // 🟢 FIXED: Size increased back to py-2.5 and text-base. Added sm:w-[320px] to match banner.
          className="w-full sm:w-[320px] flex items-center justify-center bg-white border border-gray-300 text-gray-700 font-medium py-2.5 px-6 rounded-lg shadow-sm hover:bg-gray-50 hover:shadow-md hover:-translate-y-0.5 active:bg-gray-100 active:translate-y-0 active:shadow-sm transition-all duration-200 text-base"
        >
          {/* 🟢 FIXED: SVG size increased back to w-5 h-5 */}
          <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Sign in with Google
        </button>

        <AppPromoBanner />
      </div>

    </div>
  );
}