import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";
// ✨ IMPORT BACKEND_URL DIRECTLY FROM API
import { 
  fetchChats, accessChat, fetchMessages, sendMessage as apiSendMessage, 
  markMessagesAsRead, deleteChatMessage, BACKEND_URL 
} from "../api";

const ChatContext = createContext();

// 🛠️ PRO-TIP 3: Removed global 'let socket;' to prevent data leaks in SSR apps

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

    // ✨ USE THE SINGLE SOURCE OF TRUTH URL
    const newSocket = io(BACKEND_URL, {
        withCredentials: true
    });
    
    // 🛠️ PRO-TIP 1: Catch connection errors (CORS, network drops)
    newSocket.on("connect_error", (err) => {
        console.error(`🔌 Socket connection error: ${err.message}`);
    });

    newSocket.emit("join", authData._id); 
    setSocketInstance(newSocket); 
    
    return () => newSocket.disconnect();
  }, [authData]);

  // 🟢 LAZY FETCH FUNCTION
  const loadSidebarChats = useCallback(async (force = false) => {
    if (!authData || !authData._id) return;
    
    if (!force && (hasLoadedChats || isLoadingChats)) return;

    try {
      if (!force) setIsLoadingChats(true); 
      
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

  useEffect(() => {
    if (!socketInstance) return;

    const messageHandler = (newMessageReceived) => {
      if (!activeChat || activeChat._id !== newMessageReceived.chat._id) {
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

  // 🛠️ PRO-TIP 2: Wrapped in try/catch to prevent crashes on network blips
  const openChat = async (targetUserId) => {
    try {
      const data = await accessChat(targetUserId);
      setActiveChat(data.chat);
      const msgData = await fetchMessages(data.chat._id);
      setMessages(msgData.messages);

      await markMessagesAsRead(data.chat._id);
      if (socketInstance) {
        socketInstance.emit("mark as read", { receiverId: targetUserId, chatId: data.chat._id });
      }
      loadSidebarChats(true); 
    } catch (error) {
      console.error("Failed to open chat:", error);
    }
  };

  const sendNewMessage = async (formData) => {
    if (!activeChat) return;
    
    const data = await apiSendMessage(formData);
    
    if (socketInstance) {
      socketInstance.emit("new message", data.message);
    }
    setMessages((prev) => [...prev, data.message]);
    loadSidebarChats(true); 
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
      loadSidebarChats, isLoadingChats, hasLoadedChats,
      typingChats, emitTyping, emitStopTyping, handleDeleteMessage, onlineUsers,
      socket: socketInstance 
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export default ChatContext;
export const useChat = () => useContext(ChatContext);