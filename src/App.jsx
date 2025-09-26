import React, { useState, useEffect, useRef } from "react";
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

  // Safely retrieve authData and loading state from the context
  const { authData, instituteData, loading } = useAuth();

  const headerRef = useRef(null);
  const [headerHeight, setHeaderHeight] = useState("0px");

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

  // Use instituteData from the context directly
  const instituteName = instituteData?.instituteName || "Your Institute";
  const instituteLogo = instituteData?.instituteLogo || null;

  // FIX: Determine user role by checking if the designation is 'Librarian' AND 
  // the userType is either 'Official' or 'Other' (matching your MongoDB structure).
  const isLibrarianDesignation = authData?.designation === "Librarian";
  const isLibrarianUserType = authData?.userType === "Librarian";
  const isLibrarianRole = isLibrarianUserType || 
                         (isLibrarianDesignation && 
                          (authData?.userType === "Official" || authData?.userType === "Other"));

  const userRole = isLibrarianRole ? 'librarian' : 'user';

  // CONDITIONAL RENDERING: Display a loading message while auth data is being fetched
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <h1 className="text-xl font-bold">Loading...</h1>
      </div>
    );
  }

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
            paddingTop: `calc(${headerHeight} + 0.1rem)`,
          }}
        >
          {!hideSidebar && (
            <InstituteHeader
              ref={headerRef}
              isSidebarOpen={isSidebarOpen}
              instituteName={instituteName}
              instituteLogo={instituteLogo}
            />
          )}

          <Routes>
            <Route path="/auth" element={<AuthPage />} />
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
              <Route path="/Library" element={<Library userRole={userRole} />} />
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
