import React, { createContext, useReducer, useEffect, ReactNode } from 'react';
import { User, Job, Company, Category } from '../types';
import { storeReducer, StoreAction } from './storeReducer';
import { initialUsers, initialJobs, initialCompanies, initialCategories, initialQualifications } from './seedData';

export interface StoreState {
  users: User[];
  jobs: Job[];
  companies: Company[];
  categories: Category[];
  qualifications: Category[];
  currentUser: User | null;
  language: 'en' | 'mr' | 'hi';
}

const LOCAL_STORAGE_KEY = 'jobMarketplace_react';

const ensureArray = (val: any): any[] => {
  if (Array.isArray(val)) return val;
  if (typeof val === 'string' && val.trim()) {
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) return parsed;
    } catch (_) {
      return val.split(',').map((s: string) => s.trim()).filter(Boolean);
    }
  }
  return [];
};

const getInitialState = (): StoreState => {
  const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (!parsed.language) parsed.language = 'en';
      if (!parsed.qualifications) parsed.qualifications = initialQualifications;
      
      const storedJobs = Array.isArray(parsed.jobs) ? parsed.jobs.filter(Boolean) : [];
      // Filter out leftover mock seed jobs (j1..j80)
      parsed.jobs = storedJobs.filter((j: any) => j && j.id && !(typeof j.id === 'string' && /^j\d+$/.test(j.id)));

      if (parsed.currentUser) {
        parsed.currentUser.skills = ensureArray(parsed.currentUser.skills);
        parsed.currentUser.experience = ensureArray(parsed.currentUser.experience);
        parsed.currentUser.education = ensureArray(parsed.currentUser.education);
        parsed.currentUser.savedJobs = ensureArray(parsed.currentUser.savedJobs);
        parsed.currentUser.appliedJobs = ensureArray(parsed.currentUser.appliedJobs);
        parsed.currentUser.appliedJobsWithStatus = ensureArray(parsed.currentUser.appliedJobsWithStatus);
        if (typeof parsed.currentUser.profilePictureUrl === 'object' && parsed.currentUser.profilePictureUrl !== null) {
          parsed.currentUser.profilePictureUrl = parsed.currentUser.profilePictureUrl.url || parsed.currentUser.profilePictureUrl.secure_url || '';
        }
        if (typeof parsed.currentUser.resume === 'string' && parsed.currentUser.resume.trim()) {
          try {
            parsed.currentUser.resume = JSON.parse(parsed.currentUser.resume);
          } catch (_) {
            parsed.currentUser.resume = { url: parsed.currentUser.resume, name: 'Resume_Document.pdf' };
          }
        }
      }

      return parsed;
    } catch (e) {
      console.error('Failed to parse localStorage data', e);
    }
  }
  return {
    users: initialUsers,
    jobs: initialJobs,
    companies: initialCompanies,
    categories: initialCategories,
    qualifications: initialQualifications,
    currentUser: null,
    language: 'en'
  };
};

export const StoreContext = createContext<{
  state: StoreState;
  dispatch: React.Dispatch<StoreAction>;
} | undefined>(undefined);

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(storeReducer, null, getInitialState);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  return (
    <StoreContext.Provider value={{ state, dispatch }}>
      {children}
    </StoreContext.Provider>
  );
};
