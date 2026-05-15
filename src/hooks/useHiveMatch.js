import { useState, useEffect, useRef } from "react";
import Peer from "simple-peer";
import { io } from "socket.io-client";
import { AISHE_BACKEND_URL } from "../api"

export const useHiveMatch = (userData) => {
    const [socket, setSocket] = useState(null);
    const [status, setStatus] = useState("idle");
    const [partnerInfo, setPartnerInfo] = useState(null);
    const [messages, setMessages] = useState([]);
    const [roomCode, setRoomCode] = useState(null);
    const [isPeerConnected, setIsPeerConnected] = useState(false);

    // 🟢 Synchronized Topic States
    const [selectedCategory, setSelectedCategory] = useState("Web Development");
    const [activeTopic, setActiveTopic] = useState("Waiting for a match to begin discussion...");
    const [isGeneratingTheme, setIsGeneratingTheme] = useState(false);

    const myVideoRef = useRef(null);
    const partnerVideoRef = useRef(null);
    const chatScrollRef = useRef(null);
    const connectionRef = useRef(null);
    const streamRef = useRef(null);

    const getIceServers = () => ({
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' }
        ]
    });

    useEffect(() => {
        const userId = userData?.id || userData?._id;
        if (!userId || userId === "unknown") return;

        const newSocket = io(AISHE_BACKEND_URL, { auth: { userId: userId } });
        newSocket.on("connect_error", (err) => console.error("🔌 TalkHive Socket Error:", err.message));

        setSocket(newSocket);
        return () => newSocket.disconnect();
    }, [userData?.id, userData?._id]);

    const startSearch = async () => {
        setStatus("searching");
        setPartnerInfo(null);
        setMessages([]);
        setRoomCode(null);
        setIsPeerConnected(false);
        setActiveTopic("Waiting for a match to begin discussion...");

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            streamRef.current = stream;
            if (myVideoRef.current) myVideoRef.current.srcObject = stream;
        } catch (err) {
            console.error("Camera access denied:", err);
            if (err.name === "NotReadableError") {
                alert("Camera is already in use by another tab or application! Please close it and try again.");
            }
        }

        if (socket) socket.emit("find-match", userData);
    };

    const stopSearch = () => {
        setStatus("idle");
        if (socket) socket.emit("cancel-match");
        cleanupMedia();
    };

    const skipMatch = () => {
        const targetRoom = roomCode;
        setStatus("searching");
        setPartnerInfo(null);
        setRoomCode(null);
        setIsPeerConnected(false);
        setActiveTopic("Waiting for a match to begin discussion...");
        setMessages([]);

        if (partnerVideoRef.current) partnerVideoRef.current.srcObject = null;
        if (connectionRef.current) {
            connectionRef.current.destroy();
            connectionRef.current = null;
        }

        if (socket) {
            if (targetRoom) socket.emit("end-call", { to: targetRoom });
            socket.emit("find-match", userData);
        }
    };

    const cleanupMedia = () => {
        setIsPeerConnected(false);
        if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
        if (myVideoRef.current) myVideoRef.current.srcObject = null;
        if (partnerVideoRef.current) partnerVideoRef.current.srcObject = null;
        if (connectionRef.current) {
            connectionRef.current.destroy();
            connectionRef.current = null;
        }
        streamRef.current = null;
    };

    useEffect(() => {
        if (!socket) return;

        const handleMatchFound = ({ roomCode, partnerInfo, isCaller }) => {
            setPartnerInfo(partnerInfo);
            setRoomCode(roomCode);
            setStatus("connected");
            socket.emit("join-pod", roomCode);
            if (isCaller) setTimeout(() => initiateWebRTC(roomCode), 1000);
        };

        const handleCallIncoming = (data) => answerWebRTC(data.signal, data.from);

        const handleCallAccepted = (signalData) => {
            if (connectionRef.current) connectionRef.current.signal(signalData);
        };

        const handleCallEnded = () => {
            setMessages(prev => [...prev, { text: "Stranger disconnected. Finding a new match...", system: true }]);
            setIsPeerConnected(false);

            if (partnerVideoRef.current) partnerVideoRef.current.srcObject = null;
            if (connectionRef.current) {
                connectionRef.current.destroy();
                connectionRef.current = null;
            }

            setTimeout(() => {
                setStatus("searching");
                setPartnerInfo(null);
                setRoomCode(null);
                socket.emit("find-match", userData);
            }, 1500);
        };

        socket.on("match-found", handleMatchFound);
        socket.on("call-incoming", handleCallIncoming);
        socket.on("call-accepted", handleCallAccepted);
        socket.on("call-ended", handleCallEnded);

        return () => {
            socket.off("match-found", handleMatchFound);
            socket.off("call-incoming", handleCallIncoming);
            socket.off("call-accepted", handleCallAccepted);
            socket.off("call-ended", handleCallEnded);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [socket, userData]);

    // 🟢 P2P DATA HANDLER (Syncs Chat & Topics)
    const handlePeerData = (data) => {
        try {
            const parsed = JSON.parse(data.toString());

            if (parsed.type === "chat") {
                setMessages(prev => [...prev, { text: parsed.text, sender: "Stranger" }]);
            }
            else if (parsed.type === "topic") {
                // Instantly update UI when the stranger changes the topic!
                setActiveTopic(parsed.topic);
                setSelectedCategory(parsed.category);
                setMessages(prev => [...prev, {
                    system: true,
                    text: `Stranger set the topic to: ${parsed.category}`
                }]);
            }
        } catch (err) {
            console.error("Failed to parse peer data", err);
        }
    };

    const bindPeerEvents = (peer, room) => {
        peer.on("stream", (remoteStream) => {
            if (partnerVideoRef.current) partnerVideoRef.current.srcObject = remoteStream;
            setIsPeerConnected(true);

            if (peer.initiator) {
                generateNewTopic("Web Development");
            }
        });

        peer.on("data", handlePeerData);

        peer.on("error", (err) => console.error("WebRTC Error:", err));
        peer.on("close", () => {
            setIsPeerConnected(false);
            if (status === "connected") {
                socket.emit("end-call", { to: room });
                socket.emit("find-match", userData);
            }
        });
    };

    const initiateWebRTC = (room) => {
        if (!streamRef.current) return;
        const peer = new Peer({ initiator: true, trickle: false, stream: streamRef.current, config: getIceServers() });
        peer.on("signal", (data) => socket.emit("call-user", { userToCall: room, signalData: data, from: room, name: userData.name }));
        bindPeerEvents(peer, room);
        connectionRef.current = peer;
    };

    const answerWebRTC = (incomingSignal, room) => {
        if (!streamRef.current) return;
        const peer = new Peer({ initiator: false, trickle: false, stream: streamRef.current, config: getIceServers() });
        peer.on("signal", (data) => socket.emit("answer-call", { signal: data, to: room }));
        bindPeerEvents(peer, room);
        peer.signal(incomingSignal);
        connectionRef.current = peer;
    };

    const sendMessage = (text) => {
        if (!text.trim() || !connectionRef.current) return;
        setMessages(prev => [...prev, { text, sender: "You" }]);

        connectionRef.current.send(JSON.stringify({ type: "chat", text }));
    };

    // ==========================================
    // 🤖 DIRECT GEMINI 2.5 FLASH FRONTEND FETCH
    // ==========================================
    const generateNewTopic = async (category) => {
        if (status === "idle") return;

        setIsGeneratingTheme(true);
        setSelectedCategory(category);

        try {
            const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
            if (!apiKey) throw new Error("API Key is missing from frontend .env");

            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: `Generate a short, engaging discussion question about ${category} for a video chat icebreaker. Just give the question, no introductory text.` }]
                    }]
                })
            });

            if (!response.ok) throw new Error(`Google API returned status ${response.status}`);

            const data = await response.json();
            const newTheme = data.candidates[0].content.parts[0].text.trim();

            setActiveTopic(newTheme);
            setIsGeneratingTheme(false);

            if (status === "connected") {
                setMessages(prev => [...prev, { system: true, text: `You set the topic to: ${category}` }]);
            }

            // 🟢 Send the exact AI response to the stranger's screen via WebRTC Data Channel!
            // New Code (The Safety Delay)
            if (connectionRef.current) {
                // Wait 500ms to ensure the Data Channel is fully 'open' before sending
                setTimeout(() => {
                    try {
                        connectionRef.current.send(JSON.stringify({ type: "topic", category, topic: newTheme }));
                    } catch {
                        console.warn("WebRTC Data Channel not ready yet. Topic not synced.");
                    }
                }, 500);
            }

        } catch (error) {
            console.error("AI Generation Failed:", error);
            setActiveTopic("AI connection failed. Please try a different topic.");
            setIsGeneratingTheme(false);
        }
    };

    useEffect(() => {
        if (chatScrollRef.current) chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }, [messages]);

    return {
        status, partnerInfo, messages, myVideoRef, partnerVideoRef, chatScrollRef, isPeerConnected,
        activeTopic, selectedCategory, isGeneratingTheme,
        startSearch, stopSearch, skipMatch, sendMessage, generateNewTopic
    };
};