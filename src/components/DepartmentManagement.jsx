import React, { useState, useEffect } from 'react';
import { Building2, Plus, Trash2, Search, X, Loader2, Shield, Users } from 'lucide-react';
import { getInstituteDepartments, createDepartment, deleteDepartment } from '../api';

export default function DepartmentManagement({ users }) {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // ✅ ADDED abbreviation to form state
    const [formData, setFormData] = useState({
        name: '',
        abbreviation: '', 
        about: '',
        hodId: ''
    });

    // Filter users to only show potential Faculty/Officials (exclude Students)
    const eligibleFaculty = users.filter(u => 
        u.userType === 'Teacher' || u.userType === 'Official' || (u.userType !== 'Student' && u.userType !== 'Institute')
    );

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
                abbreviation: formData.abbreviation, // ✅ Added abbreviation to payload
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
                                
                                <div className="mt-2 pt-3 border-t border-slate-100 flex-1 flex flex-col justify-center">
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
                            {/* ✅ Updated layout for Name and Abbreviation side-by-side */}
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
                                <select value={formData.hodId} onChange={e => setFormData({...formData, hodId: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-bold text-slate-700 cursor-pointer">
                                    <option value="">-- Select Faculty Member --</option>
                                    {eligibleFaculty.map(f => (
                                        <option key={f._id} value={f._id}>{f.name} ({f.userType})</option>
                                    ))}
                                </select>
                                {eligibleFaculty.length === 0 && (
                                    <p className="text-[10px] text-rose-500 font-bold mt-1.5">No teachers or officials found in directory.</p>
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
        </div>
    );
}