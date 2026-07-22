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

// Apply rate limiting specifically for auth endpoints
const authLimiter = rateLimiter('auth', 20, 60); // 20 requests per minute per IP

router.post('/signup', authLimiter, validate(signupSchema), AuthController.signup);
router.post('/verify-otp', authLimiter, validate(verifyOTPSchema), AuthController.verifyOTP);
router.post('/login', authLimiter, validate(loginSchema), AuthController.login);
router.post('/refresh', validate(refreshTokenSchema), AuthController.refresh);

// Protected routes
router.post('/logout', requireAuth, AuthController.logout);
router.post('/logout-all', requireAuth, AuthController.logoutAll);
router.get('/me', requireAuth, AuthController.me);
router.put('/profile', requireAuth, AuthController.updateProfile);

export default router;
