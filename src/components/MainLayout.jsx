import React, { useState } from "react";
import { useLocation, Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import InstituteHeader from "../pages/InstituteHeader";
import { useAuth } from "../context/AuthContext";

export default function MainLayout() {
  const location = useLocation();
  const hideSidebar = location.pathname === "/auth" || location.pathname === "/reset-password";
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { authData } = useAuth();

  // Retrieve institute data safely from authData
  const instituteName = authData.userType === "Institute" ? authData.instituteName : authData.instituteDetails?.instituteName || "Your Institute";
  const instituteLogo = authData.userType === "Institute" ? authData.logo?.url : authData.instituteDetails?.logo?.url || null;

  return (
    <div
      className="relative min-h-screen w-full"
      style={{
        background: "linear-gradient(to bottom, #d6f8df, rgb(227, 224, 250), #88e4f4)",
        backgroundAttachment: "fixed",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
      }}
    >
      <div className="flex min-h-screen transition-all duration-300">
        {!hideSidebar && (
          <div className="fixed left-0 top-0 h-screen transition-all duration-300 z-20">
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
          </div>
        )}

        <div
          className="flex-1 p-6 overflow-y-auto transition-all duration-300 z-10"
          style={{
            marginLeft: !hideSidebar ? (isSidebarOpen ? "16rem" : "5rem") : "0",
            paddingTop: "0.5rem", // Changed from "1rem" to "0.5rem"
          }}
        >
          {!hideSidebar && (
            <InstituteHeader
              isSidebarOpen={isSidebarOpen}
              instituteName={instituteName}
              instituteLogo={instituteLogo}
            />
          )}

          {/* This is where the nested routes will be rendered */}
          <Outlet  />
        </div>
      </div>
    </div>
  );
}