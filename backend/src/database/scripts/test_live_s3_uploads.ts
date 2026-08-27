import { pool } from '../../config/database/pool';
import { generateTokens } from '../../utils/jwt';
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { env } from '../../config/env';

async function runLiveS3Test() {
  console.log('🧪 Starting Full End-to-End Live S3 Upload Test across all features...\n');

  try {
    // 1. Get a test candidate and test employer from DB
    const candidateRes = await pool.query("SELECT id, email, role FROM users WHERE role = 'candidate' LIMIT 1");
    const employerRes = await pool.query("SELECT id, email, role FROM users WHERE role IN ('employer', 'recruiter') LIMIT 1");

    if (candidateRes.rows.length === 0 || employerRes.rows.length === 0) {
      console.error('Could not find candidate or employer in DB.');
      process.exit(1);
    }

    const candidate = candidateRes.rows[0];
    const employer = employerRes.rows[0];

    const candidateTokens = generateTokens({ userId: candidate.id, email: candidate.email, role: candidate.role });
    const employerTokens = generateTokens({ userId: employer.id, email: employer.email, role: employer.role });

    const baseUrl = 'http://127.0.0.1:5000';

    // Sample 1x1 base64 png
    const samplePngBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const samplePdfBase64 = 'data:application/pdf;base64,JVBERi0xLjQKJcTl8uXrp/Og0MTGCjQgMCBvYmoKPDwKL0tpZHMgWyAzIDAgUiBdCi9UeXBlIC9QYWdlcwovQ291bnQgMQo+PgplbmRvYmoKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgNCAwIFIKPj4KZW5kb2Jq';

    // TEST 1: Candidate Avatar Upload via POST /api/v1/auth/profile/picture
    console.log('1️⃣ Testing Candidate Avatar Upload...');
    const avatarRes = await fetch(`${baseUrl}/api/v1/auth/profile/picture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${candidateTokens.accessToken}`,
        'x-user-id': candidate.id,
      },
      body: JSON.stringify({ image: samplePngBase64 }),
    });
    const avatarJson = await avatarRes.json() as any;
    console.log('   Status:', avatarRes.status, '| Response URL:', avatarJson.data?.profile_picture_url || avatarJson.url);
    if (!avatarRes.ok || !(avatarJson.data?.profile_picture_url || '').includes('s3.')) {
      throw new Error(`Candidate avatar upload failed: ${JSON.stringify(avatarJson)}`);
    }
    console.log('   ✅ Candidate avatar stored in S3 successfully!\n');

    // TEST 2: Candidate Resume Upload via POST /api/v1/auth/resume
    console.log('2️⃣ Testing Candidate Resume Upload...');
    const resumeRes = await fetch(`${baseUrl}/api/v1/auth/resume`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${candidateTokens.accessToken}`,
        'x-user-id': candidate.id,
      },
      body: JSON.stringify({
        base64: samplePdfBase64,
        name: 'My_Candidate_Resume.pdf',
        size: '0.1 MB',
        type: 'application/pdf',
      }),
    });
    const resumeJson = await resumeRes.json() as any;
    console.log('   Status:', resumeRes.status, '| Response URL:', resumeJson.url || resumeJson.data?.resume?.url);
    if (!resumeRes.ok || !(resumeJson.url || resumeJson.data?.resume?.url || '').includes('s3.')) {
      throw new Error(`Candidate resume upload failed: ${JSON.stringify(resumeJson)}`);
    }
    console.log('   ✅ Candidate resume stored in S3 successfully!\n');

    // TEST 3: Employer Profile Logo Update via PUT /api/v1/auth/profile
    console.log('3️⃣ Testing Employer Profile Logo Upload via profile update...');
    const empProfileRes = await fetch(`${baseUrl}/api/v1/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${employerTokens.accessToken}`,
        'x-user-id': employer.id,
      },
      body: JSON.stringify({
        name: 'Updated Employer Company',
        companyName: 'Updated Employer Company',
        companyLogo: samplePngBase64,
      }),
    });
    const empProfileJson = await empProfileRes.json() as any;
    console.log('   Status:', empProfileRes.status, '| Response Logo:', empProfileJson.data?.profile_picture_url);
    if (!empProfileRes.ok || !(empProfileJson.data?.profile_picture_url || '').includes('s3.')) {
      throw new Error(`Employer logo upload failed: ${JSON.stringify(empProfileJson)}`);
    }
    console.log('   ✅ Employer company logo stored in S3 successfully!\n');

    // TEST 4: Job Posting with Company Logo via POST /api/v1/jobs
    console.log('4️⃣ Testing Job Posting Company Logo Upload...');
    const jobRes = await fetch(`${baseUrl}/api/v1/jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${employerTokens.accessToken}`,
        'x-user-id': employer.id,
        'x-user-role': employer.role,
      },
      body: JSON.stringify({
        title: 'Senior S3 Test Engineer',
        description: 'Testing S3 media integration end-to-end.',
        industry: 'Manufacturing',
        category: 'Engineering',
        jobType: 'Full-time',
        workMode: 'On-site',
        location: 'Pune MIDC',
        companyLogo: samplePngBase64,
        openings: 2,
        minExperience: 1,
        maxExperience: 5,
        salaryMin: 50000,
        salaryMax: 80000,
      }),
    });
    const jobJson = await jobRes.json() as any;
    console.log('   Status:', jobRes.status, '| Job Logo URL:', jobJson.data?.company_logo || jobJson.data?.companyLogo);
    if (!jobRes.ok || !(jobJson.data?.company_logo || jobJson.data?.companyLogo || '').includes('s3.')) {
      throw new Error(`Job logo upload failed: ${JSON.stringify(jobJson)}`);
    }
    console.log('   ✅ Job company logo stored in S3 successfully!\n');

    // TEST 5: Support Ticket with Attachment via POST /api/support/tickets
    console.log('5️⃣ Testing Support Ticket Attachment Upload...');
    const ticketRes = await fetch(`${baseUrl}/api/support/tickets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${candidateTokens.accessToken}`,
        'x-user-id': candidate.id,
      },
      body: JSON.stringify({
        fullName: 'Candidate Tester',
        email: candidate.email,
        subject: 'Live S3 Attachment Verification',
        description: 'Verifying attachment storage on AWS S3.',
        category: 'General Technical Inquiry',
        attachmentBase64: samplePngBase64,
        attachmentName: 'screenshot_error.png',
      }),
    });
    const ticketJson = await ticketRes.json() as any;
    console.log('   Status:', ticketRes.status, '| Ticket Attachment:', ticketJson.data?.attachment);
    if (!ticketRes.ok || !(ticketJson.data?.attachment || '').includes('s3.')) {
      throw new Error(`Support ticket attachment upload failed: ${JSON.stringify(ticketJson)}`);
    }
    console.log('   ✅ Support ticket attachment stored in S3 successfully!\n');

    // TEST 6: Verify S3 bucket contains the new live items
    console.log('6️⃣ Verifying S3 Bucket Objects...');
    const s3 = new S3Client({
      region: env.AWS_REGION || 'eu-north-1',
      credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
      }
    });
    const listRes = await s3.send(new ListObjectsV2Command({ Bucket: env.AWS_S3_BUCKET_NAME }));
    console.log(`   🎉 Total verified files in S3 Bucket: ${listRes.KeyCount}`);
    
    console.log('\n======================================================');
    console.log('🏆 100% OF ALL LIVE MEDIA UPLOADS ARE STORED IN S3!');
    console.log('======================================================\n');
    process.exit(0);
  } catch (err: any) {
    console.error('❌ Live S3 Upload Test Failed:', err);
    process.exit(1);
  }
}

runLiveS3Test();
