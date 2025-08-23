import React, { useState } from "react";

export default function Interaction() {
  const [formData, setFormData] = useState({
    name: "",
    roll: "",
    department: "",
    authority: "Professor",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("Interaction submitted:", formData);
    setSubmitted(true);

    // Clear form
    setFormData({
      name: "",
      roll: "",
      department: "",
      authority: "Professor",
      message: "",
    });

    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <div className="flex justify-center items-center min-h-screen p-6 ">
      {/* 👆 Added mt-24 to push content below fixed header */}
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-lg">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-700">
          Student Interaction Form
        </h1>
        <p className="text-sm text-gray-500 text-center mb-6">
          Raise your concerns, problems, or suggestions directly to higher authorities
        </p>

        {submitted && (
          <div className="mb-4 p-3 rounded-lg bg-green-100 text-green-800 text-center">
            ✅ Your issue has been submitted successfully!
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-gray-600 mb-1">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none"
              placeholder="Enter your full name"
            />
          </div>

          {/* Roll Number */}
          <div>
            <label className="block text-gray-600 mb-1">Roll Number</label>
            <input
              type="text"
              name="roll"
              value={formData.roll}
              onChange={handleChange}
              required
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none"
              placeholder="Enter your roll number"
            />
          </div>

          {/* Department */}
          <div>
            <label className="block text-gray-600 mb-1">Department</label>
            <input
              type="text"
              name="department"
              value={formData.department}
              onChange={handleChange}
              required
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none"
              placeholder="Enter your department"
            />
          </div>

          {/* Authority Selection */}
          <div>
            <label className="block text-gray-600 mb-1">Raise Concern To</label>
            <select
              name="authority"
              value={formData.authority}
              onChange={handleChange}
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none"
            >
              <option value="Professor">Professor</option>
              <option value="HOD">Head of Department (HOD)</option>
              <option value="Director">Director</option>
              <option value="Administration">Administration</option>
            </select>
          </div>

          {/* Message */}
          <div>
            <label className="block text-gray-600 mb-1">Your Concern / Suggestion</label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              rows="4"
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none"
              placeholder="Describe your problem or suggestion"
            ></textarea>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-semibold transition"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}
