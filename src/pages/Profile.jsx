import React, { useState, useEffect } from 'react';
import {
    MapPin, Loader2, Star, MessageSquare, Users, Flag, Phone, Mail, Globe,
    CalendarDays, User as UserIcon, Briefcase, Award, GraduationCap, Code,
    Heart, Image as ImageIcon, Users as FriendsIcon, BarChart3, Edit, Save,
    Bold,
    UserPlus, // Icon for Add Friend
    UserCheck, // Icon for Friends
    Clock, // Icon for Request Sent
    UserX, // Icon for Unfriend/Cancel
} from 'lucide-react';
import moment from 'moment';
import { useParams, Link } from "react-router-dom";
import PostCard from '../components/PostCard';
// Import the new friend data to help simulate the status
import { 
    dummyPosts, // We still need dummyPosts as an initial fallback
    dummyCurrentUser, 
    dummyGuestProfileData,
    dummyFriendsData, 
    dummyFriendRequestsData 
} from '../assets/data.js';


const NAV_WIDTH_REM = 16;
const CONTAINER_PADDING_REM = 2;
const ORIGINAL_HEADER_HEIGHT_PX = 64;
const NEW_HEADER_HEIGHT_PX = 56;
const PROFILE_HEADER_WIDTH_REM = 45.5;

// Function to calculate the left offset for the fixed header
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

// --- EditModalForm (Cleaned) ---

const EditModalForm = ({ formData, handleChange }) => {
    const relationshipOptions = ['Single', 'In a relationship', 'Married', 'Engaged', 'In a civil union', 'Separated', 'Divorced', 'Widowed', 'In a complicated situation', 'Not specified'];
    return (
        <div className='space-y-4 max-h-[55vh] overflow-y-auto pr-2'>
            {/* ... Form fields ... */}
            <div>
                <label htmlFor="pronouns" className="block text-sm font-medium text-gray-700">Pronouns (e.g., He/Him)</label>
                <input
                    type="text"
                    id="pronouns"
                    name="pronouns"
                    value={formData.pronouns || ''}
                    onChange={handleChange}
                    placeholder="Add your pronouns"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                />
            </div>

            <div>
                <label htmlFor="work" className="block text-sm font-medium text-gray-700">Works at</label>
                <input
                    type="text"
                    id="work"
                    name="work"
                    value={formData.work || ''}
                    onChange={handleChange}
                    placeholder="Add your workplace/role (e.g., Student)"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                />
            </div>

            <div>
                <label htmlFor="university" className="block text-sm font-medium text-gray-700">University</label>
                <input
                    type="text"
                    id="university"
                    name="university"
                    value={formData.university || ''}
                    onChange={handleChange}
                    placeholder="National Institute of Advanced Manufacturing Technology Ranchi"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                />
            </div>

            <div>
                <label htmlFor="highSchool" className="block text-sm font-medium text-gray-700">High School</label>
                <input
                    type="text"
                    id="highSchool"
                    name="highSchool"
                    value={formData.highSchool || ''}
                    onChange={handleChange}
                    placeholder="Sarswati Shishu Vidya Mandir"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                />
            </div>

            <div>
                <label htmlFor="currentCity" className="block text-sm font-medium text-gray-700">Current Town/City (Lives in)</label>
                <input
                    type="text"
                    id="currentCity"
                    name="currentCity"
                    value={formData.currentCity || ''}
                    onChange={handleChange}
                    placeholder="Sugauli"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                />
            </div>

            <div>
                <label htmlFor="hometown" className="block text-sm font-medium text-gray-700">Home Town (From)</label>
                <input
                    type="text"
                    id="hometown"
                    name="hometown"
                    value={formData.hometown || ''}
                    onChange={handleChange}
                    placeholder="Sugauli"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                />
            </div>

            <div>
                <label htmlFor="relationship" className="block text-sm font-medium text-gray-700">Relationship</label>
                <select
                    id="relationship"
                    name="relationship"
                    value={formData.relationship || 'Not specified'}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border bg-white"
                >
                    {relationshipOptions.map(option => (
                        <option key={option} value={option}>{option}</option>
                    ))}
                </select>
            </div>

            <div>
                <label htmlFor="joined" className="block text-sm font-medium text-gray-700">Joined Platform</label>
                <input
                    type="text"
                    id="joined"
                    name="joined"
                    value={formData.joined || ''}
                    readOnly
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm p-2 border bg-gray-50 text-gray-500"
                />
            </div>

            <div>
                <label htmlFor="socialLink" className="block text-sm font-medium text-gray-700">Social Link (Instagram ID)</label>
                <div className='flex items-center mt-1'>
                    <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-gray-500 sm:text-sm h-full">
                        @
                    </span>
                    <input
                        type="text"
                        id="socialLink"
                        name="socialLink"
                        value={formData.socialLink || ''}
                        onChange={handleChange}
                        placeholder="alokgond.in"
                        className="flex-1 block w-full rounded-none rounded-r-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                    />
                </div>
            </div>
        </div>
    );
}


