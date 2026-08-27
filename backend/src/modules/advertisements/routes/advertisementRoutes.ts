import { Router } from 'express';
import { requireAuth } from '../../../middlewares/authMiddleware';
import { requireRole } from '../../../middlewares/rbacMiddleware';
import { AdvertisementController } from '../controllers/advertisementController';

// 1. Homepage & Public Routes
export const homeAdvertisementRouter = Router();
homeAdvertisementRouter.get('/advertisements', AdvertisementController.getPublicAdvertisements);
homeAdvertisementRouter.post('/advertisements/:id/click', AdvertisementController.recordClick);
homeAdvertisementRouter.post('/advertisements/:id/view', AdvertisementController.recordView);

// 2. Employer Routes
export const employerAdvertisementRouter = Router();
employerAdvertisementRouter.use(requireAuth, requireRole(['employer']));
employerAdvertisementRouter.post('/advertisements', AdvertisementController.createEmployerAdvertisement);
employerAdvertisementRouter.get('/advertisements', AdvertisementController.getEmployerAdvertisements);
employerAdvertisementRouter.get('/advertisements/analytics', AdvertisementController.getEmployerAnalytics);
employerAdvertisementRouter.get('/advertisements/:id', AdvertisementController.getEmployerAdvertisementById);
employerAdvertisementRouter.put('/advertisements/:id', AdvertisementController.updateEmployerAdvertisement);
employerAdvertisementRouter.delete('/advertisements/:id', AdvertisementController.deleteEmployerAdvertisement);

// 3. Admin Routes
export const adminAdvertisementRouter = Router();
adminAdvertisementRouter.use(requireAuth, requireRole(['admin']));
adminAdvertisementRouter.get('/advertisements', AdvertisementController.getAllAdminAdvertisements);
adminAdvertisementRouter.get('/advertisements/pending', AdvertisementController.getPendingAdminAdvertisements);
adminAdvertisementRouter.get('/advertisements/analytics', AdvertisementController.getAdminAnalytics);
adminAdvertisementRouter.post('/advertisements', AdvertisementController.createAdminAdvertisement);
adminAdvertisementRouter.patch('/advertisements/:id/approve', AdvertisementController.approveAdvertisement);
adminAdvertisementRouter.patch('/advertisements/:id/reject', AdvertisementController.rejectAdvertisement);
adminAdvertisementRouter.patch('/advertisements/:id/unpublish', AdvertisementController.unpublish);
adminAdvertisementRouter.delete('/advertisements/:id', AdvertisementController.deleteAdminAdvertisement);
