import React, { useRef, useState } from 'react';
import { Download, Loader2, FileText } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';

// 🟢 Native App Imports
import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';
import html2canvas from 'html2canvas-pro'; 
import jsPDF from 'jspdf';
import { uploadTempPdf, BACKEND_URL } from '../../api';

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
    const [isGeneratingNative, setIsGeneratingNative] = useState(false);
    const totalCr = result.subjects?.reduce((sum, sub) => sum + (parseFloat(sub.credits) || 0), 0);

    const studentInfo = result.student || displayData || {};
    const studentName = studentInfo.name || studentInfo.full_name || '-';
    const registrationNo = studentInfo.registrationNo || '-';
    const branch = studentInfo.branch || '-';
    const batch = studentInfo.batch || '-';

    // 🌐 Web Download Logic
    const handleWebDownload = useReactToPrint({
        contentRef: contentRef, 
        documentTitle: `Transcript_${registrationNo}_${result.semester.replace(' ', '_')}`,
    });

   // 📱 Native Mobile Download Logic via API
    const handleDownloadPDF = async () => {
        if (!Capacitor.isNativePlatform()) {
            handleWebDownload();
            return;
        }

        setIsGeneratingNative(true);

        setTimeout(async () => {
            try {
                // 1. Take High-Quality Desktop Screenshot
                const element = contentRef.current;
                const canvas = await html2canvas(element, { 
                    scale: 2, 
                    useCORS: true,
                    backgroundColor: '#ffffff',
                    windowWidth: 800
                });
                
                // 🟢 THE FIX: Change from 'image/png' to 'image/jpeg' with 0.75 (75%) quality
                // This compresses the image dynamically without losing readable text quality!
                const imgData = canvas.toDataURL('image/jpeg', 0.75);
                
                const pdf = new jsPDF('p', 'mm', 'a4');
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
                
                // 🟢 THE FIX: Tell jsPDF we are injecting a JPEG, and use 'FAST' compression
                pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
                
                const base64Data = pdf.output('datauristring').split(',')[1];
                const fileName = `Transcript_${registrationNo}_${result.semester.replace(' ', '_')}.pdf`;
                
               // 2. Upload to Backend Temp Storage
                await uploadTempPdf(base64Data, fileName);

                // 3. Hand the secure URL to the Android OS Download Manager!
                const downloadUrl = `${BACKEND_URL}/api/v1/results/download-temp-pdf/${fileName}`;
                
                // 🟢 THE SILENT DOWNLOAD FIX:
                // Create an invisible link inside the app and "click" it.
                // Because this is a real HTTPS URL and the server sends an 'attachment' header,
                // Capacitor catches it and silently tells Android to download it without any popups!
                const link = document.createElement('a');
                link.href = downloadUrl;
                link.download = fileName; // Forces download behavior
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                alert(`✅ Downloading ${fileName}... Check your notification panel!`);

            } catch (error) {
                console.error('Error generating native PDF:', error);
                alert('❌ Failed to generate PDF on mobile.');
            } finally {
                setIsGeneratingNative(false);
            }
        }, 300); 
    };

    return (
        <>
            {isGeneratingNative && (
                <div className="fixed inset-0 z-[99999] bg-white flex flex-col items-center justify-center animate-in fade-in duration-200">
                    <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mb-6 border-4 border-purple-100">
                        <FileText className="w-10 h-10 text-purple-500 animate-pulse" />
                    </div>
                    <Loader2 className="w-8 h-8 text-teal-500 animate-spin mb-4" />
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">Generating PDF</h2>
                    <p className="text-sm font-bold text-gray-500 mt-1 uppercase tracking-widest">Preparing official document...</p>
                </div>
            )}

            <div 
                ref={contentRef} 
                className={`w-full min-w-0 bg-white rounded-xl shadow-sm border border-gray-300 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300 relative print:p-8 print:m-0 print:w-[800px] print:max-w-[800px] print:mx-auto print:overflow-visible print:border-none print:shadow-none ${
                    isGeneratingNative ? '!w-[800px] !max-w-[800px] !p-8 !fixed !top-0 !left-0 !z-[9998] !border-none !shadow-none !rounded-none' : ''
                }`}
            >
                <style>{`
                    @media print {
                        body {
                            -webkit-print-color-adjust: exact !important;
                            print-color-adjust: exact !important;
                        }
                        @page { size: A4 portrait; margin: 10mm; } 
                        .print-break-inside-avoid { break-inside: avoid; page-break-inside: avoid; }
                        tr { break-inside: avoid; page-break-inside: avoid; }
                    }
                `}</style>

                <div className="relative z-10 w-full min-w-0">
                    
                    {/* 🎓 OFFICIAL PRINT HEADER */}
                    <div className={`${isGeneratingNative ? 'flex' : 'hidden print:flex'} flex-col items-center justify-center pb-4 mb-4 border-b-[3px] border-purple-600 text-center`}>
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

                    {/* 💻 WEB & MOBILE VIEW HEADER */}
                    <div className={`${isGeneratingNative ? 'hidden' : 'print:hidden'} bg-gray-50/90 border-b border-gray-300 p-4 md:p-6 backdrop-blur-[2px] flex flex-col md:flex-row items-center justify-between gap-4 w-full min-w-0`}>
                        
                        {/* MOBILE TITLE */}
                        <div className="flex md:hidden flex-col items-center justify-center w-full mb-1">
                            <h2 className="text-xl font-black text-gray-900 uppercase tracking-widest leading-none mb-2">Mark Sheet</h2>
                            <span className="px-3 py-1 bg-white border border-gray-300 text-gray-800 font-bold text-[10px] uppercase tracking-wider rounded shadow-sm">
                                {result.semester}
                            </span>
                        </div>

                        {/* LEFT Student Info Box */}
                        <div className="w-full md:w-1/3 flex flex-row md:flex-col justify-between md:justify-start items-center md:items-start text-left space-y-0 md:space-y-2 order-2 md:order-1 bg-white md:bg-transparent p-3 md:p-0 rounded-lg border md:border-none border-gray-100 shadow-sm md:shadow-none min-w-0">
                            <div className="min-w-0 flex-1">
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Student Name</p>
                                <p className="text-sm font-extrabold text-gray-900 capitalize truncate">{studentName}</p>
                            </div>
                            <div className="min-w-0 flex-1 text-right md:text-left">
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Registration No.</p>
                                <p className="text-sm font-extrabold text-gray-900 uppercase truncate">{registrationNo}</p>
                            </div>
                        </div>

                        {/* CENTER TITLE (Desktop) */}
                        <div className="hidden md:flex flex-col items-center justify-center w-full md:w-1/3 order-1 md:order-2">
                            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-widest leading-none mb-2">Mark Sheet</h2>
                            <span className="px-3 py-1.5 bg-white border border-gray-300 text-gray-800 font-bold text-[10px] uppercase tracking-wider rounded shadow-sm">
                                {result.semester}
                            </span>
                        </div>

                        {/* RIGHT: Actions */}
                        <div className="w-full md:w-1/3 flex flex-col items-center md:items-end order-3 mt-2 md:mt-0 min-w-0">
                            <button 
                                onClick={handleDownloadPDF} 
                                disabled={isGeneratingNative}
                                className="flex items-center justify-center gap-2 px-6 py-2.5 bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors rounded-lg text-xs font-bold border border-purple-200 shadow-sm mb-2 w-full md:w-auto"
                            >
                                {isGeneratingNative ? (
                                    <><Loader2 className="w-4 h-4 animate-spin shrink-0" /> <span>Generating...</span></>
                                ) : (
                                    <><Download className="w-4 h-4 shrink-0" /> <span className="whitespace-nowrap">Download PDF</span></>
                                )}
                            </button>
                            <p className="text-[10px] text-gray-600 font-medium truncate">
                                Declared: {new Date(result.declaredAt).toLocaleDateString()}
                            </p>
                        </div>
                    </div>

                    {/* 🎓 OFFICIAL STUDENT DETAILS (PRINT ONLY) */}
                    <div className={`${isGeneratingNative ? 'block' : 'hidden print:block'} w-full mb-4 mt-2 px-2 print-break-inside-avoid`}>
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

                    {/* 📋 GRADES CONTAINER */}
                    <div className={`relative ${isGeneratingNative ? 'border-2 border-purple-200 rounded-xl overflow-hidden mt-0' : 'print:border-2 print:border-purple-200 print:rounded-xl print:overflow-hidden bg-white mt-4 md:mt-0 print:mt-0'} w-full min-w-0`}>
                        
                        {/* Watermark Overlay */}
                        {instituteLogo && (
                            <div className={`absolute inset-0 flex items-center justify-center pointer-events-none z-0 p-4 ${isGeneratingNative ? '' : 'print:watermark-container'}`}>
                                <img 
                                    src={instituteLogo} 
                                    alt="Institute Watermark" 
                                    className={`object-contain ${isGeneratingNative ? 'w-[500px] h-[500px] opacity-[0.12]' : 'w-[85%] h-[85%] opacity-10 print:opacity-[0.12]'}`}
                                    style={{ mixBlendMode: 'multiply' }}
                                />
                            </div>
                        )}

                        {/* 📱 MOBILE VIEW: Subject Cards (Hidden on Print & Native Gen) */}
                        <div className={`relative z-10 ${isGeneratingNative ? 'hidden' : 'block md:hidden print:hidden'} px-3 py-2 space-y-3 w-full min-w-0 bg-transparent border border-purple-200 rounded-xl`}>
                            {result.subjects?.map((sub, index) => (
                                <div key={index} className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg p-3 shadow-sm flex flex-col gap-2 relative w-full min-w-0">
                                    <div className={`absolute top-3 right-3 text-lg font-black ${sub.grade === 'F' ? 'text-red-600' : 'text-teal-700'}`}>
                                        {sub.grade}
                                    </div>
                                    <div className="pr-10 w-full min-w-0">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase truncate">{sub.subjectCode}</p>
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

                        {/* 💻 DESKTOP/PRINT VIEW: Standard Table */}
                        <div className={`relative z-10 ${isGeneratingNative ? 'block' : 'hidden md:block print:block'} overflow-x-auto bg-transparent print:overflow-visible w-full max-w-full`}>
                            <table className="w-full text-left border-collapse min-w-[600px] print:min-w-full bg-transparent">
                                <thead>
                                    <tr className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider border-b-2 ${isGeneratingNative ? 'bg-purple-50/80 text-purple-900 border-purple-200' : 'bg-gray-100/60 print:bg-purple-50/80 text-gray-700 print:text-purple-900 border-gray-300 print:border-purple-200'}`}>
                                        <th className={`p-3 print:py-2 print:px-3 border-r w-24 ${isGeneratingNative ? 'border-purple-200' : 'border-gray-300 print:border-purple-200'}`}>Code</th>
                                        <th className={`p-3 print:py-2 print:px-3 border-r ${isGeneratingNative ? 'border-purple-200' : 'border-gray-300 print:border-purple-200'}`}>Subject Name</th>
                                        <th className={`p-3 print:py-2 print:px-3 border-r w-16 text-center ${isGeneratingNative ? 'border-purple-200' : 'border-gray-300 print:border-purple-200'}`}>Type</th>
                                        <th className={`p-3 print:py-2 print:px-3 border-r text-center ${isGeneratingNative ? 'border-purple-200' : 'border-gray-300 print:border-purple-200'}`}>FIN/EXT</th>
                                        <th className={`p-3 print:py-2 print:px-3 border-r text-center ${isGeneratingNative ? 'border-purple-200' : 'border-gray-300 print:border-purple-200'}`}>TER/INT</th>
                                        <th className={`p-3 print:py-2 print:px-3 border-r w-16 text-center ${isGeneratingNative ? 'border-purple-200' : 'border-gray-300 print:border-purple-200'}`}>Cr.</th>
                                        <th className={`p-3 print:py-2 print:px-3 border-r text-center ${isGeneratingNative ? 'border-purple-200' : 'border-gray-300 print:border-purple-200'}`}>TOTAL</th>
                                        <th className="p-3 print:py-2 print:px-3 text-center">GRADE</th>
                                    </tr>
                                </thead>
                                <tbody className="text-xs sm:text-sm print:text-xs font-medium text-gray-800 divide-y divide-gray-200 print:divide-purple-100">
                                    {result.subjects?.map((sub, index) => (
                                        <tr key={index} className="hover:bg-gray-50/80 transition-colors bg-transparent">
                                            <td className={`p-3 print:py-2 print:px-3 border-r font-bold ${isGeneratingNative ? 'border-purple-100' : 'border-gray-200 print:border-purple-100'}`}>{sub.subjectCode}</td>
                                            <td className={`p-3 print:py-2 print:px-3 border-r text-gray-700 ${isGeneratingNative ? 'border-purple-100' : 'border-gray-200 print:border-purple-100'}`}>{sub.subjectName || '-'}</td>
                                            <td className={`p-3 print:py-2 print:px-3 border-r text-center text-[10px] uppercase text-gray-500 ${isGeneratingNative ? 'border-purple-100' : 'border-gray-200 print:border-purple-100'}`}>{sub.type}</td>
                                            <td className={`p-3 print:py-2 print:px-3 border-r text-center ${isGeneratingNative ? 'border-purple-100' : 'border-gray-200 print:border-purple-100'}`}>{sub.finExt || '-'}</td>
                                            <td className={`p-3 print:py-2 print:px-3 border-r text-center ${isGeneratingNative ? 'border-purple-100' : 'border-gray-200 print:border-purple-100'}`}>{sub.terInt || '-'}</td>
                                            <td className={`p-3 print:py-2 print:px-3 border-r text-center font-bold text-gray-600 ${isGeneratingNative ? 'border-purple-100' : 'border-gray-200 print:border-purple-100'}`}>{sub.credits}</td>
                                            <td className={`p-3 print:py-2 print:px-3 border-r text-center font-bold text-gray-900 ${isGeneratingNative ? 'border-purple-100' : 'border-gray-200 print:border-purple-100'}`}>{sub.total || '-'}</td>
                                            <td className={`p-3 print:py-2 print:px-3 text-center font-extrabold ${sub.grade === 'F' ? 'text-red-600' : 'text-teal-700'}`}>{sub.grade}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        
                        {/* 📱 MOBILE VIEW: Totals Footer */}
                        <div className={`relative z-10 ${isGeneratingNative ? 'hidden' : 'block md:hidden print:hidden'} bg-white/90 backdrop-blur-sm border border-purple-200 mt-[-2px] rounded-xl p-4 w-full min-w-0`}>
                            <div className="grid grid-cols-3 gap-y-5 text-center w-full min-w-0">
                                {/* Row 1 */}
                                <div className="flex flex-col border-r border-purple-200 min-w-0 px-1"><p className="text-[9px] font-bold text-gray-500 uppercase truncate mb-1">Theory</p><p className="text-[13px] font-extrabold text-gray-900 truncate">{result.totalTheory || '-'}</p></div>
                                <div className="flex flex-col border-r border-purple-200 min-w-0 px-1"><p className="text-[9px] font-bold text-gray-500 uppercase truncate mb-1">Practical</p><p className="text-[13px] font-extrabold text-gray-900 truncate">{result.totalPractical || '-'}</p></div>
                                <div className="flex flex-col min-w-0 px-1"><p className="text-[9px] font-bold text-gray-500 uppercase truncate mb-1">Total</p><p className="text-[13px] font-extrabold text-gray-900 truncate">{result.grandTotal || '-'}</p></div>
                                {/* Row 2 */}
                                <div className="flex flex-col border-r border-purple-200 min-w-0 px-1"><p className="text-[9px] font-bold text-gray-500 uppercase truncate mb-1">Credits</p><p className="text-[13px] font-extrabold text-gray-900 truncate">{totalCr || '-'}</p></div>
                                <div className="flex flex-col border-r border-purple-200 min-w-0 px-1"><p className="text-[9px] font-bold text-gray-500 uppercase truncate mb-1">SGPA</p><p className="text-[15px] font-black text-purple-700 leading-none truncate">{result.sgpa?.toFixed(2)}</p></div>
                                <div className="flex flex-col min-w-0 px-1 items-center justify-start"><p className="text-[9px] font-bold text-gray-500 uppercase truncate mb-1">Remarks</p><span className={`inline-block px-3 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border truncate ${result.remarks === 'PASSED' ? 'bg-transparent text-teal-600 border-teal-200' : 'bg-transparent text-amber-600 border-amber-200'}`}>{result.remarks}</span></div>
                            </div>
                        </div>

                        {/* 💻 DESKTOP/PRINT VIEW: Totals Footer */}
                        <div className={`relative z-10 ${isGeneratingNative ? 'block bg-purple-50/50 border-t-2 border-purple-200' : 'hidden md:block print:block bg-gray-100/80 print:bg-purple-50/50 border-t-2 border-gray-300 print:border-purple-200'} p-3 backdrop-blur-[2px] print:backdrop-blur-none print-break-inside-avoid w-full min-w-0`}>
                            <div className={`grid grid-cols-6 gap-4 text-center divide-x w-full min-w-0 ${isGeneratingNative ? 'divide-purple-200' : 'divide-gray-300 print:divide-purple-200'}`}>
                                <div className="px-1 min-w-0"><p className="text-[10px] font-bold text-gray-500 uppercase truncate">Theory</p><p className="text-sm font-extrabold text-gray-900 truncate">{result.totalTheory || '-'}</p></div>
                                <div className="px-1 min-w-0"><p className="text-[10px] font-bold text-gray-500 uppercase truncate">Practical</p><p className="text-sm font-extrabold text-gray-900 truncate">{result.totalPractical || '-'}</p></div>
                                <div className="px-1 min-w-0"><p className="text-[10px] font-bold text-gray-500 uppercase truncate">Total</p><p className="text-sm font-extrabold text-gray-900 truncate">{result.grandTotal || '-'}</p></div>
                                <div className="px-1 min-w-0"><p className="text-[10px] font-bold text-gray-500 uppercase truncate">Credits</p><p className="text-sm font-extrabold text-gray-900 truncate">{totalCr || '-'}</p></div>
                                <div className="px-1 min-w-0"><p className="text-[10px] font-bold text-gray-500 uppercase truncate">SGPA</p><p className="text-lg font-black text-purple-700 leading-none truncate mt-0.5">{result.sgpa?.toFixed(2)}</p></div>
                                <div className="px-1 min-w-0">
                                    <p className="text-[9px] font-bold text-gray-500 uppercase mb-1 truncate">Remarks</p>
                                    <span className={`inline-block px-2 py-0.5 rounded-sm text-[10px] font-black uppercase tracking-wider border truncate ${result.remarks === 'PASSED' ? 'bg-teal-50 text-teal-700 border-teal-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>{result.remarks}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 🖋️ OFFICIAL SIGNATURE LINES */}
                    <div className={`${isGeneratingNative ? 'flex' : 'hidden print:flex'} justify-between items-end mt-12 px-8 print-break-inside-avoid`}>
                        <div className="text-center"><div className="w-40 border-b border-gray-400 mb-2"></div><p className="text-[10px] font-bold text-gray-500 uppercase">Prepared By</p></div>
                        <div className="text-center"><div className="w-40 border-b border-gray-400 mb-2"></div><p className="text-[10px] font-bold text-gray-500 uppercase">Checked By</p></div>
                        <div className="text-center"><div className="w-48 border-b border-gray-400 mb-2"></div><p className="text-[10px] font-bold text-gray-500 uppercase">Controller of Examinations</p></div>
                    </div>
                    
                    <div className={`${isGeneratingNative ? 'block' : 'hidden print:block'} text-center mt-6 text-[10px] text-gray-400 font-medium pb-2 print-break-inside-avoid`}>
                        * This is a computer-generated provisional mark sheet.
                    </div>

                </div>
            </div>
        </>
    );
};

export default MarkSheetCard;