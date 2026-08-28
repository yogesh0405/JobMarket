import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { SignupService } from '../../../../src/modules/auth/services/SignupService';
import { VerifyOTPService } from '../../../../src/modules/auth/services/VerifyOTPService';
import { LoginService } from '../../../../src/modules/auth/services/LoginService';
import { TokenService } from '../../../../src/modules/auth/services/TokenService';
import { LogoutService } from '../../../../src/modules/auth/services/LogoutService';
import { EmailService } from '../../../../src/modules/auth/services/EmailService';
import { Verify2FALoginService } from '../../../../src/modules/auth/services/Verify2FALoginService';
import { UserRepository } from '../../../../src/modules/auth/repositories/UserRepository';
import { SessionRepository } from '../../../../src/modules/auth/repositories/SessionRepository';
import { pool } from '../../../../shared/database/pool';
import { OtpStore, CacheService } from '../../../../shared/utils/redisCache';
import { S3Util } from '../../../../shared/utils/s3';
import { generateTokens } from '../../../../shared/utils/jwt';
import { AuthenticatedRequest } from '../../../../shared/types';

export function sanitizeUserForResponse(user: any) {
  if (!user) return user;
  const { password_hash, two_factor_secret, reset_token, refresh_token_hash, ...safeUser } = user;
  return safeUser;
}

