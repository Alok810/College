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
    // 🟢 Mobile: Full screen absolute overlay. Desktop: Right-side fixed panel.
    <div className="absolute inset-0 z-50 md:relative md:inset-auto md:w-96 bg-white flex flex-col h-full animate-in slide-in-from-right-4 duration-300 shadow-[-10px_0_30px_rgba(0,0,0,0.2)]">
        
        {/* Header Tabs */}
        <div className="flex border-b border-gray-200 bg-gray-50 pt-safe">
            <button onClick={() => setActiveTab('chat')} className={`flex-1 p-4 font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === 'chat' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-white' : 'text-gray-500 hover:bg-gray-100'}`}><MessageSquare size={18}/> Chat</button>
            <button onClick={() => setActiveTab('code')} className={`flex-1 p-4 font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === 'code' ? 'text-emerald-600 border-b-2 border-emerald-600 bg-white' : 'text-gray-500 hover:bg-gray-100'}`}><Code size={18}/> Code</button>
            <button onClick={() => setIsSidebarOpen(false)} className="p-4 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"><X size={24} /></button>
        </div>

        {/* Content Area */}
        {activeTab === 'chat' ? (
            <div className="flex-1 flex flex-col h-0">
                <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 custom-scrollbar bg-white">
                    {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                            <MessageSquare size={32} className="mb-2 opacity-20" />
                            <p className="text-sm font-medium">No messages yet</p>
                        </div>
                    )}
                    {messages.map((msg, i) => (
                        <div key={i} className={`flex flex-col max-w-[85%] ${msg.sender === 'me' ? 'self-end items-end' : 'self-start items-start'}`}>
                            <div className={`p-3 rounded-2xl shadow-sm border ${msg.sender === 'me' ? 'bg-indigo-600 text-white rounded-tr-sm border-indigo-700' : 'bg-gray-50 text-gray-800 rounded-tl-sm border-gray-100'}`}>
                                <p className="text-sm break-words whitespace-pre-wrap leading-snug">{msg.text}</p>
                            </div>
                            <span className="text-[10px] text-gray-400 mt-1 font-medium">{msg.time}</span>
                        </div>
                    ))}
                </div>
                <form onSubmit={handleSend} className="p-3 border-t border-gray-200 flex gap-2 bg-gray-50 pb-safe">
                    <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a message..." className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 ring-indigo-500/20 focus:border-indigo-400 transition-all shadow-sm" />
                    <button type="submit" disabled={!newMessage.trim()} className="bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-xl disabled:opacity-50 transition-colors shadow-sm"><Send size={18}/></button>
                </form>
            </div>
        ) : (
            <div className="flex-1 flex flex-col bg-[#1e1e1e] relative h-0">
                <div className="px-4 py-2 bg-[#2d2d2d] text-xs font-mono text-gray-400 flex justify-between items-center border-b border-gray-700 shadow-md z-10">
                    <span>Shared Pad (Live)</span>
                    <span className="flex items-center gap-1.5 text-emerald-400"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Syncing</span>
                </div>
                <textarea value={codeText} onChange={(e) => updateCode(e.target.value)} spellCheck="false" className="flex-1 w-full p-4 bg-transparent text-[#9cdcfe] font-mono text-sm outline-none resize-none custom-scrollbar leading-relaxed pb-safe" placeholder="// Start typing to share code..." />
            </div>
        )}
    </div>
  );
}