import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
// Make sure this path points correctly to your rigya logo!
import rigyaLogo from '../assets/rigya.png';

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Show the custom install UI
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    // Show the native install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    }
    
    // Clear the deferred prompt and hide UI
    setDeferredPrompt(null);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 z-[9999] animate-in fade-in slide-in-from-bottom-5 duration-500 md:max-w-sm md:left-auto md:right-6">
      <div className="bg-white/90 backdrop-blur-xl border border-white shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-[2rem] p-5 flex items-center gap-4">
        <div className="bg-white p-2 rounded-2xl shadow-sm flex-shrink-0">
          <img src={rigyaLogo} alt="Rigya" className="w-10 h-10 object-contain" />
        </div>
        
        <div className="flex-1 overflow-hidden">
          <h3 className="font-extrabold text-gray-900 text-sm">Install Rigya App</h3>
          <p className="text-[11px] text-gray-500 font-medium truncate">Get a better campus experience</p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={handleInstallClick}
            className="bg-gray-900 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md active:scale-95 transition-all flex items-center gap-1.5"
          >
            <Download size={14} /> Install
          </button>
          
          <button 
            onClick={() => setIsVisible(false)}
            className="text-gray-400 p-1 hover:bg-gray-100 rounded-full"
          >
            <X size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstallPrompt;