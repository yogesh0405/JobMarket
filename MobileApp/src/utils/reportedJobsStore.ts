import * as SecureStore from 'expo-secure-store';

export interface ReportedJobMetadata {
  jobId: string;
  title?: string;
  company?: string;
  reasonCategory?: string;
  reportedAt: string;
}

type Listener = () => void;

const REPORTED_JOBS_STORAGE_KEY = 'csn_candidate_reported_jobs_v1';

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

class ReportedJobsStore {
  private reportedMap: Map<string, ReportedJobMetadata> = new Map();
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
        raw = await SecureStore.getItemAsync(REPORTED_JOBS_STORAGE_KEY);
      } else if (isWebLocalStorageAvailable()) {
        raw = window.localStorage.getItem(REPORTED_JOBS_STORAGE_KEY);
      }

      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          parsed.forEach((item: ReportedJobMetadata) => {
            if (item && item.jobId) {
              this.reportedMap.set(normalizeId(item.jobId), item);
            }
          });
        }
      }
    } catch (e) {
      console.warn('ReportedJobsStore init error:', e);
    } finally {
      this.isInitialized = true;
      this.notifyListeners();
    }
  }

  private async persistToStorage() {
    try {
      const dataArr = Array.from(this.reportedMap.values());
      const dataStr = JSON.stringify(dataArr);
      const isAvailable = await SecureStore.isAvailableAsync().catch(() => false);
      if (isAvailable) {
        await SecureStore.setItemAsync(REPORTED_JOBS_STORAGE_KEY, dataStr);
      } else if (isWebLocalStorageAvailable()) {
        window.localStorage.setItem(REPORTED_JOBS_STORAGE_KEY, dataStr);
      }
    } catch (e) {
      console.warn('ReportedJobsStore persist error:', e);
    }
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (err) {
        console.error('Error in ReportedJobsStore listener:', err);
      }
    });
  }

  public isReported(jobId?: any): boolean {
    if (!jobId) return false;
    const cleanId = normalizeId(jobId);
    return this.reportedMap.has(cleanId) || this.reportedMap.has(cleanId.replace(/^j/, ''));
  }

  public getReportMetadata(jobId?: any): ReportedJobMetadata | undefined {
    if (!jobId) return undefined;
    const cleanId = normalizeId(jobId);
    return this.reportedMap.get(cleanId) || this.reportedMap.get(cleanId.replace(/^j/, ''));
  }

  public addReportedJob(
    jobId: string,
    metadata?: Partial<ReportedJobMetadata>
  ) {
    if (!jobId) return;
    const cleanId = normalizeId(jobId);
    const fullMetadata: ReportedJobMetadata = {
      jobId: cleanId,
      title: metadata?.title || 'Job Listing',
      company: metadata?.company || 'Employer',
      reasonCategory: metadata?.reasonCategory || 'OTHER',
      reportedAt: metadata?.reportedAt || new Date().toISOString(),
    };

    this.reportedMap.set(cleanId, fullMetadata);
    this.persistToStorage();
    this.notifyListeners();
  }

  public getAllReportedIds(): string[] {
    return Array.from(this.reportedMap.keys());
  }
}

export const reportedJobsStore = new ReportedJobsStore();
