import React, { useState, useEffect, useRef, Suspense } from "react";
// 🟢 1. Added useNavigate to the react-router-dom import
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
// 🟢 2. Imported Capacitor App plugin
import { App as CapacitorApp } from '@capacitor/app';

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
import TalkHiveMenu from "./pages/TalkHive/TalkHiveMenu";
import FocusPod from "./pages/TalkHive/FocusPod";
import HiveMatch from "./pages/TalkHive/HiveMatch";
import BuzzRoom from "./pages/TalkHive/BuzzRoom";
import Assembly from "./pages/TalkHive/Assembly";
import Admin from "./pages/Admin";
import Interaction from "./pages/Interaction";
import Library from "./pages/Library";
import Hostel from "./pages/Hostel";
import Club from "./pages/Club";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
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
import InstallPrompt from './components/InstallPrompt';
import AnnouncementBanner from "./components/AnnouncementBanner";
import AppPromoBanner from "./components/AppPromoBanner";
import ResumeBuilder from './pages/ResumeBuilder';
import { subscribeToOSNotifications } from './utils/pushNotifications'; // Ensure this path matches your folder structure

const HelpDesk = React.lazy(() => import('./pages/HelpDesk'));

const AppContent = () => {
  const location = useLocation();
  const navigate = useNavigate(); // 🟢 3. Initialized navigate for back button routing
  
  const hideSidebar =
    location.pathname === "/auth" ||
    location.pathname === "/reset-password" ||
    location.pathname === "/resume-builder" ||
    location.pathname === "/helpdesk" ||
    location.pathname === "/TalkHive/focus-pod" ||
    location.pathname === "/TalkHive/hive-match";

  const isProfilePage = location.pathname.startsWith("/profile");
  const isClubPage = location.pathname.startsWith("/club");
  const isDeptPage = location.pathname.startsWith("/department");
  const isResultPage = location.pathname.startsWith("/result");
  const isLibraryPage = location.pathname.startsWith("/library");
  const isInteractionPage = location.pathname.startsWith("/interaction");

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [activeMobileModal, setActiveMobileModal] = useState(null);

  const { authData, instituteData, loading, isAuthenticated } = useAuth();
  // 🟢 5. SILENTLY ARM PUSH NOTIFICATIONS ON BOOT
  useEffect(() => {
    // If the user is logged in, attach the Android Firebase listeners!
    // Since permission was already granted, the user won't see a popup.
    if (isAuthenticated) {
        subscribeToOSNotifications();
    }
  }, [isAuthenticated]);

  
  const headerRef = useRef(null);
  const [headerHeight, setHeaderHeight] = useState("0px");

  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetching, setIsFetching] = useState(false);

  // 🟢 4. NATIVE ANDROID BACK BUTTON LISTENER
  useEffect(() => {
    const handleBackButton = ({ canGoBack }) => {
      // If a mobile modal is open, close it first!
      if (activeMobileModal) {
        setActiveMobileModal(null);
        return;
      }

      // If we can go back in the browser history, do it safely via React Router
      if (canGoBack) {
        navigate(-1);
      } else {
        // If at the root of the app, exit to Android home screen
        CapacitorApp.exitApp();
      }
    };

    CapacitorApp.addListener('backButton', handleBackButton);

    // Cleanup the listener when the component unmounts
    return () => {
      CapacitorApp.removeAllListeners();
    };
  }, [activeMobileModal, navigate]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchFeed = async () => {
      if (!authData || !authData._id) return;

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

    if (location.pathname === "/") {
      fetchFeed();
    }
  }, [authData, page, location.pathname]);

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
    const updateHeaderHeight = () => {
      if (headerRef.current) {
        setHeaderHeight(`${headerRef.current.offsetHeight}px`);
      }
    };

    updateHeaderHeight();
    const timeoutId = setTimeout(updateHeaderHeight, 150);
    return () => clearTimeout(timeoutId);
  }, [isSidebarOpen, instituteData, location.pathname]);

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

 const contentPaddingTop = hideSidebar 
    ? "0px" 
    : `calc(env(safe-area-inset-top, 0px) + ${headerHeight} + 2rem)`;

  const homePageRightPadding = isHomePage ? "lg:pr-80" : "";

  // 🟢 Adjusted to align exactly with content padding execution
  const maskCutoffLine = hideSidebar 
    ? "0px" 
    : `calc(env(safe-area-inset-top, 0px) + ${headerHeight} + 2rem)`;

  // 🟢 THE FIX: We removed `&& !isMobile` from the result page check.
  // Now, the result page will lock the outer app scrollbar on BOTH desktop and mobile!
  const lockOuterScroll = (isProfilePage || isClubPage || isDeptPage || isLibraryPage || isInteractionPage) && !isMobile || isResultPage;

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
        backgroundColor: hideSidebar ? "#f9fafb" : "transparent",
        backgroundImage: hideSidebar ? "none" : "linear-gradient(to bottom, #d6f8df, rgb(227, 224, 250), #88e4f4)",
        backgroundAttachment: "fixed",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
      }}
    >
      <AnnouncementBanner />

      <div className="flex h-[100dvh] transition-all duration-300">

        {!hideSidebar && (
          <div className="fixed left-0 top-0 h-[100dvh] transition-all duration-300 z-40">
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
          </div>
        )}

        <div
          className="flex-1 h-[100dvh] transition-all duration-300 relative"
          style={{ marginLeft: contentMarginLeft }}
        >
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
            className={`px-0 md:px-6 ${hideSidebar ? "pb-0 md:pb-0" : lockOuterScroll ? "pb-24 md:pb-4" : "pb-32 md:pb-4"} ${lockOuterScroll ? "overflow-hidden" : "overflow-y-auto"} overflow-x-hidden z-10 ${homePageRightPadding} custom-scrollbar`}
            onScroll={handleScroll}
            style={{
              paddingTop: contentPaddingTop,
              height: "100%",
              // 🟢 FIXED: Forcing absolute hard-stops from 0px to 100% to eliminate the foggy shroud overlay
              WebkitMaskImage: hideSidebar ? "none" : `linear-gradient(to bottom, transparent 0px, transparent ${maskCutoffLine}, black ${maskCutoffLine}, black 100%)`,
              maskImage: hideSidebar ? "none" : `linear-gradient(to bottom, transparent 0px, transparent ${maskCutoffLine}, black ${maskCutoffLine}, black 100%)`,
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
                {/* TalkHive Feature Routes */}
                <Route path="/TalkHive" element={<TalkHiveMenu />} />
                <Route path="/TalkHive/focus-pod" element={<FocusPod />} />
                <Route path="/TalkHive/hive-match" element={<HiveMatch />} />
                <Route path="/TalkHive/buzz-room" element={<BuzzRoom />} />
                <Route path="/TalkHive/assembly" element={<Assembly />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/interaction" element={<Interaction />} />
                <Route path="/superadmin" element={<SuperAdminDashboard />} />
                <Route path="/library" element={<Library userRole={userRole} />} />
                <Route path="/hostel" element={<Hostel />} />
                <Route path="/club" element={<Club />} />
                <Route path="/resume-builder" element={<ResumeBuilder />} />
              </Route>

              {/* Public Routes */}
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />

              <Route
                path="/helpdesk"
                element={
                  <Suspense fallback={
                    <div className="flex h-screen items-center justify-center">
                      <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  }>
                    <HelpDesk />
                  </Suspense>
                }
              />
            </Routes>
          </div>
        </div>

        {/* Desktop Tab Sidebar */}
        {!hideSidebar && isHomePage && (
          <div className="hidden lg:block fixed top-0 right-0 w-80 h-[100dvh] py-4 pr-4 z-40">
            <Tab onPostCreated={handleAddPost} />
          </div>
        )}

        {/* MOBILE BOTTOM NAVIGATION, MODALS, AND INSTALL PROMPT */}
        {!hideSidebar && (
          <>
            <InstallPrompt />

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
        {/* 🟢 NEW: SAFELY ANCHORED PROMO BANNER */}
        {/* We use isHomePage to ensure it ONLY shows on the Home feed */}
        {isHomePage && (
          <div className="fixed bottom-17 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 lg:right-10 lg:bottom-10 z-[100] drop-shadow-2xl pointer-events-auto">
            <AppPromoBanner />
          </div>
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