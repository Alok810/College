import React, { useState, useEffect, useCallback, memo, useMemo, useRef } from 'react';
import Papa from 'papaparse';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyResults, getAllResultsForAdmin, publishResult, updateResult, deleteResult, getAdminUsers, saveCourseBlueprint, getCourseBlueprint, getClassResultsForStudents, publishBatchResults, bulkUploadResults, getInstituteDepartments } from '../api';
import { GraduationCap, Award, Plus, Trash2, Calculator, Settings, CheckCircle2, Pencil, Lock, Unlock, Search, ArrowUpDown, ChevronDown, ChevronUp, Users, UploadCloud, EyeOff, Eye, FileSpreadsheet, CalendarClock, Loader2, FileArchive, ListChecks } from 'lucide-react';

// --- Dynamic Calculation Engine ---
const calculateDynamicGrade = (fin, int, blueprint) => {
  const finScore = parseFloat(fin) || 0;
  const intScore = parseFloat(int) || 0;
  const total = finScore + intScore;
  const percentage = blueprint.totalMax > 0 ? (total / blueprint.totalMax) * 100 : 0;

  let grade = 'F'; let point = 0;
  const failedExternal = blueprint.passExt && finScore < blueprint.passExt;
  const failedTotal = total < blueprint.passTotal;

  if (failedExternal || failedTotal) { grade = 'F'; point = 0; }
  else if (percentage >= 90) { grade = 'A+'; point = 10; }
  else if (percentage >= 80) { grade = 'A'; point = 9; }
  else if (percentage >= 70) { grade = 'B+'; point = 8; }
  else if (percentage >= 60) { grade = 'B'; point = 7; }
  else if (percentage >= 50) { grade = 'C+'; point = 6; }
  else if (percentage >= 35) { grade = 'C'; point = 5; }

  return { total, grade, point };
};

