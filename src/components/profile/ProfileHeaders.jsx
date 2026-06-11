import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Image as ImageIcon, Users as FriendsIcon, BarChart3, FileText, Monitor, Printer, Edit } from 'lucide-react';

// 🟢 Added 'setShowEdit' to the props
export const DesktopProfileHeader = ({ activeTab, handleTabChange, isCurrentUser, resumeViewMode, setResumeViewMode, setShowEdit }) => {
  const navigate = useNavigate();

  const navItems = [
    { name: "Post", icon: Star, tab: "posts" },
    { name: "Media", icon: ImageIcon, tab: "media" },
    { name: "Friend", icon: FriendsIcon, tab: "friends" },
    { name: "Result", icon: BarChart3, tab: "results" },
    { name: "Resume", icon: FileText, tab: "resume" },
  ];

  return (
    <div className="sticky top-[0.5rem] z-40 bg-white/95 backdrop-blur-md shadow-md p-1.5 rounded-xl hidden lg:block w-full border border-gray-50 flex-shrink-0">
      <div className="flex justify-between items-center h-full px-2">
        <div className="flex space-x-1">
          {navItems.map((item) => {
            if (item.tab === "resume") {
              return (
                <div key={item.name} className="relative group">
                  <button
                    onClick={() => handleTabChange(item.tab)}
                    className={`px-4 py-2 text-sm font-bold rounded-lg flex items-center gap-1.5 transition-colors ${activeTab === item.tab ? "bg-gradient-to-r from-purple-600 to-teal-500 text-white shadow-sm" : "text-gray-500 hover:bg-gray-100"}`}
                  >
                    <item.icon className="w-4 h-4" /> {item.name}
                  </button>

                  <div className="absolute left-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 w-48 origin-top-left">
                    <div className="bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden flex flex-col py-1">
                      <button
                        onClick={() => { handleTabChange("resume"); setResumeViewMode("web"); }}
                        className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold transition-colors w-full text-left ${resumeViewMode === "web" && activeTab === "resume" ? "text-purple-700 bg-purple-50" : "text-gray-700 hover:bg-gray-50"}`}
                      >
                        <Monitor className="w-4 h-4" /> Web View
                      </button>
                      <button
                        onClick={() => { handleTabChange("resume"); setResumeViewMode("a4"); }}
                        className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold transition-colors w-full text-left ${resumeViewMode === "a4" && activeTab === "resume" ? "text-teal-700 bg-teal-50" : "text-gray-700 hover:bg-gray-50"}`}
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
              );
            }

            return (
              <button
                key={item.name}
                onClick={() => handleTabChange(item.tab)}
                className={`px-4 py-2 text-sm font-bold rounded-lg flex items-center gap-1.5 transition-colors ${activeTab === item.tab ? "bg-gradient-to-r from-purple-600 to-teal-500 text-white shadow-sm" : "text-gray-500 hover:bg-gray-100"}`}
              >
                <item.icon className="w-4 h-4" /> {item.name}
              </button>
            );
          })}
        </div>

        {/* 🟢 ADDED: Edit Profile button on the right side for Desktop */}
        {isCurrentUser && (
          <button
            onClick={() => setShowEdit?.(true)}
            className="px-4 py-2 text-sm font-bold rounded-lg flex items-center gap-1.5 transition-colors bg-gradient-to-r from-purple-600 to-teal-500 text-white shadow-sm hover:opacity-90 ml-2"
          >
            <Edit className="w-4 h-4" /> Edit Profile
          </button>
        )}

      </div>
    </div>
  );
};

// 🟢 Added 'isCurrentUser' and 'setShowEdit' to the props
export const MobileTabBar = ({ activeTab, handleTabChange, isCurrentUser, setShowEdit }) => {
  const navItems = [
    { name: "Posts", icon: Star, tab: "posts" },
    { name: "Media", icon: ImageIcon, tab: "media" },
    { name: "Friends", icon: FriendsIcon, tab: "friends" },
    { name: "Results", icon: BarChart3, tab: "results" }, 
    { name: "Resume", icon: FileText, tab: "resume" },
  ];
  
  return (
    <div className="lg:hidden fixed bottom-[4rem] left-0 right-0 z-40 w-full pointer-events-none">
      <div className="bg-white/95 backdrop-blur-xl border-t border-gray-200 shadow-[0_-4px_15px_-3px_rgba(0,0,0,0.05)] rounded-t-3xl px-4 py-2.5 flex justify-between items-center pointer-events-auto overflow-x-auto custom-scrollbar">
        <div className="flex space-x-2 sm:space-x-4 flex-1 justify-center items-center min-w-max">
          
          {/* Navigation Tabs */}
          {navItems.map((item) => (
            <button
              key={item.name}
              onClick={() => handleTabChange(item.tab)}
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 flex-shrink-0 ${
                activeTab === item.tab
                  ? "bg-gradient-to-r from-purple-600 to-teal-500 text-white shadow-md transform scale-110"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              <item.icon className={`w-5 h-5 ${activeTab === item.tab ? "fill-current" : ""}`} />
            </button>
          ))}

          {/* 🟢 ADDED: Edit Profile Icon integrated directly into the scrolling tab bar */}
          {isCurrentUser && (
            <>
              {/* Subtle divider to separate tabs from actions */}
              <div className="w-px h-6 bg-gray-200 mx-1 flex-shrink-0"></div>
              
              <button
                onClick={() => setShowEdit?.(true)}
                className="w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 flex-shrink-0 text-gray-600 bg-gray-50 border border-gray-200 shadow-sm hover:bg-gray-100 active:scale-95"
                aria-label="Edit Profile"
              >
                <Edit className="w-5 h-5" />
              </button>
            </>
          )}

        </div>
      </div>
    </div>
  );
};