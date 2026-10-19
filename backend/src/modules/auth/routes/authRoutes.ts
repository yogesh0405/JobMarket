import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { validate } from '../../../middlewares/validate';
import { requireAuth } from '../../../middlewares/authMiddleware';
import { rateLimiter } from '../../../middlewares/rateLimiter';
import {
  signupSchema,
  verifyOTPSchema,
  loginSchema,
  refreshTokenSchema
} from '../validators/authValidators';

const router = Router();

// Industry-standard auth rate limit: 120 requests per 60 seconds per IP
const authLimiter = rateLimiter('auth', 120, 60);

router.post('/signup', authLimiter, validate(signupSchema), AuthController.signup);
router.post('/verify-otp', authLimiter, validate(verifyOTPSchema), AuthController.verifyOTP);
router.post('/login', authLimiter, validate(loginSchema), AuthController.login);
router.post('/google', authLimiter, AuthController.googleAuth);
router.get('/google/mobile-login', AuthController.googleMobileLogin);
router.get('/google/callback', AuthController.googleCallback);
router.post('/refresh', validate(refreshTokenSchema), AuthController.refresh);

// Forgot Password Workflow (Email OTP)
router.post('/forgot-password', authLimiter, AuthController.forgotPassword);
router.post('/verify-reset-otp', authLimiter, AuthController.verifyResetOTP);
router.post('/reset-password', authLimiter, AuthController.resetPassword);

// Protected routes
router.post('/logout', requireAuth, AuthController.logout);
router.post('/logout-all', requireAuth, AuthController.logoutAll);
router.get('/me', requireAuth, AuthController.me);
router.put('/profile', requireAuth, AuthController.updateProfile);
router.post('/profile/picture', requireAuth, AuthController.uploadProfilePicture);
router.delete('/profile/picture', requireAuth, AuthController.deleteProfilePicture);
router.get('/resume', requireAuth, AuthController.getResume);
router.get('/resume/signature', requireAuth, AuthController.getResumeSignature);
router.post('/resume', requireAuth, AuthController.uploadResume);
router.delete('/resume', requireAuth, AuthController.deleteResume);

// 2FA Routes
router.post('/2fa/verify-login', authLimiter, AuthController.verify2FALogin);
router.post('/2fa/toggle', requireAuth, AuthController.toggle2FA);

// Security & Sessions (Protected)
router.post('/change-password', requireAuth, AuthController.changePassword);
router.post('/delete-account/request-otp', requireAuth, authLimiter, AuthController.requestDeleteAccountOTP);
router.delete('/delete-account', requireAuth, AuthController.deleteAccount);
router.post('/delete-account', requireAuth, AuthController.deleteAccount);
router.get('/sessions', requireAuth, AuthController.getSessions);
router.delete('/sessions/:sessionId', requireAuth, AuthController.revokeSession);
// Public Profile (No Auth required for shared link)
router.get('/public-profile/:id', AuthController.getPublicProfile);

export default router;
