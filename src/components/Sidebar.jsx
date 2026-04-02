import React, { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import homeIcon from "../assets/house.png";
import leftArrow from "../assets/left.png";
import profileIcon from "../assets/profile.png";
import settingsIcon from "../assets/setting.png";
import logoutIcon from "../assets/logout.png";
import appearanceIcon from "../assets/appearance.png";
import rigyaLogo from "../assets/rigya.png";
import friendIcon from "../assets/friend.png";
import voiceIcon from "../assets/voice.png";
import resultIcon from "../assets/result.png";
import departmentIcon from "../assets/department.png";
import adminIcon from "../assets/admin.png";
import interactionIcon from "../assets/interaction.png";
import libraryIcon from "../assets/Library.png";
import hostelIcon from "../assets/hostel.png";
import clubIcon from "../assets/Club.png";

export default function Sidebar({ isOpen, setIsOpen }) {
  const { authData } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  const linkClass =
    "flex items-center gap-3 py-2 px-4 rounded hover:bg-white/40 transition duration-200";

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      {/* ✅ MOBILE LOGO BUTTON (Replaced Hamburger with Rigya Logo) */}
      {!isOpen && (
        <button
          className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-xl shadow-lg hover:bg-[#A9E0FF] hover:scale-105 transition-all"
          onClick={() => setIsOpen(true)}
        >
          <img
            src={rigyaLogo}
            alt="Open Menu"
            className="w-8 h-8 object-contain mix-blend-multiply"
          />
        </button>
      )}

      {/* ✅ BACKGROUND OVERLAY FOR MOBILE (Dims the background when menu is open) */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* ✅ MAIN SIDEBAR CONTAINER */}
      <aside
        className={`
          flex flex-col justify-between p-4 shadow-xl z-50
          transition-all duration-300 ease-in-out h-screen
          fixed md:relative top-0 left-0
          ${isOpen ? "translate-x-0 w-64" : "-translate-x-full md:translate-x-0 md:w-20"}
        `}
        style={{
          background: "linear-gradient(to bottom, #d6f8df, rgb(227, 224, 250), #88e4f4)",
        }}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Header */}
          <div className={`flex items-center mb-6 shrink-0 mt-1 ${!isOpen ? "justify-center" : "justify-between"}`}>
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
              <img
                src={rigyaLogo}
                alt="Rigya Logo"
                className="w-10 h-10 min-w-[40px] min-h-[40px] object-contain"
              />
              {isOpen && (
                <h1 className="text-xl font-bold" style={{ color: "#FFA500" }}>
                  Rigya
                </h1>
              )}
            </div>

            {/* Close Button / Collapse Arrow */}
            {isOpen && (
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/50 rounded-full transition-colors"
              >
                {/* On mobile, show an X. On desktop, show the left arrow */}
                <svg className="w-6 h-6 md:hidden text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <img
                  src={leftArrow}
                  alt="Collapse"
                  className="w-6 h-6 min-w-[24px] min-h-[24px] hidden md:block"
                />
              </button>
            )}
          </div>

          {/* Navigation (Added overflow-y-auto so links don't get cut off on phones) */}
          <nav className="space-y-2 flex-1 overflow-y-auto pr-2 pb-4 scrollbar-hide">
            {/* Nav Links */}
            <NavLink to="/" className={`${linkClass} ${!isOpen ? "justify-center" : "justify-start"}`}>
              <img src={homeIcon} alt="Home" className="w-6 h-6 min-w-[24px]" />
              {isOpen && "Home"}
            </NavLink>

            <NavLink to="/friends" className={`${linkClass} ${!isOpen ? "justify-center" : "justify-start"}`}>
              <img src={friendIcon} alt="Friends" className="w-6 h-6 min-w-[24px]" />
              {isOpen && "Friends"}
            </NavLink>

            <NavLink to="/result" className={`${linkClass} ${!isOpen ? "justify-center" : "justify-start"}`}>
              <img src={resultIcon} alt="Result" className="w-6 h-6 min-w-[24px]" />
              {isOpen && "Result"}
            </NavLink>

            <NavLink to="/voice" className={`${linkClass} ${!isOpen ? "justify-center" : "justify-start"}`}>
              <img src={voiceIcon} alt="TalkHive" className="w-6 h-6 min-w-[24px]" />
              {isOpen && "TalkHive"}
            </NavLink>

            <NavLink to="/department" className={`${linkClass} ${!isOpen ? "justify-center" : "justify-start"}`}>
              <img src={departmentIcon} alt="Department" className="w-6 h-6 min-w-[24px]" />
              {isOpen && "Department"}
            </NavLink>

            <NavLink to="/library" className={`${linkClass} ${!isOpen ? "justify-center" : "justify-start"}`}>
              <img src={libraryIcon} alt="Library" className="w-6 h-6 min-w-[24px]" />
              {isOpen && "Library"}
            </NavLink>

            <NavLink to="/hostel" className={`${linkClass} ${!isOpen ? "justify-center" : "justify-start"}`}>
              <img src={hostelIcon} alt="Hostel" className="w-6 h-6 min-w-[24px]" />
              {isOpen && "Hostel"}
            </NavLink>

            <NavLink to="/club" className={`${linkClass} ${!isOpen ? "justify-center" : "justify-start"}`}>
              <img src={clubIcon} alt="Club" className="w-6 h-6 min-w-[24px]" />
              {isOpen && "Club"}
            </NavLink>

            <NavLink to="/admin" className={`${linkClass} ${!isOpen ? "justify-center" : "justify-start"}`}>
              <img src={adminIcon} alt="Admin" className="w-6 h-6 min-w-[24px]" />
              {isOpen && "Admin"}
            </NavLink>

            <NavLink to="/interaction" className={`${linkClass} ${!isOpen ? "justify-center" : "justify-start"}`}>
              <img src={interactionIcon} alt="Interaction" className="w-6 h-6 min-w-[24px]" />
              {isOpen && "Interaction"}
            </NavLink>
          </nav>
        </div>

        {/* Profile & Dropdown */}
        <div className="relative shrink-0 mt-4" ref={menuRef}>
          <div
            onClick={() => setMenuOpen(!menuOpen)}
            className={`flex items-center gap-3 bg-white/50 p-3 rounded-lg shadow-sm cursor-pointer hover:bg-white/80 transition-colors ${
              !isOpen ? "justify-center" : ""
            }`}
          >
            <img
              src={authData?.profilePicture || `https://ui-avatars.com/api/?name=${authData?.name || 'User'}&background=EBF4FF&color=4F46E5`}
              alt="Profile"
              className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-full object-cover"
            />
            {isOpen && (
              <div className="flex flex-col overflow-hidden">
                <p className="font-semibold text-gray-800 truncate">
                  {authData?.name || authData?.full_name || "Unknown User"}
                </p>
              </div>
            )}
          </div>

          {menuOpen && (
            <div className="absolute bottom-16 left-0 w-48 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden z-50">
              <button
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 w-full text-left text-gray-700 transition-colors"
                onClick={() => { navigate("/profile"); setMenuOpen(false); }}
              >
                <img src={profileIcon} alt="Profile" className="w-5 h-5" />
                Profile
              </button>
              <button
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 w-full text-left text-gray-700 transition-colors"
                onClick={() => { navigate("/settings"); setMenuOpen(false); }}
              >
                <img src={settingsIcon} alt="Settings" className="w-5 h-5" />
                Settings
              </button>
              <button
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 w-full text-left text-gray-700 transition-colors"
                onClick={() => setDarkMode(!darkMode)}
              >
                <img src={appearanceIcon} alt="Appearance" className="w-5 h-5" />
                {darkMode ? "Light Mode" : "Dark Mode"}
              </button>
              <div className="border-t border-gray-100"></div>
              <button
                className="flex items-center gap-3 px-4 py-3 hover:bg-red-50 w-full text-left text-red-600 font-medium transition-colors"
                onClick={() => { navigate("/logout"); setMenuOpen(false); }}
              >
                <img src={logoutIcon} alt="Logout" className="w-5 h-5" />
                Logout
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}