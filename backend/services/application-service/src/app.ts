import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import applicationRoutes from './routes/applicationRoutes';
import { errorHandler } from '../../../shared/middlewares/errorHandler';

const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: (origin, cb) => cb(null, true), credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.get(['/health', '/api/v1/jobs/health'], (req, res) => {
  res.status(200).json({ status: 'UP', service: 'application-service', timestamp: new Date().toISOString() });
});

app.use('/api/v1/jobs', applicationRoutes);

app.use(errorHandler);

export default app;
