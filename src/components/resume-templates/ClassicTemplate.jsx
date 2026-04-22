import React, { useRef, useEffect, useState } from "react";
import { Phone, Mail, Linkedin, Github, Twitter, Code2, Youtube, Figma, Dribbble, Globe, Link as LinkIcon, MapPin } from "lucide-react";

const getIcon = (platform, color) => {
  const iconProps = { size: 12, color: color || "#374151" };
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

const SectionHeader = ({ title, color, showLines = true, titleSize = 16 }) => (
  <div className="resume-block flex flex-col mb-2 mt-4 break-inside-avoid">
    <h2 className="font-sans text-[18px]" style={{ color: color, fontSize: `${titleSize}px` }}>
      {title}
    </h2>
    {showLines && (
      <div className="w-full border-b-[1px] mt-0.5" style={{ borderColor: color, opacity: 0.3 }}></div>
    )}
  </div>
);

const ClassicTemplate = ({ resumeData, printingPage = null, onPagesCalculated }) => {

  const {
    headerAlignment, showLines, sectionTitleSize = 18, sectionOrder,
    marginTop = 45, marginBottom = 45, marginLeft = 45, marginRight = 45, lineSpacing = 1.5, textSize = 13,
    bodyColor = "#000000", nameColor = "#004f90", headlineColor = "#f92807",
    connectionsColor = "#004f90", sectionColor = "#004f90", linkColor = "#004f90",
    footerColor = "#808080", topNoteColor = "#808080",
    showFooter = true, showTopNote = true
  } = resumeData;

  const baseSize = Number(textSize);
  const nameSizePixels = parseInt((resumeData.nameSize || "text-[40px]").match(/\d+/)[0]);

  const [pages, setPages] = useState([]);
  const contentRef = useRef(null);
  const lastLengthRef = useRef(0);

  const contactItems = [];

  // 🔥 ONLY RENDER IF NOT HIDDEN 🔥
  if (resumeData.address && !resumeData.hiddenSections?.includes('address')) {
    contactItems.push(
      <span key="address" className="flex items-center gap-1" style={{ color: connectionsColor, fontSize: `${baseSize - 0.5}px` }}>
        <MapPin size={12} color={connectionsColor} />
        <span dangerouslySetInnerHTML={{ __html: resumeData.address }} />
      </span>
    );
  }

  // 🟢 BULLETPROOF CHECK
  if (Array.isArray(resumeData.socialLinks) && resumeData.socialLinks.length > 0) {
    resumeData.socialLinks.filter(link => link.visible !== false).forEach((link, idx) => {
      const rawUrl = (link.url || '').replace(/<[^>]+>/g, '').trim();
      const rawText = (link.text || '').replace(/<[^>]+>/g, '').trim();

      if (!rawUrl && !rawText) return;

      let displayHtml = link.text || link.url;
      if (!rawText && displayHtml) {
        displayHtml = displayHtml.replace(/https?:\/\/(www\.)?/g, '').replace(/mailto:/g, '').replace(/tel:/g, '');
      }

      let href = rawUrl || rawText;
      if (link.platform === "Email" && !href.startsWith("mailto:")) href = `mailto:${href}`;
      else if (link.platform === "Phone" && !href.startsWith("tel:") && !href.startsWith("+")) href = `tel:${href}`;
      else if (link.platform !== "Email" && link.platform !== "Phone" && !href.startsWith("http") && href !== "") href = `https://${href}`;

      if (link.platform === "Phone") {
        contactItems.push(
          <span key={`link-${idx}`} className="flex items-center gap-1" style={{ color: connectionsColor, fontSize: `${baseSize - 0.5}px` }}>
            {getIcon(link.platform, connectionsColor)} <span dangerouslySetInnerHTML={{ __html: displayHtml }} />
          </span>
        );
      } else {
        contactItems.push(
          <a key={`link-${idx}`} href={href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:opacity-75 transition text-inherit" style={{ color: connectionsColor, fontSize: `${baseSize - 0.5}px` }}>
            {getIcon(link.platform, connectionsColor)} <span className="font-medium" dangerouslySetInnerHTML={{ __html: displayHtml }} />
          </a>
        );
      }
    });
  }

  const sectionRenderers = {
    summary: () => resumeData.summary && (
      <React.Fragment key="summary">
        <SectionHeader title="Summary" color={sectionColor} showLines={showLines} titleSize={sectionTitleSize} />
        <div className="resume-block text-justify mb-3 break-inside-avoid text-gray-900" style={{ fontSize: `${baseSize}px` }} dangerouslySetInnerHTML={{ __html: resumeData.summary }} />
      </React.Fragment>
    ),
    education: () => {
      // 🟢 BULLETPROOF CHECK
      const activeItems = Array.isArray(resumeData.education) ? resumeData.education.filter(item => item.visible !== false) : [];
      if (activeItems.length === 0) return null;
      return (
        <React.Fragment key="education">
          <SectionHeader title="Education" color={sectionColor} showLines={showLines} titleSize={sectionTitleSize} />
          {activeItems.map((edu, index) => (
            <div key={`edu-${index}`} className="resume-block mb-3 break-inside-avoid text-gray-900" style={{ fontSize: `${baseSize}px` }}>
              <div className="flex justify-between items-baseline mb-1">
                <div>
                  <span className="font-bold">{edu.school}</span>
                  {edu.degree && <span>, {edu.degree}</span>}
                </div>
                <div className="whitespace-nowrap text-right ml-4" style={{ fontSize: `${baseSize - 1}px` }}>{edu.year}</div>
              </div>
              <div className="inline-rich-text text-justify" dangerouslySetInnerHTML={{ __html: edu.grade }} />
            </div>
          ))}
        </React.Fragment>
      );
    },
    skills: () => resumeData.skills && (
      <React.Fragment key="skills">
        <SectionHeader title="Skills" color={sectionColor} showLines={showLines} titleSize={sectionTitleSize} />
        <div className="resume-block text-justify mb-3 break-inside-avoid text-gray-900" style={{ fontSize: `${baseSize}px` }} dangerouslySetInnerHTML={{ __html: resumeData.skills }} />
      </React.Fragment>
    ),
    experience: () => {
      // 🟢 BULLETPROOF CHECK
      const activeItems = Array.isArray(resumeData.experience) ? resumeData.experience.filter(item => item.visible !== false) : [];
      if (activeItems.length === 0) return null;
      return (
        <React.Fragment key="experience">
          <SectionHeader title="Experience" color={sectionColor} showLines={showLines} titleSize={sectionTitleSize} />
          {activeItems.map((exp, index) => (
            <div key={`exp-${index}`} className="resume-block mb-4 break-inside-avoid text-gray-900" style={{ fontSize: `${baseSize}px` }}>
              <div className="flex justify-between items-baseline mb-1">
                <div>
                  <span className="font-bold">{exp.title}</span>
                  {exp.company && <span>, {exp.company}</span>}
                  {exp.location && <span> &ndash; {exp.location}</span>}
                </div>
                <div className="whitespace-nowrap text-right ml-4" style={{ fontSize: `${baseSize - 1}px` }}>{exp.dates}</div>
              </div>
              <div className="text-justify inline-rich-text" dangerouslySetInnerHTML={{ __html: exp.description }} />
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
          <SectionHeader title="Projects" color={sectionColor} showLines={showLines} titleSize={sectionTitleSize} />
          {activeItems.map((proj, index) => {
            let href = (proj.url || "").trim();
            if (href && !href.startsWith("http")) href = `https://${href}`;

            return (
              <div key={`proj-${index}`} className="resume-block mb-4 break-inside-avoid text-gray-900" style={{ fontSize: `${baseSize}px` }}>
                <div className="flex justify-between items-baseline mb-1">
                  <div>
                    {href ? (
                      <a href={href} target="_blank" rel="noopener noreferrer" className="font-bold hover:opacity-75 transition" style={{ color: linkColor, textDecoration: 'none' }}>
                        {proj.name}
                      </a>
                    ) : (
                      <span className="font-bold" style={{ color: linkColor }}>{proj.name}</span>
                    )}
                  </div>
                  <div className="whitespace-nowrap text-right ml-4 font-medium" style={{ fontSize: `${baseSize - 1}px` }}>{proj.tech}</div>
                </div>
                <div className="text-justify inline-rich-text" dangerouslySetInnerHTML={{ __html: proj.description }} />
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
          <SectionHeader title="Publications" color={sectionColor} showLines={showLines} titleSize={sectionTitleSize} />
          {activeItems.map((pub, index) => (
            <div key={`pub-${index}`} className="resume-block mb-4 break-inside-avoid text-gray-900" style={{ fontSize: `${baseSize}px` }}>
              <div className="flex justify-between items-baseline mb-0.5">
                <span className="font-bold">{pub.title}</span>
                <span className="whitespace-nowrap text-right ml-4" style={{ fontSize: `${baseSize - 1}px` }}>{pub.date}</span>
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
        <SectionHeader title="Selected Honors" color={sectionColor} showLines={showLines} titleSize={sectionTitleSize} />
        <div className="resume-block text-justify mb-3 break-inside-avoid text-gray-900" style={{ fontSize: `${baseSize}px` }} dangerouslySetInnerHTML={{ __html: resumeData.honors }} />
      </React.Fragment>
    ),
    patents: () => resumeData.patents && (
      <React.Fragment key="patents">
        <SectionHeader title="Patents" color={sectionColor} showLines={showLines} titleSize={sectionTitleSize} />
        <div className="resume-block text-justify mb-3 break-inside-avoid text-gray-900" style={{ fontSize: `${baseSize}px` }} dangerouslySetInnerHTML={{ __html: resumeData.patents }} />
      </React.Fragment>
    ),
    extracurriculars: () => {
      // 🟢 BULLETPROOF CHECK
      const activeItems = Array.isArray(resumeData.extracurriculars) ? resumeData.extracurriculars.filter(item => item.visible !== false) : [];
      if (activeItems.length === 0) return null;
      return (
        <React.Fragment key="extracurriculars">
          <SectionHeader title="Leadership & Activities" color={sectionColor} showLines={showLines} titleSize={sectionTitleSize} />
          {activeItems.map((act, index) => (
            <div key={`act-${index}`} className="resume-block mb-3 break-inside-avoid text-gray-900" style={{ fontSize: `${baseSize}px` }}>
              <div className="flex justify-between items-baseline mb-0.5">
                <div className="font-bold">{act.role ? `${act.role}, ${act.organization}` : act.organization}</div>
                <div className="whitespace-nowrap text-right ml-4" style={{ fontSize: `${baseSize - 1}px` }}>{act.dates}</div>
              </div>
              <div className="text-justify inline-rich-text" dangerouslySetInnerHTML={{ __html: act.description }} />
            </div>
          ))}
        </React.Fragment>
      );
    },
    talks: () => resumeData.talks && (
      <React.Fragment key="talks">
        <SectionHeader title="Invited Talks" color={sectionColor} showLines={showLines} titleSize={sectionTitleSize} />
        <div className="resume-block text-justify mb-3 break-inside-avoid text-gray-900" style={{ fontSize: `${baseSize}px` }} dangerouslySetInnerHTML={{ __html: resumeData.talks }} />
      </React.Fragment>
    )
  };

  const renderSections = () => (
    <>
      <div className={`resume-block ${headerAlignment} mb-6 break-inside-avoid relative w-full`}>

        {showTopNote && (
          <div className="absolute top-0 right-0 italic" style={{ fontSize: `${baseSize - 2}px`, color: topNoteColor }}>
            Last updated in {new Date().toLocaleString('default', { month: 'short', year: 'numeric' })}
          </div>
        )}

        {resumeData.name && (
          <div
            className="font-light tracking-wide leading-tight mb-3"
            style={{ color: nameColor, fontSize: `${nameSizePixels}px` }}
            dangerouslySetInnerHTML={{ __html: resumeData.name }}
          />
        )}

        {contactItems.length > 0 && (
          <div className={`flex flex-wrap ${headerAlignment.includes('center') ? 'justify-center' : headerAlignment.includes('right') ? 'justify-end' : 'justify-start'} items-center gap-x-5 gap-y-2`}>
            {contactItems.map((item, index) => <React.Fragment key={index}>{item}</React.Fragment>)}
          </div>
        )}

        {/* 🔥 ONLY RENDER IF NOT HIDDEN 🔥 */}
        {resumeData.academicStatus && !resumeData.hiddenSections?.includes('academicStatus') && (
          <div className="mt-4 font-bold uppercase" style={{ fontSize: `${baseSize}px`, color: headlineColor }} dangerouslySetInnerHTML={{ __html: resumeData.academicStatus }} />
        )}
      </div>

      {/* 🟢 BULLETPROOF CHECK */}
      {Array.isArray(sectionOrder) && sectionOrder.map(sectionKey => {
        if (resumeData.hiddenSections?.includes(sectionKey)) return null;

        if (sectionRenderers[sectionKey]) {
          return sectionRenderers[sectionKey]();
        }

        if (sectionKey.startsWith("custom_")) {
          // 🟢 BULLETPROOF CHECK
          const customSec = Array.isArray(resumeData.customSections) ? resumeData.customSections.find(c => c.id === sectionKey) : null;
          if (customSec && customSec.content) {
            return (
              <React.Fragment key={sectionKey}>
                <SectionHeader title={customSec.title || "Custom Section"} color={sectionColor} showLines={showLines} titleSize={sectionTitleSize} />
                <div className="resume-block text-justify mb-3 break-inside-avoid inline-rich-text" style={{ fontSize: `${baseSize}px`, color: bodyColor }} dangerouslySetInnerHTML={{ __html: customSec.content }} />
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
      const PADDING_TOP = marginTop;
      const PADDING_BOTTOM = marginBottom;
      const MAX_CONTENT_HEIGHT = PAGE_HEIGHT - PADDING_TOP - PADDING_BOTTOM - (showFooter ? 40 : 15);

      let currentPages = [];
      let currentPageNodes = [];
      let currentHeight = 0;

      children.forEach((child) => {
        const height = child.offsetHeight;
        const style = window.getComputedStyle(child);
        const totalHeight = height + (parseFloat(style.marginTop) || 0) + (parseFloat(style.marginBottom) || 0);

        const isHeader = child.classList.contains('section-header');

        if (
          (currentHeight + totalHeight > MAX_CONTENT_HEIGHT && currentPageNodes.length > 0) ||
          (isHeader && currentHeight + totalHeight + 60 > MAX_CONTENT_HEIGHT)
        ) {
          currentPages.push(currentPageNodes.map(n => n.outerHTML).join(""));
          currentPageNodes = [child];
          currentHeight = totalHeight;
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
        .classic-font-sans { 
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important; 
            font-variant-numeric: lining-nums tabular-nums; 
        }
        .break-inside-avoid { break-inside: avoid; page-break-inside: avoid; }
        .inline-rich-text p, .inline-rich-text div { display: inline; margin: 0; padding: 0; }
        .inline-rich-text ul { padding-left: 18px; margin-top: 4px; margin-bottom: 4px; }
        .inline-rich-text li { margin-bottom: 2px; }

        @media print {
           .print-page { 
               width: 210mm !important; 
               height: 297mm !important; 
               margin: 0 !important; 
               padding-top: ${marginTop}px !important; 
               padding-right: ${marginRight}px !important; 
               padding-bottom: ${marginBottom}px !important; 
               padding-left: ${marginLeft}px !important; 
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

      <div
        ref={contentRef}
        className="w-[794px] absolute pointer-events-none classic-font-sans rich-text-preview hide-on-print box-border"
        style={{
          left: '-9999px', top: 0, visibility: 'hidden',
          paddingTop: `${marginTop}px`,
          paddingRight: `${marginRight}px`,
          paddingBottom: `${marginBottom}px`,
          paddingLeft: `${marginLeft}px`,
          lineHeight: lineSpacing
        }}
      >
        {renderSections()}
      </div>

      <div className="flex flex-col gap-10 items-center pb-12 print-force-block print:!pb-0 print:!gap-0 print:!bg-white">
        {pages.map((pageHTML, idx) => {
          const pageNumber = idx + 1;
          const isHiddenDuringPrint = printingPage !== null && printingPage !== pageNumber;

          return (
            <div
              key={idx}
              className={`print-page w-[794px] min-w-[794px] h-[1123px] min-h-[1123px] shrink-0 bg-white shadow-xl classic-font-sans rich-text-preview relative box-border mx-auto ${isHiddenDuringPrint ? 'print:hidden' : 'print:block'}`}
              style={{
                paddingTop: `${marginTop}px`,
                paddingRight: `${marginRight}px`,
                paddingBottom: `${marginBottom}px`,
                paddingLeft: `${marginLeft}px`,
                lineHeight: lineSpacing
              }}
            >
              <div dangerouslySetInnerHTML={{ __html: pageHTML }} />

              {showFooter && (
                <div
                  className="absolute bottom-6 left-0 right-0 text-center italic"
                  style={{ fontSize: `${baseSize - 2}px`, color: footerColor }}
                >
                  {resumeData.name?.split(" ")[0] || "Resume"} – {pageNumber} / {pages.length}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

export default ClassicTemplate;