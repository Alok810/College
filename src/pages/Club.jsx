import React, { useState, useEffect, memo } from "react";
import { Link } from "react-router-dom";
import { 
  Tent, Trophy, Palette, Cpu, Users, Star, MessageSquare, Award, 
  LayoutDashboard, Megaphone, CheckCircle, ChevronRight, ChevronLeft, Globe, Clock, Check, X, Plus, Trash2,
  Calendar, MapPin, Settings, Edit3, UserPlus, LogOut, Shield, Building2, Info, Hash, Activity, ShieldAlert, ArrowRightLeft, Search
} from "lucide-react";
import RequireVerification from "../components/RequireVerification";
import { useAuth } from "../context/AuthContext";
import { fetchCampusClubs, requestJoinClub, handleClubRequest, promoteClubMember, fetchCampusEvents, createEvent, removeClubMember, addClubRole, createClub, transferClubLeadership, searchUsers } from "../api"; 

const getAvatar = (name) => `https://ui-avatars.com/api/?name=${name || 'User'}&background=EEF2FF&color=4F46E5`;

const getClubIcon = (category) => {
    if (category === 'Technical') return Cpu;
    if (category === 'Cultural') return Palette;
    if (category === 'Sports') return Trophy;
    if (category === 'Literary') return Globe;
    return Tent;
};

const StatCard = memo(({ title, count, icon: Icon, colorClass }) => (
  <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 hover:border-indigo-300 transition-colors">
    <div className={`w-12 h-12 rounded-[0.8rem] flex items-center justify-center flex-shrink-0 ${colorClass}`}><Icon className="w-6 h-6 text-white" /></div>
    <div><p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">{title}</p><h3 className="text-xl sm:text-2xl font-black text-slate-900">{count || 0}</h3></div>
  </div>
));

const ClubCard = ({ club, authData, onJoinRequest, onLeaveClub, onViewDetails }) => {
  const ClubIcon = getClubIcon(club.category);
  let colorClass = "bg-slate-100 text-slate-600";
  if (club.category === 'Technical') colorClass = "bg-blue-100 text-blue-600";
  if (club.category === 'Cultural') colorClass = "bg-purple-100 text-purple-600";
  if (club.category === 'Sports') colorClass = "bg-amber-100 text-amber-600";
  if (club.category === 'Literary') colorClass = "bg-rose-100 text-rose-600";

  const isChairperson = club.chairperson?._id === authData?._id;
  const isPresident = club.president?._id === authData?._id;
  const isLeader = isChairperson || isPresident;
  const isMember = club.members?.some(m => (m._id || m) === authData?._id);
  const isPending = club.pendingRequests?.some(p => (p._id || p) === authData?._id);

  return (
    <div 
      onClick={() => onViewDetails(club._id)}
      className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex flex-col transition-all hover:shadow-md hover:border-indigo-300 group cursor-pointer"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex gap-2 items-center">
            <div className={`p-3 rounded-xl ${colorClass}`}><ClubIcon className="w-6 h-6" /></div>
            {club.parentClub && (
                <span className="text-[9px] font-bold text-slate-400 border border-slate-200 px-1.5 py-0.5 rounded uppercase max-w-[80px] truncate">
                    Sub of: {club.parentClub.name}
                </span>
            )}
        </div>
        <span className="bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider">{club.category}</span>
      </div>
      <h3 className="font-black text-slate-900 text-lg leading-tight mb-1 group-hover:text-indigo-600 transition-colors">{club.name}</h3>
      <p className="text-xs font-medium text-slate-500 mb-4 line-clamp-2 flex-grow">{club.description}</p>
      
      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <div className="flex items-center gap-2">
           {club.president && (<img src={club.president.profilePicture || getAvatar(club.president.name)} alt="President" className="w-6 h-6 rounded-full border border-slate-200" title={`President: ${club.president.name}`} />)}
           <span className="text-[10px] font-bold text-slate-500">{club.members?.length || 1} Members</span>
        </div>
        
        {isLeader ? (
            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded flex items-center gap-1"><Shield size={12}/> Leadership</span>
        ) : isMember ? (
            <button onClick={(e) => { e.stopPropagation(); onLeaveClub(club._id, authData._id, authData.name, true); }} className="text-[10px] font-bold text-rose-600 hover:text-rose-800 transition-colors flex items-center gap-1 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg z-10 relative">
                <LogOut size={12}/> Leave
            </button>
        ) : isPending ? (
            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded flex items-center gap-1"><Clock size={12}/> Pending</span>
        ) : (
            <button onClick={(e) => { e.stopPropagation(); onJoinRequest(club._id); }} className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg z-10 relative">Join <ChevronRight size={14} /></button>
        )}
      </div>
    </div>
  )
};

const LeaderCard = ({ user }) => (
  <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex flex-col items-center text-center transition-all hover:shadow-md hover:border-indigo-300 group">
    <div className="relative mb-3">
      <img src={user.profilePicture || getAvatar(user.name)} alt={user.name} className="w-16 h-16 rounded-full object-cover border-4 border-slate-50 shadow-sm group-hover:scale-105 transition-transform duration-300" />
      <div className="absolute -bottom-1 -right-1 bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-full p-1 shadow-sm"><Award size={12} /></div>
    </div>
    <h3 className="font-black text-slate-900 text-base leading-tight truncate w-full">{user.name}</h3>
    <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded mt-1.5 uppercase tracking-widest">{user.designation}</span>
    <div className="w-full mt-4 pt-3 border-t border-slate-100 flex gap-2">
      <Link to={`/?open_chat=${user._id}`} className="flex-1 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"><MessageSquare size={14} /> Message</Link>
    </div>
  </div>
);

const EventCard = ({ event }) => {
    const eventDate = new Date(event.date);
    const month = eventDate.toLocaleString('default', { month: 'short' });
    const day = eventDate.getDate();

    return (
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:border-indigo-300 transition-all flex flex-col gap-3 group">
            <div className="flex justify-between items-start">
                <span className="bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-widest truncate max-w-[150px]">{event.club?.name || 'Campus Event'}</span>
                <div className="bg-slate-50 border border-slate-100 rounded-lg px-2 py-1 text-center min-w-[50px] shadow-sm group-hover:bg-indigo-600 transition-colors">
                    <p className="text-[10px] font-bold text-slate-400 uppercase leading-none group-hover:text-indigo-200">{month}</p>
                    <p className="text-lg font-black text-indigo-600 leading-none mt-1 group-hover:text-white">{day}</p>
                </div>
            </div>
            <div>
                <h3 className="font-black text-slate-900 text-lg leading-tight">{event.title}</h3>
                <p className="text-xs font-medium text-slate-500 mt-1 line-clamp-2">{event.description}</p>
            </div>
            <div className="mt-auto pt-4 border-t border-slate-100 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-600"><Clock size={14} className="text-slate-400" /> {event.time}</div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-600"><MapPin size={14} className="text-slate-400" /> {event.venue}</div>
            </div>
        </div>
    )
};

