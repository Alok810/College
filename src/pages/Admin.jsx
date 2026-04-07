import React, { useState, useEffect, memo } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAdminStats, getAdminUsers, getPendingInstituteUsers, verifyInstituteUser, fetchCampusClubs, deleteClub } from '../api'; // ✅ Added deleteClub
import { 
  ShieldAlert, ShieldCheck, Users, BarChart3, GraduationCap, Building2, 
  Search, Settings, CheckCircle, XCircle, UserPlus, MoreVertical, LayoutDashboard,
  Briefcase, Trash2, Tent // ✅ Added Trash2 and Tent icons
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

import CampusManagement from '../components/CampusManagement';

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

const AccessDenied = () => (
  <div className="flex flex-col items-center justify-center h-full w-full p-10 text-center bg-white rounded-[2rem] border border-slate-100 shadow-sm mt-4">
    <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-6 border-4 border-red-100">
      <ShieldAlert className="w-12 h-12 text-red-500" />
    </div>
    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">Restricted Area</h1>
    <p className="text-slate-500 max-w-md text-sm sm:text-base font-medium">
      This control panel is strictly reserved for registered <span className="font-bold text-indigo-600">Institute Administrators</span>.
    </p>
  </div>
);

// Helper function to extract initials for the premium avatars
const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length > 1) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
};

