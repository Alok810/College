import React, { useState, useRef } from "react";
import { MessageSquare, Code, X, Send } from "lucide-react";

export default function PodSidebar({
  isSidebarOpen, setIsSidebarOpen, activeTab, setActiveTab,
  chatScrollRef, messages, sendChat, codeText, updateCode,
  setIsKeyboardOpen 
}) {
  const [newMessage, setNewMessage] = useState("");
  const inputRef = useRef(null);

  if (!isSidebarOpen) return null;

  const handleSend = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    sendChat(newMessage);
    setNewMessage("");
    
    setTimeout(() => {
        if (inputRef.current) inputRef.current.focus();
    }, 0);
  };

  return (
    // 🟢 THE PUSH FIX: Replaced min-h-[300px] with min-h-0. Now it smoothly shrinks instead of forcing the whole screen up!
    <div className="flex-1 w-full lg:w-[400px] lg:flex-none bg-white flex flex-col h-full rounded-2xl lg:rounded-3xl shadow-xl border border-gray-200 overflow-hidden animate-in fade-in duration-300 min-h-0">
        
        <div className="flex border-b border-gray-200 bg-gray-50 shrink-0 pt-[max(env(safe-area-inset-top,0px),0px)] md:pt-0">
            <button onClick={() => setActiveTab('chat')} className={`flex-1 py-3 sm:py-4 font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === 'chat' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-white' : 'text-gray-500 hover:bg-gray-100'}`}><MessageSquare size={16} className="sm:w-[18px] sm:h-[18px]"/> Chat</button>
            <button onClick={() => setActiveTab('code')} className={`flex-1 py-3 sm:py-4 font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === 'code' ? 'text-emerald-600 border-b-2 border-emerald-600 bg-white' : 'text-gray-500 hover:bg-gray-100'}`}><Code size={16} className="sm:w-[18px] sm:h-[18px]"/> Code</button>
            <button onClick={() => setIsSidebarOpen(false)} className="px-4 sm:px-5 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"><X size={20} className="sm:w-6 sm:h-6" /></button>
        </div>

        {activeTab === 'chat' ? (
            <div className="flex-1 flex flex-col h-0">
                <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-3 sm:p-4 flex flex-col gap-3 sm:gap-4 custom-scrollbar bg-white">
                    {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                            <MessageSquare size={36} className="mb-3 opacity-20" />
                            <p className="text-sm font-medium">No messages yet</p>
                        </div>
                    )}
                    {messages.map((msg, i) => (
                        <div key={i} className={`flex flex-col max-w-[85%] ${msg.sender === 'me' ? 'self-end items-end' : 'self-start items-start'}`}>
                            <div className={`p-2.5 sm:p-3 rounded-2xl shadow-sm border ${msg.sender === 'me' ? 'bg-indigo-600 text-white rounded-tr-sm border-indigo-700' : 'bg-gray-50 text-gray-800 rounded-tl-sm border-gray-100'}`}>
                                <p className="text-xs sm:text-sm break-words whitespace-pre-wrap leading-snug">{msg.text}</p>
                            </div>
                            <span className="text-[9px] sm:text-[10px] text-gray-400 mt-1.5 font-medium">{msg.time}</span>
                        </div>
                    ))}
                </div>
                
                <form onSubmit={handleSend} className="p-2 sm:p-3 border-t border-gray-200 flex gap-2 bg-gray-50 shrink-0 pb-2 md:pb-3">
                    <input 
                        ref={inputRef}
                        type="text" 
                        value={newMessage} 
                        onChange={(e) => setNewMessage(e.target.value)} 
                        onFocus={() => setIsKeyboardOpen && setIsKeyboardOpen(true)}
                        onBlur={() => {
                            setTimeout(() => setIsKeyboardOpen && setIsKeyboardOpen(false), 150);
                        }}
                        placeholder="Type a message..." 
                        className="flex-1 bg-white border border-gray-200 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm outline-none focus:ring-2 ring-indigo-500/20 focus:border-indigo-400 transition-all shadow-sm" 
                    />
                    <button 
                        type="submit" 
                        disabled={!newMessage.trim()} 
                        onMouseDown={(e) => e.preventDefault()} 
                        onTouchStart={(e) => e.preventDefault()}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white w-10 sm:w-12 flex items-center justify-center rounded-xl disabled:opacity-50 transition-colors shadow-sm"
                    >
                        <Send size={16} className="sm:w-[18px] sm:h-[18px]"/>
                    </button>
                </form>
            </div>
        ) : (
            <div className="flex-1 flex flex-col bg-[#1e1e1e] relative h-0">
                <div className="px-4 py-2 sm:py-3 bg-[#2d2d2d] text-[10px] sm:text-xs font-mono text-gray-400 flex justify-between items-center border-b border-gray-700 shadow-md z-10 shrink-0">
                    <span>Shared Pad (Live)</span>
                    <span className="flex items-center gap-1.5 text-emerald-400"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Syncing</span>
                </div>
                <textarea 
                    value={codeText} 
                    onChange={(e) => updateCode(e.target.value)} 
                    onFocus={() => setIsKeyboardOpen && setIsKeyboardOpen(true)}
                    onBlur={() => {
                        setTimeout(() => setIsKeyboardOpen && setIsKeyboardOpen(false), 150);
                    }}
                    spellCheck="false" 
                    className="flex-1 w-full p-3 sm:p-4 bg-transparent text-[#9cdcfe] font-mono text-xs sm:text-sm outline-none resize-none custom-scrollbar leading-relaxed pb-2 md:pb-4" 
                    placeholder="// Start typing to share code..." 
                />
            </div>
        )}
    </div>
  );
}