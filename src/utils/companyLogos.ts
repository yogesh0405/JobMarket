/**
 * Professional Corporate Logo Generator & Registry
 * Provides high-quality vector corporate logos (SVG Data URIs and SVG components)
 * for companies across automotive, manufacturing, healthcare, tech, hospitality, etc.
 */

// Helper to sanitize text for SVG
const escapeSvgText = (str: string): string => {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
};

// Color palettes for corporate identities
const CORPORATE_PALETTES = [
  { primary: '#1E3A8A', secondary: '#3B82F6', accent: '#60A5FA', text: '#FFFFFF', bgGrad: ['#0F172A', '#1E3A8A'] }, // Tech Deep Blue
  { primary: '#B45309', secondary: '#F59E0B', accent: '#FBBF24', text: '#FFFFFF', bgGrad: ['#451A03', '#B45309'] }, // Bronze Amber
  { primary: '#047857', secondary: '#10B981', accent: '#34D399', text: '#FFFFFF', bgGrad: ['#064E3B', '#047857'] }, // Emerald Green
  { primary: '#6D28D9', secondary: '#8B5CF6', accent: '#A78BFA', text: '#FFFFFF', bgGrad: ['#3B0764', '#6D28D9'] }, // Deep Violet
  { primary: '#DC2626', secondary: '#EF4444', accent: '#F87171', text: '#FFFFFF', bgGrad: ['#7F1D1D', '#DC2626'] }, // Crimson Red
  { primary: '#0891B2', secondary: '#06B6D4', accent: '#67E8F9', text: '#FFFFFF', bgGrad: ['#164E63', '#0891B2'] }, // Cyan Ocean
  { primary: '#15803D', secondary: '#22C55E', accent: '#4ADE80', text: '#FFFFFF', bgGrad: ['#14532D', '#15803D'] }, // Forest Agro Green
  { primary: '#BE185D', secondary: '#EC4899', accent: '#F472B6', text: '#FFFFFF', bgGrad: ['#831843', '#BE185D'] }, // Magenta Pharma
  { primary: '#4338CA', secondary: '#6366F1', accent: '#818CF8', text: '#FFFFFF', bgGrad: ['#1E1B4B', '#4338CA'] }, // Royal Indigo
  { primary: '#0369A1', secondary: '#0284C7', accent: '#38BDF8', text: '#FFFFFF', bgGrad: ['#0C4A6E', '#0369A1'] }, // Oceanic Blue
];

/**
 * Generate a deterministic index from company name
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

/**
 * Generates an SVG string for a modern corporate logo badge
 */
