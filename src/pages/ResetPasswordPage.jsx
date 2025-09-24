// src/pages/ResetPasswordPage.jsx

import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import EyeIcon from "../assets/eye.png";
import HiddenIcon from "../assets/hidden.png";
import RigyaIcon from "../assets/rigya.png";
import { resetPassword } from "../api.js";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    if (newPassword !== confirmNewPassword) {
      setStatus("error");
      setMessage("Passwords do not match.");
      return;
    }

    try {
      const response = await resetPassword({ token, newPassword, confirmNewPassword });
      if (response.success) {
        setStatus("success");
        setMessage(response.message);
        setTimeout(() => {
          navigate("/auth"); // Redirect to login page
        }, 3000);
      } else {
        setStatus("error");
        setMessage(response.message);
      }
    } catch (error) {
      setStatus("error");
      setMessage(error.message);
    }
  };

  if (!token) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <p className="text-lg text-red-600 font-semibold">Invalid or missing reset token.</p>
          <button className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700" onClick={() => navigate("/auth")}>Go to Login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center" style={{ background: "linear-gradient(to bottom, #d6f8df, rgb(227, 224, 250), #88e4f4)" }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md bg-white shadow-2xl rounded-2xl p-8 flex flex-col"
      >
        <div className="flex items-center justify-center mb-6">
          <img src={RigyaIcon} alt="Rigya Logo" className="w-14 mr-2" />
          <h1 className="text-2xl font-bold text-purple-700">Reset Password</h1>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input name="newPassword" type={showPassword ? "text" : "password"} value={newPassword} placeholder="New Password" onChange={(e) => setNewPassword(e.target.value)} className="w-full px-4 py-2 border rounded-lg" required />
            <img src={showPassword ? HiddenIcon : EyeIcon} alt="toggle" onClick={() => setShowPassword(!showPassword)} className="w-5 h-5 absolute right-3 top-2.5 cursor-pointer" />
          </div>
          <input name="confirmNewPassword" type="password" value={confirmNewPassword} placeholder="Confirm New Password" onChange={(e) => setConfirmNewPassword(e.target.value)} className="w-full px-4 py-2 border rounded-lg" required />
          <button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-teal-600 text-white py-2 rounded-lg shadow-md hover:opacity-90" disabled={status === 'loading'}>
            {status === 'loading' ? 'Resetting...' : 'Reset Password'}
          </button>
          {message && (
            <p className={`text-center font-medium ${status === 'success' ? 'text-green-600' : 'text-red-600'}`}>
              {message}
            </p>
          )}
        </form>
      </motion.div>
    </div>
  );
}