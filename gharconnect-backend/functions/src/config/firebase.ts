// config/firebase.ts
// Firebase Admin SDK — singleton pattern. Import { db, admin } everywhere.

import * as admin from 'firebase-admin';
import * as path from 'path';
import * as fs from 'fs';

if (!admin.apps.length) {
  // Attempt to load service account JSON for local development
  const saPath = process.env.GOOGLE_APPLICATION_CREDENTIALS
    ? path.resolve(process.env.GOOGLE_APPLICATION_CREDENTIALS)
    : path.resolve(__dirname, '..', '..', '..', 'serviceAccount.json');

  const hasSA = fs.existsSync(saPath);

  if (hasSA) {
    // Local development — explicit credential + storageBucket
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const serviceAccount = require(saPath);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });
  } else {
    // Deployed Cloud Functions — ADC handles credentials automatically
    admin.initializeApp({
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });
  }
}

export { admin };
export const db = admin.firestore();
export const auth = admin.auth();
export const messaging = admin.messaging();
export const storage = admin.storage();

// Convenience re-export for FieldValue operations
export const FieldValue = admin.firestore.FieldValue;
export const Timestamp = admin.firestore.Timestamp;
