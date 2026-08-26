import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../../../shared/types';
import { SupportService } from '../../../../src/modules/support/services/SupportService';
import { BadRequestError } from '../../../../src/errors/AppError';

export class SupportController {
  static async createTicket(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = (req.headers['x-user-id'] as string) || req.user?.userId || null;
      const {
        fullName, full_name, email, userEmail, phone, category, subject, title, description, message,
        attachmentBase64, attachmentName, preferredContact, preferred_contact, priority
      } = req.body;

      const finalName = fullName || full_name || 'JobMarket User';
      const finalEmail = email || userEmail || '';
      const finalSubject = subject || title || '';
      const finalDesc = description || message || '';
      const finalCategory = category || 'General Technical Inquiry';
      const finalContact = preferredContact || preferred_contact || 'email';
      const finalPriority = String(priority || 'medium').toLowerCase();

      if (!finalName.trim() || !finalEmail.trim() || !finalSubject.trim() || !finalDesc.trim()) {
        throw new BadRequestError('Please provide your name, email, subject, and description');
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(finalEmail.trim())) {
        throw new BadRequestError('Invalid email address format');
      }

      let cleanPhone: string | null = null;
      if (phone) {
        const digits = String(phone).replace(/[^0-9]/g, '');
        if (digits.length >= 10) {
          cleanPhone = digits.slice(-10);
        }
      }

      const userAgent = req.headers['user-agent'] || '';
      let device = 'Desktop';
      if (/mobi/i.test(userAgent)) device = 'Mobile';
      else if (/tablet/i.test(userAgent)) device = 'Tablet';

      const ip_address = (req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || '').split(',')[0].trim();

      const data = await SupportService.createTicket({
        user_id: userId,
        full_name: finalName.trim(),
        email: finalEmail.trim(),
        phone: cleanPhone,
        category: finalCategory,
        subject: finalSubject.trim(),
        description: finalDesc.trim(),
        attachmentBase64,
        attachmentName,
        preferred_contact: finalContact,
        priority: finalPriority,
        ip_address,
        browser: userAgent.substring(0, 255),
        device
      });

      res.status(201).json({ success: true, message: 'Support ticket created successfully', data });
    } catch (error) {
      next(error);
    }
  }

  static async getMyTickets(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = (req.headers['x-user-id'] as string) || req.user?.userId;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

      const data = await SupportService.getTicketsForUser(userId);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async getTicketDetails(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = (req.headers['x-user-id'] as string) || req.user?.userId || '';
      const role = (req.headers['x-user-role'] as string) || req.user?.role || 'candidate';
      const { id } = req.params;
      const data = await SupportService.getTicketDetails(id, userId, role);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async postMessage(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = (req.headers['x-user-id'] as string) || req.user?.userId;
      const role = (req.headers['x-user-role'] as string) || req.user?.role || 'candidate';
      const ticketId = req.params.id || req.body.ticketId;
      const { message, attachmentBase64, attachmentName } = req.body;

      if (!ticketId) {
        throw new BadRequestError('Ticket ID is required');
      }

      if (!message || !message.trim()) {
        throw new BadRequestError('Message body cannot be empty');
      }

      const data = await SupportService.addMessage(
        ticketId,
        userId,
        role,
        message,
        attachmentBase64,
        attachmentName
      );
      res.status(201).json({ success: true, message: 'Message sent successfully', data });
    } catch (error) {
      next(error);
    }
  }

  static async closeMyTicket(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = (req.headers['x-user-id'] as string) || req.user?.userId;
      const { id } = req.params;
      const data = await SupportService.userCloseTicket(id, userId);
      res.status(200).json({ success: true, message: 'Ticket closed successfully', data });
    } catch (error) {
      next(error);
    }
  }

  static async reopenMyTicket(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = (req.headers['x-user-id'] as string) || req.user?.userId;
      const { id } = req.params;
      const data = await SupportService.userReopenTicket(id, userId);
      res.status(200).json({ success: true, message: 'Ticket reopened successfully', data });
    } catch (error) {
      next(error);
    }
  }

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

  static async adminGetAnalytics(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await SupportService.getAdminAnalytics();
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async adminUpdateTicket(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status, priority, category } = req.body;
      const data = await SupportService.adminUpdateTicket(id, { status, priority, category });
      res.status(200).json({ success: true, message: 'Ticket updated successfully', data });
    } catch (error) {
      next(error);
    }
  }

  static async adminAssignTicket(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const ticketId = req.params.id || req.body.ticketId;
      const adminId = req.body.adminId || req.body.assignedTo;

      if (!ticketId) throw new BadRequestError('Ticket ID is required');
      if (!adminId) throw new BadRequestError('Admin ID is required');

      const data = await SupportService.adminAssignTicket(ticketId, adminId);
      res.status(200).json({ success: true, message: 'Ticket assigned successfully', data });
    } catch (error) {
      next(error);
    }
  }

  static async adminDeleteTicket(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await SupportService.adminDeleteTicket(id);
      res.status(200).json({ success: true, message: 'Ticket deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}

