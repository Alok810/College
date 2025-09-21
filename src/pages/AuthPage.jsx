import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import EyeIcon from "../assets/eye.png";
import HiddenIcon from "../assets/hidden.png";
import RigyaIcon from "../assets/rigya.png";

export default function AuthPage() {
  function generateCaptcha() {
    const a = Math.floor(Math.random() * 10);
    const b = Math.floor(Math.random() * 10);
    return { question: `${a} × ${b}`, answer: (a * b).toString() };
  }

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
  const [sentOtp, setSentOtp] = useState("");
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [otpStatus, setOtpStatus] = useState("idle");
  const [showInstituteOtpInput, setShowInstituteOtpInput] = useState(false);
  const [instituteOtp, setInstituteOtp] = useState("");
  const [sentInstituteOtp, setSentInstituteOtp] = useState("");
  const [isInstituteOtpVerified, setIsInstituteOtpVerified] = useState(false);
  const [instituteOtpStatus, setInstituteOtpStatus] = useState("idle");
  const [showAdminOtpInput, setShowAdminOtpInput] = useState(false);
  const [adminOtp, setAdminOtp] = useState("");
  const [sentAdminOtp, setSentAdminOtp] = useState("");
  const [isAdminOtpVerified, setIsAdminOtpVerified] = useState(false);
  const [adminOtpStatus, setAdminOtpStatus] = useState("idle");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [forgotPasswordInstituteRegNum, setForgotPasswordInstituteRegNum] = useState("");
  const [forgotPasswordOtp, setForgotPasswordOtp] = useState("");
  const [sentForgotPasswordOtp, setSentForgotPasswordOtp] = useState("");
  const [isForgotPasswordOtpVerified, setIsForgotPasswordOtpVerified] = useState(false);
  const [forgotPasswordOtpStatus, setForgotPasswordOtpStatus] = useState("idle");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
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
    setSentOtp("");
    setIsOtpVerified(false);
    setOtpStatus("idle");
    setShowInstituteOtpInput(false);
    setInstituteOtp("");
    setSentInstituteOtp("");
    setIsInstituteOtpVerified(false);
    setInstituteOtpStatus("idle");
    setShowAdminOtpInput(false);
    setAdminOtp("");
    setSentAdminOtp("");
    setIsAdminOtpVerified(false);
    setAdminOtpStatus("idle");
    setForgotPasswordEmail("");
    setForgotPasswordInstituteRegNum("");
    setForgotPasswordOtp("");
    setSentForgotPasswordOtp("");
    setIsForgotPasswordOtpVerified(false);
    setForgotPasswordOtpStatus("idle");
    setNewPassword("");
    setConfirmNewPassword("");
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (e.target.name === "email" && showOtpInput) {
      setShowOtpInput(false);
      setIsOtpVerified(false);
      setOtpStatus("idle");
      setOtp("");
      setSentOtp("");
    }
    if (e.target.name === "instituteEmail" && showInstituteOtpInput) {
      setShowInstituteOtpInput(false);
      setIsInstituteOtpVerified(false);
      setInstituteOtpStatus("idle");
      setInstituteOtp("");
      setSentInstituteOtp("");
    }
    if (e.target.name === "adminEmail" && showAdminOtpInput) {
      setShowAdminOtpInput(false);
      setIsAdminOtpVerified(false);
      setAdminOtpStatus("idle");
      setAdminOtp("");
      setSentAdminOtp("");
    }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, logo: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSendOtp = (emailType, email) => {
    if (!email) {
      alert(`Please enter the ${emailType} email first.`);
      return;
    }

    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`Mock OTP for ${emailType} email:`, newOtp);

    if (emailType === "institute") {
      setSentInstituteOtp(newOtp);
      setShowInstituteOtpInput(true);
      setInstituteOtpStatus("pending");
    } else if (emailType === "admin") {
      setSentAdminOtp(newOtp);
      setShowAdminOtpInput(true);
      setAdminOtpStatus("pending");
    } else if (emailType === "forgotPassword") {
      setSentForgotPasswordOtp(newOtp);
      setForgotPasswordOtpStatus("pending");
    } else {
      setSentOtp(newOtp);
      setShowOtpInput(true);
      setOtpStatus("pending");
    }
  };

  const handleVerifyOtp = (emailType, code) => {
    if (emailType === "institute") {
      if (code === sentInstituteOtp) {
        setIsInstituteOtpVerified(true);
        setInstituteOtpStatus("success");
      } else {
        setInstituteOtpStatus("error");
        setIsInstituteOtpVerified(false);
      }
    } else if (emailType === "admin") {
      if (code === sentAdminOtp) {
        setIsAdminOtpVerified(true);
        setAdminOtpStatus("success");
      } else {
        setAdminOtpStatus("error");
        setIsAdminOtpVerified(false);
      }
    } else if (emailType === "forgotPassword") {
      if (code === sentForgotPasswordOtp) {
        setIsForgotPasswordOtpVerified(true);
        setForgotPasswordOtpStatus("success");
      } else {
        setForgotPasswordOtpStatus("error");
        setIsForgotPasswordOtpVerified(false);
      }
    } else {
      if (code === sentOtp) {
        setIsOtpVerified(true);
        setOtpStatus("success");
      } else {
        setOtpStatus("error");
        setIsOtpVerified(false);
      }
    }
  };

  // The core fix is here: handleContinue now checks for OTP verification.
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

  const handleForgotPasswordSubmit = (e) => {
    e.preventDefault();
    
    if (!forgotPasswordEmail || !forgotPasswordInstituteRegNum) {
      alert("Please enter both your email and institute registration number.");
      return;
    }
    if (!isForgotPasswordOtpVerified) {
      alert("Please verify your email with the OTP.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      alert("Passwords do not match.");
      return;
    }
    if (!newPassword || !confirmNewPassword) {
      alert("Please enter a new password and confirm it.");
      return;
    }
    
    const userKey = `user:${forgotPasswordEmail}`;
    const user = localStorage.getItem(userKey);
    if (user) {
      const parsedUser = JSON.parse(user);
      if (parsedUser.instituteRegistrationNumber !== forgotPasswordInstituteRegNum) {
        alert("Incorrect Institute Registration Number.");
        return;
      }
      parsedUser.password = newPassword;
      localStorage.setItem(userKey, JSON.stringify(parsedUser));
      alert("Password reset successfully!");
      setShowForgotPassword(false);
      resetForm();
    } else {
      alert("No user found with that email and institute registration number.");
    }
  };

  const validateStep = () => {
    if (!formData.captcha || formData.captcha !== mathQuestion.answer) {
      alert("Captcha answer is incorrect.");
      setMathQuestion(generateCaptcha());
      return false;
    }
    if (isSignUp) {
      if (userType !== "Institute" && !isOtpVerified) {
        alert("Please verify your email with the OTP.");
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        alert("Passwords do not match.");
        return false;
      }
    }
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (isSignUp) {
        // Validation for common fields
        if (userType !== "Institute" && (!formData.email || !formData.password || !formData.confirmPassword || !formData.captcha || !formData.name || !formData.id || !formData.instituteRegistrationNumber)) {
            alert("Please fill in all required fields.");
            return;
        }

        // Specific validations for different user types
        if (userType === "Institute") {
            if (!formData.instituteName || !formData.instituteType || !formData.instituteRegistrationNumber || !formData.instituteEmail || !formData.logo || !formData.name || !formData.designation || !formData.id || !formData.adminEmail || !formData.adminPhone || !formData.password || !formData.confirmPassword || !formData.captcha) {
                alert("Please fill in all required fields.");
                return;
            }
        } else if (userType === "Officials" || userType === "Other") {
            if (!formData.designation) {
                alert("Please select a designation.");
                return;
            }
            if (formData.designation === "HOD" && !formData.department) {
                alert("Please select a department.");
                return;
            }
        }
    }


    if (!validateStep()) {
      return;
    }

    if (isSignUp) {
      const newUser = { ...formData, userType };
      localStorage.setItem(`user:${formData.email}`, JSON.stringify(newUser));
      localStorage.setItem("auth", JSON.stringify(newUser));
      alert("Registration successful!");
      navigate("/");
    } else {
      const user = localStorage.getItem(`user:${formData.email}`);
      if (!user) {
        alert("No user found.");
        return;
      }
      const parsed = JSON.parse(user);
      if (parsed.password !== formData.password) {
        alert("Wrong password.");
        return;
      }
      if (
        parsed.instituteRegistrationNumber !==
        formData.instituteRegistrationNumber
      ) {
        alert("Wrong institute registration number.");
      }

      localStorage.setItem("auth", JSON.stringify(parsed));
      navigate("/");
    }
  };

  const renderCommonFields = () => {
    const otpInputClasses = `w-1/4 px-4 py-2 border rounded-lg transition-colors duration-300 ${
      otpStatus === "success"
        ? "border-green-500 ring-2 ring-green-200"
        : otpStatus === "error"
        ? "border-red-500 ring-2 ring-red-200"
        : ""
    }`;

    return (
      <>
        {isSignUp && showOtpInput && !isOtpVerified ? (
          <div className="flex items-center gap-2">
            <input
              name="email"
              type="email"
              value={formData.email}
              placeholder="Enter Email"
              onChange={handleChange}
              className="w-1/2 px-4 py-2 border rounded-lg"
              required
              disabled={true}
            />
            <input
              name="otp"
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="OTP"
              className={otpInputClasses}
              required
            />
            <button
              type="button"
              onClick={() => handleVerifyOtp("user", otp)}
              className="w-1/4 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 text-sm"
            >
              Verify
            </button>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <input
              name="email"
              type="email"
              value={formData.email}
              placeholder="Enter Email"
              onChange={handleChange}
              className="flex-1 w-full md:w-auto px-4 py-2 border rounded-lg"
              required
              disabled={isOtpVerified}
            />
            {isSignUp && !isOtpVerified && (
              <button
                type="button"
                onClick={() => handleSendOtp("user", formData.email)}
                className="w-full md:w-auto px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
              >
                Send OTP
              </button>
            )}
            {isSignUp && isOtpVerified && (
              <span className="text-green-600">✓ Verified</span>
            )}
          </div>
        )}
        <div className="relative">
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            placeholder="Enter Password"
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg"
            required
          />
          <img
            src={showPassword ? HiddenIcon : EyeIcon}
            alt="toggle"
            onClick={() => setShowPassword(!showPassword)}
            className="w-5 h-5 absolute right-3 top-2.5 cursor-pointer"
          />
        </div>
        {isSignUp && (
          <input
            name="confirmPassword"
            type={showPassword ? "text" : "password"}
            value={formData.confirmPassword}
            placeholder="Confirm Password"
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg"
            required
          />
        )}
        <div>
          <label className="block text-sm text-gray-600 mb-1">
            Solve: <span className="font-bold">{mathQuestion.question}</span>
          </label>
          <div className="flex gap-2">
            <input
              name="captcha"
              value={formData.captcha}
              placeholder="Enter Captcha"
              onChange={handleChange}
              className="flex-1 px-4 py-2 border rounded-lg"
              required
            />
            <button
              type="button"
              onClick={() => setMathQuestion(generateCaptcha())}
              className="px-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600"
            >
              ↻
            </button>
          </div>
        </div>
      </>
    );
  };

  const renderRegisterFields = () => {
    const instituteOtpInputClasses = `w-1/4 px-4 py-2 border rounded-lg transition-colors duration-300 ${
      instituteOtpStatus === "success"
        ? "border-green-500 ring-2 ring-green-200"
        : instituteOtpStatus === "error"
        ? "border-red-500 ring-2 ring-red-200"
        : ""
    }`;

    const adminOtpInputClasses = `w-1/4 px-4 py-2 border rounded-lg transition-colors duration-300 ${
      adminOtpStatus === "success"
        ? "border-green-500 ring-2 ring-green-200"
        : adminOtpStatus === "error"
        ? "border-red-500 ring-2 ring-red-200"
        : ""
    }`;

    switch (userType) {
      case "Student":
      case "Teacher":
        return (
          <>
            <input
              name="name"
              type="text"
              value={formData.name}
              placeholder={`${userType} Name`}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg"
              required
            />
            <input
              name="id"
              type="text"
              value={formData.id}
              placeholder={userType === "Student" ? "Student ID" : "Teacher ID"}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg"
              required
            />
            <input
              name="instituteRegistrationNumber"
              type="text"
              value={formData.instituteRegistrationNumber}
              placeholder="Institute Registration Number"
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg"
              required
            />
          </>
        );
      case "Officials":
      case "Other":
        return (
          <>
            <input
              name="name"
              type="text"
              value={formData.name}
              placeholder="Full Name"
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg"
              required
            />
            <input
              name="id"
              type="text"
              value={formData.id}
              placeholder={
                userType === "Officials" ? "Employee / Staff ID" : "Staff ID"
              }
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg"
              required
            />
            <input
              name="instituteRegistrationNumber"
              type="text"
              value={formData.instituteRegistrationNumber}
              placeholder="Institute Registration Number"
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg"
              required
            />
            <select
              name="designation"
              value={formData.designation}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg"
              required
            >
              <option value="">
                {userType === "Officials"
                  ? "Select Designation"
                  : "Select Role"}
              </option>
              {userType === "Officials" ? (
                <>
                  <option value="Director">Director</option>
                  <option value="Dean">Dean</option>
                  <option value="HOD">HOD</option>
                  <option value="Registrar">Registrar</option>
                  <option value="Faculty Member">Faculty Member</option>
                  <option value="Support Staff">Support Staff</option>
                </>
              ) : (
                <>
                  <option value="Librarian">Librarian</option>
                  <option value="Warden">Warden</option>
                  <option value="Lab Assistant">Lab Assistant</option>
                  <option value="Accountant">Accountant</option>
                  <option value="Security Staff">Security Staff</option>
                  <option value="Technical Staff">Technical Staff</option>
                  <option value="Clerk">Clerk</option>
                </>
              )}
            </select>
            {formData.designation === "HOD" && (
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg"
                required
              >
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
      case "Institute":
        switch (step) {
          case 1:
            return (
              <>
                <input
                  name="instituteName"
                  type="text"
                  value={formData.instituteName}
                  placeholder="Institute Name"
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
                <select
                  name="instituteType"
                  value={formData.instituteType}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                >
                  <option value="">Select Type</option>
                  <option value="College">College</option>
                  <option value="University">University</option>
                  <option value="School">School</option>
                  <option value="Other">Other</option>
                </select>
                <input
                  name="instituteRegistrationNumber"
                  type="text"
                  value={formData.instituteRegistrationNumber}
                  placeholder="Institute Registration Number"
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
                {isSignUp && showInstituteOtpInput && !isInstituteOtpVerified ? (
                  <div className="flex items-center gap-2">
                    <input
                      name="instituteEmail"
                      type="email"
                      value={formData.instituteEmail}
                      placeholder="Institute Email"
                      onChange={handleChange}
                      className="w-1/2 px-4 py-2 border rounded-lg"
                      required
                      disabled={true}
                    />
                    <input
                      name="instituteOtp"
                      type="text"
                      value={instituteOtp}
                      onChange={(e) => setInstituteOtp(e.target.value)}
                      placeholder="OTP"
                      className={instituteOtpInputClasses}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => handleVerifyOtp("institute", instituteOtp)}
                      className="w-1/4 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 text-sm"
                    >
                      Verify
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col md:flex-row gap-4 items-center">
                    <input
                      name="instituteEmail"
                      type="email"
                      value={formData.instituteEmail}
                      placeholder="Institute Email"
                      onChange={handleChange}
                      className="flex-1 w-full md:w-auto px-4 py-2 border rounded-lg"
                      required
                      disabled={isInstituteOtpVerified}
                    />
                    {isSignUp && !isInstituteOtpVerified && (
                      <button
                        type="button"
                        onClick={() => handleSendOtp("institute", formData.instituteEmail)}
                        className="w-full md:w-auto px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
                      >
                        Send OTP
                      </button>
                    )}
                    {isSignUp && isInstituteOtpVerified && (
                      <span className="text-green-600">✓ Verified</span>
                    )}
                  </div>
                )}
                <div className="border border-gray-300 rounded-lg p-3 bg-gray-50">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Logo
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="block w-full text-sm text-gray-700 border rounded-lg cursor-pointer file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-purple-600 file:text-white hover:file:bg-purple-700"
                    required
                  />
                  {formData.logo && (
                    <div className="mt-3 flex justify-center">
                      <img
                        src={formData.logo}
                        alt="Logo Preview"
                        className="w-24 h-24 object-contain border rounded-md shadow-sm bg-white"
                      />
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  className="w-full mt-3 bg-teal-500 text-white py-2 rounded-lg hover:bg-teal-600"
                  onClick={() => handleContinue(2)}
                >
                  Continue →
                </button>
              </>
            );
          case 2:
            return (
              <>
                <input
                  name="name"
                  type="text"
                  value={formData.name}
                  placeholder="Admin Full Name"
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
                <select
                  name="designation"
                  value={formData.designation}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                >
                  <option value="">Select Role</option>
                  <option value="Director">Director</option>
                  <option value="Dean">Dean</option>
                  <option value="Professor">Professor</option>
                  <option value="Head Master">Head Master</option>
                  <option value="Teacher">Teacher</option>
                </select>
                <input
                  name="id"
                  type="text"
                  value={formData.id}
                  placeholder="Admin ID"
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
                {isSignUp && showAdminOtpInput && !isAdminOtpVerified ? (
                  <div className="flex items-center gap-2">
                    <input
                      name="adminEmail"
                      type="email"
                      value={formData.adminEmail}
                      placeholder="Admin Email"
                      onChange={handleChange}
                      className="w-1/2 px-4 py-2 border rounded-lg"
                      required
                      disabled={true}
                    />
                    <input
                      name="adminOtp"
                      type="text"
                      value={adminOtp}
                      onChange={(e) => setAdminOtp(e.target.value)}
                      placeholder="OTP"
                      className={adminOtpInputClasses}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => handleVerifyOtp("admin", adminOtp)}
                      className="w-1/4 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 text-sm"
                    >
                      Verify
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col md:flex-row gap-4 items-center">
                    <input
                      name="adminEmail"
                      type="email"
                      value={formData.adminEmail}
                      placeholder="Admin Email"
                      onChange={handleChange}
                      className="flex-1 w-full md:w-auto px-4 py-2 border rounded-lg"
                      required
                      disabled={isAdminOtpVerified}
                    />
                    {isSignUp && !isAdminOtpVerified && (
                      <button
                        type="button"
                        onClick={() => handleSendOtp("admin", formData.adminEmail)}
                        className="w-full md:w-auto px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
                      >
                        Send OTP
                      </button>
                    )}
                    {isSignUp && isAdminOtpVerified && (
                      <span className="text-green-600">✓ Verified</span>
                    )}
                  </div>
                )}
                <input
                  name="adminPhone"
                  type="text"
                  value={formData.adminPhone}
                  placeholder="Admin Phone No."
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg"
                />
                <input
                  name="alternateContact"
                  type="text"
                  value={formData.alternateContact}
                  placeholder="Alternate Contact (Optional)"
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 bg-gray-300 py-2 rounded-lg hover:bg-gray-400"
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={() => handleContinue(3)}
                    className="flex-1 bg-teal-500 text-white py-2 rounded-lg hover:bg-teal-600"
                  >
                    Continue →
                  </button>
                </div>
              </>
            );
          case 3:
            return (
              <>
                <div className="relative">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    placeholder="Enter Password"
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg"
                    required
                  />
                  <img
                    src={showPassword ? HiddenIcon : EyeIcon}
                    alt="toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    className="w-5 h-5 absolute right-3 top-2.5 cursor-pointer"
                  />
                </div>
                {isSignUp && (
                  <input
                    name="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    placeholder="Confirm Password"
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg"
                    required
                  />
                )}
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Solve: <span className="font-bold">{mathQuestion.question}</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      name="captcha"
                      value={formData.captcha}
                      placeholder="Enter Captcha"
                      onChange={handleChange}
                      className="flex-1 px-4 py-2 border rounded-lg"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setMathQuestion(generateCaptcha())}
                      className="px-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600"
                    >
                      ↻
                    </button>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="flex-1 bg-gray-300 py-2 rounded-lg hover:bg-gray-400"
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-purple-600 to-teal-600 text-white py-2 rounded-lg shadow-md hover:opacity-90"
                  >
                    REGISTER
                  </button>
                </div>
              </>
            );
          default:
            return null;
        }
      default:
        return null;
    }
  };

  const renderLoginFields = () => (
    <>
      <input
        name="instituteRegistrationNumber"
        type="text"
        value={formData.instituteRegistrationNumber}
        placeholder="Institute Registration Number"
        onChange={handleChange}
        className="w-full px-4 py-2 border rounded-lg"
        required
      />
      <input
        name="email"
        type="email"
        value={formData.email}
        placeholder="Email"
        onChange={handleChange}
        className="w-full px-4 py-2 border rounded-lg"
        required
      />
      <div className="relative">
        <input
          name="password"
          type={showPassword ? "text" : "password"}
          value={formData.password}
          placeholder="Enter Password"
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-lg"
          required
        />
        <img
          src={showPassword ? HiddenIcon : EyeIcon}
          alt="toggle"
          onClick={() => setShowPassword(!showPassword)}
          className="w-5 h-5 absolute right-3 top-2.5 cursor-pointer"
        />
      </div>
      <div>
        <label className="block text-sm text-gray-600 mb-1">
          Solve: <span className="font-bold">{mathQuestion.question}</span>
        </label>
        <div className="flex gap-2">
          <input
            name="captcha"
            value={formData.captcha}
            placeholder="Enter Captcha"
            onChange={handleChange}
            className="flex-1 px-4 py-2 border rounded-lg"
            required
          />
          <button
            type="button"
            onClick={() => setMathQuestion(generateCaptcha())}
            className="px-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600"
          >
            ↻
          </button>
        </div>
      </div>
      <button
        type="submit"
        className="w-full bg-gradient-to-r from-purple-600 to-teal-600 text-white py-2 rounded-lg shadow-md hover:opacity-90"
      >
        LOGIN
      </button>
      <p
        className="text-right text-sm text-purple-600 cursor-pointer hover:underline"
        onClick={() => {
          setShowForgotPassword(true);
          resetForm();
        }}
      >
        Forgot Password?
      </p>
    </>
  );

  const renderForgotPasswordForm = () => {
    const otpInputClasses = `w-1/4 px-4 py-2 border rounded-lg transition-colors duration-300 ${
      forgotPasswordOtpStatus === "success"
        ? "border-green-500 ring-2 ring-green-200"
        : forgotPasswordOtpStatus === "error"
        ? "border-red-500 ring-2 ring-red-200"
        : ""
    }`;
  
    return (
      <motion.div
        key="forgot-password"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md bg-white shadow-2xl rounded-2xl p-8 flex flex-col min-h-[590px]"
      >
        <div className="flex items-center justify-center mb-6">
          <img src={RigyaIcon} alt="Rigya Logo" className="w-14 mr-2" />
          <h1 className="text-2xl font-bold text-purple-700">
            Forgot Password
          </h1>
        </div>
  
        <form onSubmit={handleForgotPasswordSubmit} className="space-y-4 flex flex-col flex-grow">
          <input
            name="forgotPasswordInstituteRegNum"
            type="text"
            value={forgotPasswordInstituteRegNum}
            placeholder="Institute Registration Number"
            onChange={(e) => setForgotPasswordInstituteRegNum(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
            required
            disabled={isForgotPasswordOtpVerified}
          />
          
          {isForgotPasswordOtpVerified ? (
            <>
              {/* After OTP is verified */}
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <input
                  name="forgotPasswordEmail"
                  type="email"
                  value={forgotPasswordEmail}
                  placeholder="Enter your email"
                  className="flex-1 w-full md:w-auto px-4 py-2 border rounded-lg"
                  disabled={true}
                />
                <span className="text-green-600">✓ Verified</span>
              </div>
              <div className="relative">
                <input
                  name="newPassword"
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  placeholder="New Password"
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
                <img
                  src={showPassword ? HiddenIcon : EyeIcon}
                  alt="toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  className="w-5 h-5 absolute right-3 top-2.5 cursor-pointer"
                />
              </div>
              <input
                name="confirmNewPassword"
                type="password"
                value={confirmNewPassword}
                placeholder="Confirm New Password"
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
                required
              />
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-teal-600 text-white py-2 rounded-lg shadow-md hover:opacity-90"
              >
                Reset Password
              </button>
            </>
          ) : (
            <>
              {/* Before OTP is verified */}
              <div className="flex items-center gap-2">
                {forgotPasswordOtpStatus === "idle" ? (
                  <>
                    <input
                      name="forgotPasswordEmail"
                      type="email"
                      value={forgotPasswordEmail}
                      placeholder="Enter your email"
                      onChange={(e) => setForgotPasswordEmail(e.target.value)}
                      className="w-3/4 px-4 py-2 border rounded-lg"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => handleSendOtp("forgotPassword", forgotPasswordEmail)}
                      className="w-1/4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
                    >
                      Send OTP
                    </button>
                  </>
                ) : (
                  <>
                    <input
                      name="forgotPasswordEmail"
                      type="email"
                      value={forgotPasswordEmail}
                      placeholder="Enter your email"
                      className="w-1/2 px-4 py-2 border rounded-lg"
                      disabled={true}
                      required
                    />
                    <input
                      name="forgotPasswordOtp"
                      type="text"
                      value={forgotPasswordOtp}
                      onChange={(e) => setForgotPasswordOtp(e.target.value)}
                      placeholder="OTP"
                      className={`w-1/4 px-4 py-2 border rounded-lg transition-colors duration-300 ${otpInputClasses}`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => handleVerifyOtp("forgotPassword", forgotPasswordOtp)}
                      className="w-1/4 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 text-sm"
                    >
                      Verify
                    </button>
                  </>
                )}
              </div>
            </>
          )}

          <p
            className="text-center text-sm text-gray-500 cursor-pointer hover:text-purple-600 mt-auto pt-2"
            onClick={() => {
              setShowForgotPassword(false);
              resetForm();
            }}
          >
            Back to Login
          </p>
        </form>
      </motion.div>
    );
  };
  
  return (
    <div
      className="fixed inset-0 flex overflow-hidden"
      style={{
        background:
          "linear-gradient(to bottom, #d6f8df, rgb(227, 224, 250), #88e4f4)",
        backgroundAttachment: "fixed",
      }}
    >
      <motion.div
        className="flex w-full"
        animate={{ flexDirection: isSignUp ? "row-reverse" : "row" }}
        transition={{ duration: 0.7, ease: "easeInOut" }}
      >
        {/* Banner */}
        <div className="hidden md:flex flex-col justify-center items-center w-1/2 p-10">
          <img src={RigyaIcon} alt="Rigya Logo" className="w-72 mb-6" />
          <blockquote className="italic text-center text-lg leading-relaxed max-w-md bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-teal-600">
            {isSignUp
              ? "“Curiosity is the root of learning, Learning is the path to wisdom, Wisdom is the bridge to innovation, Innovation is the spark of progress, And progress is the soul of Rigya”"
              : "“Education is the key to success, Success is the key to achievement, Achievement is the key to hope, Hope is the key to happiness, And happiness is the key to harmony”"}
          </blockquote>
        </div>

        {/* Form */}
        <div className="flex-1 flex items-center justify-center p-6">
          {showForgotPassword ? (
            renderForgotPasswordForm()
          ) : (
            <motion.div
              key={isSignUp ? "signup" : "signin"}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="w-full max-w-md bg-white shadow-2xl rounded-2xl p-8 flex flex-col min-h-[590px]"
            >
              <div className="flex items-center justify-center mb-6">
                <img src={RigyaIcon} alt="Rigya Logo" className="w-14 mr-2" />
                <h1 className="text-2xl font-bold text-purple-700">
                  {isSignUp ? "Registration" : "Login"}
                </h1>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 flex flex-col flex-grow">
                {/* User Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Select User Type
                  </label>
                  <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
                    {[
                      "Student",
                      "Teacher",
                      "Institute",
                      "Officials",
                      "Other",
                    ].map((type) => (
                      <label key={type} className="flex items-center gap-1">
                        <input
                          type="radio"
                          name="userType"
                          value={type}
                          checked={userType === type}
                          onChange={() => {
                            setUserType(type);
                            setStep(1);
                            resetForm();
                          }}
                        />
                        {type}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col space-y-4 flex-grow">
                  {/* Form Fields */}
                  {isSignUp ? (
                    <>
                      {renderRegisterFields()}
                      {userType !== "Institute" && renderCommonFields()}
                      {userType !== "Institute" && (
                        <button
                          type="submit"
                          className="w-full bg-gradient-to-r from-purple-600 to-teal-600 text-white py-2 rounded-lg shadow-md hover:opacity-90"
                        >
                          REGISTER
                        </button>
                      )}
                    </>
                  ) : (
                    renderLoginFields()
                  )}
                </div>

                <p
                  className="text-center text-sm text-gray-500 cursor-pointer hover:text-purple-600 mt-auto pt-2"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    resetForm();
                  }}
                >
                  {isSignUp
                    ? "Already have an account? Login"
                    : "Don’t have an account? Register"}
                </p>
              </form>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}