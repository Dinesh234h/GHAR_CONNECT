// functions/agora/agoraRouter.ts
import { Router, Request, Response } from 'express';
import { requireAuth } from '../../middleware/auth.middleware';
import { generateRtcToken } from '../../utils/agoraToken';
import { handleError, AppError } from '../../utils/error.utils';

export const agoraRouter = Router();

// Basic in-memory rate limiter for the token endpoint
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10;

function checkRateLimit(uid: string): boolean {
  const now = Date.now();
  const limit = rateLimitMap.get(uid);

  if (!limit || now > limit.resetAt) {
    rateLimitMap.set(uid, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (limit.count >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }

  limit.count++;
  return true;
}

/**
 * GET /token — Returns an Agora RTC token for the caller.
 * Requires Authentication.
 */
agoraRouter.get('/token', requireAuth, async (req: Request, res: Response) => {
  try {
    const channelName = req.query.channelName as string;
    const uidStr = req.query.uid as string;

    if (!channelName || !uidStr) {
      throw new AppError('INVALID_PARAMS', 'channelName and uid are required.', 400);
    }

    const uid = parseInt(uidStr);
    if (isNaN(uid)) {
      throw new AppError('INVALID_PARAMS', 'uid must be a number.', 400);
    }

    // Rate limit check
    if (!checkRateLimit(req.uid)) {
      throw new AppError('TOO_MANY_REQUESTS', 'Rate limit exceeded for Agora tokens.', 429);
    }

    console.info(`[AgoraRoute] Token requested by ${req.uid} for channel ${channelName}`);

    const token = generateRtcToken(channelName, uid);

    res.json({
      token,
      channelName,
      uid,
      expiresIn: process.env.AGORA_TOKEN_EXPIRY_SECONDS || '3600'
    });
  } catch (err) {
    handleError(err, res);
  }
});
