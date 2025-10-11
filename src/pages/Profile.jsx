// src/pages/Profile.jsx
import React, { useState, useEffect } from 'react';
import {
    MapPin, Loader2, Star, MessageSquare, Users, Flag, Phone, Mail, Globe,
    CalendarDays, User as UserIcon, Briefcase, Award, GraduationCap, Code,
    Heart
} from 'lucide-react';
import moment from 'moment';
import { useParams, Link } from "react-router-dom";
import PostCard from '../components/PostCard';
import { dummyPosts, dummyCurrentUser, dummyGuestProfileData } from '../assets/data.js';


const NAV_WIDTH_REM = 16;       
const CONTAINER_PADDING_REM = 2; 
const HEADER_HEIGHT_PX = 64;    
const PLACEHOLDER_HEIGHT_PX = 176; 
const PROFILE_HEADER_WIDTH_REM = 45.5;


const Loading = () => (
    <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
    </div>
);

const EditProfileModal = ({ user, setShowEdit, setUser }) => (
    // ... (Modal code remains unchanged)
    <div className='fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4'>
        <div className='bg-white w-full max-w-md p-6 rounded-xl shadow-2xl transform transition-all duration-300 scale-100'>
            <h2 className='text-2xl font-bold text-gray-800 border-b pb-2 mb-4'>Edit Profile</h2>
            <p className='text-gray-600 mb-4'>Currently editing: <span className='font-semibold'>{user.full_name}</span></p>
            <div className='space-y-3'>
                <p className='text-sm text-gray-500'>*Edit form fields would go here.*</p>
            </div>
            <button
                onClick={() => setShowEdit(false)}
                className='mt-6 w-full py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition duration-150'
            >
                Close
            </button>
        </div>
    </div>
);

// --- ProfileHeader Component (Keeping original 'top-22' position) ---
const ProfileHeader = ({ user }) => (
    // 'top-22' is preserved to keep the header in its intended position
    <div className={`fixed top-22 z-30 bg-white shadow-md p-4 
                lg:rounded-xl 
                hidden lg:block`}
             style={{
                 height: `${HEADER_HEIGHT_PX}px`,
                 // Reduced the gap size from '6rem' to '4rem' to shift the header left
                 left: `calc(${NAV_WIDTH_REM}rem + ${CONTAINER_PADDING_REM}rem + 20% + 4rem)`,
                 width: `${PROFILE_HEADER_WIDTH_REM}rem`
             }}>
        <h3 className='text-lg font-bold text-gray-800 flex items-center'>
            <Star className='w-5 h-5 text-yellow-500 mr-2'/>
            Posts by {user.full_name}
        </h3>
    </div>
);


