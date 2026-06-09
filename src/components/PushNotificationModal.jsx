import React, { useState, useEffect } from 'react';
import { subscribeToOSNotifications } from '../utils/pushNotifications';
import { Bell, X, CheckCircle } from 'lucide-react';

const PushNotificationModal = ({ isOpen, onClose }) => {
    const [status, setStatus] = useState("idle"); // 'idle', 'loading', 'success', 'error'

    // 🟢 THE FIX: Reset the modal back to "idle" every time it opens!
    useEffect(() => {
        if (isOpen) {
            setStatus("idle");
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleEnable = async () => {
        setStatus("loading");
        const success = await subscribeToOSNotifications();

        if (success) {
            setStatus("success");
            // Automatically close the modal after 2 seconds on success
            setTimeout(() => {
                onClose();
            }, 2000);
        } else {
            setStatus("error");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative">

                {/* 🟢 THE FIX: Always show the Close button so you can never get stuck! */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="p-8 flex flex-col items-center text-center mt-2">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 transition-colors duration-300 ${status === "success" ? "bg-green-100 text-green-600" : "bg-purple-100 text-purple-600"
                        }`}>
                        {status === "success" ? <CheckCircle className="w-8 h-8" /> : <Bell className="w-8 h-8" />}
                    </div>

                    <h2 className="text-2xl font-black text-gray-900 mb-2">
                        {status === "success" ? "You're All Set!" : "Stay Updated"}
                    </h2>

                    <p className="text-gray-500 font-medium text-sm mb-8">
                        {status === "success"
                            ? "You will now receive important updates directly on your device."
                            : "Enable device alerts to get instantly notified when your exam results are published or library books are due."}
                    </p>

                    {status === "error" && (
                        <p className="text-sm text-red-500 font-bold mb-4 bg-red-50 py-2 px-4 rounded-lg">
                            Permission denied or blocked by browser settings.
                        </p>
                    )}

                    {status !== "success" && (
                        <div className="w-full space-y-3">
                            <button
                                onClick={handleEnable}
                                disabled={status === "loading"}
                                className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-teal-500 text-white rounded-xl font-bold hover:shadow-lg hover:scale-[1.02] transition-all flex items-center justify-center disabled:opacity-70 disabled:hover:scale-100"
                            >
                                {status === "loading" ? "Requesting Permission..." : "Allow Notifications"}
                            </button>

                            <button
                                onClick={onClose}
                                disabled={status === "loading"}
                                className="w-full py-3 px-4 bg-gray-50 text-gray-600 rounded-xl font-bold hover:bg-gray-100 transition-colors disabled:opacity-50"
                            >
                                Skip for now
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PushNotificationModal;