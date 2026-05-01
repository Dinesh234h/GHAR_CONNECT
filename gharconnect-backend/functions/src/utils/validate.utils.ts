// utils/validate.utils.ts
// Reusable Zod validation helpers for request bodies.

import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

/**
 * Generic express middleware factory that validates req.body against a Zod schema.
 * Returns 400 with structured error detail on failure.
 */
export function validateBody<T extends z.ZodTypeAny>(schema: T) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request body.',
          details: result.error.flatten(),
        },
      });
      return;
    }
    req.body = result.data;
    next();
  };
}

/**
 * Validate and parse a float query parameter, returning undefined if missing/invalid.
 */
export function parseFloatParam(value: string | undefined): number | undefined {
  if (value === undefined) return undefined;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? undefined : parsed;
}
