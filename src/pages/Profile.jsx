import React, { useState, useEffect } from "react";
import {
  MapPin,
  Loader2,
  Star,
  MessageSquare,
  Globe,
  User as UserIcon,
  Briefcase,
  GraduationCap,
  Heart,
  Image as ImageIcon,
  Users as FriendsIcon,
  BarChart3,
  Edit,
  UserPlus,
  UserCheck,
  Clock,
} from "lucide-react";
import { useParams, Link } from "react-router-dom";
import PostCard from "../components/PostCard";
import EditProfile from "../components/EditProfile";
import { useFriends } from "../context/FriendContext";
import { useAuth } from "../context/AuthContext";
import { getUserById } from "../api";
import ProfileResults from "../components/ProfileResults";

const Loading = () => (
  <div className="flex justify-center items-center min-h-screen">
    <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
  </div>
);

// ==========================================
// 🧩 SHARED COMPONENTS
// ==========================================
const MediaGallery = ({ posts }) => {
  const allMedia = posts.flatMap((post) => {
    let mediaItems = [];
    if (Array.isArray(post.image_urls) && post.image_urls.length > 0) {
      mediaItems = mediaItems.concat(
        post.image_urls.map((url) => ({
          url: url,
          type: url.match(/\.(mp4|webm|ogg|mov)$/i) ? "video" : "image",
        })),
      );
    }
    return mediaItems
      .map((item) => ({ ...item, postId: post._id }))
      .filter((item) => item.url);
  });

  if (allMedia.length === 0) {
    return (
      <div className="p-10 rounded-xl text-center text-gray-500 w-full bg-white shadow-md border border-gray-100">
        <p>No photos or videos found for this user.</p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-4 bg-white rounded-xl shadow-md border border-gray-100 w-full">
      {allMedia.map((media, index) => (
        <div
          key={`${media.postId}-${index}`}
          className="aspect-square overflow-hidden rounded-lg cursor-pointer hover:opacity-90 transition-opacity duration-200 shadow-sm relative"
        >
          <img
            src={media.url}
            alt={`Gallery image ${index + 1}`}
            className="w-full h-full object-cover"
          />
        </div>
      ))}
    </div>
  );
};

const FriendButton = ({ status, onAdd, onCancel, onAccept, onUnfriend }) => {
  switch (status) {
    case "friends":
      return (
        <button
          onClick={onUnfriend}
          className="flex-1 flex justify-center items-center gap-1.5 py-2 sm:py-2.5 text-sm font-semibold bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition shadow-sm"
        >
          <UserCheck className="w-4 h-4" /> Friends
        </button>
      );
    case "request_sent":
      return (
        <button
          onClick={onCancel}
          className="flex-1 flex justify-center items-center gap-1.5 py-2 sm:py-2.5 text-sm font-semibold bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition shadow-sm"
        >
          <Clock className="w-4 h-4" /> Requested
        </button>
      );
    case "request_received":
      return (
        <button
          onClick={onAccept}
          className="flex-1 flex justify-center items-center gap-1.5 py-2 sm:py-2.5 text-sm font-semibold bg-green-600 text-white rounded-xl hover:bg-green-700 transition shadow-sm"
        >
          <UserPlus className="w-4 h-4" /> Accept
        </button>
      );
    case "not_friends":
    default:
      return (
        <button
          onClick={onAdd}
          className="flex-1 flex justify-center items-center gap-1.5 py-2 sm:py-2.5 text-sm font-semibold bg-gradient-to-r from-purple-600 to-teal-500 text-white rounded-xl hover:opacity-90 transition shadow-sm"
        >
          <UserPlus className="w-4 h-4" /> Add Friend
        </button>
      );
  }
};

const FriendListTab = ({ friends }) => {
  if (!friends || friends.length === 0)
    return (
      <div className="p-10 rounded-xl text-center text-gray-500 w-full bg-white shadow-md border border-gray-100">
        <p>No friends to display.</p>
      </div>
    );
  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4 w-full">
      <h3 className="text-xl font-bold text-gray-800 mb-4">
        Friends ({friends.length})
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {friends.map((friend) => (
          <div
            key={friend._id}
            className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg border border-gray-100"
          >
            <Link to={`/profile/${friend._id}`}>
              <img
                src={friend.profilePicture || "https://via.placeholder.com/150"}
                className="w-14 h-14 rounded-full object-cover shadow-sm bg-white"
              />
            </Link>
            <div className="flex-grow overflow-hidden">
              <Link to={`/profile/${friend._id}`}>
                <h5 className="font-bold text-gray-800 truncate hover:text-purple-600">
                  {friend.full_name}
                </h5>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ProfileMainContent = ({
  user,
  posts,
  activeTab,
  friends,
  isCurrentUser,
  instituteLogo 
}) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center gap-4 w-full">
        {activeTab === "posts" && (
          <>
            {posts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
            {posts.length === 0 && (
              <div className="p-10 rounded-xl text-center text-gray-500 w-full bg-white shadow-md border border-gray-100">
                <p>No posts yet for {user.full_name || user.name}.</p>
              </div>
            )}
          </>
        )}
        {activeTab === "media" && <MediaGallery posts={posts} />}
        {activeTab === "friends" && <FriendListTab friends={friends} />}

        {activeTab === "results" && (
          <ProfileResults
            userId={user._id}
            isCurrentUser={isCurrentUser}
            isResultsPublic={user.isResultsPublic !== false} 
            instituteLogo={instituteLogo} 
          />
        )}
      </div>
    </div>
  );
};

// ==========================================
// 💻 DESKTOP COMPONENTS
// ==========================================
const DesktopProfileHeader = ({
  activeTab,
  setActiveTab,
  isCurrentUser,
  setShowEdit,
}) => {
  const navItems = [
    { name: "Post", icon: Star, tab: "posts" },
    { name: "Media", icon: ImageIcon, tab: "media" },
    { name: "Friend", icon: FriendsIcon, tab: "friends" },
    { name: "Result", icon: BarChart3, tab: "results" },
  ];
  return (
    <div className="sticky top-[0.5rem] z-40 bg-white/95 backdrop-blur-md shadow-md p-1.5 rounded-xl hidden lg:block w-full border border-gray-50 flex-shrink-0">
      <div className="flex justify-between items-center h-full px-2">
        <div className="flex space-x-1">
          {navItems.map((item) => (
            <button
              key={item.name}
              onClick={() => setActiveTab(item.tab)}
              className={`px-4 py-2 text-sm font-bold rounded-lg flex items-center gap-1.5 transition-colors ${activeTab === item.tab ? "bg-gradient-to-r from-purple-600 to-teal-500 text-white shadow-sm" : "text-gray-500 hover:bg-gray-100"}`}
            >
              <item.icon className="w-4 h-4" /> {item.name}
            </button>
          ))}
        </div>
        {isCurrentUser && (
          <button
            className={`px-4 py-2 text-sm font-bold rounded-lg transition duration-150 flex items-center gap-1.5 bg-gradient-to-r from-purple-600 to-teal-500 text-white shadow-sm hover:opacity-90`}
            onClick={() => setShowEdit(true)}
          >
            <Edit className="w-4 h-4" /> Edit Profile
          </button>
        )}
      </div>
    </div>
  );
};

const DesktopProfileSidebar = ({
  user,
  isCurrentUser,
  friendshipStatus,
  onFriendAction,
}) => {
  const scrollbarHideStyle = {
    msOverflowStyle: "none",
    scrollbarWidth: "none",
  };
  const InfoRow = ({ Icon, text, link, linkText }) => {
    if (!text || text.includes("undefined")) return null;
    return (
      <div className="flex items-center text-sm text-gray-700">
        <Icon className="w-4 h-4 mr-3 text-gray-500 flex-shrink-0" />
        {link ? (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-purple-600 truncate font-medium text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-teal-500"
          >
            {linkText || text}
          </a>
        ) : (
          <span className="font-medium text-gray-600">{text}</span>
        )}
      </div>
    );
  };

  return (
    <div
      className="w-full bg-white rounded-xl shadow-lg h-fit max-h-full overflow-y-scroll relative border border-gray-50 pb-4 custom-scrollbar"
      style={scrollbarHideStyle}
    >
      <div className="relative h-28 bg-gray-200 overflow-hidden rounded-t-xl">
        <img
          src={
            user.coverPhoto ||
            "https://images.unsplash.com/photo-1707343843437-caacff5cfa74"
          }
          alt={`Cover`}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
      </div>
      <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border-4 border-white shadow-xl absolute left-1/2 -translate-x-1/2 top-16 z-10 bg-white">
        <img
          src={
            user.profilePicture ||
            `https://ui-avatars.com/api/?name=${user.name || "User"}&background=EBF4FF&color=4F46E5&size=150`
          }
          alt={`Profile`}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4 pt-14">
        <div className="text-center pb-4 mb-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-1">
            {user.full_name || user.name}
          </h2>
          <p className="text-gray-500 text-xs my-0 px-2 leading-snug">
            {user.bio || "Hello! I am using Rigya."}
          </p>
          <div className="mt-0 flex justify-center gap-3">
            {!isCurrentUser ? (
              <div className="flex gap-2 mt-4 px-2 w-full flex-wrap">
                <FriendButton
                  status={friendshipStatus}
                  onAdd={() => onFriendAction("add")}
                  onCancel={() => onFriendAction("cancel")}
                  onAccept={() => onFriendAction("accept")}
                  onUnfriend={() => onFriendAction("unfriend")}
                />
                <Link
                  to={`/?open_chat=${user._id}`}
                  className="flex-1 flex justify-center items-center gap-1.5 py-2 text-xs font-semibold bg-gray-100 text-gray-800 rounded-xl hover:bg-gray-200 transition shadow-sm"
                >
                  <MessageSquare className="w-4 h-4" /> Message
                </Link>
              </div>
            ) : (
              <div className="h-4"></div>
            )}
          </div>
          <div className="mt-2 space-y-3 text-left pt-4 px-1">
            <InfoRow
              Icon={UserIcon}
              text={user.pronouns ? `Pronouns: ${user.pronouns}` : null}
            />
            <InfoRow
              Icon={Briefcase}
              text={user.work ? `Works at ${user.work}` : null}
            />
            <InfoRow
              Icon={GraduationCap}
              text={user.university ? `Studied at ${user.university}` : null}
            />
            <InfoRow
              Icon={MapPin}
              text={user.currentCity ? `Lives in ${user.currentCity}` : null}
            />
            {user.socialLink && (
              <InfoRow
                Icon={Globe}
                text={user.socialLink}
                link={`https://instagram.com/${user.socialLink}`}
                linkText={`@${user.socialLink}`}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 📱 MOBILE COMPONENTS
// ==========================================
const MobileTabBar = ({
  activeTab,
  setActiveTab,
  isCurrentUser,
  setShowEdit,
}) => {
  const navItems = [
    { name: "Posts", icon: Star, tab: "posts" },
    { name: "Media", icon: ImageIcon, tab: "media" },
    { name: "Friends", icon: FriendsIcon, tab: "friends" },
  ];
  return (
    <div className="lg:hidden fixed bottom-[4rem] left-0 right-0 z-40 w-full pointer-events-none">
      <div className="bg-white/95 backdrop-blur-xl border-t border-gray-200 shadow-[0_-4px_15px_-3px_rgba(0,0,0,0.05)] rounded-t-3xl px-6 py-2.5 flex justify-between items-center pointer-events-auto">
        <div className="flex space-x-6 flex-1 justify-center items-center">
          {navItems.map((item) => (
            <button
              key={item.name}
              onClick={() => setActiveTab(item.tab)}
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 flex-shrink-0 ${
                activeTab === item.tab
                  ? "bg-gradient-to-r from-purple-600 to-teal-500 text-white shadow-md transform scale-110"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              <item.icon
                className={`w-5 h-5 ${activeTab === item.tab ? "fill-current" : ""}`}
              />
            </button>
          ))}
        </div>

        {isCurrentUser && (
          <>
            <div className="w-px h-8 bg-gray-200 mx-4 flex-shrink-0"></div>

            <button
              onClick={() => setShowEdit(true)}
              className="w-11 h-11 flex items-center justify-center bg-gray-50 text-gray-700 hover:bg-gray-200 rounded-full transition-colors shadow-sm flex-shrink-0 border border-gray-100"
            >
              <Edit className="w-5 h-5" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

const MobileProfileSidebar = ({
  user,
  isCurrentUser,
  friendshipStatus,
  onFriendAction,
}) => {
  const InfoRow = ({ Icon, text, link, linkText }) => {
    if (!text || text.includes("undefined")) return null;
    return (
      <div className="flex items-center text-sm text-gray-700">
        <Icon className="w-4 h-4 mr-3 text-gray-400 flex-shrink-0" />
        {link ? (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-purple-600 truncate font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-teal-500"
          >
            {linkText || text}
          </a>
        ) : (
          <span className="font-medium text-gray-600">{text}</span>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white relative pb-6 shadow-md border border-gray-100 rounded-2xl mx-3 mt-4">
      <div className="relative h-40 bg-gray-200 overflow-hidden rounded-t-2xl">
        <img
          src={
            user.coverPhoto ||
            "https://images.unsplash.com/photo-1707343843437-caacff5cfa74"
          }
          alt={`Cover`}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
      </div>

      <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-white shadow-xl absolute left-1/2 -translate-x-1/2 top-20 z-10 bg-white">
        <img
          src={
            user.profilePicture ||
            `https://ui-avatars.com/api/?name=${user.name || "User"}&background=EBF4FF&color=4F46E5&size=150`
          }
          alt={`Profile`}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="p-4 pt-16">
        <div className="text-center pb-4 mb-2">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-1">
            {user.full_name || user.name}
          </h2>
          <p className="text-gray-500 text-sm my-0 px-4 leading-relaxed">
            {user.bio || "Hello! I am using Rigya."}
          </p>

          {!isCurrentUser && (
            <div className="flex gap-3 mt-6 px-4 w-full">
              <FriendButton
                status={friendshipStatus}
                onAdd={() => onFriendAction("add")}
                onCancel={() => onFriendAction("cancel")}
                onAccept={() => onFriendAction("accept")}
                onUnfriend={() => onFriendAction("unfriend")}
              />
              <Link
                to={`/?open_chat=${user._id}`}
                className="flex-1 flex justify-center items-center gap-1.5 py-2.5 text-sm font-bold bg-gray-100 text-gray-800 rounded-xl hover:bg-gray-200 transition-all shadow-sm"
              >
                <MessageSquare className="w-4 h-4" /> Message
              </Link>
            </div>
          )}
        </div>

        <div className="space-y-3.5 text-left pt-4 px-5 bg-gray-50/50 mx-2 rounded-2xl border border-gray-100 py-4">
          <InfoRow
            Icon={UserIcon}
            text={user.pronouns ? `Pronouns: ${user.pronouns}` : null}
          />
          <InfoRow
            Icon={Briefcase}
            text={user.work ? `Works at ${user.work}` : null}
          />
          <InfoRow
            Icon={GraduationCap}
            text={user.university ? `Studied at ${user.university}` : null}
          />
          <InfoRow
            Icon={GraduationCap}
            text={user.highSchool ? `Went to ${user.highSchool}` : null}
          />
          <InfoRow
            Icon={MapPin}
            text={user.currentCity ? `Lives in ${user.currentCity}` : null}
          />
          <InfoRow
            Icon={MapPin}
            text={user.hometown ? `From ${user.hometown}` : null}
          />
          <InfoRow
            Icon={Heart}
            text={
              user.relationship && user.relationship !== "Not specified"
                ? user.relationship
                : null
            }
          />
          {user.socialLink && (
            <InfoRow
              Icon={Globe}
              text={user.socialLink}
              link={`https://instagram.com/${user.socialLink}`}
              linkText={`@${user.socialLink}`}
            />
          )}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 🚀 MAIN COMPONENT EXPORT
// ==========================================
const Profile = ({ isSidebarOpen, posts: allPosts }) => {
  const { ProfileId } = useParams();
  const { authData, instituteData } = useAuth(); 
  const isCurrentUser = !ProfileId || ProfileId === authData?._id;

  const {
    friends,
    requests,
    suggestions,
    handleAcceptRequest,
    handleAddFriend,
    handleCancelRequest,
    handleUnfriend,
  } = useFriends();

  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [showEdit, setShowEdit] = useState(false);
  const [activeTab, setActiveTab] = useState("posts");
  const [friendshipStatus, setFriendshipStatus] = useState("not_friends");
  const [friendList, setFriendList] = useState([]);

  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

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
      const profilePosts = allPosts.filter(
        (post) => post.user?._id === user._id,
      );
      setPosts(profilePosts);
    }
  }, [allPosts, user]);

  useEffect(() => {
    if (ProfileId && ProfileId !== authData?._id) {
      if (friends && friends.find((friend) => friend._id === ProfileId))
        setFriendshipStatus("friends");
      else if (requests && requests.find((req) => req._id === ProfileId))
        setFriendshipStatus("request_received");
      else if (
        suggestions &&
        suggestions.find((sug) => sug._id === ProfileId && sug.requestSent)
      )
        setFriendshipStatus("request_sent");
      else setFriendshipStatus("not_friends");
    }
    if (isCurrentUser) setFriendList(friends);
    else setFriendList([]);
    setActiveTab("posts");
  }, [ProfileId, friends, requests, suggestions, isCurrentUser]);

  if (!user) return <Loading />;

  // 📱 MOBILE RENDER
  if (isMobile) {
    return (
      <div className="w-full flex flex-col px-0 py-0 bg-gray-50/30 min-h-screen relative">
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

        <div className="w-full flex-grow pt-4 px-3 pb-32 overflow-visible">
          <ProfileMainContent
            user={user}
            posts={posts}
            activeTab={activeTab}
            friends={friendList}
            instituteLogo={instituteData?.instituteLogo || instituteData?.logo?.url}
          />
        </div>

        <MobileTabBar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isCurrentUser={isCurrentUser}
          setShowEdit={setShowEdit}
        />

        {showEdit && isCurrentUser && (
          <EditProfile
            user={user}
            setShowEdit={setShowEdit}
            setUser={setUser}
          />
        )}
      </div>
    );
  }

  // 💻 DESKTOP RENDER
  return (
    // ✅ 1. REMOVED ALL custom manual margins and translations. Let App.jsx handle the push!
    <div className="pt-1.5 w-full">
      {/* ✅ 2. Cleaned up the flex container to center itself dynamically (mx-auto handles the math perfectly as the width shrinks/grows) */}
      <div className="w-full max-w-[1100px] mx-auto px-4 relative flex items-start justify-center gap-4 lg:gap-6 lg:h-[calc(100vh-5rem)]">
        
        {/* Fixed Sidebar Container */}
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

        {/* ✅ 3. ADDED min-w-[400px] so the content refuses to squish internally! */}
        <div className="flex-1 min-w-[400px] flex flex-col h-full">
          <DesktopProfileHeader
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            isCurrentUser={isCurrentUser}
            setShowEdit={setShowEdit}
          />
          <div
            className="flex-grow overflow-y-scroll mt-4 pb-10"
            style={{ msOverflowStyle: "none", scrollbarWidth: "none" }}
          >
            <ProfileMainContent
              user={user}
              posts={posts}
              activeTab={activeTab}
              friends={friendList}
              instituteLogo={instituteData?.instituteLogo || instituteData?.logo?.url} 
            />
          </div>
        </div>
      </div>

      {showEdit && isCurrentUser && (
        <EditProfile user={user} setShowEdit={setShowEdit} setUser={setUser} />
      )}
    </div>
  );
};

export default Profile;