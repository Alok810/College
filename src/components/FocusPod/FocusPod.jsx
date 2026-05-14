import React, { useState, useRef, useEffect } from "react";
import { PhoneOff, Copy, CheckCheck, PhoneIncoming, Phone, Timer, Play, Pause, RotateCcw, User } from "lucide-react";

import { useFocusPod } from "../../hooks/useFocusPod";
import VideoGrid from "../../components/FocusPod/VideoGrid";
import PodSidebar from "../../components/FocusPod/PodSidebar";
import CallControls from "../../components/FocusPod/CallControls";

export default function FocusPod() {
  const pod = useFocusPod(); // 🟢 The Engine
  const podContainerRef = useRef(null);
  
  // Pure UI Layout State
  const [copied, setCopied] = useState(false);
  const [layoutMode, setLayoutMode] = useState("grid"); 
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
      if (podContainerRef.current) podContainerRef.current.requestFullscreen().catch(err => console.error(err));
    } else document.exitFullscreen();
  };

  return (
    <div ref={podContainerRef} className={`flex flex-col items-center custom-scrollbar overflow-y-auto bg-[#ebf8ff] ${isFullscreen ? 'w-screen h-screen p-2 sm:p-4 md:p-6' : 'p-3 sm:p-4 md:p-6 h-full pb-32'}`}>
      
      {/* HEADER SECTION */}
      <div className={`w-full flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 md:mb-6 gap-4 ${isFullscreen ? 'max-w-[1600px]' : 'max-w-7xl'}`}>
        <div>
            <h1 className="text-2xl sm:text-3xl font-black text-purple-700">The Focus Pod</h1>
            <p className="text-sm sm:text-base text-gray-500 font-medium">1-on-1 Mentorship & Study Room</p>
        </div>
        
        {pod.callAccepted && (
            <div className="flex items-center gap-2 sm:gap-3 bg-white px-3 sm:px-4 py-2 rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 self-end sm:self-auto z-50">
                <Timer className="text-purple-500" size={20} />
                <span className="text-xl sm:text-2xl font-mono font-bold text-gray-800 w-16 sm:w-20 text-center">{formatTime(pod.interviewTime)}</span>
                <div className="flex gap-1 border-l border-gray-200 pl-2 sm:pl-3">
                    <button onClick={pod.toggleTimer} className={`p-1.5 sm:p-2 rounded-lg ${pod.isTimerRunning ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'} hover:opacity-80`}>
                        {pod.isTimerRunning ? <Pause size={16}/> : <Play size={16}/>}
                    </button>
                    <button onClick={pod.resetTimer} className="p-1.5 sm:p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100"><RotateCcw size={16}/></button>
                </div>
            </div>
        )}
      </div>

      {/* DYNAMIC CONTENT AREA */}
      <div className={`w-full flex flex-col lg:flex-row gap-4 md:gap-6 relative min-h-[400px] sm:min-h-0 flex-1 ${isFullscreen ? 'max-w-[1600px]' : 'max-w-7xl'}`}>
        <VideoGrid 
            layoutMode={layoutMode} callAccepted={pod.callAccepted} isSwapped={isSwapped} setIsSwapped={setIsSwapped}
            myVideoRef={pod.myVideoRef} cameraEnabled={pod.cameraEnabled} isScreenSharing={pod.isScreenSharing} isMirrored={isMirrored}
            userVideoRef={pod.userVideoRef} receivingCall={pod.receivingCall} callerName={pod.callerName} callerRealDbId={pod.callerRealDbId} callEnded={pod.callEnded}
        />
        
        {pod.callAccepted && (
            <PodSidebar 
                isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} activeTab={activeTab} setActiveTab={setActiveTab}
                chatScrollRef={pod.chatScrollRef} messages={pod.messages} sendChat={pod.sendChat} codeText={pod.codeText} updateCode={pod.updateCode}
            />
        )}
      </div>

      {/* CONTROLS FOOTER */}
      <div className={`mt-4 sm:mt-6 flex flex-col lg:flex-row gap-4 sm:gap-6 w-full bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 shrink-0 ${isFullscreen ? 'max-w-[1600px]' : 'max-w-7xl'}`}>
        <CallControls 
            micEnabled={pod.micEnabled} toggleMic={pod.toggleMic} cameraEnabled={pod.cameraEnabled} toggleCamera={pod.toggleCamera}
            isScreenSharing={pod.isScreenSharing} toggleScreenShare={pod.toggleScreenShare} isMirrored={isMirrored} setIsMirrored={setIsMirrored}
            isFullscreen={isFullscreen} toggleFullScreen={toggleFullScreen} callAccepted={pod.callAccepted}
            layoutMode={layoutMode} setLayoutMode={setLayoutMode} isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen}
        />
        
        <div className="flex-1 flex flex-col gap-3 sm:gap-4 justify-center w-full">
            {pod.callAccepted ? (
                <div className="flex-1 flex justify-center items-center h-full w-full">
                    <button onClick={pod.leaveCall} className="w-full py-3 sm:py-4 bg-red-500 hover:bg-red-600 text-white rounded-xl sm:rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95 lg:hover:scale-105 min-h-[48px] whitespace-nowrap"><PhoneOff size={20} /> END SESSION</button>
                </div>
            ) : pod.receivingCall ? (
                <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 items-center w-full">
                  
                  {/* Secure Pod Code Block */}
                  <div className="w-full lg:w-auto flex-1 flex items-center justify-between bg-indigo-50 border border-indigo-100 p-2 rounded-xl sm:rounded-2xl">
                    <div className="flex flex-col overflow-hidden pr-2"><span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Secure Pod Code</span><span className="text-xs sm:text-sm font-mono font-bold text-indigo-900 truncate tracking-widest">{pod.myPodId || "Generating..."}</span></div>
                    <button onClick={copyMyId} className="p-1.5 bg-white text-indigo-600 rounded-lg shadow-sm hover:bg-indigo-600 hover:text-white transition-colors shrink-0">{copied ? <CheckCheck size={18} /> : <Copy size={18} />}</button>
                  </div>
                  
                  {/* 🟢 PREMIUM INCOMING CALL BANNER (Fixed Padding & Hover) */}
                  <div className="w-full lg:w-auto flex-[1.5] flex items-center justify-between bg-gray-900 border border-gray-700/50 p-3 sm:p-3.5 rounded-xl sm:rounded-2xl shadow-2xl relative overflow-hidden ring-1 ring-white/10">
                    
                    {/* Glowing Top Border */}
                    <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-pulse"></div>

                    <div className="flex items-center gap-3 sm:gap-4 pl-1 sm:pl-2">
                        {/* Pulsing Avatar */}
                        <div className="relative shrink-0">
                            <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-20"></div>
                            <div className="w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-full flex items-center justify-center shadow-lg border-2 border-gray-800 relative z-10">
                                <User size={20} className="text-white" />
                            </div>
                        </div>

                        {/* Caller Info */}
                        <div className="flex flex-col text-white flex-1 min-w-0 pr-2">
                            <span className="text-sm sm:text-base font-bold truncate tracking-wide">{pod.callerName}</span>
                            <span className="text-[10px] sm:text-xs text-emerald-400 flex items-center gap-1.5 mt-0.5">
                               <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                               Incoming Video Call...
                            </span>
                        </div>
                    </div>

                    {/* Glowing Accept Button (Replaced scale-105 with -translate-y-0.5) */}
                    <button onClick={pod.answerCall} className="group relative px-5 py-2 sm:px-6 sm:py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl font-black flex items-center justify-center gap-2 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.6)] shrink-0 text-sm sm:text-base border border-emerald-400/50 mr-1 sm:mr-2">
                        <PhoneIncoming size={18} className="animate-bounce" style={{ animationDuration: '2s' }}/>
                        <span className="hidden sm:block tracking-wide">ACCEPT</span>
                    </button>

                  </div>
                </div>
            ) : (
                <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 items-center w-full">
                  <div className="w-full lg:w-auto flex-1 flex items-center justify-between bg-indigo-50 border border-indigo-100 p-2 rounded-xl sm:rounded-2xl">
                    <div className="flex flex-col overflow-hidden pr-2"><span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Secure Pod Code</span><span className="text-xs sm:text-sm font-mono font-bold text-indigo-900 truncate tracking-widest">{pod.myPodId || "Generating..."}</span></div>
                    <button onClick={copyMyId} className="p-1.5 bg-white text-indigo-600 rounded-lg shadow-sm hover:bg-indigo-600 hover:text-white transition-colors shrink-0">{copied ? <CheckCheck size={18} /> : <Copy size={18} />}</button>
                  </div>
                  <div className="w-full lg:w-auto flex-1 flex gap-2">
                      <input type="text" placeholder="Enter Pod Code..." value={pod.idToCall} onChange={(e) => pod.setIdToCall(e.target.value)} className="flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-200 text-sm sm:text-base font-mono uppercase tracking-widest min-w-0" />
                      <button onClick={() => pod.callUser(pod.idToCall.toUpperCase())} disabled={!pod.idToCall || pod.isCalling} className="px-4 sm:px-6 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold flex items-center gap-2 disabled:opacity-50 transition-colors shrink-0 text-sm sm:text-base w-32 justify-center">
                          {pod.isCalling ? (
                              <><div className="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4"></div> Calling...</>
                          ) : (
                              <><Phone size={18} /> Call</>
                          )}
                      </button>
                  </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}