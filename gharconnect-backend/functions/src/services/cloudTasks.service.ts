// services/cloudTasks.service.ts
// Google Cloud Tasks — precise TTL scheduling for order timeouts and SMS fallbacks.

import { CloudTasksClient } from '@google-cloud/tasks';
import { CONSTANTS } from '../config/constants';

const tasksClient = new CloudTasksClient();

function queuePath(): string {
  const project = process.env.GCP_PROJECT_ID;
  const location = process.env.CLOUD_TASKS_LOCATION ?? 'asia-south1';
  const queue = process.env.CLOUD_TASKS_QUEUE_NAME ?? 'gharconnect-tasks';
  if (!project) throw new Error('GCP_PROJECT_ID not set');
  return tasksClient.queuePath(project, location, queue);
}

function baseUrl(): string {
  return process.env.CLOUD_FUNCTIONS_BASE_URL ?? '';
}

function internalHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'X-Internal-Secret': process.env.INTERNAL_SECRET ?? '',
  };
}

// ─── Order Timeout Task ───────────────────────────────────────────────────────
/**
 * Schedule a task to fire at exact TTL expiry.
 * Returns task name — store on order document for cancellation.
 */
export async function scheduleOrderTimeout(
  orderId: string,
  executeAt: Date
): Promise<string> {
  const payload = JSON.stringify({ order_id: orderId, type: 'ORDER_TIMEOUT' });

  const [task] = await tasksClient.createTask({
    parent: queuePath(),
    task: {
      scheduleTime: { seconds: Math.floor(executeAt.getTime() / 1000) },
      httpRequest: {
        httpMethod: 'POST',
        url: `${baseUrl()}/internal/order-timeout`,
        headers: internalHeaders(),
        body: Buffer.from(payload).toString('base64'),
      },
    },
  });

  return task.name ?? '';
}

// ─── Cancel Task (Cook responds before TTL) ───────────────────────────────────
export async function cancelTask(taskName: string): Promise<void> {
  if (!taskName) return;
  try {
    await tasksClient.deleteTask({ name: taskName });
  } catch (err: unknown) {
    const code = (err as { code?: number }).code;
    if (code !== 5) throw err; // 5 = NOT_FOUND means task already fired — safe to ignore
  }
}

// ─── SMS Fallback Task ────────────────────────────────────────────────────────
/**
 * Schedule SMS fallback at T+60s in case FCM push wasn't opened.
 */
export async function scheduleSMSFallback(
  orderId: string,
  cookPhone: string,
  executeAt: Date
): Promise<string> {
  const payload = JSON.stringify({
    order_id: orderId,
    cook_phone: cookPhone,
    type: 'SMS_FALLBACK',
  });

  const [task] = await tasksClient.createTask({
    parent: queuePath(),
    task: {
      scheduleTime: { seconds: Math.floor(executeAt.getTime() / 1000) },
      httpRequest: {
        httpMethod: 'POST',
        url: `${baseUrl()}/internal/sms-fallback`,
        headers: internalHeaders(),
        body: Buffer.from(payload).toString('base64'),
      },
    },
  });

  return task.name ?? '';
}

// ─── Pickup Reminder Task ─────────────────────────────────────────────────────
export async function schedulePickupReminder(
  orderId: string,
  pickupTime: Date
): Promise<string> {
  const reminderTime = new Date(
    pickupTime.getTime() - CONSTANTS.PICKUP_REMINDER_MINUTES_BEFORE * 60 * 1000
  );
  const payload = JSON.stringify({ order_id: orderId, type: 'PICKUP_REMINDER' });

  const [task] = await tasksClient.createTask({
    parent: queuePath(),
    task: {
      scheduleTime: { seconds: Math.floor(reminderTime.getTime() / 1000) },
      httpRequest: {
        httpMethod: 'POST',
        url: `${baseUrl()}/internal/pickup-reminder`,
        headers: internalHeaders(),
        body: Buffer.from(payload).toString('base64'),
      },
    },
  });

  return task.name ?? '';
}

// ─── Rating Prompt Task ───────────────────────────────────────────────────────
export async function scheduleRatingPrompt(
  orderId: string,
  completedAt: Date
): Promise<string> {
  const promptTime = new Date(
    completedAt.getTime() + CONSTANTS.RATING_PROMPT_MINUTES_AFTER * 60 * 1000
  );
  const payload = JSON.stringify({ order_id: orderId, type: 'RATING_PROMPT' });

  const [task] = await tasksClient.createTask({
    parent: queuePath(),
    task: {
      scheduleTime: { seconds: Math.floor(promptTime.getTime() / 1000) },
      httpRequest: {
        httpMethod: 'POST',
        url: `${baseUrl()}/internal/rating-prompt`,
        headers: internalHeaders(),
        body: Buffer.from(payload).toString('base64'),
      },
    },
  });

  return task.name ?? '';
}
