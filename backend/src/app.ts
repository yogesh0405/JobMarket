import express from 'express';
import path from 'path';
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

// Serve Mobile App assets & Web App frontend static assets
const webDistPath = path.join(__dirname, '../../App/dist');
app.use(express.static(webDistPath));
app.use('/assets', express.static(path.join(__dirname, '../../MobileApp/assets')));

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

// Industry-Standard Smart Universal Share & Direct Web Application Route
app.get('/job/:id', async (req, res, next) => {
  const jobId = req.params.id;
  let job: any = null;
  try {
    job = await JobRepository.getJobById(jobId);
  } catch (e) {}

  const title = job?.title ? `${job.title} - ${job.company || 'JobMarket'}` : 'Industrial Job Vacancy | JobMarket';
  const companyStr = job?.company || 'Industrial Company';
  const locationStr = job?.location || 'MIDC Industrial Zone';
  const minSal = job?.salary_min || job?.salaryMin;
  const maxSal = job?.salary_max || job?.salaryMax;
  const salStr = minSal && maxSal ? `₹${Math.round(minSal / 1000)}k - ₹${Math.round(maxSal / 1000)}k / month` : 'Competitive Salary';
  const description = job?.title
    ? `Role: ${job.title} | Company: ${companyStr} | Location: ${locationStr} | Salary: ${salStr}`
    : 'View industrial job vacancies and career opportunities on JobMarket.';
  const appLink = `jobmarket://job/${jobId}`;

  const rawLogo = job?.company_logo || job?.companyLogo || (job as any)?.companyLogoUrl || '';
  let formattedLogo = '';
  if (rawLogo) {
    if (rawLogo.startsWith('http://') || rawLogo.startsWith('https://')) {
      formattedLogo = rawLogo;
    } else if (rawLogo.startsWith('/')) {
      formattedLogo = `https://jobmarket-ongn.onrender.com${rawLogo}`;
    } else {
      formattedLogo = `https://jobmarket-ongn.onrender.com/${rawLogo}`;
    }
  }

  const userAgent = req.headers['user-agent'] || '';
  const isCrawler = /whatsapp|facebookexternalhit|twitterbot|linkedinbot|telegrambot|slackbot|discordbot|googlebot|bot|crawler|spider/i.test(userAgent);

  // 1. Return OpenGraph metadata HTML preview card for social media crawlers
  if (isCrawler) {
    const crawlerHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${title}</title>
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://jobmarket-ongn.onrender.com/job/${jobId}" />
  ${formattedLogo ? `<meta property="og:image" content="${formattedLogo}" />` : ''}
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
</head>
<body>
  <h1>${title}</h1>
  <p>${description}</p>
</body>
</html>`;
    res.setHeader('Content-Type', 'text/html');
    return res.send(crawlerHtml);
  }

  // 2. Direct Web Application navigation for users without the mobile app (with app deep-link hand-off script)
  const indexPath = path.join(webDistPath, 'index.html');
  try {
    const fs = require('fs');
    if (fs.existsSync(indexPath)) {
      let indexHtml = fs.readFileSync(indexPath, 'utf8');
      const injectionScript = `
        <meta property="og:title" content="${title}" />
        <meta property="og:description" content="${description}" />
        ${formattedLogo ? `<meta property="og:image" content="${formattedLogo}" />` : ''}
        <script>
          (function() {
            var appUrl = "${appLink}";
            window.location.href = appUrl;
          })();
        </script>
      </head>`;
      indexHtml = indexHtml.replace('</head>', `${injectionScript}`);
      res.setHeader('Content-Type', 'text/html');
      return res.send(indexHtml);
    }
  } catch (e) {}

  next();
});

// Wildcard SPA route fallback for Web Application (Express 5 compatible)
app.use((req, res, next) => {
  if (req.method !== 'GET') return next();
  if (req.path.startsWith('/api/') || req.path.startsWith('/assets/') || req.path.startsWith('/uploads/')) {
    return next();
  }
  const indexPath = path.join(webDistPath, 'index.html');
  try {
    const fs = require('fs');
    if (fs.existsSync(indexPath)) {
      res.setHeader('Content-Type', 'text/html');
      return res.sendFile(indexPath);
    }
  } catch (e) {}
  next();
});

// Global Error Handler
app.use(errorHandler);

export default app;
