import http from 'http';

const request = (method: string, path: string, headers: Record<string, string> = {}, body?: any): Promise<any> => {
  return new Promise((resolve, reject) => {
    const dataString = body ? JSON.stringify(body) : '';
    const reqHeaders: Record<string, string> = {
      ...headers,
      'Content-Type': 'application/json',
    };
    if (dataString) {
      reqHeaders['Content-Length'] = String(Buffer.byteLength(dataString));
    }

    const req = http.request({
      hostname: '127.0.0.1',
      port: 5000,
      path,
      method,
      headers: reqHeaders,
    }, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          resolve({ status: res.statusCode, body: json });
        } catch {
          resolve({ status: res.statusCode, body });
        }
      });
    });

    req.on('error', reject);
    if (dataString) req.write(dataString);
    req.end();
  });
};

const verifyAll = async () => {
  console.log('🔍 Comprehensive Master Verification Test Across All Microservices...\n');
  const results: { domain: string; endpoint: string; status: number; ok: boolean; detail: string }[] = [];

  const logResult = (domain: string, endpoint: string, res: any, expectedStatus = 200) => {
    const ok = res.status === expectedStatus || (res.status >= 200 && res.status < 300);
    const detail = ok ? `OK (Count/Data: ${Array.isArray(res.body?.data) ? res.body.data.length : res.body?.success ? 'Success' : 'Valid'})` : `Failed (${res.body?.message || res.body?.error || JSON.stringify(res.body)})`;
    results.push({ domain, endpoint, status: res.status, ok, detail });
    console.log(`${ok ? '✅' : '❌'} [${domain}] ${endpoint} -> HTTP ${res.status} (${detail})`);
  };

  // 1. Gateway Health
  const gwHealth = await request('GET', '/health');
  logResult('API Gateway', 'GET /health', gwHealth);

  // 2. Candidate Login & Auth Service
  const candidateLogin = await request('POST', '/api/v1/auth/login', {}, {
    email: 'worker@demo.com',
    password: 'demo123',
    role: 'candidate'
  });
  logResult('Auth Service', 'POST /api/v1/auth/login (Candidate)', candidateLogin);

  const candToken = candidateLogin.body?.data?.accessToken || candidateLogin.body?.data?.token;
  const candUserId = candidateLogin.body?.data?.user?.id;
  const candHeaders = {
    'Authorization': `Bearer ${candToken}`,
    'x-user-id': candUserId,
    'x-user-role': 'candidate'
  };

  // 3. Admin Login & Admin Service
  const adminLogin = await request('POST', '/api/v1/auth/login', {}, {
    email: 'admin@demo.com',
    password: 'demo123',
    role: 'admin'
  });
  logResult('Auth Service', 'POST /api/v1/auth/login (Admin)', adminLogin);

  const adminToken = adminLogin.body?.data?.accessToken;
  const adminUserId = adminLogin.body?.data?.user?.id;
  const adminHeaders = {
    'Authorization': `Bearer ${adminToken}`,
    'x-user-id': adminUserId,
    'x-user-role': 'admin'
  };

  // 4. User Profile Service
  const userMe = await request('GET', '/api/v1/auth/me', candHeaders);
  logResult('User Service', 'GET /api/v1/auth/me', userMe);

  const userSig = await request('GET', '/api/v1/auth/resume/signature', candHeaders);
  logResult('User Service', 'GET /api/v1/auth/resume/signature', userSig);

  // 5. Job Service
  const jobsList = await request('GET', '/api/v1/jobs', candHeaders);
  logResult('Job Service', 'GET /api/v1/jobs', jobsList);

  const categories = await request('GET', '/api/v1/jobs/meta/categories', candHeaders);
  logResult('Job Service', 'GET /api/v1/jobs/meta/categories', categories);

  const skills = await request('GET', '/api/v1/jobs/meta/skills', candHeaders);
  logResult('Job Service', 'GET /api/v1/jobs/meta/skills', skills);

  const savedJobs = await request('GET', '/api/v1/jobs/saved/my-saved', candHeaders);
  logResult('Job Service', 'GET /api/v1/jobs/saved/my-saved', savedJobs);

  const targetJobId = jobsList.body?.data?.[0]?.id;
  if (targetJobId) {
    const saveToggle = await request('POST', `/api/v1/jobs/${targetJobId}/save`, candHeaders);
    logResult('Job Service', `POST /api/v1/jobs/${targetJobId}/save`, saveToggle);
  }

  // 6. Application Service
  const appliedJobs = await request('GET', '/api/v1/jobs/applied/my-applications', candHeaders);
  logResult('Application Service', 'GET /api/v1/jobs/applied/my-applications', appliedJobs);

  const interviews = await request('GET', '/api/v1/jobs/interviews/my-interviews', candHeaders);
  logResult('Application Service', 'GET /api/v1/jobs/interviews/my-interviews', interviews);

  if (targetJobId) {
    const applyAction = await request('POST', `/api/v1/jobs/${targetJobId}/apply`, candHeaders);
    logResult('Application Service', `POST /api/v1/jobs/${targetJobId}/apply`, applyAction, 201);
  }

  // 7. Notification Service
  const notifs = await request('GET', '/api/v1/notifications', candHeaders);
  logResult('Notification Service', 'GET /api/v1/notifications', notifs);

  const unreadCount = await request('GET', '/api/v1/notifications/unread-count', candHeaders);
  logResult('Notification Service', 'GET /api/v1/notifications/unread-count', unreadCount);

  // 8. Support Service
  const supportTickets = await request('GET', '/api/support/tickets', candHeaders);
  logResult('Support Service', 'GET /api/support/tickets', supportTickets);

  // 9. Ad Service
  const ads = await request('GET', '/api/v1/home/advertisements', candHeaders);
  logResult('Ad Service', 'GET /api/v1/home/advertisements', ads);

  // 10. Admin Service
  const settings = await request('GET', '/api/v1/settings', candHeaders);
  logResult('Admin Service', 'GET /api/v1/settings', settings);

  const dashboard = await request('GET', '/api/v1/admin/dashboard', adminHeaders);
  logResult('Admin Service', 'GET /api/v1/admin/dashboard', dashboard);

  console.log('\n📊 MASTER VERIFICATION SUMMARY:');
  const passedCount = results.filter(r => r.ok).length;
  console.log(`Passed: ${passedCount} / ${results.length} APIs (${Math.round((passedCount / results.length) * 100)}%)`);

  if (passedCount === results.length) {
    console.log('🎉 ALL APIs ACROSS ALL MICROSERVICES ARE FUNCTIONING 100% AS EXPECTED!');
  } else {
    console.error('⚠️ Some API verification checks failed.');
    process.exit(1);
  }
};

verifyAll().catch(err => {
  console.error('Fatal Verification Error:', err);
  process.exit(1);
});
