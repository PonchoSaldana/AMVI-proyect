import { NextResponse } from "next/server";
import { getAdminServices } from "@/lib/firebase/firebase-admin";

export const dynamic = 'force-dynamic';

export async function GET() {
  const { adminDb, adminMessaging, initializationError } = await getAdminServices();

  if (!adminDb || !adminMessaging) {
    return NextResponse.json({
      error: "Firebase Admin no inicializado",
      details: initializationError
    }, { status: 500 });
  }

  try {
    const usersSnap = await adminDb.ref("users").once("value");
    const usersData = usersSnap.val();

    if (!usersData) {
      return NextResponse.json({ error: "No hay usuarios en la DB" });
    }

    const results: any[] = [];

    for (const [uid, userData] of Object.entries<any>(usersData)) {
      const tokens = userData.fcmTokens ? Object.keys(userData.fcmTokens) : [];

      if (tokens.length === 0) {
        results.push({ uid, status: "SIN_TOKENS" });
        continue;
      }

      for (const token of tokens) {
        try {
          const messageId = await adminMessaging.send({
            token,
            notification: {
              title: "🔔 Notificación de prueba",
              body: "Si ves esto, las notificaciones funcionan correctamente.",
            },
          });
          results.push({
            uid,
            token: token.substring(0, 25) + "...",
            status: "ENVIADO",
            messageId,
          });
        } catch (err: any) {
          // Token inválido/expirado → eliminarlo de la DB
          if (
            err.code === "messaging/registration-token-not-registered" ||
            err.code === "messaging/invalid-registration-token"
          ) {
            await adminDb.ref(`users/${uid}/fcmTokens/${token}`).remove();
            results.push({
              uid,
              token: token.substring(0, 25) + "...",
              status: "TOKEN_INVALIDO_ELIMINADO",
              error: err.code,
            });
          } else {
            results.push({
              uid,
              token: token.substring(0, 25) + "...",
              status: "ERROR",
              error: err.code || err.message,
            });
          }
        }
      }
    }

    return NextResponse.json({ success: true, results });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
