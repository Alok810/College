import React, { useState, useMemo, memo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Settings, Calculator, ListChecks, FileArchive, GraduationCap } from 'lucide-react';
import { getCourseBlueprint } from '../../api';
import { calculateDynamicGrade } from './resultUtils';

import { DefineBlueprintTab } from './DefineBlueprintTab';
import { EnterMarksTab } from './EnterMarksTab';
import { ReviewPublishTab } from './ReviewPublishTab';
import { ManageRecordsTab } from './ManageRecordsTab';

export const AdminDashboard = memo(({ results, users, departments, handleUpload, handleDelete, fetchAdminData, displayMessage, currentPage, totalPages, setCurrentPage }) => {
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

    const [publishBatch, setPublishBatch] = useState('');
    const [publishBranch, setPublishBranch] = useState('');
    const [publishSemester, setPublishSemester] = useState('');

    const triggerEditFromResult = async (result) => {
        const studentObj = users.find(u => u._id === (result.student._id || result.student));
        if (!studentObj) return alert("Student data missing.");
        
        setUploadBatch(studentObj.batch || ''); 
        setUploadBranch(studentObj.branch || ''); 
        setUploadSemester(result.semester); 
        setSelectedStudent(studentObj._id);
        
        try {
            const data = await getCourseBlueprint(studentObj.batch, studentObj.branch, result.semester);
            setActiveBlueprint(data);
            const initialMarks = {};
            data.subjects.forEach(sub => {
                // 🟢 THE FIX: Safely trim both strings so they match perfectly even if there are invisible spaces
                const cleanSubCode = String(sub.subjectCode).trim();
                const exSub = result.subjects.find(s => String(s.subjectCode).trim() === cleanSubCode);
                
                initialMarks[sub.subjectCode] = { 
                    finExt: exSub && exSub.finExt !== undefined ? exSub.finExt : '', 
                    terInt: exSub && exSub.terInt !== undefined ? exSub.terInt : '' 
                };
            });
            setStudentMarks(initialMarks); 
            setExistingResultId(result._id); 
            setIsEditMode(true);
            setEntryMethod('manual');
            
            let tTheory = 0; let tPractical = 0; let sumCredits = 0; let sumPoints = 0; let hasFail = false;
            data.subjects.forEach(sub => {
                const marks = initialMarks[sub.subjectCode] || { finExt: '', terInt: '' };
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

            handleTabChange('upload');
        } catch (error) { 
            console.error("Blueprint Error:", error);
            alert("Error loading blueprint."); 
        }
    };

    return (
        <div className="w-full flex flex-col flex-1 min-h-0 gap-4">
            <div className="flex-shrink-0 w-fit mx-auto overflow-hidden bg-white p-1.5 rounded-xl shadow-sm border border-slate-200 z-10">
                <div className="flex gap-1 justify-start sm:justify-center overflow-x-auto custom-scrollbar snap-x snap-mandatory pb-1 sm:pb-0">
                    <button onClick={() => { handleTabChange('blueprint'); setActiveBlueprint(null); }} className={`snap-start px-3 sm:px-4 py-2 rounded-lg font-bold text-xs transition-all whitespace-nowrap flex-shrink-0 ${activeAdminTab === 'blueprint' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}>1. Define Set</button>
                    <button onClick={() => handleTabChange('upload')} className={`snap-start px-3 sm:px-4 py-2 rounded-lg font-bold text-xs transition-all whitespace-nowrap flex-shrink-0 ${activeAdminTab === 'upload' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}>2. Enter Marks</button>
                    <button onClick={() => { handleTabChange('publish'); setActiveBlueprint(null); }} className={`snap-start px-3 sm:px-4 py-2 rounded-lg font-bold text-xs transition-all whitespace-nowrap flex-shrink-0 ${activeAdminTab === 'publish' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}>3. Review & Publish</button>
                    <button onClick={() => { handleTabChange('manage'); setActiveBlueprint(null); }} className={`snap-start px-3 sm:px-4 py-2 rounded-lg font-bold text-xs transition-all whitespace-nowrap flex-shrink-0 ${activeAdminTab === 'manage' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}>4. Manage Records</button>
                </div>
            </div>

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
                    </div>

                    {activeAdminTab === 'blueprint' && <DefineBlueprintTab batches={batches} branches={branches} semesters={semesters} displayMessage={displayMessage} />}
                    {activeAdminTab === 'upload' && (
                        <EnterMarksTab 
                            users={users} results={results} batches={batches} branches={branches} semesters={semesters} 
                            displayMessage={displayMessage} fetchAdminData={fetchAdminData} handleUpload={handleUpload} handleTabChange={handleTabChange}
                            entryMethod={entryMethod} setEntryMethod={setEntryMethod} uploadBatch={uploadBatch} setUploadBatch={setUploadBatch}
                            uploadBranch={uploadBranch} setUploadBranch={setUploadBranch} uploadSemester={uploadSemester} setUploadSemester={setUploadSemester}
                            selectedStudent={selectedStudent} setSelectedStudent={setSelectedStudent} activeBlueprint={activeBlueprint} setActiveBlueprint={setActiveBlueprint}
                            studentMarks={studentMarks} setStudentMarks={setStudentMarks} calculatedTotals={calculatedTotals} setCalculatedTotals={setCalculatedTotals}
                            existingResultId={existingResultId} setExistingResultId={setExistingResultId} isEditMode={isEditMode} setIsEditMode={setIsEditMode}
                            setPublishBatch={setPublishBatch} setPublishBranch={setPublishBranch} setPublishSemester={setPublishSemester}
                        />
                    )}
                    {activeAdminTab === 'publish' && (
                        <ReviewPublishTab 
                            users={users} results={results} batches={batches} branches={branches} semesters={semesters} 
                            displayMessage={displayMessage} fetchAdminData={fetchAdminData} handleTabChange={handleTabChange}
                            publishBatch={publishBatch} setPublishBatch={setPublishBatch} publishBranch={publishBranch} setPublishBranch={setPublishBranch}
                            publishSemester={publishSemester} setPublishSemester={setPublishSemester}
                        />
                    )}
                    {activeAdminTab === 'manage' && (
                        <ManageRecordsTab 
                            users={users} results={results} batches={batches} branches={branches} semesters={semesters} 
                            handleDelete={handleDelete} triggerEditFromResult={triggerEditFromResult} 
                            currentPage={currentPage} totalPages={totalPages} setCurrentPage={setCurrentPage}
                        />
                    )}
                </div>
            </div>
        </div>
    );
});