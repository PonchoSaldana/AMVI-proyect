importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyA-n7EIruJSrDTfVcSx_4w-_vQ6mFam-zg",
  authDomain: "mia-610eb.firebaseapp.com",
  projectId: "mia-610eb",
  storageBucket: "mia-610eb.firebasestorage.app",
  messagingSenderId: "533211368663",
  appId: "1:533211368663:web:66b0e4046a030de8a23492",
  databaseURL: "https://mia-610eb-default-rtdb.firebaseio.com"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icon.png',
    badge: '/icon.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
