import { Router } from 'express';
import { SupportController } from '../controllers/SupportController';
import { requireAuth, AuthenticatedRequest } from '../../../middlewares/authMiddleware';
import { requireRole } from '../../../middlewares/rbacMiddleware';
import { verifyAccessToken } from '../../../utils/jwt';

const router = Router();

// Middleware to optionally set req.user if authorization token is provided
const optionalAuth = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = verifyAccessToken(token);
      req.user = decoded;
    } catch (e) {
      return res.status(401).json({ success: false, message: 'Invalid or expired access token' });
    }
  }
  next();
};

// --- USER TICKETS ---
router.post('/tickets', optionalAuth, SupportController.createTicket);
router.get('/tickets', requireAuth, SupportController.getMyTickets);
router.get('/tickets/:id', requireAuth, SupportController.getTicketDetails);
router.post('/tickets/:id/messages', requireAuth, SupportController.postMessage);
router.patch('/tickets/:id/close', requireAuth, SupportController.closeMyTicket);
router.patch('/tickets/:id/reopen', requireAuth, SupportController.reopenMyTicket);

// --- IN-APP NOTIFICATIONS ---
router.get('/notifications', requireAuth, SupportController.getNotifications);
router.patch('/notifications/:id/read', requireAuth, SupportController.markNotificationRead);

// --- ADMIN SUPPORT TICKETS ---
export const adminSupportRouter = Router();
adminSupportRouter.use(requireAuth, requireRole(['admin']));

adminSupportRouter.get('/', SupportController.adminListTickets);
adminSupportRouter.get('/analytics', SupportController.adminGetAnalytics);
adminSupportRouter.patch('/:id', SupportController.adminUpdateTicket);
adminSupportRouter.post('/reply', SupportController.postMessage);
adminSupportRouter.post('/assign', SupportController.adminAssignTicket);
adminSupportRouter.delete('/:id', SupportController.adminDeleteTicket);

export default router;
