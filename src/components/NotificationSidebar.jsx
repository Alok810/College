import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, ChevronUp, CheckCheck, X } from 'lucide-react';
import { useFriends } from '../context/FriendContext'; 
import { deleteNotification } from '../api'; 
import { motion } from 'framer-motion';

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

const NotificationSidebar = ({ onClose }) => {
  const { notifications, handleMarkAllAsRead } = useFriends();
  const [isExpanded, setIsExpanded] = useState(false);
  const [deletedIds, setDeletedIds] = useState([]); 
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (isMobile && !isExpanded) setIsExpanded(true);

  const visibleNotifications = notifications.filter(n => !deletedIds.includes(n._id));
  const unreadCount = visibleNotifications.filter(n => !n.seen).length;

  // ✅ HELPER: Consolidates logic for both views
  const renderNotificationItem = (n, isMobileView) => {
    const isSystem = !n.user || n.type === 'system';
    
    // 🚀 Uses the saved acronym (e.g., "NIAMT") from the DB
    const sender = isSystem ? (n.senderName || 'Admin') : (n.user?.name || 'User');
    
    const avatar = isSystem 
      ? `https://ui-avatars.com/api/?name=${sender}&background=E0E7FF&color=4338CA&bold=true`
      : (n.user?.profilePicture || `https://ui-avatars.com/api/?name=${sender}&background=EBF4FF&color=4F46E5`);

    return (
      <div key={n._id} className={`group flex items-start justify-between ${isMobileView ? 'p-3 border border-purple-50' : 'p-2.5 mb-2'} rounded-xl bg-gradient-to-r from-purple-50/80 to-teal-50/80 hover:from-purple-100 hover:to-teal-100 shadow-sm transition-all duration-300`}>
        <Link to={isSystem ? '#' : `/profile/${n.user?._id}`} className="flex items-start gap-3 flex-grow overflow-hidden" onClick={() => setIsExpanded(false)}>
          <img src={avatar} alt={sender} className={`${isMobileView ? 'w-12 h-12' : 'w-11 h-11'} rounded-full object-cover bg-white shadow-sm flex-shrink-0`} />
          <div className='flex-grow overflow-hidden pr-2'>
            <p className={`${isMobileView ? 'text-base' : 'text-[14px]'} leading-snug ${n.seen ? 'text-gray-600' : 'text-gray-800'}`}>
              <span className={`font-bold ${n.seen ? 'text-gray-700' : 'text-purple-700'}`}>{sender}:</span> {n.text}
            </p>
            <p className='text-[12px] text-gray-500 mt-1 font-medium'>{formatTimeAgo(n.createdAt)}</p>
          </div>
        </Link>
        <div className="flex flex-col items-end justify-start min-w-[24px]">
          {!n.seen && <div className='bg-purple-500 w-2.5 h-2.5 rounded-full mb-2 shadow-sm' />}
          <button onClick={async (e) => { 
            e.preventDefault(); e.stopPropagation(); 
            setDeletedIds([...deletedIds, n._id]); 
            try { await deleteNotification(n._id); } catch(err) { setDeletedIds(deletedIds.filter(id => id !== n._id)); }
          }} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 p-1.5 rounded-full hover:bg-white/80"><X size={16} /></button>
        </div>
      </div>
    );
  };

  if (!isMobile) {
    return (
      <div className={`fixed top-[5.5rem] right-0 mr-4 bg-white shadow-2xl flex flex-col z-50 rounded-xl overflow-hidden transition-all duration-300 ${isExpanded ? 'w-80 h-[400px]' : 'w-[320px] h-16'}`}>
        <div className={`flex justify-between items-center cursor-pointer ${isExpanded ? 'p-3 border-b border-gray-100' : 'px-4 h-full'}`} onClick={() => setIsExpanded(!isExpanded)}>
          {isExpanded ? (
            <div className="flex justify-between items-center w-full">
              <h3 className="font-bold text-xl text-gray-800">Notifications</h3>
              <div className="flex items-center gap-2">
                <button className="p-2 bg-gray-100 rounded-full hover:bg-purple-100 text-gray-700 hover:text-purple-600 transition-colors" onClick={(e) => { e.stopPropagation(); handleMarkAllAsRead(); }}><CheckCheck size={18} /></button>
                <button className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 text-gray-700"><ChevronUp size={18} /></button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between w-full relative">
              <div className="relative flex items-center">
                <Bell size={24} className="text-indigo-500" />
                {unreadCount > 0 && <span className="absolute -top-3 -left-1 bg-red-500 text-white text-xs font-bold px-1.5 rounded-full ring-2 ring-white">{unreadCount > 9 ? '9+' : unreadCount}</span>}
              </div>
              <span className="font-semibold text-lg ml-3 mr-auto text-gray-700">Notifications</span>
            </div>
          )}
        </div>
        {isExpanded && (
          <div className="flex-grow pt-2 overflow-y-auto no-scrollbar px-3 pb-3">
            {visibleNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 mt-10"><Bell size={32} className="mb-2 opacity-20" /><p className="text-sm">You're all caught up!</p></div>
            ) : visibleNotifications.map(n => renderNotificationItem(n, false))}
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90]" onClick={onClose} />
      <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="fixed bottom-0 left-0 w-full h-[85vh] bg-white z-[100] rounded-t-3xl shadow-2xl flex flex-col overflow-hidden">
        <div className="w-full flex justify-center pt-3 pb-2 cursor-pointer" onClick={onClose}><div className="w-12 h-1.5 bg-gray-300 rounded-full" /></div>
        <div className="px-5 pb-3 pt-2 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h3 className="font-bold text-gray-800 text-2xl">Notifications</h3>
            {unreadCount > 0 && <span className="bg-red-500 text-white text-sm font-bold px-2 py-0.5 rounded-full shadow-sm">{unreadCount} New</span>}
          </div>
          <button onClick={handleMarkAllAsRead} className="p-2 bg-purple-50 text-purple-600 rounded-full hover:bg-purple-100 transition-colors"><CheckCheck size={20} /></button>
        </div>
        <div className="flex-grow overflow-y-auto px-4 pb-8 space-y-2.5 mt-2">
          {visibleNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[50vh] text-gray-400"><Bell size={48} className="mb-3 opacity-20" /><p className="text-lg">You're all caught up!</p></div>
          ) : visibleNotifications.map(n => renderNotificationItem(n, true))}
        </div>
      </motion.div>
    </>
  );
};

export default NotificationSidebar;