import { COLORS } from '../constants/theme';
/**
 * Professional Corporate Logo Generator & Registry
 * Provides high-quality vector corporate logos (SVG Data URIs and database images)
 * for companies across automotive, manufacturing, healthcare, tech, hospitality, etc.
 */

const CORPORATE_PALETTES = [
  { bg1: '#0F172A', bg2: COLORS.primary, accent: '#60A5FA' },
  { bg1: '#451A03', bg2: '#B45309', accent: '#FBBF24' },
  { bg1: '#064E3B', bg2: '#047857', accent: '#34D399' },
  { bg1: '#3B0764', bg2: '#6D28D9', accent: '#A78BFA' },
  { bg1: '#7F1D1D', bg2: '#DC2626', accent: '#F87171' },
  { bg1: '#164E63', bg2: '#0891B2', accent: '#67E8F9' },
  { bg1: '#14532D', bg2: '#15803D', accent: '#4ADE80' },
  { bg1: '#831843', bg2: '#BE185D', accent: '#F472B6' },
  { bg1: '#1E1B4B', bg2: '#4338CA', accent: '#818CF8' },
  { bg1: '#0C4A6E', bg2: '#0369A1', accent: '#38BDF8' },
];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

export function getCompanyLogoUrl(companyName?: string, existingLogo?: string, customColor?: string): string {
  // 1. Return real database logo image URL if present
  if (
    existingLogo &&
    typeof existingLogo === 'string' &&
    existingLogo.trim().length > 5 &&
    !existingLogo.includes('null') &&
    !existingLogo.includes('undefined') &&
    (existingLogo.startsWith('http://') || existingLogo.startsWith('https://') || existingLogo.startsWith('data:image/'))
  ) {
    return existingLogo.trim();
  }

  // 2. Generate high-quality corporate vector SVG Data URI
  const name = companyName && companyName.trim() ? companyName.trim() : 'Company';
  const initials = name
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'CO';

  const hash = hashString(name);
  const palette = CORPORATE_PALETTES[hash % CORPORATE_PALETTES.length];

  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${palette.bg1}"/><stop offset="100%" stop-color="${palette.bg2}"/></linearGradient></defs><rect width="100" height="100" rx="24" fill="url(#bg)"/><rect x="3" y="3" width="94" height="94" rx="21" fill="none" stroke="${palette.accent}" stroke-width="2.5" stroke-opacity="0.45"/><text x="50" y="58" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="34" fill="#FFFFFF" text-anchor="middle" dominant-baseline="central" letter-spacing="1">${initials}</text></svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svgContent)}`;
}
