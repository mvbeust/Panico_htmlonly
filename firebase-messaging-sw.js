// Give the service worker access to Firebase Messaging.
importScripts('https://www.gstatic.com/firebasejs/3.5.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/3.5.0/firebase-messaging.js');

// Initialize the Firebase app in the service worker by passing in the messagingSenderId.
firebase.initializeApp({
    'messagingSenderId': '76547521231'
});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();

messaging.setBackgroundMessageHandler(function(payload) {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    // Customize notification here
    const notificationTitle = 'Tipps nicht vergessen';
    const notificationOptions = {
        body: 'Bitte nicht vergessen so schnell wie möglich zu tippen.',
        icon: '/img/logo128.png'
    };

    return self.registration.showNotification(notificationTitle,
        notificationOptions);
});
