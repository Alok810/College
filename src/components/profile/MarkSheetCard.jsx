import React, { useRef } from 'react';
import { Download } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';

const getYearFromSemester = (semester) => {
    const yearMap = {
        'Semester 1': '1st Year', 'Semester 2': '1st Year',
        'Semester 3': '2nd Year', 'Semester 4': '2nd Year',
        'Semester 5': '3rd Year', 'Semester 6': '3rd Year',
        'Semester 7': '4th Year', 'Semester 8': '4th Year',
    };
    return yearMap[semester] || '-';
};

const MarkSheetCard = ({ result, displayData, instituteData, instituteLogo }) => {
    const contentRef = useRef(null);
    const totalCr = result.subjects?.reduce((sum, sub) => sum + (parseFloat(sub.credits) || 0), 0);

    const studentInfo = result.student || displayData || {};
    const studentName = studentInfo.name || studentInfo.full_name || '-';
    const registrationNo = studentInfo.registrationNo || '-';
    const branch = studentInfo.branch || '-';
    const batch = studentInfo.batch || '-';

    const handleDownloadPDF = useReactToPrint({
        contentRef: contentRef, 
        documentTitle: `Transcript_${registrationNo}_${result.semester.replace(' ', '_')}`,
    });

    return (
        <div 
            ref={contentRef} 
            className="w-full max-w-full min-w-0 bg-white rounded-xl shadow-sm border border-gray-300 overflow-hidden print:overflow-visible print:block print:h-auto print:border-none print:shadow-none animate-in fade-in slide-in-from-bottom-4 duration-300 relative print:p-10 print:m-0"
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

            <div className="relative z-10 print:block w-full min-w-0">
                
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

                {/* 💻 WEB & MOBILE VIEW HEADER (No rigid tables!) */}
                <div className="print:hidden bg-gray-50/90 border-b border-gray-300 p-4 md:p-6 backdrop-blur-[2px] flex flex-col md:flex-row items-center justify-between gap-4 w-full min-w-0">
                    
                    {/* MOBILE TITLE */}
                    <div className="flex md:hidden flex-col items-center justify-center w-full mb-1">
                        <h2 className="text-xl font-black text-gray-900 uppercase tracking-widest leading-none mb-2">
                            Mark Sheet
                        </h2>
                        <span className="px-3 py-1 bg-white border border-gray-300 text-gray-800 font-bold text-[10px] uppercase tracking-wider rounded shadow-sm">
                            {result.semester}
                        </span>
                    </div>

                    {/* LEFT: Student Info Box */}
                    <div className="w-full md:w-1/3 flex flex-row md:flex-col justify-between md:justify-start items-center md:items-start text-left space-y-0 md:space-y-2 order-2 md:order-1 bg-white md:bg-transparent p-3 md:p-0 rounded-lg border md:border-none border-gray-100 shadow-sm md:shadow-none min-w-0">
                        <div className="min-w-0 flex-1">
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Student Name</p>
                            <p className="text-sm font-extrabold text-gray-900 capitalize truncate">{studentName}</p>
                        </div>
                        <div className="min-w-0 flex-1 text-right md:text-left">
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Registration No.</p>
                            <p className="text-sm font-extrabold text-gray-900 uppercase break-all">{registrationNo}</p>
                        </div>
                    </div>

                    {/* CENTER TITLE (Desktop) */}
                    <div className="hidden md:flex flex-col items-center justify-center w-full md:w-1/3 order-1 md:order-2">
                        <h2 className="text-2xl font-black text-gray-900 uppercase tracking-widest leading-none mb-2">
                            Mark Sheet
                        </h2>
                        <span className="px-3 py-1.5 bg-white border border-gray-300 text-gray-800 font-bold text-[10px] uppercase tracking-wider rounded shadow-sm">
                            {result.semester}
                        </span>
                    </div>

                    {/* RIGHT: Actions */}
                    <div className="w-full md:w-1/3 flex flex-col items-center md:items-end order-3 mt-2 md:mt-0 min-w-0">
                        <button 
                            onClick={handleDownloadPDF} 
                            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors rounded-lg text-xs font-bold border border-purple-200 shadow-sm mb-2 w-full md:w-auto"
                        >
                            <Download className="w-4 h-4 shrink-0" /> <span className="whitespace-nowrap">Download PDF</span>
                        </button>
                        <p className="text-[10px] text-gray-600 font-medium truncate">
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
                                <td className="py-1 font-extrabold text-gray-900 capitalize text-sm">: {studentName}</td>
                                <td className="py-1 font-bold text-gray-500 w-32 uppercase text-xs">Semester</td>
                                <td className="py-1 font-extrabold text-gray-900 text-sm">: {result.semester}</td>
                            </tr>
                            <tr>
                                <td className="py-1 font-bold text-gray-500 uppercase text-xs">Registration No.</td>
                                <td className="py-1 font-extrabold text-gray-900 uppercase text-sm">: {registrationNo}</td>
                                <td className="py-1 font-bold text-gray-500 uppercase text-xs">Year</td>
                                <td className="py-1 font-extrabold text-gray-900 text-sm">: {getYearFromSemester(result.semester)}</td>
                            </tr>
                            <tr>
                                <td className="py-1 font-bold text-gray-500 uppercase text-xs">Branch</td>
                                <td className="py-1 font-extrabold text-gray-900 capitalize text-sm">: {branch}</td>
                                <td className="py-1 font-bold text-gray-500 uppercase text-xs">Batch</td>
                                <td className="py-1 font-extrabold text-gray-900 text-sm">: {batch}</td>
                            </tr>
                            <tr>
                                <td className="py-1 font-bold text-gray-500 uppercase text-xs">Date of Issue</td>
                                <td className="py-1 font-extrabold text-gray-900 uppercase text-sm">: {new Date(result.declaredAt).toLocaleDateString()}</td>
                                <td colSpan="2"></td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* 📋 GRADES (Responsive) */}
                <div className="print:border-2 print:border-purple-200 print:rounded-xl print:overflow-hidden bg-white/50 w-full min-w-0">
                    
                    {/* MOBILE VIEW: Vertical Cards */}
                    <div className="block md:hidden print:hidden px-3 py-2 space-y-3 w-full min-w-0">
                        {result.subjects?.map((sub, index) => (
                            <div key={index} className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm flex flex-col gap-2 relative w-full min-w-0">
                                <div className={`absolute top-3 right-3 text-lg font-black ${sub.grade === 'F' ? 'text-red-600' : 'text-teal-700'}`}>
                                    {sub.grade}
                                </div>
                                
                                <div className="pr-10 w-full min-w-0">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase truncate">{sub.subjectCode}</p>
                                    {/* 🟢 FIXED: Changed text-gray-800 to text-purple-800 for mobile subject name */}
                                    <p className="text-sm font-bold text-purple-800 leading-tight mt-0.5 break-words">{sub.subjectName || '-'}</p>
                                </div>

                                <div className="flex flex-row justify-between items-center mt-2 pt-2 border-t border-gray-100 text-center w-full">
                                    <div className="flex flex-col items-center flex-1 min-w-0">
                                        <p className="text-[9px] font-bold text-gray-500 uppercase truncate">Type</p>
                                        <p className="text-xs font-semibold text-gray-700 truncate">{sub.type}</p>
                                    </div>
                                    <div className="flex flex-col items-center flex-1 border-l border-gray-100 min-w-0">
                                        <p className="text-[9px] font-bold text-gray-500 uppercase truncate">Ext.</p>
                                        <p className="text-xs font-semibold text-gray-700 truncate">{sub.finExt || '-'}</p>
                                    </div>
                                    <div className="flex flex-col items-center flex-1 border-l border-gray-100 min-w-0">
                                        <p className="text-[9px] font-bold text-gray-500 uppercase truncate">Int.</p>
                                        <p className="text-xs font-semibold text-gray-700 truncate">{sub.terInt || '-'}</p>
                                    </div>
                                    <div className="flex flex-col items-center flex-1 border-l border-gray-100 min-w-0">
                                        <p className="text-[9px] font-bold text-gray-500 uppercase truncate">Total</p>
                                        <p className="text-xs font-bold text-gray-900 truncate">{sub.total || '-'}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* DESKTOP/PRINT VIEW: Standard Table */}
                    <div className="hidden md:block print:block overflow-x-auto bg-transparent print:overflow-visible w-full max-w-full">
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
                    <div className="bg-gray-100/80 print:bg-purple-50/50 border-t-2 border-gray-300 print:border-purple-200 p-3 backdrop-blur-[2px] print:backdrop-blur-none print-break-inside-avoid w-full min-w-0">
                        <div className="grid grid-cols-3 md:grid-cols-6 gap-1 md:gap-4 text-center divide-x divide-gray-300 print:divide-purple-200 w-full min-w-0">
                            <div className="px-1 min-w-0"><p className="text-[10px] font-bold text-gray-500 uppercase truncate">Theory</p><p className="text-xs sm:text-sm font-extrabold text-gray-900 truncate">{result.totalTheory || '-'}</p></div>
                            <div className="px-1 hidden md:block print:block min-w-0"><p className="text-[10px] font-bold text-gray-500 uppercase truncate">Practical</p><p className="text-xs sm:text-sm font-extrabold text-gray-900 truncate">{result.totalPractical || '-'}</p></div>
                            <div className="px-1 min-w-0"><p className="text-[10px] font-bold text-gray-500 uppercase truncate">Total</p><p className="text-xs sm:text-sm font-extrabold text-gray-900 truncate">{result.grandTotal || '-'}</p></div>
                            <div className="px-1 hidden md:block print:block min-w-0"><p className="text-[10px] font-bold text-gray-500 uppercase truncate">Credits</p><p className="text-xs sm:text-sm font-extrabold text-gray-900 truncate">{totalCr || '-'}</p></div>
                            <div className="px-1 min-w-0"><p className="text-[10px] font-bold text-gray-500 uppercase truncate">SGPA</p><p className="text-sm sm:text-lg font-black text-purple-700 leading-none truncate mt-0.5 sm:mt-0">{result.sgpa?.toFixed(2)}</p></div>
                            <div className="px-1 col-span-3 md:col-span-1 print:col-span-1 border-none md:border-solid print:border-solid mt-2 md:mt-0 print:mt-0 min-w-0">
                                <p className="text-[9px] font-bold text-gray-500 uppercase mb-1 truncate">Remarks</p>
                                <span className={`inline-block px-2 py-0.5 rounded-sm text-[10px] font-black uppercase tracking-wider border truncate ${result.remarks === 'PASSED' ? 'bg-teal-50 text-teal-700 border-teal-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>{result.remarks}</span>
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

export default MarkSheetCard;