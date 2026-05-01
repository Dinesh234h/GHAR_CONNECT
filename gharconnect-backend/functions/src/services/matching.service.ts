// services/matching.service.ts
// Rule-based recommendation engine:
// Geohash query → Haversine filter → Preference scoring → Distance Matrix → Ranked results

import { db } from '../config/firebase';
import { COLLECTIONS } from '../config/collections';
import { CONSTANTS } from '../config/constants';
import { getSearchCells } from '../utils/geohash.utils';
import { haversineMeters } from '../utils/haversine.utils';
import { getWalkingDistances, reverseGeocode, buildStaticMapUrl } from './geocoding.service';
import { CookProfile, CookCardResult } from '../types/cook.types';
import { UserPreferences } from '../types/user.types';
import { MealSummary } from '../types/meal.types';
import { SlotSummary } from '../types/slot.types';

interface MatchInput {
  userLat: number;
  userLng: number;
  date?: string;
  slotTime?: string;
  preferences: UserPreferences;
  region: string;
}

/**
 * Core matching pipeline.
 * Returns top 10 ranked cook cards ready for Flutter display.
 */
export async function getNearbyCooks(input: MatchInput): Promise<CookCardResult[]> {
  const { userLat, userLng, date, slotTime: _slotTime, preferences, region: _region } = input;
  const today = date ?? new Date().toISOString().split('T')[0];

  // ── Step 1: Geohash query — fetch candidates from 9 cells ─────────────────
  let candidates = await queryCooksByGeohash(userLat, userLng);

  // ── Step 2: Radius filter with dynamic expansion ──────────────────────────
  let filtered = candidates.filter(
    (c) =>
      haversineMeters(userLat, userLng, c.home_location.lat, c.home_location.lng) <=
      CONSTANTS.MATCHING_RADIUS_INITIAL_M
  );

  if (filtered.length < CONSTANTS.MATCHING_MIN_RESULTS) {
    // Expand to 2km
    filtered = candidates.filter(
      (c) =>
        haversineMeters(userLat, userLng, c.home_location.lat, c.home_location.lng) <=
        CONSTANTS.MATCHING_RADIUS_EXPAND_M
    );
  }

  if (filtered.length < CONSTANTS.MATCHING_MIN_RESULTS) {
    // Expand to max 3km
    filtered = candidates.filter(
      (c) =>
        haversineMeters(userLat, userLng, c.home_location.lat, c.home_location.lng) <=
        CONSTANTS.MATCHING_RADIUS_MAX_M
    );
  }

  if (filtered.length === 0) return [];

  // ── Step 3: Batch walking distance from Google Distance Matrix ────────────
  const destinations = filtered.map((c) => ({
    lat: c.home_location.approx_lat,
    lng: c.home_location.approx_lng,
  }));

  // Batch in chunks of GOOGLE_MAPS_DISTANCE_BATCH_MAX (25)
  const chunkSize = CONSTANTS.GOOGLE_MAPS_DISTANCE_BATCH_MAX;
  const walkingResults: { distanceText: string; durationText: string; distanceM: number }[] = [];
  for (let i = 0; i < destinations.length; i += chunkSize) {
    const chunk = destinations.slice(i, i + chunkSize);
    const res = await getWalkingDistances({ lat: userLat, lng: userLng }, chunk);
    walkingResults.push(...res);
  }

  // ── Step 4: Fetch meals + slots for each cook ─────────────────────────────
  const cookIds = filtered.map((c) => c.cook_id);
  const [mealsMap, slotsMap] = await Promise.all([
    fetchMealsByCookIds(cookIds),
    fetchSlotsByCookIds(cookIds, today),
  ]);

  // ── Step 5: Score and rank (rule-based recommendation) ───────────────────
  const scored: (CookCardResult & { _distanceM: number })[] = filtered.map((cook, i) => {
    const walking = walkingResults[i];
    const distanceM = walking.distanceM;
    const meals = mealsMap[cook.cook_id] ?? [];
    const slots = slotsMap[cook.cook_id] ?? [];
    const hasFestivalSpecial = meals.some((m) => m.is_festival_special);

    const prefScore = computePreferenceScore(cook, meals, preferences);
    const distScore = computeDistanceScore(distanceM);
    const trustScore = cook.trust_score / 100;
    const festivalBonus = hasFestivalSpecial ? CONSTANTS.REC_WEIGHT_FESTIVAL : 0;

    const composite =
      CONSTANTS.REC_WEIGHT_PREFERENCE * prefScore +
      CONSTANTS.REC_WEIGHT_DISTANCE * distScore +
      CONSTANTS.REC_WEIGHT_TRUST * trustScore +
      festivalBonus;

    return {
      cook_id: cook.cook_id,
      name: cook.name,
      bio: cook.bio,
      rating_avg: cook.rating_avg,
      rating_count: cook.rating_count,
      trust_score: cook.trust_score,
      badge: cook.badge,
      cuisine_tags: cook.cuisine_tags,
      meal_types: cook.meal_types,
      distance_m: distanceM,
      distance_text: walking.distanceText,
      walking_time: walking.durationText,
      neighbourhood: cook.home_location.neighbourhood ?? 'Nearby',
      kitchen_images: cook.kitchen_images,
      has_festival_special: hasFestivalSpecial,
      score: Number(composite.toFixed(4)),
      map_pin_color: pinColor(cook.badge),
      meals,
      slots,
      _distanceM: distanceM,
    };
  });

  // Sort by composite score DESC
  scored.sort((a, b) => b.score - a.score);

  // ── Step 6: Reverse geocode top 10 neighbourhood names ───────────────────
  const top = scored.slice(0, CONSTANTS.MATCHING_RETURN_LIMIT);
  await Promise.all(
    top.map(async (c) => {
      if (c.neighbourhood === 'Nearby') {
        const cook = filtered.find((f) => f.cook_id === c.cook_id);
        if (cook) {
          c.neighbourhood = await reverseGeocode(
            cook.home_location.approx_lat,
            cook.home_location.approx_lng
          );
        }
      }
    })
  );

  // Strip internal _distanceM field before returning
  return top.map(({ _distanceM: _, ...rest }) => rest);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function queryCooksByGeohash(lat: number, lng: number): Promise<CookProfile[]> {
  const cells = getSearchCells(lat, lng, CONSTANTS.GEOHASH_PRECISION);
  const snap = await db
    .collection(COLLECTIONS.COOK_PROFILES)
    .where('home_location.geohash', 'in', cells)
    .where('is_active', '==', true)
    .where('availability_status', '==', 'active')
    .where('has_available_slots', '==', true)
    .get();

  return snap.docs.map((d) => d.data() as CookProfile);
}

async function fetchMealsByCookIds(
  cookIds: string[]
): Promise<Record<string, MealSummary[]>> {
  if (!cookIds.length) return {};
  const snap = await db
    .collection(COLLECTIONS.MEALS)
    .where('cook_id', 'in', cookIds)
    .where('is_active', '==', true)
    .get();

  const map: Record<string, MealSummary[]> = {};
  snap.docs.forEach((d) => {
    const m = d.data();
    if (!map[m.cook_id]) map[m.cook_id] = [];
    map[m.cook_id].push({
      meal_id: m.meal_id,
      name: m.name,
      price_inr: m.price_inr,
      dietary_type: m.dietary_type,
      cuisine_tag: m.cuisine_tag,
      is_festival_special: m.is_festival_special,
    });
  });
  return map;
}

async function fetchSlotsByCookIds(
  cookIds: string[],
  date: string
): Promise<Record<string, SlotSummary[]>> {
  if (!cookIds.length) return {};
  const snap = await db
    .collection(COLLECTIONS.TIME_SLOTS)
    .where('cook_id', 'in', cookIds)
    .where('date', '==', date)
    .where('is_available', '==', true)
    .get();

  const map: Record<string, SlotSummary[]> = {};
  snap.docs.forEach((d) => {
    const s = d.data();
    if (!map[s.cook_id]) map[s.cook_id] = [];
    map[s.cook_id].push({
      slot_id: s.slot_id,
      date: s.date,
      slot_display_time: s.slot_display_time,
      available_capacity: s.max_capacity - s.confirmed_count - s.pending_count,
    });
  });
  return map;
}

/** 0–1 score: how well this cook's offerings match user preferences */
function computePreferenceScore(
  cook: CookProfile,
  meals: MealSummary[],
  prefs: UserPreferences
): number {
  let score = 0;
  let checks = 0;

  // Dietary match
  if (prefs.dietary.length > 0) {
    const overlap = cook.meal_types.filter((t) => prefs.dietary.includes(t)).length;
    score += overlap / prefs.dietary.length;
    checks++;
  }

  // Cuisine match
  if (prefs.cuisines.length > 0) {
    const overlap = cook.cuisine_tags.filter((t) => prefs.cuisines.includes(t)).length;
    score += overlap / prefs.cuisines.length;
    checks++;
  }

  // Price match — any meal within max_price
  const affordable = meals.some((m) => m.price_inr <= prefs.max_price_inr);
  score += affordable ? 1 : 0;
  checks++;

  return checks > 0 ? score / checks : 0.5;
}

/** Inverse distance score: closer = higher (0–1) */
function computeDistanceScore(distanceM: number): number {
  const max = CONSTANTS.MATCHING_RADIUS_MAX_M;
  return Math.max(0, 1 - distanceM / max);
}

/** Map badge to Flutter map pin color */
function pinColor(badge: string): string {
  switch (badge) {
    case 'top_cook': return 'gold';
    case 'trusted': return 'green';
    default: return 'orange';
  }
}

/**
 * Get alternative cooks for order rejection / timeout notifications.
 */
export async function getAlternativeCooks(
  userLat: number,
  userLng: number,
  excludeCookId: string,
  preferences: UserPreferences,
  region: string
): Promise<CookCardResult[]> {
  const all = await getNearbyCooks({ userLat, userLng, preferences, region });
  return all.filter((c) => c.cook_id !== excludeCookId).slice(0, 3);
}

/**
 * Get static map URL for a cook's pickup location.
 * Used in order confirmation response.
 */
export { buildStaticMapUrl };
