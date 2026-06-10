import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Plus, MessageCircle, Bell, User } from 'lucide-react';

const BottomNav = ({ activeModal, setActiveModal }) => {
  const location = useLocation();

  return (
    <div className="md:hidden fixed bottom-0 left-0 w-full bg-gradient-to-r from-purple-100/95 to-teal-100/95 backdrop-blur-xl border-t border-purple-200/60 z-[100] shadow-[0_-8px_25px_rgba(0,0,0,0.08)] pb-safe">
      <div className="flex justify-between items-center h-16 px-3 relative">
        
        {/* Home Button */}
        <Link to="/" onClick={() => setActiveModal(null)} className={`p-2 transition-colors ${!activeModal && location.pathname === '/' ? 'text-purple-700' : 'text-gray-500 hover:text-purple-600'}`}>
          <Home className={`w-6 h-6 ${!activeModal && location.pathname === '/' ? 'fill-current' : ''}`} />
        </Link>
        
        {/* Search Button */}
        <button onClick={() => setActiveModal('search')} className={`p-2 transition-colors ${activeModal === 'search' ? 'text-purple-700' : 'text-gray-500 hover:text-purple-600'}`}>
          <Search className="w-6 h-6" />
        </button>

        {/* 🟢 FIXED: Add Post Button (Now matches the inline standard button format) */}
        <button 
          onClick={() => setActiveModal('post')} 
          className={`p-2 transition-colors ${activeModal === 'post' ? 'text-purple-700' : 'text-gray-500 hover:text-purple-600'}`}
        >
          <Plus className="w-6 h-6" />
        </button>

        {/* Messages Button */}
        <button onClick={() => setActiveModal('messages')} className={`p-2 transition-colors ${activeModal === 'messages' ? 'text-purple-700' : 'text-gray-500 hover:text-purple-600'}`}>
          <MessageCircle className={`w-6 h-6 ${activeModal === 'messages' ? 'fill-current' : ''}`} />
        </button>

        {/* Notifications Button */}
        <button onClick={() => setActiveModal('notifications')} className={`p-2 transition-colors ${activeModal === 'notifications' ? 'text-purple-700' : 'text-gray-500 hover:text-purple-600'}`}>
          <Bell className={`w-6 h-6 ${activeModal === 'notifications' ? 'fill-current' : ''}`} />
        </button>

        {/* Profile Button */}
        <Link 
          to="/profile" 
          onClick={() => setActiveModal(null)} 
          className={`p-2 transition-colors ${!activeModal && location.pathname.startsWith('/profile') ? 'text-purple-700' : 'text-gray-500 hover:text-purple-600'}`}
        >
          <User className={`w-6 h-6 ${!activeModal && location.pathname.startsWith('/profile') ? 'fill-current' : ''}`} />
        </Link>

      </div>
    </div>
  );
};

export default BottomNav;