// --- ProfileSidebar (Unchanged) ---
const ProfileSidebar = ({ user, ProfileId, setShowEdit }) => {
    // ... (Sidebar code remains the same)
    const isCurrentUser = !ProfileId || ProfileId === dummyCurrentUser._id;

    const scrollbarHideStyle = {
        msOverflowStyle: 'none',
        scrollbarWidth: 'none',
    };

    return (
        <div className={`w-full lg:w-1/5 bg-white rounded-xl shadow-lg lg:mb-0 mb-6 relative
                     lg:fixed lg:top-22 lg:left-[calc(${NAV_WIDTH_REM}rem+${CONTAINER_PADDING_REM}rem)] lg:max-h-[calc(100vh-4rem)] overflow-y-scroll`}
                    style={scrollbarHideStyle}>

            <div className='relative h-28 bg-gray-200 overflow-hidden rounded-t-xl'>
                <img
                    src={user.cover_photo}
                    alt={`${user.full_name}'s cover`}
                    className='w-full h-full object-cover'
                />
                <div className='absolute inset-0 bg-black/20'></div>
            </div>

            <div className='w-28 h-28 mx-auto rounded-full overflow-hidden border-4 border-white shadow-xl absolute left-1/2 -translate-x-1/2 top-14 z-10'>
                <img
                    src={user.profilePicture}
                    alt={`${user.full_name}'s profile`}
                    className='w-full h-full object-cover'
                />
            </div>

            <div className='p-4 pt-16'>

                <div className='text-center pb-4 mb-4 border-b border-gray-100'>
                    <h2 className='text-xl font-bold text-gray-800 mb-1'>{user.full_name}</h2>
                    <p className='text-gray-600 text-sm my-3 italic px-2'>
                        "A brief bio or headline goes here, capturing the user's essence and expertise."
                    </p>

                    {/* ACTION BUTTONS */}
                    <div className='mt-4 flex justify-center gap-3'>
                        {isCurrentUser ? (
                            <button
                                className='bg-indigo-50 text-indigo-600 px-3 py-1.5 text-sm font-medium rounded-lg hover:bg-indigo-100 transition-colors flex items-center gap-1'
                                onClick={() => setShowEdit(true)}
                            >
                                <Code className='w-4 h-4' /> Edit Profile
                            </button>
                        ) : (
                            <>
                                <button className='bg-indigo-600 text-white px-3 py-1.5 text-sm rounded-lg flex items-center gap-1 hover:bg-indigo-700 transition-colors'>
                                    <MessageSquare className='w-4 h-4' /> Message
                                </button>
                                <button className='bg-gray-200 text-gray-800 px-3 py-1.5 text-sm rounded-lg flex items-center gap-1 hover:bg-gray-300 transition-colors'>
                                    <Flag className='w-4 h-4' /> Report
                                </button>
                            </>
                        )}
                    </div>
                    {/* END ACTION BUTTONS */}

                    <div className='mt-4 space-y-3 text-left'>

                        <div className='flex items-center text-sm text-gray-700'>
                            <UserIcon className='w-4 h-4 mr-3 text-gray-500 flex-shrink-0' />
                            <span>Pronouns: **He/Him**</span>
                        </div>

                        <div className='flex items-center text-sm text-gray-700'>
                            <Briefcase className='w-4 h-4 mr-3 text-gray-500 flex-shrink-0' />
                            <span>Works at **Student**</span>
                        </div>

                        <div className='flex items-center text-sm text-gray-700'>
                            <GraduationCap className='w-4 h-4 mr-3 text-gray-500 flex-shrink-0' />
                            <span>Studied at **National Institute of Advanced Manufacturing Technology Ranchi**</span>
                        </div>

                        <div className='flex items-center text-sm text-gray-700'>
                            <GraduationCap className='w-4 h-4 mr-3 text-gray-500 flex-shrink-0' />
                            <span>Went to **Sarswati Shishu Vidya Mandir**</span>
                        </div>

                        <div className='flex items-center text-sm text-gray-700'>
                            <MapPin className='w-4 h-4 mr-3 text-gray-500 flex-shrink-0' />
                            <span>Lives in **Sugauli**</span>
                        </div>

                        <div className='flex items-center text-sm text-gray-700'>
                            <Flag className='w-4 h-4 mr-3 text-gray-500 flex-shrink-0' />
                            <span>From **Sugauli**</span>
                        </div>

                        <div className='flex items-center text-sm text-gray-700'>
                            <Heart className='w-4 h-4 mr-3 text-gray-500 flex-shrink-0' />
                            <span>**Single**</span>
                        </div>

                        <div className='flex items-center text-sm text-gray-700'>
                            <CalendarDays className='w-4 h-4 mr-3 text-gray-500 flex-shrink-0' />
                            <span>Joined on **March 2019**</span>
                        </div>

                        <div className='flex items-center text-sm text-gray-700'>
                            <Globe className='w-4 h-4 mr-3 text-indigo-500 flex-shrink-0' />
                            <a href="http://alokgond.in" target="_blank" rel="noopener noreferrer" className='hover:text-indigo-600 truncate font-medium'>alokgond.in</a>
                            <span className="ml-2 text-xs text-gray-400">· 260 followers</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


// --- ProfileMainContent (Unchanged) ---
const ProfileMainContent = ({ user, posts }) => {
    return ( 
        <div className='space-y-4'> 
            <div className='flex flex-col items-center gap-2.5 w-full'>
                {posts.map((post) => <PostCard key={post._id} post={post} />)}
                {posts.length === 0 && (
                    <div className='p-10 rounded-xl text-center text-gray-500 bg-gray-50 w-full bg-white shadow-lg'>
                        <p>No posts yet for {user.full_name}.</p>
                    </div>
                )}
            </div>
        </div>
    );
};


// --- Main Profile Component (Updated Placeholder Height) ---
const Profile = () => {
    const { ProfileId } = useParams();
    const [user, setUser] = useState(null);
    const [posts, setPosts] = useState([]);
    const [showEdit, setShowEdit] = useState(false);

    const fetchUserData = async () => {
        const isCurrentUser = !ProfileId || ProfileId === dummyCurrentUser._id;
        const profileData = isCurrentUser
            ? dummyCurrentUser
            : { ...dummyGuestProfileData, _id: ProfileId };

        setUser(profileData);

        const profilePosts = dummyPosts.filter(post => post.user_id === profileData._id);
        setPosts(profilePosts);
    };

    useEffect(() => {
        fetchUserData();
    }, [ProfileId]);

    const scrollbarHideStyle = {
        msOverflowStyle: 'none',
        scrollbarWidth: 'none',
    };

    return user ? (
        <div className={`pt-2 pb-20 lg:ml-[${NAV_WIDTH_REM}rem]`}>

            {/* 1. FIXED HEADER RENDERED HERE: This is fixed but takes up no flow space. */}
            <ProfileHeader user={user} />

            {/* 2. Main Flex Row: Sets up the two columns (Sidebar and Posts) */}
            <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative lg:flex lg:h-[calc(100vh-4rem)] lg:overflow-hidden'>

                <ProfileSidebar user={user} ProfileId={ProfileId} setShowEdit={setShowEdit} />

                <div className='lg:w-1/5 lg:mr-24 hidden lg:block'>
                </div>

                <div className='lg:w-2/3 relative flex flex-col'>
                    
                    <div className="hidden lg:block" style={{ height: `${PLACEHOLDER_HEIGHT_PX}px` }}></div>

                    <div className="flex-grow overflow-y-scroll" style={scrollbarHideStyle}>
                        <ProfileMainContent
                            user={user}
                            posts={posts}
                        />
                    </div>
                </div>

            </div>

            {showEdit && <EditProfileModal user={user} setShowEdit={setShowEdit} setUser={setUser} />}
        </div>
    ) : (<Loading />);
};

export default Profile;