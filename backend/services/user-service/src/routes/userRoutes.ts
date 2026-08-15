import { Router } from 'express';
import { UserController } from '../controllers/UserController';

const router = Router();

router.get('/me', UserController.me);
router.put('/profile', UserController.updateProfile);
router.post('/profile/picture', UserController.uploadProfilePicture);
router.delete('/profile/picture', UserController.deleteProfilePicture);
router.get('/resume', UserController.getResume);
router.get('/resume/signature', UserController.getResumeSignature);
router.post('/resume', UserController.uploadResume);
router.delete('/resume', UserController.deleteResume);
router.get('/public-profile/:id', UserController.getPublicProfile);

export default router;
