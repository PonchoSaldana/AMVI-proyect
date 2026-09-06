import { NextResponse } from "next/server";
import { getAdminServices } from "@/lib/firebase/firebase-admin";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { adminDb, adminMessaging, initializationError } = await getAdminServices();

  if (!adminDb || !adminMessaging) {
    return NextResponse.json({ error: "Firebase admin no inicializado", details: initializationError }, { status: 500 });
  }

  try {
    const usersSnapshot = await adminDb.ref("users").once("value");
    const usersData = usersSnapshot.val();

    if (!usersData) {
      return NextResponse.json({ message: "No hay usuarios" });
    }

    const totalUsers = Object.keys(usersData).length;
    console.log(`[cron] Revisando ${totalUsers} usuarios...`);

    const now = Date.now();
    let notificationsSent = 0;

    for (const [uid, userData] of Object.entries<any>(usersData)) {
      const fcmTokens = (userData as any).fcmTokens ? Object.keys((userData as any).fcmTokens) : [];
      console.log(`[cron] Usuario ${uid}: ${fcmTokens.length} tokens FCM`);
      if (fcmTokens.length === 0) continue;

      const messages: any[] = [];

      // Check Medicines
      if ((userData as any).medicines) {
        for (const med of Object.values<any>((userData as any).medicines)) {
          if (!med.lastTaken) continue;
          const nextDoseTime = med.lastTaken + (med.frequencyHours * 60 * 60 * 1000);
          const timeDiff = nextDoseTime - now;
          if (timeDiff <= 15 * 60 * 1000 && timeDiff > -15 * 60 * 1000) {
            messages.push({
              title: "¡Hora de tu medicina!",
              body: `Es momento de tomar ${med.name} ${med.dosage || ""}`,
            });
          }
        }
      }

      // Check Appointments - avisar 1 hora antes y 30 minutos antes
      if ((userData as any).appointments) {
        for (const appt of Object.values<any>((userData as any).appointments)) {
          if (!appt.date || !appt.time) continue;
          const apptDateTime = new Date(`${appt.date}T${appt.time}`).getTime();
          const timeDiff = apptDateTime - now;
          const minutesDiff = timeDiff / (60 * 1000);

          // Ventana de ~1 hora (entre 50 y 65 minutos antes)
          if (minutesDiff > 50 && minutesDiff <= 65) {
            messages.push({
              title: "⏰ Recordatorio de cita médica",
              body: `Tu cita "${appt.title}" es en aproximadamente 1 hora.`,
            });
          }

          // Ventana de ~30 minutos (entre 25 y 35 minutos antes)
          if (minutesDiff > 25 && minutesDiff <= 35) {
            messages.push({
              title: "🏥 Tu cita es pronto",
              body: `Tu cita "${appt.title}" es en 30 minutos. ¡Prepárate!`,
            });
          }
        }
      }

      // Send Push Notifications
      for (const msg of messages) {
        for (const token of fcmTokens) {
          try {
            await adminMessaging.send({
              token,
              notification: { title: msg.title, body: msg.body },
            });
            notificationsSent++;
            console.log(`[cron] ✅ Notificación enviada a ${uid}`);
          } catch (error: any) {
            console.error(`[cron] ❌ Error enviando al token ${token.substring(0,20)}...: ${error?.message || error}`);
          }
        }
      }
    }

    console.log(`[cron] Finalizado. Notificaciones enviadas: ${notificationsSent}`);
    return NextResponse.json({ success: true, notificationsSent });
  } catch (error: any) {
    console.error("Error en cron de recordatorios:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
