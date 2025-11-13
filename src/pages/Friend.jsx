import React from 'react';
import { Link } from 'react-router-dom';
import { UserCheck, UserPlus, UserX, MessageSquare, ChevronLeft, ChevronRight } from 'lucide-react';
import { useFriends } from '../context/FriendContext'; // <-- Uses the hook

// --- COMPONENTS ---

// 1. Friend Request Card (UPDATED)
// --- UPDATED: "Accept" button has gradient, "Decline" button is restored ---
const FriendRequestCard = ({ user, onAccept, onDecline }) => {
  return (
    // w-[28rem] is correct for the scroller
    <div className="flex-shrink-0 w-[28rem] flex items-center gap-4 p-4 bg-white rounded-xl shadow-md transition-shadow hover:shadow-lg">
      <Link to={`/profile/${user._id}`} className="flex-shrink-0">
        <img
          src={user.profile_picture}
          alt={user.full_name}
          className="w-16 h-16 rounded-full object-cover border-2 border-gray-100"
        />
      </Link>
      <div className="flex-grow overflow-hidden">
        <Link to={`/profile/${user._id}`} className="block">
          <h4 className="text-base font-bold text-gray-800 hover:text-indigo-600 truncate">{user.full_name}</h4>
        </Link>
        <p className="text-sm text-gray-500 truncate">{user.mutual_friends} mutual friend{user.mutual_friends !== 1 ? 's' : ''}</p>
      </div>
      <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
        {/* --- THIS BUTTON IS UPDATED --- */}
        <button
          onClick={() => onAccept(user._id)}
          className="flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition bg-gradient-to-r from-purple-600 to-teal-600 text-white shadow-md hover:opacity-90"
        >
          <UserCheck size={16} />
          Accept
        </button>
         {/* --- THIS BUTTON IS RESTORED --- */}
        <button
          onClick={() => onDecline(user._id)}
          className="flex items-center justify-center gap-1.5 px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition duration-150 text-sm"
        >
          <UserX size={16} />
          Decline
        </button>
      </div>
    </div>
  );
};

// 2. All Friends Card (No changes)
const FriendCard = ({ user, onUnfriend }) => {
  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-md transition-shadow hover:shadow-lg">
      <Link to={`/profile/${user._id}`} className="flex-shrink-0">
        <img
          src={user.profile_picture}
          alt={user.full_name}
          className="w-16 h-16 rounded-full object-cover border-2 border-gray-100"
        />
      </Link>
      <div className="flex-grow overflow-hidden">
        <Link to={`/profile/${user._id}`} className="block">
          <h4 className="text-base font-bold text-gray-800 hover:text-indigo-600 truncate">{user.full_name}</h4>
        </Link>
        <p className="text-sm text-gray-500">{user.mutual_friends} mutual friend{user.mutual_friends !== 1 ? 's' : ''}</p>
      </div>
      <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
        <Link
          to={`/?open_chat=${user._id}`}
          className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-indigo-100 text-indigo-700 font-medium text-sm rounded-lg hover:bg-indigo-200 transition duration-150"
          title="Message"
        >
          <MessageSquare size={16} />
          <span className="hidden sm:inline">Message</span>
        </Link>
        <button
          onClick={() => onUnfriend(user._id)}
          className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-600 font-medium text-sm rounded-lg hover:bg-gray-200 transition duration-150"
          title="Unfriend"
        >
          <UserX size={16} />
          <span className="hidden sm:inline">Unfriend</span>
        </button>
      </div>
    </div>
  );
};

