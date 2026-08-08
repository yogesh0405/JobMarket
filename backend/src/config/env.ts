import path from 'path';
import dotenv from 'dotenv';
const { z } = require('zod');

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
  BREVO_API_KEY: z.string().default('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'),
  CLOUDINARY_URL: z.string().default('cloudinary://111364167496953:u99_zeW9Hrvk32mQa2a0fnX-ApY@gm4yqzhg'),
  ALLOWED_ORIGINS: z.string().default('http://localhost:5173,http://localhost:3000,http://localhost:4173'),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Invalid environment variables:', _env.error.format());
  throw new Error('Invalid environment variables configuration');
}

export const env = _env.data!;
