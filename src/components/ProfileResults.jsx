import React, { useState, useEffect, useRef } from 'react';
import { FileText, Loader2, Clock, Download, Lock, AlertTriangle } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { getMyResults, getUserResults, getUserById } from '../api';
import { useAuth } from '../context/AuthContext'; 

const ALL_SEMESTERS = [
    'Semester 1', 'Semester 2', 'Semester 3', 'Semester 4', 
    'Semester 5', 'Semester 6', 'Semester 7', 'Semester 8'
];

const getYearFromSemester = (semester) => {
    const yearMap = {
        'Semester 1': '1st Year', 'Semester 2': '1st Year',
        'Semester 3': '2nd Year', 'Semester 4': '2nd Year',
        'Semester 5': '3rd Year', 'Semester 6': '3rd Year',
        'Semester 7': '4th Year', 'Semester 8': '4th Year',
    };
    return yearMap[semester] || '-';
};

// ==========================================
// 📄 MARK SHEET CARD (Dedicated Print Component)
// ==========================================
const MarkSheetCard = ({ result, displayData, instituteData, instituteLogo }) => {
    const contentRef = useRef(null);
    const totalCr = result.subjects?.reduce((sum, sub) => sum + (parseFloat(sub.credits) || 0), 0);

    // ✅ THE FIX: Pass the ref directly, not as an arrow function
    const handleDownloadPDF = useReactToPrint({
        contentRef: contentRef, 
        documentTitle: `Transcript_${displayData?.registrationNo || 'Student'}_${result.semester.replace(' ', '_')}`,
    });

    return (
        <div 
            ref={contentRef} 
            className="bg-white rounded-xl shadow-sm border border-gray-300 overflow-hidden print:overflow-visible print:block print:h-auto print:border-none print:shadow-none flex-shrink-0 animate-in fade-in slide-in-from-bottom-4 duration-300 relative print:p-0 print:m-0"
        >
            {/* WATERMARK */}
            {instituteLogo && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 print:watermark-container">
                    <img 
                        src={instituteLogo} 
                        alt="Institute Watermark" 
                        className="w-64 h-64 sm:w-[400px] sm:h-[400px] print:w-[500px] print:h-[500px] object-contain opacity-[0.06] print:opacity-[0.10]"
                    />
                </div>
            )}

            <div className="relative z-10 print:block">
                
                {/* 🎓 OFFICIAL PRINT HEADER */}
                <div className="hidden print:flex flex-col items-center justify-center pb-4 mb-4 border-b-[3px] border-purple-600 text-center">
                    {instituteLogo && (
                        <img src={instituteLogo} alt="University Logo" className="w-16 h-16 object-contain mb-2" />
                    )}
                    <h1 className="text-xl font-black text-purple-900 uppercase tracking-widest leading-tight">
                        {instituteData?.instituteName || "University Name Not Found"}
                    </h1>
                    <h2 className="text-xs font-bold text-teal-700 mt-1.5 uppercase tracking-widest">
                        Provisional Statement of Marks
                    </h2>
                </div>

                {/* 💻 WEB VIEW HEADER */}
                <div className="print:hidden bg-gray-50/90 border-b border-gray-300 p-4 sm:p-6 backdrop-blur-[2px] relative flex flex-col items-center justify-center gap-4 sm:gap-0 min-h-[110px]">
                    <div className="sm:absolute sm:top-1/2 sm:-translate-y-1/2 sm:left-6 w-full sm:w-auto flex justify-center sm:justify-start">
                        <table className="text-left text-sm max-w-xs sm:max-w-none">
                            <tbody>
                                <tr>
                                    <td className="py-1 pr-4 font-bold text-gray-500 uppercase text-xs whitespace-nowrap">Student Name :-</td>
                                    <td className="py-1 font-extrabold text-gray-900 capitalize text-sm"> {displayData?.name || displayData?.full_name || '-'}</td>
                                </tr>
                                <tr>
                                    <td className="py-1 font-bold text-gray-500 uppercase text-xs">Registration No. :-</td>
                                    <td className="py-1 font-extrabold text-gray-900 uppercase text-sm"> {displayData?.registrationNo || '-'}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="flex flex-col items-center justify-center z-10">
                        <h2 className="text-xl sm:text-2xl font-black text-gray-900 uppercase tracking-widest leading-none mb-2.5">
                            Mark Sheet
                        </h2>
                        <span className="px-3 py-1.5 bg-white border border-gray-300 text-gray-800 font-bold text-[10px] uppercase tracking-wider rounded shadow-sm">
                            {result.semester}
                        </span>
                    </div>

                    <div className="sm:absolute sm:top-1/2 sm:-translate-y-1/2 sm:right-6 w-full sm:w-auto flex flex-col items-center sm:items-end">
                        <button 
                            onClick={handleDownloadPDF} 
                            className="flex items-center gap-1.5 px-4 py-2 bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors rounded-lg text-xs font-bold border border-purple-200 shadow-sm mb-2"
                        >
                            <Download className="w-4 h-4" /> <span>Download PDF</span>
                        </button>
                        <p className="text-xs text-gray-600 font-medium whitespace-nowrap">
                            Declared: {new Date(result.declaredAt).toLocaleDateString()}
                        </p>
                    </div>
                </div>

                {/* 🎓 OFFICIAL STUDENT DETAILS (PRINT ONLY) */}
                <div className="hidden print:block w-full mb-4 mt-2 px-2">
                    <table className="w-full text-left text-sm">
                        <tbody>
                            <tr>
                                <td className="py-1 font-bold text-gray-500 w-36 uppercase text-xs">Student Name</td>
                                <td className="py-1 font-extrabold text-gray-900 capitalize text-sm">: {displayData?.name || displayData?.full_name || '-'}</td>
                                <td className="py-1 font-bold text-gray-500 w-32 uppercase text-xs">Semester</td>
                                <td className="py-1 font-extrabold text-gray-900 text-sm">: {result.semester}</td>
                            </tr>
                            <tr>
                                <td className="py-1 font-bold text-gray-500 uppercase text-xs">Registration No.</td>
                                <td className="py-1 font-extrabold text-gray-900 uppercase text-sm">: {displayData?.registrationNo || '-'}</td>
                                <td className="py-1 font-bold text-gray-500 uppercase text-xs">Year</td>
                                <td className="py-1 font-extrabold text-gray-900 text-sm">: {getYearFromSemester(result.semester)}</td>
                            </tr>
                            <tr>
                                <td className="py-1 font-bold text-gray-500 uppercase text-xs">Branch</td>
                                <td className="py-1 font-extrabold text-gray-900 capitalize text-sm">: {displayData?.branch || '-'}</td>
                                <td className="py-1 font-bold text-gray-500 uppercase text-xs">Batch</td>
                                <td className="py-1 font-extrabold text-gray-900 text-sm">: {displayData?.batch || '-'}</td>
                            </tr>
                            <tr>
                                <td className="py-1 font-bold text-gray-500 uppercase text-xs">Date of Issue</td>
                                <td className="py-1 font-extrabold text-gray-900 uppercase text-sm">: {new Date(result.declaredAt).toLocaleDateString()}</td>
                                <td colSpan="2"></td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* 📋 GRADES TABLE */}
                <div className="print:border-2 print:border-purple-200 print:rounded-xl print:overflow-hidden">
                    <div className="overflow-x-auto bg-transparent print:overflow-visible">
                        <table className="w-full text-left border-collapse min-w-[600px] bg-transparent">
                            <thead>
                                <tr className="bg-gray-100/60 print:bg-purple-50 text-[10px] sm:text-xs font-bold text-gray-700 print:text-purple-900 uppercase tracking-wider border-b-2 border-gray-300 print:border-purple-200">
                                    <th className="p-3 print:py-2 print:px-3 border-r border-gray-300 print:border-purple-200 w-24">Code</th>
                                    <th className="p-3 print:py-2 print:px-3 border-r border-gray-300 print:border-purple-200">Subject Name</th>
                                    <th className="p-3 print:py-2 print:px-3 border-r border-gray-300 print:border-purple-200 w-16 text-center">Type</th>
                                    <th className="p-3 print:py-2 print:px-3 border-r border-gray-300 print:border-purple-200 text-center">FIN/EXT</th>
                                    <th className="p-3 print:py-2 print:px-3 border-r border-gray-300 print:border-purple-200 text-center">TER/INT</th>
                                    <th className="p-3 print:py-2 print:px-3 border-r border-gray-300 print:border-purple-200 w-16 text-center">Cr.</th>
                                    <th className="p-3 print:py-2 print:px-3 border-r border-gray-300 print:border-purple-200 text-center">TOTAL</th>
                                    <th className="p-3 print:py-2 print:px-3 text-center">GRADE</th>
                                </tr>
                            </thead>
                            <tbody className="text-xs sm:text-sm print:text-xs font-medium text-gray-800 divide-y divide-gray-200 print:divide-purple-100">
                                {result.subjects?.map((sub, index) => (
                                    <tr key={index} className="hover:bg-gray-50/80 print:hover:bg-transparent transition-colors bg-transparent">
                                        <td className="p-3 print:py-2 print:px-3 border-r border-gray-200 print:border-purple-100 font-bold">{sub.subjectCode}</td>
                                        <td className="p-3 print:py-2 print:px-3 border-r border-gray-200 print:border-purple-100 text-gray-700">{sub.subjectName || '-'}</td>
                                        <td className="p-3 print:py-2 print:px-3 border-r border-gray-200 print:border-purple-100 text-center text-[10px] uppercase text-gray-500">{sub.type}</td>
                                        <td className="p-3 print:py-2 print:px-3 border-r border-gray-200 print:border-purple-100 text-center">{sub.finExt || '-'}</td>
                                        <td className="p-3 print:py-2 print:px-3 border-r border-gray-200 print:border-purple-100 text-center">{sub.terInt || '-'}</td>
                                        <td className="p-3 print:py-2 print:px-3 border-r border-gray-200 print:border-purple-100 text-center font-bold text-gray-600">{sub.credits}</td>
                                        <td className="p-3 print:py-2 print:px-3 border-r border-gray-200 print:border-purple-100 text-center font-bold text-gray-900">{sub.total || '-'}</td>
                                        <td className={`p-3 print:py-2 print:px-3 text-center font-extrabold ${sub.grade === 'F' ? 'text-red-600' : 'text-teal-700'}`}>{sub.grade}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    
                    {/* 🔢 TOTALS FOOTER */}
                    <div className="bg-gray-100/80 print:bg-purple-50/50 border-t-2 border-gray-300 print:border-purple-200 p-4 print:p-3 backdrop-blur-[2px] print:backdrop-blur-none print-break-inside-avoid">
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-4 text-center divide-x divide-gray-300 print:divide-purple-200">
                            <div className="px-2 print:px-1"><p className="text-[10px] print:text-[10px] font-bold text-gray-500 uppercase">Theory</p><p className="text-sm print:text-sm font-extrabold text-gray-900">{result.totalTheory || '-'}</p></div>
                            <div className="px-2 print:px-1 hidden sm:block print:block"><p className="text-[10px] print:text-[10px] font-bold text-gray-500 uppercase">Practical</p><p className="text-sm print:text-sm font-extrabold text-gray-900">{result.totalPractical || '-'}</p></div>
                            <div className="px-2 print:px-1"><p className="text-[10px] print:text-[10px] font-bold text-gray-500 uppercase">Grand Total</p><p className="text-sm print:text-sm font-extrabold text-gray-900">{result.grandTotal || '-'}</p></div>
                            <div className="px-2 print:px-1"><p className="text-[10px] print:text-[10px] font-bold text-gray-500 uppercase">Credits</p><p className="text-sm print:text-sm font-extrabold text-gray-900">{totalCr || '-'}</p></div>
                            <div className="px-2 print:px-1"><p className="text-[10px] print:text-[10px] font-bold text-gray-500 uppercase">SGPA</p><p className="text-lg print:text-base font-black text-purple-700 leading-none">{result.sgpa?.toFixed(2)}</p></div>
                            <div className="px-2 print:px-1 col-span-3 sm:col-span-1 print:col-span-1 border-none sm:border-solid print:border-solid mt-2 sm:mt-0 print:mt-0">
                                <p className="text-[10px] print:text-[10px] font-bold text-gray-500 uppercase mb-1">Remarks</p>
                                <span className={`inline-block px-3 py-1 print:px-2 print:py-0.5 rounded-sm text-xs print:text-[10px] font-black uppercase tracking-wider border ${result.remarks === 'PASSED' ? 'bg-teal-50 text-teal-700 border-teal-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>{result.remarks}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 🖋️ OFFICIAL SIGNATURE LINES */}
                <div className="hidden print:flex justify-between items-end mt-12 px-8 print-break-inside-avoid">
                    <div className="text-center">
                        <div className="w-40 border-b border-gray-400 mb-2"></div>
                        <p className="text-[10px] font-bold text-gray-500 uppercase">Prepared By</p>
                    </div>
                    <div className="text-center">
                        <div className="w-40 border-b border-gray-400 mb-2"></div>
                        <p className="text-[10px] font-bold text-gray-500 uppercase">Checked By</p>
                    </div>
                    <div className="text-center">
                        <div className="w-48 border-b border-gray-400 mb-2"></div>
                        <p className="text-[10px] font-bold text-gray-500 uppercase">Controller of Examinations</p>
                    </div>
                </div>
                
                <div className="hidden print:block text-center mt-6 text-[10px] text-gray-400 font-medium pb-2 print-break-inside-avoid">
                    * This is a computer-generated provisional mark sheet.
                </div>

            </div>
        </div>
    );
};

// ==========================================
// 🚀 MAIN COMPONENT
// ==========================================
const ProfileResults = ({ userId, isCurrentUser, isResultsPublic = true, instituteLogo }) => {
    const { authData, instituteData } = useAuth(); 
    const [results, setResults] = useState([]);
    const [fetchedTargetUser, setFetchedTargetUser] = useState(null); 
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState(""); 
    const [selectedSemester, setSelectedSemester] = useState('Semester 1');

    const currentUserData = authData?.user || authData || {};
    const displayData = isCurrentUser ? currentUserData : (fetchedTargetUser || currentUserData);

    useEffect(() => {
        const fetchData = async () => {
            if (!isCurrentUser && !isResultsPublic) {
                setLoading(false);
                return;
            }

            setLoading(true);
            setErrorMsg(""); 
            
            try {
                const rawData = isCurrentUser ? await getMyResults() : await getUserResults(userId);
                const actualResults = Array.isArray(rawData) ? rawData : (rawData?.results || rawData?.data || []);

                if (!Array.isArray(actualResults)) throw new Error("Backend did not return an array of results.");
                setResults(actualResults);
                
                if (!isCurrentUser && userId) {
                    try {
                        const userDataRes = await getUserById(userId);
                        setFetchedTargetUser(userDataRes);
                    } catch (userErr) {
                        console.warn("Failed to fetch target user details:", userErr);
                    }
                }
                
                if (actualResults.length > 0) {
                    const sortedResults = [...actualResults].sort((a, b) => a.semester.localeCompare(b.semester));
                    setSelectedSemester(sortedResults[sortedResults.length - 1].semester);
                }
                
            } catch (error) {
                console.error("Failed to fetch results:", error);
                setErrorMsg(error.message || "An unknown error occurred while fetching results.");
                setResults([]);
            } finally {
                setLoading(false);
            }
        };

        if (userId) fetchData();
    }, [userId, isCurrentUser, isResultsPublic]);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-16 bg-white rounded-[1.5rem] shadow-sm border border-gray-100 w-full">
                <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
            </div>
        );
    }

    if (errorMsg) {
        return (
            <div className="flex flex-col items-center justify-center py-12 bg-rose-50 rounded-xl shadow-sm border border-rose-200 flex-1 w-full animate-in fade-in duration-300">
                <AlertTriangle className="w-12 h-12 text-rose-500 mb-3" />
                <h3 className="text-lg font-extrabold text-rose-800">Connection Error</h3>
                <p className="text-sm text-rose-600 mt-2 text-center px-4 font-medium">The backend failed to return the results.</p>
                <div className="mt-4 p-3 bg-white border border-rose-100 rounded-lg shadow-inner text-xs text-rose-800 max-w-xs overflow-auto">
                    <code>{errorMsg}</code>
                </div>
            </div>
        );
    }

    if (!isCurrentUser && !isResultsPublic) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl shadow-sm border border-gray-200 flex-1 w-full animate-in fade-in duration-300">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
                    <Lock className="w-8 h-8 text-gray-300" />
                </div>
                <h3 className="text-lg font-extrabold text-gray-800">Results are Private</h3>
                <p className="text-sm text-gray-500 mt-2 text-center max-w-sm px-4 font-medium">This student has chosen to keep their academic transcripts private.</p>
            </div>
        );
    }

    const displayedResults = results.filter(r => r.semester === selectedSemester);

    return (
        <div className="flex flex-col h-full w-full min-h-0 gap-4">
            
            <style>{`
                @media print {
                    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background: white; }
                    @page { size: A4 portrait; margin: 10mm; }
                    .print-break-inside-avoid { break-inside: avoid; page-break-inside: avoid; }
                    tr { break-inside: avoid; page-break-inside: avoid; }
                    .watermark-container { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 0; }
                }
            `}</style>

            <div className="flex gap-1.5 sm:gap-2 overflow-x-auto custom-scrollbar pb-2 w-full pt-1 px-1 print:hidden">
                {ALL_SEMESTERS.map((sem) => {
                    const hasData = results.some(r => r.semester === sem);
                    const displayText = sem.replace('Semester ', 'Sem ');
                    
                    return (
                        <button
                            key={sem}
                            onClick={() => setSelectedSemester(sem)}
                            className={`px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm font-extrabold rounded-xl whitespace-nowrap transition-all duration-200 flex-1 min-w-[70px] ${
                                selectedSemester === sem
                                ? 'bg-gradient-to-r from-purple-600 to-teal-500 text-white shadow-md transform scale-[1.02]'
                                : hasData
                                    ? 'bg-white text-gray-800 hover:bg-gray-50 border border-gray-200 shadow-sm'
                                    : 'bg-gray-50 text-gray-400 hover:bg-gray-100 border border-gray-200 border-dashed'
                            }`}
                        >
                            {displayText}
                        </button>
                    );
                })}
            </div>

            <div className="space-y-6 pb-4 w-full print:block print:space-y-0">
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
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl shadow-sm border border-gray-200 flex-1 w-full animate-in fade-in duration-300 print:hidden">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
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