// 3. Suggestion Card (UPDATED)
const SuggestionCard = ({ user, onAdd, onRemove, onCancel }) => {
  return (
    <div className="flex-shrink-0 w-48 bg-white rounded-lg shadow-md overflow-hidden transition-shadow hover:shadow-lg">
      <Link to={`/profile/${user._id}`}>
        <img
          src={user.profile_picture}
          alt={user.full_name}
          className="w-full h-40 object-cover"
        />
      </Link>
      <div className="p-3">
        <Link to={`/profile/${user._id}`}>
          <h5 className="font-bold text-gray-800 truncate hover:text-indigo-600">{user.full_name}</h5>
        </Link>

        {user.requestSent ? (
          <>
            <p className="text-sm text-gray-500 mb-2 italic">Request sent</p>
            <div className="mt-2 space-y-2">
              <button
                onClick={() => onCancel(user._id)}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition duration-150 text-sm"
              >
                <UserX size={16} />
                Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-2">{user.mutual_friends} mutual friend{user.mutual_friends !== 1 ? 's' : ''}</p>
            <div className="mt-2 space-y-2">
              {/* --- UPDATED: This button now uses the gradient style --- */}
              <button
                onClick={() => onAdd(user._id)}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition bg-gradient-to-r from-purple-600 to-teal-600 text-white shadow-md hover:opacity-90"
              >
                <UserPlus size={16} />
                Add friend
              </button>
              <button
                onClick={() => onRemove(user._id)}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition duration-150 text-sm"
              >
                <UserX size={16} />
                Remove
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// 4. Horizontal Scroller Component (No changes)
const HorizontalScroller = ({ children, rows = 1 }) => {
  const scrollRef = React.useRef(null);
  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const scrollbarHideStyle = {
    scrollbarWidth: 'none',
    msOverflowStyle: 'none'
  };

  const isGrid = rows > 1;
  const scrollerClasses = isGrid
    ? 'grid gap-4' // Use grid and gap
    : 'flex space-x-4'; // Use flex and space

  const scrollerStyles = isGrid
    ? { gridAutoFlow: 'column', gridTemplateRows: `repeat(${rows}, 1fr)` }
    : {};


  return (
    <div className="relative">
      <button
        onClick={() => scroll('left')}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white/80 rounded-full shadow-lg hover:bg-white transition-all -ml-4"
        aria-label="Scroll left"
      >
        <ChevronLeft size={24} />
      </button>
      <div
        ref={scrollRef}
        className={`overflow-x-auto p-2 -m-2 ${scrollerClasses}`}
        style={{ ...scrollbarHideStyle, ...scrollerStyles }}
      >
        {children}
      </div>
      <button
        onClick={() => scroll('right')}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white/80 rounded-full shadow-lg hover:bg-white transition-all -mr-4"
        aria-label="Scroll right"
      >
        <ChevronRight size={24} />
      </button>
    </div>
  );
};


// --- MAIN PAGE ---
export default function Friend() {
  
  // --- UPDATED: Restored handleDeclineRequest ---
  const {
    requests,
    friends,
    suggestions,
    handleAcceptRequest,
    handleDeclineRequest, // Restored
    handleAddFriend,
    handleCancelRequest,
    handleRemoveSuggestion,
    handleUnfriend
  } = useFriends();

  return (
    // CHANGED: max-w-5xl to max-w-6xl to fit the cards
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">

      {/* --- 1. Friend Requests Section (UPDATED) --- */}
      {requests.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-3xl font-bold text-gray-800">Friend Requests</h2>
            <Link to="#" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
              See all
            </Link>
          </div>
          {/* This is the 2-ROW HorizontalScroller */}
          <HorizontalScroller rows={2}>
            {requests.map(user => (
              <FriendRequestCard
                key={user._id}
                user={user}
                onAccept={handleAcceptRequest}
                onDecline={handleDeclineRequest} // Restored
              />
            ))}
          </HorizontalScroller>
        </div>
      )}

      {/* --- 2. People You May Know Section (No changes) --- */}
      {suggestions.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-3xl font-bold text-gray-800">People You May Know</h2>
            <Link to="#" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
              See all
            </Link>
          </div>
          <HorizontalScroller>
            {suggestions.map(user => (
              <SuggestionCard
                key={user._id}
                user={user}
                onAdd={handleAddFriend}
                onRemove={handleRemoveSuggestion}
                onCancel={handleCancelRequest}
              />
            ))}
          </HorizontalScroller>
        </div>
      )}

      {/* --- 3. All Friends Section (No changes) --- */}
      <div>
        <h2 className="text-3xl font-bold text-gray-800 mb-4">All Friends ({friends.length})</h2>
        {friends.length > 0 ? (
          // CHANGED: grid-cols-1 to md:grid-cols-2 to match the friend request layout
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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