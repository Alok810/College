import React, { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";

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
        !isOpen ? "w-20" : "w-64"
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
            !isOpen ? "justify-center" : "justify-between"
          }`}
        >
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => setIsOpen(!isOpen)}
          >
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

          {isOpen && (
            <button
              onClick={() => setIsOpen(false)}
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
            className={`${linkClass} ${!isOpen ? "justify-center" : "justify-start"}`}
          >
            <img
              src={homeIcon}
              alt="Home"
              className="w-6 h-6 min-w-[24px] min-h-[24px]"
            />
            {isOpen && "Home"}
          </NavLink>

          <NavLink
            to="/friends"
            className={`${linkClass} ${!isOpen ? "justify-center" : "justify-start"}`}
          >
            <img
              src={friendIcon}
              alt="Friends"
              className="w-6 h-6 min-w-[24px] min-h-[24px]"
            />
            {isOpen && "Friends"}
          </NavLink>

          <NavLink
            to="/result"
            className={`${linkClass} ${!isOpen ? "justify-center" : "justify-start"}`}
          >
            <img
              src={resultIcon}
              alt="Result"
              className="w-6 h-6 min-w-[24px] min-h-[24px]"
            />
            {isOpen && "Result"}
          </NavLink>

          <NavLink
            to="/voice"
            className={`${linkClass} ${!isOpen ? "justify-center" : "justify-start"}`}
          >
            <img
              src={voiceIcon}
              alt="TalkHive"
              className="w-6 h-6 min-w-[24px] min-h-[24px]"
            />
            {isOpen && "TalkHive"}
          </NavLink>

          <NavLink
            to="/department"
            className={`${linkClass} ${!isOpen ? "justify-center" : "justify-start"}`}
          >
            <img
              src={departmentIcon}
              alt="Department"
              className="w-6 h-6 min-w-[24px] min-h-[24px]"
            />
            {isOpen && "Department"}
          </NavLink>
          
          <NavLink
            to="/library"
            className={`${linkClass} ${!isOpen ? "justify-center" : "justify-start"}`}
          >
            <img
              src={libraryIcon}
              alt="Library"
              className="w-6 h-6 min-w-[24px] min-h-[24px]"
            />
            {isOpen && "Library"}
          </NavLink>

          <NavLink
            to="/hostel"
            className={`${linkClass} ${!isOpen ? "justify-center" : "justify-start"}`}
          >
            <img
              src={hostelIcon}
              alt="Hostel"
              className="w-6 h-6 min-w-[24px] min-h-[24px]"
            />
            {isOpen && "Hostel"}
          </NavLink>

          <NavLink
            to="/club"
            className={`${linkClass} ${!isOpen ? "justify-center" : "justify-start"}`}
          >
            <img
              src={clubIcon}
              alt="Club"
              className="w-6 h-6 min-w-[24px] min-h-[24px]"
            />
            {isOpen && "Club"}
          </NavLink>

          <NavLink
            to="/admin"
            className={`${linkClass} ${!isOpen ? "justify-center" : "justify-start"}`}
          >
            <img
              src={adminIcon}
              alt="Admin"
              className="w-6 h-6 min-w-[24px] min-h-[24px]"
            />
            {isOpen && "Admin"}
          </NavLink>

          <NavLink
            to="/interaction"
            className={`${linkClass} ${!isOpen ? "justify-center" : "justify-start"}`}
          >
            <img
              src={interactionIcon}
              alt="Interaction"
              className="w-6 h-6 min-w-[24px] min-h-[24px]"
            />
            {isOpen && "Interaction"}
          </NavLink>
        </nav>
      </div>

      {/* Profile & Dropdown */}
      <div className="relative" ref={menuRef}>
        <div
          onClick={() => setMenuOpen(!menuOpen)}
          className={`flex items-center gap-3 mt-6 bg-gray-100 p-3 rounded-lg shadow-inner cursor-pointer hover:bg-gray-200 ${
            !isOpen ? "justify-center" : ""
          }`}
        >
          <img
            src="https://via.placeholder.com/40"
            alt="Profile"
            className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-full"
          />
          {isOpen && (
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