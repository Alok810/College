import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { MessageSquare, ChevronUp, ChevronDown } from 'lucide-react';
import ChatBox from './ChatBox'; 
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
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

const MessageSidebar = ({ onClose }) => {
  const { sidebarChats, activeChat, setActiveChat, openChat, onlineUsers } = useChat();
  const { authData } = useAuth();
  
  const [isExpanded, setIsExpanded] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (isMobile) setIsExpanded(true);
  }, [isMobile]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const chatUserId = params.get('open_chat');
    if (chatUserId) {
      openChat(chatUserId);
      setIsExpanded(true);
      navigate(location.pathname, { replace: true });
    }
  }, [location.search, navigate, openChat]); 

  const toggleSidebar = () => {
    if (activeChat) {
      setActiveChat(null);
    } else if (isMobile && onClose) {
      onClose(); 
    } else {
      setIsExpanded(!isExpanded);
    }
  };

  const handleMessageClick = (userId) => {
    openChat(userId);
    setIsExpanded(true);
  };

  const handleBackToMessages = () => {
    setActiveChat(null);
    setIsExpanded(true); 
  };

  const getUniqueChats = () => {
    const uniqueChats = [];
    const seenUsers = new Set();
    sidebarChats.forEach((chat) => {
      const otherUser = chat.participants.find(p => p._id !== authData?._id);
      if (otherUser && !seenUsers.has(otherUser._id)) {
        seenUsers.add(otherUser._id);
        uniqueChats.push(chat);
      }
    });
    return uniqueChats;
  };

  // ==========================================
  // 💻 DESKTOP VIEW
  // ==========================================
  if (!isMobile) {
    return (
      // ✅ ADDED 'overflow-hidden' HERE TO FIX THE CORNERS
      <div className={`fixed top-[5.5rem] right-0 mr-4 bg-white shadow-2xl flex flex-col z-50 rounded-xl overflow-hidden transition-all duration-300 ease-in-out ${(isExpanded || activeChat) ? 'w-80 h-[400px]' : 'w-[320px] h-16'}`}>
        {activeChat ? (
          <ChatBox onBack={handleBackToMessages} />
        ) : (
          <>
            <div className={`flex justify-between items-center cursor-pointer ${isExpanded ? 'p-3 border-b border-gray-100' : 'px-4 h-full'}`} onClick={toggleSidebar}>
              {isExpanded ? (
                <div className="flex justify-between items-center w-full">
                  <h3 className="font-bold text-xl text-gray-800">Messages</h3>
                  <button className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 text-gray-700 transition-colors" onClick={(e) => { e.stopPropagation(); toggleSidebar(); }}>
                    <ChevronUp size={18} className="transform rotate-180" /> 
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between w-full relative">
                  <div className="relative flex items-center">
                    <MessageSquare size={24} className="text-indigo-500" />
                  </div>
                  <span className="font-semibold text-lg ml-3 mr-auto text-gray-700">Messages</span>
                </div>
              )}
            </div>

            {isExpanded && !activeChat && (
              <div className="flex-grow pt-2 overflow-y-auto no-scrollbar px-3 pb-3">
                {sidebarChats.length === 0 ? (
                  <p className="text-center text-gray-500 mt-10 text-sm">No messages yet. Go to a friend's profile to start chatting!</p>
                ) : (
                  getUniqueChats().map((chat) => {
                    const otherUser = chat.participants.find(p => p._id !== authData?._id);
                    const avatar = otherUser.profilePicture || `https://ui-avatars.com/api/?name=${otherUser.name || 'User'}&background=EBF4FF&color=4F46E5`;
                    const isOnline = onlineUsers.includes(otherUser._id);

                    return (
                      <div
                        key={chat._id}
                        className='flex items-center gap-3 p-2.5 mb-2 rounded-xl cursor-pointer transition-all duration-300 bg-gradient-to-r from-indigo-50/80 to-teal-50/80 hover:from-indigo-100 hover:to-teal-100 shadow-sm'
                        onClick={() => handleMessageClick(otherUser._id)}
                      >
                        <div className="relative flex-shrink-0">
                          <img src={avatar} alt={otherUser.name} className='w-11 h-11 rounded-full object-cover shadow-sm bg-white' />
                          {isOnline && <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>}
                        </div>
                        <div className='flex-grow overflow-hidden'>
                          <div className='flex justify-between items-start'>
                            <p className="font-semibold text-[15px] truncate text-gray-800 leading-tight">{otherUser.name || otherUser.full_name}</p>
                            <p className='text-xs text-gray-400 flex-shrink-0 ml-2 pt-0.5'>
                              {chat.latestMessage && formatTimeAgo(chat.latestMessage.createdAt)}
                            </p>
                          </div>
                          <div className='flex justify-between items-center mt-1'>
                            <p className="text-[13px] truncate min-w-0 text-gray-500">
                              {chat.latestMessage ? chat.latestMessage.content : 'Started a conversation'}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
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
          </>
        )}
      </div>
    );
  }

  // ==========================================
  // 📱 MOBILE VIEW
  // ==========================================
  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90]" onClick={toggleSidebar} />
      
      <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="fixed bottom-0 left-0 w-full h-[85vh] bg-white z-[100] rounded-t-3xl shadow-2xl flex flex-col overflow-hidden">
        
        {activeChat ? (
          <ChatBox onBack={handleBackToMessages} />
        ) : (
          <>
            <div className="w-full flex justify-center pt-3 pb-2 cursor-pointer" onClick={toggleSidebar}>
              <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
            </div>

            <div className="px-5 pb-3 pt-2 flex justify-between items-center">
              <h3 className="font-bold text-gray-800 text-2xl">Messages</h3>
            </div>

            <div className="flex-grow overflow-y-auto px-4 pb-8 custom-scrollbar space-y-2.5 mt-2">
              {sidebarChats.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[50vh] text-gray-400">
                  <MessageSquare size={48} className="mb-3 opacity-20" />
                  <p className="text-lg">No messages yet.</p>
                </div>
              ) : (
                getUniqueChats().map((chat) => {
                  const otherUser = chat.participants.find(p => p._id !== authData?._id);
                  const avatar = otherUser.profilePicture || `https://ui-avatars.com/api/?name=${otherUser.name || 'User'}&background=EBF4FF&color=4F46E5`;
                  const isOnline = onlineUsers.includes(otherUser._id);

                  return (
                    <div
                      key={chat._id}
                      className="flex items-center gap-4 p-3 rounded-2xl cursor-pointer transition-all duration-300 shadow-sm border border-purple-50 bg-gradient-to-r from-purple-50/80 to-teal-50/80 hover:from-purple-100 hover:to-teal-100"
                      onClick={() => handleMessageClick(otherUser._id)}
                    >
                      <div className="relative flex-shrink-0">
                        <img src={avatar} alt={otherUser.name} className="w-14 h-14 rounded-full object-cover shadow-sm bg-white" />
                        {isOnline && <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></span>}
                      </div>
                      
                      <div className='flex-grow overflow-hidden'>
                        <div className='flex justify-between items-center'>
                          <p className="font-bold text-lg text-gray-800 truncate">{otherUser.name || otherUser.full_name}</p>
                          <p className='text-xs text-gray-500 font-medium ml-2 flex-shrink-0'>
                            {chat.latestMessage && formatTimeAgo(chat.latestMessage.createdAt)}
                          </p>
                        </div>
                        <p className="text-sm truncate min-w-0 text-gray-600 font-medium mt-0.5">
                          {chat.latestMessage ? chat.latestMessage.content : 'Started a conversation'}
                        </p>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </>
        )}
      </motion.div>
    </>
  );
};

export default MessageSidebar;