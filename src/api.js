import axios from "axios";

const api = axios.create({
  baseURL: "/api/v1",
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

// --- AUTHENTICATION ENDPOINTS (Skipped for brevity) ---
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

// --- LIBRARY MANAGEMENT ENDPOINTS ---

export const getAllBooks = async () => {
  try {
    const response = await api.get("/books/all"); // Assuming controller returns { success: true, books: [...] }
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

// FIX 1: Update path to new active borrowed route
export const getBorrowedBooksForUser = async () => {
  try {
    // Path changed from /my-borrowed-books to /my-borrowed-active
    const response = await api.get("/borrows/my-borrowed-active"); // Assuming controller returns { success: true, myBorrowedBooks: [...] }
    return response.data.myBorrowedBooks;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Failed to fetch your borrowed books.";
    throw new Error(errorMessage);
  }
};

// FIX 2: Update path to new admin borrowed route
export const getBorrowedBooksForAdmin = async () => {
  try {
    // Path changed from /borrowed-books-by-users to /admin/borrowed-active
    const response = await api.get("/borrows/admin/borrowed-active"); // Assuming controller returns { success: true, borrowedBooks: [...] }
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
    // Path: /my-returned-history (Matches router)
    const response = await api.get("/borrows/my-returned-history"); // Assuming controller returns { success: true, returnedBooks: [...] }
    return response.data.returnedBooks;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Failed to fetch your returned books.";
    throw new Error(errorMessage);
  }
};

// --- NEW ENDPOINT: Get All Users for Admin ---
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

// NEW: API function for librarian to assign a book to a user
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

export default api;
