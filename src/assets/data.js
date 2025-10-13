// src/assets/data.js (Final Update with Profile Details)

// ------------------- Current User Data -------------------
export const dummyCurrentUser = {
  _id: "user_1",
  username: "current_user",
  full_name: "Alok Kumar", 
  profilePicture: "https://i.pravatar.cc/150?u=user_1",
  cover_photo: 'https://picsum.photos/1000/300', 
  bio: 'This is your own profile bio. You can edit this!',
  location: 'Ranchi, India',
  createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 365 * 3), 
  followers: ["user_2", "user_3", "user_4", "user_guest"], 
  following: ["user_2", "user_3"],

  // === PROFILE DETAILS ADDED FROM SCREENSHOTS ===
  pronouns: 'He/Him',
  work: 'Student', 
  university: 'National Institute of Advanced Manufacturing Technology Ranchi', 
  highSchool: 'Sarswati Shishu Vidya Mandir', 
  currentCity: 'Sugauli',
  hometown: 'Sugauli',
  relationship: 'Single', // Based on "Add a relationship status"
  joined: 'March 2019',
  socialLink: 'alokgond.in', 
  socialFollowers: 262, // From the social links line
};


// ------------------- Generic Guest Profile Data -------------------
export const dummyGuestProfileData = {
  _id: 'user_guest', 
  username: 'profile_user_guest',
  full_name: 'Guest Profile',
  profilePicture: 'https://i.pravatar.cc/150?u=profile_user_guest',
  cover_photo: 'https://picsum.photos/1000/300', 
  bio: 'Software engineer and a passionate community builder, dedicated to open-source projects.',
  location: 'San Francisco, CA',
  createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 365 * 2), 
  followers: ["user_1", "user_3"],
  following: ["user_1", "user_2", "user_4"],
  
  // Default values for Guest Profile
  pronouns: 'They/Them',
  work: 'Software Engineer',
  university: 'Stanford University',
  highSchool: 'Local High School',
  currentCity: 'San Francisco',
  hometown: 'New York',
  relationship: 'In a relationship',
  joined: 'January 2021',
  socialLink: 'guestprofile.dev',
  socialFollowers: 1200,
};

// ------------------- Recent Messages Data -------------------
export const dummyRecentMessagesData = [
  {
    _id: "msg_1",
    from_user_id: {
      _id: "user_2",
      full_name: "Jane Doe",
      profile_picture: "https://i.pravatar.cc/150?u=user_2",
    },
    text: "Hey, are we still on for lunch?",
    seen: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 5),
  },
  {
    _id: "msg_2",
    from_user_id: {
      _id: "user_3",
      full_name: "John Smith",
      profile_picture: "https://i.pravatar.cc/150?u=user_3",
    },
    text: "Can you send me that file?",
    seen: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
  },
  {
    _id: "msg_3",
    from_user_id: {
      _id: "user_4",
      full_name: "Alex Ray",
      profile_picture: "https://i.pravatar.cc/150?u=user_4",
    },
    text: "Sent an attachment.",
    seen: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
  },
];

// ------------------- Full Chat History Data -------------------
export const initialChatHistory = {
  "user_2": [
    { id: 1, senderId: "user_2", text: "Hi! Did you see the latest project update?", timestamp: Date.now() - 3600000 * 2 },
    { id: 2, senderId: "user_1", text: "Yes, I did! Looks like we're good to launch next week.", timestamp: Date.now() - 3600000 * 1.5 },
    { id: 3, senderId: "user_2", text: "Hey, are we still on for lunch?", timestamp: Date.now() - 1000 * 60 * 5 },
  ],
  "user_3": [
    { id: 4, senderId: "user_3", text: "I need the final presentation deck by 5 PM.", timestamp: Date.now() - 7500000 },
    { id: 5, senderId: "user_1", text: "On it! Will share it within the hour.", timestamp: Date.now() - 7200000 },
    { id: 6, senderId: "user_3", text: "Can you send me that file?", timestamp: Date.now() - 1000 * 60 * 60 * 2 },
  ],
  "user_4": [
    { id: 7, senderId: "user_1", text: "Did you manage to fix the bug?", timestamp: Date.now() - 86400000 * 2 },
    { id: 8, senderId: "user_4", text: "It's done! Check my pull request.", timestamp: Date.now() - 86400000 * 1.5 },
    { id: 9, senderId: "user_4", text: "I sent the screenshot of the fix.", timestamp: Date.now() - 1000 * 60 * 60 * 24 },
  ],
};


