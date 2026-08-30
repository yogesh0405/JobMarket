import { Router } from 'express';
import { AdminService } from '../services/AdminService';

const publicSettingsRouter = Router();

// Public endpoint for retrieving platform settings (like role_tabs_config, logo_url, platform_name, etc.) without requiring admin login
publicSettingsRouter.get(['/settings', '/public/settings'], async (req, res, next) => {
  try {
    const data = await AdminService.getSettings();
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

export default publicSettingsRouter;
