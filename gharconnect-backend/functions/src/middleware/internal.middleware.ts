// middleware/internal.middleware.ts
// Verifies X-Internal-Secret header on Cloud Tasks target endpoints.
// Prevents unauthorized calls to /internal/* routes from the public internet.

import { Request, Response, NextFunction } from 'express';

export function requireInternalSecret(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const secret = req.headers['x-internal-secret'];
  if (!secret || secret !== process.env.INTERNAL_SECRET) {
    res.status(403).json({
      error: { code: 'FORBIDDEN', message: 'Invalid internal secret.' },
    });
    return;
  }
  next();
}
