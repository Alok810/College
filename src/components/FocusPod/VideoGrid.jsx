import React from "react";
import { User, Maximize2 } from "lucide-react";

export default function VideoGrid({
  layoutMode, callAccepted, isSwapped, setIsSwapped,
  myVideoRef, cameraEnabled, isScreenSharing, isMirrored,
  userVideoRef, callerName, callerRealDbId, callEnded,
  isSidebarOpen,
  isKeyboardOpen // 🟢 New Prop!
}) {
  
  // 🟢 Automatically squish the videos to a thin strip when typing
  const mobileHeightClass = isKeyboardOpen ? "max-lg:!h-24" : "max-lg:!h-40";

  return (
    <div className={`flex-1 min-w-0 min-h-0 w-full h-full flex transition-all duration-500 ${
        layoutMode === "grid" || !callAccepted
            ? "flex-col sm:flex-row gap-2 sm:gap-6 items-center justify-center"
            : "relative items-center justify-center bg-gray-900 rounded-[2rem] shadow-2xl overflow-hidden border-2 sm:border-4 border-gray-800"
    } ${isSidebarOpen ? `max-lg:!flex-row ${mobileHeightClass} max-lg:!flex-none max-lg:!gap-2 max-lg:!border-none max-lg:!bg-transparent max-lg:!shadow-none max-lg:!rounded-none` : ""}`}>
        
        {/* YOU VIDEO */}
        <div
            onClick={() => { if (layoutMode === "focus" && !isSwapped) setIsSwapped(true); }}
            className={`bg-gray-900 overflow-hidden shadow-xl transition-all duration-500 flex items-center justify-center ${
            layoutMode === "grid" || !callAccepted
                ? "relative border-2 sm:border-4 border-gray-800 w-full max-w-[450px] flex-1 sm:flex-none min-h-0 sm:aspect-square rounded-2xl sm:rounded-[2rem]"
                : (isSwapped
                    ? "absolute inset-0 w-full h-full border-none rounded-none z-0"
                    : "absolute bottom-4 right-4 sm:bottom-6 sm:right-6 w-28 sm:w-40 md:w-48 aspect-[3/4] sm:aspect-square rounded-2xl border-2 sm:border-4 border-gray-700 shadow-2xl z-20 cursor-pointer hover:scale-105"
                  )
            } ${isSidebarOpen ? "max-lg:!relative max-lg:!flex-1 max-lg:!h-full max-lg:!w-1/2 max-lg:!aspect-auto max-lg:!rounded-2xl max-lg:!border-2 max-lg:!border-gray-800 max-lg:!bottom-auto max-lg:!right-auto max-lg:!shadow-sm max-lg:!z-10" : ""}`}
        >
            <video
                ref={myVideoRef} playsInline muted autoPlay
                className={`w-full h-full object-cover ${!cameraEnabled && !isScreenSharing ? 'hidden' : ''} ${isMirrored && !isScreenSharing ? 'scale-x-[-1]' : ''}`}
            />
            {!cameraEnabled && !isScreenSharing && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-800 text-gray-500 font-bold text-sm sm:text-base">
                    <User size={36} className="mb-1 sm:mb-2 opacity-50 sm:w-12 sm:h-12"/>
                    Off
                </div>
            )}
            <div className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 bg-black/50 backdrop-blur-md text-white px-2 py-1 rounded-md text-[9px] sm:text-xs font-bold z-10">You</div>
            
            {layoutMode === "focus" && !isSwapped && (
                <div className="absolute top-2 right-2 bg-black/50 p-1.5 rounded-full text-white opacity-0 hover:opacity-100 transition-opacity z-10"><Maximize2 size={12}/></div>
            )}
        </div>

        {/* PEER VIDEO */}
        {callAccepted && !callEnded && (
            <div
                onClick={() => { if (layoutMode === "focus" && isSwapped) setIsSwapped(false); }}
                className={`bg-gray-900 overflow-hidden shadow-xl transition-all duration-500 flex items-center justify-center ${
                layoutMode === "grid"
                    ? "relative border-2 sm:border-4 border-purple-500 w-full max-w-[450px] flex-1 sm:flex-none min-h-0 sm:aspect-square rounded-2xl sm:rounded-[2rem] z-10"
                    : (isSwapped
                        ? "absolute bottom-4 right-4 sm:bottom-6 sm:right-6 w-28 sm:w-40 md:w-48 aspect-[3/4] sm:aspect-square rounded-2xl border-2 sm:border-4 border-gray-700 shadow-2xl z-20 cursor-pointer hover:scale-105"
                        : "absolute inset-0 w-full h-full border-none rounded-none z-0"
                      )
                } ${isSidebarOpen ? "max-lg:!relative max-lg:!flex-1 max-lg:!h-full max-lg:!w-1/2 max-lg:!aspect-auto max-lg:!rounded-2xl max-lg:!border-2 max-lg:!border-purple-500 max-lg:!bottom-auto max-lg:!right-auto max-lg:!shadow-sm max-lg:!z-10" : ""}`}
            >
                <video 
                    ref={userVideoRef} 
                    playsInline 
                    autoPlay 
                    controls={false}
                    disablePictureInPicture
                    className="w-full h-full object-cover pointer-events-none" 
                />
                
                <div className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 bg-black/50 backdrop-blur-md text-white px-2 py-1 sm:px-3 sm:py-1.5 rounded-md sm:rounded-lg text-[9px] sm:text-sm font-bold truncate max-w-[75%] z-10 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500 shrink-0"></span> <span className="truncate">{callerName || "Remote User"}</span>
                </div>
                {callerRealDbId && (
                    <button
                        onClick={(e) => { e.stopPropagation(); window.open(`/profile/${callerRealDbId}`, '_blank'); }}
                        className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-white/20 hover:bg-white/40 border border-white/30 backdrop-blur-md text-white px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl transition-all shadow-lg flex items-center gap-1.5 z-30"
                    >
                        <User size={12} className="sm:w-4 sm:h-4"/> <span className="text-[10px] sm:text-xs font-bold hidden sm:block">Profile</span>
                    </button>
                )}
            </div>
        )}
    </div>
  );
}