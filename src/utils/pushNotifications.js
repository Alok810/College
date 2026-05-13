// 🟢 IMPORT YOUR CONFIGURED API INSTANCE
import { api } from '../api'; 

// Helper function required by the Web Push API to convert the base64 key
const urlBase64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
};

export const subscribeToOSNotifications = async () => {
    // 1. Check if the browser supports Service Workers and Push Notifications
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        console.warn('Push notifications are not supported by this browser.');
        return false;
    }

    try {
        // 2. Register the service worker from the public folder
        const register = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered successfully.');

        // 3. Ask the user for OS-level permission
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
            console.warn('User denied push notification permission.');
            return false;
        }

        // 4. Create the subscription using your Public Key
        const publicVapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY; 
        
        const subscription = await register.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
        });

        // 5. Send this subscription object to our backend route!
        // 🟢 THE FIX: Use the 'api' instance! It handles the URL and credentials automatically.
        await api.post('/push/subscribe', subscription);

        console.log("✅ Successfully subscribed to OS notifications!");
        return true;

    } catch (error) {
        console.error("❌ Error setting up push notifications:", error);
        return false;
    }
};