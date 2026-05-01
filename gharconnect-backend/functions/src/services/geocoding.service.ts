// services/geocoding.service.ts
// Google Maps Platform integrations:
// - Geocoding API (address → lat/lng)
// - Reverse Geocoding API (lat/lng → neighbourhood name)
// - Distance Matrix API (batch walking times)
// - Static Maps API (pickup location image URL)

import { CONSTANTS } from '../config/constants';
import { AppError } from '../utils/error.utils';
import {
  GoogleGeocodingResponse,
  GoogleDistanceMatrixResponse,
} from '../types/api.types';

const BASE = CONSTANTS.GOOGLE_MAPS_BASE_URL;

function mapsKey(): string {
  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key) throw new AppError('MISSING_CONFIG', 'GOOGLE_MAPS_API_KEY not set', 500);
  return key;
}

// ─── 1A. Geocoding ────────────────────────────────────────────────────────────
/**
 * Convert a typed address string to lat/lng coordinates.
 * Used in cook onboarding when cook types address instead of GPS.
 */
export async function geocodeAddress(
  address: string
): Promise<{ lat: number; lng: number }> {
  const url =
    `${BASE}/geocode/json` +
    `?address=${encodeURIComponent(address)}` +
    `&key=${mapsKey()}` +
    `&region=IN`;

  const res = await fetch(url);
  const data = (await res.json()) as GoogleGeocodingResponse;

  if (data.status !== 'OK' || !data.results.length) {
    throw new AppError('GEOCODE_FAILED', `Could not locate address: ${data.status}`, 400);
  }

  return data.results[0].geometry.location; // { lat, lng }
}

// ─── 1B. Reverse Geocoding ───────────────────────────────────────────────────
/**
 * Convert lat/lng to a human-readable neighbourhood name.
 * Shown on cook cards: "Indiranagar, Bengaluru"
 */
export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<string> {
  try {
    const url =
      `${BASE}/geocode/json` +
      `?latlng=${lat},${lng}` +
      `&key=${mapsKey()}` +
      `&result_type=sublocality|locality` +
      `&language=en`;

    const res = await fetch(url);
    const data = (await res.json()) as GoogleGeocodingResponse;

    if (data.status !== 'OK' || !data.results.length) return 'Nearby';

    // Extract sublocality or locality from address_components
    const result = data.results[0];
    const sublocality = result.address_components.find((c) =>
      c.types.includes('sublocality_level_1')
    );
    const locality = result.address_components.find((c) =>
      c.types.includes('locality')
    );

    const area = sublocality?.long_name ?? locality?.long_name ?? 'Nearby';
    const city = locality?.long_name ?? '';
    return sublocality ? `${area}, ${city}` : area;
  } catch {
    return 'Nearby'; // graceful fallback — never fail cook listing for this
  }
}

// ─── 1C. Distance Matrix (batch walking times) ───────────────────────────────
/**
 * Get walking distance and time from one origin to multiple destinations.
 * Batched at GOOGLE_MAPS_DISTANCE_BATCH_MAX destinations per call.
 */
export async function getWalkingDistances(
  origin: { lat: number; lng: number },
  destinations: { lat: number; lng: number }[]
): Promise<{ distanceText: string; durationText: string; distanceM: number }[]> {
  if (destinations.length === 0) return [];

  try {
    const destStr = destinations.map((d) => `${d.lat},${d.lng}`).join('|');
    const url =
      `${BASE}/distancematrix/json` +
      `?origins=${origin.lat},${origin.lng}` +
      `&destinations=${encodeURIComponent(destStr)}` +
      `&mode=walking` +
      `&key=${mapsKey()}`;

    const res = await fetch(url);
    const data = (await res.json()) as GoogleDistanceMatrixResponse;

    if (data.status !== 'OK') {
      throw new Error(`Distance Matrix status: ${data.status}`);
    }

    return data.rows[0].elements.map((el) => ({
      distanceText: el.distance?.text ?? 'Unknown',
      durationText: el.duration?.text ?? 'Unknown',
      distanceM: el.distance?.value ?? 999999,
    }));
  } catch (err) {
    console.error('Distance Matrix API error:', err);
    // Fallback: return placeholder strings for all destinations
    return destinations.map(() => ({
      distanceText: 'N/A',
      durationText: 'N/A',
      distanceM: 999999,
    }));
  }
}

// ─── 1D. Static Maps URL ─────────────────────────────────────────────────────
/**
 * Build a Google Static Maps URL showing the cook's approximate pickup location.
 * Returned in POST /orders/place response — Flutter renders as an image widget.
 */
export function buildStaticMapUrl(
  approxLat: number,
  approxLng: number
): string {
  const params = new URLSearchParams({
    center: `${approxLat},${approxLng}`,
    zoom: String(CONSTANTS.GOOGLE_STATIC_MAP_ZOOM),
    size: CONSTANTS.GOOGLE_STATIC_MAP_SIZE,
    markers: `color:orange|${approxLat},${approxLng}`,
    key: process.env.GOOGLE_MAPS_API_KEY ?? '',
  });
  return `${BASE}/staticmap?${params.toString()}`;
}
