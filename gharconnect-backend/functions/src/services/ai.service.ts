// services/ai.service.ts
// Rule-based dish suggestion engine.
// Scores candidate dishes by preference match, historical demand, and realtime signals.

import { db } from '../config/firebase';
import { COLLECTIONS } from '../config/collections';
import { CONSTANTS } from '../config/constants';

interface DishSuggestion {
  dish_name: string;
  score: number;
  demand_badge: 'high_demand' | 'trending' | 'seasonal' | 'steady';
  suggested_quantity: number;
  price_range: { min: number; max: number };
  reason: string;
}

// Ingredient → dish mapping (expandable knowledge base)
const INGREDIENT_DISH_MAP: Record<string, string[]> = {
  rice:        ['Sambar Rice', 'Curd Rice', 'Fried Rice', 'Biryani', 'Pongal'],
  dal:         ['Dal Tadka', 'Dal Makhani', 'Sambar', 'Panchmel Dal'],
  potato:      ['Aloo Paratha', 'Aloo Sabzi', 'Vada Pav', 'Aloo Gobi'],
  chicken:     ['Butter Chicken', 'Chicken Biryani', 'Chicken Curry', 'Grilled Chicken'],
  paneer:      ['Paneer Butter Masala', 'Paneer Paratha', 'Shahi Paneer', 'Paneer Tikka'],
  ragi:        ['Ragi Mudde', 'Ragi Dosa', 'Ragi Roti', 'Ragi Ladoo'],
  wheat:       ['Chapati', 'Paratha', 'Puri', 'Roti'],
  yogurt:      ['Curd Rice', 'Raita', 'Kadhi', 'Lassi'],
  coconut:     ['Coconut Chutney', 'Stew', 'Payasam', 'Avial'],
  egg:         ['Egg Curry', 'Egg Fried Rice', 'Omelette', 'Egg Bhurji'],
  banana:      ['Banana Chips', 'Payasam', 'Unniyappam'],
  maida:       ['Puri', 'Naan', 'Bhatura', 'Samosa'],
};

/**
 * Get dish suggestions for a cook based on available ingredients.
 * Returns top AI_MAX_SUGGESTIONS scored suggestions.
 */
export async function getDishSuggestions(
  cookId: string,
  ingredients: string[],
  slotTime: string,
  capacity: number
): Promise<DishSuggestion[]> {
  // ── Candidate generation ─────────────────────────────────────────────────
  const candidateSet = new Set<string>();
  const normalizedIngredients = ingredients.map((i) => i.toLowerCase().trim());

  for (const ingredient of normalizedIngredients) {
    const dishes = INGREDIENT_DISH_MAP[ingredient] ?? [];
    dishes.forEach((d) => candidateSet.add(d));
  }

  if (candidateSet.size === 0) {
    return []; // No recognisable ingredients
  }

  // ── Fetch cook's historical orders for demand scoring ────────────────────
  const historyDays = CONSTANTS.AI_HISTORY_DAYS;
  const historyFrom = new Date(Date.now() - historyDays * 24 * 3600 * 1000);

  const historySnap = await db
    .collection(COLLECTIONS.ORDERS)
    .where('cook_id', '==', cookId)
    .where('status', '==', 'completed')
    .where('created_at', '>=', historyFrom)
    .get();

  // Build demand map: meal_name → count
  const demandMap: Record<string, number> = {};
  historySnap.docs.forEach((d) => {
    const mealName = d.data()['meal_name'] as string;
    demandMap[mealName] = (demandMap[mealName] ?? 0) + 1;
  });

  const maxDemand = Math.max(1, ...Object.values(demandMap));

  // ── Slot time signals ─────────────────────────────────────────────────────
  const hour = parseInt(slotTime.split(':')[0] ?? '12');
  const isBreakfast = hour < 10;
  const isLunch = hour >= 11 && hour < 15;
  const isDinner = hour >= 18;

  // ── Score each candidate ──────────────────────────────────────────────────
  const scored: DishSuggestion[] = Array.from(candidateSet).map((dish) => {
    // Preference match: how many of the cook's ingredients it uses
    const prefScore = ingredients.filter((ing) => {
      const candidates = INGREDIENT_DISH_MAP[ing.toLowerCase()] ?? [];
      return candidates.includes(dish);
    }).length / Math.max(1, ingredients.length);

    // Historical demand
    const histScore = (demandMap[dish] ?? 0) / maxDemand;

    // Realtime slot signal
    let realtimeScore = 0.5; // neutral
    if (isBreakfast && ['Ragi Mudde', 'Ragi Dosa', 'Idli', 'Dosa', 'Upma', 'Omelette'].some(d => dish.includes(d.split(' ')[0]))) realtimeScore = 0.9;
    if (isLunch && ['Rice', 'Biryani', 'Dal', 'Sambar', 'Curry', 'Chapati'].some(d => dish.includes(d.split(' ')[0]))) realtimeScore = 0.9;
    if (isDinner && ['Paratha', 'Roti', 'Biryani', 'Curry', 'Paneer'].some(d => dish.includes(d.split(' ')[0]))) realtimeScore = 0.9;

    const composite =
      CONSTANTS.AI_WEIGHT_PREFERENCE * prefScore +
      CONSTANTS.AI_WEIGHT_HISTORY * histScore +
      CONSTANTS.AI_WEIGHT_REALTIME * realtimeScore;

    const demandBadge = computeDemandBadge(histScore);
    const suggestedQty = Math.max(
      CONSTANTS.SLOT_MIN_CAPACITY,
      Math.min(capacity, Math.round(capacity * (0.6 + histScore * 0.4)))
    );

    return {
      dish_name: dish,
      score: Number(composite.toFixed(4)),
      demand_badge: demandBadge,
      suggested_quantity: suggestedQty,
      price_range: { min: 60, max: 150 }, // TODO: compute from area avg
      reason: buildReason(prefScore, histScore, realtimeScore, slotTime),
    };
  });

  // Return top N sorted by score
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, CONSTANTS.AI_MAX_SUGGESTIONS);
}

function computeDemandBadge(histScore: number): DishSuggestion['demand_badge'] {
  if (histScore >= 0.8) return 'high_demand';
  if (histScore >= 0.5) return 'trending';
  if (histScore >= 0.2) return 'steady';
  return 'seasonal';
}

function buildReason(
  prefScore: number,
  histScore: number,
  realtimeScore: number,
  slotTime: string
): string {
  const parts: string[] = [];
  if (prefScore >= 0.7) parts.push('matches your ingredients well');
  if (histScore >= 0.5) parts.push('popular with your past customers');
  if (realtimeScore >= 0.8) parts.push(`great choice for ${slotTime} slot`);
  return parts.length ? parts.join(' · ') : 'Recommended based on your profile';
}
