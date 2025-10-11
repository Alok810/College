// src/components/Message.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // 🛑 IMPORT LINK
import { Edit2, MessageSquare, ChevronUp, MoreHorizontal } from 'lucide-react';
import { dummyRecentMessagesData, initialChatHistory } from '../assets/data'; 
import ChatBox from './ChatBox'; 

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

const MessageSidebar = () => {
  const [messages, setMessages] = useState(dummyRecentMessagesData);
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedChatUser, setSelectedChatUser] = useState(null); 
  const [chatHistory, setChatHistory] = useState(initialChatHistory);

  // Function to update the chat history and the sidebar's recent message list
  const updateChatHistory = (userId, newMessage, userDetails) => {
    // 1. Update the full history
    setChatHistory(prevHistory => ({
      ...prevHistory,
      [userId]: [...(prevHistory[userId] || []), newMessage],
    }));

    // 2. Update the sidebar message list to put the conversation on top
    setMessages(prevMessages => {
        const otherMessages = prevMessages.filter(m => m.from_user_id._id !== userId);
        
        // Create a new message entry for the sidebar list
        const updatedMessage = {
            _id: `m-${Date.now()}`,
            from_user_id: userDetails,
            text: newMessage.text,
            createdAt: newMessage.timestamp,
            seen: true, // Mark as seen since current user sent/is in the chat
        };
        // Place the updated conversation at the top of the list
        return [updatedMessage, ...otherMessages];
    });
  };

  const toggleSidebar = () => {
    if (selectedChatUser) {
        setSelectedChatUser(null);
    } else {
        setIsExpanded(!isExpanded);
    }
  };

  const handleMessageClick = (user) => {
    setSelectedChatUser(user);
    setIsExpanded(true);
  };

  const handleBackToMessages = () => {
    setSelectedChatUser(null);
    setIsExpanded(true); 
  };

  const unreadCount = messages.filter(msg => !msg.seen).length;

  const recentAvatars = messages
    .slice(0, 3)
    .map(msg => msg.from_user_id.profile_picture);

  // Styling constants
  const EXPANDED_HEIGHT_CLASS = 'h-[400px]'; 
  const BASE_ROUNDING_CLASS = 'rounded-xl';

  const sidebarClasses = (isExpanded || selectedChatUser)
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
      
      {/* Conditional Content: Chat View or Sidebar List */}
      {selectedChatUser ? (
        <ChatBox 
          selectedUser={selectedChatUser} 
          chatHistory={chatHistory}
          updateChatHistory={updateChatHistory}
          onBack={handleBackToMessages} 
        />
      ) : (
        <>
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
                <h3 className="font-bold text-xl text-gray-800">Messages</h3>
                <div className="flex items-center gap-2">
                  <button
                    className="p-2 bg-gray-100 rounded-full hover:bg-indigo-100 text-gray-700 hover:text-indigo-600 transition-colors"
                    aria-label="Start a new message"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 text-gray-700 transition-colors"
                    aria-label="Collapse messages"
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
                {/* Message Icon and Unread Count */}
                <div className="relative flex items-center">
                  <MessageSquare size={24} className="text-indigo-500" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-3 -left-1 bg-red-500 text-white text-xs font-bold px-1.5 rounded-full ring-2 ring-white">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </div>

                {/* "Messages" Text */}
                <span className="font-semibold text-lg ml-3 mr-auto text-gray-700">Messages</span>

                {/* Avatar Previews - Make them clickable */}
                <div className="flex items-center ml-2">
                  {recentAvatars.map((src, index) => (
                    <Link
                      to={`/profile/${messages[index].from_user_id._id}`} // 🛑 ADD LINK
                      key={index}
                      className="w-8 h-8 rounded-full object-cover border-2 border-white -ml-2 first:ml-0 shadow-sm transition-transform hover:scale-105"
                      style={{ zIndex: 10 - index }}
                      onClick={(e) => e.stopPropagation()} // Prevent sidebar toggle
                    >
                      <img
                        src={src}
                        alt={`User ${index + 1}`}
                        className="w-full h-full object-cover rounded-full"
                      />
                    </Link>
                  ))}
                  {/* Three Dots for more messages */}
                  {messages.length > 3 && (
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center border-2 border-white -ml-2 text-gray-600">
                      <MoreHorizontal size={18} />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Message List (Only rendered when expanded) */}
          {isExpanded && !selectedChatUser && (
            <div className="flex-grow pt-1 overflow-y-auto no-scrollbar px-3 pb-3">
              {messages.map((message) => (
                <div
                  key={message._id}
                  className='flex items-center gap-3 p-2 hover:bg-indigo-50 rounded-lg cursor-pointer transition-colors border-l-4 border-transparent hover:border-indigo-400'
                  onClick={() => handleMessageClick(message.from_user_id)}
                >
                  {/* 🛑 WRAP AVATAR IN LINK */}
                  <Link 
                      to={`/profile/${message.from_user_id._id}`} 
                      onClick={(e) => e.stopPropagation()} // Prevent chat from opening
                      className="flex-shrink-0 transition-transform hover:scale-105"
                  >
                    <img
                      src={message.from_user_id.profile_picture}
                      alt={message.from_user_id.full_name}
                      className='w-12 h-12 rounded-full object-cover shadow-sm'
                    />
                  </Link>
                  
                  <div className='flex-grow overflow-hidden' onClick={(e) => handleMessageClick(message.from_user_id)}>
                    <div className='flex justify-between items-center'>
                      <p className={`font-semibold truncate ${message.seen ? 'text-gray-700' : 'text-indigo-600'}`}>
                        {message.from_user_id.full_name}
                      </p>
                      <p className='text-xs text-gray-400 flex-shrink-0 ml-2'>
                        {formatTimeAgo(message.createdAt)}
                      </p>
                    </div>
                    <div className='flex justify-between items-center mt-0.5'>
                      <p className={`text-sm truncate min-w-0 ${message.seen ? 'text-gray-500' : 'font-medium text-gray-800'}`}>
                        {message.text ? message.text : 'Sent an attachment.'}
                      </p>
                      {!message.seen && (
                          <p className='bg-indigo-500 text-white w-2 h-2 flex items-center justify-center rounded-full text-[10px] ml-2 flex-shrink-0' aria-label="Unread message"></p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
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
};

export default MessageSidebar;