// ==========================================
// 🎓 STUDENT VIEW: CLASS RANKINGS
// ==========================================
const StudentClassView = memo(({ results, users, currentPage, totalPages, setCurrentPage }) => {
  const { authData } = useAuth();
  const [sortOrder, setSortOrder] = useState('cgpaDesc');
  const [expandedStudentId, setExpandedStudentId] = useState(null);

  const toggleExpand = (studentId) => setExpandedStudentId(prev => prev === studentId ? null : studentId);

  const studentCGPAs = useMemo(() => {
    const map = new Map();
    results.forEach(r => {
      const sId = r.student._id || r.student;
      let studentObj = users.find(u => u._id === sId);
      if (!studentObj && sId === authData?._id) studentObj = authData;

      if (studentObj && studentObj.batch === authData?.batch && studentObj.branch === authData?.branch) {
        if (!map.has(sId)) map.set(sId, { student: studentObj, totalPoints: 0, totalCredits: 0, semesters: [] });
        const sData = map.get(sId);
        const credits = r.subjects?.reduce((sum, sub) => sum + (parseFloat(sub.credits) || 0), 0) || 0;
        sData.totalCredits += credits;
        sData.totalPoints += (r.sgpa || 0) * credits;
        sData.semesters.push({ name: r.semester, sgpa: r.sgpa, credits: credits, remarks: r.remarks });
      }
    });

    return Array.from(map.values()).map(data => ({
      ...data,
      cgpa: data.totalCredits > 0 ? (data.totalPoints / data.totalCredits).toFixed(2) : "0.00"
    }));
  }, [results, users, authData]);

  const sortedCGPAs = useMemo(() => {
    const sorted = [...studentCGPAs];
    sorted.sort((a, b) => {
      if (sortOrder === 'alpha') return (a.student.name || '').localeCompare(b.student.name || '');
      if (sortOrder === 'cgpaDesc') return parseFloat(b.cgpa) - parseFloat(a.cgpa);
      if (sortOrder === 'cgpaAsc') return parseFloat(a.cgpa) - parseFloat(b.cgpa);
      return 0;
    });
    return sorted;
  }, [studentCGPAs, sortOrder]);

  return (
    // 🟢 UPDATED: Flex-1 and min-h-0
    <div className="w-full flex flex-col flex-1 min-h-0 gap-4">
      
      {/* HEADER (Sticky at the top) */}
      <div className="bg-white shadow-sm rounded-[1.5rem] p-4 sm:p-6 border border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 flex-shrink-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-[0.8rem] bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center border border-blue-200 flex-shrink-0">
            <Users className="text-blue-600 w-6 h-6" />
          </div>
          <div className="overflow-hidden">
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-none truncate">Class Rankings</h1>
            <p className="text-[10px] sm:text-xs text-slate-500 font-medium mt-1 truncate">Your Peers: {authData?.batch || 'Batch'} • {authData?.branch || 'Branch'}</p>
          </div>
        </div>
        <div className="relative w-full sm:w-48 flex-shrink-0">
          <ArrowUpDown size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <select className="w-full py-2.5 pl-9 pr-3 border border-slate-200 rounded-lg text-sm outline-none bg-slate-50 focus:bg-white focus:border-indigo-400 font-bold text-slate-700 transition-colors" value={sortOrder} onChange={e => setSortOrder(e.target.value)}>
            <option value="cgpaDesc">Highest CGPA</option>
            <option value="cgpaAsc">Lowest CGPA</option>
            <option value="alpha">Sort A-Z</option>
          </select>
        </div>
      </div>

      {/* 🟢 INNER SCROLL CONTAINER */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 flex flex-col min-h-0">
        <div className="flex flex-col gap-3 sm:gap-4 w-full pb-4">
          {sortedCGPAs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl shadow-sm border border-slate-100">
              <Users className="w-12 h-12 text-slate-300 mb-3" />
              <p className="text-slate-500 font-medium text-sm">No peer records found for your class yet.</p>
            </div>
          ) : (
            sortedCGPAs.map(({ student, cgpa, semesters }, index) => {
              const isExpanded = expandedStudentId === student._id;
              const isMe = student._id === authData?._id;

              return (
                <div key={student._id} className={`bg-white rounded-xl border hover:border-indigo-300 hover:shadow-md transition-all cursor-default overflow-hidden flex-shrink-0 ${isMe ? 'border-indigo-400 shadow-sm bg-indigo-50/20' : 'border-slate-200'}`}>
                  <div className="p-3 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-0">
                    
                    <div className="flex items-center justify-between w-full md:w-auto md:flex-1">
                      <div className="flex items-center gap-2 sm:gap-4 text-left min-w-0">
                        <span className={`text-base sm:text-lg font-black w-6 sm:w-8 text-center flex-shrink-0 ${index < 3 && sortOrder === 'cgpaDesc' ? 'text-emerald-500' : 'text-slate-400'}`}>#{index + 1 + (currentPage - 1) * 50}</span>
                        <div className="flex flex-col min-w-0">
                          <h4 className="font-extrabold text-slate-900 text-sm sm:text-xl truncate flex items-center gap-2">
                            <span className="truncate">{student.name || 'Unknown Student'}</span>
                            {isMe && <span className="bg-indigo-600 text-white text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider flex-shrink-0">You</span>}
                          </h4>
                          <span className="text-[10px] sm:text-sm font-bold text-slate-500 mt-0.5 sm:mt-1 truncate">Reg: {student.registrationNo || 'N/A'}</span>
                        </div>
                      </div>
                      
                      <div className="flex md:hidden flex-col items-end justify-center text-right flex-shrink-0 ml-2">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">CGPA</span>
                        <span className="text-2xl font-black text-indigo-600 leading-none">{cgpa}</span>
                      </div>
                    </div>

                    <div className="flex justify-center w-full md:w-auto md:flex-1">
                      <button onClick={() => toggleExpand(student._id)} className={`flex items-center justify-center w-full md:w-auto gap-2 px-4 py-2 sm:py-2 rounded-lg transition-all font-extrabold text-[10px] sm:text-xs uppercase tracking-wider border ${isExpanded ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-200'}`}>
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
                            <span className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 sm:mb-1.5 whitespace-nowrap">{sem.name.replace('Semester ', 'Sem ')}</span>
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

        {totalPages > 1 && (
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
});

// ==========================================
// 🛠️ ADMIN DASHBOARD
// ==========================================
const AdminDashboard = memo(({ results, users, departments, handleUpload, handleDelete, fetchAdminData, displayMessage, currentPage, totalPages, setCurrentPage }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeAdminTab = searchParams.get('tab') || 'upload';

  const handleTabChange = (tabId) => {
    setSearchParams({ tab: tabId }, { replace: true });
  };

  const semesters = ['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4', 'Semester 5', 'Semester 6', 'Semester 7', 'Semester 8'];
  const batches = ['2021-2025', '2022-2026', '2023-2027', '2024-2028', '2025-2029', '2026-2030'];
  
  const branches = useMemo(() => departments.map(d => ({
      value: d.abbreviation || d.name,
      label: d.abbreviation ? `${d.name} (${d.abbreviation})` : d.name
  })), [departments]);

  // Tab 1: Blueprint State
  const [targetBatch, setTargetBatch] = useState('');
  const [targetBranch, setTargetBranch] = useState('');
  const [targetSemester, setTargetSemester] = useState('');
  const [blueprintSubjects, setBlueprintSubjects] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [newSubDef, setNewSubDef] = useState({ subjectCode: '', subjectName: '', type: 'Theory', credits: '', extFull: 70, intFull: 30, totalMax: 100, passExt: 21, passTotal: 35 });
  const [isBlueprintSaving, setIsBlueprintSaving] = useState(false);
  const [hasJustSavedBlueprint, setHasJustSavedBlueprint] = useState(false);

  // Tab 2: Upload/Draft State
  const [entryMethod, setEntryMethod] = useState('manual'); 
  const [uploadBatch, setUploadBatch] = useState('');
  const [uploadBranch, setUploadBranch] = useState('');
  const [uploadSemester, setUploadSemester] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [activeBlueprint, setActiveBlueprint] = useState(null);
  const [studentMarks, setStudentMarks] = useState({});
  const [calculatedTotals, setCalculatedTotals] = useState({ sgpa: 0, tCredits: 0, tTheory: 0, tPractical: 0, gTotal: 0, remarks: 'PASSED' });
  const [existingResultId, setExistingResultId] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [csvLoading, setCsvLoading] = useState(false);
  const fileInputRef = useRef(null);

  // Tab 3: Publish State
  const [publishBatch, setPublishBatch] = useState('');
  const [publishBranch, setPublishBranch] = useState('');
  const [publishSemester, setPublishSemester] = useState('');
  const [bulkPublishLoading, setBulkPublishLoading] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');

  // Tab 4: Manage State
  const [manageSearch, setManageSearch] = useState('');
  const [manageBatch, setManageBatch] = useState('');
  const [manageBranch, setManageBranch] = useState('');
  const [manageSemester, setManageSemester] = useState('');

  const filteredStudents = users.filter(user => user.userType === 'Student' && (!uploadBatch || user.batch === uploadBatch) && (!uploadBranch || user.branch === uploadBranch));
  
  const filteredResults = useMemo(() => {
    const userMap = new Map();
    users.forEach(u => userMap.set(u._id, u));

    let filtered = results.filter(r => {
      if (!r.isPublished) return false; 

      const studentObj = userMap.get(r.student._id || r.student);
      if (manageSearch) {
        const searchLower = manageSearch.toLowerCase();
        const nameMatch = studentObj?.name?.toLowerCase().includes(searchLower);
        const regMatch = studentObj?.registrationNo?.toLowerCase().includes(searchLower);
        if (!nameMatch && !regMatch) return false;
      }
      if (manageBatch && studentObj?.batch !== manageBatch) return false;
      if (manageBranch && studentObj?.branch !== manageBranch) return false;
      if (manageSemester && r.semester !== manageSemester) return false;
      return true;
    });

    filtered.sort((a, b) => {
      const studentA = userMap.get(a.student._id || a.student) || {};
      const studentB = userMap.get(b.student._id || b.student) || {};

      if (studentA.batch !== studentB.batch) return (studentB.batch || '').localeCompare(studentA.batch || '');
      if (studentA.branch !== studentB.branch) return (studentA.branch || '').localeCompare(studentB.branch || '');
      if (a.semester !== b.semester) return (a.semester || '').localeCompare(b.semester || '');
      return (studentA.registrationNo || '').localeCompare(studentB.registrationNo || '');
    });

    return filtered;
  }, [results, users, manageSearch, manageBatch, manageBranch, manageSemester]);

  const pendingDraftsForPublish = useMemo(() => {
    if (!publishBatch || !publishBranch || !publishSemester) return [];
    
    const userMap = new Map();
    users.forEach(u => userMap.set(u._id, u));

    return results.filter(r => {
      if (r.isPublished) return false;
      if (r.semester !== publishSemester) return false;
      const studentObj = userMap.get(r.student._id || r.student);
      return studentObj && studentObj.batch === publishBatch && studentObj.branch === publishBranch;
    });
  }, [results, users, publishBatch, publishBranch, publishSemester]);

  const recalculateAllTotals = (currentMarks, blueprint) => {
    let tTheory = 0; let tPractical = 0; let sumCredits = 0; let sumPoints = 0; let hasFail = false;
    blueprint.subjects.forEach(sub => {
      const marks = currentMarks[sub.subjectCode] || { finExt: '', terInt: '' };
      const { total, grade, point } = calculateDynamicGrade(marks.finExt, marks.terInt, sub);
      if (sub.type === 'Theory') tTheory += parseFloat(total);
      if (sub.type === 'Practical') tPractical += parseFloat(total);
      if (grade === 'F') hasFail = true;
      sumCredits += sub.credits;
      sumPoints += (sub.credits * point);
    });
    setCalculatedTotals({
      tTheory, tPractical, gTotal: tTheory + tPractical, tCredits: sumCredits,
      sgpa: sumCredits > 0 ? (sumPoints / sumCredits).toFixed(2) : 0,
      remarks: hasFail ? 'PROMOTED' : 'PASSED'
    });
  };

  const fetchBlueprint = async (sem, batch, branch) => {
    try {
      const data = await getCourseBlueprint(batch, branch, sem); setBlueprintSubjects(data.subjects || []);
    } catch { setBlueprintSubjects([]); }
  };

  useEffect(() => {
    if (activeAdminTab === 'blueprint') {
      fetchBlueprint(targetSemester, targetBatch, targetBranch);
      setEditIndex(null); setNewSubDef({ subjectCode: '', subjectName: '', type: 'Theory', credits: '', extFull: 70, intFull: 30, totalMax: 100, passExt: 21, passTotal: 35 });
    }
  }, [targetSemester, targetBatch, targetBranch, activeAdminTab]);

  useEffect(() => {
    setHasJustSavedBlueprint(false);
  }, [targetBatch, targetBranch, targetSemester, blueprintSubjects]);

  const handleTypeChange = (e) => {
    const newType = e.target.value;
    if (newType === 'Practical') setNewSubDef({ ...newSubDef, type: newType, extFull: 25, intFull: 25, totalMax: 50, passExt: 0, passTotal: 25 });
    else setNewSubDef({ ...newSubDef, type: newType, extFull: 70, intFull: 30, totalMax: 100, passExt: 21, passTotal: 35 });
  };
  const handleExtIntChange = (field, value) => {
    const newDef = { ...newSubDef, [field]: value };
    newDef.totalMax = (parseFloat(newDef.extFull) || 0) + (parseFloat(newDef.intFull) || 0);
    setNewSubDef(newDef);
  };
  const handleEditRule = (idx) => { setNewSubDef(blueprintSubjects[idx]); setEditIndex(idx); };
  const addSubjectToBlueprint = () => {
    if (!newSubDef.subjectCode || newSubDef.credits === '') return alert("Subject Code and Credits are required!");
    if (editIndex !== null) {
      const updatedSubjects = [...blueprintSubjects]; updatedSubjects[editIndex] = newSubDef;
      setBlueprintSubjects(updatedSubjects); setEditIndex(null);
    } else { setBlueprintSubjects([...blueprintSubjects, newSubDef]); }
    setNewSubDef({ subjectCode: '', subjectName: '', type: 'Theory', credits: '', extFull: 70, intFull: 30, totalMax: 100, passExt: 21, passTotal: 35 });
  };

  const saveBlueprint = async () => {
    setIsBlueprintSaving(true);
    try {
      await saveCourseBlueprint({ semester: targetSemester, batch: targetBatch, branch: targetBranch, subjects: blueprintSubjects });
      displayMessage(`Set saved successfully!`);
      setHasJustSavedBlueprint(true);
    } catch {
      displayMessage("Error saving Set");
    } finally {
      setIsBlueprintSaving(false);
    }
  };

  const loadStudentSheet = async () => {
    if (!uploadSemester || !selectedStudent) return alert("Select Student and Semester");
    const targetStudentObj = users.find(u => u._id === selectedStudent);
    if (!targetStudentObj?.batch || !targetStudentObj?.branch) return alert("Student missing Batch/Branch data.");
    try {
      const data = await getCourseBlueprint(targetStudentObj.batch, targetStudentObj.branch, uploadSemester);
      setActiveBlueprint(data);
      const existingResult = results.find(r => (r.student._id || r.student) === selectedStudent && r.semester === uploadSemester);
      const initialMarks = {};
      if (existingResult) {
        setExistingResultId(existingResult._id); setIsEditMode(false);
        data.subjects.forEach(sub => {
          const exSub = existingResult.subjects.find(s => s.subjectCode === sub.subjectCode);
          initialMarks[sub.subjectCode] = { finExt: exSub ? exSub.finExt : '', terInt: exSub ? exSub.terInt : '' };
        });
      } else {
        setExistingResultId(null); setIsEditMode(true);
        data.subjects.forEach(sub => { initialMarks[sub.subjectCode] = { finExt: '', terInt: '' }; });
      }
      setStudentMarks(initialMarks);
      recalculateAllTotals(initialMarks, data);
    // eslint-disable-next-line no-unused-vars
    } catch (error) { alert(`No Blueprint found for this class.`); setActiveBlueprint(null); }
  };

  const triggerEditFromResult = async (result) => {
    const studentObj = users.find(u => u._id === (result.student._id || result.student));
    if (!studentObj) return alert("Student data missing.");
    setUploadBatch(studentObj.batch || ''); setUploadBranch(studentObj.branch || ''); setUploadSemester(result.semester); setSelectedStudent(studentObj._id);
    try {
      const data = await getCourseBlueprint(studentObj.batch, studentObj.branch, result.semester);
      setActiveBlueprint(data);
      const initialMarks = {};
      data.subjects.forEach(sub => {
        const exSub = result.subjects.find(s => s.subjectCode === sub.subjectCode);
        initialMarks[sub.subjectCode] = { finExt: exSub ? exSub.finExt : '', terInt: exSub ? exSub.terInt : '' };
      });
      setStudentMarks(initialMarks); setExistingResultId(result._id); setIsEditMode(true); 
      
      handleTabChange('upload');
      setEntryMethod('manual');
      recalculateAllTotals(initialMarks, data);
    // eslint-disable-next-line no-unused-vars
    } catch (e) { alert("Error loading blueprint."); }
  };

  const handleMarkChange = (code, field, value) => {
    const newMarks = { ...studentMarks, [code]: { ...studentMarks[code], [field]: value } };
    setStudentMarks(newMarks); recalculateAllTotals(newMarks, activeBlueprint);
  };

  const submitFinalResult = (e) => {
    e.preventDefault();
    if (!activeBlueprint) return;
    const finalSubjects = activeBlueprint.subjects.map(sub => {
      const marks = studentMarks[sub.subjectCode];
      const { total, grade } = calculateDynamicGrade(marks.finExt, marks.terInt, sub);
      return { subjectCode: sub.subjectCode, subjectName: sub.subjectName, type: sub.type, credits: sub.credits, finExt: marks.finExt, terInt: marks.terInt, total: total.toString(), grade: grade };
    });
    const payload = { student: selectedStudent, semester: uploadSemester, sgpa: calculatedTotals.sgpa, totalTheory: calculatedTotals.tTheory, totalPractical: calculatedTotals.tPractical, grandTotal: calculatedTotals.gTotal, remarks: calculatedTotals.remarks, subjects: finalSubjects };

    payload.isPublished = false;

    handleUpload(payload, existingResultId !== null && isEditMode, existingResultId);
    setActiveBlueprint(null); setSelectedStudent(''); setExistingResultId(null);
  };

  const handleCSVUpload = async (event) => {
    const file = event.target.files[0];
    if (!file || !uploadBatch || !uploadBranch || !uploadSemester) {
      return alert("Please select Batch, Branch, and Semester first before uploading CSV.");
    }

    setCsvLoading(true);
    try {
      const blueprint = await getCourseBlueprint(uploadBatch, uploadBranch, uploadSemester);
      if (!blueprint || !blueprint.subjects) throw new Error("Blueprint not found for this class.");

      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        transformHeader: header => header.trim(),
        complete: async function (parsedResults) {
          try {
            const csvData = parsedResults.data;
            const bulkPayload = [];
            let skippedCount = 0; 

            const studentMap = new Map();
            filteredStudents.forEach(s => {
                if (s.registrationNo) {
                    studentMap.set(String(s.registrationNo).trim(), s);
                }
            });

            for (let row of csvData) {
              const regNo = String(row['RegistrationNo'] || '').trim();
              if (!regNo) continue;

              const student = studentMap.get(regNo);

              if (!student) {
                console.warn(`⚠️ Skipped: Student ${regNo} not found in ${uploadBranch} ${uploadBatch}.`);
                skippedCount++;
                continue;
              }

              let tTheory = 0; let tPractical = 0; let sumCredits = 0; let sumPoints = 0; let hasFail = false;
              
              const finalSubjects = blueprint.subjects.map(sub => {
                const cleanCode = sub.subjectCode.trim();

                const finExt = row[`${cleanCode}_FIN`] || '';
                const terInt = row[`${cleanCode}_INT`] || '';
                const { total, grade, point } = calculateDynamicGrade(finExt, terInt, sub);

                if (sub.type === 'Theory') tTheory += parseFloat(total);
                if (sub.type === 'Practical') tPractical += parseFloat(total);
                if (grade === 'F') hasFail = true;
                sumCredits += sub.credits; sumPoints += (sub.credits * point);

                return { subjectCode: cleanCode, subjectName: sub.subjectName, type: sub.type, credits: sub.credits, finExt, terInt, total: total.toString(), grade };
              });

              const sgpa = sumCredits > 0 ? (sumPoints / sumCredits).toFixed(2) : 0;
              const remarks = hasFail ? 'PROMOTED' : 'PASSED';

              bulkPayload.push({
                student: student._id, semester: uploadSemester, sgpa,
                totalTheory: tTheory, totalPractical: tPractical, grandTotal: tTheory + tPractical,
                remarks, subjects: finalSubjects, isPublished: false
              });
            }

            if (bulkPayload.length === 0) {
              return alert(`Upload Failed: Found 0 matching students.\n\n(We had to skip ${skippedCount} rows because those Registration Numbers don't exist in the ${uploadBranch} ${uploadBatch} database yet).`);
            }

            const overwritingCount = bulkPayload.filter(newDraft =>
              results.some(existing =>
                (existing.student._id || existing.student) === newDraft.student &&
                existing.semester === uploadSemester &&
                existing.isPublished === true
              )
            ).length;

            if (overwritingCount > 0) {
              const confirmMsg = `⚠️ WARNING: ${overwritingCount} students in this CSV already have LIVE published results for ${uploadSemester}.\n\nUploading this CSV will OVERWRITE their live records and turn them back into Drafts. Do you wish to continue?`;
              if (!window.confirm(confirmMsg)) {
                setCsvLoading(false);
                if (fileInputRef.current) fileInputRef.current.value = "";
                return; 
              }
            }

            const response = await bulkUploadResults({ results: bulkPayload });
            displayMessage(response.message || `Uploaded ${bulkPayload.length} drafts!`);
            await fetchAdminData();

            handleTabChange('publish');
            setPublishBatch(uploadBatch);
            setPublishBranch(uploadBranch);
            setPublishSemester(uploadSemester);

          } catch (e) {
            alert("Error processing CSV: " + e.message);
          } finally {
            setCsvLoading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
          }
        }
      });
    } catch (error) {
      alert(error.message);
      setCsvLoading(false);
    }
  };

  const handleBulkPublish = async (forceInstant = false) => {
    if (!publishBatch || !publishBranch || !publishSemester) return alert("Please select a Batch, Branch, and Semester to publish.");
    if (pendingDraftsForPublish.length === 0) return alert("No drafts available to publish.");

    const actualScheduleDate = forceInstant ? null : (scheduleDate || null);

    let confirmMsg = `Are you sure you want to PUBLISH all ${pendingDraftsForPublish.length} drafts for ${publishBranch} ${publishBatch} - ${publishSemester} NOW?\n\nStudents will receive a Mass Notification immediately.`;

    if (actualScheduleDate) {
      confirmMsg = `Are you sure you want to SCHEDULE all ${pendingDraftsForPublish.length} drafts to automatically publish on ${new Date(actualScheduleDate).toLocaleString()}?`;
    }

    if (window.confirm(confirmMsg)) {
      setBulkPublishLoading(true);
      try {
        const draftIds = pendingDraftsForPublish.map(draft => draft._id);
        const studentIds = pendingDraftsForPublish.map(draft => draft.student._id || draft.student);

        const data = await publishBatchResults({
          draftIds: draftIds,
          studentIds: studentIds,
          semester: publishSemester,
          scheduledDate: actualScheduleDate
        });

        displayMessage(data.message);
        await fetchAdminData();
        setScheduleDate('');
        handleTabChange('manage'); 
      // eslint-disable-next-line no-unused-vars
      } catch (error) {
        displayMessage("Failed to publish/schedule batch.");
      } finally {
        setBulkPublishLoading(false);
      }
    }
  };

  return (
    // 🟢 UPDATED: Flex-1 and min-h-0 to enable inner scrolling
    <div className="w-full flex flex-col flex-1 min-h-0 gap-4">
      
      {/* 🟢 SCROLLABLE TABS */}
      <div className="flex-shrink-0 w-fit mx-auto overflow-hidden bg-white p-1.5 rounded-xl shadow-sm border border-slate-200 z-10">
        <div className="flex gap-1 justify-start sm:justify-center overflow-x-auto custom-scrollbar snap-x snap-mandatory pb-1 sm:pb-0">
          <button onClick={() => { handleTabChange('blueprint'); setActiveBlueprint(null); }} className={`snap-start px-3 sm:px-4 py-2 rounded-lg font-bold text-xs transition-all whitespace-nowrap flex-shrink-0 ${activeAdminTab === 'blueprint' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}>1. Define Set</button>
          <button onClick={() => handleTabChange('upload')} className={`snap-start px-3 sm:px-4 py-2 rounded-lg font-bold text-xs transition-all whitespace-nowrap flex-shrink-0 ${activeAdminTab === 'upload' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}>2. Enter Marks</button>
          <button onClick={() => { handleTabChange('publish'); setActiveBlueprint(null); }} className={`snap-start px-3 sm:px-4 py-2 rounded-lg font-bold text-xs transition-all whitespace-nowrap flex-shrink-0 ${activeAdminTab === 'publish' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}>3. Review & Publish</button>
          <button onClick={() => { handleTabChange('manage'); setActiveBlueprint(null); }} className={`snap-start px-3 sm:px-4 py-2 rounded-lg font-bold text-xs transition-all whitespace-nowrap flex-shrink-0 ${activeAdminTab === 'manage' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}>4. Manage Records</button>
        </div>
      </div>

      {/* 🟢 INNER SCROLL CONTAINER */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 flex flex-col min-h-0">
        <div className="bg-white shadow-sm rounded-[1.5rem] p-4 sm:p-6 border border-slate-100 w-full flex flex-col flex-shrink-0 mb-4">
          
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-[0.8rem] bg-gradient-to-br from-indigo-100 to-emerald-100 flex items-center justify-center border border-indigo-200 flex-shrink-0">
                <GraduationCap className="text-indigo-600 w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="overflow-hidden">
                <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-none truncate">Results</h1>
                <p className="text-[10px] sm:text-xs text-slate-500 font-medium mt-0.5 truncate">Academic Management</p>
              </div>
            </div>
            <div className="hidden md:flex items-center justify-center text-center">
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-800 flex items-center gap-2">
                {activeAdminTab === 'blueprint' && <Settings className="text-emerald-500 w-5 h-5" />}
                {activeAdminTab === 'upload' && <Calculator className="text-purple-500 w-5 h-5" />}
                {activeAdminTab === 'publish' && <ListChecks className="text-indigo-500 w-5 h-5" />}
                {activeAdminTab === 'manage' && <FileArchive className="text-blue-500 w-5 h-5" />}
                {activeAdminTab === 'blueprint' ? 'Define Course Structure' :
                  activeAdminTab === 'upload' ? 'Enter Student Marks' :
                    activeAdminTab === 'publish' ? 'Review Drafts & Publish' :
                      'Manage All Records'}
              </h2>
            </div>
            <div className="text-right bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 hidden sm:block">
              <span className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Access</span>
              <p className="font-extrabold text-indigo-600 text-xs sm:text-sm">Admin</p>
            </div>
          </div>

          {/* TAB 1: DEFINE BLUEPRINT */}
          {activeAdminTab === 'blueprint' && (
            <div className="w-full">
              <div className="w-full space-y-4">
                <div className="flex flex-col md:flex-row md:items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full md:w-auto flex-1">
                    <div className="flex flex-col gap-1">
                      <span className="font-bold text-slate-700 text-xs uppercase">Batch:</span>
                      <select className="p-2.5 border border-slate-300 rounded-lg outline-none text-sm bg-white" value={targetBatch} onChange={e => setTargetBatch(e.target.value)}><option value="">Select Batch...</option>{batches.map(b => <option key={b} value={b}>{b}</option>)}</select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="font-bold text-slate-700 text-xs uppercase">Branch:</span>
                      <select className="p-2.5 border border-slate-300 rounded-lg outline-none text-sm bg-white" value={targetBranch} onChange={e => setTargetBranch(e.target.value)}>
                        <option value="">Select Branch...</option>
                        {branches.length === 0 ? <option disabled>No Branches Configured</option> : branches.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="font-bold text-slate-700 text-xs uppercase">Semester:</span>
                      <select className="p-2.5 border border-slate-300 rounded-lg outline-none text-sm bg-white" value={targetSemester} onChange={e => setTargetSemester(e.target.value)}><option value="">Select Semester...</option>{semesters.map(s => <option key={s} value={s}>{s}</option>)}</select>
                    </div>
                  </div>

                  <button 
                    onClick={saveBlueprint} 
                    disabled={isBlueprintSaving || !targetBatch || !targetBranch || !targetSemester}
                    className={`mt-2 md:mt-0 md:ml-auto px-6 py-3 rounded-xl font-bold text-sm shadow-md transition w-full md:w-auto flex items-center justify-center gap-2 ${
                      hasJustSavedBlueprint 
                      ? 'bg-emerald-500 text-white cursor-default' 
                      : isBlueprintSaving 
                        ? 'bg-indigo-400 text-white cursor-wait' 
                        : (!targetBatch || !targetBranch || !targetSemester)
                          ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300 shadow-none'
                          : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                  >
                    {isBlueprintSaving ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : hasJustSavedBlueprint ? <><CheckCircle2 size={16} /> Saved!</> : 'Save Semester Set'}
                  </button>
                </div>

                {(!targetBatch || !targetBranch || !targetSemester) ? (
                    <div className="flex flex-col items-center justify-center text-slate-400 py-16 bg-white rounded-xl border border-slate-200 mt-4 pb-0">
                        <Settings size={32} className="mb-2 opacity-50"/>
                        <p className="font-medium text-sm text-center px-4">Please select a Batch, Branch, and Semester above to view or configure its Course Set.</p>
                    </div>
                ) : (
                    <>
                        <div className={`bg-white border border-slate-200 p-4 sm:p-5 rounded-xl space-y-4 transition-colors ${editIndex !== null ? 'ring-2 ring-indigo-400 bg-indigo-50/30' : ''}`}>
                          <h3 className="font-extrabold text-slate-800 text-sm border-b pb-3 flex items-center justify-between">
                            {editIndex !== null ? <span className="text-indigo-600 flex items-center gap-2"><Pencil size={16} /> Editing Rule...</span> : 'Add Subject Rules'}
                            {editIndex !== null && (<button onClick={() => { setEditIndex(null); setNewSubDef({ subjectCode: '', subjectName: '', type: 'Theory', credits: '', extFull: 70, intFull: 30, totalMax: 100, passExt: 21, passTotal: 35 }); }} className="text-xs text-slate-500 hover:text-rose-600 font-bold bg-slate-100 hover:bg-rose-50 px-3 py-1 rounded-md transition-colors">Cancel Edit</button>)}
                          </h3>
                          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-12 gap-3 sm:gap-4">
                            <div className="col-span-2 lg:col-span-2"><label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Subject Code</label><input type="text" placeholder="e.g. HS1101" className="w-full p-2.5 border border-slate-300 rounded-lg text-sm font-bold" value={newSubDef.subjectCode} onChange={e => setNewSubDef({...newSubDef, subjectCode: e.target.value})} /></div>
                            <div className="col-span-2 lg:col-span-4"><label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Subject Name</label><input type="text" placeholder="e.g. Engineering Maths" className="w-full p-2.5 border border-slate-300 rounded-lg text-sm" value={newSubDef.subjectName} onChange={e => setNewSubDef({...newSubDef, subjectName: e.target.value})} /></div>
                            <div className="col-span-1 lg:col-span-2"><label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Type</label><select className="w-full p-2.5 border border-slate-300 rounded-lg text-sm bg-white" value={newSubDef.type} onChange={handleTypeChange}><option value="Theory">Theory</option><option value="Practical">Practical</option></select></div>
                            <div className="col-span-1 lg:col-span-1"><label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Credits</label><input type="number" placeholder="0" className="w-full p-2.5 border border-slate-300 rounded-lg text-sm" value={newSubDef.credits} onChange={e => setNewSubDef({...newSubDef, credits: e.target.value})} /></div>
                            
                            <div className="col-span-1 lg:col-span-1"><label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Ext. Max</label><input type="number" placeholder="70" className="w-full p-2.5 border border-slate-300 rounded-lg text-sm" value={newSubDef.extFull} onChange={e => handleExtIntChange('extFull', e.target.value)} /></div>
                            <div className="col-span-1 lg:col-span-1"><label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Int. Max</label><input type="number" placeholder="30" className="w-full p-2.5 border border-slate-300 rounded-lg text-sm" value={newSubDef.intFull} onChange={e => handleExtIntChange('intFull', e.target.value)} /></div>
                            <div className="col-span-2 sm:col-span-1 lg:col-span-1"><label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Total</label><input type="number" placeholder="100" className="w-full p-2.5 border border-slate-200 rounded-lg text-sm font-bold bg-slate-100 cursor-not-allowed text-slate-500" value={newSubDef.totalMax} readOnly title="Auto-calculated" /></div>
                            
                            <div className="col-span-1 lg:col-span-2"><label className="text-[10px] font-bold text-emerald-600 uppercase block mb-1">Pass Ext.</label><input type="number" placeholder="21" className="w-full p-2.5 border border-emerald-300 rounded-lg text-sm bg-emerald-50/30 focus:border-emerald-500 outline-none" value={newSubDef.passExt} onChange={e => setNewSubDef({...newSubDef, passExt: e.target.value})} /></div>
                            <div className="col-span-1 lg:col-span-2"><label className="text-[10px] font-bold text-emerald-600 uppercase block mb-1">Pass Total</label><input type="number" placeholder="35" className="w-full p-2.5 border border-emerald-300 rounded-lg text-sm bg-emerald-50/30 focus:border-emerald-500 outline-none" value={newSubDef.passTotal} onChange={e => setNewSubDef({...newSubDef, passTotal: e.target.value})} /></div>
                            
                            <div className="col-span-2 sm:col-span-4 lg:col-span-12 flex justify-end mt-2">
                              <button onClick={addSubjectToBlueprint} className={`w-full md:w-auto px-8 py-3 text-white font-extrabold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 ${editIndex !== null ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-slate-800 hover:bg-black'}`}>
                                {editIndex !== null ? <><CheckCircle2 size={16}/> Update Rule</> : <><Plus size={16}/> Add Rule to Set</>}
                              </button>
                            </div>
                          </div>
                        </div>

                        {blueprintSubjects.length > 0 && (
                          <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm mt-6 mb-0">
                            <div className="overflow-x-auto custom-scrollbar">
                              <table className="w-full text-left text-sm min-w-[700px]">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                  <tr><th className="p-3 text-slate-600 font-extrabold text-xs uppercase tracking-wider">Code</th><th className="p-3 text-slate-600 font-extrabold text-xs uppercase tracking-wider">Subject Name</th><th className="p-3 text-center text-slate-600 font-extrabold text-xs uppercase tracking-wider">Type</th><th className="p-3 text-center text-slate-600 font-extrabold text-xs uppercase tracking-wider">Cr.</th><th className="p-3 text-slate-500 text-center font-extrabold text-xs uppercase tracking-wider">Ext/Int/Total Max</th><th className="p-3 text-emerald-600 text-center font-extrabold text-xs uppercase tracking-wider">Pass Ext/Total</th><th className="p-3"></th></tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                  {blueprintSubjects.map((sub, idx) => (
                                    <tr key={idx} className={`transition-colors ${editIndex === idx ? 'bg-indigo-50/50' : 'hover:bg-slate-50'}`}>
                                      <td className="p-3 font-black text-slate-800">{sub.subjectCode}</td>
                                      <td className="p-3 text-slate-700 font-medium">{sub.subjectName || '-'}</td>
                                      <td className="p-3 text-center">
                                        <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-md border ${sub.type === 'Theory' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>{sub.type}</span>
                                      </td>
                                      <td className="p-3 text-center font-bold text-slate-600">{sub.credits}</td>
                                      <td className="p-3 text-slate-500 font-medium text-center">{sub.extFull} / {sub.intFull} / <span className="font-bold text-slate-700">{sub.totalMax}</span></td>
                                      <td className="p-3 text-emerald-600 font-bold text-center">{sub.passExt || '-'} / {sub.passTotal}</td>
                                      <td className="p-3 text-right min-w-[80px]">
                                        <button onClick={() => handleEditRule(idx)} className="text-indigo-500 hover:text-indigo-700 hover:bg-indigo-50 p-2 rounded-lg transition-colors mr-1" title="Edit"><Pencil size={16}/></button>
                                        <button onClick={()=> {
                                          setBlueprintSubjects(blueprintSubjects.filter((_, i) => i !== idx));
                                          if (editIndex === idx) { setEditIndex(null); setNewSubDef({ subjectCode: '', subjectName: '', type: 'Theory', credits: '', extFull: 70, intFull: 30, totalMax: 100, passExt: 21, passTotal: 35 }); }
                                        }} className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 p-2 rounded-lg transition-colors" title="Delete"><Trash2 size={16}/></button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                    </>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: ENTER MARKS */}
          {activeAdminTab === 'upload' && (
            <div className="w-full">
              {!activeBlueprint ? (
                <div className="max-w-3xl mx-auto bg-slate-50 p-4 sm:p-6 rounded-2xl border border-slate-200 text-center mt-2 sm:mt-6 shadow-sm">
                  
                  <div className="flex justify-center mb-6 overflow-x-auto pb-2 custom-scrollbar">
                      <div className="bg-slate-200 p-1.5 rounded-xl inline-flex shadow-inner">
                          <button 
                              onClick={() => { setEntryMethod('manual'); setSelectedStudent(''); }} 
                              className={`px-4 sm:px-6 py-2.5 rounded-lg text-sm font-black transition-all whitespace-nowrap ${entryMethod === 'manual' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-300/50'}`}
                          >
                              Single Student (Manual)
                          </button>
                          <button 
                              onClick={() => { setEntryMethod('csv'); setSelectedStudent(''); }} 
                              className={`px-4 sm:px-6 py-2.5 rounded-lg text-sm font-black transition-all whitespace-nowrap ${entryMethod === 'csv' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-300/50'}`}
                          >
                              Whole Class (CSV)
                          </button>
                      </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">1. Select Batch</label>
                      <select className="w-full p-3 bg-white border border-slate-300 rounded-xl outline-none focus:border-indigo-400 font-bold text-slate-800 shadow-sm" value={uploadBatch} onChange={e => {setUploadBatch(e.target.value); setSelectedStudent('');}}><option value="">Choose Batch...</option>{batches.map(b => <option key={b} value={b}>{b}</option>)}</select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">2. Select Branch</label>
                      <select className="w-full p-3 bg-white border border-slate-300 rounded-xl outline-none focus:border-indigo-400 font-bold text-slate-800 shadow-sm" value={uploadBranch} onChange={e => {setUploadBranch(e.target.value); setSelectedStudent('');}}>
                        <option value="">Choose Branch...</option>
                        {branches.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
                      </select>
                    </div>
                    <div className="sm:col-span-2 lg:col-span-1">
                      <label className="text-[10px] font-bold text-emerald-600 uppercase block mb-1.5">3. Select Semester</label>
                      <select className="w-full p-3 bg-emerald-50/50 border border-emerald-300 rounded-xl outline-none focus:border-emerald-500 font-bold text-emerald-800 shadow-sm" value={uploadSemester} onChange={e => setUploadSemester(e.target.value)}><option value="">Choose Semester...</option>{semesters.map(s => <option key={s} value={s}>{s}</option>)}</select>
                    </div>
                    
                    {entryMethod === 'manual' && (
                        <div className="animate-in fade-in zoom-in-95 duration-200 sm:col-span-2 lg:col-span-1">
                          <label className="text-[10px] font-bold text-indigo-600 uppercase block mb-1.5">4. Select Student</label>
                          <select className="w-full p-3 bg-indigo-50/50 border border-indigo-300 rounded-xl outline-none focus:border-indigo-500 disabled:bg-slate-100 disabled:border-slate-200 font-bold text-indigo-900 shadow-sm" value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)} disabled={!uploadBatch || !uploadBranch}>
                            <option value="">{!uploadBatch || !uploadBranch ? 'Select Batch & Branch first...' : 'Choose Student...'}</option>
                            {filteredStudents.map(u => <option key={u._id} value={u._id}>{u.name} (Reg: {u.registrationNo || 'N/A'})</option>)}
                          </select>
                        </div>
                    )}
                  </div>
                  
                  <div className="mt-8 flex justify-center border-t border-slate-200 pt-6 pb-0">
                    {entryMethod === 'manual' ? (
                        <button onClick={loadStudentSheet} disabled={!selectedStudent || !uploadSemester} className="w-full sm:w-2/3 py-3.5 bg-slate-800 text-white font-extrabold rounded-xl hover:bg-black transition-all text-sm shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                            <Calculator size={18}/> Open Grading Sheet
                        </button>
                    ) : (
                        <div className="w-full sm:w-2/3 relative animate-in fade-in zoom-in-95 duration-200">
                            <input type="file" accept=".csv" ref={fileInputRef} onChange={handleCSVUpload} className="hidden" id="csv-upload" />
                            <label htmlFor="csv-upload" className={`w-full py-4 ${csvLoading ? 'bg-slate-300 text-slate-500' : 'bg-emerald-600 hover:bg-emerald-700 text-white'} font-extrabold rounded-xl transition-all text-sm shadow-md cursor-pointer flex items-center justify-center gap-2`}>
                                {csvLoading ? <Loader2 size={20} className="animate-spin"/> : <FileSpreadsheet size={20}/>}
                                {csvLoading ? 'Processing CSV...' : 'Select & Upload CSV File'}
                            </label>
                            <p className="text-[10px] font-bold text-slate-400 mt-3 mb-0">Format: RegistrationNo, SubCode_FIN, SubCode_INT, etc.</p>
                        </div>
                    )}
                  </div>

                </div>
              ) : (
                <form onSubmit={submitFinalResult} className="space-y-4 max-w-5xl mx-auto pb-0">
                  <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border shadow-sm ${existingResultId && !isEditMode ? 'bg-amber-50 border-amber-200' : 'bg-indigo-50 border-indigo-200'}`}>
                    <div>
                      <p className={`text-xs font-black uppercase tracking-widest mb-1 ${existingResultId && !isEditMode ? 'text-amber-600' : 'text-indigo-600'}`}>
                        {existingResultId && !isEditMode ? 'Record Locked (Read-Only)' : 'Active Grading Sheet'}
                      </p>
                      <p className="text-xl sm:text-2xl font-extrabold text-slate-900">{uploadSemester} - {users.find(u => u._id === selectedStudent)?.name}</p>
                    </div>
                    <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between gap-2">
                      <button type="button" onClick={() => { setActiveBlueprint(null); setExistingResultId(null); }} className="text-xs font-bold text-slate-500 hover:text-slate-800 underline bg-white/50 px-3 py-1.5 rounded-lg border border-slate-200 sm:border-none sm:bg-transparent">Change Target</button>
                      {existingResultId && !isEditMode && (<button type="button" onClick={() => setIsEditMode(true)} className="flex items-center justify-center gap-1.5 text-sm font-bold text-white bg-amber-500 hover:bg-amber-600 shadow-sm px-4 py-2 rounded-xl mt-0 sm:mt-1 transition-colors w-full sm:w-auto"><Unlock size={16} /> Enable Editing</button>)}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-inner">
                    <div className="p-3 bg-white border border-slate-200 rounded-xl flex flex-col justify-center items-center shadow-sm"><span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Theory</span><span className="font-black text-slate-800 text-lg leading-none">{calculatedTotals.tTheory}</span></div>
                    <div className="p-3 bg-white border border-slate-200 rounded-xl flex flex-col justify-center items-center shadow-sm"><span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Practical</span><span className="font-black text-slate-800 text-lg leading-none">{calculatedTotals.tPractical}</span></div>
                    <div className="p-3 bg-white border border-slate-200 rounded-xl flex flex-col justify-center items-center shadow-sm col-span-2 sm:col-span-1"><span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Grand Total</span><span className="font-black text-slate-800 text-lg leading-none">{calculatedTotals.gTotal}</span></div>
                    <div className="p-3 bg-white border border-slate-200 rounded-xl flex flex-col justify-center items-center shadow-sm"><span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Credits</span><span className="font-black text-slate-800 text-lg leading-none">{calculatedTotals.tCredits}</span></div>
                    <div className="p-3 bg-indigo-600 border border-indigo-700 rounded-xl flex flex-col justify-center items-center shadow-md"><span className="text-[10px] text-indigo-200 font-black uppercase tracking-widest mb-1">SGPA</span><span className="font-black text-white text-2xl leading-none">{calculatedTotals.sgpa}</span></div>
                  </div>

                  <div className={`bg-white border rounded-xl shadow-sm ${existingResultId && !isEditMode ? 'border-amber-200 opacity-95' : 'border-slate-200'}`}>
                    <div className="overflow-x-auto custom-scrollbar">
                      <table className="w-full text-left text-sm min-w-[650px]">
                        <thead className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 uppercase tracking-widest font-black">
                          <tr><th className="p-4">Subject Information</th><th className="p-4 w-32 text-center">FIN / EXT</th><th className="p-4 w-32 text-center">TER / INT</th><th className="p-4 text-center">Live Total</th><th className="p-4 text-center">Grade</th></tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {activeBlueprint.subjects.map(sub => {
                            const marks = studentMarks[sub.subjectCode];
                            const { total, grade } = calculateDynamicGrade(marks.finExt, marks.terInt, sub);
                            return (
                              <tr key={sub.subjectCode} className="hover:bg-slate-50/50 transition-colors">
                                <td className="p-4">
                                  <div className="flex flex-col">
                                    <span className="font-black text-slate-900 text-base">{sub.subjectCode}</span>
                                    <span className="text-xs font-bold text-slate-600 mt-0.5">{sub.subjectName || '-'}</span>
                                    <div className="flex gap-2 mt-1.5">
                                        <span className="text-[9px] font-bold px-2 py-0.5 rounded border border-slate-200 bg-slate-100 text-slate-500 uppercase">Max: {sub.extFull}/{sub.intFull}</span>
                                        <span className="text-[9px] font-bold px-2 py-0.5 rounded border border-emerald-200 bg-emerald-50 text-emerald-600 uppercase">Pass: {sub.passExt || '-'}/{sub.passTotal}</span>
                                    </div>
                                  </div>
                                </td>
                                <td className="p-4"><input type="number" placeholder={`/${sub.extFull}`} className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-center font-bold text-slate-800 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed transition-all" value={marks.finExt} onChange={(e) => handleMarkChange(sub.subjectCode, 'finExt', e.target.value)} disabled={existingResultId && !isEditMode} /></td>
                                <td className="p-4"><input type="number" placeholder={`/${sub.intFull}`} className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-center font-bold text-slate-800 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed transition-all" value={marks.terInt} onChange={(e) => handleMarkChange(sub.subjectCode, 'terInt', e.target.value)} disabled={existingResultId && !isEditMode} /></td>
                                <td className="p-4 text-center">
                                    <div className="flex flex-col items-center justify-center">
                                        <span className="font-black text-slate-900 text-lg leading-none">{total}</span>
                                        <span className="text-[10px] text-slate-400 font-bold mt-1">out of {sub.totalMax}</span>
                                    </div>
                                </td>
                                <td className="p-4 text-center">
                                    <span className={`inline-flex items-center justify-center w-10 h-10 rounded-xl font-black text-lg ${grade === 'F' ? 'bg-rose-100 text-rose-600 border border-rose-200' : 'bg-emerald-100 text-emerald-600 border border-emerald-200'}`}>{grade}</span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {existingResultId && !isEditMode ? (
                    <div className="w-full py-4 bg-slate-100 text-slate-400 font-black rounded-xl border border-slate-200 shadow-inner text-sm uppercase tracking-widest flex justify-center items-center gap-2 cursor-not-allowed mb-0"><Lock size={18} /> Record Locked - Enable Edit to Modify</div>
                  ) : (
                    <button type="submit" className={`w-full py-4 text-white font-black rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98] transition-all text-sm uppercase tracking-widest flex justify-center items-center gap-2 mb-0 ${existingResultId ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-slate-900 hover:bg-black'}`}>
                      <CheckCircle2 size={20} /> {existingResultId ? 'Update & Save Draft' : 'Save As Draft Record'}
                    </button>
                  )}
                </form>
              )}
            </div>
          )}

          {/* TAB 3: REVIEW DRAFTS & PUBLISH */}
          {activeAdminTab === 'publish' && (
            <div className="flex flex-col bg-indigo-50/30 rounded-xl border border-indigo-100 p-2 sm:p-4 w-full">

              <div className="bg-white p-4 rounded-xl shadow-sm border border-indigo-200 flex flex-col md:flex-row md:items-end gap-4 mb-4">
                <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-indigo-800 uppercase block mb-1">Target Batch</label>
                    <select className="w-full p-2.5 border border-indigo-200 rounded-lg text-sm outline-none bg-slate-50 focus:bg-white font-bold text-slate-700" value={publishBatch} onChange={e => setPublishBatch(e.target.value)}><option value="">Select Batch</option>{batches.map(b => <option key={b} value={b}>{b}</option>)}</select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-indigo-800 uppercase block mb-1">Target Branch</label>
                    <select className="w-full p-2.5 border border-indigo-200 rounded-lg text-sm outline-none bg-slate-50 focus:bg-white font-bold text-slate-700" value={publishBranch} onChange={e => setPublishBranch(e.target.value)}>
                      <option value="">Select Branch</option>
                      {branches.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-indigo-800 uppercase block mb-1">Target Semester</label>
                    <select className="w-full p-2.5 border border-indigo-200 rounded-lg text-sm outline-none bg-slate-50 focus:bg-white font-bold text-slate-700" value={publishSemester} onChange={e => setPublishSemester(e.target.value)}><option value="">Select Semester</option>{semesters.map(s => <option key={s} value={s}>{s}</option>)}</select>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-inner border border-slate-200 overflow-hidden flex flex-col">
                <div className="p-3 sm:p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                  <h3 className="font-extrabold text-slate-800 flex items-center gap-2 text-sm sm:text-base">
                    <FileArchive size={18} className="text-amber-500" />
                    Pending Drafts to Publish
                  </h3>
                  <span className="bg-amber-100 text-amber-800 text-xs font-black px-3 py-1 rounded-full w-max">{pendingDraftsForPublish.length} Found</span>
                </div>

                <div className="p-3 sm:p-4 pb-0">
                  {(!publishBatch || !publishBranch || !publishSemester) ? (
                    <div className="flex flex-col items-center justify-center text-slate-400 py-10">
                      <UploadCloud size={40} className="mb-3 opacity-50" />
                      <p className="font-medium text-sm text-center px-4">Select a Batch, Branch, and Semester above to view drafts.</p>
                    </div>
                  ) : pendingDraftsForPublish.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-emerald-500 py-10">
                      <CheckCircle2 size={40} className="mb-3 opacity-50" />
                      <p className="font-medium text-sm text-center px-4">All clear! No unpublished drafts found for this class.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                      {pendingDraftsForPublish.map(draft => {
                        const studentObj = users.find(u => u._id === (draft.student._id || draft.student));
                        return (
                          <div key={draft._id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:border-amber-300 transition-colors group">
                            <div className="flex justify-between items-start mb-3">
                              <div className="min-w-0 pr-2">
                                <p className="font-extrabold text-slate-800 text-sm sm:text-base truncate group-hover:text-indigo-600 transition-colors">{studentObj?.name || 'Unknown'}</p>
                                <p className="text-[10px] sm:text-xs text-slate-500 font-bold mt-0.5">{studentObj?.registrationNo || 'N/A'}</p>
                              </div>
                              <span className="bg-amber-50 text-amber-600 border border-amber-200 text-[9px] font-black px-2 py-1 rounded-md uppercase tracking-wider flex-shrink-0 shadow-sm">Draft</span>
                            </div>
                            <div className="flex justify-between items-end border-t border-slate-100 pt-3 mt-1">
                              <span className={`text-[10px] px-2 py-1 rounded-md font-black uppercase tracking-wider ${draft.remarks === 'PASSED' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-rose-50 text-rose-600 border border-rose-200'}`}>{draft.remarks}</span>
                              <div className="flex flex-col items-end">
                                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">SGPA</span>
                                  <span className="text-lg font-black text-indigo-600 leading-none">{draft.sgpa?.toFixed(2)}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 flex flex-col md:flex-row items-end md:items-center gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-0 pb-4">
                <div className="flex-1 w-full">
                  <label className="text-[10px] font-bold text-indigo-800 uppercase block mb-1.5 ml-1">Schedule Automatic Release (Optional)</label>
                  <div className="relative">
                    <input type="datetime-local" className="w-full p-3 pl-10 border border-indigo-200 rounded-xl text-sm outline-none bg-slate-50 focus:bg-white font-bold text-slate-700 transition-colors" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)} disabled={pendingDraftsForPublish.length === 0} />
                    <CalendarClock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400" />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                  {scheduleDate && (
                    <button
                      onClick={() => handleBulkPublish(true)}
                      disabled={bulkPublishLoading}
                      className="w-full sm:w-auto px-5 py-3 text-indigo-600 bg-indigo-50 border border-indigo-200 font-black rounded-xl hover:bg-indigo-100 hover:border-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap text-sm flex items-center justify-center gap-2 transition-all shadow-sm"
                    >
                      <UploadCloud size={18} /> Publish Instantly
                    </button>
                  )}

                  <button
                    onClick={() => handleBulkPublish(false)}
                    disabled={bulkPublishLoading || pendingDraftsForPublish.length === 0}
                    className={`w-full sm:w-auto px-6 py-3 text-white font-black rounded-xl shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap text-sm flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 ${scheduleDate ? 'bg-amber-500 hover:bg-amber-600' : 'bg-gradient-to-r from-indigo-600 to-purple-600'}`}
                  >
                    {bulkPublishLoading ? <Loader2 size={18} className="animate-spin" /> : (scheduleDate ? <CalendarClock size={18} /> : <UploadCloud size={18} />)}
                    {scheduleDate ? 'Schedule Release' : `Publish All ${pendingDraftsForPublish.length > 0 ? `(${pendingDraftsForPublish.length})` : ''} Now`}
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* TAB 4: MANAGE ALL RECORDS */}
          {activeAdminTab === 'manage' && (
            <div className="w-full flex flex-col">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mb-4 bg-slate-50 p-3 sm:p-4 rounded-xl border border-slate-200">
                <select className="p-2.5 border border-slate-300 rounded-lg text-xs sm:text-sm outline-none bg-white font-bold text-slate-700 shadow-sm" value={manageBatch} onChange={e => setManageBatch(e.target.value)}><option value="">All Batches</option>{batches.map(b => <option key={b} value={b}>{b}</option>)}</select>
                <select className="p-2.5 border border-slate-300 rounded-lg text-xs sm:text-sm outline-none bg-white font-bold text-slate-700 shadow-sm" value={manageBranch} onChange={e => setManageBranch(e.target.value)}>
                  <option value="">All Branches</option>
                  {branches.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
                </select>
                <select className="p-2.5 border border-slate-300 rounded-lg text-xs sm:text-sm outline-none bg-white font-bold text-slate-700 shadow-sm col-span-2 lg:col-span-1" value={manageSemester} onChange={e => setManageSemester(e.target.value)}><option value="">All Semesters</option>{semesters.map(s => <option key={s} value={s}>{s}</option>)}</select>
                <div className="relative col-span-2 lg:col-span-1">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" placeholder="Search Name/Reg..." value={manageSearch} onChange={e => setManageSearch(e.target.value)} className="w-full p-2.5 pl-9 border border-slate-300 rounded-lg text-xs sm:text-sm outline-none bg-white font-bold text-slate-700 shadow-sm" />
                </div>
              </div>

              <div className="w-full flex flex-col pb-0">
                <div className="flex flex-col gap-3 pb-0">
                  {filteredResults.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
                          <Search className="w-10 h-10 text-slate-300 mb-3"/>
                          <p className="text-slate-500 font-medium text-sm">No records found matching filters.</p>
                      </div>
                  ) : filteredResults.map(result => {
                    const studentObj = users.find(u => u._id === (result.student._id || result.student));
                    return (
                      <div key={result._id} className="p-4 sm:p-5 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-indigo-300 hover:shadow-md transition-all">
                        <div className="overflow-hidden w-full flex items-start gap-3 sm:gap-4">

                          <div className="mt-1 flex flex-col gap-1.5 flex-shrink-0">
                            {result.isPublished ? (
                              <span className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 px-2.5 py-1 rounded-md text-[9px] sm:text-[10px] font-black uppercase tracking-wider"><Eye size={14} /> Live</span>
                            ) : (
                              <span className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-700 px-2.5 py-1 rounded-md text-[9px] sm:text-[10px] font-black uppercase tracking-wider"><EyeOff size={14} /> Draft</span>
                            )}
                            {result.scheduledPublishDate && (
                              <span className="flex items-center gap-1.5 bg-purple-50 border border-purple-200 text-purple-700 px-2.5 py-1 rounded-md text-[9px] sm:text-[10px] font-black uppercase tracking-wider whitespace-nowrap"><CalendarClock size={12} /> Schd</span>
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <h4 className="font-extrabold text-slate-900 truncate text-base sm:text-lg leading-tight">{studentObj?.name || 'Unknown Student'}</h4>
                            <span className="text-[10px] sm:text-xs font-bold text-slate-500 block mb-2">Reg: {studentObj?.registrationNo || 'N/A'}</span>
                            
                            <div className="flex flex-wrap gap-2 items-center">
                              <span className="text-[10px] bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 font-bold text-slate-700 uppercase tracking-wide">{result.semester}</span>
                              <span className={`text-[10px] px-2.5 py-1 rounded-md border font-bold uppercase tracking-wide ${result.remarks === 'PASSED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>{result.remarks}</span>
                              <span className="text-xs sm:text-sm text-indigo-600 font-black ml-auto md:ml-2">SGPA: {result.sgpa?.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex w-full md:w-auto gap-2 mt-2 md:mt-0 pt-3 md:pt-0 border-t md:border-0 border-slate-100 flex-shrink-0">
                          <button onClick={() => triggerEditFromResult(result)} className="flex-1 md:flex-none px-4 py-2.5 bg-indigo-50 text-indigo-600 font-bold rounded-lg border border-indigo-100 hover:bg-indigo-100 hover:border-indigo-300 text-xs flex items-center justify-center gap-1.5 transition-all"><Pencil size={14} /> Edit</button>
                          <button onClick={() => handleDelete(result._id)} className="flex-1 md:flex-none px-4 py-2.5 bg-rose-50 text-rose-600 font-bold rounded-lg border border-rose-100 hover:bg-rose-100 hover:border-rose-300 text-xs flex items-center justify-center gap-1.5 transition-all"><Trash2 size={14} /> Delete</button>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {totalPages > 1 && (
                  <div className="flex justify-between sm:justify-center items-center gap-2 sm:gap-4 pt-4 pb-0 bg-transparent mt-0">
                    <button 
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 bg-white text-slate-600 font-bold text-xs rounded-lg border border-slate-200 disabled:opacity-50 hover:bg-slate-50 transition-all shadow-sm"
                    >
                      Previous
                    </button>
                    <span className="font-bold text-[10px] sm:text-xs text-slate-500 whitespace-nowrap">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button 
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 bg-indigo-50 text-indigo-600 border border-indigo-200 font-bold text-xs rounded-lg disabled:opacity-50 hover:bg-indigo-100 transition-all shadow-sm"
                    >
                      Next Page
                    </button>
                  </div>
                )}

              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
});

// ==========================================
// 🚀 MAIN COMPONENT
// ==========================================
const Result = () => {
  const { authData, loading } = useAuth();
  const [results, setResults] = useState([]);
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [message, setMessage] = useState('');
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const isOfficial = authData?.userType === "Institute" || authData?.role === "admin" || authData?.role === "superadmin";
  
  const isVerified = authData?.isVerifiedByInstitute === true;

  const displayMessage = useCallback((msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  }, []);

  const fetchData = useCallback(async (page = 1) => {
    // 🟢 THE FIX: Hard block! If there is no user logged in, stop immediately.
    if (!authData) return; 

    try {
      if (isOfficial) {
        const resultsResponse = await getAllResultsForAdmin(page); 
        setResults(resultsResponse.results || resultsResponse);
        if (resultsResponse.pagination) setTotalPages(resultsResponse.pagination.totalPages);

        const usersResponse = await getAdminUsers(page);
        setUsers(usersResponse.users || usersResponse);

        try {
          const deptRes = await getInstituteDepartments();
          setDepartments(deptRes.departments || []);
        } catch (e) {
          console.error("Failed to load departments:", e);
        }
        
      } else {
        try {
          const data = await getClassResultsForStudents(page);
          setResults(data.results || data);
          setUsers(data.users || []);
          if (data.pagination) setTotalPages(data.pagination.totalPages);
        } catch (e) {
          console.error("Failed to fetch class results:", e);
          const myResults = await getMyResults();
          setResults(myResults.results || myResults);
          setUsers([{ _id: authData?._id, ...authData }]);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }, [isOfficial, authData]);

  useEffect(() => { 
    // 🟢 THE FIX: Don't let this hook run if there is no user data!
    if (!authData) return;

    if (!loading && (isOfficial || isVerified)) {
        fetchData(currentPage); 
    }
  }, [loading, fetchData, currentPage, isOfficial, isVerified, authData]);

  const handleUpload = async (resultData, isUpdate, resultId) => {
    try {
      if (isUpdate) {
        await updateResult(resultId, resultData);
        displayMessage("Draft updated successfully!");
      } else {
        await publishResult(resultData);
        displayMessage("Draft saved successfully!");
      }
      fetchData(currentPage); 
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      displayMessage("Failed to save draft.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Permanently delete this record?")) {
      try {
        await deleteResult(id);
        displayMessage("Record deleted.");
        fetchData(currentPage);
      // eslint-disable-next-line no-unused-vars
      } catch (error) {
        displayMessage("Failed to delete.");
      }
    }
  };

  if (!loading && !isOfficial && !isVerified) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full p-6">
        <div className="bg-white p-8 sm:p-10 rounded-[2rem] border border-slate-200 shadow-sm max-w-md text-center flex flex-col items-center">
           <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mb-6 border-4 border-amber-100">
             <Lock className="w-10 h-10 text-amber-500" />
           </div>
           <h1 className="text-xl sm:text-2xl font-black text-slate-900 mb-2">Account Pending</h1>
           <p className="text-slate-500 font-medium text-sm">
             Your account is currently waiting for verification from the Institute Administration. You will gain access to your Academic Results once approved.
           </p>
        </div>
      </div>
    );
  }

  return (
    // 🟢 UPDATED: Matches Department.jsx outer wrapper exactly
    <div className="flex flex-col flex-1 items-center h-[calc(100dvh-60px)] sm:h-[calc(100vh-80px)] w-full max-w-[100vw] overflow-hidden -mt-4 sm:pt-4 pb-20 sm:pb-4">
      {message && <div className="fixed top-20 sm:top-8 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-2xl shadow-lg bg-slate-900 text-white font-bold text-sm animate-in slide-in-from-top-4 fade-in w-[90%] sm:w-auto text-center">{message}</div>}
      
      <div className="flex flex-col flex-1 w-[94%] sm:w-full max-w-6xl mx-auto h-full min-h-0 gap-3 sm:gap-4 relative">
        {isOfficial ? (
          <AdminDashboard 
            results={results} 
            users={users} 
            departments={departments} 
            handleUpload={handleUpload} 
            handleDelete={handleDelete} 
            fetchAdminData={() => fetchData(currentPage)} 
            displayMessage={displayMessage} 
            currentPage={currentPage}
            totalPages={totalPages}
            setCurrentPage={setCurrentPage}
          />
        ) : (
          <StudentClassView 
            results={results} 
            users={users} 
            currentPage={currentPage}
            totalPages={totalPages}
            setCurrentPage={setCurrentPage}
          />
        )}
      </div>
    </div>
  );
};

export default Result;