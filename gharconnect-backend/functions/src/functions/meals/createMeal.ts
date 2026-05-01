// functions/meals/createMeal.ts — POST /meals
// functions/meals/createSlot.ts — POST /slots

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { v4 as uuid } from 'uuid';
import { requireAuth, requireRole } from '../../middleware/auth.middleware';
import { validateBody } from '../../utils/validate.utils';
import { handleError, AppError } from '../../utils/error.utils';
import { db, Timestamp } from '../../config/firebase';
import { COLLECTIONS } from '../../config/collections';
import { CONSTANTS } from '../../config/constants';
import { refreshCookSlotFlag } from '../../services/capacity.service';
import { Meal } from '../../types/meal.types';
import { TimeSlot } from '../../types/slot.types';

// ─── Create Meal ──────────────────────────────────────────────────────────────
const MealSchema = z.object({
  name: z.string().min(2).max(80),
  description: z.string().max(300).default(''),
  price_inr: z.number().min(CONSTANTS.MEAL_PRICE_MIN_INR).max(CONSTANTS.MEAL_PRICE_MAX_INR),
  dietary_type: z.enum(['veg', 'non_veg', 'vegan', 'jain']),
  cuisine_tag: z.string().min(1),
  spice_level: z.enum(['mild', 'medium', 'spicy']),
  ingredients: z.array(z.string()).default([]),
  allergens: z.array(z.string()).default([]),
  is_festival_special: z.boolean().default(false),
  festival_name: z.string().optional(),
});

export const mealsRouter = Router();

mealsRouter.post('/', requireAuth, requireRole('cook'), validateBody(MealSchema), async (req: Request, res: Response) => {
  try {
    const cookId = req.uid;
    const data = req.body as z.infer<typeof MealSchema>;

    const meal: Meal = {
      meal_id: uuid(),
      cook_id: cookId,
      ...data,
      is_active: true,
      created_at: Timestamp.now(),
      updated_at: Timestamp.now(),
    };

    await db.collection(COLLECTIONS.MEALS).doc(meal.meal_id).set(meal);

    res.status(201).json({ meal_id: meal.meal_id, message: 'Meal created.' });
  } catch (err) {
    handleError(err, res);
  }
});

// ─── Create Slot ──────────────────────────────────────────────────────────────
const SlotSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  start_time: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be HH:MM'),
  end_time: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be HH:MM'),
  max_capacity: z.number().int().min(CONSTANTS.SLOT_MIN_CAPACITY).max(CONSTANTS.SLOT_MAX_CAPACITY),
  is_festival_slot: z.boolean().default(false),
});

export const slotsRouter = Router();

slotsRouter.post('/', requireAuth, requireRole('cook'), validateBody(SlotSchema), async (req: Request, res: Response) => {
  try {
    const cookId = req.uid;
    const { date, start_time, end_time, max_capacity, is_festival_slot } =
      req.body as z.infer<typeof SlotSchema>;

    // Validate date not in the past
    if (date < new Date().toISOString().split('T')[0]) {
      throw new AppError('PAST_DATE', 'Cannot create slots for past dates.', 400);
    }

    const slot_display_time = `${formatTime(start_time)} – ${formatTime(end_time)}`;

    const slot: TimeSlot = {
      slot_id: uuid(),
      cook_id: cookId,
      date,
      start_time,
      end_time,
      slot_display_time,
      max_capacity,
      confirmed_count: 0,
      pending_count: 0,
      is_available: true,
      is_festival_slot,
      created_at: Timestamp.now(),
    };

    await db.collection(COLLECTIONS.TIME_SLOTS).doc(slot.slot_id).set(slot);

    // Update cook's has_available_slots flag
    await refreshCookSlotFlag(cookId);

    res.status(201).json({ slot_id: slot.slot_id, message: 'Slot created.' });
  } catch (err) {
    handleError(err, res);
  }
});

function formatTime(time: string): string {
  const [hourStr, minuteStr] = time.split(':');
  const hour = parseInt(hourStr ?? '0');
  const minute = minuteStr ?? '00';
  const period = hour < 12 ? 'AM' : 'PM';
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${displayHour}:${minute} ${period}`;
}
