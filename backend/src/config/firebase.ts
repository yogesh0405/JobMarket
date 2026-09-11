import admin from 'firebase-admin';
import path from 'path';
import fs from 'fs';
import { logger } from '../utils/logger';

let fcmMessaging: admin.messaging.Messaging | null = null;

try {
  const serviceAccountPath = path.resolve(__dirname, '../../serviceAccountKey.json');

  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    }
    fcmMessaging = admin.messaging();
    logger.info('Firebase Admin initialized successfully using serviceAccountKey.json');
  } else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
      });
    }
    fcmMessaging = admin.messaging();
    logger.info('Firebase Admin initialized successfully using environment variables');
  } else {
    logger.warn('Firebase serviceAccountKey.json not found and environment variables not set. Push notifications will be disabled.');
  }
} catch (error: any) {
  logger.error('Failed to initialize Firebase Admin SDK:', error?.message || error);
}

export { admin, fcmMessaging };
