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

const getInitialState = (): StoreState => {
  const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if ((parsed.categories && parsed.categories.some((c: any) => c.name === 'IT & Software')) || (parsed.jobs && parsed.jobs.length < 70)) {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      } else {
        if (!parsed.language) parsed.language = 'en';
        if (!parsed.qualifications) parsed.qualifications = initialQualifications;
        return parsed;
      }
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
