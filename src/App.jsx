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
import Tab from "./components/Tab";

import { AuthProvider, useAuth } from "./context/AuthContext";
import { FriendProvider } from "./context/FriendContext";
import { ChatProvider } from "./context/ChatContext"; // <-- 1. IMPORT THE CHAT PROVIDER
import ProtectedRoute from "./components/ProtectedRoute";
import { checkBackendConnection } from "./api";

// --- IMPORT ONLY POSTS DATA ---
import { dummyPosts } from "./assets/data.js";

const AppContent = () => {
  const location = useLocation();
  const hideSidebar =
    location.pathname === "/auth" || location.pathname === "/reset-password";
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const { authData, instituteData, loading } = useAuth();

  const headerRef = useRef(null);
  const [headerHeight, setHeaderHeight] = useState("0px");

  // === POSTS STATE ===
  const [posts, setPosts] = useState(dummyPosts);

  const handleAddPost = (newPostData) => {
    setPosts(prevPosts => [newPostData, ...prevPosts]);
  };

  // === 2. ALL FRIEND STATE AND HANDLERS ARE REMOVED ===
  // ... (this section is now empty) ...


  // --- START: MODIFIED LOGIC FOR CUSTOM HOME PAGE ALIGNMENT ---
  const isHomePage = location.pathname === "/";
  const HEADER_SHIFT_LEFT = -75;
  const CONTENT_SHIFT_RIGHT = 75;
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

  const isLibrarianDesignation = authData?.designation === "Librarian";
  const isLibrarianUserType = authData?.userType === "Librarian";
  const isLibrarianRole =
    isLibrarianUserType ||
    (isLibrarianDesignation &&
      (authData?.userType === "Official" || authData?.userType === "Other"));
  const userRole = isLibrarianRole ? "librarian" : "user";

  const contentMarginLeft = !hideSidebar
    ? isSidebarOpen
      ? "16rem"
      : "5rem"
    : "0";
  const contentPaddingTop = `calc(${headerHeight} + 1.5rem)`;
  const homePageRightPadding = isHomePage ? "lg:pr-80" : "";
  const maskCutoffLine = `calc(${contentPaddingTop} - 0.40rem)`;

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
      className="relative min-h-screen w-full overflow-x-hidden"
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

        {/* This outer div ONLY handles positioning (the margin-left) */}
        <div
          className="flex-1 transition-all duration-300"
          style={{
            marginLeft: contentMarginLeft,
          }}
        >
          {/* The Header is a sibling to the scrolling content */}
          {!hideSidebar && (
            <InstituteHeader
              ref={headerRef}
              isSidebarOpen={isSidebarOpen}
              instituteName={instituteName}
              instituteLogo={instituteLogo}
              horizontalOffset={headerOffset} // Pass header-specific offset
            />
          )}

          {/* This inner div is the SCROLLING container */}
          <div
            className={`p-6 overflow-y-auto overflow-x-hidden z-10 ${homePageRightPadding} custom-scrollbar`}
            style={{
              paddingTop: contentPaddingTop,
              height: "100vh",
              WebkitMaskImage: `linear-gradient(
                to bottom, 
                transparent ${maskCutoffLine}, 
                black ${maskCutoffLine}
              )`,
              maskImage: `linear-gradient(
                to bottom, 
                transparent ${maskCutoffLine}, 
                black ${maskCutoffLine}
              )`,
            }}
          >
            {/* The Routes (and your feed) are inside the mask */}
            <Routes>
              <Route element={<ProtectedRoute />}>
                <Route
                  path="/"
                  element={<Home posts={posts} contentOffset={contentOffset} />}
                />

                {/* --- 3. CLEANED UP ROUTES --- */}
                {/* No more props! Friend will get data from context. */}
                <Route path="/friends" element={<Friend />} />

                {/* Profile still needs 'isSidebarOpen' and 'posts', but no friend props. */}
                <Route
                  path="/profile"
                  element={
                    <Profile
                      isSidebarOpen={isSidebarOpen}
                      posts={posts}
                    />
                  }
                />
                <Route
                  path="/profile/:ProfileId"
                  element={
                    <Profile
                      isSidebarOpen={isSidebarOpen}
                      posts={posts}
                    />
                  }
                />

                <Route path="/settings" element={<Settings />} />
                <Route path="/logout" element={<Logout />} />
                <Route path="/department" element={<Department />} />
                <Route path="/result" element={<Result />} />
                <Route path="/voice" element={<Voice />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/interaction" element={<Interaction />} />
                <Route
                  path="/library"
                  element={<Library userRole={userRole} />}
                />
                <Route path="/hostel" element={<Hostel />} />
                <Route path="/club" element={<Club />} />
              </Route>
              {/* These routes are outside the ProtectedRoute */}
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
            </Routes>
          </div>
        </div>

        {/* This is the Tab component (right sidebar) */}
        {!hideSidebar && isHomePage && (
          <div className="hidden lg:block fixed top-0 right-0 w-80 h-screen py-4 pr-4 z-40">
            {/* Pass the 'handleAddPost' function to Tab */}
            <Tab onPostCreated={handleAddPost} />
          </div>
        )}
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      {/* --- 4. WRAP AppContent WITH THE FriendProvider --- */}
      <FriendProvider>
        {/* 2. WRAP WITH THE CHAT PROVIDER */}
        <ChatProvider>
          <AppContent />
        </ChatProvider>
      </FriendProvider>
    </AuthProvider>
  );
}