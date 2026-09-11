import { NotificationRepository, NotificationRecord } from '../repositories/NotificationRepository';
import { PushNotificationService } from './PushNotificationService';
import { logger } from '../../../utils/logger';

export class NotificationService {
  static async sendNotification(
    userId: string,
    title: string,
    message: string,
    type: string = 'SYSTEM',
    link?: string | null,
    entityType?: string | null,
    entityId?: string | null,
    metadata?: any | null
  ): Promise<NotificationRecord> {
    const record = await NotificationRepository.createNotification(
      userId,
      title,
      message,
      type,
      link,
      entityType,
      entityId,
      metadata
    );

    // Asynchronously dispatch real-time Push Notification to user's registered devices
    PushNotificationService.sendToUser(userId, {
      title,
      body: message,
      data: {
        notificationId: record?.id ? String(record.id) : '',
        type: type || 'SYSTEM',
        link: link || '',
        entityType: entityType || '',
        entityId: entityId || '',
      },
    }).catch((err) => {
      logger.error(`Failed to dispatch push notification for user ${userId}:`, err?.message || err);
    });

    return record;
  }

  static async broadcast(
    userIds: string[],
    title: string,
    message: string,
    type: string = 'BROADCAST',
    link?: string | null
  ): Promise<number> {
    const count = await NotificationRepository.broadcastNotifications(userIds, title, message, type, link);

    // Asynchronously dispatch real-time Push Notification to all users
    PushNotificationService.sendToUsers(userIds, {
      title,
      body: message,
      data: {
        type: type || 'BROADCAST',
        link: link || '',
      },
    }).catch((err) => {
      logger.error('Failed to dispatch broadcast push notification:', err?.message || err);
    });

    return count;
  }

  static async getUserNotifications(userId: string, limit?: number): Promise<NotificationRecord[]> {
    return NotificationRepository.getNotificationsForUser(userId, limit);
  }

  static async getUnreadCount(userId: string): Promise<number> {
    return NotificationRepository.getUnreadCount(userId);
  }

  static async markAsRead(id: string, userId: string): Promise<NotificationRecord | null> {
    return NotificationRepository.markAsRead(id, userId);
  }

  static async markAllAsRead(userId: string): Promise<number> {
    return NotificationRepository.markAllAsRead(userId);
  }

  static async deleteNotification(id: string, userId: string): Promise<boolean> {
    return NotificationRepository.deleteNotification(id, userId);
  }

  static async clearAll(userId: string): Promise<number> {
    return NotificationRepository.clearAll(userId);
  }
}
