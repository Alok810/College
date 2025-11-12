// src/pages/Home.jsx
import React from "react";
import PostCard from "../components/PostCard.jsx";
// 🛑 import { dummyPosts } from "../assets/data.js"; // REMOVE THIS

// 1. Accept 'posts' as a prop
const Home = ({ posts, contentOffset = 0 }) => {
  return (
    <>
      <div
        className={`transition-transform duration-500`}
        style={{ transform: `translateX(${contentOffset}px)` }}
      >
        <div className="flex justify-center gap-8">
          <div className="w-full max-w-2xl">
            <div className="space-y-2.5">
              {/* 2. Map over the 'posts' prop instead of dummyPosts */}
              {posts.map((post) => (
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