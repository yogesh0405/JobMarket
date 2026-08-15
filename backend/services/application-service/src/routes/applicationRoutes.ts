import { Router } from 'express';
import { ApplicationController } from '../controllers/ApplicationController';

const router = Router();

router.get('/applied/my-applications', ApplicationController.getMyAppliedJobs);
router.get('/applied/me', ApplicationController.getMyAppliedJobs);
router.get('/interviews/my-interviews', ApplicationController.getMyInterviews);

router.post('/:id/apply', ApplicationController.applyToJob);
router.get('/:id/applicants', ApplicationController.getApplicantsForJob);
router.patch('/:id/applicants/:userId/status', ApplicationController.updateApplicantStatus);
router.post('/:id/applicants/:userId/interview', ApplicationController.scheduleInterview);
router.post('/:id/applicants/:userId/email', ApplicationController.sendCustomEmail);

export default router;
