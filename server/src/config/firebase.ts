import { initializeApp, getApps, cert, type App } from 'firebase-admin';
import { getDatabase, type Database } from 'firebase-admin/database';
import { getAuth, type Auth } from 'firebase-admin/auth';
import fs from 'fs';
import path from 'path';

let dbInstance: Database | null = null;
let authInstance: Auth | null = null;
let appInstance: App | null = null;

export function initializeFirebase(): Database {
  if (dbInstance) {
    return dbInstance;
  }

  const databaseURL = process.env.FIREBASE_DATABASE_URL;
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (!databaseURL || !projectId) {
    throw new Error(
      'Missing Firebase configuration. Ensure FIREBASE_DATABASE_URL and FIREBASE_PROJECT_ID are set in your environment variables.'
    );
  }

  try {
    if (getApps().length === 0) {
      let cred: any = null;
      if (serviceAccountKey) {
        if (serviceAccountKey.trim().startsWith('{')) {
          cred = JSON.parse(serviceAccountKey);
        } else {
          const candidatePaths = [
            serviceAccountKey,
            path.resolve(process.cwd(), serviceAccountKey),
            path.resolve(process.cwd(), 'server', serviceAccountKey),
          ];
          for (const p of candidatePaths) {
            if (fs.existsSync(p)) {
              cred = JSON.parse(fs.readFileSync(p, 'utf-8'));
              break;
            }
          }
        }
      } else {
        // Automatic discovery for serviceAccountKey.json
        const defaultCandidatePaths = [
          path.resolve(process.cwd(), 'serviceAccountKey.json'),
          path.resolve(process.cwd(), 'server', 'serviceAccountKey.json'),
        ];
        for (const p of defaultCandidatePaths) {
          if (fs.existsSync(p)) {
            cred = JSON.parse(fs.readFileSync(p, 'utf-8'));
            break;
          }
        }
      }

      if (cred) {
        appInstance = initializeApp({
          credential: cert(cred),
          databaseURL,
          projectId,
        });
      } else {
        appInstance = initializeApp({
          projectId,
          databaseURL,
        });
      }
    } else {
      appInstance = getApps()[0];
    }

    dbInstance = getDatabase(appInstance);
    authInstance = getAuth(appInstance);
    console.log(`✓ Firebase Realtime Database & Auth initialized (${databaseURL})`);
    return dbInstance;
  } catch (err: any) {
    console.warn(`! Firebase initialization notice: ${err.message}`);
    if (getApps().length > 0) {
      appInstance = getApps()[0];
      dbInstance = getDatabase(appInstance);
      authInstance = getAuth(appInstance);
      return dbInstance;
    }
    appInstance = initializeApp({ projectId, databaseURL });
    dbInstance = getDatabase(appInstance);
    authInstance = getAuth(appInstance);
    return dbInstance;
  }
}

export function getDatabaseRef(): Database {
  if (!dbInstance) {
    return initializeFirebase();
  }
  return dbInstance;
}

export function getFirebaseAuth(): Auth {
  if (!authInstance) {
    initializeFirebase();
  }
  return authInstance || getAuth(appInstance || undefined);
}
