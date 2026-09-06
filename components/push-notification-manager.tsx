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
          console.warn("⚠️ Firebase Messaging no soportado.");
          return;
        }

        const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
        if (!vapidKey || vapidKey === "TU_VAPID_KEY_AQUI") {
          console.warn("⚠️ VAPID Key no configurada.");
          return;
        }

        // Obtener el SW activo
        const swRegistration = await navigator.serviceWorker.ready;
        console.log("SW activo:", swRegistration.active?.scriptURL);

        // CRÍTICO: Limpiar suscripción push antigua del SW activo
        // Una suscripción anterior sin VAPID key causa "push service error"
        try {
          const existingSub = await swRegistration.pushManager.getSubscription();
          if (existingSub) {
            console.log("🔄 Limpiando suscripción push anterior...");
            await existingSub.unsubscribe();
            console.log("✅ Suscripción anterior eliminada");
          }
        } catch (unsubErr) {
          console.warn("No se pudo limpiar suscripción anterior:", unsubErr);
        }

        // Pequeña pausa para que el browser procese la desuscripción
        await new Promise((r) => setTimeout(r, 300));

        let token: string | null = null;

        // Intento 1: con el SW activo explícito
        try {
          token = await getToken(msg, {
            vapidKey,
            serviceWorkerRegistration: swRegistration,
          });
        } catch (err1: any) {
          console.warn("Intento 1 falló:", err1.message);

          // Intento 2: sin serviceWorkerRegistration (Firebase elige el SW)
          try {
            token = await getToken(msg, { vapidKey });
          } catch (err2: any) {
            console.error("Intento 2 también falló:", err2.message);
            throw err2;
          }
        }

        if (token) {
          const tokenRef = ref(db, `users/${user.uid}/fcmTokens/${token}`);
          await set(tokenRef, true);
          console.log("✅ FCM Token guardado:", token.substring(0, 30) + "...");
        } else {
          console.warn("⚠️ getToken devolvió vacío.");
        }
      } catch (error: any) {
        console.error("Error al obtener token FCM:", error.name, "-", error.message);
      }
    });

    return () => unsubscribe();
  }, []);

  return null;
}
