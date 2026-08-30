// ─────────────────────────────────────────────────────────────────────────────
// Universal Web Application Design System — Single Source of Truth Theme
// ─────────────────────────────────────────────────────────────────────────────
// 100% Parity with MobileApp Theme (MobileApp/src/constants/theme.ts)
// Changing tokens in this file updates the entire Web Application UI.
// ─────────────────────────────────────────────────────────────────────────────

const PRIMARY_COLOR = '#1B4FDF';
const OFF_WHITE_BG = '#F7F7F7';
const BACKGROUND_GREY = '#F8FAFC';

export const COLORS = {
  // ── Brand / Primary (Single Source of Truth) ──────────────────────────────
  primary: PRIMARY_COLOR,
  primaryLight: '#EFF6FF',          // Blue 50  — light tint backgrounds
  primaryDark: '#153BB0',
  primaryBorder: '#BFDBFE',         // Blue 200 — bordered chips & outlines

  // ── Surfaces & Backgrounds ───────────────────────────────────────────────
  offWhite: OFF_WHITE_BG,           // #F7F7F7
  background: BACKGROUND_GREY,      // #F8FAFC
  bgSecondary: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceHover: '#F1F5F9',
  border: '#CBD5E1',
  borderLight: '#E2E8F0',
  softWarmBg: '#FAF9F6',
  softWarmBorder: '#ECEAE4',
  offGreenBg: '#FAF9F6',
  offGreenBorder: '#ECEAE4',

  // ── Typography Colors ───────────────────────────────────────────────────
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  textWhite: '#FFFFFF',

  // ── Slate Scale ─────────────────────────────────────────────────────────
  slate50: '#F8FAFC',
  slate100: '#F1F5F9',
  slate200: '#E2E8F0',
  slate300: '#CBD5E1',
  slate400: '#94A3B8',
  slate500: '#64748B',
  slate600: '#475569',
  slate700: '#334155',
  slate800: '#1E293B',
  slate900: '#0F172A',

  // ── Status Colors ───────────────────────────────────────────────────────
  success: '#059669',
  successBg: '#ECFDF5',
  warning: '#D97706',
  warningBg: '#FFFBEB',
  danger: '#DC2626',
  dangerBg: '#FEF2F2',
  info: '#0284C7',
  infoBg: '#F0F9FF',
};

export const RADIUS = {
  none: '0px',
  xs: '4px',
  sm: '6px',
  card: '8px',          // Universal Card Radius (8px) matching MobileApp standard
  cardMobile: '6px',    // Compact Mobile Card Radius (6px)
  md: '6px',            // Sub-elements / inner containers
  lg: '8px',            // Standard Cards & Modals
  xl: '12px',           // Large containers
  '2xl': '16px',
  full: '9999px',
};

export const FONT_SIZES = {
  // Headings
  h1: '20px',
  h2: '16px',
  h3: '14px',
  heroTitle: '15px',
  sectionTitle: '14px',
  cardTitle: '14px',

  // Body & Paragraphs
  body: '12px',
  bodySmall: '11.5px',
  subText: '11px',

  // Metadata & Captions
  caption: '10.5px',
  metadata: '10px',
  labelCaps: '9.5px',
  tag: '9px',

  // Badges & Buttons
  badge: '10.5px',
  pill: '9.5px',
  buttonSm: '11px',
  button: '12.5px',
  buttonMd: '13px',
  buttonLg: '14px',
};

export const FONT_WEIGHTS = {
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
  black: 900,
};

export const SPACING = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  xxl: '24px',
  section: '32px',
};

export const SHADOWS = {
  card: '0 1px 3px rgba(15, 23, 42, 0.04)',
  sm: '0 1px 2px rgba(15, 23, 42, 0.04)',
  md: '0 4px 6px -1px rgba(15, 23, 42, 0.06)',
  lg: '0 10px 15px -3px rgba(15, 23, 42, 0.08)',
};

export const THEME = {
  colors: COLORS,
  radius: RADIUS,
  fontSizes: FONT_SIZES,
  fontWeights: FONT_WEIGHTS,
  spacing: SPACING,
  shadows: SHADOWS,
  typography: {
    fontFamily: "'Inter', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
};

/**
 * Utility function to dynamically synchronize THEME tokens into document :root CSS variables.
 * Ensures that changes in theme.ts automatically update the entire Web App stylesheet ecosystem.
 */
export const applyThemeToCssVariables = () => {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;

  // Colors
  root.style.setProperty('--bg', THEME.colors.background);
  root.style.setProperty('--bg-offwhite', THEME.colors.offWhite);
  root.style.setProperty('--bg-secondary', THEME.colors.bgSecondary);
  root.style.setProperty('--primary', THEME.colors.primary);
  root.style.setProperty('--primary-light', THEME.colors.primaryLight);
  root.style.setProperty('--primary-dark', THEME.colors.primaryDark);
  root.style.setProperty('--surface', THEME.colors.surface);
  root.style.setProperty('--surface-hover', THEME.colors.surfaceHover);
  root.style.setProperty('--border', THEME.colors.border);
  root.style.setProperty('--border-light', THEME.colors.borderLight);
  root.style.setProperty('--text-primary', THEME.colors.textPrimary);
  root.style.setProperty('--text-secondary', THEME.colors.textSecondary);
  root.style.setProperty('--text-tertiary', THEME.colors.textMuted);

  // Universal Card Radius Tokens (Single Source of Truth)
  root.style.setProperty('--radius-card', THEME.radius.card);
  root.style.setProperty('--radius-card-mobile', THEME.radius.cardMobile);
  root.style.setProperty('--radius-sm', THEME.radius.sm);
  root.style.setProperty('--radius-md', THEME.radius.md);
  root.style.setProperty('--radius-lg', THEME.radius.lg);
  root.style.setProperty('--radius-full', THEME.radius.full);

  // Typography Tokens
  root.style.setProperty('--font-hero-title', THEME.fontSizes.heroTitle);
  root.style.setProperty('--font-section-title', THEME.fontSizes.sectionTitle);
  root.style.setProperty('--font-card-title', THEME.fontSizes.cardTitle);
  root.style.setProperty('--font-body', THEME.fontSizes.body);
  root.style.setProperty('--font-body-small', THEME.fontSizes.bodySmall);
  root.style.setProperty('--font-caption', THEME.fontSizes.caption);
  root.style.setProperty('--font-metadata', THEME.fontSizes.metadata);
  root.style.setProperty('--font-label-caps', THEME.fontSizes.labelCaps);
  root.style.setProperty('--font-badge', THEME.fontSizes.badge);
  root.style.setProperty('--font-pill', THEME.fontSizes.pill);
  root.style.setProperty('--font-button', THEME.fontSizes.button);

  // Shadow
  root.style.setProperty('--shadow-card', THEME.shadows.card);

  // Apply default page body background color
  document.body.style.backgroundColor = THEME.colors.offWhite;
};

export default THEME;
