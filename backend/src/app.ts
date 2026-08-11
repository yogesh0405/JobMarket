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
  const companyInitial = companyStr.trim().charAt(0).toUpperCase() || 'J';
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
  ${formattedLogo ? `<meta property="og:image" content="${formattedLogo}" />` : ''}
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background-color: #F1F5F9;
      color: #0F172A;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      padding: 24px 16px;
    }
    .brand-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 24px;
    }
    .brand-badge {
      width: 36px;
      height: 36px;
      background: #2563EB;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .brand-title {
      font-size: 18px;
      font-weight: 900;
      color: #0F172A;
      letter-spacing: -0.5px;
    }
    .card {
      background-color: #FFFFFF;
      border: 1px solid #E2E8F0;
      padding: 36px 28px 32px;
      max-width: 440px;
      width: 100%;
      box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
      text-align: center;
    }
    .logo-container {
      width: 72px;
      height: 72px;
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20px;
      overflow: hidden;
      position: relative;
    }
    .logo-img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      padding: 4px;
    }
    .logo-fallback {
      width: 100%;
      height: 100%;
      background: #2563EB;
      color: #FFFFFF;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 26px;
      font-weight: 800;
    }
    h1 {
      font-size: 22px;
      font-weight: 800;
      margin: 0 0 8px;
      color: #0F172A;
      line-height: 1.35;
    }
    .company {
      font-size: 15px;
      color: #2563EB;
      margin: 0 0 24px;
      font-weight: 700;
    }
    .details {
      background-color: #F8FAFC;
      border: 1px solid #E2E8F0;
      padding: 18px;
      margin-bottom: 28px;
      font-size: 14px;
      color: #1E293B;
      text-align: left;
      line-height: 1.6;
    }
    .details-row {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      margin-bottom: 10px;
    }
    .details-row:last-child {
      margin-bottom: 0;
    }
    .details-label {
      font-weight: 700;
      color: #0F172A;
      min-width: 80px;
    }
    .details-val {
      color: #334155;
      flex: 1;
    }
    .btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      width: 100%;
      padding: 16px 0;
      background: #2563EB;
      color: #FFFFFF;
      font-weight: 800;
      text-decoration: none;
      font-size: 15px;
      letter-spacing: 0.3px;
      box-shadow: 0 4px 14px rgba(37, 99, 235, 0.35);
      transition: background 0.2s ease;
    }
    .btn:hover, .btn:active {
      background: #1D4ED8;
    }
    .footer-note {
      margin-top: 24px;
      font-size: 12px;
      color: #64748B;
      font-weight: 600;
    }
  </style>
  <script>
    (function() {
      var appUrl = "${appLink}";
      window.location.href = appUrl;
    })();
  </script>
</head>
<body>
  <div class="brand-header">
    <div class="brand-badge">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
    </div>
    <div class="brand-title">JobMarket Platform</div>
  </div>

  <div class="card">
    <div class="logo-container">
      ${formattedLogo ? `
        <img src="${formattedLogo}" class="logo-img" alt="${companyStr}" onError="this.style.display='none'; document.getElementById('logo-fb').style.display='flex';" />
        <div id="logo-fb" class="logo-fallback" style="display:none;">${companyInitial}</div>
      ` : `
        <div class="logo-fallback">${companyInitial}</div>
      `}
    </div>

    <h1>${job?.title || 'Industrial Job Vacancy'}</h1>
    <div class="company">${companyStr}</div>

    <div class="details">
      <div class="details-row">
        <span>📍</span>
        <span class="details-label">Location:</span>
        <span class="details-val">${locationStr}</span>
      </div>
      <div class="details-row">
        <span>💰</span>
        <span class="details-label">Salary:</span>
        <span class="details-val">${salStr}</span>
      </div>
      <div class="details-row">
        <span>🏭</span>
        <span class="details-label">Trade:</span>
        <span class="details-val">${tradeStr}</span>
      </div>
    </div>

    <a href="${appLink}" class="btn">
      <span>📲</span>
      <span>OPEN IN JOBMARKET APP</span>
    </a>
  </div>

  <div class="footer-note">Verified Recruiter Vacancy • JobMarket Direct Connect</div>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html');
  res.send(html);
});

// Global Error Handler
app.use(errorHandler);

export default app;
