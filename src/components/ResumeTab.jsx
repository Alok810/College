import React from "react"; // 🟢 Removed useState, it is now passed as a prop!
import { useNavigate } from "react-router-dom";
import { 
  FileText, Edit, PlusCircle, Monitor, Printer, ExternalLink, ChevronDown, Settings2 
} from "lucide-react";

// 🔥 IMPORT THE TEMPLATES 
import AlokTemplate from "../components/resume-templates/AlokTemplate";
import ClassicTemplate from "../components/resume-templates/ClassicTemplate";
import ModernTemplate from "../components/resume-templates/ModernTemplate";

// 🟢 Accept viewMode and setViewMode as PROPS from Profile.jsx!
const ResumeTab = ({ user, isCurrentUser, viewMode = "web", setViewMode }) => {
  const navigate = useNavigate();
  
  const resumeData = user?.resumeData;
  const hasResume = resumeData && (resumeData.summary || resumeData.education?.length > 0 || resumeData.experience?.length > 0);

  if (!hasResume) {
    return (
      <div className="flex flex-col items-center text-center p-10 bg-white border border-gray-100 rounded-xl shadow-sm w-full max-w-3xl mx-auto">
        <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mb-4">
          <FileText className="w-8 h-8 text-purple-400" />
        </div>
        <h4 className="text-xl font-bold text-gray-800 mb-2">No Interactive Resume</h4>
        <p className="text-sm text-gray-500 max-w-sm mb-6">
          {isCurrentUser 
            ? "Stand out to peers and recruiters by building your professional profile directly on Rigya." 
            : "This user hasn't built their profile resume yet."}
        </p>
        {isCurrentUser && (
          <button
            onClick={() => navigate('/resume-builder')}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-teal-500 text-white font-bold rounded-xl hover:opacity-90 transition shadow-md"
          >
            <PlusCircle className="w-5 h-5" /> Build Custom Resume
          </button>
        )}
      </div>
    );
  }

  // --- WEB VIEW RENDERER ---
  const renderWebView = () => (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4 sm:p-8 w-full max-w-4xl mx-auto relative font-sans animate-fadeIn">
        {/* Header / Contact Info */}
        <div className="border-b border-gray-200 pb-4 mb-6 text-center sm:text-left">
          <h1 className="text-3xl font-extrabold text-gray-900 uppercase tracking-wide">{resumeData.name || user.full_name || user.name}</h1>
          <p className="text-gray-700 font-bold mt-1 text-[15px] uppercase">
            <span dangerouslySetInnerHTML={{ __html: resumeData.academicStatus || "FINAL YEAR • B.TECH" }} />
          </p>
          
          {Array.isArray(resumeData.socialLinks) && (
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-[13px] text-gray-600 justify-center sm:justify-start">
              {resumeData.socialLinks.filter(link => link.visible !== false && link.url).map((link, idx) => (
                <span key={idx}>
                  {idx > 0 && "• "}
                  {link.platform === "Email" || link.platform === "Phone" ? (
                    <span>{link.url}</span>
                  ) : (
                    <a href={link.url.startsWith('http') ? link.url : `https://${link.url}`} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">
                      {link.text || link.url.replace(/^https?:\/\/(www\.)?/, '')}
                    </a>
                  )}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Summary */}
        {resumeData.summary && !resumeData.hiddenSections?.includes('summary') && (
          <div className="mb-6">
            <h2 className="text-[16px] font-bold text-gray-900 border-b-2 border-gray-800 pb-1 mb-2 uppercase tracking-wider">Summary</h2>
            <div className="text-gray-800 leading-snug profile-rich-text text-[14px]" dangerouslySetInnerHTML={{ __html: resumeData.summary }} />
          </div>
        )}

        {/* Education */}
        {Array.isArray(resumeData.education) && resumeData.education.length > 0 && !resumeData.hiddenSections?.includes('education') && (
          <div className="mb-6">
            <h2 className="text-[16px] font-bold text-gray-900 border-b-2 border-gray-800 pb-1 mb-3 uppercase tracking-wider">Education</h2>
            <div className="space-y-3">
              {resumeData.education.filter(edu => edu.visible !== false).map((edu, index) => (
                <div key={index}>
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-gray-900 text-[14px]">{edu.school}</h3>
                    <span className="text-[13px] font-bold text-gray-800">{edu.year}</span>
                  </div>
                  <p className="text-gray-800 text-[14px]" dangerouslySetInnerHTML={{ __html: edu.degree }} />
                  {edu.grade && <div className="mt-0.5 text-[13px] text-gray-600 italic profile-rich-text" dangerouslySetInnerHTML={{ __html: edu.grade }} />}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Experience */}
        {Array.isArray(resumeData.experience) && resumeData.experience.length > 0 && !resumeData.hiddenSections?.includes('experience') && (
          <div className="mb-6">
            <h2 className="text-[16px] font-bold text-gray-900 border-b-2 border-gray-800 pb-1 mb-3 uppercase tracking-wider">Experience</h2>
            <div className="space-y-4">
              {resumeData.experience.filter(exp => exp.visible !== false).map((exp, index) => (
                <div key={index}>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-1">
                    <h3 className="font-bold text-gray-900 text-[14px]">{exp.title} <span className="font-normal mx-1">|</span> {exp.company}</h3>
                    <span className="text-[13px] text-gray-800 font-bold mt-1 sm:mt-0">{exp.dates}</span>
                  </div>
                  <div className="text-[14px] text-gray-800 profile-rich-text leading-snug" dangerouslySetInnerHTML={{ __html: exp.description }} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {Array.isArray(resumeData.projects) && resumeData.projects.length > 0 && !resumeData.hiddenSections?.includes('projects') && (
          <div className="mb-6">
            <h2 className="text-[16px] font-bold text-gray-900 border-b-2 border-gray-800 pb-1 mb-3 uppercase tracking-wider">Projects</h2>
            <div className="space-y-4">
              {resumeData.projects.filter(proj => proj.visible !== false).map((proj, index) => (
                <div key={index}>
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-gray-900 text-[14px] flex items-center gap-2">
                      {proj.name}
                      {proj.url && <a href={proj.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700"><ExternalLink className="w-3.5 h-3.5" /></a>}
                    </h3>
                    <span className="text-[12px] font-mono text-gray-600 bg-gray-100 px-2 py-0.5 rounded">{proj.tech}</span>
                  </div>
                  <div className="text-[14px] text-gray-800 profile-rich-text leading-snug" dangerouslySetInnerHTML={{ __html: proj.description }} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills */}
        {resumeData.skills && !resumeData.hiddenSections?.includes('skills') && (
          <div className="mb-6">
            <h2 className="text-[16px] font-bold text-gray-900 border-b-2 border-gray-800 pb-1 mb-2 uppercase tracking-wider">Technical Skills</h2>
            <div className="text-gray-800 profile-rich-text text-[14px] leading-snug" dangerouslySetInnerHTML={{ __html: resumeData.skills }} />
          </div>
        )}

        {/* Dynamic Array Sections */}
        {[
          { key: 'publications', title: 'Publications', render: (items) => (
            <ul className="list-disc pl-5 space-y-2">
              {items.map((pub, idx) => (
                <li key={idx} className="text-[14px] text-gray-800 leading-snug">
                  <span className="font-bold">{pub.title}</span> {pub.date && <span className="text-gray-600 font-bold ml-1">({pub.date})</span>}<br/>
                  <span dangerouslySetInnerHTML={{ __html: pub.authors }} /><br/>
                  <span className="italic text-gray-600" dangerouslySetInnerHTML={{ __html: pub.details }} />
                </li>
              ))}
            </ul>
          )},
          { key: 'extracurriculars', title: 'Extra-Curriculars', render: (items) => (
            <div className="space-y-4">
              {items.map((act, idx) => (
                <div key={idx}>
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-gray-900 text-[14px]">{act.organization}</h3>
                    <span className="text-[13px] text-gray-800 font-bold">{act.dates}</span>
                  </div>
                  <div className="text-[14px] text-gray-800 font-medium italic mb-1">{act.role}</div>
                  <div className="text-[14px] text-gray-800 profile-rich-text leading-snug" dangerouslySetInnerHTML={{ __html: act.description }} />
                </div>
              ))}
            </div>
          )}
        ].map(section => {
           if (Array.isArray(resumeData[section.key]) && resumeData[section.key].length > 0 && !resumeData.hiddenSections?.includes(section.key)) {
              return (
                 <div key={section.key} className="mb-6">
                    <h2 className="text-[16px] font-bold text-gray-900 border-b-2 border-gray-800 pb-1 mb-3 uppercase tracking-wider">{section.title}</h2>
                    {section.render(resumeData[section.key].filter(item => item.visible !== false))}
                 </div>
              )
           }
           return null;
        })}

        {/* String-based Sections */}
        {[
          { key: 'honors', title: 'Selected Honors' },
          { key: 'patents', title: 'Patents' },
          { key: 'talks', title: 'Invited Talks' }
        ].map(section => {
           if (resumeData[section.key] && !resumeData.hiddenSections?.includes(section.key)) {
              return (
                 <div key={section.key} className="mb-6">
                    <h2 className="text-[16px] font-bold text-gray-900 border-b-2 border-gray-800 pb-1 mb-2 uppercase tracking-wider">{section.title}</h2>
                    <div className="text-gray-800 profile-rich-text text-[14px] leading-snug" dangerouslySetInnerHTML={{ __html: resumeData[section.key] }} />
                 </div>
              )
           }
           return null;
        })}

        {/* Custom Sections */}
        {Array.isArray(resumeData.customSections) && resumeData.customSections.map(customSec => {
           if (resumeData.hiddenSections?.includes(customSec.id) || customSec.visible === false) return null;
           return (
              <div key={customSec.id} className="mb-6">
                 <h2 className="text-[16px] font-bold text-gray-900 border-b-2 border-gray-800 pb-1 mb-2 uppercase tracking-wider">{customSec.title || "Custom Section"}</h2>
                 <div className="text-gray-800 profile-rich-text text-[14px] leading-snug" dangerouslySetInnerHTML={{ __html: customSec.content }} />
              </div>
           );
        })}
    </div>
  );

// --- A4 VIEW RENDERER ---
  const renderA4View = () => {
    const tpl = resumeData.template || "alok"; 
    
    // CSS Zoom perfectly scales the page without leaving giant blank gaps!
    const zoomLevel = typeof window !== 'undefined' && window.innerWidth < 640 ? 0.45 : typeof window !== 'undefined' && window.innerWidth < 1024 ? 0.7 : 1;

    return (
      <div className="w-full flex flex-col items-center justify-start animate-fadeIn pt-4 pb-8">
        {/* 🟢 REMOVED: shadow-2xl. The pages inside the template already have their own shadow! */}
        <div className="origin-top transition-all" style={{ zoom: zoomLevel }}>
          {tpl === "alok" && <AlokTemplate resumeData={resumeData} />}
          {tpl === "classic" && <ClassicTemplate resumeData={resumeData} />}
          {tpl === "modern" && <ModernTemplate resumeData={resumeData} />}
        </div>
      </div>
    );
  };
  return (
    <div className="w-full max-w-5xl mx-auto pb-10">
      <style>{`
        .profile-rich-text ul { list-style-type: disc; padding-left: 20px; margin-top: 4px; margin-bottom: 4px; }
        .profile-rich-text ol { list-style-type: decimal; padding-left: 20px; margin-top: 4px; margin-bottom: 4px; }
        .profile-rich-text li { margin-bottom: 4px; }
        .profile-rich-text b, .profile-rich-text strong { font-weight: 700; color: #1f2937; }
        .profile-rich-text i, .profile-rich-text em { font-style: italic; }
        .profile-rich-text u { text-decoration: underline; }
        .profile-rich-text a { color: #2563eb; text-decoration: none; }
        .profile-rich-text a:hover { text-decoration: underline; }
      `}</style>

      {/* 🔥 ADD lg:hidden HERE so it only shows on Mobile! Desktop uses the Header Dropdown. 🔥 */}
      <div className="flex justify-end items-center mb-6 px-2 z-50 relative lg:hidden">
        <div className="relative group">
          
          <button className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white font-bold text-sm rounded-lg shadow-md hover:bg-gray-800 transition-all">
            <Settings2 className="w-4 h-4" /> Resume Options <ChevronDown className="w-4 h-4 transition-transform duration-300 group-hover:rotate-180" />
          </button>
          
          {/* Dropdown Box */}
          <div className="absolute right-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 w-48 origin-top-right">
            <div className="bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden flex flex-col py-1">
              
              <button 
                onClick={() => setViewMode("web")}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold transition-colors w-full text-left ${viewMode === "web" ? "text-purple-700 bg-purple-50" : "text-gray-700 hover:bg-gray-50"}`}
              >
                <Monitor className="w-4 h-4" /> Web View
              </button>
              
              <button 
                onClick={() => setViewMode("a4")}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold transition-colors w-full text-left ${viewMode === "a4" ? "text-teal-700 bg-teal-50" : "text-gray-700 hover:bg-gray-50"}`}
              >
                <Printer className="w-4 h-4" /> A4 Document
              </button>
              
              {isCurrentUser && (
                <>
                  <div className="h-px bg-gray-100 my-1 w-full"></div>
                  <button 
                    onClick={() => navigate('/resume-builder')}
                    className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors w-full text-left"
                  >
                    <Edit className="w-4 h-4" /> Edit Resume
                  </button>
                </>
              )}

            </div>
          </div>
        </div>
      </div>

      {/* Render the selected view */}
      {viewMode === "web" ? renderWebView() : renderA4View()}
      
    </div>
  );
};

export default ResumeTab;