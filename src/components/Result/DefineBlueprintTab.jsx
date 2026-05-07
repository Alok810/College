import React, { useState, useEffect } from 'react';
import { saveCourseBlueprint, getCourseBlueprint } from '../../api';
import { Settings, CheckCircle2, Loader2, Pencil, Plus, Trash2, FileSpreadsheet, Download } from 'lucide-react';

export const DefineBlueprintTab = ({ batches, branches, semesters, displayMessage }) => {
    const [targetBatch, setTargetBatch] = useState('');
    const [targetBranch, setTargetBranch] = useState('');
    const [targetSemester, setTargetSemester] = useState('');
    const [blueprintSubjects, setBlueprintSubjects] = useState([]);
    const [editIndex, setEditIndex] = useState(null);
    const [newSubDef, setNewSubDef] = useState({ subjectCode: '', subjectName: '', type: 'Theory', credits: '', extFull: 70, intFull: 30, totalMax: 100, passExt: 21, passTotal: 35 });
    const [isBlueprintSaving, setIsBlueprintSaving] = useState(false);
    const [hasJustSavedBlueprint, setHasJustSavedBlueprint] = useState(false);

    useEffect(() => {
        const fetchBlueprint = async () => {
            if (!targetSemester || !targetBatch || !targetBranch) return;
            try {
                const data = await getCourseBlueprint(targetBatch, targetBranch, targetSemester);
                setBlueprintSubjects(data.subjects || []);
            } catch {
                setBlueprintSubjects([]);
            }
        };
        fetchBlueprint();
        setEditIndex(null); 
        setNewSubDef({ subjectCode: '', subjectName: '', type: 'Theory', credits: '', extFull: 70, intFull: 30, totalMax: 100, passExt: 21, passTotal: 35 });
    }, [targetSemester, targetBatch, targetBranch]);

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

    const downloadCSVTemplate = () => {
        if (blueprintSubjects.length === 0) return alert("Please add subjects to the blueprint first!");

        const titleRow = ['']; // Empty cell over RegistrationNo
        const dataRow = ['RegistrationNo'];

        blueprintSubjects.forEach(sub => {
            const cleanCode = String(sub.subjectCode).trim();
            const safeName = sub.subjectName ? `"${sub.subjectName.replace(/"/g, '""')}"` : cleanCode;
            
            titleRow.push(safeName); // Name goes above INT
            titleRow.push('');       // Empty space above FIN

            dataRow.push(`${cleanCode}_INT`); // INT first
            dataRow.push(`${cleanCode}_FIN`); // FIN second
        });

        const csvContent = titleRow.join(',') + '\n' + dataRow.join(',') + '\n';

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `${targetBranch}_${targetBatch}_${targetSemester}_Template.csv`.replace(/\s+/g, '_'));
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="w-full">
            <div className="w-full space-y-4">
                <div className="flex flex-col lg:flex-row lg:items-end gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    
                    {/* 🟢 THE FIX: Coordinated colorful dropdowns with rounded-xl and bold text */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full flex-1">
                        <div className="flex flex-col gap-1.5">
                            <span className="font-black text-blue-600 text-[10px] uppercase tracking-wider">Batch:</span>
                            <select 
                                className="w-full p-2.5 bg-blue-50/50 border border-blue-300 rounded-xl outline-none focus:border-blue-500 font-bold text-blue-900 shadow-sm text-sm transition-colors cursor-pointer" 
                                value={targetBatch} 
                                onChange={e => setTargetBatch(e.target.value)}
                            >
                                <option value="">Select Batch...</option>
                                {batches.map(b => <option key={b} value={b}>{b}</option>)}
                            </select>
                        </div>
                        
                        <div className="flex flex-col gap-1.5">
                            <span className="font-black text-indigo-600 text-[10px] uppercase tracking-wider">Branch:</span>
                            <select 
                                className="w-full p-2.5 bg-indigo-50/50 border border-indigo-300 rounded-xl outline-none focus:border-indigo-500 font-bold text-indigo-900 shadow-sm text-sm transition-colors cursor-pointer" 
                                value={targetBranch} 
                                onChange={e => setTargetBranch(e.target.value)}
                            >
                                <option value="">Select Branch...</option>
                                {branches.length === 0 ? <option disabled>No Branches Configured</option> : branches.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
                            </select>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <span className="font-black text-emerald-600 text-[10px] uppercase tracking-wider">Semester:</span>
                            <select 
                                className="w-full p-2.5 bg-emerald-50/50 border border-emerald-300 rounded-xl outline-none focus:border-emerald-500 font-bold text-emerald-900 shadow-sm text-sm transition-colors cursor-pointer" 
                                value={targetSemester} 
                                onChange={e => setTargetSemester(e.target.value)}
                            >
                                <option value="">Select Semester...</option>
                                {semesters.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto mt-2 lg:mt-0">
                        {blueprintSubjects.length > 0 && (
                            <button
                                onClick={downloadCSVTemplate}
                                className="px-5 py-2.5 rounded-xl font-bold text-sm bg-white border border-indigo-200 text-indigo-600 hover:bg-indigo-50 shadow-sm transition flex items-center justify-center gap-2 h-[42px]"
                                title="Download CSV template for entering marks"
                            >
                                <Download size={16} /> CSV Template
                            </button>
                        )}

                        <button
                            onClick={saveBlueprint}
                            disabled={isBlueprintSaving || !targetBatch || !targetBranch || !targetSemester}
                            className={`px-6 py-2.5 rounded-xl font-bold text-sm shadow-md transition w-full lg:w-auto flex items-center justify-center gap-2 h-[42px] ${hasJustSavedBlueprint ? 'bg-emerald-500 text-white cursor-default' : isBlueprintSaving ? 'bg-indigo-400 text-white cursor-wait' : (!targetBatch || !targetBranch || !targetSemester) ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300 shadow-none' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                        >
                            {isBlueprintSaving ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : hasJustSavedBlueprint ? <><CheckCircle2 size={16} /> Saved!</> : 'Save Semester Set'}
                        </button>
                    </div>
                </div>

                {(!targetBatch || !targetBranch || !targetSemester) ? (
                    <div className="flex flex-col items-center justify-center text-slate-400 py-16 bg-white rounded-xl border border-slate-200 mt-4 pb-0">
                        <Settings size={32} className="mb-2 opacity-50" />
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
                                <div className="col-span-2 lg:col-span-2"><label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Subject Code</label><input type="text" placeholder="e.g. HS1101" className="w-full p-2.5 border border-slate-300 rounded-lg text-sm font-bold" value={newSubDef.subjectCode} onChange={e => setNewSubDef({ ...newSubDef, subjectCode: e.target.value })} /></div>
                                <div className="col-span-2 lg:col-span-4"><label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Subject Name</label><input type="text" placeholder="e.g. Engineering Maths" className="w-full p-2.5 border border-slate-300 rounded-lg text-sm" value={newSubDef.subjectName} onChange={e => setNewSubDef({ ...newSubDef, subjectName: e.target.value })} /></div>
                                <div className="col-span-1 lg:col-span-2"><label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Type</label><select className="w-full p-2.5 border border-slate-300 rounded-lg text-sm bg-white" value={newSubDef.type} onChange={handleTypeChange}><option value="Theory">Theory</option><option value="Practical">Practical</option></select></div>
                                <div className="col-span-1 lg:col-span-1"><label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Credits</label><input type="number" placeholder="0" className="w-full p-2.5 border border-slate-300 rounded-lg text-sm" value={newSubDef.credits} onChange={e => setNewSubDef({ ...newSubDef, credits: e.target.value })} /></div>
                                <div className="col-span-1 lg:col-span-1"><label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Ext. Max</label><input type="number" placeholder="70" className="w-full p-2.5 border border-slate-300 rounded-lg text-sm" value={newSubDef.extFull} onChange={e => handleExtIntChange('extFull', e.target.value)} /></div>
                                <div className="col-span-1 lg:col-span-1"><label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Int. Max</label><input type="number" placeholder="30" className="w-full p-2.5 border border-slate-300 rounded-lg text-sm" value={newSubDef.intFull} onChange={e => handleExtIntChange('intFull', e.target.value)} /></div>
                                <div className="col-span-2 sm:col-span-1 lg:col-span-1"><label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Total</label><input type="number" placeholder="100" className="w-full p-2.5 border border-slate-200 rounded-lg text-sm font-bold bg-slate-100 cursor-not-allowed text-slate-500" value={newSubDef.totalMax} readOnly title="Auto-calculated" /></div>
                                
                                <div className="col-span-1 lg:col-span-2"><label className="text-[10px] font-bold text-emerald-600 uppercase block mb-1">Pass Ext.</label><input type="number" placeholder="21" className="w-full p-2.5 border border-emerald-300 rounded-lg text-sm bg-emerald-50/30 focus:border-emerald-500 outline-none" value={newSubDef.passExt} onChange={e => setNewSubDef({ ...newSubDef, passExt: e.target.value })} /></div>
                                <div className="col-span-1 lg:col-span-2"><label className="text-[10px] font-bold text-emerald-600 uppercase block mb-1">Pass Total</label><input type="number" placeholder="35" className="w-full p-2.5 border border-emerald-300 rounded-lg text-sm bg-emerald-50/30 focus:border-emerald-500 outline-none" value={newSubDef.passTotal} onChange={e => setNewSubDef({ ...newSubDef, passTotal: e.target.value })} /></div>

                                <div className="col-span-2 sm:col-span-4 lg:col-span-8 flex justify-end items-end mt-2 lg:mt-0">
                                    <button onClick={addSubjectToBlueprint} className={`w-full md:w-auto px-8 py-2.5 text-white font-extrabold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 ${editIndex !== null ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-slate-800 hover:bg-black'}`}>
                                        {editIndex !== null ? <><CheckCircle2 size={16} /> Update Rule</> : <><Plus size={16} /> Add Rule to Set</>}
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
                                                        <button onClick={() => handleEditRule(idx)} className="text-indigo-500 hover:text-indigo-700 hover:bg-indigo-50 p-2 rounded-lg transition-colors mr-1" title="Edit"><Pencil size={16} /></button>
                                                        <button onClick={() => {
                                                            setBlueprintSubjects(blueprintSubjects.filter((_, i) => i !== idx));
                                                            if (editIndex === idx) { setEditIndex(null); setNewSubDef({ subjectCode: '', subjectName: '', type: 'Theory', credits: '', extFull: 70, intFull: 30, totalMax: 100, passExt: 21, passTotal: 35 }); }
                                                        }} className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 p-2 rounded-lg transition-colors" title="Delete"><Trash2 size={16} /></button>
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
    );
};