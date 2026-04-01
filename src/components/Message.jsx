import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { MessageSquare, ChevronUp } from 'lucide-react';
import ChatBox from './ChatBox'; 
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';

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

const MessageSidebar = () => {
    // ✅ Extract onlineUsers from Context
    const { sidebarChats, activeChat, setActiveChat, openChat, onlineUsers } = useChat();
    const { authData } = useAuth();
    
    const [isExpanded, setIsExpanded] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

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
        if (activeChat) setActiveChat(null);
        else setIsExpanded(!isExpanded);
    };

    const handleMessageClick = (userId) => {
        openChat(userId);
        setIsExpanded(true);
    };

    const handleBackToMessages = () => {
        setActiveChat(null);
        setIsExpanded(true); 
    };

    const EXPANDED_HEIGHT_CLASS = 'h-[400px]'; 
    const BASE_ROUNDING_CLASS = 'rounded-xl';
    const sidebarClasses = (isExpanded || activeChat) ? `w-80 ${EXPANDED_HEIGHT_CLASS}` : "w-[320px] h-16";

    return (
        <div className={`fixed top-22 right-0 mr-4 bg-white shadow-2xl flex flex-col z-50 ${BASE_ROUNDING_CLASS} ${sidebarClasses} overflow-hidden transition-all duration-300 ease-in-out`}>
            
            {activeChat ? (
                <ChatBox onBack={handleBackToMessages} />
            ) : (
                <>
                    <div className={`flex justify-between items-center cursor-pointer ${isExpanded ? 'p-3 border-b border-gray-100' : 'px-4 h-full'}`} onClick={toggleSidebar}>
                        {isExpanded ? (
                            <div className="flex justify-between items-center w-full">
                                <h3 className="font-bold text-xl text-gray-800">Messages</h3>
                                <div className="flex items-center gap-2">
                                    <button className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 text-gray-700 transition-colors" onClick={(e) => { e.stopPropagation(); toggleSidebar(); }}>
                                        <ChevronUp size={18} className="transform rotate-180" /> 
                                    </button>
                                </div>
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
                        <div className="flex-grow pt-1 overflow-y-auto no-scrollbar px-3 pb-3">
                            {sidebarChats.length === 0 ? (
                                <p className="text-center text-gray-500 mt-10 text-sm">No messages yet. Go to a friend's profile to start chatting!</p>
                            ) : (
                                (() => {
                                    const uniqueChats = [];
                                    const seenUsers = new Set();

                                    sidebarChats.forEach((chat) => {
                                        const otherUser = chat.participants.find(p => p._id !== authData?._id);
                                        if (otherUser && !seenUsers.has(otherUser._id)) {
                                            seenUsers.add(otherUser._id);
                                            uniqueChats.push(chat);
                                        }
                                    });

                                    return uniqueChats.map((chat) => {
                                        const otherUser = chat.participants.find(p => p._id !== authData?._id);
                                        const avatar = otherUser.profilePicture || `https://ui-avatars.com/api/?name=${otherUser.name || 'User'}&background=EBF4FF&color=4F46E5`;
                                        const isOnline = onlineUsers.includes(otherUser._id); // ✅ Check if online

                                        return (
                                            <div
                                                key={chat._id}
                                                className='flex items-center gap-3 p-2 hover:bg-indigo-50 rounded-lg cursor-pointer transition-colors border-l-4 border-transparent hover:border-indigo-400'
                                                onClick={() => handleMessageClick(otherUser._id)}
                                            >
                                                {/* ✅ Added the Green Dot directly to the Sidebar Avatar */}
                                                <div className="relative flex-shrink-0 transition-transform hover:scale-105">
                                                    <img src={avatar} alt={otherUser.name} className='w-12 h-12 rounded-full object-cover shadow-sm' />
                                                    {isOnline && (
                                                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                                                    )}
                                                </div>
                                                
                                                <div className='flex-grow overflow-hidden'>
                                                    <div className='flex justify-between items-center'>
                                                        <p className="font-semibold truncate text-gray-700">{otherUser.name || otherUser.full_name}</p>
                                                        <p className='text-xs text-gray-400 flex-shrink-0 ml-2'>
                                                            {chat.latestMessage && formatTimeAgo(chat.latestMessage.createdAt)}
                                                        </p>
                                                    </div>
                                                    <div className='flex justify-between items-center mt-0.5'>
                                                        <p className="text-sm truncate min-w-0 text-gray-500">
                                                            {chat.latestMessage ? chat.latestMessage.content : 'Started a conversation'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    });
                                })()
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
};

export default MessageSidebar;