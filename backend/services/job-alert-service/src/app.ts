import '../../../src/config/firebase'; // Ensure Firebase is initialized for push notifications

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import jobAlertRoutes from './routes/jobAlertRoutes';
import { errorHandler } from '../../../shared/middlewares/errorHandler';

const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: (origin, cb) => cb(null, true), credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.get(['/health', '/api/v1/job-alerts/health'], (req, res) => {
  res.status(200).json({
    status: 'UP',
    service: 'job-alert-service',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/v1/job-alerts', jobAlertRoutes);
app.use('/api/job-alerts', jobAlertRoutes);

app.use(errorHandler);

export default app;
