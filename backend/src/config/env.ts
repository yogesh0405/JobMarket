import path from 'path';
import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config({ path: path.resolve(__dirname, '../../.env'), override: true });
dotenv.config({ path: path.resolve(process.cwd(), '.env'), override: true });

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().default('postgresql://postgres:postgres@localhost:5432/jobmarket'),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  JWT_ACCESS_SECRET: z.string().default('dev_jwt_access_secret_key_jobmarket_secure'),
  JWT_REFRESH_SECRET: z.string().default('dev_jwt_refresh_secret_key_jobmarket_secure'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('1d'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  BREVO_API_KEY: z.string().default(''),
  CLOUDINARY_URL: z.string().default(''),
  ALLOWED_ORIGINS: z.string().default('http://localhost:5173,http://localhost:3000,http://localhost:4173,https://job-market-wine.vercel.app'),
  FRONTEND_URL: z.string().default('https://job-market-wine.vercel.app'),
  AWS_ACCESS_KEY_ID: z.string().default(''),
  AWS_SECRET_ACCESS_KEY: z.string().default(''),
  AWS_REGION: z.string().default('ap-south-1'),
  AWS_S3_BUCKET_NAME: z.string().default(''),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Invalid environment variables:', _env.error.format());
  throw new Error('Invalid environment variables configuration');
}

export const env = _env.data!;
