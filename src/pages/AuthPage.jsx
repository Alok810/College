import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { HelpCircle } from "lucide-react";
import RigyaIcon from "../assets/rigya.png";
import { registerUser, loginUser, sendOtp, verifyOtp, sendPasswordResetLink, getPublicDepartments, searchAisheInstitutes } from "../api.js";
import { useAuth } from '../context/AuthContext';
import { subscribeToOSNotifications } from '../utils/pushNotifications';

import InstituteSearchBox from "../components/auth/InstituteSearchBox";
import LoginForm from "../components/auth/LoginForm";
import RegistrationForm from "../components/auth/RegistrationForm";
import ForgotPasswordForm from "../components/auth/ForgotPasswordForm";

function generateCaptcha() {
  const a = Math.floor(Math.random() * 10);
  const b = Math.floor(Math.random() * 10);
  return { question: `${a} × ${b}`, answer: (a * b).toString() };
}

export default function AuthPage() {
  const { setIsAuthenticated, fetchAuthData } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "", password: "", confirmPassword: "", captcha: "", name: "",
    registrationNo: "", batch: "", branch: "", instituteName: "", 
    instituteType: "", affiliationNumber: "", instituteEmail: "", logo: null,
    designation: "", instituteRegistrationNumber: "",
    adminEmail: "", adminPhone: "", alternateContact: "",
  });

  const [userType, setUserType] = useState("Teacher");
  const [showPassword, setShowPassword] = useState(false);
  const [mathQuestion, setMathQuestion] = useState(generateCaptcha());
  const [isSignUp, setIsSignUp] = useState(false);
  
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
  const [forgotPasswordStatus, setForgotPasswordStatus] = useState("idle");

  const [availableBranches, setAvailableBranches] = useState([]);
  const [fetchingBranches, setFetchingBranches] = useState(false);

  const [instSearchQuery, setInstSearchQuery] = useState("");
  const [instSearchResults, setInstSearchResults] = useState([]);
  const [isInstSearching, setIsInstSearching] = useState(false);
  const [showInstDropdown, setShowInstDropdown] = useState(false);
  const instDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
        if (instDropdownRef.current && !instDropdownRef.current.contains(event.target)) {
            setShowInstDropdown(false);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const query = instSearchQuery.trim().toLowerCase();
    const priorityInst = {
        aisheCode: "U-1339",
        name: "National Institute of Advanced Manufacturing Technology",
        district: "Ranchi",
        state: "Jharkhand",
        instituteType: "University"
    };

    if (query.length === 0) {
        setInstSearchResults([]);
        return;
    }

    let localResults = [];
    if (priorityInst.name.toLowerCase().includes(query) || priorityInst.aisheCode.toLowerCase().includes(query)) {
        localResults.push(priorityInst);
    }

    if (query.length < 3) {
        setInstSearchResults(localResults);
        return;
    }

    const fetchInst = async () => {
        setIsInstSearching(true);
        try {
            const data = await searchAisheInstitutes(instSearchQuery.trim());
            if (data.success) {
                const apiResults = data.results.filter(inst => inst.aisheCode !== priorityInst.aisheCode);
                setInstSearchResults([...localResults, ...apiResults]);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsInstSearching(false);
        }
    };

    const delayDebounceFn = setTimeout(() => { fetchInst(); }, 400);
    return () => clearTimeout(delayDebounceFn);
  }, [instSearchQuery]);

  const resetForm = () => {
    setFormData({
      email: "", password: "", confirmPassword: "", captcha: "", name: "",
      registrationNo: "", batch: "", branch: "", instituteName: "",
      instituteType: "", affiliationNumber: "", instituteEmail: "", logo: null,
      designation: "", instituteRegistrationNumber: "",
      adminEmail: "", adminPhone: "", alternateContact: "",
    });
    setMathQuestion(generateCaptcha());
    setShowOtpInput(false); setOtp(""); setIsOtpVerified(false); setOtpStatus("idle");
    setShowInstituteOtpInput(false); setInstituteOtp(""); setIsInstituteOtpVerified(false); setInstituteOtpStatus("idle");
    setShowAdminOtpInput(false); setAdminOtp(""); setIsAdminOtpVerified(false); setAdminOtpStatus("idle");
    setForgotPasswordEmail(""); setForgotPasswordStatus("idle");
    setAvailableBranches([]);
    setInstSearchQuery(""); 
    sessionStorage.removeItem("validAisheCode"); 
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "email" && showOtpInput) { setShowOtpInput(false); setIsOtpVerified(false); setOtpStatus("idle"); }
    if (name === "instituteEmail" && showInstituteOtpInput) { setShowInstituteOtpInput(false); setIsInstituteOtpVerified(false); setInstituteOtpStatus("idle"); }
    if (name === "adminEmail" && showAdminOtpInput) { setShowAdminOtpInput(false); setIsAdminOtpVerified(false); setAdminOtpStatus("idle"); }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    setFormData({ ...formData, logo: file });
  };

  useEffect(() => {
    const fetchBranches = async () => {
      if ((userType !== 'Student' && userType !== 'Teacher') || !formData.instituteRegistrationNumber || formData.instituteRegistrationNumber.trim().length === 0) {
        setAvailableBranches([]);
        return;
      }
      setFetchingBranches(true);
      try {
        const res = await getPublicDepartments(formData.instituteRegistrationNumber.trim());
        let fetchedBranches = [];
        if (Array.isArray(res)) fetchedBranches = res;
        else if (res.departments && Array.isArray(res.departments)) fetchedBranches = res.departments;
        else if (res.data && Array.isArray(res.data)) fetchedBranches = res.data;
        setAvailableBranches(fetchedBranches);
      } catch (error) {
        console.error("Failed to fetch branches:", error);
        setAvailableBranches([]);
      } finally {
        setFetchingBranches(false);
      }
    };
    const delayDebounceFn = setTimeout(() => { fetchBranches(); }, 500); 
    return () => clearTimeout(delayDebounceFn);
  }, [formData.instituteRegistrationNumber, userType]);

  const handleSendOtp = async (emailType, email) => {
    if (!email) return alert(`Please enter the ${emailType} email first.`);
    try {
      await sendOtp(email);
      alert("OTP sent to your email!");
      if (emailType === "institute") { setShowInstituteOtpInput(true); setInstituteOtpStatus("pending"); } 
      else if (emailType === "admin") { setShowAdminOtpInput(true); setAdminOtpStatus("pending"); } 
      else { setShowOtpInput(true); setOtpStatus("pending"); }
    } catch (error) {
      alert(error.message);
    }
  };

  const handleVerifyOtp = async (emailType, code) => {
    const email = emailType === "institute" ? formData.instituteEmail : emailType === "admin" ? formData.adminEmail : formData.email;
    if (!code) return alert("Please enter the OTP.");
    try {
      const response = await verifyOtp(email, code);
      if (response.success) {
        alert("OTP verified successfully!");
        if (emailType === "institute") { setIsInstituteOtpVerified(true); setInstituteOtpStatus("success"); } 
        else if (emailType === "admin") { setIsAdminOtpVerified(true); setAdminOtpStatus("success"); } 
        else { setIsOtpVerified(true); setOtpStatus("success"); }
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

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!forgotPasswordEmail || !formData.instituteRegistrationNumber) return alert("Please provide both your email and select your institute.");
      const response = await sendPasswordResetLink({ email: forgotPasswordEmail, instituteRegistrationNumber: formData.instituteRegistrationNumber });
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
    if (formData.captcha !== mathQuestion.answer) {
      alert("Captcha answer is incorrect.");
      setMathQuestion(generateCaptcha());
      return;
    }

    if (isSignUp) {
      const enteredID = formData.instituteRegistrationNumber.trim();
      const validID = sessionStorage.getItem("validAisheCode");

      if (enteredID !== "18" && enteredID !== validID) {
          alert("Invalid Institute. Please select a valid institute from the search dropdown.");
          return;
      }

      if (userType === "Institute") {
        if (!isInstituteOtpVerified || !isAdminOtpVerified || !formData.logo || formData.password !== formData.confirmPassword) {
          return alert("Please fill out all required fields, verify both emails, and solve the captcha correctly.");
        }
      } else {
        if (!isOtpVerified || formData.password !== formData.confirmPassword) {
          return alert("Please fill out all required fields, verify your email, and solve the captcha correctly.");
        }
        if (userType === "Teacher" && !formData.branch) {
          return alert("Please select a Primary Department.");
        }
      }

      try {
        let payload;
        if (userType === "Institute") {
          payload = new FormData();
          for (const key in formData) { payload.append(key, formData[key] || ''); }
          if (formData.logo) payload.append('logo', formData.logo);
          payload.append('instituteOtp', instituteOtp || '');
          payload.append('adminOtp', adminOtp || '');
          payload.append('userType', userType);
        } else {
          payload = { ...formData, otp, userType };
        }

        const response = await registerUser(payload);
        if (response.success) {
          if (response.token) {
            localStorage.setItem("token", response.token);
          }
          
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
      if (!formData.email || !formData.password) {
        return alert("Please enter your email and password.");
      }
      try {
        const response = await loginUser({ 
          email: formData.email, 
          password: formData.password
        });
        
        if (response.success) {
          localStorage.setItem("token", response.token); 
          await fetchAuthData(); 
          setIsAuthenticated(true);
          subscribeToOSNotifications();
          navigate("/");
        } else {
          alert(response.message);
        }
      } catch (error) {
        alert(error.message);
      }
    }
  };

  const renderSearchBox = () => (
    <InstituteSearchBox
      instSearchQuery={instSearchQuery}
      setInstSearchQuery={setInstSearchQuery}
      setFormData={setFormData}
      setShowInstDropdown={setShowInstDropdown}
      showInstDropdown={showInstDropdown}
      instSearchResults={instSearchResults}
      isInstSearching={isInstSearching}
      userType={userType}
      instDropdownRef={instDropdownRef}
      navigate={navigate}
    />
  );

 return (
    // 🟢 1. SAFE AREA PADDING: Added 'env(safe-area-inset-...)' to the style block.
    // This pushes the flex container down and up dynamically based on the phone's physical notch/bars!
    <div 
      className="fixed inset-0 h-[100dvh] w-full flex overflow-hidden" 
      style={{ 
        background: "linear-gradient(to bottom, #d6f8df, rgb(227, 224, 250), #88e4f4)", 
        backgroundAttachment: "fixed",
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
        paddingLeft: "env(safe-area-inset-left)",
        paddingRight: "env(safe-area-inset-right)"
      }}
    >
      <motion.div className="flex w-full items-center justify-center h-full" animate={{ flexDirection: isSignUp ? "row-reverse" : "row" }} transition={{ duration: 0.7, ease: "easeInOut" }} >
        
        {/* Desktop Side Graphic */}
        <div className="hidden md:flex flex-col justify-center items-center w-1/2 p-10">
          <img src={RigyaIcon} alt="Rigya Logo" className="w-72 mb-6" />
          <blockquote className="italic text-center text-lg leading-relaxed max-w-md bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-teal-600">
            {isSignUp ? "“Curiosity is the root of learning...”" : "“Education is the key to success...”"}
          </blockquote>
        </div>

        {/* Form Container */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-4 z-10 h-full">
          {showForgotPassword ? (
            <ForgotPasswordForm
              handleForgotPasswordSubmit={handleForgotPasswordSubmit}
              forgotPasswordStatus={forgotPasswordStatus}
              forgotPasswordEmail={forgotPasswordEmail}
              setForgotPasswordEmail={setForgotPasswordEmail}
              renderSearchBox={renderSearchBox}
              setShowForgotPassword={setShowForgotPassword}
              resetForm={resetForm}
            />
          ) : (
            <motion.div
              key={isSignUp ? "signup" : "signin"}
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
              className="w-full max-w-md bg-white shadow-2xl rounded-2xl p-5 md:p-8 flex flex-col h-fit max-h-[95dvh] md:max-h-[700px] overflow-hidden"
            >
              <div className="flex items-center justify-center mb-4 sm:mb-6 shrink-0">
                <img src={RigyaIcon} alt="Rigya Logo" className="w-12 sm:w-14 mr-2" />
                <h1 className="text-xl sm:text-2xl font-bold text-purple-700">{isSignUp ? "Registration" : "Login"}</h1>
              </div>
              
              <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:gap-4 overflow-y-auto pr-1 sm:pr-2 custom-scrollbar">
                
                {isSignUp && (
                  <div className="space-y-3 sm:space-y-4 shrink-0">
                    <label className="block text-sm font-medium text-gray-600 mb-1 sm:mb-2">Select User Type</label>
                    <div className="flex flex-wrap gap-x-3 gap-y-2 text-sm">
                      {["Student", "Teacher", "Institute", "Official", "Other"].map((type) => (
                        <label key={type} className="flex items-center gap-1 cursor-pointer">
                          <input type="radio" name="userType" value={type} checked={userType === type} onChange={() => { setUserType(type); resetForm(); }} />
                          {type}
                        </label>
                      ))}
                    </div>
                  </div>
                )}
                
                {isSignUp ? (
                  <RegistrationForm
                    userType={userType}
                    formData={formData}
                    handleChange={handleChange}
                    renderSearchBox={renderSearchBox}
                    fetchingBranches={fetchingBranches}
                    availableBranches={availableBranches}
                    showOtpInput={showOtpInput}
                    isOtpVerified={isOtpVerified}
                    otp={otp}
                    setOtp={setOtp}
                    otpStatus={otpStatus}
                    handleVerifyOtp={handleVerifyOtp}
                    handleSendOtp={handleSendOtp}
                    showPassword={showPassword}
                    setShowPassword={setShowPassword}
                    mathQuestion={mathQuestion}
                    generateNewCaptcha={() => setMathQuestion(generateCaptcha())}
                    showInstituteOtpInput={showInstituteOtpInput}
                    isInstituteOtpVerified={isInstituteOtpVerified}
                    instituteOtp={instituteOtp}
                    setInstituteOtp={setInstituteOtp}
                    instituteOtpStatus={instituteOtpStatus}
                    showAdminOtpInput={showAdminOtpInput}
                    isAdminOtpVerified={isAdminOtpVerified}
                    adminOtp={adminOtp}
                    setAdminOtp={setAdminOtp}
                    adminOtpStatus={adminOtpStatus}
                    handleLogoUpload={handleLogoUpload}
                  />
                ) : (
                  <LoginForm
                    formData={formData}
                    handleChange={handleChange}
                    showPassword={showPassword}
                    setShowPassword={setShowPassword}
                    mathQuestion={mathQuestion}
                    generateNewCaptcha={() => setMathQuestion(generateCaptcha())}
                    setShowForgotPassword={setShowForgotPassword}
                    resetForm={resetForm}
                    renderSearchBox={renderSearchBox}
                  />
                )}
                
                <p className="text-center text-sm text-gray-500 cursor-pointer hover:text-purple-600 mt-4 shrink-0 pb-1" onClick={() => { setIsSignUp(!isSignUp); resetForm(); }}>
                  {isSignUp ? "Already have an account? Login" : "Don’t have an account? Register"}
                </p>
              </form>
            </motion.div>
          )}
        </div>
      </motion.div>

      <motion.button
        key={isSignUp ? "help-register" : "help-login"}
        // 🟢 2. BUTTON SAFE AREA: Removed 'bottom-4' and replaced it dynamically in the style prop
        className={`absolute z-[90] p-3 md:p-4 bg-gradient-to-r from-purple-600 to-teal-600 text-white rounded-full shadow-2xl hover:shadow-lg hover:scale-105 flex items-center justify-center ${isSignUp ? "right-4 md:right-8" : "left-4 md:left-8"}`}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: showForgotPassword ? 0 : 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ 
          pointerEvents: showForgotPassword ? "none" : "auto",
          // This ensures the button sits 1rem (16px) above the gesture bar!
          bottom: "calc(env(safe-area-inset-bottom, 0px) + 1rem)" 
        }}
        onClick={() => navigate('/helpdesk')} 
        title="Help Desk & Directory"
      >
        <HelpCircle size={24} className="md:w-7 md:h-7" />
      </motion.button>
    </div>
  );
}