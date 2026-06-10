import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Globe, User as UserIcon, Briefcase, GraduationCap, Heart, MessageSquare } from 'lucide-react';
import FriendButton from './FriendButton';

export const getAvatar = (usr) => {
  if (!usr) return `https://ui-avatars.com/api/?name=User&background=EBF4FF&color=4F46E5&size=150`;
  return usr.profilePicture || `https://ui-avatars.com/api/?name=${usr.name || usr.full_name || 'User'}&background=EBF4FF&color=4F46E5&size=150`;
};

// Shared Info Row for both Mobile and Desktop
const InfoRow = ({ Icon, text, link, linkText }) => {
  if (!text || String(text).includes("undefined") || String(text).includes("null")) return null;
  return (
    <div className="flex items-center text-sm text-gray-700">
      {Icon && <Icon className="w-4 h-4 mr-3 text-gray-500 flex-shrink-0" />}
      {link ? (
        <a href={link} target="_blank" rel="noopener noreferrer" className="hover:text-purple-600 truncate font-medium text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-teal-500">
          {linkText || text}
        </a>
      ) : (
        <span className="font-medium text-gray-600">{String(text)}</span>
      )}
    </div>
  );
};

export const DesktopProfileSidebar = ({ user, isCurrentUser, friendshipStatus, onFriendAction }) => {
  const scrollbarHideStyle = { msOverflowStyle: "none", scrollbarWidth: "none" };

  return (
    <div className="w-full bg-white rounded-xl shadow-lg h-fit max-h-full overflow-y-scroll relative border border-gray-50 pb-4 custom-scrollbar" style={scrollbarHideStyle}>
      <div className="relative h-28 bg-gray-200 overflow-hidden rounded-t-xl">
        <img src={user.coverPhoto || "https://images.unsplash.com/photo-1707343843437-caacff5cfa74"} alt={`Cover`} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
      </div>
      <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border-4 border-white shadow-xl absolute left-1/2 -translate-x-1/2 top-16 z-10 bg-white">
        <img src={getAvatar(user)} alt={`Profile`} className="w-full h-full object-cover" />
      </div>
      <div className="p-4 pt-14">
        <div className="text-center pb-4 mb-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-1">{user.full_name || user.name}</h2>
          <p className="text-gray-500 text-xs my-0 px-2 leading-snug">{user.bio || "Hello! I am using Rigya."}</p>
          <div className="mt-0 flex justify-center gap-3">
            {!isCurrentUser ? (
              <div className="flex gap-2 mt-4 px-2 w-full flex-wrap">
                <FriendButton status={friendshipStatus} onAdd={() => onFriendAction("add")} onCancel={() => onFriendAction("cancel")} onAccept={() => onFriendAction("accept")} onUnfriend={() => onFriendAction("unfriend")} />
                <Link to={`/?open_chat=${user._id}`} className="flex-1 flex justify-center items-center gap-1.5 py-2 text-xs font-semibold bg-gray-100 text-gray-800 rounded-xl hover:bg-gray-200 transition shadow-sm">
                  <MessageSquare className="w-4 h-4" /> Message
                </Link>
              </div>
            ) : (
              <div className="h-4"></div>
            )}
          </div>
          <div className="mt-2 space-y-3 text-left pt-4 px-1">
            <InfoRow Icon={UserIcon} text={user.pronouns ? `Pronouns: ${user.pronouns}` : null} />
            <InfoRow Icon={Briefcase} text={user.work ? `Works at ${user.work}` : null} />
            <InfoRow Icon={GraduationCap} text={user.university ? `Studied at ${user.university}` : null} />
            <InfoRow Icon={MapPin} text={user.currentCity ? `Lives in ${user.currentCity}` : null} />
            {user.socialLink && <InfoRow Icon={Globe} text={user.socialLink} link={`https://instagram.com/${user.socialLink}`} linkText={`@${user.socialLink}`} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export const MobileProfileSidebar = ({ user, isCurrentUser, friendshipStatus, onFriendAction }) => {
  return (
    // 🟢 THE FIX: Removed 'mx-3' and added 'w-full overflow-hidden' so it perfectly matches the posts
    <div className="bg-white relative pb-6 shadow-sm border border-gray-100 rounded-2xl mt-4 w-full overflow-hidden">
      <div className="relative h-40 bg-gray-200 w-full">
        <img src={user.coverPhoto || "https://images.unsplash.com/photo-1707343843437-caacff5cfa74"} alt={`Cover`} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
      </div>
      <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-white shadow-xl absolute left-1/2 -translate-x-1/2 top-20 z-10 bg-white">
        <img src={getAvatar(user)} alt={`Profile`} className="w-full h-full object-cover" />
      </div>
      <div className="p-4 pt-16">
        <div className="text-center pb-4 mb-2">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-1">{user.full_name || user.name}</h2>
          <p className="text-gray-500 text-sm my-0 px-4 leading-relaxed">{user.bio || "Hello! I am using Rigya."}</p>
          {!isCurrentUser && (
            <div className="flex gap-3 mt-6 px-4 w-full">
              <FriendButton status={friendshipStatus} onAdd={() => onFriendAction("add")} onCancel={() => onFriendAction("cancel")} onAccept={() => onFriendAction("accept")} onUnfriend={() => onFriendAction("unfriend")} />
              <Link to={`/?open_chat=${user._id}`} className="flex-1 flex justify-center items-center gap-1.5 py-2.5 text-sm font-bold bg-gray-100 text-gray-800 rounded-xl hover:bg-gray-200 transition-all shadow-sm">
                <MessageSquare className="w-4 h-4" /> Message
              </Link>
            </div>
          )}
        </div>
        <div className="space-y-3.5 text-left pt-4 px-5 bg-gray-50/50 mx-2 rounded-2xl border border-gray-100 py-4">
          <InfoRow Icon={UserIcon} text={user.pronouns ? `Pronouns: ${user.pronouns}` : null} />
          <InfoRow Icon={Briefcase} text={user.work ? `Works at ${user.work}` : null} />
          <InfoRow Icon={GraduationCap} text={user.university ? `Studied at ${user.university}` : null} />
          <InfoRow Icon={GraduationCap} text={user.highSchool ? `Went to ${user.highSchool}` : null} />
          <InfoRow Icon={MapPin} text={user.currentCity ? `Lives in ${user.currentCity}` : null} />
          <InfoRow Icon={MapPin} text={user.hometown ? `From ${user.hometown}` : null} />
          <InfoRow Icon={Heart} text={user.relationship && user.relationship !== "Not specified" ? user.relationship : null} />
          {user.socialLink && <InfoRow Icon={Globe} text={user.socialLink} link={`https://instagram.com/${user.socialLink}`} linkText={`@${user.socialLink}`} />}
        </div>
      </div>
    </div>
  );
};