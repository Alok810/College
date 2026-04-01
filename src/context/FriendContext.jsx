import React, { createContext, useState, useContext, useEffect } from 'react';
import { io } from "socket.io-client"; // ✅ 1. Import socket.io
import { useAuth } from './AuthContext'; 
import { 
  toggleFriendRequest, 
  acceptFriendRequest, 
  rejectFriendRequest, 
  removeFriend,
  getMySocialData,
  fetchNotifications, // ✅ 2. Import your new API calls
  markNotificationsAsRead 
} from '../api';

const FriendContext = createContext();

// ✅ Setup the dynamic ENDPOINT for WebSockets
const ENDPOINT = import.meta.env.MODE === "production" 
  ? "https://rigya-backend.onrender.com" 
  : "http://localhost:4000";

export const FriendProvider = ({ children }) => {
  const { authData } = useAuth(); 

  const [requests, setRequests] = useState([]);
  const [friends, setFriends] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // ✅ 3. FETCH BOTH SOCIAL DATA AND DB NOTIFICATIONS
  useEffect(() => {
    const loadSocialData = async () => {
      if (!authData) return; 

      try {
        // FIXED: Added the missing comma in Promise.all
        const [socialData, notifData] = await Promise.all([
          getMySocialData(),
          fetchNotifications()
        ]);
        
        setFriends(socialData.friends);
        setRequests(socialData.friendRequests);
        
        const mappedSuggestions = socialData.suggestions.map(user => ({
          ...user,
          requestSent: socialData.sentRequests.some(sent => sent._id === user._id)
        }));
        setSuggestions(mappedSuggestions);

        // Turn real friend requests into notifications
        const requestNotifications = socialData.friendRequests.map(req => ({
          _id: `req_${req._id}`,
          user: {
            _id: req._id,
            name: req.name || req.full_name,
            profilePicture: req.profilePicture,
          },
          text: 'sent you a friend request.',
          createdAt: new Date().toISOString(),
          seen: false,
          type: 'friend_request'
        }));
        
        // Extract the real DB notifications (Likes)
        const dbNotifications = notifData?.notifications || [];

        // ✅ COMBINE both friend requests AND real notifications!
        setNotifications([...requestNotifications, ...dbNotifications]);

      } catch (error) {
        console.error("Failed to load real friend data:", error.message);
      }
    };

    loadSocialData();
  }, [authData]); 

  // ✅ 4. LISTEN FOR LIVE WEB SOCKET EVENTS
  useEffect(() => {
    if (!authData) return;

    // FIXED: Use the dynamic ENDPOINT instead of hardcoded localhost
    const socket = io(ENDPOINT);
    socket.emit("join", authData._id);

    // Listen for the "like" notification from the backend
    socket.on("new notification", (newNotification) => {
      console.log("🔔 New Notification Received!", newNotification);
      // Put the newest notification at the very top of the list
      setNotifications((prev) => [newNotification, ...prev]);
    });

    return () => socket.disconnect();
  }, [authData]);

  
  // === REAL BACKEND API HANDLERS ===
  const handleAcceptRequest = async (userId) => {
    try {
      await acceptFriendRequest(userId);
      const userToAccept = requests.find(req => req._id === userId);
      if (userToAccept) {
        setRequests(prev => prev.filter(req => req._id !== userId));
        setFriends(prev => [userToAccept, ...prev]);
        setNotifications(prev => prev.filter(n => n.user._id !== userId && n.type !== 'friend_request'));
      }
    } catch (error) {
      console.error("Failed to accept request:", error.message);
    }
  };

  const handleDeclineRequest = async (userId) => {
    try {
      await rejectFriendRequest(userId);
      setRequests(prev => prev.filter(req => req._id !== userId));
      setNotifications(prev => prev.filter(n => n.user._id !== userId && n.type !== 'friend_request'));
    } catch (error) {
      console.error("Failed to reject request:", error.message);
    }
  };

  const handleAddFriend = async (userId) => {
    try {
      await toggleFriendRequest(userId);
      setSuggestions(prev =>
        prev.map(user => user._id === userId ? { ...user, requestSent: true } : user)
      );
    } catch (error) {
      console.error("Failed to send request:", error.message);
    }
  };

  const handleCancelRequest = async (userId) => {
    try {
      await toggleFriendRequest(userId); 
      setSuggestions(prev =>
        prev.map(user => user._id === userId ? { ...user, requestSent: false } : user)
      );
    } catch (error) {
      console.error("Failed to cancel request:", error.message);
    }
  };

  const handleRemoveSuggestion = (userId) => {
    setSuggestions(prev => prev.filter(sug => sug._id !== userId));
  };

  const handleUnfriend = async (userId) => {
    try {
      await removeFriend(userId);
      setFriends(prev => prev.filter(friend => friend._id !== userId));
    } catch (error) {
      console.error("Failed to unfriend:", error.message);
    }
  };

  // ✅ 5. UPDATE DATABASE WHEN MARKING AS READ
  const handleMarkAllAsRead = async () => {
    try {
      // Tell the backend to update the database
      await markNotificationsAsRead();
      // Update the UI instantly
      setNotifications(prev => prev.map(n => ({ ...n, seen: true })));
    } catch (error) {
      console.error("Failed to mark notifications as read", error);
    }
  };

  const value = {
    requests,
    friends,
    suggestions,
    notifications,
    handleAcceptRequest,
    handleDeclineRequest,
    handleAddFriend,
    handleCancelRequest,
    handleRemoveSuggestion,
    handleUnfriend,
    handleMarkAllAsRead
  };

  return (
    <FriendContext.Provider value={value}>
      {children}
    </FriendContext.Provider>
  );
};

export const useFriends = () => {
  return useContext(FriendContext);
};