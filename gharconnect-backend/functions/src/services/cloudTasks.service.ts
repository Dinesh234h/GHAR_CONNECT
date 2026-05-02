// services/cloudTasks.service.ts
// Simulation of Google Cloud Tasks using local setTimeout for no-billing development.

import { CONSTANTS } from '../config/constants';

/**
 * LocalTaskScheduler — In-memory map to track active timeouts for cancellation.
 * Only suitable for local development/demo.
 */
class LocalTaskScheduler {
  private activeTimeouts = new Map<string, NodeJS.Timeout>();

  async schedule(taskId: string, executeAt: Date, path: string, payload: any): Promise<string> {
    const delay = executeAt.getTime() - Date.now();
    
    // Clear existing if any
    this.cancel(taskId);

    console.info(`[LocalScheduler] Task ${taskId} scheduled for ${executeAt.toISOString()} (in ${Math.round(delay/1000)}s)`);

    const timeout = setTimeout(async () => {
      this.activeTimeouts.delete(taskId);
      await this.triggerInternalRoute(path, payload);
    }, Math.max(0, delay));

    this.activeTimeouts.set(taskId, timeout);
    return taskId;
  }

  cancel(taskId: string): void {
    const timeout = this.activeTimeouts.get(taskId);
    if (timeout) {
      console.info(`[LocalScheduler] Task ${taskId} cancelled.`);
      clearTimeout(timeout);
      this.activeTimeouts.delete(taskId);
    }
  }

  private async triggerInternalRoute(path: string, payload: any) {
    const baseUrl = process.env.CLOUD_FUNCTIONS_BASE_URL || 'http://localhost:5001/gharconnect-5cf25/asia-south1/api';
    const secret = process.env.INTERNAL_SECRET || '';
    
    try {
      console.info(`[LocalScheduler] Executing ${path} at ${new Date().toISOString()}`);
      const res = await fetch(`${baseUrl}${path}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Internal-Secret': secret
        },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json().catch(() => ({}));
      console.info(`[LocalScheduler] ${path} response: ${res.status}`, data);
    } catch (err) {
      console.error(`[LocalScheduler] Failed to trigger ${path}:`, err);
    }
  }
}

const scheduler = new LocalTaskScheduler();

export async function scheduleOrderTimeout(orderId: string, executeAt: Date): Promise<string> {
  return scheduler.schedule(
    `timeout_${orderId}`,
    executeAt,
    '/internal/order-timeout',
    { order_id: orderId, type: 'ORDER_TIMEOUT' }
  );
}

export async function cancelTask(taskId: string): Promise<void> {
  scheduler.cancel(taskId);
}

export async function scheduleSMSFallback(
  orderId: string,
  cookPhone: string,
  executeAt: Date
): Promise<string> {
  return scheduler.schedule(
    `sms_${orderId}`,
    executeAt,
    '/internal/sms-fallback',
    { order_id: orderId, cook_phone: cookPhone, type: 'SMS_FALLBACK' }
  );
}

export async function schedulePickupReminder(orderId: string, pickupTime: Date): Promise<string> {
  const reminderTime = new Date(
    pickupTime.getTime() - CONSTANTS.PICKUP_REMINDER_MINUTES_BEFORE * 60 * 1000
  );
  return scheduler.schedule(
    `reminder_${orderId}`,
    reminderTime,
    '/internal/pickup-reminder',
    { order_id: orderId, type: 'PICKUP_REMINDER' }
  );
}

export async function scheduleRatingPrompt(orderId: string, completedAt: Date): Promise<string> {
  const promptTime = new Date(
    completedAt.getTime() + CONSTANTS.RATING_PROMPT_MINUTES_AFTER * 60 * 1000
  );
  return scheduler.schedule(
    `rating_${orderId}`,
    promptTime,
    '/internal/rating-prompt',
    { order_id: orderId, type: 'RATING_PROMPT' }
  );
}
