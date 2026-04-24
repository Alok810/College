import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Save, ArrowLeft, Plus, Trash2, Loader2, Download, 
  Briefcase, Code, Phone, Link as LinkIcon, LayoutTemplate, 
  Award, Linkedin, Github, Twitter, Code2, Bold, Italic, 
  ChevronDown, ChevronRight, ZoomIn, ZoomOut, 
  Maximize, Minus, AlignLeft, AlignCenter, AlignRight, Type, 
  Youtube, Figma, Dribbble, Globe, Mail, Palette, Underline, List, ListOrdered,
  ArrowUp, ArrowDown, Eye, EyeOff, Upload, FileJson, FileText, Edit2, Check,
  Sparkles // 🔥 IMPORTED SPARKLES ICON FOR AI
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
// 🔥 Make sure enhanceTextWithAI is exported from your api.js file!
import { saveUserResume, enhanceTextWithAI } from "../api";

import AlokTemplate from "../components/resume-templates/AlokTemplate";
import ClassicTemplate from "../components/resume-templates/ClassicTemplate";
import ModernTemplate from "../components/resume-templates/ModernTemplate";

import { DEFAULT_DUMMY_DATA, ALOK_DUMMY_DATA, CLASSIC_DUMMY_DATA, MODERN_DUMMY_DATA, SECTION_LABELS } from "../utils/resumeData";

const PLATFORMS = {
  "Email": { icon: Mail, color: "text-red-500" },
  "Phone": { icon: Phone, color: "text-green-600" },
  "LinkedIn": { icon: Linkedin, color: "text-blue-600" },
  "GitHub": { icon: Github, color: "text-gray-800" },
  "LeetCode": { icon: Code2, color: "text-yellow-600" },
  "Twitter": { icon: Twitter, color: "text-sky-500" },
  "Portfolio/Website": { icon: Globe, color: "text-indigo-500" },
  "YouTube": { icon: Youtube, color: "text-red-600" },
  "Figma": { icon: Figma, color: "text-pink-500" },
  "Dribbble": { icon: Dribbble, color: "text-pink-400" },
  "Codeforces": { icon: Code2, color: "text-red-500" },
  "HackerRank": { icon: Code2, color: "text-green-600" },
};

const hexToRgb = (hex) => {
  let r = 0, g = 0, b = 0;
  if (hex && hex.length === 4) {
      r = parseInt(hex[1] + hex[1], 16); g = parseInt(hex[2] + hex[2], 16); b = parseInt(hex[3] + hex[3], 16);
  } else if (hex && hex.length === 7) {
      r = parseInt(hex[1] + hex[2], 16); g = parseInt(hex[3] + hex[4], 16); b = parseInt(hex[5] + hex[6], 16);
  }
  return `rgb(${r}, ${g}, ${b})`;
};

const ColorRow = ({ label, colorValue, onChange }) => (
  <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
    <span className="text-[13px] text-gray-600 font-medium">{label}</span>
    <div className="flex items-center gap-3 w-48 justify-start">
      <div className="w-6 h-6 rounded-full border border-gray-200 shadow-inner relative overflow-hidden flex-shrink-0 cursor-pointer" style={{ backgroundColor: colorValue }}>
        <input type="color" className="absolute opacity-0 w-full h-full cursor-pointer" value={colorValue} onChange={(e) => onChange(e.target.value)} />
      </div>
      <span className="text-[13px] font-mono text-gray-700 whitespace-nowrap">{hexToRgb(colorValue)}</span>
    </div>
  </div>
);

const ToggleRow = ({ label, isActive, onToggle }) => (
  <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
    <span className="text-[13px] text-gray-600 font-medium">{label}</span>
    <div className="w-48 flex justify-start">
      <button onClick={onToggle} className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${isActive ? 'bg-purple-600' : 'bg-gray-200'}`}>
        <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isActive ? 'translate-x-2' : '-translate-x-2'}`} />
      </button>
    </div>
  </div>
);

const InputRow = ({ label, value, onChange, unit }) => (
  <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
    <span className="text-[13px] text-gray-600 font-medium">{label}</span>
    <div className="flex items-center gap-2 w-48 justify-start">
      <input type="number" className="w-16 bg-gray-50 border border-gray-200 rounded text-[13px] py-1 px-2 outline-none focus:border-purple-500 transition-all" value={value} onChange={(e) => onChange(Number(e.target.value))} />
      {unit && <span className="text-[13px] text-gray-600">{unit}</span>}
    </div>
  </div>
);

const GlobalRibbon = () => {
  const exec = (command, val = null) => { document.execCommand(command, false, val); };
  return (
    <div className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-2 flex flex-wrap items-center gap-1 shadow-sm w-full hide-on-print">
      <button type="button" onMouseDown={(e) => { e.preventDefault(); exec('bold'); }} className="p-1.5 hover:bg-purple-100 hover:text-purple-700 rounded text-gray-700 transition" title="Bold"><Bold className="w-4 h-4" /></button>
      <button type="button" onMouseDown={(e) => { e.preventDefault(); exec('italic'); }} className="p-1.5 hover:bg-purple-100 hover:text-purple-700 rounded text-gray-700 transition" title="Italic"><Italic className="w-4 h-4" /></button>
      <button type="button" onMouseDown={(e) => { e.preventDefault(); exec('underline'); }} className="p-1.5 hover:bg-purple-100 hover:text-purple-700 rounded text-gray-700 transition" title="Underline"><Underline className="w-4 h-4" /></button>
      <div className="w-px h-5 bg-gray-300 mx-1"></div>
      <select defaultValue="" onChange={(e) => { exec('fontSize', e.target.value); e.target.value=""; }} className="text-[12px] bg-white border border-gray-300 rounded outline-none px-2 py-1 text-gray-700 cursor-pointer hover:border-purple-400 transition" title="Text Size">
        <option value="" disabled>Size</option>
        <option value="1">8</option><option value="2">10</option><option value="3">12</option><option value="4">14</option><option value="5">18</option><option value="6">24</option><option value="7">36</option>
      </select>
      <div className="relative w-7 h-7 rounded overflow-hidden border border-gray-300 ml-1 cursor-pointer hover:border-purple-400 transition" title="Text Color">
        <input type="color" onChange={(e) => exec('foreColor', e.target.value)} className="absolute -top-2 -left-2 w-12 h-12 cursor-pointer" />
      </div>
      <div className="w-px h-5 bg-gray-300 mx-1"></div>
      <button type="button" onMouseDown={(e) => { e.preventDefault(); exec('justifyLeft'); }} className="p-1.5 hover:bg-purple-100 hover:text-purple-700 rounded text-gray-700 transition" title="Align Left"><AlignLeft className="w-4 h-4" /></button>
      <button type="button" onMouseDown={(e) => { e.preventDefault(); exec('justifyCenter'); }} className="p-1.5 hover:bg-purple-100 hover:text-purple-700 rounded text-gray-700 transition" title="Center"><AlignCenter className="w-4 h-4" /></button>
      <button type="button" onMouseDown={(e) => { e.preventDefault(); exec('justifyRight'); }} className="p-1.5 hover:bg-purple-100 hover:text-purple-700 rounded text-gray-700 transition" title="Align Right"><AlignRight className="w-4 h-4" /></button>
      <div className="w-px h-5 bg-gray-300 mx-1"></div>
      <button type="button" onMouseDown={(e) => { e.preventDefault(); exec('insertUnorderedList'); }} className="p-1.5 hover:bg-purple-100 hover:text-purple-700 rounded text-gray-700 transition" title="Bullet List"><List className="w-4 h-4" /></button>
      <button type="button" onMouseDown={(e) => { e.preventDefault(); exec('insertOrderedList'); }} className="p-1.5 hover:bg-purple-100 hover:text-purple-700 rounded text-gray-700 transition" title="Numbered List"><ListOrdered className="w-4 h-4" /></button>
      <button type="button" onMouseDown={(e) => { e.preventDefault(); exec('insertHorizontalRule'); }} className="p-1.5 hover:bg-purple-100 hover:text-purple-700 rounded text-gray-700 transition" title="Horizontal Line"><Minus className="w-4 h-4" /></button>
    </div>
  );
};

