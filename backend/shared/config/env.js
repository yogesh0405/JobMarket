"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const zod_1 = require("zod");
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../../.env'), override: true });
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../.env'), override: true });
dotenv_1.default.config({ path: path_1.default.resolve(process.cwd(), '.env'), override: true });
const envSchema = zod_1.z.object({
    PORT: zod_1.z.coerce.number().default(5000),
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
    DATABASE_URL: zod_1.z.string().default('postgresql://postgres:postgres@localhost:5432/jobmarket'),
    REDIS_URL: zod_1.z.string().default('redis://localhost:6379'),
    JWT_ACCESS_SECRET: zod_1.z.string().default('dev_jwt_access_secret_key_jobmarket_secure'),
    JWT_REFRESH_SECRET: zod_1.z.string().default('dev_jwt_refresh_secret_key_jobmarket_secure'),
    JWT_ACCESS_EXPIRES_IN: zod_1.z.string().default('1d'),
    JWT_REFRESH_EXPIRES_IN: zod_1.z.string().default('7d'),
    BREVO_API_KEY: zod_1.z.string().default(''),
    CLOUDINARY_URL: zod_1.z.string().default(''),
    ALLOWED_ORIGINS: zod_1.z.string().default('http://localhost:5173,http://localhost:3000,http://localhost:4173,https://job-market-wine.vercel.app'),
    FRONTEND_URL: zod_1.z.string().default('https://job-market-wine.vercel.app'),
    // Internal Microservices Ports
    AUTH_SERVICE_PORT: zod_1.z.coerce.number().default(5001),
    USER_SERVICE_PORT: zod_1.z.coerce.number().default(5002),
    JOB_SERVICE_PORT: zod_1.z.coerce.number().default(5003),
    APPLICATION_SERVICE_PORT: zod_1.z.coerce.number().default(5004),
    NOTIFICATION_SERVICE_PORT: zod_1.z.coerce.number().default(5005),
    SUPPORT_SERVICE_PORT: zod_1.z.coerce.number().default(5006),
    AD_SERVICE_PORT: zod_1.z.coerce.number().default(5007),
    ADMIN_SERVICE_PORT: zod_1.z.coerce.number().default(5008),
    // AWS S3 Storage
    AWS_ACCESS_KEY_ID: zod_1.z.string().default(''),
    AWS_SECRET_ACCESS_KEY: zod_1.z.string().default(''),
    AWS_REGION: zod_1.z.string().default('ap-south-1'),
    AWS_S3_BUCKET_NAME: zod_1.z.string().default(''),
});
const _env = envSchema.safeParse(process.env);
if (!_env.success) {
    console.error('❌ Invalid environment variables in shared kernel:', _env.error.format());
    throw new Error('Invalid environment variables configuration');
}
exports.env = _env.data;
