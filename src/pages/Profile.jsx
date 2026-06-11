import React, { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useParams, useSearchParams } from "react-router-dom";

import { useFriends } from "../context/FriendContext";
import { useAuth } from "../context/AuthContext";
import { getUserById } from "../api";

import EditProfile from "../components/EditProfile";
import ProfileMainContent from "../components/profile/ProfileMainContent";
import { DesktopProfileHeader, MobileTabBar } from "../components/profile/ProfileHeaders";
import { DesktopProfileSidebar, MobileProfileSidebar } from "../components/profile/ProfileSidebars";

const Loading = () => (
  <div className="flex justify-center items-center min-h-screen">
    <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
  </div>
);

const Profile = ({ posts: allPosts }) => {
  const { ProfileId } = useParams();
  const { authData, instituteData } = useAuth();
  const isCurrentUser = !ProfileId || ProfileId === authData?._id;

  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'posts';

  const {
    friends,
    requests,
    suggestions,
    handleAcceptRequest,
    handleAddFriend,
    handleCancelRequest,
    handleUnfriend,
    fetchSocialDataOnDemand,
  } = useFriends();

  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [showEdit, setShowEdit] = useState(false);
  const [friendshipStatus, setFriendshipStatus] = useState("not_friends");

  const [resumeViewMode, setResumeViewMode] = useState("web");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  const handleTabChange = (tabId) => {
    setSearchParams({ tab: tabId });
  };

  useEffect(() => {
    fetchSocialDataOnDemand();
  }, [fetchSocialDataOnDemand]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      if (isCurrentUser) setUser(authData);
      else {
        try {
          const fetchedUser = await getUserById(ProfileId);
          setUser(fetchedUser);
        } catch (error) {
          console.error("Failed to fetch user:", error);
        }
      }
    };
    fetchUser();
  }, [ProfileId, isCurrentUser, authData]);

  useEffect(() => {
    if (allPosts && user) {
      const profilePosts = allPosts.filter((post) => post.user?._id === user._id);
      setPosts(profilePosts);
    }
  }, [allPosts, user]);

  useEffect(() => {
    if (ProfileId && ProfileId !== authData?._id) {
      if (friends?.some((friend) => friend?._id === ProfileId)) {
        setFriendshipStatus("friends");
      } else if (requests?.some((req) => req?._id === ProfileId)) {
        setFriendshipStatus("request_received");
      } else if (suggestions?.some((sug) => sug?._id === ProfileId && sug?.requestSent)) {
        setFriendshipStatus("request_sent");
      } else {
        setFriendshipStatus("not_friends");
      }
    }
  }, [ProfileId, friends, requests, suggestions, isCurrentUser, authData]);

  if (!user) return <Loading />;

  let friendsToDisplay = isCurrentUser ? friends : (user?.friends || []);

  if (!isCurrentUser && friendshipStatus === "friends") {
    const amIInTheirList = friendsToDisplay.some(f => f._id === authData?._id);
    
    if (!amIInTheirList && authData) {
      friendsToDisplay = [
        {
          _id: authData._id,
          name: authData.name,
          full_name: authData.full_name,
          profilePicture: authData.profilePicture,
          instituteId: authData.instituteId,
          instituteName: instituteData?.instituteName || "Connected"
        },
        ...friendsToDisplay
      ];
    }
  }

  // 📱 MOBILE RENDER
  if (isMobile) {
    return (
      <div className="w-full flex flex-col px-0 py-0 bg-gray-50/30 min-h-screen relative overflow-x-hidden">
        
        {/* 🟢 FIXED: Added -mt-5 to pull the profile card up closer to the Institute Header! */}
        <div className="w-full px-3 flex flex-col gap-4 -mt-4">
          
          <MobileProfileSidebar
            user={user}
            isCurrentUser={isCurrentUser}
            friendshipStatus={friendshipStatus}
            onFriendAction={(action) => {
              if (action === "add") handleAddFriend(ProfileId);
              if (action === "cancel") handleCancelRequest(ProfileId);
              if (action === "unfriend") handleUnfriend(ProfileId);
              if (action === "accept") handleAcceptRequest(ProfileId);
            }}
          />
          
          <div className="w-full pb-6">
            <ProfileMainContent
              user={user}
              posts={posts}
              activeTab={activeTab}
              friendsList={friendsToDisplay} 
              isCurrentUser={isCurrentUser}
              instituteLogo={instituteData?.instituteLogo || instituteData?.logo?.url}
              resumeViewMode={resumeViewMode}
              setResumeViewMode={setResumeViewMode}
              friendshipStatus={friendshipStatus}
            />
          </div>

        </div>

        <MobileTabBar activeTab={activeTab} handleTabChange={handleTabChange} isCurrentUser={isCurrentUser} setShowEdit={setShowEdit} />
        {showEdit && isCurrentUser && <EditProfile user={user} setShowEdit={setShowEdit} setUser={setUser} />}
      </div>
    );
  }

  // 💻 DESKTOP RENDER
  return (
    <div className="pt-1.5 w-full">
      <div className="w-full max-w-[1100px] mx-auto px-4 relative flex items-start justify-center gap-4 lg:gap-6 lg:h-[calc(100vh-5rem)]">
        <div className="hidden lg:block w-[260px] shrink-0 sticky top-[0.5rem] -mt-6 h-fit max-h-[calc(100vh-8rem)]">
          <DesktopProfileSidebar
            user={user}
            isCurrentUser={isCurrentUser}
            friendshipStatus={friendshipStatus}
            onFriendAction={(action) => {
              if (action === "add") handleAddFriend(ProfileId);
              if (action === "cancel") handleCancelRequest(ProfileId);
              if (action === "unfriend") handleUnfriend(ProfileId);
              if (action === "accept") handleAcceptRequest(ProfileId);
            }}
          />
        </div>
        <div className="flex-1 min-w-[400px] flex flex-col h-full">
          <DesktopProfileHeader activeTab={activeTab} handleTabChange={handleTabChange} isCurrentUser={isCurrentUser} setShowEdit={setShowEdit} resumeViewMode={resumeViewMode} setResumeViewMode={setResumeViewMode} />
          <div className="flex-grow overflow-y-scroll mt-4 pb-10" style={{ msOverflowStyle: "none", scrollbarWidth: "none" }}>
            <ProfileMainContent
              user={user}
              posts={posts}
              activeTab={activeTab}
              friendsList={friendsToDisplay}
              isCurrentUser={isCurrentUser}
              instituteLogo={instituteData?.instituteLogo || instituteData?.logo?.url}
              resumeViewMode={resumeViewMode}
              setResumeViewMode={setResumeViewMode}
              friendshipStatus={friendshipStatus}
            />
          </div>
        </div>
      </div>
      {showEdit && isCurrentUser && <EditProfile user={user} setShowEdit={setShowEdit} setUser={setUser} />}
    </div>
  );
};

export default Profile;