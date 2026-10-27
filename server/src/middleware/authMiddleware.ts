import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Access denied. No authentication token provided.' });
    return;
  }

  const token = authHeader.split(' ')[1];
  const secret = process.env.JWT_SECRET || 'eventpilot_jwt_super_secret_development_key_change_in_production';

  try {
    const decoded = jwt.verify(token, secret) as { userId: string; email: string };
    req.user = {
      id: decoded.userId,
      email: decoded.email,
    };
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired session token. Please sign in again.' });
  }
}
