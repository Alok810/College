import React, { useState, useEffect, useRef } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Home from "./pages/Home";
import Friend from "./pages/Friend";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Logout from "./pages/Logout";
import AuthPage from "./pages/AuthPage";
import Department from "./pages/Department";
import Result from "./pages/Result";
import Voice from "./pages/Voice";
import Admin from "./pages/Admin";
import Interaction from "./pages/Interaction";

export default function App() {
  const location = useLocation();
  const hideSidebar = location.pathname === "/auth";

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const headerRef = useRef(null); // Ref to measure header height
  const [headerHeight, setHeaderHeight] = useState(0);

  const authData = JSON.parse(localStorage.getItem("auth") || "{}");
  const instituteName = authData.instituteName || "Your Institute";
  const instituteLogo = authData.logo || null;

  // Update headerHeight dynamically
  useEffect(() => {
    if (headerRef.current) {
      setHeaderHeight(headerRef.current.offsetHeight + 12); // +12px margin
    }
  }, [headerRef, isSidebarOpen]);

  return (
    <div
      className="relative min-h-screen w-full"
      style={{
        background:
          "linear-gradient(to bottom, #d6f8df, rgb(227, 224, 250), #88e4f4)",
        backgroundAttachment: "fixed", // ✅ Makes background fixed
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
      }}
    >
      {/* Overlay flex container for sidebar + main content */}
      <div className="flex min-h-screen transition-all duration-300">
        {/* Sidebar */}
        {!hideSidebar && (
          <div className="fixed left-0 top-0 h-screen transition-all duration-300 z-20">
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
          </div>
        )}

        {/* Main content */}
        <div
          className="flex-1 p-6 overflow-y-auto transition-all duration-300 z-10"
          style={{
            marginLeft: !hideSidebar ? (isSidebarOpen ? "16rem" : "5rem") : "0",
            paddingTop: headerHeight, // Dynamically adjust top padding
          }}
        >
          {/* Institute Header */}
          {!hideSidebar && (
            <div
              ref={headerRef}
              className="fixed top-4 left-1/2 transform -translate-x-1/2 rounded-2xl px-8 py-3 flex items-center gap-4 z-30 shadow-lg transition-all duration-300"
              style={{
                background:
                  "linear-gradient(to right, #d6f8df, rgb(227,224,250), #88e4f4)",
              }}
            >
              {instituteLogo ? (
                <img
                  src={instituteLogo}
                  alt="Institute Logo"
                  className="w-14 h-14 object-contain rounded-md"
                />
              ) : (
                <div className="w-14 h-14 flex items-center justify-center bg-gray-200 rounded-md text-gray-600 text-sm">
                  LOGO
                </div>
              )}
              <span
                className="font-semibold text-xl whitespace-nowrap drop-shadow-sm"
                style={{ color: "#2d2d6f" }}
              >
                {instituteName}
              </span>
            </div>
          )}

          {/* Routes */}
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/friends" element={<Friend />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/logout" element={<Logout />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/department" element={<Department />} />
            <Route path="/result" element={<Result />} />
            <Route path="/voice" element={<Voice />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/interaction" element={<Interaction />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}
