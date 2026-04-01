import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Repeat, MoreHorizontal, Trash2, Edit2, X, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
// ✅ 1. Imported deleteSocialComment
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

  // ✅ 2. Handle deleting individual comments
  const handleDeleteComment = async (commentId) => {
    if (window.confirm("Are you sure you want to delete this comment?")) {
      try {
        await deleteSocialComment(post._id, commentId);
        // Remove it from the UI immediately
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
    <div className='bg-white rounded-xl shadow p-4 space-y-4 w-full'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <Link to={`/profile/${post.user._id}`} className='flex items-center gap-3 group'>
            <img 
              src={post.user.profilePicture || "https://ui-avatars.com/api/?name=User&background=EBF4FF&color=4F46E5"} 
              alt="user profile" 
              className='w-10 h-10 rounded-full shadow object-cover cursor-pointer transition-transform group-hover:scale-105' 
            />
            <div>
              <div className='flex items-center space-x-1'>
                <span className="font-bold cursor-pointer hover:underline">
                  {post.user.name || post.user.full_name || "Unknown User"}
                </span>
              </div>
              <div className='text-gray-500 text-sm'>
                @{post.user.username} · {timeAgo(post.createdAt)}
              </div>
            </div>
          </Link>
        </div>

        {isOwner && (
          <div className="relative" ref={menuRef}>
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-2 w-36 bg-white rounded-lg shadow-xl border border-gray-100 z-10 overflow-hidden">
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
            className='text-gray-800 text-sm whitespace-pre-wrap break-words'
            dangerouslySetInnerHTML={{ __html: postWithHashtags }} 
          />
        )
      )}

      {post.image_urls && post.image_urls.length > 0 && (
        <PostImageGrid images={post.image_urls} />
      )}

      <div className='flex items-center justify-between text-gray-500 pt-2'>
        <div className='flex items-center gap-6'>
          <button 
            onClick={handleLike}
            className={`flex items-center gap-1 cursor-pointer transition-colors hover:text-red-500 ${isLiked ? 'text-red-500' : ''}`} 
          >
            <Heart className={`w-5 h-5 ${isLiked ? 'fill-red-500' : ''}`} />
            <span>{likeCount}</span>
          </button>
          
          <button onClick={handleToggleComment} className='flex items-center gap-1 cursor-pointer hover:text-blue-500'>
            <MessageCircle className="w-5 h-5" /> 
            <span>{commentCount}</span>
          </button>
          
          <button className='flex items-center gap-1 cursor-pointer hover:text-green-500'>
            <Repeat className="w-5 h-5" /> 
            <span></span>
          </button>
        </div>
      </div>

      {isCommentOpen && (
        <div className="mt-3 pt-3 border-t border-gray-200 space-y-3">
          {/* ORIGINAL SIZED INPUT FORM */}
          <form onSubmit={handlePostComment} className="flex items-center gap-2">
            <img 
              src={currentUser?.profilePicture || "https://ui-avatars.com/api/?name=User&background=EBF4FF&color=4F46E5"} 
              alt="Your profile" 
              className="w-8 h-8 rounded-full object-cover" 
            />
            <input 
              type="text"
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              disabled={isSubmittingComment}
              className="flex-1 w-full rounded-full bg-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
            />
            <button 
              type="submit"
              disabled={isSubmittingComment || !newComment.trim()}
              className="rounded-full bg-blue-500 text-white px-4 py-2 text-sm font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              Post
            </button>
          </form>

          {/* TWO-COMMENT SCROLLABLE LIST */}
          {/* 👇 max-h-36 is the magic class here (roughly 144px, height of ~2 comments) */}
          <div className="space-y-3 max-h-36 overflow-y-auto pr-1"> 
            {comments.length > 0 ? (
              comments.map((comment) => {
                const canDelete = currentUser && (currentUser._id === comment.user._id || currentUser._id === post.user._id);

                return (
                  <div key={comment._id} className="flex items-start gap-2">
                    <Link to={`/profile/${comment.user._id}`}>
                      <img 
                        src={comment.user.profilePicture || "https://ui-avatars.com/api/?name=User&background=EBF4FF&color=4F46E5"} 
                        alt={comment.user.username} 
                        className="w-8 h-8 rounded-full object-cover" 
                      />
                    </Link>
                    
                    <div className="flex-1 bg-gray-100 rounded-lg px-3 py-2"> 
                      <div className="flex items-center justify-between">
                        <Link to={`/profile/${comment.user._id}`}>
                          <span className="font-semibold text-sm hover:underline"> 
                            {comment.user.name || comment.user.full_name || "Unknown User"}
                          </span>
                        </Link>
                        
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500"> 
                            {timeAgo(comment.createdAt)}
                          </span>
                          
                          {canDelete && (
                            <button 
                              onClick={() => handleDeleteComment(comment._id)}
                              className="text-gray-400 hover:text-red-500 transition-colors"
                              aria-label="Delete comment"
                            >
                              <Trash2 size={15} /> 
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-800 break-words">{comment.content}</p> 
                    </div>
                  </div>
                );
              })
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