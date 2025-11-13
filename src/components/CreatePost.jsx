import React, { useState, useRef, useEffect } from 'react';
import { User, Image, Smile, X, Send } from 'lucide-react';
import { dummyCurrentUser } from '../assets/data.js';
import EmojiPicker from 'emoji-picker-react'; // <-- 1. IMPORT THE PICKER

const CreatePost = ({ onPostCreated }) => {
  const [postContent, setPostContent] = useState('');
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [isPosting, setIsPosting] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false); // <-- 2. ADD STATE FOR PICKER
  const [cursorPosition, setCursorPosition] = useState(null); // <-- 3. ADD STATE FOR CURSOR

  const imageInputRef = useRef(null);
  const textareaRef = useRef(null);
  const emojiPickerRef = useRef(null); // <-- 4. ADD REF FOR CLICK-OUTSIDE

  const MAX_CHARS = 280;
  const charsLeft = MAX_CHARS - postContent.length;

  // --- 5. EFFECT TO MANAGE CURSOR POSITION ---
  // This makes sure the cursor stays where you inserted the emoji
  useEffect(() => {
    if (textareaRef.current && cursorPosition !== null) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(cursorPosition, cursorPosition);
      setCursorPosition(null); // Reset after applying
    }
  }, [postContent, cursorPosition]);

  // --- 6. EFFECT TO HANDLE CLICKING OUTSIDE THE PICKER ---
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [emojiPickerRef]);


  const handleTextChange = (e) => {
    setPostContent(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  const handleImageSelect = (e) => {
    const newFiles = Array.from(e.target.files);
    if (newFiles.length === 0) return;

    const newImageFiles = [...imageFiles];
    const newImagePreviews = [...imagePreviews];

    newFiles.forEach(file => {
      newImageFiles.push(file);
      newImagePreviews.push(URL.createObjectURL(file));
    });

    setImageFiles(newImageFiles);
    setImagePreviews(newImagePreviews);

    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  };

  const clearAllImages = () => {
    setImageFiles([]);
    setImagePreviews([]);
    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  };

  const removeImage = (indexToRemove) => {
    setImageFiles(prev => prev.filter((_, i) => i !== indexToRemove));
    setImagePreviews(prev => prev.filter((_, i) => i !== indexToRemove));
  };

  // --- 7. HANDLER FOR WHEN AN EMOJI IS CLICKED ---
  const handleEmojiClick = (emojiData) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newText = postContent.substring(0, start) + emojiData.emoji + postContent.substring(end);

    setPostContent(newText);
    setCursorPosition(start + emojiData.emoji.length); // Set new cursor pos
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!postContent.trim() && imageFiles.length === 0) {
      return;
    }

    setIsPosting(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    const newPostData = {
      _id: `post_${Date.now()}`,
      user: dummyCurrentUser,
      createdAt: new Date().toISOString(),
      content: postContent,
      image_urls: imagePreviews,
      likes: [],
      comments: []
    };

    if (onPostCreated) {
      onPostCreated(newPostData);
    }

    setIsPosting(false);
    setPostContent('');
    clearAllImages();
    setShowEmojiPicker(false); // <-- 8. HIDE PICKER ON SUBMIT
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const isPostButtonDisabled = (isPosting || (!postContent.trim() && imageFiles.length === 0));

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white rounded-lg w-full max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4 text-gray-800 text-center">
        Create Post
      </h2>

      <div className="flex items-start space-x-3">
        <img
          src={dummyCurrentUser.profilePicture}
          alt="Your profile"
          className="w-10 h-10 rounded-full object-cover flex-shrink-0"
        />

        <div className="flex-grow">
          <textarea
            ref={textareaRef}
            className="w-full p-2 text-base border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-purple-400 focus:outline-none overflow-y-hidden"
            rows="2"
            placeholder="What's on your mind?"
            value={postContent}
            onChange={handleTextChange}
            onClick={() => setShowEmojiPicker(false)} // <-- 9. HIDE PICKER ON TEXTAREA CLICK
            maxLength={MAX_CHARS}
          />

          {imagePreviews.length > 0 && (
            <div className="mt-3 grid grid-cols-3 gap-2">
              {imagePreviews.map((previewUrl, index) => (
                <div key={index} className="relative aspect-square">
                  <img
                    src={previewUrl}
                    alt={`Selected preview ${index + 1}`}
                    className="rounded-lg w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-black bg-opacity-60 text-white rounded-full p-0.5 hover:bg-opacity-80 transition-all"
                    aria-label={`Remove image ${index + 1}`}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <hr className="my-3 border-gray-200" />

          <div className="flex justify-between items-center">
            {/* --- 10. WRAP EMOJI BUTTON/PICKER IN A REF & RELATIVE DIV --- */}
            <div className="flex space-x-1 text-gray-500 relative" ref={emojiPickerRef}>
              <button
                type="button"
                onClick={() => imageInputRef.current.click()}
                className="p-2 rounded-full hover:bg-purple-100 hover:text-purple-600 transition-colors"
                aria-label="Add image"
              >
                <Image size={20} />
              </button>
              <input
                type="file"
                accept="image/*"
                ref={imageInputRef}
                onChange={handleImageSelect}
                className="hidden"
                multiple
              />
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)} // <-- 11. ADD ONCLICK
                className="p-2 rounded-full hover:bg-purple-100 hover:text-purple-600 transition-colors"
                aria-label="Add emoji"
              >
                <Smile size={20} />
              </button>

              {/* --- 12. RENDER THE EMOJI PICKER --- */}
              {showEmojiPicker && (
                // CHANGED: Using -ml-4 to shift the box 16px to the left
                <div className="absolute z-10 top-full mt-2 left-0 -ml-14"> 
                  <EmojiPicker
                    onEmojiClick={handleEmojiClick}
                    lazyLoadEmojis={true}
                    searchDisabled={true}
                    height={300}
                    width={280}
                    emojiSize={20}
                  />
                </div>
              )}
            </div>
            {/* --- END OF EMOJI WRAPPER --- */}

            <div className="flex items-center space-x-3">
              <span
                className={`text-sm ${charsLeft < 20 ? 'text-red-500' : 'text-gray-500'}`}
              >
                {charsLeft}
              </span>
              <button
                type="submit"
                disabled={isPostButtonDisabled}
                className={`flex items-center bg-gradient-to-r from-purple-600 to-teal-600 text-white font-bold py-2 px-5 rounded-full transition-all
                            disabled:opacity-50 disabled:cursor-not-allowed
                            hover:opacity-90 shadow-md`}
              >
                {isPosting ? 'Posting...' : 'Post'}
                {!isPosting && <Send size={16} className="ml-1.5" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

export default CreatePost;