import axios from "axios";

// --- MAIN RIGYA BACKEND ---
const BACKEND_URL = import.meta.env.MODE === "production" 
  ? "https://api.rigya.in" 
  : "http://localhost:4000";

// 🟢 THE FIX: ADD THIS AISHE MICROSERVICE URL!
export const AISHE_BACKEND_URL = import.meta.env.MODE === "production" 
  ? "https://aishe.rigya.in"
  : "http://localhost:8000";

export const api = axios.create({
  baseURL: `${BACKEND_URL}/api/v1`,
  withCredentials: true,
});

// 🟢 THE GLOBAL SAFETY NET: Auto-Logout on Expired Session
api.interceptors.response.use(
  (response) => response, // If the request succeeds, pass it through normally
  (error) => {
    // If the backend says "401 Unauthorized" AND we aren't already on the Auth/Reset page...
    if (error.response && error.response.status === 401) {
      if (window.location.pathname !== '/auth' && window.location.pathname !== '/reset-password') {
        console.warn("Session expired or invalid. Redirecting to login...");
        
        // Force the browser to go to the login page
        window.location.href = '/auth'; 
      }
    }
    return Promise.reject(error); // Pass the error back to the component
  }
);

export const checkBackendConnection = async () => {
  try {
    await api.get("/status/check");
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

// Make sure "export" is right here at the start!
export const searchAisheInstitutes = async (searchQuery) => {
  try {
    const response = await axios.get(`${AISHE_BACKEND_URL}/api/v1/institutes/search?q=${encodeURIComponent(searchQuery)}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to search directory.");
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

export const updateUserSettings = async (settingsData) => {
  try {
    const response = await api.put("/user/settings/update", settingsData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to update settings.");
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

export const addBook = async (formData) => {
  try {
    const response = await api.post("/books/admin/add", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data.book;
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Failed to add book.";
    throw new Error(errorMessage);
  }
};

export const updateBook = async (id, formData) => {
  try {
    const response = await api.put(`/books/admin/update/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
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

// 🟢 UPDATED: Student requests a book (no longer sends dueDate)
export const borrowBook = async (id) => {
  try {
    const response = await api.post(`/borrows/borrow/${id}`);
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Failed to request book.";
    throw new Error(errorMessage);
  }
};

// ==========================================
// 🟢 NEW: REQUEST & APPROVAL ENDPOINTS
// ==========================================

export const getPendingBorrowRequests = async () => {
  try {
    const response = await api.get("/borrows/admin/requests/pending");
    return response.data.pendingRequests;
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Failed to fetch pending requests.";
    throw new Error(errorMessage);
  }
};

// 🟢 NEW: Fetch pending requests for the Student
export const getMyPendingRequests = async () => {
  try {
    const response = await api.get("/borrows/my-requests/pending");
    return response.data.pendingRequests;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to fetch your requests.");
  }
};

export const approveRequest = async (requestId, dueDate) => {
  try {
    const response = await api.put(`/borrows/admin/requests/${requestId}/approve`, { dueDate });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Failed to approve request.";
    throw new Error(errorMessage);
  }
};

export const rejectRequest = async (requestId) => {
  try {
    const response = await api.delete(`/borrows/admin/requests/${requestId}/reject`);
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Failed to reject request.";
    throw new Error(errorMessage);
  }
};

// ==========================================
// EXISTING RETURN & ADMIN ENDPOINTS
// ==========================================

export const returnBookByAdmin = async (id, fineAmount = 0) => {
  try {
    const response = await api.put(`/borrows/admin/return/${id}`, { fineAmount });
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

export const addBookReview = async (id, reviewData) => {
  try {
    const response = await api.post(`/books/${id}/reviews`, reviewData); 
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Failed to submit review.";
    throw new Error(errorMessage);
  }
};

export const getFineLedger = async () => {
  try {
    const response = await api.get("/fines/ledger"); 
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Failed to fetch fine ledger.";
    throw new Error(errorMessage);
  }
};

export const bulkImportBooks = async (formData) => {
  try {
    // 🟢 REMOVED the manual Content-Type header so Axios can generate the proper file boundaries!
    const response = await api.post("/books/admin/import", formData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to import books via CSV.");
  }
};

export const exportFineLedger = async () => {
  try {
    const response = await api.get("/fines/ledger/export", {
      responseType: 'blob', 
    });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Failed to export ledger.";
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

export const getSocialFeed = async (page = 1, limit = 10) => {
  try {
    const response = await api.get(`/social/feed?page=${page}&limit=${limit}`);
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
    // ✅ Fixed! Now we are actually using the 'error' variable by logging it.
    console.error("Failed to mark messages as read:", error); 
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

export const deleteSocialComment = async (postId, commentId) => {
  try {
    const response = await api.delete(`/social/${postId}/comment/${commentId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to delete comment");
  }
};

export const deleteNotification = async (notificationId) => {
  try {
    const response = await api.delete(`/notification/${notificationId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to delete notification");
  }
};

export const deleteChatMessage = async (messageId) => {
  try {
    const response = await api.delete(`/chat/message/${messageId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to delete message");
  }
};

// ------------------- RESULT SYSTEM ENDPOINTS -------------------

export const getMyResults = async () => {
  try {
    const res = await api.get('/results/my-results'); 
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getAllResultsForAdmin = async (page = 1, limit = 50) => {
  try {
    const res = await api.get(`/results/all?page=${page}&limit=${limit}`); 
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const publishResult = async (resultData) => {
  try {
    const res = await api.post('/results', resultData); 
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateResult = async (resultId, resultData) => {
  try {
    const res = await api.put(`/results/${resultId}`, resultData); 
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const deleteResult = async (resultId) => {
  try {
    const res = await api.delete(`/results/${resultId}`); 
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getUserResults = async (userId) => {
  try {
    const res = await api.get(`/results/user/${userId}`); 
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getClassResultsForStudents = async (page = 1, limit = 50) => {
  try {
    const res = await api.get(`/results/class-results?page=${page}&limit=${limit}`); 
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const publishBatchResults = async (publishData) => {
    try {
        const response = await api.put('/results/publish/batch', publishData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const bulkUploadResults = async (bulkData) => {
    try {
        const response = await api.post('/results/bulk', bulkData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const requestRevaluation = async (resultId, reason) => {
  try {
    const res = await api.post(`/results/${resultId}/revaluation`, { reason });
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getPendingRevaluations = async () => {
  try {
    const res = await api.get('/results/revaluations/pending');
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const resolveRevaluation = async (resultId, status, remarks) => {
  try {
    const res = await api.put(`/results/${resultId}/revaluation/resolve`, { status, remarks });
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// ------------------- COURSE BLUEPRINT ENDPOINTS -------------------

// 🟢 NEW: Add this right here!
export const getDepartmentSubjectCounts = async (branch) => {
    try {
        const response = await api.get(`/courses/department/${encodeURIComponent(branch)}/subject-counts`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const saveCourseBlueprint = async (courseData) => {
  try {
    const res = await api.post('/courses', courseData);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getCourseBlueprint = async (batch, branch, semester) => {
    try {
        const response = await api.get(`/courses/${encodeURIComponent(batch)}/${encodeURIComponent(branch)}/${encodeURIComponent(semester)}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getFacultyAssignedSubjects = async (facultyId) => {
    try {
        const response = await api.get(`/courses/faculty/${facultyId}`);
        return response.data.subjects;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// ------------------- ADMIN DASHBOARD ENDPOINTS -------------------

export const getAdminStats = async () => {
  try {
    const res = await api.get('/admin/stats');
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getAdminUsers = async () => {
  try {
    const res = await api.get('/admin/users');
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getPendingInstituteUsers = async () => {
  try {
    const res = await api.get('/admin/users/pending');
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const verifyInstituteUser = async (userId, action) => {
  try {
    const res = await api.put(`/admin/users/${userId}/verify`, { action });
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// ------------------- SUPER ADMIN ENDPOINTS -------------------

export const getSuperAdminStats = async () => {
  try {
    const res = await api.get('/superadmin/stats'); 
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getSuperAdminInstitutes = async () => {
  try {
    const res = await api.get('/superadmin/institutes'); 
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const toggleInstituteApproval = async (instituteId, isApproved) => {
  try {
    const res = await api.put(`/superadmin/institutes/${instituteId}/approve`, { isApproved }); 
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getActiveAnnouncements = async () => {
  try {
    const res = await api.get('/superadmin/announcements/active'); 
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const createAnnouncement = async (data) => {
  try {
    const res = await api.post('/superadmin/announcements', data); 
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const deactivateAnnouncement = async (id) => {
  try {
    const res = await api.delete(`/superadmin/announcements/${id}`); 
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// ------------------- CAMPUS MANAGEMENT ENDPOINTS -------------------

export const updateUserDesignation = async (userId, designation) => {
    try {
        const { data } = await api.put(`/admin/users/${userId}/designation`, { designation });
        return data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// ==========================================
// CLUB MANAGEMENT API
// ==========================================

export const createClub = async (clubData) => {
    try {
        const { data } = await api.post(`/user/clubs`, clubData); 
        return data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const fetchCampusClubs = async () => {
    try {
        const { data } = await api.get('/user/clubs');
        return data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const requestJoinClub = async (clubId) => {
    try {
        const { data } = await api.post(`/user/clubs/${clubId}/request`); 
        return data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const handleClubRequest = async (clubId, studentId, action) => {
    try {
        const { data } = await api.put(`/user/clubs/${clubId}/request`, { studentId, action });
        return data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const promoteClubMember = async (clubId, studentId, roleTitle) => {
    try {
        const { data } = await api.put(`/user/clubs/${clubId}/promote`, { studentId, roleTitle });
        return data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const removeClubMember = async (clubId, studentId) => {
    try {
        const { data } = await api.put(`/user/clubs/${clubId}/remove`, { studentId });
        return data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const addClubRole = async (clubId, roleData) => {
    try {
        const { data } = await api.post(`/user/clubs/${clubId}/roles`, roleData);
        return data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const transferClubLeadership = async (clubId, transferData) => {
    try {
        const { data } = await api.put(`/user/clubs/${clubId}/transfer`, transferData);
        return data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const deleteClub = async (clubId) => {
    try {
        const { data } = await api.delete(`/user/clubs/${clubId}`);
        return data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// ==========================================
// EVENT API
// ==========================================

export const fetchCampusEvents = async () => {
    try {
        const { data } = await api.get('/user/events');
        return data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const createEvent = async (eventData) => {
    try {
        const { data } = await api.post('/user/events', eventData);
        return data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const searchUsers = async (query) => {
    try {
        const { data } = await api.get(`/user/search?search=${query}`);
        return data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// ==========================================
// 🏢 DEPARTMENT API (PUBLIC & PRIVATE)
// ==========================================

export const getPublicDepartments = async (regNum) => {
    try {
        const response = await api.get(`/departments/public/${regNum}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getInstituteDepartments = async () => {
    try {
        const response = await api.get('/departments');
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const createDepartment = async (departmentData) => {
    try {
        const response = await api.post('/departments', departmentData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const updateDepartment = async (id, departmentData) => {
    try {
        const response = await api.put(`/departments/${id}`, departmentData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const deleteDepartment = async (id) => {
    try {
        const response = await api.delete(`/departments/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getDepartmentStudents = async (branchAbbreviation) => {
    try {
        const response = await api.get(`/departments/students/${branchAbbreviation}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getDepartmentTeachers = async (branch) => {
    try {
        const response = await api.get(`/user/department-teachers/${encodeURIComponent(branch)}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// ------------------- RESUME BUILDER ENDPOINTS -------------------
export const saveUserResume = async (resumeData) => {
  try {
    const response = await api.put("/user/resume/update", { resumeData });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to save resume.");
  }
};

// 🔥 FIXED: Added '/resume' to match app.js routing
export const enhanceTextWithAI = async (text) => {
  try {
    const response = await api.post("/resume/enhance-text", { text });
    return response.data.enhancedText;
  } catch (error) {
    console.error("Error enhancing text:", error);
    throw error;
  }
};

