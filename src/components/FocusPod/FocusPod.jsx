import React, { useState, useRef, useEffect } from "react";
import { PhoneOff, Copy, CheckCheck, PhoneIncoming, Phone, Timer, Play, Pause, RotateCcw, Users } from "lucide-react";

import { useFocusPod } from "../../hooks/useFocusPod";
import VideoGrid from "./VideoGrid";
import PodSidebar from "./PodSidebar";
import CallControls from "./CallControls";
import rigyaLogo from "../../assets/rigya.png"; 

export default function FocusPod() {
  const pod = useFocusPod(); 
  const podContainerRef = useRef(null);
  
  const [copied, setCopied] = useState(false);
  const [layoutMode, setLayoutMode] = useState("focus"); 
  const [isSwapped, setIsSwapped] = useState(false); 
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("chat"); 
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMirrored, setIsMirrored] = useState(false);

  const copyMyId = () => {
    navigator.clipboard.writeText(pod.myPodId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60); const s = secs % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      if (podContainerRef.current) podContainerRef.current.requestFullscreen().catch(console.error);
    } else document.exitFullscreen();
  };

  return (
    // 🟢 Container is completely scrollable on mobile (overflow-y-auto), fixed on desktop
    <div ref={podContainerRef} className={`relative flex flex-col items-center bg-[#ebf8ff] h-[100dvh] w-full overflow-y-auto custom-scrollbar p-3 sm:p-4 md:p-6 pb-24 ${isFullscreen ? 'p-0 pb-0 overflow-hidden' : ''}`}>
      
      {/* 🟢 HEADER */}
      <div className={`w-full flex justify-between items-start z-30 transition-all duration-500 shrink-0 ${pod.callAccepted ? 'absolute top-0 p-4 md:p-6 pointer-events-none' : 'mb-2 sm:mb-4 md:mb-6 max-w-7xl'}`}>
        
        {/* Branding */}
        <div className={`flex items-center gap-3 bg-white/80 backdrop-blur-md border border-purple-100 shadow-sm p-2 sm:px-4 sm:py-2 rounded-2xl pointer-events-auto transition-opacity ${pod.callAccepted ? 'hidden md:flex' : 'flex'}`}>
            <img src={rigyaLogo} alt="Rigya Logo" className="h-8 sm:h-10 w-auto object-contain drop-shadow-sm" />
            <div className="hidden sm:flex flex-col justify-center">
                <h1 className="text-lg font-black text-purple-700 leading-tight">Focus Pod</h1>
            </div>
        </div>
        
        {/* Timer Badge */}
        {pod.callAccepted && (
            <div className="flex items-center gap-2 bg-white/90 backdrop-blur-md px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border border-purple-100 shadow-sm pointer-events-auto ml-auto">
                <span className={`w-2 h-2 rounded-full ${pod.isTimerRunning ? 'bg-red-500 animate-pulse' : 'bg-gray-300'}`}></span>
                <span className="text-sm sm:text-lg font-mono font-bold text-gray-800 tracking-widest w-12 sm:w-16 text-center">{formatTime(pod.interviewTime)}</span>
                <div className="flex gap-1 border-l border-gray-200 pl-2 sm:pl-3">
                    <button onClick={pod.toggleTimer} className="p-1 sm:p-1.5 rounded-lg text-purple-600 hover:bg-purple-50 transition-colors">
                        {pod.isTimerRunning ? <Pause size={14}/> : <Play size={14}/>}
                    </button>
                    <button onClick={pod.resetTimer} className="p-1 sm:p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"><RotateCcw size={14}/></button>
                </div>
            </div>
        )}
      </div>

      {/* 🟢 MAIN VIDEO AREA */}
      <div className={`w-full flex-1 flex flex-col lg:flex-row gap-4 relative z-10 ${!pod.callAccepted ? 'max-w-7xl shrink-0' : 'h-full justify-center items-center overflow-hidden'}`}>
        <VideoGrid 
            layoutMode={layoutMode} callAccepted={pod.callAccepted} isSwapped={isSwapped} setIsSwapped={setIsSwapped}
            myVideoRef={pod.myVideoRef} cameraEnabled={pod.cameraEnabled} isScreenSharing={pod.isScreenSharing} isMirrored={isMirrored}
            userVideoRef={pod.userVideoRef} callerName={pod.callerName} callerRealDbId={pod.callerRealDbId} callEnded={pod.callEnded}
        />
        
        {pod.callAccepted && (
            <PodSidebar 
                isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} activeTab={activeTab} setActiveTab={setActiveTab}
                chatScrollRef={pod.chatScrollRef} messages={pod.messages} sendChat={pod.sendChat} codeText={pod.codeText} updateCode={pod.updateCode}
            />
        )}
      </div>

      {/* 🟢 CONTROLS & WAITING ROOM FOOTER (Perfect Desktop & Scrollable Mobile) */}
      <div className={`shrink-0 transition-all duration-500 ease-out z-40 w-full ${pod.callAccepted ? 'absolute bottom-6 px-4 flex justify-center pointer-events-none' : 'mt-4 max-w-7xl'}`}>
        {pod.callAccepted ? (
            // Active Call Floating Dock
            <div className="bg-white/95 backdrop-blur-xl border border-gray-200 p-2 rounded-2xl sm:rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.1)] flex flex-wrap justify-center items-center gap-2 pointer-events-auto">
                <CallControls 
                    micEnabled={pod.micEnabled} toggleMic={pod.toggleMic} cameraEnabled={pod.cameraEnabled} toggleCamera={pod.toggleCamera}
                    isScreenSharing={pod.isScreenSharing} toggleScreenShare={pod.toggleScreenShare} isMirrored={isMirrored} setIsMirrored={setIsMirrored}
                    isFullscreen={isFullscreen} toggleFullScreen={toggleFullScreen} callAccepted={pod.callAccepted}
                    layoutMode={layoutMode} setLayoutMode={setLayoutMode} isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen}
                />
                <div className="w-px h-8 bg-gray-200 mx-1 hidden sm:block"></div>
                <button onClick={pod.leaveCall} className="p-3 sm:px-6 sm:py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl sm:rounded-full font-black flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-95">
                    <PhoneOff size={20} /> <span className="hidden sm:block text-sm">END</span>
                </button>
            </div>
        ) : (
            // Waiting Room Dock
            <div className="bg-white p-4 sm:p-6 rounded-3xl sm:rounded-[2rem] shadow-sm border border-purple-100 flex flex-col lg:flex-row gap-4 sm:gap-6 w-full items-center">
                
                {/* 🟢 Desktop controls hide on mobile waiting room to save space */}
                <div className="hidden lg:flex items-center">
                  <CallControls 
                      micEnabled={pod.micEnabled} toggleMic={pod.toggleMic} cameraEnabled={pod.cameraEnabled} toggleCamera={pod.toggleCamera}
                      isScreenSharing={pod.isScreenSharing} toggleScreenShare={pod.toggleScreenShare} isMirrored={isMirrored} setIsMirrored={setIsMirrored}
                      isFullscreen={isFullscreen} toggleFullScreen={toggleFullScreen} callAccepted={pod.callAccepted}
                      layoutMode={layoutMode} setLayoutMode={setLayoutMode} isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen}
                  />
                </div>
                
                <div className="flex-1 flex flex-col sm:flex-row gap-3 w-full">
                    {/* Share Code Box */}
                    <div className="flex-1 flex items-center justify-between bg-indigo-50 border border-indigo-100 p-3 rounded-2xl">
                        <div className="flex flex-col overflow-hidden pr-2">
                            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider pl-1">Your Pod Code</span>
                            <span className="text-sm sm:text-base font-mono font-black text-indigo-700 tracking-widest pl-1">{pod.myPodId || "..."}</span>
                        </div>
                        <button onClick={copyMyId} className="p-2.5 bg-white text-indigo-600 rounded-xl shadow-sm hover:bg-indigo-600 hover:text-white transition-colors shrink-0">
                            {copied ? <CheckCheck size={20} /> : <Copy size={20} />}
                        </button>
                    </div>

                    {/* Join Pod Input OR Incoming Call */}
                    {pod.receivingCall ? (
                        <div className="flex-1 bg-gray-900 border border-gray-800 p-3 rounded-2xl flex items-center justify-between shadow-lg ring-2 ring-emerald-400/50 animate-pulse">
                            <div className="flex flex-col pl-2">
                                <span className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest">Incoming Call</span>
                                <span className="text-white font-bold text-sm truncate max-w-[120px]">{pod.callerName}</span>
                            </div>
                            <button onClick={pod.answerCall} className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl font-black flex items-center justify-center shadow-lg transition-transform active:scale-95 text-xs sm:text-sm">
                                <PhoneIncoming size={16} className="animate-bounce mr-2"/> ACCEPT
                            </button>
                        </div>
                    ) : (
                        <div className="flex-1 flex gap-2">
                            <input type="text" placeholder="Enter Friend's Code..." value={pod.idToCall} onChange={(e) => pod.setIdToCall(e.target.value)} className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base font-mono uppercase tracking-widest text-gray-700 min-w-0" />
                            <button onClick={() => pod.callUser(pod.idToCall.toUpperCase())} disabled={!pod.idToCall || pod.isCalling} className="px-4 sm:px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black flex items-center justify-center gap-2 disabled:opacity-50 transition-all shrink-0">
                                {pod.isCalling ? <><div className="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4"></div></> : <><Phone size={18} /> <span className="hidden sm:block">JOIN</span></>}
                            </button>
                        </div>
                    )}
                </div>

                {/* 🟢 Mobile Controls (Shows underneath inputs on phones) */}
                <div className="lg:hidden flex items-center justify-center w-full mt-2 pt-4 border-t border-gray-100">
                  <CallControls 
                      micEnabled={pod.micEnabled} toggleMic={pod.toggleMic} cameraEnabled={pod.cameraEnabled} toggleCamera={pod.toggleCamera}
                      isScreenSharing={pod.isScreenSharing} toggleScreenShare={pod.toggleScreenShare} isMirrored={isMirrored} setIsMirrored={setIsMirrored}
                      isFullscreen={isFullscreen} toggleFullScreen={toggleFullScreen} callAccepted={pod.callAccepted}
                      layoutMode={layoutMode} setLayoutMode={setLayoutMode} isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen}
                  />
                </div>
            </div>
        )}
      </div>
    </div>
  );
}