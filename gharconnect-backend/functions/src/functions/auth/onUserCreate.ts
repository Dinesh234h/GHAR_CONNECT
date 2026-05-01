// functions/auth/onUserCreate.ts
// Firebase Auth trigger: create a Firestore user profile on first sign-up.

import * as functions from 'firebase-functions';
import { db, Timestamp } from '../../config/firebase';
import { COLLECTIONS } from '../../config/collections';
import { UserProfile } from '../../types/user.types';

export const onUserCreate = functions.auth.user().onCreate(async (user) => {
  const profile: UserProfile = {
    uid: user.uid,
    phone: user.phoneNumber ?? '',
    display_name: user.displayName ?? '',
    email: user.email,
    roles: ['user'],
    preferences: {
      dietary: [],
      cuisines: [],
      spice_level: 'medium',
      max_price_inr: 150,
    },
    cancellation_count: 0,
    region_code: 'KA',
    created_at: Timestamp.now(),
    updated_at: Timestamp.now(),
  };

  await db.collection(COLLECTIONS.USERS).doc(user.uid).set(profile);
  console.info(`[auth] Created profile for user ${user.uid}`);
});
