import { NotificationRepository, NotificationRecord } from '../repositories/NotificationRepository';

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
    return NotificationRepository.createNotification(
      userId,
      title,
      message,
      type,
      link,
      entityType,
      entityId,
      metadata
    );
  }

  static async broadcast(
    userIds: string[],
    title: string,
    message: string,
    type: string = 'BROADCAST',
    link?: string | null
  ): Promise<number> {
    return NotificationRepository.broadcastNotifications(userIds, title, message, type, link);
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
