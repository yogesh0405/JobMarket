import { Router } from 'express';
import { SupportController } from '../controllers/SupportController';

const router = Router();

// User Support Tickets Routes
router.post('/tickets', SupportController.createTicket);
router.get('/tickets', SupportController.getMyTickets);
router.get('/tickets/:id', SupportController.getTicketDetails);
router.post('/tickets/:id/messages', SupportController.postMessage);
router.patch('/tickets/:id/close', SupportController.closeMyTicket);
router.patch('/tickets/:id/reopen', SupportController.reopenMyTicket);

// Admin Support Routes
export const adminSupportRouter = Router();
adminSupportRouter.get('/', SupportController.adminListTickets);
adminSupportRouter.get('/analytics', SupportController.adminGetAnalytics);
adminSupportRouter.patch('/:id', SupportController.adminUpdateTicket);
adminSupportRouter.post('/reply', SupportController.postMessage);
adminSupportRouter.post('/assign', SupportController.adminAssignTicket);
adminSupportRouter.delete('/:id', SupportController.adminDeleteTicket);

export default router;
