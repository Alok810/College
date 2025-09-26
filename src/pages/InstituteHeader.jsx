import React, { useEffect, useState, forwardRef } from "react";

// Function to calculate the left offset
const calculateLeftOffset = (isSidebarOpen) => {
  const sidebarWidth = isSidebarOpen ? 256 : 80;
  const windowWidth = window.innerWidth;
  const mainContentWidth = windowWidth - sidebarWidth;
  return `${sidebarWidth + mainContentWidth / 2}px`;
};

const InstituteHeader = forwardRef(({
  isSidebarOpen,
  instituteName,
  instituteLogo,
}, ref) => {
  const [leftOffset, setLeftOffset] = useState(() =>
    calculateLeftOffset(isSidebarOpen)
  );

  useEffect(() => {
    // 1. Update on sidebar state change
    setLeftOffset(calculateLeftOffset(isSidebarOpen));

    // 2. Add an event listener to update on window resize
    const handleResize = () => {
      setLeftOffset(calculateLeftOffset(isSidebarOpen));
    };

    window.addEventListener("resize", handleResize);

    // Cleanup the event listener when the component unmounts
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [isSidebarOpen]);

  // Hide the header if institute name is not available
  if (!instituteName || instituteName === "Your Institute") return null;

  return (
    <div
      ref={ref}
      className="fixed top-2 z-30 rounded-2xl px-6 py-2 flex items-center gap-3 transition-all duration-500"
      style={{
        left: leftOffset,
        transform: "translateX(-50%)",
        background:
          "linear-gradient(to right, #d6f8df, rgb(227, 224, 250), #88e4f4)",
        width: "auto",
        maxWidth: "90%",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      }}
    >
      {/* Show uploaded logo or fallback */}
      {instituteLogo ? (
        <img
          src={instituteLogo}
          alt="Institute Logo"
          className="w-12 h-12 object-contain rounded-md"
        />
      ) : (
        <div className="w-12 h-12 flex items-center justify-center bg-gray-200 rounded-md text-gray-600 text-sm">
          LOGO
        </div>
      )}

      {/* Institute Name */}
      <h2 className="text-lg font-semibold text-gray-800 drop-shadow-sm">
        {instituteName}
      </h2>
    </div>
  );
});

export default InstituteHeader;