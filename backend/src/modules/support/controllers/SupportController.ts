import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../../middlewares/authMiddleware';
import { SupportService } from '../services/SupportService';
import { BadRequestError } from '../../../errors/AppError';
import { pool } from '../../../config/database/pool';

export class SupportController {
  // --- USER CONTROLLERS ---

  static async createTicket(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId || null;
      const {
        fullName, full_name, email, userEmail, phone, category, subject, title, description, message,
        attachmentBase64, attachmentName, preferredContact, preferred_contact, priority
      } = req.body;

      let finalName = (fullName || full_name || '').trim();
      let finalEmail = (email || userEmail || '').trim();
      const finalSubject = (subject || title || '').trim();
      const finalDesc = (description || message || '').trim();
      const finalCategory = category || 'General Technical Inquiry';
      const finalContact = preferredContact || preferred_contact || 'email';
      const finalPriority = String(priority || '').toLowerCase() === 'high' ? 'high' : 'medium';

      let cleanPhone: string | null = null;
      if (phone) {
        const digits = String(phone).replace(/[^0-9]/g, '');
        if (digits.length >= 10) {
          cleanPhone = digits.slice(-10);
        }
      }

      if (userId) {
        try {
          const userLookup = await pool.query('SELECT name, email, phone FROM users WHERE id = $1', [userId]);
          if (userLookup.rows.length > 0) {
            const u = userLookup.rows[0];
            if (!finalName) finalName = u.name || 'JobMarket User';
            if (!finalEmail) finalEmail = u.email || '';
            if (!cleanPhone && u.phone) {
              const uDigits = String(u.phone).replace(/[^0-9]/g, '');
              if (uDigits.length >= 10) cleanPhone = uDigits.slice(-10);
            }
          }
        } catch (_) {}
      }

      if (!finalName) finalName = 'JobMarket User';
      if (!finalEmail) finalEmail = 'user@jobmarket.com';

      if (!finalSubject || !finalDesc) {
        throw new BadRequestError('Please provide a subject title and description');
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (finalEmail && !emailRegex.test(finalEmail)) {
        throw new BadRequestError('Invalid email address format');
      }

      // Parse user agent
      const userAgent = req.headers['user-agent'] || '';
      let device = 'Desktop';
      if (/mobi/i.test(userAgent)) device = 'Mobile';
      else if (/tablet/i.test(userAgent)) device = 'Tablet';
      
      const ip_address = (req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || '').split(',')[0].trim();
      const finalAttachmentBase64 = attachmentBase64 || req.body.attachment || req.body.attachment_url || null;
      const finalAttachmentName = attachmentName || req.body.attachment_name || (finalAttachmentBase64 ? 'attachment.jpg' : null);

      const ticket = await SupportService.createTicket({
        user_id: userId,
        full_name: finalName.trim(),
        email: finalEmail.trim(),
        phone: cleanPhone,
        category: finalCategory,
        subject: finalSubject.trim(),
        description: finalDesc.trim(),
        attachmentBase64: finalAttachmentBase64,
        attachmentName: finalAttachmentName,
        preferred_contact: finalContact,
        priority: finalPriority,
        ip_address,
        browser: userAgent.substring(0, 255),
        device
      });

      res.status(201).json({
        success: true,
        message: 'Support ticket created successfully',
        data: ticket
      });
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
      const {
        message,
        text,
        attachmentBase64,
        attachment,
        attachment_url,
        attachmentName,
        attachment_name
      } = req.body;
      const userId = req.user?.userId || (req.user as any)?.id || null;
      const role = req.user?.role || 'candidate';

      if (!ticketId) {
        throw new BadRequestError('Ticket ID is required');
      }

      if (!userId) {
        throw new BadRequestError('User identification is required to post a message');
      }

      const finalAttachment = attachmentBase64 || attachment || attachment_url || null;
      const finalAttachmentName = attachmentName || attachment_name || (finalAttachment ? 'attachment.jpg' : null);
      let finalMessage = (message || text || '').trim();

      if (!finalMessage && !finalAttachment) {
        throw new BadRequestError('Message or attachment is required');
      }

      if (!finalMessage) {
        finalMessage = '📎 Attachment';
      }

      const msg = await SupportService.addMessage(
        ticketId,
        userId,
        role,
        finalMessage,
        finalAttachment,
        finalAttachmentName
      );
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
