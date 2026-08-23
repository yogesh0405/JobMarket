import express from 'express';
import path from 'path';
import fs from 'fs';
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
import companyRoutes from './modules/companies/routes/companyRoutes';
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

// Helper to locate Web App frontend build path dynamically
const findWebDistPath = (): string => {
  const candidatePaths = [
    path.join(__dirname, '../../App/dist'),
    path.join(__dirname, '../App/dist'),
    path.join(process.cwd(), '../App/dist'),
    path.join(process.cwd(), 'App/dist'),
    path.join(__dirname, '../../../App/dist')
  ];
  for (const p of candidatePaths) {
    if (fs.existsSync(path.join(p, 'index.html'))) {
      return p;
    }
  }
  return path.join(__dirname, '../../App/dist');
};

const webDistPath = findWebDistPath();
app.use((req, res, next) => {
  const currentDist = findWebDistPath();
  express.static(currentDist)(req, res, next);
});
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
app.use('/api/v1/companies', companyRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/admin/support', adminSupportRouter);
app.use('/api/v1/home', homeAdvertisementRouter);
app.use('/api/v1/employer', employerAdvertisementRouter);
app.use('/api/v1/admin', adminAdvertisementRouter);
app.use('/api/v1', publicSettingsRouter);
app.use('/api/v1', unifiedNotificationRoutes);

// Android App Links verification route (Digital Asset Links)
const assetLinksHandler = (req: express.Request, res: express.Response) => {
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
};
app.get('/.well-known/assetlinks.json', assetLinksHandler);
app.get('/assetlinks.json', assetLinksHandler);

// iOS Universal Links verification route (Apple App Site Association)
const appleAasaHandler = (req: express.Request, res: express.Response) => {
  res.setHeader('Content-Type', 'application/json');
  res.json({
    applinks: {
      apps: [],
      details: [
        {
          appID: 'com.jobmarket.mobileapp',
          paths: ['/job/*', '/jobs/*'],
        },
      ],
    },
  });
};
app.get('/.well-known/apple-app-site-association', appleAasaHandler);
app.get('/apple-app-site-association', appleAasaHandler);

// Industry-Standard Smart Universal Share & Direct Web Application Route
app.get(['/job/:id', '/jobs/:id'], async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const rawId = req.params.id;
  const jobId = (Array.isArray(rawId) ? rawId[0] : rawId) as string;
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
  const tradeStr = job?.trade || 'Technical Specialist';
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

  // 1. Social Media Crawlers: Return OpenGraph HTML metadata preview card
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

  // 2. Web Browsers (macOS / Windows / Mobile Browser): Serve the REAL Web Application
  const activeWebDist = findWebDistPath();
  const indexPath = path.join(activeWebDist, 'index.html');
  try {
    const fs = require('fs');
    if (fs.existsSync(indexPath)) {
      let indexHtml = fs.readFileSync(indexPath, 'utf8');
      const injectionScript = `
        <meta property="og:title" content="${title}" />
        <meta property="og:description" content="${description}" />
        ${formattedLogo ? `<meta property="og:image" content="${formattedLogo}" />` : ''}
        <script>
          window.addEventListener('DOMContentLoaded', function() {
            var isAndroid = /Android/i.test(navigator.userAgent);
            var isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
            var jobId = "${jobId}";
            if (isAndroid || isIOS) {
              setTimeout(function() {
                try {
                  var iframe = document.createElement('iframe');
                  iframe.style.display = 'none';
                  iframe.src = "jobmarket://job/" + jobId;
                  document.body.appendChild(iframe);
                } catch (e) {}
              }, 400);
            }
          });
        </script>
      </head>`;
      indexHtml = indexHtml.replace('</head>', `${injectionScript}`);
      res.setHeader('Content-Type', 'text/html');
      return res.send(indexHtml);
    }
  } catch (e) {}

  // Fallback SSR Card if index.html is missing
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <title>${title}</title>
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://jobmarket-ongn.onrender.com/job/${jobId}" />
  ${formattedLogo ? `<meta property="og:image" content="${formattedLogo}" />` : ''}
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <style>
    * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif;
      background-color: #F8FAFC;
      color: #0F172A;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      padding: 24px 16px;
      -webkit-font-smoothing: antialiased;
    }
    .nav-bar {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 28px;
    }
    .nav-icon {
      width: 42px;
      height: 42px;
      border-radius: 10px;
      object-fit: contain;
      box-shadow: 0 4px 12px rgba(15, 23, 42, 0.06);
    }
    .nav-title {
      font-size: 20px;
      font-weight: 800;
      color: #0F172A;
      letter-spacing: -0.5px;
    }
    .card {
      background-color: #FFFFFF;
      border: 1px solid #E2E8F0;
      padding: 36px 28px 32px;
      max-width: 440px;
      width: 100%;
      border-radius: 20px;
      box-shadow: 0 10px 30px rgba(15, 23, 42, 0.06);
      text-align: center;
    }
    .logo-box {
      width: 76px;
      height: 76px;
      background-color: #EFF6FF;
      border: 1px solid #DBEAFE;
      border-radius: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 22px;
      overflow: hidden;
      position: relative;
    }
    .logo-img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      padding: 6px;
    }
    .logo-fallback {
      width: 100%;
      height: 100%;
      background-color: #EFF6FF;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    h1 {
      font-size: 22px;
      font-weight: 800;
      margin: 0 0 6px;
      color: #0F172A;
      line-height: 1.35;
      letter-spacing: -0.4px;
    }
    .company-name {
      font-size: 15px;
      color: #2563EB;
      margin: 0 0 24px;
      font-weight: 700;
    }
    .inset-group {
      background-color: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 14px;
      padding: 16px 18px;
      margin-bottom: 28px;
      font-size: 14px;
      color: #1E293B;
      text-align: left;
      line-height: 1.6;
    }
    .row {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      margin-bottom: 12px;
    }
    .row:last-child {
      margin-bottom: 0;
    }
    .row-icon {
      font-size: 16px;
      line-height: 1.4;
    }
    .row-content {
      flex: 1;
    }
    .row-label {
      font-weight: 700;
      color: #0F172A;
      display: inline;
    }
    .row-val {
      color: #475569;
      display: inline;
      margin-left: 4px;
    }
    .cta-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      width: 100%;
      padding: 16px 0;
      background: #2563EB;
      color: #FFFFFF;
      font-weight: 700;
      text-decoration: none;
      font-size: 16px;
      border-radius: 14px;
      letter-spacing: -0.2px;
      box-shadow: 0 6px 20px rgba(37, 99, 235, 0.3);
      transition: all 0.2s ease;
    }
    .cta-btn:active {
      transform: scale(0.98);
      background: #1D4ED8;
    }
    .footer-text {
      margin-top: 24px;
      font-size: 13px;
      color: #64748B;
      font-weight: 500;
    }
  </style>
  <script>
    window.addEventListener('DOMContentLoaded', function() {
      var isAndroid = /Android/i.test(navigator.userAgent);
      var isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
      var jobId = "${jobId}";
      if (isAndroid || isIOS) {
        setTimeout(function() {
          try {
            var iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.src = "jobmarket://job/" + jobId;
            document.body.appendChild(iframe);
          } catch (e) {}
        }, 400);
      }
    });
  </script>
