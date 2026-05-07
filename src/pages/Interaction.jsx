import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { submitAppFeedback, getAppFeedbacks, upvoteAppFeedback, downvoteAppFeedback, deleteAppFeedback } from "../api";

export default function Interaction() {
  const { authData } = useAuth();

  const [formData, setFormData] = useState({
    name: authData?.name || "", 
    email: authData?.email || "", 
    mobile: "", 
    feedbackType: "Bug Report",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [feedbacks, setFeedbacks] = useState([]);

  const formRef = useRef(null);
  const carouselRefs = useRef({}); 
  const [formRatio, setFormRatio] = useState(1);

  // 🟢 NEW: Ref to track mouse dragging state without causing re-renders
  const dragState = useRef({ isDragging: false, startX: 0, scrollLeft: 0 });

  useEffect(() => {
    const fetchRealData = async () => {
      try {
        const dbFeedbacks = await getAppFeedbacks();
        const formattedData = dbFeedbacks.map(fb => ({
          ...fb,
          id: fb._id, 
          date: new Date(fb.createdAt).toLocaleString() 
        }));
        setFeedbacks(formattedData);
      } catch (error) {
        console.error("Failed to load feedbacks:", error);
      }
    };
    fetchRealData();
  }, []);

  useEffect(() => {
    const options = { root: null, threshold: Array.from({ length: 50 }, (_, i) => i / 50) };
    const formObserver = new IntersectionObserver(([entry]) => {
      setFormRatio(entry.intersectionRatio);
    }, options);

    if (formRef.current) formObserver.observe(formRef.current);
    return () => formObserver.disconnect();
  }, [feedbacks.length]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        userId: authData?._id 
      };

      const result = await submitAppFeedback(payload);
      
      const newlySavedFeedback = {
        ...result.feedback,
        id: result.feedback._id,
        date: new Date(result.feedback.createdAt).toLocaleString()
      };
      
      setFeedbacks([newlySavedFeedback, ...feedbacks]);
      setSubmitted(true);
      setFormData({ name: authData?.name || "", email: authData?.email || "", mobile: "", feedbackType: "Bug Report", message: "" });
      setTimeout(() => setSubmitted(false), 4000);
    } catch (error) {
      alert("Error submitting feedback. Please try again.");
    }
  };

  const handleUpvote = async (id) => {
    try {
      setFeedbacks(feedbacks.map(fb => fb.id === id ? { ...fb, upvotes: (fb.upvotes || 0) + 1 } : fb));
      await upvoteAppFeedback(id);
    } catch (error) {
      console.error("Failed to upvote", error);
    }
  };

  const handleDownvote = async (id) => {
    try {
      setFeedbacks(feedbacks.map(fb => fb.id === id ? { ...fb, downvotes: (fb.downvotes || 0) + 1 } : fb));
      await downvoteAppFeedback(id);
    } catch (error) {
      console.error("Failed to downvote", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this feedback?")) {
      try {
        await deleteAppFeedback(id);
        setFeedbacks(feedbacks.filter(fb => fb.id !== id));
      } catch (error) {
        alert("Failed to delete feedback.");
      }
    }
  };

  const getBadgeColor = (type) => {
    switch (type) {
      case "Bug Report": return "bg-rose-100 text-rose-700 border-rose-200";
      case "Feature Request": return "bg-indigo-100 text-indigo-700 border-indigo-200";
      case "Technical Issue": return "bg-amber-100 text-amber-700 border-amber-200";
      case "Testimonial": return "bg-purple-100 text-purple-700 border-purple-200";
      default: return "bg-emerald-100 text-emerald-700 border-emerald-200";
    }
  };

  const groupedFeedbacks = feedbacks.reduce((acc, fb) => {
    if (!acc[fb.feedbackType]) acc[fb.feedbackType] = [];
    acc[fb.feedbackType].push(fb);
    return acc;
  }, {});

  // Button Scroll Handlers
  const scrollLeft = (categoryName) => {
    if (carouselRefs.current[categoryName]) {
      carouselRefs.current[categoryName].scrollBy({ left: -340, behavior: "smooth" });
    }
  };

  const scrollRight = (categoryName) => {
    if (carouselRefs.current[categoryName]) {
      carouselRefs.current[categoryName].scrollBy({ left: 340, behavior: "smooth" });
    }
  };

  // 🟢 NEW: Mouse Drag-to-Scroll Handlers
  const handleMouseDown = (e, categoryName) => {
    const slider = carouselRefs.current[categoryName];
    if (!slider) return;
    dragState.current.isDragging = true;
    dragState.current.startX = e.pageX - slider.offsetLeft;
    dragState.current.scrollLeft = slider.scrollLeft;
    
    // UI updates while dragging
    slider.style.cursor = 'grabbing';
    slider.style.scrollBehavior = 'auto'; // Instant movement while dragging
    slider.style.scrollSnapType = 'none'; // Disable snapping so it doesn't fight the mouse
  };

  const handleMouseLeaveOrUp = (categoryName) => {
    const slider = carouselRefs.current[categoryName];
    if (!slider) return;
    dragState.current.isDragging = false;
    
    // Reset UI when let go
    slider.style.cursor = 'grab';
    slider.style.scrollBehavior = 'smooth';
    slider.style.scrollSnapType = 'x mandatory'; // Turn snapping back on
  };

  const handleMouseMove = (e, categoryName) => {
    if (!dragState.current.isDragging) return;
    e.preventDefault();
    const slider = carouselRefs.current[categoryName];
    if (!slider) return;
    
    // Calculate how far mouse moved and multiply for speed
    const x = e.pageX - slider.offsetLeft;
    const walk = (x - dragState.current.startX) * 1.5; 
    slider.scrollLeft = dragState.current.scrollLeft - walk;
  };

  const calculatedFormOpacity = formRatio > 0.3 ? 1 : Math.max(0, formRatio / 0.3);
  const calculatedFormScale = formRatio > 0.3 ? 1 : 0.95 + (formRatio / 0.3) * 0.05;
  const feedbackTranslateY = (1 - formRatio) * -60; 

  return (
    <div className="h-full w-full overflow-y-auto custom-scrollbar pb-16 px-4 sm:px-0 scroll-smooth">
      <div className="w-full max-w-5xl mx-auto mt-0 relative flex flex-col">
        
        {/* ================= FORM SECTION ================= */}
        <div ref={formRef} style={{ opacity: calculatedFormOpacity, transform: `scale(${calculatedFormScale})`, pointerEvents: calculatedFormOpacity < 0.5 ? "none" : "auto", transition: "opacity 0.1s ease-out, transform 0.1s ease-out" }} className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-lg mx-auto relative z-0 origin-top">
          <div className="flex justify-center mb-4">
            <div className="bg-indigo-100 p-3 rounded-full">
              <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
            </div>
          </div>

          <h1 className="text-2xl font-black text-center mb-2 text-slate-800 tracking-tight">App Feedback & Support</h1>
          <p className="text-sm text-slate-500 text-center mb-6 font-medium">Help us improve Rigya! Report a bug, request a new feature, or get help directly from the development team.</p>

          {submitted && <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-center font-bold shadow-sm animate-in fade-in zoom-in-95">✅ Feedback successfully sent to the developers!</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-slate-600 mb-1 text-[11px] uppercase tracking-wider font-bold">Full Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none transition-all text-sm font-medium text-slate-800" placeholder="Enter your full name" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-600 mb-1 text-[11px] uppercase tracking-wider font-bold">Email Address</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none transition-all text-sm font-medium text-slate-800" placeholder="your@email.com" />
              </div>
              <div>
                <label className="block text-slate-600 mb-1 text-[11px] uppercase tracking-wider font-bold">Mobile Number</label>
                <input type="tel" name="mobile" value={formData.mobile} onChange={handleChange} required className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none transition-all text-sm font-medium text-slate-800" placeholder="e.g. 9876543210" />
              </div>
            </div>
            <div>
              <label className="block text-slate-600 mb-1 text-[11px] uppercase tracking-wider font-bold">What do you need help with?</label>
              <select name="feedbackType" value={formData.feedbackType} onChange={handleChange} className="w-full border border-indigo-200 bg-indigo-50/50 text-indigo-800 rounded-xl p-3 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none transition-all cursor-pointer text-sm font-bold shadow-sm">
                <option value="Bug Report">🐛 Report a Bug / Error</option>
                <option value="Feature Request">✨ Request a New Feature</option>
                <option value="Technical Issue">🛠️ Technical Issue / Won't Load</option>
                <option value="General Feedback">💡 General Feedback</option>
                <option value="Testimonial">⭐ Testimonial / Review</option>
              </select>
            </div>
            <div>
              <div className="flex justify-between items-end mb-1">
                <label className="block text-indigo-600 text-[11px] uppercase tracking-wider font-bold">Describe your issue or idea</label>
                <span className={`text-[10px] font-bold ${formData.message.length >= 200 ? 'text-rose-500' : 'text-slate-400'}`}>{formData.message.length}/200</span>
              </div>
              <textarea name="message" value={formData.message} onChange={handleChange} required maxLength={200} rows="4" className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none transition-all resize-none text-sm font-medium text-slate-800" placeholder="Please provide as much detail as possible so we can look into it..."></textarea>
            </div>
            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-xl font-black transition-all shadow-md hover:shadow-lg active:scale-[0.98] text-sm uppercase tracking-wider mt-2">Send to Developers</button>
          </form>
        </div>

        {/* ================= FEEDBACK DISPLAY SECTION ================= */}
        {feedbacks.length > 0 && (
          <div className="mt-24 relative z-10 w-full flex flex-col gap-6" style={{ transform: `translateY(${feedbackTranslateY}px)`, transition: "transform 0.1s ease-out" }}>
            {Object.entries(groupedFeedbacks).map(([categoryName, categoryFeedbacks]) => (
              <div key={categoryName} className="relative group w-full">
                
                <button onClick={() => scrollLeft(categoryName)} className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white shadow-lg border border-slate-100 text-slate-700 hover:text-indigo-600 rounded-full p-3 transition-all hover:scale-110 active:scale-95 sm:-ml-4 hidden sm:block opacity-0 group-hover:opacity-100" aria-label="Scroll left">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                </button>

                {/* 🟢 THE FIX: Added drag event listeners, cursor-grab, and scrollbar hiding classes */}
                <div 
                  ref={(el) => (carouselRefs.current[categoryName] = el)} 
                  onMouseDown={(e) => handleMouseDown(e, categoryName)}
                  onMouseLeave={() => handleMouseLeaveOrUp(categoryName)}
                  onMouseUp={() => handleMouseLeaveOrUp(categoryName)}
                  onMouseMove={(e) => handleMouseMove(e, categoryName)}
                  className="flex overflow-x-auto gap-5 pb-4 px-2 snap-x snap-mandatory cursor-grab [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']" 
                >
                  {categoryFeedbacks.map((fb) => (
                    <div key={fb.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 transition-shadow min-w-[320px] w-[320px] sm:min-w-[380px] sm:w-[380px] flex-shrink-0 snap-start flex flex-col select-none">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-bold text-slate-800 text-base">{fb.name}</h3>
                          <p className="text-xs text-slate-500 font-medium truncate w-[200px]">{fb.email}</p>
                        </div>
                        <span className={`px-2 py-1 text-[9px] uppercase tracking-wider font-black rounded-lg border whitespace-nowrap ${getBadgeColor(fb.feedbackType)}`}>{fb.feedbackType}</span>
                      </div>
                      
                      <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-sm text-slate-700 mb-3 leading-relaxed flex-grow break-words whitespace-pre-wrap">
                        {fb.message}
                      </div>
                      
                      <div className="flex justify-between items-center mt-auto border-t border-slate-100 pt-3">
                        <div className="flex gap-4">
                          <button onClick={() => handleUpvote(fb.id)} className="flex items-center gap-1.5 text-slate-400 hover:text-emerald-500 transition-colors group/vote" title="Upvote">
                            <svg className="w-4 h-4 group-hover/vote:-translate-y-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" /></svg>
                            <span className="text-xs font-bold">{fb.upvotes || 0}</span>
                          </button>
                          
                          <button onClick={() => handleDownvote(fb.id)} className="flex items-center gap-1.5 text-slate-400 hover:text-rose-500 transition-colors group/vote" title="Downvote">
                            <svg className="w-4 h-4 group-hover/vote:translate-y-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018c.163 0 .326.02.485.06L17 4m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" /></svg>
                            <span className="text-xs font-bold">{fb.downvotes || 0}</span>
                          </button>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider text-right">
                            {fb.date.split(',')[0]}
                          </div>
                          
                          {(
                            (authData?._id && fb.userId && authData._id === fb.userId) || 
                            (authData?.email && fb.email && authData.email.toLowerCase().trim() === fb.email.toLowerCase().trim())
                          ) && (
                            <button onClick={() => handleDelete(fb.id)} className="text-slate-300 hover:text-red-500 transition-colors" title="Delete your feedback">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          )}
                        </div>
                      </div>
                      
                    </div>
                  ))}
                </div>

                <button onClick={() => scrollRight(categoryName)} className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white shadow-lg border border-slate-100 text-slate-700 hover:text-indigo-600 rounded-full p-3 transition-all hover:scale-110 active:scale-95 sm:-mr-4 hidden sm:block opacity-0 group-hover:opacity-100" aria-label="Scroll right">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                </button>
                
              </div>
            ))}
          </div>
        )}
        
      </div>
    </div>
  );
}