import React, { useState, useEffect } from 'react';
import {
    MapPin, Loader2, Star, MessageSquare, Users, Flag, Phone, Mail, Globe,
    CalendarDays, User as UserIcon, Briefcase, Award, GraduationCap, Code,
    Heart, Image as ImageIcon, Users as FriendsIcon, BarChart3, Edit,
    UserPlus, UserCheck, Clock, UserX,
} from 'lucide-react';
import { useParams, Link } from "react-router-dom";
import PostCard from '../components/PostCard';
import EditProfile from '../components/EditProfile';
import { useFriends } from '../context/FriendContext'; 

// ✅ 1. Import Auth Context and our new API call
import { useAuth } from '../context/AuthContext';
import { getUserById } from '../api';

const NAV_WIDTH_REM = 16;
const CONTAINER_PADDING_REM = 2;
const ORIGINAL_HEADER_HEIGHT_PX = 64;
const NEW_HEADER_HEIGHT_PX = 56;
const PROFILE_HEADER_WIDTH_REM = 45.5;

const calculateLeftOffset = (isSidebarOpen, offset) => {
    const sidebarWidth = isSidebarOpen ? 200 : 40;
    const windowWidth = window.innerWidth;
    const mainContentWidth = windowWidth - sidebarWidth;
    return `${sidebarWidth + mainContentWidth / 2 + offset}px`;
};

const Loading = () => (
    <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
    </div>
);

// --- MediaGallery ---
const MediaGallery = ({ posts }) => {
    const allMedia = posts.flatMap(post => {
        let mediaItems = [];
        if (Array.isArray(post.image_urls) && post.image_urls.length > 0) {
            mediaItems = mediaItems.concat(post.image_urls.map(url => ({
                url: url,
                type: url.match(/\.(mp4|webm|ogg|mov)$/i) ? 'video' : 'image'
            })));
        }
        return mediaItems.map(item => ({ ...item, postId: post._id })).filter(item => item.url);
    });

    if (allMedia.length === 0) {
        return (
            <div className='p-10 rounded-xl text-center text-gray-500 w-full bg-white shadow-lg'>
                <p>No photos or videos found for this user.</p>
            </div>
        );
    }

    return (
        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-4 bg-white rounded-xl shadow-lg w-full'>
            {allMedia.map((media, index) => (
                <div
                    key={`${media.postId}-${index}`}
                    className='aspect-square overflow-hidden rounded-lg cursor-pointer hover:opacity-90 transition-opacity duration-200 shadow-md group relative'
                >
                    <img
                        src={media.url}
                        alt={`Gallery image ${index + 1}`}
                        className='w-full h-full object-cover'
                    />
                </div>
            ))}
        </div>
    );
};

