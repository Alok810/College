import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Building2, Users, BookOpen, Microscope,
  Search, GraduationCap, Briefcase, Activity,
  Shield, Loader2, Megaphone, Download
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { getInstituteDepartments, getDepartmentStudents } from "../api";

// 🟢 IMPORTED COMPONENTS
import FacultyDirectory from "../components/department/FacultyDirectory";
import HodAdministration from "../components/department/HodAdministration";
import OverviewTab from "../components/department/OverviewTab";
import AcademicsTab from "../components/department/AcademicsTab";

const batches = ['2021-2025', '2022-2026', '2023-2027', '2024-2028', '2025-2029', '2026-2030'];

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

  // 🟢 STUDENTS TAB STATE
  const [deptStudents, setDeptStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentBatchFilter, setStudentBatchFilter] = useState('');

  // ✨ 🟢 SCROLL STATE (For Sticky Center Header)
  const [isScrolled, setIsScrolled] = useState(false);

  const handleScroll = (e) => {
    // Triggers when user scrolls past the top profile card (~80px)
    setIsScrolled(e.target.scrollTop > 80);
  };

  const handleTabChange = (tabId) => {
    setSearchParams({ tab: tabId }, { replace: true });
  };

  // ==========================================
  // 🛠️ FETCH DEPARTMENTS
  // ==========================================
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
  // 🛠️ FETCH STUDENTS 
  // ==========================================
  useEffect(() => {
    const fetchStudents = async () => {
      const targetBranch = activeDept?.abbreviation || activeDept?.name;
      
      // 🟢 REMOVED: activeTab === 'students' check so it fetches data globally
      if (targetBranch) { 
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
  }, [activeDept]); // 🟢 REMOVED activeTab from dependencies


  // ==========================================
  // 🛠️ ADMIN/HOD HANDLERS
  // ==========================================
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
            <button onClick={() => handleTabChange('hod')} className={`snap-start px-4 sm:px-6 py-2.5 rounded-lg font-bold text-xs transition-all whitespace-nowrap flex-shrink-0 flex items-center gap-1.5 ${activeTab === 'hod' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}><Shield size={14} /> HOD</button>
            <button onClick={() => handleTabChange('academics')} className={`snap-start px-4 sm:px-6 py-2.5 rounded-lg font-bold text-xs transition-all whitespace-nowrap flex-shrink-0 ${activeTab === 'academics' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}>Academics</button>
            <button onClick={() => { handleTabChange('faculty'); setSearchQuery(""); }} className={`snap-start px-4 sm:px-6 py-2.5 rounded-lg font-bold text-xs transition-all whitespace-nowrap flex-shrink-0 ${activeTab === 'faculty' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}>Faculty</button>
            <button onClick={() => { handleTabChange('students'); setSearchQuery(""); }} className={`snap-start px-4 sm:px-6 py-2.5 rounded-lg font-bold text-xs transition-all whitespace-nowrap flex-shrink-0 ${activeTab === 'students' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}>Students</button>
            <button onClick={() => { handleTabChange('alumni'); setSearchQuery(""); }} className={`snap-start px-4 sm:px-6 py-2.5 rounded-lg font-bold text-xs transition-all whitespace-nowrap flex-shrink-0 ${activeTab === 'alumni' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}>Alumni</button>
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
                  {/* ✨ 🟢 FACULTY SPECIFIC HEADER */}
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

          {/* ✨ 🟢 SCROLL CONTAINER */}
          <div
            className="flex-1 overflow-y-auto custom-scrollbar pr-1 flex flex-col min-h-0"
            onScroll={handleScroll}
          >
            <div className="pt-4 sm:pt-5 w-full flex flex-col flex-1 min-h-0">

              {/* =========================================
                  TAB 1: OVERVIEW 
                  ========================================= */}
              {activeTab === 'overview' && activeDept && (
                <OverviewTab 
                   activeDept={activeDept} 
                   studentCount={deptStudents.length} // 🟢 ADDED THIS PROP
                />
              )}

              {/* =========================================
                  TAB 2: HOD (Head of Department)
                  ========================================= */}
              {activeTab === 'hod' && activeDept && (
                <HodAdministration
                  activeDept={activeDept}
                  onRefresh={fetchDepartments}
                />
              )}

              {/* =========================================
                TAB 3: ACADEMICS & COURSE BLUEPRINT
                ========================================= */}
              {activeTab === 'academics' && activeDept && (
                <AcademicsTab
                  activeDept={activeDept}
                  canEditAcademics={canEditAcademics}
                />
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
                    <div className="text-center py-10 text-indigo-500"><Loader2 className="w-8 h-8 animate-spin mx-auto" /></div>
                  ) : (
                    <div className="flex flex-col gap-3 pb-4 flex-1">
                      {deptStudents
                        .filter(s => studentBatchFilter === '' || s.batch === studentBatchFilter)
                        .filter(s => s.name?.toLowerCase().includes(searchQuery.toLowerCase()) || s.registrationNo?.toLowerCase().includes(searchQuery.toLowerCase()))
                        .map((student, idx) => (
                          <div key={idx} className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-indigo-300 hover:shadow-md transition-all">

                            <div className="flex items-center gap-4 w-full md:w-1/3 pr-8 md:pr-0">
                              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-lg flex-shrink-0 border border-slate-200 overflow-hidden">
                                {student.profilePicture ? <img src={student.profilePicture} className="w-full h-full object-cover" /> : student.name?.charAt(0)}
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
                  <div className="text-center py-16 text-slate-400 animate-in fade-in border border-dashed border-slate-200 rounded-[2rem] bg-slate-50 mt-2">
                    <Megaphone size={40} className="mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-black text-slate-800 mb-1">Coming Soon</h3>
                    <p className="text-sm font-medium">Department notices are being moved to a centralized communication hub.</p>
                  </div>
                </div>
              )}

              {(activeTab === 'alumni' || activeTab === 'research') && (
                <div className="text-center py-16 text-slate-400 animate-in fade-in border border-dashed border-slate-200 rounded-[2rem] bg-slate-50 mt-2">
                  <Activity size={40} className="mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-black text-slate-800 mb-1">Coming Soon</h3>
                  <p className="text-sm font-medium">This section is currently under construction.</p>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}