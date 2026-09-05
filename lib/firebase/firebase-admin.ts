import * as admin from "firebase-admin";

let initializationError: string | null = null;
if (!admin.apps.length) {
  try {
    let serviceAccount: any;
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string);
    } else {
      let rawKey = process.env.FIREBASE_PRIVATE_KEY || "";
      if (rawKey.startsWith('"') && rawKey.endsWith('"')) {
        rawKey = rawKey.slice(1, -1);
      }
      serviceAccount = {
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: rawKey.replace(/\\n/g, '\n'),
      };
    }

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
    });
  } catch (error: any) {
    console.error("Firebase admin initialization error", error);
    initializationError = error.message || String(error);
  }
}

const adminDb = admin.apps.length > 0 ? admin.database() : null;
const adminMessaging = admin.apps.length > 0 ? admin.messaging() : null;

export { adminDb, adminMessaging, initializationError };
