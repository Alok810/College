import React, { createContext, useState, useContext } from 'react';
import { dummyRecentMessagesData, initialChatHistory } from '../assets/data';

// 1. Create the context
const ChatContext = createContext();

// 2. Create the Provider
export const ChatProvider = ({ children }) => {
    // These two states are MOVED from Message.jsx
    const [messages, setMessages] = useState(dummyRecentMessagesData);
    const [chatHistory, setChatHistory] = useState(initialChatHistory);

    // This function is MOVED from Message.jsx
    const updateChatHistory = (userId, newMessage, userDetails) => {
        // Update the full chat history
        setChatHistory(prevHistory => ({
            ...prevHistory,
            [userId]: [...(prevHistory[userId] || []), newMessage],
        }));

        // Update the sidebar message list
        setMessages(prevMessages => {
            const otherMessages = prevMessages.filter(m => m.from_user_id._id !== userId);
            
            const updatedMessage = {
                _id: `m-${Date.now()}`,
                from_user_id: userDetails,
                text: newMessage.text,
                createdAt: newMessage.timestamp,
                seen: true, 
            };
            // Place the updated conversation at the top
            return [updatedMessage, ...otherMessages];
        });
    };

    // 3. Provide all state and functions to any component
    const value = {
        messages,
        setMessages, // We need this for adding new users
        chatHistory,
        setChatHistory,
        updateChatHistory 
    };

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    );
};

// 4. Create the custom hook
export const useChat = () => {
    return useContext(ChatContext);
};