const Admin = () => {
  const { authData, loading } = useAuth();
  const isInstituteAdmin = authData?.userType === 'Institute' || authData?.role === 'admin';

  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState({ sgpaByBranch: [], passFailRate: [] });
  const [users, setUsers] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [existingClubs, setExistingClubs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [openMenuId, setOpenMenuId] = useState(null);

  const fetchAdminData = async () => {
    try {
      const statsData = await getAdminStats();
      setStats(statsData.stats || statsData); 
      if (statsData.charts) setChartData(statsData.charts);
      
      const usersData = await getAdminUsers();
      setUsers(usersData.users || usersData);

      const pendingData = await getPendingInstituteUsers();
      setPendingUsers(pendingData.pendingUsers || []);

      const clubsData = await fetchCampusClubs();
      if(clubsData.success) setExistingClubs(clubsData.clubs);

    } catch (error) {
      console.error("Failed to load admin data", error);
    }
  };

  useEffect(() => {
    if (!loading && isInstituteAdmin) fetchAdminData();
  }, [loading, isInstituteAdmin]);

  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  const handleVerify = async (userId, action, userName) => {
    const confirmMsg = action === 'approve' ? `Approve ${userName}?` : `Reject and remove ${userName}?`;
    if (!window.confirm(confirmMsg)) return;
    try {
      await verifyInstituteUser(userId, action);
      fetchAdminData();
    } catch (error) {
      alert("Failed to process request.");
    }
  };

  // ✅ NEW: Admin Delete Club Handler
  const handleDeleteClub = async (clubId, clubName) => {
      const confirmText = prompt(`WARNING: This will permanently delete the club "${clubName}" and all its associated data. Type the name of the club to confirm:`);
      
      if (confirmText === clubName) {
          try {
              // Ensure your api.js has a deleteClub function that hits your backend DELETE endpoint
              await deleteClub(clubId);
              alert(`${clubName} has been successfully deleted.`);
              fetchAdminData(); // Refresh the list after deletion
          } catch (error) {
              alert(error.message || "Failed to delete the club.");
          }
      } else if (confirmText !== null) {
          alert("Club name did not match. Deletion cancelled.");
      }
  };

  if (loading) return null; 
  if (!isInstituteAdmin) return <div className="max-w-4xl mx-auto w-[94%] h-full flex flex-col items-center pt-4"><AccessDenied /></div>;

  const filteredUsers = users.filter(user => user.name?.toLowerCase().includes(searchTerm.toLowerCase()) || user.registrationNo?.toLowerCase().includes(searchTerm.toLowerCase()));
  
  // Also filter clubs in settings if admin wants to search
  const filteredClubs = existingClubs.filter(club => club.name?.toLowerCase().includes(searchTerm.toLowerCase()));

  const tabs = [
    { id: 'overview', label: 'Overview & Analytics', icon: LayoutDashboard },
    { id: 'verification', label: `Verification Desk (${pendingUsers.length})`, alert: pendingUsers.length > 0, icon: UserPlus },
    { id: 'users', label: 'User Directory', icon: Users },
    { id: 'management', label: 'Campus Management', icon: Briefcase }, 
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const activeTabContext = tabs.find(t => t.id === activeTab);
  const ActiveIcon = activeTabContext?.icon || Settings;

  return (
    <div className="flex flex-col items-center h-full w-full max-w-[100vw] overflow-x-hidden pb-0 sm:pb-2 pt-1 sm:pt-2">
      <div className="flex flex-col w-[94%] sm:w-full max-w-6xl mx-auto h-full min-h-0 gap-2 sm:gap-3 relative">
        
        <div className="flex-shrink-0 w-full md:w-max md:mx-auto overflow-hidden bg-white p-1.5 rounded-xl shadow-sm border border-slate-200 mt-2">
          <div className="flex gap-1 justify-center sm:justify-start overflow-x-auto custom-scrollbar">
            {tabs.map((tab, index) => (
              <button 
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setSearchTerm(''); }} // Clear search when swapping tabs
                className={`relative px-3 sm:px-5 py-2.5 rounded-lg font-bold text-xs sm:text-sm transition-all whitespace-nowrap flex items-center gap-1.5
                  ${activeTab === tab.id ? 'bg-[#4F46E5] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                <span className={activeTab === tab.id ? 'text-indigo-200 font-extrabold' : 'text-slate-400 font-extrabold'}>{index + 1}.</span>
                {tab.label}
                {tab.alert && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full animate-pulse shadow-sm"></span>}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 bg-white shadow-sm rounded-[1.5rem] p-4 sm:p-6 border border-slate-100 overflow-hidden flex flex-col min-h-0">
          
          <div className="relative flex items-center justify-between border-b border-slate-100 pb-4 mb-4 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-[0.8rem] bg-indigo-50 flex items-center justify-center border border-indigo-100"><ShieldCheck className="text-indigo-600 w-5 h-5 sm:w-6 sm:h-6" /></div>
              <div><h1 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-none">Institute Portal</h1><p className="text-[10px] sm:text-xs text-slate-500 font-medium mt-0.5">{authData?.instituteName || "Administration Dashboard"}</p></div>
            </div>
            <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 ml-8 items-center justify-center text-center pointer-events-none"><h2 className="text-lg sm:text-xl font-extrabold text-slate-800 flex items-center gap-2"><ActiveIcon className="text-indigo-500 w-5 h-5" />{activeTabContext?.label.split(' (')[0]}</h2></div>
            <div className="text-right bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 relative z-10"><span className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Access</span><p className="font-extrabold text-[#4F46E5] text-xs sm:text-sm">Admin</p></div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
            
            {activeTab === 'overview' && (
              <div className="flex flex-col h-full w-full">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
                  <StatCard title="Total Verified Users" count={stats?.totalUsers || stats?.users} icon={Users} colorClass="bg-gradient-to-br from-blue-400 to-blue-600" />
                  <StatCard title="Verified Students" count={stats?.students} icon={GraduationCap} colorClass="bg-gradient-to-br from-teal-400 to-teal-600" />
                  <StatCard title="Verified Officials" count={stats?.officials} icon={BarChart3} colorClass="bg-gradient-to-br from-purple-400 to-purple-600" />
                  <StatCard title="Pending Approvals" count={pendingUsers.length} icon={UserPlus} colorClass="bg-gradient-to-br from-amber-400 to-amber-600" />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 lg:col-span-2">
                        <h3 className="text-lg font-black text-slate-800 mb-1">Academic Performance</h3><p className="text-xs font-bold text-slate-500 mb-6">Average SGPA across all branches</p>
                        <div className="h-[250px] w-full">
                            {chartData.sgpaByBranch?.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData.sgpaByBranch} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                        <XAxis dataKey="branch" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 'bold' }} dy={10} />
                                        <YAxis domain={[0, 10]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 'bold' }} />
                                        <RechartsTooltip cursor={{fill: '#F1F5F9'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} labelStyle={{ fontWeight: 'bold', color: '#1e293b' }} />
                                        <Bar dataKey="avgSgpa" name="Avg SGPA" fill="#4F46E5" radius={[6, 6, 0, 0]} barSize={40} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (<div className="flex items-center justify-center h-full text-slate-400 font-medium border border-dashed border-slate-200 rounded-xl bg-white">Waiting for result publications...</div>)}
                        </div>
                    </div>
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 lg:col-span-1">
                        <h3 className="text-lg font-black text-slate-800 mb-1">Result Outcomes</h3><p className="text-xs font-bold text-slate-500 mb-6">Overall Pass vs Promoted/Fail</p>
                        <div className="h-[250px] w-full flex items-center justify-center">
                            {chartData.passFailRate?.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={chartData.passFailRate} cx="50%" cy="45%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                                            {chartData.passFailRate.map((entry, index) => <Cell key={`cell-${index}`} fill={['#10B981', '#F43F5E', '#F59E0B'][index % 3]} />)}
                                        </Pie>
                                        <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} itemStyle={{ fontWeight: 'bold' }} />
                                        <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 'bold' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (<div className="flex items-center justify-center h-full text-slate-400 font-medium w-full border border-dashed border-slate-200 rounded-xl bg-white">No results published yet.</div>)}
                        </div>
                    </div>
                </div>
              </div>
            )}

            {/* 🟢 PREMIUM VERIFICATION DESK */}
            {activeTab === 'verification' && (
              <div className="flex flex-col h-full w-full">
                <p className="text-sm text-slate-500 font-medium mb-6">Review and verify students before granting them network access to your institute.</p>
                <div className="flex flex-col gap-3">
                  {pendingUsers.length === 0 ? (
                     <div className="text-center text-slate-500 py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-200"><CheckCircle className="w-12 h-12 mx-auto text-emerald-400 mb-3" /><h3 className="text-lg font-black text-slate-800">All caught up!</h3><p className="text-sm font-medium">No pending verifications at the moment.</p></div>
                  ) : (
                    pendingUsers.map(user => (
                      <div key={user._id} className="p-4 bg-white rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm hover:border-indigo-100 transition-all">
                        
                        {/* Avatar & Name Area */}
                        <div className="flex items-center gap-4 w-full md:w-1/3">
                          <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-lg flex-shrink-0">
                             {getInitials(user.name)}
                          </div>
                          <div className="flex flex-col justify-center min-w-0">
                            <h3 className="text-[15px] font-black text-slate-900 uppercase tracking-wide truncate">{user.name}</h3>
                            <p className="text-[13px] text-slate-500 font-medium truncate">{user.email}</p>
                          </div>
                        </div>

                        {/* Badge & Registration Info */}
                        <div className="flex flex-col md:items-center justify-center w-full md:w-1/4 pt-3 md:pt-0">
                          <span className={`px-3 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest border w-max mb-1.5 ${user.userType === 'Institute' ? 'bg-rose-50 text-rose-700 border-rose-200' : user.userType === 'Official' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-teal-50 text-[#059669] border-[#A7F3D0]'}`}>
                            {user.userType || 'STUDENT'}
                          </span>
                          <p className="text-[12px] font-bold text-slate-500">Claimed Reg No: <span className="text-slate-900">{user.registrationNo || 'N/A'}</span></p>
                        </div>

                        {/* Branch Details */}
                        <div className="flex items-center md:justify-center w-full md:w-[15%] pt-1 md:pt-0">
                          <p className="text-[12px] font-bold text-slate-500 uppercase tracking-wide">
                            BRANCH: <span className="text-indigo-600 ml-1">{user.branch || 'N/A'}</span>
                          </p>
                        </div>

                        {/* Actions Overlay */}
                        <div className="flex items-center gap-3 w-full md:w-auto md:justify-end flex-shrink-0 mt-3 md:mt-0">
                          <button onClick={() => handleVerify(user._id, 'reject', user.name)} className="flex-1 md:flex-none px-4 py-2 bg-white border border-rose-200 hover:bg-rose-50 text-rose-600 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 transition-colors">
                            <XCircle size={16} /> Reject
                          </button>
                          <button onClick={() => handleVerify(user._id, 'approve', user.name)} className="flex-1 md:flex-none px-4 py-2 bg-[#10B981] hover:bg-[#059669] text-white rounded-full text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm">
                            <CheckCircle size={16} /> Approve
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* 🟢 PREMIUM USER DIRECTORY */}
            {activeTab === 'users' && (
              <div className="flex flex-col h-full w-full" onClick={() => setOpenMenuId(null)}>
                <div className="flex items-center justify-between mb-6">
                  <div className="relative w-full sm:w-72">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input type="text" placeholder="Search by Name or Reg No..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white outline-none text-sm font-semibold transition-all"/>
                  </div>
                </div>
                
                <div className="flex flex-col gap-3">
                  {filteredUsers.length === 0 ? (
                     <div className="text-center text-slate-500 py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-200"><Users className="w-12 h-12 mx-auto text-slate-300 mb-3" /><h3 className="text-lg font-black text-slate-800">No users found</h3><p className="text-sm font-medium">Try adjusting your search query.</p></div>
                  ) : (
                    filteredUsers.map(user => (
                      <div key={user._id} className="p-4 bg-white rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm hover:border-indigo-100 transition-all relative">
                        
                        {/* Avatar & Name Area */}
                        <div className="flex items-center gap-4 w-full md:w-1/3 pr-8 md:pr-0">
                          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-lg flex-shrink-0 border border-slate-200">
                             {getInitials(user.name)}
                          </div>
                          <div className="flex flex-col justify-center min-w-0">
                            <h3 className="text-[15px] font-black text-slate-900 uppercase tracking-wide truncate">{user.name || 'Unknown User'}</h3>
                            <p className="text-[13px] text-slate-500 font-medium truncate">{user.email || 'No email provided'}</p>
                          </div>
                        </div>

                        {/* Badge & Registration Info */}
                        <div className="flex flex-col md:items-center justify-center w-full md:w-1/4 pt-3 md:pt-0">
                          <span className={`px-3 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest border w-max mb-1.5 ${user.designation && user.designation !== "Student" && user.designation !== "Official" ? 'bg-amber-50 text-amber-700 border-amber-200' : user.userType === 'Institute' ? 'bg-rose-50 text-rose-700 border-rose-200' : user.userType === 'Official' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-teal-50 text-[#059669] border-[#A7F3D0]'}`}>
                            {user.designation || user.userType || 'STUDENT'}
                          </span>
                          <p className="text-[12px] font-bold text-slate-500">Reg No: <span className="text-slate-900">{user.registrationNo || 'N/A'}</span></p>
                        </div>

                        {/* Branch Details */}
                        <div className="flex items-center md:justify-center w-full md:w-[20%] pt-1 md:pt-0">
                          <p className="text-[12px] font-bold text-slate-500 uppercase tracking-wide">
                            Branch: <span className="text-indigo-600 ml-1">{user.branch || 'N/A'}</span>
                          </p>
                        </div>

                        {/* Actions Overlay / Dots Menu */}
                        <div className="absolute top-4 right-4 md:relative md:top-0 md:right-0 md:w-auto flex justify-end">
                          <div className="relative">
                              <button onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === user._id ? null : user._id); }} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-800 transition-colors"><MoreVertical size={20} /></button>
                              {openMenuId === user._id && (
                                  <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 z-10 animate-in fade-in zoom-in-95 duration-100">
                                      <button className="w-full flex items-center gap-2 text-left px-4 py-2.5 text-sm font-bold text-indigo-600 hover:bg-indigo-50 transition-colors" onClick={(e) => { e.stopPropagation(); setActiveTab('management'); setOpenMenuId(null); }}><Briefcase size={16} /> Manage Roles</button>
                                      <div className="h-px bg-slate-100 my-1"></div>
                                      <button className="w-full text-left px-4 py-2.5 text-sm font-bold text-rose-600 hover:bg-rose-50 transition-colors" onClick={(e) => { e.stopPropagation(); alert(`Suspend account - Coming soon`); setOpenMenuId(null); }}>Suspend Account</button>
                                  </div>
                              )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'management' && (
                <CampusManagement 
                    users={users} 
                    existingClubs={existingClubs} 
                    fetchAdminData={fetchAdminData} 
                />
            )}

            {/* 🟢 NEW SETTINGS VIEW (Active Club Management) */}
            {activeTab === 'settings' && (
                <div className="flex flex-col h-full w-full animate-in fade-in duration-300">
                   
                   <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Active Club Control</h2>
                          <p className="text-sm font-medium text-slate-500 mt-1">Review and manage all established organizations within the institute.</p>
                      </div>
                      
                      <div className="relative w-full sm:w-64">
                         <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                         <input 
                            type="text" 
                            placeholder="Search organizations..." 
                            value={searchTerm} 
                            onChange={(e) => setSearchTerm(e.target.value)} 
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white outline-none text-sm font-semibold transition-all"
                         />
                      </div>
                   </div>

                   <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex-1 flex flex-col">
                      
                      {/* Header Row */}
                      <div className="grid grid-cols-12 gap-4 p-4 border-b border-slate-100 bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest hidden md:grid">
                          <div className="col-span-5 pl-2">Organization</div>
                          <div className="col-span-3 text-center">Category / Type</div>
                          <div className="col-span-2 text-center">Members</div>
                          <div className="col-span-2 text-right pr-4">Action</div>
                      </div>

                      {/* Club List */}
                      <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                         {filteredClubs.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-48 text-slate-400">
                                <Tent className="w-10 h-10 mb-3 opacity-30" />
                                <p className="text-sm font-bold">No active clubs match your search.</p>
                            </div>
                         ) : (
                            <div className="flex flex-col gap-2">
                                {filteredClubs.map(club => (
                                   <div key={club._id} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 items-center bg-white border border-slate-100 hover:border-slate-300 hover:shadow-sm rounded-xl transition-all">
                                      
                                      {/* Club Info */}
                                      <div className="col-span-1 md:col-span-5 flex flex-col min-w-0">
                                          <h3 className="text-sm font-black text-slate-900 truncate">{club.name}</h3>
                                          <p className="text-[11px] font-bold text-slate-500 truncate flex items-center gap-1.5 mt-0.5">
                                              President: <span className="text-indigo-600">{club.president?.name || 'Unassigned'}</span>
                                          </p>
                                      </div>

                                      {/* Badges */}
                                      <div className="col-span-1 md:col-span-3 flex md:justify-center items-center gap-2">
                                          <span className="bg-slate-100 text-slate-600 border border-slate-200 text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
                                              {club.category}
                                          </span>
                                          {club.parentClub && (
                                              <span className="bg-indigo-50 text-indigo-600 border border-indigo-200 text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
                                                  Sub-Division
                                              </span>
                                          )}
                                      </div>

                                      {/* Member Count */}
                                      <div className="col-span-1 md:col-span-2 flex md:justify-center items-center">
                                          <span className="text-xs font-black text-slate-600 bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">
                                              {club.members?.length || 1} Registered
                                          </span>
                                      </div>

                                      {/* Action Button */}
                                      <div className="col-span-1 md:col-span-2 flex md:justify-end items-center">
                                          <button 
                                              onClick={() => handleDeleteClub(club._id, club.name)}
                                              className="w-full md:w-auto px-4 py-2 bg-white hover:bg-rose-50 text-rose-500 hover:text-rose-700 border border-rose-200 hover:border-rose-400 rounded-lg text-[11px] font-black flex items-center justify-center gap-1.5 transition-all"
                                          >
                                              <Trash2 size={14} /> Delete
                                          </button>
                                      </div>

                                   </div>
                                ))}
                            </div>
                         )}
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

export default Admin;