import * as SecureStore from 'expo-secure-store';
import { Job } from '../types';

export interface AppliedJobItem {
  id?: string;
  jobId: string;
  job: Job;
  status: 'applied' | 'reviewed' | 'shortlisted' | 'hired' | 'rejected';
  appliedAt: string;
  interviewDate?: string;
  interviewTime?: string;
  venueAddress?: string;
  mapsLink?: string;
}

type Listener = () => void;

const APPLIED_JOBS_STORAGE_KEY = 'csn_candidate_applied_jobs_v2';

const isWebLocalStorageAvailable = (): boolean => {
  try {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  } catch {
    return false;
  }
};

const isIdMatch = (a?: any, b?: any): boolean => {
  if (!a || !b) return false;
  const strA = String(a).trim().toLowerCase();
  const strB = String(b).trim().toLowerCase();
  if (strA === strB) return true;
  if (strA.replace(/^j/, '') === strB.replace(/^j/, '')) return true;
  return false;
};

export const normalizeApplicationStatus = (
  rawStatus?: string
): 'applied' | 'reviewed' | 'shortlisted' | 'hired' | 'rejected' => {
  if (!rawStatus) return 'applied';
  const s = String(rawStatus).toLowerCase().trim();
  if (
    s === 'shortlisted' ||
    s === 'interview' ||
    s === 'interview_scheduled' ||
    s === 'interviewing'
  ) {
    return 'shortlisted';
  }
  if (
    s === 'hired' ||
    s === 'selected' ||
    s === 'accepted' ||
    s === 'offer_extended' ||
    s === 'offered'
  ) {
    return 'hired';
  }
  if (s === 'rejected' || s === 'declined' || s === 'cancelled') {
    return 'rejected';
  }
  if (
    s === 'reviewed' ||
    s === 'under_review' ||
    s === 'in_review' ||
    s === 'in-review'
  ) {
    return 'reviewed';
  }
  // Default for 'applied', 'pending', 'received', 'submitted', 'active', 'approved'
  return 'applied';
};

class AppliedJobsStore {
  private appliedJobs: AppliedJobItem[] = [];
  private listeners: Set<Listener> = new Set();
  private pendingRefresh: boolean = false;
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
        raw = await SecureStore.getItemAsync(APPLIED_JOBS_STORAGE_KEY);
      } else if (isWebLocalStorageAvailable()) {
        raw = window.localStorage.getItem(APPLIED_JOBS_STORAGE_KEY);
      }

      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Merge with any in-memory items
          const map = new Map<string, AppliedJobItem>();
          parsed.forEach((item: AppliedJobItem) => {
            if (item && item.jobId) map.set(item.jobId, item);
          });
          this.appliedJobs.forEach((item) => {
            if (item && item.jobId) map.set(item.jobId, item);
          });
          this.appliedJobs = Array.from(map.values());
          this.notify();
        }
      }
    } catch (e) {
      console.warn('AppliedJobsStore init from storage error:', e);
    } finally {
      this.isInitialized = true;
    }
  }

  private async persistToStorage() {
    try {
      const json = JSON.stringify(this.appliedJobs);
      const isAvailable = await SecureStore.isAvailableAsync().catch(() => false);
      if (isAvailable) {
        await SecureStore.setItemAsync(APPLIED_JOBS_STORAGE_KEY, json);
      } else if (isWebLocalStorageAvailable()) {
        window.localStorage.setItem(APPLIED_JOBS_STORAGE_KEY, json);
      }
    } catch (e) {
      console.warn('AppliedJobsStore persist error:', e);
    }
  }

  addAppliedJob(job: Job) {
    if (!job || !job.id) return;
    const targetJobId = String(job.id);
    const existingIndex = this.appliedJobs.findIndex(
      (item) => isIdMatch(item.jobId, targetJobId) || isIdMatch(item.job?.id, targetJobId)
    );

    const newItem: AppliedJobItem = {
      id: `opt-${targetJobId}-${Date.now()}`,
      jobId: targetJobId,
      job,
      status: 'applied',
      appliedAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      this.appliedJobs[existingIndex] = {
        ...this.appliedJobs[existingIndex],
        ...newItem,
      };
    } else {
      this.appliedJobs = [newItem, ...this.appliedJobs];
    }

    this.pendingRefresh = true;
    this.persistToStorage();
    this.notify();
  }

  getAppliedJobs(): AppliedJobItem[] {
    return this.appliedJobs;
  }

  setAppliedJobs(items: any[]) {
    if (!Array.isArray(items)) return;

    const serverList: AppliedJobItem[] = items.map((item) => {
      const rawStatus =
        item?.applicationStatus ||
        item?.application_status ||
        item?.status ||
        item?.job?.applicationStatus ||
        item?.job?.status ||
        'applied';
      const targetJobId = String(
        item?.jobId || item?.job_id || item?.job?.id || item?.id || ''
      );
      const actualJob = item?.job || item;

      return {
        id: String(item?.id || targetJobId),
        jobId: targetJobId,
        job: actualJob,
        status: normalizeApplicationStatus(rawStatus),
        appliedAt:
          item?.appliedAt ||
          item?.applied_at ||
          item?.created_at ||
          new Date().toISOString(),
        interviewDate: item?.interviewDate || item?.interview_date,
        interviewTime: item?.interviewTime || item?.interview_time,
        venueAddress: item?.venueAddress || item?.venue_address,
        mapsLink: item?.mapsLink || item?.maps_link,
      };
    });

    // Smart Merge: Don't lose locally added applied jobs if server hasn't propagated them yet
    const mergedMap = new Map<string, AppliedJobItem>();

    // 1. Insert server items
    serverList.forEach((item) => {
      if (item.jobId) mergedMap.set(item.jobId, item);
    });

    // 2. Preserve existing local applied jobs
    this.appliedJobs.forEach((localItem) => {
      if (localItem.jobId && !mergedMap.has(localItem.jobId)) {
        mergedMap.set(localItem.jobId, localItem);
      }
    });

    this.appliedJobs = Array.from(mergedMap.values()).sort(
      (a, b) =>
        new Date(b.appliedAt || 0).getTime() - new Date(a.appliedAt || 0).getTime()
    );

    this.pendingRefresh = false;
    this.persistToStorage();
    this.notify();
  }

  hasApplied(jobId: string): boolean {
    if (!jobId) return false;
    return this.appliedJobs.some(
      (item) =>
        isIdMatch(item.jobId, jobId) ||
        isIdMatch(item.id, jobId) ||
        isIdMatch(item.job?.id, jobId)
    );
  }

  getAppliedJob(jobId: string): AppliedJobItem | undefined {
    if (!jobId) return undefined;
    return this.appliedJobs.find(
      (item) =>
        isIdMatch(item.jobId, jobId) ||
        isIdMatch(item.id, jobId) ||
        isIdMatch(item.job?.id, jobId)
    );
  }

  clear() {
    this.appliedJobs = [];
    this.pendingRefresh = false;
    this.persistToStorage();
    this.notify();
  }

  consumePendingRefresh(): boolean {
    const flag = this.pendingRefresh;
    this.pendingRefresh = false;
    return flag;
  }

  subscribe(listener: Listener) {
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
        console.error('AppliedJobsStore listener error:', e);
      }
    });
  }
}

export const appliedJobsStore = new AppliedJobsStore();
