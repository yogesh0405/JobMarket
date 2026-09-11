/**
 * Firebase Admin SDK — env vars first (Render production), JSON file fallback (local dev).
 * Safe to import from any module — initialization is guarded by admin.apps.length.
 */
import admin from 'firebase-admin';
import path from 'path';
import fs from 'fs';
import { logger } from '../utils/logger';

let fcmMessaging: admin.messaging.Messaging | null = null;

export function isFcmInitialized(): boolean {
  return fcmMessaging !== null && admin.apps.length > 0;
}

function initFirebase(): void {
  if (admin.apps.length > 0) {
    if (!fcmMessaging) fcmMessaging = admin.messaging();
    return;
  }

  try {
    // 1. Check Render Secret Files and local filesystem candidates
    const fileCandidates = [
      '/etc/secrets/serviceAccountKey.json', // Standard Render Secret File path
      path.resolve(process.cwd(), 'serviceAccountKey.json'),
      path.resolve(process.cwd(), 'backend/serviceAccountKey.json'),
      path.resolve(__dirname, '../../serviceAccountKey.json'),
      path.resolve(__dirname, '../../../serviceAccountKey.json'),
    ];

    for (const filePath of fileCandidates) {
      if (fs.existsSync(filePath)) {
        try {
          const content = fs.readFileSync(filePath, 'utf8');
          const serviceAccount = JSON.parse(content);
          admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
          fcmMessaging = admin.messaging();
          logger.info(`Firebase Admin initialized from file: ${filePath} ✅`);
          return;
        } catch (err: any) {
          logger.error(`Failed to load Firebase credentials from ${filePath}:`, err?.message || err);
        }
      }
    }

    // 2. Check full JSON in single environment variable (FIREBASE_SERVICE_ACCOUNT_JSON)
    if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      try {
        const rawJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON.trim();
        const serviceAccount = JSON.parse(rawJson);
        admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
        fcmMessaging = admin.messaging();
        logger.info('Firebase Admin initialized via FIREBASE_SERVICE_ACCOUNT_JSON ✅');
        return;
      } catch (err: any) {
        logger.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON:', err?.message || err);
      }
    }

    // 3. Check Base64 encoded JSON (FIREBASE_SERVICE_ACCOUNT_BASE64)
    if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
      try {
        const decoded = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64.trim(), 'base64').toString('utf8');
        const serviceAccount = JSON.parse(decoded);
        admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
        fcmMessaging = admin.messaging();
        logger.info('Firebase Admin initialized via FIREBASE_SERVICE_ACCOUNT_BASE64 ✅');
        return;
      } catch (err: any) {
        logger.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_BASE64:', err?.message || err);
      }
    }

    // 4. Check individual environment variables (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY)
    if (
      process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY
    ) {
      // Clean up common issues from Render UI: surrounding quotes, escaped newlines, Windows \r
      const cleanedPrivateKey = process.env.FIREBASE_PRIVATE_KEY
        .trim()
        .replace(/^["']|["']$/g, '')
        .replace(/\\n/g, '\n')
        .replace(/\r\n/g, '\n');

      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID.trim().replace(/^["']|["']$/g, ''),
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL.trim().replace(/^["']|["']$/g, ''),
          privateKey: cleanedPrivateKey,
        }),
      });
      fcmMessaging = admin.messaging();
      logger.info('Firebase Admin initialized via environment variables ✅');
      return;
    }

    logger.warn('Firebase: no credentials found. Push notifications DISABLED.');
    logger.warn('Configure FIREBASE_SERVICE_ACCOUNT_JSON, Render Secret File, or FIREBASE_PRIVATE_KEY in Render.');
  } catch (error: any) {
    logger.error('Firebase Admin SDK initialization failed:', error?.message || error);
  }
}

// Initialize on module load
initFirebase();

export { admin, fcmMessaging };
