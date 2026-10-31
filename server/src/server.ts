import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { initializeFirebase } from './config/firebase.js';
import { authRouter } from './routes/authRoutes.js';
import { eventRouter } from './routes/eventRoutes.js';
import { aiRouter } from './routes/aiRoutes.js';
import path from 'path';
import fs from 'fs';

dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Security & Parsing Middleware
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
    crossOriginEmbedderPolicy: false,
  })
);
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// In-Memory Rate Limiter for Brute-Force & AI Quota Protection
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function createRateLimiter(maxRequests: number, windowMs: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (process.env.NODE_ENV === 'test') {
      return next();
    }
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const clientRecord = rateLimitStore.get(ip);

    if (!clientRecord || now > clientRecord.resetAt) {
      rateLimitStore.set(ip, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (clientRecord.count >= maxRequests) {
      return res.status(429).json({
        error: 'Too many requests. Please slow down and try again later.',
        retryAfterMs: clientRecord.resetAt - now,
      });
    }

    clientRecord.count++;
    return next();
  };
}

// Health Check Endpoint
app.get(['/health', '/api/health'], (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    product: 'EventPilot API',
    database: 'Firebase Realtime Database',
    timestamp: new Date().toISOString(),
  });
});

const authLimiter = createRateLimiter(60, 15 * 60 * 1000);
const aiLimiter = createRateLimiter(45, 60 * 1000);

// API Routes (supports both /api/* and direct /* paths)
app.use('/api/auth', authLimiter, authRouter);
app.use('/api/events', eventRouter);
app.use('/api/ai', aiLimiter, aiRouter);

app.use('/auth', authLimiter, authRouter);
app.use('/events', eventRouter);
app.use('/ai', aiLimiter, aiRouter);

// Serve Client Static Build & SPA Routing Fallback
const clientDistCandidates = [
  path.resolve(process.cwd(), 'client/dist'),
  path.resolve(process.cwd(), '../client/dist'),
  path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([a-zA-Z]:)/, '$1')), '../../client/dist'),
];

const clientDistPath = clientDistCandidates.find(
  (dir) => fs.existsSync(dir) && fs.existsSync(path.join(dir, 'index.html'))
);

if (clientDistPath) {
  console.log(`✓ Serving client SPA build from: ${clientDistPath}`);
  app.use(
    express.static(clientDistPath, {
      maxAge: '1d',
      etag: true,
    })
  );

  app.get('*', (req: Request, res: Response) => {
    // API route requests that were not matched should return JSON 404
    if (
      req.path.startsWith('/api/') ||
      req.path.startsWith('/auth/') ||
      req.path.startsWith('/events/') ||
      req.path.startsWith('/ai/')
    ) {
      return res.status(404).json({ error: 'Endpoint not found.' });
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
} else {
  // 404 Route Handler when client dist is not built
  app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: 'Endpoint not found.' });
  });
}

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

// Start if executed directly as a standalone process
if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  startServer();
}

export default app;
