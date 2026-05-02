// functions/geocode/geocodeRouter.ts
import { Router, Request, Response } from 'express';
import { getCoordinates } from '../../utils/geocode';
import { handleError } from '../../utils/error.utils';

export const geocodeRouter = Router();

// Rate limit safety: simple in-memory check for demo
const lastRequestMap = new Map<string, number>();

/**
 * POST /api/geocode
 * Body: { "address": "Chennai" }
 */
geocodeRouter.post('/geocode', async (req: Request, res: Response) => {
  try {
    const { address } = req.body as { address: string };

    if (!address) {
      res.status(400).json({ error: "Address is required" });
      return;
    }

    // Rate limiting: 1 req per second per IP (simplified)
    const ip = req.ip || 'unknown';
    const now = Date.now();
    const last = lastRequestMap.get(ip) || 0;
    if (now - last < 1000) {
      res.status(429).json({ error: "Rate limit exceeded. Please wait 1 second." });
      return;
    }
    lastRequestMap.set(ip, now);

    console.info(`[Geocode] Request for: ${address}`);
    const coords = await getCoordinates(address);

    res.json(coords);
  } catch (err: any) {
    if (err.message === "Address not found") {
      res.status(400).json({ error: err.message });
    } else {
      handleError(err, res);
    }
  }
});
