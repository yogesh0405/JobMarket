import express from 'express';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { env } from '../../../shared/config/env';
import { errorHandler } from '../../../shared/middlewares/errorHandler';
import { correlationIdMiddleware } from './middleware/correlationId';
import { authHeaderInjector } from './middleware/authHeaderInjector';
import { createServiceProxy } from './utils/proxyHelper';
import spaRouter from './routes/spaRoutes';

const app = express();

app.use(
  compression({
    threshold: 1024,
    filter: (req: express.Request, res: express.Response) => {
      if (req.headers['x-no-compression']) return false;
      const contentType = res.getHeader('Content-Type');
      if (typeof contentType === 'string' && contentType.includes('text/event-stream')) return false;
      return compression.filter(req, res);
    },
  })
);

app.use('/api', (req, res, next) => {
  if (req.method === 'GET') {
    res.setHeader('Cache-Control', 'no-cache, must-revalidate');
  }
  next();
});

app.use(helmet({
  contentSecurityPolicy: env.NODE_ENV === 'production' ? undefined : false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(cors({
  origin: (origin, callback) => callback(null, true),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-session-id', 'x-refresh-token', 'X-Requested-With', 'Accept', 'Origin'],
}));

app.use(correlationIdMiddleware);
app.use(authHeaderInjector);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.get(['/health', '/api/health', '/api/v1/health'], (req, res) => {
  res.status(200).json({
    status: 'UP',
    service: 'API Gateway',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
    uptime: Math.floor(process.uptime()),
    message: 'JobMarket API Gateway is healthy 🚀'
  });
});

const authServiceProxy = createServiceProxy(env.AUTH_SERVICE_PORT);
const userServiceProxy = createServiceProxy(env.USER_SERVICE_PORT);
const jobServiceProxy = createServiceProxy(env.JOB_SERVICE_PORT);
const applicationServiceProxy = createServiceProxy(env.APPLICATION_SERVICE_PORT);

// Auth Service vs User Profile Service proxy routing
app.use('/api/v1/auth', (req, res, next) => {
  const url = req.originalUrl;
  if (
    url.includes('/me') ||
    url.includes('/profile') ||
    url.includes('/resume') ||
    url.includes('/public-profile')
  ) {
    return userServiceProxy(req, res, next);
  }
  return authServiceProxy(req, res, next);
});

// Job Service vs Application Service proxy routing
app.use(['/api/v1/jobs', '/api/jobs'], (req, res, next) => {
  const url = req.originalUrl;
  if (
    url.includes('/applied') ||
    url.includes('/interviews') ||
    url.includes('/apply') ||
    url.includes('/applicants')
  ) {
    return applicationServiceProxy(req, res, next);
  }
  return jobServiceProxy(req, res, next);
});

app.use('/api/v1/notifications', createServiceProxy(env.NOTIFICATION_SERVICE_PORT));
app.use('/api/support', createServiceProxy(env.SUPPORT_SERVICE_PORT));
app.use('/api/admin/support', createServiceProxy(env.SUPPORT_SERVICE_PORT));
app.use('/api/v1/home', createServiceProxy(env.AD_SERVICE_PORT));
app.use('/api/v1/employer', createServiceProxy(env.AD_SERVICE_PORT));
app.use('/api/v1/admin/advertisements', createServiceProxy(env.AD_SERVICE_PORT));
app.use('/api/v1/admin', createServiceProxy(env.ADMIN_SERVICE_PORT));
app.use(['/api/v1/settings', '/api/v1/public/settings'], createServiceProxy(env.ADMIN_SERVICE_PORT));

app.use('/assets', express.static(path.join(__dirname, '../../../../MobileApp/assets')));
app.use(spaRouter);

const findWebDistPath = (): string => {
  const candidatePaths = [
    path.join(__dirname, '../../../../App/dist'),
    path.join(__dirname, '../../../App/dist'),
    path.join(process.cwd(), '../App/dist'),
    path.join(process.cwd(), 'App/dist'),
  ];
  for (const p of candidatePaths) {
    if (fs.existsSync(path.join(p, 'index.html'))) {
      return p;
    }
  }
  return path.join(__dirname, '../../../../App/dist');
};

const activeWebDist = findWebDistPath();
app.use(express.static(activeWebDist));

app.use((req, res, next) => {
  if (req.method !== 'GET') return next();
  if (req.path.startsWith('/api/') || req.path.startsWith('/assets/') || req.path.startsWith('/uploads/')) {
    return next();
  }
  const indexPath = path.join(activeWebDist, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.setHeader('Content-Type', 'text/html');
    return res.sendFile(indexPath);
  }
  next();
});

app.use(errorHandler);

export default app;
