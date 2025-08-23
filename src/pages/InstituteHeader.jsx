import React, { useEffect, useState } from "react";

export default function InstituteHeader({ isSidebarOpen }) {
  const auth = JSON.parse(localStorage.getItem("auth"));
  const [leftOffset, setLeftOffset] = useState("50%");

  if (!auth?.instituteName) return null;

  // Update header left position based on sidebar state
  useEffect(() => {
    const sidebarWidth = isSidebarOpen ? 256 : 80; // Sidebar width in px (matches your Sidebar)
    const windowWidth = window.innerWidth;
    const mainContentWidth = windowWidth - sidebarWidth;
    setLeftOffset(sidebarWidth + mainContentWidth / 2);
  }, [isSidebarOpen]);

  return (
    <div
      className="fixed top-4 z-30 rounded-2xl px-6 py-3 flex items-center gap-3 shadow-lg transition-all duration-500"
      style={{
        left: `${leftOffset}px`,
        transform: "translateX(-50%)",
        background:
          "linear-gradient(to right, #d6f8df, rgb(227, 224, 250), #88e4f4)",
        width: "auto",
        maxWidth: "90%",
      }}
    >
      {/* Show uploaded logo or fallback */}
      {auth.logo ? (
        <img
          src={auth.logo}
          alt="Institute Logo"
          className="w-12 h-12 object-contain rounded-md shadow"
        />
      ) : (
        <div className="w-12 h-12 flex items-center justify-center bg-gray-200 rounded-md shadow text-gray-600 text-sm">
          LOGO
        </div>
      )}

      {/* Institute Name */}
      <h2 className="text-lg font-semibold text-gray-800 drop-shadow-sm">
        {auth.instituteName}
      </h2>
    </div>
  );
}