// --- EditProfileModal (Cleaned) ---

const EditProfileModal = ({ user, setShowEdit, setUser }) => {
    const [formData, setFormData] = useState({
        pronouns: user.pronouns || '',
        work: user.work || '',
        university: user.university || '',
        highSchool: user.highSchool || '',
        currentCity: user.currentCity || '',
        hometown: user.hometown || '',
        relationship: user.relationship || 'Not specified',
        joined: user.joined || 'N/A',
        socialLink: user.socialLink || '',
        followers: user.followers || 0,
        _id: user._id,
        full_name: user.full_name,
        profilePicture: user.profilePicture,
        cover_photo: user.cover_photo,
    });

    const [isSaving, setIsSaving] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSaving(true);

        setTimeout(() => {
            setUser(formData);
            setIsSaving(false);
            setShowEdit(false);
        }, 800);
    };

    return (
        <div className='fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4'>
            <div className='bg-white w-full max-w-lg p-6 rounded-xl shadow-2xl transform transition-all duration-300 scale-100'>
                <h2 className='text-2xl font-bold text-gray-800 border-b pb-2 mb-4 flex justify-between items-center'>
                    Edit Profile Details
                    <button onClick={() => setShowEdit(false)} className='text-gray-400 hover:text-gray-600 transition'>
                        <span className="text-xl font-light">×</span>
                    </button>
                </h2>

                <form onSubmit={handleSubmit}>
                    <EditModalForm formData={formData} handleChange={handleChange} />

                    <div className='mt-6 flex justify-end space-x-3'>
                        <button
                            type="button"
                            onClick={() => setShowEdit(false)}
                            className='py-2 px-4 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition duration-150'
                            disabled={isSaving}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className='py-2 px-4 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition duration-150 flex items-center justify-center gap-2'
                            disabled={isSaving}
                        >
                            {isSaving ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Save className='w-5 h-5' />
                            )}
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- MediaGallery (Cleaned) ---

