import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Loader2, Clock, Lock, AlertTriangle, Users } from 'lucide-react';
import { getMyResults, getUserResults, getUserById } from '../../api';
import { useAuth } from '../../context/AuthContext'; 
import MarkSheetCard from './MarkSheetCard';

const ALL_SEMESTERS = [
    'Semester 1', 'Semester 2', 'Semester 3', 'Semester 4', 
    'Semester 5', 'Semester 6', 'Semester 7', 'Semester 8'
];

const ProfileResults = ({ userId, isCurrentUser, instituteLogo, isFriend = false }) => {
    const { authData, instituteData } = useAuth(); 
    const [results, setResults] = useState([]);
    const [fetchedTargetUser, setFetchedTargetUser] = useState(null); 
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState(""); 

    const [searchParams, setSearchParams] = useSearchParams();
    const selectedSemester = searchParams.get('semester') || 'Semester 1';

    const currentUserData = authData?.user || authData || {};
    const displayData = isCurrentUser ? currentUserData : (fetchedTargetUser || currentUserData);

    const isOfficial = authData?.userType === "Institute" || authData?.role === "admin" || authData?.role === "superadmin";
    const isVerified = authData?.isVerifiedByInstitute === true;

    const hasPermissionToView = isCurrentUser || isOfficial || isFriend;

    const handleSemesterChange = useCallback((sem) => {
        const newParams = new URLSearchParams(searchParams);
        newParams.set('semester', sem);
        setSearchParams(newParams);
    }, [searchParams, setSearchParams]);

    useEffect(() => {
        let isMounted = true; 

        const fetchData = async () => {
            if (!hasPermissionToView) {
                if (!isCurrentUser && userId) {
                    try {
                        const userDataRes = await getUserById(userId);
                        if (isMounted) setFetchedTargetUser(userDataRes);
                    } catch (e) {}
                }
                if (isMounted) setLoading(false);
                return;
            }

            if (!isOfficial && !isVerified) {
                if (isMounted) setLoading(false);
                return;
            }

            if (isMounted) {
                setLoading(true);
                setErrorMsg(""); 
            }
            
            try {
                const rawData = isCurrentUser ? await getMyResults() : await getUserResults(userId);
                const actualResults = Array.isArray(rawData) ? rawData : (rawData?.results || rawData?.data || []);

                if (!Array.isArray(actualResults)) throw new Error("Backend did not return an array of results.");
                
                if (isMounted) {
                    setResults(actualResults);
                    
                    if (!isCurrentUser && userId) {
                        try {
                            const userDataRes = await getUserById(userId);
                            setFetchedTargetUser(userDataRes);
                        } catch (userErr) {}
                    }
                    
                    if (actualResults.length > 0 && !searchParams.get('semester')) {
                        const sortedResults = [...actualResults].sort((a, b) => a.semester.localeCompare(b.semester));
                        const latestSem = sortedResults[sortedResults.length - 1].semester;
                        
                        const newParams = new URLSearchParams(searchParams);
                        newParams.set('semester', latestSem);
                        setSearchParams(newParams, { replace: true });
                    }
                }
            } catch (error) {
                if (isMounted) {
                    setErrorMsg(error.message || "An unknown error occurred while fetching results.");
                    setResults([]);
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        if (userId) fetchData();
        
        return () => {
            isMounted = false;
        };
        
    }, [userId, isCurrentUser, isOfficial, isVerified, hasPermissionToView]); 

    if (loading) {
        return (
            <div className="flex justify-center items-center py-16 bg-white rounded-2xl shadow-sm border border-gray-50 w-full">
                <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
            </div>
        );
    }

    if (!isOfficial && !isVerified) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100 flex-1 w-full animate-in fade-in duration-300">
                <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mb-6 border-4 border-amber-100">
                    <Lock className="w-10 h-10 text-amber-500" />
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 mb-2">Verification Pending</h1>
                <p className="text-slate-500 font-medium text-sm text-center max-w-sm px-4">
                    Your account must be verified by the Institute Administration before you can access academic records.
                </p>
            </div>
        );
    }

    if (errorMsg) {
        return (
            <div className="flex flex-col items-center justify-center py-12 bg-rose-50 rounded-2xl shadow-sm border border-rose-100 flex-1 w-full animate-in fade-in duration-300">
                <AlertTriangle className="w-12 h-12 text-rose-500 mb-3" />
                <h3 className="text-lg font-extrabold text-rose-800">Connection Error</h3>
                <p className="text-sm text-rose-600 mt-2 text-center px-4 font-medium">The backend failed to return the results.</p>
            </div>
        );
    }

    if (!hasPermissionToView) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100 flex-1 w-full animate-in fade-in duration-300">
                <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mb-5 border-4 border-purple-100">
                    <Users className="w-10 h-10 text-purple-400" />
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-2">Connection Required</h3>
                <p className="text-sm text-gray-500 mt-1 text-center max-w-md px-4 font-medium leading-relaxed">
                    You are not currently friends with <span className="font-bold text-gray-700 capitalize">{displayData?.name || displayData?.full_name || "this student"}</span>. 
                    <br/><br/>
                    They have restricted their academic scorecard strictly to their connections. Please send a friend request to view their results!
                </p>
            </div>
        );
    }

    const displayedResults = results.filter(r => r.semester === selectedSemester);

    return (
        <div className="flex flex-col h-full w-full min-h-0 gap-4">
            
            <style>{`
                @media print {
                    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background: white; }
                    @page { size: A4 portrait; margin: 0mm; } 
                    .print-break-inside-avoid { break-inside: avoid; page-break-inside: avoid; }
                    tr { break-inside: avoid; page-break-inside: avoid; }
                    .watermark-container { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 0; }
                }
            `}</style>

            {/* 🟢 FIXED: Wrapped Semesters into rows with flex-wrap instead of overflow scrolling */}
            <div className="flex flex-wrap justify-center gap-2 pb-3 w-full pt-1 px-1 print:hidden">
                {ALL_SEMESTERS.map((sem) => {
                    const hasData = results.some(r => r.semester === sem);
                    const displayText = sem.replace('Semester ', 'Sem ');
                    const isSelected = selectedSemester === sem;
                    
                    return (
                        <button
                            key={sem}
                            onClick={() => handleSemesterChange(sem)}
                            className={`px-4 py-2 text-xs font-black rounded-full whitespace-nowrap transition-all duration-200 shadow-sm border ${
                                isSelected
                                    ? 'bg-gradient-to-r from-purple-600 to-teal-500 text-white border-transparent scale-[1.04]'
                                    : hasData
                                        ? 'bg-white text-gray-700 hover:bg-gray-50 border-gray-100'
                                        : 'bg-gray-50/50 text-gray-400 border-dashed border-gray-200'
                            }`}
                        >
                            {displayText}
                        </button>
                    );
                })}
            </div>

            <div className="space-y-4 pb-4 w-full print:block print:space-y-0">
                {displayedResults.length > 0 ? (
                    displayedResults.map((result) => (
                        <MarkSheetCard 
                            key={result._id} 
                            result={result} 
                            displayData={displayData} 
                            instituteData={instituteData} 
                            instituteLogo={instituteLogo} 
                        />
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100 flex-1 w-full animate-in fade-in duration-300 print:hidden">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-50">
                            <Clock className="w-8 h-8 text-gray-300" />
                        </div>
                        <h3 className="text-lg font-extrabold text-gray-800">Result Not Declared</h3>
                        <p className="text-sm text-gray-500 mt-2 text-center max-w-sm px-4 font-medium">
                            The mark sheet for <span className="font-bold text-gray-700">{selectedSemester}</span> has not been published yet.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfileResults;