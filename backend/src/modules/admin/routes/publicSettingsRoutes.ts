import { Router } from 'express';
import { AdminService } from '../services/AdminService';

const publicSettingsRouter = Router();

// Public endpoint for retrieving platform settings (like role_tabs_config) without requiring admin login
publicSettingsRouter.get('/settings', async (req, res, next) => {
  try {
    const data = await AdminService.getSettings();
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

export default publicSettingsRouter;
