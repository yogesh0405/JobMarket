import { COLORS } from '../constants/theme';

/**
 * Professional Corporate Logo Generator & Registry
 * Manages real-time logo caching and fallback resolution for companies
 */

const KNOWN_CORPORATE_LOGOS: Record<string, string> = {
  'tata motors': 'https://logo.clearbit.com/tatamotors.com',
  'tata motors manufacturing': 'https://logo.clearbit.com/tatamotors.com',
  'tata': 'https://logo.clearbit.com/tata.com',
  'bajaj auto': 'https://logo.clearbit.com/bajajauto.com',
  'bajaj auto limited': 'https://logo.clearbit.com/bajajauto.com',
  'bajaj auto ltd': 'https://logo.clearbit.com/bajajauto.com',
  'bajaj': 'https://logo.clearbit.com/bajajauto.com',
  'endurance technologies': 'https://logo.clearbit.com/endurancegroup.com',
  'endurance': 'https://logo.clearbit.com/endurancegroup.com',
  'varroc engineering': 'https://logo.clearbit.com/varroc.com',
  'varroc engineering ltd': 'https://logo.clearbit.com/varroc.com',
  'varroc': 'https://logo.clearbit.com/varroc.com',
  'siemens': 'https://logo.clearbit.com/siemens.com',
  'siemens india': 'https://logo.clearbit.com/siemens.com',
  'siemens india industrial': 'https://logo.clearbit.com/siemens.com',
  'siemens limited': 'https://logo.clearbit.com/siemens.com',
  'bharat forge': 'https://logo.clearbit.com/bharatforge.com',
  'bharat forge limited': 'https://logo.clearbit.com/bharatforge.com',
  'larsen & toubro': 'https://logo.clearbit.com/larsentoubro.com',
  'l&t': 'https://logo.clearbit.com/larsentoubro.com',
  'skoda': 'https://logo.clearbit.com/skoda-auto.com',
  'volkswagen': 'https://logo.clearbit.com/volkswagen.com',
  'mahindra': 'https://logo.clearbit.com/mahindra.com',
  'bosch': 'https://logo.clearbit.com/bosch.in',
  'wockhardt': 'https://logo.clearbit.com/wockhardt.com',
  'ceat': 'https://logo.clearbit.com/ceat.com',
  'ceat tyres': 'https://logo.clearbit.com/ceat.com',
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

export function createCorporateSvgBadge(companyName?: string): string {
  const name = companyName && companyName.trim() ? companyName.trim() : 'Industrial Partner';
  const normKey = name.toLowerCase();

  // Return cached SVG data URI if present
  if (GLOBAL_COMPANY_LOGO_CACHE[normKey]) {
    return GLOBAL_COMPANY_LOGO_CACHE[normKey];
  }

  const parts = name.split(' ').filter(Boolean);
  const initials = parts.length >= 2 ? (parts[0][0] + parts[1][0]).toUpperCase() : name.slice(0, 2).toUpperCase();

  let bg = '#1E3A8A';
  let accent = '#3B82F6';

  if (normKey.includes('tata')) {
    bg = '#1E40AF'; accent = '#60A5FA';
  } else if (normKey.includes('bajaj')) {
    bg = '#D97706'; accent = '#FBBF24';
  } else if (normKey.includes('infosys')) {
    bg = '#0284C7'; accent = '#38BDF8';
  } else if (normKey.includes('persistent')) {
    bg = '#059669'; accent = '#34D399';
  } else if (normKey.includes('siemens')) {
    bg = '#0F766E'; accent = '#2DD4BF';
  } else if (normKey.includes('l&t') || normKey.includes('larsen')) {
    bg = '#B91C1C'; accent = '#F87171';
  } else if (normKey.includes('varroc') || normKey.includes('endurance')) {
    bg = '#7C3AED'; accent = '#A78BFA';
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" rx="28" fill="${bg}"/><circle cx="50" cy="50" r="42" fill="none" stroke="${accent}" stroke-width="4" stroke-opacity="0.5"/><path d="M30 75 V40 L50 25 L70 40 V75 Z" fill="none" stroke="%23FFFFFF" stroke-width="5" stroke-linejoin="round"/><text x="50" y="58" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="28" fill="%23FFFFFF" text-anchor="middle" dominant-baseline="middle">${initials}</text></svg>`;

  const dataUri = `data:image/svg+xml;utf8,${svg}`;
  GLOBAL_COMPANY_LOGO_CACHE[normKey] = dataUri;
  return dataUri;
}

export function getCompanyLogoUrl(companyName?: string, existingLogo?: string): string {
  const normName = companyName && companyName.trim() ? companyName.trim() : '';

  // 1. Check live global cache first
  if (normName) {
    const cached = GLOBAL_COMPANY_LOGO_CACHE[normName.toLowerCase()];
    if (cached && typeof cached === 'string' && cached.trim().length > 5) {
      return cached.trim();
    }
  }

  // 2. Return real database logo image URL if present and valid
  if (
    existingLogo &&
    typeof existingLogo === 'string' &&
    existingLogo.trim().length > 5 &&
    !existingLogo.includes('null') &&
    !existingLogo.includes('undefined') &&
    (
      existingLogo.startsWith('http://') ||
      existingLogo.startsWith('https://') ||
      existingLogo.startsWith('data:image/') ||
      existingLogo.startsWith('file://') ||
      existingLogo.startsWith('content://')
    )
  ) {
    const trimmed = existingLogo.trim();
    if (normName) {
      GLOBAL_COMPANY_LOGO_CACHE[normName.toLowerCase()] = trimmed;
    }
    return trimmed;
  }

  // 3. Match against real corporate brand logos
  if (normName) {
    const lower = normName.toLowerCase();
    for (const [key, logo] of Object.entries(KNOWN_CORPORATE_LOGOS)) {
      if (lower === key || lower.includes(key) || key.includes(lower)) {
        GLOBAL_COMPANY_LOGO_CACHE[lower] = logo;
        return logo;
      }
    }
  }

  // 4. Default high quality company image fallback
  return 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=250&q=80';
}
