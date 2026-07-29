import React from 'react';

/**
 * Professional SVG Category Icon Component
 * Maps category icon name strings to clean, professional Lucide-style SVG icons.
 * Replaces all emoji usage throughout the app with consistent vector icons.
 */

interface CategoryIconProps {
  /** Icon identifier string (e.g. 'wrench', 'zap', 'monitor') */
  name: string;
  /** Icon size in px (default 18) */
  size?: number;
  /** Stroke color (default 'currentColor') */
  color?: string;
  /** Stroke width (default 2) */
  strokeWidth?: number;
  /** Additional className */
  className?: string;
}

// Master icon path registry — clean, minimal line-art paths
const ICON_PATHS: Record<string, string> = {
  // Industrial / Manufacturing
  wrench:       'M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z',
  zap:          'M13 2 3 14h9l-1 8 10-12h-9l1-8z',
  monitor:      'M2 3h20v14H2zM8 21h8M12 17v4',
  plug:         'M12 2v6M8 2v6M16 2v6M8 8h8v4a4 4 0 0 1-8 0V8zM12 12v10',
  settings:     'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z',
  box:          'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16zM3.27 6.96 12 12.01l8.73-5.05M12 22.08V12',
  search:       'M11 17.25a6.25 6.25 0 1 1 0-12.5 6.25 6.25 0 0 1 0 12.5zM16 16l4.5 4.5',
  'graduation-cap': 'M22 10 12 5 2 10l10 5 10-5zM6 12v5c0 1.66 2.69 3 6 3s6-1.34 6-3v-5',
  truck:        'M1 3h15v13H1zM16 8h4l3 3v5h-7V8zM5.5 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM18.5 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
  shield:       'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  'folder-open': 'M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z',
  microscope:   'M6 18h8M3 22h18M14 2v4a2 2 0 0 0 2 2h2M14 2H8a2 2 0 0 0-2 2v8l8 4V4a2 2 0 0 0-2-2z',
  hammer:       'M15 12 8.5 18.5a2.1 2.1 0 0 1-3 0 2.1 2.1 0 0 1 0-3L12 9M17.64 15 22 10.64M20.91 11.7l-1.25-1.25c-.6-.6-.93-1.4-.93-2.25V6.5a.5.5 0 0 0-.5-.5H16.5c-.85 0-1.65-.33-2.25-.93l-1.25-1.25',

  // Healthcare
  'heart-pulse': 'M19.5 12.57l-7.5 7.43-7.5-7.43A5 5 0 0 1 8 3.5a5 5 0 0 1 4 2 5 5 0 0 1 4-2 5 5 0 0 1 3.5 9.07zM3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27',
  stethoscope:  'M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4M22 10a2 2 0 1 0-4 0 2 2 0 0 0 4 0z',
  user:         'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  phone:        'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z',
  
  // Hospitality
  'chef-hat':   'M6 13.87A4 4 0 0 1 7.41 6.6a5.11 5.11 0 0 1 9.18 0A4 4 0 0 1 18 13.87V20H6v-6.13zM6 20h12',
  'utensils':   'M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2M7 2v20M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7',
  sparkles:     'M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3zM5 18l.75 2.25L8 21l-2.25.75L5 24l-.75-2.25L2 21l2.25-.75L5 18z',
  'bell-ring':  'M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.94 1.94 0 0 0 3.4 0M4 2C2.8 3.7 2 5.7 2 8M22 8c0-2.3-.8-4.3-2-6',

  // Education
  'book-open':  'M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z',
  'school':     'M22 10v6M2 10l10-5 10 5-10 5zM6 12v5c3 3 9 3 12 0v-5',
  'book-text':  'M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15zM8 7h8M8 11h6',

  // Business / Office
  briefcase:    'M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zM16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16',
  'bar-chart':  'M18 20V10M12 20V4M6 20v-6',
  'file-text':  'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8',
  laptop:       'M20 16V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12M2 20h20M12 16v4',
  'trending-up':'M22 7l-8.5 8.5-5-5L2 17',
  scroll:       'M8 21h12a2 2 0 0 0 2-2v-2H10v2a2 2 0 1 1-4 0V5a2 2 0 0 1 2-2h14v14',

  // Map / Navigation
  map:          'M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4z',
  'map-pin':    'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z M12 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
  list:         'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',

  // Fallback
  circle:       'M12 22C6.5 22 2 17.5 2 12S6.5 2 12 2s10 4.5 10 10-4.5 10-10 10z',
};

/** Map of category names → icon keys for automatic resolution */
const CATEGORY_ICON_MAP: Record<string, string> = {
  // Trade categories
  'Fitter':               'wrench',
  'Welder':               'zap',
  'CNC Operator':         'monitor',
  'Electrician':          'plug',
  'Machinist':            'settings',
  'Helper / Loader':      'box',
  'Quality Inspector':    'search',
  'Apprentice':           'graduation-cap',
  'Driver / Forklift':    'truck',
  'Security Guard':       'shield',
  'Store Keeper':         'folder-open',
  'Technician':           'microscope',
  'Hospital Jobs':        'heart-pulse',
  'Hotel Jobs':           'utensils',
  'School & College':     'school',
  'Office / Clerk':       'briefcase',

  // Qualifications
  '12th Pass Jobs':       'graduation-cap',
  'B.Com Jobs':           'bar-chart',
  'BA Jobs':              'file-text',
  'B.E./B.Tech Jobs':     'settings',
  'Diploma Jobs':         'scroll',
  'BCA Jobs':             'laptop',
  'BBA Jobs':             'trending-up',
  'B.Sc Jobs':            'microscope',
  '10th Pass Jobs':       'school',
  'MBA Jobs':             'briefcase',
  'Vocational Course Jobs': 'hammer',
  'MCA Jobs':             'monitor',

  // Hospital sub-categories
  'Staff Nurse':          'heart-pulse',
  'Ward Boy / Assistant': 'user',
  'Lab Assistant':        'microscope',
  'Hospital Receptionist': 'phone',

  // Hotel sub-categories
  'Commi 1 Chef / Cook':  'chef-hat',
  'Hotel Waiter':         'utensils',
  'Housekeeping Associate': 'sparkles',
  'Front Desk Executive':  'bell-ring',

  // School sub-categories
  'Primary Teacher':      'book-open',
  'High School Teacher':  'book-open',
  'Librarian Assistant':  'book-text',
  'Peon / Office Boy':    'box',
};

/**
 * Resolves icon key from category name or icon string
 */
function resolveIconKey(name: string): string {
  // Direct key match
  if (ICON_PATHS[name]) return name;
  // Category name match
  if (CATEGORY_ICON_MAP[name]) return CATEGORY_ICON_MAP[name];
  // Fallback
  return 'circle';
}

/**
 * Professional SVG Category Icon
 * Renders a crisp, consistent vector icon for any category/qualification name.
 */
export const CategoryIcon: React.FC<CategoryIconProps> = ({
  name,
  size = 18,
  color = 'currentColor',
  strokeWidth = 2,
  className
}) => {
  const key = resolveIconKey(name);
  const pathData = ICON_PATHS[key] || ICON_PATHS.circle;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={{ flexShrink: 0 }}
    >
      <path d={pathData} />
    </svg>
  );
};

/**
 * Get an icon key string for a given category name.
 * Use this to store icon keys in seed data instead of emojis.
 */
export function getCategoryIconKey(categoryName: string): string {
  return CATEGORY_ICON_MAP[categoryName] || 'circle';
}

export default CategoryIcon;
