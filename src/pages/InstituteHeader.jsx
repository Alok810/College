import React, { useEffect, useState, forwardRef } from "react";

// ✅ 1. Smarter Math: Center it perfectly within the REMAINING empty space
const calculateLeftOffset = (isSidebarOpen, offset = 0) => {
  const isMobile = window.innerWidth < 768; // 768px is Tailwind's 'md' breakpoint
  
  if (isMobile) {
    // Shift the center point exactly 25px to the right. 
    // This perfectly balances the gap from the Rigya logo on the left!
    return `calc(50vw + 25px)`; 
  }
  
  const sidebarWidth = isSidebarOpen ? 256 : 80;
  const windowWidth = window.innerWidth;
  const mainContentWidth = windowWidth - sidebarWidth;
  
  return `${sidebarWidth + mainContentWidth / 2 + offset}px`;
};

const InstituteHeader = forwardRef(({
  isSidebarOpen,
  instituteName,
  instituteLogo,
  horizontalOffset = 0,
}, ref) => {
  const [leftOffset, setLeftOffset] = useState(() =>
    calculateLeftOffset(isSidebarOpen, horizontalOffset)
  );

  useEffect(() => {
    const handleResize = () => {
      setLeftOffset(calculateLeftOffset(isSidebarOpen, horizontalOffset));
    };

    handleResize(); 
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isSidebarOpen, horizontalOffset]);

  if (!instituteName || instituteName === "Your Institute") return null;

  return (
    <div
      ref={ref}
      // Reduced the left/right padding on mobile (px-3) to give the text even more room
      className="fixed top-4 z-30 rounded-2xl px-3 py-2 md:px-6 md:py-2 flex items-center gap-2 md:gap-3 transition-all duration-300 shadow-md backdrop-blur-sm"
      style={{
        left: leftOffset,
        transform: "translateX(-50%)",
        background: "linear-gradient(to right, rgba(214, 248, 223, 0.9), rgba(227, 224, 250, 0.9), rgba(136, 228, 244, 0.9))",
        width: "max-content",
        // ✅ 2. Massive width increase! 
        // 100vw minus 90px guarantees it stretches to the right edge but never hits the Rigya logo
        maxWidth: "calc(100vw - 90px)", 
      }}
    >
      {instituteLogo ? (
        <img
          src={instituteLogo}
          alt={`${instituteName} Logo`}
          // ✅ Added shrink-0 so the logo doesn't get squeezed if the text is really long
          className="w-8 h-8 md:w-12 md:h-12 object-contain rounded-md mix-blend-multiply shrink-0" 
        />
      ) : (
        <div className="w-8 h-8 md:w-12 md:h-12 flex items-center justify-center bg-white/50 rounded-md text-gray-700 text-xs md:text-sm font-bold shrink-0">
          LOGO
        </div>
      )}
      <h2 className="text-sm md:text-lg font-bold text-gray-800 drop-shadow-sm truncate">
        {instituteName}
      </h2>
    </div>
  );
});

export default InstituteHeader;