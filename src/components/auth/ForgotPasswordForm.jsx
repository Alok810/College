import React from "react";
import { motion } from "framer-motion";
import RigyaIcon from "../../assets/rigya.png";

export default function ForgotPasswordForm({
  handleForgotPasswordSubmit,
  forgotPasswordStatus,
  forgotPasswordEmail,
  setForgotPasswordEmail,
  renderSearchBox,
  setShowForgotPassword,
  resetForm
}) {
  return (
    <motion.div key="forgot-password" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="w-full max-w-md bg-white shadow-2xl rounded-2xl p-8 flex flex-col min-h-[590px]">
      <div className="flex items-center justify-center mb-6">
        <img src={RigyaIcon} alt="Rigya Logo" className="w-14 mr-2" />
        <h1 className="text-2xl font-bold text-purple-700">Forgot Password</h1>
      </div>
      <form onSubmit={handleForgotPasswordSubmit} className="space-y-4 flex flex-col flex-grow">
        {forgotPasswordStatus === "link_sent" ? (
          <p className="text-center text-green-600 font-medium mt-10">A password reset link has been sent to your email. Please check your inbox.</p>
        ) : (
          <>
            <p className="text-sm text-gray-500 text-center mb-4">Enter your credentials below and we'll send you a link to reset your password.</p>
            <input name="forgotPasswordEmail" type="email" value={forgotPasswordEmail} placeholder="Enter your email" onChange={(e) => setForgotPasswordEmail(e.target.value)} className="w-full px-4 py-2 border rounded-lg" required />
            {renderSearchBox()}
            <button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-teal-600 text-white py-2 rounded-lg shadow-md hover:opacity-90 mt-2">Send Reset Link</button>
          </>
        )}
        <p className="text-center text-sm text-gray-500 cursor-pointer hover:text-purple-600 mt-auto pt-2" onClick={() => { setShowForgotPassword(false); resetForm(); }}>Back to Login</p>
      </form>
    </motion.div>
  );
}