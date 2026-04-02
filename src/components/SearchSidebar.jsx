import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, ChevronUp, X, Loader2 } from 'lucide-react';
import { searchInstituteUsers } from '../api'; 
import { motion } from 'framer-motion';

const SearchSidebar = ({ onClose }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (isMobile) setIsExpanded(true);
  }, [isMobile]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm.trim() !== '') {
        setIsSearching(true);
        try {
          const data = await searchInstituteUsers(searchTerm);
          setResults(data.users || []);
        } catch (error) {
          console.error("Search failed:", error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setResults([]);
      }
    }, 500); 
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
    if (isExpanded) {
      setSearchTerm('');
      setResults([]);
    }
  };

  // ==========================================
  // 💻 DESKTOP VIEW
  // ==========================================
  if (!isMobile) {
    return (
      <div className={`fixed top-[5.5rem] right-0 mr-4 bg-white shadow-2xl flex flex-col z-50 rounded-xl overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'w-80 h-[400px]' : 'w-[320px] h-16'}`}>
        <div className={`flex justify-between items-center cursor-pointer ${isExpanded ? 'p-3 border-b border-gray-100' : 'px-4 h-full'}`} onClick={toggleSidebar}>
          {isExpanded ? (
            <div className="flex justify-between items-center w-full">
              <h3 className="font-bold text-xl text-gray-800">Search</h3>
              <button className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 text-gray-700 transition-colors">
                <ChevronUp size={18} />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between w-full relative">
              <Search size={24} className="text-indigo-500" />
              <span className="font-semibold text-lg ml-3 mr-auto text-gray-700">Search</span>
            </div>
          )}
        </div>

        {isExpanded && (
          <div className="flex-grow flex flex-col pt-2 px-3 pb-3 overflow-hidden">
            <div className="relative w-full mb-3">
              <input
                type="text"
                placeholder="Search for users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className="w-full pl-10 pr-8 py-2 rounded-full bg-gray-100 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:bg-white"
              />
              <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              {searchTerm && (
                <button onClick={(e) => { e.stopPropagation(); setSearchTerm(''); setResults([]); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800">
                  <X size={16} />
                </button>
              )}
            </div>

            <div className="flex-grow overflow-y-auto no-scrollbar relative">
              {isSearching && (
                <div className="flex justify-center mt-4">
                  <Loader2 size={24} className="animate-spin text-purple-500" />
                </div>
              )}
              {!isSearching && searchTerm && results.length === 0 && (
                <p className="text-center text-gray-500 pt-4">No users found.</p>
              )}
              {!isSearching && results.map((user) => {
                const avatar = user.profilePicture || `https://ui-avatars.com/api/?name=${user.name || user.full_name || 'User'}&background=EBF4FF&color=4F46E5`;
                return (
                  <Link
                    to={`/profile/${user._id}`} key={user._id}
                    // ✅ Updated Desktop Match!
                    className='flex items-center gap-3 p-2.5 mb-2 rounded-xl cursor-pointer transition-all duration-300 bg-gradient-to-r from-purple-50/80 to-teal-50/80 hover:from-purple-100 hover:to-teal-100 shadow-sm'
                    onClick={() => setIsExpanded(false)} 
                  >
                    <img src={avatar} alt={user.name} className='w-11 h-11 rounded-full object-cover shadow-sm bg-white' />
                    <div className='flex-grow overflow-hidden'>
                      <p className="font-semibold text-[15px] truncate text-gray-800 leading-tight">{user.name || user.full_name}</p>
                      {user.username && <p className="text-[13px] text-gray-500 mt-0.5">@{user.username}</p>}
                    </div>
                  </Link>
                );
              })}
              <style>{`
                .no-scrollbar::-webkit-scrollbar { width: 4px; }
                .no-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .no-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 2px; }
                .no-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
              `}</style>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // 📱 MOBILE VIEW
  // ==========================================
  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90]" onClick={onClose} />
      <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="fixed bottom-0 left-0 w-full h-[85vh] bg-white z-[100] rounded-t-3xl shadow-2xl flex flex-col overflow-hidden">
        <div className="w-full flex justify-center pt-3 pb-2 cursor-pointer" onClick={onClose}>
          <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
        </div>

        <div className="px-5 pb-3 pt-2">
          <h3 className="font-bold text-gray-800 text-2xl mb-4">Search Users</h3>
          <div className="relative w-full">
            <input
              type="text" placeholder="Search for names or usernames..."
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-8 py-2 rounded-full bg-gray-100 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:bg-white"
              autoFocus
            />
            <Search size={22} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            {searchTerm && (
              <button onClick={() => { setSearchTerm(''); setResults([]); }} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-800 bg-gray-200 rounded-full p-1">
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        <div className="flex-grow overflow-y-auto px-4 pb-8 custom-scrollbar space-y-2 mt-1">
          {isSearching && (
            <div className="flex justify-center mt-8"><Loader2 size={32} className="animate-spin text-purple-500" /></div>
          )}

          {!isSearching && searchTerm && results.length === 0 && (
            <div className="text-center text-gray-400 mt-10">
              <Search size={48} className="mx-auto mb-3 opacity-20" />
              <p className="text-lg">No users found.</p>
            </div>
          )}

          {!isSearching && results.map((user) => {
            const avatar = user.profilePicture || `https://ui-avatars.com/api/?name=${user.name || user.full_name || 'User'}&background=EBF4FF&color=4F46E5`;
            return (
              <Link
                to={`/profile/${user._id}`} key={user._id}
                className="flex items-center gap-4 p-3 rounded-2xl cursor-pointer transition-all duration-300 shadow-sm border border-purple-50 bg-gradient-to-r from-purple-50/80 to-teal-50/80 hover:from-purple-100 hover:to-teal-100"
                onClick={() => { setIsExpanded(false); if (onClose) onClose(); }} 
              >
                <img src={avatar} alt={user.name} className='w-14 h-14 rounded-full object-cover shadow-sm bg-white' />
                <div className='flex-grow overflow-hidden'>
                  <p className="font-bold text-lg text-gray-800">{user.name || user.full_name}</p>
                  {user.username && <p className="text-sm text-gray-600 font-medium">@{user.username}</p>}
                </div>
              </Link>
            );
          })}
        </div>
      </motion.div>
    </>
  );
};

export default SearchSidebar;