export function getCompanyLogoSvg(companyName: string, customColor?: string): string {
  const name = companyName || 'Company';
  const cleanName = escapeSvgText(name);
  const initials = name
    .split(' ')
    .filter(Boolean)
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'CO';

  const hash = hashString(name);
  const paletteIndex = hash % CORPORATE_PALETTES.length;
  const palette = CORPORATE_PALETTES[paletteIndex];
  
  const secondaryColor = palette.secondary;
  const accentColor = palette.accent;
  const [bg1, bg2] = palette.bgGrad;

  // Choose icon geometry style based on hash % 6
  const styleType = hash % 6;

  let emblemPaths = '';

  switch (styleType) {
    case 0: // Hexagon Shield
      emblemPaths = `
        <polygon points="50,14 84,33 84,71 50,90 16,71 16,33" fill="none" stroke="${accentColor}" stroke-width="4" opacity="0.4"/>
        <polygon points="50,22 76,37 76,67 50,82 24,67 24,37" fill="url(#grad2_${hash})" opacity="0.85"/>
        <path d="M50 28 L68 40 L68 62 L50 74 L32 62 L32 40 Z" fill="none" stroke="${palette.text}" stroke-width="2.5"/>
      `;
      break;
    case 1: // Interlocking Corporate Rings / Nodes
      emblemPaths = `
        <circle cx="40" cy="46" r="22" fill="none" stroke="${secondaryColor}" stroke-width="5" opacity="0.7"/>
        <circle cx="60" cy="54" r="22" fill="none" stroke="${accentColor}" stroke-width="5" opacity="0.9"/>
        <circle cx="50" cy="50" r="12" fill="url(#grad2_${hash})"/>
      `;
      break;
    case 2: // Dynamic Chevron Wings
      emblemPaths = `
        <path d="M22 68 L50 24 L78 68 L64 68 L50 44 L36 68 Z" fill="url(#grad2_${hash})"/>
        <path d="M30 76 L50 46 L70 76 L60 76 L50 60 L40 76 Z" fill="${accentColor}" opacity="0.8"/>
      `;
      break;
    case 3: // Modern Diamond Lattice
      emblemPaths = `
        <rect x="28" y="28" width="44" height="44" rx="8" transform="rotate(45 50 50)" fill="url(#grad2_${hash})"/>
        <rect x="34" y="34" width="32" height="32" rx="5" transform="rotate(45 50 50)" fill="none" stroke="${accentColor}" stroke-width="3"/>
      `;
      break;
    case 4: // Medical / Tech Cross Shield
      emblemPaths = `
        <rect x="20" y="20" width="60" height="60" rx="16" fill="url(#grad2_${hash})"/>
        <path d="M42 32 H58 V42 H68 V58 H58 V68 H42 V58 H32 V42 H42 Z" fill="${palette.text}" opacity="0.95"/>
      `;
      break;
    default: // Circle Emblem with Arc
      emblemPaths = `
        <circle cx="50" cy="50" r="32" fill="url(#grad2_${hash})"/>
        <path d="M20 50 A30 30 0 0 1 80 50" fill="none" stroke="${accentColor}" stroke-width="4" stroke-linecap="round"/>
        <path d="M24 50 A26 26 0 0 0 76 50" fill="none" stroke="${palette.text}" stroke-width="2" stroke-dasharray="4,4"/>
      `;
      break;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <defs>
    <linearGradient id="bgGrad_${hash}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${customColor || bg1}" />
      <stop offset="100%" stop-color="${customColor || bg2}" />
    </linearGradient>
    <linearGradient id="grad2_${hash}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${secondaryColor}" />
      <stop offset="100%" stop-color="${accentColor}" />
    </linearGradient>
    <filter id="shadow_${hash}" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.3"/>
    </filter>
  </defs>
  <!-- Background Card -->
  <rect width="100" height="100" rx="22" fill="url(#bgGrad_${hash})" />
  
  <!-- Inner Border -->
  <rect x="2" y="2" width="96" height="96" rx="20" fill="none" stroke="#FFFFFF" stroke-width="1.5" opacity="0.2"/>
  
  <!-- Emblem Geometry -->
  <g filter="url(#shadow_${hash})">
    ${emblemPaths}
  </g>

  <!-- Typography Monogram Overlay -->
  <text x="50" y="54" 
        font-family="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" 
        font-weight="800" 
        font-size="${initials.length > 2 ? '22' : '26'}" 
        fill="#FFFFFF" 
        text-anchor="middle" 
        dominant-baseline="central"
        letter-spacing="0.5"
        style="text-shadow: 0 2px 4px rgba(0,0,0,0.4)">${cleanName ? initials : 'CO'}</text>
</svg>`;
}

/**
 * Returns a base64 encoded SVG Data URI that can be used directly as img src
 */
export function getCompanyLogoDataUrl(companyName: string, customColor?: string): string {
  const svg = getCompanyLogoSvg(companyName, customColor);
  try {
    const base64 = btoa(unescape(encodeURIComponent(svg)));
    return `data:image/svg+xml;base64,${base64}`;
  } catch (e) {
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  }
}

/**
 * Pre-defined SVG Data URIs for key companies in the system
 */
export const PRESET_COMPANY_LOGOS: Record<string, string> = {
  'Tata AutoComp Systems': getCompanyLogoDataUrl('Tata AutoComp Systems', '#1E3A8A'),
  'Bharat Forge Ltd': getCompanyLogoDataUrl('Bharat Forge Ltd', '#B45309'),
  'Thermax Industrial': getCompanyLogoDataUrl('Thermax Industrial', '#047857'),
  'Rucha Yantra Robotics': getCompanyLogoDataUrl('Rucha Yantra Robotics', '#6D28D9'),
  'Varroc Engineering': getCompanyLogoDataUrl('Varroc Engineering', '#DC2626'),
  'Sigma Electric': getCompanyLogoDataUrl('Sigma Electric', '#0891B2'),
  'John Deere India': getCompanyLogoDataUrl('John Deere India', '#15803D'),
  'Lupin Pharmaceuticals': getCompanyLogoDataUrl('Lupin Pharmaceuticals', '#BE185D'),
  'Godrej & Boyce': getCompanyLogoDataUrl('Godrej & Boyce', '#4338CA'),
  'Mahindra Heavy Engines': getCompanyLogoDataUrl('Mahindra Heavy Engines', '#B91C1C'),
  'Finolex Cables': getCompanyLogoDataUrl('Finolex Cables', '#0369A1'),
  'Endurance Technologies': getCompanyLogoDataUrl('Endurance Technologies', '#4F46E5'),
  'Galaxy Care Hospital': getCompanyLogoDataUrl('Galaxy Care Hospital', '#EF4444'),
  'Grand Regent Hotels': getCompanyLogoDataUrl('Grand Regent Hotels', '#D97706'),
  'Orchids International School': getCompanyLogoDataUrl('Orchids International School', '#059669'),
};

/**
 * Get logo URL for any company name
 */
export function getCompanyLogo(companyName?: string, customColor?: string): string {
  if (!companyName) return getCompanyLogoDataUrl('Job Market', '#2563EB');
  return PRESET_COMPANY_LOGOS[companyName] || getCompanyLogoDataUrl(companyName, customColor);
}
