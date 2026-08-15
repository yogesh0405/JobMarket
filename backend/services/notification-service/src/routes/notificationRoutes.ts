import { Router } from 'express';
import { NotificationController } from '../controllers/NotificationController';

const router = Router();

router.get('/notifications', NotificationController.getNotifications);
router.get('/notifications/unread-count', NotificationController.getUnreadCount);
router.patch('/notifications/read-all', NotificationController.markAllNotificationsRead);
router.patch('/notifications/:id/read', NotificationController.markNotificationRead);
router.delete('/notifications/clear-all', NotificationController.clearAllNotifications);
router.delete('/notifications/:id', NotificationController.deleteNotification);

export default router;
