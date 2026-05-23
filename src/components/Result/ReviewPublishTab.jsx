import React, { useState, useEffect } from 'react';
import { publishBatchResults, getAllResultsForAdmin } from '../../api';
import { FileArchive, UploadCloud, CheckCircle2, Loader2, CalendarClock, Eye, EyeOff } from 'lucide-react';

export const ReviewPublishTab = ({ 
    users, batches, branches, semesters, displayMessage, fetchAdminData, handleTabChange,
    publishBatch, setPublishBatch, publishBranch, setPublishBranch, publishSemester, setPublishSemester 
}) => {
    const [bulkPublishLoading, setBulkPublishLoading] = useState(false);
    const [scheduleDate, setScheduleDate] = useState('');
    
    // NEW STATES: Handle fetching the unpaginated drafts locally
    const [pendingDraftsForPublish, setPendingDraftsForPublish] = useState([]);
    const [isFetchingDrafts, setIsFetchingDrafts] = useState(false);

    // 🟢 FETCH & SORT ON REGISTRATION NUMBER (NUMERIC ASCENDING)
    useEffect(() => {
        const loadDrafts = async () => {
            if (publishBatch && publishBranch && publishSemester) {
                setIsFetchingDrafts(true);
                try {
                    const data = await getAllResultsForAdmin(1, 1000); 
                    const allResults = data.results || data; 

                    const userMap = new Map();
                    users.forEach(u => userMap.set(u._id, u));

                    // 1. Filter down to drafts matching the class criteria
                    const drafts = allResults.filter(r => {
                        if (r.isPublished) return false;
                        if (r.semester !== publishSemester) return false;
                        const studentObj = userMap.get(r.student._id || r.student);
                        return studentObj && studentObj.batch === publishBatch && studentObj.branch === publishBranch;
                    });

                    // 2. Sort drafts dynamically by student registration number (Increasing/Numeric Ascending)
                    drafts.sort((a, b) => {
                        const studentA = userMap.get(a.student._id || a.student);
                        const studentB = userMap.get(b.student._id || b.student);
                        const regA = studentA?.registrationNo || '';
                        const regB = studentB?.registrationNo || '';
                        return regA.localeCompare(regB, undefined, { numeric: true });
                    });

                    setPendingDraftsForPublish(drafts);
                } catch (error) {
                    console.error("Failed to load drafts:", error);
                    displayMessage("Failed to load pending drafts.");
                } finally {
                    setIsFetchingDrafts(false);
                }
            } else {
                setPendingDraftsForPublish([]);
            }
        };

        loadDrafts();
    }, [publishBatch, publishBranch, publishSemester, users, displayMessage]);

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
                    draftIds: draftIds, studentIds: studentIds, semester: publishSemester, scheduledDate: actualScheduleDate
                });

                displayMessage(data.message);
                await fetchAdminData(); // Refresh global data for the Manage tab
                setPendingDraftsForPublish([]); // Clear local drafts
                setScheduleDate('');
                handleTabChange('manage');
            } catch (error) {
                console.error("Publish Error:", error);
                displayMessage("Failed to publish/schedule batch.");
            } finally {
                setBulkPublishLoading(false);
            }
        }
    };

    return (
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
                        <FileArchive size={18} className="text-amber-500" /> Pending Drafts to Publish
                    </h3>
                    {isFetchingDrafts ? (
                        <span className="bg-slate-100 text-slate-500 text-xs font-black px-3 py-1 rounded-full w-max flex items-center gap-1"><Loader2 size={12} className="animate-spin"/> Fetching...</span>
                    ) : (
                        <span className="bg-amber-100 text-amber-800 text-xs font-black px-3 py-1 rounded-full w-max">{pendingDraftsForPublish.length} Found</span>
                    )}
                </div>

                <div className="p-3 sm:p-4 pb-0">
                    {(!publishBatch || !publishBranch || !publishSemester) ? (
                        <div className="flex flex-col items-center justify-center text-slate-400 py-10">
                            <UploadCloud size={40} className="mb-3 opacity-50" />
                            <p className="font-medium text-sm text-center px-4">Select a Batch, Branch, and Semester above to view drafts.</p>
                        </div>
                    ) : isFetchingDrafts ? (
                        <div className="flex flex-col items-center justify-center text-indigo-400 py-10">
                            <Loader2 size={40} className="mb-3 opacity-50 animate-spin" />
                            <p className="font-medium text-sm text-center px-4">Searching database for drafts...</p>
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
                        <button onClick={() => handleBulkPublish(true)} disabled={bulkPublishLoading} className="w-full sm:w-auto px-5 py-3 text-indigo-600 bg-indigo-50 border border-indigo-200 font-black rounded-xl hover:bg-indigo-100 hover:border-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap text-sm flex items-center justify-center gap-2 transition-all shadow-sm">
                            <UploadCloud size={18} /> Publish Instantly
                        </button>
                    )}
                    <button onClick={() => handleBulkPublish(false)} disabled={bulkPublishLoading || pendingDraftsForPublish.length === 0} className={`w-full sm:w-auto px-6 py-3 text-white font-black rounded-xl shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap text-sm flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 ${scheduleDate ? 'bg-amber-500 hover:bg-amber-600' : 'bg-gradient-to-r from-indigo-600 to-purple-600'}`}>
                        {bulkPublishLoading ? <Loader2 size={18} className="animate-spin" /> : (scheduleDate ? <CalendarClock size={18} /> : <UploadCloud size={18} />)}
                        {scheduleDate ? 'Schedule Release' : `Publish All ${pendingDraftsForPublish.length > 0 ? `(${pendingDraftsForPublish.length})` : ''} Now`}
                    </button>
                </div>
            </div>
        </div>
    );
};