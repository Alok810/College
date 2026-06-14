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

    const [myTopics, setMyTopics] = useState([]); 
    const [partnerTopics, setPartnerTopics] = useState([]);
    const [activeTopic, setActiveTopic] = useState("Waiting for a match to begin discussion...");
    const [isGeneratingTheme, setIsGeneratingTheme] = useState(false);

    const myVideoRef = useRef(null);
    const partnerVideoRef = useRef(null);
    const chatScrollRef = useRef(null);
    const connectionRef = useRef(null);
    const streamRef = useRef(null);
    const isCallerRef = useRef(false);
    const lastGeneratedRef = useRef(null); 

    const myTopicsRef = useRef(myTopics);
    useEffect(() => {
        myTopicsRef.current = myTopics;
    }, [myTopics]);

    // 🟢 SECRET 1: Copied exactly from Focus Pod
    const getIceServers = () => ({
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:global.stun.twilio.com:3478' }
        ]
    });

    useEffect(() => {
        const userId = userData?.id || userData?._id;
        if (!userId || userId === "unknown") return;

        const newSocket = io(AISHE_BACKEND_URL, {
            auth: { userId: userId },
            transports: ["polling", "websocket"], 
            timeout: 60000, 
            reconnection: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 3000
        });
        
        newSocket.on("connect_error", (err) => console.error("🔌 TalkHive Socket Error:", err.message));

        setSocket(newSocket);
        return () => newSocket.disconnect();
    }, [userData?.id, userData?._id]);

    const toggleTopic = (topic) => {
        setMyTopics(prev => {
            if (prev.includes(topic)) return prev.filter(t => t !== topic);
            if (prev.length < 3) return [...prev, topic];
            return prev;
        });
    };

    const startSearch = async () => {
        if (myTopics.length === 0) return; 

        setStatus("searching");
        setPartnerInfo(null);
        setPartnerTopics([]);
        lastGeneratedRef.current = null;
        setMessages([]);
        setRoomCode(null);
        setIsPeerConnected(false);
        setActiveTopic("Waiting for a match to begin discussion...");

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            streamRef.current = stream;
            if (myVideoRef.current) myVideoRef.current.srcObject = stream;
        } catch (error) {
            console.error("Camera access denied:", error);
            if (error.name === "NotReadableError") {
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
        if (myTopics.length === 0) {
            stopSearch();
            return;
        }

        const targetRoom = roomCode;
        setStatus("searching");
        setPartnerInfo(null);
        setPartnerTopics([]);
        lastGeneratedRef.current = null;
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
        setPartnerTopics([]);
        lastGeneratedRef.current = null;
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
        if (status === "connected" && isPeerConnected && connectionRef.current && connectionRef.current.connected) {
            try {
                connectionRef.current.send(JSON.stringify({ type: "topics_sync", topics: myTopics }));
            } catch {
                console.warn("Could not sync topics mid-call");
            }
        }
    }, [myTopics, status, isPeerConnected]);

    useEffect(() => {
        if (status === "connected" && isPeerConnected && isCallerRef.current) {
            const matches = myTopics.filter(t => partnerTopics.includes(t));
            
            if (matches.length > 0) {
                const topMatch = matches[0];
                if (topMatch !== lastGeneratedRef.current) {
                    lastGeneratedRef.current = topMatch;
                    generateNewTopic(topMatch);
                }
            } else if (!lastGeneratedRef.current && partnerTopics.length > 0) {
                const fallback = myTopics[Math.floor(Math.random() * myTopics.length)];
                lastGeneratedRef.current = fallback;
                generateNewTopic(fallback);
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [myTopics, partnerTopics, status, isPeerConnected]);

    useEffect(() => {
        if (!socket) return;

        const handleMatchFound = ({ roomCode, partnerInfo, isCaller }) => {
            isCallerRef.current = isCaller;
            setPartnerInfo(partnerInfo);
            setRoomCode(roomCode);
            setStatus("connected");
            
            socket.emit("join-pod", roomCode);
            
            if (isCaller) {
                setTimeout(() => initiateWebRTC(roomCode), 1500);
            }
        };

        const handleCallIncoming = (data) => {
            if (isCallerRef.current) return; 
            // 🟢 Simplified for trickle: false
            answerWebRTC(data.signal, data.from);
        };

        const handleCallAccepted = (signalData) => {
            if (!isCallerRef.current) return; 
            // 🟢 Simplified for trickle: false
            if (connectionRef.current) {
                try {
                    connectionRef.current.signal(signalData);
                } catch {
                    console.warn("Accept ignored");
                }
            }
        };

        const handleCallEnded = () => {
            setMessages(prev => [...prev, { text: "Stranger disconnected. Finding a new match...", system: true }]);
            setIsPeerConnected(false);
            setPartnerTopics([]);
            lastGeneratedRef.current = null;

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
            }, 100);
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

    const handlePeerData = (data) => {
        try {
            const parsed = JSON.parse(data.toString());

            if (parsed.type === "chat") {
                setMessages(prev => [...prev, { text: parsed.text, sender: "Stranger" }]);
            }
            else if (parsed.type === "topic") {
                setActiveTopic(parsed.topic);
                lastGeneratedRef.current = parsed.category; 
                setMessages(prev => [...prev, {
                    system: true,
                    text: `Discussion matched on: ${parsed.category}`
                }]);
            }
            else if (parsed.type === "topics_sync") {
                setPartnerTopics(parsed.topics);
            }
        } catch (error) {
            console.error("Failed to parse peer data", error);
        }
    };

    const bindPeerEvents = (peer, room) => {
        peer.on("stream", (remoteStream) => {
            if (partnerVideoRef.current) partnerVideoRef.current.srcObject = remoteStream;
            setIsPeerConnected(true); 
        });

        peer.on("connect", () => {
            // 🟢 SECRET 2: Copied exactly from Focus Pod (800ms delay)
            setTimeout(() => {
                try {
                    peer.send(JSON.stringify({ type: "topics_sync", topics: myTopicsRef.current }));
                } catch (e) {
                    console.warn("Initial topic sync delayed");
                }
            }, 800);
        });

        peer.on("data", handlePeerData);

        peer.on("error", (error) => console.error("WebRTC Error:", error));
        peer.on("close", () => {
            setIsPeerConnected(false);
            if (status === "connected") {
                socket.emit("end-call", { to: room });
                socket.emit("find-match", userData);
            }
        });
    };

    // 🟢 SECRET 3: Copied exactly from Focus Pod (trickle: false)
    const initiateWebRTC = (room) => {
        if (!streamRef.current) return;
        const peer = new Peer({ initiator: true, trickle: false, stream: streamRef.current, config: getIceServers() });
        peer.on("signal", (data) => socket.emit("call-user", { userToCall: room, signalData: data, from: room, name: userData.name }));
        bindPeerEvents(peer, room);
        connectionRef.current = peer;
    };

    // 🟢 SECRET 3: Copied exactly from Focus Pod (trickle: false)
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

    const generateNewTopic = async (category) => {
        if (status === "idle") return;

        setIsGeneratingTheme(true);
        setActiveTopic("AI is analyzing the topic...");

        try {
            const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
            if (!apiKey) throw new Error("API Key is missing from frontend .env");

            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    generationConfig: { responseMimeType: "application/json" },
                    contents: [{
                        parts: [{ 
                            text: `Generate a comprehensive discussion guide for two college students about: ${category}.
                            Return ONLY a valid JSON object with exactly this structure:
                            {
                              "question": "A thought-provoking icebreaker question about the topic (maximum one single sentence)",
                              "sections": [
                                { "title": "Introduction to Context", "points": ["Point 1", "Point 2"] },
                                { "title": "Presentation of Main Focus", "points": ["Point 1"] },
                                { "title": "Overview of Related Aspects", "points": ["Point 1", "Point 2", "Point 3"] },
                                { "title": "Analysis & Relevance", "points": ["Point 1", "Point 2"] },
                                { "title": "Conclusion & Action", "points": ["Point 1", "Point 2"] }
                              ]
                            }` 
                        }]
                    }]
                })
            });

            if (!response.ok) throw new Error(`Google API returned status ${response.status}`);

            const data = await response.json();
            const aiText = data.candidates[0].content.parts[0].text.trim();
            
            let newTheme;
            try {
                newTheme = JSON.parse(aiText);
            } catch {
                console.error("Failed to parse JSON from Gemini:", aiText);
                throw new Error("Invalid JSON structure returned.");
            }

            setActiveTopic(newTheme);
            setIsGeneratingTheme(false);

            if (status === "connected") {
                setMessages(prev => [...prev, { system: true, text: `Discussion changed to: ${category}` }]);
            }

            if (connectionRef.current) {
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
            setActiveTopic({
                question: "AI connection failed.",
                sections: [{ title: "System Error", points: ["Please try reconnecting."] }]
            });
            setIsGeneratingTheme(false);
        }
    };

    useEffect(() => {
        if (chatScrollRef.current) chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }, [messages]);

    return {
        status, partnerInfo, messages, myVideoRef, partnerVideoRef, chatScrollRef, isPeerConnected,
        activeTopic, myTopics, partnerTopics, isGeneratingTheme, 
        startSearch, stopSearch, skipMatch, sendMessage, generateNewTopic, toggleTopic
    };
};