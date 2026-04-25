import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Loader2, ArrowLeft, MapPin, Building, Hash, Copy, Check, Globe, Calendar } from 'lucide-react';
import RigyaIcon from "../assets/rigya.png";
import { searchAisheInstitutes } from '../api.js';

export default function HelpDesk() {
  const navigate = useNavigate(); 
  
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedInstitute, setSelectedInstitute] = useState(null);
  const [copied, setCopied] = useState(false);

  const dropdownRef = useRef(null);

  useEffect(() => {
      const handleClickOutside = (event) => {
          if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
              setShowDropdown(false);
          }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

useEffect(() => {
      const fetchInstitutes = async () => {
          if (searchQuery.trim().length < 3) {
              setSearchResults([]);
              return;
          }

          setIsSearching(true);
          try {
              // 🟢 THE FIX: Using the centralized API call here too!
              const data = await searchAisheInstitutes(searchQuery.trim());
              
              if (data.success) {
                  setSearchResults(data.results);
              }
          } catch (error) {
              console.error("Failed to fetch institutes:", error);
          } finally {
              setIsSearching(false);
          }
      };

      const delayDebounceFn = setTimeout(() => {
          if (!selectedInstitute || searchQuery !== selectedInstitute.name) {
              fetchInstitutes();
          }
      }, 400);

      return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, selectedInstitute]);

  const handleSelectInstitute = (institute) => {
      setSelectedInstitute(institute);
      setSearchQuery(institute.name); 
      setShowDropdown(false);
  };

  const handleCopyCode = () => {
      if (selectedInstitute) {
          navigator.clipboard.writeText(selectedInstitute.aisheCode);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
      }
  };

  // Helper function to safely render website links
  const renderWebsite = (websiteStr) => {
      if (!websiteStr || websiteStr === "-" || websiteStr.trim() === "") {
          return <span className="text-sm font-bold text-gray-400">Not Available</span>;
      }
      const url = websiteStr.startsWith('http') ? websiteStr : `https://${websiteStr}`;
      return (
          <a 
              href={url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-sm font-bold text-indigo-600 hover:text-indigo-800 hover:underline truncate block"
          >
              {websiteStr}
          </a>
      );
  };

  return (
    <div className="fixed inset-0 flex overflow-hidden" style={{ background: "linear-gradient(to bottom, #d6f8df, rgb(227, 224, 250), #88e4f4)", backgroundAttachment: "fixed" }}>
      
      <button 
        onClick={() => navigate('/auth')} 
        className="absolute top-6 left-6 flex items-center gap-2 text-purple-700 font-bold hover:text-purple-900 transition-colors bg-white/60 backdrop-blur-md px-4 py-2 rounded-xl shadow-sm border border-white z-50"
      >
        <ArrowLeft size={18} /> Back to Login
      </button>

      <motion.div className="flex w-full" animate={{ flexDirection: "row" }} transition={{ duration: 0.7, ease: "easeInOut" }}>
        
        <div className="hidden md:flex flex-col justify-center items-center w-1/2 p-10">
          {/* Applied lazy loading to the large image */}
          <img src={RigyaIcon} alt="Rigya Logo" className="w-72 mb-6" loading="lazy" />
          <blockquote className="italic text-center text-lg leading-relaxed max-w-md bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-teal-600">
            “Curiosity is the root of learning, Learning is the path to wisdom, Wisdom is the bridge to innovation, Innovation is the spark of progress, And progress is the soul of Rigya”
          </blockquote>
        </div>

        <div className="flex-1 flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
              className="w-full max-w-md bg-white shadow-2xl rounded-2xl p-8 flex flex-col min-h-[600px] max-h-[700px] overflow-hidden"
            >
              <div className="flex items-center justify-center mb-6 flex-shrink-0">
                {/* Applied lazy loading to the small icon */}
                <img src={RigyaIcon} alt="Rigya Logo" className="w-14 mr-2" loading="lazy" />
                <h1 className="text-2xl font-bold text-purple-700">Institute Search</h1>
              </div>

              <div className="space-y-4 flex flex-col flex-grow overflow-y-auto pr-2 custom-scrollbar">
                  
                  <div className="relative" ref={dropdownRef}>
                      <label className="block text-sm font-medium text-gray-600 mb-2">Find Your Campus</label>
                      <div className="relative flex items-center">
                          <input 
                              type="text" 
                              placeholder="Search by Name or AISHE code..." 
                              className="w-full px-4 py-2 border rounded-lg pr-10 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                              value={searchQuery}
                              onChange={(e) => {
                                  setSearchQuery(e.target.value);
                                  setSelectedInstitute(null); 
                                  setShowDropdown(true);
                                  setCopied(false);
                              }}
                              onFocus={() => { if(searchQuery.length > 2) setShowDropdown(true); }}
                          />
                          {isSearching ? (
                             <Loader2 size={16} className="absolute right-3 text-purple-400 animate-spin" />
                          ) : (
                             <Search size={16} className="absolute right-3 text-gray-400" />
                          )}
                      </div>

                      {showDropdown && searchResults.length > 0 && (
                          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 shadow-2xl rounded-lg max-h-56 overflow-y-auto custom-scrollbar flex flex-col py-1">
                              {searchResults.map((inst, idx) => (
                                  <button 
                                      key={idx}
                                      type="button"
                                      onClick={() => handleSelectInstitute(inst)}
                                      className="w-full text-left px-4 py-2.5 hover:bg-purple-50 border-b border-gray-50 last:border-0 transition-colors flex flex-col gap-1 group"
                                  >
                                      <span className="font-bold text-gray-800 text-[11px] leading-tight group-hover:text-purple-700">{inst.name}</span>
                                      <div className="flex items-center gap-2 flex-wrap">
                                          <span className="text-[9px] font-bold bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded uppercase">{inst.aisheCode}</span>
                                          <span className="text-[9px] font-medium text-gray-500">{inst.district}, {inst.state}</span>
                                      </div>
                                  </button>
                              ))}
                          </div>
                      )}
                      {showDropdown && searchResults.length === 0 && searchQuery.length > 2 && !isSearching && (
                          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 shadow-2xl rounded-lg p-4 text-center">
                              <p className="text-xs font-bold text-gray-500">No institutes found</p>
                          </div>
                      )}
                  </div>

                  {selectedInstitute && (
                      <div className="animate-in fade-in slide-in-from-top-4 duration-500 space-y-4 pt-2 flex-1 flex flex-col">
                          
                          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100/50 rounded-xl p-5 shadow-sm flex-1 flex flex-col justify-center">
                              
                              {/* NAME & TYPE */}
                              <div className="flex items-start gap-3 mb-4 border-b border-indigo-200/50 pb-4">
                                  <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600 mt-1">
                                      <Building size={20} />
                                  </div>
                                  <div>
                                      <h3 className="text-sm font-bold text-slate-800 leading-tight">{selectedInstitute.name}</h3>
                                      <p className="text-[10px] font-bold text-purple-600 mt-1 uppercase tracking-widest">{selectedInstitute.instituteType || "Unknown Type"}</p>
                                  </div>
                              </div>

                              <div className="space-y-4 px-1">
                                  {/* AISHE CODE */}
                                  <div className="flex items-center gap-3">
                                      <Hash className="text-indigo-400" size={16} />
                                      <div>
                                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">AISHE Code</p>
                                          <p className="text-sm font-bold text-slate-700">{selectedInstitute.aisheCode}</p>
                                      </div>
                                  </div>

                                  {/* LOCATION */}
                                  <div className="flex items-center gap-3">
                                      <MapPin className="text-indigo-400" size={16} />
                                      <div>
                                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Location</p>
                                          <p className="text-sm font-bold text-slate-700">{selectedInstitute.district || "Unknown"}, {selectedInstitute.state || "Unknown"}</p>
                                      </div>
                                  </div>

                                  {/* WEBSITE */}
                                  <div className="flex items-center gap-3 w-full overflow-hidden">
                                      <Globe className="text-indigo-400 flex-shrink-0" size={16} />
                                      <div className="min-w-0 flex-1">
                                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Website</p>
                                          {renderWebsite(selectedInstitute.website)}
                                      </div>
                                  </div>

                                  {/* YEAR OF ESTABLISHMENT */}
                                  <div className="flex items-center gap-3">
                                      <Calendar className="text-indigo-400" size={16} />
                                      <div>
                                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Established</p>
                                          <p className="text-sm font-bold text-slate-700">
                                            {(!selectedInstitute.yearOfEstablishment || selectedInstitute.yearOfEstablishment === "-" || selectedInstitute.yearOfEstablishment === "") 
                                              ? <span className="text-gray-400">Not Available</span> 
                                              : selectedInstitute.yearOfEstablishment}
                                          </p>
                                      </div>
                                  </div>
                              </div>
                          </div>

                          <button 
                              onClick={handleCopyCode}
                              className={`w-full py-3 rounded-lg shadow-md flex justify-center items-center gap-2 font-bold transition-all mt-auto ${copied ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : 'bg-gradient-to-r from-purple-600 to-teal-600 hover:opacity-90 text-white'}`}
                          >
                              {copied ? <Check size={18} /> : <Copy size={18} />}
                              {copied ? "Code Copied to Clipboard!" : "Copy AISHE Code"}
                          </button>
                      </div>
                  )}
              </div>
            </motion.div>
        </div>
      </motion.div>
    </div>
  );
}