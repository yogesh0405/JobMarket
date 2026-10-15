import { Router } from 'express';
import { ApplicationController } from '../controllers/ApplicationController';
import { rateLimiter } from '../../../../shared/middlewares/rateLimiter';

const router = Router();

const applyLimiter = rateLimiter('job_apply', 20, 60); // 20 applications per min
const applicantActionLimiter = rateLimiter('applicant_action', 30, 60); // 30 interview/status actions per min
const emailLimiter = rateLimiter('applicant_email', 10, 60); // 10 custom emails per min

router.get('/applied/my-applications', ApplicationController.getMyAppliedJobs);
router.get('/applied/me', ApplicationController.getMyAppliedJobs);
router.get('/interviews/my-interviews', ApplicationController.getMyInterviews);
router.get('/employer/interviews', ApplicationController.getEmployerInterviews);
router.patch('/employer/interviews/:applicationId/status', applicantActionLimiter, ApplicationController.updateEmployerInterviewStatus);
router.get('/applicants/all', ApplicationController.getAllApplicantsForEmployer);
router.get('/applicants', ApplicationController.getAllApplicantsForEmployer);
router.get('/employer/applicants', ApplicationController.getAllApplicantsForEmployer);

router.post('/:id/apply', applyLimiter, ApplicationController.applyToJob);
router.get('/:id/applicants', ApplicationController.getApplicantsForJob);
router.patch('/:id/applicants/:userId/status', applicantActionLimiter, ApplicationController.updateApplicantStatus);
router.post('/:id/applicants/:userId/interview', applicantActionLimiter, ApplicationController.scheduleInterview);
router.post('/:id/applicants/:userId/email', emailLimiter, ApplicationController.sendCustomEmail);

export default router;
