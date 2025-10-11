import React from "react";
import PostCard from "../components/PostCard.jsx";
import MessageSidebar from "../components/Message.jsx"; // Assuming Message.jsx is where MessageSidebar is exported
import { dummyPosts } from "../assets/data.js";

// Define the sidebar width (matching w-80 in MessageSidebar.jsx, which is 320px)
// We'll use this for padding on the main content wrapper.
const SIDEBAR_WIDTH_CLASS = 'lg:pr-80'; // Padding right: 320px

const Home = ({ contentOffset = 0 }) => {
  return (
    <>
      {/* 🛑 1. FIXED SIDEBAR: Absolutely positioned on the right of the viewport. */}
      {/* We keep it outside the transformed div. */}
      <div className="hidden lg:block">
        <MessageSidebar />
      </div>

      {/* 2. MAIN SCROLLING CONTENT: The transformed wrapper */}
      {/* We apply padding-right to this wrapper to make sure its content 
          doesn't go underneath the fixed sidebar. */}
      <div
        className={`transition-transform duration-500 ${SIDEBAR_WIDTH_CLASS}`}
        style={{ transform: `translateX(${contentOffset}px)` }}
      >
        {/* The main content layout is now simpler, without the spacer div */}
        <div className='flex justify-center gap-8'>
          
          {/* Main Feed Content */}
          <div className="w-full max-w-2xl">
            <div className='space-y-6'>
              {dummyPosts.map((post) => (
                <PostCard post={post} key={post._id} />
              ))}
            </div>
          </div>
          
          {/* 🛑 Spacer is REMOVED 🛑 */}
          
        </div>
      </div>
    </>
  );
};

export default Home;