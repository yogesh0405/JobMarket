import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import {
  homeAdvertisementRouter,
  employerAdvertisementRouter,
  adminAdvertisementRouter,
} from './routes/advertisementRoutes';
import { errorHandler } from '../../../shared/middlewares/errorHandler';

const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: (origin, cb) => cb(null, true), credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.get(['/health', '/api/v1/home/health'], (req, res) => {
  res.status(200).json({ status: 'UP', service: 'ad-service', timestamp: new Date().toISOString() });
});

app.use('/api/v1/home', homeAdvertisementRouter);
app.use('/api/v1/employer', employerAdvertisementRouter);
app.use('/api/v1/admin', adminAdvertisementRouter);

app.use(errorHandler);

export default app;
