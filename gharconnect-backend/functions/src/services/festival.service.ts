// services/festival.service.ts
// Festival alert system: Open Holidays API (primary) + hardcoded fallback.

import { db } from '../config/firebase';
import { COLLECTIONS } from '../config/collections';
import { Festival, FestivalDishData } from '../types/festival.types';
import { OpenHolidayEntry } from '../types/api.types';

// ─── Festival → Dish Map ──────────────────────────────────────────────────────
export const FESTIVAL_DISH_MAP: Record<string, FestivalDishData> = {
  'Diwali':             { dishes: ['Chakli', 'Ladoo', 'Mixture'],       regions: ['all'],     boost: '+5 plates' },
  'Ganesh Chaturthi':   { dishes: ['Modak', 'Puran Poli', 'Karanji'],  regions: ['KA', 'MH'], boost: '+3 plates' },
  'Onam':               { dishes: ['Sadya', 'Payasam', 'Avial'],        regions: ['KL'],       boost: '+4 plates' },
  'Pongal':             { dishes: ['Pongal', 'Sakkarai Pongal'],         regions: ['TN', 'AP'], boost: '+3 plates' },
  'Holi':               { dishes: ['Gujiya', 'Thandai', 'Malpua'],      regions: ['all'],      boost: '+3 plates' },
  'Eid ul-Fitr':        { dishes: ['Biryani', 'Seviyan', 'Haleem'],     regions: ['all'],      boost: '+5 plates' },
  'Navratri':           { dishes: ['Sabudana Khichdi', 'Kuttu Puri'],   regions: ['all'],      boost: '+3 plates' },
  'Ugadi':              { dishes: ['Ugadi Pachadi', 'Pulihora'],         regions: ['KA', 'AP'], boost: '+2 plates' },
  'Christmas':          { dishes: ['Plum Cake', 'Rose Cookies'],         regions: ['all'],      boost: '+2 plates' },
  'Baisakhi':           { dishes: ['Makki Roti', 'Sarson Saag'],         regions: ['all'],      boost: '+3 plates' },
};

// Hardcoded fallback dates (covers failure of Open Holidays API)
const HARDCODED_FESTIVAL_DATES: { name: string; date: string }[] = [
  { name: 'Diwali',           date: '2025-10-20' },
  { name: 'Holi',             date: '2025-03-14' },
  { name: 'Eid ul-Fitr',      date: '2025-03-30' },
  { name: 'Christmas',        date: '2025-12-25' },
  { name: 'Ganesh Chaturthi', date: '2025-08-27' },
  { name: 'Onam',             date: '2025-09-05' },
  { name: 'Pongal',           date: '2025-01-14' },
  { name: 'Navratri',         date: '2025-10-02' },
  { name: 'Ugadi',            date: '2025-03-30' },
  { name: 'Baisakhi',         date: '2025-04-13' },
];

// ─── Fetch Festival Dates from Open Holidays API ──────────────────────────────
export async function fetchFestivalDatesFromAPI(): Promise<{ name: string; date: string }[]> {
  try {
    const fromDate = new Date().toISOString().split('T')[0];
    const toDate = new Date(Date.now() + 90 * 24 * 3600 * 1000).toISOString().split('T')[0];

    const url =
      `https://openholidaysapi.org/PublicHolidays` +
      `?countryIsoCode=IN&languageIsoCode=EN` +
      `&validFrom=${fromDate}&validTo=${toDate}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`OpenHolidays API status: ${res.status}`);

    const data = (await res.json()) as OpenHolidayEntry[];

    return data.map((h) => ({
      name: h.name.find((n) => n.language === 'EN')?.text ?? h.name[0]?.text ?? '',
      date: h.startDate,
    }));
  } catch (err) {
    console.warn('[festival] Open Holidays API failed, using hardcoded fallback:', err);
    return HARDCODED_FESTIVAL_DATES;
  }
}

// ─── Store / Upsert Festival ──────────────────────────────────────────────────
export async function upsertFestival(name: string, date: string): Promise<Festival | null> {
  const data = FESTIVAL_DISH_MAP[name];
  if (!data) return null;

  const festivalId = `${name.replace(/\s+/g, '_').toLowerCase()}_${date}`;
  const festivalRef = db.collection(COLLECTIONS.FESTIVALS).doc(festivalId);
  const existing = await festivalRef.get();
  if (existing.exists) return existing.data() as Festival;

  const festival: Festival = {
    festival_id: festivalId,
    name,
    date,
    regions: data.regions,
    suggested_dishes: data.dishes,
    capacity_boost: data.boost,
  };

  await festivalRef.set(festival);
  return festival;
}

// ─── Check if cook already responded to festival ──────────────────────────────
export async function checkFestivalResponseExists(
  cookId: string,
  festivalId: string
): Promise<boolean> {
  const snap = await db
    .collection(COLLECTIONS.COOK_FESTIVAL_RESPONSES)
    .where('cook_id', '==', cookId)
    .where('festival_id', '==', festivalId)
    .limit(1)
    .get();
  return !snap.empty;
}

// ─── Days between two dates ───────────────────────────────────────────────────
export function daysBetween(from: Date, to: Date): number {
  return Math.abs(Math.floor((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)));
}

// ─── Get active cooks filtered by region ─────────────────────────────────────
export async function getActiveCooksByRegion(
  regions: string[]
): Promise<{ cook_id: string; fcm_token?: string; region_code: string }[]> {
  let query = db
    .collection(COLLECTIONS.COOK_PROFILES)
    .where('is_active', '==', true)
    .where('availability_status', '==', 'active');

  const snap = await query.get();

  return snap.docs
    .map((d) => ({
      cook_id: d.data()['cook_id'] as string,
      fcm_token: d.data()['fcm_token'] as string | undefined,
      region_code: d.data()['region_code'] as string ?? 'KA',
    }))
    .filter((c) => {
      if (regions.includes('all')) return true;
      return regions.includes(c.region_code);
    });
}

// ─── Get users filtered by region ────────────────────────────────────────────
export async function getUsersByRegion(
  regions: string[]
): Promise<{ uid: string; fcm_token?: string }[]> {
  const snap = await db.collection(COLLECTIONS.USERS).get();

  return snap.docs
    .map((d) => ({
      uid: d.id,
      fcm_token: d.data()['fcm_token'] as string | undefined,
      region_code: d.data()['region_code'] as string ?? 'KA',
    }))
    .filter((u) => {
      if (regions.includes('all')) return true;
      return regions.includes((u as { region_code: string }).region_code);
    });
}
