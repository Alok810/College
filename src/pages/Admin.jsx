import React, { useState, useEffect, memo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSearchParams } from 'react-router-dom';
import { getAdminStats, getAdminUsers, getPendingInstituteUsers, verifyInstituteUser, fetchCampusClubs, deleteClub, updateUserDesignation } from '../api';
import {
  ShieldAlert, ShieldCheck, Users, BarChart3, GraduationCap, Building2,
  Search, Settings, CheckCircle, XCircle, UserPlus, MoreVertical, LayoutDashboard,
  Briefcase, Trash2, ArrowUpCircle, Award, Loader2, X
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

import CampusManagement from '../components/CampusManagement';
import DepartmentManagement from '../components/DepartmentManagement';

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

const getInitials = (name) => {
  if (!name) return 'U';
  const parts = name.trim().split(' ');
  if (parts.length > 1) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
};

const Admin = () => {
  const { authData, loading } = useAuth();
  const isInstituteAdmin = authData?.userType === 'Institute' || authData?.role === 'admin';

  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';

  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState({ sgpaByBranch: [], passFailRate: [] });
  const [users, setUsers] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [existingClubs, setExistingClubs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [openMenuId, setOpenMenuId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [verificationFilter, setVerificationFilter] = useState('All');
  const [userFilter, setUserFilter] = useState('All');

  const [roleModal, setRoleModal] = useState({ isOpen: false, targetUser: null, actionType: 'appoint' });
  const [promotionRole, setPromotionRole] = useState("");

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
      if (clubsData.success) setExistingClubs(clubsData.clubs);

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
    const confirmMsg = action === 'approve'
      ? `Approve ${userName} for campus access?`
      : `Reject and remove ${userName}?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      await verifyInstituteUser(userId, action);
      fetchAdminData();
    } catch (error) {
      alert("Failed to process request.");
    }
  };

  const handleOpenAppointModal = (user) => {
    setRoleModal({ isOpen: true, targetUser: user, actionType: 'appoint' });
    setPromotionRole(user.designation);
    setOpenMenuId(null);
  };

  const handleOpenPromoteModal = (user) => {
    setRoleModal({ isOpen: true, targetUser: user, actionType: 'promote' });
    setPromotionRole(""); 
    setOpenMenuId(null);
  };

  const handleRoleSubmit = async (e) => {
    e.preventDefault();

    const finalDesignation = roleModal.actionType === 'appoint'
      ? roleModal.targetUser.designation
      : promotionRole;

    if (!finalDesignation) return alert("Please select a designation.");

    setIsSubmitting(true);
    try {
      await updateUserDesignation(roleModal.targetUser._id, finalDesignation);
      alert(`${roleModal.targetUser.name} has been successfully assigned as ${finalDesignation}!`);
      setRoleModal({ isOpen: false, targetUser: null, actionType: 'appoint' });
      fetchAdminData();
    } catch (error) {
      alert("Failed to update user role.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClub = async (clubId, clubName) => {
    const confirmText = prompt(`WARNING: This will permanently delete the club "${clubName}" and all its associated data. Type the name of the club to confirm:`);
    if (confirmText === clubName) {
      try { await deleteClub(clubId); alert(`${clubName} has been successfully deleted.`); fetchAdminData(); }
      catch (error) { alert(error.message || "Failed to delete the club."); }
    } else if (confirmText !== null) {
      alert("Club name did not match. Deletion cancelled.");
    }
  };

  const handleTabChange = (tabId) => {
    setSearchParams({ tab: tabId }, { replace: true });
    setSearchTerm(''); setUserFilter('All'); setVerificationFilter('All');
  };

  if (loading) return null;
  if (!isInstituteAdmin) return <div className="max-w-4xl mx-auto w-[94%] h-full flex flex-col items-center pt-4"><AccessDenied /></div>;

  const getNormalizedType = (user) => {
    const type = (user.userType || user.designation || 'Student').toLowerCase();
    if (type.includes('student')) return 'Student';
    if (type.includes('teacher') || type.includes('faculty') || type.includes('prof') || type.includes('dean') || type.includes('director') || type.includes('hod')) return 'Teacher';
    if (type.includes('official') || type.includes('admin') || type.includes('clerk') || type.includes('librarian') || type.includes('accountant')) return 'Official';
    return 'Other';
  };

  const filteredClubs = existingClubs.filter(club => club.name?.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredPendingUsers = pendingUsers.filter(user => {
    if (verificationFilter === 'All') return true;
    return getNormalizedType(user) === verificationFilter;
  });
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) || user.registrationNo?.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;
    if (userFilter === 'All') return true;
    return getNormalizedType(user) === userFilter;
  });

  const tabs = [
    { id: 'overview', label: 'Overview & Analytics', icon: LayoutDashboard },
    { id: 'verification', label: `Verification Desk (${pendingUsers.length})`, alert: pendingUsers.length > 0, icon: UserPlus },
    { id: 'users', label: 'User Directory', icon: Users },
    { id: 'departments', label: 'Departments', icon: Building2 },
    { id: 'management', label: 'Club Management', icon: Briefcase },
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
                onClick={() => handleTabChange(tab.id)}
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

          <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between border-b border-slate-100 pb-4 mb-4 gap-4 flex-shrink-0 z-20 bg-white">

            <div className="flex items-center gap-3 w-full lg:w-auto">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-[0.8rem] bg-indigo-50 flex items-center justify-center border border-indigo-100 flex-shrink-0">
                <ShieldCheck className="text-indigo-600 w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="overflow-hidden">
                <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-none truncate">Institute Portal</h1>
                <p className="text-[10px] sm:text-xs text-slate-500 font-medium mt-0.5 truncate max-w-[200px] sm:max-w-[300px]">{authData?.instituteName || "Administration Dashboard"}</p>
              </div>
            </div>

            <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center justify-center text-center pointer-events-none">
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <ActiveIcon className="text-indigo-600 w-5 h-5" />
                {activeTabContext?.label.split(' (')[0]}
              </h2>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto justify-end">

              {activeTab === 'users' && (
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <select
                    value={userFilter}
                    onChange={(e) => setUserFilter(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 outline-none focus:border-indigo-400 cursor-pointer shadow-sm transition-all"
                  >
                    <option value="All">All Roles</option>
                    <option value="Student">Students</option>
                    <option value="Teacher">Teachers</option>
                    <option value="Official">Officials</option>
                    <option value="Other">Other</option>
                  </select>
                  <div className="relative w-full sm:w-48">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-400 outline-none text-xs font-bold text-slate-700 shadow-sm transition-all"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'verification' && (
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <select
                    value={verificationFilter}
                    onChange={(e) => setVerificationFilter(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 outline-none focus:border-indigo-400 cursor-pointer w-full sm:w-40 shadow-sm transition-all"
                  >
                    <option value="All">All Requests</option>
                    <option value="Student">Students</option>
                    <option value="Teacher">Faculty</option>
                    <option value="Official">Officials</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="relative w-full sm:w-48">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search clubs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-400 outline-none text-xs font-bold text-slate-700 shadow-sm transition-all"
                  />
                </div>
              )}

              <div className="hidden sm:block text-right bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 flex-shrink-0">
                <span className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Access</span>
                <p className="font-extrabold text-[#4F46E5] text-xs sm:text-sm">Admin</p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 pt-1">

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
                        <ResponsiveContainer width="100%" height={250}>
                          <BarChart data={chartData.sgpaByBranch} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                            <XAxis dataKey="branch" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 'bold' }} dy={10} />
                            <YAxis domain={[0, 10]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 'bold' }} />
                            <RechartsTooltip cursor={{ fill: '#F1F5F9' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} labelStyle={{ fontWeight: 'bold', color: '#1e293b' }} />
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
                        <ResponsiveContainer width="100%" height={250}>
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

            {activeTab === 'verification' && (
              <div className="flex flex-col h-full w-full animate-in fade-in duration-300">
                <div className="flex flex-col gap-3">
                  {filteredPendingUsers.length === 0 ? (
                    <div className="text-center text-slate-500 py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      <CheckCircle className="w-12 h-12 mx-auto text-emerald-400 mb-3" />
                      <h3 className="text-lg font-black text-slate-800">All caught up!</h3>
                      <p className="text-sm font-medium">No pending {verificationFilter !== 'All' ? verificationFilter.toLowerCase() : ''} verifications at the moment.</p>
                    </div>
                  ) : (
                    filteredPendingUsers.map(user => (
                      <div key={user._id} className="p-4 bg-white rounded-xl border border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-sm hover:border-indigo-100 transition-all">

                        <div className="flex items-center gap-4 w-full lg:w-1/3">
                          <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-lg flex-shrink-0 border border-indigo-100">
                            {getInitials(user.name)}
                          </div>
                          <div className="flex flex-col justify-center min-w-0">
                            <h3 className="text-[15px] font-black text-slate-900 uppercase tracking-wide truncate">{user.name}</h3>
                            <p className="text-[13px] text-slate-500 font-medium truncate">{user.email}</p>
                          </div>
                        </div>

                        <div className="flex flex-col lg:items-center justify-center w-full lg:w-1/5 pt-2 lg:pt-0">
                          <span className={`px-3 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest border w-max mb-1.5 ${user.userType === 'Institute' ? 'bg-rose-50 text-rose-700 border-rose-200' : user.userType === 'Official' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-teal-50 text-[#059669] border-[#A7F3D0]'}`}>
                            {user.designation || user.userType || 'STUDENT'}
                          </span>
                          <p className="text-[11px] font-bold text-slate-500 uppercase">Reg No: <span className="text-slate-900 font-black">{user.registrationNo || 'N/A'}</span></p>
                        </div>

                        <div className="flex items-center lg:justify-center w-full lg:w-[15%] pt-1 lg:pt-0">
                          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                            BRANCH: <span className="text-indigo-600 ml-1 font-black">{user.branch || 'N/A'}</span>
                          </p>
                        </div>

                        <div className="flex items-center justify-end gap-2 w-full lg:w-auto flex-shrink-0 mt-3 lg:mt-0">
                          <button
                            onClick={() => handleVerify(user._id, 'reject', user.name)}
                            className="px-5 py-2.5 bg-white border border-rose-200 hover:bg-rose-50 text-rose-600 rounded-xl text-[11px] font-black flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                          >
                            <XCircle size={14} /> Reject
                          </button>
                          <button
                            onClick={() => handleVerify(user._id, 'approve', user.name)}
                            className="px-5 py-2.5 bg-[#10B981] hover:bg-[#059669] border border-emerald-500 text-white rounded-xl text-[11px] font-black flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                          >
                            <CheckCircle size={14} /> Approve User
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* USER DIRECTORY TAB */}
            {activeTab === 'users' && (
              <div className="flex flex-col h-full w-full" onClick={() => setOpenMenuId(null)}>
                <div className="flex flex-col gap-3">
                  {filteredUsers.length === 0 ? (
                    <div className="text-center text-slate-500 py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      <Users className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                      <h3 className="text-lg font-black text-slate-800">No users found</h3>
                      <p className="text-sm font-medium">Try adjusting your search query or filter.</p>
                    </div>
                  ) : (
                    filteredUsers.map(user => {
                      const effectiveDesignation = user.designation || user.userType || 'Student';
                      
                      // 🟢 LOGIC EVALUATORS
                      const isTeacher = user.userType === 'Teacher';
                      const isStudent = user.userType === 'Student';
                      const isOfficialOrOther = !isTeacher && !isStudent;

                      // A teacher is "Pending" if their designation is exactly "Teacher" (the default claim)
                      const isPendingHodApproval = isTeacher && (!user.designation || user.designation === "Teacher");

                      // They are "Appointed" if they have an upgraded role OR if they are a Teacher with a real title
                      const isAppointed = (user.role !== 'user' && user.role !== 'student') || (isTeacher && !isPendingHodApproval);

                      return (
                        <div key={user._id} className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-indigo-100 transition-all relative grid grid-cols-1 md:grid-cols-12 gap-4 items-center">

                          {/* Column 1: Avatar & Name */}
                          <div className="col-span-1 md:col-span-4 flex items-center gap-4 min-w-0">
                            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-lg flex-shrink-0 border border-slate-200">
                              {getInitials(user.name)}
                            </div>
                            <div className="flex flex-col justify-center min-w-0">
                              <h3 className="text-[15px] font-black text-slate-900 uppercase tracking-wide truncate">{user.name || 'Unknown User'}</h3>
                              <p className="text-[13px] text-slate-500 font-medium truncate">{user.email || 'No email provided'}</p>
                            </div>
                          </div>

                          {/* Column 2: Badge & Registration Info */}
                          <div className="col-span-1 md:col-span-3 flex flex-col md:items-center justify-center pt-3 md:pt-0">
                            <span className={`px-3 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest border w-max mb-1.5 ${effectiveDesignation !== "Student" && effectiveDesignation !== "Official" && effectiveDesignation !== "Teacher" && effectiveDesignation !== "Member" ? 'bg-amber-50 text-amber-700 border-amber-200' : user.userType === 'Institute' ? 'bg-rose-50 text-rose-700 border-rose-200' : user.userType === 'Official' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-teal-50 text-[#059669] border-[#A7F3D0]'}`}>
                              {effectiveDesignation}
                            </span>
                            <p className="text-[12px] font-bold text-slate-500">Reg No: <span className="text-slate-900">{user.registrationNo || 'N/A'}</span></p>
                          </div>

                          {/* Column 3: Branch Details */}
                          <div className="col-span-1 md:col-span-2 flex items-center md:justify-center pt-1 md:pt-0">
                            <p className="text-[12px] font-bold text-slate-500 uppercase tracking-wide">
                              Branch: <span className="text-indigo-600 ml-1">{user.branch || 'N/A'}</span>
                            </p>
                          </div>

                          {/* Column 4: Status / Actions Menu */}
                          <div className="col-span-1 md:col-span-3 flex items-center justify-end gap-2 mt-3 md:mt-0 relative">
                            
                            {/* 🟢 DYNAMIC UI BASED ON USER TYPE */}
                            {isStudent ? null : isPendingHodApproval ? (
                               <span className="text-[10px] font-bold text-amber-500 bg-amber-50 px-2 py-1 rounded-md border border-amber-200 uppercase tracking-wider whitespace-nowrap">
                                 Pending HOD
                               </span>
                            ) : isOfficialOrOther && !isAppointed ? (
                              <button
                                onClick={(e) => { e.stopPropagation(); handleOpenAppointModal({ ...user, designation: effectiveDesignation }); }}
                                className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-[11px] font-black flex items-center gap-1.5 transition-colors shadow-sm whitespace-nowrap"
                              >
                                <Award size={14} /> Appoint
                              </button>
                            ) : (
                                <div className="px-4 py-2 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-xl text-[11px] font-black flex items-center gap-1.5 shadow-sm select-none cursor-default uppercase tracking-wider whitespace-nowrap">
                                  <ShieldCheck size={14} /> Active
                                </div>
                            )}

                            <div className="relative ml-2">
                              <button onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === user._id ? null : user._id); }} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-800 transition-colors"><MoreVertical size={20} /></button>

                              {openMenuId === user._id && (
                                <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 z-10 animate-in fade-in zoom-in-95 duration-100 overflow-hidden">
                                  
                                  {/* 🟢 PROMOTE MENU: Only for Teachers OR Appointed Officials */}
                                  {((isTeacher && isAppointed) || (isOfficialOrOther && isAppointed)) && (
                                    <>
                                      <button
                                        className="w-full flex items-center gap-2 text-left px-4 py-2.5 text-sm font-bold text-emerald-600 hover:bg-emerald-50 transition-colors"
                                        onClick={(e) => { e.stopPropagation(); handleOpenPromoteModal(user); }}
                                      >
                                        <ArrowUpCircle size={16} /> Promote User
                                      </button>
                                      <div className="h-px bg-slate-100 my-1"></div>
                                    </>
                                  )}

                                  <button className="w-full text-left px-4 py-2.5 text-sm font-bold text-rose-600 hover:bg-rose-50 transition-colors" onClick={(e) => { e.stopPropagation(); alert(`Suspend account - Coming soon`); setOpenMenuId(null); }}>Suspend Account</button>
                                </div>
                              )}
                            </div>
                          </div>
                          
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {activeTab === 'departments' && <DepartmentManagement users={users} />}
            {activeTab === 'management' && <CampusManagement users={users} existingClubs={existingClubs} fetchAdminData={fetchAdminData} />}

          </div>
        </div>
      </div>

      {/* 🟢 SMART MODAL: Handles BOTH Appoint and Promote */}
      {roleModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-200">

            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-black text-slate-900 leading-tight">
                  {roleModal.actionType === 'appoint' ? 'Confirm Appointment' : 'Promote User'}
                </h2>
                <p className="text-xs font-bold text-slate-500 mt-1">
                  {roleModal.actionType === 'appoint' ? 'Grant system access for their requested role.' : 'Upgrade their system access and designation.'}
                </p>
              </div>
              <button onClick={() => setRoleModal({ isOpen: false, targetUser: null })} className="p-2 bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-600 rounded-xl transition-colors"><X size={18} /></button>
            </div>

            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-lg flex-shrink-0">
                {getInitials(roleModal.targetUser?.name)}
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900">{roleModal.targetUser?.name}</h3>
                <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mt-0.5">Current: {roleModal.targetUser?.designation || roleModal.targetUser?.userType}</p>
              </div>
            </div>

            <form onSubmit={handleRoleSubmit} className="space-y-4">

              {roleModal.actionType === 'appoint' ? (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm font-medium text-slate-600">
                  By confirming, you are granting this user official system access as an <span className="font-bold text-slate-900">{roleModal.targetUser?.designation}</span>.
                </div>
              ) : (
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Select New Designation</label>
                  <select
                    required
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 font-bold text-slate-700 cursor-pointer"
                    value={promotionRole}
                    onChange={e => setPromotionRole(e.target.value)}
                  >
                    <option value="">-- Choose Role --</option>

                    <optgroup label="Academic Administration">
                      <option value="Director">Director</option>
                      <option value="Dean">Dean</option>
                      <option value="HOD">HOD</option>
                      <option value="Head Master">Head Master</option>
                    </optgroup>
                    <optgroup label="Faculty">
                      <option value="Professor">Professor</option>
                      <option value="Associate Professor">Associate Professor</option>
                      <option value="Assistant Professor">Assistant Professor</option>
                      <option value="Teacher">Teacher</option>
                      <option value="Faculty Member">Faculty Member</option>
                    </optgroup>
                    <optgroup label="Institute Operations">
                      <option value="Registrar">Registrar</option>
                      <option value="Librarian">Librarian</option>
                      <option value="Accountant">Accountant</option>
                      <option value="System Admin">IT / System Admin</option>
                      <option value="Lab Assistant">Lab Assistant</option>
                      <option value="Clerk">Clerk</option>
                      <option value="Support Staff">Support Staff</option>
                    </optgroup>
                    <optgroup label="Demote / Remove Powers">
                      <option value="Student">Demote to Standard Student</option>
                    </optgroup>
                  </select>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting || (roleModal.actionType === 'promote' && !promotionRole)}
                className="w-full py-3.5 bg-emerald-600 text-white font-extrabold rounded-xl hover:bg-emerald-700 shadow-md transition-colors mt-6 flex justify-center items-center gap-2 disabled:opacity-50 active:scale-95"
              >
                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Award size={16} />}
                {roleModal.actionType === 'appoint' ? 'Confirm Appointment' : 'Execute Promotion'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Admin;