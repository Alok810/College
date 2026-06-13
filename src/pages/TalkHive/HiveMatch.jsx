import React, { useState, useEffect } from "react";
import { useHiveMatch } from "../../hooks/useHiveMatch";
import { useAuth } from "../../context/AuthContext";

import HiveHeader from "../../components/HiveMatch/HiveHeader";
import HiveLanding from "../../components/HiveMatch/HiveLanding";
import HiveVideoGrid from "../../components/HiveMatch/HiveVideoGrid";
import HiveThemeCard from "../../components/HiveMatch/HiveThemeCard";
import HiveChatBox from "../../components/HiveMatch/HiveChatBox";

const TOPIC_CATEGORIES = [
    "Cybersecurity", "Web Development",
    "Chess Strategies", "Anime Debates",
    "Creative Writing", "Current Affairs",
    "Startups & Business"
];

export default function HiveMatch() {
    const { authData } = useAuth();
    const [chatInput, setChatInput] = useState("");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false); 
    
    const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
    const [mobileTab, setMobileTab] = useState("chat"); 

    const hive = useHiveMatch({
        name: authData?.name || "Rigya Student",
        id: authData?._id || "unknown"
    });

    const handleSend = (e) => {
        e.preventDefault();
        hive.sendMessage(chatInput);
        setChatInput("");
    };

    const allDisplayedTopics = Array.from(new Set([...hive.myTopics, ...(hive.partnerTopics || [])]));

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024 && window.innerHeight < 550) setIsKeyboardOpen(true);
            else if (window.innerHeight >= 550) setIsKeyboardOpen(false);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        // 🟢 OUTER EDGE FIX: Removed `-mx-4` entirely on mobile! Since App.jsx is px-0, we don't need a negative margin. We only keep `md:-mx-6` to counteract the desktop padding.
        <div className={`relative flex flex-col font-sans overflow-hidden transition-colors duration-500 w-full
        ${hive.status !== "idle" 
            ? `bg-[#ebf8ff] md:-mx-6 -mt-0 h-[100dvh] lg:h-[100vh] max-lg:pt-[max(env(safe-area-inset-top,12px),12px)] ${isKeyboardOpen ? 'max-lg:pb-0' : 'max-lg:pb-[max(env(safe-area-inset-bottom,20px),20px)]'}` 
            : "min-h-full w-full bg-[#ebf8ff]"}`}>

            {hive.status !== "idle" ? (
                <div className="flex-1 flex flex-col min-h-0 w-full">
                    
                    <HiveHeader />

                    {/* 🟢 INNER EDGE FIX: Replaced `px-2` with `px-3 sm:px-4 lg:px-6`. This pushes all the white cards safely away from the phone's physical screen edges! */}
                    <div className={`flex-1 flex flex-col lg:flex-row px-3 sm:px-4 lg:px-6 pt-3 lg:pt-4 gap-3 lg:gap-4 overflow-hidden min-h-0 w-full max-w-[1600px] mx-auto ${isKeyboardOpen ? 'pb-0' : 'pb-3 lg:pb-4'}`}>
                        
                        <HiveVideoGrid hive={hive} isKeyboardOpen={isKeyboardOpen} />
                        
                        {/* Mobile Tab Switcher */}
                        <div className="flex lg:hidden bg-indigo-100/50 p-1.5 rounded-xl shrink-0 shadow-sm mx-0">
                            <button onClick={() => setMobileTab('chat')} className={`flex-1 py-2.5 text-xs font-black rounded-lg transition-all ${mobileTab === 'chat' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-indigo-400'}`}>Live Chat</button>
                            <button onClick={() => setMobileTab('theme')} className={`flex-1 py-2.5 text-xs font-black rounded-lg transition-all ${mobileTab === 'theme' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-indigo-400'}`}>AI Theme</button>
                        </div>
                        
                        <HiveThemeCard 
                            hive={hive} 
                            topicCategories={TOPIC_CATEGORIES} 
                            allDisplayedTopics={allDisplayedTopics} 
                            isDropdownOpen={isDropdownOpen} 
                            setIsDropdownOpen={setIsDropdownOpen}
                            mobileTab={mobileTab} 
                        />
                        
                        <HiveChatBox 
                            hive={hive} 
                            chatInput={chatInput} 
                            setChatInput={setChatInput} 
                            handleSend={handleSend} 
                            setIsKeyboardOpen={setIsKeyboardOpen}
                            isKeyboardOpen={isKeyboardOpen}
                            mobileTab={mobileTab}
                        />
                    </div>
                </div>
            ) : (
                <HiveLanding hive={hive} topicCategories={TOPIC_CATEGORIES} />
            )}
        </div>
    );
}