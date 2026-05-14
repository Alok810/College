import React from "react";
import { User } from "lucide-react";

export default function VideoGrid({
  layoutMode, callAccepted, isSwapped, setIsSwapped,
  myVideoRef, cameraEnabled, isScreenSharing, isMirrored,
  userVideoRef, callerName, callerRealDbId, callEnded // 🟢 Removed receivingCall from here!
}) {
  return (
    <div className={`flex-1 min-w-0 flex transition-all duration-500 ${
        layoutMode === "grid" || !callAccepted
            ? "items-center justify-center flex-col sm:flex-row gap-4 md:gap-8"
            : "relative items-center justify-center bg-gray-900 rounded-[2rem] shadow-2xl overflow-hidden border-2 sm:border-4 border-gray-800"
    }`}>
        {/* YOU VIDEO */}
        <div
            onClick={() => { if (layoutMode === "focus" && !isSwapped) setIsSwapped(true); }}
            className={`bg-gray-900 overflow-hidden shadow-xl transition-all duration-500 ${
            layoutMode === "grid" || !callAccepted
                ? "relative border-2 sm:border-4 border-gray-800 w-full max-w-[450px] aspect-square rounded-2xl sm:rounded-[2rem]"
                : (isSwapped
                    ? "absolute inset-0 w-full h-full border-none rounded-none z-0"
                    : "absolute bottom-4 right-4 sm:bottom-6 sm:right-6 w-28 sm:w-40 md:w-48 aspect-[3/4] sm:aspect-square rounded-2xl border-2 sm:border-4 border-gray-700 shadow-2xl z-20 cursor-pointer hover:scale-105"
                  )
        }`}>
            <video
                ref={myVideoRef} playsInline muted autoPlay
                className={`w-full h-full object-cover ${!cameraEnabled && !isScreenSharing ? 'hidden' : ''} ${isMirrored && !isScreenSharing ? 'scale-x-[-1]' : ''}`}
            />
            {!cameraEnabled && !isScreenSharing && <div className="absolute inset-0 flex items-center justify-center bg-gray-800 text-white font-bold text-sm sm:text-base">Off</div>}
            <div className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 bg-black/50 text-white px-2 py-1 rounded-md text-[10px] sm:text-xs font-bold z-10">You</div>
        </div>

        {/* PEER VIDEO */}
        {callAccepted && !callEnded && (
            <div
                onClick={() => { if (layoutMode === "focus" && isSwapped) setIsSwapped(false); }}
                className={`bg-gray-900 overflow-hidden transition-all duration-500 ${
                layoutMode === "grid"
                    ? "relative shadow-xl border-2 sm:border-4 border-purple-500 w-full max-w-[450px] aspect-square rounded-2xl sm:rounded-[2rem] z-10"
                    : (isSwapped
                        ? "absolute bottom-4 right-4 sm:bottom-6 sm:right-6 w-28 sm:w-40 md:w-48 aspect-[3/4] sm:aspect-square rounded-2xl border-2 sm:border-4 border-gray-700 shadow-2xl z-20 cursor-pointer hover:scale-105"
                        : "absolute inset-0 w-full h-full border-none rounded-none z-0"
                      )
            }`}>
                <video ref={userVideoRef} playsInline autoPlay className="w-full h-full object-cover" />
                <div className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 bg-black/50 text-white px-2 py-1 sm:px-3 sm:py-1.5 rounded-md sm:rounded-lg text-xs sm:text-sm font-bold truncate max-w-[60%] z-10">
                    {callerName || "Remote User"}
                </div>
                {callerRealDbId && (
                    <button
                        onClick={(e) => { e.stopPropagation(); window.open(`/profile/${callerRealDbId}`, '_blank'); }}
                        className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-white/20 hover:bg-white/40 border border-white/30 backdrop-blur-md text-white px-3 py-1.5 rounded-xl transition-all shadow-lg flex items-center gap-2 z-30"
                    >
                        <User size={16} /> <span className="text-xs font-bold hidden sm:block">View Profile</span>
                    </button>
                )}
            </div>
        )}
    </div>
  );
}