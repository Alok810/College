import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import Peer from "simple-peer";

// ✨ Import TALKHIVE_URL and AuthContext
import { TALKHIVE_URL } from "../api";
import { useAuth } from "../context/AuthContext";

const generateSecureRoomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `RIGYA-${code}`;
};

// 🟢 Generates a fake, pure-black video stream
const createEmptyVideoTrack = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    canvas.getContext('2d').fillRect(0, 0, 640, 480);
    const stream = canvas.captureStream();
    return stream.getVideoTracks()[0];
};

// 🟢 Generates a pure silent audio track if hardware is missing/blocked
const createEmptyAudioTrack = () => {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const dest = ctx.createMediaStreamDestination();
        const track = dest.stream.getAudioTracks()[0];
        track.enabled = false;
        return track;
    } catch {
        return null;
    }
};

// 🟢 GLOBAL MEMORY: Prevents the code from changing when navigating between React pages
let globalSessionPodId = null;

export const useFocusPod = () => {
    const { authData } = useAuth();
    const myDisplayName = authData?.name || authData?.username || authData?.user?.name || "Student";

    // --- STATES ---
    const [socket, setSocket] = useState(null);
    const [stream, setStream] = useState(null);
    const [micEnabled, setMicEnabled] = useState(false);
    const [cameraEnabled, setCameraEnabled] = useState(false);
    const [isScreenSharing, setIsScreenSharing] = useState(false);

    // Graceful error state for UI toasts
    const [mediaError, setMediaError] = useState(null);

    // Only generate a new code if one doesn't exist in the global memory
    const [myPodId, setMyPodId] = useState(() => {
        if (!globalSessionPodId) {
            globalSessionPodId = generateSecureRoomCode();
        }
        return globalSessionPodId;
    });
    
    const [idToCall, setIdToCall] = useState("");
    const [receivingCall, setReceivingCall] = useState(false);
    const [isCalling, setIsCalling] = useState(false);

    const [callerName, setCallerName] = useState("");
    const [callerId, setCallerId] = useState("");
    const [callerRealDbId, setCallerRealDbId] = useState(null);
    const [callerSignal, setCallerSignal] = useState(null);
    const [callAccepted, setCallAccepted] = useState(false);
    const [callEnded, setCallEnded] = useState(false);

    const [messages, setMessages] = useState([]);
    const [codeText, setCodeText] = useState("// Welcome to the Collaborative Code Pad!\n// Start typing to share code instantly...\n\n");
    const [interviewTime, setInterviewTime] = useState(0);
    const [isTimerRunning, setIsTimerRunning] = useState(false);

    // --- REFS ---
    const myVideoRef = useRef();
    const userVideoRef = useRef();
    const connectionRef = useRef();
    const screenTrackRef = useRef();
    const chatScrollRef = useRef();
    const ringtoneAudioRef = useRef(typeof window !== "undefined" ? new Audio('/ringtone.mp3') : null);

    // --- FIREWALL CONFIG ---
    const getIceServers = () => ({
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:global.stun.twilio.com:3478' }
        ]
    });

    // --- INITIALIZATION ---
    useEffect(() => {
        const userId = authData?._id;
        
        // 🟢 ADD THIS LINE HERE TOO!
        if (!userId) return;

        const newSocket = io(TALKHIVE_URL, { 
            auth: { userId: userId } 
        });
        
        newSocket.on("connect_error", (err) => {
            console.error("🔌 TalkHive Socket Error:", err.message);
        });
        
        setSocket(newSocket);

        // Uses the state variable, preventing recreation on mount
        if (authData?._id) newSocket.emit("join-pod", myPodId);

        navigator.mediaDevices.getUserMedia({
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true,
                sampleRate: 48000, 
                channelCount: 1    
            }
        })
        .then((audioStream) => {
            const audioTrack = audioStream.getAudioTracks()[0];
            audioTrack.enabled = false;

            const dummyVideoTrack = createEmptyVideoTrack();
            const mixedStream = new MediaStream([audioTrack, dummyVideoTrack]);

            setStream(mixedStream);
            if (myVideoRef.current) myVideoRef.current.srcObject = mixedStream;
        })
        .catch(err => {
            console.warn("Hardware access blocked or missing, falling back to dummy tracks:", err);

            if (err.name === 'NotFoundError') setMediaError("No microphone found. Plug one in to speak.");
            else if (err.name === 'NotAllowedError') setMediaError("Microphone blocked. Check your URL bar permissions.");
            else setMediaError("Hardware access failed. You are in Text/Code mode.");

            const dummyVideoTrack = createEmptyVideoTrack();
            const dummyAudioTrack = createEmptyAudioTrack();
            const tracks = [dummyVideoTrack];
            if (dummyAudioTrack) tracks.push(dummyAudioTrack);

            const fallbackStream = new MediaStream(tracks);
            setStream(fallbackStream);
            if (myVideoRef.current) myVideoRef.current.srcObject = fallbackStream;
        });

        newSocket.on("call-incoming", (data) => {
            setReceivingCall(true);
            setCallerId(data.from);
            setCallerName(data.name || "Remote User");
            setCallerSignal(data.signal);
        });

        newSocket.on("call-ended", () => window.location.reload());

        return () => {
            newSocket.off("call-incoming");
            newSocket.off("call-ended");
            newSocket.disconnect();
            if (stream) stream.getTracks().forEach(track => track.stop());
            if (screenTrackRef.current) screenTrackRef.current.stop();
        };
        // eslint-disable-next-line
    }, [authData, myPodId]);

    // --- PEER DATA HANDLER ---
    const handlePeerData = (data) => {
        try {
            const parsed = JSON.parse(data.toString());
            if (parsed.type === 'end-call') window.location.reload();
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

    // --- CALL ACTIONS ---
    const callUser = (userToCallId) => {
        if (!stream) return alert("Stream initialization failed. Refresh the page.");
        setIsCalling(true);

        const peer = new Peer({
            initiator: true,
            trickle: false,
            stream: stream,
            config: getIceServers()
        });

        peer.on("signal", (data) => socket?.emit("call-user", { userToCall: userToCallId, signalData: data, from: myPodId, name: myDisplayName }));
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
        if (!stream) return alert("Stream initialization failed. Refresh the page.");
        setCallAccepted(true);
        setReceivingCall(false);

        const peer = new Peer({
            initiator: false,
            trickle: false,
            stream: stream,
            config: getIceServers()
        });

        peer.on("signal", (data) => socket?.emit("answer-call", { signal: data, to: callerId }));
        peer.on("stream", (currentStream) => { if (userVideoRef.current) userVideoRef.current.srcObject = currentStream; });
        peer.on("data", handlePeerData);
        peer.on("close", () => window.location.reload());

        peer.on("connect", () => {
            setTimeout(() => peer.send(JSON.stringify({ type: 'handshake', id: authData?._id, name: myDisplayName })), 800);
        });

        peer.signal(callerSignal);
        connectionRef.current = peer;
    };

    const leaveCall = () => {
        setCallEnded(true);
        setIsCalling(false);
        if (connectionRef.current && connectionRef.current.connected) {
            try { connectionRef.current.send(JSON.stringify({ type: 'end-call' })); }
            catch (err) { console.debug("Disconnect signal failed", err); }
        }
        if (connectionRef.current) connectionRef.current.destroy();
        socket?.emit("end-call", { to: callAccepted ? callerId : idToCall });
        window.location.reload();
    };

    // --- HARDWARE TOGGLES ---
    const toggleMic = () => {
        if (stream) {
            const audioTrack = stream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setMicEnabled(audioTrack.enabled);
            } else if (mediaError) {
                alert(mediaError); 
            }
        }
    };

    const toggleCamera = async () => {
        if (cameraEnabled) {
            const currentVideoTrack = stream.getVideoTracks()[0];
            currentVideoTrack.stop(); 

            const dummyVideoTrack = createEmptyVideoTrack();
            stream.removeTrack(currentVideoTrack);
            stream.addTrack(dummyVideoTrack);

            if (connectionRef.current && connectionRef.current.connected) {
                connectionRef.current.replaceTrack(currentVideoTrack, dummyVideoTrack, stream);
            }
            if (myVideoRef.current) myVideoRef.current.srcObject = stream;
            setCameraEnabled(false);
        } else {
            try {
                const newStream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        width: { ideal: 1280, max: 1920 },  
                        height: { ideal: 720, max: 1080 },
                        frameRate: { ideal: 30, max: 60 },
                        facingMode: "user"
                    }
                });
                const newVideoTrack = newStream.getVideoTracks()[0];
                const oldVideoTrack = stream.getVideoTracks()[0];

                stream.removeTrack(oldVideoTrack);
                stream.addTrack(newVideoTrack);

                if (connectionRef.current && connectionRef.current.connected) {
                    connectionRef.current.replaceTrack(oldVideoTrack, newVideoTrack, stream);
                }
                if (myVideoRef.current) myVideoRef.current.srcObject = stream;
                setCameraEnabled(true);
            } catch (err) {
                console.error("Camera error:", err);
                alert("Could not start camera. Please check your permissions.");
            }
        }
    };

    const toggleScreenShare = async () => {
        if (!isScreenSharing) {
            try {
                const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
                const screenTrack = screenStream.getVideoTracks()[0];
                const existingVideoTrack = stream?.getVideoTracks()[0];

                if (existingVideoTrack && connectionRef.current && connectionRef.current.connected) {
                    connectionRef.current.replaceTrack(existingVideoTrack, screenTrack, stream);
                }
                if (existingVideoTrack) {
                    stream.removeTrack(existingVideoTrack);
                    existingVideoTrack.stop(); 
                }
                stream.addTrack(screenTrack);

                if (myVideoRef.current) myVideoRef.current.srcObject = stream;
                screenTrackRef.current = screenTrack;
                setIsScreenSharing(true);
                setCameraEnabled(false);
                screenTrack.onended = () => stopScreenShare();
            } catch (error) { console.error("Screen share error:", error); }
        } else { stopScreenShare(); }
    };

    const stopScreenShare = () => {
        if (screenTrackRef.current) screenTrackRef.current.stop();
        setIsScreenSharing(false);

        const currentTrack = stream?.getVideoTracks()[0];
        const dummyVideoTrack = createEmptyVideoTrack();

        if (stream && currentTrack) {
            stream.removeTrack(currentTrack);
            stream.addTrack(dummyVideoTrack);
            if (connectionRef.current && connectionRef.current.connected) {
                connectionRef.current.replaceTrack(currentTrack, dummyVideoTrack, stream);
            }
        }
        if (myVideoRef.current) myVideoRef.current.srcObject = stream;
        setCameraEnabled(false);
    };

    // --- COMMUNICATION INTERFACES ---
    const sendChat = (newMessage) => {
        const msgObj = { text: newMessage, sender: 'me', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
        setMessages(prev => [...prev, msgObj]);
        if (connectionRef.current && connectionRef.current.connected) {
            connectionRef.current.send(JSON.stringify({ type: 'chat', message: { ...msgObj, sender: 'peer' } }));
        }
    };

    const updateCode = (newCode) => {
        setCodeText(newCode);
        if (connectionRef.current && connectionRef.current.connected) {
            try { connectionRef.current.send(JSON.stringify({ type: 'code', text: newCode })); }
            catch (err) { console.debug("Code sync delayed", err); }
        }
    };

    // --- TIMER LOGIC ---
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

    // --- RINGTONE LOGIC ---
    useEffect(() => {
        if (!ringtoneAudioRef.current) return;
        
        ringtoneAudioRef.current.loop = true; 

        if (receivingCall && !callAccepted) {
            ringtoneAudioRef.current.play().catch(err => console.warn("Autoplay blocked by browser:", err));
        } else {
            ringtoneAudioRef.current.pause();
            ringtoneAudioRef.current.currentTime = 0; 
        }

        return () => {
            ringtoneAudioRef.current.pause();
            ringtoneAudioRef.current.currentTime = 0;
        };
    }, [receivingCall, callAccepted]);

    // --- RETURN ALL LOGIC FOR THE UI ---
    return {
        mediaError, 
        myVideoRef, userVideoRef, chatScrollRef,
        myPodId, idToCall, setIdToCall, receivingCall, isCalling, callerName, callerRealDbId, callAccepted, callEnded,
        micEnabled, cameraEnabled, isScreenSharing, messages, codeText, interviewTime, isTimerRunning,
        callUser, answerCall, leaveCall, toggleMic, toggleCamera, toggleScreenShare, sendChat, updateCode, toggleTimer, resetTimer
    };
};