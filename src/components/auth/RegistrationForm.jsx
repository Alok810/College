import React from "react";
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
  // 🟢 MOBILE FIX: Increased padding slightly for touch targets, made widths fluid
  const otpInputClasses = `flex-1 px-4 py-3 sm:py-2 border rounded-lg transition-colors duration-300 ${otpStatus === "success" ? "border-green-500 ring-2 ring-green-200" : otpStatus === "error" ? "border-red-500 ring-2 ring-red-200" : ""}`;
  const instituteOtpInputClasses = `flex-1 px-4 py-3 sm:py-2 border rounded-lg transition-colors duration-300 ${instituteOtpStatus === "success" ? "border-green-500 ring-2 ring-green-200" : instituteOtpStatus === "error" ? "border-red-500 ring-2 ring-red-200" : ""}`;
  const adminOtpInputClasses = `flex-1 px-4 py-3 sm:py-2 border rounded-lg transition-colors duration-300 ${adminOtpStatus === "success" ? "border-green-500 ring-2 ring-green-200" : adminOtpStatus === "error" ? "border-red-500 ring-2 ring-red-200" : ""}`;
  const inputClass = "w-full px-4 py-3 sm:py-2 border rounded-lg bg-white";

  if (userType === "Institute") {
    return (
      <div className="space-y-4">
        <h2 className="text-base sm:text-lg font-semibold text-gray-700">Institute Details</h2>
        {renderSearchBox()}
        <input name="instituteName" type="text" value={formData.instituteName} placeholder="Institute Name" onChange={handleChange} className={inputClass} required />
        <select name="instituteType" value={formData.instituteType} onChange={handleChange} className={inputClass} required>
          <option value="" disabled>Select Type</option>
          <option value="University">University</option>
          <option value="College">College</option>
          <option value="Standalone">Standalone</option>
          <option value="Other">Other</option>
        </select>
        
        {/* 🟢 MOBILE FIX: Stacking OTP fields on small screens */}
        <div>
          {showInstituteOtpInput && !isInstituteOtpVerified ? (
            <div className="flex flex-col sm:flex-row gap-2">
              <input name="instituteEmail" type="email" value={formData.instituteEmail} placeholder="Institute Email" onChange={handleChange} className={inputClass} required disabled />
              <div className="flex gap-2 w-full sm:w-auto">
                <input name="instituteOtp" type="text" value={instituteOtp} onChange={(e) => setInstituteOtp(e.target.value)} placeholder="OTP" className={instituteOtpInputClasses} required />
                <button type="button" onClick={() => handleVerifyOtp("institute", instituteOtp)} className="px-6 py-3 sm:py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 text-sm whitespace-nowrap">Verify</button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-2">
              <input name="instituteEmail" type="email" value={formData.instituteEmail} placeholder="Institute Email" onChange={handleChange} className={inputClass} required disabled={isInstituteOtpVerified} />
              {!isInstituteOtpVerified && <button type="button" onClick={() => handleSendOtp("institute", formData.instituteEmail)} className="w-full sm:w-auto px-6 py-3 sm:py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm whitespace-nowrap">Send OTP</button>}
              {isInstituteOtpVerified && <span className="text-green-600 font-bold ml-2 self-center">✓ Verified</span>}
            </div>
          )}
        </div>

        <div className="border border-gray-300 rounded-lg p-3 bg-gray-50">
          <label className="block text-sm font-medium text-gray-700 mb-2">Upload Logo</label>
          <input type="file" accept="image/*" onChange={handleLogoUpload} className="block w-full text-sm text-gray-700 border rounded-lg cursor-pointer file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-purple-600 file:text-white hover:file:bg-purple-700" required />
          {formData.logo && (
            <div className="mt-3 flex justify-center">
              <img src={URL.createObjectURL(formData.logo)} alt="Logo Preview" className="w-24 h-24 object-contain border rounded-md shadow-sm bg-white" />
            </div>
          )}
        </div>

        <hr className="my-4 border-t border-gray-200" />
        <h2 className="text-base sm:text-lg font-semibold text-gray-700">Admin Details</h2>
        <input name="name" type="text" value={formData.name} placeholder="Admin Full Name" onChange={handleChange} className={inputClass} required />
        <select name="designation" value={formData.designation} onChange={handleChange} className={inputClass} required>
          <option value="">Select Role</option>
          <option value="Director">Director</option>
          <option value="Dean">Dean</option>
          <option value="Professor">Professor</option>
          <option value="Head Master">Head Master</option>
          <option value="Teacher">Teacher</option>
        </select>
        <input name="registrationNo" type="text" value={formData.registrationNo} placeholder="Admin ID" onChange={handleChange} className={inputClass} required />
        
        <div>
          {showAdminOtpInput && !isAdminOtpVerified ? (
            <div className="flex flex-col sm:flex-row gap-2">
              <input name="adminEmail" type="email" value={formData.adminEmail} placeholder="Admin Email" onChange={handleChange} className={inputClass} required disabled />
              <div className="flex gap-2 w-full sm:w-auto">
                <input name="adminOtp" type="text" value={adminOtp} onChange={(e) => setAdminOtp(e.target.value)} placeholder="OTP" className={adminOtpInputClasses} required />
                <button type="button" onClick={() => handleVerifyOtp("admin", adminOtp)} className="px-6 py-3 sm:py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 text-sm whitespace-nowrap">Verify</button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-2">
              <input name="adminEmail" type="email" value={formData.adminEmail} placeholder="Admin Email" onChange={handleChange} className={inputClass} required disabled={isAdminOtpVerified} />
              {!isAdminOtpVerified && <button type="button" onClick={() => handleSendOtp("admin", formData.adminEmail)} className="w-full sm:w-auto px-6 py-3 sm:py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm whitespace-nowrap">Send OTP</button>}
              {isAdminOtpVerified && <span className="text-green-600 font-bold ml-2 self-center">✓ Verified</span>}
            </div>
          )}
        </div>
        
        <input name="adminPhone" type="text" value={formData.adminPhone} placeholder="Admin Phone No." onChange={handleChange} className={inputClass} />
        <input name="alternateContact" type="text" value={formData.alternateContact} placeholder="Alternate Contact (Optional)" onChange={handleChange} className={inputClass} />
        
        <hr className="my-4 border-t border-gray-200" />
        <h2 className="text-base sm:text-lg font-semibold text-gray-700">Account Credentials</h2>
        
        <div className="relative">
          <input 
            name="password" 
            type={showPassword ? "text" : "password"} 
            value={formData.password} 
            placeholder="Enter Password" 
            onChange={handleChange} 
            autoComplete="new-password" // 🟢 ADDED THIS
            className={inputClass} 
            required 
          />
          <img src={showPassword ? HiddenIcon : EyeIcon} alt="toggle" onClick={() => setShowPassword(!showPassword)} className="w-6 h-6 sm:w-5 sm:h-5 absolute right-3 top-3.5 sm:top-2.5 cursor-pointer opacity-70" />
        </div>
        <input 
          name="confirmPassword" 
          type={showPassword ? "text" : "password"} 
          value={formData.confirmPassword} 
          placeholder="Confirm Password" 
          onChange={handleChange} 
          autoComplete="new-password" // 🟢 ADDED THIS
          className={inputClass} 
          required 
        />
        
        <div>
          <label className="block text-sm text-gray-600 mb-1 ml-1">Solve: <span className="font-bold text-purple-700">{mathQuestion.question}</span></label>
          <div className="flex gap-2">
            <input name="captcha" value={formData.captcha} placeholder="Enter Captcha" onChange={handleChange} className={inputClass} required />
            <button type="button" onClick={generateNewCaptcha} className="px-5 sm:px-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 text-lg">↻</button>
          </div>
        </div>
        <button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-teal-600 text-white font-bold py-3 sm:py-2 rounded-lg shadow-md hover:opacity-90 mt-2">REGISTER</button>
      </div>
    );
  }

  return (
    <div className="space-y-4 mt-2">
      {userType === "Student" && (
        <>
          <input name="name" type="text" value={formData.name} placeholder="Student Full Name" onChange={handleChange} className={inputClass} required />
          <input name="registrationNo" type="text" value={formData.registrationNo} placeholder="Registration (e.g., 220536...)" onChange={handleChange} className={inputClass} required />
          {renderSearchBox()}
          
          {/* 🟢 MOBILE FIX: Stacking Batch and Branch on mobile, side-by-side on tablet/desktop */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-2">
            <select name="batch" value={formData.batch || ""} onChange={handleChange} className={`w-full sm:flex-1 px-4 py-3 sm:py-2 border rounded-lg bg-white`} required>
              <option value="" disabled>Select Batch</option>
              <option value="2026-2030">2026-2030</option>
              <option value="2025-2029">2025-2029</option>
              <option value="2024-2028">2024-2028</option>
              <option value="2023-2027">2023-2027</option>
              <option value="2022-2026">2022-2026</option>
              <option value="2021-2025">2021-2025</option>
            </select>
            <div className="w-full sm:flex-1 relative">
              <select name="branch" value={formData.branch || ""} onChange={handleChange} className={`w-full px-4 py-3 sm:py-2 border rounded-lg bg-white ${fetchingBranches ? 'opacity-50' : ''}`} required disabled={fetchingBranches || availableBranches.length === 0}>
                <option value="" disabled>{availableBranches.length > 0 ? "Select Branch" : "No branches found."}</option>
                {availableBranches.map(dept => <option key={dept._id} value={dept.abbreviation}>{dept.name} ({dept.abbreviation})</option>)}
              </select>
            </div>
          </div>
        </>
      )}

      {userType === "Teacher" && (
        <>
          <input name="name" type="text" value={formData.name} placeholder="Teacher Name" onChange={handleChange} className={inputClass} required />
          <input name="registrationNo" type="text" value={formData.registrationNo} placeholder="Teacher ID" onChange={handleChange} className={inputClass} required />
          {renderSearchBox()}
          <div className="relative w-full">
            <select name="branch" value={formData.branch || ""} onChange={handleChange} className={`w-full px-4 py-3 sm:py-2 border rounded-lg bg-white ${fetchingBranches ? 'opacity-50' : ''}`} required disabled={fetchingBranches || availableBranches.length === 0}>
              <option value="" disabled>{availableBranches.length > 0 ? "Select Branch" : "No branches found."}</option>
              {availableBranches.map(dept => <option key={dept._id} value={dept.abbreviation}>{dept.name} ({dept.abbreviation})</option>)}
            </select>
          </div>
        </>
      )}

      {userType === "Official" && (
        <>
          <input name="name" type="text" value={formData.name} placeholder="Full Name" onChange={handleChange} className={inputClass} required />
          <input name="registrationNo" type="text" value={formData.registrationNo} placeholder="Employee / Staff ID" onChange={handleChange} className={inputClass} required />
          {renderSearchBox()}
          <select name="designation" value={formData.designation} onChange={handleChange} className={inputClass} required>
            <option value="">Select Designation</option>
            <option value="Director">Director</option>
            <option value="Dean">Dean</option>
            <option value="HOD">HOD</option>
            <option value="Registrar">Registrar</option>
            <option value="Faculty Member">Faculty Member</option>
          </select>
        </>
      )}

      {userType === "Other" && (
        <>
          <input name="name" type="text" value={formData.name} placeholder="Full Name" onChange={handleChange} className={inputClass} required />
          <input name="registrationNo" type="text" value={formData.registrationNo} placeholder="Staff ID" onChange={handleChange} className={inputClass} required />
          {renderSearchBox()}
          <select name="designation" value={formData.designation} onChange={handleChange} className={inputClass} required>
            <option value="">Select Staff Role</option>
            <option value="Librarian">Librarian</option>
            <option value="Accountant">Accountant</option>
            <option value="System Admin">IT / System Admin</option>
            <option value="Lab Assistant">Lab Assistant</option>
            <option value="Clerk">Clerk</option>
            <option value="Support Staff">Support Staff</option>
          </select>
        </>
      )}

      {/* OTP Section (Student/Teacher/Official/Other) */}
      <div>
        {showOtpInput && !isOtpVerified ? (
          <div className="flex flex-col sm:flex-row gap-2">
            <input name="email" type="email" value={formData.email} placeholder="Enter Email" onChange={handleChange} className={inputClass} required disabled />
            <div className="flex gap-2 w-full sm:w-auto">
              <input name="otp" type="text" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="OTP" className={otpInputClasses} required />
              <button type="button" onClick={() => handleVerifyOtp("user", otp)} className="px-6 py-3 sm:py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 text-sm whitespace-nowrap">Verify</button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-2">
            <input name="email" type="email" value={formData.email} placeholder="Enter Email" onChange={handleChange} className={inputClass} required disabled={isOtpVerified} />
            {!isOtpVerified && <button type="button" onClick={() => handleSendOtp("user", formData.email)} className="w-full sm:w-auto px-6 py-3 sm:py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm whitespace-nowrap">Send OTP</button>}
            {isOtpVerified && <span className="text-green-600 font-bold ml-2 self-center">✓ Verified</span>}
          </div>
        )}
      </div>

      <div className="relative">
        <input 
          name="password" 
          type={showPassword ? "text" : "password"} 
          value={formData.password} 
          placeholder="Enter Password" 
          onChange={handleChange} 
          autoComplete="new-password" // 🟢 ADDED THIS
          className={inputClass} 
          required 
        />
        <img src={showPassword ? HiddenIcon : EyeIcon} alt="toggle" onClick={() => setShowPassword(!showPassword)} className="w-6 h-6 sm:w-5 sm:h-5 absolute right-3 top-3.5 sm:top-2.5 cursor-pointer opacity-70" />
      </div>
      <input 
        name="confirmPassword" 
        type={showPassword ? "text" : "password"} 
        value={formData.confirmPassword} 
        placeholder="Confirm Password" 
        onChange={handleChange} 
        autoComplete="new-password" // 🟢 ADDED THIS
        className={inputClass} 
        required 
      />
      
      <div>
        <label className="block text-sm text-gray-600 mb-1 ml-1">Solve: <span className="font-bold text-purple-700">{mathQuestion.question}</span></label>
        <div className="flex gap-2">
          <input name="captcha" value={formData.captcha} placeholder="Enter Captcha" onChange={handleChange} className={inputClass} required />
          <button type="button" onClick={generateNewCaptcha} className="px-5 sm:px-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 text-lg">↻</button>
        </div>
      </div>
      <button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-teal-600 text-white font-bold py-3 sm:py-2 rounded-lg shadow-md hover:opacity-90 mt-2">REGISTER</button>
    </div>
  );
}