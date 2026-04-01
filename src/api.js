// import axios from "axios";

// const api = axios.create({
//   // ✅ FIXED: Points directly to your Express backend port
//   baseURL: "http://localhost:4000/api/v1",
//   withCredentials: true,
// });

import axios from "axios";

// If in production, use the deployed backend URL. If local, use your PC's IP.
const BACKEND_URL = import.meta.env.MODE === "production" 
  ? "https://rigya-backend.onrender.com" // We will update this later!
  : "http://192.168.43.43:4000"; // Your local IP for testing

// ✅ Changed to lowercase 'api' and added 'export const'
export const api = axios.create({
  baseURL: `${BACKEND_URL}/api/v1`,
  withCredentials: true,
});

export const checkBackendConnection = async () => {
  try {
    const response = await api.get("/status/check");
    return {
      success: true,
      message:
        "✅ Backend connection confirmed. Missing 'status/check' endpoint.",
    };
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return {
        success: true,
        message:
          "✅ Backend connection confirmed. Missing 'status/check' endpoint.",
      };
    }
    return {
      success: false,
      message: "❌ Frontend failed to connect to the backend.",
    };
  }
};

// ------------------- AUTHENTICATION ENDPOINTS -------------------

export const registerUser = async (payload) => {
  try {
    const isFormData = payload instanceof FormData;
    const headers = {};

    if (isFormData) {
      headers["Content-Type"] = "multipart/form-data";
    } else {
      headers["Content-Type"] = "application/json";
    }

    const response = await api.post("/auth/register", payload, { headers });
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Registration failed.";
    throw new Error(errorMessage);
  }
};

export const loginUser = async (credentials) => {
  try {
    const response = await api.post("/auth/login", credentials);
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Login failed.";
    throw new Error(errorMessage);
  }
};

export const sendOtp = async (email) => {
  try {
    const response = await api.post("/auth/send-otp", { email });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Failed to send OTP.";
    throw new Error(errorMessage);
  }
};

export const verifyOtp = async (email, otp) => {
  try {
    const response = await api.post("/auth/verify-otp", { email, otp });
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "OTP verification failed.";
    throw new Error(errorMessage);
  }
};

export const sendPasswordResetLink = async (data) => {
  try {
    const response = await api.post("/auth/forgot-password", data);
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Failed to initiate password reset.";
    throw new Error(errorMessage);
  }
};

export const resetPassword = async (credentials) => {
  try {
    const response = await api.put("/auth/reset-password", credentials);
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Failed to reset password.";
    throw new Error(errorMessage);
  }
};

export const getUserProfile = async () => {
  try {
    const response = await api.get("/auth/me");
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Failed to fetch user profile.";
    throw new Error(errorMessage);
  }
};

export const logoutUser = async () => {
  try {
    const response = await api.get("/auth/logout");
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Failed to log out.";
    throw new Error(errorMessage);
  }
};

export const getInstituteByRegNumber = async (instituteRegistrationNumber) => {
  try {
    const response = await api.get(
      `/institutes/details?regNumber=${instituteRegistrationNumber}`
    );
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Failed to fetch institute details.";
    throw new Error(errorMessage);
  }
};

// ------------------- LIBRARY MANAGEMENT ENDPOINTS -------------------

export const getAllBooks = async () => {
  try {
    const response = await api.get("/books/all");
    return response.data.books;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Failed to fetch all books.";
    throw new Error(errorMessage);
  }
};

export const addBook = async (bookData) => {
  try {
    const response = await api.post("/books/admin/add", bookData);
    return response.data.book;
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Failed to add book.";
    throw new Error(errorMessage);
  }
};

export const updateBook = async (id, bookData) => {
  try {
    const response = await api.put(`/books/admin/update/${id}`, bookData);
    return response.data.book;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Failed to update book.";
    throw new Error(errorMessage);
  }
};

export const deleteBook = async (id) => {
  try {
    const response = await api.delete(`/books/admin/delete/${id}`);
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Failed to delete book.";
    throw new Error(errorMessage);
  }
};

export const getBorrowedBooksForUser = async () => {
  try {
    const response = await api.get("/borrows/my-borrowed-active");
    return response.data.myBorrowedBooks;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Failed to fetch your borrowed books.";
    throw new Error(errorMessage);
  }
};

export const getBorrowedBooksForAdmin = async () => {
  try {
    const response = await api.get("/borrows/admin/borrowed-active");
    return response.data.borrowedBooks;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Failed to fetch all borrowed books.";
    throw new Error(errorMessage);
  }
};

export const borrowBook = async (id) => {
  try {
    const response = await api.post(`/borrows/borrow/${id}`);
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Failed to borrow book.";
    throw new Error(errorMessage);
  }
};

export const returnBookByAdmin = async (id) => {
  try {
    const response = await api.put(`/borrows/admin/return/${id}`);
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Failed to return book (Admin).";
    throw new Error(errorMessage);
  }
};

export const returnBook = async (id) => {
  try {
    const response = await api.put(`/borrows/return/${id}`);
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Failed to return book.";
    throw new Error(errorMessage);
  }
};

