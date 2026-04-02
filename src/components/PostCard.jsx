import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Repeat, MoreHorizontal, Trash2, Edit2, X, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { togglePostLike, addPostComment, deleteSocialPost, updateSocialPost, deleteSocialComment } from '../api'; 

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

const PostImageGrid = ({ images }) => {
  const count = images.length;
  const borderClass = "border border-gray-100"; 

  // ✅ Responsive Image Heights: max-h-[300px] on phones, max-h-[500px] on laptops
  if (count === 1) {
    return (
      <div className="mt-2">
        <img src={images[0]} alt="post content" className={`w-full h-auto max-h-[300px] md:max-h-[500px] object-cover rounded-lg ${borderClass}`} />
      </div>
    );
  }
  if (count === 2) {
    return (
      <div className={`mt-2 grid grid-cols-2 gap-1 rounded-lg overflow-hidden h-48 sm:h-64 md:h-auto ${borderClass}`}>
        <img src={images[0]} alt="post content 1" className="aspect-square w-full h-full object-cover" />
        <img src={images[1]} alt="post content 2" className="aspect-square w-full h-full object-cover" />
      </div>
    );
  }
  if (count === 3) {
    return (
      // ✅ Changed fixed h-96 to h-64 on mobile, scaling up to h-96 on md: screens
      <div className={`mt-2 grid grid-cols-2 grid-rows-2 gap-1 h-64 sm:h-80 md:h-96 rounded-lg overflow-hidden ${borderClass}`}>
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
  const remaining = count - 4;
  return (
    // ✅ Changed fixed h-96 to h-64 on mobile, scaling up to h-96 on md: screens
    <div className={`mt-2 grid grid-cols-2 grid-rows-2 gap-1 h-64 sm:h-80 md:h-96 rounded-lg overflow-hidden ${borderClass}`}>
      <img src={images[0]} alt="post content 1" className="w-full h-full object-cover" />
      <img src={images[1]} alt="post content 2" className="w-full h-full object-cover" />
      <img src={images[2]} alt="post content 3" className="w-full h-full object-cover" />
      <div className="relative">
        <img src={images[3]} alt="post content 4" className="w-full h-full object-cover" />
        {remaining > 0 && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-white text-2xl md:text-3xl font-bold">+{remaining}</span>
          </div>
        )}
      </div>
    </div>
  );
};

const PostCard = ({ post }) => {
  const { authData: currentUser } = useAuth();
  const userId = currentUser?._id;

  const isOwner = currentUser && post.user && currentUser._id === post.user._id;

  const initialIsLiked = post.likes ? post.likes.includes(userId) : false;
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likeCount, setLikeCount] = useState(post.likes ? post.likes.length : 0);

  const [isCommentOpen, setIsCommentOpen] = useState(false);
  const [comments, setComments] = useState(post.comments || []);
  const [commentCount, setCommentCount] = useState(post.comments?.length || 0);
  const [newComment, setNewComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const [isDeleted, setIsDeleted] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [postContent, setPostContent] = useState(post.content || "");
  const [editContent, setEditContent] = useState(post.content || "");
  
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLike = async () => {
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
    try {
      await togglePostLike(post._id);
    } catch (error) {
      console.error("Failed to toggle like:", error);
      setIsLiked(isLiked);
      setLikeCount(likeCount);
    }
  };

  const handleToggleComment = () => setIsCommentOpen(!isCommentOpen);
  
  const handlePostComment = async (e) => {
    e.preventDefault();
    if (newComment.trim() === "" || !currentUser) return;
    setIsSubmittingComment(true);

    try {
      await addPostComment(post._id, newComment);
      const commentToAdd = {
        _id: `temp_${Date.now()}`,
        user: {
          _id: currentUser._id,
          name: currentUser.name || currentUser.full_name,
          username: currentUser.username,
          profilePicture: currentUser.profilePicture
        },
        content: newComment,
        createdAt: new Date().toISOString(),
      };
      setComments([commentToAdd, ...comments]);
      setCommentCount(prevCount => prevCount + 1);
      setNewComment("");
    } catch (error) {
      console.error("Failed to post comment:", error);
      alert("Failed to post comment.");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm("Are you sure you want to delete this post?");
    if (!confirmDelete) return;

    try {
      await deleteSocialPost(post._id);
      setIsDeleted(true); 
    } catch (error) {
      console.error("Failed to delete:", error);
      alert("Failed to delete post.");
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (window.confirm("Are you sure you want to delete this comment?")) {
      try {
        await deleteSocialComment(post._id, commentId);
        setComments(prev => prev.filter(c => c._id !== commentId));
        setCommentCount(prev => prev - 1);
      } catch (error) {
        console.error("Failed to delete comment:", error);
        alert(error.message);
      }
    }
  };

  const handleSaveEdit = async () => {
    if (editContent.trim() === "") return alert("Post cannot be empty.");
    
    try {
      await updateSocialPost(post._id, editContent);
      setPostContent(editContent); 
      setIsEditing(false); 
    } catch (error) {
      console.error("Failed to edit:", error);
      alert("Failed to update post.");
    }
  };

  const postWithHashtags = postContent
    ? postContent.replace(/#(\w+)/g, '<span class="text-blue-500 cursor-pointer hover:underline">#$1</span>')
    : "";

  if (isDeleted) return null;

  return (
    // ✅ Reduced padding on mobile (p-3 md:p-4)
    <div className='bg-white rounded-xl shadow p-3 md:p-4 space-y-3 md:space-y-4 w-full border border-gray-100/50'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2 md:gap-3 flex-1 min-w-0'>
          <Link to={`/profile/${post.user._id}`} className='flex items-center gap-2 md:gap-3 group flex-1 min-w-0'>
            <img 
              src={post.user.profilePicture || "https://ui-avatars.com/api/?name=User&background=EBF4FF&color=4F46E5"} 
              alt="user profile" 
              className='w-9 h-9 md:w-10 md:h-10 rounded-full shadow object-cover cursor-pointer transition-transform group-hover:scale-105 shrink-0' 
            />
            <div className='flex flex-col min-w-0 flex-1'>
              <div className='flex items-center space-x-1'>
                {/* ✅ Added truncate to prevent long names from pushing the 3-dot menu off screen */}
                <span className="font-bold cursor-pointer hover:underline text-sm md:text-base truncate block max-w-full">
                  {post.user.name || post.user.full_name || "Unknown User"}
                </span>
              </div>
              <div className='text-gray-500 text-xs md:text-sm truncate'>
                @{post.user.username} · {timeAgo(post.createdAt)}
              </div>
            </div>
          </Link>
        </div>

        {isOwner && (
          <div className="relative shrink-0 ml-2" ref={menuRef}>
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 md:p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-1 w-36 bg-white rounded-lg shadow-xl border border-gray-100 z-10 overflow-hidden">
                <button 
                  onClick={() => { setIsEditing(true); setShowMenu(false); }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Edit2 className="w-4 h-4" /> Edit
                </button>
                <button 
                  onClick={handleDelete}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-3">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 min-h-[100px] text-sm resize-y"
          />
          <div className="flex justify-end gap-2">
            <button 
              onClick={() => { setIsEditing(false); setEditContent(postContent); }}
              className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
            >
              <X className="w-4 h-4" /> Cancel
            </button>
            <button 
              onClick={handleSaveEdit}
              className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-md transition-colors"
            >
              <Check className="w-4 h-4" /> Save
            </button>
          </div>
        </div>
      ) : (
        postContent && (
          <div 
            className='text-gray-800 text-sm md:text-base whitespace-pre-wrap break-words'
            dangerouslySetInnerHTML={{ __html: postWithHashtags }} 
          />
        )
      )}

      {post.image_urls && post.image_urls.length > 0 && (
        <PostImageGrid images={post.image_urls} />
      )}

      <div className='flex items-center justify-between text-gray-500 pt-1'>
        <div className='flex items-center gap-6'>
          <button 
            onClick={handleLike}
            className={`flex items-center gap-1.5 cursor-pointer transition-colors hover:text-red-500 ${isLiked ? 'text-red-500' : ''}`} 
          >
            <Heart className={`w-5 h-5 ${isLiked ? 'fill-red-500' : ''}`} />
            <span className="text-sm">{likeCount}</span>
          </button>
          
          <button onClick={handleToggleComment} className='flex items-center gap-1.5 cursor-pointer hover:text-blue-500 transition-colors'>
            <MessageCircle className="w-5 h-5" /> 
            <span className="text-sm">{commentCount}</span>
          </button>
          
          <button className='flex items-center gap-1.5 cursor-pointer hover:text-green-500 transition-colors'>
            <Repeat className="w-5 h-5" /> 
          </button>
        </div>
      </div>

      {isCommentOpen && (
        <div className="mt-2 pt-3 border-t border-gray-100 space-y-3">
          <form onSubmit={handlePostComment} className="flex items-center gap-2">
            <img 
              src={currentUser?.profilePicture || "https://ui-avatars.com/api/?name=User&background=EBF4FF&color=4F46E5"} 
              alt="Your profile" 
              className="w-8 h-8 rounded-full object-cover shrink-0" 
            />
            <input 
              type="text"
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              disabled={isSubmittingComment}
              className="flex-1 min-w-0 rounded-full bg-gray-50 border border-gray-200 px-3 md:px-4 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
            />
            <button 
              type="submit"
              disabled={isSubmittingComment || !newComment.trim()}
              className="shrink-0 rounded-full bg-blue-500 text-white px-3 md:px-4 py-1.5 text-sm font-medium hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              Post
            </button>
          </form>

          <div className="space-y-3 max-h-48 overflow-y-auto pr-1 custom-scrollbar"> 
            {comments.length > 0 ? (
              comments.map((comment) => {
                const canDelete = currentUser && (currentUser._id === comment.user._id || currentUser._id === post.user._id);

                return (
                  <div key={comment._id} className="flex items-start gap-2">
                    <Link to={`/profile/${comment.user._id}`} className="shrink-0">
                      <img 
                        src={comment.user.profilePicture || "https://ui-avatars.com/api/?name=User&background=EBF4FF&color=4F46E5"} 
                        alt={comment.user.username} 
                        className="w-7 h-7 md:w-8 md:h-8 rounded-full object-cover" 
                      />
                    </Link>
                    
                    <div className="flex-1 bg-gray-50 rounded-2xl rounded-tl-sm px-3 py-2 border border-gray-100"> 
                      <div className="flex items-center justify-between gap-2">
                        <Link to={`/profile/${comment.user._id}`} className="min-w-0">
                          <span className="font-semibold text-xs md:text-sm hover:underline truncate block"> 
                            {comment.user.name || comment.user.full_name || "Unknown User"}
                          </span>
                        </Link>
                        
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[10px] md:text-xs text-gray-500"> 
                            {timeAgo(comment.createdAt)}
                          </span>
                          
                          {canDelete && (
                            <button 
                              onClick={() => handleDeleteComment(comment._id)}
                              className="text-gray-400 hover:text-red-500 transition-colors"
                              aria-label="Delete comment"
                            >
                              <Trash2 size={14} /> 
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-xs md:text-sm text-gray-800 break-words mt-0.5">{comment.content}</p> 
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500 text-xs text-center py-2">No comments yet.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCard;