import { SupportRepository, SupportTicket, SupportMessage, InAppNotification } from '../repositories/SupportRepository';
import { CloudinaryUtil } from '../../../utils/cloudinary';
import { EmailService } from '../../auth/services/EmailService';
import { BadRequestError, ForbiddenError, NotFoundError } from '../../../errors/AppError';
import { logger } from '../../../utils/logger';

import { pool } from '../../../config/database/pool';

export class SupportService {
  static async createTicket(ticketData: {
    user_id: string | null;
    full_name: string;
    email: string;
    phone?: string | null;
    category: string;
    subject: string;
    description: string;
    attachmentBase64?: string;
    attachmentName?: string;
    preferred_contact: string;
    priority: 'low' | 'medium' | 'high' | string;
    ip_address?: string | null;
    browser?: string | null;
    device?: string | null;
  }): Promise<SupportTicket> {
    let attachmentUrl: string | null = null;
    
    if (ticketData.attachmentBase64) {
      try {
        const folder = 'support';
        const timestamp = Date.now();
        const cleanName = ticketData.attachmentName ? ticketData.attachmentName.replace(/[^a-zA-Z0-9]/g, '_') : 'file';
        const publicId = `ticket_attach_${timestamp}_${cleanName}`.substring(0, 100);
        
        attachmentUrl = await CloudinaryUtil.uploadFile(ticketData.attachmentBase64, folder, publicId);
      } catch (err: any) {
        logger.error('Failed to upload ticket attachment to Cloudinary:', err);
        throw new BadRequestError(`Failed to save attachment: ${err.message}`);
      }
    }

    // Verify user_id is a valid UUID and exists in DB
    let validUserId: string | null = null;
    if (ticketData.user_id && typeof ticketData.user_id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(ticketData.user_id)) {
      try {
        const userCheck = await pool.query('SELECT id FROM users WHERE id = $1', [ticketData.user_id]);
        if (userCheck.rows.length > 0) {
          validUserId = ticketData.user_id;
        }
      } catch (_) {
        validUserId = null;
      }
    }

    const priorityNorm = String(ticketData.priority || 'medium').toLowerCase();
    const safePriority: 'low' | 'medium' | 'high' = (priorityNorm === 'low' || priorityNorm === 'high') ? priorityNorm : 'medium';

    const ticket = await SupportRepository.createTicket({
      user_id: validUserId,
      full_name: ticketData.full_name,
      email: ticketData.email,
      phone: ticketData.phone || null,
      category: ticketData.category || 'General Technical Inquiry',
      subject: ticketData.subject,
      description: ticketData.description,
      attachment: attachmentUrl,
      preferred_contact: ticketData.preferred_contact || 'email',
      priority: safePriority,
      status: 'open',
      assigned_admin: null,
      ip_address: ticketData.ip_address || null,
      browser: ticketData.browser || null,
      device: ticketData.device || null
    });

    // Send email notification to user via Brevo
    try {
      await EmailService.sendSupportTicketNotification(
        ticket.email,
        ticket.full_name,
        ticket.ticket_number,
        ticket.subject,
        ticket.status,
        'created'
      );
    } catch (err) {
      logger.error(`Failed to send ticket creation email to ${ticket.email}:`, err);
    }

    // Create in-app notification if user is logged in
    if (ticket.user_id) {
      try {
        await SupportRepository.createNotification({
          user_id: ticket.user_id,
          title: 'Ticket Created',
          message: `Your support ticket ${ticket.ticket_number} has been created successfully.`,
          link: `#/contact`
        });
      } catch (err) {
        logger.error('Failed to create ticket creation in-app notification:', err);
      }
    }

    return ticket;
  }

  static async getTicketsForUser(userId: string): Promise<SupportTicket[]> {
    return SupportRepository.findByUserId(userId);
  }

  static async getTicketDetails(id: string, userId: string, role: string): Promise<{ ticket: SupportTicket; messages: SupportMessage[] }> {
    const ticket = await SupportRepository.findById(id);
    if (!ticket) throw new NotFoundError('Support ticket not found');

    // Authorization check
    if (role !== 'admin' && ticket.user_id !== userId) {
      throw new ForbiddenError('You do not have access to view this ticket');
    }

    const messages = await SupportRepository.findMessagesByTicketId(id);
    
    // Mark messages as read/seen
    await SupportRepository.markMessagesAsSeen(id, userId);

    return { ticket, messages };
  }

