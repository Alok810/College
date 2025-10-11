// src/components/ChatBox.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom'; // 🛑 IMPORT LINK
import { ArrowLeft } from 'lucide-react'; 
import { dummyCurrentUser as CURRENT_USER } from '../assets/data'; 
import SendIcon from '../assets/send.png'; 

const ChatBox = ({ selectedUser, chatHistory, onBack, updateChatHistory }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  const messages = chatHistory[selectedUser._id] || [];
  const latestMessageId = messages.length > 0 ? messages[messages.length - 1].id : null;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [latestMessageId]);

  const handleSend = (e) => {
    e.preventDefault();
    if (input.trim() === '') return;

    const newMessage = {
      id: Date.now(),
      senderId: CURRENT_USER._id,
      text: input.trim(),
      timestamp: Date.now(),
    };

    updateChatHistory(selectedUser._id, newMessage, selectedUser);
    setInput('');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="flex items-center p-3 border-b border-gray-100 bg-white flex-shrink-0">
        <button 
          onClick={onBack} 
          className="p-1 mr-2 rounded-full hover:bg-gray-100 text-gray-700 transition-colors" 
          aria-label="Back to messages"
        >
          <ArrowLeft size={20} />
        </button>
        {/* 🛑 WRAP AVATAR AND USER NAME IN LINK */}
        <Link to={`/profile/${selectedUser._id}`} className='flex items-center group cursor-pointer'>
          <img
            src={selectedUser.profile_picture}
            alt={selectedUser.full_name}
            className="w-10 h-10 rounded-full object-cover mr-3 border-2 border-indigo-500 transition-transform group-hover:scale-105"
          />
          <h3 className="font-bold text-lg truncate text-gray-800 hover:underline">{selectedUser.full_name}</h3>
        </Link>
      </div>

      {/* Messages Area (Scrollable) */}
      <div className="flex-grow overflow-y-auto p-4 space-y-3 bg-gray-50 no-scrollbar">
        {messages.map((msg) => {
          const isMe = msg.senderId === CURRENT_USER._id;
          return (
            <div
              key={msg.id}
              className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[75%] p-3 rounded-xl shadow-md transition-all duration-150 ${
                  isMe
                    ? 'bg-indigo-500 text-white rounded-br-sm'
                    : 'bg-white text-gray-800 rounded-tl-sm border border-gray-200'
                }`}
              >
                <p className="text-sm break-words">{msg.text}</p>
                <span className={`text-[10px] block mt-1 text-right ${isMe ? 'text-indigo-200' : 'text-gray-500'}`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <form onSubmit={handleSend} className="p-3 border-t border-gray-100 bg-white flex-shrink-0">
        <div className="flex items-center bg-gray-100 rounded-full pr-1">
          <input
            type="text"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-grow bg-transparent focus:outline-none text-gray-700 py-2.5 px-4"
          />
          <button 
            type="submit"
            className="ml-2 p-1.5 w-11 h-11 rounded-full hover:opacity-80 transition-opacity disabled:opacity-40"
            aria-label="Send message"
            disabled={input.trim() === ''}
          >
            <img 
                src={SendIcon} 
                alt="Send" 
                className="w-full h-full object-contain"
            />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatBox;