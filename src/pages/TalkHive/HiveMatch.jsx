import React, { useEffect, useRef, useState } from "react";
import { Mic, MicOff, Video, VideoOff, PhoneOff, Zap, Loader2, Timer } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import io from "socket.io-client";
import Peer from "simple-peer";

// ✨ FIX: Import your bulletproof URL!
import { BACKEND_URL } from "../../api";

// Initialize the socket using the single source of truth
const socket = io(BACKEND_URL);

export default function HiveMatch() {
  const { authData } = useAuth();
  
  const [stream, setStream] = useState(null);
  const [micEnabled, setMicEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  
  const [isSearching, setIsSearching] = useState(false);
  const [matchFound, setMatchFound] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes = 300 seconds
  
  const myVideoRef = useRef();
  const userVideoRef = useRef();
  const connectionRef = useRef();

  // 1. Initialize Camera
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((currentStream) => {
        setStream(currentStream);
        if (myVideoRef.current) myVideoRef.current.srcObject = currentStream;
      })
      .catch((err) => console.error("Failed to access media:", err));

    if (authData?._id) socket.emit("join", authData._id);

    return () => {
        if (stream) stream.getTracks().forEach(track => track.stop());
        socket.emit("leave-matchmaking", authData?._id);
    };
  }, [authData]);

  // 2. The 5-Minute Countdown Timer
  useEffect(() => {
    let timerId;
    if (matchFound && timeLeft > 0) {
      timerId = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0) {
      leaveCall(); // Auto-hangup when timer hits 0!
    }
    return () => clearInterval(timerId);
  }, [matchFound, timeLeft]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  // 3. Matchmaking Logic
  const startMatchmaking = () => {
    setIsSearching(true);
    socket.emit("join-matchmaking", authData._id);
  };

  // Listen for a match from the backend
  useEffect(() => {
    socket.on("match-found", ({ matchedUser, initiator }) => {
      setIsSearching(false);
      setMatchFound(true);
      setTimeLeft(300); // Reset timer to 5 mins

      if (initiator) {
        // We are the caller
        const peer = new Peer({ initiator: true, trickle: false, stream: stream });
        peer.on("signal", (data) => socket.emit("call-user", { userToCall: matchedUser, signalData: data, from: authData._id, name: "Hive Match Peer" }));
        peer.on("stream", (currentStream) => { if (userVideoRef.current) userVideoRef.current.srcObject = currentStream; });
        socket.on("call-accepted", (signal) => peer.signal(signal));
        connectionRef.current = peer;
      }
    });

    // Listen for incoming match call (if we are the receiver)
    socket.on("call-incoming", (data) => {
        if(isSearching) {
            setIsSearching(false);
            setMatchFound(true);
            setTimeLeft(300);
            const peer = new Peer({ initiator: false, trickle: false, stream: stream });
            peer.on("signal", (ansData) => socket.emit("answer-call", { signal: ansData, to: data.from }));
            peer.on("stream", (currentStream) => { if (userVideoRef.current) userVideoRef.current.srcObject = currentStream; });
            peer.signal(data.signal);
            connectionRef.current = peer;
        }
    });

    return () => {
      socket.off("match-found");
      socket.off("call-incoming");
      socket.off("call-accepted");
    };
  }, [stream, isSearching]);

  const leaveCall = () => {
    setMatchFound(false);
    setIsSearching(false);
    setTimeLeft(300);
    if (connectionRef.current) connectionRef.current.destroy();
    window.location.reload();
  };

  const toggleMic = () => { 
      if (stream) { 
          const audioTrack = stream.getAudioTracks()[0]; 
          audioTrack.enabled = !audioTrack.enabled; 
          setMicEnabled(audioTrack.enabled); 
      } 
  };
  
  const toggleCamera = () => { 
      if (stream) { 
          const videoTrack = stream.getVideoTracks()[0]; 
          videoTrack.enabled = !videoTrack.enabled; 
          setCameraEnabled(videoTrack.enabled); 
      } 
  };

  return (
    <div className="p-6 h-full flex flex-col items-center">
      
      {/* 🟢 TOP HEADER & TIMER */}
      <div className="w-full max-w-5xl flex justify-between items-center mb-6 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div>
            <h1 className="text-2xl font-black flex items-center gap-2 text-amber-600"><Zap size={24}/> Hive Match</h1>
            <p className="text-gray-500 text-sm font-medium">5-Minute Speed Networking</p>
        </div>
        
        {matchFound && (
            <div className={`flex items-center gap-2 px-6 py-2 rounded-xl font-black text-xl shadow-inner ${timeLeft < 60 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-amber-100 text-amber-700'}`}>
                <Timer size={24} /> {formatTime(timeLeft)}
            </div>
        )}
      </div>

      {/* 🟢 VIDEO SCREENS */}
      <div className="w-full max-w-5xl flex flex-col md:flex-row gap-6 justify-center relative min-h-[400px]">
        
        {/* Radar Overlay when searching */}
        {isSearching && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm rounded-3xl border-4 border-amber-200">
                <Loader2 size={64} className="text-amber-500 animate-spin mb-4" />
                <h2 className="text-2xl font-bold text-gray-800">Looking for a Peer...</h2>
                <p className="text-gray-500 mt-2">Waiting for someone to join the Hive.</p>
                <button onClick={() => {setIsSearching(false); socket.emit("leave-matchmaking", authData?._id);}} className="mt-6 px-6 py-2 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 font-bold">
                    Cancel Search
                </button>
            </div>
        )}

        {/* My Video */}
        <div className={`relative aspect-video bg-gray-900 rounded-3xl overflow-hidden shadow-xl border-4 ${matchFound ? 'w-full md:w-1/2 border-amber-500' : 'w-full max-w-2xl border-gray-800'}`}>
          <video ref={myVideoRef} playsInline muted autoPlay className={`w-full h-full object-cover ${!cameraEnabled ? 'hidden' : ''}`} />
          {!cameraEnabled && <div className="absolute inset-0 flex items-center justify-center bg-gray-800 text-white font-bold">Camera Off</div>}
          <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1 rounded-lg text-sm font-bold">You</div>
        </div>

        {/* Peer Video */}
        {matchFound && (
          <div className="relative w-full md:w-1/2 aspect-video bg-gray-900 rounded-3xl overflow-hidden shadow-xl border-4 border-amber-500">
            <video ref={userVideoRef} playsInline autoPlay className="w-full h-full object-cover" />
            <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1 rounded-lg text-sm font-bold">Peer</div>
          </div>
        )}
      </div>

      {/* 🟢 CONTROLS */}
      <div className="mt-8 flex gap-6 w-full max-w-2xl bg-white p-6 rounded-3xl shadow-sm border border-gray-100 justify-center">
        <button onClick={toggleMic} className={`p-4 rounded-2xl transition-all ${micEnabled ? 'bg-gray-100 text-gray-700' : 'bg-red-50 text-red-600'}`}>
            {micEnabled ? <Mic size={24} /> : <MicOff size={24} />}
        </button>
        <button onClick={toggleCamera} className={`p-4 rounded-2xl transition-all ${cameraEnabled ? 'bg-gray-100 text-gray-700' : 'bg-red-50 text-red-600'}`}>
            {cameraEnabled ? <Video size={24} /> : <VideoOff size={24} />}
        </button>

        {!isSearching && !matchFound && (
            <button onClick={startMatchmaking} className="px-8 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-black flex items-center gap-2 shadow-lg transition-transform hover:scale-105">
                <Zap size={24} /> Find Match
            </button>
        )}

        {matchFound && (
            <button onClick={leaveCall} className="px-8 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-black flex items-center gap-2 shadow-lg transition-transform hover:scale-105">
                <PhoneOff size={24} /> Skip / Leave
            </button>
        )}
      </div>
    </div>
  );
}