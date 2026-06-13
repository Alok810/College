import React, { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import rigyaLogo from '../assets/rigya.png';

const AppPromoBanner = () => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const isWeb = !Capacitor.isNativePlatform();
    // Re-add the !hasDismissed check if you removed it for testing!
    const hasDismissed = localStorage.getItem('rigya_promo_dismissed');

    if (isWeb && !hasDismissed) {
      setShowBanner(true);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem('rigya_promo_dismissed', 'true');
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="w-full sm:w-[320px] bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-lg p-2.5 flex items-center justify-between shadow-sm mx-auto">
      <div className="flex items-center gap-2.5">
        <img 
          src={rigyaLogo} 
          alt="Rigya" 
          className="w-8 h-8 rounded-md drop-shadow-sm bg-white p-1" 
        />
        <div>
          <p className="text-[13px] font-bold text-slate-800 leading-tight">Get the Rigya App</p>
          <p className="text-[10px] text-slate-500 font-medium mt-0.5">Faster, smoother, native.</p>
        </div>
      </div>
      
      <div className="flex items-center">
        <a
          // 🟢 DIRECT DOWNLOAD LINK INJECTED HERE
          href="https://drive.google.com/uc?export=download&id=14nrlaMlMmcYYb7c8YdBpCWqX5xD42LF_"
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleDismiss} 
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold py-1.5 px-3 rounded-md transition-all shadow-md active:scale-95 whitespace-nowrap"
        >
          Install
        </a>
      </div>
    </div>
  );
};

export default AppPromoBanner;