// --- ProfileHeader ---
const ProfileHeader = ({ user, leftOffset, setShowEdit, activeTab, setActiveTab, isCurrentUser }) => {
    const navItems = [
        { name: 'Post', icon: Star, tab: 'posts' },
        { name: 'Media', icon: ImageIcon, tab: 'media' },
        { name: 'Friend', icon: FriendsIcon, tab: 'friends' },
        { name: 'Result', icon: BarChart3, tab: 'results' },
    ];

    const gradientClass = 'bg-gradient-to-r from-purple-600 to-teal-600 text-white shadow-md hover:opacity-90';

    return (
        <div className={`fixed top-22 z-30 bg-white shadow-md p-1 lg:rounded-xl hidden lg:block transition-all duration-300`}
            style={{
                height: `${NEW_HEADER_HEIGHT_PX}px`,
                left: leftOffset,
                width: `${PROFILE_HEADER_WIDTH_REM}rem`
            }}>

            <div className='flex justify-between items-center h-full px-2'>
                <div className='flex space-x-1'>
                    {navItems.map((item) => (
                        <button
                            key={item.name}
                            onClick={() => setActiveTab(item.tab)}
                            className={`px-3 py-1.5 text-sm font-medium rounded-lg flex items-center gap-1 transition-colors ${activeTab === item.tab
                                ? gradientClass
                                : 'text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            <item.icon className='w-4 h-4' /> {item.name}
                        </button>
                    ))}
                </div>

                {isCurrentUser && (
                    <button
                        className={`px-3 py-1.5 text-sm font-medium rounded-lg transition duration-150 flex items-center gap-1 ${gradientClass}`}
                        onClick={() => setShowEdit(true)}
                    >
                        <Edit className='w-4 h-4' /> Edit Profile
                    </button>
                )}
            </div>
        </div>
    );
};

// --- FriendButton ---
const FriendButton = ({ status, onAdd, onCancel, onAccept, onUnfriend }) => {
    switch (status) {
        case 'friends':
            return (
                <button onClick={onUnfriend} className="flex items-center gap-1.5 px-3 py-1 text-sm bg-blue-100 text-blue-700 font-semibold rounded-lg hover:bg-blue-200 transition">
                    <UserCheck className='w-4 h-4' /> Friends
                </button>
            );
        case 'request_sent':
            return (
                <button onClick={onCancel} className="flex items-center gap-1.5 px-3 py-1 text-sm bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition">
                    <Clock className='w-4 h-4' /> Request Sent
                </button>
            );
        case 'request_received':
            return (
                <button onClick={onAccept} className="flex items-center gap-1.5 px-3 py-1 text-sm bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition">
                    <UserPlus className='w-4 h-4' /> Respond
                </button>
            );
        case 'not_friends':
        default:
            return (
                <button onClick={onAdd} className="flex items-center gap-1.5 px-3 py-1 text-sm bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition">
                    <UserPlus className='w-4 h-4' /> Add Friend
                </button>
            );
    }
};

// --- ProfileSidebar ---
// --- ProfileSidebar ---
const ProfileSidebar = ({ user, isCurrentUser, friendshipStatus, onFriendAction }) => {
    const scrollbarHideStyle = { msOverflowStyle: 'none', scrollbarWidth: 'none' };

    const InfoRow = ({ Icon, text, link, linkText }) => {
        if (!text || text.includes('undefined')) return null;
        return (
            <div className='flex items-center text-sm text-gray-700'>
                <Icon className='w-4 h-4 mr-3 text-gray-500 flex-shrink-0' />
                {link ? (
                    <a href={link} target="_blank" rel="noopener noreferrer" className='hover:text-indigo-600 truncate font-medium'>
                        {linkText || text}
                    </a>
                ) : (
                    <span>{text}</span>
                )}
            </div>
        );
    };

    return (
        <div className={`w-full lg:w-1/5 bg-white rounded-xl shadow-lg lg:mb-0 mb-6 relative
                          lg:fixed lg:top-22 lg:left-[calc(${NAV_WIDTH_REM}rem+${CONTAINER_PADDING_REM}rem)] lg:max-h-[calc(100vh-6rem)] overflow-y-scroll`}
            style={scrollbarHideStyle}>

            <div className='relative h-28 bg-gray-200 overflow-hidden rounded-t-xl'>
                <img src={user.coverPhoto || "https://images.unsplash.com/photo-1707343843437-caacff5cfa74"} alt={`Cover`} className='w-full h-full object-cover' />
                <div className='absolute inset-0 bg-black/20'></div>
            </div>

            <div className='w-28 h-28 mx-auto rounded-full overflow-hidden border-4 border-white shadow-xl absolute left-1/2 -translate-x-1/2 top-14 z-10'>
                <img src={user.profilePicture || "https://ui-avatars.com/api/?name=User&background=EBF4FF&color=4F46E5&size=150"} alt={`Profile`} className='w-full h-full object-cover' />
            </div>

            <div className='p-4 pt-16'>
                <div className='text-center pb-4 mb-4 border-b border-gray-100'>
                    <h2 className='text-xl font-bold text-gray-800 mb-1'>{user.full_name || user.name}</h2>
                    
                    {/* ✅ Updated to use the dynamic user.bio */}
                    <p className='text-gray-600 text-sm my-0 italic px-2'>
                        {user.bio || "Hello! I am using Rigya."}
                    </p>

                    <div className='mt-0 flex justify-center gap-3'>
                        {!isCurrentUser ? (
                            <div className='flex gap-2 mt-3'>
                                <FriendButton
                                    status={friendshipStatus}
                                    onAdd={() => onFriendAction('add')}
                                    onCancel={() => onFriendAction('cancel')}
                                    onAccept={() => onFriendAction('accept')}
                                    onUnfriend={() => onFriendAction('unfriend')}
                                />
                                <Link
                                    to={`/?open_chat=${user._id}`}
                                    className="flex items-center gap-1 px-3 py-1 text-sm bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
                                >
                                    <MessageSquare className='w-4 h-4' /> Message
                                </Link>
                            </div>
                        ) : (
                            <div className="h-8"></div>
                        )}
                    </div>

                    {/* ✅ All missing fields added here */}
                    <div className='mt-0 space-y-3 text-left pt-4'>
                        <InfoRow Icon={UserIcon} text={user.pronouns ? `Pronouns: ${user.pronouns}` : null} />
                        <InfoRow Icon={Briefcase} text={user.work ? `Works at ${user.work}` : null} />
                        <InfoRow Icon={GraduationCap} text={user.university ? `Studied at ${user.university}` : null} />
                        <InfoRow Icon={GraduationCap} text={user.highSchool ? `Went to ${user.highSchool}` : null} />
                        <InfoRow Icon={MapPin} text={user.currentCity ? `Lives in ${user.currentCity}` : null} />
                        <InfoRow Icon={MapPin} text={user.hometown ? `From ${user.hometown}` : null} />
                        <InfoRow Icon={Heart} text={user.relationship && user.relationship !== 'Not specified' ? user.relationship : null} />
                        
                        {/* Social Link is clickable! */}
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

// --- FriendListTab ---
const FriendListTab = ({ friends }) => {
    if (!friends || friends.length === 0) {
        return (
            <div className='p-10 rounded-xl text-center text-gray-500 w-full bg-white shadow-lg'>
                <p>No friends to display.</p>
            </div>
        );
    }
    return (
        <div className='bg-white rounded-xl shadow-lg p-4 sm:p-6 w-full'>
            <h3 className="text-xl font-bold text-gray-800 mb-4">Friends ({friends.length})</h3>
            <div className='space-y-4'>
                {friends.map(friend => (
                    <div key={friend._id} className='flex items-center gap-4 p-3 bg-gray-50 rounded-lg border border-gray-100'>
                        <Link to={`/profile/${friend._id}`}>
                            <img src={friend.profilePicture || "https://via.placeholder.com/150"} alt={friend.full_name} className='w-14 h-14 rounded-full object-cover shadow-sm' />
                        </Link>
                        <div className='flex-grow overflow-hidden'>
                            <Link to={`/profile/${friend._id}`}>
                                <h5 className='font-bold text-gray-800 truncate hover:text-indigo-600'>{friend.full_name}</h5>
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- ProfileMainContent ---
const ProfileMainContent = ({ user, posts, activeTab, friends }) => {
    return (
        <div className='space-y-4'>
            <div className='flex flex-col items-center gap-2.5 w-full'>
                {activeTab === 'posts' && (
                    <>
                        {posts.map((post) => <PostCard key={post._id} post={post} />)}
                        {posts.length === 0 && (
                            <div className='p-10 rounded-xl text-center text-gray-500 w-full bg-white shadow-lg'>
                                <p>No posts yet for {user.full_name || user.name}.</p>
                            </div>
                        )}
                    </>
                )}
                {activeTab === 'media' && <MediaGallery posts={posts} />}
                {activeTab === 'friends' && <FriendListTab friends={friends} />}
                {activeTab === 'results' && (
                    <div className='p-10 rounded-xl text-center text-gray-500 w-full bg-white shadow-lg'>
                        <p>Content for the Results tab would be displayed here.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// ---------------------------------------------
// --- Main Profile Component ---
// ---------------------------------------------
const Profile = ({ isSidebarOpen, posts: allPosts }) => {
    const { ProfileId } = useParams();
    const { authData } = useAuth(); // ✅ Get real logged in user
    
    // If there is no ProfileId in the URL, or it matches our ID, it's OUR profile
    const isCurrentUser = !ProfileId || ProfileId === authData?._id;

    const { friends, requests, suggestions, handleAcceptRequest, handleAddFriend, handleCancelRequest, handleUnfriend } = useFriends();

    const [user, setUser] = useState(null);
    const [posts, setPosts] = useState([]); 
    const [showEdit, setShowEdit] = useState(false);
    const [activeTab, setActiveTab] = useState('posts');
    const [friendshipStatus, setFriendshipStatus] = useState('not_friends');
    const [friendList, setFriendList] = useState([]);

    // ✅ 2. Fetch the actual user from the database
    useEffect(() => {
        const fetchUser = async () => {
            if (isCurrentUser) {
                setUser(authData); // Just use our own auth data!
            } else {
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

    // ✅ 3. Automatically filter the real posts from App.jsx to match this user!
    useEffect(() => {
        if (allPosts && user) {
            const profilePosts = allPosts.filter(post => post.user?._id === user._id);
            setPosts(profilePosts);
        }
    }, [allPosts, user]);

    useEffect(() => {
        if (ProfileId && ProfileId !== authData?._id) {
            if (friends && friends.find(friend => friend._id === ProfileId)) {
                setFriendshipStatus('friends');
            } else if (requests && requests.find(req => req._id === ProfileId)) {
                setFriendshipStatus('request_received');
            } else if (suggestions && suggestions.find(sug => sug._id === ProfileId && sug.requestSent)) {
                setFriendshipStatus('request_sent');
            } else {
                setFriendshipStatus('not_friends');
            }
        }
        
        if (isCurrentUser) {
            setFriendList(friends);
        } else {
            setFriendList([]); // Empty for now unless you fetch their friends!
        }

        setActiveTab('posts');
    }, [ProfileId, friends, requests, suggestions, isCurrentUser]);

    // --- Sidebar offset logic ---
    const getConditionalOffset = (isOpen) => isOpen ? -200 : -210;
    const [leftOffset, setLeftOffset] = useState(() => calculateLeftOffset(isSidebarOpen, getConditionalOffset(isSidebarOpen)));

    useEffect(() => {
        const handleResize = () => setLeftOffset(calculateLeftOffset(isSidebarOpen, getConditionalOffset(isSidebarOpen)));
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [isSidebarOpen, ProfileId]);

    if (!user) return <Loading />;

    return (
        <div className={`pt-2 lg:ml-[${NAV_WIDTH_REM}rem]`}>
            <ProfileHeader
                user={user}
                leftOffset={leftOffset}
                setShowEdit={setShowEdit}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                isCurrentUser={isCurrentUser}
            />

            <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative lg:flex lg:h-[calc(100vh-4rem)] lg:overflow-hidden'>
                
                <ProfileSidebar 
                    user={user} 
                    isCurrentUser={isCurrentUser}
                    friendshipStatus={friendshipStatus}
                    onFriendAction={(action) => {
                        if (action === 'add') handleAddFriend(ProfileId);
                        if (action === 'cancel') handleCancelRequest(ProfileId);
                        if (action === 'unfriend') handleUnfriend(ProfileId);
                        if (action === 'accept') handleAcceptRequest(ProfileId);
                    }}
                />

                <div className='lg:w-2/3 relative flex flex-col h-full' style={{ marginLeft: '29%' }}>
                    <div className={`flex-grow overflow-y-scroll mt-14 lg:mt-[${NEW_HEADER_HEIGHT_PX}px] z-16`} style={{ msOverflowStyle: 'none', scrollbarWidth: 'none', paddingBottom: '2.5rem' }}>
                        <ProfileMainContent
                            user={user}
                            posts={posts}
                            activeTab={activeTab}
                            friends={friendList}
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