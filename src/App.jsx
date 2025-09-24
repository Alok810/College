import React, { useState, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import InstituteHeader from "./pages/InstituteHeader";
import Home from "./pages/Home";
import Friend from "./pages/Friend";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Logout from "./pages/Logout";
import AuthPage from "./pages/AuthPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import Department from "./pages/Department";
import Result from "./pages/Result";
import Voice from "./pages/Voice";
import Admin from "./pages/Admin";
import Interaction from "./pages/Interaction";
import Library from "./pages/Library";
import Hostel from "./pages/Hostel";
import Club from "./pages/Club";

import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import { checkBackendConnection } from "./api";

const AppContent = () => {
  const location = useLocation();
  const hideSidebar = location.pathname === "/auth" || location.pathname === "/reset-password";
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // No longer need to destructure anything from useAuth() here.
  useAuth();

  // Removed the connectionStatus state.
  useEffect(() => {
    const testConnection = async () => {
      try {
        const status = await checkBackendConnection();
        console.log("✅ Frontend received confirmation:", status.message);
      } catch {
        // Removed the 'error' variable from the catch block.
        console.error("❌ Frontend failed to connect to backend.");
      }
    };
    testConnection();
  }, []);

  const authData = {};
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
      <div className="flex min-h-screen transition-all duration-300">
        {!hideSidebar && (
          <div className="fixed left-0 top-0 h-screen transition-all duration-300 z-20">
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
          </div>
        )}

        <div
          className="flex-1 p-6 overflow-y-auto transition-all duration-300 z-10"
          style={{
            marginLeft: !hideSidebar ? (isSidebarOpen ? "16rem" : "5rem") : "0",
            paddingTop: "7rem",
          }}
        >
          {/* Removed the div that displayed the connectionStatus on the page */}
          {!hideSidebar && (
            <InstituteHeader
              isSidebarOpen={isSidebarOpen}
              instituteName={instituteName}
              instituteLogo={instituteLogo}
            />
          )}

          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            {/* Added a new route for the password reset page */}
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Home />} />
              <Route path="/friends" element={<Friend />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/logout" element={<Logout />} />
              <Route path="/department" element={<Department />} />
              <Route path="/result" element={<Result />} />
              <Route path="/voice" element={<Voice />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/interaction" element={<Interaction />} />
              <Route path="/Library" element={<Library />} />
              <Route path="/hostel" element={<Hostel />} />
              <Route path="/club" element={<Club />} />
            </Route>
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}