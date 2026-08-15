import { COLORS } from '../../../constants/theme';

export const CATEGORIES = [
  'All Jobs',
  'HR Jobs',
  'Marketing Jobs',
  'ITI & Trade Jobs',
  'Engineering',
  'Hospitality',
  'Healthcare',
  'Education',
];

export const getInitialsColors = (title: string): [string, string] => {
  const palette: Array<[string, string]> = [
    ['#0284C7', '#0369A1'],
    ['#9A3412', '#7C2D12'],
    ['#854D0E', '#713F12'],
    ['#B91C1C', '#991B1B'],
    ['#A16207', '#854D0E'],
    ['#BE185D', '#9D174D'],
    ['#C2410C', '#9A3412'],
    ['#9D174D', '#831843'],
    [COLORS.primary, COLORS.primary],
  ];
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = title.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % palette.length;
  return palette[index];
};

export const getJobInitials = (title: string) => {
  if (!title) return 'JM';
  const clean = title.replace(/[^a-zA-Z0-9\s]/g, '').trim();
  const words = clean.split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return clean.slice(0, 2).toUpperCase();
};

export const formatTimeAgo = (dateInput?: string | number | Date | null): string => {
  if (!dateInput) return 'Recently';

  let date: Date;
  if (dateInput instanceof Date) {
    date = dateInput;
  } else if (typeof dateInput === 'number') {
    date = new Date(dateInput);
  } else {
    const str = String(dateInput).trim();
    if (/^\d+[mhdws]\s+ago$/i.test(str) || str.toLowerCase() === 'just now') {
      return str;
    }
    date = new Date(str);
  }

  if (isNaN(date.getTime())) {
    return 'Recently';
  }

  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks}w ago`;
  }

  return `${Math.floor(diffInDays / 30)}m ago`;
};
