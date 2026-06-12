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
        // 🟢 THE RIGHT-GAP FIX: Completely removed w-full and max-w-[100vw].
        // Now, -mx-4 md:-mx-6 will naturally pull the container perfectly to both the left AND right edges!
        <div className={`relative flex flex-col font-sans overflow-hidden transition-colors duration-500
        ${hive.status !== "idle" 
            ? `bg-[#ebf8ff] -mx-4 md:-mx-6 -mt-0 h-[100dvh] lg:h-[100vh] max-lg:pt-[max(env(safe-area-inset-top,12px),12px)] ${isKeyboardOpen ? 'max-lg:pb-2' : 'max-lg:pb-[max(env(safe-area-inset-bottom,20px),20px)]'}` 
            : "min-h-full w-full bg-[#ebf8ff]"}`}>

            {hive.status !== "idle" ? (
                <div className="flex-1 flex flex-col min-h-0">
                    
                    <HiveHeader />

                    {/* 🟢 Removed max-w-[1600px] and mx-auto so the 3 columns expand fully */}
                    <div className="flex-1 flex flex-col lg:flex-row p-2 lg:p-4 gap-2 lg:gap-4 overflow-hidden min-h-0">
                        <HiveVideoGrid hive={hive} isKeyboardOpen={isKeyboardOpen} />
                        
                        {/* Mobile Tab Switcher */}
                        <div className="flex lg:hidden bg-indigo-100/50 p-1.5 rounded-xl shrink-0 mx-0.5 shadow-sm">
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