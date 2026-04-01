import React, { useState, useRef, useEffect } from 'react';
import { Image, Smile, X, Send, ChevronUp } from 'lucide-react';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { createSocialPost } from '../api';
import { useAuth } from '../context/AuthContext'; 

const CreatePost = ({ onPostCreated, onClose }) => {
  const [postContent, setPostContent] = useState('');
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [isPosting, setIsPosting] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false); 
  const [cursorPosition, setCursorPosition] = useState(null); 

  const { authData } = useAuth();
  const imageInputRef = useRef(null);
  const textareaRef = useRef(null);
  const emojiPickerRef = useRef(null); 

  const MAX_CHARS = 280;
  const charsLeft = MAX_CHARS - postContent.length;

  // Restore cursor position after emoji insertion
  useEffect(() => {
    if (textareaRef.current && cursorPosition !== null) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(cursorPosition, cursorPosition);
      setCursorPosition(null); 
    }
  }, [postContent, cursorPosition]);

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  const removeImage = (indexToRemove) => {
    setImageFiles(prev => prev.filter((_, i) => i !== indexToRemove));
    setImagePreviews(prev => prev.filter((_, i) => i !== indexToRemove));
  };

  const clearAllImages = () => {
    setImageFiles([]);
    setImagePreviews([]);
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  // ✅ FIXED: Updated for Emoji Mart (.native)
  const handleEmojiClick = (emojiData, event) => {
    if (event) event.preventDefault(); 

    const actualEmoji = emojiData.native; 
    if (!actualEmoji) return;

    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    const newText = postContent.substring(0, start) + actualEmoji + postContent.substring(end);

    setPostContent(newText);
    setCursorPosition(start + actualEmoji.length); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!postContent.trim() && imageFiles.length === 0) return;

    setIsPosting(true);
    const formData = new FormData();
    formData.append('content', postContent);
    imageFiles.forEach((file) => formData.append('images', file));

    try {
        const newPost = await createSocialPost(formData);
        if (onPostCreated) onPostCreated(newPost);

        setPostContent('');
        clearAllImages();
        setShowEmojiPicker(false); 
        if (onClose) onClose(); 
        if (textareaRef.current) textareaRef.current.style.height = 'auto';
    } catch (error) {
        console.error("Failed to post:", error.message);
        alert(error.message); 
    } finally {
        setIsPosting(false);
    }
  };

  const isPostButtonDisabled = (isPosting || (!postContent.trim() && imageFiles.length === 0));
  const avatar = authData?.profilePicture || `https://ui-avatars.com/api/?name=${authData?.name || authData?.full_name || 'User'}&background=EBF4FF&color=4F46E5`;

  return (
    <div className="fixed top-[5.5rem] right-0 mr-4 bg-white shadow-2xl flex flex-col z-50 rounded-xl w-80 h-auto overflow-visible transition-all duration-300 ease-in-out">
      
      {/* --- HEADER BAR --- */}
      <div className="flex justify-between items-center p-3 border-b border-gray-100">
        <h3 className="font-bold text-xl text-gray-800">Create Post</h3>
        <button type="button" onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 text-gray-700 transition-colors">
          <ChevronUp size={18} />
        </button>
      </div>

      {/* --- EXPANDED FORM --- */}
      <form onSubmit={handleSubmit} className="p-4 flex flex-col w-full">
        <div className="flex items-start space-x-3">
          <img src={avatar} alt="Profile" className="w-10 h-10 rounded-full object-cover border border-gray-100 flex-shrink-0" />

          <div className="flex-grow w-full relative">
            <textarea
              ref={textareaRef}
              className="w-full p-2 text-sm border border-gray-200 rounded-md resize-none focus:ring-2 focus:ring-indigo-400 focus:outline-none overflow-y-hidden bg-gray-50"
              rows="2"
              placeholder="What's on your mind?"
              value={postContent}
              onChange={handleTextChange}
              onClick={() => setShowEmojiPicker(false)} 
              maxLength={MAX_CHARS}
            />

            {imagePreviews.length > 0 && (
              <div className="mt-3 grid grid-cols-2 gap-2">
                {imagePreviews.map((previewUrl, index) => (
                  <div key={index} className="relative aspect-square">
                    <img src={previewUrl} alt={`Preview ${index + 1}`} className="rounded-lg w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-black bg-opacity-60 text-white rounded-full p-1 hover:bg-opacity-80 transition-all"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <hr className="my-3 border-gray-100" />

            <div className="flex justify-between items-center">
              <div className="flex space-x-1 text-gray-500 relative" ref={emojiPickerRef}>
                <button type="button" onClick={() => imageInputRef.current.click()} className="p-1.5 rounded-full hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                  <Image size={18} />
                </button>
                <input type="file" accept="image/*" ref={imageInputRef} onChange={handleImageSelect} className="hidden" multiple />
                
                <button 
                  type="button" 
                  onClick={(e) => { e.preventDefault(); setShowEmojiPicker(!showEmojiPicker); }} 
                  className="p-1.5 rounded-full hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                >
                  <Smile size={18} />
                </button>

                {/* ✅ New Emoji Mart Dropdown */}
                {/* ✅ Resized Emoji Mart Dropdown */}
                {showEmojiPicker && (
                  <div className="absolute z-[100] top-full mt-2 left-[-20px] shadow-2xl rounded-xl bg-white border border-gray-100 overflow-hidden"> 
                    
                    {/* Explicitly lock the height of the Emoji Mart Web Component */}
                    <style>{`
                      em-emoji-picker {
                        height: 320px !important;
                      }
                    `}</style>

                    <Picker 
                      data={data} 
                      onEmojiSelect={handleEmojiClick} 
                      theme="light"
                      previewPosition="none" 
                      skinTonePosition="none"
                      perLine={7}          // ✅ Reduces width (default is 9)
                      emojiSize={22}       // ✅ Slightly smaller emojis
                      emojiButtonSize={32} // ✅ Slightly smaller clickable area
                      maxFrequentRows={1}  // ✅ Limits the "Frequently Used" section height
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <span className={`text-xs ${charsLeft < 20 ? 'text-red-500' : 'text-gray-400'}`}>{charsLeft}</span>
                <button
                  type="submit"
                  disabled={isPostButtonDisabled}
                  className="flex items-center bg-gradient-to-r from-purple-600 to-teal-600 text-white font-semibold py-1.5 px-4 text-sm rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 shadow-sm"
                >
                  {isPosting ? '...' : 'Post'}
                  {!isPosting && <Send size={14} className="ml-1.5" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;