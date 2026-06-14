import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import EyeIcon from "../../assets/eye.png";
import HiddenIcon from "../../assets/hidden.png";

export default function RegistrationForm({
  userType,
  formData,
  handleChange,
  renderSearchBox,
  fetchingBranches,
  availableBranches,
  showOtpInput,
  isOtpVerified,
  otp,
  setOtp,
  otpStatus,
  handleVerifyOtp,
  handleSendOtp,
  showPassword,
  setShowPassword,
  mathQuestion,
  generateNewCaptcha,
  showInstituteOtpInput,
  isInstituteOtpVerified,
  instituteOtp,
  setInstituteOtp,
  instituteOtpStatus,
  showAdminOtpInput,
  isAdminOtpVerified,
  adminOtp,
  setAdminOtp,
  adminOtpStatus,
  handleLogoUpload
}) {
  // Shared base classes directly from LoginForm
  const baseInputClass = "w-full px-3 py-3 md:py-2 bg-gray-50/50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-inset focus:ring-purple-500 focus:border-purple-500 transition-all outline-none text-gray-800 shadow-sm text-sm sm:text-base md:text-sm";
  const btnBaseClass = "px-4 md:px-3 py-3 md:py-2 rounded-xl shadow-md active:scale-[0.98] transition-all font-bold text-[15px] md:text-sm whitespace-nowrap text-white";

  // Dynamic OTP Input classes
  const getOtpInputClass = (status) => {
    let statusClass = "focus:ring-purple-500 focus:border-purple-500 border-gray-300";
    if (status === "success") statusClass = "border-green-500 ring-2 ring-green-200 focus:ring-green-500 focus:border-green-500";
    if (status === "error") statusClass = "border-red-500 ring-2 ring-red-200 focus:ring-red-500 focus:border-red-500";
    return `flex-1 px-3 py-3 md:py-2 bg-gray-50/50 border rounded-xl focus:ring-2 focus:ring-inset transition-all outline-none text-gray-800 shadow-sm text-sm sm:text-base md:text-sm ${statusClass}`;
  };

  const SectionHeader = ({ title }) => (
    <motion.div layout className="flex items-center gap-2 my-4">
      <div className="flex-grow border-t border-gray-200"></div>
      <span className="text-xs md:text-[11px] font-bold tracking-wider text-purple-600 uppercase">
        {title}
      </span>
      <div className="flex-grow border-t border-gray-200"></div>
    </motion.div>
  );

  // Framer Motion Animation Variants for expanding sections
  const expandVariant = {
    hidden: { opacity: 0, height: 0, marginTop: 0, overflow: "hidden" },
    visible: { opacity: 1, height: "auto", marginTop: 8, transition: { duration: 0.3, ease: "easeOut" } },
    exit: { opacity: 0, height: 0, marginTop: 0, transition: { duration: 0.2, ease: "easeIn" } }
  };

  if (userType === "Institute") {
    return (
      <motion.div layout className="flex flex-col gap-4 md:gap-3 w-full mt-2 md:mt-0">
        <SectionHeader title="Institute Details" />
        
        <motion.div layout>{renderSearchBox()}</motion.div>
        <motion.input layout name="instituteName" type="text" value={formData.instituteName} placeholder="Institute Name" onChange={handleChange} className={baseInputClass} required />
        <motion.select layout name="instituteType" value={formData.instituteType} onChange={handleChange} className={baseInputClass} required>
          <option value="" disabled>Select Type</option>
          <option value="University">University</option>
          <option value="College">College</option>
          <option value="Standalone">Standalone</option>
          <option value="Other">Other</option>
        </motion.select>
        
        {/* Institute OTP - UPDATED FOR MOBILE LAYOUT */}
        <motion.div layout>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input 
                name="instituteEmail" 
                type="email" 
                value={formData.instituteEmail} 
                placeholder="Institute Email" 
                onChange={handleChange} 
                className={`${baseInputClass} w-full ${isInstituteOtpVerified ? 'pr-20' : ''}`} 
                required 
                disabled={isInstituteOtpVerified || showInstituteOtpInput} 
              />
              <AnimatePresence mode="wait">
                {isInstituteOtpVerified && (
                  <motion.span key="verified-badge" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600 text-sm font-bold bg-gray-50 px-1">
                    ✓ Verified
                  </motion.span>
                )}
              </AnimatePresence>
            </div>

            <AnimatePresence mode="wait">
              {!isInstituteOtpVerified && !showInstituteOtpInput && (
                <motion.button 
                  key="send-btn" 
                  initial={{ opacity: 0, scale: 0.9 }} 
                  animate={{ opacity: 1, scale: 1 }} 
                  exit={{ opacity: 0, scale: 0.9 }} 
                  transition={{ duration: 0.2 }} 
                  type="button" 
                  onClick={() => handleSendOtp("institute", formData.instituteEmail)} 
                  className={`${btnBaseClass} bg-purple-600 hover:bg-purple-700 flex-shrink-0`}
                >
                  Send OTP
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          <AnimatePresence>
            {showInstituteOtpInput && !isInstituteOtpVerified && (
              <motion.div variants={expandVariant} initial="hidden" animate="visible" exit="exit" className="flex gap-2 w-full mt-2">
                <input name="instituteOtp" type="text" value={instituteOtp} onChange={(e) => setInstituteOtp(e.target.value)} placeholder="Enter OTP" className={getOtpInputClass(instituteOtpStatus)} required />
                <button type="button" onClick={() => handleVerifyOtp("institute", instituteOtp)} className={`${btnBaseClass} bg-teal-500 hover:bg-teal-600 flex-shrink-0`}>Verify</button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Logo Upload */}
        <motion.div layout className="border border-purple-100 rounded-xl p-3 bg-purple-50/30 shadow-sm">
          <label className="block text-[13px] font-semibold text-purple-700 mb-2 ml-1">Upload Logo</label>
          <input type="file" accept="image/*" onChange={handleLogoUpload} className="block w-full text-sm text-gray-700 border border-gray-300 rounded-xl cursor-pointer bg-white file:mr-3 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700 outline-none transition-all focus:ring-2 focus:ring-purple-500 shadow-sm" required />
          <AnimatePresence>
            {formData.logo && (
              <motion.div variants={expandVariant} initial="hidden" animate="visible" exit="exit" className="flex justify-center">
                <img src={URL.createObjectURL(formData.logo)} alt="Logo Preview" className="w-20 h-20 object-contain border border-gray-200 rounded-xl shadow-sm bg-white p-1" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <SectionHeader title="Admin Details" />

        <motion.input layout name="name" type="text" value={formData.name} placeholder="Admin Full Name" onChange={handleChange} className={baseInputClass} required />
        <motion.select layout name="designation" value={formData.designation} onChange={handleChange} className={baseInputClass} required>
          <option value="">Select Role</option>
          <option value="Director">Director</option>
          <option value="Dean">Dean</option>
          <option value="Professor">Professor</option>
          <option value="Head Master">Head Master</option>
          <option value="Teacher">Teacher</option>
        </motion.select>
        <motion.input layout name="registrationNo" type="text" value={formData.registrationNo} placeholder="Admin ID" onChange={handleChange} className={baseInputClass} required />
        
        {/* Admin OTP - UPDATED FOR MOBILE LAYOUT */}
        <motion.div layout>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input 
                name="adminEmail" 
                type="email" 
                value={formData.adminEmail} 
                placeholder="Admin Email" 
                onChange={handleChange} 
                className={`${baseInputClass} w-full ${isAdminOtpVerified ? 'pr-20' : ''}`} 
                required 
                disabled={isAdminOtpVerified || showAdminOtpInput} 
              />
              <AnimatePresence mode="wait">
                {isAdminOtpVerified && (
                  <motion.span key="verified-badge" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600 text-sm font-bold bg-gray-50 px-1">
                    ✓ Verified
                  </motion.span>
                )}
              </AnimatePresence>
            </div>

            <AnimatePresence mode="wait">
              {!isAdminOtpVerified && !showAdminOtpInput && (
                <motion.button 
                  key="send-btn" 
                  initial={{ opacity: 0, scale: 0.9 }} 
                  animate={{ opacity: 1, scale: 1 }} 
                  exit={{ opacity: 0, scale: 0.9 }} 
                  transition={{ duration: 0.2 }} 
                  type="button" 
                  onClick={() => handleSendOtp("admin", formData.adminEmail)} 
                  className={`${btnBaseClass} bg-purple-600 hover:bg-purple-700 flex-shrink-0`}
                >
                  Send OTP
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          <AnimatePresence>
            {showAdminOtpInput && !isAdminOtpVerified && (
              <motion.div variants={expandVariant} initial="hidden" animate="visible" exit="exit" className="flex gap-2 w-full mt-2">
                <input name="adminOtp" type="text" value={adminOtp} onChange={(e) => setAdminOtp(e.target.value)} placeholder="Enter OTP" className={getOtpInputClass(adminOtpStatus)} required />
                <button type="button" onClick={() => handleVerifyOtp("admin", adminOtp)} className={`${btnBaseClass} bg-teal-500 hover:bg-teal-600 flex-shrink-0`}>Verify</button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
        
        <motion.input layout name="adminPhone" type="text" value={formData.adminPhone} placeholder="Admin Phone No." onChange={handleChange} className={baseInputClass} />
        <motion.input layout name="alternateContact" type="text" value={formData.alternateContact} placeholder="Alternate Contact (Optional)" onChange={handleChange} className={baseInputClass} />
        
        <SectionHeader title="Account Credentials" />
        
        {/* Passwords */}
        <motion.div layout className="relative shadow-sm rounded-xl">
          <input name="password" type={showPassword ? "text" : "password"} value={formData.password} placeholder="Create Password" onChange={handleChange} autoComplete="new-password" className={`${baseInputClass} pr-10`} required />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 cursor-pointer hover:bg-gray-200 rounded-full transition-colors" onClick={() => setShowPassword(!showPassword)}>
            <img src={showPassword ? HiddenIcon : EyeIcon} alt="toggle" className="w-5 h-5 md:w-4 md:h-4 opacity-60" />
          </div>
        </motion.div>
        <motion.div layout className="relative shadow-sm rounded-xl">
          <input name="confirmPassword" type={showPassword ? "text" : "password"} value={formData.confirmPassword} placeholder="Confirm Password" onChange={handleChange} autoComplete="new-password" className={`${baseInputClass} pr-10`} required />
        </motion.div>
        
        {/* Captcha */}
        <motion.div layout className="bg-gradient-to-br from-purple-50 to-indigo-50/50 p-3.5 md:p-2.5 rounded-xl border border-purple-100 shadow-sm w-full">
          <label className="block text-sm md:text-xs font-medium text-gray-700 mb-2 md:mb-1.5 ml-1">
            Security Check: Solve <span className="font-bold text-lg md:text-base text-purple-700 ml-1 drop-shadow-sm">{mathQuestion.question}</span>
          </label>
          <div className="flex gap-2">
            <input name="captcha" value={formData.captcha} placeholder="Enter answer" onChange={handleChange} className="flex-1 px-3 py-2 md:py-1.5 bg-white border border-purple-200 rounded-lg focus:ring-2 focus:ring-inset focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-gray-800 font-medium shadow-inner text-sm" required />
            <motion.button whileTap={{ rotate: 180 }} transition={{ duration: 0.3 }} type="button" onClick={generateNewCaptcha} className="px-4 md:px-3 bg-white border border-indigo-200 text-indigo-600 rounded-lg hover:bg-indigo-50 hover:border-indigo-300 transition-colors shadow-sm font-bold text-lg md:text-base flex items-center justify-center flex-shrink-0">↻</motion.button>
          </div>
        </motion.div>

        <motion.button layout type="submit" className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-[15px] md:text-sm py-3 md:py-2 rounded-xl shadow-md hover:shadow-lg hover:from-purple-700 hover:to-indigo-700 active:scale-[0.98] transition-all mt-2">
          REGISTER INSTITUTE
        </motion.button>
      </motion.div>
    );
  }

  // --- GENERAL USERS RENDER ---
  return (
    <motion.div layout className="flex flex-col gap-4 md:gap-3 w-full mt-2 md:mt-0">
      {userType === "Student" && (
        <>
          <motion.input layout name="name" type="text" value={formData.name} placeholder="Student Full Name" onChange={handleChange} className={baseInputClass} required />
          <motion.input layout name="registrationNo" type="text" value={formData.registrationNo} placeholder="Registration (e.g., 220536...)" onChange={handleChange} className={baseInputClass} required />
          <motion.div layout>{renderSearchBox()}</motion.div>
          
          {/* 🟢 FIXED: Removed flex-col so they stay side-by-side on mobile too */}
          <motion.div layout className="flex gap-3">
            <div className="flex-1">
              <select name="batch" value={formData.batch || ""} onChange={handleChange} className={baseInputClass} required>
                <option value="" disabled>Select Batch</option>
                <option value="2026-2030">2026-2030</option>
                <option value="2025-2029">2025-2029</option>
                <option value="2024-2028">2024-2028</option>
                <option value="2023-2027">2023-2027</option>
                <option value="2022-2026">2022-2026</option>
                <option value="2021-2025">2021-2025</option>
              </select>
            </div>
            
            <div className="flex-1 relative">
              <select name="branch" value={formData.branch || ""} onChange={handleChange} className={`${baseInputClass} ${fetchingBranches ? 'opacity-50' : ''}`} required disabled={fetchingBranches || availableBranches.length === 0}>
                <option value="" disabled>{availableBranches.length > 0 ? "Select Branch" : "No branches found"}</option>
                {availableBranches.map(dept => <option key={dept._id} value={dept.abbreviation}>{dept.name} ({dept.abbreviation})</option>)}
              </select>
            </div>
          </motion.div>
        </>
      )}

      {userType === "Teacher" && (
        <>
          <motion.input layout name="name" type="text" value={formData.name} placeholder="Teacher Name" onChange={handleChange} className={baseInputClass} required />
          <motion.input layout name="registrationNo" type="text" value={formData.registrationNo} placeholder="Teacher ID" onChange={handleChange} className={baseInputClass} required />
          <motion.div layout>{renderSearchBox()}</motion.div>
          <motion.select layout name="branch" value={formData.branch || ""} onChange={handleChange} className={`${baseInputClass} ${fetchingBranches ? 'opacity-50' : ''}`} required disabled={fetchingBranches || availableBranches.length === 0}>
            <option value="" disabled>{availableBranches.length > 0 ? "Select Branch" : "No branches found"}</option>
            {availableBranches.map(dept => <option key={dept._id} value={dept.abbreviation}>{dept.name} ({dept.abbreviation})</option>)}
          </motion.select>
        </>
      )}

      {userType === "Official" && (
        <>
          <motion.input layout name="name" type="text" value={formData.name} placeholder="Full Name" onChange={handleChange} className={baseInputClass} required />
          <motion.input layout name="registrationNo" type="text" value={formData.registrationNo} placeholder="Employee / Staff ID" onChange={handleChange} className={baseInputClass} required />
          <motion.div layout>{renderSearchBox()}</motion.div>
          <motion.select layout name="designation" value={formData.designation} onChange={handleChange} className={baseInputClass} required>
            <option value="">Select Designation</option>
            <option value="Director">Director</option>
            <option value="Dean">Dean</option>
            <option value="HOD">HOD</option>
            <option value="Registrar">Registrar</option>
            <option value="Faculty Member">Faculty Member</option>
          </motion.select>
        </>
      )}

      {userType === "Other" && (
        <>
          <motion.input layout name="name" type="text" value={formData.name} placeholder="Full Name" onChange={handleChange} className={baseInputClass} required />
          <motion.input layout name="registrationNo" type="text" value={formData.registrationNo} placeholder="Staff ID" onChange={handleChange} className={baseInputClass} required />
          <motion.div layout>{renderSearchBox()}</motion.div>
          <motion.select layout name="designation" value={formData.designation} onChange={handleChange} className={baseInputClass} required>
            <option value="">Select Staff Role</option>
            <option value="Librarian">Librarian</option>
            <option value="Accountant">Accountant</option>
            <option value="System Admin">IT / System Admin</option>
            <option value="Lab Assistant">Lab Assistant</option>
            <option value="Clerk">Clerk</option>
            <option value="Support Staff">Support Staff</option>
          </motion.select>
        </>
      )}

      {/* Standard User OTP Section - UPDATED FOR MOBILE LAYOUT */}
      <motion.div layout>
        <div className="flex gap-2">
          
          <div className="relative flex-1">
            <input 
              name="email" 
              type="email" 
              value={formData.email} 
              placeholder="Enter Email" 
              onChange={handleChange} 
              className={`${baseInputClass} w-full ${isOtpVerified ? 'pr-20' : ''}`} 
              required 
              disabled={isOtpVerified || showOtpInput} 
            />
            
            <AnimatePresence>
              {isOtpVerified && (
                <motion.span 
                  key="verified-badge" 
                  initial={{ opacity: 0, scale: 0.5 }} 
                  animate={{ opacity: 1, scale: 1 }} 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600 text-sm font-bold bg-gray-50 px-1"
                >
                  ✓ Verified
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          <AnimatePresence mode="wait">
            {!isOtpVerified && !showOtpInput && (
              <motion.button 
                key="send-btn" 
                initial={{ opacity: 0, scale: 0.9 }} 
                animate={{ opacity: 1, scale: 1 }} 
                exit={{ opacity: 0, scale: 0.9 }} 
                transition={{ duration: 0.2 }} 
                type="button" 
                onClick={() => handleSendOtp("user", formData.email)} 
                className={`${btnBaseClass} bg-purple-600 hover:bg-purple-700 flex-shrink-0`}
              >
                Send OTP
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {showOtpInput && !isOtpVerified && (
            <motion.div variants={expandVariant} initial="hidden" animate="visible" exit="exit" className="flex gap-2 w-full mt-2">
              <input 
                name="otp" 
                type="text" 
                value={otp} 
                onChange={(e) => setOtp(e.target.value)} 
                placeholder="Enter OTP" 
                className={getOtpInputClass(otpStatus)} 
                required 
              />
              <button 
                type="button" 
                onClick={() => handleVerifyOtp("user", otp)} 
                className={`${btnBaseClass} bg-teal-500 hover:bg-teal-600 flex-shrink-0`}
              >
                Verify
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Passwords */}
      <motion.div layout className="relative shadow-sm rounded-xl">
        <input name="password" type={showPassword ? "text" : "password"} value={formData.password} placeholder="Create Password" onChange={handleChange} autoComplete="new-password" className={`${baseInputClass} pr-10`} required />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 cursor-pointer hover:bg-gray-200 rounded-full transition-colors" onClick={() => setShowPassword(!showPassword)}>
          <img src={showPassword ? HiddenIcon : EyeIcon} alt="toggle" className="w-5 h-5 md:w-4 md:h-4 opacity-60" />
        </div>
      </motion.div>
      <motion.div layout className="relative shadow-sm rounded-xl">
        <input name="confirmPassword" type={showPassword ? "text" : "password"} value={formData.confirmPassword} placeholder="Confirm Password" onChange={handleChange} autoComplete="new-password" className={`${baseInputClass} pr-10`} required />
      </motion.div>
      
      {/* Captcha */}
      <motion.div layout className="bg-gradient-to-br from-purple-50 to-indigo-50/50 p-3.5 md:p-2.5 rounded-xl border border-purple-100 shadow-sm w-full">
        <label className="block text-sm md:text-xs font-medium text-gray-700 mb-2 md:mb-1.5 ml-1">
          Security Check: Solve <span className="font-bold text-lg md:text-base text-purple-700 ml-1 drop-shadow-sm">{mathQuestion.question}</span>
        </label>
        <div className="flex gap-2">
          <input name="captcha" value={formData.captcha} placeholder="Enter answer" onChange={handleChange} className="flex-1 px-3 py-2 md:py-1.5 bg-white border border-purple-200 rounded-lg focus:ring-2 focus:ring-inset focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-gray-800 font-medium shadow-inner text-sm" required />
          <motion.button whileTap={{ rotate: 180 }} transition={{ duration: 0.3 }} type="button" onClick={generateNewCaptcha} className="px-4 md:px-3 bg-white border border-indigo-200 text-indigo-600 rounded-lg hover:bg-indigo-50 hover:border-indigo-300 transition-colors shadow-sm font-bold text-lg md:text-base flex items-center justify-center flex-shrink-0">↻</motion.button>
        </div>
      </motion.div>

      <motion.button layout type="submit" className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-[15px] md:text-sm py-3 md:py-2 rounded-xl shadow-md hover:shadow-lg hover:from-purple-700 hover:to-indigo-700 active:scale-[0.98] transition-all mt-2">
        REGISTER
      </motion.button>
    </motion.div>
  );
}