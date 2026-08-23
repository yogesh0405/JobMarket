import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import userRoutes from './routes/userRoutes';
import companyRoutes from '../../../src/modules/companies/routes/companyRoutes';
import { errorHandler } from '../../../shared/middlewares/errorHandler';

const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: (origin, cb) => cb(null, true), credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.get(['/health', '/api/v1/auth/health'], (req, res) => {
  res.status(200).json({ status: 'UP', service: 'user-service', timestamp: new Date().toISOString() });
});

app.use('/api/v1/auth', userRoutes);
app.use('/api/v1/companies', companyRoutes);
app.use('/api/companies', companyRoutes);

app.use(errorHandler);

export default app;
