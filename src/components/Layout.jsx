import React from "react";
import AdminDashboard from "../pages/AdminDashboard";

export default function Layout() {
  return (
    <div className="flex h-screen">
      {/* Sidebar (fixed, non-scrollable) */}
      <aside className="w-64 bg-[#2d2d6f] text-white fixed h-screen flex-shrink-0">
        <div className="p-4 text-xl font-bold border-b border-gray-600">
          Admin Panel
        </div>
        <ul className="space-y-4 p-4">
          <li className="hover:bg-[#3a3a80] p-2 rounded cursor-pointer">
            Dashboard
          </li>
          <li className="hover:bg-[#3a3a80] p-2 rounded cursor-pointer">
            Users
          </li>
          <li className="hover:bg-[#3a3a80] p-2 rounded cursor-pointer">
            Reports
          </li>
          <li className="hover:bg-[#3a3a80] p-2 rounded cursor-pointer">
            Settings
          </li>
        </ul>
      </aside>

      {/* Main content (scrollable) */}
      <main className="ml-64 flex-1 overflow-y-auto bg-gray-100">
        <AdminDashboard />
      </main>
    </div>
  );
}
