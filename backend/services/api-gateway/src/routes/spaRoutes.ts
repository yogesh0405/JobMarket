import { Router, Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { pool } from '../../../../shared/database/pool';

const router = Router();

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

const assetLinksHandler = (req: Request, res: Response) => {
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

router.get('/.well-known/assetlinks.json', assetLinksHandler);
router.get('/assetlinks.json', assetLinksHandler);

const appleAasaHandler = (req: Request, res: Response) => {
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

router.get('/.well-known/apple-app-site-association', appleAasaHandler);
router.get('/apple-app-site-association', appleAasaHandler);

router.get(['/job/:id', '/jobs/:id'], async (req: Request, res: Response, next: NextFunction) => {
  const rawId = req.params.id;
  const jobId = (Array.isArray(rawId) ? rawId[0] : rawId) as string;
  let job: any = null;
  try {
    const result = await pool.query(`SELECT id, title, company, company_logo, location, salary_min, salary_max, trade FROM jobs WHERE id = $1`, [jobId]);
    job = result.rows[0];
  } catch (e) {}

  const title = job?.title ? `${job.title} - ${job.company || 'JobMarket'}` : 'Industrial Job Vacancy | JobMarket';
  const companyStr = job?.company || 'Industrial Company';
  const locationStr = job?.location || 'MIDC Industrial Zone';
  const minSal = job?.salary_min;
  const maxSal = job?.salary_max;
  const salStr = minSal && maxSal ? `₹${Math.round(minSal / 1000)}k - ₹${Math.round(maxSal / 1000)}k / month` : 'Competitive Salary';
  const tradeStr = job?.trade || 'Technical Specialist';
  const description = job?.title
    ? `Role: ${job.title} | Company: ${companyStr} | Location: ${locationStr} | Salary: ${salStr}`
    : 'View industrial job vacancies and career opportunities on JobMarket.';

  const rawLogo = job?.company_logo || '';
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

  const activeWebDist = findWebDistPath();
  const indexPath = path.join(activeWebDist, 'index.html');
  try {
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

  res.setHeader('Content-Type', 'text/html');
  return res.send(`<!DOCTYPE html><html><head><title>${title}</title></head><body><h1>${title}</h1><p>${description}</p></body></html>`);
});

export default router;
