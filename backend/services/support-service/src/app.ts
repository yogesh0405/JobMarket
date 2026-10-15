import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import supportRoutes, { adminSupportRouter } from './routes/supportRoutes';
import { errorHandler } from '../../../shared/middlewares/errorHandler';

const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: (origin, cb) => cb(null, true), credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.get(['/health', '/api/support/health'], (req, res) => {
  res.status(200).json({ status: 'UP', service: 'support-service', timestamp: new Date().toISOString() });
});

app.use('/api/support', supportRoutes);

// Mandatory Admin Authentication & RBAC Guard
app.use('/api/admin/support', (req, res, next) => {
  const role = (req.headers['x-user-role'] as string || '').toLowerCase();
  const userId = req.headers['x-user-id'] as string;
  if (!userId || (role !== 'admin' && role !== 'superadmin')) {
    return res.status(403).json({
      success: false,
      message: 'Forbidden: Access denied. Administrative credentials required.',
      data: null,
      errors: ['FORBIDDEN']
    });
  }
  next();
}, adminSupportRouter);

app.use(errorHandler);

export default app;
