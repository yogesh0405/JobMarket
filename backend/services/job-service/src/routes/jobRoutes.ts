import { Router } from 'express';
import { JobController } from '../controllers/JobController';

const router = Router();

router.get('/map', JobController.getMapJobs);
router.get('/nearby', JobController.getNearbyJobs);
router.post('/geocode', JobController.triggerGeocoding);
router.post('/resolve-map-url', JobController.resolveMapUrl);

router.get('/', JobController.getJobs);
router.get('/meta/categories', JobController.getCategories);
router.get('/meta/skills', JobController.getSkills);
router.get('/saved', JobController.getMySavedJobs);
router.get('/saved/my-saved', JobController.getMySavedJobs);
router.get('/saved/me', JobController.getMySavedJobs);
router.get('/employer/analytics', JobController.getEmployerAnalytics);
router.get('/workers/all', JobController.getAllCandidates);
router.get('/search', JobController.searchJobs);
router.get('/:id', JobController.getJobById);

router.post('/', JobController.createJob);
router.put('/:id', JobController.updateJob);
router.delete('/:id', JobController.deleteJob);
router.post('/:id/save', JobController.toggleSaveJob);

export default router;
