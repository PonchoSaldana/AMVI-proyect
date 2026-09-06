// Este archivo es compilado e incluido automáticamente en el sw.js generado por @ducanh2912/next-pwa
// Maneja los mensajes push de Firebase en segundo plano

declare const self: ServiceWorkerGlobalScope & { firebase: any };
declare function importScripts(...urls: string[]): void;
declare const firebase: any;

importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

// Solo inicializar si no está ya inicializado
if (!firebase.apps.length) {
  firebase.initializeApp({
    apiKey: "AIzaSyA-n7EIruJSrDTfVcSx_4w-_vQ6mFam-zg",
    authDomain: "mia-610eb.firebaseapp.com",
    projectId: "mia-610eb",
    storageBucket: "mia-610eb.firebasestorage.app",
    messagingSenderId: "533211368663",
    appId: "1:533211368663:web:66b0e4046a030de8a23492",
    databaseURL: "https://mia-610eb-default-rtdb.firebaseio.com",
  });
}

const messagingInstance = firebase.messaging();

messagingInstance.onBackgroundMessage((payload: any) => {
  console.log('[sw] Mensaje push recibido en background:', payload);
  const notificationTitle = payload.notification?.title || 'Notificación AMVI';
  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: '/icon.png',
    badge: '/icon.png',
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});
