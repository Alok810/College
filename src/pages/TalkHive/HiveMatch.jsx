import React, { useState } from "react";
import { Sparkles, Radio, Send, ShieldCheck, Loader2, Lightbulb, Zap, MessageSquare } from "lucide-react";
import { useHiveMatch } from "../../hooks/useHiveMatch";
import rigyaLogo from "../../assets/rigya.png";
import { useAuth } from "../../context/AuthContext";

const TOPIC_CATEGORIES = ["Web Development", "Cybersecurity", "System Design", "Algorithms", "Interviews", "Tech Debates"];

export default function HiveMatch() {
    const { authData } = useAuth();
    const [chatInput, setChatInput] = useState("");

    const hive = useHiveMatch({
        name: authData?.name || "Rigya Student",
        id: authData?._id || "unknown"
    });

    const handleSend = (e) => {
        e.preventDefault();
        hive.sendMessage(chatInput);
        setChatInput("");
    };

    return (
        <div className={`flex flex-col font-sans overflow-hidden transition-colors duration-500 
        ${hive.status !== "idle" ? "bg-[#ebf8ff] -mx-4 md:-mx-6 -mt-0 h-[calc(100vh-0px)]" : "min-h-full w-full bg-[#ebf8ff]"}`}>

            {hive.status !== "idle" ? (
                <div className="flex-1 flex flex-col min-h-0">
                    {/* HEADER */}
                    <div className="h-16 shrink-0 bg-white/80 backdrop-blur-md border-b border-blue-100 px-6 flex items-center justify-between shadow-sm z-10">
                        <div className="flex items-center gap-3">
                            <img src={rigyaLogo} alt="Rigya" className="h-7 w-auto drop-shadow-sm" />
                            <h1 className="text-xl font-black text-gray-900 tracking-tight">Hive <span className="text-indigo-600">Match</span></h1>
                        </div>
                        <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                            <span className="text-xs font-bold uppercase tracking-widest text-emerald-700">158+ Online</span>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col lg:flex-row p-4 gap-4 overflow-hidden min-h-0">

                        {/* 🟢 COLUMN 1: VIDEOS */}
                        <div className="flex flex-col gap-4 shrink-0 min-h-0 overflow-y-auto lg:overflow-hidden w-full lg:w-auto lg:flex-[3]">
                            <div className="relative w-full aspect-[4/3] bg-[#2a2d35] rounded-2xl overflow-hidden shadow-sm border border-gray-300/50 flex items-center justify-center">
                                <video ref={hive.partnerVideoRef} autoPlay playsInline className={`w-full h-full object-cover transition-opacity duration-300 ${hive.isPeerConnected ? 'opacity-100' : 'opacity-0'}`} />
                                {hive.status === "searching" && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#2a2d35] z-10">
                                        <Loader2 size={32} className="text-indigo-400 animate-spin mb-3 opacity-80" />
                                        <p className="text-gray-300 font-medium text-sm">Scanning network...</p>
                                    </div>
                                )}
                                {hive.status === "connected" && !hive.isPeerConnected && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#2a2d35] z-10">
                                        <Loader2 size={32} className="text-indigo-500 animate-spin mb-3" />
                                        <p className="text-white font-bold tracking-wide text-sm">Securing connection...</p>
                                    </div>
                                )}
                                <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-md text-white text-[10px] font-bold z-20 border border-white/10 uppercase tracking-widest">Stranger</div>
                            </div>

                            <div className="relative w-full aspect-[4/3] bg-[#2a2d35] rounded-2xl overflow-hidden shadow-sm border border-gray-300/50">
                                <video ref={hive.myVideoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
                                <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-md text-white text-[10px] font-bold z-20 border border-white/10 uppercase tracking-widest">You</div>
                            </div>
                        </div>

                        {/* 🟢 COLUMN 2: DISCUSSION THEME (DIVIDED INTO TWO PARTS) */}
                        <div className="flex flex-col gap-4 w-full lg:w-auto lg:flex-[4] min-h-0">

                            {/* PART 1: AI CONTROLS CARD */}
                            <div className="bg-white rounded-2xl shadow-sm border border-indigo-100 p-5 shrink-0 relative overflow-hidden">
                                <div className="absolute -right-6 -top-6 text-indigo-500/5"><MessageSquare size={120} /></div>
                                
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-indigo-50 pb-4 mb-4 relative z-10">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-indigo-600 p-2 rounded-xl shadow-md shadow-indigo-600/20">
                                            <Lightbulb size={20} className="text-white" />
                                        </div>
                                        <div>
                                            <h2 className="text-base font-black text-indigo-950 uppercase tracking-widest leading-none">AI Discussion Theme</h2>
                                            <p className="text-[11px] font-bold text-indigo-500 uppercase mt-1 flex items-center gap-1.5">
                                                <Zap size={12} className="fill-current" /> Powered by Gemini 1.5 Flash
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2 relative z-10">
                                    {TOPIC_CATEGORIES.map(category => (
                                        <button
                                            key={category}
                                            onClick={() => hive.generateNewTopic(category)}
                                            disabled={hive.isGeneratingTheme || hive.status !== "connected"}
                                            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${hive.selectedCategory === category
                                                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20 scale-105"
                                                    : "bg-gray-50 text-indigo-600 border border-indigo-100 hover:bg-indigo-50 disabled:opacity-50 disabled:scale-100"
                                                }`}
                                        >
                                            {category}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* PART 2: THE AI GUIDE DISPLAY CARD */}
                            <div className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 rounded-2xl shadow-sm border border-indigo-100 flex-1 flex flex-col items-center justify-center relative overflow-hidden p-4 lg:p-6 min-h-[300px]">
                                <div className="absolute -left-10 -bottom-10 text-purple-500/5"><Sparkles size={200} /></div>

                                {(() => {
                                    // If activeTopic is a string, we are in the "Waiting" or "Error" state.
                                    // If it's an object, we have our fully structured AI Guide!
                                    const isWaiting = typeof hive.activeTopic === "string";

                                    return (
                                        <div className={`bg-white/90 backdrop-blur-xl border border-white rounded-[1.5rem] p-6 lg:p-8 shadow-[0_10px_30px_-10px_rgba(79,70,229,0.15)] w-full h-full transition-all duration-500 relative flex flex-col overflow-hidden ${hive.isGeneratingTheme ? 'opacity-50 scale-[0.98]' : 'opacity-100 scale-100'}`}>
                                            
                                            {isWaiting ? (
                                                /* 🟢 THE WAITING STATE */
                                                <div className="flex flex-col items-center justify-center h-full space-y-4 text-center">
                                                    <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-300 mb-2 shadow-inner">
                                                        {hive.isGeneratingTheme ? <Loader2 size={32} className="animate-spin" /> : <MessageSquare size={32} />}
                                                    </div>
                                                    <h3 className="text-xl md:text-2xl font-black text-slate-700">
                                                        {hive.activeTopic}
                                                    </h3>
                                                </div>
                                            ) : (
                                                /* 🟢 THE DETAILED AI GUIDE STATE */
                                                <div className="flex flex-col h-full relative">
                                                    {/* Decorative Quote Mark */}
                                                    <div className="absolute -top-6 -left-2 text-6xl text-indigo-100 font-serif leading-none select-none opacity-60">"</div>

                                                    {/* The Main Discussion Question */}
                                                    <h3 className="text-xl md:text-2xl font-black text-slate-800 leading-tight tracking-tight relative z-10 mb-4 text-center shrink-0 pb-3 border-b border-indigo-50">
                                                        {hive.activeTopic.question}
                                                    </h3>

                                                    {/* Scrollable Guide Sections */}
                                                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3 mt-2">
                                                        {hive.activeTopic.sections?.map((section, idx) => (
                                                            <div key={idx} className="bg-gradient-to-r from-indigo-50/50 to-purple-50/50 border border-indigo-50 rounded-xl p-4 hover:shadow-sm transition-all text-left">
                                                                <h4 className="text-[11px] font-black uppercase tracking-widest text-indigo-600 mb-2 flex items-center gap-1.5">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-teal-400 shadow-[0_0_5px_rgba(45,212,191,0.5)]"></div>
                                                                    {section.title}
                                                                </h4>
                                                                <ul className="space-y-1.5">
                                                                    {section.points.map((point, pIdx) => (
                                                                        <li key={pIdx} className="text-[13.5px] text-slate-700 font-medium flex items-start gap-2.5">
                                                                            <span className="text-indigo-400 mt-0.5 select-none">•</span>
                                                                            <span className="leading-snug">{point}</span>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>

                        {/* 🟢 COLUMN 3: CHAT BOX */}
                        <div className="bg-white rounded-2xl shadow-sm border border-blue-100 flex flex-col overflow-hidden shrink-0 w-full lg:w-auto lg:flex-[3]">
                            <div ref={hive.chatScrollRef} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 custom-scrollbar bg-slate-50/30">
                                <div className="mb-6 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                                    <h3 className="text-gray-900 font-black text-lg mb-2">Welcome to Hive Match.</h3>
                                    <div className="text-[13px] text-gray-600 space-y-1.5 font-medium">
                                        <p className="text-rose-600 font-bold flex items-center gap-1.5 mb-2">
                                            <ShieldCheck size={16} /> Campus verified users only
                                        </p>
                                        <p>• No nudity, hate speech, or harassment</p>
                                        <p>• Keep it professional.</p>
                                    </div>
                                </div>

                                {hive.messages.map((msg, i) => {
                                    if (msg.system) {
                                        return (
                                            <div key={i} className="flex justify-center my-4">
                                                <span className="bg-indigo-50 text-indigo-500 border border-indigo-100 font-bold text-[10px] uppercase tracking-widest px-3 py-1 rounded-full text-center px-4">
                                                    {msg.text}
                                                </span>
                                            </div>
                                        );
                                    }

                                    const isMe = msg.sender === "You";
                                    return (
                                        <div key={i} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[85%] px-4 py-2 text-[14px] shadow-sm ${isMe
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

                            <div className="shrink-0 p-3 bg-white border-t border-gray-100 flex flex-col gap-2 z-10 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
                                <form onSubmit={handleSend} className="flex items-stretch gap-2">
                                    <input
                                        type="text"
                                        value={chatInput}
                                        onChange={(e) => setChatInput(e.target.value)}
                                        disabled={hive.status !== "connected"}
                                        placeholder={hive.status === "connected" ? "Type a message..." : "Waiting for peer..."}
                                        className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 text-gray-900 disabled:bg-gray-100 text-sm font-medium transition-all"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!chatInput.trim() || hive.status !== "connected"}
                                        className="w-12 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 hover:bg-indigo-600 hover:text-white disabled:opacity-40 transition-all shadow-sm"
                                    >
                                        <Send size={18} className={chatInput.trim() ? "translate-x-0.5 -translate-y-0.5 transition-transform" : ""} />
                                    </button>
                                </form>

                                <div className="flex gap-2 h-10">
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
                    </div>
                </div>
            ) : (
                /* 🟢 LANDING PAGE */
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-4xl mx-auto">
                    <div className="animate-in slide-in-from-bottom-6 duration-700 flex flex-col items-center">
                        <div className="inline-flex items-center gap-2 px-5 py-2 bg-white text-indigo-600 rounded-full text-xs font-black uppercase tracking-widest mb-8 shadow-sm border border-blue-50">
                            <Sparkles size={16} /> Global Student Matchmaking
                        </div>
                        <h2 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter mb-6 leading-none">
                            Meet your next <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500">Study Partner.</span>
                        </h2>
                        <p className="text-lg md:text-xl text-slate-600 font-medium mb-12 max-w-2xl leading-relaxed">
                            Instantly connect with random peers across the network. Start a video session, share knowledge, and grow together.
                        </p>
                        <button onClick={hive.startSearch} className="group px-12 py-5 bg-[#111827] hover:bg-black text-white rounded-full font-black text-xl shadow-2xl hover:shadow-indigo-500/40 hover:-translate-y-1 transition-all flex items-center gap-4">
                            START MATCHMAKING <Radio size={24} className="group-hover:animate-pulse text-indigo-400" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}