import React, { useState, useEffect } from 'react';
import { Users, GraduationCap, BookOpen, Trophy, Info, Send, FileBadge, Loader2 } from 'lucide-react';

// Make sure you have this exported in your api.js file!
import { getDepartmentSubjectCounts } from '../../api'; 

const OverviewTab = ({ activeDept, studentCount }) => {
  const [subjectCounts, setSubjectCounts] = useState({ theory: 0, practical: 0 });
  const [isFetchingSubjects, setIsFetchingSubjects] = useState(false);

  useEffect(() => {
    // Safety check to prevent race conditions (The "Fast Clicker" fix)
    let isMounted = true; 

    const fetchCounts = async () => {
      const branchName = activeDept?.abbreviation || activeDept?.name;
      if (!branchName) return;

      setIsFetchingSubjects(true);
      try {
        const data = await getDepartmentSubjectCounts(branchName);
        
        // Only update state if the user hasn't quickly clicked to a different tab
        if (isMounted) {
            setSubjectCounts({ theory: data.theory, practical: data.practical });
        }
      } catch (error) {
        console.error("Failed to load subject counts:", error);
        if (isMounted) {
            setSubjectCounts({ theory: 0, practical: 0 });
        }
      } finally {
        if (isMounted) {
            setIsFetchingSubjects(false);
        }
      }
    };

    fetchCounts();

    // Cleanup function when component unmounts or activeDept changes
    return () => {
        isMounted = false;
    };
  }, [activeDept]);

  if (!activeDept) return null;

  const facultyCount = activeDept.coreFaculty?.length || 0;

  return (
    <div className="w-full flex flex-col gap-6 animate-in fade-in duration-300">
      
      {/* Top Stat Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* FACULTY CARD */}
        <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-white shadow-sm flex items-center gap-3 sm:gap-4 hover:border-indigo-300 transition-colors group">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-blue-500 text-white group-hover:scale-105 transition-transform shadow-sm">
            <Users className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Faculty</p>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">{facultyCount}</h3>
          </div>
        </div>
        
        {/* STUDENTS CARD */}
        <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-white shadow-sm flex items-center gap-3 sm:gap-4 hover:border-indigo-300 transition-colors group">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-emerald-500 text-white group-hover:scale-105 transition-transform shadow-sm">
            <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Students</p>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">{studentCount || 0}</h3>
          </div>
        </div>
        
        {/* TOTAL SUBJECTS CARD */}
        <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-white shadow-sm flex items-center gap-3 sm:gap-4 hover:border-indigo-300 transition-colors group">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-purple-500 text-white group-hover:scale-105 transition-transform shadow-sm">
            {isFetchingSubjects ? (
               <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" />
            ) : (
               <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.5} />
            )}
          </div>
          <div>
            <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Subjects</p>
            {isFetchingSubjects ? (
               <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">...</h3>
            ) : (
               <div className="flex items-center gap-3 mt-0.5">
                   <span className="font-black text-slate-900 text-lg sm:text-xl">
                       <span className="text-slate-400 font-bold text-sm mr-1">T=</span>{subjectCounts.theory}
                   </span>
                   <span className="font-black text-slate-900 text-lg sm:text-xl">
                       <span className="text-slate-400 font-bold text-sm mr-1">P=</span>{subjectCounts.practical}
                   </span>
               </div>
            )}
          </div>
        </div>
        
        {/* ESTABLISHED CARD */}
        <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-white shadow-sm flex items-center gap-3 sm:gap-4 hover:border-indigo-300 transition-colors group">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-amber-500 text-white group-hover:scale-105 transition-transform shadow-sm">
            <Trophy className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider">Established</p>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">{activeDept.establishedYear || "N/A"}</h3>
          </div>
        </div>
      </div>

      {/* Main Info Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* About Section */}
        <div className="lg:col-span-2 bg-indigo-50/40 rounded-2xl p-5 sm:p-6 border border-indigo-100 flex flex-col justify-center relative group">
          <h3 className="text-sm font-black text-indigo-900 uppercase tracking-widest mb-3 flex items-center gap-2">
            <Info className="w-4 h-4 text-indigo-500" /> About {activeDept.name}
          </h3>
          <p className="text-sm font-medium text-slate-600 leading-relaxed whitespace-pre-wrap">
            {activeDept.description || activeDept.about || "No official description provided for this department yet. The Institute Administrator can update this via the Department Settings."}
          </p>
        </div>

        {/* Student Services Links */}
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
  );
};

export default OverviewTab;