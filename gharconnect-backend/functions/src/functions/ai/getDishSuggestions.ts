// functions/ai/getDishSuggestions.ts
// POST /ai/dish-suggestions — rule-based dish suggestion for cooks.

import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, requireRole } from '../../middleware/auth.middleware';
import { validateBody } from '../../utils/validate.utils';
import { handleError } from '../../utils/error.utils';
import { getDishSuggestions } from '../../services/ai.service';
import { CONSTANTS } from '../../config/constants';

const SuggestionsSchema = z.object({
  ingredients: z.array(z.string().min(1)).min(1).max(20),
  slot_time: z.string().regex(/^\d{2}:\d{2}$/),
  capacity: z.number().int().min(CONSTANTS.SLOT_MIN_CAPACITY).max(CONSTANTS.SLOT_MAX_CAPACITY),
});

export const aiRouter = Router();

aiRouter.post(
  '/dish-suggestions',
  requireAuth,
  requireRole('cook'),
  validateBody(SuggestionsSchema),
  async (req, res) => {
    try {
      const { ingredients, slot_time, capacity } = req.body as z.infer<typeof SuggestionsSchema>;
      const suggestions = await getDishSuggestions(req.uid, ingredients, slot_time, capacity);
      res.json({ suggestions, count: suggestions.length });
    } catch (err) {
      handleError(err, res);
    }
  }
);
