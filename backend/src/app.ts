import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { env } from './config/env';
import authRoutes from './modules/auth/routes/authRoutes';
import adminRoutes from './modules/admin/routes/adminRoutes';
import jobRoutes from './modules/jobs/routes/jobRoutes';
import supportRoutes, { adminSupportRouter } from './modules/support/routes/supportRoutes';
import {
  homeAdvertisementRouter,
  employerAdvertisementRouter,
  adminAdvertisementRouter,
} from './modules/advertisements/routes/advertisementRoutes';
import unifiedNotificationRoutes from './modules/notifications/routes/notificationRoutes';
import { errorHandler } from './middlewares/errorHandler';

import publicSettingsRouter from './modules/admin/routes/publicSettingsRoutes';
import { JobRepository } from './modules/jobs/repositories/JobRepository';

const app = express();

// Industry-Grade Smart Compression Middleware
app.use(
  compression({
    // Only compress responses larger than 1KB (prevents CPU waste on tiny payloads)
    threshold: 1024,
    // Custom filter to handle streaming, SSE, or client-bypassed requests
    filter: (req: express.Request, res: express.Response) => {
      if (req.headers['x-no-compression']) {
        return false;
      }
      const contentType = res.getHeader('Content-Type');
      if (typeof contentType === 'string' && contentType.includes('text/event-stream')) {
        return false;
      }
      return compression.filter(req, res);
    },
  })
);

// Industry-Grade ETag & Cache Revalidation Header Middleware
app.use('/api', (req, res, next) => {
  if (req.method === 'GET') {
    // Force HTTP revalidation so browsers/proxies can utilize 304 Not Modified status codes
    res.setHeader('Cache-Control', 'no-cache, must-revalidate');
  }
  next();
});

// Security middlewares
app.use(helmet({
  contentSecurityPolicy: env.NODE_ENV === 'production' ? undefined : false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

const allowedOrigins = env.ALLOWED_ORIGINS.split(',').map((o: string) => o.trim());

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests from all origins (localhost, onrender.com, vercel, mobile app) without CORS blocking
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-session-id', 'x-refresh-token', 'X-Requested-With', 'Accept', 'Origin'],
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Health Check Endpoints
app.get(['/health', '/api/health', '/api/v1/health'], (req, res) => {
  res.status(200).json({
    status: 'UP',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
    uptime: Math.floor(process.uptime()),
    message: 'JobMarket Backend API is healthy 🚀'
  });
});

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/jobs', jobRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/admin/support', adminSupportRouter);
app.use('/api/v1/home', homeAdvertisementRouter);
app.use('/api/v1/employer', employerAdvertisementRouter);
app.use('/api/v1/admin', adminAdvertisementRouter);
app.use('/api/v1', publicSettingsRouter);
app.use('/api/v1', unifiedNotificationRoutes);

// Android App Links verification route
app.get('/.well-known/assetlinks.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.json([
    {
      relation: ['delegate_permission/common.handle_all_urls'],
      target: {
        namespace: 'android_app',
        package_name: 'com.jobmarket.mobileapp',
        sha256_cert_fingerprints: [],
      },
    },
  ]);
});

// Industry-Standard Smart Universal Share & Deep-Link Route
app.get('/job/:id', async (req, res) => {
  const jobId = req.params.id;
  let job: any = null;
  try {
    job = await JobRepository.getJobById(jobId);
  } catch (e) {}

  const title = job?.title ? `${job.title} - ${job.company || 'JobMarket'}` : 'Industrial Job Vacancy | JobMarket';
  const locationStr = job?.location || 'MIDC Industrial Zone';
  const minSal = job?.salary_min || job?.salaryMin;
  const maxSal = job?.salary_max || job?.salaryMax;
  const salStr = minSal && maxSal ? `₹${Math.round(minSal / 1000)}k - ₹${Math.round(maxSal / 1000)}k / month` : 'Competitive Salary';
  const description = job?.title
    ? `Role: ${job.title} | Company: ${job.company || 'Industrial Company'} | Location: ${locationStr} | Salary: ${salStr}`
    : 'View industrial job vacancies and career opportunities on JobMarket.';
  const appLink = `jobmarket://job/${jobId}`;
  const logoUrl = job?.company_logo || job?.companyLogo || 'https://jobmarket-ongn.onrender.com/favicon.png';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://jobmarket-ongn.onrender.com/job/${jobId}" />
  <meta property="og:image" content="${logoUrl}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <style>
    * { box-sizing: border-box; }
    body { font-family: system-ui, -apple-system, sans-serif; background: #0F172A; color: #FFFFFF; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; text-align: center; }
    .card { background: #1E293B; border: 1px solid #334155; padding: 32px 24px; max-width: 440px; width: 100%; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
    .logo { width: 56px; height: 56px; background: #2563EB; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 900; margin: 0 auto 16px; color: #FFF; }
    h1 { font-size: 20px; font-weight: 800; margin: 0 0 8px; color: #F8FAFC; }
    .company { font-size: 14px; color: #94A3B8; margin: 0 0 16px; font-weight: 600; }
    .details { background: #0F172A; border-radius: 8px; padding: 14px; margin-bottom: 24px; font-size: 13px; color: #CBD5E1; text-align: left; }
    .details div { margin-bottom: 6px; }
    .details div:last-child { margin-bottom: 0; }
    .btn { display: block; width: 100%; padding: 14px 0; background: #2563EB; color: #FFFFFF; font-weight: 700; text-decoration: none; border-radius: 8px; font-size: 15px; margin-bottom: 12px; }
    .btn-sub { display: block; width: 100%; padding: 10px 0; background: transparent; color: #94A3B8; font-weight: 600; text-decoration: underline; font-size: 13px; }
  </style>
  <script>
    // Industry-Standard Auto-Launch App Deep Link Script
    (function() {
      var appUrl = "${appLink}";
      window.location.href = appUrl;
    })();
  </script>
</head>
<body>
  <div class="card">
    <div class="logo">JM</div>
    <h1>${job?.title || 'Industrial Job Vacancy'}</h1>
    <div class="company">${job?.company || 'Industrial Company'}</div>
    <div class="details">
      <div>📍 <strong>Location:</strong> ${locationStr}</div>
      <div>💰 <strong>Salary:</strong> ${salStr}</div>
      <div>🏭 <strong>Trade:</strong> ${job?.trade || 'Technical Specialist'}</div>
    </div>
    <a href="${appLink}" class="btn">📲 Open in JobMarket App</a>
    <a href="/api/v1/jobs/${jobId}" class="btn-sub">View API Details</a>
  </div>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html');
  res.send(html);
});

// Global Error Handler
app.use(errorHandler);

export default app;
