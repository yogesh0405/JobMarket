import { Request, Response, NextFunction } from 'express';
import { AdminRepository } from '../modules/admin/repositories/AdminRepository';
import { verifyAccessToken } from '../utils/jwt';

export const maintenanceMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const url = req.originalUrl || req.url;

    // 1. Always whitelist health checks, public settings, admin routes, and auth routes
    const isWhitelisted =
      url.startsWith('/health') ||
      url.startsWith('/api/health') ||
      url.startsWith('/api/v1/health') ||
      url.startsWith('/api/v1/admin') ||
      url.startsWith('/api/admin') ||
      url.startsWith('/api/v1/public/settings') ||
      url.startsWith('/api/v1/settings') ||
      url.startsWith('/api/settings') ||
      url.startsWith('/api/v1/auth/login') ||
      url.startsWith('/api/auth/login') ||
      url.startsWith('/api/v1/auth/refresh') ||
      url.startsWith('/api/auth/refresh') ||
      url.startsWith('/assets') ||
      !url.startsWith('/api'); // Static assets and frontend SPA pages bypass

    if (isWhitelisted) {
      return next();
    }

    // 2. Check maintenance mode state from system settings
    const settings = await AdminRepository.getSettings().catch(() => ({}));
    if (settings && settings.maintenance_mode === 'true') {
      // 3. Allow Admins to bypass maintenance mode if authenticated with Admin token
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
          const decoded = verifyAccessToken(token);
          if (decoded && (decoded.role || '').toLowerCase() === 'admin') {
            return next();
          }
        } catch {
          // Token invalid, proceed to maintenance block
        }
      }

      // Block all non-admin API access with 503
      return res.status(503).json({
        success: false,
        code: 'MAINTENANCE_MODE',
        error: 'System Under Maintenance',
        message: 'JobMarket is currently undergoing scheduled system maintenance. Please try again shortly.',
        contact: {
          email: settings.support_email || 'support@csnjobmarket.com',
          phone: settings.contact_number || '+91 240 2554000',
        },
      });
    }

    return next();
  } catch {
    return next();
  }
};
