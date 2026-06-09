import React from "react";
import { Loader2, Search, Info } from "lucide-react";

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
  return (
    <div className="relative w-full" ref={instDropdownRef}>
      <div className="relative flex items-center">
        <input
          type="text"
          placeholder="Search Institute Name or AISHE ID..."
          className="w-full px-4 py-2 border rounded-lg pr-16 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
          value={instSearchQuery}
          onChange={(e) => {
            setInstSearchQuery(e.target.value);
            setFormData(prev => ({ ...prev, instituteRegistrationNumber: e.target.value }));
            setShowInstDropdown(true);
          }}
          onFocus={() => { if (instSearchQuery.length > 2) setShowInstDropdown(true); }}
          required
        />
        {isInstSearching ? (
          <Loader2 size={16} className="absolute right-9 text-purple-400 animate-spin" />
        ) : (
          <Search size={16} className="absolute right-9 text-gray-400" />
        )}
        <button
          type="button"
          title="Can't find your Institute? Click to search the registry."
          onClick={() => navigate('/helpdesk')}
          className="absolute right-2 p-1 text-teal-600 hover:text-teal-800 hover:bg-teal-50 rounded-full transition-all"
        >
          <Info size={20} />
        </button>
      </div>

      {showInstDropdown && instSearchResults.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 shadow-2xl rounded-lg max-h-56 overflow-y-auto custom-scrollbar flex flex-col py-1">
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
              className="w-full text-left px-4 py-2.5 hover:bg-purple-50 border-b border-gray-50 last:border-0 transition-colors flex flex-col gap-1"
            >
              <span className="font-bold text-gray-800 text-[11px] leading-tight">{inst.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-bold bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded uppercase">{inst.aisheCode}</span>
                <span className="text-[9px] font-medium text-gray-500">{inst.district}, {inst.state}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}