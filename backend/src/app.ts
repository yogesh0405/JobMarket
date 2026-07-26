import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import authRoutes from './modules/auth/routes/authRoutes';
import adminRoutes from './modules/admin/routes/adminRoutes';
import jobRoutes from './modules/jobs/routes/jobRoutes';
import supportRoutes, { adminSupportRouter } from './modules/support/routes/supportRoutes';
import {
  homeAdvertisementRouter,
  employerAdvertisementRouter,
  adminAdvertisementRouter,
  notificationRouter,
} from './modules/advertisements/routes/advertisementRoutes';
import { errorHandler } from './middlewares/errorHandler';

const app = express();

// Security middlewares
app.use(helmet({
  contentSecurityPolicy: env.NODE_ENV === 'production' ? undefined : false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

const allowedOrigins = env.ALLOWED_ORIGINS.split(',').map((o) => o.trim());

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed for this origin'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/jobs', jobRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/admin/support', adminSupportRouter);
app.use('/api/v1/home', homeAdvertisementRouter);
app.use('/api/v1/employer', employerAdvertisementRouter);
app.use('/api/v1/admin', adminAdvertisementRouter);
app.use('/api/v1', notificationRouter);

// Global Error Handler
app.use(errorHandler);

export default app;
