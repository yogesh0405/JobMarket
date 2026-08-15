import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../../../shared/types';
import { NotificationService } from '../../../../src/modules/notifications/services/NotificationService';

export class NotificationController {
  static async getNotifications(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.headers['x-user-id'] as string || req.user?.userId;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      const [notifications, unreadCount] = await Promise.all([
        NotificationService.getUserNotifications(userId),
        NotificationService.getUnreadCount(userId)
      ]);

      res.status(200).json({ success: true, unreadCount, data: notifications });
    } catch (error) {
      next(error);
    }
  }

  static async getUnreadCount(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.headers['x-user-id'] as string || req.user?.userId;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      const unreadCount = await NotificationService.getUnreadCount(userId);
      res.status(200).json({ success: true, unreadCount });
    } catch (error) {
      next(error);
    }
  }

  static async markNotificationRead(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.headers['x-user-id'] as string || req.user?.userId;
      const { id } = req.params;
      const updated = await NotificationService.markAsRead(id, userId);

      res.status(200).json({ success: true, message: 'Notification marked as read', data: updated });
    } catch (error) {
      next(error);
    }
  }

  static async markAllNotificationsRead(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.headers['x-user-id'] as string || req.user?.userId;
      const updatedCount = await NotificationService.markAllAsRead(userId);

      res.status(200).json({ success: true, message: `${updatedCount} notifications marked as read`, updatedCount });
    } catch (error) {
      next(error);
    }
  }

  static async deleteNotification(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.headers['x-user-id'] as string || req.user?.userId;
      const { id } = req.params;
      await NotificationService.deleteNotification(id, userId);

      res.status(200).json({ success: true, message: 'Notification deleted' });
    } catch (error) {
      next(error);
    }
  }

  static async clearAllNotifications(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.headers['x-user-id'] as string || req.user?.userId;
      const clearedCount = await NotificationService.clearAll(userId);

      res.status(200).json({ success: true, message: 'All notifications cleared', clearedCount });
    } catch (error) {
      next(error);
    }
  }
}
