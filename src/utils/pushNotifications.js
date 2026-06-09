// 🟢 IMPORT YOUR CONFIGURED API INSTANCE
import { api } from '../api'; 
// 🟢 IMPORT CAPACITOR NATIVE PLUGINS
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { LocalNotifications } from '@capacitor/local-notifications';

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
    // ==================================================
    // 📱 NATIVE ANDROID / IOS LOGIC
    // ==================================================
    if (Capacitor.isNativePlatform()) {
        try {
            // 1. Ask the Android OS for permission
            let permStatus = await PushNotifications.checkPermissions();

            if (permStatus.receive === 'prompt') {
                permStatus = await PushNotifications.requestPermissions();
            }

            if (permStatus.receive !== 'granted') {
                console.warn('User denied native push notification permission');
                return false;
            }

            // 2. Register the device with Firebase FCM
            await PushNotifications.register();

            // 🟢 3. CREATE A HIGH-PRIORITY CHANNEL FOR ANDROID
            if (Capacitor.getPlatform() === 'android') {
                await PushNotifications.createChannel({
                    id: 'rigya_alerts',
                    name: 'Rigya Important Alerts',
                    description: 'Notifications for exams, messages, and friend requests',
                    importance: 5, // 5 = MAX importance (forces the drop-down banner)
                    visibility: 1, // 1 = Public (shows on lock screen)
                    vibration: true,
                });
            }

            // Clear old listeners to avoid duplicates
            await PushNotifications.removeAllListeners();

            // 4. Listen for the successful Firebase Token
            PushNotifications.addListener('registration', async (token) => {
                console.log('✅ Native Firebase Token Received:', token.value);
                
                // Send this token to backend with an 'isNative' flag!
                await api.post('/push/subscribe', { 
                    endpoint: token.value, 
                    isNative: true 
                });
            });

            PushNotifications.addListener('registrationError', (error) => {
                console.error('❌ Native Firebase Registration Error:', error);
            });

            // 🟢 5. FORCE THE FOREGROUND BANNER OVERRIDE
            PushNotifications.addListener('pushNotificationReceived', async (notification) => {
                console.log('📩 Push received in foreground:', notification);

                await LocalNotifications.schedule({
                    notifications: [
                        {
                            title: notification.title || "Rigya",
                            body: notification.body || "You have a new notification",
                            id: new Date().getTime(), // Unique ID so they don't overwrite
                            extra: notification.data, // Pass along the URL payload
                        }
                    ]
                });
            });

            // 🟢 6. HANDLE TAPS ON THE FOREGROUND BANNER
            LocalNotifications.addListener('localNotificationActionPerformed', (notificationAction) => {
                const data = notificationAction.notification.extra;
                if (data && data.url) {
                    window.location.href = data.url; 
                }
            });

            console.log("✅ Successfully requested native push permissions!");
            return true;

        } catch (error) {
            console.error("❌ Native push setup crashed:", error);
            return false;
        }
    } 
    // ==================================================
    // 💻 STANDARD WEB BROWSER LOGIC
    // ==================================================
    else {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
            console.warn('Push notifications are not supported by this browser.');
            return false;
        }

        try {
            const register = await navigator.serviceWorker.register('/sw.js');
            console.log('Service Worker registered successfully.');

            const permission = await Notification.requestPermission();
            if (permission !== 'granted') {
                console.warn('User denied push notification permission.');
                return false;
            }

            const publicVapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY; 
            
            const subscription = await register.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
            });

            // Send subscription object to backend route
            await api.post('/push/subscribe', subscription);

            console.log("✅ Successfully subscribed to Web OS notifications!");
            return true;

        } catch (error) {
            console.error("❌ Error setting up web push notifications:", error);
            return false;
        }
    }
};