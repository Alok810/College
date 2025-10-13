// src/pages/Profile.jsx
import React, { useState, useEffect } from 'react';
import {
    MapPin, Loader2, Star, MessageSquare, Users, Flag, Phone, Mail, Globe,
    CalendarDays, User as UserIcon, Briefcase, Award, GraduationCap, Code,
    Heart, Image as ImageIcon, Users as FriendsIcon, BarChart3, Edit, Save,
    Bold
} from 'lucide-react';
import moment from 'moment';
import { useParams, Link } from "react-router-dom";
import PostCard from '../components/PostCard';
// NOTE: Ensure your dummyCurrentUser object has fields like:
// pronouns: 'He/Him', work: 'Student', university: 'National Institute...', 
// highSchool: 'Sarswati Shishu...', currentCity: 'Sugauli', hometown: 'Sugauli',
// relationship: 'Single', joined: 'March 2019', socialLink: 'alokgond.in', followers: 262
import { dummyPosts, dummyCurrentUser, dummyGuestProfileData } from '../assets/data.js';


const NAV_WIDTH_REM = 16;
const CONTAINER_PADDING_REM = 2;
const ORIGINAL_HEADER_HEIGHT_PX = 64; 
const NEW_HEADER_HEIGHT_PX = 56; 
// const PLACEHOLDER_HEIGHT_PX = 150; // NO LONGER USED
const PROFILE_HEADER_WIDTH_REM = 45.5;

// CALCULATED SPACING for the scrollable area:
// Fixed header height (NEW_HEADER_HEIGHT_PX) + margin/padding (e.g., 1rem = 16px)
const SCROLL_PADDING_TOP_PX = NEW_HEADER_HEIGHT_PX + 4; 

// Function to calculate the left offset for the fixed header (ORIGINAL LOGIC MAINTAINED)
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

// --- EditProfileModal, EditModalForm, MediaGallery, ProfileHeader, ProfileMainContent, InfoRow (No Changes) ---

