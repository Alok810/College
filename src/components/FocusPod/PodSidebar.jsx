import React, { useState } from "react";
import { MessageSquare, Code, X, Send } from "lucide-react";

export default function PodSidebar({
  isSidebarOpen, setIsSidebarOpen, activeTab, setActiveTab,
  chatScrollRef, messages, sendChat, codeText, updateCode
}) {
  const [newMessage, setNewMessage] = useState("");

  if (!isSidebarOpen) return null;

  const handleSend = (e) => {
    e.preventDefault();
    sendChat(newMessage);
    setNewMessage("");
  };

  return (
    <div className="absolute inset-0 z-40 lg:relative lg:inset-auto lg:z-auto w-full lg:w-96 bg-white border border-gray-200 rounded-2xl sm:rounded-3xl shadow-2xl lg:shadow-lg flex flex-col overflow-hidden lg:min-h-[400px]">
        <div className="flex border-b border-gray-100 bg-gray-50">
            <button onClick={() => setActiveTab('chat')} className={`flex-1 p-3 sm:p-4 font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === 'chat' ? 'text-purple-600 border-b-2 border-purple-600 bg-white' : 'text-gray-500 hover:bg-gray-100'}`}><MessageSquare size={18}/> Chat</button>
            <button onClick={() => setActiveTab('code')} className={`flex-1 p-3 sm:p-4 font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === 'code' ? 'text-emerald-600 border-b-2 border-emerald-600 bg-white' : 'text-gray-500 hover:bg-gray-100'}`}><Code size={18}/> Code Pad</button>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-3 sm:p-4 text-gray-500 hover:bg-gray-200"><X size={18} /></button>
        </div>
        {activeTab === 'chat' ? (
            <>
                <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 custom-scrollbar bg-white">
                    {messages.length === 0 && <p className="text-center text-gray-400 text-xs sm:text-sm mt-10">Send a message to start!</p>}
                    {messages.map((msg, i) => (
                        <div key={i} className={`flex flex-col max-w-[85%] ${msg.sender === 'me' ? 'self-end items-end' : 'self-start items-start'}`}>
                            <div className={`p-2.5 rounded-2xl ${msg.sender === 'me' ? 'bg-purple-600 text-white rounded-tr-sm' : 'bg-gray-100 text-gray-800 rounded-tl-sm'}`}>
                                <p className="text-xs sm:text-sm break-words whitespace-pre-wrap">{msg.text}</p>
                            </div>
                            <span className="text-[9px] text-gray-400 mt-1">{msg.time}</span>
                        </div>
                    ))}
                </div>
                <form onSubmit={handleSend} className="p-3 border-t border-gray-100 flex gap-2">
                    <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a message..." className="flex-1 bg-gray-100 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 ring-purple-300" />
                    <button type="submit" disabled={!newMessage.trim()} className="bg-purple-600 text-white p-2 rounded-xl disabled:opacity-50"><Send size={16}/></button>
                </form>
            </>
        ) : (
            <div className="flex-1 flex flex-col bg-[#1e1e1e] relative">
                <div className="px-4 py-2 bg-[#2d2d2d] text-xs font-mono text-gray-400 flex justify-between items-center border-b border-gray-700"><span>Shared Editor (Live)</span><span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span></div>
                <textarea value={codeText} onChange={(e) => updateCode(e.target.value)} spellCheck="false" className="flex-1 w-full p-4 bg-transparent text-[#9cdcfe] font-mono text-sm sm:text-base outline-none resize-none custom-scrollbar leading-relaxed" />
            </div>
        )}
    </div>
  );
}