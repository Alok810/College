import React, { useEffect, useRef, useState } from "react";
import { 
  Mic, MicOff, Video, VideoOff, Phone, PhoneOff, PhoneIncoming, 
  MonitorUp, MonitorOff, Copy, CheckCheck, MessageSquare, 
  Timer, Play, Pause, RotateCcw, Send, LayoutGrid, PanelRight,
  Maximize, Minimize, X, FlipHorizontal, Code, User 
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import io from "socket.io-client";
import Peer from "simple-peer";

// ✨ IMPORT YOUR BULLETPROOF URL FROM API.JS!
import { BACKEND_URL } from "../../api"; 

const generateSecureRoomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `RIGYA-${code}`; 
};

export default function FocusPod() {
  const { authData } = useAuth(); 
  
  const myDisplayName = authData?.name || authData?.username || authData?.user?.name || "Student";
  
  // 🟢 Socket state inside the component
  const [socket, setSocket] = useState(null);

  const [stream] = useState(new MediaStream()); 
  const [micEnabled, setMicEnabled] = useState(false); 
  const [cameraEnabled, setCameraEnabled] = useState(false); 
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [myPodId, setMyPodId] = useState(""); 
  const [isMirrored, setIsMirrored] = useState(false); 
  
  const [idToCall, setIdToCall] = useState("");
  const [receivingCall, setReceivingCall] = useState(false);
  const [isCalling, setIsCalling] = useState(false); 
  
  const [callerName, setCallerName] = useState("");
  const [callerId, setCallerId] = useState("");
  const [callerRealDbId, setCallerRealDbId] = useState(null); 
  const [callerSignal, setCallerSignal] = useState(null);
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);

  const [layoutMode, setLayoutMode] = useState("grid"); 
  const [isSwapped, setIsSwapped] = useState(false); 
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("chat"); 
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [codeText, setCodeText] = useState("// Welcome to the Collaborative Code Pad!\n// Start typing to share code instantly...\n\n"); 
  
  const [interviewTime, setInterviewTime] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const myVideoRef = useRef();
  const userVideoRef = useRef();
  const connectionRef = useRef();
  const screenTrackRef = useRef();
  const chatScrollRef = useRef();
  const podContainerRef = useRef(null); 

  useEffect(() => {
    // 🟢 Initialize Socket AFTER component mount using the runtime URL
    const newSocket = io(BACKEND_URL, {
        withCredentials: true
    });
    setSocket(newSocket);

    const newRoomCode = generateSecureRoomCode();
    setMyPodId(newRoomCode);
    
    // ✨ Isolated Join Event
    if (authData?._id) newSocket.emit("join-pod", newRoomCode);

    newSocket.on("call-incoming", (data) => {
      setReceivingCall(true);
      setCallerId(data.from); 
      setCallerName(data.name || "Remote User");
      setCallerSignal(data.signal);
    });

    newSocket.on("call-ended", () => {
        window.location.reload();
    });

    return () => {
        newSocket.off("call-incoming");
        newSocket.off("call-ended");
        newSocket.disconnect(); // 🟢 Properly disconnect on unmount
        stream.getTracks().forEach(track => track.stop());
        if (screenTrackRef.current) screenTrackRef.current.stop();
    };
  }, [authData, stream]);

  const handlePeerData = (data) => {
    try {
        const parsed = JSON.parse(data.toString());
        
        if (parsed.type === 'end-call') {
            window.location.reload();
        }
        
        if (parsed.type === 'handshake') {
            if (parsed.id) setCallerRealDbId(parsed.id);
            if (parsed.name) setCallerName(parsed.name); 
        }
        if (parsed.type === 'chat') setMessages(prev => [...prev, parsed.message]);
        if (parsed.type === 'code') setCodeText(parsed.text); 
        if (parsed.type === 'timer') {
            setIsTimerRunning(parsed.isRunning);
            if (parsed.time !== undefined) setInterviewTime(parsed.time);
        }
    } catch (err) { console.error("Peer data error", err); }
  };

  const callUser = (userToCallId) => {
    setIsCalling(true);
    // ✨ STUN SERVERS ADDED HERE TO BYPASS NAT FIREWALL
    const peer = new Peer({ 
        initiator: true, 
        trickle: false, 
        stream: stream,
        config: {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' },
                { urls: 'stun:global.stun.twilio.com:3478' }
            ]
        }
    });
    
    peer.on("signal", (data) => {
      socket?.emit("call-user", { userToCall: userToCallId, signalData: data, from: myPodId, name: myDisplayName });
    });
    peer.on("stream", (currentStream) => { if (userVideoRef.current) userVideoRef.current.srcObject = currentStream; });
    peer.on("data", handlePeerData); 
    
    peer.on("close", () => window.location.reload());

    peer.on("connect", () => {
        setTimeout(() => {
            peer.send(JSON.stringify({ type: 'handshake', id: authData?._id, name: myDisplayName }));
            peer.send(JSON.stringify({ type: 'code', text: codeText }));
        }, 800);
    });
    
    socket?.on("call-accepted", (signalData) => { 
        setIsCalling(false); 
        setCallAccepted(true); 
        peer.signal(signalData.signal || signalData); 
    });
    connectionRef.current = peer;
  };

  const answerCall = () => {
    setCallAccepted(true);
    setReceivingCall(false);
    // ✨ STUN SERVERS ADDED HERE TO BYPASS NAT FIREWALL
    const peer = new Peer({ 
        initiator: false, 
        trickle: false, 
        stream: stream,
        config: {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' },
                { urls: 'stun:global.stun.twilio.com:3478' }
            ]
        }
    });
    
    peer.on("signal", (data) => socket?.emit("answer-call", { signal: data, to: callerId }));
    peer.on("stream", (currentStream) => { if (userVideoRef.current) userVideoRef.current.srcObject = currentStream; });
    peer.on("data", handlePeerData); 
    
    peer.on("close", () => window.location.reload());

    peer.on("connect", () => {
        setTimeout(() => {
            peer.send(JSON.stringify({ type: 'handshake', id: authData?._id, name: myDisplayName }));
        }, 800);
    });
    peer.signal(callerSignal);
    connectionRef.current = peer;
  };

  const leaveCall = () => {
    setCallEnded(true);
    setIsCalling(false); 
    
    if (connectionRef.current && connectionRef.current.connected) {
        try { 
            connectionRef.current.send(JSON.stringify({ type: 'end-call' })); 
        } catch (err) { 
            console.debug("Failed to send disconnect signal", err); 
        }
    }
    
    if (connectionRef.current) connectionRef.current.destroy();
    socket?.emit("end-call", { to: callAccepted ? callerId : idToCall });
    window.location.reload(); 
  };

  const toggleMic = async () => {
    if (micEnabled) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
          audioTrack.stop(); 
          stream.removeTrack(audioTrack);
          if (connectionRef.current) { 
              try { 
                  connectionRef.current.removeTrack(audioTrack, stream); 
              } catch (err) { 
                  console.debug("Track removal ignored", err); 
              } 
          }
      }
      setMicEnabled(false);
    } else {
      try {
        const newStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const newAudioTrack = newStream.getAudioTracks()[0];
        stream.addTrack(newAudioTrack);
        if (connectionRef.current) { 
            try { 
                connectionRef.current.addTrack(newAudioTrack, stream); 
            } catch (err) { 
                console.debug("Track addition ignored", err); 
            } 
        }
        setMicEnabled(true);
      } catch (err) { console.error("Mic error:", err); }
    }
  };

  const toggleCamera = async () => {
    if (cameraEnabled) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
          videoTrack.stop(); 
          stream.removeTrack(videoTrack);
          if (connectionRef.current) { 
              try { 
                  connectionRef.current.removeTrack(videoTrack, stream); 
              } catch (err) { 
                  console.debug("Track removal ignored", err); 
              } 
          }
      }
      setCameraEnabled(false);
    } else {
      try {
        const newStream = await navigator.mediaDevices.getUserMedia({ video: true });
        const newVideoTrack = newStream.getVideoTracks()[0];
        stream.addTrack(newVideoTrack);
        if (connectionRef.current) { 
            try { 
                connectionRef.current.addTrack(newVideoTrack, stream); 
            } catch (err) { 
                console.debug("Track addition ignored", err); 
            } 
        }
        if (myVideoRef.current) myVideoRef.current.srcObject = stream;
        setCameraEnabled(true);
      } catch (err) { console.error("Camera error:", err); }
    }
  };

  const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ cursor: true });
        const screenTrack = screenStream.getVideoTracks()[0];
        const existingVideoTrack = stream.getVideoTracks()[0];
        if (existingVideoTrack) {
            stream.removeTrack(existingVideoTrack);
            if (connectionRef.current) { 
                try { 
                    connectionRef.current.replaceTrack(existingVideoTrack, screenTrack, stream); 
                } catch (err) { 
                    console.debug("Track replacement ignored", err); 
                } 
            }
        } else {
            stream.addTrack(screenTrack);
            if (connectionRef.current) { 
                try { 
                    connectionRef.current.addTrack(screenTrack, stream); 
                } catch (err) { 
                    console.debug("Track addition ignored", err); 
                } 
            }
        }
        if (myVideoRef.current) myVideoRef.current.srcObject = screenStream;
        screenTrackRef.current = screenTrack;
        setIsScreenSharing(true);
        screenTrack.onended = () => stopScreenShare();
      } catch (error) { console.error("Screen share error:", error); }
    } else { stopScreenShare(); }
  };

  const stopScreenShare = () => {
    if (screenTrackRef.current) screenTrackRef.current.stop();
    setIsScreenSharing(false);
    if (cameraEnabled) { setCameraEnabled(false); toggleCamera(); } 
    else { if (myVideoRef.current) myVideoRef.current.srcObject = null; }
  };

  const copyMyId = () => {
    navigator.clipboard.writeText(myPodId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sendChat = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    const msgObj = { text: newMessage, sender: 'me', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setMessages(prev => [...prev, msgObj]);
    if (connectionRef.current && connectionRef.current.connected) {
        connectionRef.current.send(JSON.stringify({ type: 'chat', message: { ...msgObj, sender: 'peer' } }));
    }
    setNewMessage("");
  };

  const handleCodeChange = (e) => {
    const newCode = e.target.value;
    setCodeText(newCode);
    if (connectionRef.current && connectionRef.current.connected) {
        try { 
            connectionRef.current.send(JSON.stringify({ type: 'code', text: newCode })); 
        } catch (err) { 
            console.debug("Code sync delayed", err); 
        }
    }
  };

  useEffect(() => { if (chatScrollRef.current) chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight; }, [messages]);

  useEffect(() => {
    let interval;
    if (isTimerRunning) interval = setInterval(() => setInterviewTime(prev => prev + 1), 1000);
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const toggleTimer = () => {
    const newState = !isTimerRunning;
    setIsTimerRunning(newState);
    if (connectionRef.current && connectionRef.current.connected) {
        connectionRef.current.send(JSON.stringify({ type: 'timer', isRunning: newState, time: interviewTime }));
    }
  };

  const resetTimer = () => {
    setIsTimerRunning(false);
    setInterviewTime(0);
    if (connectionRef.current && connectionRef.current.connected) {
        connectionRef.current.send(JSON.stringify({ type: 'timer', isRunning: false, time: 0 }));
    }
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
    } else { document.exitFullscreen(); }
  };

  return (
    <div ref={podContainerRef} className={`flex flex-col items-center custom-scrollbar overflow-y-auto bg-[#ebf8ff] ${isFullscreen ? 'w-screen h-screen p-2 sm:p-4 md:p-6' : 'p-3 sm:p-4 md:p-6 h-full pb-32'}`}>
      
      {/* HEADER & STOPWATCH */}
      <div className={`w-full flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 md:mb-6 gap-4 ${isFullscreen ? 'max-w-[1600px]' : 'max-w-7xl'}`}>
        <div>
            <h1 className="text-2xl sm:text-3xl font-black text-purple-700">The Focus Pod</h1>
            <p className="text-sm sm:text-base text-gray-500 font-medium">1-on-1 Mentorship & Study Room</p>
        </div>
        
        {callAccepted && (
            <div className="flex items-center gap-2 sm:gap-3 bg-white px-3 sm:px-4 py-2 rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 self-end sm:self-auto z-50">
                <Timer className="text-purple-500" size={20} />
                <span className="text-xl sm:text-2xl font-mono font-bold text-gray-800 w-16 sm:w-20 text-center">{formatTime(interviewTime)}</span>
                <div className="flex gap-1 border-l border-gray-200 pl-2 sm:pl-3">
                    <button onClick={toggleTimer} className={`p-1.5 sm:p-2 rounded-lg ${isTimerRunning ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'} hover:opacity-80`}>
                        {isTimerRunning ? <Pause size={16}/> : <Play size={16}/>}
                    </button>
                    <button onClick={resetTimer} className="p-1.5 sm:p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100"><RotateCcw size={16}/></button>
                </div>
            </div>
        )}
      </div>

      {/* 🟢 DYNAMIC VIDEO AREA (Grid & WhatsApp PiP Swapping) */}
      <div className={`w-full flex flex-col lg:flex-row gap-4 md:gap-6 relative min-h-[400px] sm:min-h-0 flex-1 ${isFullscreen ? 'max-w-[1600px]' : 'max-w-7xl'}`}>
        
        <div className={`flex-1 min-w-0 flex transition-all duration-500 ${
            layoutMode === "grid" || !callAccepted
                ? `items-center justify-center flex-col sm:flex-row gap-4 md:gap-8`
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

        {/* SIDEBAR */}
        {isSidebarOpen && callAccepted && (
            <div className="absolute inset-0 z-40 lg:relative lg:inset-auto lg:z-auto w-full lg:w-96 bg-white border border-gray-200 rounded-2xl sm:rounded-3xl shadow-2xl lg:shadow-lg flex flex-col overflow-hidden lg:min-h-[400px]">
                <div className="flex border-b border-gray-100 bg-gray-50">
                    <button onClick={() => setActiveTab('chat')} className={`flex-1 p-3 sm:p-4 font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === 'chat' ? 'text-purple-600 border-b-2 border-purple-600 bg-white' : 'text-gray-500 hover:bg-gray-100'}`}><MessageSquare size={18}/> Chat</button>
                    <button onClick={() => setActiveTab('code')} className={`flex-1 p-3 sm:p-4 font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === 'code' ? 'text-emerald-600 border-b-2 border-emerald-600 bg-white' : 'text-gray-500 hover:bg-gray-100'}`}><Code size={18}/> Code Pad</button>
                    <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-3 sm:p-4 text-gray-500 hover:bg-gray-200"><X size={18} /></button>
                </div>
                {activeTab === 'chat' ? (
                    <>
                        <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 custom-scrollbar bg-white">
                            {messages.length === 0 && <p className="text-center text-gray-400 text-xs sm:text-sm mt-10">Send a message to start!</p>}
                            {messages.map((msg, i) => (
                                <div key={i} className={`flex flex-col max-w-[85%] ${msg.sender === 'me' ? 'self-end items-end' : 'self-start items-start'}`}>
                                    <div className={`p-2.5 rounded-2xl ${msg.sender === 'me' ? 'bg-purple-600 text-white rounded-tr-sm' : 'bg-gray-100 text-gray-800 rounded-tl-sm'}`}>
                                        <p className="text-xs sm:text-sm break-words whitespace-pre-wrap">{msg.text}</p>
                                    </div>
                                    <span className="text-[9px] text-gray-400 mt-1">{msg.time}</span>
                                </div>
                            ))}
                        </div>
                        <form onSubmit={sendChat} className="p-3 border-t border-gray-100 flex gap-2"><input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a message..." className="flex-1 bg-gray-100 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 ring-purple-300" /><button type="submit" disabled={!newMessage.trim()} className="bg-purple-600 text-white p-2 rounded-xl disabled:opacity-50"><Send size={16}/></button></form>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col bg-[#1e1e1e] relative">
                        <div className="px-4 py-2 bg-[#2d2d2d] text-xs font-mono text-gray-400 flex justify-between items-center border-b border-gray-700"><span>Shared Editor (Live)</span><span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span></div>
                        <textarea value={codeText} onChange={handleCodeChange} spellCheck="false" className="flex-1 w-full p-4 bg-transparent text-[#9cdcfe] font-mono text-sm sm:text-base outline-none resize-none custom-scrollbar leading-relaxed" />
                    </div>
                )}
            </div>
        )}
      </div>

      <div className={`mt-4 sm:mt-6 flex flex-col lg:flex-row gap-4 sm:gap-6 w-full bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 shrink-0 ${isFullscreen ? 'max-w-[1600px]' : 'max-w-7xl'}`}>
        <div className="flex justify-center gap-2 sm:gap-3 border-b lg:border-b-0 lg:border-r border-gray-200 pb-4 lg:pb-0 lg:pr-6 flex-wrap">
            <button onClick={toggleMic} className={`p-3 md:p-4 rounded-xl transition-all ${micEnabled ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-red-50 text-red-600'}`}>{micEnabled ? <Mic size={20} /> : <MicOff size={20} />}</button>
            <button onClick={toggleCamera} disabled={isScreenSharing} className={`p-3 md:p-4 rounded-xl transition-all ${cameraEnabled ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-red-50 text-red-600'} disabled:opacity-50`}>{cameraEnabled ? <Video size={20} /> : <VideoOff size={20} />}</button>
            <button onClick={toggleScreenShare} className={`p-3 md:p-4 rounded-xl transition-all ${!isScreenSharing ? 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100' : 'bg-indigo-600 text-white shadow-md'}`}>{!isScreenSharing ? <MonitorUp size={20} /> : <MonitorOff size={20} />}</button>
            <div className="w-px h-8 sm:h-10 bg-gray-200 self-center mx-1 sm:mx-2 hidden sm:block"></div>
            <button onClick={() => setIsMirrored(!isMirrored)} disabled={!cameraEnabled || isScreenSharing} className="hidden sm:block p-3 md:p-4 rounded-xl bg-amber-50 text-amber-600 hover:bg-amber-100 border border-amber-100 disabled:opacity-50"><FlipHorizontal size={20} /></button>
            <button onClick={toggleFullScreen} className="hidden sm:block p-3 md:p-4 rounded-xl bg-teal-50 text-teal-600 hover:bg-teal-100 border border-teal-100">{isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}</button>
            {callAccepted && (
                <>
                    <button onClick={() => setLayoutMode(prev => prev === "grid" ? "focus" : "grid")} className={`p-3 md:p-4 rounded-xl transition-all ${layoutMode === 'focus' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-700'}`}>
                        {layoutMode === "grid" ? <LayoutGrid size={20} /> : <PanelRight size={20} />}
                    </button>
                    <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className={`p-3 md:p-4 rounded-xl transition-all ${isSidebarOpen ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-700'}`}>
                        <MessageSquare size={20}/>
                    </button>
                </>
            )}
        </div>
        <div className="flex-1 flex flex-col gap-3 sm:gap-4 justify-center w-full">
            {callAccepted ? (
                <div className="flex-1 flex justify-center items-center h-full w-full">
                    <button onClick={leaveCall} className="w-full py-3 sm:py-4 bg-red-500 hover:bg-red-600 text-white rounded-xl sm:rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95 lg:hover:scale-105 min-h-[48px] whitespace-nowrap"><PhoneOff size={20} /> END SESSION</button>
                </div>
            ) : receivingCall ? (
                <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 items-center w-full">
                  <div className="w-full lg:w-auto flex-1 flex items-center justify-between bg-indigo-50 border border-indigo-100 p-2 rounded-xl sm:rounded-2xl">
                    <div className="flex flex-col overflow-hidden pr-2"><span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Secure Pod Code</span><span className="text-xs sm:text-sm font-mono font-bold text-indigo-900 truncate tracking-widest">{myPodId || "Generating..."}</span></div>
                    <button onClick={copyMyId} className="p-1.5 bg-white text-indigo-600 rounded-lg shadow-sm hover:bg-indigo-600 hover:text-white transition-colors shrink-0">{copied ? <CheckCheck size={18} /> : <Copy size={18} />}</button>
                  </div>
                  <div className="w-full lg:w-auto flex-1 flex items-center justify-between gap-2 bg-emerald-500 p-1 pl-4 rounded-xl sm:rounded-2xl shadow-sm overflow-hidden animate-pulse">
                      <div className="flex flex-col text-white flex-1 min-w-0 pr-2">
                          <span className="text-sm sm:text-base font-bold truncate">{callerName} is calling!</span>
                          <span className="text-[10px] sm:text-xs opacity-90 truncate">Click Answer to join</span>
                      </div>
                      <button onClick={answerCall} className="px-5 sm:px-8 bg-white text-emerald-600 hover:bg-emerald-50 rounded-xl font-black flex items-center justify-center gap-2 transition-transform hover:scale-105 active:scale-95 shrink-0 text-sm sm:text-base py-2.5 sm:py-3 h-full">
                          <PhoneIncoming size={18} /> <span className="hidden sm:block">Answer</span>
                      </button>
                  </div>
                </div>
            ) : (
                <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 items-center w-full">
                  <div className="w-full lg:w-auto flex-1 flex items-center justify-between bg-indigo-50 border border-indigo-100 p-2 rounded-xl sm:rounded-2xl">
                    <div className="flex flex-col overflow-hidden pr-2"><span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Secure Pod Code</span><span className="text-xs sm:text-sm font-mono font-bold text-indigo-900 truncate tracking-widest">{myPodId || "Generating..."}</span></div>
                    <button onClick={copyMyId} className="p-1.5 bg-white text-indigo-600 rounded-lg shadow-sm hover:bg-indigo-600 hover:text-white transition-colors shrink-0">{copied ? <CheckCheck size={18} /> : <Copy size={18} />}</button>
                  </div>
                  <div className="w-full lg:w-auto flex-1 flex gap-2">
                      <input type="text" placeholder="Enter Pod Code..." value={idToCall} onChange={(e) => setIdToCall(e.target.value)} className="flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-200 text-sm sm:text-base font-mono uppercase tracking-widest min-w-0" />
                      <button onClick={() => callUser(idToCall.toUpperCase())} disabled={!idToCall || isCalling} className="px-4 sm:px-6 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold flex items-center gap-2 disabled:opacity-50 transition-colors shrink-0 text-sm sm:text-base w-32 justify-center">
                          {isCalling ? (
                              <>
                                  <div className="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4"></div>
                                  Calling...
                              </>
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