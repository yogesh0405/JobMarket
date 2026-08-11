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
  const companyStr = job?.company || 'Industrial Company';
  const locationStr = job?.location || 'MIDC Industrial Zone';
  const minSal = job?.salary_min || job?.salaryMin;
  const maxSal = job?.salary_max || job?.salaryMax;
  const salStr = minSal && maxSal ? `₹${Math.round(minSal / 1000)}k - ₹${Math.round(maxSal / 1000)}k / month` : 'Competitive Package';
  const tradeStr = job?.trade || 'Technical Specialist';
  const description = job?.title
    ? `Role: ${job.title} | Company: ${companyStr} | Location: ${locationStr} | Salary: ${salStr}`
    : 'View industrial job vacancies and career opportunities on JobMarket.';
  const appLink = `jobmarket://job/${jobId}`;
  const companyLogo = job?.company_logo || job?.companyLogo || '';

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
  ${companyLogo ? `<meta property="og:image" content="${companyLogo}" />` : ''}
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <style>
    :root {
      --bg: #F8FAFC;
      --card-bg: #FFFFFF;
      --border: #E2E8F0;
      --text-primary: #0F172A;
      --text-secondary: #475569;
      --details-bg: #F1F5F9;
      --details-border: #CBD5E1;
      --details-text: #1E293B;
      --shadow: rgba(15, 23, 42, 0.08);
    }
    @media (prefers-color-scheme: dark) {
      :root {
        --bg: #0B0F17;
        --card-bg: #151D2A;
        --border: #232E42;
        --text-primary: #F8FAFC;
        --text-secondary: #94A3B8;
        --details-bg: #0F172A;
        --details-border: #1E293B;
        --details-text: #CBD5E1;
        --shadow: rgba(0, 0, 0, 0.5);
      }
    }
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background-color: var(--bg);
      color: var(--text-primary);
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      padding: 20px;
      transition: background-color 0.3s ease, color 0.3s ease;
    }
    .card {
      background-color: var(--card-bg);
      border: 1px solid var(--border);
      padding: 32px 24px;
      max-width: 440px;
      width: 100%;
      border-radius: 0px;
      box-shadow: 0 12px 32px var(--shadow);
      text-align: center;
    }
    .logo-box {
      width: 60px;
      height: 60px;
      background: #2563EB;
      border-radius: 0px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 18px;
      overflow: hidden;
    }
    .logo-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    h1 {
      font-size: 20px;
      font-weight: 800;
      margin: 0 0 6px;
      color: var(--text-primary);
      line-height: 1.3;
    }
    .company {
      font-size: 14px;
      color: var(--text-secondary);
      margin: 0 0 20px;
      font-weight: 600;
    }
    .details {
      background-color: var(--details-bg);
      border: 1px solid var(--details-border);
      border-radius: 0px;
      padding: 16px;
      margin-bottom: 24px;
      font-size: 13px;
      color: var(--details-text);
      text-align: left;
      line-height: 1.6;
    }
    .details-row {
      margin-bottom: 8px;
    }
    .details-row:last-child {
      margin-bottom: 0;
    }
    .btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      width: 100%;
      padding: 14px 0;
      background: #2563EB;
      color: #FFFFFF;
      font-weight: 700;
      text-decoration: none;
      border-radius: 0px;
      font-size: 15px;
      transition: background 0.2s ease;
    }
    .btn:hover, .btn:active {
      background: #1D4ED8;
    }
  </style>
  <script>
    // Auto-Launch App Deep Link Script
    (function() {
      var appUrl = "${appLink}";
      window.location.href = appUrl;
    })();
  </script>
</head>
<body>
  <div class="card">
    <div class="logo-box">
      ${companyLogo ? `<img src="${companyLogo}" class="logo-img" alt="Logo" onError="this.style.display='none'; this.nextElementSibling.style.display='flex';" /><div style="display:none; width:100%; height:100%; align-items:center; justify-content:center;"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg></div>` : `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>`}
    </div>
    <h1>${job?.title || 'Industrial Job Vacancy'}</h1>
    <div class="company">${companyStr}</div>
    <div class="details">
      <div class="details-row">📍 <strong>Location:</strong> ${locationStr}</div>
      <div class="details-row">💰 <strong>Salary:</strong> ${salStr}</div>
      <div class="details-row">🏭 <strong>Trade:</strong> ${tradeStr}</div>
    </div>
    <a href="${appLink}" class="btn">📲 Open in JobMarket App</a>
  </div>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html');
  res.send(html);
});

// Global Error Handler
app.use(errorHandler);

export default app;