export const getReturnedBooksForUser = async () => {
  try {
    const response = await api.get("/borrows/my-returned-history");
    return response.data.returnedBooks;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Failed to fetch your returned books.";
    throw new Error(errorMessage);
  }
};

export const getReturnedBooksForAdmin = async () => {
  try {
    const response = await api.get("/borrows/admin/returned-history");
    return response.data.returnedBooks;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Failed to fetch all returned books.";
    throw new Error(errorMessage);
  }
};

export const getAllUsersForAdmin = async () => {
  try {
    const response = await api.get("/user/admin/all");
    return response.data.users;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Failed to fetch all users.";
    throw new Error(errorMessage);
  }
};

export const borrowBookByLibrarian = async (userId, bookId, dueDate) => {
  try {
    const response = await api.post("/borrows/admin/borrow", {
      userId,
      bookId,
      dueDate,
    });
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Failed to assign book.";
    throw new Error(errorMessage);
  }
};

// ------------------- SOCIAL MEDIA ENDPOINTS -------------------

export const createSocialPost = async (formData) => {
  try {
    const response = await api.post("/social/create", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Failed to create post.";
    throw new Error(errorMessage);
  }
};

export const getSocialFeed = async () => {
  try {
    const response = await api.get("/social/feed");
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Failed to fetch feed.";
    throw new Error(errorMessage);
  }
};

export const togglePostLike = async (postId) => {
  try {
    const response = await api.put(`/social/${postId}/like`);
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Failed to like post.";
    throw new Error(errorMessage);
  }
};

export const addPostComment = async (postId, content) => {
  try {
    const response = await api.post(`/social/${postId}/comment`, { content });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Failed to add comment.";
    throw new Error(errorMessage);
  }
};

export const getUserById = async (userId) => {
  try {
    const response = await api.get(`/user/${userId}`);
    return response.data.user;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to fetch user.");
  }
};

export const deleteSocialPost = async (postId) => {
  try {
    const response = await api.delete(`/social/${postId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to delete post.");
  }
};

export const updateSocialPost = async (postId, content) => {
  try {
    const response = await api.put(`/social/${postId}`, { content });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to update post.");
  }
};

export const updateUserProfile = async (formData) => {
  try {
    // We are passing formData directly, and telling axios it contains files!
    const response = await api.put("/user/profile/update", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to update profile.");
  }
};

// ------------------- FRIEND SYSTEM ENDPOINTS -------------------

// Get all real friend data on load
export const getMySocialData = async () => {
  try {
    const response = await api.get(`/friends/my-data`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to fetch social data.");
  }
};
export const toggleFriendRequest = async (userId) => {
  try {
    const response = await api.post(`/friends/request/${userId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to toggle friend request.");
  }
};

export const acceptFriendRequest = async (userId) => {
  try {
    const response = await api.post(`/friends/accept/${userId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to accept friend request.");
  }
};

export const rejectFriendRequest = async (userId) => {
  try {
    const response = await api.post(`/friends/reject/${userId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to reject friend request.");
  }
};

export const removeFriend = async (userId) => {
  try {
    const response = await api.delete(`/friends/remove/${userId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to remove friend.");
  }
};


// ------------------- LIVE CHAT ENDPOINTS -------------------

export const accessChat = async (userId) => {
  try {
    const response = await api.post(`/chat`, { userId });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to access chat.");
  }
};

export const fetchChats = async () => {
  try {
    const response = await api.get(`/chat`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to fetch chats.");
  }
};

// ✅ BACK TO NORMAL IN api.js
export const sendMessage = async (formData) => {
  try {
    const response = await api.post(`/chat/message`, formData);
    return response.data;
  } catch (error) {
    console.error("API Error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Failed to send message");
  }
};

export const fetchMessages = async (chatId) => {
  try {
    const response = await api.get(`/chat/message/${chatId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to fetch messages.");
  }
};

export const markMessagesAsRead = async (chatId) => {
  try {
    const response = await api.put(`/chat/message/read`, { chatId });
    return response.data;
  } catch (error) {
    console.error("Failed to mark messages as read");
  }
};

// ------------------- SEARCH ENDPOINTS -------------------

export const searchInstituteUsers = async (searchTerm) => {
  try {
    const response = await api.get(`/user/search?search=${searchTerm}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to search users.");
  }
};

// ------------------- NOTIFICATION ENDPOINTS -------------------

export const fetchNotifications = async () => {
  try {
    const response = await api.get(`/notification`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch notifications:", error);
    return { notifications: [] };
  }
};

export const markNotificationsAsRead = async () => {
  try {
    const response = await api.put(`/notification/read`);
    return response.data;
  } catch (error) {
    console.error("Failed to mark notifications as read:", error);
  }
};
// ✅ Corrected URL to match your backend's /social route
export const deleteSocialComment = async (postId, commentId) => {
  try {
    const response = await api.delete(`/social/${postId}/comment/${commentId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to delete comment");
  }
};

// Delete a specific notification
export const deleteNotification = async (notificationId) => {
  try {
    const response = await api.delete(`/notification/${notificationId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to delete notification");
  }
};

// Delete a chat message
export const deleteChatMessage = async (messageId) => {
  try {
    const response = await api.delete(`/chat/message/${messageId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to delete message");
  }
};

export default api;