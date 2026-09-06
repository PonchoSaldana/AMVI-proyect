import { NextResponse } from "next/server";
import { getAdminServices } from "@/lib/firebase/firebase-admin";

export const dynamic = 'force-dynamic';

export async function GET() {
  const { adminDb, adminMessaging, initializationError } = await getAdminServices();

  // 1. Check env vars (sin exponer claves completas)
  const envCheck = {
    FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL
      ? `✅ ${process.env.FIREBASE_CLIENT_EMAIL}`
      : "❌ MISSING",
    FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY
      ? `✅ (${process.env.FIREBASE_PRIVATE_KEY.length} chars)`
      : "❌ MISSING",
    FIREBASE_SERVICE_ACCOUNT_KEY: process.env.FIREBASE_SERVICE_ACCOUNT_KEY
      ? `✅ (JSON presente)`
      : "❌ MISSING",
    NEXT_PUBLIC_FIREBASE_VAPID_KEY: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
      ? `✅ ${process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY.substring(0, 20)}...`
      : "❌ MISSING",
    adminDb: adminDb ? "✅ Inicializado" : "❌ NO inicializado",
    adminMessaging: adminMessaging ? "✅ Inicializado" : "❌ NO inicializado",
    initializationError: initializationError || "ninguno",
  };

  if (!adminDb) {
    return NextResponse.json({ envCheck, error: "Firebase Admin no inicializado" });
  }

  // 2. Check FCM tokens in DB
  try {
    const usersSnap = await adminDb.ref("users").once("value");
    const usersData = usersSnap.val();

    if (!usersData) {
      return NextResponse.json({ envCheck, users: "No hay usuarios en la DB" });
    }

    const usersInfo = Object.entries<any>(usersData).map(([uid, data]) => {
      const tokens = data.fcmTokens ? Object.keys(data.fcmTokens) : [];
      const medicines = data.medicines ? Object.keys(data.medicines).length : 0;
      const appointments = data.appointments ? Object.keys(data.appointments).length : 0;
      return {
        uid,
        fcmTokenCount: tokens.length,
        fcmTokenSample: tokens[0] ? tokens[0].substring(0, 30) + "..." : "ninguno",
        medicines,
        appointments,
      };
    });

    return NextResponse.json({ envCheck, users: usersInfo });
  } catch (error: any) {
    return NextResponse.json({ envCheck, dbError: error.message });
  }
}
