import { StoreState } from './StoreContext';
import { User, Job } from '../types';

export type StoreAction =
  | { type: 'LOGIN'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'SIGNUP'; payload: User }
  | { type: 'CREATE_JOB'; payload: Job }
  | { type: 'UPDATE_JOB'; payload: Job }
  | { type: 'DELETE_JOB'; payload: string }
  | { type: 'APPLY_JOB'; payload: { jobId: string; applicant: any } }
  | { type: 'TOGGLE_SAVE_JOB'; payload: { jobId: string } }
  | { type: 'UPDATE_USER'; payload: Partial<User> }
  | { type: 'SET_LANGUAGE'; payload: 'en' | 'mr' | 'hi' }
  | { type: 'SET_JOBS'; payload: Job[] };

export const storeReducer = (state: StoreState, action: StoreAction): StoreState => {
  switch (action.type) {
    case 'SET_JOBS': {
      const incoming = action.payload || [];
      const jobsMap = new Map(state.jobs.map(j => [j.id, j]));
      incoming.forEach(j => {
        if (j && j.id) {
          const prev = jobsMap.get(j.id);
          jobsMap.set(j.id, prev ? { ...prev, ...j } : j);
        }
      });
      return {
        ...state,
        jobs: Array.from(jobsMap.values())
      };
    }

    case 'SET_LANGUAGE':
      return {
        ...state,
        language: action.payload
      };

    case 'LOGIN': {
      const incomingUser = action.payload;
      const existingUser = state.currentUser?.id === incomingUser.id ? state.currentUser : state.users.find(u => u.id === incomingUser.id);

      const mergedSavedJobs = Array.isArray(incomingUser.savedJobs)
        ? incomingUser.savedJobs
        : (existingUser?.savedJobs || []);

      const userWithSavedJobs = {
        ...incomingUser,
        savedJobs: mergedSavedJobs
      };

      const updatedUsers = state.users.map(u => u.id === userWithSavedJobs.id ? userWithSavedJobs : u);
      if (!state.users.some(u => u.id === userWithSavedJobs.id)) {
        updatedUsers.push(userWithSavedJobs);
      }

      const updatedJobs = state.jobs.map(j => {
        if (!j.applicants || j.applicants.length === 0) return j;
        const updatedApplicants = j.applicants.map(app => {
          if (app.userId === userWithSavedJobs.id || app.id === userWithSavedJobs.id) {
            return {
              ...app,
              resume: userWithSavedJobs.resume || null,
              name: userWithSavedJobs.name || app.name,
              email: userWithSavedJobs.email || app.email,
              phone: userWithSavedJobs.phone || app.phone
            };
          }
          return app;
        });
        return { ...j, applicants: updatedApplicants };
      });

      return {
        ...state,
        users: updatedUsers,
        jobs: updatedJobs,
        currentUser: userWithSavedJobs
      };
    }

    case 'LOGOUT':
      return {
        ...state,
        currentUser: null
      };

    case 'SIGNUP':
      return {
        ...state,
        users: [...state.users, action.payload],
        currentUser: action.payload
      };

    case 'CREATE_JOB':
      return {
        ...state,
        jobs: [action.payload, ...state.jobs]
      };

    case 'UPDATE_JOB':
      return {
        ...state,
        jobs: state.jobs.map(j => j.id === action.payload.id ? action.payload : j)
      };

    case 'DELETE_JOB':
      return {
        ...state,
        jobs: state.jobs.filter(j => j.id !== action.payload)
      };

    case 'APPLY_JOB': {
      const { jobId, applicant } = action.payload;
      if (!state.currentUser) return state;

      const appliedJobs = state.currentUser.appliedJobs || [];
      const updatedAppliedJobs = appliedJobs.includes(jobId) ? appliedJobs : [...appliedJobs, jobId];

      const appliedWithStatus = state.currentUser.appliedJobsWithStatus || [];
      const updatedAppliedWithStatus = appliedWithStatus.some((a: any) => a.jobId === jobId)
        ? appliedWithStatus
        : [...appliedWithStatus, { jobId, status: 'applied', appliedAt: applicant.appliedAt || new Date().toISOString() }];

      const updatedUser = {
        ...state.currentUser,
        appliedJobs: updatedAppliedJobs,
        appliedJobsWithStatus: updatedAppliedWithStatus
      };

      const updatedJobs = state.jobs.map(j => {
        if (j.id === jobId) {
          const existingApps = j.applicants || [];
          const hasApp = existingApps.some(app => app.userId === applicant.userId || app.id === applicant.userId);
          const updatedApplicants = hasApp ? existingApps : [...existingApps, applicant];
          return {
            ...j,
            applicants: updatedApplicants
          };
        }
        return j;
      });

      const updatedUsers = state.users.map(u => u.id === state.currentUser?.id ? updatedUser : u);

      return {
        ...state,
        jobs: updatedJobs,
        users: updatedUsers,
        currentUser: updatedUser
      };
    }

    case 'TOGGLE_SAVE_JOB': {
      const { jobId } = action.payload;
      if (!state.currentUser) return state;

      const savedJobs = state.currentUser.savedJobs || [];
      const isSaved = savedJobs.includes(jobId);
      const newSavedJobs = isSaved
        ? savedJobs.filter(id => id !== jobId)
        : [...savedJobs, jobId];

      const updatedUser = {
        ...state.currentUser,
        savedJobs: newSavedJobs
      };

      const updatedUsers = state.users.map(u => u.id === state.currentUser?.id ? updatedUser : u);

      return {
        ...state,
        users: updatedUsers,
        currentUser: updatedUser
      };
    }

    case 'UPDATE_USER': {
      const targetUserId = action.payload.id || state.currentUser?.id;
      if (!targetUserId) return state;

      const baseUser = state.currentUser?.id === targetUserId ? state.currentUser : state.users.find(u => u.id === targetUserId);
      const updatedUser = {
        ...(baseUser || {}),
        ...action.payload
      } as User;

      const updatedUsers = state.users.map(u => u.id === targetUserId ? updatedUser : u);
      if (!state.users.some(u => u.id === targetUserId)) {
        updatedUsers.push(updatedUser);
      }

      const updatedJobs = state.jobs.map(j => {
        if (!j.applicants || j.applicants.length === 0) return j;
        const updatedApplicants = j.applicants.map(app => {
          if (app.userId === targetUserId || app.id === targetUserId) {
            return {
              ...app,
              resume: updatedUser.resume || null,
              name: updatedUser.name || app.name,
              email: updatedUser.email || app.email,
              phone: updatedUser.phone || app.phone
            };
          }
          return app;
        });
        return { ...j, applicants: updatedApplicants };
      });

      return {
        ...state,
        users: updatedUsers,
        jobs: updatedJobs,
        currentUser: state.currentUser?.id === targetUserId ? updatedUser : state.currentUser
      };
    }

    default:
      return state;
  }
};
