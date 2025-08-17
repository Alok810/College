import React, { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";

import homeIcon from "../assets/house.png";
import leftArrow from "../assets/left.png";
import profileIcon from "../assets/profile.png";
import settingsIcon from "../assets/setting.png";
import logoutIcon from "../assets/logout.png";
import appearanceIcon from "../assets/appearance.png";
import rigyaLogo from "../assets/rigya.png";

// ✅ Newly added icons
import friendIcon from "../assets/friend.png";
import voiceIcon from "../assets/voice.png";
import resultIcon from "../assets/result.png";
import departmentIcon from "../assets/department.png";

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  const linkClass =
    "flex items-center gap-3 py-2 px-4 rounded hover:bg-gray-200 transition duration-200";

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
    <aside
      className={`shadow-xl flex flex-col justify-between transition-all duration-300 ${
        collapsed ? "w-20" : "w-64"
      } min-h-screen p-4 relative rounded-xl`}
      style={{
        background:
          "linear-gradient(to bottom, #d6f8df, rgb(227, 224, 250), #88e4f4)",
      }}
    >
      <div>
        {/* Header */}
        <div
          className={`flex items-center mb-6 ${
            collapsed ? "justify-center" : "justify-between"
          }`}
        >
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => setCollapsed(!collapsed)}
          >
            <img
              src={rigyaLogo}
              alt="Rigya Logo"
              className="w-10 h-10 min-w-[40px] min-h-[40px] object-contain"
            />
            {!collapsed && (
              <h1 className="text-xl font-bold" style={{ color: "#FFA500" }}>
                Rigya
              </h1>
            )}
          </div>

          {!collapsed && (
            <button
              onClick={() => setCollapsed(true)}
              className="p-1 hover:bg-gray-200 rounded"
            >
              <img
                src={leftArrow}
                alt="Collapse"
                className="w-6 h-6 min-w-[24px] min-h-[24px]"
              />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          <NavLink
            to="/"
            className={`${linkClass} ${
              collapsed ? "justify-center" : "justify-start"
            }`}
          >
            <img
              src={homeIcon}
              alt="Home"
              className="w-6 h-6 min-w-[24px] min-h-[24px]"
            />
            {!collapsed && "Home"}
          </NavLink>

          {/* Friends */}
          <NavLink
            to="/friends"
            className={`${linkClass} ${
              collapsed ? "justify-center" : "justify-start"
            }`}
          >
            <img
              src={friendIcon}
              alt="Friends"
              className="w-6 h-6 min-w-[24px] min-h-[24px]"
            />
            {!collapsed && "Friends"}
          </NavLink>

          {/* Results */}
          <NavLink
            to="/result"
            className={`${linkClass} ${
              collapsed ? "justify-center" : "justify-start"
            }`}
          >
            <img
              src={resultIcon}
              alt="Result"
              className="w-6 h-6 min-w-[24px] min-h-[24px]"
            />
            {!collapsed && "Result"}
          </NavLink>

          {/* TalkHive (Voice) */}
          <NavLink
            to="/voice"
            className={`${linkClass} ${
              collapsed ? "justify-center" : "justify-start"
            }`}
          >
            <img
              src={voiceIcon}
              alt="TalkHive"
              className="w-6 h-6 min-w-[24px] min-h-[24px]"
            />
            {!collapsed && "TalkHive"}
          </NavLink>

          {/* Department */}
          <NavLink
            to="/department"
            className={`${linkClass} ${
              collapsed ? "justify-center" : "justify-start"
            }`}
          >
            <img
              src={departmentIcon}
              alt="Department"
              className="w-6 h-6 min-w-[24px] min-h-[24px]"
            />
            {!collapsed && "Department"}
          </NavLink>
        </nav>
      </div>

      {/* Profile & Dropdown Menu */}
      <div className="relative" ref={menuRef}>
        <div
          onClick={() => setMenuOpen(!menuOpen)}
          className={`flex items-center gap-3 mt-6 bg-gray-100 p-3 rounded-lg shadow-inner cursor-pointer hover:bg-gray-200 ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <img
            src="https://via.placeholder.com/40"
            alt="Profile"
            className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-full"
          />
          {!collapsed && (
            <div className="flex flex-col">
              <p className="font-semibold">John Doe</p>
            </div>
          )}
        </div>

        {menuOpen && (
          <div className="absolute bottom-16 left-0 w-50 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-50">
            <button
              className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 w-full text-left"
              onClick={() => {
                navigate("/profile");
                setMenuOpen(false);
              }}
            >
              <img src={profileIcon} alt="Profile" className="w-5 h-5" />
              Profile
            </button>
            <button
              className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 w-full text-left"
              onClick={() => {
                navigate("/settings");
                setMenuOpen(false);
              }}
            >
              <img src={settingsIcon} alt="Settings" className="w-5 h-5" />
              Settings
            </button>
            <button
              className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 w-full text-left"
              onClick={() => setDarkMode(!darkMode)}
            >
              <img src={appearanceIcon} alt="Appearance" className="w-5 h-5" />
              Appearance: {darkMode ? "Dark" : "Light"}
            </button>
            <button
              className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 w-full text-left text-red-500"
              onClick={() => {
                navigate("/logout");
                setMenuOpen(false);
              }}
            >
              <img src={logoutIcon} alt="Logout" className="w-5 h-5" />
              Logout
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
