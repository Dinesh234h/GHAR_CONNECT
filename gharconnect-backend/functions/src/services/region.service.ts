// services/region.service.ts
// IP-based region detection via ipapi.co (free tier: 1000 req/day).

import { IpapiResponse } from '../types/api.types';

const DEFAULT_REGION = 'KA'; // Karnataka — default for GharConnect

/**
 * Detect user's Indian state code from their IP address.
 * Used for festival relevance filtering (e.g. Onam → KL only).
 */
export async function detectRegionFromIP(ip: string): Promise<string> {
  // Don't call API for local/private IPs
  if (!ip || ip === '::1' || ip.startsWith('127.') || ip.startsWith('192.168.')) {
    return DEFAULT_REGION;
  }

  try {
    const res = await fetch(`https://ipapi.co/${ip}/json/`);
    if (!res.ok) return DEFAULT_REGION;

    const data = (await res.json()) as IpapiResponse;

    // Only trust Indian IPs
    if (data.country_code !== 'IN') return DEFAULT_REGION;

    return data.region_code ?? DEFAULT_REGION;
  } catch (err) {
    console.warn('[region] IP detection failed, using default:', err);
    return DEFAULT_REGION; // Safe fallback — never fail user-facing requests
  }
}

/**
 * Extract client IP from an Express request, handling proxy headers.
 */
export function getClientIP(req: import('express').Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0]?.trim() ?? req.ip ?? '';
  }
  return req.ip ?? '';
}
