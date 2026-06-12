import React from "react";
import { Loader2 } from "lucide-react";

export default function HiveVideoGrid({ hive, isKeyboardOpen }) {
    
    // 🟢 SCROLLING & OVERFLOW PILLAR: Squishes gracefully into a top bar on mobile keyboards
    const mobileHeightClass = isKeyboardOpen ? "max-lg:h-20" : "max-lg:h-32 sm:max-lg:h-40";

    return (
        <div className={`flex max-lg:flex-row lg:flex-col gap-2 lg:gap-4 shrink-0 min-h-0 w-full lg:w-[320px] xl:w-[360px] ${mobileHeightClass} transition-all duration-300`}>
            
            {/* PARTNER VIDEO */}
            <div className="relative flex-1 lg:w-full lg:aspect-[4/3] bg-[#2a2d35] rounded-xl lg:rounded-2xl overflow-hidden shadow-sm border border-gray-300/50 flex items-center justify-center min-h-0">
                <video ref={hive.partnerVideoRef} autoPlay playsInline controls={false} disablePictureInPicture className={`w-full h-full object-cover pointer-events-none transition-opacity duration-300 ${hive.isPeerConnected ? 'opacity-100' : 'opacity-0'}`} />
                {hive.status === "searching" && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#2a2d35] z-10">
                        <Loader2 size={32} className="text-indigo-400 animate-spin mb-3 opacity-80" />
                        <p className="text-gray-300 font-medium text-xs lg:text-sm">Scanning...</p>
                    </div>
                )}
                {hive.status === "connected" && !hive.isPeerConnected && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#2a2d35] z-10">
                        <Loader2 size={32} className="text-indigo-500 animate-spin mb-3" />
                        <p className="text-white font-bold tracking-wide text-xs lg:text-sm">Securing...</p>
                    </div>
                )}
                <div className="absolute bottom-2 left-2 lg:bottom-3 lg:left-3 bg-black/50 backdrop-blur-md px-2 lg:px-2.5 py-1 rounded-md text-white text-[8px] lg:text-[10px] font-bold z-20 border border-white/10 uppercase tracking-widest flex items-center gap-1.5">
                   <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span> STRANGER
                </div>
            </div>

            {/* MY VIDEO */}
            <div className="relative flex-1 lg:w-full lg:aspect-[4/3] bg-[#2a2d35] rounded-xl lg:rounded-2xl overflow-hidden shadow-sm border border-gray-300/50 min-h-0">
                <video ref={hive.myVideoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
                <div className="absolute bottom-2 left-2 lg:bottom-3 lg:left-3 bg-black/50 backdrop-blur-md px-2 lg:px-2.5 py-1 rounded-md text-white text-[8px] lg:text-[10px] font-bold z-20 border border-white/10 uppercase tracking-widest">YOU</div>
            </div>
        </div>
    );
}