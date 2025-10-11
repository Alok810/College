// src/components/PostCard.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Repeat } from 'lucide-react';
import { dummyCurrentUser } from '../assets/data.js';
import moment from 'moment'; // 🛑 ADDED moment import

const PostCard = ({ post }) => {
// ... (state setup remains the same)

  const currentUser = dummyCurrentUser;
  const [isLiked, setIsLiked] = useState(post.likes.includes(currentUser._id));
  const [likeCount, setLikeCount] = useState(post.likes.length);

  const handleLike = () => {
    if (isLiked) {
      setLikeCount(likeCount - 1);
    } else {
      setLikeCount(likeCount + 1);
    }
    setIsLiked(!isLiked);
  };

  const postWithHashtags = post.content.replace(
    /#(\w+)/g,
    '<span class="text-blue-500 cursor-pointer hover:underline">#$1</span>'
  );

  return (
    <div className='bg-white rounded-xl shadow p-4 space-y-4 w-full'>
      <div className='flex items-center gap-3'>
        <Link to={`/profile/${post.user._id}`} className='flex items-center gap-3 group'>
          <img 
            src={post.user.profilePicture} 
            alt="user profile" 
            className='w-10 h-10 rounded-full shadow cursor-pointer transition-transform group-hover:scale-105' 
          />
          <div>
            <div className='flex items-center space-x-1'>
              <span className="font-bold cursor-pointer hover:underline">{post.user.full_name}</span>
            </div>
            {/* 🛑 FIX: Use moment().fromNow() to convert the Date object to a string */}
            <div className='text-gray-500 text-sm'>
              @{post.user.username} · {moment(post.createdAt).fromNow()}
            </div>
          </div>
        </Link>
      </div>

      {/* ... (rest of the component remains the same) */}

      {post.content && (
        <div 
          className='text-gray-800 text-sm whitespace-pre-wrap'
          dangerouslySetInnerHTML={{ __html: postWithHashtags }} 
        />
      )}

      {post.image_urls && post.image_urls.length > 0 && (
        <div className={`grid gap-2 ${post.image_urls.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
          {post.image_urls.map((url, index) => (
            <img 
              src={url} 
              key={index} 
              className={`w-full h-auto object-cover rounded-lg ${post.image_urls.length === 1 && 'col-span-2'}`}
              alt={`post content ${index + 1}`}
            />
          ))}
        </div>
      )}

      <div className='flex items-center justify-between text-gray-500 pt-2'>
        <div className='flex items-center gap-6'>
          <div className='flex items-center gap-1 cursor-pointer hover:text-red-500' onClick={handleLike}>
            <Heart 
              className={`w-5 h-5 transition-colors ${isLiked ? 'text-red-500 fill-red-500' : ''}`} 
            />
            <span>{likeCount}</span>
          </div>
          <div className='flex items-center gap-1 cursor-pointer hover:text-blue-500'>
            <MessageCircle className="w-5 h-5" /> 
            <span></span>
          </div>
          <div className='flex items-center gap-1 cursor-pointer hover:text-green-500'>
            <Repeat className="w-5 h-5" /> 
            <span></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostCard;