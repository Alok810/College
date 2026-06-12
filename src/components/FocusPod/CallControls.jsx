import React from "react";
import { Mic, MicOff, Video, VideoOff, MonitorUp, MonitorOff, FlipHorizontal, Maximize, Minimize, LayoutGrid, PanelRight, MessageSquare } from "lucide-react";

export default function CallControls({
  micEnabled, toggleMic, cameraEnabled, toggleCamera,
  isScreenSharing, toggleScreenShare, isMirrored, setIsMirrored,
  isFullscreen, toggleFullScreen, callAccepted,
  layoutMode, setLayoutMode, isSidebarOpen, setIsSidebarOpen
}) {
  return (
    <div className="flex justify-center items-center gap-2 sm:gap-3 flex-wrap shrink-0">
        <button onClick={toggleMic} className={`w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-[1rem] sm:rounded-full transition-all ${micEnabled ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-red-50 text-red-600'}`}>
            {micEnabled ? <Mic size={22} /> : <MicOff size={22} />}
        </button>
        <button onClick={toggleCamera} disabled={isScreenSharing} className={`w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-[1rem] sm:rounded-full transition-all ${cameraEnabled ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-red-50 text-red-600'} disabled:opacity-50`}>
            {cameraEnabled ? <Video size={22} /> : <VideoOff size={22} />}
        </button>
        
        <button onClick={toggleScreenShare} className={`hidden md:flex w-12 h-12 sm:w-14 sm:h-14 items-center justify-center rounded-[1rem] sm:rounded-full transition-all ${!isScreenSharing ? 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100' : 'bg-indigo-600 text-white shadow-md'}`}>
            {!isScreenSharing ? <MonitorUp size={22} /> : <MonitorOff size={22} />}
        </button>
        
        <div className="w-px h-8 bg-gray-200 mx-0.5 sm:mx-1 hidden sm:block"></div>
        
        <button onClick={() => setIsMirrored(!isMirrored)} disabled={!cameraEnabled || isScreenSharing} className="hidden sm:flex w-12 h-12 sm:w-14 sm:h-14 items-center justify-center rounded-[1rem] sm:rounded-full bg-amber-50 text-amber-600 hover:bg-amber-100 disabled:opacity-50">
            <FlipHorizontal size={22} />
        </button>
        <button onClick={toggleFullScreen} className="hidden lg:flex w-12 h-12 sm:w-14 sm:h-14 items-center justify-center rounded-full bg-teal-50 text-teal-600 hover:bg-teal-100">
            {isFullscreen ? <Minimize size={22} /> : <Maximize size={22} />}
        </button>
        
        {callAccepted && (
            <>
                <button onClick={() => setLayoutMode(prev => prev === "grid" ? "focus" : "grid")} className={`hidden sm:flex w-12 h-12 sm:w-14 sm:h-14 items-center justify-center rounded-[1rem] sm:rounded-full transition-all ${layoutMode === 'focus' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-700'}`}>
                    {layoutMode === "grid" ? <LayoutGrid size={22} /> : <PanelRight size={22} />}
                </button>
                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className={`w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-[1rem] sm:rounded-full transition-all ${isSidebarOpen ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-700'}`}>
                    <MessageSquare size={22} className={isSidebarOpen ? '' : 'animate-pulse'}/>
                </button>
            </>
        )}
    </div>
  );
}