const WordEditor = ({ value, onChange, minHeight = "45px", placeholder }) => {
  const editorRef = useRef(null);
  useEffect(() => { if (editorRef.current && value !== editorRef.current.innerHTML) { editorRef.current.innerHTML = value || ""; } }, [value]);
  const handleInput = () => { if (editorRef.current) { onChange(editorRef.current.innerHTML); } };
  return (
    <div
      ref={editorRef} contentEditable onInput={handleInput} onBlur={handleInput} 
      className="w-full p-2.5 outline-none resize-y text-gray-800 text-[13px] leading-relaxed custom-rich-text border border-gray-300 rounded-md focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all bg-white empty:before:content-[attr(placeholder)] empty:before:text-gray-400"
      style={{ minHeight }} placeholder={placeholder}
    />
  );
};

// eslint-disable-next-line no-unused-vars
const EditorSection = ({ title, icon: Icon, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border border-gray-200 rounded-lg bg-white mb-4 shadow-sm overflow-hidden">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors border-b border-gray-100">
        <div className="flex items-center gap-3"><Icon className="w-4 h-4 text-gray-500" /><h2 className="text-[14px] font-bold text-gray-700 uppercase tracking-widest">{title}</h2></div>
        {isOpen ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
      </button>
      {isOpen && <div className="p-5 bg-white space-y-4">{children}</div>}
    </div>
  );
};

const ResumeBuilder = () => {
  const { authData, fetchAuthData } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [isEditing, setIsEditing] = useState(() => {
    if (authData?.resumeData && authData.resumeData.name) return true;
    return false;
  });

  const [isSaving, setIsSaving] = useState(false);
  
  // 🔥 AI LOADING STATE 🔥
  const [isEnhancing, setIsEnhancing] = useState({ type: null, index: null });
  
  const [activeTab, setActiveTab] = useState("cv"); 
  const [zoom, setZoom] = useState(1); 
  const [totalPages, setTotalPages] = useState(1);
  const [printingPage, setPrintingPage] = useState(null);

  const [resumeData, setResumeData] = useState(() => {
    let initialData = DEFAULT_DUMMY_DATA;
    if (authData?.resumeData && authData.resumeData.name) {
       initialData = { ...DEFAULT_DUMMY_DATA, ...authData.resumeData };
    }
    if (!initialData.sectionOrder) initialData.sectionOrder = DEFAULT_DUMMY_DATA.sectionOrder;
    if (!initialData.customSections) initialData.customSections = [];
    if (!initialData.hiddenSections) initialData.hiddenSections = [];
    return initialData;
  });

const handleSave = async () => {
    setIsSaving(true);
    try {
      // 1. Save to the database
      await saveUserResume(resumeData);
      
      // 2. Fetch the newly saved data so the whole app knows about it!
      await fetchAuthData(); 
      
      // 3. Send them to their profile to see it
      navigate(`/profile/${authData._id}`);
      
    } catch (error) { 
      console.error("FULL SAVE ERROR:", error); 
      alert(`Error saving resume: ${error.message || "Check console for details"}`); 
    } finally { 
      setIsSaving(false); 
    }
  };

  // 🔥 AI MAGIC WAND HANDLER 🔥
  const handleAIEnhance = async (type, index, field, currentText) => {
    // Strip HTML to check if it's actually empty
    const plainText = currentText ? currentText.replace(/<[^>]*>?/gm, '').trim() : "";
    if (!plainText) {
      alert("Please write some rough notes first so the AI knows what to enhance!");
      return;
    }
    
    setIsEnhancing({ type, index });
    try {
      // Call the backend function we defined in api.js
      const enhancedText = await enhanceTextWithAI(currentText);
      
      if (type === "summary") {
        setResumeData({ ...resumeData, summary: enhancedText });
      } else {
        updateArrayField(type, index, field, enhancedText);
      }
    } catch (error) {
      console.error(error);
      alert("AI Enhancement failed. Please check if your backend server is running and the API key is correct.");
    } finally {
      setIsEnhancing({ type: null, index: null });
    }
  };

  const handleExportPage = (pageNumber) => {
    setPrintingPage(pageNumber);
    setTimeout(() => {
      window.print();
      setPrintingPage(null);
    }, 300);
  };

  const handleExportJSON = () => {
    const dataStr = JSON.stringify(resumeData, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${resumeData.name?.replace(/\s+/g, '_').toLowerCase() || 'resume'}_backup.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);
        if (importedData && importedData.template) {
          setResumeData({ ...DEFAULT_DUMMY_DATA, ...importedData });
          setIsEditing(true);
          alert("Resume data successfully imported!");
        } else { alert("Invalid resume backup file. Missing layout parameters."); }
      } catch { alert("Error parsing the JSON file."); }
    };
    reader.readAsText(file);
    event.target.value = null;
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setResumeData({ ...resumeData, profileImage: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTemplateSwitch = (tplId, tplData) => {
    if (isEditing) {
      setResumeData(prev => ({
        ...prev,
        template: tplId,
        headerAlignment: tplData.headerAlignment,
        showLines: tplData.showLines,
        nameSize: tplData.nameSize,
        sectionTitleSize: tplData.sectionTitleSize,
        textSize: tplData.textSize,
        bodyColor: tplData.bodyColor,
        nameColor: tplData.nameColor,
        headlineColor: tplData.headlineColor,
        connectionsColor: tplData.connectionsColor,
        sectionColor: tplData.sectionColor,
        linkColor: tplData.linkColor,
        footerColor: tplData.footerColor,
        topNoteColor: tplData.topNoteColor,
        marginTop: tplData.marginTop,
        marginBottom: tplData.marginBottom,
        marginLeft: tplData.marginLeft,
        marginRight: tplData.marginRight,
        lineSpacing: tplData.lineSpacing,
        showFooter: tplData.showFooter,
        showTopNote: tplData.showTopNote,
      }));
    } else {
      setResumeData(tplData);
    }
  };

  const updateArrayField = (type, index, field, value) => {
    const newArray = [...resumeData[type]];
    newArray[index][field] = value;
    setResumeData({ ...resumeData, [type]: newArray });
  };
  const addArrayItem = (type, template) => setResumeData({ ...resumeData, [type]: [...resumeData[type], template] });
  const removeArrayItem = (type, index) => setResumeData({ ...resumeData, [type]: resumeData[type].filter((_, i) => i !== index) });

  const moveSection = (index, direction) => {
    const newOrder = [...resumeData.sectionOrder];
    if (direction === "up" && index > 0) {
      [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
    } else if (direction === "down" && index < newOrder.length - 1) {
      [newOrder[index + 1], newOrder[index]] = [newOrder[index], newOrder[index + 1]];
    }
    setResumeData({ ...resumeData, sectionOrder: newOrder });
  };

  const toggleSectionVisibility = (sectionKey) => {
    setResumeData(prev => {
      const hidden = prev.hiddenSections || [];
      if (hidden.includes(sectionKey)) {
        return { ...prev, hiddenSections: hidden.filter(k => k !== sectionKey) };
      } else {
        return { ...prev, hiddenSections: [...hidden, sectionKey] };
      }
    });
  };

  const handleAddCustomSection = () => {
    const newId = `custom_${Date.now()}`;
    const newSection = { id: newId, title: "New Custom Section", content: "", visible: true };
    setResumeData(prev => ({
      ...prev,
      customSections: [...(prev.customSections || []), newSection],
      sectionOrder: [...prev.sectionOrder, newId]
    }));
  };

  const updateCustomSection = (id, field, value) => {
    setResumeData(prev => ({
      ...prev,
      customSections: prev.customSections.map(sec => sec.id === id ? { ...sec, [field]: value } : sec)
    }));
  };

  const handleRemoveCustomSection = (idToRemove) => {
    setResumeData(prev => ({
      ...prev,
      customSections: prev.customSections.filter(sec => sec.id !== idToRemove),
      sectionOrder: prev.sectionOrder.filter(key => key !== idToRemove),
      hiddenSections: prev.hiddenSections.filter(key => key !== idToRemove)
    }));
  };

  const getSectionLabel = (key) => {
    if (SECTION_LABELS[key]) return SECTION_LABELS[key];
    const custom = resumeData.customSections?.find(c => c.id === key);
    return custom ? custom.title || "Custom Section" : key;
  };

  return (
    <>
      <style>{`
        .custom-rich-text:empty:before { content: attr(placeholder); color: #9ca3af; pointer-events: none; display: block; }
        .custom-rich-text ul, .rich-text-preview ul { list-style-type: disc; padding-left: 24px; margin: 4px 0; }
        .custom-rich-text ol, .rich-text-preview ol { list-style-type: decimal; padding-left: 24px; margin: 4px 0; }
        .custom-rich-text li, .rich-text-preview li { margin-bottom: 2px; }
        .custom-rich-text hr, .rich-text-preview hr { border: none; border-top: 1.5px solid #000; margin: 12px 0; width: 100%; }
        .custom-rich-text font, .rich-text-preview font { line-height: 1.2; }
        .custom-rich-text p, .rich-text-preview p { margin: 0; padding: 0; }
        .custom-rich-text font[size] { font-size: 14px !important; }
        
        .rich-text-preview font[size="1"] { font-size: 10px; }
        .rich-text-preview font[size="2"] { font-size: 12px; }
        .rich-text-preview font[size="3"] { font-size: 16px; }
        .rich-text-preview font[size="4"] { font-size: 18px; }
        .rich-text-preview font[size="5"] { font-size: 24px; }
        .rich-text-preview font[size="6"] { font-size: 32px; }
        .rich-text-preview font[size="7"] { font-size: 48px; }
        .rich-text-preview a { color: inherit; text-decoration: none !important; }
        .rich-text-preview a:hover { opacity: 0.7; }

        @media print {
          @page { size: A4 portrait; margin: 0; }
          body, html, #root { height: auto !important; min-height: 100% !important; overflow: visible !important; position: static !important; background: white !important; margin: 0 !important; padding: 0 !important; }
          .hide-on-print { display: none !important; }
          .print-force-block { display: block !important; height: auto !important; min-height: 100% !important; overflow: visible !important; position: static !important; width: 100% !important; transform: none !important; background: white !important; border: none !important; margin: 0 !important; padding: 0 !important; }
        }
      `}</style>

      <input type="file" accept=".json" ref={fileInputRef} style={{ display: 'none' }} onChange={handleImportJSON} />

      <div className="flex flex-col h-screen bg-gray-100 overflow-hidden font-sans print-force-block">
        
        <div className="h-[60px] bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0 z-20 hide-on-print">
          <div className="flex items-center gap-4 w-1/4">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition text-gray-600"><ArrowLeft className="w-4 h-4" /></button>
            <div className="font-bold text-gray-800 tracking-tight flex flex-col"><span className="text-[15px] leading-tight">RigyaCV</span><span className="text-[11px] text-gray-400 font-normal">v16.0</span></div>
          </div>
          
          <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
            <button onClick={() => setActiveTab("cv")} className={`px-5 py-1.5 text-[13px] font-bold rounded-md transition-all ${activeTab === "cv" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>CV Data</button>
            <button onClick={() => setActiveTab("design")} className={`px-5 py-1.5 text-[13px] font-bold rounded-md transition-all ${activeTab === "design" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>Design</button>
            <button onClick={() => setActiveTab("layout")} className={`px-5 py-1.5 text-[13px] font-bold rounded-md transition-all ${activeTab === "layout" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>Layout</button>
          </div>

          <div className="flex items-center justify-end gap-3 w-1/4">
            <button onClick={() => fileInputRef.current.click()} className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 text-gray-700 border border-gray-200 font-semibold text-[13px] rounded-md hover:bg-gray-100 transition" title="Import JSON Backup">
              <Upload className="w-3.5 h-3.5" /> Import
            </button>

            <div className="relative group">
              <button className="flex items-center gap-2 px-4 py-1.5 bg-gray-50 text-gray-700 border border-gray-200 font-semibold text-[13px] rounded-md hover:bg-gray-100 transition">
                <Download className="w-3.5 h-3.5" /> Export <ChevronDown className="w-3.5 h-3.5 ml-1 text-gray-400" />
              </button>
              <div className="absolute right-0 top-full pt-1 hidden group-hover:block min-w-[150px] z-50">
                <div className="bg-white shadow-lg border border-gray-200 rounded-md py-1">
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button key={i} onClick={() => handleExportPage(i + 1)} className="w-full text-left px-4 py-2 text-[13px] font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors">
                      Export PDF (Page {i + 1})
                    </button>
                  ))}
                  <div className="w-full h-px bg-gray-100 my-1"></div>
                  <button onClick={handleExportJSON} className="w-full text-left px-4 py-2 text-[13px] font-bold text-purple-600 hover:bg-purple-50 hover:text-purple-700 transition-colors flex items-center gap-2">
                    <FileJson className="w-3.5 h-3.5" /> Export JSON
                  </button>
                </div>
              </div>
            </div>
            <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 bg-gray-900 text-white px-5 py-1.5 rounded-md font-semibold text-[13px] shadow-sm hover:bg-gray-800 disabled:opacity-70 transition">{isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Save</button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden print-force-block">
          
          <div className="w-full lg:w-[45%] bg-gray-50 border-r border-gray-200 overflow-y-auto custom-scrollbar relative flex flex-col hide-on-print">
            {activeTab === "cv" && <GlobalRibbon />}
            <div className="p-6 max-w-2xl mx-auto w-full pb-32">
              
              {/* CV TAB */}
              {activeTab === "cv" && (
                <div className="space-y-4 animate-fadeIn">
                  <EditorSection title="Header & Identity" icon={Type} defaultOpen={true}>
                    
                    <div className="flex gap-4">
                      <div className="flex-1">
                         <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Full Name</label>
                         <WordEditor placeholder="Your Name" value={resumeData.name} onChange={(val) => setResumeData({ ...resumeData, name: val })} />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mt-3">
                      <div className="col-span-2">
                        <div className="flex justify-between items-center mb-1">
                          <label className="block text-[11px] font-bold text-gray-500 uppercase">Academic Status / Subtitle</label>
                          <button onClick={() => toggleSectionVisibility('academicStatus')} className="text-gray-400 hover:text-blue-500 transition-colors" title="Toggle Visibility">
                            {resumeData.hiddenSections?.includes('academicStatus') ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                        <div className={`transition-all ${resumeData.hiddenSections?.includes("academicStatus") ? 'opacity-50 grayscale' : ''}`}>
                          <WordEditor placeholder="e.g. FINAL YEAR" value={resumeData.academicStatus} onChange={(val) => setResumeData({ ...resumeData, academicStatus: val })} />
                        </div>
                      </div>

                      <div className="col-span-2">
                        <div className="flex justify-between items-center mb-1">
                          <label className="block text-[11px] font-bold text-gray-500 uppercase">Address / Location</label>
                          <button onClick={() => toggleSectionVisibility('address')} className="text-gray-400 hover:text-blue-500 transition-colors" title="Toggle Visibility">
                            {resumeData.hiddenSections?.includes('address') ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                        <div className={`transition-all ${resumeData.hiddenSections?.includes("address") ? 'opacity-50 grayscale' : ''}`}>
                          <WordEditor placeholder="e.g. San Francisco, CA" value={resumeData.address} onChange={(val) => setResumeData({ ...resumeData, address: val })} />
                        </div>
                      </div>

                      <div className="col-span-2 mt-2 pt-4 border-t border-gray-100">
                        <label className="block text-[11px] font-bold text-gray-500 uppercase mb-2">Profile Picture (For Supported Templates)</label>
                        <div className="flex items-center gap-4">
                          {resumeData.profileImage ? (
                            <img src={resumeData.profileImage} alt="Profile" className="w-12 h-12 rounded-full object-cover border border-gray-300" />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gray-200 border border-gray-300 flex items-center justify-center text-gray-400 text-xs">IMG</div>
                          )}
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleImageUpload} 
                            className="text-[12px] file:mr-4 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:text-[12px] file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 outline-none cursor-pointer" 
                          />
                          {resumeData.profileImage && (
                            <button onClick={() => setResumeData({...resumeData, profileImage: ""})} className="text-[12px] text-red-500 hover:text-red-700 font-medium">Remove</button>
                          )}
                        </div>
                      </div>

                    </div>
                  </EditorSection>

                  <EditorSection title="Emails, Phones & Links" icon={Phone}>
                    <div className="space-y-4">
                      {resumeData.socialLinks.map((link, index) => {
                        const CurrentIcon = PLATFORMS[link.platform]?.icon || LinkIcon;
                        return (
                          <div key={index} className={`flex gap-3 items-start relative group p-3 rounded-md border border-gray-200 transition-all ${link.visible === false ? 'opacity-50 bg-gray-200 grayscale' : 'bg-gray-50'}`}>
                            
                            <div className="absolute -top-3 -right-3 flex gap-1">
                              <button onClick={() => updateArrayField("socialLinks", index, "visible", link.visible === false ? true : false)} className="bg-white border border-gray-200 text-gray-500 hover:text-blue-500 rounded-full p-1.5 shadow-sm transition-colors" title={link.visible === false ? "Show in Resume" : "Hide from Resume"}>
                                {link.visible === false ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                              </button>
                              <button onClick={() => removeArrayItem("socialLinks", index)} className="bg-white border border-gray-200 text-gray-500 hover:text-red-500 rounded-full p-1.5 shadow-sm transition-colors" title="Delete">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <div className="w-[120px] shrink-0 mt-1">
                              <div className="relative">
                                <CurrentIcon className={`w-4 h-4 absolute left-3 top-2.5 text-gray-500`} />
                                <select value={link.platform} onChange={(e) => updateArrayField("socialLinks", index, "platform", e.target.value)} className="w-full border border-gray-300 rounded-md py-2 pl-9 pr-2 text-[13px] outline-none bg-white appearance-none">
                                  {Object.keys(PLATFORMS).map(platform => <option key={platform} value={platform}>{platform}</option>)}
                                </select>
                              </div>
                            </div>

                            <div className="flex-1 flex flex-col gap-2">
                              <input 
                                type="text" 
                                placeholder={link.platform === "Email" ? "Email Address" : "Actual Hyperlink (e.g. https://...)"} 
                                className="w-full border border-gray-300 rounded-md py-2 px-3 text-[13px] outline-none focus:border-purple-500 transition-colors" 
                                value={link.url || ""} 
                                onChange={(e) => updateArrayField("socialLinks", index, "url", e.target.value)} 
                              />
                              <WordEditor 
                                placeholder="Display Name (Optional)" 
                                value={link.text || ""} 
                                onChange={(val) => updateArrayField("socialLinks", index, "text", val)} 
                                minHeight="38px" 
                              />
                            </div>
                          </div>
                        );
                      })}
                      <button onClick={() => addArrayItem("socialLinks", { platform: "Email", url: "", text: "", visible: true })} className="w-full py-2.5 border-2 border-dashed border-gray-300 text-purple-600 rounded-md hover:bg-purple-50 hover:border-purple-300 font-bold text-[13px] transition flex justify-center items-center gap-2"><Plus className="w-4 h-4" /> Add Item</button>
                    </div>
                  </EditorSection>

                  <EditorSection title="Summary" icon={LayoutTemplate}>
                    <div className={`relative p-4 border border-gray-200 rounded-md transition-all ${resumeData.hiddenSections?.includes("summary") ? 'opacity-50 bg-gray-200 grayscale' : 'bg-gray-50'}`}>
                      <div className="absolute -top-3 -right-3 flex gap-1 z-10">
                        {/* 🔥 AI ENHANCE BUTTON FOR SUMMARY 🔥 */}
                        <button onClick={() => handleAIEnhance('summary', null, null, resumeData.summary)} className="bg-white border border-gray-200 text-purple-600 hover:text-purple-800 rounded-full p-1.5 shadow-sm transition-colors" title="Enhance with AI ✨">
                          {isEnhancing.type === 'summary' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                        </button>
                        <button onClick={() => toggleSectionVisibility('summary')} className="bg-white border border-gray-200 text-gray-500 hover:text-blue-500 rounded-full p-1.5 shadow-sm transition-colors" title={resumeData.hiddenSections?.includes('summary') ? "Show in Resume" : "Hide from Resume"}>
                          {resumeData.hiddenSections?.includes('summary') ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                        <button onClick={() => setResumeData({ ...resumeData, summary: "" })} className="bg-white border border-gray-200 text-gray-500 hover:text-red-500 rounded-full p-1.5 shadow-sm transition-colors" title="Clear Text">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <WordEditor value={resumeData.summary} onChange={(val) => setResumeData({ ...resumeData, summary: val })} minHeight="80px" placeholder="Rough notes? Bullet points? Type them here and click the Sparkle button to make it professional..." />
                    </div>
                  </EditorSection>

                  <EditorSection title="Education" icon={Briefcase}>
                    <div className="space-y-6">
                      {resumeData.education.map((edu, index) => (
                        <div key={index} className={`relative p-4 border border-gray-200 rounded-md group transition-all ${edu.visible === false ? 'opacity-50 bg-gray-200 grayscale' : 'bg-gray-50'}`}>
                          
                          <div className="absolute -top-3 -right-3 flex gap-1">
                            <button onClick={() => updateArrayField("education", index, "visible", edu.visible === false ? true : false)} className="bg-white border border-gray-200 text-gray-500 hover:text-blue-500 rounded-full p-1.5 shadow-sm transition-colors">
                              {edu.visible === false ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                            <button onClick={() => removeArrayItem("education", index)} className="bg-white border border-gray-200 text-gray-500 hover:text-red-500 rounded-full p-1.5 shadow-sm transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="grid grid-cols-2 gap-3 mb-3">
                            <input type="text" placeholder="Institution Name" className="col-span-2 border border-gray-300 rounded-md py-2 px-3 text-[13px] outline-none" value={edu.school} onChange={(e) => updateArrayField("education", index, "school", e.target.value)} />
                            <input type="text" placeholder="Degree" className="border border-gray-300 rounded-md py-2 px-3 text-[13px] outline-none" value={edu.degree} onChange={(e) => updateArrayField("education", index, "degree", e.target.value)} />
                            <input type="text" placeholder="Dates" className="border border-gray-300 rounded-md py-2 px-3 text-[13px] outline-none" value={edu.year} onChange={(e) => updateArrayField("education", index, "year", e.target.value)} />
                          </div>
                          <WordEditor placeholder="Awards, GPA, or coursework..." value={edu.grade} onChange={(val) => updateArrayField("education", index, "grade", val)} minHeight="60px" />
                        </div>
                      ))}
                      <button onClick={() => addArrayItem("education", { school: "", degree: "", year: "", grade: "", visible: true })} className="w-full py-2.5 border-2 border-dashed border-gray-300 text-gray-500 rounded-md hover:bg-gray-100 font-bold text-[13px] flex justify-center items-center gap-2"><Plus className="w-4 h-4" /> Add Education</button>
                    </div>
                  </EditorSection>

                  <EditorSection title="Technical Skills" icon={Code2}>
                    <div className={`relative p-4 border border-gray-200 rounded-md transition-all ${resumeData.hiddenSections?.includes("skills") ? 'opacity-50 bg-gray-200 grayscale' : 'bg-gray-50'}`}>
                      <div className="absolute -top-3 -right-3 flex gap-1">
                        <button onClick={() => toggleSectionVisibility('skills')} className="bg-white border border-gray-200 text-gray-500 hover:text-blue-500 rounded-full p-1.5 shadow-sm transition-colors">
                          {resumeData.hiddenSections?.includes('skills') ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                        <button onClick={() => setResumeData({ ...resumeData, skills: "" })} className="bg-white border border-gray-200 text-gray-500 hover:text-red-500 rounded-full p-1.5 shadow-sm transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <WordEditor placeholder="Languages: Python..." value={resumeData.skills} onChange={(val) => setResumeData({ ...resumeData, skills: val })} minHeight="100px" />
                    </div>
                  </EditorSection>

                  <EditorSection title="Experience" icon={Briefcase}>
                    <div className="space-y-6">
                      {resumeData.experience.map((exp, index) => (
                        <div key={index} className={`relative p-4 border border-gray-200 rounded-md group transition-all ${exp.visible === false ? 'opacity-50 bg-gray-200 grayscale' : 'bg-gray-50'}`}>
                          
                          <div className="absolute -top-3 -right-3 flex gap-1 z-10">
                            {/* 🔥 AI ENHANCE BUTTON FOR EXPERIENCE 🔥 */}
                            <button onClick={() => handleAIEnhance('experience', index, 'description', exp.description)} className="bg-white border border-gray-200 text-purple-600 hover:text-purple-800 rounded-full p-1.5 shadow-sm transition-colors" title="Enhance with AI ✨">
                              {isEnhancing.type === 'experience' && isEnhancing.index === index ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                            </button>
                            <button onClick={() => updateArrayField("experience", index, "visible", exp.visible === false ? true : false)} className="bg-white border border-gray-200 text-gray-500 hover:text-blue-500 rounded-full p-1.5 shadow-sm transition-colors">
                              {exp.visible === false ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                            <button onClick={() => removeArrayItem("experience", index)} className="bg-white border border-gray-200 text-gray-500 hover:text-red-500 rounded-full p-1.5 shadow-sm transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="grid grid-cols-2 gap-3 mb-3">
                            <input type="text" placeholder="Company Name" className="border border-gray-300 rounded-md py-2 px-3 text-[13px] outline-none" value={exp.company} onChange={(e) => updateArrayField("experience", index, "company", e.target.value)} />
                            <input type="text" placeholder="Dates" className="border border-gray-300 rounded-md py-2 px-3 text-[13px] outline-none" value={exp.dates} onChange={(e) => updateArrayField("experience", index, "dates", e.target.value)} />
                            <input type="text" placeholder="Job Title" className="border border-gray-300 rounded-md py-2 px-3 text-[13px] outline-none" value={exp.title} onChange={(e) => updateArrayField("experience", index, "title", e.target.value)} />
                            <input type="text" placeholder="Location" className="border border-gray-300 rounded-md py-2 px-3 text-[13px] outline-none" value={exp.location} onChange={(e) => updateArrayField("experience", index, "location", e.target.value)} />
                          </div>
                          <WordEditor value={exp.description} onChange={(val) => updateArrayField("experience", index, "description", val)} minHeight="100px" placeholder="Write rough notes about what you did here, then click the Sparkles button to rewrite it professionally!" />
                        </div>
                      ))}
                      <button onClick={() => addArrayItem("experience", { title: "", company: "", dates: "", location: "", description: "", visible: true })} className="w-full py-2.5 border-2 border-dashed border-gray-300 text-gray-500 rounded-md hover:bg-gray-100 font-bold text-[13px] flex justify-center items-center gap-2"><Plus className="w-4 h-4" /> Add Experience</button>
                    </div>
                  </EditorSection>

                  <EditorSection title="Projects" icon={Code}>
                    <div className="space-y-6">
                      {resumeData.projects.map((proj, index) => (
                        <div key={index} className={`relative p-4 border border-gray-200 rounded-md group transition-all ${proj.visible === false ? 'opacity-50 bg-gray-200 grayscale' : 'bg-gray-50'}`}>
                          
                          <div className="absolute -top-3 -right-3 flex gap-1 z-10">
                            {/* 🔥 AI ENHANCE BUTTON FOR PROJECTS 🔥 */}
                            <button onClick={() => handleAIEnhance('projects', index, 'description', proj.description)} className="bg-white border border-gray-200 text-purple-600 hover:text-purple-800 rounded-full p-1.5 shadow-sm transition-colors" title="Enhance with AI ✨">
                              {isEnhancing.type === 'projects' && isEnhancing.index === index ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                            </button>
                            <button onClick={() => updateArrayField("projects", index, "visible", proj.visible === false ? true : false)} className="bg-white border border-gray-200 text-gray-500 hover:text-blue-500 rounded-full p-1.5 shadow-sm transition-colors">
                              {proj.visible === false ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                            <button onClick={() => removeArrayItem("projects", index)} className="bg-white border border-gray-200 text-gray-500 hover:text-red-500 rounded-full p-1.5 shadow-sm transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="grid grid-cols-2 gap-3 mb-3">
                            <input type="text" placeholder="Project Name" className="border border-gray-300 rounded-md py-2 px-3 text-[13px] outline-none" value={proj.name} onChange={(e) => updateArrayField("projects", index, "name", e.target.value)} />
                            <input type="text" placeholder="Tech Stack / Dates" className="border border-gray-300 rounded-md py-2 px-3 text-[13px] outline-none" value={proj.tech} onChange={(e) => updateArrayField("projects", index, "tech", e.target.value)} />
                            <input type="text" placeholder="Project Link (Optional)" className="col-span-2 border border-gray-300 rounded-md py-2 px-3 text-[13px] outline-none focus:border-purple-500" value={proj.url || ""} onChange={(e) => updateArrayField("projects", index, "url", e.target.value)} />
                          </div>
                          <WordEditor value={proj.description} onChange={(val) => updateArrayField("projects", index, "description", val)} minHeight="100px" placeholder="Write rough notes about the project here, then click the Sparkles button to rewrite it!" />
                        </div>
                      ))}
                      <button onClick={() => addArrayItem("projects", { name: "", tech: "", url: "", description: "", visible: true })} className="w-full py-2.5 border-2 border-dashed border-gray-300 text-gray-500 rounded-md hover:bg-gray-100 font-bold text-[13px] flex justify-center items-center gap-2"><Plus className="w-4 h-4" /> Add Project</button>
                    </div>
                  </EditorSection>

                  <EditorSection title="Publications" icon={Code}>
                    <div className="space-y-6">
                      {resumeData.publications.map((pub, index) => (
                        <div key={index} className={`relative p-4 border border-gray-200 rounded-md group transition-all ${pub.visible === false ? 'opacity-50 bg-gray-200 grayscale' : 'bg-gray-50'}`}>
                          
                          <div className="absolute -top-3 -right-3 flex gap-1">
                            <button onClick={() => updateArrayField("publications", index, "visible", pub.visible === false ? true : false)} className="bg-white border border-gray-200 text-gray-500 hover:text-blue-500 rounded-full p-1.5 shadow-sm transition-colors">
                              {pub.visible === false ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                            <button onClick={() => removeArrayItem("publications", index)} className="bg-white border border-gray-200 text-gray-500 hover:text-red-500 rounded-full p-1.5 shadow-sm transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="grid grid-cols-2 gap-3 mb-3">
                            <input type="text" placeholder="Paper Title" className="col-span-2 border border-gray-300 rounded-md py-2 px-3 text-[13px] outline-none font-bold" value={pub.title} onChange={(e) => updateArrayField("publications", index, "title", e.target.value)} />
                            <input type="text" placeholder="Date (e.g. July 2023)" className="border border-gray-300 rounded-md py-2 px-3 text-[13px] outline-none" value={pub.date} onChange={(e) => updateArrayField("publications", index, "date", e.target.value)} />
                          </div>
                          <div className="space-y-3">
                            <WordEditor value={pub.authors} onChange={(val) => updateArrayField("publications", index, "authors", val)} minHeight="45px" placeholder="Authors (Use italic for your name)..." />
                            <WordEditor value={pub.details} onChange={(val) => updateArrayField("publications", index, "details", val)} minHeight="45px" placeholder="Links or Conference Details..." />
                          </div>
                        </div>
                      ))}
                      <button onClick={() => addArrayItem("publications", { title: "", date: "", authors: "", details: "", visible: true })} className="w-full py-2.5 border-2 border-dashed border-gray-300 text-gray-500 rounded-md hover:bg-gray-100 font-bold text-[13px] flex justify-center items-center gap-2"><Plus className="w-4 h-4" /> Add Publication</button>
                    </div>
                  </EditorSection>

                  <EditorSection title="Selected Honors" icon={Award}>
                    <div className={`relative p-4 border border-gray-200 rounded-md transition-all ${resumeData.hiddenSections?.includes("honors") ? 'opacity-50 bg-gray-200 grayscale' : 'bg-gray-50'}`}>
                      <div className="absolute -top-3 -right-3 flex gap-1">
                        <button onClick={() => toggleSectionVisibility('honors')} className="bg-white border border-gray-200 text-gray-500 hover:text-blue-500 rounded-full p-1.5 shadow-sm transition-colors">
                          {resumeData.hiddenSections?.includes('honors') ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                        <button onClick={() => setResumeData({ ...resumeData, honors: "" })} className="bg-white border border-gray-200 text-gray-500 hover:text-red-500 rounded-full p-1.5 shadow-sm transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <WordEditor placeholder="Use Bullet Points for awards..." value={resumeData.honors} onChange={(val) => setResumeData({ ...resumeData, honors: val })} minHeight="100px" />
                    </div>
                  </EditorSection>

                  <EditorSection title="Patents" icon={Code2}>
                    <div className={`relative p-4 border border-gray-200 rounded-md transition-all ${resumeData.hiddenSections?.includes("patents") ? 'opacity-50 bg-gray-200 grayscale' : 'bg-gray-50'}`}>
                      <div className="absolute -top-3 -right-3 flex gap-1">
                        <button onClick={() => toggleSectionVisibility('patents')} className="bg-white border border-gray-200 text-gray-500 hover:text-blue-500 rounded-full p-1.5 shadow-sm transition-colors">
                          {resumeData.hiddenSections?.includes('patents') ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                        <button onClick={() => setResumeData({ ...resumeData, patents: "" })} className="bg-white border border-gray-200 text-gray-500 hover:text-red-500 rounded-full p-1.5 shadow-sm transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <WordEditor placeholder="Use Numbered List for patents..." value={resumeData.patents} onChange={(val) => setResumeData({ ...resumeData, patents: val })} minHeight="100px" />
                    </div>
                  </EditorSection>

                  <EditorSection title="Extra-Curriculars" icon={Award}>
                    <div className="space-y-6">
                      {resumeData.extracurriculars.map((act, index) => (
                        <div key={index} className={`relative p-4 border border-gray-200 rounded-md group transition-all ${act.visible === false ? 'opacity-50 bg-gray-200 grayscale' : 'bg-gray-50'}`}>
                          
                          <div className="absolute -top-3 -right-3 flex gap-1 z-10">
                             {/* 🔥 AI ENHANCE BUTTON FOR EXTRACURRICULARS 🔥 */}
                             <button onClick={() => handleAIEnhance('extracurriculars', index, 'description', act.description)} className="bg-white border border-gray-200 text-purple-600 hover:text-purple-800 rounded-full p-1.5 shadow-sm transition-colors" title="Enhance with AI ✨">
                              {isEnhancing.type === 'extracurriculars' && isEnhancing.index === index ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                            </button>
                            <button onClick={() => updateArrayField("extracurriculars", index, "visible", act.visible === false ? true : false)} className="bg-white border border-gray-200 text-gray-500 hover:text-blue-500 rounded-full p-1.5 shadow-sm transition-colors">
                              {act.visible === false ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                            <button onClick={() => removeArrayItem("extracurriculars", index)} className="bg-white border border-gray-200 text-gray-500 hover:text-red-500 rounded-full p-1.5 shadow-sm transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="grid grid-cols-2 gap-3 mb-3">
                            <input type="text" placeholder="Organization" className="border border-gray-300 rounded-md py-2 px-3 text-[13px] outline-none" value={act.organization} onChange={(e) => updateArrayField("extracurriculars", index, "organization", e.target.value)} />
                            <input type="text" placeholder="Dates" className="border border-gray-300 rounded-md py-2 px-3 text-[13px] outline-none" value={act.dates} onChange={(e) => updateArrayField("extracurriculars", index, "dates", e.target.value)} />
                            <input type="text" placeholder="Role" className="col-span-2 border border-gray-300 rounded-md py-2 px-3 text-[13px] outline-none" value={act.role} onChange={(e) => updateArrayField("extracurriculars", index, "role", e.target.value)} />
                          </div>
                          <WordEditor placeholder="Write rough notes about your activities here..." value={act.description} onChange={(val) => updateArrayField("extracurriculars", index, "description", val)} minHeight="60px" />
                        </div>
                      ))}
                      <button onClick={() => addArrayItem("extracurriculars", { organization: "", role: "", dates: "", description: "", visible: true })} className="w-full py-2.5 border-2 border-dashed border-gray-300 text-gray-500 rounded-md hover:bg-gray-100 font-bold text-[13px] flex justify-center items-center gap-2"><Plus className="w-4 h-4" /> Add Extra-Curricular</button>
                    </div>
                  </EditorSection>

                  <EditorSection title="Invited Talks" icon={Youtube}>
                    <div className={`relative p-4 border border-gray-200 rounded-md transition-all ${resumeData.hiddenSections?.includes("talks") ? 'opacity-50 bg-gray-200 grayscale' : 'bg-gray-50'}`}>
                      <div className="absolute -top-3 -right-3 flex gap-1">
                        <button onClick={() => toggleSectionVisibility('talks')} className="bg-white border border-gray-200 text-gray-500 hover:text-blue-500 rounded-full p-1.5 shadow-sm transition-colors">
                          {resumeData.hiddenSections?.includes('talks') ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                        <button onClick={() => setResumeData({ ...resumeData, talks: "" })} className="bg-white border border-gray-200 text-gray-500 hover:text-red-500 rounded-full p-1.5 shadow-sm transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <WordEditor placeholder="Use Numbered List for talks..." value={resumeData.talks} onChange={(val) => setResumeData({ ...resumeData, talks: val })} minHeight="100px" />
                    </div>
                  </EditorSection>

                  {resumeData.customSections?.map((customSec) => (
                    <EditorSection key={customSec.id} title={customSec.title || "Custom Section"} icon={LayoutTemplate}>
                      <div className={`relative p-4 border border-gray-200 rounded-md transition-all ${resumeData.hiddenSections?.includes(customSec.id) ? 'opacity-50 bg-gray-200 grayscale' : 'bg-gray-50'}`}>
                        
                        <div className="absolute -top-3 -right-3 flex gap-1 z-10">
                          <button onClick={() => toggleSectionVisibility(customSec.id)} className="bg-white border border-gray-200 text-gray-500 hover:text-blue-500 rounded-full p-1.5 shadow-sm transition-colors">
                            {resumeData.hiddenSections?.includes(customSec.id) ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                          <button onClick={() => handleRemoveCustomSection(customSec.id)} className="bg-white border border-gray-200 text-gray-500 hover:text-red-500 rounded-full p-1.5 shadow-sm transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="mb-3">
                           <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Section Title</label>
                           <input 
                             type="text" 
                             className="w-full border border-gray-300 rounded-md py-2 px-3 text-[13px] outline-none focus:border-purple-500 transition-colors bg-white" 
                             value={customSec.title} 
                             onChange={(e) => updateCustomSection(customSec.id, 'title', e.target.value)} 
                             placeholder="e.g., Certifications..."
                           />
                        </div>
                        
                        <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Content</label>
                        <WordEditor 
                          value={customSec.content} 
                          onChange={(val) => updateCustomSection(customSec.id, 'content', val)} 
                          minHeight="100px" 
                          placeholder="Type or paste your content here..." 
                        />
                      </div>
                    </EditorSection>
                  ))}

                  <div className="pt-2">
                    <button onClick={handleAddCustomSection} className="w-full py-3 border-2 border-dashed border-gray-300 text-purple-600 rounded-lg hover:bg-purple-50 hover:border-purple-300 font-bold text-[13px] transition flex justify-center items-center gap-2 shadow-sm">
                      <Plus className="w-4 h-4" /> Add Custom Section
                    </button>
                  </div>

                </div>
              )}

              {/* DESIGN TAB */}
              {activeTab === "design" && (
                <div className="animate-fadeIn space-y-6">
                  
                  <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <h2 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Typography Settings</h2>
                    <div className="flex flex-col">
                      <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <span className="text-[13px] text-gray-600 font-medium">Name Size</span>
                        <select className="w-48 bg-gray-50 border border-gray-200 rounded text-[13px] py-1.5 px-3 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all" value={resumeData.nameSize} onChange={(e) => setResumeData({ ...resumeData, nameSize: e.target.value })}>
                          <option value="text-[32px]">Small (32px)</option>
                          <option value="text-[40px]">Medium (40px)</option>
                          <option value="text-[48px]">Large (48px)</option>
                        </select>
                      </div>
                      <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <span className="text-[13px] text-gray-600 font-medium">Title Size</span>
                        <select className="w-48 bg-gray-50 border border-gray-200 rounded text-[13px] py-1.5 px-3 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all" value={resumeData.sectionTitleSize || 16} onChange={(e) => setResumeData({ ...resumeData, sectionTitleSize: Number(e.target.value) })}>
                          {[14, 15, 16, 18, 20, 22].map(size => (<option key={size} value={size}>{size} px</option>))}
                        </select>
                      </div>
                      <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <span className="text-[13px] text-gray-600 font-medium">Header Alignment</span>
                        <div className="flex border border-gray-200 rounded overflow-hidden h-[32px] w-48 bg-gray-50">
                          <button onClick={() => setResumeData({ ...resumeData, headerAlignment: 'text-left' })} className={`flex-1 flex justify-center items-center transition ${resumeData.headerAlignment === 'text-left' ? 'bg-purple-100 text-purple-700 shadow-inner' : 'text-gray-500 hover:bg-gray-200'}`}><AlignLeft className="w-4 h-4" /></button>
                          <div className="w-px bg-gray-200"></div>
                          <button onClick={() => setResumeData({ ...resumeData, headerAlignment: 'text-center' })} className={`flex-1 flex justify-center items-center transition ${resumeData.headerAlignment === 'text-center' ? 'bg-purple-100 text-purple-700 shadow-inner' : 'text-gray-500 hover:bg-gray-200'}`}><AlignCenter className="w-4 h-4" /></button>
                          <div className="w-px bg-gray-200"></div>
                          <button onClick={() => setResumeData({ ...resumeData, headerAlignment: 'text-right' })} className={`flex-1 flex justify-center items-center transition ${resumeData.headerAlignment === 'text-right' ? 'bg-purple-100 text-purple-700 shadow-inner' : 'text-gray-500 hover:bg-gray-200'}`}><AlignRight className="w-4 h-4" /></button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <h2 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Colors</h2>
                    <div className="flex flex-col">
                      <ColorRow label="Body" colorValue={resumeData.bodyColor || "#000000"} onChange={(v) => setResumeData({...resumeData, bodyColor: v})} />
                      <ColorRow label="Name" colorValue={resumeData.nameColor || "#004f90"} onChange={(v) => setResumeData({...resumeData, nameColor: v})} />
                      <ColorRow label="Headline" colorValue={resumeData.headlineColor || "#f92807"} onChange={(v) => setResumeData({...resumeData, headlineColor: v})} />
                      <ColorRow label="Connections" colorValue={resumeData.connectionsColor || "#004f90"} onChange={(v) => setResumeData({...resumeData, connectionsColor: v})} />
                      <ColorRow label="Section Titles" colorValue={resumeData.sectionColor || "#004f90"} onChange={(v) => setResumeData({...resumeData, sectionColor: v})} />
                      <ColorRow label="Links" colorValue={resumeData.linkColor || "#004f90"} onChange={(v) => setResumeData({...resumeData, linkColor: v})} />
                      <ColorRow label="Footer" colorValue={resumeData.footerColor || "#808080"} onChange={(v) => setResumeData({...resumeData, footerColor: v})} />
                      <ColorRow label="Top Note" colorValue={resumeData.topNoteColor || "#808080"} onChange={(v) => setResumeData({...resumeData, topNoteColor: v})} />
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <h2 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Page Layout</h2>
                    <div className="flex flex-col">
                      <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <span className="text-[13px] text-gray-600 font-medium">Line Spacing</span>
                        <select className="w-48 bg-gray-50 border border-gray-200 rounded text-[13px] py-1.5 px-3 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all" value={resumeData.lineSpacing || 1.5} onChange={(e) => setResumeData({ ...resumeData, lineSpacing: Number(e.target.value) })}>
                          <option value={1.2}>Tight (1.2)</option>
                          <option value={1.35}>Snug (1.35)</option>
                          <option value={1.5}>Normal (1.5)</option>
                          <option value={1.7}>Relaxed (1.7)</option>
                          <option value={2.0}>Loose (2.0)</option>
                        </select>
                      </div>
                      
                      <InputRow label="Top Margin" value={resumeData.marginTop ?? 67} onChange={(v) => setResumeData({...resumeData, marginTop: v})} unit="px" />
                      <InputRow label="Bottom Margin" value={resumeData.marginBottom ?? 67} onChange={(v) => setResumeData({...resumeData, marginBottom: v})} unit="px" />
                      <InputRow label="Left Margin" value={resumeData.marginLeft ?? 67} onChange={(v) => setResumeData({...resumeData, marginLeft: v})} unit="px" />
                      <InputRow label="Right Margin" value={resumeData.marginRight ?? 67} onChange={(v) => setResumeData({...resumeData, marginRight: v})} unit="px" />
                      
                      <ToggleRow label="Show Footer" isActive={resumeData.showFooter !== false} onToggle={() => setResumeData({...resumeData, showFooter: resumeData.showFooter === false ? true : false})} />
                      <ToggleRow label="Show Top Note" isActive={resumeData.showTopNote !== false} onToggle={() => setResumeData({...resumeData, showTopNote: resumeData.showTopNote === false ? true : false})} />
                      <ToggleRow label="Show Section Underlines" isActive={resumeData.showLines !== false} onToggle={() => setResumeData({...resumeData, showLines: resumeData.showLines === false ? true : false})} />
                    </div>
                  </div>

                </div>
              )}

              {/* LAYOUT TAB */}
              {activeTab === "layout" && (
                <div className="animate-fadeIn space-y-6">
                  
                  <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <h2 className="text-[14px] font-bold text-gray-700 uppercase tracking-widest">Choose Template Layout</h2>
                      
                      <button 
                        onClick={() => setIsEditing(true)} 
                        disabled={isEditing}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-bold transition-all ${isEditing ? 'bg-green-100 text-green-700 border border-green-200 cursor-default' : 'bg-purple-600 text-white border border-purple-700 hover:bg-purple-700 shadow-sm cursor-pointer'}`}
                      >
                        {isEditing ? <Check className="w-3.5 h-3.5" /> : <Edit2 className="w-3.5 h-3.5" />}
                        {isEditing ? "Editing Started (Data Locked)" : "Start Editing"}
                      </button>
                    </div>
                    
                    <p className="text-[12px] text-gray-500 mb-4">
                      {isEditing 
                        ? "Your typed content is safely locked. Switching templates will now only update the design." 
                        : "Viewing Demo Mode. Switching templates will load demo data. Click 'Start Editing' to write your own!"}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[{ id: "alok", name: "Alok Academic", desc: "Perfect for Indian campus placements.", data: ALOK_DUMMY_DATA },
                        { id: "classic", name: "RenderCV Classic", desc: "Sleek sans-serif rendering.", data: CLASSIC_DUMMY_DATA },
                        { id: "modern", name: "Modern Two-Column", desc: "Professional split-layout with photo.", data: MODERN_DUMMY_DATA }].map(tpl => (
                        <div 
                          key={tpl.id} 
                          onClick={() => handleTemplateSwitch(tpl.id, tpl.data)} 
                          className={`cursor-pointer border-2 rounded-xl p-4 transition-all flex flex-col justify-between ${resumeData.template === tpl.id ? "border-gray-900 bg-gray-50 shadow-md ring-1 ring-gray-900" : "border-gray-200 bg-white hover:border-gray-300"}`}
                        >
                          <div>
                            <div className={`font-bold ${resumeData.template === tpl.id ? 'text-gray-900' : 'text-gray-800'} mb-1`}>{tpl.name}</div>
                            <div className={`text-[12px] ${resumeData.template === tpl.id ? 'text-gray-700' : 'text-gray-500'}`}>{tpl.desc}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <h2 className="text-[14px] font-bold text-gray-700 uppercase tracking-widest mb-4">Section Reordering</h2>
                    <p className="text-[12px] text-gray-500 mb-4">Click the arrows to move sections, or the eye icon to completely hide a section from the resume.</p>
                    
                    <div className="space-y-2">
                      {resumeData.sectionOrder?.map((sectionKey, index) => (
                        <div key={sectionKey} className={`flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 transition-colors ${resumeData.hiddenSections?.includes(sectionKey) ? 'opacity-50 grayscale' : ''}`}>
                          
                          <span className="text-[13px] font-bold text-gray-700 uppercase tracking-wide">
                            {getSectionLabel(sectionKey)} {resumeData.hiddenSections?.includes(sectionKey) && <span className="text-red-500 normal-case italic ml-1 font-normal">(Hidden)</span>}
                            
                          </span>
                          
                          <div className="flex items-center gap-2">
                            <button onClick={() => toggleSectionVisibility(sectionKey)} className="p-1.5 text-gray-500 hover:text-blue-600 transition-colors" title="Toggle Visibility">
                              {resumeData.hiddenSections?.includes(sectionKey) ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                            
                            <div className="w-px h-4 bg-gray-300"></div>

                            <button 
                              onClick={() => moveSection(index, 'up')} 
                              disabled={index === 0}
                              className="p-1.5 bg-white border border-gray-300 rounded hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                              title="Move Up"
                            >
                              <ArrowUp className="w-3.5 h-3.5 text-gray-600" />
                            </button>
                            <button 
                              onClick={() => moveSection(index, 'down')} 
                              disabled={index === resumeData.sectionOrder.length - 1}
                              className="p-1.5 bg-white border border-gray-300 rounded hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                              title="Move Down"
                            >
                              <ArrowDown className="w-3.5 h-3.5 text-gray-600" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}

            </div>
          </div>

          {/* RIGHT PANE: LIVE PREVIEW & PRINT TARGET */}
          <div className="hidden lg:flex flex-col w-[55%] bg-[#525659] border-l border-gray-300 relative print-force-block">
            
            <div className="absolute bottom-6 flex justify-center w-full z-10 pointer-events-none hide-on-print">
              <div className="flex items-center gap-2 bg-gray-900/80 backdrop-blur-sm text-white px-4 py-2 rounded-full shadow-xl pointer-events-auto">
                <button onClick={() => setZoom(Math.max(0.5, zoom - 0.1))} className="p-1 hover:bg-white/20 rounded transition"><ZoomOut className="w-4 h-4" /></button>
                <span className="text-[12px] font-mono w-12 text-center">{Math.round(zoom * 100)}%</span>
                <button onClick={() => setZoom(Math.min(1.5, zoom + 0.1))} className="p-1 hover:bg-white/20 rounded transition"><ZoomIn className="w-4 h-4" /></button>
                <div className="w-px h-4 bg-gray-500 mx-1"></div>
                <button onClick={() => setZoom(1)} className="p-1 hover:bg-white/20 rounded transition" title="Reset"><Maximize className="w-4 h-4" /></button>
              </div>
            </div>

            <div className="flex-1 overflow-auto custom-scrollbar flex justify-center p-8 print-force-block print:!p-0 print:!overflow-visible print:bg-white">
              <div style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }} className="transition-transform duration-200 ease-out print-force-block print:!transform-none">
                {resumeData.template === "alok" && <AlokTemplate resumeData={resumeData} printingPage={printingPage} onPagesCalculated={setTotalPages} />}
                {resumeData.template === "classic" && <ClassicTemplate resumeData={resumeData} printingPage={printingPage} onPagesCalculated={setTotalPages} />}
                {resumeData.template === "modern" && <ModernTemplate resumeData={resumeData} printingPage={printingPage} onPagesCalculated={setTotalPages} />}
              </div>
            </div>

          </div>

        </div>
      </div>
    </>
  );
};

export default ResumeBuilder;