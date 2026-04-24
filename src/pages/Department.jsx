import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { 
  Building2, Users, BookOpen, Microscope, ChevronRight, 
  Search, GraduationCap, Briefcase, Info, Calendar, 
  FileText, Download, Megaphone, Trophy, Award, 
  Send, Clock, MapPin, ExternalLink, Activity, FileBadge,
  Plus, Edit3, UserCheck, Shield, X, CheckCircle2, Loader2, Trash2, Pencil, UserPlus, Phone, Mail
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getInstituteDepartments, updateDepartment, getCourseBlueprint, saveCourseBlueprint, getDepartmentStudents } from "../api";
import FacultyDirectory from "../components/FacultyDirectory";
import HodAdministration from "../components/HodAdministration"; 

const batches = ['2021-2025', '2022-2026', '2023-2027', '2024-2028', '2025-2029', '2026-2030'];
const semesters = ['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4', 'Semester 5', 'Semester 6', 'Semester 7', 'Semester 8'];

export default function Department() {
  const { authData } = useAuth();
  
  const isAdmin = authData?.userType === "Institute" || authData?.role === "admin" || authData?.role === "superadmin";

  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';
  
  const [searchQuery, setSearchQuery] = useState("");

  // 🟢 BACKEND STATE
  const [departments, setDepartments] = useState([]);
  const [selectedDeptId, setSelectedDeptId] = useState("");
  const [loading, setLoading] = useState(true);

  // 🟢 ACADEMICS/BLUEPRINT STATE
  const [academicBatch, setAcademicBatch] = useState('');
  const [academicSemester, setAcademicSemester] = useState('');
  const [blueprintData, setBlueprintData] = useState([]);
  const [blueprintLoading, setBlueprintLoading] = useState(false);
  const [editingSubjectIndex, setEditingSubjectIndex] = useState(null);

  // 🟢 STUDENTS TAB STATE
  const [deptStudents, setDeptStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentBatchFilter, setStudentBatchFilter] = useState('');

  // 🟢 MODAL STATE (General)
  const [modalConfig, setModalConfig] = useState({ isOpen: false, type: null });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✨ 🟢 SCROLL STATE (For Sticky Center Header)
  const [isScrolled, setIsScrolled] = useState(false);

  const handleScroll = (e) => {
      // Triggers when user scrolls past the top profile card (~80px)
      setIsScrolled(e.target.scrollTop > 80);
  };

  // Temporary Form States
  const [newNotice, setNewNotice] = useState({ title: "", noticeType: "Academic", date: "" });
  const [newCourse, setNewCourse] = useState({ subjectCode: "", subjectName: "", type: "Theory", credits: "", extFull: 70, intFull: 30, passExt: 21, passTotal: 35 });

  const handleTabChange = (tabId) => {
    setSearchParams({ tab: tabId }, { replace: true });
  };

  // ==========================================
  // 🛠️ FETCH DEPARTMENTS
  // ==========================================
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const res = await getInstituteDepartments();
      const fetchedDepts = res.departments || [];
      setDepartments(fetchedDepts);
      
      if (fetchedDepts.length > 0 && !selectedDeptId) {
        setSelectedDeptId(fetchedDepts[0]._id);
      }
    } catch (error) {
      console.error("Failed to load departments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeDept = departments.find(d => d._id === selectedDeptId) || null;
  const isHOD = authData && activeDept && (activeDept.hod?._id === authData._id || activeDept.hod === authData._id);
  const canEditAcademics = isAdmin || isHOD;

  // ==========================================
  // 🛠️ FETCH STUDENTS (STUDENTS TAB)
  // ==========================================
  useEffect(() => {
    const fetchStudents = async () => {
      const targetBranch = activeDept?.abbreviation || activeDept?.name;
      if (activeTab === 'students' && targetBranch) {
        try {
          setStudentsLoading(true);
          const res = await getDepartmentStudents(targetBranch);
          setDeptStudents(res.students || []);
        } catch (error) {
          console.error("Failed to fetch students:", error);
          setDeptStudents([]);
        } finally {
          setStudentsLoading(false);
        }
      }
    };
    fetchStudents();
  }, [activeTab, activeDept]);

  // ==========================================
  // 🛠️ FETCH COURSE BLUEPRINT (ACADEMICS TAB)
  // ==========================================
  useEffect(() => {
    const fetchBlueprint = async () => {
      if (academicBatch && academicSemester && activeDept) {
        try {
          setBlueprintLoading(true);
          const targetBranch = activeDept.abbreviation || activeDept.name;
          const data = await getCourseBlueprint(academicBatch, targetBranch, academicSemester);
          setBlueprintData(data?.subjects || []);
        } catch {
          setBlueprintData([]); 
        } finally {
          setBlueprintLoading(false);
        }
      } else {
        setBlueprintData([]);
      }
    };
    fetchBlueprint();
  }, [academicBatch, academicSemester, activeDept]);

  // ==========================================
  // 🛠️ ADMIN/HOD HANDLERS
  // ==========================================
  const handleAddNotice = async (e) => {
    e.preventDefault();
    if (!activeDept) return;
    setIsSubmitting(true);
    try {
      const updatedNotices = [newNotice, ...(activeDept.notices || [])];
      await updateDepartment(activeDept._id, { notices: updatedNotices });
      
      setModalConfig({ isOpen: false, type: null });
      setNewNotice({ title: "", noticeType: "Academic", date: "" });
      fetchDepartments();
    } catch {
      alert("Failed to post notice.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteNotice = async (noticeId) => {
    if(!window.confirm("Delete this notice?")) return;
    try {
      const updatedNotices = activeDept.notices.filter(n => n._id !== noticeId);
      await updateDepartment(activeDept._id, { notices: updatedNotices });
      fetchDepartments();
    } catch {
      alert("Failed to delete notice.");
    }
  };

  const handleSaveBlueprintSubject = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      let updatedSubjects = [...blueprintData];
      const totalMaxCalc = (parseFloat(newCourse.extFull) || 0) + (parseFloat(newCourse.intFull) || 0);
      const subjectToSave = { ...newCourse, totalMax: totalMaxCalc };

      if (editingSubjectIndex !== null) {
          updatedSubjects[editingSubjectIndex] = subjectToSave;
      } else {
          updatedSubjects.push(subjectToSave);
      }

      const targetBranch = activeDept.abbreviation || activeDept.name;
      await saveCourseBlueprint({
          batch: academicBatch,
          branch: targetBranch,
          semester: academicSemester,
          subjects: updatedSubjects
      });

      setBlueprintData(updatedSubjects);
      setModalConfig({ isOpen: false, type: null });
      setEditingSubjectIndex(null);
    } catch {
      alert("Failed to save course structure.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBlueprintSubject = async (index) => {
      if(!window.confirm("Remove this subject from the official blueprint? This will affect Result calculations.")) return;
      try {
          const updatedSubjects = blueprintData.filter((_, i) => i !== index);
          const targetBranch = activeDept.abbreviation || activeDept.name;
          await saveCourseBlueprint({
              batch: academicBatch,
              branch: targetBranch, 
              semester: academicSemester,
              subjects: updatedSubjects
          });
          setBlueprintData(updatedSubjects);
      } catch {
          alert("Failed to delete subject.");
      }
  };

  const handleDownloadStudentList = () => {
    const filteredStudents = deptStudents
      .filter(s => studentBatchFilter === '' || s.batch === studentBatchFilter)
      .filter(s => s.name?.toLowerCase().includes(searchQuery.toLowerCase()) || s.registrationNo?.toLowerCase().includes(searchQuery.toLowerCase()));

    if (filteredStudents.length === 0) {
      return alert("No students available to download based on your current search/filters.");
    }

    const headers = ["Name", "Registration Number", "Batch"];
    const csvRows = filteredStudents.map(s => [
      `"${s.name || ''}"`,
      `"${s.registrationNo || ''}"`,
      `"${s.batch || ''}"`
    ]);

    const csvContent = [headers.join(","), ...csvRows.map(row => row.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${activeDept.abbreviation || activeDept.name}_Students.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ==========================================
  // 🟢 RENDER
  // ==========================================
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] w-full text-indigo-500">
        <Loader2 className="w-12 h-12 animate-spin mb-4" />
        <p className="font-bold text-slate-500">Loading Departments...</p>
      </div>
    );
  }

  if (departments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] w-full p-6">
        <div className="bg-white p-10 rounded-[2rem] border border-slate-200 shadow-sm max-w-md text-center flex flex-col items-center">
           <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6 border-4 border-indigo-100">
             <Building2 className="w-10 h-10 text-indigo-500" />
           </div>
           <h1 className="text-xl sm:text-2xl font-black text-slate-900 mb-2">No Departments Yet</h1>
           <p className="text-slate-500 font-medium text-sm mb-6">
             The Institute Administration has not created any academic departments yet.
           </p>
           {isAdmin && (
             <p className="text-xs font-bold text-indigo-600 bg-indigo-50 px-4 py-2 rounded-lg">
               Go to Admin {"->"} Departments to create one!
             </p>
           )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 items-center h-[calc(100dvh-60px)] sm:h-[calc(100vh-80px)] w-full max-w-[100vw] overflow-hidden -mt-4 sm:pt-4 pb-20 sm:pb-4">
      <div className="flex flex-col flex-1 w-[94%] sm:w-full max-w-6xl mx-auto h-full min-h-0 gap-3 sm:gap-4 relative">
        
        {/* 🟢 SCROLLABLE TABS */}
        <div className="flex-shrink-0 w-full overflow-hidden bg-white p-1.5 rounded-xl shadow-sm border border-slate-200 z-10">
          <div className="flex gap-1 justify-start sm:justify-center overflow-x-auto custom-scrollbar snap-x snap-mandatory pb-1 sm:pb-0">
            <button onClick={() => handleTabChange('overview')} className={`snap-start px-4 sm:px-6 py-2.5 rounded-lg font-bold text-xs transition-all whitespace-nowrap flex-shrink-0 ${activeTab === 'overview' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}>Overview</button>
            <button onClick={() => handleTabChange('hod')} className={`snap-start px-4 sm:px-6 py-2.5 rounded-lg font-bold text-xs transition-all whitespace-nowrap flex-shrink-0 flex items-center gap-1.5 ${activeTab === 'hod' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}><Shield size={14}/> HOD</button>
            <button onClick={() => handleTabChange('academics')} className={`snap-start px-4 sm:px-6 py-2.5 rounded-lg font-bold text-xs transition-all whitespace-nowrap flex-shrink-0 ${activeTab === 'academics' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}>Academics</button>
            <button onClick={() => {handleTabChange('faculty'); setSearchQuery("");}} className={`snap-start px-4 sm:px-6 py-2.5 rounded-lg font-bold text-xs transition-all whitespace-nowrap flex-shrink-0 ${activeTab === 'faculty' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}>Faculty</button>
            <button onClick={() => {handleTabChange('students'); setSearchQuery("");}} className={`snap-start px-4 sm:px-6 py-2.5 rounded-lg font-bold text-xs transition-all whitespace-nowrap flex-shrink-0 ${activeTab === 'students' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}>Students</button>
            <button onClick={() => {handleTabChange('alumni'); setSearchQuery("");}} className={`snap-start px-4 sm:px-6 py-2.5 rounded-lg font-bold text-xs transition-all whitespace-nowrap flex-shrink-0 ${activeTab === 'alumni' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}>Alumni</button>
            <button onClick={() => handleTabChange('research')} className={`snap-start px-4 sm:px-6 py-2.5 rounded-lg font-bold text-xs transition-all whitespace-nowrap flex-shrink-0 ${activeTab === 'research' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}>Research</button>
            <button onClick={() => handleTabChange('notices')} className={`snap-start px-4 sm:px-6 py-2.5 rounded-lg font-bold text-xs transition-all whitespace-nowrap flex-shrink-0 ${activeTab === 'notices' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}>Notice Board</button>
          </div>
        </div>

        {/* 🟢 MAIN CONTENT CARD */}
        <div className="flex-1 bg-white shadow-sm rounded-[1.5rem] p-4 sm:p-6 border border-slate-100 flex flex-col min-h-0 overflow-hidden">
          
          {/* ✨ 🟢 DYNAMIC HEADER AREA */}
          {/* Hides the entire header completely if viewing an individual Faculty Profile Card */}
          {!(activeTab === 'faculty' && searchParams.get('facultyId')) && (
            <div className="flex flex-col lg:flex-row lg:items-center justify-between border-b border-slate-100 pb-4 mb-0 gap-4 flex-shrink-0 relative z-20 bg-white">
              
              {/* ✨ 🟢 MIDDLE STICKY HOD PROFILE */}
              {activeTab === 'hod' && isScrolled && activeDept?.hod && (
                  <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300 bg-white/90 backdrop-blur-sm px-4 py-1.5 rounded-full border border-slate-200 shadow-sm pointer-events-none z-50">
                      <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center border border-indigo-100 shadow-sm overflow-hidden flex-shrink-0">
                          {activeDept.hod.profilePicture ? (
                              <img src={activeDept.hod.profilePicture} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                              <span className="text-indigo-400 font-black text-xs">{activeDept.hod.name?.charAt(0) || 'H'}</span>
                          )}
                      </div>
                      <div className="flex flex-col">
                          <h3 className="font-black text-slate-900 text-sm whitespace-nowrap leading-tight truncate max-w-[150px]">{activeDept.hod.name}</h3>
                          <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Head of Department</span>
                      </div>
                  </div>
              )}

              {activeTab === 'students' ? (
                <>
                  {/* ✨ 🟢 STUDENTS SPECIFIC HEADER */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-[0.8rem] bg-gradient-to-br from-teal-100 to-emerald-100 flex items-center justify-center border border-teal-200 flex-shrink-0 shadow-inner">
                      <Users className="text-teal-600 w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div className="overflow-hidden">
                      <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-none truncate">
                        Student Roster
                      </h1>
                      <p className="text-[10px] sm:text-xs text-slate-500 font-medium mt-1 truncate">
                        {activeDept?.name}
                      </p>
                    </div>
                  </div>

                  {/* STUDENTS SPECIFIC CONTROLS */}
                  <div className="flex flex-col sm:flex-row items-center gap-2 w-full lg:w-auto">
                    <select 
                      className="w-full sm:w-32 p-2 border border-slate-200 rounded-lg text-xs outline-none bg-slate-50 font-bold focus:border-indigo-400"
                      value={selectedDeptId}
                      onChange={(e) => setSelectedDeptId(e.target.value)}
                    >
                      {departments.map(dept => (
                        <option key={dept._id} value={dept._id}>{dept.abbreviation || dept.name}</option>
                      ))}
                    </select>

                    <select 
                      className="w-full sm:w-32 p-2 border border-slate-200 rounded-lg text-xs outline-none bg-slate-50 font-bold focus:border-indigo-400" 
                      value={studentBatchFilter} 
                      onChange={e => setStudentBatchFilter(e.target.value)}
                    >
                      <option value="">All Batches</option>
                      {batches.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                    
                    <div className="relative w-full sm:w-48">
                      <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        type="text" 
                        placeholder="Search students..." 
                        className="w-full p-2 pl-8 border border-slate-200 rounded-lg text-xs outline-none bg-slate-50 focus:bg-white font-bold text-slate-700" 
                        value={searchQuery} 
                        onChange={(e) => setSearchQuery(e.target.value)} 
                      />
                    </div>

                    <button 
                      onClick={handleDownloadStudentList}
                      disabled={deptStudents.length === 0 || studentsLoading}
                      title="Download CSV"
                      className="w-full sm:w-auto p-2 flex items-center justify-center bg-slate-900 hover:bg-black text-white rounded-lg shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                    >
                      <Download size={16} />
                    </button>
                  </div>
                </>
              ) : activeTab === 'faculty' ? (
                
                <>
                  {/* ✨ 🟢 FACULTY SPECIFIC HEADER (Restored!) */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-[0.8rem] bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center border border-indigo-200 flex-shrink-0 shadow-inner">
                      <Briefcase className="text-indigo-600 w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div className="overflow-hidden">
                      <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-none truncate">
                        Faculty Roster
                      </h1>
                      <p className="text-[10px] sm:text-xs text-slate-500 font-medium mt-1 truncate">
                        {activeDept?.name}
                      </p>
                    </div>
                  </div>

                  {/* FACULTY SPECIFIC CONTROLS */}
                  <div className="flex flex-col sm:flex-row items-center gap-2 w-full lg:w-auto">
                    <select 
                      className="w-full sm:w-48 p-2 border border-slate-200 rounded-lg text-xs outline-none bg-slate-50 font-bold focus:border-indigo-400"
                      value={selectedDeptId}
                      onChange={(e) => setSelectedDeptId(e.target.value)}
                    >
                      {departments.map(dept => (
                        <option key={dept._id} value={dept._id}>{dept.name} ({dept.abbreviation})</option>
                      ))}
                    </select>

                    <div className="relative w-full sm:w-64">
                      <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        type="text" 
                        placeholder="Search roster..." 
                        className="w-full p-2 pl-8 border border-slate-200 rounded-lg text-xs outline-none bg-slate-50 focus:bg-white font-bold text-slate-700" 
                        value={searchQuery} 
                        onChange={(e) => setSearchQuery(e.target.value)} 
                      />
                    </div>
                  </div>
                </>

              ) : (
                <>
                  {/* ✨ 🟢 DEFAULT HEADER (Overview, Academics, HOD, Notices) */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-[0.8rem] bg-gradient-to-br from-indigo-100 to-blue-100 flex items-center justify-center border border-indigo-200 flex-shrink-0 shadow-inner">
                      <Building2 className="text-indigo-600 w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div className="overflow-hidden">
                      <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-none truncate">
                        Departments {activeDept?.abbreviation && <span className="text-indigo-600 ml-1">({activeDept.abbreviation})</span>}
                      </h1>
                      <p className="text-[10px] sm:text-xs text-slate-500 font-medium mt-1 truncate">Academic Branches</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full md:w-auto">
                    {canEditAcademics && (
                      <span className="hidden lg:flex items-center gap-1.5 bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest flex-shrink-0">
                        <Shield size={12} /> {isHOD ? "HOD Access" : "Admin Mode"}
                      </span>
                    )}
                    <select 
                      className="w-full md:w-64 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-400 font-bold text-sm text-slate-800 shadow-sm transition-colors cursor-pointer z-10"
                      value={selectedDeptId}
                      onChange={(e) => setSelectedDeptId(e.target.value)}
                    >
                      {departments.map(dept => (
                        <option key={dept._id} value={dept._id}>{dept.name} ({dept.abbreviation})</option>
                      ))}
                    </select>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ✨ 🟢 SCROLL CONTAINER (pt-5 added to shift content down slightly so headers don't overlap) */}
          <div 
            className="flex-1 overflow-y-auto custom-scrollbar pr-1 flex flex-col min-h-0"
            onScroll={handleScroll}
          >
            <div className="pt-4 sm:pt-5 w-full flex flex-col flex-1 min-h-0">
              
              {/* =========================================
                  TAB 1: OVERVIEW 
                  ========================================= */}
              {activeTab === 'overview' && activeDept && (
                <div className="w-full flex flex-col gap-6 animate-in fade-in duration-300">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                      <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-white shadow-sm flex items-center gap-3 sm:gap-4 hover:border-indigo-300 transition-colors group">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-blue-500 bg-opacity-10 text-blue-500 group-hover:scale-105 transition-transform"><Users className="w-5 h-5 sm:w-6 sm:h-6" /></div>
                        <div><p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Faculty</p><h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">{activeDept.stats?.totalFaculty || 0}</h3></div>
                      </div>
                      <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-white shadow-sm flex items-center gap-3 sm:gap-4 hover:border-indigo-300 transition-colors group">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-emerald-500 bg-opacity-10 text-emerald-500 group-hover:scale-105 transition-transform"><GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" /></div>
                        <div><p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Students</p><h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">{activeDept.stats?.activeStudents || 0}</h3></div>
                      </div>
                      <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-white shadow-sm flex items-center gap-3 sm:gap-4 hover:border-indigo-300 transition-colors group">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-purple-500 bg-opacity-10 text-purple-500 group-hover:scale-105 transition-transform"><Microscope className="w-5 h-5 sm:w-6 sm:h-6" /></div>
                        <div><p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider">Research Labs</p><h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">{activeDept.stats?.researchLabs || 0}</h3></div>
                      </div>
                      <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-white shadow-sm flex items-center gap-3 sm:gap-4 hover:border-indigo-300 transition-colors group">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-amber-500 bg-opacity-10 text-amber-500 group-hover:scale-105 transition-transform"><Trophy className="w-5 h-5 sm:w-6 sm:h-6" /></div>
                        <div><p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider">Placement Rate</p><h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">{activeDept.stats?.placementRate || "0%"}</h3></div>
                      </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-indigo-50/40 rounded-2xl p-5 sm:p-6 border border-indigo-100 flex flex-col justify-center relative group">
                      <h3 className="text-sm font-black text-indigo-900 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Info className="w-4 h-4 text-indigo-500" /> About {activeDept.name}
                      </h3>
                      <p className="text-sm font-medium text-slate-600 leading-relaxed whitespace-pre-wrap">
                        {activeDept.about || "No description provided for this department yet."}
                      </p>
                    </div>

                    <div className="lg:col-span-1 bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col gap-3">
                      <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Student Services</h3>
                      <button className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 transition-colors group text-left">
                        <span className="text-sm font-bold text-slate-700 group-hover:text-indigo-700">Request Leave (HOD)</span>
                        <Send size={16} className="text-slate-400 group-hover:text-indigo-500" />
                      </button>
                      <button className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 transition-colors group text-left">
                        <span className="text-sm font-bold text-slate-700 group-hover:text-emerald-700">Bonafide Certificate</span>
                        <FileBadge size={16} className="text-slate-400 group-hover:text-emerald-500" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* =========================================
                  TAB 2: HOD (Head of Department)
                  ========================================= */}
              {activeTab === 'hod' && activeDept && (
                <HodAdministration 
                    activeDept={activeDept} 
                    canEdit={canEditAcademics} 
                    onRefresh={fetchDepartments} 
                    isScrolled={isScrolled}
                />
              )}

              {/* =========================================
                  TAB 3: ACADEMICS & COURSE BLUEPRINT
                  ========================================= */}
              {activeTab === 'academics' && activeDept && (
                <div className="w-full flex flex-col gap-4 animate-in fade-in duration-300">
                  
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-slate-100 pb-3 mb-2 gap-3 flex-shrink-0">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex-shrink-0">Curriculum Blueprint</h3>
                    
                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                      <select 
                        className="w-full sm:w-auto p-2.5 border border-slate-200 rounded-lg text-xs outline-none bg-slate-50 font-bold focus:border-indigo-400" 
                        value={academicBatch} 
                        onChange={e => setAcademicBatch(e.target.value)}
                      >
                        <option value="">Select Batch</option>
                        {batches.map(b => <option key={b}>{b}</option>)}
                      </select>
                      
                      <select 
                        className="w-full sm:w-auto p-2.5 border border-slate-200 rounded-lg text-xs outline-none bg-slate-50 font-bold focus:border-indigo-400" 
                        value={academicSemester} 
                        onChange={e => setAcademicSemester(e.target.value)}
                      >
                        <option value="">Select Semester</option>
                        {semesters.map(s => <option key={s}>{s}</option>)}
                      </select>

                      {canEditAcademics && (
                        <button 
                          onClick={() => {
                            if(!academicBatch || !academicSemester) return alert("Select a Batch and Semester first!");
                            setNewCourse({ subjectCode: "", subjectName: "", type: "Theory", credits: "", extFull: 70, intFull: 30, passExt: 21, passTotal: 35 });
                            setEditingSubjectIndex(null);
                            setModalConfig({ isOpen: true, type: 'course' });
                          }} 
                          className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white border border-emerald-200 px-4 py-2.5 rounded-lg text-xs font-bold transition-colors shadow-sm w-full sm:w-auto justify-center"
                        >
                          <Plus size={14} /> Add Subject
                        </button>
                      )}
                    </div>
                  </div>

                  {academicBatch && academicSemester ? (
                    blueprintLoading ? (
                      <div className="text-center py-10 text-indigo-500"><Loader2 className="w-8 h-8 animate-spin mx-auto"/></div>
                    ) : (
                      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
                        <div className="overflow-x-auto custom-scrollbar">
                          <table className="w-full text-left text-sm min-w-[700px]">
                            <thead className="bg-slate-50 border-b border-slate-200 text-[10px] text-slate-500 uppercase tracking-widest font-black">
                              <tr>
                                <th className="p-4 w-24">Code</th>
                                <th className="p-4">Subject Name</th>
                                <th className="p-4 text-center">Type</th>
                                <th className="p-4 text-center">Cr.</th>
                                <th className="p-4 text-center">Ext/Int/Total Max</th>
                                <th className="p-4 text-center text-emerald-600">Pass Mark</th>
                                {canEditAcademics && <th className="p-4 text-right w-24">Action</th>}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {blueprintData.map((course, idx) => (
                                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                  <td className="p-4 font-black text-slate-800">{course.subjectCode}</td>
                                  <td className="p-4 font-bold text-slate-600">{course.subjectName || '-'}</td>
                                  <td className="p-4 text-center">
                                    <span className={`text-[9px] px-2 py-0.5 rounded-md font-black uppercase tracking-wider border ${course.type === 'Core' || course.type === 'Theory' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                                      {course.type}
                                    </span>
                                  </td>
                                  <td className="p-4 text-center font-black text-indigo-600">{course.credits}</td>
                                  <td className="p-4 text-center text-xs font-bold text-slate-500">{course.extFull} / {course.intFull} / {course.totalMax}</td>
                                  <td className="p-4 text-center text-xs font-bold text-emerald-600">{course.passExt || '-'} / {course.passTotal}</td>
                                  
                                  {canEditAcademics && (
                                    <td className="p-4 text-right whitespace-nowrap">
                                      <button onClick={() => {
                                        setNewCourse(course);
                                        setEditingSubjectIndex(idx);
                                        setModalConfig({ isOpen: true, type: 'course' });
                                      }} className="text-indigo-400 hover:text-indigo-600 p-1.5 transition-colors"><Pencil size={16}/></button>
                                      <button onClick={() => handleDeleteBlueprintSubject(idx)} className="text-slate-400 hover:text-rose-500 p-1.5 transition-colors"><Trash2 size={16}/></button>
                                    </td>
                                  )}
                                </tr>
                              ))}
                              {blueprintData.length === 0 && (
                                  <tr><td colSpan={canEditAcademics ? 7 : 6} className="p-8 text-center text-slate-400 font-medium">No blueprint configured for this batch & semester.</td></tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )
                  ) : (
                    <div className="text-center py-12 text-slate-400 border border-dashed border-slate-200 rounded-xl">
                      <BookOpen size={32} className="mx-auto mb-3 opacity-50" />
                      <p className="text-sm font-medium">Select a Batch and Semester to view the curriculum blueprint.</p>
                    </div>
                  )}
                </div>
              )}

              {/* =========================================
                  TAB 4: FACULTY DIRECTORY
                  ========================================= */}
              {activeTab === 'faculty' && activeDept && (
                <FacultyDirectory 
                  activeDept={activeDept} 
                  canEdit={false} 
                  onRefresh={fetchDepartments} 
                  searchQuery={searchQuery}
                />
              )}

              {/* =========================================
                  TAB 5: STUDENTS DIRECTORY
                  ========================================= */}
              {activeTab === 'students' && activeDept && (
                <div className="w-full flex flex-col gap-4 animate-in fade-in duration-300 h-full min-h-0">
                  {studentsLoading ? (
                    <div className="text-center py-10 text-indigo-500"><Loader2 className="w-8 h-8 animate-spin mx-auto"/></div>
                  ) : (
                    <div className="flex flex-col gap-3 pb-4 flex-1">
                      {deptStudents
                        .filter(s => studentBatchFilter === '' || s.batch === studentBatchFilter)
                        .filter(s => s.name?.toLowerCase().includes(searchQuery.toLowerCase()) || s.registrationNo?.toLowerCase().includes(searchQuery.toLowerCase()))
                        .map((student, idx) => (
                        <div key={idx} className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-indigo-300 hover:shadow-md transition-all">
                          
                          <div className="flex items-center gap-4 w-full md:w-1/3 pr-8 md:pr-0">
                            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-lg flex-shrink-0 border border-slate-200 overflow-hidden">
                              {student.profilePicture ? <img src={student.profilePicture} className="w-full h-full object-cover"/> : student.name?.charAt(0)}
                            </div>
                            <div className="flex flex-col justify-center min-w-0">
                              <h3 className="text-[15px] font-black text-slate-900 uppercase tracking-wide truncate">{student.name}</h3>
                              <p className="text-[13px] text-slate-500 font-medium truncate">{student.email || 'Student'}</p>
                            </div>
                          </div>

                          <div className="flex flex-col md:items-center justify-center w-full md:w-1/4 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                            <span className="px-3 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest border w-max mb-1.5 bg-teal-50 text-[#059669] border-[#A7F3D0]">
                              STUDENT
                            </span>
                            <p className="text-[12px] font-bold text-slate-500">Reg No: <span className="text-slate-900">{student.registrationNo || 'N/A'}</span></p>
                          </div>

                          <div className="flex items-center md:justify-end w-full md:w-[20%] pt-1 md:pt-0">
                            <p className="text-[12px] font-bold text-slate-500 uppercase tracking-wide">
                              Batch: <span className="text-indigo-600 ml-1">{student.batch || 'N/A'}</span>
                            </p>
                          </div>
                        </div>
                      ))}
                      {deptStudents.length === 0 && (
                        <div className="col-span-full text-center py-16 bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
                          <Users size={32} className="mx-auto mb-3 opacity-50 text-slate-400" />
                          <p className="text-sm font-medium text-slate-500">No students found.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* =========================================
                  TAB 6: NOTICE BOARD
                  ========================================= */}
              {activeTab === 'notices' && activeDept && (
                <div className="w-full flex flex-col gap-4 animate-in fade-in duration-300">
                  
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-amber-50 border border-amber-200 p-4 rounded-2xl shadow-sm flex-shrink-0">
                    <div className="flex items-center gap-3 text-amber-800">
                      <Megaphone size={20} className="flex-shrink-0 text-amber-600" />
                      <div>
                        <h3 className="text-sm font-black leading-tight">Department Notice Board</h3>
                        <p className="text-[10px] font-bold text-amber-600/80 uppercase tracking-widest mt-0.5">Official Announcements</p>
                      </div>
                    </div>
                    {canEditAcademics && (
                      <button onClick={() => setModalConfig({ isOpen: true, type: 'notice' })} className="w-full sm:w-auto bg-white text-amber-700 border border-amber-200 hover:bg-amber-600 hover:text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-colors shadow-sm flex items-center justify-center gap-1.5">
                        <Plus size={14}/> Post Notice
                      </button>
                    )}
                  </div>

                  <div className="flex flex-col gap-3 mt-2">
                    {(activeDept.notices || []).map((notice, idx) => (
                      <div key={idx} className="p-4 sm:p-5 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-center justify-between hover:border-indigo-300 transition-colors group relative">
                        <div className="flex items-start gap-3 min-w-0 pr-6 sm:pr-0">
                          <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${notice.noticeType === 'Exam' ? 'bg-rose-500' : notice.noticeType === 'Event' ? 'bg-purple-500' : 'bg-blue-500'}`}></div>
                          <div>
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1 block">{notice.noticeType}</span>
                            <h4 className="font-bold text-slate-800 text-sm group-hover:text-indigo-700 transition-colors leading-snug">{notice.title}</h4>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-5 sm:ml-0">
                          <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-lg whitespace-nowrap">
                            <Clock size={12} /> {notice.date}
                          </span>
                          {canEditAcademics && <button onClick={() => handleDeleteNotice(notice._id)} className="text-slate-300 hover:text-rose-500 p-2 transition-colors"><Trash2 size={16}/></button>}
                        </div>
                      </div>
                    ))}
                    {(!activeDept.notices || activeDept.notices.length === 0) && (
                      <div className="text-center py-10 text-slate-400">
                        <Megaphone size={32} className="mx-auto mb-3 opacity-50" />
                        <p className="text-sm font-medium">No new notices at the moment.</p>
                      </div>
                    )}
                  </div>

                </div>
              )}
              
              {(activeTab === 'alumni' || activeTab === 'research') && (
                  <div className="text-center py-16 text-slate-400 animate-in fade-in">
                      <Activity size={40} className="mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-black text-slate-800 mb-1">Coming Soon</h3>
                      <p className="text-sm font-medium">This section is currently under construction.</p>
                  </div>
              )}

            </div>
          </div>
        </div>
      </div>

      {/* ==========================================
          🟢 ADMIN MODALS (General)
          ========================================== */}
      {modalConfig.isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-2xl p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-black text-slate-900 leading-tight">
                  {modalConfig.type === 'notice' && "Post New Notice"}
                  {modalConfig.type === 'course' && (editingSubjectIndex !== null ? "Edit Subject Rule" : "Add Subject Rule")}
                </h2>
                <p className="text-xs font-bold text-slate-500 mt-1">
                  {activeDept?.name} • {academicBatch} • {academicSemester}
                </p>
              </div>
              <button onClick={() => setModalConfig({ isOpen: false, type: null })} className="p-2 bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-600 rounded-xl transition-colors"><X size={18} /></button>
            </div>

            {/* Notice Form */}
            {modalConfig.type === 'notice' && (
              <form onSubmit={handleAddNotice} className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Notice Title / Content</label>
                  <textarea required rows="3" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-bold text-slate-700 resize-none" placeholder="What do students need to know?" value={newNotice.title} onChange={e => setNewNotice({...newNotice, title: e.target.value})}></textarea>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Category</label>
                    <select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-bold text-slate-700" value={newNotice.noticeType} onChange={e => setNewNotice({...newNotice, noticeType: e.target.value})}>
                      <option value="Academic">Academic</option>
                      <option value="Exam">Exam</option>
                      <option value="Event">Event</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Date</label>
                    <input type="text" required placeholder="e.g. May 20, 2026" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-bold text-slate-700" value={newNotice.date} onChange={e => setNewNotice({...newNotice, date: e.target.value})} />
                  </div>
                </div>
                <button type="submit" disabled={isSubmitting} className="w-full py-3.5 bg-indigo-600 text-white font-extrabold rounded-xl hover:bg-indigo-700 shadow-md transition-colors mt-4 flex justify-center items-center gap-2">
                  {isSubmitting ? <Loader2 size={16} className="animate-spin"/> : <Send size={16}/>} Publish Notice
                </button>
              </form>
            )}

            {/* Course Blueprint Form */}
            {modalConfig.type === 'course' && (
              <form onSubmit={handleSaveBlueprintSubject} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Subject Code</label>
                    <input type="text" required placeholder="e.g. CS101" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-black text-slate-700" value={newCourse.subjectCode} onChange={e => setNewCourse({...newCourse, subjectCode: e.target.value})} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Subject Name</label>
                    <input type="text" required placeholder="e.g. Data Structures" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-bold text-slate-700" value={newCourse.subjectName} onChange={e => setNewCourse({...newCourse, subjectName: e.target.value})} />
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Type</label>
                    <select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-bold text-slate-700" value={newCourse.type} onChange={e => setNewCourse({...newCourse, type: e.target.value})}>
                      <option value="Theory">Theory</option>
                      <option value="Practical">Practical</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Credits</label>
                    <input type="number" required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-bold text-slate-700" value={newCourse.credits} onChange={e => setNewCourse({...newCourse, credits: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Ext. Max</label>
                    <input type="number" required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-bold text-slate-700" value={newCourse.extFull} onChange={e => setNewCourse({...newCourse, extFull: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Int. Max</label>
                    <input type="number" required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-bold text-slate-700" value={newCourse.intFull} onChange={e => setNewCourse({...newCourse, intFull: e.target.value})} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 mt-2">
                  <div>
                    <label className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block mb-1">Pass Mark (External)</label>
                    <input type="number" className="w-full p-3 bg-emerald-50 border border-emerald-200 rounded-xl outline-none focus:border-emerald-500 font-bold text-emerald-800" value={newCourse.passExt} onChange={e => setNewCourse({...newCourse, passExt: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block mb-1">Pass Mark (Total)</label>
                    <input type="number" required className="w-full p-3 bg-emerald-50 border border-emerald-200 rounded-xl outline-none focus:border-emerald-500 font-bold text-emerald-800" value={newCourse.passTotal} onChange={e => setNewCourse({...newCourse, passTotal: e.target.value})} />
                  </div>
                </div>
                <button type="submit" disabled={isSubmitting} className="w-full py-3.5 bg-emerald-600 text-white font-extrabold rounded-xl hover:bg-emerald-700 shadow-md transition-colors mt-4 flex justify-center items-center gap-2">
                  {isSubmitting ? <Loader2 size={18} className="animate-spin"/> : <CheckCircle2 size={18}/>} 
                  {editingSubjectIndex !== null ? "Update Subject" : "Add Subject"}
                </button>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}