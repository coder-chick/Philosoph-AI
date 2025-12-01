import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// Initialize Firebase Admin (server-side)
function initAdmin() {
  if (getApps().length === 0) {
    // In Cloud Run, Application Default Credentials are automatically available
    initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT,
    });
  }
  return {
    db: getFirestore(),
    auth: getAuth(),
  };
}

export const { db, auth } = initAdmin();
