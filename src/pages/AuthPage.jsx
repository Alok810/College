// authPage.jsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import EyeIcon from "../assets/eye.png";
import HiddenIcon from "../assets/hidden.png";
import RigyaIcon from "../assets/rigya.png";
import { registerUser, loginUser, sendOtp, verifyOtp, sendPasswordResetLink, resetPassword } from "../api.js";
import { useAuth } from '../context/AuthContext';

function generateCaptcha() {
  const a = Math.floor(Math.random() * 10);
  const b = Math.floor(Math.random() * 10);
  return { question: `${a} × ${b}`, answer: (a * b).toString() };
}

export default function AuthPage() {
  const { setIsAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    captcha: "",
    name: "",
    id: "",
    instituteName: "",
    instituteType: "",
    affiliationNumber: "",
    instituteEmail: "",
    logo: null,
    designation: "",
    department: "",
    instituteRegistrationNumber: "",
    adminEmail: "",
    adminPhone: "",
    alternateContact: "",
  });

  const [userType, setUserType] = useState("Teacher");
  const [showPassword, setShowPassword] = useState(false);
  const [mathQuestion, setMathQuestion] = useState(generateCaptcha());
  const [isSignUp, setIsSignUp] = useState(false);
  const [step, setStep] = useState(1);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otp, setOtp] = useState("");
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [otpStatus, setOtpStatus] = useState("idle");
  const [showInstituteOtpInput, setShowInstituteOtpInput] = useState(false);
  const [instituteOtp, setInstituteOtp] = useState("");
  const [isInstituteOtpVerified, setIsInstituteOtpVerified] = useState(false);
  const [instituteOtpStatus, setInstituteOtpStatus] = useState("idle");
  const [showAdminOtpInput, setShowAdminOtpInput] = useState(false);
  const [adminOtp, setAdminOtp] = useState("");
  const [isAdminOtpVerified, setIsAdminOtpVerified] = useState(false);
  const [adminOtpStatus, setAdminOtpStatus] = useState("idle");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [forgotPasswordInstituteRegNum, setForgotPasswordInstituteRegNum] = useState("");
  const [forgotPasswordStatus, setForgotPasswordStatus] = useState("idle");
  const navigate = useNavigate();

  const resetForm = () => {
    setFormData({
      email: "",
      password: "",
      confirmPassword: "",
      captcha: "",
      name: "",
      id: "",
      instituteName: "",
      instituteType: "",
      affiliationNumber: "",
      instituteEmail: "",
      logo: null,
      designation: "",
      department: "",
      instituteRegistrationNumber: "",
      adminEmail: "",
      adminPhone: "",
      alternateContact: "",
    });
    setMathQuestion(generateCaptcha());
    setStep(1);
    setShowOtpInput(false);
    setOtp("");
    setIsOtpVerified(false);
    setOtpStatus("idle");
    setShowInstituteOtpInput(false);
    setInstituteOtp("");
    setIsInstituteOtpVerified(false);
    setInstituteOtpStatus("idle");
    setShowAdminOtpInput(false);
    setAdminOtp("");
    setIsAdminOtpVerified(false);
    setAdminOtpStatus("idle");
    setForgotPasswordEmail("");
    setForgotPasswordInstituteRegNum("");
    setForgotPasswordStatus("idle");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "email" && showOtpInput) {
      setShowOtpInput(false);
      setIsOtpVerified(false);
      setOtpStatus("idle");
    }
    if (name === "instituteEmail" && showInstituteOtpInput) {
      setShowInstituteOtpInput(false);
      setIsInstituteOtpVerified(false);
      setInstituteOtpStatus("idle");
    }
    if (name === "adminEmail" && showAdminOtpInput) {
      setShowAdminOtpInput(false);
      setIsAdminOtpVerified(false);
      setAdminOtpStatus("idle");
    }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    setFormData({ ...formData, logo: file });
  };

  const handleSendOtp = async (emailType, email) => {
    if (!email) {
      alert(`Please enter the ${emailType} email first.`);
      return;
    }
    try {
      await sendOtp(email);
      alert("OTP sent to your email!");
      if (emailType === "institute") {
        setShowInstituteOtpInput(true);
        setInstituteOtpStatus("pending");
      } else if (emailType === "admin") {
        setShowAdminOtpInput(true);
        setAdminOtpStatus("pending");
      } else {
        setShowOtpInput(true);
        setOtpStatus("pending");
      }
    } catch (error) {
      alert(error.message);
    }
  };

  const handleVerifyOtp = async (emailType, code) => {
    const email = emailType === "institute" ? formData.instituteEmail : emailType === "admin" ? formData.adminEmail : formData.email;
    if (!code) {
      alert("Please enter the OTP.");
      return;
    }
    try {
      const response = await verifyOtp(email, code);
      if (response.success) {
        alert("OTP verified successfully!");
        if (emailType === "institute") {
          setIsInstituteOtpVerified(true);
          setInstituteOtpStatus("success");
        } else if (emailType === "admin") {
          setIsAdminOtpVerified(true);
          setAdminOtpStatus("success");
        } else {
          setIsOtpVerified(true);
          setOtpStatus("success");
        }
      } else {
        alert(response.message);
        if (emailType === "institute") setInstituteOtpStatus("error");
        if (emailType === "admin") setAdminOtpStatus("error");
        if (emailType === "user") setOtpStatus("error");
      }
    } catch (error) {
      alert(error.message);
      if (emailType === "institute") setInstituteOtpStatus("error");
      if (emailType === "admin") setAdminOtpStatus("error");
      if (emailType === "user") setOtpStatus("error");
    }
  };

  const handleContinue = (nextStep) => {
    if (userType === "Institute") {
      if (step === 1 && !isInstituteOtpVerified) {
        alert("Please verify the Institute Email with the OTP.");
        return;
      }
      if (step === 2 && !isAdminOtpVerified) {
        alert("Please verify the Admin Email with the OTP.");
        return;
      }
    }
    setStep(nextStep);
  };

  // UPDATED: handleForgotPasswordSubmit
  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!forgotPasswordEmail || !forgotPasswordInstituteRegNum) {
        alert("Please provide both your email and institute registration number.");
        return;
      }
      const response = await sendPasswordResetLink({ email: forgotPasswordEmail, instituteRegistrationNumber: forgotPasswordInstituteRegNum });
      if (response.success) {
        alert(response.message);
        setForgotPasswordStatus("link_sent");
      } else {
        alert(response.message);
      }
    } catch (error) {
      alert(error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Captcha validation for both registration and login
    if (formData.captcha !== mathQuestion.answer) {
      alert("Captcha answer is incorrect.");
      setMathQuestion(generateCaptcha());
      return;
    }

    if (isSignUp) {
      // Registration validation
      if (userType === "Institute") {
        if (!isInstituteOtpVerified || !isAdminOtpVerified || !formData.logo || formData.password !== formData.confirmPassword) {
          alert("Please fill out all required fields, verify both emails, and solve the captcha correctly.");
          return;
        }
      } else {
        if (!isOtpVerified || formData.password !== formData.confirmPassword) {
          alert("Please fill out all required fields, verify your email, and solve the captcha correctly.");
          return;
        }
      }

      try {
        let payload;
        const isInstitute = userType === "Institute";

        if (isInstitute) {
          payload = new FormData();
          for (const key in formData) {
            payload.append(key, formData[key] || '');
          }
          if (formData.logo) {
            payload.append('logo', formData.logo);
          }
          payload.append('instituteOtp', instituteOtp || '');
          payload.append('adminOtp', adminOtp || '');
          payload.append('userType', userType);
        } else {
          payload = {
            ...formData,
            otp,
            userType,
          };
        }

        const response = await registerUser(payload);

        if (response.success) {
          alert("Registration successful! You can now log in.");
          setIsSignUp(false);
          resetForm();
        } else {
          alert(response.message);
        }
      } catch (error) {
        alert(error.message);
      }
    } else {
      // Login validation
      if (!formData.email || !formData.password || !formData.instituteRegistrationNumber) {
        alert("Please fill out all required fields.");
        return;
      }

      try {
        const response = await loginUser({ email: formData.email, password: formData.password, instituteRegistrationNumber: formData.instituteRegistrationNumber });
        if (response.success) {
          setIsAuthenticated(true);
          navigate("/");
        } else {
          alert(response.message);
        }
      } catch (error) {
        alert(error.message);
      }
    }
  };


  const renderSingleStepRegistration = () => {
    const otpInputClasses = `w-1/4 px-4 py-2 border rounded-lg transition-colors duration-300 ${otpStatus === "success" ? "border-green-500 ring-2 ring-green-200" : otpStatus === "error" ? "border-red-500 ring-2 ring-red-200" : ""}`;
    const userSpecificFields = () => {
      switch (userType) {
        case "Student":
          return (
            <>
              <input name="name" type="text" value={formData.name} placeholder="Student Name" onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" required />
              <input name="id" type="text" value={formData.id} placeholder="Student ID" onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" required />
              <input name="instituteRegistrationNumber" type="text" value={formData.instituteRegistrationNumber} placeholder="Institute Registration Number" onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" required />
            </>
          );
        case "Teacher":
          return (
            <>
              <input name="name" type="text" value={formData.name} placeholder="Teacher Name" onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" required />
              <input name="id" type="text" value={formData.id} placeholder="Teacher ID" onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" required />
              <input name="instituteRegistrationNumber" type="text" value={formData.instituteRegistrationNumber} placeholder="Institute Registration Number" onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" required />
            </>
          );
        case "Official":
          return (
            <>
              <input name="name" type="text" value={formData.name} placeholder="Full Name" onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" required />
              <input name="id" type="text" value={formData.id} placeholder="Employee / Staff ID" onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" required />
              <input name="instituteRegistrationNumber" type="text" value={formData.instituteRegistrationNumber} placeholder="Institute Registration Number" onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" required />
              <select name="designation" value={formData.designation} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" required>
                <option value="">Select Designation</option>
                <option value="Director">Director</option>
                <option value="Dean">Dean</option>
                <option value="HOD">HOD</option>
                <option value="Registrar">Registrar</option>
                <option value="Faculty Member">Faculty Member</option>
                <option value="Support Staff">Support Staff</option>
              </select>
              {formData.designation === "HOD" && (
                <select name="department" value={formData.department} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" required>
                  <option value="">Select Department</option>
                  <option value="CSE">Computer Science</option>
                  <option value="ECE">Electronics</option>
                  <option value="ME">Mechanical</option>
                  <option value="CE">Civil</option>
                  <option value="MBA">MBA</option>
                  <option value="Other">Other</option>
                </select>
              )}
            </>
          );
        case "Other":
          return (
            <>
              <input name="name" type="text" value={formData.name} placeholder="Full Name" onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" required />
              <input name="id" type="text" value={formData.id} placeholder="Staff ID" onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" required />
              <input name="instituteRegistrationNumber" type="text" value={formData.instituteRegistrationNumber} placeholder="Institute Registration Number" onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" required />
              <select name="designation" value={formData.designation} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" required>
                <option value="">Select Role</option>
                <option value="Librarian">Librarian</option>
                <option value="Warden">Warden</option>
                <option value="Lab Assistant">Lab Assistant</option>
                <option value="Accountant">Accountant</option>
                <option value="Security Staff">Security Staff</option>
                <option value="Technical Staff">Technical Staff</option>
                <option value="Clerk">Clerk</option>
              </select>
            </>
          );
        default:
          return null;
      }
    };

    return (
      <>
        {userSpecificFields()}
        {showOtpInput && !isOtpVerified ? (
          <div className="flex items-center gap-2">
            <input name="email" type="email" value={formData.email} placeholder="Enter Email" onChange={handleChange} className="w-3/4 px-4 py-2 border rounded-lg" required disabled={true} />
            <input name="otp" type="text" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="OTP" className={otpInputClasses} required />
            <button type="button" onClick={() => handleVerifyOtp("user", otp)} className="w-1/4 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 text-sm">Verify</button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <input name="email" type="email" value={formData.email} placeholder="Enter Email" onChange={handleChange} className="w-3/4 px-4 py-2 border rounded-lg" required disabled={isOtpVerified} />
            {isSignUp && !isOtpVerified && (
              <button type="button" onClick={() => handleSendOtp("user", formData.email)} className="w-1/4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm">Send OTP</button>
            )}
            {isSignUp && isOtpVerified && (<span className="text-green-600">✓ Verified</span>)}
          </div>
        )}
        <div className="relative">
          <input name="password" type={showPassword ? "text" : "password"} value={formData.password} placeholder="Enter Password" onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" required />
          <img src={showPassword ? HiddenIcon : EyeIcon} alt="toggle" onClick={() => setShowPassword(!showPassword)} className="w-5 h-5 absolute right-3 top-2.5 cursor-pointer" />
        </div>
        {isSignUp && (<input name="confirmPassword" type={showPassword ? "text" : "password"} value={formData.confirmPassword} placeholder="Confirm Password" onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" required />)}
        <div>
          <label className="block text-sm text-gray-600 mb-1">Solve: <span className="font-bold">{mathQuestion.question}</span></label>
          <div className="flex gap-2">
            <input name="captcha" value={formData.captcha} placeholder="Enter Captcha" onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" required />
            <button type="button" onClick={() => setMathQuestion(generateCaptcha())} className="px-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600">↻</button>
          </div>
        </div>
        <button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-teal-600 text-white py-2 rounded-lg shadow-md hover:opacity-90">REGISTER</button>
      </>
    );
  };

  const renderSingleStepInstituteRegistration = () => {
    const instituteOtpInputClasses = `w-1/4 px-4 py-2 border rounded-lg transition-colors duration-300 ${instituteOtpStatus === "success" ? "border-green-500 ring-2 ring-green-200" : instituteOtpStatus === "error" ? "border-red-500 ring-2 ring-red-200" : ""}`;
    const adminOtpInputClasses = `w-1/4 px-4 py-2 border rounded-lg transition-colors duration-300 ${adminOtpStatus === "success" ? "border-green-500 ring-2 ring-green-200" : adminOtpStatus === "error" ? "border-red-500 ring-2 ring-red-200" : ""}`;

    return (
      <>
        {/* Step 1 Fields */}
        <h2 className="text-lg font-semibold text-gray-700">Institute Details</h2>
        <input name="instituteName" type="text" value={formData.instituteName} placeholder="Institute Name" onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" required />
        <select name="instituteType" value={formData.instituteType} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" required>
          <option value="">Select Type</option>
          <option value="College">College</option>
          <option value="University">University</option>
          <option value="School">School</option>
          <option value="Other">Other</option>
        </select>
        <input name="instituteRegistrationNumber" type="text" value={formData.instituteRegistrationNumber} placeholder="Institute Registration Number" onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" required />
        {showInstituteOtpInput && !isInstituteOtpVerified ? (
          <div className="flex items-center gap-2">
            <input name="instituteEmail" type="email" value={formData.instituteEmail} placeholder="Institute Email" onChange={handleChange} className="w-3/4 px-4 py-2 border rounded-lg" required disabled={true} />
            <input name="instituteOtp" type="text" value={instituteOtp} onChange={(e) => setInstituteOtp(e.target.value)} placeholder="OTP" className={instituteOtpInputClasses} required />
            <button type="button" onClick={() => handleVerifyOtp("institute", instituteOtp)} className="w-1/4 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 text-sm">Verify</button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <input name="instituteEmail" type="email" value={formData.instituteEmail} placeholder="Institute Email" onChange={handleChange} className="w-3/4 px-4 py-2 border rounded-lg" required disabled={isInstituteOtpVerified} />
            {isSignUp && !isInstituteOtpVerified && (<button type="button" onClick={() => handleSendOtp("institute", formData.instituteEmail)} className="w-1/4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm">Send OTP</button>)}
            {isSignUp && isInstituteOtpVerified && (<span className="text-green-600">✓ Verified</span>)}
          </div>
        )}
        <div className="border border-gray-300 rounded-lg p-3 bg-gray-50">
          <label className="block text-sm font-medium text-gray-700 mb-2">Upload Logo</label>
          <input type="file" accept="image/*" onChange={handleLogoUpload} className="block w-full text-sm text-gray-700 border rounded-lg cursor-pointer file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-purple-600 file:text-white hover:file:bg-purple-700" required />
          {formData.logo && (
            <div className="mt-3 flex justify-center">
              <img src={URL.createObjectURL(formData.logo)} alt="Logo Preview" className="w-24 h-24 object-contain border rounded-md shadow-sm bg-white" />
            </div>
          )}
        </div>

        {/* Step 2 Fields */}
        <hr className="my-4 border-t border-gray-200" />
        <h2 className="text-lg font-semibold text-gray-700">Admin Details</h2>
        <input name="name" type="text" value={formData.name} placeholder="Admin Full Name" onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" required />
        <select name="designation" value={formData.designation} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" required>
          <option value="">Select Role</option>
          <option value="Director">Director</option>
          <option value="Dean">Dean</option>
          <option value="Professor">Professor</option>
          <option value="Head Master">Head Master</option>
          <option value="Teacher">Teacher</option>
        </select>
        <input name="id" type="text" value={formData.id} placeholder="Admin ID" onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" required />
        {showAdminOtpInput && !isAdminOtpVerified ? (
          <div className="flex items-center gap-2">
            <input name="adminEmail" type="email" value={formData.adminEmail} placeholder="Admin Email" onChange={handleChange} className="w-3/4 px-4 py-2 border rounded-lg" required disabled={true} />
            <input name="adminOtp" type="text" value={adminOtp} onChange={(e) => setAdminOtp(e.target.value)} placeholder="OTP" className={adminOtpInputClasses} required />
            <button type="button" onClick={() => handleVerifyOtp("admin", adminOtp)} className="w-1/4 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 text-sm">Verify</button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <input name="adminEmail" type="email" value={formData.adminEmail} placeholder="Admin Email" onChange={handleChange} className="w-3/4 px-4 py-2 border rounded-lg" required disabled={isAdminOtpVerified} />
            {isSignUp && !isAdminOtpVerified && (<button type="button" onClick={() => handleSendOtp("admin", formData.adminEmail)} className="w-1/4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm">Send OTP</button>)}
            {isSignUp && isAdminOtpVerified && (<span className="text-green-600">✓ Verified</span>)}
          </div>
        )}
        <input name="adminPhone" type="text" value={formData.adminPhone} placeholder="Admin Phone No." onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" />
        <input name="alternateContact" type="text" value={formData.alternateContact} placeholder="Alternate Contact (Optional)" onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" />

        {/* Step 3 Fields */}
        <hr className="my-4 border-t border-gray-200" />
        <h2 className="text-lg font-semibold text-gray-700">Account Credentials</h2>
        <div className="relative">
          <input name="password" type={showPassword ? "text" : "password"} value={formData.password} placeholder="Enter Password" onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" required />
          <img src={showPassword ? HiddenIcon : EyeIcon} alt="toggle" onClick={() => setShowPassword(!showPassword)} className="w-5 h-5 absolute right-3 top-2.5 cursor-pointer" />
        </div>
        {isSignUp && (<input name="confirmPassword" type={showPassword ? "text" : "password"} value={formData.confirmPassword} placeholder="Confirm Password" onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" required />)}
        <div>
          <label className="block text-sm text-gray-600 mb-1">Solve: <span className="font-bold">{mathQuestion.question}</span></label>
          <div className="flex gap-2">
            <input name="captcha" value={formData.captcha} placeholder="Enter Captcha" onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" required />
            <button type="button" onClick={() => setMathQuestion(generateCaptcha())} className="px-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600">↻</button>
          </div>
        </div>

        <button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-teal-600 text-white py-2 rounded-lg shadow-md hover:opacity-90">REGISTER</button>
      </>
    );
  };


  const renderLoginFields = () => (
    <>
      <input name="instituteRegistrationNumber" type="text" value={formData.instituteRegistrationNumber} placeholder="Institute Registration Number" onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" required />
      <input name="email" type="email" value={formData.email} placeholder="Email" onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" required />
      <div className="relative">
        <input name="password" type={showPassword ? "text" : "password"} value={formData.password} placeholder="Enter Password" onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" required />
        <img src={showPassword ? HiddenIcon : EyeIcon} alt="toggle" onClick={() => setShowPassword(!showPassword)} className="w-5 h-5 absolute right-3 top-2.5 cursor-pointer" />
      </div>
      <div>
        <label className="block text-sm text-gray-600 mb-1">Solve: <span className="font-bold">{mathQuestion.question}</span></label>
        <div className="flex gap-2">
          <input name="captcha" value={formData.captcha} placeholder="Enter Captcha" onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" required />
          <button type="button" onClick={() => setMathQuestion(generateCaptcha())} className="px-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600">↻</button>
        </div>
      </div>
      <button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-teal-600 text-white py-2 rounded-lg shadow-md hover:opacity-90">LOGIN</button>
      <p className="text-right text-sm text-purple-600 cursor-pointer hover:underline" onClick={() => { setShowForgotPassword(true); resetForm(); }}>Forgot Password?</p>
    </>
  );

  // UPDATED: renderForgotPasswordForm to match the new flow
  const renderForgotPasswordForm = () => {
    return (
      <motion.div key="forgot-password" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="w-full max-w-md bg-white shadow-2xl rounded-2xl p-8 flex flex-col min-h-[590px]">
        <div className="flex items-center justify-center mb-6">
          <img src={RigyaIcon} alt="Rigya Logo" className="w-14 mr-2" />
          <h1 className="text-2xl font-bold text-purple-700">Forgot Password</h1>
        </div>
        <form onSubmit={handleForgotPasswordSubmit} className="space-y-4 flex flex-col flex-grow">
          {forgotPasswordStatus === "link_sent" ? (
            <p className="text-center text-green-600 font-medium">A password reset link has been sent to your email. Please check your inbox.</p>
          ) : (
            <>
              <input name="forgotPasswordEmail" type="email" value={forgotPasswordEmail} placeholder="Enter your email" onChange={(e) => setForgotPasswordEmail(e.target.value)} className="w-full px-4 py-2 border rounded-lg" required />
              <input name="forgotPasswordInstituteRegNum" type="text" value={forgotPasswordInstituteRegNum} placeholder="Institute Registration Number" onChange={(e) => setForgotPasswordInstituteRegNum(e.target.value)} className="w-full px-4 py-2 border rounded-lg" required />
              <button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-teal-600 text-white py-2 rounded-lg shadow-md hover:opacity-90">Send Reset Link</button>
            </>
          )}
          <p className="text-center text-sm text-gray-500 cursor-pointer hover:text-purple-600 mt-auto pt-2" onClick={() => { setShowForgotPassword(false); resetForm(); }}>Back to Login</p>
        </form>
      </motion.div>
    );
  };

  return (
    <div className="fixed inset-0 flex overflow-hidden" style={{ background: "linear-gradient(to bottom, #d6f8df, rgb(227, 224, 250), #88e4f4)", backgroundAttachment: "fixed", }}>
      <motion.div className="flex w-full" animate={{ flexDirection: isSignUp ? "row-reverse" : "row" }} transition={{ duration: 0.7, ease: "easeInOut" }} >
        <div className="hidden md:flex flex-col justify-center items-center w-1/2 p-10">
          <img src={RigyaIcon} alt="Rigya Logo" className="w-72 mb-6" />
          <blockquote className="italic text-center text-lg leading-relaxed max-w-md bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-teal-600">
            {isSignUp ? "“Curiosity is the root of learning, Learning is the path to wisdom, Wisdom is the bridge to innovation, Innovation is the spark of progress, And progress is the soul of Rigya”" : "“Education is the key to success, Success is the key to achievement, Achievement is the key to hope, Hope is the key to harmony”"}
          </blockquote>
        </div>

        <div className="flex-1 flex items-center justify-center p-6">
          {showForgotPassword ? (
            renderForgotPasswordForm()
          ) : (
            <motion.div
              key={isSignUp ? "signup" : "signin"}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="w-full max-w-md bg-white shadow-2xl rounded-2xl p-8 flex flex-col min-h-[600px] max-h-[700px] overflow-hidden"
            >
              <div className="flex items-center justify-center mb-6">
                <img src={RigyaIcon} alt="Rigya Logo" className="w-14 mr-2" />
                <h1 className="text-2xl font-bold text-purple-700">{isSignUp ? "Registration" : "Login"}</h1>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4 flex flex-col flex-grow overflow-y-auto pr-2 custom-scrollbar">
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-600 mb-2">Select User Type</label>
                  <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
                    {["Student", "Teacher", "Institute", "Official", "Other"].map((type) => (
                      <label key={type} className="flex items-center gap-1">
                        <input type="radio" name="userType" value={type} checked={userType === type} onChange={() => { setUserType(type); setStep(1); resetForm(); }} />
                        {type}
                      </label>
                    ))}
                  </div>
                </div>
                {isSignUp ? (
                  userType === "Institute" ? (
                    renderSingleStepInstituteRegistration()
                  ) : (
                    renderSingleStepRegistration()
                  )
                ) : (renderLoginFields())}
                <p className="text-center text-sm text-gray-500 cursor-pointer hover:text-purple-600 mt-auto pt-2" onClick={() => { setIsSignUp(!isSignUp); resetForm(); }}>{isSignUp ? "Already have an account? Login" : "Don’t have an account? Register"}</p>
              </form>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}