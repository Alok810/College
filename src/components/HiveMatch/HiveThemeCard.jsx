import React from "react";
import { Lightbulb, MessageSquare, Sparkles, Loader2 } from "lucide-react";

export default function HiveThemeCard({ hive, topicCategories, allDisplayedTopics, isDropdownOpen, setIsDropdownOpen, mobileTab }) {
    return (
        // 🟢 THE FIX: Added flex-1 to allow it to dynamically shrink to fit the screen
        <div className={`flex-col gap-2 lg:gap-4 flex-1 w-full lg:w-auto lg:flex-[4] min-h-0 ${mobileTab === 'theme' ? 'flex' : 'hidden lg:flex'}`}>
            
            {/* TOPIC CONTROLS */}
            <div className="bg-white rounded-xl lg:rounded-2xl shadow-sm border border-indigo-100 p-2.5 lg:p-4 shrink-0 relative overflow-visible z-20">
                <div className="absolute -right-6 -top-6 text-indigo-500/5"><MessageSquare size={100} className="lg:w-[120px]" /></div>
                
                <div className="flex flex-row items-center justify-between gap-2 lg:gap-4 relative z-10 w-full">
                    <div className="flex items-center gap-1.5 lg:gap-3 shrink-0">
                        <div className="bg-indigo-600 p-1.5 lg:p-2 rounded-lg lg:rounded-xl shadow-md shadow-indigo-600/20 shrink-0">
                            <Lightbulb size={14} className="text-white lg:w-5 lg:h-5" />
                        </div>
                        <h2 className="text-[11px] lg:text-base font-black text-indigo-950 uppercase tracking-widest leading-none">
                            <span className="lg:hidden">Topic</span>
                            <span className="hidden lg:inline">AI Discussion Theme</span>
                        </h2>
                    </div>

                    <div className="relative shrink-0 w-auto lg:w-auto min-w-[130px] lg:min-w-[180px]">
                        <div 
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className={`flex items-center justify-between bg-indigo-50 border ${isDropdownOpen ? 'border-indigo-400 ring-2 ring-indigo-500/20' : 'border-indigo-200 hover:bg-indigo-100'} py-1.5 lg:py-2 px-2.5 lg:px-4 rounded-xl cursor-pointer transition-all min-h-[34px] lg:min-h-[42px] w-full`}
                        >
                            <span className="text-indigo-700 text-[10px] lg:text-sm font-bold truncate pr-1">
                                {hive.status === "connected" 
                                    ? "Change Topic" 
                                    : hive.myTopics.length === 0 ? "Select Topics" : `${hive.myTopics.length} Topic${hive.myTopics.length > 1 ? 's' : ''}`}
                            </span>
                            <div className="text-indigo-500 transition-transform shrink-0">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={isDropdownOpen ? "rotate-180 lg:w-4 lg:h-4" : "lg:w-4 lg:h-4"}><path d="m6 9 6 6 6-6"/></svg>
                            </div>
                        </div>

                        {isDropdownOpen && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)}></div>
                                <div className="absolute top-full right-0 mt-2 w-full min-w-[200px] lg:min-w-[240px] bg-white border border-indigo-100 shadow-xl rounded-xl p-1.5 lg:p-2 z-50 flex flex-col gap-1 max-h-[40vh] overflow-y-auto custom-scrollbar">
                                    <div className="flex justify-between items-center px-2 py-1.5 lg:py-2 mb-1 border-b border-gray-100">
                                        <span className="text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            {hive.status === "connected" ? "Generate New" : "Select up to 3"}
                                        </span>
                                        {hive.status !== "connected" && (
                                            <span className="text-[9px] lg:text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">{hive.myTopics.length}/3</span>
                                        )}
                                    </div>
                                    
                                    {topicCategories.map(category => {
                                        const isSelected = hive.myTopics.includes(category);
                                        const maxReached = hive.status !== "connected" && !isSelected && hive.myTopics.length >= 3;
                                        return (
                                            <button
                                                key={category}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (hive.status === "connected") {
                                                        hive.generateNewTopic(category);
                                                        setIsDropdownOpen(false);
                                                    } else {
                                                        hive.toggleTopic(category);
                                                    }
                                                }}
                                                disabled={hive.status === "connected" ? hive.isGeneratingTheme : maxReached}
                                                className={`text-left px-3 lg:px-4 py-2 lg:py-3 rounded-lg text-xs lg:text-sm font-bold transition-all flex items-center justify-between ${
                                                    (isSelected && hive.status !== "connected") 
                                                        ? "bg-indigo-50 text-indigo-700" 
                                                        : "text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed"
                                                }`}
                                            >
                                                {category}
                                                {(isSelected && hive.status !== "connected") && (
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600 lg:w-4 lg:h-4"><path d="M20 6 9 17l-5-5"/></svg>
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

            {/* SELECTED TOPICS PILL CARD */}
            {allDisplayedTopics.length > 0 && (
                <div className="bg-white rounded-xl lg:rounded-2xl shadow-sm border border-indigo-100 p-2.5 lg:p-4 shrink-0 flex flex-col gap-2 lg:gap-3 relative z-10">
                    <div className="flex items-center justify-between">
                        <span className="text-[8px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest shrink-0">
                            ACTIVE INTERESTS:
                        </span>
                        {hive.status === "connected" && (
                            <div className="flex items-center gap-1.5 lg:gap-2 text-[7px] lg:text-[9px] font-bold uppercase tracking-wider text-slate-400">
                                <span className="flex items-center gap-0.5 lg:gap-1"><div className="w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full bg-emerald-500"></div>Match</span>
                                <span className="flex items-center gap-0.5 lg:gap-1"><div className="w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full bg-indigo-600"></div>You</span>
                                <span className="flex items-center gap-0.5 lg:gap-1"><div className="w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full bg-fuchsia-500"></div>Stranger</span>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-1 lg:gap-2">
                        {allDisplayedTopics.map(topic => {
                            const isMine = hive.myTopics.includes(topic);
                            const isPartners = hive.partnerTopics?.includes(topic);
                            const isMatch = isMine && isPartners;

                            let colorClasses = "bg-indigo-600 text-white shadow-indigo-500/30 border-indigo-600 border"; 
                            if (hive.status === "connected") {
                                if (isMatch) colorClasses = "bg-emerald-500 text-white shadow-emerald-500/30 border-emerald-500 border";
                                else if (isMine) colorClasses = "bg-indigo-600 text-white shadow-indigo-500/30 border-indigo-600 border";
                                else if (isPartners) colorClasses = "bg-fuchsia-500 text-white shadow-fuchsia-500/30 border-fuchsia-500 border";
                            }

                            return (
                                <button 
                                    key={topic} 
                                    onClick={() => hive.toggleTopic(topic)}
                                    disabled={!isMine && hive.myTopics.length >= 3}
                                    title={!isMine ? "Click to match this topic!" : "Click to remove"}
                                    className={`flex items-center gap-1 lg:gap-1.5 text-[9px] lg:text-[13px] font-bold px-2 py-1 lg:px-3 lg:py-2 rounded-md lg:rounded-lg shadow-sm transition-all hover:-translate-y-0.5 disabled:hover:translate-y-0 disabled:opacity-60 ${colorClasses}`}
                                >
                                    {topic}
                                    {isMine && <span className="ml-0.5 lg:ml-1 text-[10px] lg:text-[12px] opacity-70 font-black">&times;</span>}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* AI GUIDE DISPLAY CARD */}
            <div className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 rounded-xl lg:rounded-2xl shadow-sm border border-indigo-100 flex-1 flex flex-col items-center justify-center relative overflow-hidden p-3 lg:p-6 min-h-0">
                <div className="absolute -left-10 -bottom-10 text-purple-500/5"><Sparkles size={150} className="lg:w-[200px]" /></div>

                {(() => {
                    const isWaiting = typeof hive.activeTopic === "string";
                    return (
                        <div className={`bg-white/90 backdrop-blur-xl border border-white rounded-[1rem] lg:rounded-[1.5rem] p-4 lg:p-8 shadow-[0_10px_30px_-10px_rgba(79,70,229,0.15)] w-full h-full transition-all duration-500 relative flex flex-col overflow-hidden ${hive.isGeneratingTheme ? 'opacity-50 scale-[0.98]' : 'opacity-100 scale-100'}`}>
                            {isWaiting ? (
                                <div className="flex flex-col items-center justify-center h-full space-y-3 lg:space-y-4 text-center">
                                    <div className="w-10 h-10 lg:w-16 lg:h-16 bg-indigo-50 rounded-xl lg:rounded-2xl flex items-center justify-center text-indigo-300 mb-1 lg:mb-2 shadow-inner">
                                        {hive.isGeneratingTheme ? <Loader2 size={20} className="animate-spin lg:w-8 lg:h-8" /> : <MessageSquare size={20} className="lg:w-8 lg:h-8" />}
                                    </div>
                                    <h3 className="text-sm lg:text-2xl font-black text-slate-700 px-2 lg:px-4">
                                        {hive.activeTopic}
                                    </h3>
                                </div>
                            ) : (
                                <div className="flex flex-col h-full relative">
                                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 lg:pr-2 space-y-2.5 lg:space-y-3 min-h-0">
                                        {hive.activeTopic.sections?.map((section, idx) => (
                                            <div key={idx} className="bg-gradient-to-r from-indigo-50/50 to-purple-50/50 border border-indigo-50 rounded-xl p-3 lg:p-4 hover:shadow-sm transition-all text-left">
                                                <h4 className="text-[10px] lg:text-[11px] font-black uppercase tracking-widest text-indigo-600 mb-1.5 lg:mb-2 flex items-center gap-1.5">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-teal-400 shadow-[0_0_5px_rgba(45,212,191,0.5)]"></div>
                                                    {section.title}
                                                </h4>
                                                <ul className="space-y-1.5 lg:space-y-2">
                                                    {section.points.map((point, pIdx) => (
                                                        <li key={pIdx} className="text-[11px] lg:text-[14px] text-slate-700 font-medium flex items-start gap-2 lg:gap-2.5">
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
    );
}