import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './routes/authRoutes';
import { errorHandler } from '../../../shared/middlewares/errorHandler';

const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: (origin, cb) => cb(null, true), credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.get(['/health', '/api/v1/auth/health'], (req, res) => {
  res.status(200).json({ status: 'UP', service: 'auth-service', timestamp: new Date().toISOString() });
});

app.use('/api/v1/auth', authRoutes);

app.use(errorHandler);

export default app;
