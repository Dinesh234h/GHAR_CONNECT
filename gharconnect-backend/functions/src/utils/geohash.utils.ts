// utils/geohash.utils.ts
// Local geohash operations using ngeohash npm package (no API cost).

import ngeohash from 'ngeohash';
import { CONSTANTS } from '../config/constants';

/**
 * Encode lat/lng to a geohash string.
 */
export function encodeGeohash(
  lat: number,
  lng: number,
  precision: number = CONSTANTS.GEOHASH_PRECISION
): string {
  return ngeohash.encode(lat, lng, precision);
}

/**
 * Return the center cell + 8 neighbouring geohash cells for querying.
 * Using 9 cells prevents missing cooks near cell boundaries.
 */
export function getSearchCells(
  lat: number,
  lng: number,
  precision: number = CONSTANTS.GEOHASH_PRECISION
): string[] {
  const center = ngeohash.encode(lat, lng, precision);
  const neighbours = ngeohash.neighbors(center);
  return [center, ...Object.values(neighbours)]; // 9 cells total
}

/**
 * Snap a coordinate to a coarse grid (~100m) to protect cook privacy.
 * The cook's exact location is never returned to users.
 */
export function snapToGrid(
  coord: number,
  precision: number = CONSTANTS.APPROX_LOCATION_GRID
): number {
  return Math.round(coord / precision) * precision;
}
