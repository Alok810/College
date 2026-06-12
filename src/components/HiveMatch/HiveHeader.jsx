import React from "react";
import rigyaLogo from "../../assets/rigya.png"; 

export default function HiveHeader() {
    return (
        <div className="h-14 sm:h-16 shrink-0 bg-white/80 backdrop-blur-md border-b border-blue-100 px-4 sm:px-6 flex items-center justify-between shadow-sm z-10">
            <div className="flex items-center gap-2 sm:gap-3">
                <img src={rigyaLogo} alt="Rigya" className="h-6 sm:h-7 w-auto drop-shadow-sm" />
                <h1 className="text-lg sm:text-xl font-black text-gray-900 tracking-tight">Hive <span className="text-indigo-600">Match</span></h1>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 bg-emerald-50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border border-emerald-100">
                <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                <span className="text-[9px] sm:text-xs font-bold uppercase tracking-widest text-emerald-700">158+ Online</span>
            </div>
        </div>
    );
}