const MediaGallery = ({ posts }) => {
    const allMedia = posts.flatMap(post => {
        let mediaItems = [];
        if (Array.isArray(post.image_urls) && post.image_urls.length > 0) {
            mediaItems = mediaItems.concat(post.image_urls.map(url => ({
                url: url,
                type: url.match(/\.(mp4|webm|ogg|mov)$/i) ? 'video' : 'image'
            })));
        }
        if (Array.isArray(post.media)) {
            mediaItems = mediaItems.concat(post.media.map(item => ({
                url: item.url,
                type: item.type || (item.url?.match(/\.(mp4|webm|ogg|mov)$/i) ? 'video' : 'image')
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
                    {media.type === 'video' ? (
                        <>
                            <video
                                src={media.url}
                                controls={false}
                                autoPlay={false}
                                muted={true}
                                loop
                                className='w-full h-full object-cover'
                                onClick={() => console.log('Open video lightbox/player')}
                            />
                            <span className="absolute inset-0 flex items-center justify-center bg-black/20 text-white opacity-0 group-hover:opacity-100 transition">
                                <Code className="w-8 h-8" />
                            </span>
                        </>
                    ) : (
                        <img
                            src={media.url}
                            alt={`Gallery image ${index + 1}`}
                            className='w-full h-full object-cover'
                            onClick={() => console.log('Open image lightbox')}
                        />
                    )}
                </div>
            ))}
        </div>
    );
};


// --- ProfileHeader (Cleaned) ---

const ProfileHeader = ({ user, leftOffset, setShowEdit, activeTab, setActiveTab }) => {
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

                {user._id === dummyCurrentUser._id && (
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


// --- FriendButton (Cleaned) ---
const FriendButton = ({ status, onAdd, onCancel, onAccept, onUnfriend }) => {
    switch (status) {
        case 'friends':
            return (
                <button
                    onClick={onUnfriend}
                    className="flex items-center gap-1.5 px-3 py-1 text-sm bg-blue-100 text-blue-700 font-semibold rounded-lg hover:bg-blue-200 transition"
                >
                    <UserCheck className='w-4 h-4' /> Friends
                </button>
            );
        case 'request_sent':
            return (
                <button
                    onClick={onCancel}
                    className="flex items-center gap-1.5 px-3 py-1 text-sm bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition"
                >
                    <Clock className='w-4 h-4' /> Request Sent
                </button>
            );
        case 'request_received':
            return (
                <button
                    onClick={onAccept} // You can also link to /friends page: <Link to="/friends">
                    className="flex items-center gap-1.5 px-3 py-1 text-sm bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition"
                >
                    <UserPlus className='w-4 h-4' /> Respond
                </button>
            );
        case 'not_friends':
        default:
            return (
                <button
                    onClick={onAdd}
                    className="flex items-center gap-1.5 px-3 py-1 text-sm bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition"
                >
                    <UserPlus className='w-4 h-4' /> Add Friend
                </button>
            );
    }
};


// --- ProfileSidebar (Cleaned) ---

const ProfileSidebar = ({ user, ProfileId, friendshipStatus, onFriendAction }) => { 
    const isCurrentUser = !ProfileId || ProfileId === dummyCurrentUser._id;

    const scrollbarHideStyle = {
        msOverflowStyle: 'none',
        scrollbarWidth: 'none',
    };

    const InfoRow = ({ Icon, text, link, linkText }) => {
        if (!text || text.includes('undefined') || text.endsWith('at ') || text.endsWith('on ')) return null;
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

    const socialLinkDisplay = user.socialLink ? `http://${user.socialLink}` : null;
    const socialLinkText = user.socialLink ? `${user.socialLink} · ${user.followers || 0} followers` : null;

    return (
        <div className={`w-full lg:w-1/5 bg-white rounded-xl shadow-lg lg:mb-0 mb-6 relative
                         lg:fixed lg:top-22 lg:left-[calc(${NAV_WIDTH_REM}rem+${CONTAINER_PADDING_REM}rem)] lg:max-h-[calc(100vh-6rem)] overflow-y-scroll`}
            style={scrollbarHideStyle}>

            <div className='relative h-28 bg-gray-200 overflow-hidden rounded-t-xl'>
                <img src={user.cover_photo} alt={`${user.full_name}'s cover`} className='w-full h-full object-cover' />
                <div className='absolute inset-0 bg-black/20'></div>
            </div>

            <div className='w-28 h-28 mx-auto rounded-full overflow-hidden border-4 border-white shadow-xl absolute left-1/2 -translate-x-1/2 top-14 z-10'>
                <img src={user.profilePicture} alt={`${user.full_name}'s profile`} className='w-full h-full object-cover' />
            </div>

            <div className='p-4 pt-16'>
                <div className='text-center pb-4 mb-4 border-b border-gray-100'>
                    <h2 className='text-xl font-bold text-gray-800 mb-1'>{user.full_name}</h2>
                    <p className='text-gray-600 text-sm my-0 italic px-2'>
                        "A brief bio or headline goes here, capturing the user's essence and expertise."
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

                    <div className='mt-0 space-y-3 text-left'>
                        {/* ... InfoRow components ... */}
                        <InfoRow Icon={UserIcon} text={user.pronouns ? `Pronouns: ${user.pronouns}` : null} />
                        <InfoRow Icon={Briefcase} text={user.work ? `Works at ${user.work}` : null} />
                        <InfoRow Icon={GraduationCap} text={user.university ? `Studied at ${user.university}` : null} />
                        <InfoRow Icon={GraduationCap} text={user.highSchool ? `Went to ${user.highSchool}` : null} />
                        <InfoRow Icon={MapPin} text={user.currentCity ? `Lives in ${user.currentCity}` : null} />
                        <InfoRow Icon={Flag} text={user.hometown ? `From ${user.hometown}` : null} />
                        <InfoRow Icon={Heart} text={user.relationship} />
                        <InfoRow Icon={CalendarDays} text={user.joined ? `Joined on ${user.joined}` : null} />

                        <div className='flex items-center text-sm text-gray-700'>
                            <Globe className='w-4 h-4 mr-3 text-indigo-500 flex-shrink-0' />
                            {user.socialLink ? (
                                <a href={socialLinkDisplay} target="_blank" rel="noopener noreferrer" className='hover:text-indigo-600 truncate font-medium'>
                                    {socialLinkText}
                                </a>
                            ) : (
                                <span>No public social links</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


// --- FriendListTab (Cleaned) ---
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
                            <img 
                                src={friend.profile_picture} 
                                alt={friend.full_name} 
                                className='w-14 h-14 rounded-full object-cover transition-transform hover:scale-105 shadow-sm'
                            />
                        </Link>
                        <div className='flex-grow overflow-hidden'>
                            <Link to={`/profile/${friend._id}`}>
                                <h5 className='font-bold text-gray-800 truncate hover:text-indigo-600'>{friend.full_name}</h5>
                            </Link>
                            <p className='text-sm text-gray-500'>
                                {friend.mutual_friends ? `${friend.mutual_friends} mutual friends` : 'Friend'}
                            </p>
                        </div>
                        <Link 
                            to={`/?open_chat=${friend._id}`}
                            className='p-2 bg-indigo-100 text-indigo-600 rounded-full hover:bg-indigo-200 transition-colors'
                            aria-label="Message"
                        >
                            <MessageSquare size={18} />
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
};


// --- ProfileMainContent (Cleaned) ---
const ProfileMainContent = ({ user, posts, activeTab, friends }) => { // Prop is already passed
    return (
        <div className='space-y-4'>
            <div className='flex flex-col items-center gap-2.5 w-full'>
                
                {activeTab === 'posts' && (
                    <>
                        {posts.map((post) => <PostCard key={post._id} post={post} />)}
                        {posts.length === 0 && (
                            <div className='p-10 rounded-xl text-center text-gray-500 w-full bg-white shadow-lg'>
                                <p>No posts yet for {user.full_name}.</p>
                            </div>
                        )}
                    </>
                )}

                {activeTab === 'media' && (
                    <MediaGallery posts={posts} />
                )}

                {activeTab === 'friends' && (
                    <FriendListTab friends={friends} />
                )}
                
                {activeTab === 'results' && (
                    <div className='p-10 rounded-xl text-center text-gray-500 w-full bg-white shadow-lg'>
                        <p>Content for the **Results** tab would be displayed here.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- findUserById (Cleaned and updated) ---
const findUserById = (id) => {
    // 1. Check if the requested ID is the current user
    if (id === dummyCurrentUser._id) {
        return dummyCurrentUser;
    }

    // 2. Search for the user in dummyPosts (assuming post.user is the user object)
    // Create a map of unique users first for efficiency
    const allUsers = new Map();
    dummyPosts.forEach(post => {
        if (post.user && !allUsers.has(post.user._id)) { // Check if post.user exists
            allUsers.set(post.user._id, post.user);
        }
    });
    // Also check friend data
    dummyFriendsData.forEach(friend => {
        if(!allUsers.has(friend._id)) {
             allUsers.set(friend._id, {
                _id: friend._id,
                full_name: friend.full_name,
                profilePicture: friend.profile_picture,
                // Add other fields if available, or merge with guest data
            });
        }
    });
    dummyFriendRequestsData.forEach(req => {
         if(!allUsers.has(req._id)) {
             allUsers.set(req._id, {
                _id: req._id,
                full_name: req.full_name,
                profilePicture: req.profile_picture,
            });
        }
    });
    // Add guest user
    if (!allUsers.has(dummyGuestProfileData._id)) {
         allUsers.set(dummyGuestProfileData._id, dummyGuestProfileData);
    }


    // Attempt to find the user
    const foundUser = allUsers.get(id);

    if (foundUser) {
        // Merge found user data with potential missing fields from dummyGuestProfileData
        return {
            ...dummyGuestProfileData, // Use as a base for default fields
            ...foundUser,
            _id: id // Ensure ID is correct
        };
    }

    // 3. If not found, return null or a minimal placeholder
    return null;
};


// ---------------------------------------------
// --- Main Profile Component (MODIFIED as before) ---
// ---------------------------------------------
// 1. Accept 'posts' prop from App.jsx, rename it to 'allPosts'
const Profile = ({ isSidebarOpen, posts: allPosts }) => {
    const { ProfileId } = useParams();

    const isCurrentUser = !ProfileId || ProfileId === dummyCurrentUser._id;
    const userId = ProfileId || dummyCurrentUser._id;
    const initialUserData = findUserById(userId) || dummyCurrentUser; 

    const [user, setUser] = useState(initialUserData);
    const [posts, setPosts] = useState([]); // This state will hold the FILTERED posts
    const [showEdit, setShowEdit] = useState(false);
    const [activeTab, setActiveTab] = useState('posts');
    
    // State for managing friend status
    const [friendshipStatus, setFriendshipStatus] = useState('not_friends'); 
    
    // State: To hold the list of friends for the 'friends' tab
    const [friendList, setFriendList] = useState([]);

    // NEW EFFECT: Reset user state AND friendship status when ProfileId changes
    useEffect(() => {
        const newUser = findUserById(ProfileId || dummyCurrentUser._id);
        if (newUser) {
            setUser(newUser);
        } else if (!ProfileId) {
            setUser(dummyCurrentUser);
        } else {
            setUser(null);
            console.error(`User with ID ${ProfileId} not found.`);
        }

        // --- Simulate fetching friendship status (No changes here) ---
        if (ProfileId && ProfileId !== dummyCurrentUser._id) {
            if (dummyFriendsData.find(friend => friend._id === ProfileId)) {
                setFriendshipStatus('friends');
            } 
            else if (dummyFriendRequestsData.find(req => req._id === ProfileId)) {
                setFriendshipStatus('request_received');
            }
            else if (ProfileId === 'user_guest') {
                 setFriendshipStatus('request_sent');
            }
            else {
                setFriendshipStatus('not_friends');
            }
        }
        
        // --- Simulate fetching this user's friend list (No changes here) ---
        if (!ProfileId || ProfileId === dummyCurrentUser._id) {
            // If it's our profile, show our friends
            setFriendList(dummyFriendsData);
        } else {
            // For this demo, we'll show a hardcoded list for other users
            switch (ProfileId) {
                case 'user_2': // Jane Doe
                    setFriendList([
                        { _id: "user_1", full_name: "Alok Kumar", profile_picture: "https://i.pravatar.cc/150?u=user_1", mutual_friends: 0 },
                        { _id: "user_3", full_name: "John Smith", profile_picture: "https://i.pravatar.cc/150?u=user_3", mutual_friends: 5 }
                    ]);
                    break;
                case 'user_3': // John Smith
                     setFriendList([
                        { _id: "user_1", full_name: "Alok Kumar", profile_picture: "https://i.pravatar.cc/150?u=user_1", mutual_friends: 0 },
                        { _id: "user_2", full_name: "Jane Doe", profile_picture: "https://i.pravatar.cc/150?u=user_2", mutual_friends: 5 }
                    ]);
                    break;
                case 'user_4': // Alex Ray
                    // Show an empty list because we haven't accepted their request yet
                    setFriendList([]); 
                    break;
                default:
                    setFriendList([]); // Empty for guests, etc.
            }
        }
        // ---------------------------------------------------

        // --- 🛑 MODIFIED POSTS LOGIC ---
        // Fetch posts for the currently loaded user
        const targetId = newUser ? newUser._id : (ProfileId || dummyCurrentUser._id);
        
        // 2. Add a safety check in case the prop isn't ready
        if (allPosts) {
            // 3. Filter 'allPosts' prop and use 'post.user._id'
            // This now correctly filters the posts from App.jsx
            const profilePosts = allPosts.filter(post => post.user?._id === targetId);
            setPosts(profilePosts);
        }
        // --- 🛑 END OF MODIFICATION ---

        setActiveTab('posts'); // Reset tab on new profile load

    // 4. Add 'allPosts' to the dependency array
    }, [ProfileId, allPosts]); 

    // Manages the outer (body) scrollbar
    useEffect(() => {
        const isLargeScreen = window.innerWidth >= 1024; 
        if (isLargeScreen) {
            document.body.style.overflow = 'hidden';
        }
        return () => {
            if (isLargeScreen) {
                document.body.style.overflow = '';
            }
        };
    }, []);
    
    // Handler function to simulate friend actions
    const handleFriendAction = (action) => {
        // In a real app, you'd send an API request and update state on success
        switch (action) {
            case 'add':
                setFriendshipStatus('request_sent');
                break;
            case 'cancel':
                setFriendshipStatus('not_friends');
                break;
            case 'unfriend':
                setFriendshipStatus('not_friends');
                // Also update list if we unfriend them from their profile
                setFriendList(friendList.filter(f => f._id !== dummyCurrentUser._id)); 
                break;
            case 'accept':
                setFriendshipStatus('friends');
                // Also update list if we accept from their profile
                // We need to find the user's details to add to the list
                const acceptedUser = findUserById(ProfileId);
                if (acceptedUser) {
                    setFriendList(prev => [...prev, {
                        _id: acceptedUser._id,
                        full_name: acceptedUser.full_name,
                        profile_picture: acceptedUser.profilePicture,
                        mutual_friends: 3 // Simulated
                    }]);
                }
                break;
            default:
                break;
        }
    };

    // --- (No changes below this line to the Profile component logic) ---

    const getConditionalOffset = (isOpen) => {
        if (isOpen) {
            return -200;
        }
        return -210;
    };

    const [leftOffset, setLeftOffset] = useState(() =>
        calculateLeftOffset(isSidebarOpen, getConditionalOffset(isSidebarOpen))
    );

    useEffect(() => {
        const handleResize = () => {
            setLeftOffset(calculateLeftOffset(isSidebarOpen, getConditionalOffset(isSidebarOpen)));
        };

        handleResize();
        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, [isSidebarOpen, ProfileId]);

    const scrollbarHideStyle = {
        msOverflowStyle: 'none',
        scrollbarWidth: 'none',
    };

    const scrollableContentStyle = {
        paddingBottom: '2.5rem',
        ...scrollbarHideStyle,
    };


    if (!user) return <Loading />; 

    return (
        <div className={`pt-2 lg:ml-[${NAV_WIDTH_REM}rem]`}>
            <ProfileHeader
                user={user}
                leftOffset={leftOffset}
                setShowEdit={setShowEdit}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
            />

            <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative lg:flex lg:h-[calc(100vh-4rem)] lg:overflow-hidden'>
                
                <ProfileSidebar 
                    user={user} 
                    ProfileId={ProfileId} 
                    friendshipStatus={friendshipStatus}
                    onFriendAction={handleFriendAction}
                />

                <div className='lg:w-2/3 relative flex flex-col h-full' style={{ marginLeft: '29%' }}>
                    <div className={`flex-grow overflow-y-scroll mt-14 lg:mt-[${NEW_HEADER_HEIGHT_PX}px] z-16`} style={scrollableContentStyle}>
                        
                        <ProfileMainContent
                            user={user}
                            posts={posts}
                            activeTab={activeTab}
                            friends={friendList} // Pass the friendList state
                        />
                    </div>
                </div>
            </div>

            {showEdit && isCurrentUser && (
                <EditProfileModal
                    user={user}
                    setShowEdit={setShowEdit}
                    setUser={setUser}
                />
            )}
        </div>
    );
};

export default Profile;