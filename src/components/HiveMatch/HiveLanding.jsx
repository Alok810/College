import React from "react";
import { Sparkles, Radio } from "lucide-react";

export default function HiveLanding({ hive, topicCategories }) {
    return (
        <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 text-center max-w-4xl mx-auto pb-[max(env(safe-area-inset-bottom,40px),40px)]">
            <div className="animate-in slide-in-from-bottom-6 duration-700 flex flex-col items-center w-full">
                <div className="inline-flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-1.5 sm:py-2 bg-white text-indigo-600 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-widest mb-6 sm:mb-8 shadow-sm border border-blue-50">
                    <Sparkles size={14} className="sm:w-4 sm:h-4" /> Global Student Matchmaking
                </div>
                <h2 className="text-4xl sm:text-5xl md:text-7xl font-black text-slate-900 tracking-tighter mb-4 sm:mb-6 leading-none">
                    Meet your next <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500">Study Partner.</span>
                </h2>
                <p className="text-base sm:text-lg md:text-xl text-slate-600 font-medium mb-6 sm:mb-8 max-w-2xl leading-relaxed px-2">
                    Instantly connect with peers based on shared interests. <br/>
                    <span className="text-indigo-500 font-bold">Select up to 3 topics below to begin.</span>
                </p>

                <div className="flex flex-wrap justify-center gap-2 sm:gap-2.5 mb-8 sm:mb-10 max-w-3xl">
                    {topicCategories.map(category => {
                        const isSelected = hive.myTopics.includes(category);
                        const maxReached = !isSelected && hive.myTopics.length >= 3;
                        return (
                            <button
                                key={category}
                                onClick={() => hive.toggleTopic(category)}
                                disabled={maxReached}
                                className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all border ${
                                    isSelected 
                                        ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-500/30 scale-105" 
                                        : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:text-indigo-600 shadow-sm disabled:opacity-50 disabled:scale-100"
                                }`}
                            >
                                {category}
                                {isSelected && <span className="ml-1.5 sm:ml-2 bg-white/20 px-1.5 py-0.5 rounded text-[9px] sm:text-[10px]">&times;</span>}
                            </button>
                        )
                    })}
                </div>

                <button 
                    onClick={hive.startSearch} 
                    disabled={hive.myTopics.length === 0}
                    className="group px-8 sm:px-12 py-4 sm:py-5 bg-[#111827] hover:bg-black text-white rounded-full font-black text-sm sm:text-xl shadow-2xl hover:shadow-indigo-500/40 hover:-translate-y-1 transition-all flex items-center gap-3 sm:gap-4 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none disabled:cursor-not-allowed"
                >
                    {hive.myTopics.length === 0 ? "SELECT A TOPIC TO START" : "START MATCHMAKING"} 
                    <Radio size={20} className={`sm:w-6 sm:h-6 ${hive.myTopics.length > 0 ? "group-hover:animate-pulse text-indigo-400" : "text-gray-500"}`} />
                </button>
            </div>
        </div>
    );
}