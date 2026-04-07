import React, { useState, useEffect, memo } from 'react';
import { 
    getSuperAdminStats, 
    getSuperAdminInstitutes, 
    toggleInstituteApproval,
    getActiveAnnouncements,
    createAnnouncement,
    deactivateAnnouncement
} from '../api';
import { ShieldCheck, Building2, Users, CheckCircle, AlertTriangle, Loader2, Megaphone, Plus, Trash2, Info, AlertCircle, LayoutDashboard, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

// --- Dashboard Cards Component ---
const StatCard = memo(({ title, count, icon: Icon, colorClass }) => (
  <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 hover:border-indigo-300 transition-colors">
    <div className={`w-12 h-12 rounded-[0.8rem] flex items-center justify-center flex-shrink-0 ${colorClass}`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <div>
      <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">{title}</p>
      <h3 className="text-xl sm:text-2xl font-black text-slate-900">{count || 0}</h3>
    </div>
  </div>
));

// --- Access Denied Component ---
const AccessDenied = () => (
  <div className="flex flex-col items-center justify-center h-full w-full p-10 text-center bg-white rounded-[2rem] border border-slate-100 shadow-sm mt-4">
    <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-6 border-4 border-red-100">
      <ShieldAlert className="w-12 h-12 text-red-500" />
    </div>
    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">Restricted Area</h1>
    <p className="text-slate-500 max-w-md text-sm sm:text-base font-medium">
      This control panel is strictly reserved for <span className="font-bold text-indigo-600">Super Administrators</span>.
    </p>
  </div>
);

const SuperAdminDashboard = () => {
    const { authData } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');
    
    const [stats, setStats] = useState({ activeInstitutes: 0, totalStudents: 0, totalUsers: 0 });
    const [chartData, setChartData] = useState({ usersByInstitute: [], userGrowthData: [] });
    const [institutes, setInstitutes] = useState([]);
    
    // STATE FOR ANNOUNCEMENTS
    const [announcements, setAnnouncements] = useState([]);
    const [newAnnouncement, setNewAnnouncement] = useState({ message: '', type: 'info' });
    const [isSubmittingAlert, setIsSubmittingAlert] = useState(false);

    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    const displayMessage = (msg) => {
        setMessage(msg);
        setTimeout(() => setMessage(''), 3000);
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const [statsData, instData, accData] = await Promise.all([
                getSuperAdminStats(),
                getSuperAdminInstitutes(),
                getActiveAnnouncements()
            ]);
            setStats(statsData.stats);
            if (statsData.charts) setChartData(statsData.charts);
            setInstitutes(instData.institutes);
            setAnnouncements(accData.announcements || []);
        } catch (error) {
            displayMessage("Failed to fetch Super Admin data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (authData?.role === "superadmin" || authData?.user?.role === "superadmin") {
            fetchData();
        }
    }, [authData]);

    const handleToggleStatus = async (id, currentStatus, name) => {
        const action = currentStatus ? "REVOKE" : "APPROVE";
        if (window.confirm(`Are you sure you want to ${action} access for ${name}?`)) {
            try {
                await toggleInstituteApproval(id, !currentStatus);
                displayMessage(`Successfully updated ${name}.`);
                fetchData(); 
            } catch (error) {
                displayMessage("Failed to update institute status.");
            }
        }
    };

    const handleCreateAnnouncement = async (e) => {
        e.preventDefault();
        if (!newAnnouncement.message.trim()) return displayMessage("Message cannot be empty.");
        
        setIsSubmittingAlert(true);
        try {
            await createAnnouncement(newAnnouncement);
            displayMessage("Global announcement broadcasted!");
            setNewAnnouncement({ message: '', type: 'info' }); 
            fetchData(); 
        } catch (error) {
            displayMessage("Failed to broadcast announcement.");
        } finally {
            setIsSubmittingAlert(false);
        }
    };

    const handleDeleteAnnouncement = async (id) => {
        if (window.confirm("Remove this announcement from the platform?")) {
            try {
                await deactivateAnnouncement(id);
                displayMessage("Announcement removed.");
                fetchData();
            } catch (error) {
                displayMessage("Failed to remove announcement.");
            }
        }
    };

    // Extra Security Check
    if (authData?.role !== "superadmin" && authData?.user?.role !== "superadmin") {
        return <div className="max-w-4xl mx-auto w-[94%] h-full flex flex-col items-center pt-4"><AccessDenied /></div>;
    }

    if (loading) {
        return <div className="flex justify-center items-center h-full"><Loader2 className="w-8 h-8 text-indigo-600 animate-spin" /></div>;
    }

    // Tab Definitions mapping
    const tabs = [
      { id: 'overview', label: 'Platform Overview', icon: LayoutDashboard },
      { id: 'announcements', label: 'Global Announcements', icon: Megaphone, alert: announcements.length > 0 },
      { id: 'institutes', label: `Registered Institutes (${institutes.length})`, icon: Building2 }
    ];

    const activeTabContext = tabs.find(t => t.id === activeTab);
    const ActiveIcon = activeTabContext?.icon || Settings;

    return (
        <div className="flex flex-col items-center h-full w-full max-w-[100vw] overflow-x-hidden pb-0 sm:pb-2 pt-1 sm:pt-2">
            {message && <div className="fixed top-20 sm:top-8 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-2xl shadow-lg bg-slate-900 text-white font-bold text-sm animate-in slide-in-from-top-4 fade-in">{message}</div>}
            
            <div className="flex flex-col w-[94%] sm:w-full max-w-6xl mx-auto h-full min-h-0 gap-2 sm:gap-3">
                
                {/* --- 1. FLOATING STEPPER NAVIGATION --- */}
                <div className="flex-shrink-0 w-full md:w-max md:mx-auto overflow-hidden bg-white p-1.5 rounded-xl shadow-sm border border-slate-200 mt-2">
                    <div className="flex gap-1 justify-center sm:justify-start overflow-x-auto custom-scrollbar">
                        {tabs.map((tab, index) => (
                        <button 
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)} 
                            className={`relative px-3 sm:px-5 py-2.5 rounded-lg font-bold text-xs sm:text-sm transition-all whitespace-nowrap flex items-center gap-1.5
                            ${activeTab === tab.id 
                                ? 'bg-[#4F46E5] text-white shadow-sm' 
                                : 'text-slate-600 hover:bg-slate-100'}`}
                        >
                            <span className={activeTab === tab.id ? 'text-indigo-200 font-extrabold' : 'text-slate-400 font-extrabold'}>
                            {index + 1}.
                            </span>
                            {tab.label}
                            {tab.alert && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full animate-pulse shadow-sm"></span>}
                        </button>
                        ))}
                    </div>
                </div>

                {/* --- 2. MAIN CONTENT CARD --- */}
                <div className="flex-1 bg-white shadow-sm rounded-[1.5rem] p-4 sm:p-6 border border-slate-100 overflow-hidden flex flex-col min-h-0">
                    
                    {/* Card Header */}
                    <div className="relative flex items-center justify-between border-b border-slate-100 pb-4 mb-4 flex-shrink-0">
                        
                        {/* Left: Icon & Title */}
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-[0.8rem] bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center border border-indigo-200">
                                <ShieldCheck className="text-indigo-600 w-5 h-5 sm:w-6 sm:h-6" />
                            </div>
                            <div>
                                <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-none">Super Admin Portal</h1>
                                <p className="text-[10px] sm:text-xs text-slate-500 font-medium mt-0.5">Global Control Center</p>
                            </div>
                        </div>

                        {/* Center: Context Title */}
                        <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 ml-8 items-center justify-center text-center pointer-events-none">
                            <h2 className="text-lg sm:text-xl font-extrabold text-slate-800 flex items-center gap-2">
                                <ActiveIcon className="text-indigo-500 w-5 h-5" />
                                {activeTabContext?.label.split(' (')[0]}
                            </h2>
                        </div>

                        {/* Right: Access Badge */}
                        <div className="text-right bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 relative z-10">
                            <span className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Access</span>
                            <p className="font-extrabold text-[#4F46E5] text-xs sm:text-sm whitespace-nowrap">Super Admin</p>
                        </div>
                    </div>

                    {/* Card Body (Dynamic Content) */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
                        
                        {/* 1. OVERVIEW TAB */}
                        {activeTab === 'overview' && (
                            <div className="flex flex-col h-full w-full">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
                                    <StatCard title="Active Institutes" count={stats.activeInstitutes} icon={Building2} colorClass="bg-gradient-to-br from-emerald-400 to-emerald-600" />
                                    <StatCard title="Total Students" count={stats.totalStudents} icon={Users} colorClass="bg-gradient-to-br from-blue-400 to-blue-600" />
                                    <StatCard title="Total Users" count={stats.totalUsers} icon={Users} colorClass="bg-gradient-to-br from-purple-400 to-purple-600" />
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                                    {/* Area Chart */}
                                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 lg:col-span-2">
                                        <h3 className="text-lg font-black text-slate-800 mb-1">Platform Growth</h3>
                                        <p className="text-xs font-bold text-slate-500 mb-6">New user registrations over time</p>
                                        <div className="h-[250px] w-full min-h-[250px] min-w-[200px]">
                                            {chartData.userGrowthData.length > 0 ? (
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <AreaChart data={chartData.userGrowthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                                        <defs>
                                                            <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                                                <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3}/>
                                                                <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                                                            </linearGradient>
                                                        </defs>
                                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 'bold' }} dy={10} />
                                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 'bold' }} />
                                                        <RechartsTooltip 
                                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                                            labelStyle={{ fontWeight: 'bold', color: '#1e293b' }}
                                                        />
                                                        <Area type="monotone" dataKey="users" stroke="#4F46E5" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
                                                    </AreaChart>
                                                </ResponsiveContainer>
                                            ) : (
                                                <div className="flex items-center justify-center h-full text-slate-400 font-medium bg-white rounded-xl border border-dashed border-slate-200">Not enough data to graph yet.</div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Pie Chart */}
                                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 lg:col-span-1">
                                        <h3 className="text-lg font-black text-slate-800 mb-1">Demographics</h3>
                                        <p className="text-xs font-bold text-slate-500 mb-6">User distribution by Institute</p>
                                        <div className="h-[250px] w-full flex items-center justify-center min-h-[250px] min-w-[200px]">
                                            {chartData.usersByInstitute.length > 0 ? (
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <PieChart>
                                                        <Pie
                                                            data={chartData.usersByInstitute}
                                                            cx="50%"
                                                            cy="45%"
                                                            innerRadius={60}
                                                            outerRadius={80}
                                                            paddingAngle={5}
                                                            dataKey="value"
                                                            stroke="none"
                                                        >
                                                            {chartData.usersByInstitute.map((entry, index) => {
                                                                const colors = ['#4F46E5', '#10B981', '#F59E0B', '#3B82F6', '#8B5CF6'];
                                                                return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                                                            })}
                                                        </Pie>
                                                        <RechartsTooltip 
                                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                                            itemStyle={{ fontWeight: 'bold' }}
                                                        />
                                                        <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            ) : (
                                                <div className="flex items-center justify-center h-full text-slate-400 font-medium w-full bg-white rounded-xl border border-dashed border-slate-200">No demographics yet.</div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 2. ANNOUNCEMENTS TAB */}
                        {activeTab === 'announcements' && (
                            <div className="flex flex-col h-full w-full">
                                <p className="text-sm text-slate-500 font-medium mb-6">Broadcast alerts and important messages to all users across the platform.</p>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {/* Create Form */}
                                    <div className="p-5 md:col-span-1 bg-slate-50 rounded-xl border border-slate-200 h-max">
                                        <form onSubmit={handleCreateAnnouncement} className="space-y-4">
                                            <div>
                                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Message Content</label>
                                                <textarea 
                                                    className="w-full p-3 border border-slate-300 rounded-lg text-sm outline-none focus:border-indigo-500 font-medium resize-none bg-white" 
                                                    rows="4" 
                                                    placeholder="Type your global alert here..."
                                                    value={newAnnouncement.message}
                                                    onChange={(e) => setNewAnnouncement({...newAnnouncement, message: e.target.value})}
                                                    required
                                                ></textarea>
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Alert Type</label>
                                                <select 
                                                    className="w-full p-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:border-indigo-500 font-bold bg-white"
                                                    value={newAnnouncement.type}
                                                    onChange={(e) => setNewAnnouncement({...newAnnouncement, type: e.target.value})}
                                                >
                                                    <option value="info">Info (Blue)</option>
                                                    <option value="warning">Warning (Yellow)</option>
                                                    <option value="danger">Emergency (Red)</option>
                                                </select>
                                            </div>
                                            <button 
                                                type="submit" 
                                                disabled={isSubmittingAlert || !newAnnouncement.message.trim()}
                                                className="w-full py-3 bg-slate-800 hover:bg-black text-white font-extrabold rounded-lg shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {isSubmittingAlert ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                                                Broadcast to Platform
                                            </button>
                                        </form>
                                    </div>

                                    {/* Active List */}
                                    <div className="md:col-span-2">
                                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Currently Active Banners</h3>
                                        <div className="space-y-3">
                                            {announcements.length === 0 ? (
                                                <div className="text-center py-16 text-slate-400 font-medium bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                                    No active announcements. The skies are clear!
                                                </div>
                                            ) : (
                                                announcements.map(acc => {
                                                    let colorClasses = "bg-blue-50 border-blue-200 text-blue-800";
                                                    let Icon = Info;
                                                    if (acc.type === 'warning') { colorClasses = "bg-amber-50 border-amber-200 text-amber-800"; Icon = AlertTriangle; }
                                                    if (acc.type === 'danger') { colorClasses = "bg-rose-50 border-rose-200 text-rose-800"; Icon = AlertCircle; }

                                                    return (
                                                        <div key={acc._id} className={`flex items-start justify-between gap-3 p-4 rounded-xl border ${colorClasses}`}>
                                                            <div className="flex items-start gap-3">
                                                                <Icon size={20} className="mt-0.5 shrink-0" />
                                                                <p className="text-sm font-bold leading-relaxed">{acc.message}</p>
                                                            </div>
                                                            <button 
                                                                onClick={() => handleDeleteAnnouncement(acc._id)}
                                                                className="shrink-0 p-2 bg-white/50 hover:bg-white rounded-lg text-slate-500 hover:text-rose-600 transition-colors shadow-sm"
                                                                title="Deactivate Banner"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    )
                                                })
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 3. INSTITUTES TAB */}
                        {activeTab === 'institutes' && (
                            <div className="flex flex-col h-full w-full">
                                <p className="text-sm text-slate-500 font-medium mb-6">Manage platform access for registered educational institutions.</p>
                                
                                <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-sm">
                                            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-bold border-b border-slate-200">
                                                <tr>
                                                    <th className="p-4">Institute Name</th>
                                                    <th className="p-4">Reg No.</th>
                                                    <th className="p-4">Admin Contact</th>
                                                    <th className="p-4 text-center">Status</th>
                                                    <th className="p-4 text-right">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 font-medium">
                                                {institutes.length === 0 ? (
                                                    <tr><td colSpan="5" className="text-center py-16 text-slate-500 bg-slate-50">No institutes registered yet.</td></tr>
                                                ) : (
                                                    institutes.map(inst => (
                                                        <tr key={inst._id} className="hover:bg-slate-50 transition-colors">
                                                            <td className="p-4 font-bold text-slate-800 flex items-center gap-3">
                                                                {inst.logo?.url ? <img src={inst.logo.url} alt="Logo" className="w-10 h-10 rounded-full border border-slate-200 object-cover shrink-0" /> : <div className="w-10 h-10 rounded-full bg-slate-200 shrink-0"></div>}
                                                                <span className="truncate">{inst.instituteName}</span>
                                                            </td>
                                                            <td className="p-4 font-mono text-xs text-slate-500">{inst.instituteRegistrationNumber}</td>
                                                            <td className="p-4">
                                                                <p className="text-slate-800">{inst.adminEmail}</p>
                                                                <p className="text-xs text-slate-500">{inst.adminPhone || 'No phone'}</p>
                                                            </td>
                                                            <td className="p-4 text-center">
                                                                {inst.isApprovedBySuperAdmin ? 
                                                                    <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-md text-[10px] uppercase font-black tracking-wider"><CheckCircle size={12}/> Approved</span> : 
                                                                    <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-md text-[10px] uppercase font-black tracking-wider"><AlertTriangle size={12}/> Pending</span>
                                                                }
                                                            </td>
                                                            <td className="p-4 text-right">
                                                                <button 
                                                                    onClick={() => handleToggleStatus(inst._id, inst.isApprovedBySuperAdmin, inst.instituteName)}
                                                                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm ${inst.isApprovedBySuperAdmin ? 'bg-white border border-rose-200 text-rose-600 hover:bg-rose-50' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                                                                >
                                                                    {inst.isApprovedBySuperAdmin ? "Revoke Access" : "Approve Institute"}
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
};

export default SuperAdminDashboard;