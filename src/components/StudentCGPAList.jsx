import React, { useState, useMemo } from 'react';
import { Search, ArrowUpDown, ChevronDown, ChevronUp, Users, Award } from 'lucide-react';
import { useAuth } from '../context/AuthContext'; 

const StudentCGPAList = ({ results, users, batches, branches }) => {
  const { authData } = useAuth(); 
  
  const isOfficial = authData?.userType === "Institute" || authData?.role === "admin";

  const [manageSearch, setManageSearch] = useState('');
  const [manageBatch, setManageBatch] = useState('');
  const [manageBranch, setManageBranch] = useState('');
  const [sortOrder, setSortOrder] = useState('cgpaDesc'); // Default: Highest CGPA
  
  const [expandedStudentId, setExpandedStudentId] = useState(null);

  const toggleExpand = (studentId) => {
    if (expandedStudentId === studentId) {
      setExpandedStudentId(null); 
    } else {
      setExpandedStudentId(studentId); 
    }
  };

  const studentCGPAs = useMemo(() => {
    const map = new Map();
    
    results.forEach(r => {
      const sId = r.student._id || r.student;
      if (!map.has(sId)) {
        const studentObj = users.find(u => u._id === sId);
        if (studentObj) {
          map.set(sId, {
            student: studentObj,
            totalPoints: 0,
            totalCredits: 0,
            semesters: [] 
          });
        }
      }
      
      const sData = map.get(sId);
      if (sData) {
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
  }, [results, users]);

  const filteredStudentCGPAs = studentCGPAs.filter(item => {
    // If student, ONLY show peers from same Batch & Branch
    if (!isOfficial) {
      if (item.student?.batch !== authData?.batch || item.student?.branch !== authData?.branch) {
        return false; 
      }
    }

    if (manageSearch) {
      const searchLower = manageSearch.toLowerCase();
      const nameMatch = item.student.name?.toLowerCase().includes(searchLower);
      const regMatch = item.student.registrationNo?.toLowerCase().includes(searchLower);
      if (!nameMatch && !regMatch) return false;
    }
    
    // Only Admin gets dropdown filters
    if (isOfficial) {
      if (manageBatch && item.student?.batch !== manageBatch) return false;
      if (manageBranch && item.student?.branch !== manageBranch) return false;
    }
    
    return true;
  });

  const sortedAndFilteredCGPAs = useMemo(() => {
    const sorted = [...filteredStudentCGPAs];
    sorted.sort((a, b) => {
      if (sortOrder === 'alpha') {
        const nameA = a.student.name || '';
        const nameB = b.student.name || '';
        return nameA.localeCompare(nameB);
      } else if (sortOrder === 'cgpaDesc') {
        return parseFloat(b.cgpa) - parseFloat(a.cgpa);
      } else if (sortOrder === 'cgpaAsc') {
        return parseFloat(a.cgpa) - parseFloat(b.cgpa);
      }
      return 0;
    });
    return sorted;
  }, [filteredStudentCGPAs, sortOrder]);

  return (
    <div className="flex-1 flex flex-col min-h-0 w-full">
       <div className={`flex-shrink-0 grid grid-cols-1 gap-3 mb-5 bg-slate-50 p-4 rounded-xl border border-slate-200 ${isOfficial ? 'sm:grid-cols-2 lg:grid-cols-4' : 'sm:grid-cols-2'}`}>
         <div className="relative lg:col-span-1">
           <Search size={16} className="absolute left-3 top-3 text-slate-400" />
           <input type="text" placeholder="Search Name or Reg..." value={manageSearch} onChange={e=>setManageSearch(e.target.value)} className="w-full p-2 pl-9 border border-slate-300 rounded-lg text-sm outline-none focus:border-indigo-400" />
         </div>
         
         {isOfficial && (
           <>
             <select className="p-2 border border-slate-300 rounded-lg text-sm outline-none bg-white focus:border-indigo-400" value={manageBatch} onChange={e=>setManageBatch(e.target.value)}>
               <option value="">All Batches</option>
               {batches?.map(b => <option key={b} value={b}>{b}</option>)}
             </select>
             <select className="p-2 border border-slate-300 rounded-lg text-sm outline-none bg-white focus:border-indigo-400" value={manageBranch} onChange={e=>setManageBranch(e.target.value)}>
               <option value="">All Branches</option>
               {branches?.map(b => <option key={b} value={b}>{b}</option>)}
             </select>
           </>
         )}
         
         <div className="relative">
           <ArrowUpDown size={16} className="absolute left-3 top-3 text-slate-400" />
           <select className="w-full p-2 pl-9 border border-slate-300 rounded-lg text-sm outline-none bg-white focus:border-indigo-400 font-medium text-slate-700" value={sortOrder} onChange={e=>setSortOrder(e.target.value)}>
             <option value="cgpaDesc">Highest CGPA First</option>
             <option value="cgpaAsc">Lowest CGPA First</option>
             <option value="alpha">Sort A-Z (Names)</option>
           </select>
         </div>
       </div>

       <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
         <div className="flex flex-col gap-4 pb-4">
           {sortedAndFilteredCGPAs.length === 0 ? (
             <div className="flex flex-col items-center justify-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
               <Users className="w-12 h-12 text-slate-300 mb-3" />
               <p className="text-slate-500 font-medium">No peer records found matching your criteria.</p>
             </div>
           ) : (
             sortedAndFilteredCGPAs.map(({ student, cgpa, semesters }, index) => {
               const isExpanded = expandedStudentId === student._id;
               const isMe = student._id === authData?._id;

               return (
                 <div key={student._id} className={`bg-white rounded-xl border hover:border-indigo-300 hover:shadow-md transition-all cursor-default overflow-hidden ${isMe ? 'border-indigo-300 shadow-sm bg-indigo-50/20' : 'border-slate-200'}`}>
                   
                   <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-0">
                     <div className="flex items-center gap-4 w-full md:w-1/3 text-left">
                       <span className={`text-lg font-black w-6 text-center ${index < 3 && sortOrder === 'cgpaDesc' ? 'text-emerald-500' : 'text-slate-300'}`}>
                         #{index + 1}
                       </span>
                       <div className="flex flex-col truncate">
                         <h4 className="font-extrabold text-slate-900 text-lg sm:text-xl truncate flex items-center gap-2">
                           {student.name || 'Unknown Student'}
                           {isMe && <span className="bg-indigo-600 text-white text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider">You</span>}
                         </h4>
                         <span className="text-xs sm:text-sm font-bold text-slate-500 mt-1">
                           Reg: {student.registrationNo || 'N/A'}
                         </span>
                       </div>
                     </div>
                     
                     <div className="flex justify-center w-full md:w-1/3">
                       <button 
                         onClick={() => toggleExpand(student._id)}
                         className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-extrabold text-xs uppercase tracking-wider border ${
                           isExpanded 
                             ? 'bg-indigo-50 text-indigo-600 border-indigo-200' 
                             : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-indigo-500 hover:border-indigo-200'
                         }`}
                       >
                         Semester Breakdown
                         {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                       </button>
                     </div>

                     <div className="flex flex-col items-center md:items-end justify-center w-full md:w-1/3 text-center md:text-right">
                       <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Overall CGPA</span>
                       <span className="text-3xl sm:text-4xl font-black text-indigo-600 leading-none">{cgpa}</span>
                     </div>
                   </div>

                   {isExpanded && (
                     <div className="bg-slate-50 border-t border-slate-200 p-4 sm:p-5 animate-in slide-in-from-top-2 fade-in duration-200">
                       <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                         {semesters.sort((a, b) => a.name.localeCompare(b.name)).map(sem => (
                           <div key={sem.name} className="flex flex-col items-center bg-white border border-slate-200 shadow-sm rounded-lg px-4 py-2 min-w-[70px]">
                             <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{sem.name.replace('Semester ', 'Sem ')}</span>
                             <span className="text-base font-black text-indigo-600 mt-1">{sem.sgpa?.toFixed(2)}</span>
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
       </div>
    </div>
  );
};

export default StudentCGPAList;