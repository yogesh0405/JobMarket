import path from 'path';
import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config({ path: path.resolve(__dirname, '../../../.env'), override: true });
dotenv.config({ path: path.resolve(__dirname, '../../.env'), override: true });
dotenv.config({ path: path.resolve(process.cwd(), '.env'), override: true });

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().default('postgresql://neondb_owner:npg_2LENyTJDu7AQ@ep-still-glade-aznr0ikn-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=verify-full'),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  JWT_ACCESS_SECRET: z.string().default('super_secret_access_key_change_me_in_prod'),
  JWT_REFRESH_SECRET: z.string().default('super_secret_refresh_key_change_me_in_prod'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('1d'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  BREVO_API_KEY: z.string().default(''),
  CLOUDINARY_URL: z.string().default('cloudinary://111364167496953:u99_zeW9Hrvk32mQa2a0fnX-ApY@gm4yqzhg'),
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
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Invalid environment variables in shared kernel:', _env.error.format());
  throw new Error('Invalid environment variables configuration');
}

export const env = _env.data!;
