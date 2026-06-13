import React, { useRef, useEffect } from "react";
import { MessageSquare, ShieldCheck, Send, Loader2, Sparkles } from "lucide-react";

export default function HiveChatBox({ hive, chatInput, setChatInput, handleSend, setIsKeyboardOpen, isKeyboardOpen, mobileTab }) {
    const inputRef = useRef(null);

    useEffect(() => {
        if (hive.chatScrollRef && hive.chatScrollRef.current) {
            hive.chatScrollRef.current.scrollTop = hive.chatScrollRef.current.scrollHeight;
        }
    }, [hive.messages, hive.chatScrollRef]);

    const onFormSubmit = (e) => {
        e.preventDefault();
        if (!chatInput.trim() || hive.status !== "connected") return;
        handleSend(e);
        setTimeout(() => { if (inputRef.current) inputRef.current.focus(); }, 0);
    };

    return (
        <div className={`bg-white rounded-xl lg:rounded-2xl shadow-sm border border-blue-100 flex-col overflow-hidden flex-1 w-full lg:w-auto lg:flex-[3] min-h-0 ${mobileTab === 'chat' ? 'flex' : 'hidden lg:flex'}`}>
            
            {/* CHAT HEADER */}
            <div className="shrink-0 p-3 lg:p-5 border-b border-gray-50 z-10 bg-white">
                {typeof hive.activeTopic === "object" ? (
                    <div className="p-3 lg:p-4 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl lg:rounded-2xl shadow-md relative overflow-hidden text-white border border-emerald-400/50">
                        <div className="absolute -right-4 -top-4 text-white/10"><MessageSquare size={60} className="lg:w-[80px]" /></div>
                        <h3 className="font-black text-[9px] lg:text-[10px] uppercase tracking-widest mb-1 lg:mb-2 flex items-center gap-1.5 opacity-90 relative z-10">
                            <Sparkles size={12} /> Live Discussion Topic
                        </h3>
                        <p className="text-[12px] lg:text-[14px] font-bold leading-snug lg:leading-relaxed relative z-10 text-white drop-shadow-sm">
                            "{hive.activeTopic.question}"
                        </p>
                    </div>
                ) : (
                    <div className="p-3 lg:p-4 bg-gray-50 rounded-xl lg:rounded-2xl border border-gray-100 text-left">
                        <h3 className="text-gray-900 font-black text-xs lg:text-sm mb-1.5 lg:mb-2 uppercase tracking-wide">WELCOME STUDENT.</h3>
                        <div className="text-[10px] lg:text-[12px] text-gray-600 space-y-1 font-medium">
                            <p className="text-rose-600 font-bold flex items-center gap-1.5 mb-1">
                                <ShieldCheck size={12} className="lg:w-[14px]" /> Campus verified only
                            </p>
                            <p>• Keep it professional.</p>
                        </div>
                    </div>
                )}
            </div>

            {/* MESSAGES LIST */}
            <div ref={hive.chatScrollRef} className="flex-1 overflow-y-auto min-h-0 p-3 lg:p-4 space-y-3 lg:space-y-4 custom-scrollbar bg-slate-50/30">
                {hive.messages.map((msg, i) => {
                    if (msg.system) {
                        return (
                            <div key={i} className="flex justify-center my-3 lg:my-4">
                                <span className="bg-indigo-50 text-indigo-500 border border-indigo-100 font-bold text-[9px] lg:text-[10px] uppercase tracking-widest py-1.5 px-3 lg:px-4 rounded-full text-center">
                                    {msg.text}
                                </span>
                            </div>
                        );
                    }

                    const isMe = msg.sender === "You";
                    return (
                        <div key={i} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] px-4 py-2.5 text-[13px] lg:text-[14px] shadow-sm ${isMe
                                    ? 'bg-indigo-600 text-white rounded-2xl rounded-br-sm'
                                    : 'bg-white text-gray-800 rounded-2xl rounded-bl-sm border border-gray-200'
                                }`}>
                                <span className={`block text-[9px] uppercase tracking-wider font-bold mb-0.5 ${isMe ? 'text-indigo-200' : 'text-gray-400'}`}>
                                    {msg.sender}
                                </span>
                                {msg.text}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* CONTROLS FOOTER */}
            <div className={`shrink-0 p-2 lg:p-3 bg-white border-t border-gray-100 flex flex-col gap-2 z-10 shadow-[0_-4px_10px_rgba(0,0,0,0.02)] ${isKeyboardOpen ? 'rounded-b-xl lg:rounded-none' : ''}`}>
                {/* 🟢 INPUT GAP FIX: Removed pb-1 entirely so the form sits perfectly on the edge */}
                <form onSubmit={onFormSubmit} className="flex items-stretch gap-2">
                    <input
                        ref={inputRef}
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onFocus={() => setIsKeyboardOpen && setIsKeyboardOpen(true)}
                        onBlur={() => setTimeout(() => setIsKeyboardOpen && setIsKeyboardOpen(false), 150)}
                        disabled={hive.status !== "connected"}
                        placeholder={hive.status === "connected" ? "Type a message..." : "Waiting for peer..."}
                        className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 min-h-[48px] outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 text-gray-900 disabled:bg-gray-100 text-sm font-medium transition-all min-w-0"
                    />
                    <button
                        type="submit"
                        disabled={!chatInput.trim() || hive.status !== "connected"}
                        onMouseDown={(e) => e.preventDefault()} 
                        onTouchStart={(e) => e.preventDefault()}
                        className="w-12 min-h-[48px] bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 hover:bg-indigo-600 hover:text-white disabled:opacity-40 transition-all shadow-sm shrink-0"
                    >
                        <Send size={18} className={chatInput.trim() ? "translate-x-0.5 -translate-y-0.5 transition-transform" : ""} />
                    </button>
                </form>

                <div className={`flex gap-2 min-h-[44px] transition-all duration-300 ${isKeyboardOpen ? 'hidden lg:flex' : ''}`}>
                    {hive.status === "connected" ? (
                        <button onClick={hive.skipMatch} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95">
                            Next Stranger
                        </button>
                    ) : (
                        <button disabled className="flex-1 bg-indigo-50 text-indigo-400 rounded-xl font-bold text-sm flex items-center justify-center gap-2 cursor-wait border border-indigo-100">
                            <Loader2 size={16} className="animate-spin" /> Searching
                        </button>
                    )}

                    <button onClick={hive.stopSearch} className="w-20 bg-white border border-gray-200 hover:bg-rose-50 text-gray-600 hover:text-rose-600 hover:border-rose-200 rounded-xl font-bold text-sm flex items-center justify-center transition-all shadow-sm">
                        Stop
                    </button>
                </div>
            </div>
        </div>
    );
}