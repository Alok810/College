import React, { useState, useEffect, memo } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAdminStats, getAdminUsers } from '../api';
import { ShieldAlert, ShieldCheck, Users, BarChart3, GraduationCap, Building2, Search, Settings } from 'lucide-react';

// --- Dashboard Cards Component ---
const StatCard = memo(({ title, count, icon: Icon, colorClass }) => (
  <div className="bg-white p-4 sm:p-5 rounded-[1rem] sm:rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
    <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${colorClass}`}>
      <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
    </div>
    <div>
      <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider">{title}</p>
      <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900">{count || 0}</h3>
    </div>
  </div>
));

// --- Access Denied Component ---
const AccessDenied = () => (
  <div className="flex flex-col items-center justify-center h-full w-full p-6 text-center">
    <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-6 border-4 border-red-100">
      <ShieldAlert className="w-12 h-12 text-red-500" />
    </div>
    <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">Restricted Area</h1>
    <p className="text-gray-500 max-w-md text-sm sm:text-base">
      This control panel is strictly reserved for registered <span className="font-bold text-purple-600">Institute Administrators</span>. Your account does not have the required permissions.
    </p>
  </div>
);

const Admin = () => {
  const { authData, loading } = useAuth();
  
  // Strict check: Only allow 'Institute' userType or explicit 'admin' role
  const isInstituteAdmin = authData?.userType === 'Institute' || authData?.role === 'admin';

  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (loading || !isInstituteAdmin) return;

    const fetchAdminData = async () => {
      try {
        const statsData = await getAdminStats();
        setStats(statsData);
        
        const usersData = await getAdminUsers();
        setUsers(usersData);
      } catch (error) {
        console.error("Failed to load admin data", error);
      }
    };

    fetchAdminData();
  }, [loading, isInstituteAdmin]);

  if (loading) return null; // Or a loading spinner

  // If not an admin, block access entirely
  if (!isInstituteAdmin) {
    return (
      <div className="flex flex-col items-center h-full w-full overflow-hidden pt-4">
        <div className="flex flex-col w-[94%] sm:w-full max-w-4xl mx-auto h-full bg-white rounded-[2rem] shadow-sm border border-gray-100">
           <AccessDenied />
        </div>
      </div>
    );
  }

  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col items-center h-full w-full max-w-[100vw] overflow-x-hidden pb-0 sm:pb-2 pt-1 sm:pt-2">
      <div className="flex flex-col w-[94%] sm:w-full max-w-5xl mx-auto h-full min-h-0 gap-2 sm:gap-3">
        
        {/* Admin Header */}
        <div className="flex-shrink-0 flex items-center justify-between bg-white p-3 sm:p-6 rounded-[1.25rem] sm:rounded-[2rem] shadow-sm border border-gray-100 w-full">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-[0.8rem] sm:rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-inner flex-shrink-0">
              <ShieldCheck className="text-white w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="overflow-hidden">
              <h1 className="text-xl sm:text-3xl font-extrabold text-gray-900 tracking-tight leading-none truncate">
                Institute Portal
              </h1>
              <p className="text-[10px] sm:text-sm text-gray-500 font-medium mt-0.5 sm:mt-1 truncate">
                {authData?.instituteName || "Central Administration"}
              </p>
            </div>
          </div>
          <div className="text-right flex-shrink-0 bg-indigo-50 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl border border-indigo-100">
             <span className="text-[8px] sm:text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">Role</span>
             <p className="font-extrabold text-indigo-700 text-xs sm:text-sm">Admin</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex-shrink-0 w-full sm:w-max sm:mx-auto overflow-hidden sm:bg-white sm:p-1.5 sm:rounded-[1.25rem] sm:shadow-sm sm:border sm:border-gray-100">
          <div className="flex overflow-x-auto custom-scrollbar snap-x snap-mandatory gap-1.5 sm:gap-1 pb-1 sm:pb-0 sm:justify-center">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'users', label: 'Directory' },
              { id: 'settings', label: 'Settings' }
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)} 
                className={`snap-start whitespace-nowrap px-4 py-2 sm:px-6 sm:py-2.5 rounded-[0.8rem] sm:rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 flex-shrink-0 ${activeTab === tab.id ? 'bg-gray-900 text-white shadow-md' : 'bg-white sm:bg-transparent border border-gray-100 sm:border-none text-gray-600 hover:bg-gray-200'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Content Area */}
        <div className="flex-1 bg-white shadow-sm sm:shadow-inner rounded-[1.25rem] sm:rounded-[1.5rem] p-2.5 sm:p-6 border border-gray-100 sm:border-none flex flex-col min-h-0 overflow-hidden w-full">
          
          {activeTab === 'overview' && (
            <div className="flex flex-col h-full w-full min-h-0 overflow-y-auto custom-scrollbar">
              <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 mb-4 sm:mb-6 pl-1">Network Overview</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 w-full">
                <StatCard title="Total Users" count={stats?.totalUsers} icon={Users} colorClass="bg-gradient-to-br from-blue-400 to-blue-600" />
                <StatCard title="Students" count={stats?.students} icon={GraduationCap} colorClass="bg-gradient-to-br from-teal-400 to-teal-600" />
                <StatCard title="Officials" count={stats?.officials} icon={BarChart3} colorClass="bg-gradient-to-br from-purple-400 to-purple-600" />
                <StatCard title="Institutes" count={stats?.institutes} icon={Building2} colorClass="bg-gradient-to-br from-rose-400 to-rose-600" />
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="flex flex-col h-full w-full min-h-0 overflow-hidden sm:bg-gray-50 sm:p-6 sm:rounded-2xl sm:shadow-inner">
              <div className="flex-shrink-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-3 mb-3 sm:mb-6 w-full">
                <h2 className="text-base sm:text-xl font-extrabold text-gray-900 hidden sm:block">User Directory</h2>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 sm:py-2 bg-gray-50 sm:bg-white border border-gray-200 rounded-[0.8rem] focus:ring-2 focus:ring-indigo-300 outline-none text-sm"
                  />
                </div>
              </div>
              
              {/* User List */}
              <div className="flex-1 min-h-0 w-full overflow-y-auto custom-scrollbar pr-1">
                <div className="flex flex-col gap-2.5 sm:gap-3 pb-4">
                  {filteredUsers.length === 0 ? (
                     <div className="text-center text-gray-500 py-10 bg-white rounded-2xl border border-gray-100 flex-shrink-0">
                       <Users className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-gray-300 mb-2" />
                       <p className="text-sm sm:text-base">No users found.</p>
                     </div>
                  ) : (
                    filteredUsers.map(user => (
                      <div key={user._id} className="p-3 sm:p-4 bg-white rounded-[1rem] sm:rounded-xl shadow-sm border border-gray-100 flex items-center justify-between gap-3 w-full flex-shrink-0 hover:border-indigo-200 transition-colors">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-gray-600">
                            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div className="overflow-hidden">
                            <h3 className="text-sm sm:text-base font-bold text-gray-900 truncate leading-tight">{user.name || user.instituteName}</h3>
                            <p className="text-[10px] sm:text-xs text-gray-500 truncate">{user.email || user.instituteEmail}</p>
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          <span className={`px-2 py-1 rounded-md text-[9px] sm:text-[10px] font-bold uppercase tracking-wider border ${
                            user.userType === 'Institute' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                            user.userType === 'Official' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                            'bg-teal-50 text-teal-700 border-teal-200'
                          }`}>
                            {user.userType || 'Student'}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
             <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <Settings className="w-12 h-12 mb-3 opacity-50" />
                <p className="font-medium text-sm">System configuration coming soon.</p>
             </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Admin;