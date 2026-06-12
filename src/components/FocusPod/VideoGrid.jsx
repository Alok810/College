import React from "react";
import { User, Maximize2 } from "lucide-react";

export default function VideoGrid({
  layoutMode, callAccepted, isSwapped, setIsSwapped,
  myVideoRef, cameraEnabled, isScreenSharing, isMirrored,
  userVideoRef, callerName, callerRealDbId, callEnded
}) {

  // 🟢 WAITING ROOM STATE (Clean, Transparent Container)
  if (!callAccepted) {
    return (
      <div className="flex-1 flex items-center justify-center w-full min-h-[300px] sm:min-h-[400px]">
        {/* The video preview card */}
        <div className="w-full max-w-[500px] aspect-[4/3] sm:aspect-square bg-gray-900 rounded-[2rem] shadow-xl border-4 border-white overflow-hidden relative">
            <video
                ref={myVideoRef} playsInline muted autoPlay
                className={`w-full h-full object-cover ${!cameraEnabled && !isScreenSharing ? 'hidden' : ''} ${isMirrored && !isScreenSharing ? 'scale-x-[-1]' : ''}`}
            />
            {!cameraEnabled && !isScreenSharing && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-800 text-gray-400">
                    <User size={56} className="mb-3 opacity-30" />
                    <span className="font-bold text-sm tracking-wide uppercase">Camera Off</span>
                </div>
            )}
            <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-md text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm">You</div>
        </div>
      </div>
    );
  }

  // 🟢 ACTIVE CALL STATE (Full Screen / Split Screen)
  return (
    <div className={`w-full h-full flex transition-all duration-500 ${
        layoutMode === "grid"
            ? "flex-col sm:flex-row gap-3 sm:gap-6 p-4 md:p-8 pt-16 sm:pt-20" 
            : "relative overflow-hidden"
    }`}>
        {/* YOU VIDEO */}
        <div
            onClick={() => { if (layoutMode === "focus" && !isSwapped) setIsSwapped(true); }}
            className={`bg-gray-900 overflow-hidden transition-all duration-500 flex-1 relative ${
            layoutMode === "grid"
                ? "rounded-3xl border-2 sm:border-4 border-gray-800 shadow-xl h-1/2 sm:h-auto object-cover"
                : (isSwapped
                    ? "absolute inset-0 w-full h-full z-0 object-cover"
                    : "absolute bottom-28 right-4 sm:bottom-24 sm:right-8 w-28 h-40 sm:w-48 sm:h-64 rounded-2xl border-2 sm:border-4 border-gray-700 shadow-2xl z-20 cursor-pointer hover:scale-105"
                  )
        }`}>
            <video
                ref={myVideoRef} playsInline muted autoPlay
                className={`w-full h-full object-cover ${!cameraEnabled && !isScreenSharing ? 'hidden' : ''} ${isMirrored && !isScreenSharing ? 'scale-x-[-1]' : ''}`}
            />
            {!cameraEnabled && !isScreenSharing && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-gray-500">
                    <User size={48} className="mb-2 opacity-50" />
                    <span className="font-bold text-sm">Camera Off</span>
                </div>
            )}
            <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md text-white px-2 py-1 rounded text-[10px] font-bold z-10">You</div>
            
            {layoutMode === "focus" && !isSwapped && (
                <div className="absolute top-2 right-2 bg-black/50 p-1.5 rounded-full text-white opacity-0 hover:opacity-100 transition-opacity z-10"><Maximize2 size={12}/></div>
            )}
        </div>

        {/* PEER VIDEO */}
        {!callEnded && (
            <div
                onClick={() => { if (layoutMode === "focus" && isSwapped) setIsSwapped(false); }}
                className={`bg-gray-900 overflow-hidden transition-all duration-500 flex-1 relative ${
                layoutMode === "grid"
                    ? "rounded-3xl border-2 sm:border-4 border-purple-500/50 shadow-xl h-1/2 sm:h-auto z-10"
                    : (isSwapped
                        ? "absolute bottom-28 right-4 sm:bottom-24 sm:right-8 w-28 h-40 sm:w-48 sm:h-64 rounded-2xl border-2 sm:border-4 border-gray-700 shadow-2xl z-20 cursor-pointer hover:scale-105"
                        : "absolute inset-0 w-full h-full z-0 object-cover"
                      )
            }`}>
                <video ref={userVideoRef} playsInline autoPlay className="w-full h-full object-cover" />
                <div className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 bg-black/60 backdrop-blur-md text-white px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold truncate max-w-[70%] z-10 flex items-center gap-2 border border-white/10">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span> {callerName || "Remote User"}
                </div>
                {callerRealDbId && (
                    <button
                        onClick={(e) => { e.stopPropagation(); window.open(`/profile/${callerRealDbId}`, '_blank'); }}
                        className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 border border-white/30 backdrop-blur-md text-white px-3 py-1.5 rounded-xl transition-all shadow-lg flex items-center gap-2 z-30"
                    >
                        <User size={16} /> <span className="text-xs font-bold hidden sm:block">Profile</span>
                    </button>
                )}
            </div>
        )}
    </div>
  );
}