import React, { useState, useEffect, useCallback, memo, useMemo, useRef } from 'react';
import Papa from 'papaparse';
import { useAuth } from '../context/AuthContext';
import { getMyResults, getAllResultsForAdmin, publishResult, updateResult, deleteResult, getAdminUsers, saveCourseBlueprint, getCourseBlueprint, getClassResultsForStudents, publishBatchResults, bulkUploadResults } from '../api';
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
const StudentClassView = memo(({ results, users }) => {
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
    <div className="flex-1 flex flex-col min-h-0 w-full gap-4">
      <div className="bg-white shadow-sm rounded-[1.5rem] p-4 sm:p-6 border border-slate-100 flex-shrink-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-[0.8rem] bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center border border-blue-200">
            <Users className="text-blue-600 w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 leading-none">Class Rankings</h1>
            <p className="text-xs text-slate-500 font-medium mt-1">Your Peers: {authData?.batch || 'Batch'} • {authData?.branch || 'Branch'}</p>
          </div>
        </div>
        <div className="relative w-full sm:w-48">
          <ArrowUpDown size={16} className="absolute left-3 top-3 text-slate-400" />
          <select className="w-full p-2 pl-9 border border-slate-200 rounded-lg text-sm outline-none bg-slate-50 focus:bg-white focus:border-indigo-400 font-bold text-slate-700 transition-colors" value={sortOrder} onChange={e => setSortOrder(e.target.value)}>
            <option value="cgpaDesc">Highest CGPA</option>
            <option value="cgpaAsc">Lowest CGPA</option>
            <option value="alpha">Sort A-Z</option>
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-4">
        <div className="flex flex-col gap-4">
          {sortedCGPAs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl shadow-sm border border-slate-100">
              <Users className="w-12 h-12 text-slate-300 mb-3" />
              <p className="text-slate-500 font-medium">No peer records found for your class yet.</p>
            </div>
          ) : (
            sortedCGPAs.map(({ student, cgpa, semesters }, index) => {
              const isExpanded = expandedStudentId === student._id;
              const isMe = student._id === authData?._id;

              return (
                <div key={student._id} className={`bg-white rounded-xl border hover:border-indigo-300 hover:shadow-md transition-all cursor-default overflow-hidden ${isMe ? 'border-indigo-400 shadow-sm bg-indigo-50/20' : 'border-slate-200'}`}>
                  <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-0">
                    <div className="flex items-center gap-4 w-full md:w-1/3 text-left">
                      <span className={`text-lg font-black w-8 text-center ${index < 3 && sortOrder === 'cgpaDesc' ? 'text-emerald-500' : 'text-slate-400'}`}>#{index + 1}</span>
                      <div className="flex flex-col truncate">
                        <h4 className="font-extrabold text-slate-900 text-lg sm:text-xl truncate flex items-center gap-2">
                          {student.name || 'Unknown Student'}
                          {isMe && <span className="bg-indigo-600 text-white text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider">You</span>}
                        </h4>
                        <span className="text-xs sm:text-sm font-bold text-slate-500 mt-1">Reg: {student.registrationNo || 'N/A'}</span>
                      </div>
                    </div>

                    <div className="flex justify-center w-full md:w-1/3">
                      <button onClick={() => toggleExpand(student._id)} className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-extrabold text-xs uppercase tracking-wider border ${isExpanded ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-200'}`}>
                        Semester Breakdown
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </div>

                    <div className="flex flex-col items-end justify-center w-full md:w-1/3 text-right">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Overall CGPA</span>
                      <span className="text-3xl sm:text-4xl font-black text-indigo-600 leading-none">{cgpa}</span>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="bg-white border-t border-slate-100 p-4 sm:p-5 animate-in slide-in-from-top-2 fade-in duration-200">
                      <div className="flex flex-wrap gap-3">
                        {semesters.sort((a, b) => a.name.localeCompare(b.name)).map(sem => (
                          <div key={sem.name} className="flex flex-col items-center justify-center bg-white border border-slate-200 shadow-sm rounded-xl px-5 py-3 min-w-[80px]">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">{sem.name.replace('Semester ', 'Sem ')}</span>
                            <span className="text-xl font-black text-indigo-600 leading-none">{sem.sgpa?.toFixed(2)}</span>
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
});

// ==========================================
// 🛠️ ADMIN DASHBOARD
// ==========================================
const AdminDashboard = memo(({ results, users, handleUpload, handleDelete, fetchAdminData, displayMessage }) => {
  const [activeAdminTab, setActiveAdminTab] = useState('upload');
  const semesters = ['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4', 'Semester 5', 'Semester 6', 'Semester 7', 'Semester 8'];
  const batches = ['2021-2025', '2022-2026', '2023-2027', '2024-2028', '2025-2029', '2026-2030'];
  const branches = ['CSE', 'CE', 'ME', 'ECE', 'EE', 'EEE', 'IT', 'AI_DS', 'Chemical', 'Metallurgy', 'Production', 'Aerospace', 'Biotech', 'Other'];

  // Tab 1: Blueprint State
  const [targetBatch, setTargetBatch] = useState('');
  const [targetBranch, setTargetBranch] = useState('');
  const [targetSemester, setTargetSemester] = useState('');
  const [blueprintSubjects, setBlueprintSubjects] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [newSubDef, setNewSubDef] = useState({ subjectCode: '', subjectName: '', type: 'Theory', credits: '', extFull: 70, intFull: 30, totalMax: 100, passExt: 21, passTotal: 35 });

  // ✅ New States for Save Button Feedback
  const [isBlueprintSaving, setIsBlueprintSaving] = useState(false);
  const [hasJustSavedBlueprint, setHasJustSavedBlueprint] = useState(false);

  // Tab 2: Upload/Draft State
  const [entryMethod, setEntryMethod] = useState('manual'); // ✅ NEW: 'manual' or 'csv'
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

  // --- FILTERS & SORTING ---
  const filteredStudents = users.filter(user => user.userType === 'Student' && (!uploadBatch || user.batch === uploadBatch) && (!uploadBranch || user.branch === uploadBranch));
  
  const filteredResults = useMemo(() => {
    // 1. Filter the results first
    let filtered = results.filter(r => {
      if (!r.isPublished) return false; 

      const studentObj = users.find(u => u._id === (r.student._id || r.student));
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

    // 2. Sort and Group them neatly
    filtered.sort((a, b) => {
      const studentA = users.find(u => u._id === (a.student._id || a.student)) || {};
      const studentB = users.find(u => u._id === (b.student._id || b.student)) || {};

      // Group by Batch (Newest first)
      if (studentA.batch !== studentB.batch) return (studentB.batch || '').localeCompare(studentA.batch || '');
      
      // Group by Branch (Alphabetical: CE, CSE, ECE, ME)
      if (studentA.branch !== studentB.branch) return (studentA.branch || '').localeCompare(studentB.branch || '');
      
      // Group by Semester
      if (a.semester !== b.semester) return (a.semester || '').localeCompare(b.semester || '');
      
      // Finally, sort by Registration Number so they are in perfect roll-call order!
      return (studentA.registrationNo || '').localeCompare(studentB.registrationNo || '');
    });

    return filtered;
  }, [results, users, manageSearch, manageBatch, manageBranch, manageSemester]);

  const pendingDraftsForPublish = useMemo(() => {
    if (!publishBatch || !publishBranch || !publishSemester) return [];
    return results.filter(r => {
      if (r.isPublished) return false;
      if (r.semester !== publishSemester) return false;
      const studentObj = users.find(u => u._id === (r.student._id || r.student));
      return studentObj && studentObj.batch === publishBatch && studentObj.branch === publishBranch;
    });
  }, [results, users, publishBatch, publishBranch, publishSemester]);

  // --- UTILS ---
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
    } catch (error) { setBlueprintSubjects([]); }
  };

  useEffect(() => {
    if (activeAdminTab === 'blueprint') {
      fetchBlueprint(targetSemester, targetBatch, targetBranch);
      setEditIndex(null); setNewSubDef({ subjectCode: '', subjectName: '', type: 'Theory', credits: '', extFull: 70, intFull: 30, totalMax: 100, passExt: 21, passTotal: 35 });
    }
  }, [targetSemester, targetBatch, targetBranch, activeAdminTab]);

  // ✅ Reset "Saved" status if user starts modifying the blueprint again
  useEffect(() => {
    setHasJustSavedBlueprint(false);
  }, [targetBatch, targetBranch, targetSemester, blueprintSubjects]);

  // --- TAB 1 HANDLERS ---
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
    } catch (err) {
      displayMessage("Error saving Set");
    } finally {
      setIsBlueprintSaving(false);
    }
  };

  // --- TAB 2 HANDLERS ---
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
      setStudentMarks(initialMarks); setExistingResultId(result._id); setIsEditMode(true); setActiveAdminTab('upload'); setEntryMethod('manual');
      recalculateAllTotals(initialMarks, data);
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

            for (let row of csvData) {
              const regNo = String(row['RegistrationNo'] || '').trim();
              if (!regNo) continue;

              const student = filteredStudents.find(s => String(s.registrationNo).trim() === regNo);

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

            setActiveAdminTab('publish');
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
        setActiveAdminTab('manage');
      } catch (error) {
        displayMessage("Failed to publish/schedule batch.");
      } finally {
        setBulkPublishLoading(false);
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 w-full gap-4">
      <div className="flex-shrink-0 w-full md:w-max md:mx-auto overflow-hidden bg-white p-1.5 rounded-xl shadow-sm border border-slate-200">
        <div className="flex gap-1 justify-center sm:justify-start overflow-x-auto custom-scrollbar">
          <button onClick={() => { setActiveAdminTab('blueprint'); setActiveBlueprint(null); }} className={`px-2 sm:px-4 py-2 rounded-lg font-bold text-xs transition-all whitespace-nowrap ${activeAdminTab === 'blueprint' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>1. Define Set</button>
          <button onClick={() => setActiveAdminTab('upload')} className={`px-2 sm:px-4 py-2 rounded-lg font-bold text-xs transition-all whitespace-nowrap ${activeAdminTab === 'upload' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>2. Enter Marks</button>
          <button onClick={() => { setActiveAdminTab('publish'); setActiveBlueprint(null); }} className={`px-2 sm:px-4 py-2 rounded-lg font-bold text-xs transition-all whitespace-nowrap ${activeAdminTab === 'publish' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>3. Review & Publish</button>
          <button onClick={() => { setActiveAdminTab('manage'); setActiveBlueprint(null); }} className={`px-2 sm:px-4 py-2 rounded-lg font-bold text-xs transition-all whitespace-nowrap ${activeAdminTab === 'manage' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>4. Manage Records</button>
        </div>
      </div>

      <div className="flex-1 bg-white shadow-sm rounded-[1.5rem] p-4 sm:p-6 border border-slate-100 overflow-hidden flex flex-col min-h-0">

        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-[0.8rem] bg-gradient-to-br from-indigo-100 to-emerald-100 flex items-center justify-center border border-indigo-200">
              <GraduationCap className="text-indigo-600 w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-none">Results</h1>
              <p className="text-[10px] sm:text-xs text-slate-500 font-medium mt-0.5">Academic Management</p>
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
          <div className="text-right bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
            <span className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Access</span>
            <p className="font-extrabold text-indigo-600 text-xs sm:text-sm">Admin</p>
          </div>
        </div>

        {/* TAB 1: DEFINE BLUEPRINT */}
        {activeAdminTab === 'blueprint' && (
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
            <div className="max-w-5xl mx-auto space-y-4">
              <div className="flex flex-col md:flex-row md:items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-700 text-sm">Batch:</span>
                  <select className="p-2 border border-slate-300 rounded-md outline-none text-sm bg-white" value={targetBatch} onChange={e => setTargetBatch(e.target.value)}><option value="">Select Batch...</option>{batches.map(b => <option key={b} value={b}>{b}</option>)}</select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-700 text-sm">Branch:</span>
                  <select className="p-2 border border-slate-300 rounded-md outline-none text-sm bg-white" value={targetBranch} onChange={e => setTargetBranch(e.target.value)}><option value="">Select Branch...</option>{branches.map(b => <option key={b} value={b}>{b}</option>)}</select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-700 text-sm">Semester:</span>
                  <select className="p-2 border border-slate-300 rounded-md outline-none text-sm bg-white" value={targetSemester} onChange={e => setTargetSemester(e.target.value)}><option value="">Select Semester...</option>{semesters.map(s => <option key={s} value={s}>{s}</option>)}</select>
                </div>

                <button 
                  onClick={saveBlueprint} 
                  disabled={isBlueprintSaving || !targetBatch || !targetBranch || !targetSemester}
                  className={`md:ml-auto px-5 py-2.5 rounded-lg font-bold text-sm shadow-md transition w-full md:w-auto flex items-center justify-center gap-2 ${
                    hasJustSavedBlueprint 
                    ? 'bg-emerald-500 text-white cursor-default' 
                    : isBlueprintSaving 
                      ? 'bg-indigo-400 text-white cursor-wait' 
                      : (!targetBatch || !targetBranch || !targetSemester)
                        ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                >
                  {isBlueprintSaving ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : hasJustSavedBlueprint ? <><CheckCircle2 size={16} /> Saved!</> : 'Save Semester Set'}
                </button>
              </div>

              {(!targetBatch || !targetBranch || !targetSemester) ? (
                  <div className="flex flex-col items-center justify-center text-slate-400 py-16 bg-white rounded-xl border border-slate-200 mt-4">
                      <Settings size={32} className="mb-2 opacity-50"/>
                      <p className="font-medium text-sm">Please select a Batch, Branch, and Semester above to view or configure its Course Set.</p>
                  </div>
              ) : (
                  <>
                      <div className={`bg-white border border-slate-200 p-4 rounded-xl space-y-3 transition-colors ${editIndex !== null ? 'ring-2 ring-indigo-400 bg-indigo-50/30' : ''}`}>
                        <h3 className="font-bold text-slate-800 text-sm border-b pb-2 flex items-center justify-between">
                          {editIndex !== null ? <span className="text-indigo-600 flex items-center gap-2"><Pencil size={16} /> Editing Rule...</span> : 'Add Subject Rules'}
                          {editIndex !== null && (<button onClick={() => { setEditIndex(null); setNewSubDef({ subjectCode: '', subjectName: '', type: 'Theory', credits: '', extFull: 70, intFull: 30, totalMax: 100, passExt: 21, passTotal: 35 }); }} className="text-xs text-slate-500 hover:text-slate-800 font-normal">Cancel Edit</button>)}
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                          <div className="col-span-2"><label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Subject Code</label><input type="text" placeholder="e.g. HS1101" className="w-full p-2 border border-slate-300 rounded text-xs font-bold" value={newSubDef.subjectCode} onChange={e => setNewSubDef({...newSubDef, subjectCode: e.target.value})} /></div>
                          <div className="col-span-2 lg:col-span-4"><label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Subject Name</label><input type="text" placeholder="e.g. Engineering Maths" className="w-full p-2 border border-slate-300 rounded text-xs" value={newSubDef.subjectName} onChange={e => setNewSubDef({...newSubDef, subjectName: e.target.value})} /></div>
                          <div className="col-span-1"><label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Type</label><select className="w-full p-2 border border-slate-300 rounded text-xs" value={newSubDef.type} onChange={handleTypeChange}><option value="Theory">Theory</option><option value="Practical">Practical</option></select></div>
                          <div className="col-span-1"><label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Credits</label><input type="number" placeholder="0" className="w-full p-2 border border-slate-300 rounded text-xs" value={newSubDef.credits} onChange={e => setNewSubDef({...newSubDef, credits: e.target.value})} /></div>
                          <div className="col-span-1"><label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Ext. Full Marks</label><input type="number" placeholder="70" className="w-full p-2 border border-slate-300 rounded text-xs" value={newSubDef.extFull} onChange={e => handleExtIntChange('extFull', e.target.value)} /></div>
                          <div className="col-span-1"><label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Int. Full Marks</label><input type="number" placeholder="30" className="w-full p-2 border border-slate-300 rounded text-xs" value={newSubDef.intFull} onChange={e => handleExtIntChange('intFull', e.target.value)} /></div>
                          <div className="col-span-2"><label className="text-[10px] font-bold text-emerald-600 uppercase block mb-1">Pass Mark (External)</label><input type="number" placeholder="21" className="w-full p-2 border border-slate-300 rounded text-xs" value={newSubDef.passExt} onChange={e => setNewSubDef({...newSubDef, passExt: e.target.value})} /></div>
                          <div className="col-span-1"><label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Total Max</label><input type="number" placeholder="100" className="w-full p-2 border border-slate-300 rounded text-xs font-bold bg-slate-100 cursor-not-allowed" value={newSubDef.totalMax} readOnly title="Auto-calculated" /></div>
                          <div className="col-span-2"><label className="text-[10px] font-bold text-emerald-600 uppercase block mb-1">Pass Mark (Total)</label><input type="number" placeholder="35" className="w-full p-2 border border-slate-300 rounded text-xs" value={newSubDef.passTotal} onChange={e => setNewSubDef({...newSubDef, passTotal: e.target.value})} /></div>
                          <div className="col-span-2 lg:col-span-1 flex items-end">
                            <button onClick={addSubjectToBlueprint} className={`w-full text-white font-bold text-xs rounded py-2 transition ${editIndex !== null ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-slate-800 hover:bg-black'}`}>
                              {editIndex !== null ? <><CheckCircle2 size={14} className="inline mr-1"/>Update</> : <><Plus size={14} className="inline mr-1"/>Add Rule</>}
                            </button>
                          </div>
                        </div>
                      </div>

                      {blueprintSubjects.length > 0 && (
                        <div className="border border-slate-200 rounded-md overflow-hidden bg-white">
                          <table className="w-full text-left text-xs sm:text-sm">
                            <thead className="bg-slate-50 border-b border-slate-200">
                              <tr><th className="p-2 text-slate-600">Code</th><th className="p-2 text-slate-600">Subject Name</th><th className="p-2 text-center text-slate-600">Type</th><th className="p-2 text-center text-slate-600">Cr.</th><th className="p-2 text-slate-500 text-center">Ext/Int/Total Max</th><th className="p-2 text-emerald-600 text-center">Pass Ext/Total</th><th className="p-2"></th></tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {blueprintSubjects.map((sub, idx) => (
                                <tr key={idx} className={editIndex === idx ? 'bg-indigo-50/50' : 'hover:bg-slate-50'}>
                                  <td className="p-2 font-bold text-slate-800">{sub.subjectCode}</td>
                                  <td className="p-2 text-slate-700">{sub.subjectName || '-'}</td>
                                  <td className="p-2 text-center text-slate-600">{sub.type}</td>
                                  <td className="p-2 text-center text-slate-600">{sub.credits}</td>
                                  <td className="p-2 text-slate-500 font-medium text-center">{sub.extFull} / {sub.intFull} / {sub.totalMax}</td>
                                  <td className="p-2 text-emerald-700 font-bold text-center">{sub.passExt || '-'} / {sub.passTotal}</td>
                                  <td className="p-2 text-right min-w-[60px]">
                                    <button onClick={() => handleEditRule(idx)} className="text-indigo-500 hover:text-indigo-700 p-1 mr-1" title="Edit"><Pencil size={14}/></button>
                                    <button onClick={()=> {
                                      setBlueprintSubjects(blueprintSubjects.filter((_, i) => i !== idx));
                                      if (editIndex === idx) { setEditIndex(null); setNewSubDef({ subjectCode: '', subjectName: '', type: 'Theory', credits: '', extFull: 70, intFull: 30, totalMax: 100, passExt: 21, passTotal: 35 }); }
                                    }} className="text-rose-500 hover:text-rose-700 p-1" title="Delete"><Trash2 size={14}/></button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                  </>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: ENTER MARKS */}
        {activeAdminTab === 'upload' && (
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
            {!activeBlueprint ? (
              <div className="max-w-3xl mx-auto bg-slate-50 p-6 rounded-xl border border-slate-200 text-center mt-6">
                
                {/* ✅ NEW: Toggle Switch for Entry Method */}
                <div className="flex justify-center mb-6">
                    <div className="bg-slate-200 p-1 rounded-lg inline-flex shadow-inner">
                        <button 
                            onClick={() => { setEntryMethod('manual'); setSelectedStudent(''); }} 
                            className={`px-5 py-2 rounded-md text-sm font-black transition-all ${entryMethod === 'manual' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Single Student (Manual)
                        </button>
                        <button 
                            onClick={() => { setEntryMethod('csv'); setSelectedStudent(''); }} 
                            className={`px-5 py-2 rounded-md text-sm font-black transition-all ${entryMethod === 'csv' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Whole Class (CSV)
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">1. Select Batch</label>
                    <select className="w-full p-3 bg-white border border-slate-300 rounded-lg outline-none focus:border-indigo-400 font-bold" value={uploadBatch} onChange={e => {setUploadBatch(e.target.value); setSelectedStudent('');}}><option value="">Choose Batch...</option>{batches.map(b => <option key={b} value={b}>{b}</option>)}</select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">2. Select Branch</label>
                    <select className="w-full p-3 bg-white border border-slate-300 rounded-lg outline-none focus:border-indigo-400 font-bold" value={uploadBranch} onChange={e => {setUploadBranch(e.target.value); setSelectedStudent('');}}><option value="">Choose Branch...</option>{branches.map(b => <option key={b} value={b}>{b}</option>)}</select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-emerald-600 uppercase block mb-1">3. Select Semester</label>
                    <select className="w-full p-3 bg-white border border-emerald-300 rounded-lg outline-none font-bold" value={uploadSemester} onChange={e => setUploadSemester(e.target.value)}><option value="">Choose Semester...</option>{semesters.map(s => <option key={s} value={s}>{s}</option>)}</select>
                  </div>
                  
                  {/* ✅ NEW: Only show the Student Dropdown if they are in Manual Mode */}
                  {entryMethod === 'manual' && (
                      <div className="animate-in fade-in zoom-in-95 duration-200">
                        <label className="text-[10px] font-bold text-indigo-600 uppercase block mb-1">4. Select Student</label>
                        <select className="w-full p-3 bg-white border border-indigo-300 rounded-lg outline-none disabled:bg-slate-100 disabled:border-slate-200 font-bold" value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)} disabled={!uploadBatch || !uploadBranch}>
                          <option value="">{!uploadBatch || !uploadBranch ? 'Select Batch & Branch first...' : 'Choose Student...'}</option>
                          {filteredStudents.map(u => <option key={u._id} value={u._id}>{u.name} (Reg: {u.registrationNo || 'N/A'})</option>)}
                        </select>
                      </div>
                  )}
                </div>
                
                <div className="mt-8 flex justify-center border-t border-slate-200 pt-6">
                  {entryMethod === 'manual' ? (
                      <button onClick={loadStudentSheet} disabled={!selectedStudent || !uploadSemester} className="w-full sm:w-2/3 py-3.5 bg-slate-800 text-white font-extrabold rounded-xl hover:bg-black transition-all text-sm shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                          <Calculator size={18}/> Open Grading Sheet
                      </button>
                  ) : (
                      <div className="w-full sm:w-2/3 relative animate-in fade-in zoom-in-95 duration-200">
                          <input type="file" accept=".csv" ref={fileInputRef} onChange={handleCSVUpload} className="hidden" id="csv-upload" />
                          <label htmlFor="csv-upload" className={`w-full py-3.5 ${csvLoading ? 'bg-slate-300 text-slate-500' : 'bg-emerald-600 hover:bg-emerald-700 text-white'} font-extrabold rounded-xl transition-all text-sm shadow-md cursor-pointer flex items-center justify-center gap-2`}>
                              {csvLoading ? <Loader2 size={18} className="animate-spin"/> : <FileSpreadsheet size={18}/>}
                              {csvLoading ? 'Processing CSV...' : 'Select & Upload CSV File'}
                          </label>
                          <p className="text-[10px] font-bold text-slate-400 mt-3">Format: RegistrationNo, SubCode_FIN, SubCode_INT, etc.</p>
                      </div>
                  )}
                </div>

              </div>
            ) : (
              <form onSubmit={submitFinalResult} className="space-y-4 max-w-4xl mx-auto pb-6">
                <div className={`flex items-center justify-between p-4 rounded-xl border ${existingResultId && !isEditMode ? 'bg-amber-50 border-amber-200' : 'bg-indigo-50 border-indigo-200'}`}>
                  <div><p className={`text-xs font-bold uppercase tracking-wider ${existingResultId && !isEditMode ? 'text-amber-600' : 'text-indigo-600'}`}>{existingResultId && !isEditMode ? 'Record Locked (Read-Only)' : 'Active Sheet'}</p><p className="text-lg font-extrabold text-slate-900">{uploadSemester} - {users.find(u => u._id === selectedStudent)?.name}</p></div>
                  <div className="flex flex-col items-end gap-1">
                    <button type="button" onClick={() => { setActiveBlueprint(null); setExistingResultId(null); }} className="text-xs font-bold text-slate-500 hover:text-slate-800 underline">Change Target</button>
                    {existingResultId && !isEditMode && (<button type="button" onClick={() => setIsEditMode(true)} className="flex items-center gap-1 text-sm font-bold text-amber-600 hover:text-amber-800 bg-amber-100 px-3 py-1 rounded mt-1"><Unlock size={14} /> Enable Editing</button>)}
                  </div>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="p-2 bg-white border border-slate-200 rounded-lg flex flex-col justify-center items-center"><span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Theory</span><span className="font-extrabold text-slate-800">{calculatedTotals.tTheory}</span></div>
                  <div className="p-2 bg-white border border-slate-200 rounded-lg flex flex-col justify-center items-center"><span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Practical</span><span className="font-extrabold text-slate-800">{calculatedTotals.tPractical}</span></div>
                  <div className="p-2 bg-white border border-slate-200 rounded-lg flex flex-col justify-center items-center"><span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Grand Total</span><span className="font-extrabold text-slate-800">{calculatedTotals.gTotal}</span></div>
                  <div className="p-2 bg-white border border-slate-200 rounded-lg flex flex-col justify-center items-center"><span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Credits</span><span className="font-extrabold text-slate-800">{calculatedTotals.tCredits}</span></div>
                  <div className="p-2 bg-indigo-100 border border-indigo-200 rounded-lg flex flex-col justify-center items-center"><span className="text-[9px] text-indigo-600 font-bold uppercase tracking-wider">SGPA</span><span className="font-extrabold text-indigo-800">{calculatedTotals.sgpa}</span></div>
                </div>

                <div className={`bg-white border rounded-xl overflow-hidden ${existingResultId && !isEditMode ? 'border-amber-200 opacity-90' : 'border-slate-200'}`}>
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200 text-xs text-slate-600 uppercase tracking-wide">
                      <tr><th className="p-3">Subject</th><th className="p-3">FIN/EXT</th><th className="p-3">TER/INT</th><th className="p-3 text-center">Live Total</th><th className="p-3 text-center">Grade</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {activeBlueprint.subjects.map(sub => {
                        const marks = studentMarks[sub.subjectCode];
                        const { total, grade } = calculateDynamicGrade(marks.finExt, marks.terInt, sub);
                        return (
                          <tr key={sub.subjectCode} className="hover:bg-slate-50 transition-colors">
                            <td className="p-3">
                              <p className="font-bold text-slate-900 leading-tight">{sub.subjectCode}</p>
                              <p className="text-xs text-slate-700">{sub.subjectName || '-'}</p>
                              <p className="text-[10px] text-slate-500 font-medium">Max: {sub.extFull}/{sub.intFull} | Pass: {sub.passExt || '-'}/{sub.passTotal}</p>
                            </td>
                            <td className="p-3"><input type="text" placeholder={`/${sub.extFull}`} className="w-full p-2 border border-slate-300 rounded outline-none focus:border-indigo-500 text-center disabled:bg-slate-100 disabled:cursor-not-allowed" value={marks.finExt} onChange={(e) => handleMarkChange(sub.subjectCode, 'finExt', e.target.value)} disabled={existingResultId && !isEditMode} /></td>
                            <td className="p-3"><input type="text" placeholder={`/${sub.intFull}`} className="w-full p-2 border border-slate-300 rounded outline-none focus:border-indigo-500 text-center disabled:bg-slate-100 disabled:cursor-not-allowed" value={marks.terInt} onChange={(e) => handleMarkChange(sub.subjectCode, 'terInt', e.target.value)} disabled={existingResultId && !isEditMode} /></td>
                            <td className="p-3 text-center font-bold text-slate-800">{total} <span className="text-[10px] text-slate-400 font-normal">/{sub.totalMax}</span></td>
                            <td className={`p-3 text-center font-extrabold ${grade === 'F' ? 'text-rose-600' : 'text-emerald-600'}`}>{grade}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {existingResultId && !isEditMode ? (
                  <div className="w-full py-3 bg-slate-200 text-slate-500 font-extrabold rounded-xl shadow-inner text-sm uppercase tracking-wider flex justify-center items-center gap-2 cursor-not-allowed"><Lock size={18} /> Record Locked</div>
                ) : (
                  <button type="submit" className={`w-full py-3 text-white font-extrabold rounded-xl shadow-md active:scale-95 transition-all text-sm uppercase tracking-wider flex justify-center items-center gap-2 ${existingResultId ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-slate-800 hover:bg-black'}`}>
                    <CheckCircle2 size={18} /> {existingResultId ? 'Update Draft Record' : 'Save Draft Record'}
                  </button>
                )}
              </form>
            )}
          </div>
        )}

        {/* TAB 3: REVIEW DRAFTS & PUBLISH */}
        {activeAdminTab === 'publish' && (
          <div className="flex-1 flex flex-col min-h-0 bg-indigo-50/30 rounded-xl border border-indigo-100 p-2 sm:p-4">

            <div className="bg-white p-4 rounded-xl shadow-sm border border-indigo-200 flex-shrink-0 flex flex-col sm:flex-row items-end gap-3 mb-4">
              <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-indigo-800 uppercase block mb-1">Target Batch</label>
                  <select className="w-full p-2 border border-indigo-200 rounded-lg text-sm outline-none bg-slate-50 font-bold" value={publishBatch} onChange={e => setPublishBatch(e.target.value)}><option value="">Select Batch</option>{batches.map(b => <option key={b} value={b}>{b}</option>)}</select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-indigo-800 uppercase block mb-1">Target Branch</label>
                  <select className="w-full p-2 border border-indigo-200 rounded-lg text-sm outline-none bg-slate-50 font-bold" value={publishBranch} onChange={e => setPublishBranch(e.target.value)}><option value="">Select Branch</option>{branches.map(b => <option key={b} value={b}>{b}</option>)}</select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-indigo-800 uppercase block mb-1">Target Semester</label>
                  <select className="w-full p-2 border border-indigo-200 rounded-lg text-sm outline-none bg-slate-50 font-bold" value={publishSemester} onChange={e => setPublishSemester(e.target.value)}><option value="">Select Semester</option>{semesters.map(s => <option key={s} value={s}>{s}</option>)}</select>
                </div>
              </div>
            </div>

            <div className="flex-1 bg-white rounded-xl shadow-inner border border-slate-200 overflow-hidden flex flex-col">
              <div className="p-3 border-b border-slate-200 bg-slate-50 flex justify-between items-center flex-shrink-0">
                <h3 className="font-extrabold text-slate-800 flex items-center gap-2">
                  <FileArchive size={16} className="text-amber-500" />
                  Pending Drafts to Publish
                </h3>
                <span className="bg-amber-100 text-amber-800 text-xs font-black px-3 py-1 rounded-full">{pendingDraftsForPublish.length} Found</span>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-3">
                {(!publishBatch || !publishBranch || !publishSemester) ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 py-10">
                    <UploadCloud size={32} className="mb-2 opacity-50" />
                    <p className="font-medium text-sm">Select a Batch, Branch, and Semester above to view drafts.</p>
                  </div>
                ) : pendingDraftsForPublish.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-emerald-500 py-10">
                    <CheckCircle2 size={32} className="mb-2 opacity-50" />
                    <p className="font-medium text-sm">All clear! No unpublished drafts found for this class.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {pendingDraftsForPublish.map(draft => {
                      const studentObj = users.find(u => u._id === (draft.student._id || draft.student));
                      return (
                        <div key={draft._id} className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm hover:border-amber-300 transition-colors">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-bold text-slate-800 text-sm truncate">{studentObj?.name || 'Unknown'}</p>
                              <p className="text-[10px] text-slate-500 font-bold">{studentObj?.registrationNo || 'N/A'}</p>
                            </div>
                            <span className="bg-amber-50 text-amber-600 border border-amber-200 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider">Draft</span>
                          </div>
                          <div className="flex justify-between items-end border-t border-slate-100 pt-2 mt-1">
                            <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${draft.remarks === 'PASSED' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>{draft.remarks}</span>
                            <span className="text-xs font-black text-indigo-600">SGPA: {draft.sgpa?.toFixed(2)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="flex-shrink-0 mt-4 flex flex-col md:flex-row items-end md:items-center gap-3">
              <div className="flex-1 w-full">
                <label className="text-[10px] font-bold text-indigo-800 uppercase block mb-1">Schedule Automatic Release (Optional)</label>
                <div className="relative">
                  <input type="datetime-local" className="w-full p-2.5 pl-8 border border-indigo-200 rounded-xl text-sm outline-none bg-white font-bold" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)} disabled={pendingDraftsForPublish.length === 0} />
                  <CalendarClock size={14} className="absolute left-3 top-3.5 text-indigo-400" />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                {scheduleDate && (
                  <button
                    onClick={() => handleBulkPublish(true)}
                    disabled={bulkPublishLoading}
                    className="w-full sm:w-auto px-4 py-2.5 text-indigo-600 bg-indigo-50 border border-indigo-200 font-black rounded-xl hover:bg-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap text-sm flex items-center justify-center gap-2 h-[42px] transition-all"
                  >
                    <UploadCloud size={16} /> Publish Instantly Instead
                  </button>
                )}

                <button
                  onClick={() => handleBulkPublish(false)}
                  disabled={bulkPublishLoading || pendingDraftsForPublish.length === 0}
                  className={`w-full sm:w-auto px-6 py-2.5 text-white font-black rounded-xl shadow hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap text-sm flex items-center justify-center gap-2 h-[42px] transition-all ${scheduleDate ? 'bg-amber-500' : 'bg-gradient-to-r from-indigo-600 to-purple-600'}`}
                >
                  {bulkPublishLoading ? <Loader2 size={16} className="animate-spin" /> : (scheduleDate ? <CalendarClock size={16} /> : <UploadCloud size={16} />)}
                  {scheduleDate ? 'Schedule Release' : `Publish All ${pendingDraftsForPublish.length > 0 ? `(${pendingDraftsForPublish.length})` : ''} Now`}
                </button>
              </div>
            </div>

          </div>
        )}

        {/* TAB 4: MANAGE ALL RECORDS */}
        {activeAdminTab === 'manage' && (
          <div className="flex-1 flex flex-col min-h-0">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3 flex-shrink-0 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <select className="p-2 border border-slate-300 rounded text-xs outline-none bg-white font-bold text-slate-700" value={manageBatch} onChange={e => setManageBatch(e.target.value)}><option value="">All Batches</option>{batches.map(b => <option key={b} value={b}>{b}</option>)}</select>
              <select className="p-2 border border-slate-300 rounded text-xs outline-none bg-white font-bold text-slate-700" value={manageBranch} onChange={e => setManageBranch(e.target.value)}><option value="">All Branches</option>{branches.map(b => <option key={b} value={b}>{b}</option>)}</select>
              <select className="p-2 border border-slate-300 rounded text-xs outline-none bg-white font-bold text-slate-700" value={manageSemester} onChange={e => setManageSemester(e.target.value)}><option value="">All Semesters</option>{semesters.map(s => <option key={s} value={s}>{s}</option>)}</select>
              <div className="relative col-span-2 sm:col-span-1">
                <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                <input type="text" placeholder="Search Name/Reg..." value={manageSearch} onChange={e => setManageSearch(e.target.value)} className="w-full p-2 pl-8 border border-slate-300 rounded text-xs outline-none bg-white font-bold text-slate-700" />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
              <div className="flex flex-col gap-3 pb-4">
                {filteredResults.length === 0 ? <p className="text-center text-slate-500 py-10 font-medium">No records found matching filters.</p> : filteredResults.map(result => {
                  const studentObj = users.find(u => u._id === (result.student._id || result.student));
                  return (
                    <div key={result._id} className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:border-indigo-300 transition-all">
                      <div className="overflow-hidden w-full flex items-start gap-3">

                        <div className="mt-1 flex flex-col gap-1">
                          {result.isPublished ? (
                            <span className="flex items-center gap-1 bg-emerald-50 border border-emerald-200 text-emerald-700 px-2 py-1 rounded text-[9px] font-black uppercase tracking-wider"><Eye size={12} /> Live</span>
                          ) : (
                            <span className="flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-700 px-2 py-1 rounded text-[9px] font-black uppercase tracking-wider"><EyeOff size={12} /> Draft</span>
                          )}
                          {result.scheduledPublishDate && (
                            <span className="flex items-center gap-1 bg-purple-50 border border-purple-200 text-purple-700 px-2 py-1 rounded text-[8px] font-black uppercase tracking-wider whitespace-nowrap"><CalendarClock size={10} /> Schd</span>
                          )}
                        </div>

                        <div>
                          <h4 className="font-extrabold text-slate-900 truncate text-base">{studentObj?.name || 'Unknown Student'} <span className="text-xs font-bold text-slate-500 ml-1">({studentObj?.registrationNo || 'N/A'})</span></h4>
                          <div className="flex gap-2 items-center mt-1.5">
                            <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded border border-slate-200 font-bold text-slate-700 uppercase tracking-wide">{result.semester}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded border font-bold uppercase tracking-wide ${result.remarks === 'PASSED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>{result.remarks}</span>
                            <span className="text-xs text-indigo-600 font-black ml-1">SGPA: {result.sgpa?.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex w-full sm:w-auto gap-2">
                        <button onClick={() => triggerEditFromResult(result)} className="flex-1 sm:flex-none px-4 py-2 bg-indigo-50 text-indigo-600 font-bold rounded-lg border border-indigo-100 hover:bg-indigo-100 text-xs flex items-center justify-center gap-1 transition-all"><Pencil size={14} /> Edit</button>
                        <button onClick={() => handleDelete(result._id)} className="flex-1 sm:flex-none px-4 py-2 bg-rose-50 text-rose-600 font-bold rounded-lg border border-rose-100 hover:bg-rose-100 text-xs flex items-center justify-center gap-1 transition-all"><Trash2 size={14} /> Delete</button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
});

const Result = () => {
  const { authData, loading } = useAuth();
  const [results, setResults] = useState([]);
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState('');

  const isOfficial = authData?.userType === "Institute" || authData?.role === "admin";

  const displayMessage = useCallback((msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  }, []);

  const fetchData = useCallback(async () => {
    try {
      if (isOfficial) {
        const allResults = await getAllResultsForAdmin();
        setResults(allResults);
        const allUsersList = await getAdminUsers();
        setUsers(allUsersList);
      } else {
        try {
          const data = await getClassResultsForStudents();
          setResults(data.results);
          setUsers(data.users);
        } catch (e) {
          console.error("Failed to fetch class results:", e);
          const myResults = await getMyResults();
          setResults(myResults);
          setUsers([{ _id: authData?._id, ...authData }]);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }, [isOfficial, authData]);

  useEffect(() => { if (!loading) fetchData(); }, [loading, fetchData]);

  const handleUpload = async (resultData, isUpdate, resultId) => {
    try {
      if (isUpdate) {
        await updateResult(resultId, resultData);
        displayMessage("Draft updated successfully!");
      } else {
        await publishResult(resultData);
        displayMessage("Draft saved successfully!");
      }
      fetchData();
    } catch (error) {
      displayMessage("Failed to save draft.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Permanently delete this record?")) {
      try {
        await deleteResult(id);
        displayMessage("Record deleted.");
        fetchData();
      } catch (error) {
        displayMessage("Failed to delete.");
      }
    }
  };

  return (
    <div className="flex flex-col items-center h-full w-full max-w-[100vw] overflow-x-hidden pb-0 sm:pb-2 pt-1 sm:pt-2">
      {message && <div className="fixed top-20 sm:top-8 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-2xl shadow-lg bg-slate-900 text-white font-bold text-sm animate-in slide-in-from-top-4 fade-in">{message}</div>}
      <div className="flex flex-col w-[94%] sm:w-full max-w-4xl mx-auto h-full min-h-0 gap-2 sm:gap-3">
        {isOfficial ? (
          <AdminDashboard results={results} users={users} handleUpload={handleUpload} handleDelete={handleDelete} fetchAdminData={fetchData} displayMessage={displayMessage} />
        ) : (
          <StudentClassView results={results} users={users} />
        )}
      </div>
    </div>
  );
};

export default Result;