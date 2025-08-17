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
    instituteName: "",
    instituteType: "",
    affiliationNumber: "",
    instituteEmail: "",
    logo: null,
  });
  const [userType, setUserType] = useState("Teacher");
  const [showPassword, setShowPassword] = useState(false);
  const [mathQuestion, setMathQuestion] = useState(generateCaptcha());
  const [error, setError] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [step, setStep] = useState(1); // multi-step
  const navigate = useNavigate();

  const resetForm = () => {
    setFormData({
      email: "",
      password: "",
      confirmPassword: "",
      captcha: "",
      instituteName: "",
      instituteType: "",
      affiliationNumber: "",
      instituteEmail: "",
      logo: null,
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
      setError("Please fill in all fields.");
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
        instituteName: formData.instituteName || "",
        instituteType: formData.instituteType || "",
        affiliationNumber: formData.affiliationNumber || "",
        instituteEmail: formData.instituteEmail || "",
        logo: formData.logo || null,
      };

      // Save user record
      localStorage.setItem(`user:${formData.email}`, JSON.stringify(newUser));

      // ✅ Also set active auth (auto-login after registration)
      localStorage.setItem(
        "auth",
        JSON.stringify({
          email: formData.email,
          userType: newUser.userType,
          instituteName: newUser.instituteName,
          instituteType: newUser.instituteType,
          affiliationNumber: newUser.affiliationNumber,
          instituteEmail: newUser.instituteEmail,
          logo: newUser.logo,
        })
      );

      setError("");
      alert("Registration successful!");
      navigate("/");
    } else {
      // Login
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

      // ✅ Store active auth
      localStorage.setItem(
        "auth",
        JSON.stringify({
          email: formData.email,
          userType: parsed.userType,
          instituteName: parsed.instituteName || "",
          instituteType: parsed.instituteType || "",
          affiliationNumber: parsed.affiliationNumber || "",
          instituteEmail: parsed.instituteEmail || "",
          logo: parsed.logo || null,
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
              ? "“Curiosity is the root of learning... progress is the soul of Rigya”"
              : "“Education is the key to success... happiness is the key to harmony”"}
          </blockquote>
        </div>

        {/* Form Side */}
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

              {/* Registration for Institute → Step 1 */}
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
                    placeholder="Affiliation Number"
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

                  {/* Logo Upload Box */}
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

              {/* Step 2 → Credentials */}
              {(!isSignUp || userType !== "Institute" || step === 2) && (
                <>
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    placeholder="Enter User ID / Email"
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

                  {/* Captcha */}
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
                    {isSignUp && userType === "Institute" && step === 2 && (
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
