import { Router } from 'express';
import { PlatformRepository } from '../repositories/PlatformRepository';

const platformRouter = Router();

// Public endpoint for retrieving platform settings (role tabs, logo, name, maintenance mode)
platformRouter.get(['/settings', '/public/settings'], async (req, res, next) => {
  try {
    const data = await PlatformRepository.getSettings();
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

export default platformRouter;
