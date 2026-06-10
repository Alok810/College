import React from 'react';
import PostCard from '../PostCard';
import ProfileResults from './ProfileResults';
import ResumeTab from '../ResumeTab';
import ProfileFriendsTab from './ProfileFriendsTab';
import MediaGallery from './MediaGallery';

export default function ProfileMainContent({ user, posts, activeTab, friendsList, isCurrentUser, instituteLogo, resumeViewMode, setResumeViewMode, friendshipStatus }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center gap-4 w-full">
        {activeTab === "posts" && (
          <>
            {posts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
            {posts.length === 0 && (
              <div className="p-10 rounded-xl text-center text-gray-500 w-full bg-white shadow-md border border-gray-100">
                <p>No posts yet for {user.full_name || user.name}.</p>
              </div>
            )}
          </>
        )}
        
        {activeTab === "media" && <MediaGallery posts={posts} />}
        
        {activeTab === 'friends' && (
          <ProfileFriendsTab friendsArray={friendsList} />
        )}

        {activeTab === "results" && (
          <ProfileResults
            userId={user._id}
            isCurrentUser={isCurrentUser}
            instituteLogo={instituteLogo}
            isFriend={friendshipStatus === 'friends'}
          />
        )}

        {activeTab === "resume" && (
          <ResumeTab
            user={user}
            isCurrentUser={isCurrentUser}
            viewMode={resumeViewMode}
            setViewMode={setResumeViewMode}
          />
        )}
      </div>
    </div>
  );
}