export interface RoleTabSetting {
  id: string;
  label: string;
  enabled: boolean;
  priority: number;
}

export const DEFAULT_ROLE_TAB_SETTINGS: RoleTabSetting[] = [
  { id: 'all', label: 'All Opportunities', enabled: true, priority: 1 },
  { id: 'Welder', label: 'Welder', enabled: true, priority: 2 },
  { id: 'CNC Operator', label: 'CNC Operator', enabled: true, priority: 3 },
  { id: 'Fitter', label: 'Fitter', enabled: true, priority: 4 },
  { id: 'Electrician', label: 'Electrician', enabled: true, priority: 5 },
  { id: 'Machinist', label: 'Machinist', enabled: true, priority: 6 },
  { id: 'Quality Inspector', label: 'Quality Inspector', enabled: true, priority: 7 },
  { id: 'Helper', label: 'Helper & Assistant', enabled: true, priority: 8 },
  { id: 'Hospital Jobs', label: 'Hospital & Healthcare', enabled: true, priority: 9 },
  { id: 'Hotel Jobs', label: 'Hotel & Hospitality', enabled: true, priority: 10 },
  { id: 'School & College', label: 'School & Education', enabled: true, priority: 11 },
  { id: 'Office / Clerk', label: 'Office & Clerical', enabled: true, priority: 12 }
];

export const STORAGE_KEY = 'jobmarket_role_tab_settings';

export const getStoredRoleTabSettings = (): RoleTabSetting[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading role tab settings:', err);
  }
  return DEFAULT_ROLE_TAB_SETTINGS;
};
