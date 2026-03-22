// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/9.10.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.10.0/firebase-messaging-compat.js');

// Apne Firebase Config yahan paste karein
const firebaseConfig = {
  apiKey: "AIzaSyBNdRaNU4j1i_JPjiS2Zl1HFheMDiDsSxo",
  authDomain: "classifyai-c0b7b.firebaseapp.com",
  projectId: "classifyai-c0b7b",
  storageBucket: "classifyai-c0b7b.firebasestorage.app",
  messagingSenderId: "122412797185",
  appId: "1:122412797185:web:38381b1d4e762296815f00",
  measurementId: "G-HVVELRT9TY"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Background mein notification handle karne ke liye
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Background message received: ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/only-logo.png', // ClassifyAI ka icon path
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});