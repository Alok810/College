import React, { useState, useEffect } from 'react';
import { Shield, Award, Briefcase, Mail, Phone, BookOpen, Loader2, LayoutDashboard, CheckCircle, XCircle, Clock } from 'lucide-react';
import { updateDepartment, getCourseBlueprint, saveCourseBlueprint, updateUserDesignation, getDepartmentTeachers } from '../api';

const batches = ['2021-2025', '2022-2026', '2023-2027', '2024-2028', '2025-2029', '2026-2030'];
const semesters = ['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4', 'Semester 5', 'Semester 6', 'Semester 7', 'Semester 8'];

// 🟢 EXACT Day Labels from your screenshot
const DAYS_OF_WEEK = [
    { id: 'Mon', label: 'M' },
    { id: 'Tue', label: 'T' },
    { id: 'Wed', label: 'W' },
    { id: 'Thu', label: 'T' },
    { id: 'Fri', label: 'F' },
    { id: 'Sat', label: 'S' }
];

const TIME_SLOTS = [
    '08:00 AM - 09:00 AM',
    '09:00 AM - 10:00 AM',
    '10:00 AM - 11:00 AM',
    '11:00 AM - 12:00 PM',
    '12:00 PM - 01:00 PM',
    '02:00 PM - 03:00 PM',
    '03:00 PM - 04:00 PM',
    '04:00 PM - 05:00 PM'
];

const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length > 1) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
};

