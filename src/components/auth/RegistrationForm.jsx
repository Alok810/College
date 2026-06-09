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
  const otpInputClasses = `w-1/4 px-4 py-2 border rounded-lg transition-colors duration-300 ${otpStatus === "success" ? "border-green-500 ring-2 ring-green-200" : otpStatus === "error" ? "border-red-500 ring-2 ring-red-200" : ""}`;
  const instituteOtpInputClasses = `w-1/4 px-4 py-2 border rounded-lg transition-colors duration-300 ${instituteOtpStatus === "success" ? "border-green-500 ring-2 ring-green-200" : instituteOtpStatus === "error" ? "border-red-500 ring-2 ring-red-200" : ""}`;
  const adminOtpInputClasses = `w-1/4 px-4 py-2 border rounded-lg transition-colors duration-300 ${adminOtpStatus === "success" ? "border-green-500 ring-2 ring-green-200" : adminOtpStatus === "error" ? "border-red-500 ring-2 ring-red-200" : ""}`;

  if (userType === "Institute") {
    return (
      <>
        <h2 className="text-lg font-semibold text-gray-700">Institute Details</h2>
        {renderSearchBox()}
        <input name="instituteName" type="text" value={formData.instituteName} placeholder="Institute Name" onChange={handleChange} className="w-full px-4 py-2 border rounded-lg bg-white" required />
        <select name="instituteType" value={formData.instituteType} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg bg-white" required>
          <option value="" disabled>Select Type</option>
          <option value="University">University</option>
          <option value="College">College</option>
          <option value="Standalone">Standalone</option>
          <option value="Other">Other</option>
        </select>
        <div>
          {showInstituteOtpInput && !isInstituteOtpVerified ? (
            <div className="flex items-center gap-2">
              <input name="instituteEmail" type="email" value={formData.instituteEmail} placeholder="Institute Email" onChange={handleChange} className="w-3/4 px-4 py-2 border rounded-lg" required disabled />
              <input name="instituteOtp" type="text" value={instituteOtp} onChange={(e) => setInstituteOtp(e.target.value)} placeholder="OTP" className={instituteOtpInputClasses} required />
              <button type="button" onClick={() => handleVerifyOtp("institute", instituteOtp)} className="w-1/4 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 text-sm">Verify</button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <input name="instituteEmail" type="email" value={formData.instituteEmail} placeholder="Institute Email" onChange={handleChange} className="w-3/4 px-4 py-2 border rounded-lg" required disabled={isInstituteOtpVerified} />
              {!isInstituteOtpVerified && <button type="button" onClick={() => handleSendOtp("institute", formData.instituteEmail)} className="w-1/4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm">Send OTP</button>}
              {isInstituteOtpVerified && <span className="text-green-600 font-bold ml-2">✓ Verified</span>}
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
        <hr className="my-2 border-t border-gray-200" />
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
        <input name="registrationNo" type="text" value={formData.registrationNo} placeholder="Admin ID" onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" required />
        <div>
          {showAdminOtpInput && !isAdminOtpVerified ? (
            <div className="flex items-center gap-2">
              <input name="adminEmail" type="email" value={formData.adminEmail} placeholder="Admin Email" onChange={handleChange} className="w-3/4 px-4 py-2 border rounded-lg" required disabled />
              <input name="adminOtp" type="text" value={adminOtp} onChange={(e) => setAdminOtp(e.target.value)} placeholder="OTP" className={adminOtpInputClasses} required />
              <button type="button" onClick={() => handleVerifyOtp("admin", adminOtp)} className="w-1/4 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 text-sm">Verify</button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <input name="adminEmail" type="email" value={formData.adminEmail} placeholder="Admin Email" onChange={handleChange} className="w-3/4 px-4 py-2 border rounded-lg" required disabled={isAdminOtpVerified} />
              {!isAdminOtpVerified && <button type="button" onClick={() => handleSendOtp("admin", formData.adminEmail)} className="w-1/4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm">Send OTP</button>}
              {isAdminOtpVerified && <span className="text-green-600 font-bold ml-2">✓ Verified</span>}
            </div>
          )}
        </div>
        <input name="adminPhone" type="text" value={formData.adminPhone} placeholder="Admin Phone No." onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" />
        <input name="alternateContact" type="text" value={formData.alternateContact} placeholder="Alternate Contact (Optional)" onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" />
        <hr className="my-2 border-t border-gray-200" />
        <h2 className="text-lg font-semibold text-gray-700">Account Credentials</h2>
        <div className="relative">
          <input name="password" type={showPassword ? "text" : "password"} value={formData.password} placeholder="Enter Password" onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" required />
          <img src={showPassword ? HiddenIcon : EyeIcon} alt="toggle" onClick={() => setShowPassword(!showPassword)} className="w-5 h-5 absolute right-3 top-2.5 cursor-pointer" />
        </div>
        <input name="confirmPassword" type={showPassword ? "text" : "password"} value={formData.confirmPassword} placeholder="Confirm Password" onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" required />
        <div>
          <label className="block text-sm text-gray-600 mb-1">Solve: <span className="font-bold">{mathQuestion.question}</span></label>
          <div className="flex gap-2">
            <input name="captcha" value={formData.captcha} placeholder="Enter Captcha" onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" required />
            <button type="button" onClick={generateNewCaptcha} className="px-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600">↻</button>
          </div>
        </div>
        <button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-teal-600 text-white py-2 rounded-lg shadow-md hover:opacity-90">REGISTER</button>
      </>
    );
  }

  return (
    <>
      {userType === "Student" && (
        <>
          <input name="name" type="text" value={formData.name} placeholder="Student Full Name" onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" required />
          <input name="registrationNo" type="text" value={formData.registrationNo} placeholder="Registration:22053600000." onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" required />
          {renderSearchBox()}
          <div className="flex gap-2">
            <select name="batch" value={formData.batch || ""} onChange={handleChange} className="flex-1 px-4 py-2 border rounded-lg bg-white" required>
              <option value="" disabled>Select Batch</option>
              <option value="2026-2030">2026-2030</option>
              <option value="2025-2029">2025-2029</option>
              <option value="2024-2028">2024-2028</option>
              <option value="2023-2027">2023-2027</option>
              <option value="2022-2026">2022-2026</option>
              <option value="2021-2025">2021-2025</option>
            </select>
            <div className="flex-1 relative">
              <select name="branch" value={formData.branch || ""} onChange={handleChange} className={`w-full px-4 py-2 border rounded-lg bg-white ${fetchingBranches ? 'opacity-50' : ''}`} required disabled={fetchingBranches || availableBranches.length === 0}>
                <option value="" disabled>{availableBranches.length > 0 ? "Select Branch" : "No branches found for this ID."}</option>
                {availableBranches.map(dept => <option key={dept._id} value={dept.abbreviation}>{dept.name} ({dept.abbreviation})</option>)}
              </select>
            </div>
          </div>
        </>
      )}

      {userType === "Teacher" && (
        <>
          <input name="name" type="text" value={formData.name} placeholder="Teacher Name" onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" required />
          <input name="registrationNo" type="text" value={formData.registrationNo} placeholder="Teacher ID" onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" required />
          {renderSearchBox()}
          <div className="relative w-full">
            <select name="branch" value={formData.branch || ""} onChange={handleChange} className={`w-full px-4 py-2 border rounded-lg bg-white ${fetchingBranches ? 'opacity-50' : ''}`} required disabled={fetchingBranches || availableBranches.length === 0}>
              <option value="" disabled>{availableBranches.length > 0 ? "Select Branch" : "No branches found for this ID."}</option>
              {availableBranches.map(dept => <option key={dept._id} value={dept.abbreviation}>{dept.name} ({dept.abbreviation})</option>)}
            </select>
          </div>
        </>
      )}

      {userType === "Official" && (
        <>
          <input name="name" type="text" value={formData.name} placeholder="Full Name" onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" required />
          <input name="registrationNo" type="text" value={formData.registrationNo} placeholder="Employee / Staff ID" onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" required />
          {renderSearchBox()}
          <select name="designation" value={formData.designation} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" required>
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
          <input name="name" type="text" value={formData.name} placeholder="Full Name" onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" required />
          <input name="registrationNo" type="text" value={formData.registrationNo} placeholder="Staff ID" onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" required />
          {renderSearchBox()}
          <select name="designation" value={formData.designation} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg bg-white" required>
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

      <div>
        {showOtpInput && !isOtpVerified ? (
          <div className="flex items-center gap-2">
            <input name="email" type="email" value={formData.email} placeholder="Enter Email" onChange={handleChange} className="w-3/4 px-4 py-2 border rounded-lg" required disabled />
            <input name="otp" type="text" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="OTP" className={otpInputClasses} required />
            <button type="button" onClick={() => handleVerifyOtp("user", otp)} className="w-1/4 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 text-sm">Verify</button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <input name="email" type="email" value={formData.email} placeholder="Enter Email" onChange={handleChange} className="w-3/4 px-4 py-2 border rounded-lg" required disabled={isOtpVerified} />
            {!isOtpVerified && <button type="button" onClick={() => handleSendOtp("user", formData.email)} className="w-1/4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm">Send OTP</button>}
            {isOtpVerified && <span className="text-green-600 font-bold ml-2">✓ Verified</span>}
          </div>
        )}
      </div>

      <div className="relative">
        <input name="password" type={showPassword ? "text" : "password"} value={formData.password} placeholder="Enter Password" onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" required />
        <img src={showPassword ? HiddenIcon : EyeIcon} alt="toggle" onClick={() => setShowPassword(!showPassword)} className="w-5 h-5 absolute right-3 top-2.5 cursor-pointer" />
      </div>
      <input name="confirmPassword" type={showPassword ? "text" : "password"} value={formData.confirmPassword} placeholder="Confirm Password" onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" required />
      
      <div>
        <label className="block text-sm text-gray-600 mb-1">Solve: <span className="font-bold">{mathQuestion.question}</span></label>
        <div className="flex gap-2">
          <input name="captcha" value={formData.captcha} placeholder="Enter Captcha" onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" required />
          <button type="button" onClick={generateNewCaptcha} className="px-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600">↻</button>
        </div>
      </div>
      <button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-teal-600 text-white py-2 rounded-lg shadow-md hover:opacity-90">REGISTER</button>
    </>
  );
}