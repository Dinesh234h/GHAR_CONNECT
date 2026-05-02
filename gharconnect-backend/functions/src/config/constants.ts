// config/constants.ts
// All magic numbers and configuration constants live here. Never use literals elsewhere.

export const CONSTANTS = {
  // ─── Order lifecycle ───────────────────────────────────────────
  ORDER_TTL_SECONDS: 180,               // 3 min for cook to respond
  SMS_FALLBACK_DELAY_SECONDS: 60,       // send SMS if no push open in 60s
  PICKUP_REMINDER_MINUTES_BEFORE: 15,   // remind user 15min before slot
  RATING_PROMPT_MINUTES_AFTER: 30,      // prompt rating 30min after pickup

  // ─── Rating system ─────────────────────────────────────────────
  RATING_LOCK_HOURS: 24,
  RATING_MAX_EDITS: 1,
  RATING_MIN_OVERALL: 1,
  RATING_MAX_OVERALL: 5,

  // ─── Trust score ───────────────────────────────────────────────
  TRUST_SCORE_BASELINE: 60,
  TRUST_SCORE_SMOOTHING_ORDERS: 10,
  TRUST_WEIGHT_RATING: 0.40,
  TRUST_WEIGHT_COMPLETION: 0.25,
  TRUST_WEIGHT_RESPONSE: 0.15,
  TRUST_WEIGHT_REPEAT: 0.15,
  TRUST_PENALTY_CANCELLATION: 0.10,
  TRUST_BADGE_TRUSTED_THRESHOLD: 50,
  TRUST_BADGE_TOP_THRESHOLD: 80,

  // ─── Geolocation & matching ────────────────────────────────────
  GEOHASH_PRECISION: 6,
  MATCHING_RADIUS_INITIAL_M: 1000,
  MATCHING_RADIUS_EXPAND_M: 2000,
  MATCHING_RADIUS_MAX_M: 3000,
  MATCHING_MIN_RESULTS: 3,
  MATCHING_RETURN_LIMIT: 10,
  APPROX_LOCATION_GRID: 0.001,          // ~100m privacy snap

  // ─── Rule-based recommendation weights ────────────────────────
  REC_WEIGHT_PREFERENCE: 0.35,
  REC_WEIGHT_DISTANCE: 0.30,
  REC_WEIGHT_TRUST: 0.30,
  REC_WEIGHT_FESTIVAL: 0.05,

  // ─── Cook availability & capacity ─────────────────────────────
  COOK_PAUSE_AFTER_MISSED_REQUESTS: 3,
  SLOT_MAX_CAPACITY: 20,
  SLOT_MIN_CAPACITY: 1,
  SMS_RATE_LIMIT_PER_HOUR: 3,

  // ─── AI / Recommendation suggestion engine ────────────────────
  AI_WEIGHT_PREFERENCE: 0.35,
  AI_WEIGHT_HISTORY: 0.40,
  AI_WEIGHT_REALTIME: 0.25,
  AI_MAX_SUGGESTIONS: 3,
  AI_HISTORY_DAYS: 7,

  // ─── Festival system ──────────────────────────────────────────
  FESTIVAL_NOTIFY_DAYS_AHEAD: 2,
  FESTIVAL_CAPACITY_BOOST_DEFAULT: 3,

  // ─── Voice messages ───────────────────────────────────────────
  VOICE_MESSAGE_EXPIRY_HOURS: 48,
  VOICE_MESSAGE_MAX_DURATION_SEC: 60,
  AGORA_TOKEN_EXPIRY_SECONDS: 3600,

  // ─── Business model ───────────────────────────────────────────
  COMMISSION_RATE: 0.08,                // 8% platform fee
  MEAL_PRICE_MIN_INR: 40,
  MEAL_PRICE_MAX_INR: 200,

  // ─── External API placeholders ───────────────────────────────
  EXCHANGE_RATE_PLACEHOLDER: true,      // Post-MVP: currency logic

} as const;
