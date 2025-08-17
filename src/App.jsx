import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Home from "./pages/Home";
import Friend from "./pages/Friend";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Logout from "./pages/Logout";
import AuthPage from "./pages/AuthPage";
import Department from "./pages/Department"; // ✅ NEW PAGE
import Result from "./pages/Result"; // ✅ NEW PAGE
import Voice from "./pages/Voice"; // ✅ NEW PAGE

export default function App() {
  const location = useLocation();

  // Hide sidebar & header on /auth page
  const hideSidebar = location.pathname === "/auth";

  // Get institute data from localStorage (saved during registration)
  const authData = JSON.parse(localStorage.getItem("auth") || "{}");
  const instituteName = authData.instituteName || "Your Institute";
  const instituteLogo = authData.logo || null;

  return (
    <div
      className="flex min-h-screen"
      style={{
        background:
          "linear-gradient(to bottom, #d6f8df, rgb(227, 224, 250), #88e4f4)",
      }}
    >
      {/* Sidebar (hidden on auth page) */}
      {!hideSidebar && <Sidebar />}

      {/* Main content */}
      <div className="flex-1 p-6 relative">
        {/* ✅ Institute Logo + Name Box */}
        {!hideSidebar && (
          <div
            className="absolute top-6 left-1/2 transform -translate-x-1/2 rounded-2xl px-8 py-4 flex items-center gap-4 z-20 shadow-lg"
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

          {/* ✅ NEW ROUTES for Sidebar buttons */}
          <Route path="/department" element={<Department />} />
          <Route path="/result" element={<Result />} />
          <Route path="/voice" element={<Voice />} />
        </Routes>
      </div>
    </div>
  );
}
