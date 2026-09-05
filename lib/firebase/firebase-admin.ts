import * as admin from "firebase-admin";

let initializationError: string | null = null;
function formatPrivateKey(key: string) {
  let cleanKey = key.replace(/^"|"$/g, '');
  cleanKey = cleanKey.replace(/\\n/g, '\n');
  
  // Si no hay saltos de línea reales, forzamos el formato PEM (64 caracteres por línea)
  if (!cleanKey.includes('\n')) {
    const match = cleanKey.match(/(-----BEGIN PRIVATE KEY-----)(.+)(-----END PRIVATE KEY-----)/);
    if (match) {
      const data = match[2].replace(/\s+/g, '');
      const formattedData = data.match(/.{1,64}/g)?.join('\n') || data;
      cleanKey = `${match[1]}\n${formattedData}\n${match[3]}`;
    }
  }
  return cleanKey;
}

if (!admin.apps.length) {
  try {
    let serviceAccount: any;
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string);
    } else {
      serviceAccount = {
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY ? formatPrivateKey(process.env.FIREBASE_PRIVATE_KEY) : undefined,
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
