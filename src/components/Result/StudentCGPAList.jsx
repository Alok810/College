import React, { useState, useMemo, useEffect } from 'react';
import { Search, ArrowUpDown, ChevronDown, ChevronUp, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext'; 

const StudentCGPAList = ({ results = [], users = [], batches = [], branches = [] }) => {
  const { authData } = useAuth(); 
  
  // Check if user is an admin/institute
  const isOfficial = authData?.userType === "Institute" || authData?.role === "admin" || authData?.role === "superadmin";

  const [manageSearch, setManageSearch] = useState('');
  const [manageBatch, setManageBatch] = useState('');
  const [manageBranch, setManageBranch] = useState('');
  const [sortOrder, setSortOrder] = useState('cgpaDesc');
  const [expandedStudentId, setExpandedStudentId] = useState(null);

  // 🟢 Local Pagination State
  const [localPage, setLocalPage] = useState(1);
  const itemsPerPage = 50; 

  const toggleExpand = (studentId) => setExpandedStudentId(prev => prev === studentId ? null : studentId);

  // 1. Group and calculate CGPAs
  const studentCGPAs = useMemo(() => {
    const map = new Map();
    
    (results || []).forEach(r => {
      // 🟢 Prevent students from seeing unpublished drafts
      if (!isOfficial && r.isPublished === false) return;

      const sId = r.student?._id || r.student;
      if (!sId) return;
      
      // Get student object safely
      let studentObj = users.find(u => u._id === sId);
      if (!studentObj && sId === authData?._id) studentObj = authData;

      if (!studentObj && r.student && typeof r.student === 'object' && r.student.name) {
        studentObj = r.student;
      }

      if (!studentObj) {
        studentObj = { _id: sId, name: 'Unknown Student', registrationNo: 'N/A', batch: 'N/A', branch: 'N/A' };
      }

      if (!map.has(sId)) {
        map.set(sId, { student: studentObj, totalPoints: 0, totalCredits: 0, semesters: [] });
      }
      const sData = map.get(sId);
      
      let semesterCredits = r.subjects?.reduce((sum, sub) => sum + (parseFloat(sub.credits) || 0), 0) || 0;
      if (semesterCredits === 0) semesterCredits = 1; // Fallback if CSV had no credits

      sData.totalCredits += semesterCredits;
      sData.totalPoints += (parseFloat(r.sgpa) || 0) * semesterCredits;
      
      if (!sData.semesters.find(s => s.name === r.semester)) {
          sData.semesters.push({ name: r.semester, sgpa: parseFloat(r.sgpa) || 0, remarks: r.remarks });
      }
    });

    return Array.from(map.values()).map(data => ({
      ...data,
      cgpa: data.totalCredits > 0 ? (data.totalPoints / data.totalCredits).toFixed(2) : "0.00"
    }));
  }, [results, users, authData, isOfficial]);

  // 2. Filter based on role and search terms
  const filteredStudentCGPAs = useMemo(() => {
    return studentCGPAs.filter(item => {
      if (!isOfficial) {
        if (item.student?.batch !== authData?.batch || item.student?.branch !== authData?.branch) return false;
      }

      if (manageSearch) {
        const searchLower = manageSearch.toLowerCase();
        const nameMatch = item.student.name?.toLowerCase().includes(searchLower);
        const regMatch = item.student.registrationNo?.toLowerCase().includes(searchLower);
        if (!nameMatch && !regMatch) return false;
      }
      
      if (isOfficial) {
        if (manageBatch && item.student?.batch !== manageBatch) return false;
        if (manageBranch && item.student?.branch !== manageBranch) return false;
      }
      
      return true;
    });
  }, [studentCGPAs, isOfficial, authData, manageSearch, manageBatch, manageBranch]);

  // 3. Sort the filtered results
  const sortedAndFilteredCGPAs = useMemo(() => {
    const sorted = [...filteredStudentCGPAs];
    sorted.sort((a, b) => {
      if (sortOrder === 'alpha') return (a.student.name || '').localeCompare(b.student.name || '');
      if (sortOrder === 'cgpaDesc') return parseFloat(b.cgpa) - parseFloat(a.cgpa);
      if (sortOrder === 'cgpaAsc') return parseFloat(a.cgpa) - parseFloat(b.cgpa);
      return 0;
    });
    return sorted;
  }, [filteredStudentCGPAs, sortOrder]);

  // 4. Reset pagination to Page 1 if any filter changes
  useEffect(() => {
    setLocalPage(1);
  }, [manageSearch, manageBatch, manageBranch, sortOrder]);

  // 5. Apply Client-Side Slicing for Pagination
  const computedTotalPages = Math.ceil(sortedAndFilteredCGPAs.length / itemsPerPage) || 1;
  const paginatedCGPAs = sortedAndFilteredCGPAs.slice((localPage - 1) * itemsPerPage, localPage * itemsPerPage);

  return (
    // 🟢 Removed 'gap' here to prevent spacing conflicts with our new margin
    <div className="flex-1 flex flex-col min-h-0 w-full relative pt-2 sm:pt-4">
      
      {/* 🟢 THE STICKY HEADER */}
      {/* Kept your top-3.5 sm:top-4 setting so the edges don't get chopped off! */}
      <div className="sticky top-3.5 sm:top-4 z-30 bg-white/95 backdrop-blur-md shadow-sm rounded-xl sm:rounded-[1.5rem] p-3 sm:p-5 border border-slate-200 flex flex-col flex-shrink-0 mx-[1px]">
        
        <div className={`flex flex-col ${!isOfficial ? 'lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4' : 'border-b border-slate-100 pb-3 sm:pb-4 mb-3 sm:mb-4 gap-3'}`}>

          {/* Title Area */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-[0.8rem] bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center border border-blue-200 shrink-0">
              <Users className="text-blue-600 w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <h1 className="text-[16px] sm:text-xl font-extrabold text-slate-900 leading-tight truncate">
                {isOfficial ? 'All Student Rankings' : 'Class Rankings'}
              </h1>
              <p className="text-[9px] sm:text-xs text-slate-500 font-bold mt-0.5 truncate">
                {isOfficial ? 'Global CGPA Database' : `Your Peers: ${authData?.batch || 'Batch'} • ${authData?.branch || 'Branch'}`}
              </p>
            </div>
          </div>

          {/* STUDENT FILTERS (Mobile Grid) */}
          {!isOfficial && (
            <div className="grid grid-cols-2 gap-2 sm:gap-3 w-full lg:w-auto lg:flex lg:flex-row">
              {/* Search Bar */}
              <div className="relative w-full">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search Reg..." 
                  value={manageSearch} 
                  onChange={e=>setManageSearch(e.target.value)} 
                  className="w-full py-2 pl-8 pr-2 border border-slate-200 rounded-lg text-xs sm:text-sm outline-none focus:border-indigo-400 bg-slate-50 focus:bg-white transition-colors h-[38px]" 
                />
              </div>
              
              {/* Sort Dropdown */}
              <div className="relative w-full">
                <ArrowUpDown size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <select 
                  className="w-full py-2 pl-8 pr-6 border border-slate-200 rounded-lg text-xs sm:text-sm outline-none bg-slate-50 focus:bg-white focus:border-indigo-400 font-bold text-slate-700 transition-colors appearance-none h-[38px]" 
                  value={sortOrder} 
                  onChange={e=>setSortOrder(e.target.value)}
                >
                  <option value="cgpaDesc">High CGPA</option>
                  <option value="cgpaAsc">Low CGPA</option>
                  <option value="alpha">Sort A-Z</option>
                </select>
                <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
          )}
        </div>

        {/* ADMIN FILTERS */}
        {isOfficial && (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
            <div className="relative lg:col-span-1 col-span-2 sm:col-span-1">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search Name or Reg..." 
                value={manageSearch} 
                onChange={e=>setManageSearch(e.target.value)} 
                className="w-full py-2 pl-8 border border-slate-200 rounded-lg text-xs sm:text-sm outline-none focus:border-indigo-400 bg-slate-50 focus:bg-white transition-colors h-[38px]" 
              />
            </div>
            
            <div className="relative">
              <select className="w-full py-2 pl-3 pr-6 border border-slate-200 rounded-lg text-xs sm:text-sm outline-none bg-slate-50 focus:bg-white focus:border-indigo-400 transition-colors appearance-none h-[38px]" value={manageBatch} onChange={e=>setManageBatch(e.target.value)}>
                <option value="">All Batches</option>
                {batches?.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
            
            <div className="relative">
              <select className="w-full py-2 pl-3 pr-6 border border-slate-200 rounded-lg text-xs sm:text-sm outline-none bg-slate-50 focus:bg-white focus:border-indigo-400 transition-colors appearance-none h-[38px]" value={manageBranch} onChange={e=>setManageBranch(e.target.value)}>
                <option value="">All Branches</option>
                {branches?.map(b => <option key={b.value || b} value={b.value || b}>{b.label || b}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
            
            <div className="relative">
              <ArrowUpDown size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <select className="w-full py-2 pl-8 pr-6 border border-slate-200 rounded-lg text-xs sm:text-sm outline-none bg-slate-50 focus:bg-white focus:border-indigo-400 font-bold text-slate-700 transition-colors appearance-none h-[38px]" value={sortOrder} onChange={e=>setSortOrder(e.target.value)}>
                <option value="cgpaDesc">High CGPA</option>
                <option value="cgpaAsc">Low CGPA</option>
                <option value="alpha">Sort A-Z</option>
              </select>
              <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>
        )}
      </div>

      {/* 🟢 LIST CONTAINER - THE FIX IS HERE */}
      {/* By adding 'mt-4 sm:mt-6' and removing 'pt', the scrolling clipping box is forced below the sticky header. */}
      {/* The cards will disappear into thin air 16px before they ever touch the sticky header! */}
      <div className="flex-1 overflow-y-auto custom-scrollbar sm:pr-1 flex flex-col min-h-0 mt-4 sm:mt-6">
        <div className="flex flex-col gap-2 sm:gap-3 pb-4 w-full">
          {paginatedCGPAs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 sm:py-16 bg-white rounded-xl shadow-sm border border-slate-200 text-center px-4 mx-[1px]">
              <Users className="w-10 h-10 sm:w-12 sm:h-12 text-slate-300 mb-3" />
              <p className="text-slate-500 font-medium text-sm">No records found matching your criteria.</p>
            </div>
          ) : (
            paginatedCGPAs.map(({ student, cgpa, semesters }, index) => {
              const isExpanded = expandedStudentId === student._id;
              const isMe = student._id === authData?._id;
              
              // Rank Number calculation
              const globalIndex = index + (localPage - 1) * itemsPerPage;

              return (
                <div key={student._id} className={`bg-white rounded-xl border hover:border-indigo-300 transition-all cursor-default overflow-hidden flex-shrink-0 mx-[1px] ${isMe ? 'border-indigo-400 shadow-sm bg-indigo-50/20' : 'border-slate-200 shadow-sm sm:shadow-none'}`}>
                  
                  {/* MAIN CARD ROW */}
                  <div className="p-3 sm:p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-0">
                    
                    {/* Left side: Rank, Name, Reg */}
                    <div className="flex items-center justify-between w-full md:w-auto md:flex-1">
                      <div className="flex items-center gap-3 sm:gap-4 text-left min-w-0">
                        <span className={`text-sm sm:text-lg font-black w-6 sm:w-8 text-center flex-shrink-0 ${globalIndex < 3 && sortOrder === 'cgpaDesc' ? 'text-emerald-500' : 'text-slate-400'}`}>
                          #{globalIndex + 1}
                        </span>
                        <div className="flex flex-col min-w-0">
                          <h4 className="font-extrabold text-slate-900 text-sm sm:text-lg truncate flex items-center gap-2">
                            <span className="truncate">{student.name}</span>
                            {isMe && <span className="bg-indigo-600 text-white text-[9px] px-2 py-[1px] rounded flex-shrink-0 uppercase tracking-wider">You</span>}
                          </h4>
                          <span className="text-[10px] sm:text-xs font-bold text-slate-500 mt-0.5 truncate">
                            {student.registrationNo} {isOfficial && <span className="hidden sm:inline">• {student.branch} ({student.batch})</span>}
                          </span>
                          {/* Show Branch/Batch on a new line on mobile if Official */}
                          {isOfficial && (
                             <span className="text-[9px] font-medium text-slate-400 sm:hidden truncate mt-0.5">
                                {student.branch} • {student.batch}
                             </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Mobile CGPA (Right side of top row) */}
                      <div className="flex md:hidden flex-col items-end justify-center text-right flex-shrink-0 pl-2">
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">CGPA</span>
                        <span className="text-lg sm:text-2xl font-black text-indigo-600 leading-none">{cgpa}</span>
                      </div>
                    </div>

                    {/* Middle: Breakdown Button */}
                    <div className="flex justify-center w-full md:w-auto md:flex-1 mt-1 md:mt-0">
                      <button 
                        onClick={() => toggleExpand(student._id)} 
                        className={`flex items-center justify-center w-full md:w-auto gap-1.5 px-3 py-2 rounded-lg transition-all font-extrabold text-[10px] sm:text-xs uppercase tracking-wider border active:scale-[0.98] ${isExpanded ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-indigo-600 hover:border-indigo-200'}`}
                      >
                        Semester Breakdown
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                    </div>

                    {/* Desktop CGPA (Hidden on mobile) */}
                    <div className="hidden md:flex flex-col items-end justify-center w-full md:w-auto md:flex-1 text-right">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Overall CGPA</span>
                      <span className="text-3xl font-black text-indigo-600 leading-none">{cgpa}</span>
                    </div>
                  </div>

                  {/* EXPANDED SEMESTER GRID */}
                  {isExpanded && (
                    <div className="bg-slate-50/80 md:bg-white border-t border-slate-200 p-2.5 sm:p-5 animate-in slide-in-from-top-2 fade-in duration-200">
                      {/* 🟢 THE FIX: Changed 'grid-cols-3' to 'grid-cols-4' and adjusted gaps to fit perfectly */}
                      <div className="grid grid-cols-4 gap-1.5 sm:gap-3">
                        {semesters.sort((a, b) => a.name.localeCompare(b.name)).map(sem => (
                          <div key={sem.name} className="flex flex-col items-center justify-center bg-white border border-slate-200 shadow-sm rounded-lg sm:rounded-xl px-1 sm:px-5 py-2 sm:py-3 w-full">
                            <span className="text-[8px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 whitespace-nowrap">
                              {sem.name.replace('Semester ', 'Sem ')}
                            </span>
                            <span className="text-xs sm:text-xl font-black text-indigo-600 leading-none">
                              {sem.sgpa?.toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* 🟢 LOCAL PAGINATION CONTROLS */}
        {computedTotalPages > 1 && (
          <div className="flex justify-between items-center gap-2 px-1 py-4 mt-auto border-t border-slate-100/50">
            <button 
              onClick={() => setLocalPage(prev => Math.max(prev - 1, 1))}
              disabled={localPage === 1}
              className="px-4 py-2 bg-white text-slate-600 font-bold text-[11px] sm:text-sm rounded-lg border border-slate-200 disabled:opacity-50 hover:bg-slate-50 transition-all shadow-sm active:scale-[0.98]"
            >
              Previous
            </button>
            <span className="font-bold text-[11px] sm:text-sm text-slate-500 whitespace-nowrap">
              Page {localPage} of {computedTotalPages}
            </span>
            <button 
              onClick={() => setLocalPage(prev => Math.min(prev + 1, computedTotalPages))}
              disabled={localPage === computedTotalPages}
              className="px-4 py-2 bg-white text-indigo-600 border border-slate-200 font-bold text-[11px] sm:text-sm rounded-lg disabled:opacity-50 hover:bg-indigo-50 hover:border-indigo-200 transition-all shadow-sm active:scale-[0.98]"
            >
              Next Page
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentCGPAList;