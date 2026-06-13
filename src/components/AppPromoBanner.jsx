import React, { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import rigyaLogo from '../assets/rigya.png';
import { BACKEND_URL } from '../api'; // 🟢 IMPORTING YOUR MASTER URL LOGIC

const AppPromoBanner = () => {
  // 🟢 Effortlessly uses your existing environment detector!
  const apkDownloadUrl = `${BACKEND_URL}/Rigya.apk`;
  
  const [showBanner, setShowBanner] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [hasInstalled, setHasInstalled] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);

    if (localStorage.getItem('rigya_app_installed') === 'true') {
      setHasInstalled(true);
    }

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (Capacitor.isNativePlatform()) return null;
  if (!showBanner) return null;

  const handleSkip = () => {
    setShowBanner(false);
  };

  const handleActionClick = () => {
    localStorage.setItem('rigya_app_installed', 'true');
    setHasInstalled(true);
  };

  const actionLink = (hasInstalled && isMobile)
    ? `intent://#Intent;action=android.intent.action.MAIN;category=android.intent.category.LAUNCHER;package=com.rigya.app;S.browser_fallback_url=${encodeURIComponent(apkDownloadUrl)};end;` 
    : apkDownloadUrl;

  return (
    <div className="relative w-full sm:w-[320px] mx-auto rounded-lg p-[2px] overflow-hidden shadow-md">
      
      <div className="absolute top-1/2 left-1/2 aspect-square w-[200%] -translate-x-1/2 -translate-y-1/2 animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,transparent_50%,#8b5cf6_100%)]"></div>

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
            target={(hasInstalled && isMobile) ? "_self" : "_blank"} 
            rel="noopener noreferrer"
            onClick={handleActionClick} 
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold py-1.5 px-3 rounded-md transition-all shadow-md active:scale-95 whitespace-nowrap relative z-10"
          >
            {(hasInstalled && isMobile) ? "Open" : "Install"}
          </a>

        </div>
      </div>
    </div>
  );
};

export default AppPromoBanner;