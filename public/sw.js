// Listen for the 'push' event from the backend
self.addEventListener('push', function(event) {
    const data = event.data ? event.data.json() : {};

    const options = {
        body: data.body || "You have a new notification.",
        icon: data.icon || '/favicon.ico', // Update this to your actual logo path in the public folder
        badge: '/favicon.ico', // Small monochromatic icon for Android status bar
        vibrate: [200, 100, 200], // Vibration pattern for mobile
        data: {
            url: data.url || '/' // Save the URL so we know where to go when clicked
        }
    };

    event.waitUntil(
        self.registration.showNotification(data.title || "Rigya Alert", options)
    );
});

// Listen for the user clicking the notification
self.addEventListener('notificationclick', function(event) {
    event.notification.close(); // Close the pop-up

    // Open the window/tab to the URL we sent in the payload
    event.waitUntil(
        clients.openWindow(event.notification.data.url)
    );
});