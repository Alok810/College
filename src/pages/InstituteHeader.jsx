import React, { useEffect, useState, forwardRef } from "react";

const calculateLeftOffset = (isSidebarOpen, offset = 0) => {
  const isMobile = window.innerWidth < 768; 
  if (isMobile) {
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
  const [leftOffset, setLeftOffset] = useState(() => calculateLeftOffset(isSidebarOpen, horizontalOffset));
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
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
      // 🟢 REMOVED the fade-out logic so it always stays visible!
      className="fixed z-30 rounded-2xl px-3 py-2 md:px-6 md:py-2 flex items-center gap-2 md:gap-3 transition-all duration-300 shadow-md backdrop-blur-sm"
      style={{
        top: isMobile ? "calc(env(safe-area-inset-top, 0px) + 16px)" : "16px",
        left: leftOffset,
        transform: "translateX(-50%)",
        background: "linear-gradient(to right, rgba(214, 248, 223, 0.9), rgba(227, 224, 250, 0.9), rgba(136, 228, 244, 0.9))",
        width: "max-content",
        maxWidth: "calc(100vw - 90px)", 
      }}
    >
      {instituteLogo ? (
        <img
          src={instituteLogo}
          alt={`${instituteName} Logo`}
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