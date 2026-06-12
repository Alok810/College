import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { UserCheck, UserPlus, UserX, MessageSquare, ChevronLeft, ChevronRight, UsersRound, X, Loader2, Globe } from 'lucide-react';
import { useFriends } from '../context/FriendContext'; 
import { useAuth } from '../context/AuthContext'; 

import RequireVerification from '../components/RequireVerification';

// --- Helper for Fallback Images ---
const getAvatar = (user) => {
  return user.profilePicture || `https://ui-avatars.com/api/?name=${user.name || user.full_name || 'User'}&background=EBF4FF&color=4F46E5`;
};

// --- COMPONENTS ---

// 1. Friend Request Card
const FriendRequestCard = ({ user, currentUserInstitute, onAccept, onDecline }) => {
  const isCrossInstitute = user.instituteId && currentUserInstitute && user.instituteId !== currentUserInstitute;

  return (
    <div className="w-[130px] sm:w-[150px] flex-shrink-0 bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-gray-100 flex flex-col items-center p-3 sm:p-4 transition-transform hover:-translate-y-1 box-border">
      <Link to={`/profile/${user._id}`} className="relative mt-1">
        <img src={getAvatar(user)} alt={user.name} className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-white shadow-sm" />
        {isCrossInstitute && (
          <div className="absolute -top-1 -right-1 bg-blue-500 text-white p-1 rounded-full border-2 border-white shadow-sm" title="Cross Institute">
            <Globe size={10} />
          </div>
        )}
      </Link>
      
      <Link to={`/profile/${user._id}`} className="mt-2 sm:mt-3 w-full text-center">
        <h4 className="font-bold text-gray-900 text-xs sm:text-sm truncate hover:text-purple-600 transition-colors">
          {user.name || user.full_name}
        </h4>
      </Link>
      
      <p className={`text-[9px] sm:text-[10px] font-bold truncate w-full text-center uppercase tracking-tight mb-3 sm:mb-4 ${isCrossInstitute ? 'text-blue-500' : 'text-gray-400'}`}>
        {isCrossInstitute ? (user.instituteName || "External") : "Wants to connect"}
      </p>
      
      <div className="flex gap-1.5 sm:gap-2 w-full mt-auto">
        <button onClick={() => onAccept(user._id)} className="flex-1 flex items-center justify-center py-2 sm:py-2.5 bg-gradient-to-r from-purple-600 to-teal-500 text-white rounded-xl shadow-md hover:opacity-90 active:scale-95 transition-all" title="Accept">
          <UserCheck size={16} className="stroke-[2.5px]" />
        </button>
        <button onClick={() => onDecline(user._id)} className="flex-1 flex items-center justify-center py-2 sm:py-2.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 hover:text-red-500 active:scale-95 transition-all" title="Decline">
          <X size={16} className="stroke-[2.5px]" />
        </button>
      </div>
    </div>
  );
};

// 2. Suggestion Card
const SuggestionCard = ({ user, currentUserInstitute, onAdd, onRemove, onCancel }) => {
  const isCrossInstitute = user.instituteId && currentUserInstitute && user.instituteId !== currentUserInstitute;

  return (
    <div className="w-[130px] sm:w-[150px] flex-shrink-0 bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-gray-100 flex flex-col items-center p-3 sm:p-4 relative transition-transform hover:-translate-y-1 box-border">
      {!user.requestSent && (
        <button onClick={() => onRemove(user._id)} className="absolute top-1.5 right-1.5 text-gray-300 hover:text-gray-600 bg-gray-50 hover:bg-gray-200 rounded-full p-1.5 transition-colors">
          <X size={14} className="stroke-[2.5px]" />
        </button>
      )}

      <Link to={`/profile/${user._id}`} className="mt-2 relative">
        <img src={getAvatar(user)} alt={user.name} className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-gray-50 shadow-sm" />
        {isCrossInstitute && (
          <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white p-1 rounded-full border-2 border-white shadow-sm" title="Cross Institute">
            <Globe size={10} />
          </div>
        )}
      </Link>
      
      <Link to={`/profile/${user._id}`} className="mt-2 sm:mt-3 w-full text-center">
        <h5 className="font-bold text-gray-900 text-xs sm:text-sm truncate hover:text-purple-600 transition-colors">
          {user.name || user.full_name}
        </h5>
      </Link>

      <p className={`text-[9px] sm:text-[10px] font-bold mb-3 sm:mb-4 truncate w-full text-center uppercase tracking-tight ${isCrossInstitute ? 'text-blue-500' : 'text-gray-400'}`}>
        {isCrossInstitute ? (user.instituteName || "External") : "Suggested"}
      </p>

      {user.requestSent ? (
        <button onClick={() => onCancel(user._id)} className="w-full flex items-center justify-center py-2 sm:py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-all text-[11px] sm:text-xs active:scale-95 mt-auto">
          Cancel
        </button>
      ) : (
        <button onClick={() => onAdd(user._id)} className="w-full flex items-center justify-center gap-1 sm:gap-1.5 py-2 sm:py-2.5 bg-gradient-to-r from-purple-600 to-teal-500 text-white rounded-xl shadow-md font-bold text-[11px] sm:text-xs hover:opacity-90 active:scale-95 transition-all mt-auto">
          <UserPlus size={14} className="stroke-[2.5px]" /> Add
        </button>
      )}
    </div>
  );
};

