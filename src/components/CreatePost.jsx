import React, { useState, useRef, useEffect } from 'react';
import { Image, Smile, X, Send, ChevronUp, ChevronDown } from 'lucide-react';
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
  
  // ✅ 1. ADDED MOBILE DETECTION
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const { authData } = useAuth();
  const imageInputRef = useRef(null);
  const textareaRef = useRef(null);
  const emojiPickerRef = useRef(null); 

  const MAX_CHARS = 280;
  const charsLeft = MAX_CHARS - postContent.length;

  // ✅ Listen for screen size changes
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (textareaRef.current && cursorPosition !== null) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(cursorPosition, cursorPosition);
      setCursorPosition(null); 
    }
  }, [postContent, cursorPosition]);

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

  // ✅ 2. THE MAGIC WRAPPER: Full screen on mobile (`inset-0`), normal widget on desktop.
  const containerClasses = isMobile
    ? "fixed inset-0 bg-white z-[100] flex flex-col w-full h-full overflow-y-auto"
    : "fixed top-[5.5rem] right-0 mr-4 bg-white shadow-2xl flex flex-col z-50 rounded-xl w-80 h-auto overflow-visible transition-all duration-300 ease-in-out";

  return (
    <div className={containerClasses}>
      
      {/* --- HEADER BAR --- */}
      <div className={`flex justify-between items-center ${isMobile ? 'p-4 pt-6' : 'p-3'} border-b border-gray-100`}>
        <h3 className={`font-bold text-gray-800 ${isMobile ? 'text-2xl' : 'text-xl'}`}>Create Post</h3>
        <button type="button" onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 text-gray-700 transition-colors">
          {/* Use a Down arrow for mobile full-screen close, Up arrow for desktop widget */}
          {isMobile ? <ChevronDown size={24} /> : <ChevronUp size={18} />}
        </button>
      </div>

      {/* --- EXPANDED FORM --- */}
      <form onSubmit={handleSubmit} className="p-4 flex flex-col w-full flex-grow">
        <div className="flex items-start space-x-3 h-full flex-col md:flex-row">
          
          <div className="flex items-center gap-3 w-full md:w-auto mb-3 md:mb-0">
            <img src={avatar} alt="Profile" className="w-10 h-10 md:w-10 md:h-10 rounded-full object-cover border border-gray-100 flex-shrink-0" />
            {isMobile && <span className="font-semibold text-gray-700">{authData?.name || authData?.full_name}</span>}
          </div>

          <div className="flex-grow w-full relative flex flex-col">
            <textarea
              ref={textareaRef}
              // ✅ Made text slightly larger on mobile (text-base) so it's easier to read
              className={`w-full p-3 ${isMobile ? 'text-base min-h-[150px]' : 'text-sm'} border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-indigo-400 focus:outline-none overflow-y-hidden bg-gray-50 flex-grow`}
              rows="3"
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
                    <img src={previewUrl} alt={`Preview ${index + 1}`} className="rounded-lg w-full h-full object-cover shadow-sm" />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-black bg-opacity-70 text-white rounded-full p-1.5 hover:bg-red-500 transition-all"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Pushes the tools to the bottom on mobile */}
            <div className={`${isMobile ? 'mt-auto pt-6' : 'mt-0'}`}>
              <hr className="my-3 border-gray-100" />

              <div className="flex justify-between items-center pb-2">
                <div className="flex space-x-2 text-gray-500 relative" ref={emojiPickerRef}>
                  <button type="button" onClick={() => imageInputRef.current.click()} className="p-2 rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-600 transition-colors">
                    <Image size={20} />
                  </button>
                  <input type="file" accept="image/*" ref={imageInputRef} onChange={handleImageSelect} className="hidden" multiple />
                  
                  <button 
                    type="button" 
                    onClick={(e) => { e.preventDefault(); setShowEmojiPicker(!showEmojiPicker); }} 
                    className="p-2 rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-600 transition-colors"
                  >
                    <Smile size={20} />
                  </button>

                  {/* Emoji Picker */}
                  {showEmojiPicker && (
                    <div className={`absolute z-[100] ${isMobile ? 'bottom-full mb-2 left-0' : 'top-full mt-2 left-[-20px]'} shadow-2xl rounded-xl bg-white border border-gray-100 overflow-hidden`}> 
                      <style>{`em-emoji-picker { height: 320px !important; }`}</style>
                      <Picker 
                        data={data} 
                        onEmojiSelect={handleEmojiClick} 
                        theme="light"
                        previewPosition="none" 
                        skinTonePosition="none"
                        perLine={7}
                        emojiSize={22} 
                        emojiButtonSize={32} 
                        maxFrequentRows={1} 
                      />
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-3">
                  <span className={`text-sm font-medium ${charsLeft < 20 ? 'text-red-500' : 'text-gray-400'}`}>{charsLeft}</span>
                  <button
                    type="submit"
                    disabled={isPostButtonDisabled}
                    className="flex items-center bg-gradient-to-r from-purple-600 to-teal-600 text-white font-semibold py-2 px-5 text-sm md:text-base rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg shadow-sm"
                  >
                    {isPosting ? '...' : 'Post'}
                    {!isPosting && <Send size={16} className="ml-2" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;