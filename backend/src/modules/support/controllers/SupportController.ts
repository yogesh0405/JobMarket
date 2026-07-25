import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../../middlewares/authMiddleware';
import { SupportService } from '../services/SupportService';
import { BadRequestError } from '../../../errors/AppError';

export class SupportController {
  // --- USER CONTROLLERS ---

  static async createTicket(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const {
        fullName, email, phone, category, subject, description,
        attachmentBase64, attachmentName, preferredContact, priority
      } = req.body;

      if (!fullName || !email || !category || !subject || !description || !preferredContact) {
        throw new BadRequestError('Required fields are missing');
      }

      // RFC-style simple email regex check
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new BadRequestError('Invalid email address format');
      }

      if (phone && !/^\d{10}$/.test(phone.replace(/[^0-9]/g, ''))) {
        throw new BadRequestError('Phone number must be exactly 10 digits');
      }

      // Parse user agent
      const userAgent = req.headers['user-agent'] || '';
      let device = 'Desktop';
      if (/mobi/i.test(userAgent)) device = 'Mobile';
      else if (/tablet/i.test(userAgent)) device = 'Tablet';
      
      const ip_address = (req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || '').split(',')[0].trim();

      const ticket = await SupportService.createTicket({
        user_id: req.user?.userId || null,
        full_name: fullName,
        email,
        phone,
        category,
        subject,
        description,
        attachmentBase64,
        attachmentName,
        preferred_contact: preferredContact,
        priority: priority || 'medium',
        ip_address,
        browser: userAgent.substring(0, 255),
        device
      });

      res.status(201).json({ success: true, message: 'Support ticket created successfully', data: ticket });
    } catch (error) {
      next(error);
    }
  }

  static async getMyTickets(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const tickets = await SupportService.getTicketsForUser(userId);
      res.status(200).json({ success: true, data: tickets });
    } catch (error) {
      next(error);
    }
  }

  static async getTicketDetails(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;
      const role = req.user!.role;
      const details = await SupportService.getTicketDetails(id as string, userId as string, role as string);
      res.status(200).json({ success: true, data: details });
    } catch (error) {
      next(error);
    }
  }

  static async postMessage(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const ticketId = req.params.id || req.body.ticketId;
      const { message, attachmentBase64, attachmentName } = req.body;
      const userId = req.user!.userId;
      const role = req.user!.role;

      if (!ticketId) {
        throw new BadRequestError('Ticket ID is required');
      }

      if (!message || !message.trim()) {
        throw new BadRequestError('Message body cannot be empty');
      }

      const msg = await SupportService.addMessage(ticketId, userId, role, message, attachmentBase64, attachmentName);
      res.status(201).json({ success: true, message: 'Message sent successfully', data: msg });
    } catch (error) {
      next(error);
    }
  }

  static async closeMyTicket(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;
      const ticket = await SupportService.userCloseTicket(id as string, userId as string);
      res.status(200).json({ success: true, message: 'Ticket closed successfully', data: ticket });
    } catch (error) {
      next(error);
    }
  }

  static async reopenMyTicket(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;
      const ticket = await SupportService.userReopenTicket(id as string, userId as string);
      res.status(200).json({ success: true, message: 'Ticket reopened successfully', data: ticket });
    } catch (error) {
      next(error);
    }
  }

  // --- ADMIN CONTROLLERS ---

  static async adminListTickets(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { status, priority, category, assignedAdmin, search, limit, offset } = req.query;
      const filter = {
        status: status as string,
        priority: priority as string,
        category: category as string,
        assignedAdmin: assignedAdmin as string,
        search: search as string,
        limit: limit ? parseInt(limit as string, 10) : 10,
        offset: offset ? parseInt(offset as string, 10) : 0
      };

      const result = await SupportService.getAllTicketsForAdmin(filter);
      res.status(200).json({ success: true, data: result.tickets, total: result.total });
    } catch (error) {
      next(error);
    }
  }

  static async adminUpdateTicket(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status, priority, category } = req.body;
      const ticket = await SupportService.adminUpdateTicket(id as string, { status, priority, category });
      res.status(200).json({ success: true, message: 'Ticket updated successfully', data: ticket });
    } catch (error) {
      next(error);
    }
  }

  static async adminAssignTicket(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const ticketId = req.params.id || req.body.ticketId;
      const { adminId } = req.body;
      
      if (!ticketId) throw new BadRequestError('Ticket ID is required');
      if (!adminId) throw new BadRequestError('Admin ID is required');
      
      const ticket = await SupportService.adminAssignTicket(ticketId, adminId);
      res.status(200).json({ success: true, message: 'Ticket assigned successfully', data: ticket });
    } catch (error) {
      next(error);
    }
  }

  static async adminDeleteTicket(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await SupportService.adminDeleteTicket(id as string);
      res.status(200).json({ success: true, message: 'Ticket deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  static async adminGetAnalytics(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const analytics = await SupportService.getAdminAnalytics();
      res.status(200).json({ success: true, data: analytics });
    } catch (error) {
      next(error);
    }
  }

  // --- IN-APP NOTIFICATIONS CONTROLLERS ---

  static async getNotifications(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const notifications = await SupportService.getNotificationsForUser(userId);
      res.status(200).json({ success: true, data: notifications });
    } catch (error) {
      next(error);
    }
  }

  static async markNotificationRead(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;
      const notification = await SupportService.readNotification(id as string, userId as string);
      res.status(200).json({ success: true, data: notification });
    } catch (error) {
      next(error);
    }
  }
}
