// functions/cook/updateAvailability.ts
// PUT /cook/availability — toggle cook availability mode.

import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, requireRole } from '../../middleware/auth.middleware';
import { validateBody } from '../../utils/validate.utils';
import { handleError } from '../../utils/error.utils';
import { updateCookAvailability } from '../../services/availability.service';

const AvailabilitySchema = z.object({
  mode: z.enum(['active', 'unavailable_today', 'custom_off']),
  from_date: z.string().optional(),
  to_date: z.string().optional(),
});

export const updateAvailabilityRouter = Router();

updateAvailabilityRouter.put(
  '/availability',
  requireAuth,
  requireRole('cook'),
  validateBody(AvailabilitySchema),
  async (req, res) => {
    try {
      const cookId = req.uid;
      await updateCookAvailability(cookId, req.body);
      res.json({ status: 'updated', mode: req.body.mode });
    } catch (err) {
      handleError(err, res);
    }
  }
);
