import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { io } from "socket.io-client"; 
import { useAuth } from './AuthContext'; 
import { 
  toggleFriendRequest, 
  acceptFriendRequest, 
  rejectFriendRequest, 
  removeFriend,
  getMySocialData,
  fetchNotifications, 
  markNotificationsAsRead 
} from '../api';

const FriendContext = createContext();

const ENDPOINT = import.meta.env.MODE === "production" 
  ? "https://rigya-backend.onrender.com" 
  : "http://localhost:4000";

export const FriendProvider = ({ children }) => {
  const { authData } = useAuth(); 

  const [requests, setRequests] = useState([]);
  const [friends, setFriends] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  
  // 🟢 LAZY FETCHING STATES
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Used to show skeletons

  // 🟢 THE LAZY FETCH FUNCTION
  // Wrapped in useCallback so it doesn't trigger unnecessary re-renders
  const fetchSocialDataOnDemand = useCallback(async () => {
      // 1. Security check
      if (!authData || !authData._id) return; 
      
      // 2. Cache check: If we already have the data, instantly return. No delay!
      if (hasLoaded || isLoading) return; 

      try {
        setIsLoading(true); // Tell the UI to show skeletons

        const [socialData, notifData] = await Promise.all([
          getMySocialData().catch(err => { console.error("Backend failed to load friends:", err.message); return null; }),
          fetchNotifications().catch(err => { console.error("Backend failed to load notifications:", err.message); return null; })
        ]);
        
        const safeFriends = socialData?.friends || [];
        const safeRequests = socialData?.friendRequests || [];
        const safeSuggestions = socialData?.suggestions || [];
        const safeSentRequests = socialData?.sentRequests || []; 

        setFriends(safeFriends);
        setRequests(safeRequests);
        
        const mappedSuggestions = safeSuggestions.map(user => ({ ...user, requestSent: false }));
        const mappedSentRequests = safeSentRequests.map(user => ({ ...user, requestSent: true }));
        
        setSuggestions([...mappedSuggestions, ...mappedSentRequests]);

        const requestNotifications = safeRequests.map(req => ({
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
        
        const dbNotifications = notifData?.notifications || [];
        setNotifications([...requestNotifications, ...dbNotifications]);

        // 3. Mark as loaded so we never fetch again this session!
        setHasLoaded(true);

      } catch (error) {
        console.error("Failed to process friend data:", error.message);
      } finally {
        setIsLoading(false); // Turn off skeletons
      }
  }, [authData, hasLoaded, isLoading]);

  // We still want WebSockets to connect automatically so real-time events aren't missed
  useEffect(() => {
    if (!authData || !authData._id) return;

    const socket = io(ENDPOINT, {
      withCredentials: true 
    });
    socket.emit("join", authData._id);

    socket.on("new notification", (newNotification) => {
      console.log("🔔 New Notification Received!", newNotification);
      setNotifications((prev) => [newNotification, ...prev]);
      
      if (newNotification.type === 'friend_request') {
          setRequests((prev) => [newNotification.user, ...prev]);
      }
    });

    return () => socket.disconnect();
  }, [authData]);

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
      setSuggestions(prev => {
          const exists = prev.find(u => u._id === userId);
          if (exists) {
              return prev.map(user => user._id === userId ? { ...user, requestSent: true } : user);
          } else {
              return [...prev, { _id: userId, requestSent: true }];
          }
      });
    } catch (error) {
      console.error("Failed to send request:", error.message);
    }
  };

  const handleCancelRequest = async (userId) => {
    try {
      await toggleFriendRequest(userId); 
      setSuggestions(prev => prev.map(user => user._id === userId ? { ...user, requestSent: false } : user));
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

  const handleMarkAllAsRead = async () => {
    try {
      await markNotificationsAsRead();
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
    
    // 🟢 EXPOSE THE LAZY FETCHING STATES
    fetchSocialDataOnDemand,
    isLoadingSocialData: isLoading,
    hasLoadedSocialData: hasLoaded,

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