// functions/cook/onboardCook.ts
// POST /cook/onboard — register a new cook with profile, images, and geolocation.

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import multer from 'multer';
import { requireAuth } from '../../middleware/auth.middleware';
import { handleError, AppError } from '../../utils/error.utils';
import { db, FieldValue, Timestamp } from '../../config/firebase';
import { COLLECTIONS } from '../../config/collections';
import { CONSTANTS } from '../../config/constants';
import { geocodeAddress } from '../../services/geocoding.service';
import { encodeGeohash, snapToGrid } from '../../utils/geohash.utils';
import { isWithinIndia } from '../../utils/haversine.utils';
import { uploadKitchenImage } from '../../services/storage.service';
import { CookProfile } from '../../types/cook.types';

const OnboardSchema = z.object({
  name: z.string().min(2).max(60),
  bio: z.string().min(10).max(500),
  meal_types: z.array(z.enum(['veg', 'non_veg', 'vegan', 'jain'])).min(1),
  cuisine_tags: z.array(z.string()).min(1).max(10),
  capacity_default: z.number().int().min(CONSTANTS.SLOT_MIN_CAPACITY).max(CONSTANTS.SLOT_MAX_CAPACITY),
  address: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 3 }, // 5MB, max 3 images
});

export const onboardCookRouter = Router();

onboardCookRouter.post(
  '/onboard',
  requireAuth,
  upload.array('kitchen_images', 3),
  async (req: Request, res: Response) => {
    try {
      const cookId = req.uid;

      // Parse and validate JSON body fields
      const parsedBody = OnboardSchema.safeParse(
        typeof req.body === 'string' ? JSON.parse(req.body) : req.body
      );
      if (!parsedBody.success) {
        throw new AppError('VALIDATION_ERROR', parsedBody.error.message, 400);
      }

      const { name, bio, meal_types, cuisine_tags, capacity_default: _capacity_default, address, lat: bodyLat, lng: bodyLng } =
        parsedBody.data;

      // ── Resolve location ────────────────────────────────────────────────────
      let lat: number;
      let lng: number;

      if (address) {
        const coords = await geocodeAddress(address);
        lat = coords.lat;
        lng = coords.lng;
      } else if (bodyLat !== undefined && bodyLng !== undefined) {
        lat = bodyLat;
        lng = bodyLng;
      } else {
        throw new AppError('LOCATION_REQUIRED', 'Provide address or lat/lng coordinates.', 400);
      }

      if (!isWithinIndia(lat, lng)) {
        throw new AppError('INVALID_LOCATION', 'Location must be within India.', 400);
      }

      const geohash = encodeGeohash(lat, lng, CONSTANTS.GEOHASH_PRECISION);
      const approxLat = snapToGrid(lat);
      const approxLng = snapToGrid(lng);

      // ── Upload kitchen images ───────────────────────────────────────────────
      const files = (req.files as Express.Multer.File[]) ?? [];
      const imageUrls: string[] = await Promise.all(
        files.map((file, index) =>
          uploadKitchenImage(cookId, file.buffer, file.mimetype, index)
        )
      );

      // ── Add 'cook' role via Admin SDK ───────────────────────────────────────
      const { auth } = await import('../../config/firebase');
      const userRecord = await auth.getUser(cookId);
      const existingRoles = (userRecord.customClaims?.['roles'] as string[]) ?? [];
      if (!existingRoles.includes('cook')) {
        await auth.setCustomUserClaims(cookId, {
          roles: [...existingRoles, 'cook'],
        });
      }

      // Also update roles in users collection
      await db.collection(COLLECTIONS.USERS).doc(cookId).update({
        roles: FieldValue.arrayUnion('cook'),
      });

      // ── Create cook profile ─────────────────────────────────────────────────
      const cookProfile: CookProfile = {
        cook_id: cookId,
        name,
        bio,
        meal_types,
        cuisine_tags,
        home_location: {
          lat,
          lng,
          geohash,
          approx_lat: approxLat,
          approx_lng: approxLng,
        },
        kitchen_images: imageUrls,
        trust_score: CONSTANTS.TRUST_SCORE_BASELINE,
        rating_avg: 0,
        rating_count: 0,
        badge: 'new',
        is_active: true,
        is_verified: true, // Semi-auto for MVP
        availability_status: 'active',
        has_available_slots: false,
        total_orders: 0,
        completed_orders: 0,
        missed_requests_count: 0,
        repeat_user_rate: 0,
        response_time_avg_sec: 0,
        earnings_total: 0,
        pending_commission: 0,
        created_at: Timestamp.now(),
        updated_at: Timestamp.now(),
      };

      await db.collection(COLLECTIONS.COOK_PROFILES).doc(cookId).set(cookProfile);

      res.status(201).json({
        cook_id: cookId,
        message: 'Cook onboarded successfully.',
      });
    } catch (err) {
      handleError(err, res);
    }
  }
);
