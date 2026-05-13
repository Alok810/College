import React from "react";
import { useNavigate } from "react-router-dom";
import { Users, Zap, Mic2, Presentation, Lock } from "lucide-react";

export default function TalkHive() {
  const navigate = useNavigate();

  const modes = [
    {
      id: "focus-pod",
      title: "The Focus Pod",
      desc: "1-on-1 Video Mentorship & Study Rooms",
      icon: <Users size={32} className="text-purple-600" />,
      bg: "bg-purple-50 hover:bg-purple-100 border-purple-200",
      active: true,
      path: "/TalkHive/focus-pod"
    },
    {
      id: "hive-match",
      title: "Hive Match",
      desc: "5-Minute Speed Networking & Mock Interviews",
      icon: <Zap size={32} className="text-amber-600" />,
      bg: "bg-amber-50 hover:bg-amber-100 border-amber-200",
      active: false, // Set to true when we build it!
      path: "/TalkHive/hive-match"
    },
    {
      id: "buzz-room",
      title: "The Buzz Room",
      desc: "Drop-in Audio Chatrooms for group discussions",
      icon: <Mic2 size={32} className="text-blue-600" />,
      bg: "bg-blue-50 hover:bg-blue-100 border-blue-200",
      active: false,
      path: "/TalkHive/buzz-room"
    },
    {
      id: "assembly",
      title: "The Assembly",
      desc: "Host Seminars and Presentations (1-to-Many)",
      icon: <Presentation size={32} className="text-emerald-600" />,
      bg: "bg-emerald-50 hover:bg-emerald-100 border-emerald-200",
      active: false,
      path: "/TalkHive/assembly"
    }
  ];

  return (
    <div className="p-6 md:p-10 h-full flex flex-col items-center custom-scrollbar overflow-y-auto">
      <div className="text-center mb-10 max-w-2xl">
        <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-teal-500 mb-4">
          Welcome to TalkHive
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
        {modes.map((mode) => (
          <button
            key={mode.id}
            onClick={() => mode.active && navigate(mode.path)}
            disabled={!mode.active}
            className={`relative flex flex-col items-start p-8 rounded-3xl border-2 transition-all duration-300 text-left ${
              mode.active 
                ? `${mode.bg} cursor-pointer hover:shadow-xl hover:-translate-y-1` 
                : "bg-gray-50 border-gray-200 opacity-70 cursor-not-allowed grayscale-[0.5]"
            }`}
          >
            <div className="bg-white p-4 rounded-2xl shadow-sm mb-4">
              {mode.icon}
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{mode.title}</h2>
            <p className="text-gray-500 font-medium">{mode.desc}</p>

            {!mode.active && (
              <div className="absolute top-6 right-6 bg-gray-200 text-gray-500 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                <Lock size={12} /> Coming Soon
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}