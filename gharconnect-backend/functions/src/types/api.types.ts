// types/api.types.ts
// External API response shapes — typed to avoid any usage.

/** Google Maps Geocoding API response */
export interface GoogleGeocodingResponse {
  status: 'OK' | 'ZERO_RESULTS' | 'INVALID_REQUEST' | 'REQUEST_DENIED' | 'OVER_QUERY_LIMIT';
  results: GoogleGeocodingResult[];
}

export interface GoogleGeocodingResult {
  geometry: {
    location: { lat: number; lng: number };
  };
  formatted_address: string;
  address_components: AddressComponent[];
}

export interface AddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}

/** Google Distance Matrix API response */
export interface GoogleDistanceMatrixResponse {
  status: 'OK' | 'INVALID_REQUEST' | 'MAX_ELEMENTS_EXCEEDED' | 'REQUEST_DENIED';
  rows: DistanceMatrixRow[];
}

export interface DistanceMatrixRow {
  elements: DistanceMatrixElement[];
}

export interface DistanceMatrixElement {
  status: 'OK' | 'NOT_FOUND' | 'ZERO_RESULTS';
  distance?: { text: string; value: number };
  duration?: { text: string; value: number };
}

/** Open Holidays API response */
export interface OpenHolidayEntry {
  id: string;
  startDate: string;
  endDate: string;
  type: string;
  name: { language: string; text: string }[];
  nationwide: boolean;
  subdivisions?: { code: string }[];
}

/** ipapi.co response */
export interface IpapiResponse {
  ip: string;
  city: string;
  region: string;
  region_code: string;
  country_code: string;
  latitude: number;
  longitude: number;
}
