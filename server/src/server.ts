import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { initializeFirebase } from './config/firebase.js';
import { authRouter } from './routes/authRoutes.js';
import { eventRouter } from './routes/eventRoutes.js';
import { aiRouter } from './routes/aiRoutes.js';
import path from 'path';

dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Security & Parsing Middleware
app.use(helmet());
app.use(
  cors({
    origin: [CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check Endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    product: 'EventPilot API',
    database: 'Firebase Realtime Database',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/events', eventRouter);
app.use('/api/ai', aiRouter);

// 404 Route Handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Endpoint not found.' });
});

// Global Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    error: 'An unexpected internal server error occurred. Please try again.',
  });
});

// Database Connection & Server Initialization
export async function startServer() {
  try {
    initializeFirebase();
  } catch (err: any) {
    console.warn(`! Firebase initialization warning: ${err.message}`);
  }

  return app.listen(PORT, () => {
    console.log(`✓ EventPilot API server listening on http://localhost:${PORT}`);
  });
}

// Start if executed directly
if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export default app;
