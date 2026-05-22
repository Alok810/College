import React, { useState } from "react";
import { Sparkles, Radio, Send, ShieldCheck, Loader2, Lightbulb, MessageSquare } from "lucide-react";
import { useHiveMatch } from "../../hooks/useHiveMatch";
import rigyaLogo from "../../assets/rigya.png";
import { useAuth } from "../../context/AuthContext";

const TOPIC_CATEGORIES = [
    "Cybersecurity", "Web Development",
    "Chess Strategies", "Anime Debates",
    "Creative Writing", "Current Affairs",
    "Startups & Business"
];

export default function HiveMatch() {
    const { authData } = useAuth();
    const [chatInput, setChatInput] = useState("");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false); 

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

                        {/* 🟢 COLUMN 2: DISCUSSION THEME */}
                        <div className="flex flex-col gap-4 w-full lg:w-auto lg:flex-[4] min-h-0">

                            {/* PART 1: 1-ROW CUSTOM MULTI-SELECT CARD */}
                            <div className="bg-white rounded-2xl shadow-sm border border-indigo-100 p-4 shrink-0 relative overflow-visible z-20">
                                <div className="absolute -right-6 -top-6 text-indigo-500/5"><MessageSquare size={120} /></div>
                                
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                                    <div className="flex items-center gap-3 shrink-0">
                                        <div className="bg-indigo-600 p-2 rounded-xl shadow-md shadow-indigo-600/20 shrink-0">
                                            <Lightbulb size={20} className="text-white" />
                                        </div>
                                        <h2 className="text-sm md:text-base font-black text-indigo-950 uppercase tracking-widest leading-none">
                                            AI Discussion Theme
                                        </h2>
                                    </div>

                                    <div className="relative shrink-0 w-full md:w-auto min-w-[180px]">
                                        {/* 🟢 UNLOCKED: Dropdown button always works */}
                                        <div 
                                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                            className={`flex items-center justify-between bg-indigo-50 border ${isDropdownOpen ? 'border-indigo-400 ring-2 ring-indigo-500/20' : 'border-indigo-200 hover:bg-indigo-100'} py-2 px-4 rounded-xl cursor-pointer transition-all min-h-[42px] w-full`}
                                        >
                                            <span className="text-indigo-700 text-xs md:text-sm font-bold">
                                                {hive.myTopics.length === 0 ? "Select Topics..." : `${hive.myTopics.length} Topic${hive.myTopics.length > 1 ? 's' : ''} Selected`}
                                            </span>
                                            
                                            <div className="text-indigo-500 transition-transform ml-2 shrink-0">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={isDropdownOpen ? "rotate-180" : ""}><path d="m6 9 6 6 6-6"/></svg>
                                            </div>
                                        </div>

                                        {isDropdownOpen && (
                                            <>
                                                <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)}></div>
                                                
                                                <div className="absolute top-full right-0 mt-2 w-full min-w-[240px] bg-white border border-indigo-100 shadow-xl rounded-xl p-2 z-50 flex flex-col gap-1">
                                                    <div className="flex justify-between items-center px-2 py-1.5 mb-1 border-b border-gray-100">
                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select up to 3</span>
                                                        <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">{hive.myTopics.length}/3</span>
                                                    </div>
                                                    
                                                    {TOPIC_CATEGORIES.map(category => {
                                                        const isSelected = hive.myTopics.includes(category);
                                                        const maxReached = !isSelected && hive.myTopics.length >= 3;
                                                        return (
                                                            <button
                                                                key={category}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    hive.toggleTopic(category);
                                                                }}
                                                                disabled={maxReached}
                                                                className={`text-left px-3 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-between ${
                                                                    isSelected 
                                                                        ? "bg-indigo-50 text-indigo-700" 
                                                                        : "text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed"
                                                                }`}
                                                            >
                                                                {category}
                                                                {isSelected && (
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600"><path d="M20 6 9 17l-5-5"/></svg>
                                                                )}
                                                            </button>
                                                        )
                                                    })}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* PART 1.5: SELECTED TOPICS DISPLAY CARD */}
                            {hive.myTopics.length > 0 && (
                                <div className="bg-white rounded-2xl shadow-sm border border-indigo-100 p-4 shrink-0 flex flex-col sm:flex-row sm:items-center gap-3 relative z-10">
                                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest shrink-0">
                                        Your Topics:
                                    </span>
                                    <div className="flex flex-wrap gap-2">
                                        {hive.myTopics.map(topic => (
                                            <div key={topic} className="flex items-center gap-1.5 bg-indigo-600 text-white text-[12px] font-bold px-3 py-1.5 rounded-lg shadow-sm">
                                                {topic}
                                                {/* 🟢 UNLOCKED: "X" Remove button is always active */}
                                                <button 
                                                    onClick={() => hive.toggleTopic(topic)}
                                                    className="hover:text-indigo-200 transition-colors focus:outline-none ml-1"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* PART 2: THE AI GUIDE DISPLAY CARD */}
                            <div className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 rounded-2xl shadow-sm border border-indigo-100 flex-1 flex flex-col items-center justify-center relative overflow-hidden p-4 lg:p-6 min-h-[300px]">
                                <div className="absolute -left-10 -bottom-10 text-purple-500/5"><Sparkles size={200} /></div>

                                {(() => {
                                    const isWaiting = typeof hive.activeTopic === "string";

                                    return (
                                        <div className={`bg-white/90 backdrop-blur-xl border border-white rounded-[1.5rem] p-6 lg:p-8 shadow-[0_10px_30px_-10px_rgba(79,70,229,0.15)] w-full h-full transition-all duration-500 relative flex flex-col overflow-hidden ${hive.isGeneratingTheme ? 'opacity-50 scale-[0.98]' : 'opacity-100 scale-100'}`}>

                                            {isWaiting ? (
                                                <div className="flex flex-col items-center justify-center h-full space-y-4 text-center">
                                                    <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-300 mb-2 shadow-inner">
                                                        {hive.isGeneratingTheme ? <Loader2 size={32} className="animate-spin" /> : <MessageSquare size={32} />}
                                                    </div>
                                                    <h3 className="text-xl md:text-2xl font-black text-slate-700">
                                                        {hive.activeTopic}
                                                    </h3>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col h-full relative">
                                                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
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
                            
                            <div className="shrink-0 p-4 sm:p-5 border-b border-gray-50 z-10 bg-white">
                                {typeof hive.activeTopic === "object" ? (
                                    <div className="p-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-md relative overflow-hidden text-white border border-indigo-400/50">
                                        <div className="absolute -right-4 -top-4 text-white/10"><MessageSquare size={80} /></div>
                                        <h3 className="font-black text-[10px] uppercase tracking-widest mb-2 flex items-center gap-1.5 opacity-90 relative z-10">
                                            <Sparkles size={12} /> Discussion Topic
                                        </h3>
                                        <p className="text-[14px] font-bold leading-relaxed relative z-10 text-white drop-shadow-sm">
                                            "{hive.activeTopic.question}"
                                        </p>
                                    </div>
                                ) : (
                                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                        <h3 className="text-gray-900 font-black text-sm mb-2 uppercase tracking-wide">Welcome Student.</h3>
                                        <div className="text-[12px] text-gray-600 space-y-1 font-medium">
                                            <p className="text-rose-600 font-bold flex items-center gap-1.5 mb-1">
                                                <ShieldCheck size={14} /> Campus verified only
                                            </p>
                                            <p>• Keep it professional.</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div ref={hive.chatScrollRef} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 custom-scrollbar bg-slate-50/30">
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
                    <div className="animate-in slide-in-from-bottom-6 duration-700 flex flex-col items-center w-full">
                        <div className="inline-flex items-center gap-2 px-5 py-2 bg-white text-indigo-600 rounded-full text-xs font-black uppercase tracking-widest mb-8 shadow-sm border border-blue-50">
                            <Sparkles size={16} /> Global Student Matchmaking
                        </div>
                        <h2 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter mb-6 leading-none">
                            Meet your next <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500">Study Partner.</span>
                        </h2>
                        <p className="text-lg md:text-xl text-slate-600 font-medium mb-8 max-w-2xl leading-relaxed">
                            Instantly connect with peers based on shared interests. <br/>
                            <span className="text-indigo-500 font-bold">Select up to 3 topics below to begin.</span>
                        </p>

                        <div className="flex flex-wrap justify-center gap-2.5 mb-10 max-w-3xl">
                            {TOPIC_CATEGORIES.map(category => {
                                const isSelected = hive.myTopics.includes(category);
                                const maxReached = !isSelected && hive.myTopics.length >= 3;
                                return (
                                    <button
                                        key={category}
                                        onClick={() => hive.toggleTopic(category)}
                                        disabled={maxReached}
                                        className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all border ${
                                            isSelected 
                                                ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-500/30 scale-105" 
                                                : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:text-indigo-600 shadow-sm disabled:opacity-50 disabled:scale-100"
                                        }`}
                                    >
                                        {category}
                                        {isSelected && <span className="ml-2 bg-white/20 px-1.5 py-0.5 rounded text-[10px]">&times;</span>}
                                    </button>
                                )
                            })}
                        </div>

                        <button 
                            onClick={hive.startSearch} 
                            disabled={hive.myTopics.length === 0}
                            className="group px-12 py-5 bg-[#111827] hover:bg-black text-white rounded-full font-black text-xl shadow-2xl hover:shadow-indigo-500/40 hover:-translate-y-1 transition-all flex items-center gap-4 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none disabled:cursor-not-allowed"
                        >
                            {hive.myTopics.length === 0 ? "SELECT A TOPIC TO START" : "START MATCHMAKING"} 
                            <Radio size={24} className={hive.myTopics.length > 0 ? "group-hover:animate-pulse text-indigo-400" : "text-gray-500"} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}