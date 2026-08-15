import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { validate } from '../../../../shared/middlewares/validate';
import { rateLimiter } from '../../../../shared/middlewares/rateLimiter';
import {
  signupSchema,
  verifyOTPSchema,
  loginSchema,
  refreshTokenSchema
} from '../validators/authValidators';

const router = Router();

const authLimiter = rateLimiter('auth', 20, 60);

router.post('/signup', authLimiter, validate(signupSchema), AuthController.signup);
router.post('/verify-otp', authLimiter, validate(verifyOTPSchema), AuthController.verifyOTP);
router.post('/login', authLimiter, validate(loginSchema), AuthController.login);
router.post('/google', authLimiter, AuthController.googleAuth);
router.post('/refresh', validate(refreshTokenSchema), AuthController.refresh);

router.post('/forgot-password', authLimiter, AuthController.forgotPassword);
router.post('/verify-reset-otp', authLimiter, AuthController.verifyResetOTP);
router.post('/reset-password', authLimiter, AuthController.resetPassword);

router.post('/logout', AuthController.logout);
router.post('/logout-all', AuthController.logoutAll);

router.post('/2fa/verify-login', authLimiter, AuthController.verify2FALogin);
router.post('/2fa/toggle', AuthController.toggle2FA);

router.post('/change-password', AuthController.changePassword);
router.get('/sessions', AuthController.getSessions);
router.delete('/sessions/:sessionId', AuthController.revokeSession);

export default router;
