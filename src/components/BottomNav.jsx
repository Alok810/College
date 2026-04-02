import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Plus, MessageCircle, Bell } from 'lucide-react';

const BottomNav = ({ activeModal, setActiveModal }) => {
  const location = useLocation();

  return (
    // ✅ Upgraded to purple-100 and teal-100, removed the white center, and increased the glass blur!
    <div className="md:hidden fixed bottom-0 left-0 w-full bg-gradient-to-r from-purple-100/95 to-teal-100/95 backdrop-blur-xl border-t border-purple-200/60 z-[100] shadow-[0_-8px_25px_rgba(0,0,0,0.08)] pb-safe">
      <div className="flex justify-between items-center h-16 px-6 relative">
        
        {/* Home Button */}
        <Link to="/" onClick={() => setActiveModal(null)} className={`p-2 transition-colors ${!activeModal && location.pathname === '/' ? 'text-purple-700' : 'text-gray-500 hover:text-purple-600'}`}>
          <Home className={`w-6 h-6 ${!activeModal && location.pathname === '/' ? 'fill-current' : ''}`} />
        </Link>
        
        {/* Search Button */}
        <button onClick={() => setActiveModal('search')} className={`p-2 transition-colors ${activeModal === 'search' ? 'text-purple-700' : 'text-gray-500 hover:text-purple-600'}`}>
          <Search className="w-6 h-6" />
        </button>

        {/* FLOATING ADD POST BUTTON */}
        <div className="relative -top-5">
          <button 
            onClick={() => setActiveModal('post')}
            className="flex items-center justify-center w-14 h-14 bg-gradient-to-tr from-purple-600 to-teal-500 rounded-full text-white shadow-[0_8px_20px_rgba(124,58,237,0.4)] hover:scale-105 active:scale-95 transition-all border-2 border-white/20"
          >
            <Plus className={`w-8 h-8 transition-transform duration-300 ${activeModal === 'post' ? 'rotate-45' : ''}`} />
          </button>
        </div>

        {/* Messages Button */}
        <button onClick={() => setActiveModal('messages')} className={`p-2 transition-colors ${activeModal === 'messages' ? 'text-purple-700' : 'text-gray-500 hover:text-purple-600'}`}>
          <MessageCircle className={`w-6 h-6 ${activeModal === 'messages' ? 'fill-current' : ''}`} />
        </button>

        {/* Notifications Button */}
        <button onClick={() => setActiveModal('notifications')} className={`p-2 transition-colors ${activeModal === 'notifications' ? 'text-purple-700' : 'text-gray-500 hover:text-purple-600'}`}>
          <Bell className={`w-6 h-6 ${activeModal === 'notifications' ? 'fill-current' : ''}`} />
        </button>

      </div>
    </div>
  );
};

export default BottomNav;