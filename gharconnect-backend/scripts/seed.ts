// scripts/seed.ts
// Seeds the Firebase Emulator with sample data for local development.
// Run: npx ts-node -e "require('./scripts/seed.ts')"
// Or via npm script: npm run seed

import * as admin from 'firebase-admin';

// Initialize for emulator
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';
process.env.FIREBASE_STORAGE_EMULATOR_HOST = 'localhost:9199';

admin.initializeApp({
  projectId: 'demo-gharconnect',
});

const db = admin.firestore();

const COLLECTIONS = {
  USERS: 'users',
  COOK_PROFILES: 'cook_profiles',
  MEALS: 'meals',
  TIME_SLOTS: 'time_slots',
  RATINGS: 'ratings',
};

function now() {
  return admin.firestore.Timestamp.now();
}

async function seed() {
  console.log('🌱 Starting database seeding...');

  // ─── Create Test User ──────────────────────────────────────────────────────
  const userId = 'test-user-001';
  await db.collection(COLLECTIONS.USERS).doc(userId).set({
    uid: userId,
    phone: '9876543210',
    display_name: 'Rahul Test',
    roles: ['user'],
    preferences: {
      dietary: ['veg'],
      cuisines: ['south_indian'],
      spice_level: 'medium',
      max_price_inr: 150,
    },
    cancellation_count: 0,
    region_code: 'KA',
    created_at: now(),
    updated_at: now(),
  });
  console.log('✅ Test user created:', userId);

  // ─── Create Cook 1 ────────────────────────────────────────────────────────
  const cookId1 = 'test-cook-001';
  await db.collection(COLLECTIONS.COOK_PROFILES).doc(cookId1).set({
    cook_id: cookId1,
    name: 'Lakshmi Devi',
    bio: 'Home cook with 15 years of experience. Specializing in authentic South Indian cuisine with fresh ingredients from local markets.',
    meal_types: ['veg'],
    cuisine_tags: ['south_indian', 'tiffin'],
    home_location: {
      lat: 12.9716,
      lng: 77.5946,
      geohash: 'tdr1w',
      approx_lat: 12.97,
      approx_lng: 77.59,
      neighbourhood: 'Koramangala',
    },
    kitchen_images: [],
    trust_score: 92,
    rating_avg: 4.8,
    rating_count: 47,
    badge: 'trusted',
    is_active: true,
    is_verified: true,
    availability_status: 'active',
    has_available_slots: true,
    total_orders: 156,
    completed_orders: 148,
    missed_requests_count: 0,
    repeat_user_rate: 68,
    response_time_avg_sec: 45,
    earnings_total: 12000,
    pending_commission: 0,
    created_at: now(),
    updated_at: now(),
  });
  console.log('✅ Cook 1 created:', cookId1);

  // ─── Create Cook 2 ────────────────────────────────────────────────────────
  const cookId2 = 'test-cook-002';
  await db.collection(COLLECTIONS.COOK_PROFILES).doc(cookId2).set({
    cook_id: cookId2,
    name: 'Geeta Sharma',
    bio: 'North Indian home chef. My rajma chawal is legendary in the neighbourhood!',
    meal_types: ['veg', 'non_veg'],
    cuisine_tags: ['north_indian', 'punjabi'],
    home_location: {
      lat: 12.9784,
      lng: 77.6408,
      geohash: 'tdr1y',
      approx_lat: 12.97,
      approx_lng: 77.64,
      neighbourhood: 'Indiranagar',
    },
    kitchen_images: [],
    trust_score: 98,
    rating_avg: 4.9,
    rating_count: 89,
    badge: 'top_cook',
    is_active: true,
    is_verified: true,
    availability_status: 'active',
    has_available_slots: true,
    total_orders: 243,
    completed_orders: 240,
    missed_requests_count: 0,
    repeat_user_rate: 75,
    response_time_avg_sec: 30,
    earnings_total: 25000,
    pending_commission: 0,
    created_at: now(),
    updated_at: now(),
  });
  console.log('✅ Cook 2 created:', cookId2);

  // ─── Create Meals for Cook 1 ───────────────────────────────────────────────
  const meals1 = [
    {
      meal_id: 'meal-001',
      cook_id: cookId1,
      name: 'Idli Sambar',
      description: '3 Soft idlis with sambar and coconut chutney. Classic South Indian breakfast.',
      price_inr: 50,
      dietary_type: 'veg',
      cuisine_tag: 'south_indian',
      spice_level: 'mild',
      ingredients: ['rice', 'lentils', 'tamarind', 'coconut'],
      allergens: [],
      is_active: true,
      is_festival_special: false,
      created_at: now(),
      updated_at: now(),
    },
    {
      meal_id: 'meal-002',
      cook_id: cookId1,
      name: 'Curd Rice Combo',
      description: 'Curd rice with pickle and papad. Cooling and comforting.',
      price_inr: 65,
      dietary_type: 'veg',
      cuisine_tag: 'south_indian',
      spice_level: 'mild',
      ingredients: ['rice', 'yogurt', 'curry leaves', 'mustard'],
      allergens: ['dairy'],
      is_active: true,
      is_festival_special: false,
      created_at: now(),
      updated_at: now(),
    },
    {
      meal_id: 'meal-003',
      cook_id: cookId1,
      name: 'Sambar Rice',
      description: 'Sambar rice with vegetable poriyal and buttermilk.',
      price_inr: 80,
      dietary_type: 'veg',
      cuisine_tag: 'south_indian',
      spice_level: 'medium',
      ingredients: ['rice', 'toor dal', 'vegetables', 'tamarind'],
      allergens: [],
      is_active: true,
      is_festival_special: false,
      created_at: now(),
      updated_at: now(),
    },
  ];

  for (const meal of meals1) {
    await db.collection(COLLECTIONS.MEALS).doc(meal.meal_id).set(meal);
  }
  console.log('✅ Meals for cook 1 created');

  // ─── Create Meals for Cook 2 ───────────────────────────────────────────────
  const meals2 = [
    {
      meal_id: 'meal-004',
      cook_id: cookId2,
      name: 'Rajma Chawal',
      description: 'Classic Delhi-style rajma with steamed basmati rice and pickle.',
      price_inr: 90,
      dietary_type: 'veg',
      cuisine_tag: 'north_indian',
      spice_level: 'medium',
      ingredients: ['kidney beans', 'rice', 'tomatoes', 'onions'],
      allergens: [],
      is_active: true,
      is_festival_special: false,
      created_at: now(),
      updated_at: now(),
    },
    {
      meal_id: 'meal-005',
      cook_id: cookId2,
      name: 'Dal Makhani + Roti',
      description: '3 rotis with slow-cooked dal makhani and raita.',
      price_inr: 110,
      dietary_type: 'veg',
      cuisine_tag: 'punjabi',
      spice_level: 'medium',
      ingredients: ['black lentils', 'butter', 'cream', 'wheat flour'],
      allergens: ['dairy', 'gluten'],
      is_active: true,
      is_festival_special: false,
      created_at: now(),
      updated_at: now(),
    },
  ];

  for (const meal of meals2) {
    await db.collection(COLLECTIONS.MEALS).doc(meal.meal_id).set(meal);
  }
  console.log('✅ Meals for cook 2 created');

  // ─── Create Time Slots ─────────────────────────────────────────────────────
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const slots = [
    { slot_id: 'slot-001', cook_id: cookId1, date: today, start_time: '12:00', end_time: '12:30', slot_display_time: '12:00 PM – 12:30 PM', max_capacity: 8, confirmed_count: 2, pending_count: 0, is_available: true, is_festival_slot: false, created_at: now() },
    { slot_id: 'slot-002', cook_id: cookId1, date: today, start_time: '13:00', end_time: '13:30', slot_display_time: '1:00 PM – 1:30 PM', max_capacity: 6, confirmed_count: 1, pending_count: 0, is_available: true, is_festival_slot: false, created_at: now() },
    { slot_id: 'slot-003', cook_id: cookId2, date: today, start_time: '12:30', end_time: '13:00', slot_display_time: '12:30 PM – 1:00 PM', max_capacity: 10, confirmed_count: 3, pending_count: 0, is_available: true, is_festival_slot: false, created_at: now() },
    { slot_id: 'slot-004', cook_id: cookId2, date: tomorrow, start_time: '08:00', end_time: '09:00', slot_display_time: '8:00 AM – 9:00 AM', max_capacity: 5, confirmed_count: 0, pending_count: 0, is_available: true, is_festival_slot: false, created_at: now() },
  ];

  for (const slot of slots) {
    await db.collection(COLLECTIONS.TIME_SLOTS).doc(slot.slot_id).set(slot);
  }
  console.log('✅ Time slots created');

  // ─── Create Sample Ratings ────────────────────────────────────────────────
  const ratings = [
    { rating_id: 'rating-001', order_id: 'order-x1', user_id: userId, cook_id: cookId1, rating_overall: 5, text: "Tastes exactly like mom's cooking!", tags: [], locked: false, edit_count: 0, created_at: now(), updated_at: now() },
    { rating_id: 'rating-002', order_id: 'order-x2', user_id: userId, cook_id: cookId1, rating_overall: 4, text: 'Fresh and delicious. Will order again.', tags: [], locked: false, edit_count: 0, created_at: now(), updated_at: now() },
    { rating_id: 'rating-003', order_id: 'order-x3', user_id: userId, cook_id: cookId2, rating_overall: 5, text: 'Best rajma chawal in Bangalore!', tags: [], locked: false, edit_count: 0, created_at: now(), updated_at: now() },
  ];

  for (const rating of ratings) {
    await db.collection(COLLECTIONS.RATINGS).doc(rating.rating_id).set(rating);
  }
  console.log('✅ Sample ratings created');

  console.log('\n🎉 Database seeding complete!');
  console.log('   Test User ID:', userId);
  console.log('   Cook 1 ID:', cookId1, '(Lakshmi Devi)');
  console.log('   Cook 2 ID:', cookId2, '(Geeta Sharma)');
  console.log('\nView data at: http://localhost:4000/firestore');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
