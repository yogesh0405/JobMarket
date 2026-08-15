// ─────────────────────────────────────────────────────────────────────────────
// Universal Design System — Single Source of Truth
// ─────────────────────────────────────────────────────────────────────────────
// Every screen and component in the MobileApp MUST import tokens from this
// file instead of hardcoding hex values, font sizes, or radii.
//
// Usage:
//   import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS, FONTS } from '../../constants/theme';
// ─────────────────────────────────────────────────────────────────────────────

const PRIMARY_COLOR = '#1B4FDF';

export const COLORS = {
  // ── Brand / Primary (Single Source of Truth) ──────────────────────────────
  primary: PRIMARY_COLOR,           // Executive Primary Color — active state, buttons, links, headers
  primaryDark: PRIMARY_COLOR,       // Primary Color
  primaryLight: '#EFF6FF',          // Blue 50  — light tint backgrounds
  primaryBorder: '#BFDBFE',         // Blue 200 — bordered chips & outlines

  // ── Employer & Section Primary (Single Source of Truth) ──────────────────
  employerPrimary: PRIMARY_COLOR,                             // Single Source Primary Color
  employerPrimaryLight: PRIMARY_COLOR,                        // Single Source Primary Color
  employerGradient: [PRIMARY_COLOR, PRIMARY_COLOR, PRIMARY_COLOR] as [string, string, string], // Single Source Header Gradient

  // ── Button Specific Primary ─────────────────────────────────────────────
  buttonPrimary: PRIMARY_COLOR,                             // Single Source Primary Color
  buttonGradient: [PRIMARY_COLOR, PRIMARY_COLOR, PRIMARY_COLOR] as [string, string, string], // Single Source Button Gradient

  // ── Slate Scale (Neutrals) ──────────────────────────────────────────────
  slate900: '#0F172A',          // Headings, primary text
  slate800: '#1E293B',          // Sub-headings
  slate700: '#334155',          // Body text (strong)
  slate600: '#475569',          // Body text (default), secondary labels
  slate500: '#64748B',          // Muted labels, placeholders
  slate400: '#94A3B8',          // Disabled / hint text
  slate300: '#CBD5E1',          // Borders (strong), dividers (strong)
  slate200: '#E2E8F0',          // Borders (default), dividers (default)
  slate100: '#F1F5F9',          // Subtle backgrounds, skeleton base
  slate50: '#F8FAFC',           // Page background, input fills

  // ── Status Colors ───────────────────────────────────────────────────────
  success: '#059669',           // Emerald 600
  successBg: '#ECFDF5',         // Emerald 50
  warning: '#D97706',           // Amber 600
  warningBg: '#FFFBEB',         // Amber 50
  danger: '#DC2626',            // Red 600
  dangerBg: '#FEF2F2',          // Red 50
  info: '#0284C7',              // Sky 600
  infoBg: '#F0F9FF',            // Sky 50

  // ── Surfaces & Borders ──────────────────────────────────────────────────
  background: '#F7F7F7',        // Premium Whitish Off-White Page Background (#F7F7F7)
  offWhite: '#F7F7F7',          // Premium Whitish Off-White Page Background (#F7F7F7)
  surface: '#FFFFFF',           // Solid White Container Surface
  border: '#E2E8F0',
  borderFocus: PRIMARY_COLOR,

  // ── Text Colors ─────────────────────────────────────────────────────────
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  textWhite: '#FFFFFF',
};

export const FONTS = {
  regular: 'System',
  medium: 'System',
  semibold: 'System',
  bold: 'System',
  extraBold: 'System',
  black: 'System',
  heavy: 'System',
};

export const TYPOGRAPHY = {
  h1: {
    fontSize: 24,
    fontWeight: '700' as const,
    lineHeight: 32,
    color: COLORS.textPrimary,
  },
  h2: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500' as const,
    lineHeight: 24,
    color: COLORS.textSecondary,
  },
  body: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
    color: COLORS.textPrimary,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
    color: COLORS.textMuted,
  },
  button: {
    fontSize: 15,
    fontWeight: '600' as const,
    lineHeight: 20,
  },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const RADIUS = {
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

export const SHADOWS = {
  sm: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 8,
  },
};

export default { COLORS, FONTS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS };
