import React, { useEffect, useRef, useState, useCallback } from 'react';
import Peer from 'simple-peer';
import { Video, Mic, VideoOff, MicOff, PhoneOff, PhoneIncoming, Phone } from 'lucide-react';

const VideoCall = ({ socket, myId, otherUserId, otherUserName, onClose, incomingCall = null }) => {
  const [stream, setStream] = useState(null);
  
  const [receivingCall, setReceivingCall] = useState(!!incomingCall);
  const [caller, setCaller] = useState(incomingCall?.from || "");
  const [callerSignal, setCallerSignal] = useState(incomingCall?.signal || null);
  
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [isCalling, setIsCalling] = useState(false);

  // Local Hardware Toggles
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);

  // ✅ NEW: Remote Hardware Toggles (The other person's state)
  const [isRemoteVideoOn, setIsRemoteVideoOn] = useState(true);
  const [isRemoteMicOn, setIsRemoteMicOn] = useState(true);

  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();
  const streamRef = useRef(); 

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((currentStream) => {
      setStream(currentStream);
      streamRef.current = currentStream; 
      if (myVideo.current) myVideo.current.srcObject = currentStream;
    }).catch(err => console.error("Camera access denied:", err));

    socket.on("call-incoming", (data) => {
      setReceivingCall(true);
      setCaller(data.from);
      setCallerSignal(data.signal);
    });

    socket.on("call-ended", () => {
      setCallEnded(true);
      if (connectionRef.current) connectionRef.current.destroy();
      handleClose(); 
    });

    // ✅ NEW: Listen for the other person toggling their hardware
    socket.on("remote-media-changed", (data) => {
      console.log("🚨 FRONTEND RECEIVED MEDIA UPDATE:", data);
      if (data.type === "video") setIsRemoteVideoOn(data.isEnabled);
      if (data.type === "audio") setIsRemoteMicOn(data.isEnabled);
    });

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (connectionRef.current) connectionRef.current.destroy();
      
      socket.off("call-incoming");
      socket.off("call-ended");
      socket.off("call-accepted");
      socket.off("remote-media-changed"); // Clean up our new listener
    };
  }, [socket, handleClose]);

  const callUser = () => {
    setIsCalling(true);
    const peer = new Peer({ initiator: true, trickle: false, stream: stream });

    peer.on("signal", (data) => {
      socket.emit("call-user", { userToCall: otherUserId, signalData: data, from: myId, name: "You" });
    });

    peer.on("stream", (currentStream) => {
      if (userVideo.current) userVideo.current.srcObject = currentStream;
    });

    socket.on("call-accepted", (signal) => {
      setCallAccepted(true);
      peer.signal(signal);
    });

    connectionRef.current = peer;
  };

  const answerCall = () => {
    setCallAccepted(true);
    const peer = new Peer({ initiator: false, trickle: false, stream: stream });

    peer.on("signal", (data) => {
      socket.emit("answer-call", { signal: data, to: caller });
    });

    peer.on("stream", (currentStream) => {
      if (userVideo.current) userVideo.current.srcObject = currentStream;
    });

    peer.signal(callerSignal);
    connectionRef.current = peer;
  };

  const leaveCall = () => {
    setCallEnded(true);
    socket.emit("end-call", { to: callAccepted ? (caller || otherUserId) : otherUserId });
    handleClose();
  };

const handleClose = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    onClose(); 
  }, [onClose]);

  // ✅ UPDATED: Tell the backend when we turn off our camera
  const toggleVideo = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      videoTrack.enabled = !videoTrack.enabled;
      setIsVideoOn(videoTrack.enabled);
      console.log(`🚨 SENDING VIDEO UPDATE TO: ${otherUserId}`);

      socket.emit("toggle-media", {
        to: callAccepted ? (caller || otherUserId) : otherUserId,
        type: "video",
        isEnabled: videoTrack.enabled
      });
    }
  };

  // ✅ UPDATED: Tell the backend when we mute our mic
  const toggleMic = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      audioTrack.enabled = !audioTrack.enabled;
      setIsMicOn(audioTrack.enabled);
      console.log(`🚨 SENDING AUDIO UPDATE TO: ${otherUserId}`);

      socket.emit("toggle-media", {
        to: callAccepted ? (caller || otherUserId) : otherUserId,
        type: "audio",
        isEnabled: audioTrack.enabled
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-950 z-50 flex flex-col items-center justify-center p-4">
      <div className="relative w-full max-w-5xl aspect-video bg-gray-900 rounded-2xl overflow-hidden shadow-2xl border border-gray-800">
        
        {/* ========================================================= */}
        {/* STATE 1: CONNECTED (SHOWS THEIR VIDEO FULL SCREEN)        */}
        {/* ========================================================= */}
        {callAccepted && !callEnded ? (
          <div className="relative w-full h-full">
            <video ref={userVideo} playsInline autoPlay className="w-full h-full object-cover" />
            
            {/* 🎥 Remote Video Off Overlay */}
            {!isRemoteVideoOn && (
              <div className="absolute inset-0 bg-gray-800 flex flex-col items-center justify-center">
                <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mb-4 shadow-inner">
                  <span className="text-4xl text-gray-300 font-bold">
                    {otherUserName ? otherUserName.charAt(0).toUpperCase() : '?'}
                  </span>
                </div>
                <p className="text-gray-400 text-lg">{otherUserName}'s camera is off</p>
              </div>
            )}

            {/* 🎤 Remote Muted Icon (Top Left) */}
            {!isRemoteMicOn && (
              <div className="absolute top-6 left-6 bg-red-500/90 backdrop-blur-sm p-3 rounded-full shadow-lg animate-pulse">
                <MicOff size={24} className="text-white" />
              </div>
            )}
          </div>
        ) : (
          
        /* ========================================================= */
        /* STATE 2: WAITING/RINGING (SHOWS MY VIDEO FULL SCREEN)     */
        /* ========================================================= */
          <div className="relative w-full h-full">
             <video ref={myVideo} playsInline autoPlay muted className="w-full h-full object-cover transform scale-x-[-1]" />
             
             {/* 🎥 Local Video Off Overlay */}
             {!isVideoOn && (
               <div className="absolute inset-0 bg-gray-800 flex flex-col items-center justify-center z-10">
                 <VideoOff size={64} className="text-gray-600 mb-4" />
                 <p className="text-gray-400 text-xl font-medium">Your camera is off</p>
               </div>
             )}
          </div>
        )}

        {/* ========================================================= */}
        {/* PICTURE-IN-PICTURE (SHOWS MY VIDEO IN THE CORNER)         */}
        {/* ========================================================= */}
        {callAccepted && !callEnded && (
          <div className="absolute top-6 right-6 w-48 aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border-2 border-gray-700 z-10">
             <video ref={myVideo} playsInline autoPlay muted className="w-full h-full object-cover transform scale-x-[-1]" />
             
             {/* 🎥 Local Video Off Overlay (PiP) */}
             {!isVideoOn && (
               <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                 <VideoOff size={28} className="text-gray-500" />
               </div>
             )}
             
             {/* 🎤 Local Muted Icon (PiP) */}
             {!isMicOn && (
               <div className="absolute bottom-2 right-2 bg-red-500 p-1.5 rounded-full shadow-md">
                 <MicOff size={14} className="text-white" />
               </div>
             )}
          </div>
        )}

        {/* 🔔 INCOMING CALL OVERLAY */}
        {receivingCall && !callAccepted && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center animate-pulse z-20">
            <div className="bg-gray-800 p-8 rounded-2xl flex flex-col items-center shadow-2xl border border-gray-700">
              <div className="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center mb-4 animate-bounce">
                <PhoneIncoming size={32} className="text-white" />
              </div>
              <h2 className="text-white text-2xl font-bold mb-2">{otherUserName} is calling...</h2>
              <button onClick={answerCall} className="mt-6 px-8 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-full shadow-lg transition-transform hover:scale-105">
                Accept Call
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 🎛️ CONTROL PANEL */}
      <div className="absolute bottom-8 flex gap-6 bg-gray-900/80 backdrop-blur-md px-8 py-4 rounded-full border border-gray-700 shadow-2xl z-30">
        <button onClick={toggleMic} className={`p-4 rounded-full transition-all ${isMicOn ? 'bg-gray-800 hover:bg-gray-700 text-white' : 'bg-red-500 text-white shadow-lg shadow-red-500/20'}`}>
          {isMicOn ? <Mic size={24} /> : <MicOff size={24} />}
        </button>
        
        {!callAccepted && !receivingCall && !isCalling && (
          <button onClick={callUser} className="p-4 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/20 transition-transform hover:scale-110">
            <Phone size={24} />
          </button>
        )}

        {(callAccepted || isCalling) && (
          <button onClick={leaveCall} className="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20 transition-transform hover:scale-110">
            <PhoneOff size={24} />
          </button>
        )}
        
        <button onClick={toggleVideo} className={`p-4 rounded-full transition-all ${isVideoOn ? 'bg-gray-800 hover:bg-gray-700 text-white' : 'bg-red-500 text-white shadow-lg shadow-red-500/20'}`}>
          {isVideoOn ? <Video size={24} /> : <VideoOff size={24} />}
        </button>
      </div>

      {/* ❌ CANCEL BUTTON (Top Right, before call connects) */}
      {!callAccepted && !receivingCall && (
        <button onClick={handleClose} className="absolute top-6 right-6 p-2 text-gray-400 hover:text-white bg-gray-800 rounded-full transition-colors z-30">
          <PhoneOff size={20} />
        </button>
      )}
    </div>
  );
};

export default VideoCall;