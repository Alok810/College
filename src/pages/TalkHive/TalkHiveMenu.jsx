import React from "react";
import { useNavigate } from "react-router-dom";
import { Users, Zap, Mic2, Presentation, Lock, Sparkles } from "lucide-react";

export default function TalkHive() {
  const navigate = useNavigate();

  const modes = [
    {
      id: "focus-pod",
      title: "The Focus Pod",
      desc: "1-on-1 Video Mentorship & Study Rooms",
      icon: <Users size={28} className="text-purple-600 transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-1" />,
      cardBg: "bg-white hover:bg-purple-50/30",
      cardBorder: "border-purple-100 hover:border-purple-300",
      cardShadow: "hover:shadow-[0_10px_40px_rgba(147,51,234,0.12)]",
      iconBg: "bg-purple-50 border-purple-100",
      active: true,
      path: "/TalkHive/focus-pod"
    },
    {
      id: "hive-match",
      title: "Hive Match",
      desc: "5-Minute Speed Networking & Mock Interviews",
      icon: <Zap size={28} className="text-amber-600 transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-1" />,
      cardBg: "bg-white hover:bg-amber-50/30",
      cardBorder: "border-amber-100 hover:border-amber-300",
      cardShadow: "hover:shadow-[0_10px_40px_rgba(217,119,6,0.12)]",
      iconBg: "bg-amber-50 border-amber-100",
      active: true, 
      path: "/TalkHive/hive-match"
    },
    {
      id: "buzz-room",
      title: "The Buzz Room",
      desc: "Drop-in Audio Chatrooms for group discussions",
      icon: <Mic2 size={28} className="text-blue-500 transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-1" />,
      cardBg: "bg-white hover:bg-blue-50/30",
      cardBorder: "border-blue-100 hover:border-blue-300",
      cardShadow: "hover:shadow-[0_10px_40px_rgba(59,130,246,0.12)]",
      iconBg: "bg-blue-50 border-blue-100",
      active: false,
      path: "/TalkHive/buzz-room"
    },
    {
      id: "assembly",
      title: "The Assembly",
      desc: "Host Seminars and Presentations (1-to-Many)",
      icon: <Presentation size={28} className="text-emerald-600 transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-1" />,
      cardBg: "bg-white hover:bg-emerald-50/30",
      cardBorder: "border-emerald-100 hover:border-emerald-300",
      cardShadow: "hover:shadow-[0_10px_40px_rgba(16,185,129,0.12)]",
      iconBg: "bg-emerald-50 border-emerald-100",
      active: false,
      path: "/TalkHive/assembly"
    }
  ];

  return (
    // 🟢 THE FIX: Removed pt-[...] and replaced it with pt-0. 
    // App.jsx is already pushing this container down to clear the InstituteHeader!
    <div className="relative w-full max-w-[100vw] flex flex-col items-center overflow-x-hidden px-4 sm:px-6 md:px-10 pt-0 pb-6">
      
      {/* 🟢 Premium Header (Removed the mt-8 margin to pull it up!) */}
      <div className="text-center mb-6 md:mb-10 max-w-2xl mt-0 sm:mt-2 animate-in fade-in slide-in-from-bottom-4 duration-500 px-2">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-black uppercase tracking-widest mb-3 sm:mb-4">
          <Sparkles size={14} /> The Rigya Network
        </div>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-gray-900 via-purple-800 to-indigo-600 mb-3 tracking-tight leading-tight">
          Welcome to TalkHive
        </h1>
        <p className="text-gray-500 font-medium text-sm sm:text-base px-2 sm:px-4">
          Connect, collaborate, and grow with your peers in real-time. Choose your preferred mode of interaction below.
        </p>
      </div>

      {/* 🟢 Interactive Mode Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 w-full max-w-5xl animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100 px-1">
        {modes.map((mode) => (
          <button
            key={mode.id}
            onClick={() => mode.active && navigate(mode.path)}
            disabled={!mode.active}
            className={`group relative flex flex-col items-start p-6 sm:p-8 rounded-[2rem] border transition-all duration-500 text-left overflow-hidden w-full ${
              mode.active 
                ? `${mode.cardBg} ${mode.cardBorder} ${mode.cardShadow} cursor-pointer hover:-translate-y-1.5 active:scale-[0.98]` 
                : "bg-gray-50/50 border-gray-200 opacity-80 cursor-not-allowed"
            }`}
          >
            {/* Background Glow Effect on Hover */}
            {mode.active && (
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-white/0 to-white/50 pointer-events-none" />
            )}

            {/* Icon Block */}
            <div className={`p-4 rounded-2xl shadow-sm border mb-4 sm:mb-5 relative z-10 transition-colors duration-300 ${
              mode.active ? mode.iconBg : "bg-gray-100 border-gray-200"
            }`}>
              {mode.active ? mode.icon : React.cloneElement(mode.icon, { className: "text-gray-400" })}
            </div>

            {/* Text Content */}
            <div className="relative z-10 w-full pr-12 sm:pr-0">
              <h2 className={`text-xl sm:text-2xl font-black mb-1.5 sm:mb-2 transition-colors duration-300 ${mode.active ? 'text-gray-800' : 'text-gray-500'}`}>
                {mode.title}
              </h2>
              <p className={`text-[13px] sm:text-sm font-semibold leading-relaxed transition-colors duration-300 ${mode.active ? 'text-gray-500' : 'text-gray-400'}`}>
                {mode.desc}
              </p>
            </div>

            {/* Glassy "Coming Soon" Badge */}
            {!mode.active && (
              <div className="absolute top-4 right-4 sm:top-6 sm:right-6 bg-white/80 backdrop-blur-md border border-gray-200 text-gray-500 px-3 py-1.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                <Lock size={12} className="stroke-[2.5px]" /> <span className="hidden sm:block">Locked</span>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}