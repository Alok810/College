import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Repeat } from 'lucide-react';
import { dummyCurrentUser } from '../assets/data.js';

// --- Helper function (no changes) ---
const timeAgo = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + "y ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + "m ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + "d ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + "h ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + "min ago";
  if (seconds < 10) return "just now";
  return Math.floor(seconds) + "s ago";
};

// ✅ 1. NEW: A dedicated component for the image grid
const PostImageGrid = ({ images }) => {
  const count = images.length;
  // Use a subtle border
  const borderClass = "border border-gray-100"; 

  if (count === 1) {
    return (
      <div className="mt-2">
        <img src={images[0]} alt="post content 1" className={`w-full h-auto max-h-[500px] object-cover rounded-lg ${borderClass}`} />
      </div>
    );
  }

  if (count === 2) {
    return (
      <div className={`mt-2 grid grid-cols-2 gap-1 rounded-lg overflow-hidden ${borderClass}`}>
        <img src={images[0]} alt="post content 1" className="aspect-square w-full h-full object-cover" />
        <img src={images[1]} alt="post content 2" className="aspect-square w-full h-full object-cover" />
      </div>
    );
  }

  if (count === 3) {
    return (
      <div className={`mt-2 grid grid-cols-2 grid-rows-2 gap-1 h-96 rounded-lg overflow-hidden ${borderClass}`}>
        <div className="row-span-2">
          <img src={images[0]} alt="post content 1" className="w-full h-full object-cover" />
        </div>
        <div className="col-start-2 row-start-1">
          <img src={images[1]} alt="post content 2" className="w-full h-full object-cover" />
        </div>
        <div className="col-start-2 row-start-2">
          <img src={images[2]} alt="post content 3" className="w-full h-full object-cover" />
        </div>
      </div>
    );
  }

  // 4 or more photos
  const remaining = count - 4;
  return (
    <div className={`mt-2 grid grid-cols-2 grid-rows-2 gap-1 h-96 rounded-lg overflow-hidden ${borderClass}`}>
      <img src={images[0]} alt="post content 1" className="w-full h-full object-cover" />
      <img src={images[1]} alt="post content 2" className="w-full h-full object-cover" />
      <img src={images[2]} alt="post content 3" className="w-full h-full object-cover" />
      <div className="relative">
        <img src={images[3]} alt="post content 4" className="w-full h-full object-cover" />
        {remaining > 0 && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-white text-3xl font-bold">+{remaining}</span>
          </div>
        )}
      </div>
    </div>
  );
};

// --- PostCard Component ---
const PostCard = ({ post }) => {
  const currentUser = dummyCurrentUser;
  const [isLiked, setIsLiked] = useState(post.likes.includes(currentUser._id));
  const [likeCount, setLikeCount] = useState(post.likes.length);

  const [isCommentOpen, setIsCommentOpen] = useState(false);
  const [comments, setComments] = useState(post.comments || []);
  const [commentCount, setCommentCount] = useState(post.comments?.length || 0);
  const [newComment, setNewComment] = useState("");

  const handleLike = () => {
    if (isLiked) {
      setLikeCount(likeCount - 1);
    } else {
      setLikeCount(likeCount + 1);
    }
    setIsLiked(!isLiked);
  };

  const handleToggleComment = () => {
    setIsCommentOpen(!isCommentOpen);
  };
  
  const handlePostComment = (e) => {
    e.preventDefault();
    if (newComment.trim() === "") return;

    const commentToAdd = {
      _id: `comment_${Date.now()}_${Math.random()}`,
      user: currentUser,
      content: newComment,
      createdAt: new Date().toISOString(),
    };

    setComments([commentToAdd, ...comments]);
    setCommentCount(prevCount => prevCount + 1);
    setNewComment("");
  };

  const postWithHashtags = post.content.replace(
    /#(\w+)/g,
    '<span class="text-blue-500 cursor-pointer hover:underline">#$1</span>'
  );

  return (
    <div className='bg-white rounded-xl shadow p-4 space-y-4 w-full'>
      {/* --- User Header --- */}
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
            <div className='text-gray-500 text-sm'>
              @{post.user.username} · {timeAgo(post.createdAt)}
            </div>
          </div>
        </Link>
      </div>

      {/* --- Post Content --- */}
      {post.content && (
        // ✅ 2. FIX: Added 'break-words' to fix text overflow
        <div 
          className='text-gray-800 text-sm whitespace-pre-wrap break-words'
          dangerouslySetInnerHTML={{ __html: postWithHashtags }} 
        />
      )}

      {/* ✅ 3. FIX: Use the new PostImageGrid component */}
      {post.image_urls && post.image_urls.length > 0 && (
        <PostImageGrid images={post.image_urls} />
      )}

      {/* --- Action Buttons --- */}
      <div className='flex items-center justify-between text-gray-500 pt-2'>
        <div className='flex items-center gap-6'>
          <div className='flex items-center gap-1 cursor-pointer hover:text-red-500' onClick={handleLike}>
            <Heart 
              className={`w-5 h-5 transition-colors ${isLiked ? 'text-red-500 fill-red-500' : ''}`} 
            />
            <span>{likeCount}</span>
          </div>
          <div className='flex items-center gap-1 cursor-pointer hover:text-blue-500' onClick={handleToggleComment}>
            <MessageCircle className="w-5 h-5" /> 
            <span>{commentCount}</span>
          </div>
          <div className='flex items-center gap-1 cursor-pointer hover:text-green-500'>
            <Repeat className="w-5 h-5" /> 
            <span></span>
          </div>
        </div>
      </div>

      {/* --- Comment Section --- */}
      {isCommentOpen && (
        <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
          <form onSubmit={handlePostComment} className="flex items-center gap-2">
            <img 
              src={currentUser.profilePicture} 
              alt="Your profile" 
              className="w-8 h-8 rounded-full"
            />
            <input 
              type="text"
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="flex-1 w-full rounded-full bg-gray-100 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button 
              type="submit"
              className="rounded-full bg-blue-500 text-white px-4 py-2 text-sm font-semibold hover:bg-blue-600 transition-colors"
            >
              Post
            </button>
          </form>

          <div className="space-y-3 max-h-60 overflow-y-auto">
            {comments.length > 0 ? (
              comments.map((comment) => (
                <div key={comment._id} className="flex items-start gap-2">
                  <Link to={`/profile/${comment.user._id}`}>
                    <img 
                      src={comment.user.profilePicture} 
                      alt={comment.user.username} 
                      className="w-8 h-8 rounded-full" 
                    />
                  </Link>
                  <div className="flex-1 bg-gray-100 rounded-lg px-3 py-2">
                    <div className="flex items-center justify-between">
                      <Link to={`/profile/${comment.user._id}`}>
                        <span className="font-bold text-sm hover:underline">{comment.user.full_name}</span>
                      </Link>
                      <span className="text-xs text-gray-500">
                        {timeAgo(comment.createdAt)}
                      </span>
                    </div>
                    {/* ✅ 4. FIX: Added 'break-words' to comments too */}
                    <p className="text-sm text-gray-800 break-words">{comment.content}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm text-center py-2">No comments yet.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCard;