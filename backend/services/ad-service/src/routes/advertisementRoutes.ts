import { Router } from 'express';
import { AdvertisementController } from '../controllers/AdvertisementController';

export const homeAdvertisementRouter = Router();
homeAdvertisementRouter.get('/advertisements', AdvertisementController.getPublicAdvertisements);
homeAdvertisementRouter.post('/advertisements/:id/click', AdvertisementController.recordClick);
homeAdvertisementRouter.post('/advertisements/:id/view', AdvertisementController.recordView);

export const employerAdvertisementRouter = Router();
employerAdvertisementRouter.post('/advertisements', AdvertisementController.createEmployerAdvertisement);
employerAdvertisementRouter.get('/advertisements', AdvertisementController.getEmployerAdvertisements);
employerAdvertisementRouter.get('/advertisements/analytics', AdvertisementController.getEmployerAnalytics);
employerAdvertisementRouter.put('/advertisements/:id', AdvertisementController.updateEmployerAdvertisement);
employerAdvertisementRouter.delete('/advertisements/:id', AdvertisementController.deleteEmployerAdvertisement);

export const adminAdvertisementRouter = Router();
adminAdvertisementRouter.get('/advertisements', AdvertisementController.getAllAdminAdvertisements);
adminAdvertisementRouter.get('/advertisements/pending', AdvertisementController.getPendingAdminAdvertisements);
adminAdvertisementRouter.get('/advertisements/analytics', AdvertisementController.getAdminAnalytics);
adminAdvertisementRouter.post('/advertisements', AdvertisementController.createAdminAdvertisement);
adminAdvertisementRouter.patch('/advertisements/:id/approve', AdvertisementController.approveAdvertisement);
adminAdvertisementRouter.patch('/advertisements/:id/reject', AdvertisementController.rejectAdvertisement);
adminAdvertisementRouter.patch('/advertisements/:id/unpublish', AdvertisementController.unpublish);
adminAdvertisementRouter.delete('/advertisements/:id', AdvertisementController.deleteAdminAdvertisement);
