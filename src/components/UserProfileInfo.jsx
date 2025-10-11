// src/components/UserProfileInfo.jsx
import React from 'react';
import moment from 'moment'; 
import { Calendar, PenBox, Verified, MapPin } from 'lucide-react'; 
// 🛑 IMPORT dummyCurrentUser to compare IDs
import { dummyCurrentUser } from '../assets/data.js';

const UserProfileInfo = ({user, posts, profileId, setShowEdit}) => {
  // Determine if the profile being viewed is NOT the current user's profile.
  const isViewingGuestProfile = !!profileId && profileId !== dummyCurrentUser._id; 

  return (
    <div className='relative py-4 px-6 md:px-8 bg-white pt-20'> 
      <div className='flex flex-col md:flex-row md:items-start gap-6'>
        
        {/* AVATAR SECTION */}
        <div className='w-32 h-32 border-4 border-white shadow-lg absolute -top-16 rounded-full ml-6 md:ml-8'>
          <img src={user.profilePicture} alt="profile" className='w-full h-full object-cover rounded-full z-20' />
        </div>
        
        {/* CONTENT SECTION */}
        <div className='w-full pt-4 md:pt-0 md:pl-36'> 
          <div className='flex flex-col md:flex-row md:items-start justify-between'>
            
            {/* User Names */}
            <div>
              <div className='flex items-center gap-3'>
                <h1 className='text-2xl font-extrabold text-gray-900'>{user.full_name}</h1>
                <Verified className='w-6 h-6 text-blue-500' />
              </div>
              <p className='text-gray-500 text-base'>{user.username ? `@${user.username}`:'Add a username'}</p>
            </div>
            
            {/* Action Button: Edit or Follow/Message */}
            {!isViewingGuestProfile ? (
                // If viewing own profile, show Edit button
                <button 
                    onClick={() => setShowEdit(true)} 
                    className='flex items-center gap-2 border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg font-medium transition-colors mt-4 md:mt-0 cursor-pointer'
                >
                    <PenBox className='w-4 h-4'/>
                    Edit Profile
                </button>
            ) : (
                // If viewing a guest profile, show interaction buttons (Mocked)
                <div className='flex items-center gap-2 mt-4 md:mt-0'>
                    <button className='border border-indigo-500 text-indigo-500 hover:bg-indigo-50 px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer'>
                        Message
                    </button>
                    <button className='bg-indigo-500 text-white hover:bg-indigo-600 px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer'>
                        Follow
                    </button>
                </div>
            )}
          </div>
          
          {/* Bio */}
          <p className='text-gray-700 text-sm max-w-md mt-4'>{user.bio}</p>
          
          {/* Details (Location/Join Date) */}
          <div className='flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500 mt-4'>
            <span className='flex items-center gap-1.5'>
              <MapPin className='w-4 h-4'/>
              {user.location ? user.location : 'Add location'}
            </span>
            <span className='flex items-center gap-1.5'>
              <Calendar className='w-4 h-4'/>
              Joined <span className='font-medium'>{moment(user.createdAt).format('MMM YYYY')}</span>
            </span>
          </div>
          
          {/* Stats */}
          <div className='flex items-center gap-6 mt-4 border-t border-gray-200 pt-4'>
            <div>
              <span className='sm:text-xl font-bold text-gray-900'>{posts?.length || 0}</span>
              <span className='text-xs sm:text-sm text-gray-500 ml-1.5'>Posts</span>
            </div>
            <div>
              <span className='sm:text-xl font-bold text-gray-900'>{user.followers?.length || 0}</span>
              <span className='text-xs sm:text-sm text-gray-500 ml-1.5'>Followers</span>
            </div>
            <div>
              <span className='sm:text-xl font-bold text-gray-900'>{user.following?.length || 0}</span>
              <span className='text-xs sm:text-sm text-gray-500 ml-1.5'>Following</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserProfileInfo;