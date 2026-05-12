import React, { useState, useEffect } from "react";
import { 
  User, Lock, Bell, Shield, Palette, ChevronRight, 
  LogOut, HelpCircle, FileText 
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { updateUserSettings } from "../api";
import axios from "axios"; 
import PushNotificationModal from "../components/PushNotificationModal"; // 🟢 Import the Modal!

// Reusable Toggle Switch Component
const ToggleSwitch = ({ checked, onChange }) => (
  <label className="relative inline-flex items-center cursor-pointer">
    <input type="checkbox" className="sr-only peer" checked={checked} onChange={onChange} />
    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
  </label>
);

export default function Settings() {
  const { authData } = useAuth(); 
  const [message, setMessage] = useState("");
  const [showPushModal, setShowPushModal] = useState(false); // 🟢 State for the modal
  
  const [settings, setSettings] = useState({
    publicProfile: true,
    publicResults: true,
    emailNotifications: false,
    pushNotifications: false, // Default to false until we check the browser
    darkMode: false,
  });

  // Helper to check if the browser is ACTUALLY subscribed right now
  const checkPushSubscription = async () => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      const register = await navigator.serviceWorker.getRegistration();
      if (register && register.pushManager) {
        const subscription = await register.pushManager.getSubscription();
        // If subscription exists, set to true. Otherwise false.
        setSettings(prev => ({ ...prev, pushNotifications: !!subscription }));
      }
    }
  };

  // Load database settings AND check OS Push status on mount
  useEffect(() => {
    if (authData) {
      setSettings(prev => ({
        ...prev,
        publicResults: authData.isResultsPublic !== false 
      }));
    }
    // 🟢 Check real push status when page loads
    checkPushSubscription();
  }, [authData]);

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  // Handle toggles
  const handleToggle = async (key) => {
    const newValue = !settings[key];

    // 🟢 SPECIAL LOGIC FOR PUSH NOTIFICATIONS
    if (key === 'pushNotifications') {
      if (newValue) {
        // They want to turn it ON -> Show the Modal
        setShowPushModal(true);
      } else {
        // They want to turn it OFF -> Unsubscribe silently
        try {
          const register = await navigator.serviceWorker.getRegistration();
          if (register && register.pushManager) {
            const subscription = await register.pushManager.getSubscription();
            if (subscription) {
              await axios.post(
                'http://localhost:4000/api/v1/push/unsubscribe', 
                { endpoint: subscription.endpoint },
                { withCredentials: true }
              );
              await subscription.unsubscribe();
            }
          }
          setSettings(prev => ({ ...prev, pushNotifications: false }));
          showMessage("Desktop alerts disabled for this device.");
        } catch (error) {
          console.error("Error unsubscribing:", error);
          showMessage("Failed to disable notifications.");
        }
      }
      return; // Stop here so it doesn't run the standard toggle code below
    }
    
    // STANDARD LOGIC FOR OTHER TOGGLES
    setSettings(prev => ({ ...prev, [key]: newValue }));

    if (key === 'publicResults') {
      try {
        await updateUserSettings({ publicResults: newValue });
        showMessage("Privacy settings successfully updated!");
      } catch  {
        setSettings(prev => ({ ...prev, [key]: !newValue }));
        showMessage("Error: Failed to save setting.");
      }
    }
  };

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar h-full w-full relative">
      
      {/* Success Popup Toast */}
      {message && (
        <div className="fixed top-20 sm:top-8 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-2xl shadow-lg bg-gray-900 text-white font-bold text-sm animate-in slide-in-from-top-4 fade-in">
          {message}
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 pb-24">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Settings</h1>
          <p className="text-gray-500 font-medium mt-1">Manage your account preferences and privacy.</p>
        </div>

        <div className="space-y-6">
          
          {/* --- ACCOUNT SECTION --- */}
          <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3 bg-gray-50/50">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-extrabold text-gray-800">Account</h2>
            </div>
            
            <div className="divide-y divide-gray-50">
              <button className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors group">
                <div className="text-left">
                  <p className="font-bold text-gray-900">Personal Information</p>
                  <p className="text-xs text-gray-500 mt-0.5">Update your email and phone number</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-600 transition-colors" />
              </button>
              
              <button className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors group">
                <div className="text-left">
                  <p className="font-bold text-gray-900">Change Password</p>
                  <p className="text-xs text-gray-500 mt-0.5">Ensure your account stays secure</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-600 transition-colors" />
              </button>
            </div>
          </div>

          {/* --- PRIVACY SECTION --- */}
          <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3 bg-gray-50/50">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Shield className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-extrabold text-gray-800">Privacy</h2>
            </div>
            
            <div className="divide-y divide-gray-50">
              <div className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="font-bold text-gray-900">Public Profile</p>
                  <p className="text-xs text-gray-500 mt-0.5">Allow other students to find you</p>
                </div>
                <ToggleSwitch checked={settings.publicProfile} onChange={() => handleToggle('publicProfile')} />
              </div>
              
              <div className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="font-bold text-gray-900">Share Academic Results</p>
                  <p className="text-xs text-gray-500 mt-0.5">Allow friends to view your Mark Sheets</p>
                </div>
                <ToggleSwitch checked={settings.publicResults} onChange={() => handleToggle('publicResults')} />
              </div>
            </div>
          </div>

          {/* --- NOTIFICATIONS SECTION --- */}
          <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3 bg-gray-50/50">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Bell className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-extrabold text-gray-800">Notifications</h2>
            </div>
            
            <div className="divide-y divide-gray-50">
              <div className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="font-bold text-gray-900">Push Notifications</p>
                  <p className="text-xs text-gray-500 mt-0.5">Get notified about messages and results</p>
                </div>
                {/* THIS TOGGLE IS NOW FULLY WIRED UP! */}
                <ToggleSwitch checked={settings.pushNotifications} onChange={() => handleToggle('pushNotifications')} />
              </div>
              
              <div className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="font-bold text-gray-900">Email Alerts</p>
                  <p className="text-xs text-gray-500 mt-0.5">Receive weekly campus updates</p>
                </div>
                <ToggleSwitch checked={settings.emailNotifications} onChange={() => handleToggle('emailNotifications')} />
              </div>
            </div>
          </div>

          {/* --- SUPPORT & ABOUT --- */}
          <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden mb-6">
            <div className="divide-y divide-gray-50">
              <button className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors group">
                <div className="flex items-center gap-3 text-gray-700">
                  <HelpCircle className="w-5 h-5 text-gray-400" />
                  <p className="font-bold">Help & Support</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-600 transition-colors" />
              </button>
              
              <button className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors group">
                <div className="flex items-center gap-3 text-gray-700">
                  <FileText className="w-5 h-5 text-gray-400" />
                  <p className="font-bold">Terms & Policies</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-600 transition-colors" />
              </button>
            </div>
          </div>

          {/* Destructive Action */}
          <div className="pt-4">
            <button className="w-full sm:w-auto px-8 py-3 bg-red-50 text-red-600 hover:bg-red-100 font-bold rounded-xl transition-colors flex items-center justify-center gap-2">
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>

        </div>
      </div>

      {/* 🟢 Mount the Modal here! It updates the toggle automatically when closed */}
      <PushNotificationModal 
        isOpen={showPushModal} 
        onClose={() => {
          setShowPushModal(false);
          checkPushSubscription(); // Re-check the OS status in case they allowed/blocked it
        }} 
      />

    </div>
  );
}