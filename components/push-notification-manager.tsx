"use client";

import { useEffect } from "react";
import { auth, db, messaging } from "@/lib/firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { ref, set } from "firebase/database";
import { getToken } from "firebase/messaging";

export function PushNotificationManager() {
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const permission = await Notification.requestPermission();
          if (permission !== "granted") {
            console.log("Permiso de notificaciones denegado.");
            return;
          }

          // Limpiar suscripciones push antiguas que puedan conflictuar con el VAPID key nuevo
          if ("serviceWorker" in navigator) {
            const registrations = await navigator.serviceWorker.getRegistrations();
            for (const reg of registrations) {
              const sub = await reg.pushManager.getSubscription();
              if (sub) {
                // Verificar si la suscripción existente es compatible con el VAPID key actual
                // Si no, desuscribir para forzar una nueva suscripción limpia
                try {
                  await sub.unsubscribe();
                  console.log("🔄 Suscripción push anterior limpiada");
                } catch (e) {
                  // ignorar error de unsubscribe
                }
              }
            }
          }

          // Registrar explícitamente el service worker de Firebase Messaging
          let swRegistration: ServiceWorkerRegistration | undefined;
          if ("serviceWorker" in navigator) {
            swRegistration = await navigator.serviceWorker.register(
              "/firebase-messaging-sw.js",
              { scope: "/" }
            );
            await navigator.serviceWorker.ready;
            console.log("✅ Service Worker de Firebase registrado");
          }

          const msg = await messaging();
          if (!msg) {
            console.warn("⚠️ Firebase Messaging no soportado en este navegador.");
            return;
          }

          const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
          if (!vapidKey || vapidKey === "TU_VAPID_KEY_AQUI") {
            console.warn("⚠️ VAPID Key no configurada. Las notificaciones push no funcionarán.");
            return;
          }

          const token = await getToken(msg, {
            vapidKey,
            serviceWorkerRegistration: swRegistration,
          });

          if (token) {
            const tokenRef = ref(db, `users/${user.uid}/fcmTokens/${token}`);
            await set(tokenRef, true);
            console.log("✅ FCM Token guardado:", token.substring(0, 30) + "...");
          } else {
            console.warn("⚠️ No se pudo obtener el FCM token. Verifica el VAPID key y permisos del navegador.");
          }
        } catch (error) {
          console.error("Error al obtener el token de notificaciones:", error);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  return null;
}
