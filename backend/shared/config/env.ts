import path from 'path';
import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config({ path: path.resolve(__dirname, '../../../.env'), override: true });
dotenv.config({ path: path.resolve(__dirname, '../../.env'), override: true });
dotenv.config({ path: path.resolve(process.cwd(), '.env'), override: true });

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().default('postgresql://postgres:postgres@localhost:5432/jobmarket'),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  JWT_ACCESS_SECRET: z.string().default('c60bb299365a1bd6db5b4c618b092d941a1590882b3dcf633337731d1e057860'),
  JWT_REFRESH_SECRET: z.string().default('3a091dcf98efd1bc0962025495f301cef7349d0ac70ba913ffc64f789803bea7'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('1d'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  BREVO_API_KEY: z.string().default(''),
  CLOUDINARY_URL: z.string().default(''),
  ALLOWED_ORIGINS: z.string().default('http://localhost:5173,http://localhost:3000,http://localhost:4173,https://job-market-wine.vercel.app'),
  FRONTEND_URL: z.string().default('https://job-market-wine.vercel.app'),

  // Internal Microservices Ports
  AUTH_SERVICE_PORT: z.coerce.number().default(5001),
  USER_SERVICE_PORT: z.coerce.number().default(5002),
  JOB_SERVICE_PORT: z.coerce.number().default(5003),
  APPLICATION_SERVICE_PORT: z.coerce.number().default(5004),
  NOTIFICATION_SERVICE_PORT: z.coerce.number().default(5005),
  SUPPORT_SERVICE_PORT: z.coerce.number().default(5006),
  AD_SERVICE_PORT: z.coerce.number().default(5007),
  ADMIN_SERVICE_PORT: z.coerce.number().default(5008),
  JOB_ALERT_SERVICE_PORT: z.coerce.number().default(5010),

  // AWS S3 Storage
  AWS_ACCESS_KEY_ID: z.string().default(''),
  AWS_SECRET_ACCESS_KEY: z.string().default(''),
  AWS_REGION: z.string().default('ap-south-1'),
  AWS_S3_BUCKET_NAME: z.string().default(''),
}).superRefine((data, ctx) => {
  if (data.NODE_ENV === 'production') {
    if (process.env.JWT_ACCESS_SECRET && process.env.JWT_ACCESS_SECRET.length < 32) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['JWT_ACCESS_SECRET'],
        message: 'Production deployment requires a cryptographically strong JWT_ACCESS_SECRET (minimum 32 characters).',
      });
    }
    if (process.env.JWT_REFRESH_SECRET && process.env.JWT_REFRESH_SECRET.length < 32) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['JWT_REFRESH_SECRET'],
        message: 'Production deployment requires a cryptographically strong JWT_REFRESH_SECRET (minimum 32 characters).',
      });
    }
    if (!process.env.DATABASE_URL || data.DATABASE_URL.includes('localhost:5432')) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['DATABASE_URL'],
        message: 'Production deployment requires a secure, non-local DATABASE_URL.',
      });
    }
  }
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  // Redact actual values from errors to prevent secret leakage in logs
  const redactedErrors = _env.error.issues.map(iss => ({ path: iss.path.join('.'), message: iss.message }));
  console.error('❌ FATAL: Invalid production environment configuration in shared kernel:', JSON.stringify(redactedErrors, null, 2));
  throw new Error('Invalid environment variables configuration');
}

export const env = _env.data!;