const EditModalForm = ({ formData, handleChange }) => {
    const relationshipOptions = ['Single', 'In a relationship', 'Married', 'Engaged', 'In a civil union', 'Separated', 'Divorced', 'Widowed', 'In a complicated situation', 'Not specified'];
    return (
        <div className='space-y-4 max-h-[70vh] overflow-y-auto pr-2'>
            
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
        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-4 bg-white rounded-xl shadow-lg'>
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
                            className={`px-3 py-1.5 text-sm font-medium rounded-lg flex items-center gap-1 transition-colors ${
                                activeTab === item.tab 
                                    ? gradientClass 
                                    : 'text-gray-600 hover:bg-gray-100' 
                            }`}
                        >
                            <item.icon className='w-4 h-4' /> {item.name}
                        </button>
                    ))}
                </div>

                <button
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg transition duration-150 flex items-center gap-1 ${gradientClass}`}
                    onClick={() => setShowEdit(true)}
                >
                    <Edit className='w-4 h-4' /> Edit Profile
                </button>
            </div>
        </div>
    );
};


const ProfileSidebar = ({ user, ProfileId }) => {
    const isCurrentUser = !ProfileId || ProfileId === dummyCurrentUser._id;

    const scrollbarHideStyle = {
        msOverflowStyle: 'none',
        scrollbarWidth: 'none',
    };

    const InfoRow = ({ Icon, text, link, linkText }) => {
        if (!text) return null;
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
        // The fixed positioning relies on the window/viewport, which works correctly.
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
                        {!isCurrentUser ? <></> : <div className="h-8"></div> } 
                    </div>

                    <div className='mt-0 space-y-3 text-left'>
                        <InfoRow Icon={UserIcon} text={`Pronouns: ${user.pronouns}`} />
                        <InfoRow Icon={Briefcase} text={`Works at ${user.work}`} />
                        <InfoRow Icon={GraduationCap} text={`Studied at ${user.university}`} />
                        <InfoRow Icon={GraduationCap} text={`Went to ${user.highSchool}`} />
                        <InfoRow Icon={MapPin} text={`Lives in ${user.currentCity}`} />
                        <InfoRow Icon={Flag} text={`From ${user.hometown}`} />
                        
                        <InfoRow Icon={Heart} text={user.relationship} />

                        <InfoRow Icon={CalendarDays} text={`Joined on ${user.joined}`} />

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


const ProfileMainContent = ({ user, posts, activeTab }) => {
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

                {(activeTab === 'friends' || activeTab === 'results') && (
                    <div className='p-10 rounded-xl text-center text-gray-500 w-full bg-white shadow-lg'>
                        <p>Content for the **{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}** tab would be displayed here.</p>
                    </div>
                )}
            </div>
        </div>
    );
};


// ---------------------------------------------
// --- Main Profile Component (FIXED SCROLLBAR LOGIC ADDED) ---
// ---------------------------------------------
const Profile = ({isSidebarOpen}) => {
    const { ProfileId } = useParams();
    const isCurrentUser = !ProfileId || ProfileId === dummyCurrentUser._id;
    const initialUserData = isCurrentUser ? dummyCurrentUser : { ...dummyGuestProfileData, _id: ProfileId };

    const [user, setUser] = useState(initialUserData);
    const [posts, setPosts] = useState([]);
    const [showEdit, setShowEdit] = useState(false);
    const [activeTab, setActiveTab] = useState('posts'); 

    const fetchPosts = () => {
        const profilePosts = dummyPosts.filter(post => post.user_id === user._id);
        setPosts(profilePosts);
    };

    useEffect(() => {
        fetchPosts();
    }, [user, ProfileId]);

    // ⭐ NEW EFFECT: Manages the outer (body) scrollbar ⭐
    useEffect(() => {
        const isLargeScreen = window.innerWidth >= 1024; // Tailwind's 'lg' breakpoint
        
        // Only modify the body style on large screens where the fixed layout is active
        if (isLargeScreen) {
            document.body.style.overflow = 'hidden';
            // Optional: add padding-right to compensate for the scrollbar removal if needed, but not strictly necessary here
        }

        // Cleanup: restore the original body overflow style when the component unmounts
        return () => {
            if (isLargeScreen) {
                document.body.style.overflow = ''; // Resets to default/inherited value
            }
        };
    }, []); 
    // ⭐ END NEW EFFECT ⭐


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
    }, [isSidebarOpen,ProfileId]); 

    const scrollbarHideStyle = {
        msOverflowStyle: 'none',
        scrollbarWidth: 'none',
    };
    
    const scrollableContentStyle = {
        paddingTop: `${SCROLL_PADDING_TOP_PX}px`,
        paddingBottom: '2.5rem',
        ...scrollbarHideStyle,
    };


    if (!user) return <Loading />;

    return (
        // The main container pt-2 class is fine. Keep the existing ml class if an outer sidebar is still desired/present from the parent layout.
        <div className={`pt-2 lg:ml-[${NAV_WIDTH_REM}rem]`}>

            {/* 1. FIXED HEADER */}
            <ProfileHeader 
                user={user} 
                leftOffset={leftOffset} 
                setShowEdit={setShowEdit} 
                activeTab={activeTab} 
                setActiveTab={setActiveTab} 
            />

            {/* 2. Main Flex Row: Crucially uses lg:h-[calc(100vh-4rem)] and lg:overflow-hidden */}
            <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative lg:flex lg:h-[calc(100vh-4rem)] lg:overflow-hidden'>

                {/* Sidebar: Is fixed and self-scrollable */}
                <ProfileSidebar user={user} ProfileId={ProfileId} />


                {/* CONTENT CONTAINER: The main feed area */}
                <div className='lg:w-2/3 relative flex flex-col h-full' style={{ marginLeft: '29%' }}>
                    
                    {/* SCROLLABLE CONTENT: This is the dedicated inner scroll area */}
                    <div className="flex-grow overflow-y-scroll" style={scrollableContentStyle}>
                        <ProfileMainContent
                            user={user}
                            posts={posts}
                            activeTab={activeTab} 
                        />
                    </div>
                </div>

            </div>

            {/* Edit Modal */}
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