</head>
<body>
  <div class="nav-bar">
    <img src="https://jobmarket-ongn.onrender.com/assets/icon.png" class="nav-icon" alt="JobMarket" onError="this.style.display='none';" />
    <div class="nav-title">JobMarket</div>
  </div>

  <div class="card">
    <div class="logo-box">
      ${formattedLogo ? `
        <img src="${formattedLogo}" class="logo-img" alt="${companyStr}" onError="this.style.display='none'; document.getElementById('company-fb').style.display='flex';" />
        <div id="company-fb" class="logo-fallback" style="display:none;">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#2563EB" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"></path><path d="M6 12H4a2 2 0 0 0-2 2v8h4"></path><path d="M18 9h2a2 2 0 0 1 2 2v11h-4"></path><path d="M10 6h4"></path><path d="M10 10h4"></path><path d="M10 14h4"></path><path d="M10 18h4"></path></svg>
        </div>
      ` : `
        <div class="logo-fallback">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#2563EB" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"></path><path d="M6 12H4a2 2 0 0 0-2 2v8h4"></path><path d="M18 9h2a2 2 0 0 1 2 2v11h-4"></path><path d="M10 6h4"></path><path d="M10 10h4"></path><path d="M10 14h4"></path><path d="M10 18h4"></path></svg>
        </div>
      `}
    </div>

    <h1>${job?.title || 'Industrial Job Vacancy'}</h1>
    <div class="company-name">${companyStr}</div>

    <div class="inset-group">
      <div class="row">
        <span class="row-icon">📍</span>
        <div class="row-content">
          <span class="row-label">Location:</span>
          <span class="row-val">${locationStr}</span>
        </div>
      </div>
      <div class="row">
        <span class="row-icon">💰</span>
        <div class="row-content">
          <span class="row-label">Salary:</span>
          <span class="row-val">${salStr}</span>
        </div>
      </div>
      <div class="row">
        <span class="row-icon">🏭</span>
        <div class="row-content">
          <span class="row-label">Trade:</span>
          <span class="row-val">${tradeStr}</span>
        </div>
      </div>
    </div>

    <a href="${appLink}" class="cta-btn">
      <span>Open in JobMarket App</span>
    </a>
  </div>

  <div class="footer-text">Verified Recruiter Vacancy • JobMarket Connect</div>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html');
  return res.send(html);
});

// Wildcard SPA route fallback for Web Application (Express 5 compatible)
app.use((req, res, next) => {
  if (req.method !== 'GET') return next();
  if (req.path.startsWith('/api/') || req.path.startsWith('/assets/') || req.path.startsWith('/uploads/')) {
    return next();
  }
  const activeWebDist = findWebDistPath();
  const indexPath = path.join(activeWebDist, 'index.html');
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
