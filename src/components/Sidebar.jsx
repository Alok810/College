import React, { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";

import homeIcon from "../assets/house.png";
import leftArrow from "../assets/left.png";
import rightArrow from "../assets/right.png";
import profileIcon from "../assets/profile.png";
import settingsIcon from "../assets/setting.png";
import logoutIcon from "../assets/logout.png";
import appearanceIcon from "../assets/appearance.png";

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
      className={`shadow-lg flex flex-col justify-between transition-all duration-300 ${
        collapsed ? "w-20" : "w-64"
      } min-h-screen p-4 relative`}
      style={{
        background: "linear-gradient(to bottom, #d6f8df, rgb(227, 224, 250), #88e4f4)",
      }}
    >
      <div>
        {/* Header */}
        <div
          className={`flex items-center mb-6 ${
            collapsed ? "justify-center" : "justify-between"
          }`}
        >
          {!collapsed && <h1 className="text-xl font-bold">Rigya</h1>}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 hover:bg-gray-200 rounded"
          >
            <img
              src={collapsed ? rightArrow : leftArrow}
              alt="Toggle"
              className="w-6 h-6 min-w-[24px] min-h-[24px]"
            />
          </button>
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
          {/* Add more NavLinks here if needed */}
        </nav>
      </div>

      {/* Profile & Menu */}
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

        {/* Dropdown Menu */}
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
