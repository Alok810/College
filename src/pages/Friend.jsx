import React from 'react';
import { Link } from 'react-router-dom';
import { UserCheck, UserPlus, UserX, MessageSquare, ChevronLeft, ChevronRight, UsersRound, X } from 'lucide-react';
import { useFriends } from '../context/FriendContext'; 

// ✅ IMPORT THE BOUNCER COMPONENT
import RequireVerification from '../components/RequireVerification';

// --- Helper for Fallback Images ---
const getAvatar = (user) => {
  return user.profilePicture || `https://ui-avatars.com/api/?name=${user.name || user.full_name || 'User'}&background=EBF4FF&color=4F46E5`;
};

// --- COMPONENTS ---

// 1. Friend Request Card - 📱 Sleek Portrait Card
const FriendRequestCard = ({ user, onAccept, onDecline }) => {
  return (
    <div className="w-[150px] flex-shrink-0 bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-gray-100 flex flex-col items-center p-4 transition-transform hover:-translate-y-1">
      <Link to={`/profile/${user._id}`} className="relative mt-1">
        <img
          src={getAvatar(user)}
          alt={user.name}
          className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm"
        />
        <div className="absolute bottom-0 right-0 w-4 h-4 bg-purple-500 border-2 border-white rounded-full"></div>
      </Link>
      
      <Link to={`/profile/${user._id}`} className="mt-3 w-full text-center">
        <h4 className="font-bold text-gray-900 text-sm truncate hover:text-purple-600 transition-colors">
          {user.name || user.full_name}
        </h4>
      </Link>
      <p className="text-[11px] text-gray-500 mb-4 truncate w-full text-center">Wants to connect</p>
      
      <div className="flex gap-2 w-full mt-auto">
        <button
          onClick={() => onAccept(user._id)}
          className="flex-1 flex items-center justify-center py-2 bg-gradient-to-r from-purple-600 to-teal-500 text-white rounded-xl shadow-md hover:opacity-90 active:scale-95 transition-all"
          title="Accept"
        >
          <UserCheck size={16} className="stroke-[2.5px]" />
        </button>
        <button
          onClick={() => onDecline(user._id)}
          className="flex-1 flex items-center justify-center py-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 hover:text-red-500 active:scale-95 transition-all"
          title="Decline"
        >
          <X size={16} className="stroke-[2.5px]" />
        </button>
      </div>
    </div>
  );
};

// 2. Suggestion Card - 📱 Instagram Style Portrait Card
const SuggestionCard = ({ user, onAdd, onRemove, onCancel }) => {
  return (
    <div className="w-[140px] sm:w-[150px] flex-shrink-0 bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-gray-100 flex flex-col items-center p-4 relative transition-transform hover:-translate-y-1">
      {/* Small subtle remove button in the corner */}
      {!user.requestSent && (
        <button 
          onClick={() => onRemove(user._id)} 
          className="absolute top-2 right-2 text-gray-300 hover:text-gray-600 bg-gray-50 hover:bg-gray-200 rounded-full p-1.5 transition-colors"
        >
          <X size={14} className="stroke-[2.5px]" />
        </button>
      )}

      <Link to={`/profile/${user._id}`} className="mt-2">
        <img
          src={getAvatar(user)}
          alt={user.name}
          className="w-16 h-16 rounded-full object-cover border-2 border-gray-50 shadow-sm"
        />
      </Link>
      
      <Link to={`/profile/${user._id}`} className="mt-3 w-full text-center">
        <h5 className="font-bold text-gray-900 text-sm truncate hover:text-purple-600 transition-colors">
          {user.name || user.full_name}
        </h5>
      </Link>

      {user.requestSent ? (
        <>
          <p className="text-[11px] text-gray-500 mb-4 truncate w-full text-center">Request sent</p>
          <button
            onClick={() => onCancel(user._id)}
            className="w-full flex items-center justify-center gap-1.5 py-2 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-all text-xs active:scale-95 mt-auto"
          >
            Cancel
          </button>
        </>
      ) : (
        <>
          <p className="text-[11px] text-gray-500 mb-4 truncate w-full text-center">Suggested for you</p>
          <button
            onClick={() => onAdd(user._id)}
            className="w-full flex items-center justify-center gap-1.5 py-2 bg-gradient-to-r from-purple-600 to-teal-500 text-white rounded-xl shadow-md font-bold text-xs hover:opacity-90 active:scale-95 transition-all mt-auto"
          >
            <UserPlus size={14} className="stroke-[2.5px]" /> Add
          </button>
        </>
      )}
    </div>
  );
};

