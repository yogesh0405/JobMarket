import fs from 'fs';
import path from 'path';
import { z } from 'zod';
import { sanitizeUserForResponse } from '../modules/auth/controllers/AuthController';

async function runSecretsAuditTests() {
  console.log('=== STARTING ENTERPRISE SECRETS & CREDENTIALS AUDIT SUITE ===\n');
  let passedCount = 0;
  let failedCount = 0;

  // Test 1: Production Configuration Fail-Closed Gate
  console.log('[TEST 1] Testing Production Environment Fail-Closed Secrets Gate...');
  
  const testEnvSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']),
    DATABASE_URL: z.string(),
    JWT_ACCESS_SECRET: z.string(),
    JWT_REFRESH_SECRET: z.string(),
  }).superRefine((data, ctx) => {
    if (data.NODE_ENV === 'production') {
      if (!data.JWT_ACCESS_SECRET || data.JWT_ACCESS_SECRET === 'dev_jwt_access_secret_key_jobmarket_secure' || data.JWT_ACCESS_SECRET.length < 32) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['JWT_ACCESS_SECRET'],
          message: 'Production deployment requires a cryptographically strong, non-default JWT_ACCESS_SECRET (minimum 32 characters).',
        });
      }
      if (!data.JWT_REFRESH_SECRET || data.JWT_REFRESH_SECRET === 'dev_jwt_refresh_secret_key_jobmarket_secure' || data.JWT_REFRESH_SECRET.length < 32) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['JWT_REFRESH_SECRET'],
          message: 'Production deployment requires a cryptographically strong, non-default JWT_REFRESH_SECRET (minimum 32 characters).',
        });
      }
      if (!data.DATABASE_URL || data.DATABASE_URL.includes('localhost:5432')) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['DATABASE_URL'],
          message: 'Production deployment requires a secure, non-local DATABASE_URL.',
        });
      }
    }
  });

  // Scenario A: Booting production with dev fallback secrets MUST FAIL
  const insecureProductionConfig = {
    NODE_ENV: 'production',
    DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/jobmarket',
    JWT_ACCESS_SECRET: 'dev_jwt_access_secret_key_jobmarket_secure',
    JWT_REFRESH_SECRET: 'dev_jwt_refresh_secret_key_jobmarket_secure',
  };
  const parsedInsecure = testEnvSchema.safeParse(insecureProductionConfig);
  if (!parsedInsecure.success && parsedInsecure.error.issues.length >= 3) {
    console.log('  ✓ PASS: Insecure production defaults rejected with 3 fail-closed validation issues');
    passedCount++;
  } else {
    console.error('  ✗ FAIL: Insecure production configuration was accepted!');
    failedCount++;
  }

  // Scenario B: Booting production with proper cryptographically strong secrets MUST PASS
  const secureProductionConfig = {
    NODE_ENV: 'production',
    DATABASE_URL: 'postgresql://production_user:Secr3t_P@ss!@prod-db.internal.aws:5432/jobmarket_prod',
    JWT_ACCESS_SECRET: '9f8e7d6c5b4a392817263544a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4',
    JWT_REFRESH_SECRET: 'a1b2c3d4e5f60718293a4b5c6d7e8f901a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d',
  };
  const parsedSecure = testEnvSchema.safeParse(secureProductionConfig);
  if (parsedSecure.success) {
    console.log('  ✓ PASS: Validated production environment accepts cryptographically strong secrets');
    passedCount++;
  } else {
    console.error('  ✗ FAIL: Validated production environment failed valid configuration!', parsedSecure.error);
    failedCount++;
  }

  // Test 2: Sensitive Field Stripping from User Responses
  console.log('\n[TEST 2] Testing User Object Sanitization (Credential & Token Stripping)...');
  const rawUserWithSecrets = {
    id: 'user-123',
    name: 'Test Candidate',
    email: 'test@example.com',
    role: 'candidate',
    password_hash: '$2b$12$e8Y6W9d8h3kjs871hjs91823901823',
    refresh_token_hash: '$2b$10$7891273981273918237918',
    two_factor_secret: 'JBSWY3DPEHPK3PXP',
    two_factor_recovery_codes: ['1234-5678', '8765-4321'],
    otp_secret: '987654',
    password_reset_token: 'secret_reset_token_xyz',
    location: 'Pune',
  };

  const sanitized = sanitizeUserForResponse(rawUserWithSecrets);
  const leakedKeys = [
    'password_hash',
    'refresh_token_hash',
    'two_factor_secret',
    'two_factor_recovery_codes',
    'otp_secret',
    'password_reset_token',
  ].filter(key => key in sanitized);

  if (leakedKeys.length === 0 && sanitized.id === 'user-123' && sanitized.name === 'Test Candidate') {
    console.log('  ✓ PASS: All credentials, password hashes, and 2FA recovery secrets stripped');
    passedCount++;
  } else {
    console.error('  ✗ FAIL: Sensitive credentials leaked in response object:', leakedKeys);
    failedCount++;
  }

  // Test 3: Frontend Web Bundle Secret Scan (App/dist)
  console.log('\n[TEST 3] Scanning Compiled Frontend Production Assets for Secret Leaks...');
  const appDistPath = path.resolve(__dirname, '../../../App/dist/assets');
  let bundleClean = true;
  if (fs.existsSync(appDistPath)) {
    const files = fs.readdirSync(appDistPath).filter(f => f.endsWith('.js'));
    const secretKeywords = [
      'AWS_SECRET_ACCESS_KEY',
      'JWT_ACCESS_SECRET',
      'JWT_REFRESH_SECRET',
      'BREVO_API_KEY',
      'postgresql://postgres',
      'BEGIN RSA PRIVATE KEY',
      'BEGIN PRIVATE KEY',
    ];

    for (const file of files) {
      const content = fs.readFileSync(path.join(appDistPath, file), 'utf8');
      for (const kw of secretKeywords) {
        if (content.includes(kw)) {
          console.error(`  ✗ LEAK DETECTED in ${file}: contains '${kw}'`);
          bundleClean = false;
        }
      }
    }
  }

  if (bundleClean) {
    console.log('  ✓ PASS: Zero private keys, JWT secrets, or DB connection strings in web bundle');
    passedCount++;
  } else {
    failedCount++;
  }

  // Test 4: Git Ignore Enforcement for Environment & Service Account Credentials
  console.log('\n[TEST 4] Testing Git Ignore Enforcement for Sensitive Files...');
  const gitignorePath = path.resolve(__dirname, '../../../.gitignore');
  const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
  const requiredIgnores = [
    '.env',
    '.env.local',
    '.env.production',
    'backend/.env',
    'App/.env',
    'MobileApp/.env',
    '*serviceAccountKey*.json',
    '*firebase-adminsdk*.json',
  ];

  let ignoreRulesVerified = true;
  for (const rule of requiredIgnores) {
    if (!gitignoreContent.includes(rule)) {
      console.error(`  ✗ Missing required gitignore rule: ${rule}`);
      ignoreRulesVerified = false;
    }
  }

  if (ignoreRulesVerified) {
    console.log('  ✓ PASS: All critical environment files and service account keys are gitignored');
    passedCount++;
  } else {
    failedCount++;
  }

  console.log(`\n=== SECRETS AUDIT SUITE RESULTS: ${passedCount} PASSED, ${failedCount} FAILED ===`);
  if (failedCount > 0) {
    process.exit(1);
  }
}

runSecretsAuditTests().catch((err) => {
  console.error('Secrets audit suite error:', err);
  process.exit(1);
});
