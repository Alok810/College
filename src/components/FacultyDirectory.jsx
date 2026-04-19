import React, { useState, useEffect } from 'react';
import { Search, Trash2, Loader2, Briefcase, Mail, BookOpen, Phone, Edit3, Save, FileText, Building2, ChevronLeft, GraduationCap } from 'lucide-react';
import { updateDepartment, getCourseBlueprint, saveCourseBlueprint, updateUserProfile, getFacultyAssignedSubjects } from '../api';
import { useAuth } from '../context/AuthContext'; 

export default function FacultyDirectory({ activeDept, canEdit, onRefresh }) {
  const { authData } = useAuth(); 
  const [searchQuery, setSearchQuery] = useState("");
  
  const [selectedFacultyForProfile, setSelectedFacultyForProfile] = useState(null);
  const [activeProfileTab, setActiveProfileTab] = useState('overview');
  
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileEdits, setProfileEdits] = useState({});
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const [facultySubjects, setFacultySubjects] = useState([]);
  const [loadingFacultySubjects, setLoadingFacultySubjects] = useState(false);

  useEffect(() => {
    const fetchSubjectsForProfile = async () => {
        if (selectedFacultyForProfile && activeProfileTab === 'academics') {
            try {
                setLoadingFacultySubjects(true);
                const subs = await getFacultyAssignedSubjects(selectedFacultyForProfile._id);
                setFacultySubjects(subs || []);
            } catch (e) {
                setFacultySubjects([]);
            } finally {
                setLoadingFacultySubjects(false);
            }
        }
    };
    fetchSubjectsForProfile();
  }, [selectedFacultyForProfile, activeProfileTab]);

  const filteredFaculty = (activeDept.coreFaculty || []).filter(f => 
    f.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    f.designation?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRemoveFacultyFromRoster = async (userId, userName) => {
    if (!window.confirm(`Remove ${userName || 'this faculty member'} from the department? Note: Please ensure their subjects are unassigned first.`)) return;
    try {
      const updatedFacultyIds = (activeDept.coreFaculty || []).filter(f => (f._id || f) !== userId).map(f => f._id || f);
      await updateDepartment(activeDept._id, { coreFaculty: updatedFacultyIds });
      onRefresh(); 
    } catch (error) {
      alert("Failed to remove faculty member.");
    }
  };

  const handleRemoveSubjectAssignmentFromProfile = async (subject) => {
      if (!window.confirm(`Remove ${subject.subjectCode} from ${selectedFacultyForProfile.name}'s workload?`)) return;
      try {
          const data = await getCourseBlueprint(subject.batch, subject.branch, subject.semester);
          const blueprintSubjects = data?.subjects || [];
          
          const updatedSubjects = blueprintSubjects.map(s => 
              s.subjectCode === subject.subjectCode ? { ...s, assignedTo: null } : s
          );

          await saveCourseBlueprint({
              batch: subject.batch,
              branch: subject.branch,
              semester: subject.semester,
              subjects: updatedSubjects
          });

          setFacultySubjects(prev => prev.filter(s => s.subjectCode !== subject.subjectCode));
      } catch (error) {
          alert("Failed to unassign subject.");
      }
  };

  const openProfileView = (faculty) => {
      setSelectedFacultyForProfile(faculty);
      setActiveProfileTab('overview');
      setProfileEdits({
          about: faculty.about || '',
          education: faculty.education || '',
          phoneNumber: faculty.phoneNumber || ''
      });
      setIsEditingProfile(false);
  };

  const handleSaveProfileChanges = async () => {
      setIsSavingProfile(true);
      try {
          const formData = new FormData();
          formData.append('about', profileEdits.about || '');
          formData.append('education', profileEdits.education || '');
          formData.append('phoneNumber', profileEdits.phoneNumber || '');

          await updateUserProfile(formData);
          setSelectedFacultyForProfile(prev => ({ ...prev, ...profileEdits }));
          setIsEditingProfile(false);
          onRefresh(); 
          alert("Profile updated successfully!");
      } catch (error) {
          alert("Failed to update profile. " + error.message);
      } finally {
          setIsSavingProfile(false);
      }
  };

  return (
    <div className="w-full flex flex-col gap-4 animate-in fade-in duration-300 h-full">
      
      {!selectedFacultyForProfile && (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2 border-b border-slate-100 pb-3">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Faculty Directory</h3>
            
            <div className="relative w-full sm:w-80">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search roster by name or designation..." 
                className="w-full p-2.5 pl-9 border border-slate-200 rounded-lg text-sm outline-none bg-slate-50 focus:bg-white font-bold text-slate-700 transition-colors shadow-inner" 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-2">
            {filteredFaculty.map((faculty, idx) => (
              <div key={idx} className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-indigo-300 hover:shadow-md transition-all flex flex-col group relative cursor-pointer" onClick={() => openProfileView(faculty)}>
                
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full justify-between">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-14 h-14 rounded-full bg-indigo-50 flex items-center justify-center border border-indigo-100 flex-shrink-0 overflow-hidden">
                      {faculty.profilePicture ? <img src={faculty.profilePicture} className="w-full h-full object-cover" alt="Profile" /> : <span className="text-indigo-600 font-black text-xl">{faculty.name?.charAt(0)}</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-extrabold text-slate-900 text-lg tracking-wide truncate">{faculty.name}</h4>
                      <p className="text-[11px] font-bold text-indigo-600 uppercase tracking-widest truncate">{faculty.designation || 'Faculty Member'}</p>
                      
                      <div className="flex flex-wrap items-center gap-3 mt-1.5">
                          <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1 truncate"><Mail size={12}/> {faculty.email || 'Email restricted by server'}</span>
                      </div>
                    </div>
                  </div>
                  
                  {canEdit && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleRemoveFacultyFromRoster(faculty._id, faculty.name); }} 
                      className="text-slate-300 hover:text-rose-600 hover:bg-rose-50 p-2.5 rounded-xl transition-all sm:opacity-0 sm:group-hover:opacity-100 self-end sm:self-auto flex-shrink-0"
                      title="Remove from Department Roster"
                    >
                      <Trash2 size={18}/>
                    </button>
                  )}
                </div>

              </div>
            ))}
            {filteredFaculty.length === 0 && (
               <div className="col-span-full text-center py-16 text-slate-400 font-medium border border-dashed border-slate-200 rounded-2xl bg-slate-50">
                 <Briefcase size={36} className="mx-auto mb-3 opacity-40" />
                 No faculty members found in this department.
               </div>
            )}
          </div>
        </>
      )}

      {selectedFacultyForProfile && (() => {
          const isMyProfile = authData?._id === selectedFacultyForProfile._id;
          return (
            <div className="flex flex-col w-full h-full flex-shrink-0 animate-in slide-in-from-right-8 duration-300 relative pb-6">

                <div className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row items-center md:items-start gap-6 relative overflow-hidden flex-shrink-0">
                    <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-slate-100 flex items-center justify-center border-4 border-indigo-50 shadow-md flex-shrink-0 z-10 overflow-hidden">
                        {selectedFacultyForProfile.profilePicture ? (
                            <img src={selectedFacultyForProfile.profilePicture} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-slate-400 font-black text-5xl">{selectedFacultyForProfile.name?.charAt(0)}</span>
                        )}
                    </div>

                    <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left z-10 w-full">
                        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight tracking-wide">{selectedFacultyForProfile.name}</h2>
                        <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-2 mb-5">
                            <span className="bg-indigo-50 text-indigo-700 border border-indigo-100 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1.5"><Briefcase size={12}/> {selectedFacultyForProfile.designation || 'Faculty Member'}</span>
                            <span className="bg-slate-50 text-slate-600 border border-slate-200 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1.5"><Building2 size={12}/> {activeDept.name}</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl">
                            <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 p-3 rounded-xl flex-1">
                                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-500 flex items-center justify-center flex-shrink-0"><Mail size={14}/></div>
                                <div className="min-w-0">
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Email Address</p>
                                    <a href={selectedFacultyForProfile.email ? `mailto:${selectedFacultyForProfile.email}` : '#'} className="text-sm font-bold text-slate-700 hover:text-indigo-600 truncate block">
                                        {selectedFacultyForProfile.email || 'Email restricted by server'}
                                    </a>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 p-3 rounded-xl flex-1">
                                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-500 flex items-center justify-center flex-shrink-0"><Phone size={14}/></div>
                                <div className="min-w-0 w-full">
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Phone Number</p>
                                    {isEditingProfile ? (
                                        <input type="text" value={profileEdits.phoneNumber} onChange={(e) => setProfileEdits({...profileEdits, phoneNumber: e.target.value})} className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-sm text-slate-800 focus:border-indigo-500 outline-none mt-1" placeholder="Enter phone number"/>
                                    ) : (
                                        <span className="text-sm font-bold text-slate-700 block truncate mt-0.5">{selectedFacultyForProfile.phoneNumber || 'Not provided'}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ✨ 🟢 UPDATED: HOD Style Pill Navigation Tabs */}
                <div className="flex gap-3 overflow-x-auto custom-scrollbar border-b border-slate-100 pb-4 mb-4 flex-shrink-0">
                    <button 
                        onClick={() => setActiveProfileTab('overview')} 
                        className={`px-4 py-2 rounded-lg font-bold text-xs transition-all flex items-center gap-2 shadow-sm border ${activeProfileTab === 'overview' ? 'bg-indigo-500 text-white border-indigo-500' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                    >
                        <FileText size={14}/> Professional Summary
                    </button>
                    <button 
                        onClick={() => setActiveProfileTab('education')} 
                        className={`px-4 py-2 rounded-lg font-bold text-xs transition-all flex items-center gap-2 shadow-sm border ${activeProfileTab === 'education' ? 'bg-indigo-500 text-white border-indigo-500' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                    >
                        <GraduationCap size={14}/> Educational Background
                    </button>
                    <button 
                        onClick={() => setActiveProfileTab('academics')} 
                        className={`px-4 py-2 rounded-lg font-bold text-xs transition-all flex items-center gap-2 shadow-sm border ${activeProfileTab === 'academics' ? 'bg-indigo-500 text-white border-indigo-500' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                    >
                        <BookOpen size={14}/> Assigned Classes
                    </button>
                </div>

                <div className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-sm border border-slate-200 mb-6 flex-1 min-h-[300px] flex flex-col overflow-hidden">
                    {activeProfileTab === 'overview' && (
                        <div className="max-w-4xl animate-in fade-in duration-300">
                            <h3 className="text-sm font-black text-slate-800 mb-4 flex items-center gap-2"><FileText className="text-indigo-500 w-5 h-5"/> Professional Summary</h3>
                            {isEditingProfile ? (
                                <textarea rows="8" value={profileEdits.about} onChange={(e) => setProfileEdits({...profileEdits, about: e.target.value})} className="w-full p-5 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none text-sm text-slate-700 leading-relaxed resize-none transition-colors" placeholder="Write a brief professional summary..." />
                            ) : (
                                <p className="text-[15px] text-slate-600 leading-relaxed whitespace-pre-wrap">{selectedFacultyForProfile.about || <span className="italic text-slate-400">No summary provided yet.</span>}</p>
                            )}
                        </div>
                    )}

                    {activeProfileTab === 'education' && (
                        <div className="max-w-4xl animate-in fade-in duration-300">
                            <h3 className="text-sm font-black text-slate-800 mb-4 flex items-center gap-2"><GraduationCap className="text-amber-500 w-5 h-5"/> Educational Background</h3>
                            {isEditingProfile ? (
                                <textarea rows="6" value={profileEdits.education} onChange={(e) => setProfileEdits({...profileEdits, education: e.target.value})} className="w-full p-5 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none text-sm text-slate-700 leading-relaxed resize-none transition-colors" placeholder="E.g. Ph.D. in Computer Science, MIT (2018)" />
                            ) : (
                                <p className="text-[15px] text-slate-600 leading-relaxed whitespace-pre-wrap">{selectedFacultyForProfile.education || <span className="italic text-slate-400">No educational background provided yet.</span>}</p>
                            )}
                        </div>
                    )}

                    {activeProfileTab === 'academics' && (
                        <div className="w-full animate-in fade-in duration-300 flex flex-col h-full">
                            <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4 flex-shrink-0">
                                <h3 className="text-sm font-black text-slate-800 flex items-center gap-2"><BookOpen className="text-emerald-500 w-5 h-5"/> All Assigned Classes</h3>
                                <span className="bg-emerald-50 text-emerald-700 text-xs font-black px-3 py-1 rounded-full border border-emerald-100">{facultySubjects.length} Subjects</span>
                            </div>

                            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-4">
                                {loadingFacultySubjects ? (
                                    <div className="text-center py-16 text-emerald-500"><Loader2 className="w-8 h-8 animate-spin mx-auto"/></div>
                                ) : facultySubjects.length > 0 ? (
                                    <div className="flex flex-col gap-3">
                                        {facultySubjects.map((subject, idx) => (
                                            <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md hover:border-emerald-300 transition-all group relative overflow-hidden">
                                                <div className="flex flex-col min-w-0 flex-1 gap-1.5 pl-2">
                                                    <div className="flex items-center gap-3">
                                                        <span className="font-black text-slate-900 text-[16px] whitespace-nowrap">{subject.subjectCode}</span>
                                                        <span className="text-slate-200 hidden sm:inline">|</span>
                                                        <span className="font-bold text-slate-700 text-sm truncate">{subject.subjectName}</span>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest flex-shrink-0 border ${subject.type === 'Theory' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                                            {subject.type || 'THEORY'}
                                                        </span>
                                                        <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
                                                            {subject.credits || 4} Credits
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col md:items-end gap-2 flex-shrink-0 w-full md:w-auto mt-2 md:mt-0 text-left md:text-right border-t md:border-t-0 border-slate-100 pt-3 md:pt-0">
                                                    <div className="flex items-center gap-2">
                                                        {/* ✨ Colorful Batch and Semester Labels */}
                                                        <span className=" bg-emerald-50 border border-emerald-200 text-[10px] font-bold text-emerald-600 shadow-sm rounded-lg px-3 py-0.5 uppercase tracking-widest">{subject.batch}</span>
                                                        <span className=" bg-emerald-50 border border-emerald-200 text-[10px] font-bold text-emerald-600 shadow-sm rounded-lg px-3 py-0.5 uppercase tracking-widest">{subject.semester}</span>
                                                        
                                                        {canEdit && (
                                                            <button 
                                                                onClick={(e) => { e.stopPropagation(); handleRemoveSubjectAssignmentFromProfile(subject); }}
                                                                className="ml-2 text-slate-300 hover:text-rose-600 hover:bg-rose-100 p-1.5 rounded-lg transition-colors md:opacity-0 md:group-hover:opacity-100 focus:opacity-100"
                                                                title="Unassign Subject"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        )}
                                                    </div>
                                                    {/* ✨ Emerald Branch Label */}
                                                    <span className="bg-emerald-50 border border-emerald-200 text-emerald-600 shadow-sm rounded-lg px-3 py-1 text-[10px] sm:text-xs font-black uppercase tracking-wide truncate inline-block mt-0.5 w-full sm:w-auto text-center">
                                                        {activeDept.abbreviation === subject.branch ? activeDept.name : (subject.branch || activeDept.name)}
                                                    </span>
                                                </div>

                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-16 text-slate-400 italic font-medium bg-slate-50 rounded-xl border border-slate-100">
                                        <BookOpen size={32} className="mx-auto mb-3 opacity-40"/>
                                        No classes currently assigned to this faculty member.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-auto pt-4 border-t border-slate-200 flex justify-between items-center flex-shrink-0 w-full">
                  <button onClick={() => !isEditingProfile && setSelectedFacultyForProfile(null)} className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 px-4 py-2.5 bg-white hover:bg-indigo-50 rounded-xl transition-colors border border-slate-200 hover:border-indigo-200 shadow-sm w-max">
                      <ChevronLeft size={16} /> Back to Directory
                  </button>
                  
                  {isMyProfile && (
                      <div className="flex gap-2">
                          {isEditingProfile ? (
                              <>
                                  <button onClick={() => setIsEditingProfile(false)} className="px-4 py-2 text-xs font-bold text-slate-500 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">Cancel</button>
                                  <button onClick={handleSaveProfileChanges} disabled={isSavingProfile} className="flex items-center gap-1.5 px-6 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-all disabled:opacity-50 active:scale-95">
                                      {isSavingProfile ? <Loader2 size={14} className="animate-spin"/> : <Save size={14}/>} Save Changes
                                  </button>
                              </>
                          ) : (
                              <button onClick={() => setIsEditingProfile(true)} className="flex items-center gap-1.5 px-6 py-2.5 text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-xl hover:bg-indigo-100 transition-colors shadow-sm active:scale-95">
                                  <Edit3 size={14}/> Edit Profile
                              </button>
                          )}
                      </div>
                  )}
                </div>

            </div>
          );
      })()}

    </div>
  );
}