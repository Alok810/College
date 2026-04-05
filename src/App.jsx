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
import Tab from "./components/Tab";

import { AuthProvider, useAuth } from "./context/AuthContext";
import { FriendProvider } from "./context/FriendContext";
import { ChatProvider } from "./context/ChatContext";
import ProtectedRoute from "./components/ProtectedRoute";

import { checkBackendConnection, getSocialFeed } from "./api";

import BottomNav from "./components/BottomNav";
import SearchSidebar from "./components/SearchSidebar";
import CreatePost from "./components/CreatePost";
import MessageSidebar from "./components/Message";
import NotificationSidebar from "./components/NotificationSidebar";
import InstallPrompt from './components/InstallPrompt'; // ✅ Added Import

const AppContent = () => {
  const location = useLocation();
  const hideSidebar =
    location.pathname === "/auth" || location.pathname === "/reset-password";
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // ✅ MOBILE DETECTION & MODAL CONTROLLER
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [activeMobileModal, setActiveMobileModal] = useState(null);

  const { authData, instituteData, loading } = useAuth();
  const headerRef = useRef(null);
  const [headerHeight, setHeaderHeight] = useState("0px");

  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchFeed = async () => {
      if (!authData) return;
      setIsFetching(true);

      try {
        const feedData = await getSocialFeed(page, 10);

        setPosts((prevPosts) => {
          if (page === 1) return feedData.posts;

          const newPosts = feedData.posts.filter(
            (newPost) => !prevPosts.some((p) => p._id === newPost._id),
          );
          return [...prevPosts, ...newPosts];
        });

        setHasMore(feedData.hasMore);
      } catch (error) {
        console.error("Failed to load feed:", error.message);
      } finally {
        setIsFetching(false);
      }
    };

    fetchFeed();
  }, [authData, page]);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollHeight - scrollTop <= clientHeight + 100) {
      if (!isFetching && hasMore) {
        setPage((prevPage) => prevPage + 1);
      }
    }
  };

  const handleAddPost = (newPostData) => {
    setPosts((prevPosts) => [newPostData, ...prevPosts]);
  };

  const isHomePage = location.pathname === "/";
  const HEADER_SHIFT_LEFT = -75;
  const CONTENT_SHIFT_RIGHT = 75;
  const headerOffset = isHomePage ? HEADER_SHIFT_LEFT : 0;
  const contentOffset = isHomePage ? CONTENT_SHIFT_RIGHT : 0;

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

  const contentMarginLeft =
    hideSidebar || isMobile ? "0" : isSidebarOpen ? "16rem" : "5rem";

  const contentPaddingTop = `calc(${headerHeight} + 2rem)`;
  const homePageRightPadding = isHomePage ? "lg:pr-80" : "";
  const maskCutoffLine = `calc(${contentPaddingTop} - 0.40rem)`;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-white shadow-xl">
        <div className="w-12 h-12 border-4 border-t-4 border-purple-600 rounded-full animate-spin mb-4"></div>
        <h1 className="text-xl font-bold text-gray-700">Loading...</h1>
      </div>
    );
  }

  return (
    <div
      className="relative h-[100dvh] w-full overflow-hidden"
      style={{
        background:
          "linear-gradient(to bottom, #d6f8df, rgb(227, 224, 250), #88e4f4)",
        backgroundAttachment: "fixed",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
      }}
    >
     <div className="flex h-[100dvh] transition-all duration-300">
        
        {/* ✅ CHANGED: Set z-40 here so the entire sidebar stays under the header globally */}
        {!hideSidebar && (
          <div className="fixed left-0 top-0 h-[100dvh] transition-all duration-300 z-40">
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
          </div>
        )}

        <div
          className="flex-1 h-[100dvh] transition-all duration-300 relative"
          style={{ marginLeft: contentMarginLeft }}
        >
          {/* ✅ CHANGED: Set z-50 here so the Institute Header is always the top layer (even on mobile!) */}
          {!hideSidebar && (
            <div className="relative z-50">
              <InstituteHeader
                ref={headerRef}
                isSidebarOpen={isSidebarOpen}
                instituteName={instituteName}
                instituteLogo={instituteLogo}
                horizontalOffset={headerOffset}
              />
            </div>
          )}

          <div
            className={`px-0 pb-32 md:px-6 md:pb-6 overflow-y-auto overflow-x-hidden z-10 ${homePageRightPadding} custom-scrollbar`}
// ... rest of your code continues normally
            onScroll={handleScroll}
            style={{
              paddingTop: contentPaddingTop,
              height: "100%",
              WebkitMaskImage: `linear-gradient(to bottom, transparent ${maskCutoffLine}, black ${maskCutoffLine})`,
              maskImage: `linear-gradient(to bottom, transparent ${maskCutoffLine}, black ${maskCutoffLine})`,
            }}
          >
            <Routes>
              <Route element={<ProtectedRoute />}>
                <Route
                  path="/"
                  element={
                    <>
                      <Home posts={posts} contentOffset={contentOffset} />
                      {isFetching && page > 1 && (
                        <div className="flex justify-center my-4">
                          <div className="w-6 h-6 border-2 border-t-2 border-purple-600 rounded-full animate-spin"></div>
                        </div>
                      )}
                    </>
                  }
                />

                <Route path="/friends" element={<Friend />} />
                <Route
                  path="/profile"
                  element={<Profile isSidebarOpen={isSidebarOpen} posts={posts} />}
                />
                <Route
                  path="/profile/:ProfileId"
                  element={<Profile isSidebarOpen={isSidebarOpen} posts={posts} />}
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

              <Route path="/auth" element={<AuthPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
            </Routes>
          </div>
        </div>

        {/* Desktop Tab Sidebar */}
        {!hideSidebar && isHomePage && (
          <div className="hidden lg:block fixed top-0 right-0 w-80 h-[100dvh] py-4 pr-4 z-40">
            <Tab onPostCreated={handleAddPost} />
          </div>
        )}

        {/* ✅ MOBILE BOTTOM NAVIGATION, MODALS, AND INSTALL PROMPT */}
        {!hideSidebar && (
          <>
            <InstallPrompt /> {/* PWA Install Prompt Component */}
            
            <BottomNav
              activeModal={activeMobileModal}
              setActiveModal={setActiveMobileModal}
            />

            {isMobile && activeMobileModal === "search" && (
              <SearchSidebar
                isExpanded={true}
                onClose={() => setActiveMobileModal(null)}
              />
            )}

            {isMobile && activeMobileModal === "post" && (
              <CreatePost
                onClose={() => setActiveMobileModal(null)}
                onPostCreated={(post) => {
                  handleAddPost(post);
                  setActiveMobileModal(null);
                }}
              />
            )}

            {isMobile && activeMobileModal === "messages" && (
              <MessageSidebar
                isExpanded={true}
                onClose={() => setActiveMobileModal(null)}
              />
            )}

            {isMobile && activeMobileModal === "notifications" && (
              <NotificationSidebar
                isExpanded={true}
                onClose={() => setActiveMobileModal(null)}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <FriendProvider>
        <ChatProvider>
          <AppContent />
        </ChatProvider>
      </FriendProvider>
    </AuthProvider>
  );
}