"use client";

import { useEffect } from "react";
import { auth, db, messaging } from "@/lib/firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { ref, set } from "firebase/database";
import { getToken } from "firebase/messaging";

export function PushNotificationManager() {
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return;

      try {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          console.log("Permiso de notificaciones denegado.");
          return;
        }

        const msg = await messaging();
        if (!msg) {
          console.warn("⚠️ Firebase Messaging no soportado en este navegador.");
          return;
        }

        const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
        if (!vapidKey || vapidKey === "TU_VAPID_KEY_AQUI") {
          console.warn("⚠️ VAPID Key no configurada.");
          return;
        }

        // Usar el service worker activo del PWA (sw.js) en lugar de registrar uno nuevo.
        // El sw.js ya incluye el handler de Firebase Messaging via worker/index.ts
        const swRegistration = await navigator.serviceWorker.ready;
        console.log("✅ Service Worker activo:", swRegistration.active?.scriptURL);

        const token = await getToken(msg, {
          vapidKey,
          serviceWorkerRegistration: swRegistration,
        });

        if (token) {
          const tokenRef = ref(db, `users/${user.uid}/fcmTokens/${token}`);
          await set(tokenRef, true);
          console.log("✅ FCM Token guardado:", token.substring(0, 30) + "...");
        } else {
          console.warn("⚠️ getToken devolvió vacío. Verifica el VAPID key en Firebase Console.");
        }
      } catch (error) {
        console.error("Error al obtener el token de notificaciones:", error);
      }
    });

    return () => unsubscribe();
  }, []);

  return null;
}