// 3. Friend Card - FORCED WIDTH LIMIT FOR MOBILE
const FriendCard = ({ user, currentUserInstitute, onUnfriend }) => {
  const isCrossInstitute = user.instituteId && currentUserInstitute && user.instituteId !== currentUserInstitute;

  return (
    // The max-w-[90vw] ensures the card physically cannot grow wider than the phone screen
    <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2.5 p-3 sm:p-4 bg-white rounded-2xl shadow-sm border border-gray-50 w-full max-w-[90vw] md:max-w-full box-border overflow-hidden">
      
      {/* 1. Avatar */}
      <Link to={`/profile/${user._id}`} className="relative flex-shrink-0">
        <img 
          src={getAvatar(user)} 
          alt={user.name} 
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-white shadow-sm" 
        />
        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 border-2 border-white rounded-full"></div>
      </Link>
      
      {/* 2. Text (Truncated) */}
      <div className="min-w-0 w-full flex flex-col justify-center">
        <Link to={`/profile/${user._id}`} className="w-full block truncate">
          <h4 className="font-extrabold text-gray-900 text-[13px] sm:text-[15px] truncate hover:text-purple-600 transition-colors flex items-center gap-1.5">
            <span className="truncate">{user.name || user.full_name}</span>
            {isCrossInstitute && <Globe size={12} className="text-blue-500 flex-shrink-0" title="Cross Institute" />}
          </h4>
        </Link>
        <p className={`text-[10px] sm:text-[11px] font-bold truncate uppercase tracking-tight mt-0.5 ${isCrossInstitute ? 'text-blue-500' : 'text-gray-400'}`}>
          {isCrossInstitute ? (user.instituteName || "External") : "Connected"}
        </p>
      </div>

      {/* 3. Action Buttons (Slightly smaller for mobile to save space) */}
      <div className="flex items-center gap-1.5 sm:gap-2 pr-1">
        <Link 
          to={`/?open_chat=${user._id}`} 
          className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-[#F8F5FF] text-purple-600 rounded-xl hover:bg-purple-100 transition-colors active:scale-95" 
          title="Message"
        >
          <MessageSquare size={16} className="stroke-[2px] sm:w-[18px] sm:h-[18px]" />
        </Link>
        <button 
          onClick={() => onUnfriend(user._id)} 
          className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-gray-50 text-gray-400 rounded-xl hover:bg-red-50 hover:text-red-500 transition-colors active:scale-95" 
          title="Unfriend"
        >
          <UserX size={16} className="stroke-[2px] sm:w-[18px] sm:h-[18px]" />
        </button>
      </div>

    </div>
  );
};

// 4. Horizontal Scroller
const HorizontalScroller = ({ children }) => {
  const scrollRef = useRef(null);
  
  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -250 : 250;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative group/scroller w-full box-border overflow-hidden">
      <button onClick={() => scroll('left')} className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 items-center justify-center bg-white/90 backdrop-blur-md rounded-full shadow-lg border border-gray-100 text-gray-600 hover:text-purple-600 hover:scale-110 active:scale-95 transition-all opacity-0 group-hover/scroller:opacity-100 -ml-4">
        <ChevronLeft size={20} className="stroke-[2.5px]" />
      </button>
      
      <div ref={scrollRef} className="flex space-x-3 sm:space-x-4 overflow-x-auto py-4 custom-scrollbar snap-x snap-mandatory scroll-px-4 -mx-4 px-4 sm:mx-0 sm:px-0 hide-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {React.Children.map(children, child => <div className="snap-start">{child}</div>)}
      </div>
      
      <button onClick={() => scroll('right')} className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 items-center justify-center bg-white/90 backdrop-blur-md rounded-full shadow-lg border border-gray-100 text-gray-600 hover:text-purple-600 hover:scale-110 active:scale-95 transition-all opacity-0 group-hover/scroller:opacity-100 -mr-4">
        <ChevronRight size={20} className="stroke-[2.5px]" />
      </button>
    </div>
  );
};

