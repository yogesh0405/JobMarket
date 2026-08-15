import { Router } from 'express';
import { AdminController } from '../controllers/AdminController';

const router = Router();

router.get('/dashboard', AdminController.getDashboard);

router.get('/users', AdminController.listUsers);
router.get('/users/:id', AdminController.getUserDetails);
router.patch('/users/:id/status', AdminController.updateUserStatus);
router.delete('/users/:id', AdminController.deleteUser);
router.post('/users/:id/reset-password', AdminController.resetUserPassword);

router.get('/employers', AdminController.listEmployers);
router.get('/workers', AdminController.listWorkers);

router.get('/jobs', AdminController.listJobs);
router.get('/jobs/pending', AdminController.listPendingJobs);
router.get('/jobs/:id', AdminController.getJobDetails);
router.patch('/jobs/:id/approve', AdminController.approveJob);
router.patch('/jobs/:id/reject', AdminController.rejectJob);
router.patch('/jobs/:id/unpublish', AdminController.unpublishJob);
router.delete('/jobs/:id', AdminController.deleteJob);

router.get('/categories', AdminController.listCategories);
router.post('/categories', AdminController.createCategory);
router.put('/categories/:id', AdminController.updateCategory);
router.delete('/categories/:id', AdminController.deleteCategory);

router.get('/skills', AdminController.listSkills);
router.post('/skills', AdminController.createSkill);
router.put('/skills/:id', AdminController.updateSkill);
router.delete('/skills/:id', AdminController.deleteSkill);

router.get('/reports', AdminController.listReports);
router.patch('/reports/:id/resolve', AdminController.resolveReport);

router.get('/audit', AdminController.listAuditLogs);
router.get('/settings', AdminController.getSettings);
router.put('/settings', AdminController.updateSettings);

router.post('/broadcast', AdminController.broadcastNotifications);

export default router;
