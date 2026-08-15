import { COLORS } from '../constants/theme';

/**
 * Professional Corporate Logo Generator & Registry
 * Manages real-time logo caching and fallback resolution for companies
 */

const CORPORATE_LOGO_PLACEHOLDERS: Record<string, string> = {
  'tata motors': 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=250&q=80',
  'bajaj auto': 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=250&q=80',
  'endurance technologies': 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=250&q=80',
  'varroc engineering': 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=250&q=80',
  'siemens': 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=250&q=80',
  'l&t precision': 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=250&q=80',
  'perkins engines': 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=250&q=80',
  'default': 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=250&q=80',
};

// Global reactive logo cache for immediate reflection across all screens & job lists
const GLOBAL_COMPANY_LOGO_CACHE: Record<string, string> = {};

export function setGlobalCompanyLogo(companyName: string, logoUrl: string) {
  if (companyName && logoUrl && typeof logoUrl === 'string' && logoUrl.trim().length > 5) {
    const key = companyName.trim().toLowerCase();
    GLOBAL_COMPANY_LOGO_CACHE[key] = logoUrl.trim();
  }
}

export function getGlobalCompanyLogo(companyName?: string): string | null {
  if (!companyName) return null;
  const key = companyName.trim().toLowerCase();
  return GLOBAL_COMPANY_LOGO_CACHE[key] || null;
}

export function getCompanyLogoUrl(companyName?: string, existingLogo?: string): string | null {
  const normName = companyName && companyName.trim() ? companyName.trim() : '';

  // 1. Check live global cache first (ensures updated logos reflect instantly across all lists/cards)
  if (normName) {
    const cached = GLOBAL_COMPANY_LOGO_CACHE[normName.toLowerCase()];
    if (cached) {
      return cached;
    }
  }

  // 2. Return real database logo image URL if present and valid (must not be SVG Data URI)
  if (
    existingLogo &&
    typeof existingLogo === 'string' &&
    existingLogo.trim().length > 5 &&
    !existingLogo.includes('null') &&
    !existingLogo.includes('undefined') &&
    !existingLogo.startsWith('data:image/svg+xml') &&
    (
      existingLogo.startsWith('http://') ||
      existingLogo.startsWith('https://') ||
      existingLogo.startsWith('data:image/') ||
      existingLogo.startsWith('file://') ||
      existingLogo.startsWith('content://') ||
      existingLogo.startsWith('ph://') ||
      existingLogo.startsWith('blob:')
    )
  ) {
    const trimmed = existingLogo.trim();
    if (normName) {
      GLOBAL_COMPANY_LOGO_CACHE[normName.toLowerCase()] = trimmed;
    }
    return trimmed;
  }

  // 3. Match corporate placeholder by name if available
  if (normName) {
    const lower = normName.toLowerCase();
    for (const [key, placeholderUrl] of Object.entries(CORPORATE_LOGO_PLACEHOLDERS)) {
      if (lower.includes(key)) {
        return placeholderUrl;
      }
    }
  }

  return null;
}
