export interface Issue {
  path: (string | number)[];
  message: string;
}

export type SafeParseResult<T> =
  | { success: true; data: T; error?: undefined }
  | { success: false; data?: undefined; error: { issues: Issue[]; errors: Issue[] } };

export interface Validator<T> {
  safeParse: (data: any) => SafeParseResult<T>;
}

const createValidator = <T>(validateFn: (data: any) => Issue[]): Validator<T> => ({
  safeParse: (data: any): SafeParseResult<T> => {
    const issues = validateFn(data || {});
    if (issues.length > 0) {
      return {
        success: false,
        error: {
          issues,
          errors: issues,
        },
      };
    }
    return {
      success: true,
      data: data as T,
    };
  },
});

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const INDIAN_PHONE_REGEX = /^[6-9]\d{9}$/;

export const validatePassword = (pass: string): Issue[] => {
  const issues: Issue[] = [];
  const val = String(pass || '');
  if (val.length < 8) {
    issues.push({ path: ['password'], message: 'Password must be at least 8 characters long.' });
  }
  if (!/[A-Z]/.test(val)) {
    issues.push({ path: ['password'], message: 'Password must contain at least one uppercase letter.' });
  }
  if (!/[a-z]/.test(val)) {
    issues.push({ path: ['password'], message: 'Password must contain at least one lowercase letter.' });
  }
  if (!/[0-9]/.test(val)) {
    issues.push({ path: ['password'], message: 'Password must contain at least one number.' });
  }
  if (!/[^A-Za-z0-9]/.test(val)) {
    issues.push({ path: ['password'], message: 'Password must contain at least one special character.' });
  }
  return issues;
};

export const validateIndianPhone = (phone: string, required: boolean = true): { isValid: boolean; message?: string } => {
  const clean = String(phone || '').replace(/[^0-9]/g, '');
  if (!clean) {
    if (!required) return { isValid: true };
    return { isValid: false, message: 'Phone number is required.' };
  }
  if (clean.length !== 10) {
    return { isValid: false, message: 'Phone number must be exactly 10 digits.' };
  }
  if (!/^[6-9]/.test(clean)) {
    return { isValid: false, message: 'Phone number must be a valid Indian mobile number starting with 6, 7, 8, or 9.' };
  }
  return { isValid: true };
};

export const passwordSchema = createValidator<string>((val) => validatePassword(String(val || '')));

export const phoneSchema = createValidator<string>((val) => {
  const issues: Issue[] = [];
  const res = validateIndianPhone(String(val || ''), true);
  if (!res.isValid && res.message) {
    issues.push({ path: ['phone'], message: res.message });
  }
  return issues;
});

export const loginSchema = createValidator<{ email: string; password: string }>((data) => {
  const issues: Issue[] = [];
  const email = String(data?.email || '').trim().toLowerCase();
  const password = String(data?.password || '');

  if (!email || !EMAIL_REGEX.test(email)) {
    issues.push({ path: ['email'], message: 'Invalid email format' });
  }
  if (!password || password.trim().length === 0) {
    issues.push({ path: ['password'], message: 'Password is required' });
  }
  return issues;
});

export const signupSchema = createValidator<any>((data) => {
  const issues: Issue[] = [];
  const email = String(data?.email || '').trim().toLowerCase();
  const password = String(data?.password || '');
  const confirmPassword = String(data?.confirmPassword || '');
  const name = String(data?.name || data?.companyName || (email ? email.split('@')[0] : 'User')).trim();
  const phone = String(data?.phone || '').trim();

  if (!email || !EMAIL_REGEX.test(email)) {
    issues.push({ path: ['email'], message: 'Invalid email format' });
  }

  const passIssues = validatePassword(password);
  issues.push(...passIssues);

  if (password !== confirmPassword) {
    issues.push({ path: ['confirmPassword'], message: 'Passwords do not match.' });
  }

  if (!name) {
    issues.push({ path: ['name'], message: 'Name is required' });
  }

  const phoneRes = validateIndianPhone(phone, true);
  if (!phoneRes.isValid && phoneRes.message) {
    issues.push({ path: ['phone'], message: phoneRes.message });
  }

  return issues;
});

export const otpSchema = createValidator<{ otpCode: string }>((data) => {
  const issues: Issue[] = [];
  const code = String(data?.otpCode || '').trim();
  if (code.length !== 6 || !/^\d{6}$/.test(code)) {
    issues.push({ path: ['otpCode'], message: 'OTP must be exactly 6 digits' });
  }
  return issues;
});

export const jobPostSchema = createValidator<any>((data) => {
  const issues: Issue[] = [];
  const title = String(data?.title || '').trim();
  const trade = String(data?.trade || '').trim();
  const industry = String(data?.industry || '').trim();
  const minExp = Number(data?.min_experience ?? 0);
  const maxExp = Number(data?.max_experience ?? 0);
  const salaryMin = Number(data?.salary_min ?? 0);
  const salaryMax = Number(data?.salary_max ?? 0);
  const openings = Number(data?.openings ?? 1);
  const location = String(data?.location || '').trim();
  const description = String(data?.description || '').trim();

  if (!title) issues.push({ path: ['title'], message: 'Job title is required' });
  if (!trade) issues.push({ path: ['trade'], message: 'Trade specialization is required' });
  if (!industry) issues.push({ path: ['industry'], message: 'Industry category is required' });
  if (minExp < 0) issues.push({ path: ['min_experience'], message: 'Min experience must be 0 or greater' });
  if (maxExp < minExp) issues.push({ path: ['max_experience'], message: 'Maximum experience must be greater than or equal to minimum experience.' });
  if (salaryMin <= 0) issues.push({ path: ['salary_min'], message: 'Minimum salary is required' });
  if (salaryMax < salaryMin) issues.push({ path: ['salary_max'], message: 'Maximum salary must be greater than or equal to minimum salary.' });
  if (openings < 1) issues.push({ path: ['openings'], message: 'At least 1 opening is required' });
  if (!location) issues.push({ path: ['location'], message: 'Job location / address is required' });
  if (description.length < 10) issues.push({ path: ['description'], message: 'Job description must be at least 10 characters' });

  return issues;
});
