import { Router } from 'express';
import { requireAuth } from '../../../middlewares/authMiddleware';
import { NotificationController } from '../controllers/NotificationController';

const router = Router();

router.get('/notifications', requireAuth, NotificationController.getNotifications);
router.get('/notifications/unread-count', requireAuth, NotificationController.getUnreadCount);
router.patch('/notifications/read-all', requireAuth, NotificationController.markAllNotificationsRead);
router.patch('/notifications/:id/read', requireAuth, NotificationController.markNotificationRead);
router.delete('/notifications/clear-all', requireAuth, NotificationController.clearAllNotifications);
router.delete('/notifications/:id', requireAuth, NotificationController.deleteNotification);

export default router;
