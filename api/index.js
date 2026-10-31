import app from '../server/dist/server.js';
import { initializeFirebase } from '../server/dist/config/firebase.js';

try {
  initializeFirebase();
} catch (err) {
  // Ignore if already initialized
}

export default app;
