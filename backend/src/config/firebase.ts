/**
 * Firebase Admin SDK — env vars first (Render production), JSON file fallback (local dev).
 * Safe to import from any module — initialization is guarded by admin.apps.length.
 */
import admin from 'firebase-admin';
import path from 'path';
import fs from 'fs';
import { logger } from '../utils/logger';

let fcmMessaging: admin.messaging.Messaging | null = null;

function initFirebase(): void {
  if (admin.apps.length > 0) {
    // Already initialized in this process — just grab the messaging reference
    if (!fcmMessaging) fcmMessaging = admin.messaging();
    return;
  }

  try {
    // 1. Production (Render): environment variables — checked FIRST
    if (
      process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY
    ) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          // Render stores \n literally — replace with real newlines
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
      });
      fcmMessaging = admin.messaging();
      logger.info('Firebase Admin initialized via environment variables ✅');
      return;
    }

    // 2. Local dev fallback: serviceAccountKey.json
    const candidates = [
      path.resolve(process.cwd(), 'serviceAccountKey.json'),
      path.resolve(__dirname, '../../serviceAccountKey.json'),
      path.resolve(__dirname, '../../../serviceAccountKey.json'),
    ];

    for (const keyPath of candidates) {
      if (fs.existsSync(keyPath)) {
        const serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
        admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
        fcmMessaging = admin.messaging();
        logger.info(`Firebase Admin initialized via serviceAccountKey.json ✅`);
        return;
      }
    }

    logger.warn('Firebase: no credentials found. Push notifications DISABLED.');
    logger.warn('Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY in Render.');
  } catch (error: any) {
    logger.error('Firebase Admin SDK initialization failed:', error?.message || error);
  }
}

// Initialize on module load
initFirebase();

export { admin, fcmMessaging };
