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
  });

  const [userType, setUserType] = useState("Teacher");
  const [showPassword, setShowPassword] = useState(false);
  const [mathQuestion, setMathQuestion] = useState(generateCaptcha());
  const [error, setError] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [step, setStep] = useState(1);
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
    });
    setMathQuestion(generateCaptcha());
    setStep(1);
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

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

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.captcha !== mathQuestion.answer) {
      setError("Captcha answer is incorrect.");
      return;
    }
    if (!formData.email || !formData.password) {
      setError("Please fill in all required fields.");
      return;
    }

    if (isSignUp) {
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match.");
        return;
      }

      const newUser = {
        password: formData.password,
        userType,
        name: formData.name || "",
        id: formData.id || "",
        instituteName: formData.instituteName || "",
        instituteType: formData.instituteType || "",
        affiliationNumber: formData.affiliationNumber || "",
        instituteEmail: formData.instituteEmail || "",
        logo: formData.logo || null,
        designation: formData.designation || "",
        department: formData.department || "",
      };

      localStorage.setItem(`user:${formData.email}`, JSON.stringify(newUser));

      localStorage.setItem(
        "auth",
        JSON.stringify({
          email: formData.email,
          userType: newUser.userType,
          name: newUser.name,
          id: newUser.id,
          instituteName: newUser.instituteName,
          instituteType: newUser.instituteType,
          affiliationNumber: newUser.affiliationNumber,
          instituteEmail: newUser.instituteEmail,
          logo: newUser.logo,
          designation: newUser.designation,
          department: newUser.department,
        })
      );

      setError("");
      alert("Registration successful!");
      navigate("/");
    } else {
      const user = localStorage.getItem(`user:${formData.email}`);
      if (!user) {
        setError("No user found.");
        return;
      }
      const parsed = JSON.parse(user);
      if (parsed.password !== formData.password) {
        setError("Wrong password.");
        return;
      }

      localStorage.setItem(
        "auth",
        JSON.stringify({
          email: formData.email,
          userType: parsed.userType,
          name: parsed.name || "",
          id: parsed.id || "",
          instituteName: parsed.instituteName || "",
          instituteType: parsed.instituteType || "",
          affiliationNumber: parsed.affiliationNumber || "",
          instituteEmail: parsed.instituteEmail || "",
          logo: parsed.logo || null,
          designation: parsed.designation || "",
          department: parsed.department || "",
        })
      );

      navigate("/");
    }
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
              :  "“Education is the key to success, Success is the key to achievement, Achievement is the key to hope, Hope is the key to happiness, And happiness is the key to harmony”"}
          </blockquote>
        </div>

        {/* Form */}
        <div className="flex-1 flex items-center justify-center p-6">
          <motion.div
            key={isSignUp ? "signup" : "signin"}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-md bg-white shadow-2xl rounded-2xl p-8"
          >
            <div className="flex items-center justify-center mb-6">
              <img src={RigyaIcon} alt="Rigya Logo" className="w-14 mr-2" />
              <h1 className="text-2xl font-bold text-purple-700">
                {isSignUp ? "Registration" : "Login"}
              </h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* User Type */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Select User Type
                </label>
                <div className="flex gap-4 text-sm">
                  {["Student", "Teacher", "Institute", "Officials", "Other"].map(
                    (type) => (
                      <label key={type} className="flex items-center gap-1">
                        <input
                          type="radio"
                          name="userType"
                          value={type}
                          checked={userType === type}
                          onChange={() => {
                            setUserType(type);
                            setStep(1);
                          }}
                        />
                        {type}
                      </label>
                    )
                  )}
                </div>
              </div>

              {/* Student & Teacher */}
              {isSignUp &&
                (userType === "Student" || userType === "Teacher") && (
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
                      placeholder={
                        userType === "Student"
                          ? "Student ID"
                          : "Teacher ID"
                      }
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-lg"
                      required
                    />
                  </>
                )}

              {/* Officials */}
              {isSignUp && userType === "Officials" && (
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
                    placeholder="Employee / Staff ID"
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
                    <option value="">Select Designation</option>
                    <option value="Director">Director</option>
                    <option value="Dean">Dean</option>
                    <option value="HOD">HOD</option>

                    <option value="Registrar">Registrar</option>
                    <option value="Faculty Member">Faculty Member</option>
                    <option value="Support Staff">Support Staff</option>
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
              )}

              {/* Other Staff */}
              {isSignUp && userType === "Other" && (
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
                    placeholder="Staff ID"
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
                    <option value="Librarian">Librarian</option>
                    <option value="Warden">Warden</option>
                    <option value="Lab Assistant">Lab Assistant</option>
                    <option value="Accountant">Accountant</option>
                    <option value="Security Staff">Security Staff</option>
                    <option value="Technical Staff">Technical Staff</option>
                    <option value="Clerk">Clerk</option>
                  </select>
                </>
              )}

              {/* Institute Step 1 */}
              {isSignUp && userType === "Institute" && step === 1 && (
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
                    name="affiliationNumber"
                    type="text"
                    value={formData.affiliationNumber}
                    placeholder="Registration Number"
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg"
                    required
                  />
                  <input
                    name="instituteEmail"
                    type="email"
                    value={formData.instituteEmail}
                    placeholder="Institute Email"
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg"
                    required
                  />
                  <div className="border border-gray-300 rounded-lg p-3 bg-gray-50">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload Logo
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="block w-full text-sm text-gray-700 border rounded-lg cursor-pointer 
                        file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 
                        file:text-sm file:font-medium file:bg-purple-600 file:text-white 
                        hover:file:bg-purple-700"
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
                    onClick={() => setStep(2)}
                  >
                    Continue →
                  </button>
                </>
              )}

               {isSignUp && userType === "Institute" && step === 2 && (
                <>
                  <input
                    name="adminName"
                    type="text"
                    value={formData.adminName}
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
                    <option value="Librarian">Director</option>
                    <option value="Warden">Dean</option>
                    <option value="Lab Assistant">Professor</option>
                    <option value="Accountant">Head Master</option>
                    <option value="Security Staff">Teacher</option>
                  </select>


                  <input
                    name="adminId"
                    type="text"
                    value={formData.adminId}
                    placeholder="Admin ID"
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg"
                    required
                  />
                  <input
                    name="adminEmail"
                    type="email"
                    value={formData.adminEmail}
                    placeholder="Admin Email"
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg"
                    required
                  />
                  <input
                    name="adminPhone"
                    type="text"
                    value={formData.adminPhone}
                    placeholder="Admin Phone No."
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg"
                  />

                  <input
                    name="adminPhone"
                    type="text"
                    value={formData.adminPhone}
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
                      onClick={() => setStep(3)}
                      className="flex-1 bg-teal-500 text-white py-2 rounded-lg hover:bg-teal-600"
                    >
                      Continue →
                    </button>
                  </div>
                </>
              )}

              {/* Common Credentials */}
              {(!isSignUp || userType !== "Institute" || step === 3) && (
                <>
                <input
                    name="Institute Registration No."
                    type="text"
                    value={formData.adminPhone}
                    placeholder="Institute Registration No."
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg"
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
                      Solve:{" "}
                      <span className="font-bold">{mathQuestion.question}</span>
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
                  {error && <p className="text-sm text-red-600">{error}</p>}
                  <div className="flex gap-2">
                    {isSignUp && userType === "Institute" && step === 3 && (
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="flex-1 bg-gray-300 py-2 rounded-lg hover:bg-gray-400"
                      >
                        ← Back
                      </button>
                    )}
                    <button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-purple-600 to-teal-600 text-white py-2 rounded-lg shadow-md hover:opacity-90"
                    >
                      {isSignUp ? "REGISTER" : "LOGIN"}
                    </button>
                  </div>
                </>
              )}

              <p
                className="text-center text-sm text-gray-500 cursor-pointer hover:text-purple-600 mt-2"
                onClick={() => {
                  setError("");
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
        </div>
      </motion.div>
    </div>
  );
}
