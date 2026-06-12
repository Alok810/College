import React from "react";
import { Mic, MicOff, Video, VideoOff, MonitorUp, MonitorOff, FlipHorizontal, Maximize, Minimize, LayoutGrid, PanelRight, MessageSquare } from "lucide-react";

export default function CallControls({
  micEnabled, toggleMic, cameraEnabled, toggleCamera,
  isScreenSharing, toggleScreenShare, isMirrored, setIsMirrored,
  isFullscreen, toggleFullScreen, callAccepted,
  layoutMode, setLayoutMode, isSidebarOpen, setIsSidebarOpen
}) {
  return (
    <div className="flex items-center gap-1 sm:gap-2">
        <button onClick={toggleMic} className={`p-3 sm:p-4 rounded-xl sm:rounded-full transition-all ${micEnabled ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-red-50 text-red-600'}`}>
            {micEnabled ? <Mic size={20} /> : <MicOff size={20} />}
        </button>
        <button onClick={toggleCamera} disabled={isScreenSharing} className={`p-3 sm:p-4 rounded-xl sm:rounded-full transition-all ${cameraEnabled ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-red-50 text-red-600'} disabled:opacity-50`}>
            {cameraEnabled ? <Video size={20} /> : <VideoOff size={20} />}
        </button>
        
        {/* Hide screen share on mobile sizes */}
        <button onClick={toggleScreenShare} className={`hidden md:block p-3 sm:p-4 rounded-xl sm:rounded-full transition-all ${!isScreenSharing ? 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100' : 'bg-indigo-600 text-white shadow-md'}`}>
            {!isScreenSharing ? <MonitorUp size={20} /> : <MonitorOff size={20} />}
        </button>
        
        <div className="w-px h-6 bg-gray-200 mx-1 hidden sm:block"></div>
        
        <button onClick={() => setIsMirrored(!isMirrored)} disabled={!cameraEnabled || isScreenSharing} className="hidden sm:block p-3 sm:p-4 rounded-full bg-amber-50 text-amber-600 hover:bg-amber-100 disabled:opacity-50">
            <FlipHorizontal size={20} />
        </button>
        <button onClick={toggleFullScreen} className="hidden lg:block p-3 sm:p-4 rounded-full bg-teal-50 text-teal-600 hover:bg-teal-100">
            {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
        </button>
        
        {callAccepted && (
            <>
                <button onClick={() => setLayoutMode(prev => prev === "grid" ? "focus" : "grid")} className={`hidden sm:block p-3 sm:p-4 rounded-full transition-all ${layoutMode === 'focus' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-700'}`}>
                    {layoutMode === "grid" ? <LayoutGrid size={20} /> : <PanelRight size={20} />}
                </button>
                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className={`p-3 sm:p-4 rounded-xl sm:rounded-full transition-all ${isSidebarOpen ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-700'}`}>
                    <MessageSquare size={20} className={isSidebarOpen ? '' : 'animate-pulse'}/>
                </button>
            </>
        )}
    </div>
  );
}