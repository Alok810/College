import React, { useState, useEffect } from "react";
import PostCard from "../components/PostCard.jsx";

const Home = ({ posts, contentOffset = 0 }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    
    handleResize(); 
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div
      className={`transition-transform duration-500 ${
        isMobile ? "fixed inset-0 pt-20 overflow-y-auto z-10" : "w-full pt-0"
      }`}
      style={{ 
        transform: isMobile ? "none" : `translateX(${contentOffset}px)` 
      }}
    >
      <div className="flex justify-center px-3 md:px-4 w-full">
        
        {/* 🟢 THE FIX: Added md:pb-4 to remove the giant empty gap on laptops/desktops! */}
        <div className="w-full max-w-2xl mx-auto pb-24 md:pb-4">
          <div className="space-y-3 md:space-y-4">
            {posts.map((post) => (
              <PostCard post={post} key={post._id} />
            ))}
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default Home;