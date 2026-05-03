import React, { useState, useEffect } from 'react';
import { Building2, Plus, Trash2, Search, X, Loader2, Shield, Users, Info, ChevronRight, ArrowRightLeft } from 'lucide-react';
import { getInstituteDepartments, createDepartment, deleteDepartment, updateDepartment, getAllUsersForAdmin } from '../api';

export default function DepartmentManagement({ users }) {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // HOD Transfer Modal State
    const [transferModal, setTransferModal] = useState({ isOpen: false, targetDept: null });
    const [eligibleHods, setEligibleHods] = useState([]);
    const [selectedNewHod, setSelectedNewHod] = useState("");
    const [loadingHods, setLoadingHods] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        abbreviation: '', 
        about: '',
        hodId: ''
    });

    // 🟢 UPDATED: Strictly filter users to ONLY show verified HODs for the New Department form
    const eligibleHodsForNewDept = users.filter(u => u.designation === 'HOD');

    const loadDepartments = async () => {
        try {
            setLoading(true);
            const res = await getInstituteDepartments();
            setDepartments(res.departments || []);
        } catch (error) {
            console.error("Failed to load departments:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDepartments();
    }, []);

    const handleCreateDepartment = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await createDepartment({
                name: formData.name,
                abbreviation: formData.abbreviation,
                about: formData.about,
                hod: formData.hodId || null 
            });
            alert("Department created successfully!");
            setIsModalOpen(false);
            setFormData({ name: '', abbreviation: '', about: '', hodId: '' });
            loadDepartments();
        } catch (error) {
            alert(error.message || "Failed to create department.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id, deptName) => {
        if (window.confirm(`Are you sure you want to permanently delete the ${deptName} department?`)) {
            try {
                await deleteDepartment(id);
                loadDepartments();
            } catch (error) {
                alert(error.message || "Failed to delete department.");
            }
        }
    };

    // Functions to handle HOD Transfer
    const handleOpenHodModal = async (department) => {
        setTransferModal({ isOpen: true, targetDept: department });
        setLoadingHods(true);
        setSelectedNewHod("");
        
        try {
            const allUsers = await getAllUsersForAdmin();
            // Strict Filter: Only allow verified users whose designation is exactly "HOD"
            const verifiedHods = allUsers.filter(u => u.designation === "HOD");
            setEligibleHods(verifiedHods);
        } catch (err) {
            console.error("Failed to fetch eligible HODs", err);
        } finally {
            setLoadingHods(false);
        }
    };

    const handleAssignHod = async (e) => {
        e.preventDefault();
        if (!selectedNewHod) return alert("Please select an HOD from the list.");
        setIsSubmitting(true);
        try {
            await updateDepartment(transferModal.targetDept._id, { hod: selectedNewHod });
            alert(`HOD Power for ${transferModal.targetDept.name} has been transferred!`);
            setTransferModal({ isOpen: false, targetDept: null });
            loadDepartments(); 
        } catch (error) {
            console.error("Failed to transfer HOD power.", error);
            alert("Failed to transfer HOD power.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredDepartments = departments.filter(d => 
        d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        d.abbreviation?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-indigo-500">
                <Loader2 className="w-10 h-10 animate-spin mb-3" />
                <p className="font-bold text-sm">Loading Departments...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full w-full animate-in fade-in duration-300">
            
            {/* Header & Controls */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Department Control</h2>
                    <p className="text-sm font-medium text-slate-500 mt-1">Create branches and assign Heads of Department.</p>
                </div>
                
                <div className="flex gap-2 w-full sm:w-auto">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input 
                            type="text" 
                            placeholder="Search departments..." 
                            value={searchTerm} 
                            onChange={(e) => setSearchTerm(e.target.value)} 
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white outline-none text-sm font-semibold transition-all"
                        />
                    </div>
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm rounded-xl shadow-sm transition-colors whitespace-nowrap"
                    >
                        <Plus size={16} /> New 
                    </button>
                </div>
            </div>

            {/* Department List Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredDepartments.length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400">
                        <Building2 className="w-12 h-12 mb-3 opacity-30" />
                        <p className="text-sm font-bold">No departments established yet.</p>
                    </div>
                ) : (
                    filteredDepartments.map(dept => {
                        const hodUser = users.find(u => u._id === (dept.hod?._id || dept.hod));

                        return (
                            <div key={dept._id} className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:border-indigo-300 hover:shadow-md transition-all flex flex-col">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center border border-indigo-100 flex-shrink-0">
                                            <Building2 className="text-indigo-600 w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-extrabold text-slate-900 text-lg leading-tight flex items-center gap-2">
                                                {dept.name}
                                                {dept.abbreviation && <span className="bg-slate-100 text-slate-600 border border-slate-200 text-[9px] px-2 py-0.5 rounded uppercase">{dept.abbreviation}</span>}
                                            </h3>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Engineering</span>
                                        </div>
                                    </div>
                                    <button onClick={() => handleDelete(dept._id, dept.name)} className="text-slate-300 hover:text-rose-500 p-1.5 hover:bg-rose-50 rounded-lg transition-colors">
                                        <Trash2 size={16}/>
                                    </button>
                                </div>
                                
                                <div className="mt-2 pt-3 border-t border-slate-100 flex-1 flex items-center justify-between">
                                    <div className="flex flex-col justify-center">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Assigned HOD</p>
                                        {hodUser ? (
                                            <div className="flex items-center gap-2">
                                                <Shield className="w-4 h-4 text-emerald-500 flex-shrink-0"/>
                                                <span className="text-sm font-bold text-slate-700 truncate">{hodUser.name}</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <Users className="w-4 h-4 text-amber-500 flex-shrink-0"/>
                                                <span className="text-sm font-bold text-amber-600">Pending Assignment</span>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <button 
                                        onClick={() => handleOpenHodModal(dept)}
                                        className="p-2 bg-slate-50 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 rounded-lg transition-colors border border-slate-100 hover:border-indigo-200"
                                        title="Transfer HOD Power"
                                    >
                                        <ArrowRightLeft size={16} />
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Create Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-xl font-black text-slate-900 leading-tight">New Department</h2>
                                <p className="text-xs font-bold text-slate-500 mt-1">Create a new academic branch.</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-600 rounded-xl transition-colors"><X size={18} /></button>
                        </div>

                        <form onSubmit={handleCreateDepartment} className="space-y-4">
                            <div className="grid grid-cols-3 gap-3">
                                <div className="col-span-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Department Name</label>
                                    <input type="text" required placeholder="e.g. Computer Science" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-bold text-slate-700" />
                                </div>
                                <div className="col-span-1">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Abbrev.</label>
                                    <input type="text" required placeholder="e.g. CSE" value={formData.abbreviation} onChange={e => setFormData({...formData, abbreviation: e.target.value.toUpperCase()})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-black text-indigo-700 uppercase" />
                                </div>
                            </div>
                            
                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Appoint HOD (Optional)</label>
                                {/* 🟢 UPDATED: Only maps through users who have the 'HOD' designation */}
                                <select value={formData.hodId} onChange={e => setFormData({...formData, hodId: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-bold text-slate-700 cursor-pointer">
                                    <option value="">-- Select Verified HOD --</option>
                                    {eligibleHodsForNewDept.map(f => (
                                        <option key={f._id} value={f._id}>{f.name} ({f.registrationNo})</option>
                                    ))}
                                </select>
                                {/* 🟢 UPDATED: Clearer warning message */}
                                {eligibleHodsForNewDept.length === 0 && (
                                    <p className="text-[10px] text-rose-500 font-bold mt-1.5">No verified HODs found. Please verify an HOD via the Admin Portal first.</p>
                                )}
                            </div>

                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">About / Description</label>
                                <textarea rows="3" placeholder="Brief description of the department..." value={formData.about} onChange={e => setFormData({...formData, about: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-medium text-slate-700 resize-none"></textarea>
                            </div>

                            <button type="submit" disabled={isSubmitting} className="w-full py-3.5 bg-indigo-600 text-white font-extrabold rounded-xl hover:bg-indigo-700 shadow-md transition-colors mt-4 disabled:opacity-50 flex items-center justify-center gap-2">
                                {isSubmitting ? <Loader2 size={18} className="animate-spin"/> : <Building2 size={18}/>} 
                                Establish Department
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Transfer HOD Power Modal */}
            {transferModal.isOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl w-full max-w-2xl p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-xl font-black text-slate-900 leading-tight">
                                    Transfer Department Power
                                </h2>
                                <p className="text-xs font-bold text-slate-500 mt-1">
                                    {transferModal.targetDept?.name}
                                </p>
                            </div>
                            <button onClick={() => setTransferModal({ isOpen: false, targetDept: null })} className="p-2 bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-600 rounded-xl transition-colors"><X size={18} /></button>
                        </div>

                        <form onSubmit={handleAssignHod} className="space-y-4">
                            <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl flex items-start gap-3 mb-4">
                                <Info className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                                <p className="text-xs font-medium text-indigo-800 leading-relaxed">
                                    You are about to transfer the administrative power of the <strong>{transferModal.targetDept?.name}</strong> department. 
                                    Only users who have been verified by the Institute Admin with the exact designation of <strong>"HOD"</strong> appear in this list.
                                </p>
                            </div>

                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Select New HOD</label>
                                {loadingHods ? (
                                    <div className="p-4 text-center text-slate-500 text-xs font-bold flex items-center justify-center gap-2 border border-slate-200 rounded-xl bg-slate-50">
                                        <Loader2 className="w-4 h-4 animate-spin" /> Fetching verified HODs...
                                    </div>
                                ) : eligibleHods.length === 0 ? (
                                    <div className="p-4 text-center text-rose-500 text-xs font-bold border border-rose-200 rounded-xl bg-rose-50">
                                        No verified HODs found in the institute directory. Please verify an HOD via the Admin Portal first.
                                    </div>
                                ) : (
                                    <div className="relative">
                                        <select
                                            required
                                            className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-bold text-slate-700 cursor-pointer appearance-none"
                                            value={selectedNewHod}
                                            onChange={e => setSelectedNewHod(e.target.value)}
                                        >
                                            <option value="">-- Choose an HOD --</option>
                                            {eligibleHods.map(hod => (
                                                <option key={hod._id} value={hod._id}>
                                                    {hod.name} ({hod.registrationNo || 'No ID'})
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rotate-90 pointer-events-none" />
                                    </div>
                                )}
                            </div>

                            <button 
                                type="submit" 
                                disabled={isSubmitting || eligibleHods.length === 0} 
                                className="w-full py-3.5 bg-indigo-600 text-white font-extrabold rounded-xl hover:bg-indigo-700 shadow-md transition-colors mt-6 flex justify-center items-center gap-2 disabled:opacity-50 active:scale-95"
                            >
                                {isSubmitting ? <Loader2 size={16} className="animate-spin"/> : <Shield size={16}/>} 
                                Confirm Transfer of Power
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}