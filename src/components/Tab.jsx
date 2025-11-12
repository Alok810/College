// src/components/Tab.jsx
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, MessageCircle, Bell, Plus } from 'lucide-react';

import MessageSidebar from './Message.jsx';
import SearchSidebar from './SearchSidebar.jsx';
import NotificationSidebar from './NotificationSidebar.jsx';
import CreatePost from './CreatePost.jsx'; 

// 1. Accept the new 'onPostCreated' prop
const Tab = ({ onPostCreated }) => {
  const [activeTab, setActiveTab] = useState(null);
  const location = useLocation(); 

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.has('open_chat')) {
      setActiveTab('message');
    }
  }, [location.search]);

  const handleTabClick = (tabName) => {
    if (activeTab === tabName) {
      setActiveTab(null);
    } else {
      setActiveTab(tabName);
    }
  };

  // 2. Create a new handler
  // This will call the main function from App.jsx
  // AND also close the sidebar
  const handlePostAndClose = (newPostData) => {
    if (onPostCreated) {
      onPostCreated(newPostData); // Send data up to App.jsx
    }
    setActiveTab(null); // Close the 'create' tab
  };
  
  // ... (getButtonClass function is unchanged) ...
  const getButtonClass = (tabName) => {
    if (activeTab === tabName) {
      return 'bg-gradient-to-r from-purple-600 to-teal-600 text-white shadow-md hover:opacity-90';
    } else {
      return 'bg-white text-gray-700 hover:bg-gray-200 shadow-lg';
    }
  };


  return (
    <div className="w-full h-full flex flex-col">
      {/* ... (All your buttons are unchanged) ... */}
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
          onClick={() => handleTabClick('create')}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ease-in-out ${getButtonClass('create')}`}
          aria-label="Create Post"
        >
          <Plus size={24} />
        </button>

        <button
          onClick={() => handleTabClick('notification')}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ease-in-out ${getButtonClass('notification')}`}
          aria-label="Notifications"
        >
          <Bell size={24} />
        </button>

      </div>

      <div className="flex-grow overflow-y-auto no-scrollbar pt-2">
        
        {activeTab === 'message' && <MessageSidebar />}
        {activeTab === 'search' && <SearchSidebar />}
        {activeTab === 'notification' && <NotificationSidebar />}
        
        {/* 3. Pass the NEW handler down to CreatePost */}
        {activeTab === 'create' && (
          <CreatePost onPostCreated={handlePostAndClose} />
        )}

      </div>
      {/* ... (style tag is unchanged) ... */}
       <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default Tab;