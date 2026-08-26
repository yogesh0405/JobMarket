import * as SecureStore from 'expo-secure-store';
import { Job } from '../types';
import { candidateApi } from '../api/candidateApi';

type Listener = () => void;

const SAVED_JOBS_STORAGE_KEY = 'csn_candidate_saved_jobs_v2';

const isWebLocalStorageAvailable = (): boolean => {
  try {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  } catch {
    return false;
  }
};

const normalizeId = (id?: any): string => {
  if (!id) return '';
  return String(id).trim().toLowerCase();
};

class SavedJobsStore {
  private savedJobs: Job[] = [];
  private savedIds: Set<string> = new Set();
  private listeners: Set<Listener> = new Set();
  private isInitialized: boolean = false;

  constructor() {
    this.initFromStorage();
  }

  private async initFromStorage() {
    if (this.isInitialized) return;
    try {
      let raw: string | null = null;
      const isAvailable = await SecureStore.isAvailableAsync().catch(() => false);
      if (isAvailable) {
        raw = await SecureStore.getItemAsync(SAVED_JOBS_STORAGE_KEY);
      } else if (isWebLocalStorageAvailable()) {
        raw = window.localStorage.getItem(SAVED_JOBS_STORAGE_KEY);
      }

      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.setSavedJobs(parsed, false);
        }
      }
    } catch (e) {
      console.warn('SavedJobsStore init from storage error:', e);
    } finally {
      this.isInitialized = true;
    }
  }

  private async persistToStorage() {
    try {
      const dataStr = JSON.stringify(this.savedJobs);
      const isAvailable = await SecureStore.isAvailableAsync().catch(() => false);
      if (isAvailable) {
        await SecureStore.setItemAsync(SAVED_JOBS_STORAGE_KEY, dataStr);
      } else if (isWebLocalStorageAvailable()) {
        window.localStorage.setItem(SAVED_JOBS_STORAGE_KEY, dataStr);
      }
    } catch (e) {
      console.warn('SavedJobsStore persist error:', e);
    }
  }

  public isSaved(jobId?: any): boolean {
    const id = normalizeId(jobId);
    if (!id) return false;
    return this.savedIds.has(id) || this.savedIds.has(id.replace(/^j/, ''));
  }

  public getSavedJobs(): Job[] {
    return [...this.savedJobs];
  }

  public getSavedIds(): string[] {
    return Array.from(this.savedIds);
  }

  public setSavedJobs(jobs: Job[], shouldPersist: boolean = true) {
    if (!Array.isArray(jobs)) return;

    this.savedJobs = jobs.filter((j) => j && j.id);
    this.savedIds = new Set(
      this.savedJobs.map((j) => normalizeId(j.id)).filter(Boolean)
    );

    if (shouldPersist) {
      this.persistToStorage();
    }
    this.notify();
  }

  public async toggleSave(jobOrId: Job | string): Promise<boolean> {
    const jobId = typeof jobOrId === 'string' ? jobOrId : jobOrId?.id;
    const normId = normalizeId(jobId);
    if (!normId) return false;

    const currentlySaved = this.isSaved(normId);
    const nextSavedState = !currentlySaved;

    if (nextSavedState) {
      // Add to saved
      this.savedIds.add(normId);
      if (typeof jobOrId === 'object' && jobOrId.id) {
        if (!this.savedJobs.some((j) => normalizeId(j.id) === normId)) {
          this.savedJobs = [jobOrId, ...this.savedJobs];
        }
      } else {
        // Find existing or mock object placeholder
        if (!this.savedJobs.some((j) => normalizeId(j.id) === normId)) {
          this.savedJobs = [{ id: jobId } as Job, ...this.savedJobs];
        }
      }
    } else {
      // Remove from saved
      this.savedIds.delete(normId);
      this.savedIds.delete(normId.replace(/^j/, ''));
      this.savedJobs = this.savedJobs.filter((j) => normalizeId(j.id) !== normId);
    }

    this.persistToStorage();
    this.notify();

    // Fire network API call in background
    try {
      await candidateApi.toggleSaveJob(jobId);
    } catch (err) {
      console.warn('Network toggle save error:', err);
    }

    return nextSavedState;
  }

  public async syncFromApi(): Promise<Job[]> {
    try {
      const res = await candidateApi.getSavedJobs();
      let jobsList: Job[] = [];
      if (Array.isArray(res)) {
        jobsList = res;
      } else if (res && Array.isArray(res.data)) {
        jobsList = res.data;
      } else if (res && res.success && Array.isArray((res as any).jobs)) {
        jobsList = (res as any).jobs;
      }

      if (Array.isArray(jobsList)) {
        this.setSavedJobs(jobsList);
        return jobsList;
      }
    } catch (e) {
      console.warn('Failed to sync saved jobs from API:', e);
    }
    return this.savedJobs;
  }

  public clear() {
    this.savedJobs = [];
    this.savedIds.clear();
    this.persistToStorage();
    this.notify();
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (e) {
        console.error('SavedJobsStore listener error:', e);
      }
    });
  }
}

export const savedJobsStore = new SavedJobsStore();
