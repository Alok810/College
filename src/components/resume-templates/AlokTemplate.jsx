import React, { useRef, useEffect, useState } from "react";
import { Phone, Mail, Linkedin, Github, Twitter, Code2, Youtube, Figma, Dribbble, Globe, Link as LinkIcon } from "lucide-react";

const getIcon = (platform, color) => {
  const iconProps = { size: 14, color: color || "#374151" };
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
  <div className="section-header flex items-end gap-1.5 mb-2 mt-4 break-inside-avoid">
    <h2 className="font-bold text-gray-900 tracking-wide leading-none" style={{ color: color, fontSize: `${titleSize}px` }}>
      {title}
    </h2>
    {showLines && (
      <div className="flex-grow border-b-[1.5px] mb-[3px]" style={{ borderColor: color, opacity: 0.7 }}></div>
    )}
  </div>
);

const AlokTemplate = ({ resumeData, printingPage = null, onPagesCalculated }) => {

  const {
    headerAlignment, nameColor, sectionColor, nameSize, showLines, sectionTitleSize = 16, linkColor = "#374151", sectionOrder,
    marginTop = 38, marginBottom = 38, marginLeft = 45, marginRight = 45, lineSpacing = 1.5, textSize = 14
  } = resumeData;
  const baseSize = Number(textSize);

  const [pages, setPages] = useState([]);
  const contentRef = useRef(null);
  const lastLengthRef = useRef(0);

  const contactItems = [];
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

      if (link.platform === "Email" && !href.startsWith("mailto:")) {
        href = `mailto:${href}`;
      } else if (link.platform === "Phone" && !href.startsWith("tel:") && !href.startsWith("+")) {
        href = `tel:${href}`;
      } else if (link.platform !== "Email" && link.platform !== "Phone" && !href.startsWith("http") && href !== "") {
        href = `https://${href}`;
      }

      if (link.platform === "Phone") {
        contactItems.push(
          <span key={`link-${idx}`} className="flex items-center gap-1.5 font-medium transition duration-200" style={{ color: linkColor, textDecoration: 'none', fontSize: `${baseSize - 0.5}px` }}>
            {getIcon(link.platform, linkColor)} <span style={{ textDecoration: 'none' }} dangerouslySetInnerHTML={{ __html: displayHtml }} />
          </span>
        );
        return;
      }

      contactItems.push(
        <a key={`link-${idx}`} href={href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 font-medium hover:opacity-75 transition duration-200 no-underline" style={{ color: linkColor, textDecoration: 'none', fontSize: `${baseSize - 0.5}px` }}>
          {getIcon(link.platform, linkColor)} <span style={{ textDecoration: 'none' }} dangerouslySetInnerHTML={{ __html: displayHtml }} />
        </a>
      );
    });
  }

  const sectionRenderers = {
    summary: () => resumeData.summary && (
      <React.Fragment key="summary">
        <SectionHeader title="Summary" color={sectionColor} showLines={showLines} titleSize={sectionTitleSize} />
        <div className="resume-block text-justify mb-3 break-inside-avoid" style={{ fontSize: `${baseSize}px` }} dangerouslySetInnerHTML={{ __html: resumeData.summary }} />
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
            <div key={`edu-${index}`} className="resume-block mb-3 break-inside-avoid" style={{ fontSize: `${baseSize}px` }}>
              <div className="flex justify-between items-baseline">
                <div className="font-bold text-gray-900" style={{ fontSize: `${baseSize + 0.5}px` }}>{edu.school}</div>
                <div className="text-gray-800" style={{ fontSize: `${baseSize - 0.5}px` }}>{edu.year}</div>
              </div>
              <div className="flex justify-between items-baseline mt-0.5 italic text-gray-800" style={{ fontSize: `${baseSize}px` }}>
                <div>{edu.degree}</div>
                {edu.grade && <div dangerouslySetInnerHTML={{ __html: edu.grade }} />}
              </div>
            </div>
          ))}
        </React.Fragment>
      );
    },
    skills: () => resumeData.skills && (
      <React.Fragment key="skills">
        <SectionHeader title="Technical Skills" color={sectionColor} showLines={showLines} titleSize={sectionTitleSize} />
        <div className="resume-block text-justify mb-3 break-inside-avoid" style={{ fontSize: `${baseSize}px` }} dangerouslySetInnerHTML={{ __html: resumeData.skills }} />
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
            <div key={`exp-${index}`} className="resume-block mb-4 break-inside-avoid" style={{ fontSize: `${baseSize}px` }}>
              <div className="flex justify-between items-start">
                <div className="font-bold text-gray-900" style={{ fontSize: `${baseSize + 0.5}px` }}>{exp.company}</div>
                <div className="text-gray-800" style={{ fontSize: `${baseSize - 0.5}px` }}>{exp.location}</div>
              </div>
              <div className="flex justify-between items-baseline mt-0.5 mb-1">
                <div className="italic text-gray-800">{exp.title}</div>
                <div className="text-gray-600" style={{ fontSize: `${baseSize - 0.5}px` }}>{exp.dates}</div>
              </div>
              <div className="text-justify mt-1" dangerouslySetInnerHTML={{ __html: exp.description }} />
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
              <div key={`proj-${index}`} className="resume-block mb-4 break-inside-avoid" style={{ fontSize: `${baseSize}px` }}>
                <div className="flex justify-between items-start mb-1">
                  <div>
                    {href ? (
                      <a href={href} target="_blank" rel="noopener noreferrer" className="font-bold hover:opacity-75 transition" style={{ color: linkColor, fontSize: `${baseSize + 0.5}px`, textDecoration: 'none' }}>
                        {proj.name}
                      </a>
                    ) : (
                      <span className="font-bold text-gray-900" style={{ fontSize: `${baseSize + 0.5}px` }}>{proj.name}</span>
                    )}
                  </div>
                  <div className="text-right text-gray-600 italic" style={{ fontSize: `${baseSize - 1}px` }}>{proj.tech}</div>
                </div>
                <div className="text-justify" dangerouslySetInnerHTML={{ __html: proj.description }} />
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
            <div key={`pub-${index}`} className="resume-block mb-4 break-inside-avoid" style={{ fontSize: `${baseSize}px` }}>
              <div className="flex justify-between items-start mb-0.5">
                <span className="font-bold text-gray-900 leading-snug" style={{ fontSize: `${baseSize + 0.5}px` }}>{pub.title}</span>
                <span className="text-right text-gray-600 whitespace-nowrap ml-4" style={{ fontSize: `${baseSize - 1}px` }}>{pub.date}</span>
              </div>
              <div className="text-gray-800" dangerouslySetInnerHTML={{ __html: pub.authors }} />
              <div className="mt-0.5" style={{ fontSize: `${baseSize - 0.5}px` }} dangerouslySetInnerHTML={{ __html: pub.details }} />
            </div>
          ))}
        </React.Fragment>
      );
    },
    honors: () => resumeData.honors && (
      <React.Fragment key="honors">
        <SectionHeader title="Selected Honors" color={sectionColor} showLines={showLines} titleSize={sectionTitleSize} />
        <div className="resume-block text-justify mb-3 break-inside-avoid" style={{ fontSize: `${baseSize}px` }} dangerouslySetInnerHTML={{ __html: resumeData.honors }} />
      </React.Fragment>
    ),
    patents: () => resumeData.patents && (
      <React.Fragment key="patents">
        <SectionHeader title="Patents" color={sectionColor} showLines={showLines} titleSize={sectionTitleSize} />
        <div className="resume-block text-justify mb-3 break-inside-avoid" style={{ fontSize: `${baseSize}px` }} dangerouslySetInnerHTML={{ __html: resumeData.patents }} />
      </React.Fragment>
    ),
    extracurriculars: () => {
      // 🟢 BULLETPROOF CHECK
      const activeItems = Array.isArray(resumeData.extracurriculars) ? resumeData.extracurriculars.filter(item => item.visible !== false) : [];
      if (activeItems.length === 0) return null;
      return (
        <React.Fragment key="extracurriculars">
          <SectionHeader title="Extra-Curriculars" color={sectionColor} showLines={showLines} titleSize={sectionTitleSize} />
          {activeItems.map((act, index) => (
            <div key={`act-${index}`} className="resume-block mb-3 break-inside-avoid" style={{ fontSize: `${baseSize}px` }}>
              <div className="flex justify-between items-baseline mb-0.5">
                <div className="font-bold text-gray-900" style={{ fontSize: `${baseSize + 0.5}px` }}>{act.organization}</div>
                <div className="font-bold text-gray-900" style={{ fontSize: `${baseSize - 0.5}px` }}>{act.dates}</div>
              </div>
              <div className="text-justify inline-rich-text">
                {act.role && <span className="font-medium text-gray-800">{act.role}</span>}
                {act.role && act.description && <span> &ndash; </span>}
                <span dangerouslySetInnerHTML={{ __html: act.description }} />
              </div>
            </div>
          ))}
        </React.Fragment>
      );
    },
    talks: () => resumeData.talks && (
      <React.Fragment key="talks">
        <SectionHeader title="Invited Talks" color={sectionColor} showLines={showLines} titleSize={sectionTitleSize} />
        <div className="resume-block text-justify mb-3 break-inside-avoid" style={{ fontSize: `${baseSize}px` }} dangerouslySetInnerHTML={{ __html: resumeData.talks }} />
      </React.Fragment>
    )
  };

  const renderSections = () => (
    <>
      <div className={`resume-block ${headerAlignment} mb-4 break-inside-avoid`}>
        {resumeData.name && (
          <div
            className={`${nameSize} font-bold uppercase tracking-wider leading-tight`}
            style={{ color: nameColor }}
            dangerouslySetInnerHTML={{ __html: resumeData.name }}
          />
        )}
        {resumeData.academicStatus && <div className="font-bold mt-1.5 uppercase" style={{ fontSize: `${baseSize}px` }} dangerouslySetInnerHTML={{ __html: resumeData.academicStatus }} />}
        {resumeData.address && <div className="mt-1 text-gray-800" style={{ fontSize: `${baseSize - 1}px` }} dangerouslySetInnerHTML={{ __html: resumeData.address }} />}
      </div>

      {contactItems.length > 0 && (
        <div
          className="resume-block w-full border-y-[1.5px] py-2 mt-2 mb-4 flex flex-wrap justify-center items-center gap-x-6 gap-y-2 break-inside-avoid"
          style={{ borderColor: sectionColor }}
        >
          {contactItems.map((item, index) => <React.Fragment key={index}>{item}</React.Fragment>)}
        </div>
      )}

      {Array.isArray(sectionOrder) && sectionOrder.map(sectionKey => {
        if (resumeData.hiddenSections?.includes(sectionKey)) return null;

        if (sectionRenderers[sectionKey]) {
          return sectionRenderers[sectionKey]();
        }

        if (sectionKey.startsWith("custom_")) {
          const customSec = Array.isArray(resumeData.customSections) ? resumeData.customSections.find(c => c.id === sectionKey) : null;
          if (customSec && customSec.content) {
            return (
              <React.Fragment key={sectionKey}>
                <SectionHeader title={customSec.title || "Custom Section"} color={sectionColor} showLines={showLines} titleSize={sectionTitleSize} />
                <div className="resume-block text-justify mb-3 break-inside-avoid" style={{ fontSize: `${baseSize}px` }} dangerouslySetInnerHTML={{ __html: customSec.content }} />
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
      const MAX_CONTENT_HEIGHT = PAGE_HEIGHT - PADDING_TOP - PADDING_BOTTOM - 15;

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
          (isHeader && currentHeight + totalHeight + 80 > MAX_CONTENT_HEIGHT)
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
  }, [resumeData, onPagesCalculated, marginTop, marginBottom]);

  return (
    <>
      <style>{`
        .font-serif { font-variant-numeric: lining-nums tabular-nums !important; font-feature-settings: "lnum" 1, "tnum" 1 !important; }
        .break-inside-avoid { break-inside: avoid; page-break-inside: avoid; }
        .inline-rich-text p, .inline-rich-text div { display: inline; margin: 0; padding: 0; }
        
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
        className="w-[794px] absolute pointer-events-none font-serif rich-text-preview text-black hide-on-print box-border"
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
              dangerouslySetInnerHTML={{ __html: pageHTML }}
            />
          );
        })}
      </div>
    </>
  );
}

export default AlokTemplate;