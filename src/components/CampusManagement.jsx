import React, { useState, useEffect, useRef } from 'react';
import { createClub, deleteClub } from '../api';
import { 
  Building2, Tent, CheckCircle, Star, Plus, X, 
  GraduationCap as TeacherIcon, Users, Search, ChevronDown, Trash2
} from 'lucide-react';

// --- 🟢 CUSTOM SEARCHABLE DROPDOWN COMPONENT ---
const SearchableDropdown = ({ options, value, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter(opt => 
    (opt.label || "").toLowerCase().includes((searchQuery || "").toLowerCase())
  );
  
  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className={`relative w-full ${isOpen ? 'z-50' : 'z-10'}`} ref={dropdownRef}>
      <div 
        className={`w-full p-3 bg-white border rounded-xl flex items-center justify-between cursor-pointer transition-all ${isOpen ? 'border-indigo-400 ring-1 ring-indigo-400' : 'border-slate-200 hover:border-slate-300'}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={`text-sm font-semibold truncate ${selectedOption ? 'text-slate-900' : 'text-slate-400'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown size={16} className={`text-slate-400 transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </div>

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
                    setSearchQuery("");
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
  const [activeManagementSubTab, setActiveManagementSubTab] = useState('umbrella');
  
  // Club Creation State
  const [newClub, setNewClub] = useState({ name: '', description: '', category: 'Technical', presidentId: '', chairpersonId: '', parentClubId: '' });
  const [clubRoles, setClubRoles] = useState([{ title: 'Vice President', seats: 1 }, { title: 'Treasurer', seats: 1 }]);
  const [isCreatingClub, setIsCreatingClub] = useState(false);

  // Filtered Lists & Formatted Options
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
  
  const parentClubOptions = [
    { label: "None (Standalone Society)", value: "" },
    ...existingClubs.map(c => ({ label: c.name, value: c._id }))
  ];

  const handleDeleteClub = async (clubId, clubName) => {
    const confirmText = prompt(`WARNING: This will permanently delete the club "${clubName}" and all its associated data. Type the name of the club to confirm:`);
    if (confirmText === clubName) {
      try { 
        await deleteClub(clubId); 
        alert(`${clubName} has been successfully deleted.`); 
        fetchAdminData(); 
      }
      catch (error) { 
        alert(error.message || "Failed to delete the club."); 
      }
    } else if (confirmText !== null) {
      alert("Club name did not match. Deletion cancelled.");
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
      
      {/* 🟢 NAVIGATION TABS (Now 3 columns) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 flex-shrink-0">
        {[
          { id: 'umbrella', label: 'Official Council', sub: 'Faculty-Led Body', icon: Building2, colorClass: 'bg-[#a855f7]', activeBorder: 'border-[#a855f7]', activeRing: 'ring-purple-50' },
          { id: 'independent', label: 'Student Society', sub: 'Student-Led Body', icon: Tent, colorClass: 'bg-[#10b981]', activeBorder: 'border-[#10b981]', activeRing: 'ring-emerald-50' },
          { id: 'existing', label: 'Active Clubs', sub: 'Directory & Management', icon: Users, colorClass: 'bg-rose-500', activeBorder: 'border-rose-500', activeRing: 'ring-rose-50' }
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

      <div className="bg-white rounded-[1.5rem] sm:rounded-[2rem] border border-slate-200 shadow-sm flex flex-col flex-shrink-0">
        <div className="w-full max-w-4xl mx-auto p-6 sm:p-10">
          
          {/* --- CREATE TAB --- */}
          {(activeManagementSubTab === 'umbrella' || activeManagementSubTab === 'independent') && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="mb-8 border-b border-slate-100 pb-6 text-center">
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                      Form New {activeManagementSubTab === 'umbrella' ? 'Official Council' : 'Student Society'}
                    </h2>
                    <p className="text-sm font-medium text-slate-500 mt-1.5 mx-auto max-w-lg">Set up the structure and assign roles for a new organization.</p>
                </div>
                
                <form onSubmit={handleCreateClubSubmit} className="space-y-6 max-w-3xl mx-auto">
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

          {/* --- ACTIVE CLUBS TAB --- */}
          {activeManagementSubTab === 'existing' && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="mb-8 border-b border-slate-100 pb-6 text-center">
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Active Organizations</h2>
                    <p className="text-sm font-medium text-slate-500 mt-1.5 mx-auto max-w-lg">Manage and monitor all currently active clubs, councils, and societies.</p>
                </div>
                
                {existingClubs.length === 0 ? (
                    <div className="text-center py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <Users className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                        <h3 className="text-lg font-black text-slate-800">No active clubs</h3>
                        <p className="text-sm font-medium text-slate-500">Use the tabs above to form a new council or society.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {existingClubs.map(club => (
                            <div key={club._id} className="p-4 sm:p-5 border border-slate-200 hover:border-slate-300 rounded-xl bg-white shadow-sm flex justify-between items-center transition-all group">
                                <div className="overflow-hidden pr-4">
                                    <h3 className="font-extrabold text-slate-900 text-base truncate">{club.name}</h3>
                                    <span className={`mt-1.5 px-2.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border inline-block ${
                                        club.category === 'Technical' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                        club.category === 'Cultural' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                        club.category === 'Sports' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                        'bg-slate-100 text-slate-600 border-slate-200'
                                    }`}>
                                        {club.category}
                                    </span>
                                </div>
                                <button 
                                    onClick={() => handleDeleteClub(club._id, club.name)} 
                                    className="p-2.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex-shrink-0" 
                                    title="Delete Club"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default CampusManagement;