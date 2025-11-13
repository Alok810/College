import {
    dummyPosts,
    dummyCurrentUser,
    dummyGuestProfileData,
    dummyFriendsData,
    dummyFriendRequestsData,
    dummySuggestionsData
} from '../assets/data.js';

// This function now correctly normalizes inconsistent data
export const findUserById = (id) => {
    // 1. Check if the requested ID is the current user
    if (id === dummyCurrentUser._id) {
        // Normalize the current user object
        return {
            ...dummyCurrentUser,
            profile_picture: dummyCurrentUser.profilePicture // Add the lowercase key
        };
    }

    // 2. Search all data sources
    const allUsers = new Map();
    
    // Add users from posts (uses 'profilePicture')
    dummyPosts.forEach(post => {
        if (post.user && !allUsers.has(post.user._id)) { 
            const user = post.user;
            // Normalize: Add the lowercase key
            allUsers.set(user._id, {
                ...user,
                profile_picture: user.profilePicture
            });
        }
    });
    
    // Add users from friends list (uses 'profile_picture')
    dummyFriendsData.forEach(friend => {
        if(!allUsers.has(friend._id)) {
             // This data is already correct (lowercase key)
             allUsers.set(friend._id, {
                _id: friend._id,
                full_name: friend.full_name,
                profile_picture: friend.profile_picture,
            });
        }
    });

    // Add users from friend requests (uses 'profile_picture')
    dummyFriendRequestsData.forEach(req => {
         if(!allUsers.has(req._id)) {
             // This data is already correct (lowercase key)
             allUsers.set(req._id, {
                _id: req._id,
                full_name: req.full_name,
                profile_picture: req.profile_picture,
            });
        }
    });

    // Add users from suggestions (uses 'profile_picture')
    dummySuggestionsData.forEach(sug => {
        if(!allUsers.has(sug._id)) {
            // This data is already correct (lowercase key)
            allUsers.set(sug._id, {
                _id: sug._id,
                full_name: sug.full_name,
                profile_picture: sug.profile_picture,
            });
        }
    });

    // Add guest user (uses 'profilePicture')
    if (!allUsers.has(dummyGuestProfileData._id)) {
        const guest = dummyGuestProfileData;
         // Normalize: Add the lowercase key
         allUsers.set(guest._id, {
            ...guest,
            profile_picture: guest.profilePicture
         });
    }

    // Attempt to find the user
    const foundUser = allUsers.get(id);

    if (foundUser) {
        // Merge found user data with potential missing fields from dummyGuestProfileData
        const base = {
            ...dummyGuestProfileData,
            profile_picture: dummyGuestProfileData.profilePicture
        };
        
        return {
            ...base,    // Use as a base for default fields
            ...foundUser, // Override with specific user data
            _id: id         // Ensure ID is correct
        };
    }

    // 3. If not found, return null
    return null;
};