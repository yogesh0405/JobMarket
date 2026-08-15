import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../../../shared/types';
import { SupportService } from '../../../../src/modules/support/services/SupportService';

export class SupportController {
  static async createTicket(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.headers['x-user-id'] as string || req.user?.userId;
      const data = await SupportService.createTicket(req.body, userId);
      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async getMyTickets(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.headers['x-user-id'] as string || req.user?.userId;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      const data = await SupportService.getTicketsForUser(userId);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async getTicketDetails(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.headers['x-user-id'] as string || req.user?.userId;
      const { id } = req.params;
      const data = await SupportService.getTicketDetails(id, userId);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async postMessage(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.headers['x-user-id'] as string || req.user?.userId;
      const ticketId = req.params.id || req.body.ticketId;
      const { message, attachments } = req.body;
      const data = await SupportService.postMessage(ticketId, userId, message, attachments);
      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async closeMyTicket(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.headers['x-user-id'] as string || req.user?.userId;
      const { id } = req.params;
      const data = await SupportService.closeTicket(id, userId);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async reopenMyTicket(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.headers['x-user-id'] as string || req.user?.userId;
      const { id } = req.params;
      const data = await SupportService.reopenTicket(id, userId);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async adminListTickets(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await SupportService.getAllTicketsForAdmin(req.query as any);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async adminGetAnalytics(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await SupportService.adminGetAnalytics();
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async adminUpdateTicket(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = await SupportService.adminUpdateTicket(id, req.body);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async adminAssignTicket(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { ticketId, assignedTo } = req.body;
      const data = await SupportService.adminAssignTicket(ticketId, assignedTo);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async adminDeleteTicket(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await SupportService.adminDeleteTicket(id);
      res.status(200).json({ success: true, message: 'Ticket deleted' });
    } catch (error) {
      next(error);
    }
  }
}
