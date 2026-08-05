import { z } from 'zod';

export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters long.')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter.')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter.')
  .regex(/[0-9]/, 'Password must contain at least one number.')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character.');

export const phoneSchema = z.string()
  .regex(/^[6-9]\d{9}$/, 'Phone number must be a valid 10-digit Indian mobile number');

export const loginSchema = z.object({
  email: z.string().email('Invalid email format').trim().toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

export const signupSchema = z.object({
  email: z.string().email('Invalid email format').trim().toLowerCase(),
  password: passwordSchema,
  confirmPassword: z.string(),
  name: z.string().min(1, 'Full name is required'),
  phone: phoneSchema,
  companyName: z.string().min(1, 'Company name is required'),
  gstNumber: z.string().optional(),
  tradeSpecialization: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});

export const otpSchema = z.object({
  otpCode: z.string().length(6, 'OTP must be exactly 6 digits'),
});

export const jobPostSchema = z.object({
  title: z.string().min(1, 'Job title is required'),
  trade: z.string().min(1, 'Trade specialization is required'),
  industry: z.string().min(1, 'Industry category is required'),
  job_type: z.enum(['Full-time', 'Part-time', 'Contract', 'Apprenticeship']),
  work_mode: z.enum(['On-site', 'Remote', 'Hybrid']),
  min_experience: z.number().min(0, 'Min experience must be 0 or greater'),
  max_experience: z.number().min(0, 'Max experience must be 0 or greater'),
  salary_min: z.number().min(1, 'Minimum salary is required'),
  salary_max: z.number().min(1, 'Maximum salary is required'),
  openings: z.number().min(1, 'At least 1 opening is required'),
  location: z.string().min(1, 'Job location / address is required'),
  description: z.string().min(10, 'Job description must be at least 10 characters'),
}).refine((data) => data.salary_max >= data.salary_min, {
  message: "Maximum salary must be greater than or equal to minimum salary.",
  path: ["salary_max"],
}).refine((data) => data.max_experience >= data.min_experience, {
  message: "Maximum experience must be greater than or equal to minimum experience.",
  path: ["max_experience"],
});
