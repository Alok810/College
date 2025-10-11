import React, { useEffect, useState, forwardRef } from "react";

// The calculation now accepts an 'offset' parameter to apply the shift
const calculateLeftOffset = (isSidebarOpen, offset = 0) => {
  const sidebarWidth = isSidebarOpen ? 256 : 80;
  const windowWidth = window.innerWidth;
  const mainContentWidth = windowWidth - sidebarWidth;
  
  // The final position is the center point PLUS the conditional offset
  return `${sidebarWidth + mainContentWidth / 2 + offset}px`;
};

const InstituteHeader = forwardRef(({
  isSidebarOpen,
  instituteName,
  instituteLogo,
  horizontalOffset, // Receive the offset prop from App.jsx
}, ref) => {
  const [leftOffset, setLeftOffset] = useState(() =>
    calculateLeftOffset(isSidebarOpen, horizontalOffset)
  );

  useEffect(() => {
    const handleResize = () => {
      // Pass the offset to the calculation on every update
      setLeftOffset(calculateLeftOffset(isSidebarOpen, horizontalOffset));
    };

    handleResize(); // Set position on initial render and prop change

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [isSidebarOpen, horizontalOffset]); // Re-calculate if offset or sidebar state changes

  if (!instituteName || instituteName === "Your Institute") return null;

  return (
    <div
      ref={ref}
      className="fixed top-2 z-30 rounded-2xl px-6 py-2 flex items-center gap-3 transition-all duration-500"
      style={{
        left: leftOffset, // This style now correctly includes the conditional offset
        transform: "translateX(-50%)",
        background:
          "linear-gradient(to right, #d6f8df, rgb(227, 224, 250), #88e4f4)",
        width: "auto",
        maxWidth: "90%",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      }}
    >
      {instituteLogo ? (
        <img
          src={instituteLogo}
          alt={`${instituteName} Logo`}
          className="w-12 h-12 object-contain rounded-md"
        />
      ) : (
        <div className="w-12 h-12 flex items-center justify-center bg-gray-200 rounded-md text-gray-600 text-sm">
          LOGO
        </div>
      )}
      <h2 className="text-lg font-semibold text-gray-800 drop-shadow-sm">
        {instituteName}
      </h2>
    </div>
  );
});

export default InstituteHeader;