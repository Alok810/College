// src/pages/Home.jsx
import React from "react";
import PostCard from "../components/PostCard.jsx";
import Tab from "../components/Tab.jsx"; // <-- You import the main Tab component
import { dummyPosts } from "../assets/data.js";

const SIDEBAR_WIDTH_CLASS = 'lg:pr-80';

const Home = ({ contentOffset = 0 }) => {
  return (
    <>
      {/* This is your sidebar container.
        By rendering <Tab /> here, you get all three (Search, Message, Notification)
        because Tab.jsx handles switching between them.
      */}
      <div className="hidden lg:block fixed top-0 right-0 w-80 h-screen py-4 pr-4 z-40">
        <Tab />
      </div>

      {/* 2. MAIN SCROLLING CONTENT */}
      <div
        className={`transition-transform duration-500 ${SIDEBAR_WIDTH_CLASS}`}
        style={{ transform: `translateX(${contentOffset}px)` }}
      >
        <div className='flex justify-center gap-8'>
          
          {/* Main Feed Content */}
          <div className="w-full max-w-2xl">
            <div className='space-y-6'>
              {dummyPosts.map((post) => (
                <PostCard post={post} key={post._id} />
              ))}
            </div>
          </div>
          
        </div>
      </div>
    </>
  );
};

export default Home;