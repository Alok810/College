import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, ChevronUp, CheckCheck, X } from 'lucide-react'; // ✅ Added 'X' icon
import { useFriends } from '../context/FriendContext'; 
import { deleteNotification } from '../api'; // ✅ Import your new API call

const formatTimeAgo = (date) => {
  if (!date) return '';
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
  const { notifications, handleMarkAllAsRead } = useFriends();
  const [isExpanded, setIsExpanded] = useState(false);
  const [deletedIds, setDeletedIds] = useState([]); // ✅ Track deleted items locally

  const toggleSidebar = () => setIsExpanded(!isExpanded);

  const markAllAsRead = (e) => {
    e.stopPropagation(); 
    handleMarkAllAsRead(); 
  };

  // ✅ New Delete Handler
  const handleDelete = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Instantly hide from UI for a snappy experience
    setDeletedIds((prev) => [...prev, id]);

    try {
      await deleteNotification(id);
    } catch (error) {
      console.error("Failed to delete", error);
      // If it fails, put it back on the screen
      setDeletedIds((prev) => prev.filter(deletedId => deletedId !== id));
    }
  };

  // Filter out the ones we just deleted
  const visibleNotifications = notifications.filter(n => !deletedIds.includes(n._id));
  const unreadCount = visibleNotifications.filter(n => !n.seen).length;

  const EXPANDED_HEIGHT_CLASS = 'h-[400px]';
  const BASE_ROUNDING_CLASS = 'rounded-xl';
  const sidebarClasses = isExpanded ? `w-80 ${EXPANDED_HEIGHT_CLASS}` : "w-[320px] h-16";

  return (
    <div className={`fixed top-22 right-0 mr-4 bg-white shadow-2xl flex flex-col z-50 ${BASE_ROUNDING_CLASS} ${sidebarClasses} overflow-hidden transition-all duration-300 ease-in-out`}>
      
      {/* Header */}
      <div className={`flex justify-between items-center cursor-pointer ${isExpanded ? 'p-3 border-b border-gray-100' : 'px-4 h-full'}`} onClick={toggleSidebar}>
        {isExpanded ? (
          <div className="flex justify-between items-center w-full">
            <h3 className="font-bold text-xl text-gray-800">Notifications</h3>
            <div className="flex items-center gap-2">
              <button
                className="p-2 bg-gray-100 rounded-full hover:bg-indigo-100 text-gray-700 hover:text-indigo-600 transition-colors"
                aria-label="Mark all as read"
                onClick={markAllAsRead} 
              >
                <CheckCheck size={18} />
              </button>
              <button className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 text-gray-700 transition-colors">
                <ChevronUp size={18} />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between w-full relative">
            <div className="relative flex items-center">
              <Bell size={24} className="text-indigo-500" />
              {unreadCount > 0 && (
                <span className="absolute -top-3 -left-1 bg-red-500 text-white text-xs font-bold px-1.5 rounded-full ring-2 ring-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </div>
            <span className="font-semibold text-lg ml-3 mr-auto text-gray-700">Notifications</span>
          </div>
        )}
      </div>

      {/* Notification List */}
      {isExpanded && (
        <div className="flex-grow pt-1 overflow-y-auto no-scrollbar px-3 pb-3 relative">
          
          {visibleNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 mt-10">
              <Bell size={32} className="mb-2 opacity-20" />
              <p className="text-sm">You're all caught up!</p>
            </div>
          ) : (
            visibleNotifications.map((n) => {
              const userName = n.user.name || n.user.full_name || 'User';
              const avatar = n.user.profilePicture || `https://ui-avatars.com/api/?name=${userName}&background=EBF4FF&color=4F46E5`;

              return (
                // ✅ Changed outer Link to a div, added 'group' class for hover effects
                <div
                  key={n._id}
                  className='group flex items-start justify-between p-2 hover:bg-indigo-50 rounded-lg transition-colors border-l-4 border-transparent relative'
                >
                  <Link
                    to={`/profile/${n.user._id}`} 
                    className="flex items-start gap-3 flex-grow overflow-hidden"
                    onClick={() => setIsExpanded(false)} 
                  >
                    <img src={avatar} alt={userName} className='w-10 h-10 rounded-full object-cover shadow-sm mt-1 flex-shrink-0' />
                    <div className='flex-grow overflow-hidden pr-2'>
                      <p className={`text-sm ${n.seen ? 'text-gray-600' : 'text-gray-800'}`}>
                        <span className={`font-semibold ${n.seen ? 'text-gray-700' : 'text-indigo-600'}`}>
                          {userName}
                        </span>
                        {' '}
                        {n.text}
                      </p>
                      <p className='text-xs text-gray-400 mt-0.5'>
                        {formatTimeAgo(n.createdAt)}
                      </p>
                    </div>
                  </Link>
                  
                  <div className="flex flex-col items-end justify-start min-w-[24px]">
                    {!n.seen && (
                      <p className='bg-indigo-500 w-2 h-2 rounded-full mb-2 flex-shrink-0' aria-label="Unread"></p>
                    )}
                    {/* ✅ New Delete Button (only visible when hovering over the notification) */}
                    <button
                      onClick={(e) => handleDelete(e, n._id)}
                      className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-red-50"
                      title="Delete notification"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
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