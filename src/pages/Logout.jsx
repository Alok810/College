import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
// ✨ FIX: Import your custom 'api' instance
import { logoutUser, api } from "../api"; 

export default function Logout() {
  const navigate = useNavigate();
  const { setIsAuthenticated } = useAuth();

  useEffect(() => {
    const performLogout = async () => {
      // 🟢 1. UNSUBSCRIBE FROM PUSH NOTIFICATIONS
      try {
        if ('serviceWorker' in navigator) {
            const register = await navigator.serviceWorker.getRegistration();
            
            if (register && register.pushManager) {
                const subscription = await register.pushManager.getSubscription();
                
                if (subscription) {
                    // ✨ FIX: Use the custom api instance! No more localhost.
                    await api.post(
                        '/push/unsubscribe', 
                        { endpoint: subscription.endpoint }
                    );
                    
                    await subscription.unsubscribe();
                    console.log("Successfully unsubscribed from Push Notifications.");
                }
            }
        }
      } catch (error) {
        console.error("Failed to unsubscribe during logout:", error);
      }

      // 2. PROCEED WITH NORMAL LOGOUT
      try {
        await logoutUser();
      } catch (error) {
        console.error("Error logging out from server:", error);
      } finally {
        // 3. Nuke local storage
        localStorage.clear();
        sessionStorage.clear();

        // 4. Clear React memory
        setIsAuthenticated(false);

        // 5. Redirect safely
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