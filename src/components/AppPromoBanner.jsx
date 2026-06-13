import React, { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import rigyaLogo from '../assets/rigya.png';

const AppPromoBanner = () => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";
  const apkDownloadUrl = `${backendUrl}/Rigya.apk`;
  
  // 1. Starts as TRUE every time the component loads (shows after every refresh!)
  const [showBanner, setShowBanner] = useState(true);
  
  // 2. Track if the user is on a mobile screen
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  // 3. Track if they have previously clicked the "Install" button
  const [hasInstalled, setHasInstalled] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);

    // Check browser memory to see if they clicked Install in the past
    if (localStorage.getItem('rigya_app_installed') === 'true') {
      setHasInstalled(true);
    }

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // NEVER show this banner if they are actively using the compiled Capacitor Native App
  if (Capacitor.isNativePlatform()) return null;

  // Hide if they clicked Skip during THIS specific browsing session
  if (!showBanner) return null;

  const handleSkip = () => {
    // We only update React state. No local storage! 
    // This guarantees it resets and comes back on the next page refresh.
    setShowBanner(false);
  };

  const handleActionClick = () => {
    // When they click Install, save that fact to their browser memory permanently
    localStorage.setItem('rigya_app_installed', 'true');
    setHasInstalled(true);
  };

  // 🟢 THE SMART LINK LOGIC (Fully Updated Intent)
  // We use strict MAIN and LAUNCHER intent actions so Chrome doesn't panic and default to the Play Store.
  const actionLink = (hasInstalled && isMobile)
    ? `intent://#Intent;action=android.intent.action.MAIN;category=android.intent.category.LAUNCHER;package=com.rigya.app;S.browser_fallback_url=${encodeURIComponent(apkDownloadUrl)};end;` 
    : apkDownloadUrl;

  return (
    // 🟢 OUTER WRAPPER: Handles the rounded corners, overflow, and the 2px "border" padding
    <div className="relative w-full sm:w-[320px] mx-auto rounded-lg p-[2px] overflow-hidden shadow-md">
      
      {/* 🟢 THE TRAVELING COLOR BEAM: A spinning conic-gradient trailing fading purple */}
      <div className="absolute top-1/2 left-1/2 aspect-square w-[200%] -translate-x-1/2 -translate-y-1/2 animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,transparent_50%,#8b5cf6_100%)]"></div>

      {/* 🟢 INNER CARD: Sits on top of the spinner, keeping your original background and styling */}
      <div className="relative bg-gradient-to-r from-indigo-50 to-purple-50 rounded-[6px] p-2.5 flex items-center justify-between w-full h-full">
        
        <div className="flex items-center gap-2.5">
          <img 
            src={rigyaLogo} 
            alt="Rigya" 
            className="w-8 h-8 rounded-md drop-shadow-sm bg-white p-1 relative z-10" 
          />
          <div>
            <p className="text-[13px] font-bold text-slate-800 leading-tight relative z-10">Get the Rigya App</p>
            <p className="text-[10px] text-slate-500 font-medium mt-0.5 relative z-10">Faster, smoother, native.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          
          {/* 🟢 CONDITIONAL SKIP BUTTON: Only renders if the screen is mobile-sized */}
          {isMobile && (
            <button 
              onClick={handleSkip} 
              className="text-slate-400 hover:text-slate-600 text-[11px] font-semibold active:scale-95 transition-transform relative z-10"
            >
              Skip
            </button>
          )}

          <a
            href={actionLink}
            // If it is an intent link, open in same tab to trigger Android system. Otherwise, new tab.
            target={(hasInstalled && isMobile) ? "_self" : "_blank"} 
            rel="noopener noreferrer"
            onClick={handleActionClick} 
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold py-1.5 px-3 rounded-md transition-all shadow-md active:scale-95 whitespace-nowrap relative z-10"
          >
            {/* 🟢 CONDITIONAL TEXT: Shows "Open" if installed on mobile, otherwise "Install" */}
            {(hasInstalled && isMobile) ? "Open" : "Install"}
          </a>

        </div>
      </div>
    </div>
  );
};

export default AppPromoBanner;