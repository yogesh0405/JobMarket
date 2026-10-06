export const TRADES = [
  'VMC Operator',
  'CNC Machinist',
  'Fitter',
  'Electrician',
  'Quality Inspector',
  'Welder',
  'Tool & Die Maker',
  'Assembly Operator',
  'Turner',
  'Maintenance Technician',
  'Other',
];

export const SHIFTS = ['Day Shift', 'Night Shift', 'Rotational Shift'];

export const STEPS = [
  { id: 1, title: 'Basic Details' },
  { id: 2, title: 'Education' },
  { id: 3, title: 'Experience' },
  { id: 4, title: 'Skills & Resume' },
];

const CURRENT_YEAR = new Date().getFullYear();
export const PASSING_YEARS = Array.from(
  { length: CURRENT_YEAR + 4 - 1970 + 1 },
  (_, i) => String(CURRENT_YEAR + 4 - i)
);

export const QUICK_YEARS = [
  String(CURRENT_YEAR),
  String(CURRENT_YEAR - 1),
  String(CURRENT_YEAR - 2),
  String(CURRENT_YEAR - 3),
  String(CURRENT_YEAR - 4),
  String(CURRENT_YEAR - 5),
  String(CURRENT_YEAR - 6),
  String(CURRENT_YEAR - 7),
];

export const AVAILABILITY_OPTIONS = [
  { label: 'Immediate (0 Days / Available Now)', days: 0 },
  { label: 'Within 7 Days (1 Week)', days: 7 },
  { label: 'Within 15 Days (2 Weeks)', days: 15 },
  { label: 'Within 30 Days (1 Month)', days: 30 },
  { label: 'Within 45 Days', days: 45 },
  { label: 'Within 60 Days (2 Months)', days: 60 },
  { label: 'Within 90 Days (3 Months)', days: 90 },
  { label: 'Custom Days...', days: -1 },
];
