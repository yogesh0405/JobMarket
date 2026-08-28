// ─────────────────────────────────────────────────────────────────────────────
// Universal Web Application Design System — Single Source of Truth Theme
// ─────────────────────────────────────────────────────────────────────────────
// Changing tokens in this file updates the entire Web Application UI.
// Off-White background `#F7F7F7` matches MobileApp theme standard.
// ─────────────────────────────────────────────────────────────────────────────

const PRIMARY_COLOR = '#1B4FDF';
const OFF_WHITE_BG = '#F7F7F7';

export const THEME = {
  colors: {
    // Page & Section Off-White Background (Matches Mobile App #F7F7F7)
    offWhite: OFF_WHITE_BG,
    background: OFF_WHITE_BG,
    bgSecondary: '#FFFFFF',

    // Primary Brand Colors (Single Source Active Blue)
    primary: PRIMARY_COLOR,
    primaryLight: '#EFF6FF',
    primaryDark: '#153BB0',
    primaryBorder: '#BFDBFE',

    // Neutral Surfaces & Borders
    surface: '#FFFFFF',
    surfaceHover: '#F1F5F9',
    border: '#CBD5E1',
    borderLight: '#E2E8F0',
    softWarmBg: '#FAF9F6',
    softWarmBorder: '#ECEAE4',
    offGreenBg: '#FAF9F6',
    offGreenBorder: '#ECEAE4',

    // Typography Neutral Scale
    textPrimary: '#0F172A',
    textSecondary: '#475569',
    textMuted: '#94A3B8',
    textWhite: '#FFFFFF',

    // Slate Scale
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

    // Status Colors
    success: '#059669',
    successBg: '#ECFDF5',
    warning: '#D97706',
    warningBg: '#FFFBEB',
    danger: '#DC2626',
    dangerBg: '#FEF2F2',
    info: '#0284C7',
    infoBg: '#F0F9FF',
  },

  typography: {
    fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },

  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    xxl: '24px',
    section: '32px',
  },

  radius: {
    sm: '4px',
    md: '6px',
    lg: '8px',
    full: '9999px',
  },

  shadows: {
    sm: '0 1px 2px rgba(15, 23, 42, 0.05)',
    md: '0 4px 6px -1px rgba(15, 23, 42, 0.07)',
    lg: '0 10px 15px -3px rgba(15, 23, 42, 0.08)',
  }
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
  root.style.setProperty('--primary-50', THEME.colors.primaryLight);
  root.style.setProperty('--surface', THEME.colors.surface);
  root.style.setProperty('--surface-hover', THEME.colors.surfaceHover);
  root.style.setProperty('--border', THEME.colors.border);
  root.style.setProperty('--border-light', THEME.colors.borderLight);
  root.style.setProperty('--text-primary', THEME.colors.textPrimary);
  root.style.setProperty('--text-secondary', THEME.colors.textSecondary);
  root.style.setProperty('--text-tertiary', THEME.colors.textMuted);

  // Apply default page body background color
  document.body.style.backgroundColor = THEME.colors.offWhite;
};

export default THEME;
