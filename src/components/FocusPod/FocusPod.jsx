import React, { useState, useRef, useEffect } from "react";
import { PhoneOff, Copy, CheckCheck, PhoneIncoming, Phone, Timer, Play, Pause, RotateCcw, User } from "lucide-react";

import { useFocusPod } from "../../hooks/useFocusPod";
import VideoGrid from "./VideoGrid";
import PodSidebar from "./PodSidebar";
import CallControls from "./CallControls";

import rigyaLogo from "../../assets/rigya.png"; 

export default function FocusPod() {
  const pod = useFocusPod(); 
  const podContainerRef = useRef(null);
  
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
      if (podContainerRef.current) podContainerRef.current.requestFullscreen().catch(console.error);
    } else document.exitFullscreen();
  };

  return (
    // 🟢 Restored Original Wrapper
    <div ref={podContainerRef} className={`flex flex-col items-center custom-scrollbar overflow-y-auto bg-[#ebf8ff] ${isFullscreen ? 'w-screen h-screen p-2 sm:p-4 md:p-6' : 'p-3 sm:p-4 md:p-6 h-full pb-32'}`}>
      
      {/* 🟢 HEADER SECTION */}
      <div className={`w-full flex justify-between items-start sm:items-center mb-4 md:mb-6 gap-4 ${isFullscreen ? 'max-w-[1600px]' : 'max-w-7xl'}`}>
        
        <div className="flex items-center gap-3 sm:gap-4">
            <img src={rigyaLogo} alt="Rigya Logo" className="h-10 sm:h-12 w-auto object-contain drop-shadow-sm shrink-0" />
            <div className="flex flex-col justify-center">
                <h1 className="text-2xl sm:text-3xl font-black text-purple-700 leading-tight">The Focus Pod</h1>
                <p className="text-sm sm:text-base text-gray-500 font-medium mt-0.5">1-on-1 Mentorship & Study Room</p>
            </div>
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

      {/* 🟢 DYNAMIC CONTENT AREA (Restored Original Flex/Min-H) */}
      <div className={`w-full flex flex-col lg:flex-row gap-4 md:gap-6 relative min-h-[400px] sm:min-h-0 flex-1 ${isFullscreen ? 'max-w-[1600px]' : 'max-w-7xl'}`}>
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

      {/* 🟢 CONTROLS FOOTER (Restored Original Bottom Placement) */}
      <div className={`mt-4 sm:mt-6 shrink-0 transition-all duration-500 ease-out z-40 
        ${pod.callAccepted 
            ? 'w-fit mx-auto bg-white/95 backdrop-blur-lg px-4 py-2 sm:px-6 sm:py-3 rounded-full shadow-lg border border-gray-100 flex items-center justify-center' 
            : `w-full bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 flex justify-center ${isFullscreen ? 'max-w-[1600px]' : 'max-w-7xl'}`
        }`}>
        
        {pod.callAccepted ? (
            <div className="flex items-center justify-center gap-2 sm:gap-4">
                <CallControls 
                    micEnabled={pod.micEnabled} toggleMic={pod.toggleMic} cameraEnabled={pod.cameraEnabled} toggleCamera={pod.toggleCamera}
                    isScreenSharing={pod.isScreenSharing} toggleScreenShare={pod.toggleScreenShare} isMirrored={isMirrored} setIsMirrored={setIsMirrored}
                    isFullscreen={isFullscreen} toggleFullScreen={toggleFullScreen} callAccepted={pod.callAccepted}
                    layoutMode={layoutMode} setLayoutMode={setLayoutMode} isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen}
                />
                <div className="w-px h-8 bg-gray-200 mx-1 sm:mx-2 hidden sm:block"></div>
                <button onClick={pod.leaveCall} className="px-5 py-2 sm:px-8 sm:py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-full font-black flex items-center justify-center gap-2 shadow-md active:scale-95 whitespace-nowrap">
                    <PhoneOff size={18} /> <span className="hidden sm:block">END SESSION</span>
                </button>
            </div>
        ) : (
            <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 w-full items-center">
                
                {/* Hardware Controls */}
                <CallControls 
                    micEnabled={pod.micEnabled} toggleMic={pod.toggleMic} cameraEnabled={pod.cameraEnabled} toggleCamera={pod.toggleCamera}
                    isScreenSharing={pod.isScreenSharing} toggleScreenShare={pod.toggleScreenShare} isMirrored={isMirrored} setIsMirrored={setIsMirrored}
                    isFullscreen={isFullscreen} toggleFullScreen={toggleFullScreen} callAccepted={pod.callAccepted}
                    layoutMode={layoutMode} setLayoutMode={setLayoutMode} isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen}
                />
                
                <div className="flex-1 flex flex-col gap-3 sm:gap-4 justify-center w-full">
                    <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 items-center w-full">
                      
                      {/* Your Code */}
                      <div className="w-full lg:w-auto flex-1 flex items-center justify-between bg-indigo-50 border border-indigo-100 p-2 rounded-xl">
                        <div className="flex flex-col overflow-hidden pr-2">
                            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Secure Pod Code</span>
                            <span className="text-xs sm:text-base font-mono font-black text-indigo-900 truncate tracking-widest">{pod.myPodId || "Generating..."}</span>
                        </div>
                        <button onClick={copyMyId} className="p-2 bg-white text-indigo-600 rounded-lg shadow-sm hover:bg-indigo-600 hover:text-white transition-colors shrink-0">
                            {copied ? <CheckCheck size={18} /> : <Copy size={18} />}
                        </button>
                      </div>
                      
                      {/* Input / Accept Block */}
                      {pod.receivingCall ? (
                          <div className="w-full lg:w-auto flex-1 flex items-center justify-between bg-gray-900 border border-gray-700/50 p-2 sm:p-2 rounded-xl shadow-2xl relative overflow-hidden ring-1 ring-white/10">
                            <div className="flex items-center gap-2 sm:gap-3 pl-1 sm:pl-2">
                                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg"><User size={18} className="text-white" /></div>
                                <div className="flex flex-col text-white flex-1 min-w-0 pr-2">
                                    <span className="text-sm font-bold truncate tracking-wide">{pod.callerName}</span>
                                    <span className="text-[10px] text-emerald-400 flex items-center gap-1.5 mt-0.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>Incoming...</span>
                                </div>
                            </div>
                            <button onClick={pod.answerCall} className="px-4 py-2 sm:px-5 sm:py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg font-black flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-lg shrink-0 text-sm">
                                <PhoneIncoming size={16} className="animate-bounce" style={{ animationDuration: '2s' }}/><span className="hidden sm:block tracking-wide">ACCEPT</span>
                            </button>
                          </div>
                      ) : (
                          <div className="w-full lg:w-auto flex-1 flex gap-2">
                              <input type="text" placeholder="Enter Pod Code..." value={pod.idToCall} onChange={(e) => pod.setIdToCall(e.target.value)} className="flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-200 text-sm sm:text-base font-mono uppercase tracking-widest min-w-0" />
                              <button onClick={() => pod.callUser(pod.idToCall.toUpperCase())} disabled={!pod.idToCall || pod.isCalling} className="px-4 sm:px-6 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold flex items-center gap-2 disabled:opacity-50 transition-colors shrink-0 text-sm sm:text-base w-32 justify-center">
                                  {pod.isCalling ? <><div className="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4"></div> Calling...</> : <><Phone size={18} /> Call</>}
                              </button>
                          </div>
                      )}
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}