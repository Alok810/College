import React, { useEffect, useState } from 'react';
import { getActiveAnnouncements } from '../api';
import { AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useLocation } from 'react-router-dom'; // ✅ IMPORT THIS

const AnnouncementBanner = () => {
    const [announcements, setAnnouncements] = useState([]);
    const location = useLocation(); // ✅ ADD THIS to track page changes
    
    const [dismissedIds, setDismissedIds] = useState(() => {
        const saved = sessionStorage.getItem('dismissedAnnouncements');
        return saved ? JSON.parse(saved) : [];
    });

    const fetchAnnouncements = async () => {
        try {
            const data = await getActiveAnnouncements();
            setAnnouncements(data.announcements || []);
        } catch (error) {
            console.error("Failed to fetch announcements", error);
        }
    };

    // ✅ UPDATE THE USE EFFECT: Now it checks whenever the user changes a page!
    useEffect(() => {
        fetchAnnouncements();
        
        // We can keep a slightly longer backup timer just in case they stay on one page for a long time
        const interval = setInterval(fetchAnnouncements, 120000); // 2 minutes
        return () => clearInterval(interval);
    }, [location.pathname]); // <--- Re-runs instantly when they click a new sidebar link

    const handleDismiss = (id) => {
        const newDismissed = [...dismissedIds, id];
        setDismissedIds(newDismissed);
        sessionStorage.setItem('dismissedAnnouncements', JSON.stringify(newDismissed));
    };

    const visibleAnnouncements = announcements.filter(a => !dismissedIds.includes(a._id));

    if (visibleAnnouncements.length === 0) return null;

    return (
        <div className="fixed top-0 left-0 w-full z-[200] flex flex-col pointer-events-none">
            {visibleAnnouncements.map((announcement) => {
                let bgColor = "bg-blue-600";
                let Icon = Info;
                if (announcement.type === 'warning') { bgColor = "bg-amber-500"; Icon = AlertTriangle; }
                if (announcement.type === 'danger') { bgColor = "bg-rose-600"; Icon = AlertCircle; }

                return (
                    <div key={announcement._id} className={`${bgColor} text-white px-4 py-2 flex items-center justify-center gap-3 shadow-md pointer-events-auto animate-in slide-in-from-top-full duration-500`}>
                        <Icon size={18} className="shrink-0 animate-pulse" />
                        <p className="text-sm font-bold text-center">{announcement.message}</p>
                        <button 
                            onClick={() => handleDismiss(announcement._id)}
                            className="absolute right-4 p-1 hover:bg-white/20 rounded-full transition-colors"
                        >
                            <X size={16} />
                        </button>
                    </div>
                );
            })}
        </div>
    );
};

export default AnnouncementBanner;