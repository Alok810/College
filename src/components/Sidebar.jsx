import React from "react";
import { NavLink } from "react-router-dom";

export default function Sidebar() {
  const linkClass =
    "block py-2 px-4 rounded hover:bg-gray-200 transition duration-200";

  return (
    <aside className="w-64 min-h-screen border-r bg-gray-50 p-4">
      <h1 className="text-xl font-bold mb-6">College</h1>
      <nav className="space-y-2">
        <NavLink to="/" className={linkClass}>
          Home
        </NavLink>
        <NavLink to="/profile" className={linkClass}>
          Profile
        </NavLink>
        <NavLink to="/settings" className={linkClass}>
          Settings
        </NavLink>
        <NavLink to="/logout" className={linkClass}>
          Logout
        </NavLink>
      </nav>
    </aside>
  );
}