  static async addMessage(
    ticketId: string, 
    senderId: string, 
    role: string, 
    messageText: string, 
    attachmentBase64?: string,
    attachmentName?: string
  ): Promise<SupportMessage> {
    const ticket = await SupportRepository.findById(ticketId);
    if (!ticket) throw new NotFoundError('Support ticket not found');

    // Authorization check
    if (role !== 'admin' && ticket.user_id !== senderId) {
      throw new ForbiddenError('You do not have access to reply to this ticket');
    }

    let attachmentUrl: string | null = null;
    if (attachmentBase64) {
      try {
        const folder = 'support';
        const timestamp = Date.now();
        const cleanName = attachmentName ? attachmentName.replace(/[^a-zA-Z0-9]/g, '_') : 'reply_file';
        const publicId = `reply_attach_${timestamp}_${cleanName}`.substring(0, 100);
        
        attachmentUrl = await CloudinaryUtil.uploadFile(attachmentBase64, folder, publicId);
      } catch (err: any) {
        logger.error('Failed to upload reply attachment to Cloudinary:', err);
        throw new BadRequestError(`Failed to save attachment: ${err.message}`);
      }
    }

    const message = await SupportRepository.createMessage({
      ticket_id: ticketId,
      sender_id: senderId,
      message: messageText,
      attachment: attachmentUrl
    });

    // Update ticket status
    let nextStatus = ticket.status;
    if (role === 'admin') {
      nextStatus = 'waiting_for_user';
    } else {
      nextStatus = 'in_progress';
    }

    await SupportRepository.updateTicket(ticketId, { status: nextStatus });

    // Send notifications if Admin replied
    if (role === 'admin') {
      try {
        // Send email
        await EmailService.sendSupportTicketNotification(
          ticket.email,
          ticket.full_name,
          ticket.ticket_number,
          ticket.subject,
          nextStatus,
          'reply',
          messageText
        );
      } catch (err) {
        logger.error('Failed to send admin reply email:', err);
      }

      if (ticket.user_id) {
        try {
          // Send in-app notification
          await SupportRepository.createNotification({
            user_id: ticket.user_id,
            title: 'New Support Reply',
            message: `A support agent has replied to your ticket ${ticket.ticket_number}.`,
            link: `#/contact`
          });
        } catch (err) {
          logger.error('Failed to send admin reply in-app notification:', err);
        }
      }
    }

    return message;
  }

  static async userCloseTicket(ticketId: string, userId: string): Promise<SupportTicket> {
    const ticket = await SupportRepository.findById(ticketId);
    if (!ticket) throw new NotFoundError('Support ticket not found');

    if (ticket.user_id !== userId) {
      throw new ForbiddenError('You do not have permission to close this ticket');
    }

    const updated = await SupportRepository.updateTicket(ticketId, { status: 'closed' });
    if (!updated) throw new Error('Failed to update ticket status');

    // Notify user
    try {
      await EmailService.sendSupportTicketNotification(
        ticket.email,
        ticket.full_name,
        ticket.ticket_number,
        ticket.subject,
        'closed',
        'closed'
      );
    } catch (err) {
      logger.error('Failed to send ticket closure email:', err);
    }

    return updated;
  }

  static async userReopenTicket(ticketId: string, userId: string): Promise<SupportTicket> {
    const ticket = await SupportRepository.findById(ticketId);
    if (!ticket) throw new NotFoundError('Support ticket not found');

    if (ticket.user_id !== userId) {
      throw new ForbiddenError('You do not have permission to reopen this ticket');
    }

    const updated = await SupportRepository.updateTicket(ticketId, { status: 'open' });
    if (!updated) throw new Error('Failed to update ticket status');

    return updated;
  }

  // --- ADMIN ACTIONS ---

  static async getAllTicketsForAdmin(filters: any): Promise<any> {
    return SupportRepository.findAllForAdmin(filters);
  }

  static async adminUpdateTicket(id: string, updates: {
    status?: 'open' | 'in_progress' | 'waiting_for_user' | 'resolved' | 'closed';
    priority?: 'low' | 'medium' | 'high';
    category?: string;
  }): Promise<SupportTicket> {
    const ticket = await SupportRepository.findById(id);
    if (!ticket) throw new NotFoundError('Support ticket not found');

    const updated = await SupportRepository.updateTicket(id, updates);
    if (!updated) throw new Error('Failed to update ticket');

    // If status changed to resolved or closed, notify user
    if (updates.status && updates.status !== ticket.status) {
      const type = updates.status === 'resolved' ? 'resolved' : (updates.status === 'closed' ? 'closed' : 'status_changed');
      
      try {
        await EmailService.sendSupportTicketNotification(
          ticket.email,
          ticket.full_name,
          ticket.ticket_number,
          ticket.subject,
          updates.status,
          type
        );
      } catch (err) {
        logger.error('Failed to send status update email:', err);
      }

      if (ticket.user_id) {
        try {
          await SupportRepository.createNotification({
            user_id: ticket.user_id,
            title: 'Support Ticket Updated',
            message: `Your ticket ${ticket.ticket_number} status has been updated to ${updates.status}.`,
            link: `#/contact`
          });
        } catch (err) {
          logger.error('Failed to create status update in-app notification:', err);
        }
      }
    }

    return updated;
  }

  static async adminAssignTicket(id: string, adminId: string): Promise<SupportTicket> {
    const ticket = await SupportRepository.findById(id);
    if (!ticket) throw new NotFoundError('Support ticket not found');

    const updated = await SupportRepository.updateTicket(id, { assigned_admin: adminId });
    if (!updated) throw new Error('Failed to assign ticket');

    return updated;
  }

  static async adminDeleteTicket(id: string): Promise<void> {
    const success = await SupportRepository.deleteTicket(id);
    if (!success) throw new NotFoundError('Support ticket not found');
  }

  static async getAdminAnalytics(): Promise<any> {
    return SupportRepository.getAnalytics();
  }

  // --- IN-APP NOTIFICATIONS ---

  static async getNotificationsForUser(userId: string): Promise<InAppNotification[]> {
    return SupportRepository.findNotificationsByUserId(userId);
  }

  static async readNotification(id: string, userId: string): Promise<InAppNotification> {
    const notification = await SupportRepository.markNotificationAsRead(id, userId);
    if (!notification) throw new NotFoundError('Notification not found');
    return notification;
  }
}
