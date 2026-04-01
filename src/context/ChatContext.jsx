import React, { createContext, useContext, useState, useEffect } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";
import { fetchChats, accessChat, fetchMessages, sendMessage as apiSendMessage, markMessagesAsRead, deleteChatMessage } from "../api";

const ChatContext = createContext();
// const ENDPOINT = "http://localhost:4000"; 

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
  
  // ✅ NEW: We need to put the socket into React State so it can be shared with ChatBox
  const [socketInstance, setSocketInstance] = useState(null);

  useEffect(() => {
    if (authData) {
      socket = io(ENDPOINT);
      socket.emit("join", authData._id); 
      setSocketInstance(socket); // ✅ Save the connection into the state
      return () => socket.disconnect();
    }
  }, [authData]);

  const loadSidebarChats = async () => {
    if (!authData) return;
    const data = await fetchChats();
    if(data) setSidebarChats(data.chats);
  };

  useEffect(() => { loadSidebarChats(); }, [authData]);

  useEffect(() => {
    if (!socket) return;

    const messageHandler = (newMessageReceived) => {
      if (!activeChat || activeChat._id !== newMessageReceived.chat._id) {
        loadSidebarChats();
      } else {
        setMessages((prev) => [...prev, newMessageReceived]);
        markMessagesAsRead(activeChat._id);
        socket.emit("mark as read", { 
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
      loadSidebarChats();
    };

    const onlineUsersHandler = (users) => setOnlineUsers(users);

    socket.on("message received", messageHandler);
    socket.on("typing", typingHandler);
    socket.on("stop typing", stopTypingHandler);
    socket.on("messages read", readHandler);
    socket.on("get-online-users", onlineUsersHandler); 

    return () => {
      socket.off("message received", messageHandler);
      socket.off("typing", typingHandler);
      socket.off("stop typing", stopTypingHandler);
      socket.off("messages read", readHandler);
      socket.off("get-online-users", onlineUsersHandler); 
    };
  }, [activeChat]);

  const openChat = async (targetUserId) => {
    const data = await accessChat(targetUserId);
    setActiveChat(data.chat);
    const msgData = await fetchMessages(data.chat._id);
    setMessages(msgData.messages);

    await markMessagesAsRead(data.chat._id);
    socket.emit("mark as read", { receiverId: targetUserId, chatId: data.chat._id });
    loadSidebarChats();
  };

  const sendNewMessage = async (formData) => {
    if (!activeChat) return;
    
    const data = await apiSendMessage(formData);
    
    socket.emit("new message", data.message);
    setMessages((prev) => [...prev, data.message]);
    loadSidebarChats(); 
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

  const emitTyping = (receiverId, chatId) => socket.emit("typing", { receiverId, chatId });
  const emitStopTyping = (receiverId, chatId) => socket.emit("stop typing", { receiverId, chatId });

  return (
    <ChatContext.Provider value={{
      sidebarChats, activeChat, setActiveChat, messages, openChat, sendNewMessage, loadSidebarChats,
      typingChats, emitTyping, emitStopTyping, handleDeleteMessage, onlineUsers,
      socket: socketInstance // ✅ FIXED: Now we are actively sharing the socket connection!
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export default ChatContext;
export const useChat = () => useContext(ChatContext);