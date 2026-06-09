import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { subscribeToOSNotifications } from "../../utils/pushNotifications";
import { GoogleLogin } from "@react-oauth/google";
import { api } from "../../api";

import EyeIcon from "../../assets/eye.png";
import HiddenIcon from "../../assets/hidden.png";

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

  return (
    // Added slight adjustments for spacing on mobile vs tablet
    <div className="flex flex-col gap-4 sm:gap-5 mt-2 w-full max-w-md mx-auto px-2 sm:px-0">
      
      {/* Email Field */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">
          Email Address
        </label>
        <input
          name="email"
          type="email"
          value={formData.email}
          placeholder="e.g., student@institute.edu"
          onChange={handleChange}
          // Adjusted padding slightly for mobile, kept standard for sm+
          className="w-full px-3 py-2 sm:px-4 sm:py-2.5 bg-gray-50/50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-inset focus:ring-purple-500 focus:border-purple-500 transition-all outline-none text-gray-800 shadow-sm text-sm sm:text-base"
          required
        />
      </div>

      {/* Password Field */}
      <div>
        <div className="flex justify-between items-center mb-1.5 ml-1">
          <label className="block text-sm font-semibold text-gray-700">
            Password
          </label>
          <p 
            className="text-xs sm:text-sm font-semibold text-purple-600 cursor-pointer hover:text-purple-800 transition-colors" 
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
            className="w-full px-3 py-2 sm:px-4 sm:py-2.5 bg-gray-50/50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-inset focus:ring-purple-500 focus:border-purple-500 transition-all outline-none text-gray-800 pr-10 sm:pr-12 text-sm sm:text-base"
            required
          />
          <div 
            className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 p-1.5 cursor-pointer hover:bg-gray-200 rounded-full transition-colors"
            onClick={() => setShowPassword(!showPassword)}
          >
            <img
              src={showPassword ? HiddenIcon : EyeIcon}
              alt="toggle password visibility"
              className="w-4 h-4 sm:w-5 sm:h-5 opacity-60"
            />
          </div>
        </div>
      </div>

      {/* Security Captcha Box */}
      <div className="bg-gradient-to-br from-purple-50 to-indigo-50/50 p-3 sm:p-3.5 rounded-xl border border-purple-100 shadow-sm w-full">
        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2 ml-1">
          Security Check: Solve <span className="font-bold text-base sm:text-lg text-purple-700 ml-1 drop-shadow-sm">{mathQuestion.question}</span>
        </label>
        <div className="flex gap-2">
          <input
            name="captcha"
            value={formData.captcha}
            placeholder="Enter answer"
            onChange={handleChange}
            className="flex-1 px-3 py-2 sm:px-4 bg-white border border-purple-200 rounded-lg focus:ring-2 focus:ring-inset focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-gray-800 font-medium shadow-inner text-sm sm:text-base"
            required
          />
          <button
            type="button"
            onClick={generateNewCaptcha}
            className="px-3 sm:px-4 bg-white border border-indigo-200 text-indigo-600 rounded-lg hover:bg-indigo-50 hover:border-indigo-300 transition-colors shadow-sm font-bold text-base sm:text-lg flex items-center justify-center flex-shrink-0"
            title="Get a new question"
          >
            ↻
          </button>
        </div>
      </div>

      {/* Submit Button */}
      <button 
        type="submit" 
        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-sm sm:text-[15px] py-2.5 sm:py-3 rounded-xl shadow-md hover:shadow-lg hover:from-purple-700 hover:to-indigo-700 active:scale-[0.98] transition-all mt-1 sm:mt-2"
      >
        SIGN IN
      </button>

      {/* Modern Divider */}
      <div className="relative flex items-center mt-2 sm:mt-3 mb-1 sm:mb-2">
        <div className="flex-grow border-t border-gray-200"></div>
        <span className="flex-shrink-0 mx-3 sm:mx-4 text-[10px] sm:text-xs font-semibold tracking-wider text-gray-400 uppercase">
          or continue with
        </span>
        <div className="flex-grow border-t border-gray-200"></div>
      </div>

{/* 🟢 OFFICIAL GOOGLE BUTTON */}
      <div className="flex justify-center w-full mt-1 mb-1">
        {/* 👇 Added max-w-full and overflow-hidden to clamp the iframe on mobile */}
        <div className="w-full sm:w-auto flex justify-center max-w-full overflow-hidden">
          <GoogleLogin
            onSuccess={async (credentialResponse) => {
              try {
                const { data } = await api.post("/auth/google-login", { token: credentialResponse.credential });

                if (data.success) {
                  await fetchAuthData();
                  setIsAuthenticated(true);
                  subscribeToOSNotifications();
                  navigate("/");
                }
              } catch (error) {
                console.error("Google Login Error:", error);
                alert(error.response?.data?.message || "Account not found. Please register manually first.");
              }
            }}
            onError={() => {
              alert("Google Login popup was closed or failed.");
            }}
            useOneTap={true} 
            theme="outline"
            size="large"
            shape="rectangular"
            // Set width to 100% to fill the clamped container
            width="100%" 
          />
        </div>
      </div>

    </div>
  );
}