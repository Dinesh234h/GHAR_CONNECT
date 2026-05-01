// middleware/auth.middleware.ts
// Firebase Auth token verification — applied to ALL protected routes.

import { Request, Response, NextFunction } from 'express';
import { auth } from '../config/firebase';

// Extend Express Request to carry decoded token fields
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      uid: string;
      phone?: string;
      roles?: string[];
    }
  }
}

/**
 * requireAuth — verifies Firebase ID token from Authorization header.
 * Attaches uid, phone, and custom claims (roles) to req.
 */
export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.split('Bearer ')[1] : null;

  if (!token) {
    res.status(401).json({ error: { code: 'UNAUTHENTICATED', message: 'Missing auth token.' } });
    return;
  }

  try {
    const decoded = await auth.verifyIdToken(token);
    req.uid = decoded.uid;
    req.phone = decoded.phone_number;
    req.roles = (decoded.roles as string[]) ?? [];
    next();
  } catch (err) {
    console.error('Auth verification failed:', err);
    res.status(401).json({ error: { code: 'UNAUTHENTICATED', message: 'Invalid or expired token.' } });
  }
}

/**
 * requireRole — factory that creates a middleware checking for a specific role.
 * Always chain after requireAuth.
 */
export function requireRole(role: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.roles?.includes(role)) {
      res.status(403).json({
        error: { code: 'FORBIDDEN', message: `Role '${role}' required.` },
      });
      return;
    }
    next();
  };
}
