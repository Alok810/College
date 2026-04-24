import React, { useState, useEffect, useRef } from 'react';
import { updateUserDesignation, createClub } from '../api';
import { 
  Award, Building2, Tent, CheckCircle, Star, Plus, X, 
  GraduationCap as TeacherIcon, Users, Search, ChevronDown
} from 'lucide-react';

const CAMPUS_ROLES = [
  "President", "Vice President", "General Secretary", 
  "Sports Secretary", "Cultural Secretary", "Technical Secretary", 
  "Class Representative", "Club Lead"
];

// --- 🟢 CUSTOM SEARCHABLE DROPDOWN COMPONENT ---
const SearchableDropdown = ({ options, value, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Safely filter options based on user search
  const filteredOptions = options.filter(opt => 
    (opt.label || "").toLowerCase().includes((searchQuery || "").toLowerCase())
  );
  
  const selectedOption = options.find(opt => opt.value === value);

  return (
    // Dynamic z-index: Pops to the front only when open to prevent overlapping issues
    <div className={`relative w-full ${isOpen ? 'z-50' : 'z-10'}`} ref={dropdownRef}>
      
      {/* Dropdown Trigger */}
      <div 
        className={`w-full p-3 bg-white border rounded-xl flex items-center justify-between cursor-pointer transition-all ${isOpen ? 'border-indigo-400 ring-1 ring-indigo-400' : 'border-slate-200 hover:border-slate-300'}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={`text-sm font-semibold truncate ${selectedOption ? 'text-slate-900' : 'text-slate-400'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown size={16} className={`text-slate-400 transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {/* Dropdown Menu & Search Input */}
      {isOpen && (
        <div className="absolute w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl max-h-60 flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-2 border-b border-slate-100 flex items-center gap-2 bg-slate-50">
            <Search size={14} className="text-slate-400 ml-2 flex-shrink-0" />
            <input 
              autoFocus
              type="text" 
              placeholder="Search by name..." 
              className="w-full p-1.5 bg-transparent outline-none text-sm font-semibold text-slate-700"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="overflow-y-auto custom-scrollbar">
            {filteredOptions.length > 0 ? (
              filteredOptions.map(opt => (
                <div 
                  key={opt.value} 
                  className={`p-3 text-sm font-semibold cursor-pointer transition-colors ${value === opt.value ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700 hover:bg-slate-50 hover:text-indigo-600'}`}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                    setSearchQuery(""); // reset search on select
                  }}
                >
                  {opt.label}
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-xs font-bold text-slate-400">No results found.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
// ----------------------------------------------------


const CampusManagement = ({ users, existingClubs, fetchAdminData }) => {
  const [activeManagementSubTab, setActiveManagementSubTab] = useState('designations');
  
  // Designations State
  const [selectedUserForDesignation, setSelectedUserForDesignation] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [customRole, setCustomRole] = useState('');
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);

  // Club Creation State
  const [newClub, setNewClub] = useState({ name: '', description: '', category: 'Technical', presidentId: '', chairpersonId: '', parentClubId: '' });
  const [clubRoles, setClubRoles] = useState([{ title: 'Vice President', seats: 1 }, { title: 'Treasurer', seats: 1 }]);
  const [isCreatingClub, setIsCreatingClub] = useState(false);

  // Filtered Lists & Formatted Options for Searchable Dropdown
  // Added fallback logic so if roles aren't defined in DB, it shows all users instead of an empty dropdown
  const chairpersonList = users.filter(u => {
      const type = (u.userType || u.role || '').toLowerCase();
      return type && type !== 'student' && type !== 'user';
  });
  const studentsList = users.filter(u => {
      const type = (u.userType || u.role || '').toLowerCase();
      return !type || type === 'student' || type === 'user';
  });

  const finalChairpersonList = chairpersonList.length > 0 ? chairpersonList : users;
  const finalStudentList = studentsList.length > 0 ? studentsList : users;

  const chairpersonOptions = finalChairpersonList.map(u => ({ label: u.name || 'Unknown', value: u._id }));
  const studentOptions = finalStudentList.map(u => ({ label: u.name || 'Unknown', value: u._id }));
  const allUserOptions = users.map(u => ({ label: `${u.name || 'Unknown'} — ${u.registrationNo || 'No ID'}`, value: u._id }));
  
  const parentClubOptions = [
    { label: "None (Standalone Society)", value: "" },
    ...existingClubs.map(c => ({ label: c.name, value: c._id }))
  ];

  const handleAssignDesignation = async (e) => {
    e.preventDefault();
    if (!selectedUserForDesignation) return alert("Please select a user first.");
    const finalDesignation = selectedRole === 'Custom...' ? customRole : selectedRole;
    if (!finalDesignation.trim()) return alert("Please select or enter a designation.");
    
    setIsUpdatingRole(true);
    try {
        await updateUserDesignation(selectedUserForDesignation, finalDesignation);
        alert("Designation successfully assigned!");
        fetchAdminData(); 
        setSelectedUserForDesignation(''); setSelectedRole(''); setCustomRole('');
    } catch  {
        alert("Failed to update designation.");
    } finally {
        setIsUpdatingRole(false);
    }
  };

  const handleCreateClubSubmit = async (e) => {
      e.preventDefault();
      const isUmbrella = activeManagementSubTab === 'umbrella';
      if(!newClub.presidentId) return alert("Please select a Student President.");

      setIsCreatingClub(true);
      try {
          const payload = { 
              ...newClub, 
              chairpersonId: isUmbrella ? newClub.chairpersonId : '', 
              availableRoles: isUmbrella ? [] : clubRoles 
          };
          await createClub(payload);
          alert(`Success! ${newClub.name} created successfully.`);
          setNewClub({ name: '', description: '', category: 'Technical', presidentId: '', chairpersonId: '', parentClubId: '' });
          setClubRoles([{ title: 'Vice President', seats: 1 }, { title: 'Treasurer', seats: 1 }]);
          fetchAdminData(); 
      } catch (error) {
          alert(error.message || "Failed to create club.");
      } finally {
          setIsCreatingClub(false);
      }
  };

  return (
    <div className="flex flex-col w-full animate-in fade-in duration-500 pb-8">
      
      {/* 🟢 STAT-CARD STYLE NAVIGATION */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 flex-shrink-0">
        {[
          { id: 'designations', label: 'Assign Roles', sub: 'Official Badges', icon: Award, colorClass: 'bg-[#3b82f6]', activeBorder: 'border-[#3b82f6]', activeRing: 'ring-blue-50' },
          { id: 'umbrella', label: 'Official Council', sub: 'Faculty-Led Body', icon: Building2, colorClass: 'bg-[#a855f7]', activeBorder: 'border-[#a855f7]', activeRing: 'ring-purple-50' },
          { id: 'independent', label: 'Student Society', sub: 'Student-Led Body', icon: Tent, colorClass: 'bg-[#10b981]', activeBorder: 'border-[#10b981]', activeRing: 'ring-emerald-50' }
        ].map((tab) => (
          <button 
            key={tab.id}
            onClick={() => setActiveManagementSubTab(tab.id)}
            className={`group p-4 sm:p-5 rounded-2xl text-left transition-all duration-200 flex items-center gap-4 border outline-none ${
              activeManagementSubTab === tab.id 
              ? `bg-white ${tab.activeBorder} shadow-sm ring-2 ${tab.activeRing}` 
              : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
            }`}
          >
            <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-[0.8rem] flex items-center justify-center flex-shrink-0 text-white shadow-sm ${tab.colorClass}`}>
              <tab.icon size={24} strokeWidth={2.5} />
            </div>
            <div className="flex flex-col justify-center">
              <p className="text-[9px] sm:text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">{tab.sub}</p>
              <h3 className="text-base sm:text-[17px] font-black text-slate-900 leading-none">{tab.label}</h3>
            </div>
          </button>
        ))}
      </div>

      {/* 🔵 MAIN FORM PANEL */}
      <div className="bg-white rounded-[1.5rem] sm:rounded-[2rem] border border-slate-200 shadow-sm flex flex-col flex-shrink-0">
        <div className="w-full max-w-3xl mx-auto p-6 sm:p-10">
          
          {/* --- DESIGNATIONS TAB --- */}
          {activeManagementSubTab === 'designations' && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="mb-8 border-b border-slate-100 pb-6 text-center">
                      <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Set Official Designation</h2>
                      <p className="text-sm font-medium text-slate-500 mt-1.5 mx-auto max-w-lg">Review and verify roles before updating the campus directory.</p>
                  </div>
                  
                  <form onSubmit={handleAssignDesignation} className="space-y-6">
                      <div className="space-y-2 text-left">
                          <label className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-widest block">1. Select Recipient</label>
                          <SearchableDropdown 
                             options={allUserOptions}
                             value={selectedUserForDesignation}
                             onChange={(val) => setSelectedUserForDesignation(val)}
                             placeholder="-- Search verified members --"
                          />
                      </div>

                      <div className={`space-y-5 transition-all duration-300 ${!selectedUserForDesignation ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
                          <div className="space-y-2.5 text-left">
                              <label className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-widest block">2. Assign Title</label>
                              <div className="flex flex-wrap gap-2.5">
                                 {CAMPUS_ROLES.map(role => (
                                   <button
                                     key={role}
                                     type="button"
                                     onClick={() => {setSelectedRole(role); setCustomRole('');}}
                                     className={`py-2 px-4 rounded-full text-[11px] sm:text-xs font-bold border transition-all duration-200 ${selectedRole === role ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'}`}
                                   >
                                     {role}
                                   </button>
                                 ))}
                                 <button
                                     type="button"
                                     onClick={() => setSelectedRole('Custom...')}
                                     className={`py-2 px-4 rounded-full text-[11px] sm:text-xs font-bold border transition-all duration-200 ${selectedRole === 'Custom...' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'}`}
                                   >
                                     Custom...
                                   </button>
                              </div>
                          </div>

                          {selectedRole === 'Custom...' && (
                              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                  <input 
                                    type="text" 
                                    placeholder="Type custom designation..." 
                                    className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none font-semibold text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-all text-center"
                                    value={customRole} 
                                    onChange={(e) => setCustomRole(e.target.value)} 
                                    required
                                  />
                              </div>
                          )}
                          
                          <div className="pt-5 flex justify-center">
                            <button type="submit" disabled={isUpdatingRole} className="w-full sm:w-auto px-10 py-3 bg-[#10B981] hover:bg-[#059669] text-white font-bold rounded-full text-sm flex items-center justify-center gap-2 transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed">
                                {isUpdatingRole ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <CheckCircle size={16} />}
                                Confirm Designation
                            </button>
                          </div>
                      </div>
                  </form>
              </div>
          )}

          {/* --- CLUBS & SOCIETIES TAB --- */}
          {(activeManagementSubTab === 'umbrella' || activeManagementSubTab === 'independent') && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="mb-8 border-b border-slate-100 pb-6 text-center">
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                      Form New {activeManagementSubTab === 'umbrella' ? 'Official Council' : 'Student Society'}
                    </h2>
                    <p className="text-sm font-medium text-slate-500 mt-1.5 mx-auto max-w-lg">Set up the structure and assign roles for a new organization.</p>
                </div>
                
                <form onSubmit={handleCreateClubSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left">
                        <div className="space-y-2">
                            <label className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-widest block">Organization Name</label>
                            <input type="text" required className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none font-semibold text-sm focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-all" placeholder="e.g. CodeX, Robotics Club" value={newClub.name} onChange={e => setNewClub({...newClub, name: e.target.value})}/>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-widest block">Category Domain</label>
                            <select className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none font-semibold text-sm focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-all appearance-none cursor-pointer" value={newClub.category} onChange={e => setNewClub({...newClub, category: e.target.value})}>
                                <option value="Technical">Technical</option><option value="Cultural">Cultural</option><option value="Sports">Sports</option><option value="Literary">Literary</option><option value="Other">Other</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left">
                        {activeManagementSubTab === 'umbrella' && (
                            <div className="space-y-2">
                                <label className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5"><TeacherIcon size={14} className="text-indigo-500"/> Chairperson (Faculty)</label>
                                <SearchableDropdown 
                                   options={chairpersonOptions}
                                   value={newClub.chairpersonId}
                                   onChange={(val) => setNewClub({...newClub, chairpersonId: val})}
                                   placeholder="-- Search Faculty --"
                                />
                            </div>
                        )}
                        <div className={`space-y-2 ${activeManagementSubTab === 'independent' ? 'md:col-span-2' : ''}`}>
                            <label className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5"><Star size={14} className="text-[#10B981]"/> Student President</label>
                            <SearchableDropdown 
                               options={studentOptions}
                               value={newClub.presidentId}
                               onChange={(val) => setNewClub({...newClub, presidentId: val})}
                               placeholder="-- Search Student Leader --"
                            />
                        </div>
                    </div>

                    {activeManagementSubTab === 'independent' && (
                        <div className="space-y-5 animate-in fade-in duration-500 text-left">
                            <div className="space-y-2 border-t border-slate-100 pt-5">
                                <label className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-widest block">Parent Organization (Optional)</label>
                                <SearchableDropdown 
                                   options={parentClubOptions}
                                   value={newClub.parentClubId}
                                   onChange={(val) => setNewClub({...newClub, parentClubId: val})}
                                   placeholder="None (Standalone Society)"
                                />
                            </div>
                            
                            <div className="space-y-3">
                                <div className="flex justify-between items-center pb-2">
                                    <label className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-widest">Core Team Structure</label>
                                    <button type="button" onClick={() => setClubRoles([...clubRoles, { title: '', seats: 1 }])} className="text-[11px] font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 px-3 py-1.5 rounded-full flex items-center gap-1 transition-colors"><Plus size={14}/> Add Role</button>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {clubRoles.map((role, index) => (
                                        <div key={index} className="flex gap-0 items-center bg-white rounded-xl border border-slate-200 focus-within:border-indigo-400 focus-within:ring-1 focus-within:ring-indigo-400 transition-all overflow-hidden">
                                            <input type="text" placeholder="Role (e.g. Treasurer)" className="flex-1 p-2.5 bg-transparent outline-none text-sm font-semibold text-slate-900 placeholder:text-slate-400 border-r border-slate-100" value={role.title} onChange={e => { const newRoles = [...clubRoles]; newRoles[index].title = e.target.value; setClubRoles(newRoles); }} required />
                                            <input type="number" min="1" className="w-12 p-2.5 text-center font-bold text-sm bg-transparent outline-none text-slate-900" value={role.seats} onChange={e => { const newRoles = [...clubRoles]; newRoles[index].seats = Number(e.target.value); setClubRoles(newRoles); }} required />
                                            <button type="button" onClick={() => setClubRoles(clubRoles.filter((_, i) => i !== index))} className="p-2.5 text-rose-400 hover:text-rose-600 bg-white hover:bg-rose-50 transition-colors"><X size={16}/></button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="space-y-2 border-t border-slate-100 pt-5 text-left">
                        <label className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-widest block">Manifesto / Purpose</label>
                        <textarea required rows="3" className="w-full p-4 bg-white border border-slate-200 rounded-xl outline-none font-medium text-sm resize-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-all" placeholder="Briefly describe the vision and purpose of this organization..." value={newClub.description} onChange={e => setNewClub({...newClub, description: e.target.value})}></textarea>
                    </div>

                    <div className="pt-4 flex justify-center">
                        <button type="submit" disabled={isCreatingClub} className="w-full sm:w-auto px-10 py-3 bg-[#10B981] hover:bg-[#059669] text-white font-bold rounded-full text-sm flex items-center justify-center gap-2 transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed">
                            {isCreatingClub ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <CheckCircle size={16} />}
                            {isCreatingClub ? 'Establishing...' : `Create ${activeManagementSubTab === 'umbrella' ? 'Official Council' : 'Student Society'}`}
                        </button>
                    </div>
                </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CampusManagement;