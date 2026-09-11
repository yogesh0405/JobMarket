import { fcmMessaging } from '../../../config/firebase';
import { DeviceTokenRepository } from '../repositories/DeviceTokenRepository';
import { logger } from '../../../utils/logger';

export interface PushPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
}

export class PushNotificationService {
  /**
   * Send a push notification to a user's active devices
   */
  static async sendToUser(userId: string, payload: PushPayload): Promise<void> {
    if (!fcmMessaging) {
      logger.debug('Push notification skipped: Firebase messaging is not initialized.');
      return;
    }

    try {
      const tokens = await DeviceTokenRepository.getTokensForUser(userId);
      if (!tokens || tokens.length === 0) {
        return;
      }

      await this.sendToTokens(tokens, payload);
    } catch (error: any) {
      logger.error(`Error sending push notification to user ${userId}:`, error?.message || error);
    }
  }

  /**
   * Send a push notification to multiple users
   */
  static async sendToUsers(userIds: string[], payload: PushPayload): Promise<void> {
    if (!fcmMessaging) {
      logger.debug('Push notification skipped: Firebase messaging is not initialized.');
      return;
    }

    try {
      const tokens = await DeviceTokenRepository.getTokensForUsers(userIds);
      if (!tokens || tokens.length === 0) {
        return;
      }

      await this.sendToTokens(tokens, payload);
    } catch (error: any) {
      logger.error('Error sending push notifications to users:', error?.message || error);
    }
  }

  /**
   * Low-level helper to send to a list of tokens with dead token cleanup
   */
  static async sendToTokens(tokens: string[], payload: PushPayload): Promise<void> {
    if (!fcmMessaging || tokens.length === 0) return;

    // Stringify all values in data payload because FCM requires strings only
    const sanitizedData: Record<string, string> = {};
    if (payload.data) {
      for (const [key, value] of Object.entries(payload.data)) {
        if (value !== undefined && value !== null) {
          sanitizedData[key] = String(value);
        }
      }
    }

    // Process in batches of up to 500 (FCM sendEachForMulticast limit)
    const BATCH_SIZE = 500;
    for (let i = 0; i < tokens.length; i += BATCH_SIZE) {
      const batchTokens = tokens.slice(i, i + BATCH_SIZE);

      const message = {
        tokens: batchTokens,
        notification: {
          title: payload.title,
          body: payload.body,
        },
        data: sanitizedData,
        android: {
          priority: 'high' as const,
          notification: {
            channelId: 'default',
            sound: 'default',
            priority: 'high' as const,
            defaultVibrateTimings: true,
            defaultSound: true,
          },
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1,
              contentAvailable: true,
            },
          },
          headers: {
            'apns-priority': '10',
          },
        },
      };

      try {
        const response = await fcmMessaging.sendEachForMulticast(message);
        logger.info(`Push notification sent: ${response.successCount} succeeded, ${response.failureCount} failed`);

        if (response.failureCount > 0) {
          const staleTokens: string[] = [];
          response.responses.forEach((resp, idx) => {
            if (!resp.success) {
              const errCode = resp.error?.code;
              if (
                errCode === 'messaging/registration-token-not-registered' ||
                errCode === 'messaging/invalid-registration-token' ||
                errCode === 'messaging/invalid-argument'
              ) {
                staleTokens.push(batchTokens[idx]);
              }
            }
          });

          if (staleTokens.length > 0) {
            const removed = await DeviceTokenRepository.deleteTokens(staleTokens);
            logger.info(`Pruned ${removed} stale FCM device tokens from database.`);
          }
        }
      } catch (err: any) {
        logger.error('Error dispatching multicast FCM message batch:', err?.message || err);
      }
    }
  }
}
