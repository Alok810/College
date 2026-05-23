import React, { useState, useMemo, useEffect } from 'react';
import { Search, Eye, EyeOff, CalendarClock, Pencil, Trash2, Download } from 'lucide-react';

export const ManageRecordsTab = ({ users, results, batches, branches, semesters, handleDelete, triggerEditFromResult, currentPage, totalPages, setCurrentPage }) => {
    const [manageSearch, setManageSearch] = useState('');
    const [manageBatch, setManageBatch] = useState('');
    const [manageBranch, setManageBranch] = useState('');
    const [manageSemester, setManageSemester] = useState('');
    const [isInitialized, setIsInitialized] = useState(false);

    // 🟢 NEW: Auto-select the most recently published result's filters
    useEffect(() => {
        if (!isInitialized && results.length > 0 && users.length > 0) {
            const publishedResults = results.filter(r => r.isPublished);
            
            if (publishedResults.length > 0) {
                // Sort by timestamp (if available) to find the absolute newest, fallback to array order
                const latestResult = publishedResults.sort((a, b) => {
                    const dateA = new Date(a.updatedAt || a.createdAt || 0).getTime();
                    const dateB = new Date(b.updatedAt || b.createdAt || 0).getTime();
                    return dateB - dateA; // Descending
                })[0];

                const studentObj = users.find(u => u._id === (latestResult.student._id || latestResult.student));
                if (studentObj) {
                    setManageBatch(studentObj.batch || '');
                    setManageBranch(studentObj.branch || '');
                    setManageSemester(latestResult.semester || '');
                }
            }
            setIsInitialized(true);
        }
    }, [results, users, isInitialized]);

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

    const handleDownloadCSV = () => {
        if (filteredResults.length === 0) return;

        const subjectCodes = new Set();
        filteredResults.forEach(r => {
            if (r.subjects && Array.isArray(r.subjects)) {
                r.subjects.forEach(sub => subjectCodes.add(sub.subjectCode));
            }
        });
        const uniqueSubjects = Array.from(subjectCodes).sort();

        const headers = ["Name", "Registration No", "SGPA", "Remarks", "Total Theory", "Total Practical", "Grand Total"];
        
        uniqueSubjects.forEach(code => {
            headers.push(`${code}_INT`, `${code}_FIN`, `${code}_Grade`);
        });
        
        const csvRows = [headers.join(",")];

        filteredResults.forEach(result => {
            const studentObj = users.find(u => u._id === (result.student._id || result.student)) || {};
            
            const subMap = new Map();
            if (result.subjects && Array.isArray(result.subjects)) {
                result.subjects.forEach(sub => subMap.set(sub.subjectCode, sub));
            }

            const row = [
                `"${studentObj.name || 'Unknown'}"`,
                `"${studentObj.registrationNo || 'N/A'}"`,
                `"${result.sgpa ? result.sgpa.toFixed(2) : '0.00'}"`,
                `"${result.remarks || 'N/A'}"`,
                `"${result.totalTheory || '0'}"`,
                `"${result.totalPractical || '0'}"`,
                `"${result.grandTotal || '0'}"`
            ];

            uniqueSubjects.forEach(code => {
                const sub = subMap.get(code);
                if (sub) {
                    row.push(
                        `"${sub.terInt || '-'}"`, 
                        `"${sub.finExt || '-'}"`, 
                        `"${sub.grade || '-'}"`
                    );
                } else {
                    row.push('""', '""', '""');
                }
            });

            csvRows.push(row.join(","));
        });

        const csvString = csvRows.join("\n");
        const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
        const url = window.URL.createObjectURL(blob);
        
        const link = document.createElement("a");
        link.href = url;
        link.download = `Rigya_Results_${manageBatch}_${manageBranch}_${manageSemester}.csv`;
        link.style.display = "none";
        document.body.appendChild(link);
        link.click();
        
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    };

    return (
        <div className="w-full flex flex-col">
            
            {/* 🟢 UPDATED: Flex row holding all filters and the Export button */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4 bg-slate-50 p-3 sm:p-4 rounded-xl border border-slate-200">
                <select className="flex-1 min-w-[130px] p-2.5 border border-slate-300 rounded-lg text-xs sm:text-sm outline-none bg-white font-bold text-slate-700 shadow-sm transition-colors focus:border-indigo-400" value={manageBatch} onChange={e => setManageBatch(e.target.value)}>
                    <option value="">All Batches</option>
                    {batches.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
                
                <select className="flex-1 min-w-[130px] p-2.5 border border-slate-300 rounded-lg text-xs sm:text-sm outline-none bg-white font-bold text-slate-700 shadow-sm transition-colors focus:border-indigo-400" value={manageBranch} onChange={e => setManageBranch(e.target.value)}>
                    <option value="">All Branches</option>
                    {branches.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
                </select>
                
                <select className="flex-1 min-w-[130px] p-2.5 border border-slate-300 rounded-lg text-xs sm:text-sm outline-none bg-white font-bold text-slate-700 shadow-sm transition-colors focus:border-indigo-400" value={manageSemester} onChange={e => setManageSemester(e.target.value)}>
                    <option value="">All Semesters</option>
                    {semesters.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                
                <div className="flex-1 min-w-[180px] relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" placeholder="Search Name/Reg..." value={manageSearch} onChange={e => setManageSearch(e.target.value)} className="w-full p-2.5 pl-9 border border-slate-300 rounded-lg text-xs sm:text-sm outline-none bg-white font-bold text-slate-700 shadow-sm transition-colors focus:border-indigo-400" />
                </div>
                
                {/* EXPORT BUTTON IN THE SAME ROW */}
                {manageBatch && manageBranch && manageSemester && filteredResults.length > 0 && (
                    <button 
                        onClick={handleDownloadCSV} 
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg font-bold shadow-sm transition-all active:scale-95 text-xs sm:text-sm whitespace-nowrap"
                    >
                        <Download size={16} />
                        Export CSV
                    </button>
                )}
            </div>

            <div className="w-full flex flex-col pb-0">
                <div className="flex flex-col gap-3 pb-0">
                    {filteredResults.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
                            <Search className="w-10 h-10 text-slate-300 mb-3" />
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
                        <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="px-4 py-2 bg-white text-slate-600 font-bold text-xs rounded-lg border border-slate-200 disabled:opacity-50 hover:bg-slate-50 transition-all shadow-sm">Previous</button>
                        <span className="font-bold text-[10px] sm:text-xs text-slate-500 whitespace-nowrap">Page {currentPage} of {totalPages}</span>
                        <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="px-4 py-2 bg-indigo-50 text-indigo-600 border border-indigo-200 font-bold text-xs rounded-lg disabled:opacity-50 hover:bg-indigo-100 transition-all shadow-sm">Next Page</button>
                    </div>
                )}
            </div>
        </div>
    );
};