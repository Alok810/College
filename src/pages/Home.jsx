import React, { useState, useEffect } from "react";
import PostCard from "../components/PostCard.jsx";
import AppPromoBanner from "../components/AppPromoBanner"; // 🟢 1. IMPORT THE BANNER

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
      className={`transition-transform duration-500 bg-transparent min-h-screen ${
        isMobile ? "fixed inset-0 overflow-y-auto z-10 custom-scrollbar" : "w-full pt-0"
      }`}
      style={{ 
        transform: isMobile ? "none" : `translateX(${contentOffset}px)` 
      }}
    >
      {/* Mobile Header */}
      {isMobile && (
        <div 
          className="sticky top-0 left-0 w-full bg-white/70 backdrop-blur-xl z-40 border-b border-gray-100/50 flex items-center justify-center shadow-[0_4px_30px_rgba(0,0,0,0.02)]"
          style={{
            height: "calc(env(safe-area-inset-top, 0px) + 68px)",
            paddingTop: "env(safe-area-inset-top, 0px)"
          }}
        >
          <span className="font-extrabold text-[19px] tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-teal-600">
            Rigya Feed
          </span>
        </div>
      )}

      {/* Main Feed Content */}
      <div className={`flex justify-center px-3 md:px-4 w-full ${isMobile ? "pt-4" : ""}`}>
        {/* pb-28 ensures the bottom post isn't hidden behind the new Bottom Navigation Bar */}
        <div className="w-full max-w-2xl mx-auto pb-28 md:pb-4">
          <div className="space-y-4 md:space-y-4">
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