import React, { useState /*, useEffect, useRef*/ } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import InstituteHeader from "./pages/InstituteHeader";
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
import Library from "./pages/Library";
import Hostel from "./pages/Hostel";
import Club from "./pages/Club";

export default function App() {
  const location = useLocation();
  const hideSidebar = location.pathname === "/auth";
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Read auth data once
  const authData = JSON.parse(localStorage.getItem("auth") || "{}");
  const instituteName = authData.instituteName || "Your Institute";
  const instituteLogo = authData.logo || null;

  return (
    <div
      className="relative min-h-screen w-full"
      style={{
        background:
          "linear-gradient(to bottom, #d6f8df, rgb(227, 224, 250), #88e4f4)",
        backgroundAttachment: "fixed",
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
            paddingTop: "7rem", // Fixed padding for header space
          }}
        >
          {/* Institute Header */}
          {!hideSidebar && (
            <InstituteHeader
              isSidebarOpen={isSidebarOpen}
              instituteName={instituteName}
              instituteLogo={instituteLogo}
            />
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
            <Route path="/Library" element={<Library />} /> 
            <Route path="/hostel" element={<Hostel />} />
            <Route path="/club" element={<Club />} />           
          </Routes>
        </div>
      </div>
    </div>
  );
}