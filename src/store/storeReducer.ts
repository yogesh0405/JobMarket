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
    case 'SET_JOBS':
      return {
        ...state,
        jobs: action.payload
      };

    case 'SET_LANGUAGE':
      return {
        ...state,
        language: action.payload
      };

    case 'LOGIN': {
      const incomingUser = action.payload;
      const existingUser = state.currentUser?.id === incomingUser.id ? state.currentUser : state.users.find(u => u.id === incomingUser.id);

      const mergedSavedJobs = (incomingUser.savedJobs && incomingUser.savedJobs.length > 0)
        ? incomingUser.savedJobs
        : (existingUser?.savedJobs || []);

      const userWithSavedJobs = {
        ...incomingUser,
        savedJobs: mergedSavedJobs
      };

      return {
        ...state,
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

      const updatedUser = {
        ...state.currentUser,
        appliedJobs: [...(state.currentUser.appliedJobs || []), jobId]
      };

      const updatedJobs = state.jobs.map(j => {
        if (j.id === jobId) {
          return {
            ...j,
            applicants: [...(j.applicants || []), applicant]
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
      if (!state.currentUser) return state;

      const updatedUser = {
        ...state.currentUser,
        ...action.payload
      };

      const updatedUsers = state.users.map(u => u.id === state.currentUser?.id ? updatedUser : u);

      return {
        ...state,
        users: updatedUsers,
        currentUser: updatedUser
      };
    }

    default:
      return state;
  }
};
