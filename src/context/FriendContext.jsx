// src/context/FriendContext.jsx
import React, { createContext, useState, useContext } from 'react';
import {
  dummyFriendsData,
  dummyFriendRequestsData,
  dummySuggestionsData,
  dummyNotificationData // <-- 1. Import notification data
} from '../assets/data.js';

// 1. Create the context
const FriendContext = createContext();

// 2. Create the Provider
export const FriendProvider = ({ children }) => {
  // === FRIEND STATE ===
  const [requests, setRequests] = useState(dummyFriendRequestsData);
  const [friends, setFriends] = useState(dummyFriendsData);
  const [suggestions, setSuggestions] = useState(() =>
    dummySuggestionsData.map(user => ({
      ...user,
      requestSent: false
    }))
  );

  // === 2. NOTIFICATION STATE (New) ===
  // We build the initial notification list from BOTH data sources
  const [notifications, setNotifications] = useState(() => {
    // a) Transform friend requests into notifications
    const requestNotifications = dummyFriendRequestsData.map(req => ({
      _id: `req_${req._id}`,
      user: {
        _id: req._id,
        full_name: req.full_name,
        profilePicture: req.profile_picture,
      },
      text: 'sent you a friend request.',
      createdAt: req.createdAt || '2025-11-13T10:00:00Z',
      seen: false,
      type: 'friend_request' // Custom type
    }));

    // b) Get all other notifications (likes, comments, etc.)
    const otherNotifications = dummyNotificationData.filter(
      n => n.type !== 'friend_request'
    );

    // c) Combine, sort, and return
    return [...requestNotifications, ...otherNotifications]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  });

  
  // === FRIEND HANDLERS ===
  const handleAcceptRequest = (userId) => {
    const userToAccept = requests.find(req => req._id === userId);
    if (!userToAccept) return;
    
    // Update friend lists
    setRequests(prev => prev.filter(req => req._id !== userId));
    setFriends(prev => [userToAccept, ...prev]);

    // 3. ALSO update notifications: Remove the request
    setNotifications(prev => prev.filter(n => n.user._id !== userId && n.type !== 'friend_request'));
  };

  const handleDeclineRequest = (userId) => {
    // Update friend list
    setRequests(prev => prev.filter(req => req._id !== userId));
    
    // 3. ALSO update notifications: Remove the request
    setNotifications(prev => prev.filter(n => n.user._id !== userId && n.type !== 'friend_request'));
  };

  const handleAddFriend = (userId) => {
    setSuggestions(prev =>
      prev.map(user =>
        user._id === userId ? { ...user, requestSent: true } : user
      )
    );
  };

  const handleCancelRequest = (userId) => {
    setSuggestions(prev =>
      prev.map(user =>
        user._id === userId ? { ...user, requestSent: false } : user
      )
    );
  };

  const handleRemoveSuggestion = (userId) => {
    setSuggestions(prev => prev.filter(sug => sug._id !== userId));
  };

  const handleUnfriend = (userId) => {
    setFriends(prev => prev.filter(friend => friend._id !== userId));
  };

  // === 4. NOTIFICATION HANDLERS (New) ===
  const handleMarkAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, seen: true }))
    );
  };

  // 5. Pass all state and handlers to children
  const value = {
    requests,
    friends,
    suggestions,
    notifications, // <-- Pass notifications
    handleAcceptRequest,
    handleDeclineRequest,
    handleAddFriend,
    handleCancelRequest,
    handleRemoveSuggestion,
    handleUnfriend,
    handleMarkAllAsRead // <-- Pass new handler
  };

  return (
    <FriendContext.Provider value={value}>
      {children}
    </FriendContext.Provider>
  );
};

// 4. Create a custom hook to easily use the context
export const useFriends = () => {
  return useContext(FriendContext);
};