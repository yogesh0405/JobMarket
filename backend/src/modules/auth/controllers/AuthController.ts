import { Request, Response, NextFunction } from 'express';
import { SignupService } from '../services/SignupService';
import { VerifyOTPService } from '../services/VerifyOTPService';
import { LoginService } from '../services/LoginService';
import { TokenService } from '../services/TokenService';
import { LogoutService } from '../services/LogoutService';
import { UpdateProfileService } from '../services/UpdateProfileService';
import { AuthenticatedRequest } from '../../../middlewares/authMiddleware';
import { UserRepository } from '../repositories/UserRepository';

export class AuthController {
  static async signup(req: Request, res: Response, next: NextFunction) {
    try {
      const ip = req.ip;
      const userAgent = req.headers['user-agent'];
      const result = await SignupService.execute(req.body, ip, userAgent);
      res.status(200).json({
        success: true,
        message: result.message,
        data: {
          email: result.email
        },
        errors: null
      });
    } catch (error) {
      next(error);
    }
  }

  static async verifyOTP(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, otpCode } = req.body;
      const ip = req.ip;
      const userAgent = req.headers['user-agent'];
      
      const result = await VerifyOTPService.execute(email, otpCode, ip, userAgent);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, role } = req.body;
      const ip = req.ip;
      const userAgent = req.headers['user-agent'];

      const result = await LoginService.execute(email, password, role, ip, userAgent);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken, sessionId } = req.body;
      const ip = req.ip;

      const result = await TokenService.refresh(refreshToken, sessionId, ip);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async logout(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { sessionId } = req.body; // Assuming client sends sessionId they want to logout from
      const userId = req.user!.userId;
      const ip = req.ip;
      const userAgent = req.headers['user-agent'];

      if (!sessionId) {
        return res.status(400).json({ error: 'sessionId is required' });
      }

      await LogoutService.execute(sessionId, userId, ip, userAgent);
      res.status(200).json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
      next(error);
    }
  }

  static async logoutAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { currentSessionId } = req.body; // Optional
      const userId = req.user!.userId;
      const ip = req.ip;
      const userAgent = req.headers['user-agent'];

      await LogoutService.logoutAll(userId, currentSessionId, ip, userAgent);
      res.status(200).json({ success: true, message: 'Logged out from all devices successfully' });
    } catch (error) {
      next(error);
    }
  }

  static async me(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const user = await UserRepository.findById(userId);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const { password_hash, ...safeUser } = user;
      res.status(200).json({ success: true, data: safeUser });
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const profileData = req.body;
      
      const result = await UpdateProfileService.execute(userId, profileData);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}
