import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, ChevronUp, X, Loader2 } from 'lucide-react';
import { searchInstituteUsers } from '../api'; 

const SearchSidebar = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Real database states!
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // The "Debounce" Effect - Waits 500ms after user stops typing to call the API
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

    // Cleanup function clears the timer if the user keeps typing
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
    if (isExpanded) {
      setSearchTerm('');
      setResults([]);
    }
  };

  const EXPANDED_HEIGHT_CLASS = 'h-[400px]';
  const BASE_ROUNDING_CLASS = 'rounded-xl';

  const sidebarClasses = isExpanded
    ? `w-80 ${EXPANDED_HEIGHT_CLASS}`
    : "w-[320px] h-16";

  return (
    <div className={`fixed top-[5.5rem] right-0 mr-4 bg-white shadow-2xl flex flex-col z-50 ${BASE_ROUNDING_CLASS} ${sidebarClasses} overflow-hidden transition-all duration-300 ease-in-out`}>
      
      {/* Header */}
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

      {/* Expanded Content */}
      {isExpanded && (
        <div className="flex-grow flex flex-col pt-2 px-3 pb-3 overflow-hidden">
          
          {/* Input */}
          <div className="relative w-full mb-2">
            <input
              type="text"
              placeholder="Search for users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              className="w-full pl-10 pr-8 py-2 rounded-full bg-gray-100 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white"
            />
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            {searchTerm && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSearchTerm('');
                  setResults([]);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Results Area */}
          <div className="flex-grow overflow-y-auto no-scrollbar relative">
            
            {/* Loading Spinner */}
            {isSearching && (
              <div className="flex justify-center mt-4">
                <Loader2 size={24} className="animate-spin text-indigo-500" />
              </div>
            )}

            {/* Empty State */}
            {!isSearching && searchTerm && results.length === 0 && (
              <p className="text-center text-gray-500 pt-4">No users found.</p>
            )}

            {/* Results List */}
            {!isSearching && results.map((user) => {
              const avatar = user.profilePicture || `https://ui-avatars.com/api/?name=${user.name || user.full_name || 'User'}&background=EBF4FF&color=4F46E5`;

              return (
                <Link
                  to={`/profile/${user._id}`}
                  key={user._id}
                  className='flex items-center gap-3 p-2 hover:bg-indigo-50 rounded-lg cursor-pointer'
                  onClick={() => setIsExpanded(false)} 
                >
                  <img src={avatar} alt={user.name} className='w-10 h-10 rounded-full object-cover shadow-sm' />
                  <div className='flex-grow overflow-hidden'>
                    <p className="font-semibold truncate text-gray-700">
                      {user.name || user.full_name}
                    </p>
                    {user.username && (
                      <p className="text-sm text-gray-500">@{user.username}</p>
                    )}
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
};

export default SearchSidebar;