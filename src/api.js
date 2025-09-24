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
      message: response.data.message || "Connection successful.",
    };
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return {
        success: true,
        message: "✅ Backend connection confirmed. Missing 'status/check' endpoint.",
      };
    }
    return {
      success: false,
      message: "❌ Frontend failed to connect to the backend.",
    };
  }
};

export const registerUser = async (payload) => {
  try {
    const isFormData = payload instanceof FormData;
    const headers = {};

    // FIX: Explicitly set Content-Type header for FormData
    if (isFormData) {
      headers['Content-Type'] = 'multipart/form-data';
    } else {
      headers['Content-Type'] = 'application/json';
    }

    const response = await api.post("/auth/register", payload, { headers });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Registration failed.";
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
    const errorMessage = error.response?.data?.message || "OTP verification failed.";
    throw new Error(errorMessage);
  }
};

// Renamed this function to reflect the token-based link flow
export const sendPasswordResetLink = async (data) => {
  try {
    const response = await api.post("/auth/forgot-password", data);
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Failed to initiate password reset.";
    throw new Error(errorMessage);
  }
};

export const resetPassword = async (credentials) => {
  try {
    const response = await api.put("/auth/reset-password", credentials);
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Failed to reset password.";
    throw new Error(errorMessage);
  }
};

export const getUserProfile = async () => {
  try {
    const response = await api.get("/auth/me");
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Failed to fetch user profile.";
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

export default api;