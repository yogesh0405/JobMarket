import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import adminRoutes from './routes/adminRoutes';
import { AdminService } from '../../../src/modules/admin/services/AdminService';
import { errorHandler } from '../../../shared/middlewares/errorHandler';

const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: (origin, cb) => cb(null, true), credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.get(['/health', '/api/v1/admin/health'], (req, res) => {
  res.status(200).json({ status: 'UP', service: 'admin-service', timestamp: new Date().toISOString() });
});

app.get('/api/v1/settings', async (req, res, next) => {
  try {
    const data = await AdminService.getSettings();
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

app.use('/api/v1/admin', adminRoutes);

app.use(errorHandler);

export default app;
