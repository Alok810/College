import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";
import { fetchChats, accessChat, fetchMessages, sendMessage as apiSendMessage, markMessagesAsRead, deleteChatMessage } from "../api";

const ChatContext = createContext();

const ENDPOINT = import.meta.env.MODE === "production" 
  ? "https://rigya-backend.onrender.com" 
  : "http://localhost:4000";

let socket;

export const ChatProvider = ({ children }) => {
  const { authData } = useAuth();
  const [sidebarChats, setSidebarChats] = useState([]); 
  const [activeChat, setActiveChat] = useState(null); 
  const [messages, setMessages] = useState([]); 
  const [typingChats, setTypingChats] = useState([]); 
  const [onlineUsers, setOnlineUsers] = useState([]); 
  
  const [socketInstance, setSocketInstance] = useState(null);

  // 🟢 LAZY FETCHING STATES
  const [hasLoadedChats, setHasLoadedChats] = useState(false);
  const [isLoadingChats, setIsLoadingChats] = useState(false);

  useEffect(() => {
    // 🟢 BULLETPROOF FIX: Do not connect the socket unless user is fully validated
    if (!authData || !authData._id) return;

    socket = io(ENDPOINT, {
        withCredentials: true
    });
    
    socket.emit("join", authData._id); 
    setSocketInstance(socket); 
    
    return () => socket.disconnect();
  }, [authData]);

  // 🟢 LAZY FETCH FUNCTION
  // We use `force = false` by default so the UI can call it lazily.
  // We pass `force = true` inside socket events so background updates still work!
  const loadSidebarChats = useCallback(async (force = false) => {
    if (!authData || !authData._id) return;
    
    // If it's a lazy UI request, check the cache. If it's a socket forcing an update, skip the cache check.
    if (!force && (hasLoadedChats || isLoadingChats)) return;

    try {
      if (!force) setIsLoadingChats(true); // Only show skeletons for initial load
      
      const data = await fetchChats();
      if (data) {
        setSidebarChats(data.chats);
      }
      
      setHasLoadedChats(true);
    } catch (error) {
      console.error("Backend failed to load chats:", error);
    } finally {
      if (!force) setIsLoadingChats(false);
    }
  }, [authData, hasLoadedChats, isLoadingChats]);

  // ❌ REMOVED the eager useEffect that was causing the 401 Unauthorized errors!
  // useEffect(() => { loadSidebarChats(); }, [authData]);

  useEffect(() => {
    if (!socketInstance) return;

    const messageHandler = (newMessageReceived) => {
      if (!activeChat || activeChat._id !== newMessageReceived.chat._id) {
        // 🟢 Force background refresh of sidebar to show new unread message
        loadSidebarChats(true);
      } else {
        setMessages((prev) => [...prev, newMessageReceived]);
        markMessagesAsRead(activeChat._id);
        socketInstance.emit("mark as read", { 
          receiverId: newMessageReceived.sender._id, 
          chatId: activeChat._id 
        });
      }
    };

    const typingHandler = (chatId) => setTypingChats((prev) => [...prev, chatId]);
    const stopTypingHandler = (chatId) => setTypingChats((prev) => prev.filter(id => id !== chatId));
    const readHandler = (chatId) => {
      if (activeChat && activeChat._id === chatId) {
        setMessages((prev) => prev.map(m => ({ ...m, seen: true })));
      }
      // 🟢 Force background refresh
      loadSidebarChats(true);
    };

    const onlineUsersHandler = (users) => setOnlineUsers(users);

    socketInstance.on("message received", messageHandler);
    socketInstance.on("typing", typingHandler);
    socketInstance.on("stop typing", stopTypingHandler);
    socketInstance.on("messages read", readHandler);
    socketInstance.on("get-online-users", onlineUsersHandler); 

    return () => {
      socketInstance.off("message received", messageHandler);
      socketInstance.off("typing", typingHandler);
      socketInstance.off("stop typing", stopTypingHandler);
      socketInstance.off("messages read", readHandler);
      socketInstance.off("get-online-users", onlineUsersHandler); 
    };
  }, [activeChat, socketInstance, loadSidebarChats]);

  const openChat = async (targetUserId) => {
    const data = await accessChat(targetUserId);
    setActiveChat(data.chat);
    const msgData = await fetchMessages(data.chat._id);
    setMessages(msgData.messages);

    await markMessagesAsRead(data.chat._id);
    if (socketInstance) {
      socketInstance.emit("mark as read", { receiverId: targetUserId, chatId: data.chat._id });
    }
    loadSidebarChats(true); // Force refresh
  };

  const sendNewMessage = async (formData) => {
    if (!activeChat) return;
    
    const data = await apiSendMessage(formData);
    
    if (socketInstance) {
      socketInstance.emit("new message", data.message);
    }
    setMessages((prev) => [...prev, data.message]);
    loadSidebarChats(true); // Force refresh
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
      await deleteChatMessage(messageId);
    } catch (error) {
      console.error("Failed to delete message", error);
      if (activeChat) openChat(activeChat.participants.find(p => p._id !== authData._id)._id);
    }
  };

  const emitTyping = (receiverId, chatId) => socketInstance?.emit("typing", { receiverId, chatId });
  const emitStopTyping = (receiverId, chatId) => socketInstance?.emit("stop typing", { receiverId, chatId });

  return (
    <ChatContext.Provider value={{
      sidebarChats, activeChat, setActiveChat, messages, openChat, sendNewMessage, 
      
      // 🟢 EXPORT LAZY FETCH CONTROLS
      loadSidebarChats, // You will call this function inside your UI components!
      isLoadingChats,
      hasLoadedChats,
      
      typingChats, emitTyping, emitStopTyping, handleDeleteMessage, onlineUsers,
      socket: socketInstance 
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export default ChatContext;
export const useChat = () => useContext(ChatContext);