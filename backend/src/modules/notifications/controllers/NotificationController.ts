import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../../middlewares/authMiddleware';
import { NotificationService } from '../services/NotificationService';
import { DeviceTokenRepository } from '../repositories/DeviceTokenRepository';

export class NotificationController {
  /**
   * GET /api/v1/notifications
   * Fetch user's in-app notifications and unread count
   */
  static async getNotifications(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const [notifications, unreadCount] = await Promise.all([
        NotificationService.getUserNotifications(userId),
        NotificationService.getUnreadCount(userId)
      ]);

      res.status(200).json({
        success: true,
        unreadCount,
        data: notifications
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/notifications/unread-count
   * Fetch unread notification count only
   */
  static async getUnreadCount(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const unreadCount = await NotificationService.getUnreadCount(userId);
      res.status(200).json({
        success: true,
        unreadCount
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/v1/notifications/:id/read
   * Mark a single notification as read
   */
  static async markNotificationRead(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const updated = await NotificationService.markAsRead(id, userId);

      res.status(200).json({
        success: true,
        message: 'Notification marked as read',
        data: updated
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/v1/notifications/read-all
   * Mark all unread notifications as read
   */
  static async markAllNotificationsRead(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const updatedCount = await NotificationService.markAllAsRead(userId);

      res.status(200).json({
        success: true,
        message: `${updatedCount} notifications marked as read`,
        updatedCount
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/notifications/:id
   * Delete a single notification
   */
  static async deleteNotification(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      await NotificationService.deleteNotification(id, userId);

      res.status(200).json({
        success: true,
        message: 'Notification deleted'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/notifications/clear-all
   * Clear all notifications for user
   */
  static async clearAllNotifications(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const clearedCount = await NotificationService.clearAll(userId);

      res.status(200).json({
        success: true,
        message: 'All notifications cleared',
        clearedCount
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/notifications/device-token
   * Register or update user device push token
   */
  static async registerDeviceToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { fcmToken, deviceType } = req.body;

      if (!fcmToken || typeof fcmToken !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'fcmToken is required and must be a valid string',
        });
      }

      const platform = (deviceType === 'ios' ? 'ios' : 'android') as 'android' | 'ios';
      const record = await DeviceTokenRepository.upsertToken(userId, fcmToken.trim(), platform);

      res.status(200).json({
        success: true,
        message: 'Device token registered successfully',
        data: record,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/notifications/device-token
   * Remove device token on logout
   */
  static async unregisterDeviceToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      const { fcmToken } = req.body;

      if (!fcmToken || typeof fcmToken !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'fcmToken is required and must be a valid string',
        });
      }

      const deleted = await DeviceTokenRepository.deleteToken(fcmToken.trim(), userId);

      res.status(200).json({
        success: true,
        message: deleted ? 'Device token unregistered successfully' : 'Device token not found',
      });
    } catch (error) {
      next(error);
    }
  }
}
