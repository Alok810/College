import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import { io } from "socket.io-client"; 
import { useAuth } from './AuthContext'; 

// 🟢 FIX: Import the MAIN BACKEND_URL instead of AISHE
import { 
  BACKEND_URL, 
  toggleFriendRequest, 
  acceptFriendRequest, 
  rejectFriendRequest, 
  removeFriend,
  getMySocialData,
  fetchNotifications, 
  markNotificationsAsRead 
} from '../api';

const FriendContext = createContext();

export const FriendProvider = ({ children }) => {
  const { authData } = useAuth(); 

  const [requests, setRequests] = useState([]);
  const [friends, setFriends] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false); 

  const fetchTracker = useRef({ isFetching: false, isLoaded: false });

  const fetchSocialDataOnDemand = useCallback(async () => {
      if (!authData || !authData._id) return; 
      
      if (fetchTracker.current.isLoaded || fetchTracker.current.isFetching) return; 

      try {
        fetchTracker.current.isFetching = true;
        setIsLoading(true); 

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
          _id: `req_${req?._id || Date.now()}`,
          user: {
            _id: req?._id,
            name: req?.name || req?.full_name,
            profilePicture: req?.profilePicture,
          },
          text: 'sent you a friend request.',
          createdAt: new Date().toISOString(),
          seen: false,
          type: 'friend_request'
        }));
        
        const dbNotifications = notifData?.notifications || [];
        setNotifications([...requestNotifications, ...dbNotifications]);

        fetchTracker.current.isLoaded = true;
        setHasLoaded(true);

      } catch (error) {
        console.error("Failed to process friend data:", error.message);
      } finally {
        fetchTracker.current.isFetching = false;
        setIsLoading(false); 
      }
      
  }, [authData?._id]);

  useEffect(() => {
    if (!authData || !authData._id) return;

    // 🟢 FIX: Connect to the MAIN BACKEND_URL where your sockets actually live!
    const socket = io(BACKEND_URL, {
      withCredentials: true 
    });
    
    socket.emit("join", authData._id);

    socket.on("new notification", (newNotification) => {
      console.log("🔔 New Notification Received!", newNotification);
      setNotifications((prev) => [newNotification, ...prev]);
      
      if (newNotification.type === 'friend_request' && newNotification.user) {
          setRequests((prev) => [newNotification.user, ...prev]);
      }
    });

    return () => socket.disconnect();
  }, [authData]);

  const handleAcceptRequest = async (userId) => {
    try {
      await acceptFriendRequest(userId);
      
      const userToAccept = requests.find(req => req && req._id === userId);
      
      if (userToAccept) {
        setRequests(prev => prev.filter(req => req && req._id !== userId));
        setFriends(prev => [userToAccept, ...prev]);
        
        setNotifications(prev => prev.filter(n => {
          if (!n || !n.user) return true;
          return !(n.user._id === userId && n.type === 'friend_request');
        }));
      }
    } catch (error) {
      console.error("Failed to accept request:", error.message);
    }
  };

  const handleDeclineRequest = async (userId) => {
    try {
      await rejectFriendRequest(userId);
      
      setRequests(prev => prev.filter(req => req && req._id !== userId));
      
      setNotifications(prev => prev.filter(n => {
        if (!n || !n.user) return true;
        return !(n.user._id === userId && n.type === 'friend_request');
      }));
    } catch (error) {
      console.error("Failed to reject request:", error.message);
    }
  };

  const handleAddFriend = async (userId) => {
    try {
      await toggleFriendRequest(userId);
      setSuggestions(prev => {
          const exists = prev.find(u => u && u._id === userId);
          if (exists) {
              return prev.map(user => (user && user._id === userId) ? { ...user, requestSent: true } : user);
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
      setSuggestions(prev => prev.map(user => (user && user._id === userId) ? { ...user, requestSent: false } : user));
    } catch (error) {
      console.error("Failed to cancel request:", error.message);
    }
  };

  const handleRemoveSuggestion = (userId) => {
    setSuggestions(prev => prev.filter(sug => sug && sug._id !== userId));
  };

  const handleUnfriend = async (userId) => {
    try {
      await removeFriend(userId);
      setFriends(prev => prev.filter(friend => friend && friend._id !== userId));
    } catch (error) {
      console.error("Failed to unfriend:", error.message);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markNotificationsAsRead();
      setNotifications(prev => prev.map(n => (n ? { ...n, seen: true } : n)));
    } catch (error) {
      console.error("Failed to mark notifications as read", error);
    }
  };

  const value = {
    requests,
    friends,
    suggestions,
    notifications,
    
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