export default function Club() {
  const { authData, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0); 

  const [clubs, setClubs] = useState([]);
  const [events, setEvents] = useState([]); 
  const [selectedManageClubId, setSelectedManageClubId] = useState(null);
  const [selectedCouncilClubId, setSelectedCouncilClubId] = useState(null); 
  
  const [viewingClubId, setViewingClubId] = useState(null); 
  const [rosterFilter, setRosterFilter] = useState('all'); 

  const [promoteModal, setPromoteModal] = useState({ isOpen: false, studentId: null, studentName: '' });
  const [selectedRole, setSelectedRole] = useState("");

  const [showEventModal, setShowEventModal] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', description: '', date: '', time: '', venue: '' });

  const [newRoleModal, setNewRoleModal] = useState({ isOpen: false, title: '', seats: 1 });
  
  const [showSubClubModal, setShowSubClubModal] = useState(false);
  const [newSubClub, setNewSubClub] = useState({ name: '', description: '', presidentId: '' });

  const [transferModal, setTransferModal] = useState({ isOpen: false, roleType: '' });
  const [newLeaderId, setNewLeaderId] = useState("");
  
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const loadCampusData = async () => {
        try {
            const [clubsRes, eventsRes] = await Promise.all([
                fetchCampusClubs(),
                fetchCampusEvents().catch(() => ({ events: [] })) 
            ]);

            if (clubsRes.success) {
                setClubs(clubsRes.clubs);
                if (clubsRes.clubs.length > 0) {
                    setSelectedCouncilClubId(clubsRes.clubs[0]._id);
                }
            }
            if (eventsRes?.success) setEvents(eventsRes.events);
        } catch (error) { console.error("Failed to load campus data:", error); } finally { setLoading(false); }
    };
    if (!authLoading) loadCampusData();
  }, [authLoading, refreshTrigger]);

  useEffect(() => {
      setViewingClubId(null);
  }, [activeTab]);

  const handleRequestJoin = async (clubId) => {
    try { await requestJoinClub(clubId); alert("Request sent successfully! Awaiting approval from the Leadership team."); setRefreshTrigger(prev => prev + 1); } 
    catch (error) { alert(error.message || "Failed to send request."); }
  };

  const handleApproveReject = async (clubId, studentId, action, studentName) => {
      if (!window.confirm(action === 'approve' ? `Approve ${studentName}?` : `Reject ${studentName}?`)) return;
      try { await handleClubRequest(clubId, studentId, action); setRefreshTrigger(prev => prev + 1); } 
      catch (error) { alert("Failed to process request."); }
  };

  const submitPromotion = async () => {
      if (!selectedRole) return alert("Please select a role.");
      try {
          await promoteClubMember(myClub._id, promoteModal.studentId, selectedRole);
          alert(`Success! ${promoteModal.studentName} is now the ${selectedRole}.`);
          setPromoteModal({ isOpen: false, studentId: null, studentName: '' }); setSelectedRole(""); setRefreshTrigger(prev => prev + 1); 
      } catch (error) { alert(error.message || "Failed to promote member."); }
  };

  const handleCreateEventSubmit = async (e) => {
      e.preventDefault();
      try {
          await createEvent({ ...newEvent, clubId: myClub._id });
          alert("Event broadcasted successfully!"); setShowEventModal(false); setNewEvent({ title: '', description: '', date: '', time: '', venue: '' }); setRefreshTrigger(prev => prev + 1);
      } catch (error) { alert(error.message || "Failed to broadcast event."); }
  };

  const handleLeaveOrRemove = async (clubId, studentId, studentName, isSelf) => {
      const confirmMsg = isSelf ? "Are you sure you want to leave this club? You will be removed from the club chat." : `Are you sure you want to remove ${studentName}?`;
      if (!window.confirm(confirmMsg)) return;
      try { await removeClubMember(clubId, isSelf ? null : studentId); alert(isSelf ? "You have successfully left the club." : `${studentName} was removed from the club.`); setRefreshTrigger(prev => prev + 1); } 
      catch (error) { alert(error.message || "Failed to remove member."); }
  };

  const handleAddRoleSubmit = async (e) => {
      e.preventDefault();
      try {
          await addClubRole(myClub._id, { title: newRoleModal.title, seats: newRoleModal.seats });
          alert(`Success! ${newRoleModal.title} post has been created.`);
          setNewRoleModal({ isOpen: false, title: '', seats: 1 });
          setRefreshTrigger(prev => prev + 1);
      } catch (error) {
          alert(error.message || "Failed to create post.");
      }
  };

  const handleCreateSubClubSubmit = async (e) => {
      e.preventDefault();
      if (!newSubClub.presidentId) return alert("Please appoint a student president from your current members.");
      try {
          await createClub({
              name: newSubClub.name,
              description: newSubClub.description,
              category: myClub.category || 'Other',
              presidentId: newSubClub.presidentId,
              chairpersonId: authData._id, 
              parentClubId: myClub._id, 
              availableRoles: [{ title: 'Vice President', seats: 1 }, { title: 'Treasurer', seats: 1 }]
          });
          alert("Sub-Club created successfully!");
          setShowSubClubModal(false);
          setNewSubClub({ name: '', description: '', presidentId: '' });
          setRefreshTrigger(prev => prev + 1);
      } catch (error) {
          alert(error.message || "Failed to create sub-club.");
      }
  };

  // ✅ NEW: Trigger default search on input click so it's not empty!
  const handleFocusOfficialSearch = async () => {
      if (searchQuery.length > 0 || searchResults.length > 0) return;
      setIsSearching(true);
      try {
          // Send empty query to fetch a default list of all users
          const res = await searchUsers("");
          const data = res.users || res.data || res || [];
          
          const officials = data.filter(u => {
              const type = (u.userType || "").toLowerCase();
              return ['official', 'institute', 'teacher', 'other'].includes(type);
          });
          
          // Show top 5 default suggestions immediately
          setSearchResults(officials.slice(0, 5));
      } catch (error) {
          console.error("Default search failed:", error);
      } finally {
          setIsSearching(false);
      }
  };

  const handleSearchOfficial = async (e) => {
      const query = e.target.value;
      setSearchQuery(query);
      
      if (query.length >= 1) {
          setIsSearching(true);
          try {
              const res = await searchUsers(query);
              const data = res.users || res.data || res || [];
              const officials = data.filter(u => {
                  const type = (u.userType || "").toLowerCase();
                  return ['official', 'institute', 'teacher', 'other'].includes(type);
              });
              setSearchResults(officials);
          } catch (error) {
              console.error("Search failed:", error);
          } finally {
              setIsSearching(false);
          }
      } else {
          // If they backspace to empty, re-trigger the default suggestions
          handleFocusOfficialSearch();
      }
  };

  const handleTransferLeadership = async (e) => {
      e.preventDefault();
      if (!newLeaderId) return alert("Please select a successor.");
      if (!window.confirm(`Are you sure you want to transfer the ${transferModal.roleType} role? You will lose your current privileges immediately.`)) return;

      try {
          await transferClubLeadership(myClub._id, { newLeaderId, roleToTransfer: transferModal.roleType.toLowerCase() });
          alert(`Leadership transferred successfully!`);
          setTransferModal({ isOpen: false, roleType: '' });
          setNewLeaderId("");
          setSearchQuery("");
          setSearchResults([]);
          setRefreshTrigger(prev => prev + 1);
      } catch(error) {
          alert(error.message || "Failed to transfer leadership");
      }
  };

  if (authLoading || loading) return <div className="flex items-center justify-center h-full w-full"><div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div></div>;

  const isInstituteAdmin = authData?.userType === 'Institute' || authData?.role === 'admin';
  const manageableClubs = isInstituteAdmin ? clubs : clubs.filter(club => 
      (club.president && String(club.president._id) === String(authData?._id)) || 
      (club.chairperson && String(club.chairperson._id) === String(authData?._id))
  );

  const hasManageAccess = manageableClubs.length > 0;
  const myClub = selectedManageClubId ? manageableClubs.find(c => c._id === selectedManageClubId) || manageableClubs[0] : manageableClubs[0];

  const isMyClubChairperson = myClub?.chairperson?._id === authData?._id;
  const isMyClubPresident = myClub?.president?._id === authData?._id;
  const isIndependentClub = !myClub?.chairperson; 
  const isSubClub = !!myClub?.parentClub; 
  
  const canAssignUsers = isInstituteAdmin || isMyClubChairperson || isMyClubPresident; 
  const canCreateSubClubs = !isIndependentClub && !isSubClub && (isInstituteAdmin || isMyClubChairperson);

  let canCreatePosts = false;
  if (isIndependentClub) {
      canCreatePosts = isInstituteAdmin; 
  } else {
      canCreatePosts = isMyClubChairperson; 
  }

  const eligibleSubClubPresidents = myClub?.members?.filter(m => String(m._id) !== String(myClub.chairperson?._id)) || [];

  const councilArray = Array.from(new Set(clubs.map(c => c.president).filter(admin => admin != null).map(a => a._id))).map(id => clubs.map(c => c.president).find(a => a?._id === id));
  const totalCouncilCount = councilArray.length;

  const activeCouncilClub = clubs.find(c => c._id === selectedCouncilClubId) || clubs[0];
  const topLevelClubs = clubs.filter(c => !c.parentClub || !clubs.some(p => p._id === (typeof c.parentClub === 'object' ? c.parentClub._id : c.parentClub)));

  const hierarchyChairperson = activeCouncilClub?.chairperson;
  const hierarchyPresident = activeCouncilClub?.president;
  const hierarchyCore = activeCouncilClub?.coreTeam?.filter(c => c.user) || [];
  
  const totalMembersInCouncil = (hierarchyChairperson ? 1 : 0) + (hierarchyPresident ? 1 : 0) + hierarchyCore.length;

  const activeDetailClub = clubs.find(c => c._id === viewingClubId);
  const activeClubEvents = activeDetailClub ? events.filter(e => (e.club?._id || e.club) === activeDetailClub._id) : [];
  const activeClubSubClubs = activeDetailClub ? clubs.filter(c => (c.parentClub?._id || c.parentClub) === activeDetailClub._id) : [];

  const tabs = [
    { id: 'overview', label: 'Campus Overview', icon: LayoutDashboard },
    { id: 'council', label: 'Council', icon: Star },
    { id: 'clubs', label: `Clubs & Societies (${clubs.length})`, icon: Tent }
  ];
  if (hasManageAccess) tabs.push({ id: 'manage', label: isInstituteAdmin ? 'Manage Clubs' : 'Manage My Club', icon: Settings });
  const activeTabContext = tabs.find(t => t.id === activeTab);
  const ActiveIcon = activeTabContext?.icon || Tent;

  return (
    <RequireVerification>
      <div className="flex flex-col items-center h-full w-full max-w-[100vw] overflow-x-hidden pb-20 sm:pb-2 pt-1 sm:pt-2">
        <div className="flex flex-col w-[94%] sm:w-full max-w-6xl mx-auto h-full min-h-0 gap-2 sm:gap-3 relative">
          
          <div className="flex-shrink-0 w-full md:w-max md:mx-auto overflow-hidden bg-white p-1.5 rounded-xl shadow-sm border border-slate-200 mt-2">
            <div className="flex gap-1 justify-center sm:justify-start overflow-x-auto custom-scrollbar">
              {tabs.map((tab, index) => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`relative px-3 sm:px-5 py-2.5 rounded-lg font-bold text-xs sm:text-sm transition-all whitespace-nowrap flex items-center gap-1.5 ${activeTab === tab.id ? 'bg-[#4F46E5] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}>
                  <span className={activeTab === tab.id ? 'text-indigo-200 font-extrabold' : 'text-slate-400 font-extrabold'}>{index + 1}.</span>{tab.label}
                  {tab.id === 'manage' && activeTab !== 'manage' && (<span className="absolute top-1 right-1 w-2 h-2 bg-indigo-500 rounded-full animate-pulse shadow-sm"></span>)}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 bg-white shadow-sm rounded-[1.5rem] p-4 sm:p-6 border border-slate-100 overflow-hidden flex flex-col min-h-0">
            
            {/* 🟢 DYNAMIC TOP HEADER */}
            <div className="relative flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 pb-4 mb-4 flex-shrink-0 gap-4">
              <div className="flex items-center gap-3">
                 {activeTab === 'clubs' && viewingClubId && activeDetailClub ? (
                     <>
                         <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-[0.8rem] bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center border border-indigo-200 shadow-sm">
                             {React.createElement(getClubIcon(activeDetailClub.category), { className: "text-indigo-600 w-5 h-5 sm:w-6 sm:h-6" })}
                         </div>
                         <div>
                             <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-none truncate max-w-[200px] sm:max-w-md">{activeDetailClub.name}</h1>
                             <p className="text-[10px] sm:text-xs text-slate-500 font-medium mt-0.5">{activeDetailClub.category} Club</p>
                         </div>
                     </>
                 ) : (
                     <>
                         <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-[0.8rem] bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center border border-indigo-200 shadow-sm">
                             <Tent className="text-indigo-600 w-5 h-5 sm:w-6 sm:h-6" />
                         </div>
                         <div>
                             <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-none">Campus Life</h1>
                             <p className="text-[10px] sm:text-xs text-slate-500 font-medium mt-0.5">Clubs, Societies & Leadership</p>
                         </div>
                     </>
                 )}
              </div>

              {/* CENTER SECTION (Title or Join Button) */}
              <div className="flex items-center justify-center z-20 md:absolute md:left-1/2 md:-translate-x-1/2 w-full md:w-auto">
                  {activeTab === 'clubs' && viewingClubId && activeDetailClub ? (
                      <div className="flex-shrink-0 w-full sm:w-auto mt-2 md:mt-0">
                          {activeDetailClub.chairperson?._id === authData?._id || activeDetailClub.president?._id === authData?._id ? (
                              <span className="w-full sm:w-auto px-5 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-center gap-2 shadow-sm"><Shield size={16}/> You are Leadership</span>
                          ) : activeDetailClub.pendingRequests?.some(p => (p._id || p) === authData?._id) ? (
                              <span className="w-full sm:w-auto px-5 py-2 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-center gap-2 shadow-sm"><Clock size={16}/> Request Pending</span>
                          ) : activeDetailClub.members?.some(m => (m._id || m) === authData?._id) ? (
                              <span className="w-full sm:w-auto px-5 py-2 text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center justify-center gap-2 shadow-sm"><CheckCircle size={16}/> Joined Member</span>
                          ) : (
                              <button onClick={() => handleRequestJoin(activeDetailClub._id)} className="w-full sm:w-auto px-8 py-2 text-sm font-black text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5">
                                  Join Club <ChevronRight size={16} />
                              </button>
                          )}
                      </div>
                  ) : (
                      <h2 className="text-lg sm:text-xl font-extrabold text-slate-800 hidden md:flex items-center gap-2 pointer-events-none"><ActiveIcon className="text-indigo-500 w-5 h-5" />{activeTabContext?.label.split(' (')[0]}</h2>
                  )}
              </div>

              {/* RIGHT ACCESS BADGE */}
              <div className="text-right bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 relative z-10 hidden sm:block">
                  <span className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Access</span>
                  <p className="font-extrabold text-[#4F46E5] text-xs sm:text-sm whitespace-nowrap">{isInstituteAdmin ? 'Admin' : 'Student'}</p>
              </div>
            </div>

            <div className={`flex-1 custom-scrollbar pr-1 flex flex-col min-h-0 ${activeTab === 'council' ? 'overflow-hidden' : 'overflow-y-auto'}`}>
              
              {/* --- 🟢 TAB 1: CAMPUS OVERVIEW --- */}
              {activeTab === 'overview' && (
                <div className="flex flex-col h-full w-full animate-in fade-in duration-300">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full mb-8">
                    <StatCard title="Active Clubs" count={clubs.length} icon={Tent} colorClass="bg-gradient-to-br from-emerald-400 to-emerald-600" />
                    <StatCard title="Council Members" count={totalCouncilCount} icon={Users} colorClass="bg-gradient-to-br from-blue-400 to-blue-600" />
                    <StatCard title="Upcoming Events" count={events.length} icon={Megaphone} colorClass="bg-gradient-to-br from-purple-400 to-purple-600" />
                  </div>
                  {events.length > 0 && (
                      <div className="mb-8">
                          <div className="flex items-center gap-3 mb-4"><div className="p-2 bg-purple-100 rounded-lg"><Calendar className="w-4 h-4 text-purple-600" /></div><h3 className="text-lg font-black text-slate-800">Upcoming Campus Events</h3></div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{events.slice(0, 3).map(event => <EventCard key={event._id} event={event} />)}</div>
                      </div>
                  )}
                  {clubs.length > 0 && (
                      <>
                        <div className="flex items-center gap-3 mb-4"><div className="p-2 bg-indigo-100 rounded-lg"><Star className="w-4 h-4 text-indigo-600" /></div><h3 className="text-lg font-black text-slate-800">Featured Communities</h3></div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{clubs.slice(0, 3).map(club => <ClubCard key={club._id} club={club} authData={authData} onJoinRequest={handleRequestJoin} onLeaveClub={handleLeaveOrRemove} onViewDetails={(id) => { setActiveTab('clubs'); setViewingClubId(id); }}/>)}</div>
                      </>
                  )}
                </div>
              )}

              {/* --- 🟢 TAB 2: COUNCIL --- */}
              {activeTab === 'council' && (
                <div className="flex flex-col flex-1 h-full w-full animate-in fade-in duration-300 min-h-0">
                  <div className="flex flex-col lg:flex-row gap-6 w-full flex-1 h-full min-h-0">
                     
                     <div className="w-full lg:w-[25%] h-full flex flex-col overflow-y-auto custom-scrollbar pr-2 pb-4">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 pl-2 flex-shrink-0">Institute Clubs Directory</h3>
                        
                        <div className="flex flex-col gap-3">
                           {topLevelClubs.map(parentClub => {
                              const ListIcon = getClubIcon(parentClub.category);
                              const clubSubClubs = clubs.filter(c => c.parentClub && (typeof c.parentClub === 'object' ? c.parentClub._id : c.parentClub) === parentClub._id);
                              
                              return (
                                <div key={parentClub._id} className="flex flex-col flex-shrink-0">
                                   <button 
                                     onClick={() => setSelectedCouncilClubId(parentClub._id)}
                                     className={`p-3 rounded-2xl text-left transition-all border ${selectedCouncilClubId === parentClub._id ? 'bg-indigo-600 border-indigo-600 shadow-md transform scale-[1.02]' : 'bg-slate-50 border-slate-100 hover:bg-slate-100 hover:border-slate-300'}`}
                                   >
                                      <div className="flex items-center gap-3">
                                         <div className={`p-2 rounded-xl flex-shrink-0 ${selectedCouncilClubId === parentClub._id ? 'bg-white/20 text-white' : 'bg-white border border-slate-200 text-slate-400'}`}>
                                            <ListIcon size={18} />
                                         </div>
                                         <div className="overflow-hidden">
                                            <p className={`text-sm font-black truncate ${selectedCouncilClubId === parentClub._id ? 'text-white' : 'text-slate-800'}`}>{parentClub.name}</p>
                                            <p className={`text-[9px] font-bold uppercase tracking-wider ${selectedCouncilClubId === parentClub._id ? 'text-indigo-200' : 'text-slate-400'}`}>{parentClub.category}</p>
                                         </div>
                                      </div>
                                   </button>

                                   {clubSubClubs.length > 0 && (
                                     <div className="flex flex-col gap-1.5 ml-6 pl-3 border-l-2 border-slate-200 mt-2 mb-1">
                                        {clubSubClubs.map(sub => (
                                           <button 
                                             key={sub._id}
                                             onClick={() => setSelectedCouncilClubId(sub._id)}
                                             className={`p-2.5 rounded-xl text-left transition-all flex items-center gap-2 border ${selectedCouncilClubId === sub._id ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm' : 'bg-transparent border-transparent text-slate-600 hover:bg-slate-100'}`}
                                           >
                                              <Building2 size={14} className={selectedCouncilClubId === sub._id ? 'text-indigo-600' : 'text-slate-400'} />
                                              <span className="text-xs font-bold truncate">{sub.name}</span>
                                           </button>
                                        ))}
                                     </div>
                                   )}
                                </div>
                              )
                           })}
                        </div>
                        
                        {clubs.length === 0 && (
                            <div className="p-5 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200 flex-shrink-0">
                                <p className="text-xs font-bold">No clubs established.</p>
                            </div>
                        )}
                     </div>

                     <div className="w-full lg:w-[75%] h-full flex flex-col overflow-y-auto custom-scrollbar bg-slate-50 rounded-[2rem] border border-slate-100 p-0 sm:p-0 relative">
                        <div className="p-5 sm:p-8 flex flex-col items-center w-full min-h-max pb-10 pt-4">
                           
                           {hierarchyChairperson && (
                              <div className="flex flex-col items-center w-full max-w-[280px] animate-in fade-in slide-in-from-top-4 duration-500">
                                 <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm z-10">Faculty Advisor</div>
                                 <div className="w-full relative">
                                    <LeaderCard user={{...hierarchyChairperson, designation: 'Chairperson / Faculty'}} />
                                 </div>
                              </div>
                           )}

                           {hierarchyChairperson && hierarchyPresident && (
                              <div className="w-0.5 h-8 bg-gradient-to-b from-indigo-200 to-indigo-400 my-2 rounded-full"></div>
                           )}

                           {hierarchyPresident && (
                              <div className="flex flex-col items-center w-full max-w-[280px] animate-in fade-in slide-in-from-top-4 duration-500 delay-100 fill-mode-both">
                                 <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm z-10">Student Head</div>
                                 <div className="w-full">
                                    <LeaderCard user={{...hierarchyPresident, designation: 'Student President'}} />
                                 </div>
                              </div>
                           )}

                           {hierarchyPresident && hierarchyCore.length > 0 && (
                               <div className="w-0.5 h-8 bg-gradient-to-b from-indigo-400 to-indigo-200 my-2 rounded-full"></div>
                           )}

                           {hierarchyCore.length > 0 && (
                              <div className="w-full mt-2 animate-in fade-in slide-in-from-top-4 duration-500 delay-200 fill-mode-both">
                                 <div className="flex justify-center w-full mb-6">
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-white px-4 py-1.5 rounded-full border border-slate-200 shadow-sm z-10">Core Council</div>
                                 </div>
                                 <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 w-full">
                                    {hierarchyCore.map(core => (
                                       <LeaderCard key={core.user._id} user={{...core.user, designation: core.roleTitle}} />
                                    ))}
                                 </div>
                              </div>
                           )}

                           {totalMembersInCouncil === 0 && (
                               <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200 shadow-sm mt-4 w-full">
                                  <Shield className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                  <h3 className="text-lg font-black text-slate-800 mb-1">No Leadership Assigned</h3>
                                  <p className="text-sm text-slate-500 font-medium">This club does not have any core council members yet.</p>
                               </div>
                           )}
                        </div>
                     </div>
                     
                  </div>
                </div>
              )}

              {/* --- 🟢 TAB 3: CLUBS & SOCIETIES --- */}
              {activeTab === 'clubs' && (
                <div className="flex flex-col w-full animate-in fade-in duration-300 h-full">
                  
                  {/* GRID VIEW */}
                  {!viewingClubId && (
                     <>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                          <p className="text-sm text-slate-500 font-medium">Discover and join official campus clubs and societies.</p>
                          <select className="p-2 border border-slate-200 rounded-lg text-sm outline-none bg-slate-50 font-bold text-slate-700">
                            <option value="all">All Categories</option><option value="Technical">Technical</option><option value="Cultural">Cultural</option><option value="Sports">Sports</option>
                          </select>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
                            {clubs.map(club => <ClubCard key={club._id} club={club} authData={authData} onJoinRequest={handleRequestJoin} onLeaveClub={handleLeaveOrRemove} onViewDetails={setViewingClubId} />)}
                        </div>
                        {clubs.length === 0 && (<div className="text-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-200"><Tent className="w-12 h-12 text-slate-300 mx-auto mb-3" /><h3 className="text-lg font-black text-slate-800 mb-1">No Clubs Found</h3><p className="text-sm text-slate-500 font-medium">No official clubs have been created on the platform yet.</p></div>)}
                     </>
                  )}

                  {/* 🟢 DETAILED VIEW OVERLAY (CLUB HOMEPAGE) */}
                  {viewingClubId && activeDetailClub && (
                     <div className="flex flex-col w-full h-full flex-shrink-0 animate-in slide-in-from-right-8 duration-300 relative">
                        
                        {/* Detailed Content Grid (2 Columns) */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-shrink-0 flex-1">
                            
                            {/* LEFT COLUMN: About & Events (2/3 width) */}
                            <div className="lg:col-span-2 flex flex-col gap-6">
                                {/* About Section */}
                                <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 relative overflow-hidden">
                                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
                                    <h4 className="text-sm font-black text-slate-800 mb-4 flex items-center gap-2 relative z-10"><Info size={18} className="text-indigo-500"/> About Us</h4>
                                    <p className="text-sm font-medium text-slate-600 leading-relaxed whitespace-pre-wrap relative z-10">{activeDetailClub.description}</p>
                                </div>

                                {/* Events Section */}
                                <div className="bg-slate-50/50 rounded-3xl p-6 sm:p-8 border border-slate-100 flex-1">
                                    <h4 className="text-sm font-black text-slate-800 mb-4 flex items-center gap-2"><Activity size={18} className="text-emerald-500"/> Hosted Events</h4>
                                    
                                    {activeClubEvents.length > 0 ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {activeClubEvents.map(event => <EventCard key={event._id} event={event} />)}
                                        </div>
                                    ) : (
                                        <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-slate-200 text-slate-400">
                                            <Calendar className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                                            <p className="text-xs font-bold">No upcoming events right now.</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* RIGHT COLUMN: Sidebar Info (1/3 width) */}
                            <div className="lg:col-span-1 flex flex-col gap-6">
                                
                                {/* Quick Stats Sidebar */}
                                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
                                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Club Information</h4>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100 text-slate-500"><Hash size={16}/></div>
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Category</p>
                                                <p className="text-sm font-black text-slate-800">{activeDetailClub.category}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center border border-indigo-100 text-indigo-500"><Users size={16}/></div>
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Members</p>
                                                <p className="text-sm font-black text-slate-800">{activeDetailClub.members?.length || 1}</p>
                                            </div>
                                        </div>
                                        {activeDetailClub.parentClub && (
                                            <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                                                <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center border border-emerald-100 text-emerald-500"><Building2 size={16}/></div>
                                                <div>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Parent Organization</p>
                                                    <p className="text-sm font-black text-slate-800">{activeDetailClub.parentClub.name || "Main Body"}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Sub-Clubs Sidebar (If it is a parent club) */}
                                {activeClubSubClubs.length > 0 && (
                                    <div className="bg-indigo-50/30 rounded-3xl p-6 border border-indigo-100">
                                        <h4 className="text-xs font-black text-indigo-800 uppercase tracking-widest mb-4 flex items-center gap-1.5"><Building2 size={14}/> Sub-Divisions ({activeClubSubClubs.length})</h4>
                                        <div className="flex flex-col gap-2">
                                            {activeClubSubClubs.map(sub => (
                                                <button 
                                                    key={sub._id}
                                                    onClick={() => setViewingClubId(sub._id)}
                                                    className="p-3 bg-white rounded-xl border border-indigo-100 hover:border-indigo-300 hover:shadow-sm transition-all flex items-center justify-between group text-left"
                                                >
                                                    <div>
                                                        <p className="text-sm font-black text-slate-800 group-hover:text-indigo-600 transition-colors truncate">{sub.name}</p>
                                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{sub.members?.length || 1} Members</p>
                                                    </div>
                                                    <ChevronRight size={16} className="text-slate-300 group-hover:text-indigo-500" />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* BOTTOM ACTION BAR */}
                        <div className="flex flex-col sm:flex-row items-center justify-between mt-6 pt-4 border-t border-slate-100 flex-shrink-0 pb-6 gap-4">
                            <button 
                                onClick={() => setViewingClubId(null)}
                                className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 px-4 py-2 bg-slate-50 hover:bg-indigo-50 rounded-lg transition-colors border border-slate-200 hover:border-indigo-200 shadow-sm w-full sm:w-auto justify-center"
                            >
                                <ChevronLeft size={16} /> Back to Directory
                            </button>

                            {activeDetailClub.members?.some(m => (m._id || m) === authData?._id) && !(activeDetailClub.chairperson?._id === authData?._id || activeDetailClub.president?._id === authData?._id) && (
                                <button 
                                    onClick={() => handleLeaveOrRemove(activeDetailClub._id, authData._id, authData.name, true)} 
                                    className="flex items-center gap-2 px-6 py-2 text-xs font-bold text-rose-500 hover:text-white hover:bg-rose-600 rounded-lg transition-all border border-rose-200 w-full sm:w-auto justify-center shadow-sm"
                                >
                                    <LogOut size={14}/> Leave Club
                                </button>
                            )}
                        </div>
                        
                     </div>
                  )}
                </div>
              )}

              {/* --- 🟢 TAB 4: MANAGE CLUBS --- */}
              {activeTab === 'manage' && myClub && (
                <div className="flex flex-col h-full w-full animate-in fade-in duration-300">
                  
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 mb-6 p-5 bg-indigo-50/50 border border-indigo-100 rounded-2xl">
                     <div className="flex items-center gap-4 lg:w-1/3">
                         <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white rounded-xl shadow-sm border border-indigo-100 flex items-center justify-center flex-shrink-0">
                            <Tent className="w-7 h-7 sm:w-8 sm:h-8 text-indigo-600" />
                         </div>
                         <div>
                            <h2 className="text-lg sm:text-xl font-black text-slate-900 leading-tight">{myClub.name}</h2>
                            <p className="text-xs sm:text-sm font-bold text-indigo-600 mt-0.5">Club Management</p>
                         </div>
                     </div>

                     <div className="flex items-center gap-2 lg:justify-center lg:w-1/3 w-full">
                         {canCreateSubClubs && (
                             <button onClick={() => setShowSubClubModal(true)} className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm rounded-xl shadow-sm transition-colors whitespace-nowrap">
                                <Building2 size={16} /> <span className="hidden sm:inline">Create</span> Sub-Club
                             </button>
                         )}
                         <button onClick={() => setShowEventModal(true)} className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs sm:text-sm rounded-xl shadow-sm transition-colors whitespace-nowrap">
                            <Megaphone size={16} /> Host Event
                         </button>
                     </div>

                     <div className="lg:w-1/3 flex lg:justify-end w-full">
                       {manageableClubs.length > 1 ? (
                         <div className="w-full sm:w-auto min-w-[220px]">
                           <label className="text-[9px] sm:text-[10px] font-bold text-indigo-400 uppercase tracking-wider block mb-1.5">
                              Select Club to Manage
                           </label>
                           <select className="w-full p-2.5 bg-white border border-indigo-200 rounded-xl outline-none focus:border-indigo-500 font-bold text-sm text-slate-700 shadow-sm transition-colors cursor-pointer" value={myClub._id} onChange={(e) => { setSelectedManageClubId(e.target.value); setRosterFilter('all'); }}>
                             {manageableClubs.map(c => (<option key={c._id} value={c._id}>{c.name} ({c.category})</option>))}
                           </select>
                         </div>
                       ) : (
                         <div className="hidden lg:block w-full"></div> 
                       )}
                     </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                     <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                           <h3 className="text-sm font-black text-slate-800 mb-4 flex items-center gap-2"><Users size={16} className="text-slate-400"/> Club Statistics</h3>
                           <div className="space-y-3">
                              <button onClick={() => setRosterFilter('all')} className={`w-full flex justify-between items-center p-3 rounded-xl border transition-all ${rosterFilter === 'all' ? 'bg-indigo-50 border-indigo-200 ring-1 ring-indigo-200 shadow-sm' : 'bg-slate-50 border-slate-100 hover:bg-slate-100 hover:border-slate-300'}`}>
                                  <span className={`text-xs font-bold ${rosterFilter === 'all' ? 'text-indigo-700' : 'text-slate-600'}`}>Total Members</span>
                                  <span className={`text-sm font-black ${rosterFilter === 'all' ? 'text-indigo-700' : 'text-slate-800'}`}>{myClub.members?.length || 1}</span>
                              </button>
                              <button onClick={() => setRosterFilter('core')} className={`w-full flex justify-between items-center p-3 rounded-xl border transition-all ${rosterFilter === 'core' ? 'bg-indigo-50 border-indigo-200 ring-1 ring-indigo-200 shadow-sm' : 'bg-slate-50 border-slate-100 hover:bg-slate-100 hover:border-slate-300'}`}>
                                  <span className={`text-xs font-bold ${rosterFilter === 'core' ? 'text-indigo-700' : 'text-slate-600'}`}>Core Team</span>
                                  <span className="text-sm font-black text-indigo-600">{myClub.coreTeam?.length || 0}</span>
                              </button>
                              <button onClick={() => setRosterFilter('pending')} className={`w-full flex justify-between items-center p-3 rounded-xl border transition-all ${rosterFilter === 'pending' ? 'bg-amber-50 border-amber-200 ring-1 ring-amber-200 shadow-sm' : 'bg-slate-50 border-slate-100 hover:bg-slate-100 hover:border-slate-300'}`}>
                                  <span className={`text-xs font-bold ${rosterFilter === 'pending' ? 'text-amber-800' : 'text-slate-600'}`}>Pending Requests</span>
                                  <span className="text-sm font-black text-amber-600">{myClub.pendingRequests?.length || 0}</span>
                              </button>
                           </div>
                        </div>

                        <div className="bg-white border border-indigo-200 rounded-2xl p-5 shadow-sm">
                           <div className="flex items-center justify-between mb-4">
                               <h3 className="text-sm font-black text-indigo-800 flex items-center gap-2"><Award size={16} className="text-indigo-400"/> Core Council Seats</h3>
                               {canCreatePosts && (
                                   <button onClick={() => setNewRoleModal({ isOpen: true, title: '', seats: 1 })} className="text-[10px] font-bold bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-2 py-1 rounded flex items-center gap-1 transition-colors">
                                       <Plus size={12}/> New Post
                                   </button>
                               )}
                           </div>
                           <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                               {myClub.availableRoles?.map((role, idx) => {
                                   const occupied = myClub.coreTeam?.filter(c => c.roleTitle === role.title).length || 0;
                                   const isFull = occupied >= role.seats;
                                   return (<div key={idx} className="flex justify-between items-center p-2 border-b border-slate-100 last:border-0"><span className="text-xs font-bold text-slate-700">{role.title}</span><span className={`text-[10px] font-black px-2 py-0.5 rounded ${isFull ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>{occupied} / {role.seats} Filled</span></div>)
                               })}
                               {(!myClub.availableRoles || myClub.availableRoles.length === 0) && (<p className="text-xs text-slate-500 italic text-center p-2 border border-dashed border-indigo-100 rounded-lg">No council seats defined.</p>)}
                           </div>
                        </div>
                     </div>

                     <div className="lg:col-span-2 space-y-6">
                        {rosterFilter === 'pending' && (
                           <div className="bg-white border border-amber-200 rounded-2xl p-5 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
                              <h3 className="text-sm font-black text-amber-800 mb-4 flex items-center gap-2"><Clock size={16}/> Pending Join Requests ({myClub.pendingRequests?.length || 0})</h3>
                              {myClub.pendingRequests?.length > 0 ? (
                                  <div className="space-y-3">
                                     {myClub.pendingRequests.map(student => (
                                        <div key={student._id || student} className="flex items-center justify-between bg-amber-50/50 p-3 rounded-xl border border-amber-100">
                                           <div className="flex items-center gap-3">
                                              <img src={student.profilePicture || getAvatar(student.name)} alt={student.name} className="w-10 h-10 rounded-full object-cover border border-amber-200" />
                                              <div><p className="text-sm font-black text-slate-800">{student.name || 'Student'}</p><p className="text-xs font-medium text-slate-500">{student.branch || 'Pending Approval'}</p></div>
                                           </div>
                                           <div className="flex items-center gap-2">
                                              <button onClick={() => handleApproveReject(myClub._id, student._id, 'reject', student.name)} className="p-2 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors"><X size={16} /></button>
                                              <button onClick={() => handleApproveReject(myClub._id, student._id, 'approve', student.name)} className="px-4 py-2 bg-emerald-50 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5"><Check size={14} /> Approve</button>
                                           </div>
                                        </div>
                                     ))}
                                  </div>
                              ) : (
                                  <div className="p-10 text-center text-amber-600/60 font-medium">
                                      <Clock className="w-10 h-10 mx-auto text-amber-200 mb-2" />
                                      <p className="text-sm">No pending requests at the moment.</p>
                                  </div>
                              )}
                           </div>
                        )}

                        {(rosterFilter === 'all' || rosterFilter === 'core') && (
                           <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm min-h-full animate-in fade-in slide-in-from-bottom-2 duration-300">
                              <div className="flex items-center justify-between mb-6">
                                  <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                                      <UserPlus size={16} className="text-slate-400"/> 
                                      {rosterFilter === 'core' ? 'Core Council Members' : 'Current Roster'}
                                  </h3>
                                  <span className="text-[10px] font-bold px-2 py-1 bg-slate-100 text-slate-500 rounded uppercase tracking-wider">
                                      Showing: {rosterFilter === 'core' ? 'Leadership' : 'Everyone'}
                                  </span>
                              </div>
                              <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
                                 
                                 {/* 👑 CHAIRPERSON LISTING + TRANSFER BUTTON */}
                                 {myClub.chairperson && (
                                   <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-indigo-50/30">
                                     <div className="flex items-center gap-3">
                                         <img src={myClub.chairperson.profilePicture || getAvatar(myClub.chairperson.name)} alt="Chairperson" className="w-8 h-8 rounded-full object-cover border border-indigo-200" />
                                         <div><p className="text-sm font-black text-slate-800 leading-tight">{myClub.chairperson.name} {authData?._id === myClub.chairperson._id ? "(You)" : ""}</p><p className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-1"><Shield size={10}/> Chairperson / Faculty</p></div>
                                     </div>
                                     
                                     {/* 🟢 TRANSFER CHAIRPERSON BUTTON */}
                                     {(isInstituteAdmin || authData?._id === myClub.chairperson?._id) && (
                                         <button 
                                            onClick={() => { setTransferModal({ isOpen: true, roleType: 'Chairperson' }); setNewLeaderId(""); setSearchQuery(""); setSearchResults([]); }} 
                                            className="px-3 py-1.5 bg-white hover:bg-indigo-100 text-indigo-600 font-bold text-[10px] uppercase tracking-wider rounded-lg transition-colors border border-indigo-200 shadow-sm flex items-center gap-1.5"
                                         >
                                            <ArrowRightLeft size={12}/> Handover
                                         </button>
                                     )}
                                   </div>
                                 )}

                                 {/* 👑 PRESIDENT LISTING + TRANSFER BUTTON */}
                                 {myClub.president && (
                                   <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white">
                                     <div className="flex items-center gap-3">
                                         <img src={myClub.president.profilePicture || getAvatar(myClub.president.name)} alt="President" className="w-8 h-8 rounded-full object-cover border border-slate-200" />
                                         <div><p className="text-sm font-black text-slate-800 leading-tight">{myClub.president.name} {authData?._id === myClub.president._id ? "(You)" : ""}</p><p className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-1"><Star size={10}/> Student President</p></div>
                                     </div>

                                     {/* 🟢 TRANSFER PRESIDENT BUTTON */}
                                     {(isInstituteAdmin || authData?._id === myClub.president?._id) && (
                                         <button 
                                            onClick={() => { setTransferModal({ isOpen: true, roleType: 'President' }); setNewLeaderId(""); setSearchQuery(""); setSearchResults([]); }} 
                                            className="px-3 py-1.5 bg-slate-50 hover:bg-indigo-50 text-indigo-600 font-bold text-[10px] uppercase tracking-wider rounded-lg transition-colors border border-slate-200 hover:border-indigo-200 shadow-sm flex items-center gap-1.5"
                                         >
                                            <ArrowRightLeft size={12}/> Handover
                                         </button>
                                     )}
                                   </div>
                                 )}

                                 {myClub.members?.length > 0 ? (
                                     <div className="divide-y divide-slate-100">
                                        {myClub.members.map(member => {
                                            if (member._id === myClub.president?._id || member._id === myClub.chairperson?._id) return null;
                                            const coreData = myClub.coreTeam?.find(c => c.user?._id === member._id);
                                            if (rosterFilter === 'core' && !coreData) return null;
                                            
                                            return (
                                            <div key={member._id} className="p-4 flex items-center justify-between bg-white hover:bg-slate-50 transition-colors">
                                               <div className="flex items-center gap-3">
                                                  <img src={member.profilePicture || getAvatar(member.name)} className="w-8 h-8 rounded-full border border-slate-200" />
                                                  <div>
                                                     <p className="text-sm font-black text-slate-800 leading-tight">{member.name}</p>
                                                     {coreData ? (<p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">{coreData.roleTitle}</p>) : (<p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Member</p>)}
                                                  </div>
                                               </div>
                                               
                                               {(isInstituteAdmin || authData?._id === myClub.president?._id || authData?._id === myClub.chairperson?._id) && (
                                                   <div className="flex items-center gap-2">
                                                       <button onClick={() => handleLeaveOrRemove(myClub._id, member._id, member.name, false)} className="p-1.5 text-rose-400 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition-colors" title="Remove from club"><Trash2 size={16} /></button>
                                                       {canAssignUsers && myClub.availableRoles?.length > 0 && (
                                                           <button onClick={() => setPromoteModal({ isOpen: true, studentId: member._id, studentName: member.name })} className="px-3 py-1.5 bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 font-bold text-[10px] uppercase tracking-wider rounded-lg transition-colors border border-slate-200 hover:border-indigo-200">{coreData ? "Edit Role" : "Promote"}</button>
                                                       )}
                                                   </div>
                                               )}
                                            </div>
                                        )})}
                                     </div>
                                 ) : null}

                                 {rosterFilter === 'all' && (!myClub.members || myClub.members.length === 0) && !myClub.chairperson && !myClub.president && (
                                     <div className="p-10 text-center text-slate-400 font-medium"><Users className="w-10 h-10 mx-auto text-slate-300 mb-2" /><p className="text-sm">No regular members yet.</p></div>
                                 )}

                                 {rosterFilter === 'core' && !myClub.chairperson && !myClub.president && (!myClub.coreTeam || myClub.coreTeam.length === 0) && (
                                     <div className="p-10 text-center text-slate-400 font-medium"><Shield className="w-10 h-10 mx-auto text-slate-300 mb-2" /><p className="text-sm">No core team members assigned yet.</p></div>
                                 )}
                              </div>
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

      {/* --- MODALS --- */}
      {promoteModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6">
                    <div><h2 className="text-lg font-black text-slate-800">Promote Member</h2><p className="text-xs font-bold text-slate-500">Assigning role to <span className="text-indigo-600">{promoteModal.studentName}</span></p></div>
                    <button onClick={() => setPromoteModal({isOpen: false, studentId: null, studentName: ''})} className="p-2 bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-600 rounded-xl transition-colors"><X size={18} /></button>
                </div>
                <div className="space-y-3 mb-6 max-h-60 overflow-y-auto custom-scrollbar">
                    {myClub.availableRoles?.map((role, idx) => {
                        const occupied = myClub.coreTeam?.filter(c => c.roleTitle === role.title && c.user?._id !== promoteModal.studentId).length || 0;
                        const isFull = occupied >= role.seats;
                        return (
                            <div key={idx} onClick={() => !isFull && setSelectedRole(role.title)} className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex justify-between items-center ${isFull ? 'bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed' : selectedRole === role.title ? 'bg-indigo-50 border-indigo-500 shadow-sm' : 'bg-white border-slate-200 hover:border-indigo-300'}`}>
                                <div><p className={`text-sm font-black ${selectedRole === role.title ? 'text-indigo-700' : 'text-slate-800'}`}>{role.title}</p><p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{role.seats} Seat(s) Total</p></div>
                                <span className={`text-xs font-black px-2.5 py-1 rounded-lg ${isFull ? 'bg-slate-200 text-slate-600' : 'bg-emerald-100 text-emerald-700'}`}>{occupied} / {role.seats} Filled</span>
                            </div>
                        )
                    })}
                </div>
                <button onClick={submitPromotion} disabled={!selectedRole} className="w-full py-3.5 bg-indigo-600 text-white font-extrabold rounded-xl hover:bg-indigo-700 shadow-md disabled:opacity-50 transition-colors">Confirm Promotion</button>
            </div>
        </div>
      )}

      {newRoleModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6">
                    <div><h2 className="text-lg font-black text-slate-800">Create New Post</h2><p className="text-xs font-bold text-slate-500">Add a new leadership role to the club.</p></div>
                    <button onClick={() => setNewRoleModal({isOpen: false, title: '', seats: 1})} className="p-2 bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-600 rounded-xl transition-colors"><X size={18} /></button>
                </div>
                <form onSubmit={handleAddRoleSubmit} className="space-y-4">
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Role Title</label>
                        <input type="text" required placeholder="e.g. Event Coordinator" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-bold text-slate-700" value={newRoleModal.title} onChange={e => setNewRoleModal({...newRoleModal, title: e.target.value})} />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Number of Seats</label>
                        <input type="number" min="1" required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-bold text-slate-700" value={newRoleModal.seats} onChange={e => setNewRoleModal({...newRoleModal, seats: Number(e.target.value)})} />
                    </div>
                    <button type="submit" className="w-full py-3.5 bg-indigo-600 text-white font-extrabold rounded-xl hover:bg-indigo-700 shadow-md transition-colors mt-2">Create Post</button>
                </form>
            </div>
        </div>
      )}

      {showSubClubModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6">
                    <div><h2 className="text-xl font-black text-slate-800">Create Sub-Club</h2><p className="text-xs font-bold text-slate-500">Branch out a new group under {myClub.name}.</p></div>
                    <button onClick={() => setShowSubClubModal(false)} className="p-2 bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-600 rounded-xl transition-colors"><X size={18} /></button>
                </div>
                <form onSubmit={handleCreateSubClubSubmit} className="space-y-4">
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Sub-Club Name</label>
                        <input type="text" required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 font-bold text-slate-700" placeholder="e.g. AI Division" value={newSubClub.name} onChange={e => setNewSubClub({...newSubClub, name: e.target.value})} />
                    </div>
                    
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Appoint Student President</label>
                        <select required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 font-bold text-slate-700" value={newSubClub.presidentId} onChange={e => setNewSubClub({...newSubClub, presidentId: e.target.value})}>
                            <option value="">-- Select from Members --</option>
                            {eligibleSubClubPresidents.map(m => (
                                <option key={m._id} value={m._id}>
                                    {m.name} {String(m._id) === String(myClub.president?._id) ? "(Current President)" : ""}
                                </option>
                            ))}
                        </select>
                        {eligibleSubClubPresidents.length === 0 && (
                            <p className="text-[10px] text-rose-500 mt-1.5 font-bold">No eligible members found. Accept students into {myClub.name} first!</p>
                        )}
                    </div>

                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Description / Purpose</label>
                        <textarea required rows="3" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 font-medium text-slate-700 resize-none" placeholder="What will this sub-club do?" value={newSubClub.description} onChange={e => setNewSubClub({...newSubClub, description: e.target.value})}></textarea>
                    </div>
                    <button type="submit" className="w-full py-3.5 bg-emerald-600 text-white font-extrabold rounded-xl hover:bg-emerald-700 shadow-md transition-colors mt-2">Establish Sub-Club</button>
                </form>
            </div>
        </div>
      )}

      {showEventModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6">
                    <div><h2 className="text-xl font-black text-slate-800">Host an Event</h2><p className="text-xs font-bold text-slate-500">Broadcast your upcoming activity to the entire campus.</p></div>
                    <button onClick={() => setShowEventModal(false)} className="p-2 bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-600 rounded-xl transition-colors"><X size={18} /></button>
                </div>
                <form onSubmit={handleCreateEventSubmit} className="space-y-4">
                    <div><label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Event Title</label><input type="text" required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-bold text-slate-700" placeholder="e.g. Annual CodeFest" value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} /></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Date</label><input type="date" required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-bold text-slate-700" value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})} /></div>
                        <div><label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Time</label><input type="time" required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-bold text-slate-700" value={newEvent.time} onChange={e => setNewEvent({...newEvent, time: e.target.value})} /></div>
                    </div>
                    <div><label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Venue / Location</label><input type="text" required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-bold text-slate-700" placeholder="e.g. Main Auditorium" value={newEvent.venue} onChange={e => setNewEvent({...newEvent, venue: e.target.value})} /></div>
                    <div><label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Description</label><textarea required rows="3" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-medium text-slate-700 resize-none" placeholder="What to expect at this event..." value={newEvent.description} onChange={e => setNewEvent({...newEvent, description: e.target.value})}></textarea></div>
                    <button type="submit" className="w-full py-3.5 bg-indigo-600 text-white font-extrabold rounded-xl hover:bg-indigo-700 shadow-md transition-colors mt-2">Broadcast Event</button>
                </form>
            </div>
        </div>
      )}

      {/* 🟢 FIXED: TRANSFER LEADERSHIP MODAL WITH SEARCH & FAIL-SAFES */}
      {transferModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-lg font-black text-slate-800">Transfer Leadership</h2>
                        <p className="text-xs font-bold text-slate-500">Hand over the <span className="text-indigo-600">{transferModal.roleType}</span> role.</p>
                    </div>
                    <button onClick={() => { setTransferModal({isOpen: false, roleType: ''}); setNewLeaderId(""); setSearchQuery(""); setSearchResults([]); }} className="p-2 bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-600 rounded-xl transition-colors"><X size={18} /></button>
                </div>
                <form onSubmit={handleTransferLeadership} className="space-y-4">
                    
                    {transferModal.roleType === 'Chairperson' ? (
                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Search Official / Teacher</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                <input 
                                    type="text" 
                                    placeholder="Click to see suggestions or type a name..." 
                                    className="w-full pl-9 pr-3 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-bold text-slate-700" 
                                    value={searchQuery} 
                                    onChange={handleSearchOfficial} 
                                    onFocus={handleFocusOfficialSearch} 
                                />
                            </div>
                            {searchResults.length > 0 && (
                                <div className="mt-2 max-h-40 overflow-y-auto border border-slate-200 rounded-xl bg-white shadow-sm">
                                    {searchResults.map(user => (
                                        <div 
                                            key={user._id} 
                                            onClick={() => { setNewLeaderId(user._id); setSearchQuery(user.name); setSearchResults([]); }}
                                            className={`p-3 cursor-pointer hover:bg-indigo-50 border-b border-slate-100 last:border-0 flex justify-between items-center ${newLeaderId === user._id ? 'bg-indigo-50' : ''}`}
                                        >
                                            <span className="text-sm font-bold text-slate-800">{user.name}</span>
                                            <span className="text-[10px] font-black text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded uppercase">{user.userType || 'Official'}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {newLeaderId && searchResults.length === 0 && (
                                 <p className="text-xs font-bold text-emerald-600 mt-2">✓ Successor Selected</p>
                            )}
                        </div>
                    ) : (
                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Select Successor</label>
                            <select required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-bold text-slate-700" value={newLeaderId} onChange={e => setNewLeaderId(e.target.value)}>
                                <option value="">-- Choose from members --</option>
                                {myClub.members?.filter(m => {
                                    if (String(m._id) === String(authData?._id) || String(m._id) === String(myClub.chairperson?._id) || String(m._id) === String(myClub.president?._id)) return false;
                                    const uType = m.userType ? String(m.userType).toLowerCase() : 'student';
                                    return uType === 'student';
                                }).map(m => (
                                    <option key={m._id} value={m._id}>{m.name} (Student)</option>
                                ))}
                            </select>
                            
                            {myClub.members?.filter(m => {
                                if (String(m._id) === String(authData?._id) || String(m._id) === String(myClub.chairperson?._id) || String(m._id) === String(myClub.president?._id)) return false;
                                const uType = m.userType ? String(m.userType).toLowerCase() : 'student';
                                return uType === 'student';
                            }).length === 0 && (
                                <p className="text-[10px] text-rose-500 mt-1.5 font-bold">
                                    No eligible students found. You must accept new students into the club roster before you can hand over the Presidency!
                                </p>
                            )}
                        </div>
                    )}

                    <p className="text-[10px] font-bold text-amber-600 mt-3 flex items-start gap-1.5 p-3 bg-amber-50 rounded-lg border border-amber-200">
                        <ShieldAlert size={14} className="flex-shrink-0 mt-0.5" /> 
                        <span>Warning: By confirming this transfer, you will immediately lose your current administrative permissions for this club.</span>
                    </p>
                    <button type="submit" className="w-full py-3.5 bg-indigo-600 text-white font-extrabold rounded-xl hover:bg-indigo-700 shadow-md transition-colors mt-2">Confirm Transfer</button>
                </form>
            </div>
        </div>
      )}

    </RequireVerification>
  );
}