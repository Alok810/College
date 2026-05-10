import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Globe, UsersRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// --- Helper for Fallback Images ---
const getAvatar = (user) => {
  return user.profilePicture || `https://ui-avatars.com/api/?name=${user.name || user.full_name || 'User'}&background=EBF4FF&color=4F46E5`;
};

// --- 1. The Adapted Card (No "Unfriend" button here!) ---
const ProfileFriendCard = ({ user, currentUserInstitute }) => {
  const isCrossInstitute = user.instituteId && currentUserInstitute && user.instituteId !== currentUserInstitute;

  return (
    <div className="flex items-center justify-between p-3 sm:p-4 bg-white rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-gray-50 transition-all hover:shadow-[0_4px_15px_rgba(0,0,0,0.06)] w-full">
      <div className="flex items-center gap-3 sm:gap-4 overflow-hidden">
        <Link to={`/profile/${user._id}`} className="relative flex-shrink-0">
          <img src={getAvatar(user)} alt={user.name} className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border-2 border-white shadow-sm" />
          <div className="absolute bottom-0 right-0 w-3 h-3 sm:w-3.5 sm:h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
        </Link>
        
        <div className="flex flex-col overflow-hidden">
          <Link to={`/profile/${user._id}`}>
            <h4 className="font-extrabold text-gray-900 text-sm sm:text-base truncate hover:text-purple-600 transition-colors flex items-center gap-1.5">
              {user.name || user.full_name}
              {isCrossInstitute && <Globe size={12} className="text-blue-500 flex-shrink-0" title="Cross Institute" />}
            </h4>
          </Link>
          <p className={`text-[10px] sm:text-xs font-bold truncate uppercase tracking-tight mt-0.5 ${isCrossInstitute ? 'text-blue-500' : 'text-gray-400'}`}>
            {isCrossInstitute ? (user.instituteName || "External Connection") : "Connected"}
          </p>
        </div>
      </div>

      <div className="flex gap-2 flex-shrink-0 ml-2">
        <Link to={`/?open_chat=${user._id}`} className="flex items-center justify-center p-2 sm:px-4 sm:py-2 bg-purple-50 text-purple-700 rounded-xl hover:bg-purple-100 transition-all active:scale-95" title="Message">
          <MessageSquare size={16} className="stroke-[2.5px] sm:w-5 sm:h-5 sm:mr-1.5" />
          <span className="hidden sm:block text-sm font-bold">Message</span>
        </Link>
      </div>
    </div>
  );
};

// --- 2. The Main Tab Component ---
const ProfileFriendsTab = ({ friendsArray = [] }) => {
  const { authData } = useAuth();
  const myInstituteId = authData?.instituteId;

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      {friendsArray && friendsArray.length > 0 ? (
        <div className="flex flex-col md:grid md:grid-cols-2 gap-3 sm:gap-4">
          {friendsArray.map(friend => (
            <ProfileFriendCard 
              key={friend._id} 
              user={friend} 
              currentUserInstitute={myInstituteId} 
            />
          ))}
        </div>
      ) : (
        <div className="p-8 sm:p-12 bg-white rounded-[2rem] shadow-sm border border-gray-100 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <UsersRound size={32} className="text-gray-400 stroke-2" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-1">No friends to display</h3>
          <p className="text-gray-500 text-sm font-medium max-w-sm">
            This user hasn't added any connections yet.
          </p>
        </div>
      )}
    </div>
  );
};

export default ProfileFriendsTab;