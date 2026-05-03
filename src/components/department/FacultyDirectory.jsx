import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Trash2, Loader2, Briefcase, Mail, BookOpen, Phone, Edit3, Save, FileText, Building2, GraduationCap, ChevronRight, Clock, Calendar } from 'lucide-react';
import { updateDepartment, getCourseBlueprint, saveCourseBlueprint, updateUserProfile, getFacultyAssignedSubjects, getUserById } from '../../api';
import { useAuth } from '../../context/AuthContext';

export default function FacultyDirectory({ activeDept, canEdit, onRefresh, searchQuery = "" }) {
    const { authData } = useAuth();

    const [searchParams, setSearchParams] = useSearchParams();
    const facultyIdFromUrl = searchParams.get('facultyId');
    const activeProfileTab = searchParams.get('profileTab') || 'overview';

    const [selectedFacultyForProfile, setSelectedFacultyForProfile] = useState(null);
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [profileEdits, setProfileEdits] = useState({});
    const [isSavingProfile, setIsSavingProfile] = useState(false);

    const [facultySubjects, setFacultySubjects] = useState([]);
    const [loadingFacultySubjects, setLoadingFacultySubjects] = useState(false);

    // 🟢 Sticky Header Logic
    const profileCardRef = useRef(null);
    const [isCardVisible, setIsCardVisible] = useState(true);

    useEffect(() => {
        const fetchFullProfile = async () => {
            if (facultyIdFromUrl) {
                try {
                    const rosterInfo = activeDept?.coreFaculty?.find(f => String(f._id || f) === String(facultyIdFromUrl)) || {};

                    let fullUser = {};
                    try {
                        const res = await getUserById(facultyIdFromUrl);
                        fullUser = res.user || res || {};
                    } catch {
                        console.warn("Could not fetch full user profile, using roster fallback.");
                    }

                    const mergedFaculty = {
                        ...rosterInfo,
                        ...fullUser,
                        name: fullUser.name || rosterInfo.name || fullUser.full_name || 'Faculty Member',
                        email: fullUser.email || rosterInfo.email || '',
                        designation: fullUser.designation || rosterInfo.designation || '',
                        profilePicture: fullUser.profilePicture || fullUser.avtar?.url || rosterInfo.profilePicture || '',
                        phoneNumber: fullUser.phoneNumber || rosterInfo.phoneNumber || '',
                        about: fullUser.about || fullUser.bio || rosterInfo.about || '',
                        education: fullUser.education || rosterInfo.education || ''
                    };

                    setSelectedFacultyForProfile(mergedFaculty);
                    setProfileEdits({
                        about: mergedFaculty.about || '',
                        education: mergedFaculty.education || '',
                        phoneNumber: mergedFaculty.phoneNumber || ''
                    });
                    setIsEditingProfile(false);
                } catch (error) {
                    console.error("Failed to merge faculty profile:", error);
                }
            } else {
                setSelectedFacultyForProfile(null);
            }
        };

        fetchFullProfile();
    }, [facultyIdFromUrl, activeDept]);

    useEffect(() => {
        const fetchSubjectsForProfile = async () => {
            const validId = selectedFacultyForProfile?._id || facultyIdFromUrl;
            if (selectedFacultyForProfile && activeProfileTab === 'academics' && validId) {
                try {
                    setLoadingFacultySubjects(true);
                    const subs = await getFacultyAssignedSubjects(validId);
                    setFacultySubjects(subs || []);
                } catch {
                    setFacultySubjects([]);
                } finally {
                    setLoadingFacultySubjects(false);
                }
            }
        };
        fetchSubjectsForProfile();
    }, [selectedFacultyForProfile, activeProfileTab, facultyIdFromUrl]);

    // 🟢 Intersection Observer for Sticky Header
    // Replace your entire useEffect for the observer with this:
    useEffect(() => {
        // 1. Copy the ref to a local variable inside the effect
        const currentRef = profileCardRef.current;

        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsCardVisible(entry.isIntersecting);
            },
            { threshold: 0.1 }
        );

        if (currentRef) {
            observer.observe(currentRef);
        }

        return () => {
            // 2. Use the local variable in the cleanup function
            if (currentRef) observer.unobserve(currentRef);
        };
    }, [selectedFacultyForProfile]);

    const filteredFaculty = (activeDept.coreFaculty || []).filter(f =>
        f.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.designation?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleRemoveFacultyFromRoster = async (userId, userName) => {
        if (!window.confirm(`Remove ${userName || 'this faculty member'} from the department? Note: Please ensure their subjects are unassigned first.`)) return;
        try {
            const updatedFacultyIds = (activeDept.coreFaculty || []).filter(f => String(f._id || f) !== String(userId)).map(f => f._id || f);
            await updateDepartment(activeDept._id, { coreFaculty: updatedFacultyIds });
            onRefresh();
        } catch {
            alert("Failed to remove faculty member.");
        }
    };

    const handleRemoveSubjectAssignmentFromProfile = async (subject) => {
        if (!window.confirm(`Remove ${subject.subjectCode} from ${selectedFacultyForProfile.name}'s workload?`)) return;
        try {
            const data = await getCourseBlueprint(subject.batch, subject.branch, subject.semester);
            const blueprintSubjects = data?.subjects || [];

            const updatedSubjects = blueprintSubjects.map(s =>
                s.subjectCode === subject.subjectCode ? { ...s, assignedTo: null, timing: "" } : s
            );

            await saveCourseBlueprint({
                batch: subject.batch,
                branch: subject.branch,
                semester: subject.semester,
                subjects: updatedSubjects
            });

            setFacultySubjects(prev => prev.filter(s => s.subjectCode !== subject.subjectCode));
        } catch {
            alert("Failed to unassign subject.");
        }
    };

    const openProfileView = (faculty) => {
        const newParams = new URLSearchParams(searchParams);
        newParams.set('facultyId', faculty._id);
        newParams.set('profileTab', 'overview');
        setSearchParams(newParams);
    };

    const handleTabChange = (tabId) => {
        const newParams = new URLSearchParams(searchParams);
        newParams.set('profileTab', tabId);
        setSearchParams(newParams, { replace: true });
    };

    const handleSaveProfileChanges = async () => {
        setIsSavingProfile(true);
        try {
            const formData = new FormData();
            formData.append('about', profileEdits.about || '');
            formData.append('education', profileEdits.education || '');
            formData.append('phoneNumber', profileEdits.phoneNumber || '');

            await updateUserProfile(formData);
            setSelectedFacultyForProfile(prev => ({ ...prev, ...profileEdits }));
            setIsEditingProfile(false);
            onRefresh();
        } catch (error) {
            alert("Failed to update profile. " + error.message);
        } finally {
            setIsSavingProfile(false);
        }
    };

    const getEmailDisplay = (userObj) => {
        if (userObj?.email && !userObj.email.toLowerCase().includes('restricted')) return userObj.email;
        if (userObj?.username) return `${userObj.username} (Username)`;
        return 'No email provided';
    };

    const getBranchFullName = (branchCode) => {
        if (!branchCode) return activeDept?.name;
        if (branchCode.trim().toLowerCase() === activeDept?.abbreviation?.toLowerCase()) {
            return activeDept?.name;
        }
        return branchCode;
    };

    return (
        <div className="w-full flex flex-col h-full min-h-0">

            {/* 🟢 LIST VIEW */}
            {!selectedFacultyForProfile && (
                <div className="flex flex-col gap-3.5 pb-4 flex-1 overflow-y-auto custom-scrollbar pr-1 pt-1">
                    {filteredFaculty.map((faculty, idx) => (
                        <div
                            key={idx}
                            onClick={() => openProfileView(faculty)}
                            className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group"
                        >
                            <div className="flex items-center gap-5 w-full md:w-1/2 pr-8 md:pr-0">
                                <div className="w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 font-black text-2xl flex-shrink-0 border border-slate-200 overflow-hidden">
                                    {faculty.profilePicture ? <img src={faculty.profilePicture} className="w-full h-full object-cover" alt="Profile" /> : faculty.name?.charAt(0) || 'F'}
                                </div>
                                <div className="flex flex-col justify-center min-w-0">
                                    <h3 className="text-[16px] font-black text-slate-900 uppercase tracking-wide truncate group-hover:text-indigo-600 transition-colors">{faculty.name || 'Faculty Member'}</h3>
                                    <p className="text-[13px] text-slate-500 font-medium truncate mt-0.5">{getEmailDisplay(faculty)}</p>
                                </div>
                            </div>

                            <div className="flex flex-col md:items-center justify-center w-full md:w-1/3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                                <span className="px-4 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border w-max mb-2 bg-indigo-50 text-indigo-700 border-indigo-100">
                                    FACULTY
                                </span>
                                <p className="text-xs font-black text-slate-900 truncate max-w-full text-center">{faculty.designation || 'Faculty Member'}</p>
                            </div>

                            <div className="flex items-center md:justify-end w-full md:w-[10%] pt-1 md:pt-0 gap-3">
                                {canEdit && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleRemoveFacultyFromRoster(faculty._id, faculty.name); }}
                                        className="text-slate-300 hover:text-rose-600 hover:bg-rose-50 p-2 rounded-lg transition-colors md:opacity-0 group-hover:opacity-100 flex-shrink-0"
                                        title="Remove from Department"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                )}
                                <ChevronRight size={20} className="text-slate-300 group-hover:text-indigo-500 transition-colors ml-auto md:ml-0" />
                            </div>
                        </div>
                    ))}

                    {filteredFaculty.length === 0 && (
                        <div className="col-span-full text-center py-16 text-slate-400 font-medium border border-dashed border-slate-200 rounded-2xl bg-slate-50 mt-2">
                            <Briefcase size={36} className="mx-auto mb-3 opacity-40" />
                            No faculty members found matching your search.
                        </div>
                    )}
                </div>
            )}

            {/* 🟢 PROFILE VIEW */}
            {selectedFacultyForProfile && (() => {
                const isMyProfile = authData?._id === selectedFacultyForProfile._id;
                return (
                    <div className="flex flex-col w-full h-full flex-shrink-0 animate-in slide-in-from-right-8 duration-300 relative min-h-0">

                        <div className="flex-1 flex flex-col relative min-h-0">

                            {/* 🟢 MAIN PROFILE INFO CARD */}
                            <div ref={profileCardRef} className="bg-white rounded-[2rem] px-6 py-5 sm:px-8 sm:py-6 shadow-sm border border-slate-200 mb-6 flex flex-col lg:flex-row items-center justify-between gap-5 flex-shrink-0 mt-2">

                                <div className="flex flex-col sm:flex-row items-center gap-5 w-full lg:w-auto flex-1 min-w-0">
                                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-slate-50 flex items-center justify-center border-4 border-slate-100 shadow-sm flex-shrink-0 overflow-hidden">
                                        {selectedFacultyForProfile.profilePicture ? (
                                            <img src={selectedFacultyForProfile.profilePicture} alt="Avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-slate-400 font-black text-4xl">{selectedFacultyForProfile.name?.charAt(0) || 'F'}</span>
                                        )}
                                    </div>

                                    <div className="flex flex-col items-center sm:items-start text-center sm:text-left min-w-0 flex-1">
                                        <h2 className="text-2xl sm:text-[28px] font-black text-slate-900 leading-tight tracking-wide truncate w-full">
                                            {selectedFacultyForProfile.name || 'Faculty Member'}
                                        </h2>

                                        <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-2">
                                            <span className="bg-indigo-50 text-indigo-700 border border-indigo-100 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest flex items-center gap-1.5">
                                                <Briefcase size={12} /> {selectedFacultyForProfile.designation || 'Faculty Member'}
                                            </span>
                                            <span className="bg-slate-50 text-slate-600 border border-slate-200 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest flex items-center gap-1.5">
                                                <Building2 size={12} /> {activeDept.name}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col items-center md:items-end gap-2 w-full lg:w-[280px] flex-shrink-0 mt-3 lg:mt-0">
                                    <div className="bg-slate-50 rounded-xl p-3 flex items-center gap-3 w-full border border-slate-100">
                                        <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-500 flex items-center justify-center flex-shrink-0"><Mail size={14} /></div>
                                        <div className="min-w-0">
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Email Address</p>
                                            <a href={getEmailDisplay(selectedFacultyForProfile) !== 'No email provided' ? `mailto:${selectedFacultyForProfile.email}` : '#'} className="text-xs font-bold text-slate-800 hover:text-indigo-600 truncate block">
                                                {getEmailDisplay(selectedFacultyForProfile)}
                                            </a>
                                        </div>
                                    </div>

                                    <div className="bg-slate-50 rounded-xl p-3 flex items-center gap-3 w-full border border-slate-100">
                                        <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-500 flex items-center justify-center flex-shrink-0"><Phone size={14} /></div>
                                        <div className="min-w-0 w-full">
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Phone Number</p>
                                            {isEditingProfile ? (
                                                <input type="text" value={profileEdits.phoneNumber} onChange={(e) => setProfileEdits({ ...profileEdits, phoneNumber: e.target.value })} className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs text-slate-800 focus:border-indigo-500 outline-none" placeholder="Enter phone..." />
                                            ) : (
                                                <span className="text-xs font-bold text-slate-800 block truncate">{selectedFacultyForProfile.phoneNumber || 'Not provided'}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* ✨ 🟢 STICKY HEADER & TABS ROW */}
                            <div className={`sticky top-0 z-30 flex flex-col xl:flex-row xl:items-center justify-between gap-4 py-3 bg-white/95 backdrop-blur-md transition-all duration-300 border-b border-slate-100 flex-shrink-0 ${!isCardVisible ? 'shadow-sm -mx-4 px-4 rounded-b-2xl mb-4' : 'mb-4'}`}>

                                <div className="flex items-center gap-3 overflow-x-auto custom-scrollbar flex-1 pb-1 xl:pb-0">

                                    {!isCardVisible && (
                                        <div className="flex items-center gap-3 pr-4 border-r border-slate-200 flex-shrink-0 animate-in slide-in-from-left-4 fade-in duration-300">
                                            <div className="w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center border border-slate-200 shadow-sm overflow-hidden flex-shrink-0">
                                                {selectedFacultyForProfile.profilePicture ? (
                                                    <img src={selectedFacultyForProfile.profilePicture} alt="Avatar" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-slate-400 font-black text-sm">{selectedFacultyForProfile.name?.charAt(0) || 'F'}</span>
                                                )}
                                            </div>
                                            <h3 className="font-black text-slate-900 text-sm whitespace-nowrap hidden sm:block">{selectedFacultyForProfile.name}</h3>
                                        </div>
                                    )}

                                    <button
                                        onClick={() => handleTabChange('overview')}
                                        className={`px-5 py-2.5 rounded-full font-bold text-sm transition-all flex items-center gap-2 shadow-sm border whitespace-nowrap ${activeProfileTab === 'overview' ? 'bg-indigo-500 text-white border-indigo-500' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                                    >
                                        <FileText size={16} /> Professional Summary
                                    </button>
                                    <button
                                        onClick={() => handleTabChange('education')}
                                        className={`px-5 py-2.5 rounded-full font-bold text-sm transition-all flex items-center gap-2 shadow-sm border whitespace-nowrap ${activeProfileTab === 'education' ? 'bg-indigo-500 text-white border-indigo-500' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                                    >
                                        <GraduationCap size={16} /> Educational Background
                                    </button>
                                    <button
                                        onClick={() => handleTabChange('academics')}
                                        className={`px-5 py-2.5 rounded-full font-bold text-sm transition-all flex items-center gap-2 shadow-sm border whitespace-nowrap ${activeProfileTab === 'academics' ? 'bg-indigo-500 text-white border-indigo-500' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                                    >
                                        <BookOpen size={16} /> Assigned Classes
                                    </button>
                                </div>

                                {isMyProfile && (
                                    <div className="flex items-center gap-2 flex-shrink-0 ml-auto xl:ml-0">
                                        {isEditingProfile ? (
                                            <>
                                                <button onClick={() => setIsEditingProfile(false)} className="px-5 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-50 rounded-full transition-colors border border-slate-200 shadow-sm bg-white">Cancel</button>
                                                <button onClick={handleSaveProfileChanges} disabled={isSavingProfile} className="flex items-center gap-1.5 px-5 py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-full shadow-sm transition-all disabled:opacity-50">
                                                    {isSavingProfile ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save
                                                </button>
                                            </>
                                        ) : (
                                            <button onClick={() => setIsEditingProfile(true)} className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-full hover:bg-indigo-100 transition-colors shadow-sm">
                                                <Edit3 size={16} /> Edit Profile
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* TAB CONTENT CARDS */}
                            <div className="flex-1 flex flex-col flex-shrink-0 min-h-[300px] pt-2">

                                {activeProfileTab === 'overview' && (
                                    <div className="w-full animate-in fade-in duration-300">
                                        {isEditingProfile ? (
                                            <textarea rows="8" value={profileEdits.about} onChange={(e) => setProfileEdits({ ...profileEdits, about: e.target.value })} className="w-full p-5 border border-slate-300 rounded-2xl bg-white focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none text-sm text-slate-700 leading-relaxed resize-none transition-colors shadow-sm" placeholder="Write a brief professional summary..." />
                                        ) : (
                                            <div className="bg-white p-6 sm:p-8 rounded-[2rem] border border-slate-200 shadow-sm">
                                                <h3 className="text-sm font-black text-slate-800 mb-4 flex items-center gap-2"><FileText className="text-indigo-500 w-5 h-5" /> Professional Summary</h3>
                                                <p className="text-[15px] text-slate-600 leading-relaxed whitespace-pre-wrap">{selectedFacultyForProfile.about || <span className="italic text-slate-400">No summary provided yet.</span>}</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {activeProfileTab === 'education' && (
                                    <div className="w-full animate-in fade-in duration-300">
                                        {isEditingProfile ? (
                                            <textarea rows="6" value={profileEdits.education} onChange={(e) => setProfileEdits({ ...profileEdits, education: e.target.value })} className="w-full p-5 border border-slate-300 rounded-2xl bg-white focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none text-sm text-slate-700 leading-relaxed resize-none transition-colors shadow-sm" placeholder="E.g. Ph.D. in Computer Science, MIT (2018)" />
                                        ) : (
                                            <div className="bg-white p-6 sm:p-8 rounded-[2rem] border border-slate-200 shadow-sm">
                                                <h3 className="text-sm font-black text-slate-800 mb-4 flex items-center gap-2"><GraduationCap className="text-amber-500 w-5 h-5" /> Educational Background</h3>
                                                <p className="text-[15px] text-slate-600 leading-relaxed whitespace-pre-wrap">{selectedFacultyForProfile.education || <span className="italic text-slate-400">No educational background provided yet.</span>}</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {activeProfileTab === 'academics' && (
                                    <div className="w-full animate-in fade-in duration-300 flex flex-col h-full min-h-0">
                                        <div className="flex items-center justify-between mb-4 flex-shrink-0">
                                            <h3 className="text-[16px] font-black text-slate-800 flex items-center gap-2"><BookOpen className="text-emerald-500 w-5 h-5" /> All Assigned Classes</h3>
                                            <span className="bg-emerald-50 text-emerald-700 text-xs font-black px-4 py-1.5 rounded-full border border-emerald-100">{facultySubjects.length} Subjects</span>
                                        </div>

                                        <div>
                                            {loadingFacultySubjects ? (
                                                <div className="text-center py-16 text-emerald-500"><Loader2 className="w-8 h-8 animate-spin mx-auto" /></div>
                                            ) : facultySubjects.length > 0 ? (
                                                <div className="flex flex-col gap-4">
                                                    {facultySubjects.map((subject, idx) => (
                                                        /* ✨ 🟢 NEW 3-COLUMN LAYOUT */
                                                        <div key={idx} className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-5 py-4 bg-white border border-emerald-200 rounded-2xl shadow-sm hover:shadow-md hover:border-emerald-400 transition-all group relative overflow-hidden">

                                                            {/* 1. Left: Subject Name & Credits */}
                                                            <div className="flex flex-col min-w-0 flex-1 gap-2 pl-1">
                                                                <div className="flex items-center gap-3">
                                                                    <span className="font-black text-slate-900 text-[17px] whitespace-nowrap">{subject.subjectCode}</span>
                                                                    <span className="text-slate-300 hidden sm:inline">|</span>
                                                                    <span className="font-bold text-slate-700 text-[15px] truncate">{subject.subjectName}</span>
                                                                </div>
                                                                <div className="flex items-center gap-2 mt-0.5">
                                                                    <span className={`px-2.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest flex-shrink-0 border ${subject.type === 'Theory' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                                                        {subject.type || 'THEORY'}
                                                                    </span>
                                                                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
                                                                        {subject.credits || 4} CREDITS
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            {/* ✨ 2. Middle: Schedule (Days & Time Stacked 2x1) */}
                                                            <div className="flex flex-col justify-center items-start md:items-center w-full md:w-auto border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-6 md:pr-4 flex-shrink-0 gap-1.5 min-w-[140px]">
                                                                {subject.timing ? (() => {
                                                                    const parts = subject.timing.split(' | ');
                                                                    const days = parts[0];
                                                                    const time = parts[1];
                                                                    return (
                                                                        <>
                                                                            {days && (
                                                                                <span className="bg-indigo-50 border border-indigo-100 text-indigo-700 shadow-sm rounded-md px-2.5 py-1 text-[10px] font-bold tracking-wider flex items-center justify-center gap-1.5 w-full sm:w-max">
                                                                                    <Calendar size={12} className="opacity-70" /> {days}
                                                                                </span>
                                                                            )}
                                                                            {time && (
                                                                                <span className="bg-indigo-50 border border-indigo-100 text-indigo-700 shadow-sm rounded-md px-2.5 py-1 text-[10px] font-bold tracking-wider flex items-center justify-center gap-1.5 w-full sm:w-max">
                                                                                    <Clock size={12} className="opacity-70" /> {time}
                                                                                </span>
                                                                            )}
                                                                        </>
                                                                    );
                                                                })() : (
                                                                    <span className="bg-slate-50 border border-slate-200 text-slate-400 shadow-sm rounded-md px-2.5 py-1 text-[10px] font-bold tracking-wider flex items-center justify-center gap-1.5 w-full sm:w-max italic">
                                                                        <Clock size={12} className="opacity-70" /> Unscheduled
                                                                    </span>
                                                                )}
                                                            </div>

                                                            {/* 3. Right: Batch/Semester/Branch */}
                                                            <div className="flex flex-col md:items-end gap-1.5 flex-shrink-0 w-full md:w-auto border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-6 text-left md:text-right">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="bg-emerald-50 border border-emerald-100 text-[10px] font-bold text-emerald-700 shadow-sm rounded-full px-3 py-0.5 uppercase tracking-widest">{subject.batch}</span>
                                                                    <span className="bg-emerald-50 border border-emerald-100 text-[10px] font-bold text-emerald-700 shadow-sm rounded-full px-3 py-0.5 uppercase tracking-widest">{subject.semester}</span>

                                                                    {canEdit && (
                                                                        <button
                                                                            onClick={(e) => { e.stopPropagation(); handleRemoveSubjectAssignmentFromProfile(subject); }}
                                                                            className="ml-1 text-slate-300 hover:text-rose-600 hover:bg-rose-100 p-1.5 rounded-full transition-colors md:opacity-0 md:group-hover:opacity-100 focus:opacity-100"
                                                                            title="Unassign Subject"
                                                                        >
                                                                            <Trash2 size={14} />
                                                                        </button>
                                                                    )}
                                                                </div>
                                                                <span className="bg-emerald-50 border border-emerald-100 text-emerald-700 shadow-sm rounded-full px-4 py-1 text-[10px] font-black uppercase tracking-widest truncate inline-block w-full sm:w-auto text-center mt-0.5">
                                                                    {getBranchFullName(subject.branch)}
                                                                </span>
                                                            </div>

                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-16 text-slate-400 italic font-medium bg-slate-50 rounded-2xl border border-slate-100">
                                                    <BookOpen size={32} className="mx-auto mb-3 opacity-40" />
                                                    No classes currently assigned to this faculty member.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })()}

        </div>
    );
}