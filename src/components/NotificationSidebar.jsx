// src/components/NotificationSidebar.jsx
import React, { useState } from 'react'; // <-- No more useState
import { Link } from 'react-router-dom';
import { Bell, ChevronUp, CheckCheck } from 'lucide-react';
import { useFriends } from '../context/FriendContext'; // <-- 1. Import the hook

// We can re-use the same time formatter
const formatTimeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + "y";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + "m";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + "d";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + "h";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + "m";
  return Math.floor(seconds) + "s";
};

const NotificationSidebar = () => {
  // 2. Get data and handlers from context
  const { notifications, handleMarkAllAsRead } = useFriends();
  
  // 3. Remove local 'isExpanded' state, use simple toggle
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  const markAllAsRead = (e) => {
    e.stopPropagation(); // Prevent sidebar from toggling
    handleMarkAllAsRead(); // <-- Use the context handler
  };

  // 4. Calculate unread count from context
  const unreadCount = notifications.filter(n => !n.seen).length;

  // Styling constants
  const EXPANDED_HEIGHT_CLASS = 'h-[400px]';
  const BASE_ROUNDING_CLASS = 'rounded-xl';

  const sidebarClasses = isExpanded
    ? `w-80 ${EXPANDED_HEIGHT_CLASS}`
    : "w-[320px] h-16";

  return (
    <div
      className={`fixed top-22 right-0 mr-4 bg-white shadow-2xl flex flex-col z-50
      ${BASE_ROUNDING_CLASS}
      ${sidebarClasses}
      overflow-hidden
      transition-all duration-300 ease-in-out`}
    >
      {/* Header Div for Collapsed/Expanded State */}
      <div
        className={`flex justify-between items-center cursor-pointer ${isExpanded ? 'p-3 border-b border-gray-100' : 'px-4 h-full'}`}
        onClick={toggleSidebar}
      >
        {isExpanded ? (
          // ====================================
          // EXPANDED STATE HEADER (List View)
          // ====================================
          <div className="flex justify-between items-center w-full">
            <h3 className="font-bold text-xl text-gray-800">Notifications</h3>
            <div className="flex items-center gap-2">
              <button
                className="p-2 bg-gray-100 rounded-full hover:bg-indigo-100 text-gray-700 hover:text-indigo-600 transition-colors"
                aria-label="Mark all as read"
                onClick={markAllAsRead} // <-- Now calls context handler
              >
                <CheckCheck size={18} />
              </button>
              <button
                className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 text-gray-700 transition-colors"
                aria-label="Collapse notifications"
              >
                <ChevronUp size={18} />
              </button>
            </div>
          </div>
        ) : (
          // ====================================
          // COLLAPSED STATE (The Pill)
          // ====================================
          <div className="flex items-center justify-between w-full relative">
            {/* Bell Icon and Unread Count */}
            <div className="relative flex items-center">
              <Bell size={24} className="text-indigo-500" />
              {unreadCount > 0 && (
                <span className="absolute -top-3 -left-1 bg-red-500 text-white text-xs font-bold px-1.5 rounded-full ring-2 ring-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </div>

            {/* "Notifications" Text */}
            <span className="font-semibold text-lg ml-3 mr-auto text-gray-700">Notifications</span>
          </div>
        )}
      </div>

      {/* 5. Notification List (Now reads from context 'notifications') */}
      {isExpanded && (
        <div className="flex-grow pt-1 overflow-y-auto no-scrollbar px-3 pb-3">
          {notifications.map((n) => (
            <Link
              to={`/profile/${n.user._id}`} // Or link to the post, etc.
              key={n._id}
              className='flex items-start gap-3 p-2 hover:bg-indigo-50 rounded-lg cursor-pointer transition-colors border-l-4 border-transparent'
            >
              <img
                src={n.user.profilePicture}
                alt={n.user.full_name}
                className='w-10 h-10 rounded-full object-cover shadow-sm mt-1'
              />

              <div className='flex-grow overflow-hidden'>
                <p className={`text-sm ${n.seen ? 'text-gray-600' : 'text-gray-800'}`}>
                  <span className={`font-semibold ${n.seen ? 'text-gray-700' : 'text-indigo-600'}`}>
                    {n.user.full_name}
                  </span>
                  {' '}
                  {n.text}
                </p>
                <p className='text-xs text-gray-400 mt-0.5'>
                  {formatTimeAgo(n.createdAt)}
                </p>
              </div>

              {!n.seen && (
                <p className='bg-indigo-500 w-2 h-2 rounded-full mt-2 ml-2 flex-shrink-0' aria-label="Unread"></p>
              )}
            </Link>
          ))}
          <style>{`
            .no-scrollbar::-webkit-scrollbar { width: 4px; }
            .no-scrollbar::-webkit-scrollbar-track { background: transparent; }
            .no-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 2px; }
            .no-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
          `}</style>
        </div>
      )}
    </div>
  );
};

export default NotificationSidebar;