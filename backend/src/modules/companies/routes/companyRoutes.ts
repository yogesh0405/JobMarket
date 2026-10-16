import { Router } from 'express';
import { CompanyController } from '../controllers/CompanyController';
import { requireAuth, optionalAuth } from '../../../middlewares/authMiddleware';
import { rateLimiter } from '../../../middlewares/rateLimiter';

const router = Router();

// Rate limiter for profile update actions
const updateLimiter = rateLimiter('company_update', 15, 60);
const followLimiter = rateLimiter('company_follow', 30, 60);

// Followed companies by current user (defined before :companyId)
router.get('/following/my', requireAuth, CompanyController.getFollowedCompanies);

// Public Routes
router.get('/', CompanyController.getAllCompanies);
router.get('/:companyId/jobs', CompanyController.getCompanyJobs);
router.get('/:companyId/follow-status', optionalAuth, CompanyController.getFollowStatus);
router.get('/:companyId', CompanyController.getCompanyById);

// Follow / Unfollow Routes
router.post('/:companyId/toggle-follow', requireAuth, followLimiter, CompanyController.toggleFollow);
router.post('/:companyId/follow', requireAuth, followLimiter, CompanyController.toggleFollow);
router.delete('/:companyId/follow', requireAuth, followLimiter, CompanyController.toggleFollow);

// Protected Employer Route
router.put('/:companyId', requireAuth, updateLimiter, CompanyController.updateCompanyProfile);

export default router;
