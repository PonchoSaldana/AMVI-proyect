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
          if (permission === "granted") {
            const msg = await messaging();
            if (msg) {
              const token = await getToken(msg, {
                // El vapidKey es opcional a menos que configures web push certs en Firebase Console.
                // vapidKey: 'TU_VAPID_KEY_AQUI',
              });

              if (token) {
                // Guardar el token en la base de datos bajo el usuario
                const tokenRef = ref(db, `users/${user.uid}/fcmTokens/${token}`);
                await set(tokenRef, true);
                console.log("FCM Token guardado:", token);
              }
            }
          } else {
            console.log("Permiso de notificaciones denegado.");
          }
        } catch (error) {
          console.error("Error al obtener el token de notificaciones:", error);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  return null; // Este componente no renderiza nada en la interfaz
}