// 3. All Friends Card - 📱 FIXED WIDTH FOR MOBILE
const FriendCard = ({ user, onUnfriend }) => {
  return (
    <div className="flex items-center justify-between p-3 sm:p-4 bg-white rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-gray-50 transition-all hover:shadow-[0_4px_15px_rgba(0,0,0,0.06)] w-full max-w-[calc(100vw-2rem)] mx-auto sm:max-w-none">
      
      {/* Left: Avatar & Info */}
      <div className="flex items-center gap-3 sm:gap-4 overflow-hidden">
        <Link to={`/profile/${user._id}`} className="relative flex-shrink-0">
          <img
            src={getAvatar(user)}
            alt={user.name}
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border-2 border-white shadow-sm"
          />
          <div className="absolute bottom-0 right-0 w-3 h-3 sm:w-3.5 sm:h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
        </Link>
        <div className="flex flex-col overflow-hidden">
          <Link to={`/profile/${user._id}`}>
            <h4 className="font-extrabold text-gray-900 text-sm sm:text-base truncate hover:text-purple-600 transition-colors">
              {user.name || user.full_name}
            </h4>
          </Link>
          <p className="text-xs font-medium text-gray-500 truncate mt-0.5">Connected</p>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex gap-2 flex-shrink-0 ml-2">
        <Link
          to={`/?open_chat=${user._id}`}
          className="flex items-center justify-center p-2 sm:px-4 sm:py-2 bg-purple-50 text-purple-700 rounded-xl hover:bg-purple-100 transition-all active:scale-95"
          title="Message"
        >
          <MessageSquare size={16} className="stroke-[2.5px] sm:w-5 sm:h-5 sm:mr-1.5" />
          <span className="hidden sm:block text-sm font-bold">Message</span>
        </Link>
        <button
          onClick={() => onUnfriend(user._id)}
          className="flex items-center justify-center p-2 sm:px-3 sm:py-2 bg-gray-50 text-gray-400 rounded-xl hover:bg-red-50 hover:text-red-500 transition-all active:scale-95"
          title="Unfriend"
        >
          <UserX size={16} className="stroke-[2.5px] sm:w-5 sm:h-5" />
        </button>
      </div>
    </div>
  );
};

// 4. Horizontal Scroller Component - 📱 Smooth Snapping
const HorizontalScroller = ({ children }) => {
  const scrollRef = React.useRef(null);
  
  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative group/scroller -mx-4 px-4 sm:mx-0 sm:px-0">
      {/* Desktop Scroll Left */}
      <button
        onClick={() => scroll('left')}
        className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 items-center justify-center bg-white/90 backdrop-blur-md rounded-full shadow-lg border border-gray-100 text-gray-600 hover:text-purple-600 hover:scale-110 active:scale-95 transition-all opacity-0 group-hover/scroller:opacity-100 -ml-4"
      >
        <ChevronLeft size={20} className="stroke-[2.5px]" />
      </button>
      
      <div
        ref={scrollRef}
        className={`flex space-x-4 overflow-x-auto py-4 custom-scrollbar snap-x snap-mandatory scroll-px-4 sm:scroll-px-0`}
      >
        {React.Children.map(children, child => (
          <div className="snap-start">{child}</div>
        ))}
      </div>

      {/* Desktop Scroll Right */}
      <button
        onClick={() => scroll('right')}
        className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 items-center justify-center bg-white/90 backdrop-blur-md rounded-full shadow-lg border border-gray-100 text-gray-600 hover:text-purple-600 hover:scale-110 active:scale-95 transition-all opacity-0 group-hover/scroller:opacity-100 -mr-4"
      >
        <ChevronRight size={20} className="stroke-[2.5px]" />
      </button>
    </div>
  );
};

// --- MAIN PAGE ---
export default function Friend() {
  const {
    requests,
    friends,
    suggestions,
    handleAcceptRequest,
    handleDeclineRequest,
    handleAddFriend,
    handleCancelRequest,
    handleRemoveSuggestion,
    handleUnfriend
  } = useFriends();

  return (
    // ✅ WRAP THE ENTIRE RETURN IN REQUIREVERIFICATION
    <RequireVerification>
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 pb-28 sm:pb-8 space-y-8">

        {/* --- 1. Friend Requests Section --- */}
        {requests.length > 0 && (
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-end mb-1 sm:mb-2">
                <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">Friend Requests</h2>
                <p className="text-xs sm:text-sm font-medium text-gray-500 mt-0.5">People waiting to connect</p>
                </div>
            </div>
            <HorizontalScroller>
                {requests.map(user => (
                <FriendRequestCard
                    key={user._id}
                    user={user}
                    onAccept={handleAcceptRequest}
                    onDecline={handleDeclineRequest}
                />
                ))}
            </HorizontalScroller>
            </section>
        )}

        {/* --- 2. People You May Know Section --- */}
        {suggestions.length > 0 && (
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
            <div className="flex justify-between items-end mb-1 sm:mb-2">
                <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">People You May Know</h2>
                <p className="text-xs sm:text-sm font-medium text-gray-500 mt-0.5">Discover students</p>
                </div>
                <Link to="#" className="text-xs sm:text-sm font-bold text-purple-600 hover:text-teal-500 transition-colors pb-1">
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
            </section>
        )}

        {/* --- 3. All Friends Section --- */}
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
            <div className="flex items-center gap-3 mb-4 sm:mb-5">
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">All Friends</h2>
            <span className="px-3 py-1 bg-white border border-gray-200 text-gray-600 text-xs sm:text-sm font-bold rounded-full shadow-sm">
                {friends.length}
            </span>
            </div>
            
            {friends.length > 0 ? (
            <div className="flex flex-col md:grid md:grid-cols-2 gap-3 sm:gap-4">
                {friends.map(user => (
                <FriendCard
                    key={user._id}
                    user={user}
                    onUnfriend={handleUnfriend}
                />
                ))}
            </div>
            ) : (
            <div className="p-8 sm:p-12 bg-white rounded-[2rem] shadow-sm border border-gray-100 text-center flex flex-col items-center justify-center mt-4">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <UsersRound size={32} className="text-gray-400 stroke-2" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-1">No friends yet</h3>
                <p className="text-gray-500 text-sm font-medium max-w-sm">Connect with other students at your institute to start building your network!</p>
            </div>
            )}
        </section>

        </div>
    </RequireVerification>
  );
}