// ------------------- Posts Data -------------------
export const dummyPosts = [
    // Post 1: Jane Doe (user_2)
    {
        _id: "post_1",
        content: "Just enjoying a beautiful day out with #nature and #sunshine! ☀️ What a view!",
        image_urls: ["https://images.unsplash.com/photo-1501854140801-50d01698950b"],
        user_id: "user_2", 
        user: { 
            _id: "user_2", 
            username: "janedoe", 
            full_name: "Jane Doe", 
            profilePicture: "https://i.pravatar.cc/150?u=user_2", 
            cover_photo: 'https://images.unsplash.com/photo-1472214103604-5aa45f04653d', 
        },
        likes: ["user_1", "user_3", "user_4", "user_guest"],
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), 
    },
    // Post 2: John Smith (user_3)
    {
        _id: "post_2",
        content: "Check out this amazing street art I found downtown. #art #graffiti",
        image_urls: [
            "https://images.unsplash.com/photo-1547891654-e66ed7ebb968",
            "https://images.unsplash.com/photo-1579541628552-eb06a3501713",
        ],
        user_id: "user_3", 
        user: { 
            _id: "user_3", 
            username: "johnsmith", 
            full_name: "John Smith", 
            profilePicture: "https://i.pravatar.cc/150?u=user_3", 
            cover_photo: 'https://images.unsplash.com/photo-1557683316-928d36376882', 
        },
        likes: ["user_2", "user_1"],
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5), 
    },
    // Post 3: Alex Ray (user_4)
    {
        _id: "post_3",
        content: "My new work-from-home setup is finally complete! #wfh #desksetup 💻",
        image_urls: [],
        user_id: "user_4", 
        user: { 
            _id: "user_4", 
            username: "alexray", 
            full_name: "Alex Ray", 
            profilePicture: "https://i.pravatar.cc/150?u=user_4", 
            cover_photo: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085', 
        },
        likes: ["user_1", "user_2", "user_3", "user_guest"],
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), 
    },
    
    // --- POSTS FOR ALOK KUMAR (user_1) START HERE ---

    // Post 4 (Existing)
    {
        _id: "post_4",
        content: "Just published my latest article on React performance! Check it out! #react #coding",
        image_urls: ["https://picsum.photos/800/600?random=2"],
        user_id: "user_1", 
        user: dummyCurrentUser,
        likes: ["user_2", "user_3", "user_4"],
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), 
    },
    
    // Post 6 (NEW) - Technical Post
    {
        _id: "post_6",
        content: "Spent the night debugging a complex async issue. Finally conquered it! Nothing beats that feeling. 😅 #javascript #debuglife",
        image_urls: [],
        user_id: "user_1", 
        user: dummyCurrentUser,
        likes: ["user_2", "user_guest"],
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 10), 
    },

    // Post 7 (NEW) - Casual/Personal Post
    {
        _id: "post_7",
        content: "Ranchi weather is perfect today. Coffee and code session underway! ☕",
        image_urls: ["https://picsum.photos/800/600?random=3"],
        user_id: "user_1", 
        user: dummyCurrentUser,
        likes: ["user_3", "user_4", "user_2"],
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3), 
    },

    // Post 8 (NEW) - Announcement/Academic Post
    {
        _id: "post_8",
        content: "Excited to start my final year project on AI in manufacturing! Wish me luck! 🤖 #NIAMTRanchi #Engineering",
        image_urls: ["https://picsum.photos/800/600?random=4"],
        user_id: "user_1", 
        user: dummyCurrentUser,
        likes: ["user_1", "user_2", "user_3", "user_4", "user_guest"],
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 1), // Most recent post
    },
    
    // --- POSTS FOR ALOK KUMAR (user_1) END HERE ---

    // Post 5 (Guest Profile)
    {
        _id: "post_5",
        content: "Exploring the vibrant streets of San Francisco. Love the fog! 🌁",
        image_urls: [
            "https://images.unsplash.com/photo-1506155620959-1e3c83664d47",
            "https://images.unsplash.com/photo-1457177583907-f1264c8d9e77"
        ],
        user_id: "user_guest", 
        user: dummyGuestProfileData,
        likes: ["user_1"],
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12), 
    },
];