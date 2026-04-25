import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { logoutUser } from "../api"; // 👈 Import from your api.js!

export default function Logout() {
  const navigate = useNavigate();
  const { setIsAuthenticated } = useAuth();

  useEffect(() => {
    const performLogout = async () => {
      try {
        // 1. Let Axios handle the exact URL, port, and secure cookie headers!
        await logoutUser();
      } catch (error) {
        console.error("Error logging out from server:", error);
      } finally {
        // 2. Nuke local storage
        localStorage.clear();
        sessionStorage.clear();

        // 3. Clear React memory
        setIsAuthenticated(false);

        // 4. Redirect safely
        navigate("/auth", { replace: true });
      }
    };

    performLogout();
  }, [navigate, setIsAuthenticated]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
       <div className="w-12 h-12 border-4 border-t-4 border-purple-600 border-t-transparent rounded-full animate-spin mb-4"></div>
       <h2 className="text-xl font-bold text-gray-700">Safely logging you out...</h2>
    </div>
  );
}