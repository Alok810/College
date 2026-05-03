import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Loader2, CheckCircle2, Trash2, Pencil, X } from 'lucide-react';
import { getCourseBlueprint, saveCourseBlueprint } from '../../api';

const batches = ['2021-2025', '2022-2026', '2023-2027', '2024-2028', '2025-2029', '2026-2030'];
const semesters = ['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4', 'Semester 5', 'Semester 6', 'Semester 7', 'Semester 8'];

const AcademicsTab = ({ activeDept, canEditAcademics }) => {
  const [academicBatch, setAcademicBatch] = useState('');
  const [academicSemester, setAcademicSemester] = useState('');
  const [blueprintData, setBlueprintData] = useState([]);
  const [blueprintLoading, setBlueprintLoading] = useState(false);
  
  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingSubjectIndex, setEditingSubjectIndex] = useState(null);
  
  const defaultCourseState = { 
    subjectCode: "", 
    subjectName: "", 
    type: "Theory", 
    credits: "", 
    extFull: 70, 
    intFull: 30, 
    passExt: 21, 
    passTotal: 35 
  };
  const [newCourse, setNewCourse] = useState(defaultCourseState);

  // Fetch Blueprint when Batch/Semester changes
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

  // Handle Save (Add/Edit)
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
      setIsModalOpen(false);
      setEditingSubjectIndex(null);
    } catch {
      alert("Failed to save course structure.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete
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

  // Open Modal Helper
  const openModal = (subject = null, index = null) => {
    if(!academicBatch || !academicSemester) return alert("Select a Batch and Semester first!");
    if (subject) {
      setNewCourse(subject);
      setEditingSubjectIndex(index);
    } else {
      setNewCourse(defaultCourseState);
      setEditingSubjectIndex(null);
    }
    setIsModalOpen(true);
  };

  return (
    <div className="w-full flex flex-col gap-4 animate-in fade-in duration-300">
      
      {/* Header Controls */}
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
              onClick={() => openModal()} 
              className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white border border-emerald-200 px-4 py-2.5 rounded-lg text-xs font-bold transition-colors shadow-sm w-full sm:w-auto justify-center"
            >
              <Plus size={14} /> Add Subject
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
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
                          <button onClick={() => openModal(course, idx)} className="text-indigo-400 hover:text-indigo-600 p-1.5 transition-colors"><Pencil size={16}/></button>
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

      {/* 🟢 Blueprint Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-2xl p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-black text-slate-900 leading-tight">
                  {editingSubjectIndex !== null ? "Edit Subject Rule" : "Add Subject Rule"}
                </h2>
                <p className="text-xs font-bold text-slate-500 mt-1">
                  {activeDept?.name} • {academicBatch} • {academicSemester}
                </p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-600 rounded-xl transition-colors"><X size={18} /></button>
            </div>

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
          </div>
        </div>
      )}
    </div>
  );
};

export default AcademicsTab;