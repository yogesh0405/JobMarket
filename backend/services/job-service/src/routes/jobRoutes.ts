import { Router } from 'express';
import { JobController } from '../controllers/JobController';
import { rateLimiter } from '../../../../shared/middlewares/rateLimiter';

const router = Router();

const jobCreateLimiter = rateLimiter('job_create', 15, 60); // 15 creations/updates per min
const jobActionLimiter = rateLimiter('job_action', 30, 60); // 30 saves/reports per min
const mapResolveLimiter = rateLimiter('map_resolve', 20, 60); // 20 map geocode/resolves per min

router.get('/map', JobController.getMapJobs);
router.get('/nearby', JobController.getNearbyJobs);
router.post('/geocode', mapResolveLimiter, JobController.triggerGeocoding);
router.post('/resolve-map-url', mapResolveLimiter, JobController.resolveMapUrl);

router.get('/', JobController.getJobs);
router.get('/meta/categories', JobController.getCategories);
router.get('/meta/skills', JobController.getSkills);
router.get('/saved', JobController.getMySavedJobs);
router.get('/saved/my-saved', JobController.getMySavedJobs);
router.get('/saved/me', JobController.getMySavedJobs);
router.get('/my-jobs/all', JobController.getMyJobs);
router.get('/my-jobs', JobController.getMyJobs);
router.get('/employer/my-jobs', JobController.getMyJobs);
router.get('/workers/all', JobController.getAllCandidates);
router.get('/candidates/all', JobController.getAllCandidates);
router.get('/candidates', JobController.getAllCandidates);
router.get('/search', JobController.searchJobs);
router.get('/:id/similar', JobController.getSimilarJobs);
router.get('/:id', JobController.getJobById);

router.post('/', jobCreateLimiter, JobController.createJob);
router.put('/:id', jobCreateLimiter, JobController.updateJob);
router.delete('/:id', jobCreateLimiter, JobController.deleteJob);
router.post('/:id/save', jobActionLimiter, JobController.toggleSaveJob);
router.post('/:id/report', jobActionLimiter, JobController.reportJob);

export default router;
