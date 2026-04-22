import React, { useRef, useEffect, useState } from "react";
import { Phone, Mail, Linkedin, Github, Twitter, Code2, Youtube, Figma, Dribbble, Globe, Link as LinkIcon, MapPin } from "lucide-react";

const getIcon = (platform, color) => {
  const iconProps = { size: 14, color: color || "#1f2937" };
  switch (platform) {
    case "Phone": return <Phone {...iconProps} />;
    case "Email": return <Mail {...iconProps} />;
    case "LinkedIn": return <Linkedin {...iconProps} />;
    case "GitHub": return <Github {...iconProps} />;
    case "LeetCode": return <Code2 {...iconProps} />;
    case "Twitter": return <Twitter {...iconProps} />;
    case "YouTube": return <Youtube {...iconProps} />;
    case "Figma": return <Figma {...iconProps} />;
    case "Dribbble": return <Dribbble {...iconProps} />;
    case "Portfolio/Website": return <Globe {...iconProps} />;
    default: return <LinkIcon {...iconProps} />;
  }
}

// Right Column Headings 
const MainSectionHeader = ({ title, color, titleSize = 16 }) => (
  <div className="resume-block mb-3 mt-6 break-inside-avoid">
    <h2 className="font-bold uppercase tracking-widest" style={{ color: color, fontSize: `${titleSize}px` }}>
      {title}
    </h2>
  </div>
);

// Left Sidebar Headings 
const SidebarHeader = ({ title, titleSize = 14 }) => (
  <div className="mb-4 mt-6">
    <h2 className="font-bold uppercase tracking-widest text-gray-900 border-b pb-1 border-gray-400" style={{ fontSize: `${titleSize}px` }}>
      {title}
    </h2>
  </div>
);

