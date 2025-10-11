import React, { useState, useEffect, useRef } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
// Your original imports
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

  const { authData, instituteData, loading } = useAuth();

  const headerRef = useRef(null);
  const [headerHeight, setHeaderHeight] = useState("0px");

  // --- START: MODIFIED LOGIC FOR CUSTOM HOME PAGE ALIGNMENT ---
  const isHomePage = location.pathname === '/';

  // Tweak these values to get the perfect alignment
  const HEADER_SHIFT_LEFT = -85; // Negative value shifts header left
  const CONTENT_SHIFT_RIGHT = 85; // Positive value shifts content right

  // Apply offsets only on the home page, otherwise they are 0
  const headerOffset = isHomePage ? HEADER_SHIFT_LEFT : 0;
  const contentOffset = isHomePage ? CONTENT_SHIFT_RIGHT : 0;
  // --- END: MODIFIED LOGIC ---

  useEffect(() => {
    if (headerRef.current) {
      setHeaderHeight(`${headerRef.current.offsetHeight}px`);
    }
  }, [isSidebarOpen, instituteData]);

  useEffect(() => {
    const testConnection = async () => {
      try {
        const status = await checkBackendConnection();
        console.log("✅ Frontend received confirmation:", status.message);
      } catch {
        console.error("❌ Frontend failed to connect to backend.");
      }
    };
    testConnection();
  }, []);

  const instituteName = instituteData?.instituteName || "Your Institute";
  const instituteLogo = instituteData?.instituteLogo || null;

  // Logic to determine if the user is a Librarian
  const isLibrarianDesignation = authData?.designation === "Librarian";
  const isLibrarianUserType = authData?.userType === "Librarian";
  const isLibrarianRole = isLibrarianUserType ||
    (isLibrarianDesignation &&
      (authData?.userType === "Official" || authData?.userType === "Other"));

  const userRole = isLibrarianRole ? 'librarian' : 'user';

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white shadow-xl">
        <div className="w-12 h-12 border-4 border-t-4 border-purple-600 rounded-full animate-spin mb-4"></div>
        <h1 className="text-xl font-bold text-gray-700">Loading...</h1>
      </div>
    );
  }

  return (
    <div
      // 🛑 MODIFIED CLASS: Added 'overflow-x-hidden' to the main root wrapper
      className="relative min-h-screen w-full **overflow-x-hidden**"
      style={{
        background: "linear-gradient(to bottom, #d6f8df, rgb(227, 224, 250), #88e4f4)",
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
          // Note: 'overflow-x-hidden' on this inner div is no longer strictly necessary 
          // if it's applied to the root, but keeping it here for safety doesn't hurt.
          className="flex-1 p-6 overflow-y-auto overflow-x-hidden transition-all duration-300 z-10"
          style={{
            marginLeft: !hideSidebar ? (isSidebarOpen ? "16rem" : "5rem") : "0",
            paddingTop: `calc(${headerHeight} + 1.5rem)`,
          }}
        >
          {!hideSidebar && (
            <InstituteHeader
              ref={headerRef}
              isSidebarOpen={isSidebarOpen}
              instituteName={instituteName}
              instituteLogo={instituteLogo}
              horizontalOffset={headerOffset} // Pass header-specific offset
            />
          )}
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route element={<ProtectedRoute />}>
              <Route
                path="/"
                element={<Home contentOffset={contentOffset} />} // Pass content-specific offset
              />
              <Route path="/friends" element={<Friend />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/logout" element={<Logout />} />
              <Route path="/department" element={<Department />} />
              <Route path="/result" element={<Result />} />
              <Route path="/voice" element={<Voice />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/interaction" element={<Interaction />} />
              <Route path="/library" element={<Library userRole={userRole} />} />
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