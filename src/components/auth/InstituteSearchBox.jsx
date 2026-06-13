import React from "react";
import { Loader2, Search, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function InstituteSearchBox({
  instSearchQuery,
  setInstSearchQuery,
  setFormData,
  setShowInstDropdown,
  showInstDropdown,
  instSearchResults,
  isInstSearching,
  userType,
  instDropdownRef,
  navigate
}) {
  // Matching the exact input styling from the Registration/Login forms
  const searchInputClass = "w-full px-3 py-3 md:py-2 bg-gray-50/50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-inset focus:ring-purple-500 focus:border-purple-500 transition-all outline-none text-gray-800 shadow-sm text-sm sm:text-base md:text-sm pr-16";

  return (
    <div className="relative w-full" ref={instDropdownRef}>
      <div className="relative flex items-center shadow-sm rounded-xl">
        <input
          type="text"
          placeholder="AISHE ID: U-1339, Search by Institute Name"
          className={searchInputClass}
          value={instSearchQuery}
          onChange={(e) => {
            setInstSearchQuery(e.target.value);
            setFormData(prev => ({ ...prev, instituteRegistrationNumber: e.target.value }));
            setShowInstDropdown(true);
          }}
          onFocus={() => { if (instSearchQuery.length > 2) setShowInstDropdown(true); }}
          required
        />
        
        {/* Dynamic Search / Loader Icon */}
        {isInstSearching ? (
          <Loader2 size={18} className="absolute right-10 text-purple-500 animate-spin" />
        ) : (
          <Search size={18} className="absolute right-10 text-gray-400" />
        )}
        
        {/* Info Helper Button */}
        <button
          type="button"
          title="Can't find your Institute? Click to search the registry."
          onClick={() => navigate('/helpdesk')}
          className="absolute right-2 p-1.5 text-teal-600 hover:text-teal-800 hover:bg-teal-50 rounded-full transition-colors"
        >
          <Info size={18} />
        </button>
      </div>

      {/* Animated Dropdown Menu */}
      <AnimatePresence>
        {showInstDropdown && instSearchResults.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute z-50 w-full mt-2 bg-white border border-purple-100 shadow-xl rounded-xl max-h-60 overflow-y-auto custom-scrollbar flex flex-col py-1.5"
          >
            {instSearchResults.map((inst, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setFormData(prev => ({
                    ...prev,
                    instituteRegistrationNumber: inst.aisheCode,
                    ...(userType === 'Institute' ? {
                      instituteName: inst.name,
                      instituteType: inst.instituteType
                    } : {})
                  }));
                  setInstSearchQuery(inst.aisheCode);
                  setShowInstDropdown(false);
                  sessionStorage.setItem("validAisheCode", inst.aisheCode);
                }}
                className="w-full text-left px-4 py-3 hover:bg-purple-50 border-b border-gray-50 last:border-0 transition-colors flex flex-col gap-1.5 focus:bg-purple-50 focus:outline-none"
              >
                <span className="font-bold text-gray-800 text-[12px] md:text-[13px] leading-tight">
                  {inst.name}
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] font-bold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-md uppercase tracking-wide">
                    {inst.aisheCode}
                  </span>
                  <span className="text-[10px] md:text-[11px] font-medium text-gray-500 truncate">
                    {inst.district}, {inst.state}
                  </span>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}