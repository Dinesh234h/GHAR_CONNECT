// services/geocoding.service.ts
// Replaced Google Maps with OpenStreetMap (Nominatim) and local distance calculation.

import { getCoordinates } from '../utils/geocode';
import { AppError } from '../utils/error.utils';

/**
 * Convert a typed address string to lat/lng coordinates.
 */
export async function geocodeAddress(
  address: string
): Promise<{ lat: number; lng: number }> {
  try {
    const coords = await getCoordinates(address);
    return { lat: coords.lat, lng: coords.lng };
  } catch (err: any) {
    throw new AppError('GEOCODE_FAILED', `Could not locate address: ${err.message}`, 400);
  }
}

/**
 * Convert lat/lng to a human-readable neighbourhood name.
 * Uses Nominatim reverse geocoding.
 */
export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<string> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
    
    const res = await fetch(url, {
      headers: { "User-Agent": "GharConnectApp/1.0 (contact@gharconnect.demo)" }
    });
    const data = await res.json() as any;

    if (!data || !data.address) return 'Nearby';

    // Try to find sublocality, suburb, or neighborhood
    const area = data.address.suburb || data.address.neighbourhood || data.address.residential || data.address.city_district || 'Nearby';
    const city = data.address.city || data.address.town || '';
    
    return city ? `${area}, ${city}` : area;
  } catch {
    return 'Nearby';
  }
}

/**
 * Local distance calculation (Haversine) as a free alternative to Google Distance Matrix.
 */
export async function getWalkingDistances(
  origin: { lat: number; lng: number },
  destinations: { lat: number; lng: number }[]
): Promise<{ distanceText: string; durationText: string; distanceM: number }[]> {
  const R = 6371e3; // Earth radius in meters
  const WALKING_SPEED_MPS = 1.39; // 5 km/h in m/s

  return destinations.map((dest) => {
    const φ1 = (origin.lat * Math.PI) / 180;
    const φ2 = (dest.lat * Math.PI) / 180;
    const Δφ = ((dest.lat - origin.lat) * Math.PI) / 180;
    const Δλ = ((dest.lng - origin.lng) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distanceM = Math.round(R * c);
    const durationSec = Math.round(distanceM / WALKING_SPEED_MPS);

    const distText = distanceM < 1000 ? `${distanceM}m` : `${(distanceM / 1000).toFixed(1)}km`;
    const durText = `${Math.round(durationSec / 60)} mins`;

    return {
      distanceText: distText,
      durationText: durText,
      distanceM,
    };
  });
}

/**
 * Static Maps URL - Removed Google dependency.
 * Returns empty string or a placeholder if no free static map provider is configured.
 */
export function buildStaticMapUrl(
  _approxLat: number,
  _approxLng: number
): string {
  // Post-Google cleanup: returning empty string. 
  // Frontend should handle missing map preview gracefully.
  return '';
}
