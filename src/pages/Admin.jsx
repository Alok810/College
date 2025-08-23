import React, { useState, useEffect } from "react";

const mockUsers = [
  { id: 1, name: "Dr. A. Sharma", role: "Director", verified: false },
  { id: 2, name: "Prof. B. Gupta", role: "Dean", verified: false },
  { id: 3, name: "Mr. C. Singh", role: "Librarian", verified: false },
];

export default function Admin() {
  const [users, setUsers] = useState([]);

  // ✅ Example Admin Profile Data (taken from registration form)
  const [adminProfile, setAdminProfile] = useState({
    name: "Admin User",
    role: "Super Admin",
    email: "admin@institute.edu",
    phone: "+91 98765 43210",
    institute: "National Institute of Technology",
    designation: "Head of Administration",
    address: "123, Knowledge Park, Delhi, India",
  });

  useEffect(() => {
    // Simulate fetching pending users
    setUsers(mockUsers);
  }, []);

  const handleVerify = (id) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === id ? { ...user, verified: true } : user
      )
    );
  };

  const handleReject = (id) => {
    setUsers((prev) => prev.filter((user) => user.id !== id));
  };

  return (
    <div className="p-6 mt-4">
      {/* ✅ Admin Profile Section */}
      <div className="bg-white shadow-md rounded-lg border p-6 mb-8">
        <h1 className="text-2xl font-semibold text-[#2d2d6f] mb-4">
          Admin Profile
        </h1>
        <div className="flex items-start gap-6">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-full bg-purple-600 text-white flex items-center justify-center text-xl font-bold">
            {adminProfile.name.charAt(0)}
          </div>

          {/* Profile Info */}
          <div className="space-y-1">
            <h2 className="text-lg font-medium">{adminProfile.name}</h2>
            <p className="text-gray-600">{adminProfile.role}</p>
            <p className="text-gray-500 text-sm">{adminProfile.designation}</p>
            <p className="text-gray-700">📧 {adminProfile.email}</p>
            <p className="text-gray-700">📞 {adminProfile.phone}</p>
            <p className="text-gray-700">🏫 {adminProfile.institute}</p>
            <p className="text-gray-700">📍 {adminProfile.address}</p>
          </div>

          <button className="ml-auto px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Edit Profile
          </button>
        </div>
      </div>

      {/* ✅ Admin Work Section */}
      <div className="bg-white shadow-md rounded-lg border p-6 mb-8">
        <h2 className="text-xl font-semibold text-[#2d2d6f] mb-4">
          Admin Tasks / Responsibilities
        </h2>
        <ul className="list-disc list-inside text-gray-700 space-y-2">
          <li>Verify and Approve New Users</li>
          <li>Manage Institute Registrations</li>
          <li>Monitor Security and Access Logs</li>
          <li>Generate and Export Reports</li>
          <li>Update Institute / Admin Information</li>
          <li>Oversee Student and Teacher Accounts</li>
        </ul>
      </div>

      {/* ✅ Pending Users Section */}
      <h1 className="text-2xl font-semibold mb-6 text-[#2d2d6f]">
        Verify Pending Users
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {users.map((user) => (
          <div
            key={user.id}
            className="shadow-md rounded-lg border bg-white p-4 flex justify-between items-center"
          >
            <div>
              <h2 className="text-lg font-medium">{user.name}</h2>
              <p className="text-gray-600">{user.role}</p>
              <p
                className={`text-sm mt-1 ${
                  user.verified ? "text-green-600" : "text-red-500"
                }`}
              >
                {user.verified ? "Verified" : "Pending"}
              </p>
            </div>
            {!user.verified && (
              <div className="flex gap-2">
                <button
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                  onClick={() => handleVerify(user.id)}
                >
                  Verify
                </button>
                <button
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  onClick={() => handleReject(user.id)}
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
