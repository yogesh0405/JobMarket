import { z } from 'zod';

const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters long.')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter.')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter.')
  .regex(/[0-9]/, 'Password must contain at least one number.')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character.');

export const signupSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format').trim().toLowerCase(),
    password: passwordSchema,
    confirmPassword: z.string(),
    name: z.string().min(1, 'Name is required'),
    role: z.enum(['candidate', 'employer']),
    phone: z.string()
      .regex(/^[6-9]\d{9}$/, 'Phone number must be a valid 10-digit Indian mobile number'),
    companyName: z.string().optional(),
    gstNumber: z.string().optional(),
    aadhaarNumber: z.string()
      .regex(/^\d{12}$/, 'Aadhaar number must be exactly 12 digits')
      .optional()
      .or(z.literal('')),
    tradeSpecialization: z.string().optional()
  }).refine((data: any) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  }).refine((data: any) => {
    if (data.role === 'candidate') {
      return data.email.endsWith('@gmail.com');
    }
    return true;
  }, {
    message: "Users must register using a @gmail.com email address.",
    path: ["email"],
  })
});

export const verifyOTPSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format'),
    otpCode: z.string().length(6, 'OTP must be 6 digits')
  })
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required'),
    role: z.enum(['candidate', 'employer', 'admin']).optional()
  })
});

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
    sessionId: z.string().uuid('Invalid session ID')
  })
});
