import React, { useState, useMemo, useEffect } from 'react';
import { Search, Eye, EyeOff, CalendarClock, Pencil, Trash2, Download, Loader2 } from 'lucide-react';
import { getAllResultsForAdmin } from '../../api'; 
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

export const ManageRecordsTab = ({ users, batches, branches, semesters, handleDelete, triggerEditFromResult }) => {
    const [manageSearch, setManageSearch] = useState('');
    const [manageBatch, setManageBatch] = useState('');
    const [manageBranch, setManageBranch] = useState('');
    const [manageSemester, setManageSemester] = useState('');
    const [isInitialized, setIsInitialized] = useState(false);

    // Independent Data & Client-Side Pagination
    const [allRecords, setAllRecords] = useState([]);
    const [isFetching, setIsFetching] = useState(true);
    const [localPage, setLocalPage] = useState(1);
    const itemsPerPage = 50; 

    // Fetch master list on mount
    useEffect(() => {
        const fetchAllData = async () => {
            setIsFetching(true);
            try {
                const data = await getAllResultsForAdmin(1, 5000); 
                const fetchedResults = data.results || data;
                setAllRecords(fetchedResults);

                const publishedResults = fetchedResults.filter(r => r.isPublished);
                if (!isInitialized && publishedResults.length > 0 && users.length > 0) {
                    const latestResult = publishedResults.sort((a, b) => {
                        const dateA = new Date(a.updatedAt || a.createdAt || 0).getTime();
                        const dateB = new Date(b.updatedAt || b.createdAt || 0).getTime();
                        return dateB - dateA;
                    })[0];

                    const studentObj = users.find(u => u._id === (latestResult.student._id || latestResult.student));
                    if (studentObj) {
                        setManageBatch(studentObj.batch || '');
                        setManageBranch(studentObj.branch || '');
                        setManageSemester(latestResult.semester || '');
                    }
                    setIsInitialized(true);
                }
            } catch (error) {
                console.error("Failed to load master records list:", error);
            } finally {
                setIsFetching(false);
            }
        };

        if (users.length > 0) {
            fetchAllData();
        }
    }, [users, isInitialized]);

    // Reset pagination to Page 1 whenever a filter is changed
    useEffect(() => {
        setLocalPage(1);
    }, [manageSearch, manageBatch, manageBranch, manageSemester]);

    // Filter against ALL database records
    const filteredResults = useMemo(() => {
        const userMap = new Map();
        users.forEach(u => userMap.set(u._id, u));

        let filtered = allRecords.filter(r => {
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
            return (studentA.registrationNo || '').localeCompare(studentB.registrationNo || '', undefined, { numeric: true });
        });

        return filtered;
    }, [allRecords, users, manageSearch, manageBatch, manageBranch, manageSemester]);

    // Apply Client-Side Slicing for Pagination
    const totalPages = Math.ceil(filteredResults.length / itemsPerPage) || 1;
    const paginatedResults = filteredResults.slice((localPage - 1) * itemsPerPage, localPage * itemsPerPage);

    const executeDelete = async (id) => {
        handleDelete(id); 
        setAllRecords(prev => prev.filter(r => r._id !== id)); 
    };

    const handleDownloadExcel = async () => {
        if (filteredResults.length === 0) return;

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Results');

        // 1. Gather Unique Subjects & Names
        const subjectMap = new Map();
        filteredResults.forEach(r => {
            if (r.subjects && Array.isArray(r.subjects)) {
                r.subjects.forEach(sub => {
                    if (!subjectMap.has(sub.subjectCode)) {
                        subjectMap.set(sub.subjectCode, sub.subjectName || sub.subjectCode);
                    }
                });
            }
        });
        const uniqueSubjects = Array.from(subjectMap.keys()).sort();

        // 2. CREATE SUPER HEADER (Row 1 - Merged Subject Names)
        const superHeader = ["Student Details", "", "", "", "", "", ""]; // 7 empty slots for the base columns
        uniqueSubjects.forEach(code => {
            const fullName = subjectMap.get(code);
            superHeader.push(`${fullName} (${code})`); // First column gets the name
            superHeader.push("", "", ""); // Next 3 columns get empty strings to be merged
        });
        const row1 = worksheet.addRow(superHeader);

        // Merge Base Columns
        worksheet.mergeCells(1, 1, 1, 7); 
        row1.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
        row1.getCell(1).font = { bold: true, size: 12 };

        // Merge Subject Columns
        uniqueSubjects.forEach((code, index) => {
            const startCol = 8 + (index * 4); // 7 base cols, so first subject starts at col 8
            const endCol = startCol + 3;
            worksheet.mergeCells(1, startCol, 1, endCol);
            
            const cell = row1.getCell(startCol);
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
            cell.font = { bold: true, size: 11 };
        });

        // 3. CREATE STANDARD HEADERS (Row 2 - Sub Headers)
        const headers = ["Name", "Registration No", "SGPA", "Remarks", "Total Theory", "Total Practical", "Grand Total"];
        uniqueSubjects.forEach(code => {
            // Simplified headers since the Subject Name is now above them
            headers.push(`INT`, `FIN`, `Total`, `Grade`);
        });
        
        const row2 = worksheet.addRow(headers);
        row2.font = { bold: true };
        row2.alignment = { horizontal: 'center', vertical: 'middle' };

        // 4. ADD DATA ROWS
        filteredResults.forEach(result => {
            const studentObj = users.find(u => u._id === (result.student._id || result.student)) || {};
            
            const subMap = new Map();
            if (result.subjects && Array.isArray(result.subjects)) {
                result.subjects.forEach(sub => subMap.set(sub.subjectCode, sub));
            }

            const row = [
                studentObj.name || 'Unknown',
                studentObj.registrationNo || 'N/A',
                result.sgpa ? parseFloat(result.sgpa.toFixed(2)) : 0,
                result.remarks || 'N/A',
                parseFloat(result.totalTheory || 0),
                parseFloat(result.totalPractical || 0),
                parseFloat(result.grandTotal || 0)
            ];

            uniqueSubjects.forEach(code => {
                const sub = subMap.get(code);
                if (sub) {
                    const intScore = parseFloat(sub.terInt) || 0;
                    const finScore = parseFloat(sub.finExt) || 0;
                    const subjectTotal = intScore + finScore;

                    row.push(
                        sub.terInt !== undefined && sub.terInt !== '' ? intScore : '-',
                        sub.finExt !== undefined && sub.finExt !== '' ? finScore : '-',
                        subjectTotal,
                        sub.grade || '-'
                    );
                } else {
                    row.push('-', '-', '-', '-');
                }
            });

            worksheet.addRow(row);
        });

        // 5. STYLING & COLORS
        const colorPalette = ['FFD9E1F2', 'FFE2EFDA', 'FFFFF2CC', 'FFFCE4D6', 'FFE6E6E6', 'FFD5A6BD', 'FFC9DAF8'];
        const baseColumnCount = 7;
        
        uniqueSubjects.forEach((code, index) => {
            const startCol = baseColumnCount + (index * 4) + 1;
            const hexColor = colorPalette[index % colorPalette.length];

            // Color the merged Super Header cell
            row1.getCell(startCol).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: hexColor }
            };

            // Color the individual columns below it
            for (let i = 0; i < 4; i++) {
                const col = worksheet.getColumn(startCol + i);
                col.width = 10; 
                col.eachCell((cell, rowNumber) => {
                    // Skip row 1 because it's merged and styled above
                    if (rowNumber > 1) {
                        cell.fill = {
                            type: 'pattern',
                            pattern: 'solid',
                            fgColor: { argb: hexColor }
                        };
                        // Center align the data rows (Row 3 and below)
                        if (rowNumber > 2) {
                            cell.alignment = { horizontal: 'center' };
                        }
                    }
                });
            }
        });

        // Fix base column widths
        worksheet.getColumn(1).width = 25; 
        worksheet.getColumn(2).width = 20; 

        // 6. GENERATE AND SAVE
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        
        saveAs(blob, `Rigya_Results_${manageBatch}_${manageBranch}_${manageSemester}.xlsx`);
    };

    return (
        <div className="w-full flex flex-col">
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
                
                {manageBatch && manageBranch && manageSemester && filteredResults.length > 0 && (
                    <button 
                        onClick={handleDownloadExcel} 
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg font-bold shadow-sm transition-all active:scale-95 text-xs sm:text-sm whitespace-nowrap"
                    >
                        <Download size={16} />
                        Export Excel
                    </button>
                )}
            </div>

            <div className="w-full flex flex-col pb-0">
                <div className="flex flex-col gap-3 pb-0 min-h-[300px]">
                    {isFetching ? (
                        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-slate-200 text-indigo-400">
                            <Loader2 className="w-10 h-10 mb-3 animate-spin" />
                            <p className="font-medium text-sm">Fetching complete records database...</p>
                        </div>
                    ) : paginatedResults.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
                            <Search className="w-10 h-10 text-slate-300 mb-3" />
                            <p className="text-slate-500 font-medium text-sm">No records found matching filters.</p>
                        </div>
                    ) : paginatedResults.map(result => {
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
                                    <button onClick={() => executeDelete(result._id)} className="flex-1 md:flex-none px-4 py-2.5 bg-rose-50 text-rose-600 font-bold rounded-lg border border-rose-100 hover:bg-rose-100 hover:border-rose-300 text-xs flex items-center justify-center gap-1.5 transition-all"><Trash2 size={14} /> Delete</button>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {totalPages > 1 && !isFetching && (
                    <div className="flex justify-between sm:justify-center items-center gap-2 sm:gap-4 pt-6 pb-2 bg-transparent">
                        <button onClick={() => setLocalPage(prev => Math.max(prev - 1, 1))} disabled={localPage === 1} className="px-4 py-2 bg-white text-slate-600 font-bold text-xs rounded-lg border border-slate-200 disabled:opacity-50 hover:bg-slate-50 transition-all shadow-sm">Previous</button>
                        <span className="font-bold text-[10px] sm:text-xs text-slate-500 whitespace-nowrap">Page {localPage} of {totalPages}</span>
                        <button onClick={() => setLocalPage(prev => Math.min(prev + 1, totalPages))} disabled={localPage === totalPages} className="px-4 py-2 bg-indigo-50 text-indigo-600 border border-indigo-200 font-bold text-xs rounded-lg disabled:opacity-50 hover:bg-indigo-100 transition-all shadow-sm">Next Page</button>
                    </div>
                )}
            </div>
        </div>
    );
};