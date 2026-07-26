import { Router } from 'express';
import { AdminController } from '../controllers/AdminController';
import { requireAuth } from '../../../middlewares/authMiddleware';
import { requireRole } from '../../../middlewares/rbacMiddleware';
import { rateLimiter } from '../../../middlewares/rateLimiter';

const router = Router();

// Apply auth and admin role check on all admin routes
router.use(requireAuth);
router.use(requireRole(['admin']));

// Rate limiter for sensitive administration actions (30 reqs per minute)
const adminActionLimiter = rateLimiter('admin_action', 30, 60);

// Dashboard
router.get('/dashboard', AdminController.getDashboard);

// User Management
router.get('/users', AdminController.listUsers);
router.get('/users/:id', AdminController.getUserDetails);
router.patch('/users/:id/status', adminActionLimiter, AdminController.updateUserStatus);
router.delete('/users/:id', adminActionLimiter, AdminController.deleteUser);
router.post('/users/:id/reset-password', adminActionLimiter, AdminController.resetUserPassword);

// Specialized User lists
router.get('/employers', AdminController.listEmployers);
router.get('/workers', AdminController.listWorkers);

// Job Approvals & Management
router.get('/jobs', AdminController.listJobs);
router.get('/jobs/pending', AdminController.listPendingJobs);
router.get('/jobs/:id', AdminController.getJobDetails);
router.patch('/jobs/:id/approve', adminActionLimiter, AdminController.approveJob);
router.patch('/jobs/:id/reject', adminActionLimiter, AdminController.rejectJob);
router.patch('/jobs/:id/unpublish', adminActionLimiter, AdminController.unpublishJob);
router.delete('/jobs/:id', adminActionLimiter, AdminController.deleteJob);

// Categories
router.get('/categories', AdminController.listCategories);
router.post('/categories', adminActionLimiter, AdminController.createCategory);
router.put('/categories/:id', adminActionLimiter, AdminController.updateCategory);
router.delete('/categories/:id', adminActionLimiter, AdminController.deleteCategory);

// Skills
router.get('/skills', AdminController.listSkills);
router.post('/skills', adminActionLimiter, AdminController.createSkill);
router.put('/skills/:id', adminActionLimiter, AdminController.updateSkill);
router.delete('/skills/:id', adminActionLimiter, AdminController.deleteSkill);

// Reports
router.get('/reports', AdminController.listReports);
router.patch('/reports/:id/resolve', adminActionLimiter, AdminController.resolveReport);

// Audit logs & System settings
router.get('/audit', AdminController.listAuditLogs);
router.get('/settings', AdminController.getSettings);
router.put('/settings', adminActionLimiter, AdminController.updateSettings);

// Broadcast Notifications System
router.post('/broadcast', adminActionLimiter, AdminController.broadcastNotifications);

export default router;
