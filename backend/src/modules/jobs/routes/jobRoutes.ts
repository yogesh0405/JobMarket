import { Router } from 'express';
import { JobController } from '../controllers/JobController';
import { requireAuth } from '../../../middlewares/authMiddleware';
import { rateLimiter } from '../../../middlewares/rateLimiter';

const router = Router();

// Rate limiter for posting/updating/applying actions (15 actions per minute)
const actionLimiter = rateLimiter('job_action', 15, 60);

// Map & Geographic Search Routes (Must be declared before :id route)
router.get('/map', JobController.getMapJobs);
router.get('/nearby', JobController.getNearbyJobs);
router.post('/geocode', JobController.triggerGeocoding);
router.post('/resolve-map-url', JobController.resolveMapUrl);
router.get('/admin/map-analytics', requireAuth, JobController.getAdminMapAnalytics);

// Public Routes
router.get('/', JobController.getJobs);
router.get('/meta/categories', JobController.getCategories);
router.get('/meta/skills', JobController.getSkills);
router.get('/applied/my-applications', requireAuth, JobController.getMyAppliedJobs);
router.get('/:id', JobController.getJobById);

// Protected Routes
router.get('/my-jobs/all', requireAuth, JobController.getMyJobs);
router.post('/', requireAuth, actionLimiter, JobController.createJob);
router.put('/:id', requireAuth, actionLimiter, JobController.updateJob);
router.delete('/:id', requireAuth, actionLimiter, JobController.deleteJob);
router.post('/:id/apply', requireAuth, actionLimiter, JobController.applyToJob);
router.post('/:id/save', requireAuth, actionLimiter, JobController.toggleSaveJob);
router.get('/:id/applicants', requireAuth, JobController.getApplicantsForJob);
router.patch('/:id/applicants/:userId/status', requireAuth, actionLimiter, JobController.updateApplicantStatus);
router.post('/:id/applicants/:userId/interview', requireAuth, actionLimiter, JobController.scheduleInterview);
router.post('/:id/applicants/:userId/email', requireAuth, actionLimiter, JobController.sendCustomEmail);
router.get('/workers/all', requireAuth, JobController.getAllCandidates);

export default router;
