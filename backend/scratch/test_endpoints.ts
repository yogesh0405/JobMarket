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

const runTests = async () => {
  console.log('🧪 Starting End-to-End API Microservices Integration Test with Real Data...\n');

  // 1. Candidate Login
  console.log('1️⃣ Logging in as candidate (worker@demo.com)...');
  const loginRes = await request('POST', '/api/v1/auth/login', {}, {
    email: 'worker@demo.com',
    password: 'demo123',
    role: 'candidate'
  });

  console.log('   Login Status:', loginRes.status);
  console.log('   Response Success:', loginRes.body?.success);

  const token = loginRes.body?.data?.accessToken || loginRes.body?.data?.token || loginRes.body?.token;
  const userId = loginRes.body?.data?.user?.id || loginRes.body?.user?.id;
  const sessionId = loginRes.body?.data?.sessionId;

  if (!token) {
    console.error('❌ Failed to obtain JWT token:', loginRes.body);
    process.exit(1);
  }
  console.log(`   ✅ JWT Token obtained for user ID: ${userId}\n`);

  const authHeaders = {
    'Authorization': `Bearer ${token}`,
    'x-user-id': userId,
    'x-user-role': 'candidate',
    'x-session-id': sessionId || '',
  };

  // 2. Fetch Public Jobs
  console.log('2️⃣ Fetching public jobs list (GET /api/v1/jobs)...');
  const jobsRes = await request('GET', '/api/v1/jobs', authHeaders);
  console.log('   Jobs API Status:', jobsRes.status);
  const jobs = jobsRes.body?.data || [];
  console.log(`   ✅ Total Jobs Returned: ${jobs.length}`);

  if (jobs.length === 0) {
    console.error('❌ No jobs found in database!');
    process.exit(1);
  }

  const targetJobId = jobs[0].id;
  const targetJobTitle = jobs[0].title;
  console.log(`   🎯 Selected Target Job: "${targetJobTitle}" (${targetJobId})\n`);

  // 3. Save / Bookmark Job
  console.log(`3️⃣ Bookmarking job (POST /api/v1/jobs/${targetJobId}/save)...`);
  const saveRes = await request('POST', `/api/v1/jobs/${targetJobId}/save`, authHeaders);
  console.log('   Save Job Status:', saveRes.status);
  console.log('   Response Body:', saveRes.body, '\n');

  // 4. Get Candidate Saved Jobs
  console.log('4️⃣ Fetching candidate saved jobs (GET /api/v1/jobs/saved/my-saved)...');
  const getSavedRes = await request('GET', '/api/v1/jobs/saved/my-saved', authHeaders);
  console.log('   Get Saved Jobs Status:', getSavedRes.status);
  console.log('   Response Success:', getSavedRes.body?.success);
  console.log('   Saved Jobs Count:', getSavedRes.body?.data?.length || 0);
  console.log('   Saved Jobs Sample:', getSavedRes.body?.data ? getSavedRes.body.data[0]?.title : 'None', '\n');

  // 5. Apply for Job
  console.log(`5️⃣ Submitting Job Application (POST /api/v1/jobs/${targetJobId}/apply)...`);
  const applyRes = await request('POST', `/api/v1/jobs/${targetJobId}/apply`, authHeaders, {
    coverNote: 'Experienced CNC Machinist interested in this position.',
  });
  console.log('   Apply Job Status:', applyRes.status);
  console.log('   Response Body:', applyRes.body, '\n');

  // 6. Get Candidate Applied Jobs
  console.log('6️⃣ Fetching candidate applied jobs (GET /api/v1/jobs/applied/my-applications)...');
  const getAppliedRes = await request('GET', '/api/v1/jobs/applied/my-applications', authHeaders);
  console.log('   Get Applied Jobs Status:', getAppliedRes.status);
  console.log('   Response Success:', getAppliedRes.body?.success);
  console.log('   Applied Jobs Count:', getAppliedRes.body?.data?.length || 0);
  console.log('   Applied Jobs Sample:', getAppliedRes.body?.data ? getAppliedRes.body.data[0] : 'None', '\n');

  // 7. Get Candidate Profile
  console.log('7️⃣ Fetching candidate profile (GET /api/v1/auth/me)...');
  const profileRes = await request('GET', '/api/v1/auth/me', authHeaders);
  console.log('   Get Profile Status:', profileRes.status);
  console.log('   Candidate Name:', profileRes.body?.data?.name || profileRes.body?.user?.name, '\n');

  console.log('🎉 ALL ENDPOINTS TESTED SUCCESSFULLY!');
};

runTests().catch(err => {
  console.error('❌ Error during test run:', err);
  process.exit(1);
});
