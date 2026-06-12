import React, { useState, useRef, useEffect } from "react";
import { PhoneOff, Copy, CheckCheck, PhoneIncoming, Phone, Timer, Play, Pause, RotateCcw } from "lucide-react";

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
  
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

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

  useEffect(() => {
    const handleResize = () => {
        if (window.innerWidth < 1024 && window.innerHeight < 550) {
            setIsKeyboardOpen(true);
        } else if (window.innerHeight >= 550) {
            setIsKeyboardOpen(false);
        }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      if (podContainerRef.current) podContainerRef.current.requestFullscreen().catch(console.error);
    } else document.exitFullscreen();
  };

  return (
    <div ref={podContainerRef} className={`relative flex flex-col items-center bg-[#ebf8ff] h-[100dvh] w-full max-w-[100vw] overflow-hidden px-2 sm:px-4 md:px-6 pt-[max(env(safe-area-inset-top,16px),16px)] ${isKeyboardOpen ? 'pb-2' : 'pb-[max(env(safe-area-inset-bottom,20px),20px)]'} sm:pt-6 sm:pb-6 ${isFullscreen ? 'p-0 pb-0' : ''}`}>
      
      {/* HEADER SECTION */}
      <div className={`w-full flex justify-between items-center mb-3 sm:mb-6 max-w-7xl shrink-0 gap-2`}>
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <img src={rigyaLogo} alt="Rigya Logo" className="h-8 sm:h-12 w-auto object-contain drop-shadow-sm shrink-0" />
            <div className="flex flex-col justify-center min-w-0">
                <h1 className="text-lg sm:text-3xl font-black text-purple-700 leading-none whitespace-nowrap truncate">Focus Pod</h1>
                <p className="text-xs text-gray-500 font-medium mt-1 truncate hidden sm:block">1-on-1 Mentorship & Study Room</p>
            </div>
        </div>
        
        {pod.callAccepted && (
            <div className="flex items-center gap-1.5 sm:gap-3 bg-white px-2 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 shrink-0">
                <Timer className="text-purple-500 w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-sm sm:text-2xl font-mono font-bold text-gray-800 w-12 sm:w-20 text-center">{formatTime(pod.interviewTime)}</span>
                <div className="flex gap-1 border-l border-gray-200 pl-1.5 sm:pl-3">
                    <button onClick={pod.toggleTimer} className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg ${pod.isTimerRunning ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'} hover:opacity-80`}>
                        {pod.isTimerRunning ? <Pause size={14}/> : <Play size={14}/>}
                    </button>
                    <button onClick={pod.resetTimer} className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100"><RotateCcw size={14}/></button>
                </div>
            </div>
        )}
      </div>

      {/* DYNAMIC CONTENT AREA */}
      <div className={`w-full flex-1 flex flex-col lg:flex-row gap-3 sm:gap-6 relative min-h-0 max-w-7xl`}>
        <VideoGrid 
            layoutMode={layoutMode} callAccepted={pod.callAccepted} isSwapped={isSwapped} setIsSwapped={setIsSwapped}
            myVideoRef={pod.myVideoRef} cameraEnabled={pod.cameraEnabled} isScreenSharing={pod.isScreenSharing} isMirrored={isMirrored}
            userVideoRef={pod.userVideoRef} callerName={pod.callerName} callerRealDbId={pod.callerRealDbId} callEnded={pod.callEnded}
            isSidebarOpen={isSidebarOpen}
            isKeyboardOpen={isKeyboardOpen} // 🟢 Passed Keyboard State to VideoGrid!
        />
        {pod.callAccepted && (
            <PodSidebar 
                isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} activeTab={activeTab} setActiveTab={setActiveTab}
                chatScrollRef={pod.chatScrollRef} messages={pod.messages} sendChat={pod.sendChat} codeText={pod.codeText} updateCode={pod.updateCode}
                setIsKeyboardOpen={setIsKeyboardOpen}
            />
        )}
      </div>

      {/* CONTROLS FOOTER */}
      <div className={`shrink-0 transition-all duration-300 ease-out z-40 w-full justify-center max-w-7xl mt-3 sm:mt-6 ${isKeyboardOpen && pod.callAccepted ? 'hidden lg:flex' : 'flex'}`}>
        {pod.callAccepted ? (
            <div className="w-fit bg-white/95 backdrop-blur-lg px-3 py-2 sm:px-6 sm:py-3 rounded-[2rem] sm:rounded-full shadow-lg border border-gray-100 flex items-center justify-center gap-1 sm:gap-4">
                <CallControls 
                    micEnabled={pod.micEnabled} toggleMic={pod.toggleMic} cameraEnabled={pod.cameraEnabled} toggleCamera={pod.toggleCamera}
                    isScreenSharing={pod.isScreenSharing} toggleScreenShare={pod.toggleScreenShare} isMirrored={isMirrored} setIsMirrored={setIsMirrored}
                    isFullscreen={isFullscreen} toggleFullScreen={toggleFullScreen} callAccepted={pod.callAccepted}
                    layoutMode={layoutMode} setLayoutMode={setLayoutMode} isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen}
                />
                <div className="w-px h-8 sm:h-10 bg-gray-200 mx-1 sm:mx-2"></div>
                <button onClick={pod.leaveCall} className="h-12 sm:h-14 px-4 sm:px-8 bg-red-500 hover:bg-red-600 text-white rounded-2xl sm:rounded-full font-black flex items-center justify-center gap-1.5 shadow-md active:scale-95 whitespace-nowrap text-xs sm:text-base">
                    <PhoneOff size={18} /> <span className="hidden sm:block">END CALL</span>
                </button>
            </div>
        ) : (
            <div className="w-full flex flex-col lg:flex-row gap-3 sm:gap-6 items-center">
                <div className="hidden lg:flex items-center">
                  <CallControls 
                      micEnabled={pod.micEnabled} toggleMic={pod.toggleMic} cameraEnabled={pod.cameraEnabled} toggleCamera={pod.toggleCamera}
                      isScreenSharing={pod.isScreenSharing} toggleScreenShare={pod.toggleScreenShare} isMirrored={isMirrored} setIsMirrored={setIsMirrored}
                      isFullscreen={isFullscreen} toggleFullScreen={toggleFullScreen} callAccepted={pod.callAccepted}
                      layoutMode={layoutMode} setLayoutMode={setLayoutMode} isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen}
                  />
                </div>
                
                <div className="flex-1 flex flex-col sm:flex-row gap-3 w-full">
                    <div className="flex-1 flex items-center justify-between bg-indigo-50 border border-indigo-100 p-2 sm:p-3 rounded-2xl min-h-[60px]">
                        <div className="flex flex-col overflow-hidden pr-2">
                            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider pl-1">Your Pod Code</span>
                            <span className="text-sm sm:text-base font-mono font-black text-indigo-900 truncate tracking-widest pl-1">{pod.myPodId || "Generating..."}</span>
                        </div>
                        <button onClick={copyMyId} className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-white text-indigo-600 rounded-xl shadow-sm hover:bg-indigo-600 hover:text-white transition-colors shrink-0">
                            {copied ? <CheckCheck size={20} /> : <Copy size={20} />}
                        </button>
                    </div>

                    {pod.receivingCall ? (
                          <div className="w-full lg:w-auto flex-1 flex items-center justify-between bg-gray-900 border border-gray-700/50 p-2 sm:p-3 rounded-2xl shadow-lg ring-2 ring-emerald-400/50 animate-pulse min-h-[60px]">
                            <div className="flex flex-col pl-2">
                                <span className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest">Incoming Call</span>
                                <span className="text-white font-bold text-xs sm:text-sm truncate max-w-[120px]">{pod.callerName}</span>
                            </div>
                            <button onClick={pod.answerCall} className="h-10 sm:h-12 px-4 sm:px-6 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl font-black flex items-center justify-center shadow-lg transition-transform active:scale-95 text-xs sm:text-sm shrink-0">
                                <PhoneIncoming size={16} className="animate-bounce mr-1.5"/> ACCEPT
                            </button>
                          </div>
                      ) : (
                          <div className="w-full lg:w-auto flex-1 flex gap-2">
                              <input type="text" placeholder="Enter Friend's Code..." value={pod.idToCall} onChange={(e) => pod.setIdToCall(e.target.value)} className="flex-1 px-4 min-h-[60px] bg-white border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-purple-200 text-sm font-mono uppercase tracking-widest min-w-0 shadow-sm" />
                              <button onClick={() => pod.callUser(pod.idToCall.toUpperCase())} disabled={!pod.idToCall || pod.isCalling} className="w-28 sm:w-32 min-h-[60px] bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-black flex items-center justify-center gap-1.5 disabled:opacity-50 transition-colors shrink-0 text-sm shadow-sm">
                                  {pod.isCalling ? <div className="animate-spin border-2 border-white border-t-transparent rounded-full w-5 h-5"></div> : <><Phone size={18} /> <span className="hidden sm:block">Call</span></>}
                              </button>
                          </div>
                      )}
                </div>

                <div className="lg:hidden flex items-center justify-center w-full mt-2 pt-4 border-t border-purple-100/50">
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