export class AuthController {
  static async signup(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await SignupService.execute(req.body, req.ip, req.headers['user-agent']);
      res.status(200).json({
        success: true,
        message: result.message,
        data: { email: result.email },
        errors: null
      });
    } catch (error) {
      next(error);
    }
  }

  static async verifyOTP(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, otpCode } = req.body;
      const result = await VerifyOTPService.execute(email, otpCode, req.ip, req.headers['user-agent']);
      res.status(200).json({
        success: true,
        message: result.message,
        data: result.user ? sanitizeUserForResponse(result.user) : null,
        tokens: result.tokens
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, role } = req.body;
      const { extractClientIp } = await import('../../../../src/utils/deviceDetector');
      const clientIp = extractClientIp(req);
      const customDeviceName = req.headers['x-device-name'] as string;

      const result = await LoginService.execute(
        email,
        password,
        role,
        clientIp,
        req.headers['user-agent'],
        customDeviceName,
        req.headers
      );
      if ((result as any).require2FA || (result as any).requires2FA) {
        return res.status(200).json({
          success: true,
          message: result.message,
          require2FA: true,
          requires2FA: true,
          mfaToken: result.mfaToken,
          email: result.email,
          data: {
            require2FA: true,
            requires2FA: true,
            mfaToken: result.mfaToken,
            email: result.email,
            message: result.message
          }
        });
      }
      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user: sanitizeUserForResponse(result.user),
          ...(sanitizeUserForResponse(result.user) || {}),
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
          sessionId: result.sessionId,
        },
        tokens: result.tokens || {
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
          sessionId: result.sessionId,
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken, sessionId } = req.body;
      const activeSessionId = sessionId || (req.headers['x-session-id'] as string) || (req.headers['x-session-token'] as string);
      const tokens = await TokenService.refresh(refreshToken, activeSessionId, req.ip);
      res.status(200).json({ success: true, data: tokens, tokens });
    } catch (error) {
      next(error);
    }
  }

  static async refresh(req: Request, res: Response, next: NextFunction) {
    return AuthController.refreshToken(req, res, next);
  }

  static async logout(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.headers['x-user-id'] as string || req.user?.userId;
      const sessionId = req.headers['x-session-id'] as string || req.sessionId;
      if (sessionId) {
        await LogoutService.execute(sessionId);
      }
      res.status(200).json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
      next(error);
    }
  }

  static async logoutAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.headers['x-user-id'] as string || req.user?.userId;
      const currentSessionId = req.headers['x-session-id'] as string || req.sessionId;
      if (userId) {
        await SessionRepository.revokeAllUserSessions(userId, currentSessionId);
      }
      res.status(200).json({ success: true, message: 'Logged out from all devices successfully' });
    } catch (error) {
      next(error);
    }
  }

  static async me(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.headers['x-user-id'] as string || req.user?.userId;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      const user = await UserRepository.findById(userId);
      if (!user) return res.status(404).json({ error: 'User not found' });

      res.status(200).json({ success: true, data: sanitizeUserForResponse(user) });
    } catch (error) {
      next(error);
    }
  }

  static async getSessions(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.headers['x-user-id'] as string || req.user?.userId;
      const currentSessionId = (req.headers['x-session-id'] || req.sessionId) as string;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      const { detectDeviceFromHeaders, extractClientIp } = await import('../../../../src/utils/deviceDetector');
      const rawSessions = await SessionRepository.findActiveUserSessions(userId);
      const reqClientIp = extractClientIp(req);
      const reqUserAgent = (req.headers['user-agent'] as string) || '';

      let parsedSessions = rawSessions.map((s) => {
        const isCurrentById = currentSessionId ? s.id === currentSessionId : false;
        const detected = detectDeviceFromHeaders(
          s.user_agent,
          s.ip_address,
          s.device_name,
          isCurrentById ? req.headers : undefined
        );

        return {
          id: s.id,
          ipAddress: detected.ipAddress,
          ip_address: detected.ipAddress,
          deviceName: detected.deviceName,
          device_name: detected.deviceName,
          browser: detected.browser,
          os: detected.os,
          deviceType: detected.deviceType,
          device_type: detected.deviceType,
          location: detected.location,
          isCurrent: isCurrentById,
          is_current: isCurrentById,
          createdAt: s.created_at,
          created_at: s.created_at,
          lastUsedAt: s.last_used_at || s.created_at,
          last_used_at: s.last_used_at || s.created_at,
        };
      });

      // Check if the current calling device already has an active session in the list
      const detectedCalling = detectDeviceFromHeaders(
        reqUserAgent,
        reqClientIp,
        req.headers['x-device-name'] as string,
        req.headers
      );

      const hasMatchingCurrent = parsedSessions.some(
        (s) => (currentSessionId && s.id === currentSessionId) ||
               (s.os === detectedCalling.os && s.deviceType === detectedCalling.deviceType && s.ipAddress === reqClientIp)
      );

      if (!hasMatchingCurrent && userId) {
        const newSession = await SessionRepository.createSession(
          userId,
          'active_session',
          new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          detectedCalling.ipAddress,
          reqUserAgent,
          detectedCalling.deviceName
        ).catch(() => null);

        if (newSession) {
          parsedSessions.unshift({
            id: newSession.id,
            ipAddress: detectedCalling.ipAddress,
            ip_address: detectedCalling.ipAddress,
            deviceName: detectedCalling.deviceName,
            device_name: detectedCalling.deviceName,
            browser: detectedCalling.browser,
            os: detectedCalling.os,
            deviceType: detectedCalling.deviceType,
            device_type: detectedCalling.deviceType,
            location: detectedCalling.location,
            isCurrent: true,
            is_current: true,
            createdAt: newSession.created_at,
            created_at: newSession.created_at,
            lastUsedAt: newSession.created_at,
            last_used_at: newSession.created_at,
          });
        }
      }

      // Deduplicate by normalized (deviceName + ipAddress)
      const deduplicatedMap = new Map<string, any>();
      for (const sess of parsedSessions) {
        const normIp = (sess.ipAddress || '127.0.0.1').trim().toLowerCase();
        const normDevice = (sess.deviceName || `${sess.browser} on ${sess.os}`).trim().toLowerCase();
        const clusterKey = `${normDevice}___${normIp}`;

        if (!deduplicatedMap.has(clusterKey)) {
          deduplicatedMap.set(clusterKey, sess);
        } else {
          const existing = deduplicatedMap.get(clusterKey);
          const isCurr = existing.isCurrent || sess.isCurrent;
          const newest = new Date(sess.lastUsedAt).getTime() > new Date(existing.lastUsedAt).getTime() ? sess : existing;

          deduplicatedMap.set(clusterKey, {
            ...newest,
            isCurrent: isCurr,
            is_current: isCurr,
          });
        }
      }

      let deduplicatedSessions = Array.from(deduplicatedMap.values());

      // Ensure at least one session is marked as the current active device
      const hasCurrent = deduplicatedSessions.some((s) => s.isCurrent);
      if (!hasCurrent && deduplicatedSessions.length > 0) {
        let matchedIdx = deduplicatedSessions.findIndex((s) => s.ipAddress === reqClientIp);
        if (matchedIdx === -1) matchedIdx = 0;

        deduplicatedSessions = deduplicatedSessions.map((s, idx) => ({
          ...s,
          isCurrent: idx === matchedIdx,
          is_current: idx === matchedIdx,
        }));
      }

      // Sort current device to index 0, followed by most recent lastUsedAt
      deduplicatedSessions.sort((a, b) => {
        if (a.isCurrent && !b.isCurrent) return -1;
        if (!a.isCurrent && b.isCurrent) return 1;
        return new Date(b.lastUsedAt).getTime() - new Date(a.lastUsedAt).getTime();
      });

      res.status(200).json({ success: true, data: deduplicatedSessions });
    } catch (error) {
      next(error);
    }
  }

  static async revokeSession(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.headers['x-user-id'] as string || req.user?.userId;
      const { sessionId } = req.params;
      if (!userId || !sessionId) return res.status(400).json({ error: 'Bad Request' });

      await SessionRepository.revokeSession(sessionId);
      res.status(200).json({ success: true, message: 'Session revoked successfully' });
    } catch (error) {
      next(error);
    }
  }

  static async changePassword(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.headers['x-user-id'] as string || req.user?.userId;
      const { currentPassword, newPassword } = req.body;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      const user = await UserRepository.findById(userId);
      if (!user) return res.status(404).json({ error: 'User not found' });

      const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
      if (!isMatch) return res.status(400).json({ error: 'Current password is incorrect' });

      const newHash = await bcrypt.hash(newPassword, 12);
      await pool.query('UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [newHash, userId]);
      res.status(200).json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  static async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      if (!email) return res.status(400).json({ error: 'Email address is required' });
      const normalizedEmail = email.toLowerCase().trim();
      const user = await UserRepository.findByEmail(normalizedEmail);
      if (!user) return res.status(404).json({ error: 'No account found with this email address.' });

      const otpCode = crypto.randomInt(100000, 1000000).toString();
      const redisKey = `reset:OTP:${normalizedEmail}`;
      await OtpStore.setEx(redisKey, 600, JSON.stringify({ otp: otpCode, attempts: 0 }));

      await EmailService.sendPasswordResetOTP(normalizedEmail, otpCode, user.name);
      res.status(200).json({ success: true, message: 'A 6-digit OTP verification code has been sent to your registered email address.' });
    } catch (error) {
      next(error);
    }
  }

  static async verifyResetOTP(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, otpCode } = req.body;
      if (!email || !otpCode) return res.status(400).json({ error: 'Email and OTP code are required' });
      const normalizedEmail = email.toLowerCase().trim();
      const redisKey = `reset:OTP:${normalizedEmail}`;
      const payloadStr = await OtpStore.get(redisKey);
      if (!payloadStr) return res.status(400).json({ error: 'OTP has expired or is invalid.' });

      const payload = JSON.parse(String(payloadStr));
      if (payload.attempts >= 5) {
        await OtpStore.del(redisKey);
        return res.status(400).json({ error: 'Maximum OTP attempts reached.' });
      }
      if (payload.otp !== otpCode.trim()) {
        payload.attempts += 1;
        await OtpStore.setEx(redisKey, 600, JSON.stringify(payload));
        return res.status(400).json({ error: 'Invalid 6-digit OTP code' });
      }

      await OtpStore.setEx(`reset:VERIFIED:${normalizedEmail}`, 900, 'VERIFIED');
      res.status(200).json({ success: true, message: 'OTP verified successfully.' });
    } catch (error) {
      next(error);
    }
  }

  static async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, otpCode, newPassword } = req.body;
      if (!email || !otpCode || !newPassword) return res.status(400).json({ error: 'Email, OTP code, and new password are required' });
      if (newPassword.length < 6) return res.status(400).json({ error: 'New password must be at least 6 characters long' });

      const normalizedEmail = email.toLowerCase().trim();
      const redisKey = `reset:OTP:${normalizedEmail}`;
      const payloadStr = await OtpStore.get(redisKey);
      if (!payloadStr) return res.status(400).json({ error: 'OTP verification session expired.' });

      const payload = JSON.parse(String(payloadStr));
      if (payload.otp !== otpCode.trim()) return res.status(400).json({ error: 'Invalid OTP code' });

      const user = await UserRepository.findByEmail(normalizedEmail);
      if (!user) return res.status(404).json({ error: 'User account not found' });

      const newHash = await bcrypt.hash(newPassword, 12);
      await pool.query('UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [newHash, user.id]);
      await SessionRepository.revokeAllUserSessions(user.id);
      await OtpStore.del(redisKey);
      await OtpStore.del(`reset:VERIFIED:${normalizedEmail}`);

      res.status(200).json({ success: true, message: 'Password reset successfully.' });
    } catch (error) {
      next(error);
    }
  }

  static async verify2FALogin(req: Request, res: Response, next: NextFunction) {
    try {
      const { mfaToken, otpCode } = req.body;
      const result = await Verify2FALoginService.execute(mfaToken, otpCode, req.ip, req.headers['user-agent']);
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  static async toggle2FA(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
      let userId = (req.headers['x-user-id'] as string) || req.user?.userId || req.user?.id;
      if (token) {
        try {
          const { verifyAccessToken } = await import('../../../../src/utils/jwt');
          const decoded = verifyAccessToken(token);
          if (decoded && (decoded.userId || decoded.id)) {
            userId = decoded.userId || decoded.id;
          }
        } catch (_) {}
      }

      if (!userId || userId === '00000000-0000-0000-0000-000000000001') {
        return res.status(401).json({ success: false, error: 'Unauthorized: Active login session required to update 2FA.' });
      }

      const { enabled } = req.body;
      const isEnabled = Boolean(enabled);

      await pool.query('UPDATE users SET is_two_factor_enabled = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [isEnabled, userId]);
      await CacheService.invalidate(`user:profile:${userId}`);

      res.status(200).json({
        success: true,
        isTwoFactorEnabled: isEnabled,
        is_two_factor_enabled: isEnabled,
        message: isEnabled ? 'Two-Factor Authentication (2FA) is now ENABLED.' : 'Two-Factor Authentication (2FA) is now DISABLED.'
      });
    } catch (error) {
      next(error);
    }
  }

  static async googleAuth(req: Request, res: Response, next: NextFunction) {
    try {
      const { idToken, accessToken: googleAccessToken, role = 'candidate' } = req.body;
      let userEmail = req.body.email;
      let userName = req.body.name;
      let userPicture = req.body.picture;
      let userGoogleId = req.body.googleId;

      // 1. If googleAccessToken provided
      if (googleAccessToken && !userEmail) {
        try {
          const userinfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${googleAccessToken}` },
          });
          if (userinfoRes.ok) {
            const profile = await userinfoRes.json();
            userEmail = profile.email;
            userName = profile.name || profile.given_name || profile.email?.split('@')[0];
            userPicture = profile.picture || null;
            userGoogleId = profile.sub;
          }
        } catch (fetchErr: any) {
          console.error('Google accessToken verification error:', fetchErr.message);
        }
      }

      // 2. If idToken provided
      if (idToken) {
        try {
          const { OAuth2Client } = await import('google-auth-library');
          const googleClient = new OAuth2Client();
          const allowedAudiences = [
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_ANDROID_CLIENT_ID,
            '324729375491-nl1j4657c42169gptkb1tm8ttoqkce8q.apps.googleusercontent.com',
            '324729375491-21ieq19k1mu4krikbroub3afjibjrghd.apps.googleusercontent.com',
          ].filter(Boolean) as string[];

          const ticket = await googleClient.verifyIdToken({
            idToken,
            audience: allowedAudiences,
          });
          const payload = ticket.getPayload();
          if (payload && payload.email) {
            userEmail = payload.email;
            userName = payload.name || userName || payload.email.split('@')[0];
            userPicture = payload.picture || userPicture || null;
            userGoogleId = payload.sub;
          }
        } catch (verifyErr: any) {
          try {
            const tokeninfoRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
            if (tokeninfoRes.ok) {
              const info = await tokeninfoRes.json();
              if (info.email) {
                userEmail = info.email;
                userName = info.name || userName || info.email.split('@')[0];
                userPicture = info.picture || userPicture || null;
                userGoogleId = info.sub;
              }
            }
          } catch (_) {}
        }
      }

      if (!userEmail) {
        return res.status(401).json({ 
          success: false, 
          message: 'Google authentication failed: Could not verify Google credentials.' 
        });
      }

      let user = await UserRepository.findByEmail(userEmail.toLowerCase().trim());

      if (!user) {
        let permanentAvatarUrl: string | null = null;
        if (userPicture) {
          try {
            permanentAvatarUrl = await S3Util.uploadFromUrl(userPicture, 'profiles', `avatar_google_${userGoogleId || Date.now()}`);
          } catch (_) {
            permanentAvatarUrl = userPicture;
          }
        }

        const dummyPassword = await bcrypt.hash(`google_${userGoogleId || Date.now()}_${Math.random()}`, 12);
        user = await UserRepository.createUser({
          email: userEmail.toLowerCase().trim(),
          name: userName || userEmail.split('@')[0],
          password_hash: dummyPassword,
          role: role || 'candidate',
          status: 'ACTIVE',
          profile_picture_url: permanentAvatarUrl || null,
        } as any);
      } else if (!user.profile_picture_url && userPicture) {
        // Only if user had NO profile picture previously, store Google photo once in S3
        let permanentAvatarUrl = userPicture;
        try {
          permanentAvatarUrl = await S3Util.uploadFromUrl(userPicture, 'profiles', `avatar_google_${user.id}`);
        } catch (_) {}
        await pool.query('UPDATE users SET profile_picture_url = $1, updated_at = NOW() WHERE id = $2', [permanentAvatarUrl, user.id]);
        user.profile_picture_url = permanentAvatarUrl;
        await CacheService.del(`user:profile:${user.id}`).catch(() => {});
      }

      const { detectDeviceFromHeaders, extractClientIp } = await import('../../../../src/utils/deviceDetector');
      const clientIp = extractClientIp(req);
      const userAgent = (req.headers['user-agent'] as string) || '';
      const detected = detectDeviceFromHeaders(userAgent, clientIp);

      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const session = await SessionRepository.createSession(
        user.id,
        'temp_hash',
        expiresAt,
        detected.ipAddress,
        userAgent,
        detected.deviceName
      );

      const { accessToken, refreshToken } = generateTokens({ userId: user.id, role: user.role, sessionId: session.id });
      const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
      await pool.query('UPDATE sessions SET refresh_token_hash = $1 WHERE id = $2', [refreshTokenHash, session.id]);

      res.status(200).json({
        success: true,
        message: 'Google Sign-In successful!',
        data: {
          user: sanitizeUserForResponse(user),
          token: accessToken,
          refreshToken,
          sessionId: session?.id,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // 11. Google Mobile OAuth Initiation
  static async googleMobileLogin(req: Request, res: Response, next: NextFunction) {
    try {
      const role = (req.query.role as string) || 'candidate';
      const host = req.get('host') || 'jobmarket-ongn.onrender.com';
      const protocol = req.protocol === 'https' || host.includes('onrender.com') ? 'https' : req.protocol;
      const redirectUri = `${protocol}://${host}/api/v1/auth/google/callback`;
      const clientId = process.env.GOOGLE_CLIENT_ID || '324729375491-nl1j4657c42169gptkb1tm8ttoqkce8q.apps.googleusercontent.com';
      const googleUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=openid%20email%20profile&state=${encodeURIComponent(role)}&prompt=select_account`;
      res.redirect(googleUrl);
    } catch (err) {
      next(err);
    }
  }

  // 12. Google Mobile OAuth Callback Bridge
  static async googleCallback(req: Request, res: Response, next: NextFunction) {
    try {
      const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Authenticating...</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f8fafc; color: #1e293b; text-align: center; }
    .card { background: white; padding: 32px; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); max-width: 360px; }
    .spinner { width: 40px; height: 40px; border: 3px solid #e2e8f0; border-top-color: #2563eb; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 16px; }
    @keyframes spin { to { transform: rotate(360deg); } }
  </style>
</head>
<body>
  <div class="card">
    <div class="spinner"></div>
    <h3 style="margin: 0 0 8px; font-size: 18px;">Authenticating with JobMarket</h3>
    <p style="color: #64748b; font-size: 14px; margin: 0;">Returning to the app...</p>
  </div>
  <script>
    (function() {
      const hash = window.location.hash || '';
      const search = window.location.search || '';
      const targetUrl = 'jobmarket://oauth' + (hash || search || '');
      window.location.href = targetUrl;
      setTimeout(function() {
        window.location.href = targetUrl;
      }, 400);
    })();
  </script>
</body>
</html>`;
      res.setHeader('Content-Type', 'text/html');
      res.send(html);
    } catch (err) {
      next(err);
    }
  }
}
