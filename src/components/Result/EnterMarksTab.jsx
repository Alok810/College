import React, { useRef, useState } from 'react';
import Papa from 'papaparse';
import { getCourseBlueprint, bulkUploadResults } from '../../api';
import { calculateDynamicGrade } from './resultUtils';
import { Calculator, FileSpreadsheet, UploadCloud, Lock, CheckCircle2, Loader2, Unlock } from 'lucide-react';

export const EnterMarksTab = ({ 
    users, results, batches, branches, semesters, displayMessage, fetchAdminData, handleUpload, handleTabChange,
    entryMethod, setEntryMethod, uploadBatch, setUploadBatch, uploadBranch, setUploadBranch, 
    uploadSemester, setUploadSemester, selectedStudent, setSelectedStudent, activeBlueprint, setActiveBlueprint,
    studentMarks, setStudentMarks, calculatedTotals, setCalculatedTotals, existingResultId, setExistingResultId, 
    isEditMode, setIsEditMode, setPublishBatch, setPublishBranch, setPublishSemester
}) => {
    const fileInputRef = useRef(null);
    const [csvLoading, setCsvLoading] = useState(false);

    // Sort students by Registration Number (Numeric Ascending)
    const filteredStudents = users
        .filter(user => user.userType === 'Student' && (!uploadBatch || user.batch === uploadBatch) && (!uploadBranch || user.branch === uploadBranch))
        .sort((a, b) => (a.registrationNo || '').localeCompare(b.registrationNo || '', undefined, { numeric: true }));

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
                    const cleanSubCode = String(sub.subjectCode).trim();
                    const exSub = existingResult.subjects.find(s => String(s.subjectCode).trim() === cleanSubCode);
                    
                    initialMarks[sub.subjectCode] = { 
                        finExt: exSub && exSub.finExt !== undefined ? exSub.finExt : '', 
                        terInt: exSub && exSub.terInt !== undefined ? exSub.terInt : '' 
                    };
                });
            } else {
                setExistingResultId(null); setIsEditMode(true);
                data.subjects.forEach(sub => { initialMarks[sub.subjectCode] = { finExt: '', terInt: '' }; });
            }
            setStudentMarks(initialMarks);
            recalculateAllTotals(initialMarks, data);
        } catch (error) { 
            console.error("Blueprint Error:", error);
            alert(`No Blueprint found for this class.`); 
            setActiveBlueprint(null); 
        }
    };

    // 🟢 UPDATED: Allow typos to exist in state so the UI can turn red
    const handleMarkChange = (sub, field, value) => {
        let cleanValue = value;

        if (cleanValue !== '') {
            const numValue = parseFloat(cleanValue);
            if (numValue < 0) {
                cleanValue = '0'; // Prevent negative numbers
            }
        }

        const newMarks = { ...studentMarks, [sub.subjectCode]: { ...studentMarks[sub.subjectCode], [field]: cleanValue } };
        setStudentMarks(newMarks); 
        recalculateAllTotals(newMarks, activeBlueprint);
    };

    const submitFinalResult = (e) => {
        e.preventDefault();
        if (!activeBlueprint) return;

        // 🟢 NEW: Submit Blocker. Scans all inputs and aborts if any are over the limit.
        let hasErrors = false;
        activeBlueprint.subjects.forEach(sub => {
            const marks = studentMarks[sub.subjectCode] || { finExt: '', terInt: '' };
            if (marks.finExt !== '' && parseFloat(marks.finExt) > parseFloat(sub.extFull)) hasErrors = true;
            if (marks.terInt !== '' && parseFloat(marks.terInt) > parseFloat(sub.intFull)) hasErrors = true;
        });

        if (hasErrors) {
            return alert("⚠️ Action Blocked: One or more marks exceed the maximum allowed limit. Please fix the highlighted fields (in red) before saving.");
        }
        
        const finalSubjects = activeBlueprint.subjects.map(sub => {
            const marks = studentMarks[sub.subjectCode];
            const { total, grade } = calculateDynamicGrade(marks.finExt, marks.terInt, sub);
            return { 
                subjectCode: String(sub.subjectCode).trim(), 
                subjectName: sub.subjectName, 
                type: sub.type, 
                credits: sub.credits, 
                finExt: marks.finExt, 
                terInt: marks.terInt, 
                total: total.toString(), 
                grade: grade 
            };
        });
        
        const payload = { student: selectedStudent, semester: uploadSemester, sgpa: calculatedTotals.sgpa, totalTheory: calculatedTotals.tTheory, totalPractical: calculatedTotals.tPractical, grandTotal: calculatedTotals.gTotal, remarks: calculatedTotals.remarks, subjects: finalSubjects };

        const existingRecord = existingResultId ? results.find(r => r._id === existingResultId) : null;
        const isLive = existingRecord ? existingRecord.isPublished : false;
        payload.isPublished = isLive; 

        handleUpload(payload, existingResultId !== null && isEditMode, existingResultId);
        
        if (existingResultId) {
            handleTabChange('manage'); 
        } else {
            handleTabChange('publish'); 
            setPublishBatch(uploadBatch);
            setPublishBranch(uploadBranch);
            setPublishSemester(uploadSemester);
        }

        setActiveBlueprint(null); 
        setSelectedStudent(''); 
        setExistingResultId(null);
    };

    const handleCSVUpload = async (event) => {
        const file = event.target.files[0];
        if (!file || !uploadBatch || !uploadBranch || !uploadSemester) {
            return alert("Please select Batch, Branch, and Semester first before uploading CSV.");
        }

        setCsvLoading(true);

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const text = e.target.result;
                let lines = text.split(/\r?\n/);
                
                if (lines.length > 1 && !lines[0].includes('RegistrationNo') && lines[1].includes('RegistrationNo')) {
                    lines.shift();
                }
                
                const processableCSV = lines.join('\n');

                const blueprint = await getCourseBlueprint(uploadBatch, uploadBranch, uploadSemester);
                if (!blueprint || !blueprint.subjects) throw new Error("Blueprint not found for this class.");

                Papa.parse(processableCSV, {
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
                                if (s.registrationNo) studentMap.set(String(s.registrationNo).trim(), s);
                            });

                            for (let row of csvData) {
                                const regNo = String(row['RegistrationNo'] || '').trim();
                                if (!regNo) continue;
                                const student = studentMap.get(regNo);

                                if (!student) {
                                    console.warn(`⚠️ Skipped: Student ${regNo} not found in ${uploadBranch} ${uploadBatch}.`);
                                    skippedCount++; continue;
                                }

                                let tTheory = 0; let tPractical = 0; let sumCredits = 0; let sumPoints = 0; let hasFail = false;

                                const finalSubjects = blueprint.subjects.map(sub => {
                                    const cleanCode = String(sub.subjectCode).trim();
                                    
                                    // For bulk CSV, we still force-cap the limit because bulk editing typos is hard
                                    let finExt = row[`${cleanCode}_FIN`] || '';
                                    let terInt = row[`${cleanCode}_INT`] || '';
                                    
                                    if (finExt !== '' && parseFloat(finExt) > parseFloat(sub.extFull)) finExt = sub.extFull.toString();
                                    if (terInt !== '' && parseFloat(terInt) > parseFloat(sub.intFull)) terInt = sub.intFull.toString();

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
                                results.some(existing => (existing.student._id || existing.student) === newDraft.student && existing.semester === uploadSemester && existing.isPublished === true)
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
                            setPublishBatch(uploadBatch); setPublishBranch(uploadBranch); setPublishSemester(uploadSemester);

                        } catch (e) {
                            alert("Error processing CSV: " + e.message);
                        } finally {
                            setCsvLoading(false);
                            if (fileInputRef.current) fileInputRef.current.value = "";
                        }
                    }
                });
            } catch (error) {
                alert(error.message); setCsvLoading(false);
            }
        };

        reader.readAsText(file);
    };

    return (
        <div className="w-full">
            {!activeBlueprint ? (
                <div className="max-w-3xl mx-auto bg-slate-50 p-4 sm:p-6 rounded-2xl border border-slate-200 text-center mt-2 sm:mt-6 shadow-sm">
                    <div className="flex justify-center mb-6 overflow-x-auto pb-2 custom-scrollbar">
                        <div className="bg-slate-200 p-1.5 rounded-xl inline-flex shadow-inner">
                            <button onClick={() => { setEntryMethod('manual'); setSelectedStudent(''); }} className={`px-4 sm:px-6 py-2.5 rounded-lg text-sm font-black transition-all whitespace-nowrap ${entryMethod === 'manual' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-300/50'}`}>Single Student (Manual)</button>
                            <button onClick={() => { setEntryMethod('csv'); setSelectedStudent(''); }} className={`px-4 sm:px-6 py-2.5 rounded-lg text-sm font-black transition-all whitespace-nowrap ${entryMethod === 'csv' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-300/50'}`}>Whole Class (CSV)</button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">1. Select Batch</label>
                            <select className="w-full p-3 bg-white border border-slate-300 rounded-xl outline-none focus:border-indigo-400 font-bold text-slate-800 shadow-sm" value={uploadBatch} onChange={e => { setUploadBatch(e.target.value); setSelectedStudent(''); }}><option value="">Choose Batch...</option>{batches.map(b => <option key={b} value={b}>{b}</option>)}</select>
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">2. Select Branch</label>
                            <select className="w-full p-3 bg-white border border-slate-300 rounded-xl outline-none focus:border-indigo-400 font-bold text-slate-800 shadow-sm" value={uploadBranch} onChange={e => { setUploadBranch(e.target.value); setSelectedStudent(''); }}>
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
                                <Calculator size={18} /> Open Grading Sheet
                            </button>
                        ) : (
                            <div className="w-full sm:w-2/3 relative animate-in fade-in zoom-in-95 duration-200">
                                <input type="file" accept=".csv" ref={fileInputRef} onChange={handleCSVUpload} className="hidden" id="csv-upload" />
                                <label htmlFor="csv-upload" className={`w-full py-4 ${csvLoading ? 'bg-slate-300 text-slate-500' : 'bg-emerald-600 hover:bg-emerald-700 text-white'} font-extrabold rounded-xl transition-all text-sm shadow-md cursor-pointer flex items-center justify-center gap-2`}>
                                    {csvLoading ? <Loader2 size={20} className="animate-spin" /> : <FileSpreadsheet size={20} />}
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
                                        const marks = studentMarks[sub.subjectCode] || { finExt: '', terInt: '' };
                                        
                                        // 🟢 NEW: Calculate if the current values are invalid
                                        const isFinInvalid = marks.finExt !== '' && parseFloat(marks.finExt) > parseFloat(sub.extFull);
                                        const isIntInvalid = marks.terInt !== '' && parseFloat(marks.terInt) > parseFloat(sub.intFull);
                                        
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
                                                <td className="p-4">
                                                    <input 
                                                        type="number" 
                                                        min="0" 
                                                        placeholder={`/${sub.extFull}`} 
                                                        className={`w-full p-2.5 border rounded-lg outline-none focus:ring-2 text-center font-bold disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed transition-all ${
                                                            isFinInvalid 
                                                            ? 'bg-rose-50 border-rose-500 text-rose-600 focus:border-rose-500 focus:ring-rose-200' 
                                                            : 'border-slate-300 text-slate-800 focus:border-indigo-500 focus:ring-indigo-100'
                                                        }`}
                                                        value={marks.finExt} 
                                                        onChange={(e) => handleMarkChange(sub, 'finExt', e.target.value)} 
                                                        disabled={existingResultId && !isEditMode} 
                                                    />
                                                </td>
                                                <td className="p-4">
                                                    <input 
                                                        type="number" 
                                                        min="0" 
                                                        placeholder={`/${sub.intFull}`} 
                                                        className={`w-full p-2.5 border rounded-lg outline-none focus:ring-2 text-center font-bold disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed transition-all ${
                                                            isIntInvalid 
                                                            ? 'bg-rose-50 border-rose-500 text-rose-600 focus:border-rose-500 focus:ring-rose-200' 
                                                            : 'border-slate-300 text-slate-800 focus:border-indigo-500 focus:ring-indigo-100'
                                                        }`}
                                                        value={marks.terInt} 
                                                        onChange={(e) => handleMarkChange(sub, 'terInt', e.target.value)} 
                                                        disabled={existingResultId && !isEditMode} 
                                                    />
                                                </td>
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
                            <CheckCircle2 size={20} /> {existingResultId ? 'Update Result' : 'Save As Draft Record'}
                        </button>
                    )}
                </form>
            )}
        </div>
    );
};