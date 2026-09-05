function formatPrivateKey(key: string) {
  let cleanKey = key.replace(/\\n/g, '');
  cleanKey = cleanKey.replace(/-----BEGIN PRIVATE KEY-----/g, '');
  cleanKey = cleanKey.replace(/-----END PRIVATE KEY-----/g, '');
  cleanKey = cleanKey.replace(/[-" \n\r]/g, '');
  const formattedData = cleanKey.match(/.{1,64}/g)?.join('\n') || cleanKey;
  return `-----BEGIN PRIVATE KEY-----\n${formattedData}\n-----END PRIVATE KEY-----\n`;
}

let _adminDb: ReturnType<typeof import('firebase-admin').database> | null = null;
let _adminMessaging: ReturnType<typeof import('firebase-admin').messaging> | null = null;
let _initializationError: string | null = null;
let _initialized = false;

async function initAdmin() {
  if (_initialized) return;
  _initialized = true;

  try {
    const admin = await import('firebase-admin');

    if (!admin.apps.length) {
      let serviceAccount: any;
      if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string);
      } else {
        serviceAccount = {
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY
            ? formatPrivateKey(process.env.FIREBASE_PRIVATE_KEY)
            : undefined,
        };
      }

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
      });
    }

    _adminDb = admin.database();
    _adminMessaging = admin.messaging();
  } catch (error: any) {
    console.error('Firebase admin initialization error', error);
    _initializationError = error.message || String(error);
  }
}

export async function getAdminServices() {
  await initAdmin();
  return {
    adminDb: _adminDb,
    adminMessaging: _adminMessaging,
    initializationError: _initializationError,
  };
}
