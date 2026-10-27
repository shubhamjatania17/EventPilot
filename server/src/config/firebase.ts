import { initializeApp, getApps, cert, type App } from 'firebase-admin';
import { getDatabase, type Database } from 'firebase-admin/database';
import fs from 'fs';
import path from 'path';

let dbInstance: Database | null = null;

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

  let app: App;
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
        app = initializeApp({
          credential: cert(cred),
          databaseURL,
          projectId,
        });
      } else {
        app = initializeApp({
          projectId,
          databaseURL,
        });
      }
    } else {
      app = getApps()[0];
    }

    dbInstance = getDatabase(app);
    console.log(`✓ Firebase Realtime Database initialized (${databaseURL})`);
    return dbInstance;
  } catch (err: any) {
    console.warn(`! Firebase initialization notice: ${err.message}`);
    if (getApps().length > 0) {
      dbInstance = getDatabase(getApps()[0]);
      return dbInstance;
    }
    app = initializeApp({ projectId, databaseURL });
    dbInstance = getDatabase(app);
    return dbInstance;
  }
}

export function getDatabaseRef(): Database {
  if (!dbInstance) {
    return initializeFirebase();
  }
  return dbInstance;
}
