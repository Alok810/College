// src/pages/Friend.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { UserCheck, UserPlus, UserX, MessageSquare, MoreHorizontal } from 'lucide-react';
// Import the new data from your data.js file
import { dummyFriendsData, dummyFriendRequestsData } from '../assets/data'; 

// --- COMPONENTS ---

// Card for an incoming friend request
const FriendRequestCard = ({ user, onAccept, onDecline }) => {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-white rounded-xl shadow-md transition-all duration-300">
      <Link to={`/profile/${user._id}`} className="flex-shrink-0">
        <img
          src={user.profile_picture}
          alt={user.full_name}
          className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-indigo-100 shadow-sm transition-transform hover:scale-105"
        />
      </Link>
      <div className="flex-grow text-center sm:text-left">
        <Link to={`/profile/${user._id}`} className="block">
          <h4 className="text-lg font-bold text-gray-800 hover:text-indigo-600 truncate">{user.full_name}</h4>
        </Link>
        <p className="text-sm text-gray-500">{user.mutual_friends} mutual friends</p>
        <div className="flex justify-center sm:justify-start gap-3 mt-3">
          <button
            onClick={() => onAccept(user._id)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition duration-150"
          >
            <UserCheck size={18} />
            Accept
          </button>
          <button
            onClick={() => onDecline(user._id)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition duration-150"
          >
            <UserX size={18} />
            Decline
          </button>
        </div>
      </div>
    </div>
  );
};

// Card for an existing friend
const FriendCard = ({ user, onUnfriend }) => {
  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-md transition-all duration-300">
      <Link to={`/profile/${user._id}`} className="flex-shrink-0">
        <img
          src={user.profile_picture}
          alt={user.full_name}
          className="w-20 h-20 rounded-lg object-cover shadow-sm transition-transform hover:scale-105"
        />
      </Link>
      <div className="flex-grow overflow-hidden">
        <Link to={`/profile/${user._id}`} className="block">
          <h4 className="text-lg font-bold text-gray-800 hover:text-indigo-600 truncate">{user.full_name}</h4>
        </Link>
        <p className="text-sm text-gray-500">{user.mutual_friends} mutual friends</p>
        <div className="flex gap-3 mt-3">
          {/* Link to open chat on the homepage */}
          <Link
            to={`/?open_chat=${user._id}`}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 bg-indigo-100 text-indigo-700 font-medium text-sm rounded-lg hover:bg-indigo-200 transition duration-150"
          >
            <MessageSquare size={16} />
            Message
          </Link>
          <button 
            onClick={() => onUnfriend(user._id)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-600 font-medium text-sm rounded-lg hover:bg-gray-200 transition duration-150"
          >
            <UserX size={16} />
            Unfriend
          </button>
        </div>
      </div>
    </div>
  );
};


// --- MAIN PAGE ---

export default function Friend() {
  // We use local state to simulate a database for this demo
  const [requests, setRequests] = useState(dummyFriendRequestsData);
  const [friends, setFriends] = useState(dummyFriendsData);

  // --- Handlers to simulate API calls ---

  const handleAcceptRequest = (userId) => {
    // Find the user who sent the request
    const userToAccept = requests.find(req => req._id === userId);
    if (!userToAccept) return;

    // 1. Remove from requests list
    setRequests(prev => prev.filter(req => req._id !== userId));
    
    // 2. Add to friends list
    setFriends(prev => [userToAccept, ...prev]);
    
    // In a real app, you'd send this update to your API
  };

  const handleDeclineRequest = (userId) => {
    // 1. Remove from requests list
    setRequests(prev => prev.filter(req => req._id !== userId));
    // In a real app, you'd send this update to your API
  };

  const handleUnfriend = (userId) => {
    // 1. Remove from friends list
    setFriends(prev => prev.filter(friend => friend._id !== userId));
    // In a real app, you'd send this update to your API
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      
      {/* --- Friend Requests Section --- */}
      <div>
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Friend Requests</h2>
        {requests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {requests.map(user => (
              <FriendRequestCard 
                key={user._id} 
                user={user} 
                onAccept={handleAcceptRequest}
                onDecline={handleDeclineRequest}
              />
            ))}
          </div>
        ) : (
          <div className="p-10 bg-white rounded-xl shadow-md text-center text-gray-500">
            <p>You have no new friend requests.</p>
          </div>
        )}
      </div>

      {/* --- All Friends Section --- */}
      <div>
        <h2 className="text-3xl font-bold text-gray-800 mb-4">All Friends ({friends.length})</h2>
        {friends.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {friends.map(user => (
              <FriendCard 
                key={user._id} 
                user={user}
                onUnfriend={handleUnfriend}
              />
            ))}
          </div>
        ) : (
          <div className="p-10 bg-white rounded-xl shadow-md text-center text-gray-500">
            <p>You haven't added any friends yet.</p>
          </div>
        )}
      </div>

    </div>
  );
}