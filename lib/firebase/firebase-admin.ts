import * as admin from "firebase-admin";

let initializationError: string | null = null;
function formatPrivateKey(key: string) {
  // 1. Quitar los literales "\n" que agregó el entorno
  let cleanKey = key.replace(/\\n/g, '');
  // 2. Quitar encabezados o fragmentos de encabezados si están a medias
  cleanKey = cleanKey.replace(/-----BEGIN PRIVATE KEY-----/g, '');
  cleanKey = cleanKey.replace(/-----END PRIVATE KEY-----/g, '');
  // 3. Quitar cualquier guión sobrante, comillas, y espacios en blanco o saltos de línea reales
  cleanKey = cleanKey.replace(/[-" \n\r]/g, '');
  
  // 4. Ahora 'cleanKey' es pura Base64 matemática. La dividimos en bloques de 64 caracteres.
  const formattedData = cleanKey.match(/.{1,64}/g)?.join('\n') || cleanKey;
  
  // 5. Ensamblamos la llave perfecta para Google
  return `-----BEGIN PRIVATE KEY-----\n${formattedData}\n-----END PRIVATE KEY-----\n`;
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
