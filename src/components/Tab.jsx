// src/components/Tab.jsx
import React, { useState, useEffect } from 'react'; // 1. Import useEffect
import { useLocation } from 'react-router-dom'; // 2. Import useLocation
import { Search, MessageCircle, Bell } from 'lucide-react';

// Import all three real components
import MessageSidebar from './Message.jsx';
import SearchSidebar from './SearchSidebar.jsx';
import NotificationSidebar from './NotificationSidebar.jsx';

const Tab = () => {
  const [activeTab, setActiveTab] = useState(null);
  const location = useLocation(); // 3. Get the current location

  // 4. ADD THIS NEW EFFECT
  // This effect checks the URL when the component loads
  useEffect(() => {
    // Check for the 'open_chat' parameter
    const params = new URLSearchParams(location.search);
    if (params.has('open_chat')) {
      // If it exists, force the 'message' tab to be active
      setActiveTab('message');
    }
    // We only need this to run when the location.search string changes
  }, [location.search]);

  const handleTabClick = (tabName) => {
    if (activeTab === tabName) {
      setActiveTab(null); // Close if clicking the same tab
    } else {
      setActiveTab(tabName); // Open new tab
    }
  };

  const getButtonClass = (tabName) => {
    if (activeTab === tabName) {
      // Active state: Gradient (Unchanged)
      return 'bg-gradient-to-r from-purple-600 to-teal-600 text-white shadow-md hover:opacity-90';
    } else {
      // Inactive state: Changed to white bg, gray hover
      return 'bg-white text-gray-700 hover:bg-gray-200 shadow-lg';
    }
  };

  return (
    <div className="w-full h-full flex flex-col">

      {/* --- TAB BUTTONS (Header) --- */}
      <div className="flex justify-center items-center gap-5 p-3 flex-shrink-0">
        
        <button
          onClick={() => handleTabClick('search')}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ease-in-out ${getButtonClass('search')}`}
          aria-label="Search"
        >
          <Search size={24} />
        </button>

        <button
          onClick={() => handleTabClick('message')}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ease-in-out ${getButtonClass('message')}`}
          aria-label="Messages"
        >
          <MessageCircle size={24} />
        </button>

        <button
          onClick={() => handleTabClick('notification')}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ease-in-out ${getButtonClass('notification')}`}
          aria-label="Notifications"
        >
          <Bell size={24} />
        </button>

      </div>

      {/* --- TAB CONTENT (Body) --- */}
      <div className="flex-grow overflow-y-auto no-scrollbar pt-2">
        
        {/* Render the active component based on the state */}
        {activeTab === 'message' && <MessageSidebar />}
        {activeTab === 'search' && <SearchSidebar />}
        {activeTab === 'notification' && <NotificationSidebar />}

      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default Tab;