export default function HodAdministration({ activeDept, canEdit, onRefresh }) {
  const [activeAdminTab, setActiveAdminTab] = useState('approvals');

  const [pendingFaculty, setPendingFaculty] = useState([]);
  const [isFetchingPending, setIsFetchingPending] = useState(false);
  const [selectedTeacherForApproval, setSelectedTeacherForApproval] = useState(null);
  const [newDesignation, setNewDesignation] = useState("");
  const [isSubmittingAssign, setIsSubmittingAssign] = useState(false);

  const [allocationBatch, setAllocationBatch] = useState("");
  const [allocationSemester, setAllocationSemester] = useState("");
  const [allocationBlueprint, setAllocationBlueprint] = useState([]);
  const [allocationLoading, setAllocationLoading] = useState(false);
  const [isSubmittingAllocation, setIsSubmittingAllocation] = useState(false);

  const fetchPendingFaculty = async () => {
    if (!activeDept) return;
    setIsFetchingPending(true);
    try {
      const targetBranch = activeDept.abbreviation || activeDept.name;
      const res = await getDepartmentTeachers(targetBranch);
      const users = res.users || [];
      
      const existingIds = (activeDept.coreFaculty || []).map(f => f._id || f);
      const pending = users.filter(u => !existingIds.includes(u._id));
      
      setPendingFaculty(pending);
      
      if (pending.length === 0 && activeAdminTab === 'approvals') {
          setActiveAdminTab('subjects');
      }
    } catch (error) {
      console.error("Failed to fetch pending faculty:", error);
    } finally {
      setIsFetchingPending(false);
    }
  };

  useEffect(() => {
    fetchPendingFaculty();
  }, [activeDept]);

  useEffect(() => {
    const fetchAllocBlueprint = async () => {
      if (allocationBatch && allocationSemester && activeDept) {
        try {
          setAllocationLoading(true);
          const targetBranch = activeDept.abbreviation || activeDept.name;
          const data = await getCourseBlueprint(allocationBatch, targetBranch, allocationSemester);
          
          const subjectsWithParsedTimings = (data?.subjects || []).map(sub => {
              let daysArray = [];
              let timeStr = "";
              
              if (sub.timing) {
                  const parts = sub.timing.split(' | ');
                  if (parts.length === 2) {
                      const daysPart = parts[0].trim();
                      if (daysPart) daysArray = daysPart.split(',').map(d => d.trim());
                      timeStr = parts[1].trim();
                  } else if (parts.length === 1) {
                      const part = parts[0].trim();
                      if (TIME_SLOTS.includes(part)) timeStr = part;
                      else if (part) daysArray = part.split(',').map(d => d.trim());
                  }
              }
              return { ...sub, scheduleDays: daysArray, scheduleTime: timeStr };
          });

          setAllocationBlueprint(subjectsWithParsedTimings);
        } catch (e) {
          setAllocationBlueprint([]);
        } finally {
          setAllocationLoading(false);
        }
      } else {
        setAllocationBlueprint([]);
      }
    };
    fetchAllocBlueprint();
  }, [allocationBatch, allocationSemester, activeDept]);

  const handleApproveTeacher = async () => {
      if (!newDesignation) return alert("Please select a designation for this faculty member.");
      setIsSubmittingAssign(true);
      try {
          await updateUserDesignation(selectedTeacherForApproval._id, newDesignation);
          const updatedFacultyIds = [...(activeDept.coreFaculty || []).map(f => f._id || f), selectedTeacherForApproval._id];
          await updateDepartment(activeDept._id, { coreFaculty: updatedFacultyIds });
          alert(`${selectedTeacherForApproval.name} has been approved as ${newDesignation}!`);
          setSelectedTeacherForApproval(null);
          setNewDesignation("");
          fetchPendingFaculty();
          onRefresh();
      } catch (error) {
          alert("Failed to approve and assign faculty.");
      } finally {
          setIsSubmittingAssign(false);
      }
  };

  const handleRejectTeacher = (teacher) => {
      if(!window.confirm(`Are you sure you want to reject ${teacher.name}?`)) return;
      setPendingFaculty(prev => prev.filter(f => f._id !== teacher._id));
  };

  const saveBlueprintToDB = async (updatedSubjects) => {
      setIsSubmittingAllocation(true);
      try {
          const targetBranch = activeDept.abbreviation || activeDept.name;
          
          const subjectsToSave = updatedSubjects.map(sub => {
              const daysStr = (sub.scheduleDays || []).join(', ');
              const timeStr = sub.scheduleTime || "";
              
              let formattedTiming = "";
              if (daysStr && timeStr) formattedTiming = `${daysStr} | ${timeStr}`;
              else if (daysStr) formattedTiming = daysStr;
              else if (timeStr) formattedTiming = timeStr;

              return { ...sub, timing: formattedTiming };
          });

          await saveCourseBlueprint({
              batch: allocationBatch,
              branch: targetBranch,
              semester: allocationSemester,
              subjects: subjectsToSave
          });
      } catch (error) {
          alert("Failed to save changes.");
      } finally {
          setIsSubmittingAllocation(false);
      }
  };

  const handleSubjectAllocationChange = (subjectCode, facultyId) => {
      const updatedSubjects = allocationBlueprint.map(subject => {
          if (subject.subjectCode === subjectCode) {
              if (!facultyId) {
                  return { ...subject, assignedTo: null, scheduleDays: [], scheduleTime: "", timing: "" };
              }
              return { ...subject, assignedTo: facultyId };
          }
          return subject;
      });
      setAllocationBlueprint(updatedSubjects);
      saveBlueprintToDB(updatedSubjects);
  };

  const handleToggleDay = (subjectCode, dayId) => {
      const updatedSubjects = allocationBlueprint.map(subject => {
          if (subject.subjectCode === subjectCode) {
              const currentDays = subject.scheduleDays || [];
              const newDays = currentDays.includes(dayId)
                  ? currentDays.filter(d => d !== dayId)
                  : [...currentDays, dayId];
              
              const order = DAYS_OF_WEEK.map(d => d.id);
              newDays.sort((a, b) => order.indexOf(a) - order.indexOf(b));
              
              return { ...subject, scheduleDays: newDays };
          }
          return subject;
      });
      setAllocationBlueprint(updatedSubjects);
      saveBlueprintToDB(updatedSubjects);
  };

  const handleScheduleTimeChange = (subjectCode, time) => {
      const updatedSubjects = allocationBlueprint.map(subject =>
          subject.subjectCode === subjectCode ? { ...subject, scheduleTime: time } : subject
      );
      setAllocationBlueprint(updatedSubjects);
      saveBlueprintToDB(updatedSubjects);
  };

  return (
    <div className="w-full flex flex-col gap-6 animate-in fade-in duration-300">
      
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-2">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Department Leadership</h3>
      </div>

      {activeDept.hod ? (
        <div className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-sm border border-slate-200 flex flex-col md:flex-row items-center md:items-start gap-6 relative overflow-hidden flex-shrink-0">
            <Shield className="absolute -right-10 -bottom-10 w-48 h-48 text-indigo-50 opacity-30 pointer-events-none" />
            
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-slate-100 flex items-center justify-center border-4 border-indigo-50 shadow-md flex-shrink-0 z-10 overflow-hidden">
                {activeDept.hod.profilePicture ? (
                    <img src={activeDept.hod.profilePicture} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                    <span className="text-slate-400 font-black text-5xl">{activeDept.hod.name?.charAt(0)}</span>
                )}
            </div>

            <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left z-10 w-full">
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight uppercase tracking-wide">{activeDept.hod.name}</h2>
                <div className="flex flex-wrap gap-2 mt-2 mb-5">
                    <span className="bg-indigo-100 text-indigo-800 border border-indigo-200 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1.5">
                       <Award size={12}/> Head of Department
                    </span>
                    <span className="bg-slate-50 text-slate-600 border border-slate-200 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1.5">
                       <Briefcase size={12}/> {activeDept.hod.designation || 'Faculty Member'}
                    </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl">
                    <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 p-3 rounded-xl flex-1">
                        <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-500 flex items-center justify-center flex-shrink-0"><Mail size={14}/></div>
                        <div className="min-w-0">
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Email Address</p>
                            <a href={`mailto:${activeDept.hod.email}`} className="text-sm font-bold text-slate-700 hover:text-indigo-600 truncate block">{activeDept.hod.email}</a>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 p-3 rounded-xl flex-1">
                        <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-500 flex items-center justify-center flex-shrink-0"><Phone size={14}/></div>
                        <div className="min-w-0 w-full">
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Phone Number</p>
                            <p className="text-sm font-bold text-slate-700 block truncate mt-0.5">{activeDept.hod.phoneNumber || 'Not provided'}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      ) : (
        <div className="text-center py-16 border border-dashed border-slate-200 rounded-[2rem] bg-slate-50 flex-shrink-0">
          <Shield size={48} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-black text-slate-800 mb-1">No HOD Assigned</h3>
          <p className="text-sm text-slate-500 font-medium mb-4">The Institute Admin needs to appoint an HOD for this department via the Admin Management Tab.</p>
        </div>
      )}

      {canEdit && (
          <div className="flex flex-col flex-1 animate-in fade-in duration-500 mt-2">
              
              <div className="flex gap-3 overflow-x-auto custom-scrollbar border-b border-slate-100 pb-4 mb-4 flex-shrink-0">
                  <button 
                      onClick={() => setActiveAdminTab('approvals')} 
                      className={`px-4 py-2 rounded-lg font-bold text-xs transition-all flex items-center gap-2 shadow-sm border ${activeAdminTab === 'approvals' ? 'bg-amber-500 text-white border-amber-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                  >
                      <Shield size={14}/> Approvals 
                      {pendingFaculty.length > 0 && (
                          <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-black ${activeAdminTab === 'approvals' ? 'bg-white text-amber-600' : 'bg-amber-100 text-amber-700'}`}>{pendingFaculty.length}</span>
                      )}
                  </button>
                  <button 
                      onClick={() => setActiveAdminTab('subjects')} 
                      className={`px-4 py-2 rounded-lg font-bold text-xs transition-all flex items-center gap-2 shadow-sm border ${activeAdminTab === 'subjects' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                  >
                      <BookOpen size={14}/> Subject Allocation
                  </button>
              </div>

              <div className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-sm border border-slate-200 mb-6 flex-1 min-h-[400px] flex flex-col overflow-hidden">
                  
                  {activeAdminTab === 'approvals' && (
                      <div className="w-full animate-in fade-in duration-300 flex flex-col h-full">
                          <div className="mb-6 flex-shrink-0">
                              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2"><Shield className="text-amber-500 w-5 h-5"/> Pending Verifications</h3>
                              <p className="text-xs font-medium text-slate-500 mt-1">Review and approve teachers requesting to join the {activeDept.abbreviation} department.</p>
                          </div>

                          <div className="flex-1 overflow-y-auto custom-scrollbar -mr-6 sm:-mr-8 pr-6 sm:pr-8 pb-4 space-y-3">
                              {isFetchingPending ? (
                                  <div className="text-center py-12 text-amber-500"><Loader2 className="w-8 h-8 animate-spin mx-auto"/></div>
                              ) : pendingFaculty.length > 0 ? (
                                  <div className="flex flex-col border-t border-slate-100">
                                      {pendingFaculty.map(user => (
                                          <div key={user._id} className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4 px-6 sm:px-8 border-b border-slate-100 hover:bg-slate-50 transition-all group">
                                              <div className="flex items-center gap-4 w-full md:w-1/3">
                                                <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-lg flex-shrink-0 border border-indigo-100 overflow-hidden">
                                                  {user.profilePicture ? <img src={user.profilePicture} className="w-full h-full object-cover"/> : getInitials(user.name)}
                                                </div>
                                                <div className="flex flex-col justify-center min-w-0">
                                                  <h3 className="text-[15px] font-black text-slate-900 uppercase tracking-wide truncate">{user.name}</h3>
                                                  <p className="text-[11px] text-slate-500 font-medium truncate">{user.email}</p>
                                                </div>
                                              </div>
                                              <div className="flex flex-col md:items-center justify-center w-full md:w-1/4 mt-2 md:mt-0 border-t md:border-t-0 border-slate-100 pt-3 md:pt-0">
                                                <span className="px-3 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest border w-max mb-1.5 bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm">TEACHER</span>
                                                <p className="text-[10px] font-bold text-slate-500">Reg No: <span className="text-slate-900">{user.registrationNo || 'N/A'}</span></p>
                                              </div>
                                              <div className="flex items-center gap-3 w-full md:w-auto md:justify-end flex-shrink-0 mt-3 md:mt-0">
                                                <button onClick={() => handleRejectTeacher(user)} className="flex-1 md:flex-none px-4 py-2 bg-white border border-rose-200 hover:bg-rose-50 text-rose-600 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm"><XCircle size={16} /> Reject</button>
                                                <button onClick={() => setSelectedTeacherForApproval(user)} className="flex-1 md:flex-none px-4 py-2 bg-[#10B981] hover:bg-[#059669] text-white rounded-full text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm active:scale-95"><CheckCircle size={16} /> Approve</button>
                                              </div>
                                          </div>
                                      ))}
                                  </div>
                              ) : (
                                  <div className="text-center py-16 text-slate-400 font-medium bg-slate-50 border-y border-dashed border-slate-200">
                                      <Shield className="w-10 h-10 mx-auto text-emerald-400 mb-3 opacity-50" />
                                      <p className="text-slate-600 font-bold mb-1">All Caught Up!</p>
                                      <p className="text-xs">No pending teachers require verification.</p>
                                  </div>
                              )}
                          </div>
                      </div>
                  )}

                  {activeAdminTab === 'subjects' && (
                      <div className="w-full animate-in fade-in duration-300 flex flex-col h-full">
                          
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4 flex-shrink-0">
                              <div>
                                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2"><BookOpen className="text-emerald-600 w-5 h-5"/> Subject Allocation & Scheduling</h3>
                                  <p className="text-xs font-medium text-slate-500 mt-1">Assign faculty and select teaching days & times.</p>
                              </div>
                              
                              <div className="flex items-center gap-3 bg-slate-50 p-1.5 rounded-xl border border-slate-200 shadow-inner w-full sm:w-auto">
                                  <select className="flex-1 sm:flex-none px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 outline-none shadow-sm cursor-pointer hover:text-emerald-700 transition-colors" value={allocationBatch} onChange={e => setAllocationBatch(e.target.value)}>
                                      <option value="">Select Batch</option>{batches.map(b => <option key={b}>{b}</option>)}
                                  </select>
                                  <select className="flex-1 sm:flex-none px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 outline-none shadow-sm cursor-pointer hover:text-emerald-700 transition-colors" value={allocationSemester} onChange={e => setAllocationSemester(e.target.value)}>
                                      <option value="">Select Sem</option>{semesters.map(s => <option key={s}>{s}</option>)}
                                  </select>
                              </div>
                          </div>

                          <div className="flex-1 overflow-y-auto custom-scrollbar -mr-6 sm:-mr-8 pr-6 sm:pr-8 pb-4">
                              {(!allocationBatch || !allocationSemester) ? (
                                  <div className="text-center py-16 text-slate-400 border border-dashed border-slate-200 rounded-2xl bg-slate-50">
                                      <LayoutDashboard size={32} className="mx-auto mb-3 opacity-40" />
                                      <p className="text-sm font-medium text-slate-500">Select a Target Batch & Semester above to manage assignments.</p>
                                  </div>
                              ) : allocationLoading ? (
                                  <div className="text-center py-16 text-emerald-500"><Loader2 className="w-8 h-8 animate-spin mx-auto"/></div>
                              ) : allocationBlueprint.length > 0 ? (
                                  <div className="space-y-4 pb-4">
                                      {allocationBlueprint.map(subject => {
                                          const isAssigned = !!(subject.assignedTo?._id || subject.assignedTo);

                                          return (
                                          <div key={subject.subjectCode} className={`flex flex-col xl:flex-row xl:items-center justify-between gap-5 p-5 bg-white rounded-2xl shadow-sm transition-all group border ${isAssigned ? 'border-emerald-400' : 'border-slate-200'}`}>
                                              
                                              {/* ✨ EXACT SCREENSHOT MATCH: LEFT SIDE */}
                                              <div className="flex flex-col min-w-0 flex-1 gap-2">
                                                  <div className="flex items-center gap-2">
                                                      <span className="font-black text-slate-900 text-lg whitespace-nowrap">{subject.subjectCode}</span>
                                                      <span className="text-slate-300">|</span>
                                                      <span className="font-bold text-slate-700 text-[15px] leading-snug truncate">{subject.subjectName}</span>
                                                  </div>
                                                  <div className="flex items-center gap-3 mt-0.5">
                                                      <span className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest flex-shrink-0 border ${subject.type === 'Theory' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                                          {subject.type || 'THEORY'}
                                                      </span>
                                                      <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
                                                          {subject.credits || 4} CREDITS
                                                      </span>
                                                  </div>
                                              </div>

                                              {/* ✨ EXACT SCREENSHOT MATCH: MIDDLE & RIGHT SIDE */}
                                              <div className="flex flex-col md:flex-row items-start md:items-center gap-6 w-full xl:w-auto flex-shrink-0 border-t xl:border-t-0 border-slate-100 pt-4 xl:pt-0 mt-1 xl:mt-0">
                                                  
                                                  <div className="w-full md:w-56 flex-shrink-0">
                                                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2 block ml-1">Assign Faculty</label>
                                                      <select 
                                                          value={subject.assignedTo?._id || subject.assignedTo || ""} 
                                                          onChange={(e) => handleSubjectAllocationChange(subject.subjectCode, e.target.value)}
                                                          disabled={isSubmittingAllocation}
                                                          className={`w-full py-2.5 px-3 border rounded-lg text-sm font-bold outline-none transition-colors cursor-pointer shadow-sm ${
                                                              isAssigned 
                                                              ? 'bg-emerald-50 border-emerald-200 text-emerald-800 focus:border-emerald-500' 
                                                              : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 focus:border-emerald-400'
                                                          }`}
                                                      >
                                                          <option value="">-- Unassigned --</option>
                                                          {(activeDept.coreFaculty || []).map(f => (
                                                              <option key={f._id} value={f._id}>{f.name}</option>
                                                          ))}
                                                      </select>
                                                  </div>

                                                  {isAssigned && (
                                                      <div className="w-full md:w-auto flex-shrink-0 animate-in fade-in zoom-in-95 duration-200">
                                                          <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2 block ml-1">Class Schedule</label>
                                                          <div className="flex flex-col sm:flex-row gap-3">
                                                              
                                                              <div className="flex items-center bg-white border border-slate-200 rounded-lg p-1 shadow-sm w-max h-[42px]">
                                                                  {DAYS_OF_WEEK.map(day => {
                                                                      const isSelected = (subject.scheduleDays || []).includes(day.id);
                                                                      return (
                                                                          <button
                                                                              key={day.id}
                                                                              onClick={() => handleToggleDay(subject.subjectCode, day.id)}
                                                                              disabled={isSubmittingAllocation}
                                                                              className={`w-8 h-full flex items-center justify-center text-xs font-bold rounded-md transition-all ${
                                                                                  isSelected 
                                                                                  ? 'bg-indigo-500 text-white shadow-sm' 
                                                                                  : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'
                                                                              }`}
                                                                          >
                                                                              {day.label}
                                                                          </button>
                                                                      );
                                                                  })}
                                                              </div>

                                                              <div className="relative h-[42px] w-full sm:w-48">
                                                                  <Clock size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${subject.scheduleTime ? 'text-indigo-500' : 'text-slate-400'} pointer-events-none`} />
                                                                  <select 
                                                                      value={subject.scheduleTime || ""}
                                                                      onChange={(e) => handleScheduleTimeChange(subject.subjectCode, e.target.value)}
                                                                      disabled={isSubmittingAllocation}
                                                                      className={`w-full h-full py-2 pl-9 pr-3 border rounded-lg text-xs font-bold outline-none transition-colors cursor-pointer shadow-sm appearance-none ${
                                                                          subject.scheduleTime ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                                                                      }`}
                                                                  >
                                                                      <option value="">Time Slot</option>
                                                                      {TIME_SLOTS.map(slot => <option key={slot} value={slot}>{slot}</option>)}
                                                                  </select>
                                                              </div>
                                                          </div>
                                                      </div>
                                                  )}
                                              </div>
                                          </div>
                                      )})}
                                  </div>
                              ) : (
                                  <div className="text-center py-16 text-slate-400 border border-dashed border-slate-200 rounded-xl bg-slate-50">
                                      <p className="text-sm font-medium">No curriculum blueprint found for this semester. Setup the blueprint in the Academics tab first.</p>
                                  </div>
                              )}
                          </div>
                      </div>
                  )}

              </div>
          </div>
      )}

      {selectedTeacherForApproval && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-black text-slate-900 leading-tight">Assign Designation</h2>
                <p className="text-xs font-bold text-slate-500 mt-1">Select an official title for {selectedTeacherForApproval.name}.</p>
              </div>
              <button onClick={() => setSelectedTeacherForApproval(null)} className="p-2 bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-600 rounded-xl transition-colors"><XCircle size={18} /></button>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4 bg-indigo-50 border border-indigo-100 p-4 rounded-2xl mb-2">
                 <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-indigo-600 font-bold text-lg shadow-sm overflow-hidden">
                   {selectedTeacherForApproval.profilePicture ? <img src={selectedTeacherForApproval.profilePicture} className="w-full h-full object-cover rounded-full"/> : getInitials(selectedTeacherForApproval.name)}
                 </div>
                 <div className="flex flex-col">
                   <span className="font-black text-slate-900">{selectedTeacherForApproval.name}</span>
                   <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">{selectedTeacherForApproval.registrationNo}</span>
                 </div>
              </div>

              <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5 ml-1">Official Title</label>
                  <select 
                      className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-500 font-bold text-slate-700 shadow-inner"
                      value={newDesignation}
                      onChange={(e) => setNewDesignation(e.target.value)}
                  >
                      <option value="">-- Select Designation --</option>
                      <option value="Professor">Professor</option>
                      <option value="Associate Professor">Associate Professor</option>
                      <option value="Assistant Professor">Assistant Professor</option>
                      <option value="Guest Faculty">Guest Faculty</option>
                      <option value="Lab Assistant">Lab Assistant</option>
                      <option value="Teaching Assistant">Teaching Assistant</option>
                  </select>
              </div>

              <button 
                  onClick={handleApproveTeacher} 
                  disabled={isSubmittingAssign || !newDesignation}
                  className="w-full py-4 mt-2 bg-emerald-500 text-white font-black rounded-xl hover:bg-emerald-600 shadow-lg disabled:opacity-50 disabled:hover:bg-emerald-500 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                  {isSubmittingAssign ? <Loader2 size={18} className="animate-spin"/> : <CheckCircle size={18}/>} 
                  Confirm & Add to Roster
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}