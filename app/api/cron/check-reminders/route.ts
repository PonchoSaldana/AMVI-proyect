import { NextResponse } from "next/server";
import { adminDb, adminMessaging } from "@/lib/firebase/firebase-admin";

export async function GET() {
  if (!adminDb || !adminMessaging) {
    return NextResponse.json({ error: "Firebase admin no inicializado" }, { status: 500 });
  }

  try {
    const usersSnapshot = await adminDb.ref("users").once("value");
    const usersData = usersSnapshot.val();

    if (!usersData) {
      return NextResponse.json({ message: "No hay usuarios" });
    }

    const now = Date.now();
    let notificationsSent = 0;

    for (const [uid, userData] of Object.entries<any>(usersData)) {
      const fcmTokens = userData.fcmTokens ? Object.keys(userData.fcmTokens) : [];
      if (fcmTokens.length === 0) continue;

      const messages: any[] = [];

      // Check Medicines
      if (userData.medicines) {
        for (const med of Object.values<any>(userData.medicines)) {
          if (!med.lastTaken) continue; // Si nunca lo ha tomado, lo ignoramos para no spam
          
          const nextDoseTime = med.lastTaken + (med.frequencyHours * 60 * 60 * 1000);
          const timeDiff = nextDoseTime - now;

          // Si falta menos de 15 minutos para la próxima dosis o ya se pasó por poco (hasta 15 min de retraso)
          if (timeDiff <= 15 * 60 * 1000 && timeDiff > -15 * 60 * 1000) {
            messages.push({
              title: "¡Hora de tu medicina!",
              body: `Es momento de tomar ${med.name} ${med.dosage || ""}`,
            });
          }
        }
      }

      // Check Appointments
      if (userData.appointments) {
        for (const appt of Object.values<any>(userData.appointments)) {
          const apptDateTime = new Date(`${appt.date}T${appt.time}`).getTime();
          const timeDiff = apptDateTime - now;

          // Si falta entre 45 y 60 minutos para la cita
          if (timeDiff > 45 * 60 * 1000 && timeDiff <= 60 * 60 * 1000) {
            messages.push({
              title: "Recordatorio de cita médica",
              body: `Tu cita "${appt.title}" es en aproximadamente 1 hora.`,
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
              notification: {
                title: msg.title,
                body: msg.body,
              }
            });
            notificationsSent++;
          } catch (error) {
            console.error(`Error enviando notificación al token ${token}:`, error);
          }
        }
      }
    }

    return NextResponse.json({ success: true, notificationsSent });
  } catch (error: any) {
    console.error("Error en cron de recordatorios:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
