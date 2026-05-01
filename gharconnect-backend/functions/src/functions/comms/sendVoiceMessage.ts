// functions/comms/sendVoiceMessage.ts
// functions/comms/getOrderComms.ts
// functions/comms/getCallToken.ts

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { v4 as uuid } from 'uuid';
import multer from 'multer';
import { requireAuth } from '../../middleware/auth.middleware';
import { validateBody } from '../../utils/validate.utils';
import { handleError, AppError } from '../../utils/error.utils';
import { db, Timestamp } from '../../config/firebase';
import { COLLECTIONS } from '../../config/collections';
import { CONSTANTS } from '../../config/constants';
import { uploadVoiceMessage, getVoiceMessageUrl } from '../../services/storage.service';
import { generateAgoraToken } from '../../services/agora.service';
import { sendVoiceMessageReceived } from '../../services/notification.service';
import { Order } from '../../types/order.types';
import { UserProfile } from '../../types/user.types';
import { CookProfile } from '../../types/cook.types';

export const commsRouter = Router();

const audioUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (_req, file, cb) => {
    const allowed = ['audio/webm', 'audio/ogg', 'audio/mpeg', 'audio/mp4'];
    cb(null, allowed.includes(file.mimetype));
  },
});

// ─── POST /comms/voice — Send voice message ───────────────────────────────────
commsRouter.post('/voice', requireAuth, audioUpload.single('audio'), async (req: Request, res: Response) => {
  try {
    const order_id = req.body['order_id'] as string;
    if (!order_id) throw new AppError('MISSING_PARAMS', 'order_id is required.', 400);

    const callerId = req.uid;
    const file = req.file;
    if (!file) throw new AppError('NO_AUDIO', 'Audio file is required.', 400);

    // Validate order
    const orderSnap = await db.collection(COLLECTIONS.ORDERS).doc(order_id).get();
    if (!orderSnap.exists) throw new AppError('ORDER_NOT_FOUND', 'Order not found.', 404);

    const order = orderSnap.data() as Order;
    if (order.user_id !== callerId && order.cook_id !== callerId) {
      throw new AppError('FORBIDDEN', 'Not a party to this order.', 403);
    }
    if (!order.communication_window_open) {
      throw new AppError('COMMS_CLOSED', 'Communication window is closed for this order.', 403);
    }

    // Upload audio
    const msgId = uuid();
    const audioUrl = await uploadVoiceMessage(order_id, msgId, file.buffer, file.mimetype);

    // Determine receiver
    const receiverId = callerId === order.user_id ? order.cook_id : order.user_id;

    // Save message to Firestore
    await db.collection(COLLECTIONS.VOICE_MESSAGES).doc(msgId).set({
      msg_id: msgId,
      order_id,
      sender_id: callerId,
      receiver_id: receiverId,
      audio_url: audioUrl,
      expires_at: Timestamp.fromDate(
        new Date(Date.now() + CONSTANTS.VOICE_MESSAGE_EXPIRY_HOURS * 3600 * 1000)
      ),
      created_at: Timestamp.now(),
    });

    // Notify receiver
    const receiverCollection = callerId === order.user_id ? COLLECTIONS.COOK_PROFILES : COLLECTIONS.USERS;
    const receiverSnap = await db.collection(receiverCollection).doc(receiverId).get();
    const receiverFCMToken =
      (receiverSnap.data() as UserProfile | CookProfile | undefined)?.fcm_token;

    if (receiverFCMToken) {
      await sendVoiceMessageReceived(receiverId, receiverFCMToken, order_id, msgId);
    }

    res.status(201).json({ msg_id: msgId, audio_url: audioUrl });
  } catch (err) {
    handleError(err, res);
  }
});

// ─── GET /comms/:orderId — Get voice messages ─────────────────────────────────
commsRouter.get('/:orderId', requireAuth, async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const callerId = req.uid;

    const orderSnap = await db.collection(COLLECTIONS.ORDERS).doc(orderId).get();
    if (!orderSnap.exists) throw new AppError('ORDER_NOT_FOUND', 'Order not found.', 404);

    const order = orderSnap.data() as Order;
    if (order.user_id !== callerId && order.cook_id !== callerId) {
      throw new AppError('FORBIDDEN', 'Not a party to this order.', 403);
    }

    const msgsSnap = await db
      .collection(COLLECTIONS.VOICE_MESSAGES)
      .where('order_id', '==', orderId)
      .orderBy('created_at', 'asc')
      .get();

    // Refresh signed URLs (existing ones may have expired)
    const messages = await Promise.all(
      msgsSnap.docs.map(async (d) => {
        const msg = d.data();
        try {
          const freshUrl = await getVoiceMessageUrl(orderId, msg['msg_id'] as string);
          return { ...msg, audio_url: freshUrl };
        } catch {
          return msg; // Return message without fresh URL if file deleted
        }
      })
    );

    res.json({ messages });
  } catch (err) {
    handleError(err, res);
  }
});

// ─── POST /comms/call-token — Agora RTC token ─────────────────────────────────
const CallTokenSchema = z.object({
  order_id: z.string().min(1),
});

commsRouter.post('/call-token', requireAuth, validateBody(CallTokenSchema), async (req: Request, res: Response) => {
  try {
    const { order_id } = req.body as z.infer<typeof CallTokenSchema>;
    const callerId = req.uid;

    const orderSnap = await db.collection(COLLECTIONS.ORDERS).doc(order_id).get();
    if (!orderSnap.exists) throw new AppError('ORDER_NOT_FOUND', 'Order not found.', 404);

    const order = orderSnap.data() as Order;
    const role: 'user' | 'cook' = callerId === order.user_id ? 'user' : 'cook';

    const tokenData = await generateAgoraToken(order_id, callerId, role);

    res.json(tokenData);
  } catch (err) {
    handleError(err, res);
  }
});
