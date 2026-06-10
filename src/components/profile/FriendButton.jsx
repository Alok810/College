import React from 'react';
import { UserCheck, Clock, UserPlus } from 'lucide-react';

export default function FriendButton({ status, onAdd, onCancel, onAccept, onUnfriend }) {
  switch (status) {
    case "friends":
      return (
        <button
          onClick={onUnfriend}
          className="flex-1 flex justify-center items-center gap-1.5 py-2 sm:py-2.5 text-sm font-semibold bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition shadow-sm"
        >
          <UserCheck className="w-4 h-4" /> Friends
        </button>
      );
    case "request_sent":
      return (
        <button
          onClick={onCancel}
          className="flex-1 flex justify-center items-center gap-1.5 py-2 sm:py-2.5 text-sm font-semibold bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition shadow-sm"
        >
          <Clock className="w-4 h-4" /> Requested
        </button>
      );
    case "request_received":
      return (
        <button
          onClick={onAccept}
          className="flex-1 flex justify-center items-center gap-1.5 py-2 sm:py-2.5 text-sm font-semibold bg-green-600 text-white rounded-xl hover:bg-green-700 transition shadow-sm"
        >
          <UserPlus className="w-4 h-4" /> Accept
        </button>
      );
    case "not_friends":
    default:
      return (
        <button
          onClick={onAdd}
          className="flex-1 flex justify-center items-center gap-1.5 py-2 sm:py-2.5 text-sm font-semibold bg-gradient-to-r from-purple-600 to-teal-500 text-white rounded-xl hover:opacity-90 transition shadow-sm"
        >
          <UserPlus className="w-4 h-4" /> Add Friend
        </button>
      );
  }
}