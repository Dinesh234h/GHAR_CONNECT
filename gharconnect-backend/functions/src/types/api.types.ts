// types/api.types.ts
// External API response shapes.

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