// --- MAIN PAGE ---
export default function Friend() {
  const { authData } = useAuth(); 
  
  const {
    requests,
    friends,
    suggestions,
    isLoadingSocialData,
    fetchSocialDataOnDemand,
    handleAcceptRequest,
    handleDeclineRequest,
    handleAddFriend,
    handleCancelRequest,
    handleRemoveSuggestion,
    handleUnfriend
  } = useFriends();

  useEffect(() => {
    fetchSocialDataOnDemand();
  }, [fetchSocialDataOnDemand]);

  const myInstituteId = authData?.instituteId;

  return (
    <RequireVerification>
      {/* Reduced horizontal padding on mobile to stop screen stretching */}
      <div className="w-full max-w-4xl mx-auto p-3 sm:p-6 lg:p-8 pb-28 sm:pb-8 space-y-8 sm:space-y-10 overflow-x-hidden box-border">

        {isLoadingSocialData ? (
           <div className="flex flex-col items-center justify-center min-h-[50vh] text-indigo-500">
               <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 animate-spin mb-4" />
               <p className="font-bold text-gray-500 text-sm sm:text-base">Syncing your network...</p>
           </div>
        ) : (
          <>
            {/* --- 1. Friend Requests Section --- */}
            {requests.length > 0 && (
                <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full max-w-full">
                  <div className="mb-1 sm:mb-2">
                    <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">Friend Requests</h2>
                    <p className="text-xs sm:text-sm font-medium text-gray-500 mt-0.5">People waiting to connect</p>
                  </div>
                  <HorizontalScroller>
                      {requests.map(user => (
                        <FriendRequestCard 
                          key={user._id} 
                          user={user} 
                          currentUserInstitute={myInstituteId} 
                          onAccept={handleAcceptRequest} 
                          onDecline={handleDeclineRequest} 
                        />
                      ))}
                  </HorizontalScroller>
                </section>
            )}

            {/* --- 2. People You May Know Section --- */}
            {suggestions.length > 0 && (
                <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100 w-full max-w-full">
                  <div className="mb-1 sm:mb-2">
                    <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">People You May Know</h2>
                    <p className="text-xs sm:text-sm font-medium text-gray-500 mt-0.5">Discover students across the network</p>
                  </div>
                  <HorizontalScroller>
                      {suggestions.map(user => (
                        <SuggestionCard 
                          key={user._id} 
                          user={user} 
                          currentUserInstitute={myInstituteId} 
                          onAdd={handleAddFriend} 
                          onRemove={handleRemoveSuggestion} 
                          onCancel={handleCancelRequest} 
                        />
                      ))}
                  </HorizontalScroller>
                </section>
            )}

            {/* --- 3. All Friends Section --- */}
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200 w-full max-w-[100vw] overflow-hidden box-border">
                <div className="flex items-center gap-3 mb-4 sm:mb-5">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">All Friends</h2>
                  <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 bg-white border border-gray-200 text-gray-600 text-xs sm:text-sm font-bold rounded-full shadow-sm">
                      {friends.length}
                  </span>
                </div>
                
                {friends.length > 0 ? (
                  <div className="flex flex-col md:grid md:grid-cols-2 gap-3 sm:gap-4 w-full pb-4">
                    {/* The comment has been moved completely to prevent any syntax errors */}
                    {friends.map(user => (
                      <FriendCard 
                        key={user._id} 
                        user={user} 
                        currentUserInstitute={myInstituteId} 
                        onUnfriend={handleUnfriend} 
                      />
                    ))}
                  </div>
                ) : (
                  <div className="p-6 sm:p-12 bg-white rounded-[2rem] shadow-sm border border-gray-100 text-center flex flex-col items-center justify-center mt-4 w-full box-border">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-50 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                        <UsersRound size={28} className="text-gray-400 stroke-2 sm:w-8 sm:h-8" />
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-1">No friends yet</h3>
                      <p className="text-gray-500 text-xs sm:text-sm font-medium max-w-sm px-4">Connect with other students across the Rigya network to start building your profile!</p>
                  </div>
                )}
            </section>
          </>
        )}
      </div>
    </RequireVerification>
  );
}