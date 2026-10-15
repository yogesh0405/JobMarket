import { Router } from 'express';
import { SupportController } from '../controllers/SupportController';
import { rateLimiter } from '../../../../shared/middlewares/rateLimiter';

const router = Router();

// Anti-Spam Rate Limiters
const ticketCreationLimiter = rateLimiter('support_ticket_create', 5, 300); // 5 tickets per 5 mins
const ticketMessageLimiter = rateLimiter('support_message_create', 20, 60); // 20 messages per min

// User Support Tickets Routes
router.post('/tickets', ticketCreationLimiter, SupportController.createTicket);
router.get('/tickets', SupportController.getMyTickets);
router.get('/tickets/:id', SupportController.getTicketDetails);
router.post('/tickets/:id/messages', ticketMessageLimiter, SupportController.postMessage);
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
