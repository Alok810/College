import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Check, CheckCheck, Smile, Trash2, Image as ImageIcon, X, Video } from 'lucide-react';
import SendIcon from '../assets/send.png'; 
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import VideoCall from './VideoCall';

const ChatBox = ({ onBack }) => {
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false); 
  
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSending, setIsSending] = useState(false);
  
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  
  // ✅ NEW: State to store incoming call data
  const [incomingCallData, setIncomingCallData] = useState(null);
  
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const inputRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const fileInputRef = useRef(null); 
  
  const { activeChat, messages, sendNewMessage, typingChats, emitTyping, emitStopTyping, handleDeleteMessage, onlineUsers, socket } = useChat();
  const { authData } = useAuth();

  const selectedUser = activeChat?.participants.find(p => p._id !== authData._id);

  // ✅ NEW: Listen for incoming calls even when the modal is closed!
useEffect(() => {
    if (!socket) return;
    
    const handleIncomingCall = (data) => {
      // ✅ ADD THESE CONSOLE LOGS:
      console.log("🚨 FRONTEND: Received a call signal from the server!", data);
      console.log(`Comparing Caller (${data.from}) with Open Chat (${selectedUser?._id})`);

      if (selectedUser && data.from === selectedUser._id) {
        console.log("✅ MATCH! Opening the video modal now!");
        setIncomingCallData(data);
        setIsVideoModalOpen(true);
      } else {
        console.log("❌ IGNORED: The IDs didn't match, or selectedUser is missing.");
      }
    };

    socket.on("call-incoming", handleIncomingCall);
    return () => socket.off("call-incoming", handleIncomingCall);
  }, [socket, selectedUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingChats, imagePreview]); 

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!activeChat) return null;
  
  const avatar = selectedUser?.profilePicture || `https://ui-avatars.com/api/?name=${selectedUser?.name || 'User'}&background=EBF4FF&color=4F46E5`;
  const isOnline = onlineUsers.includes(selectedUser._id); 

  const handleTyping = (e) => {
    setInput(e.target.value);
    if (!isTyping) {
      setIsTyping(true);
      emitTyping(selectedUser._id, activeChat._id);
    }
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      emitStopTyping(selectedUser._id, activeChat._id);
    }, 2000);
  };

  const handleEmojiClick = (emojiData) => {
    const actualEmoji = emojiData.native;
    if (!actualEmoji) return;
    const inputEl = inputRef.current;
    if (!inputEl) return;
    const start = inputEl.selectionStart;
    const end = inputEl.selectionEnd;
    
    const newText = input.substring(0, start) + actualEmoji + input.substring(end);
    setInput(newText);
    
    setTimeout(() => {
      inputEl.focus();
      inputEl.setSelectionRange(start + actualEmoji.length, start + actualEmoji.length);
    }, 10);
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    if (fileInputRef.current) fileInputRef.current.value = ""; 
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    
    if (input.trim() === '' && !imageFile) return;

    setIsSending(true);
    clearTimeout(typingTimeoutRef.current);
    setIsTyping(false);
    emitStopTyping(selectedUser._id, activeChat._id);
    setShowEmojiPicker(false); 

    const formData = new FormData();
    formData.append("chatId", activeChat._id);
    
    formData.append("content", input.trim() || " "); 
    
    if (imageFile) {
        formData.append("image", imageFile);
    }

    try {
      await sendNewMessage(formData);
      setInput('');
      removeImage(); 
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send: " + error.message); 
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full relative">
      
      {/* Chat Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-100 bg-white flex-shrink-0 z-10">
        <div className="flex items-center">
          <button onClick={onBack} className="p-1 mr-2 rounded-full hover:bg-gray-100 text-gray-700 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <Link to={`/profile/${selectedUser?._id}`} className='flex items-center group cursor-pointer'>
            <div className="relative mr-3">
              <img src={avatar} alt={selectedUser?.name} className="w-10 h-10 rounded-full object-cover border border-gray-200" />
              {isOnline && (
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
              )}
            </div>
            <div>
               <h3 className="font-bold text-lg leading-tight text-gray-800 hover:underline">
                 {selectedUser?.name || selectedUser?.full_name}
               </h3>
               {typingChats.includes(activeChat._id) ? (
                   <p className="text-xs text-indigo-500 font-medium italic animate-pulse">is typing...</p>
               ) : (
                  <p className="text-xs text-gray-400">{isOnline ? 'Active now' : 'Offline'}</p> 
               )}
            </div>
          </Link>
        </div>

        <button 
          onClick={() => setIsVideoModalOpen(true)}
          className="p-2 mr-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-full transition-colors"
          title="Start Video Call"
        >
          <Video size={20} />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-grow overflow-y-auto p-4 space-y-3 bg-gray-50 no-scrollbar relative z-0">
        {messages.map((msg) => {
          const isMe = msg.sender._id === authData._id;
          return (
            <div key={msg._id} className={`group flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
              
              {isMe && (
                <button 
                  onClick={() => handleDeleteMessage(msg._id)}
                  className="opacity-0 group-hover:opacity-100 text-red-300 hover:text-red-500 transition-all p-1 mb-1 rounded-full hover:bg-red-50"
                  title="Unsend message"
                >
                  <Trash2 size={14} />
                </button>
              )}

              <div className={`max-w-[75%] p-2.5 rounded-xl shadow-sm transition-all duration-150 ${
                  isMe ? 'bg-indigo-500 text-white rounded-br-sm' : 'bg-white text-gray-800 rounded-tl-sm border border-gray-200'
                }`}
              >
                {msg.image && (
                  <img 
                    src={msg.image} 
                    alt="Chat attachment" 
                    className="max-w-full rounded-lg mb-1 cursor-pointer hover:opacity-95 transition-opacity" 
                    style={{ maxHeight: '250px', objectFit: 'contain' }}
                  />
                )}

                {msg.content && (
                  <p className="text-sm break-words leading-relaxed">{msg.content}</p>
                )}
                
                <div className={`flex items-center justify-end gap-1 mt-1 ${isMe ? 'text-indigo-200' : 'text-gray-400'}`}>
                  <span className="text-[10px]">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {isMe && (
                    <span className="ml-1">
                      {msg.seen ? <CheckCheck size={14} className="text-blue-300" /> : <Check size={14} />}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        
        {typingChats.includes(activeChat._id) && (
           <div className="flex justify-start">
             <div className="bg-gray-200 text-gray-500 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm flex gap-1 items-center">
               <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
               <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
               <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
             </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Box with Image Preview & Emoji Button */}
      <div className="bg-white flex-shrink-0 relative z-20 border-t border-gray-100">
        
        {imagePreview && (
          <div className="p-3 bg-gray-50 border-b border-gray-100 relative">
            <div className="relative inline-block">
              <img src={imagePreview} className="h-20 w-20 rounded-lg object-cover border border-gray-300 shadow-sm" alt="Preview" />
              <button 
                onClick={removeImage} 
                className="absolute -top-2 -right-2 bg-gray-800 text-white rounded-full p-1 hover:bg-red-500 transition-colors shadow-md"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSend} className="p-3">
          
          {showEmojiPicker && (
            <div ref={emojiPickerRef} className="absolute bottom-16 left-2 shadow-2xl rounded-xl bg-white border border-gray-100 overflow-hidden"> 
              <style>{`em-emoji-picker { height: 320px !important; }`}</style>
              <Picker 
                data={data} 
                onEmojiSelect={handleEmojiClick} 
                theme="light"
                previewPosition="none" 
                skinTonePosition="none"
                perLine={8}          
                emojiSize={22}       
                emojiButtonSize={32} 
                maxFrequentRows={1}  
              />
            </div>
          )}

          <div className="flex items-center bg-gray-100 rounded-full pr-1 pl-1">
            
            <input 
              type="file" 
              accept="image/*" 
              ref={fileInputRef} 
              onChange={handleImageSelect} 
              className="hidden" 
            />
            <button 
              type="button" 
              onClick={() => fileInputRef.current.click()} 
              className="flex-shrink-0 p-2 ml-1 text-gray-500 hover:text-indigo-600 hover:bg-gray-200 rounded-full transition-colors"
              title="Attach an image"
            >
              <ImageIcon size={20} />
            </button>

            <button 
              type="button" 
              onClick={(e) => { e.preventDefault(); setShowEmojiPicker(!showEmojiPicker); }} 
              className="flex-shrink-0 p-2 text-gray-500 hover:text-indigo-600 hover:bg-gray-200 rounded-full transition-colors"
            >
              <Smile size={20} />
            </button>

            <input
              ref={inputRef}
              type="text"
              placeholder="Type a message..."
              value={input}
              onChange={handleTyping} 
              className="flex-grow min-w-0 bg-transparent focus:outline-none text-gray-700 py-2.5 px-3"
            />
            
            <button 
              type="submit" 
              className="flex-shrink-0 ml-1 p-1.5 w-11 h-11 rounded-full hover:opacity-80 disabled:opacity-40 transition-all" 
              disabled={isSending || (input.trim() === '' && !imageFile)}
            >
              {isSending ? (
                <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin m-auto"></div>
              ) : (
                <img src={SendIcon} alt="Send" className="w-full h-full object-contain" />
              )}
            </button>
          </div>
        </form>
      </div>

      {/* ✅ FIXED: Pass incoming call data down to VideoCall and reset it on close */}
      {isVideoModalOpen && socket && (
        <VideoCall 
           socket={socket} 
           myId={authData._id}
           otherUserId={selectedUser._id}
           otherUserName={selectedUser?.name || selectedUser?.full_name}
           onClose={() => {
              setIsVideoModalOpen(false);
              setIncomingCallData(null); // Clear the call data when closed
           }}
           incomingCall={incomingCallData} // Pass the incoming ping
        />
      )}

    </div>
  );
};

export default ChatBox;