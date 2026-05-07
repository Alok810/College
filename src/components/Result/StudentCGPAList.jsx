import React, { useState, useMemo } from 'react';
import { Search, ArrowUpDown, ChevronDown, ChevronUp, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext'; 

const StudentCGPAList = ({ results, users, batches = [], branches = [], currentPage, totalPages, setCurrentPage }) => {
  const { authData } = useAuth(); 
  
  // Check if user is an admin/institute
  const isOfficial = authData?.userType === "Institute" || authData?.role === "admin" || authData?.role === "superadmin";

  const [manageSearch, setManageSearch] = useState('');
  const [manageBatch, setManageBatch] = useState('');
  const [manageBranch, setManageBranch] = useState('');
  const [sortOrder, setSortOrder] = useState('cgpaDesc');
  const [expandedStudentId, setExpandedStudentId] = useState(null);

  const toggleExpand = (studentId) => setExpandedStudentId(prev => prev === studentId ? null : studentId);

  // 1. Group and calculate CGPAs
  const studentCGPAs = useMemo(() => {
    const map = new Map();
    
    results.forEach(r => {
      const sId = r.student._id || r.student;
      
      // Get student object (fallback to authData if it's the logged-in student)
      let studentObj = users.find(u => u._id === sId);
      if (!studentObj && sId === authData?._id) studentObj = authData;

      if (studentObj) {
        if (!map.has(sId)) {
          map.set(sId, { student: studentObj, totalPoints: 0, totalCredits: 0, semesters: [] });
        }
        const sData = map.get(sId);
        const credits = r.subjects?.reduce((sum, sub) => sum + (parseFloat(sub.credits) || 0), 0) || 0;
        sData.totalCredits += credits;
        sData.totalPoints += (r.sgpa || 0) * credits;
        sData.semesters.push({ name: r.semester, sgpa: r.sgpa, remarks: r.remarks });
      }
    });

    return Array.from(map.values()).map(data => ({
      ...data,
      cgpa: data.totalCredits > 0 ? (data.totalPoints / data.totalCredits).toFixed(2) : "0.00"
    }));
  }, [results, users, authData]);

  // 2. Filter based on role and search terms
  const filteredStudentCGPAs = useMemo(() => {
    return studentCGPAs.filter(item => {
      // Students ONLY see peers from same Batch & Branch
      if (!isOfficial) {
        if (item.student?.batch !== authData?.batch || item.student?.branch !== authData?.branch) return false;
      }

      // Search bar filter
      if (manageSearch) {
        const searchLower = manageSearch.toLowerCase();
        const nameMatch = item.student.name?.toLowerCase().includes(searchLower);
        const regMatch = item.student.registrationNo?.toLowerCase().includes(searchLower);
        if (!nameMatch && !regMatch) return false;
      }
      
      // Admin dropdown filters
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

  return (
    <div className="flex-1 flex flex-col min-h-0 w-full gap-4">
      
      {/* 🟢 HEADER & FILTERS */}
      <div className="bg-white shadow-sm rounded-[1.5rem] p-4 sm:p-5 border border-slate-100 flex flex-col flex-shrink-0 z-10">
        
        {/* Dynamic Wrapper: Row for students, Column for Admins */}
        <div className={`flex flex-col ${!isOfficial ? 'lg:flex-row lg:items-center lg:justify-between gap-4' : 'border-b border-slate-100 pb-4 mb-4 gap-3'}`}>

          {/* Title Area */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[0.8rem] bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center border border-blue-200 shrink-0">
              <Users className="text-blue-600 w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-slate-900 leading-none">{isOfficial ? 'All Student Rankings' : 'Class Rankings'}</h1>
              <p className="text-[10px] sm:text-xs text-slate-500 font-medium mt-1">
                {isOfficial ? 'Global CGPA Database' : `Your Peers: ${authData?.batch || 'Batch'} • ${authData?.branch || 'Branch'}`}
              </p>
            </div>
          </div>

          {/* STUDENT FILTERS (Inline on Right) */}
          {!isOfficial && (
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <div className="relative w-full sm:w-64">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" placeholder="Search Name or Reg..." value={manageSearch} onChange={e=>setManageSearch(e.target.value)} className="w-full p-2.5 pl-9 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-400 bg-slate-50 focus:bg-white transition-colors" />
              </div>
              
              <div className="relative w-full sm:w-48">
                <ArrowUpDown size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <select className="w-full p-2.5 pl-9 border border-slate-200 rounded-lg text-sm outline-none bg-slate-50 focus:bg-white focus:border-indigo-400 font-bold text-slate-700 transition-colors" value={sortOrder} onChange={e=>setSortOrder(e.target.value)}>
                  <option value="cgpaDesc">Highest CGPA</option>
                  <option value="cgpaAsc">Lowest CGPA</option>
                  <option value="alpha">Sort A-Z (Names)</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* ADMIN FILTERS (Stacked Grid underneath the line) */}
        {isOfficial && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative lg:col-span-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Search Name or Reg..." value={manageSearch} onChange={e=>setManageSearch(e.target.value)} className="w-full p-2.5 pl-9 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-400 bg-slate-50 focus:bg-white transition-colors" />
            </div>
            
            <select className="p-2.5 border border-slate-200 rounded-lg text-sm outline-none bg-slate-50 focus:bg-white focus:border-indigo-400 transition-colors" value={manageBatch} onChange={e=>setManageBatch(e.target.value)}>
              <option value="">All Batches</option>
              {batches?.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
            
            <select className="p-2.5 border border-slate-200 rounded-lg text-sm outline-none bg-slate-50 focus:bg-white focus:border-indigo-400 transition-colors" value={manageBranch} onChange={e=>setManageBranch(e.target.value)}>
              <option value="">All Branches</option>
              {branches?.map(b => <option key={b.value || b} value={b.value || b}>{b.label || b}</option>)}
            </select>
            
            <div className="relative">
              <ArrowUpDown size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <select className="w-full p-2.5 pl-9 border border-slate-200 rounded-lg text-sm outline-none bg-slate-50 focus:bg-white focus:border-indigo-400 font-bold text-slate-700 transition-colors" value={sortOrder} onChange={e=>setSortOrder(e.target.value)}>
                <option value="cgpaDesc">Highest CGPA</option>
                <option value="cgpaAsc">Lowest CGPA</option>
                <option value="alpha">Sort A-Z (Names)</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* LIST CONTAINER */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 flex flex-col min-h-0">
        <div className="flex flex-col gap-3 sm:gap-4 pb-4 w-full">
          {sortedAndFilteredCGPAs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl shadow-sm border border-slate-100">
              <Users className="w-12 h-12 text-slate-300 mb-3" />
              <p className="text-slate-500 font-medium text-sm">No records found matching your criteria.</p>
            </div>
          ) : (
            sortedAndFilteredCGPAs.map(({ student, cgpa, semesters }, index) => {
              const isExpanded = expandedStudentId === student._id;
              const isMe = student._id === authData?._id;

              return (
                <div key={student._id} className={`bg-white rounded-xl border hover:border-indigo-300 hover:shadow-md transition-all cursor-default overflow-hidden flex-shrink-0 ${isMe ? 'border-indigo-400 shadow-sm bg-indigo-50/20' : 'border-slate-200'}`}>
                  
                  <div className="p-3 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-0">
                    <div className="flex items-center justify-between w-full md:w-auto md:flex-1">
                      <div className="flex items-center gap-2 sm:gap-4 text-left min-w-0">
                        <span className={`text-base sm:text-lg font-black w-6 sm:w-8 text-center flex-shrink-0 ${index < 3 && sortOrder === 'cgpaDesc' ? 'text-emerald-500' : 'text-slate-400'}`}>
                          #{index + 1 + ((currentPage || 1) - 1) * 50}
                        </span>
                        <div className="flex flex-col min-w-0">
                          <h4 className="font-extrabold text-slate-900 text-sm sm:text-xl truncate flex items-center gap-2">
                            <span className="truncate">{student.name || 'Unknown Student'}</span>
                            {isMe && <span className="bg-indigo-600 text-white text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider flex-shrink-0">You</span>}
                          </h4>
                          <span className="text-[10px] sm:text-sm font-bold text-slate-500 mt-0.5 sm:mt-1 truncate">
                            Reg: {student.registrationNo || 'N/A'} {isOfficial && `• ${student.branch} (${student.batch})`}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex md:hidden flex-col items-end justify-center text-right flex-shrink-0 ml-2">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">CGPA</span>
                        <span className="text-2xl font-black text-indigo-600 leading-none">{cgpa}</span>
                      </div>
                    </div>

                    <div className="flex justify-center w-full md:w-auto md:flex-1">
                      <button onClick={() => toggleExpand(student._id)} className={`flex items-center justify-center w-full md:w-auto gap-2 px-4 py-2 rounded-lg transition-all font-extrabold text-[10px] sm:text-xs uppercase tracking-wider border ${isExpanded ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-200'}`}>
                        Semester Breakdown
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </div>

                    <div className="hidden md:flex flex-col items-end justify-center w-full md:w-auto md:flex-1 text-right">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Overall CGPA</span>
                      <span className="text-3xl sm:text-4xl font-black text-indigo-600 leading-none">{cgpa}</span>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="bg-slate-50 md:bg-white border-t border-slate-100 p-3 sm:p-5 animate-in slide-in-from-top-2 fade-in duration-200">
                      <div className="flex flex-row flex-wrap gap-2 sm:gap-3">
                        {semesters.sort((a, b) => a.name.localeCompare(b.name)).map(sem => (
                          <div key={sem.name} className="flex flex-col items-center justify-center bg-white border border-slate-200 shadow-sm rounded-xl px-3 sm:px-5 py-2 sm:py-3 flex-1 sm:flex-none min-w-[70px] sm:min-w-[80px]">
                            <span className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 whitespace-nowrap">{sem.name.replace('Semester ', 'Sem ')}</span>
                            <span className="text-lg sm:text-xl font-black text-indigo-600 leading-none">{sem.sgpa?.toFixed(2)}</span>
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

        {/* PAGINATION */}
        {totalPages > 1 && setCurrentPage && (
          <div className="flex justify-between sm:justify-center items-center gap-2 sm:gap-4 pt-2 sm:pt-4 pb-4 mt-0">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 sm:px-4 py-2 bg-white text-slate-600 font-bold text-xs rounded-lg border border-slate-200 disabled:opacity-50 hover:bg-slate-50 transition-all shadow-sm"
            >
              Previous
            </button>
            <span className="font-bold text-[10px] sm:text-xs text-slate-500 whitespace-nowrap">
              Page {currentPage} of {totalPages}
            </span>
            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 sm:px-4 py-2 bg-white text-indigo-600 border border-slate-200 font-bold text-xs rounded-lg disabled:opacity-50 hover:bg-indigo-50 hover:border-indigo-200 transition-all shadow-sm"
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