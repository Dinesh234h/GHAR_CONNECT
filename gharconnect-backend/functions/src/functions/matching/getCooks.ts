// functions/matching/getCooks.ts
// GET /cooks/nearby — main discovery endpoint
// GET /cooks/:cookId — individual cook profile

import { Router, Request, Response } from 'express';
import { requireAuth } from '../../middleware/auth.middleware';
import { getNearbyCooks } from '../../services/matching.service';
import { detectRegionFromIP, getClientIP } from '../../services/region.service';
import { buildStaticMapUrl } from '../../services/geocoding.service';
import { db } from '../../config/firebase';
import { COLLECTIONS } from '../../config/collections';
import { handleError, AppError } from '../../utils/error.utils';
import { parseFloatParam } from '../../utils/validate.utils';
import { isWithinIndia } from '../../utils/haversine.utils';
import { CookProfile } from '../../types/cook.types';
import { UserProfile } from '../../types/user.types';

export const cooksRouter = Router();

// ─── GET /cooks/nearby ───────────────────────────────────────────────────────
cooksRouter.get('/nearby', requireAuth, async (req: Request, res: Response) => {
  try {
    const lat = parseFloatParam(req.query['lat'] as string);
    const lng = parseFloatParam(req.query['lng'] as string);
    const date = req.query['date'] as string | undefined;
    const slotTime = req.query['slot_time'] as string | undefined;

    if (lat === undefined || lng === undefined) {
      throw new AppError('MISSING_PARAMS', 'lat and lng are required query parameters.', 400);
    }

    if (!isWithinIndia(lat, lng)) {
      throw new AppError('INVALID_LOCATION', 'Coordinates must be within India.', 400);
    }

    // Fetch user preferences for recommendation scoring
    const userSnap = await db.collection(COLLECTIONS.USERS).doc(req.uid).get();
    const user = userSnap.data() as UserProfile | undefined;
    const preferences = user?.preferences ?? {
      dietary: [],
      cuisines: [],
      spice_level: 'medium' as const,
      max_price_inr: 150,
    };

    // Detect region for festival filtering
    const ip = getClientIP(req);
    const region = await detectRegionFromIP(ip);

    const cooks = await getNearbyCooks({ userLat: lat, userLng: lng, date, slotTime, preferences, region });

    res.json({ cooks, count: cooks.length });
  } catch (err) {
    handleError(err, res);
  }
});

// ─── GET /cooks/:cookId ──────────────────────────────────────────────────────
cooksRouter.get('/:cookId', requireAuth, async (req: Request, res: Response) => {
  try {
    const { cookId } = req.params;


    const cookSnap = await db.collection(COLLECTIONS.COOK_PROFILES).doc(cookId).get();
    if (!cookSnap.exists) throw new AppError('COOK_NOT_FOUND', 'Cook not found.', 404);

    const cook = cookSnap.data() as CookProfile;

    // Fetch active meals
    const mealsSnap = await db
      .collection(COLLECTIONS.MEALS)
      .where('cook_id', '==', cookId)
      .where('is_active', '==', true)
      .get();

    // Fetch future slots
    const today = new Date().toISOString().split('T')[0];
    const slotsSnap = await db
      .collection(COLLECTIONS.TIME_SLOTS)
      .where('cook_id', '==', cookId)
      .where('date', '>=', today)
      .where('is_available', '==', true)
      .get();

    // Fetch last 10 ratings
    const ratingsSnap = await db
      .collection(COLLECTIONS.RATINGS)
      .where('cook_id', '==', cookId)
      .orderBy('created_at', 'desc')
      .limit(10)
      .get();

    // Static map for cook's approximate location
    const mapUrl = buildStaticMapUrl(
      cook.home_location.approx_lat,
      cook.home_location.approx_lng
    );

    // Never expose exact location
    const { home_location: hl, ...safeProfile } = cook;
    const safeLocation = {
      approx_lat: hl.approx_lat,
      approx_lng: hl.approx_lng,
      neighbourhood: hl.neighbourhood,
    };

    res.json({
      cook: { ...safeProfile, location: safeLocation },
      meals: mealsSnap.docs.map((d) => d.data()),
      slots: slotsSnap.docs.map((d) => d.data()),
      recent_ratings: ratingsSnap.docs.map((d) => d.data()),
      map_url: mapUrl,
    });
  } catch (err) {
    handleError(err, res);
  }
});
