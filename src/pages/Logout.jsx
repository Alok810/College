import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    // Clear user session or token here if needed
    localStorage.removeItem("authToken");

    // Redirect to AuthPage after logout
    navigate("/auth");
  }, [navigate]);

  return (
    <div className="flex items-center justify-center h-screen">
      <h2 className="text-2xl font-bold">Logging you out...</h2>
    </div>
  );
}
