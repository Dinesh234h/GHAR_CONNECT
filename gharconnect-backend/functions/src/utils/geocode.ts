// utils/geocode.ts
// OpenStreetMap (Nominatim) implementation for geocoding.
// Robust implementation with proper error handling and rate-limiting.

/**
 * sleep — basic delay utility for rate limiting.
 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Simple in-memory tracker to ensure global 1s delay across concurrent calls
let lastGeocodeRequestTime = 0;

/**
 * getCoordinates — Convert address string to lat/lng using Nominatim.
 */
export const getCoordinates = async (address: string) => {
  try {
    // 1. Rate limit safety: Nominatim allows max 1 req/sec globally per app instance
    const now = Date.now();
    const timeSinceLast = now - lastGeocodeRequestTime;
    if (timeSinceLast < 1000) {
      await sleep(1000 - timeSinceLast);
    }
    lastGeocodeRequestTime = Date.now();

    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`;

    const response = await fetch(url, {
      headers: {
        "User-Agent": "GharConnectApp/1.0 (contact@gharconnect.demo)",
        "Accept": "application/json"
      }
    });

    const bodyText = await response.text();

    if (!response.ok) {
      if (response.status === 403 || response.status === 429) {
        throw new Error("Nominatim blocked: Too many requests or missing User-Agent.");
      }
      throw new Error(`Nominatim API returned status ${response.status}: ${bodyText.slice(0, 100)}`);
    }

    // Basic validation before parsing
    if (!bodyText.trim().startsWith('[') && !bodyText.trim().startsWith('{')) {
       throw new Error(`Invalid response from Nominatim: ${bodyText.slice(0, 100)}`);
    }

    const data = JSON.parse(bodyText) as any[];

    if (!data || data.length === 0) {
      throw new Error("Address not found");
    }

    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
      displayName: data[0].display_name
    };

  } catch (error: any) {
    console.error("[Geocode Error]:", error.message);
    throw error;
  }
};
