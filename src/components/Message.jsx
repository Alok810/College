import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Edit2, MessageSquare, ChevronUp, MoreHorizontal } from 'lucide-react';
// 1. Remove data imports
import ChatBox from './ChatBox'; 
import { findUserById } from '../utils/findUser'; 
import { useChat } from '../context/ChatContext'; // <-- 2. IMPORT THE NEW HOOK

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
    // 3. GET all state from the global context
    const { 
        messages, 
        setMessages, 
        chatHistory, 
        updateChatHistory 
    } = useChat();

    // 4. KEEP your local UI state
    const [isExpanded, setIsExpanded] = useState(false);
    const [selectedChatUser, setSelectedChatUser] = useState(null); 
    const processingChatIdRef = useRef(null);

    // 5. REMOVE the local useState for messages/chatHistory
    // const [messages, setMessages] = useState(dummyRecentMessagesData); // <-- DELETED
    // const [chatHistory, setChatHistory] = useState(initialChatHistory); // <-- DELETED

    const location = useLocation();
    const navigate = useNavigate();

    // This useEffect hook now uses the global state
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const chatUserId = params.get('open_chat');

        if (!chatUserId || chatUserId === processingChatIdRef.current) {
            return;
        }

        processingChatIdRef.current = chatUserId;
        const userInList = messages.find(msg => msg.from_user_id._id === chatUserId);

        if (userInList) {
            setSelectedChatUser(userInList.from_user_id);
            setIsExpanded(true);
        } else {
            const newUserDetails = findUserById(chatUserId); 
            if (newUserDetails) {
                const newMessageEntry = {
                    _id: `new-${newUserDetails._id}`,
                    from_user_id: newUserDetails,
                    text: "Start a new conversation...", 
                    createdAt: new Date(),
                    seen: true, 
                };
                // This 'setMessages' now updates the GLOBAL context
                setMessages(prev => [newMessageEntry, ...prev]);
                setSelectedChatUser(newUserDetails);
                setIsExpanded(true);
            }
        }
        
        navigate(location.pathname, { replace: true });

        setTimeout(() => {
            processingChatIdRef.current = null;
        }, 100);
        
    // 6. Add 'setMessages' to the dependency array
    }, [location.search, navigate, messages, setMessages]); 

    // 7. DELETE the local updateChatHistory function (it's in the context)
    // const updateChatHistory = (...) => { ... } // <-- DELETED

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
            
            {/* 8. Pass the GLOBAL state and functions to ChatBox */}
            {selectedChatUser ? (
                <ChatBox 
                    selectedUser={selectedChatUser} 
                    chatHistory={chatHistory}
                    updateChatHistory={updateChatHistory}
                    onBack={handleBackToMessages} 
                />
            ) : (
                <>
                    {/* ... (The rest of your JSX is 100% correct, no changes) ... */}
                    <div
                        className={`flex justify-between items-center cursor-pointer ${isExpanded ? 'p-3 border-b border-gray-100' : 'px-4 h-full'}`}
                        onClick={toggleSidebar} 
                    >
                        {isExpanded ? (
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
                            <div className="flex items-center justify-between w-full relative">
                                <div className="relative flex items-center">
                                    <MessageSquare size={24} className="text-indigo-500" />
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-3 -left-1 bg-red-500 text-white text-xs font-bold px-1.5 rounded-full ring-2 ring-white">
                                            {unreadCount > 9 ? '9+' : unreadCount}
                                        </span>
                                    )}
                                </div>

                                <span className="font-semibold text-lg ml-3 mr-auto text-gray-700">Messages</span>

                                <div className="flex items-center ml-2">
                                    {recentAvatars.map((src, index) => (
                                        <Link
                                            to={`/profile/${messages[index].from_user_id._id}`} 
                                            key={index}
                                            className="w-8 h-8 rounded-full object-cover border-2 border-white -ml-2 first:ml-0 shadow-sm transition-transform hover:scale-105"
                                            style={{ zIndex: 10 - index }}
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <img
                                                src={src} 
                                                alt={`User ${index + 1}`}
                                                className="w-full h-full object-cover rounded-full"
                                            />
                                        </Link>
                                    ))}
                                    {messages.length > 3 && (
                                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center border-2 border-white -ml-2 text-gray-600">
                                            <MoreHorizontal size={18} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {isExpanded && !selectedChatUser && (
                        <div className="flex-grow pt-1 overflow-y-auto no-scrollbar px-3 pb-3">
                            {messages.map((message) => (
                                <div
                                    key={message._id}
                                    className='flex items-center gap-3 p-2 hover:bg-indigo-50 rounded-lg cursor-pointer transition-colors border-l-4 border-transparent hover:border-indigo-400'
                                    onClick={() => handleMessageClick(message.from_user_id)}
                                >
                                    <Link 
                                        to={`/profile/${message.from_user_id._id}`} 
                                        onClick={(e) => e.stopPropagation()} 
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