const ModernTemplate = ({ resumeData, printingPage = null, onPagesCalculated }) => {

  const {
    sectionTitleSize = 16, sectionOrder,
    marginTop = 38, marginBottom = 38, marginRight = 38, lineSpacing = 1.5, textSize = 12,
    bodyColor = "#333333", nameColor = "#ffffff", headlineColor = "#e5e7eb",
    connectionsColor = "#0b1e36", sectionColor = "#000000", linkColor = "#000000",
    footerColor = "#808080", showFooter = true
  } = resumeData;

  const baseSize = Number(textSize);
  const nameSizePixels = parseInt((resumeData.nameSize || "text-[32px]").match(/\d+/)[0]);

  const [pages, setPages] = useState([]);
  const contentRef = useRef(null);
  const lastLengthRef = useRef(0);

  // --- PREPARE SIDEBAR ITEMS ---
  const contactItems = [];
  // 🟢 BULLETPROOF CHECK
  if (Array.isArray(resumeData.socialLinks) && resumeData.socialLinks.length > 0) {
    resumeData.socialLinks.filter(link => link.visible !== false).forEach((link, idx) => {
      const rawUrl = (link.url || '').replace(/<[^>]+>/g, '').trim();
      const rawText = (link.text || '').replace(/<[^>]+>/g, '').trim();
      if (!rawUrl && !rawText) return;

      let displayHtml = link.text || link.url;
      if (!rawText && displayHtml) displayHtml = displayHtml.replace(/https?:\/\/(www\.)?/g, '').replace(/mailto:/g, '').replace(/tel:/g, '');

      let href = rawUrl || rawText;
      if (link.platform === "Email" && !href.startsWith("mailto:")) href = `mailto:${href}`;
      else if (link.platform === "Phone" && !href.startsWith("tel:") && !href.startsWith("+")) href = `tel:${href}`;
      else if (link.platform !== "Email" && link.platform !== "Phone" && !href.startsWith("http") && href !== "") href = `https://${href}`;

      contactItems.push(
        <div key={`link-${idx}`} className="flex items-start gap-3 mb-3.5 break-inside-avoid">
          <div className="mt-1">{getIcon(link.platform, "#1f2937")}</div>
          <a href={href} target="_blank" rel="noopener noreferrer" className="hover:opacity-75 transition text-gray-800 break-all" style={{ fontSize: `${baseSize}px`, textDecoration: 'none' }}>
            <span dangerouslySetInnerHTML={{ __html: displayHtml }} />
          </a>
        </div>
      );
    });
  }

  if (resumeData.address && !resumeData.hiddenSections?.includes('address')) {
    contactItems.splice(1, 0,
      <div key="address" className="flex items-start gap-3 mb-3.5 break-inside-avoid text-gray-800" style={{ fontSize: `${baseSize}px` }}>
        <div className="mt-1"><MapPin size={13} color="#1f2937" /></div>
        <span dangerouslySetInnerHTML={{ __html: resumeData.address }} />
      </div>
    );
  }

  // --- PREPARE MAIN COLUMN RENDERERS ---
  const sectionRenderers = {
    summary: () => resumeData.summary && (
      <React.Fragment key="summary">
        <MainSectionHeader title="Summary" color={sectionColor} titleSize={sectionTitleSize} />
        <div className="resume-block text-justify mb-5 break-inside-avoid inline-rich-text" style={{ fontSize: `${baseSize}px`, color: bodyColor }} dangerouslySetInnerHTML={{ __html: resumeData.summary }} />
      </React.Fragment>
    ),
    education: () => {
      // 🟢 BULLETPROOF CHECK
      const activeItems = Array.isArray(resumeData.education) ? resumeData.education.filter(item => item.visible !== false) : [];
      if (activeItems.length === 0) return null;
      return (
        <React.Fragment key="education">
          <MainSectionHeader title="Education" color={sectionColor} titleSize={sectionTitleSize} />
          {activeItems.map((edu, index) => (
            <div key={`edu-${index}`} className="resume-block mb-5 break-inside-avoid" style={{ color: bodyColor }}>
              <div className="font-bold mb-0.5" style={{ fontSize: `${baseSize + 1}px` }}>
                {edu.degree}{edu.degree && edu.school ? ", " : ""}{edu.school}
              </div>
              <div className="mb-1 text-gray-700" style={{ fontSize: `${baseSize}px` }}>{edu.year}</div>
              <div className="inline-rich-text mt-1" style={{ fontSize: `${baseSize}px` }} dangerouslySetInnerHTML={{ __html: edu.grade }} />
            </div>
          ))}
        </React.Fragment>
      );
    },
    experience: () => {
      // 🟢 BULLETPROOF CHECK
      const activeItems = Array.isArray(resumeData.experience) ? resumeData.experience.filter(item => item.visible !== false) : [];
      if (activeItems.length === 0) return null;
      return (
        <React.Fragment key="experience">
          <MainSectionHeader title="Experience" color={sectionColor} titleSize={sectionTitleSize} />
          {activeItems.map((exp, index) => (
            <div key={`exp-${index}`} className="resume-block mb-6 break-inside-avoid" style={{ color: bodyColor }}>
              <div className="font-bold mb-0.5" style={{ fontSize: `${baseSize + 1}px` }}>
                {exp.title}{exp.title && exp.company ? ", " : ""}{exp.company}{exp.location && `, ${exp.location}`}
              </div>
              <div className="mb-2 text-gray-700" style={{ fontSize: `${baseSize}px` }}>{exp.dates}</div>
              <div className="text-justify inline-rich-text" style={{ fontSize: `${baseSize}px` }} dangerouslySetInnerHTML={{ __html: exp.description }} />
            </div>
          ))}
        </React.Fragment>
      );
    },
    projects: () => {
      // 🟢 BULLETPROOF CHECK
      const activeItems = Array.isArray(resumeData.projects) ? resumeData.projects.filter(item => item.visible !== false) : [];
      if (activeItems.length === 0) return null;
      return (
        <React.Fragment key="projects">
          <MainSectionHeader title="Projects" color={sectionColor} titleSize={sectionTitleSize} />
          {activeItems.map((proj, index) => {
            let href = (proj.url || "").trim();
            if (href && !href.startsWith("http")) href = `https://${href}`;

            return (
              <div key={`proj-${index}`} className="resume-block mb-6 break-inside-avoid" style={{ color: bodyColor }}>
                <div className="font-bold mb-0.5" style={{ fontSize: `${baseSize + 1}px` }}>
                  {href ? (
                    <a href={href} target="_blank" rel="noopener noreferrer" className="hover:opacity-75 transition" style={{ color: linkColor, textDecoration: 'none' }}>
                      {proj.name}
                    </a>
                  ) : (
                    <span style={{ color: linkColor }}>{proj.name}</span>
                  )}
                </div>
                <div className="mb-2 text-gray-700 font-medium" style={{ fontSize: `${baseSize}px` }}>{proj.tech}</div>
                <div className="text-justify inline-rich-text" style={{ fontSize: `${baseSize}px` }} dangerouslySetInnerHTML={{ __html: proj.description }} />
              </div>
            );
          })}
        </React.Fragment>
      );
    },
    publications: () => {
      // 🟢 BULLETPROOF CHECK
      const activeItems = Array.isArray(resumeData.publications) ? resumeData.publications.filter(item => item.visible !== false) : [];
      if (activeItems.length === 0) return null;
      return (
        <React.Fragment key="publications">
          <MainSectionHeader title="Publications" color={sectionColor} titleSize={sectionTitleSize} />
          {activeItems.map((pub, index) => (
            <div key={`pub-${index}`} className="resume-block mb-5 break-inside-avoid" style={{ color: bodyColor }}>
              <div className="font-bold mb-0.5" style={{ fontSize: `${baseSize + 1}px` }}>
                {pub.title} <span className="font-normal ml-2 text-gray-600">({pub.date})</span>
              </div>
              <div dangerouslySetInnerHTML={{ __html: pub.authors }} />
              <div style={{ color: linkColor }} dangerouslySetInnerHTML={{ __html: pub.details }} />
            </div>
          ))}
        </React.Fragment>
      );
    },
    honors: () => resumeData.honors && (
      <React.Fragment key="honors">
        <MainSectionHeader title="Honors" color={sectionColor} titleSize={sectionTitleSize} />
        <div className="resume-block text-justify mb-5 break-inside-avoid inline-rich-text" style={{ fontSize: `${baseSize}px`, color: bodyColor }} dangerouslySetInnerHTML={{ __html: resumeData.honors }} />
      </React.Fragment>
    ),
    patents: () => resumeData.patents && (
      <React.Fragment key="patents">
        <MainSectionHeader title="Patents" color={sectionColor} titleSize={sectionTitleSize} />
        <div className="resume-block text-justify mb-5 break-inside-avoid inline-rich-text" style={{ fontSize: `${baseSize}px`, color: bodyColor }} dangerouslySetInnerHTML={{ __html: resumeData.patents }} />
      </React.Fragment>
    ),
    extracurriculars: () => {
      // 🟢 BULLETPROOF CHECK
      const activeItems = Array.isArray(resumeData.extracurriculars) ? resumeData.extracurriculars.filter(item => item.visible !== false) : [];
      if (activeItems.length === 0) return null;
      return (
        <React.Fragment key="extracurriculars">
          <MainSectionHeader title="Activities" color={sectionColor} titleSize={sectionTitleSize} />
          {activeItems.map((act, index) => (
            <div key={`act-${index}`} className="resume-block mb-5 break-inside-avoid" style={{ color: bodyColor }}>
              <div className="font-bold mb-0.5" style={{ fontSize: `${baseSize + 1}px` }}>
                {act.role ? `${act.role}, ` : ""}{act.organization}
              </div>
              <div className="mb-1 text-gray-700" style={{ fontSize: `${baseSize}px` }}>{act.dates}</div>
              <div className="text-justify inline-rich-text" style={{ fontSize: `${baseSize}px` }} dangerouslySetInnerHTML={{ __html: act.description }} />
            </div>
          ))}
        </React.Fragment>
      );
    },
    talks: () => resumeData.talks && (
      <React.Fragment key="talks">
        <MainSectionHeader title="Invited Talks" color={sectionColor} titleSize={sectionTitleSize} />
        <div className="resume-block text-justify mb-5 break-inside-avoid inline-rich-text" style={{ fontSize: `${baseSize}px`, color: bodyColor }} dangerouslySetInnerHTML={{ __html: resumeData.talks }} />
      </React.Fragment>
    )
  };

  const renderMainSections = () => (
    <>
      {/* 🟢 BULLETPROOF CHECK */}
      {Array.isArray(sectionOrder) && sectionOrder.map(sectionKey => {
        if (resumeData.hiddenSections?.includes(sectionKey) || sectionKey === "skills") return null;

        if (sectionRenderers[sectionKey]) {
          return sectionRenderers[sectionKey]();
        }

        if (sectionKey.startsWith("custom_")) {
          // 🟢 BULLETPROOF CHECK
          const customSec = Array.isArray(resumeData.customSections) ? resumeData.customSections.find(c => c.id === sectionKey) : null;
          if (customSec && customSec.content) {
            return (
              <React.Fragment key={sectionKey}>
                <MainSectionHeader title={customSec.title || "Custom Section"} color={sectionColor} titleSize={sectionTitleSize} />
                <div className="resume-block text-justify mb-5 break-inside-avoid inline-rich-text" style={{ fontSize: `${baseSize}px`, color: bodyColor }} dangerouslySetInnerHTML={{ __html: customSec.content }} />
              </React.Fragment>
            );
          }
        }
        return null;
      })}
    </>
  );

  useEffect(() => {
    if (!contentRef.current) return;

    const timer = setTimeout(() => {
      const children = Array.from(contentRef.current.children);

      const PAGE_HEIGHT = 1123;
      const HEADER_HEIGHT = 100;

      const PT_PAGE_1 = 30;
      const PT_PAGE_N = marginTop;
      const PB = marginBottom;
      const footerSpace = showFooter ? 40 : 15;

      const MAX_HEIGHT_PAGE_1 = PAGE_HEIGHT - HEADER_HEIGHT - PT_PAGE_1 - PB - footerSpace;
      const MAX_HEIGHT_PAGE_N = PAGE_HEIGHT - PT_PAGE_N - PB - footerSpace;

      let currentPages = [];
      let currentPageNodes = [];
      let currentHeight = 0;
      let isFirstPage = true;

      children.forEach((child) => {
        const height = child.offsetHeight;
        const style = window.getComputedStyle(child);
        const totalHeight = height + (parseFloat(style.marginTop) || 0) + (parseFloat(style.marginBottom) || 0);

        const isHeader = child.classList.contains('resume-block') && child.querySelector('h2');
        const availableSpace = isFirstPage ? MAX_HEIGHT_PAGE_1 : MAX_HEIGHT_PAGE_N;

        if (
          (currentHeight + totalHeight > availableSpace && currentPageNodes.length > 0) ||
          (isHeader && currentHeight + totalHeight + 60 > availableSpace)
        ) {
          currentPages.push(currentPageNodes.map(n => n.outerHTML).join(""));
          currentPageNodes = [child];
          currentHeight = totalHeight;
          isFirstPage = false;
        } else {
          currentPageNodes.push(child);
          currentHeight += totalHeight;
        }
      });

      if (currentPageNodes.length > 0) {
        currentPages.push(currentPageNodes.map(n => n.outerHTML).join(""));
      }

      setPages(currentPages);

      if (onPagesCalculated && currentPages.length !== lastLengthRef.current) {
        lastLengthRef.current = currentPages.length;
        onPagesCalculated(currentPages.length);
      }

    }, 100);

    return () => clearTimeout(timer);
  }, [resumeData, onPagesCalculated, marginTop, marginBottom, showFooter]);

  return (
    <>
      <style>{`
        .modern-font-sans { 
            font-family: "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important; 
        }
        .break-inside-avoid { break-inside: avoid; page-break-inside: avoid; }
        .inline-rich-text p, .inline-rich-text div { display: inline; margin: 0; padding: 0; }
        .inline-rich-text ul { list-style-type: disc; padding-left: 18px; margin-top: 4px; margin-bottom: 4px; }
        .inline-rich-text ol { list-style-type: decimal; padding-left: 18px; margin-top: 4px; margin-bottom: 4px; }
        .inline-rich-text li { margin-bottom: 4px; }
        
        .sidebar-bullets ul { list-style-type: disc; padding-left: 18px; }
        .sidebar-bullets li { margin-bottom: 12px; }

        @media print {
           .print-page { 
               width: 210mm !important; 
               height: 297mm !important; 
               margin: 0 !important; 
               padding: 0 !important; 
               page-break-after: avoid !important; 
               break-after: avoid !important; 
               box-shadow: none !important; 
               border: none !important; 
               border-radius: 0 !important; 
               transform: none !important; 
               position: relative !important; 
           }
           .hide-on-print { display: none !important; }
        }
      `}</style>

      {/* HIDDEN MEASUREMENT CONTAINER */}
      <div
        ref={contentRef}
        className="w-[540px] absolute pointer-events-none modern-font-sans rich-text-preview hide-on-print box-border"
        style={{
          left: '-9999px', top: 0, visibility: 'hidden', lineHeight: lineSpacing,
          paddingLeft: '35px', paddingRight: `${marginRight}px`
        }}
      >
        {renderMainSections()}
      </div>

      {/* VISIBLE UI & SINGLE PAGE PRINT TARGET */}
      <div className="flex flex-col gap-10 items-center pb-12 print-force-block print:!pb-0 print:!gap-0 print:!bg-transparent">
        {pages.map((pageHTML, idx) => {
          const pageNumber = idx + 1;
          const isHiddenDuringPrint = printingPage !== null && printingPage !== pageNumber;
          const isFirstPage = idx === 0;

          return (
            <div
              key={idx}
              className={`print-page w-[794px] min-w-[794px] h-[1123px] min-h-[1123px] shrink-0 bg-white shadow-xl modern-font-sans rich-text-preview relative mx-auto flex flex-col ${isHiddenDuringPrint ? 'print:hidden' : 'print:flex'}`}
            >

              {/* 🔥 SHIFTED & RESIZED PHOTO OVERLAP 🔥 */}
              {isFirstPage && resumeData.profileImage && (
                <div className="absolute top-[28px] left-[35px] z-20">
                  <img src={resumeData.profileImage} alt="Profile" className="w-[180px] h-[180px] object-cover border-[4px] border-white shadow-md bg-white" />
                </div>
              )}

              {/* 🔥 100px HEADER (ONLY PAGE 1) 🔥 */}
              {isFirstPage && (
                <div className="h-[100px] w-full flex shrink-0 relative" style={{ backgroundColor: connectionsColor }}>

                  <div className="absolute bottom-[16px] left-0 w-full h-[2px] bg-white/70 z-0"></div>

                  <div className="w-[32%] h-full"></div>

                  <div className="w-[68%] h-full flex flex-col justify-center pl-8 pr-10 relative z-10 pb-2">
                    <div className="uppercase tracking-wider font-semibold mb-1" style={{ color: nameColor, fontSize: `${nameSizePixels}px`, lineHeight: 1.1 }}>
                      {resumeData.name}
                    </div>
                    {!resumeData.hiddenSections?.includes('academicStatus') && (
                      <div style={{ color: headlineColor, fontSize: `${baseSize + 2}px` }}>
                        {resumeData.academicStatus}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 🔥 TWO-COLUMN BODY 🔥 */}
              <div className="flex flex-1 w-full overflow-hidden">

                <div className="w-[32%] h-full shrink-0" style={{ backgroundColor: '#eff2f3' }}>
                  {isFirstPage && (
                    <div className="flex flex-col px-8" style={{
                      paddingTop: '135px',
                      paddingBottom: `${marginBottom}px`,
                      lineHeight: lineSpacing
                    }}>

                      {contactItems.length > 0 && (
                        <div className="mb-6">
                          <SidebarHeader title="Details" titleSize={sectionTitleSize - 2} />
                          <div className="flex flex-col">
                            {contactItems}
                          </div>
                        </div>
                      )}

                      {!resumeData.hiddenSections?.includes('skills') && resumeData.skills && (
                        <div className="mb-6 mt-4">
                          <SidebarHeader title="Skills" titleSize={sectionTitleSize - 2} />
                          <div className="sidebar-bullets text-gray-800" style={{ fontSize: `${baseSize}px` }} dangerouslySetInnerHTML={{ __html: resumeData.skills }} />
                        </div>
                      )}

                    </div>
                  )}
                </div>

                <div
                  className="w-[68%] h-full shrink-0 relative"
                  style={{
                    paddingTop: isFirstPage ? '30px' : `${marginTop}px`,
                    paddingRight: `${marginRight}px`,
                    paddingLeft: '35px',
                    paddingBottom: `${marginBottom}px`,
                    lineHeight: lineSpacing
                  }}
                >
                  <div dangerouslySetInnerHTML={{ __html: pageHTML }} />

                  {showFooter && (
                    <div
                      className="absolute bottom-[24px] left-0 right-0 text-center italic"
                      style={{ fontSize: `${baseSize - 2}px`, color: footerColor }}
                    >
                      {resumeData.name?.split(" ")[0] || "Resume"} – {pageNumber} / {pages.length}
                    </div>
                  )}
                </div>

              </div>

            </div>
          );
        })}
      </div>
    </>
  );
}

export default ModernTemplate;