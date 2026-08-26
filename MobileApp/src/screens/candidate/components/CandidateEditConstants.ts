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
