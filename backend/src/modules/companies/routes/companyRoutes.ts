import { Router } from 'express';
import { CompanyController } from '../controllers/CompanyController';
import { requireAuth } from '../../../middlewares/authMiddleware';
import { rateLimiter } from '../../../middlewares/rateLimiter';

const router = Router();

// Rate limiter for profile update actions
const updateLimiter = rateLimiter('company_update', 15, 60);

// Public Routes
router.get('/', CompanyController.getAllCompanies);
router.get('/:companyId/jobs', CompanyController.getCompanyJobs);
router.get('/:companyId', CompanyController.getCompanyById);

// Protected Employer Route
router.put('/:companyId', requireAuth, updateLimiter, CompanyController.updateCompanyProfile);

export default router;
