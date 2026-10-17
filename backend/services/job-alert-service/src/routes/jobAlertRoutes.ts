import { Router } from 'express';
import { JobAlertController } from '../controllers/JobAlertController';

const router = Router();

router.post('/dispatch', JobAlertController.dispatchMatches);
router.get('/preview/:jobId', JobAlertController.previewMatches);
router.get('/history', JobAlertController.getCandidateAlertHistory);
router.get('/metrics/:jobId', JobAlertController.getJobMetrics);

export default router;
