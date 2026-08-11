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

class AppliedJobsStore {
  private appliedJobs: AppliedJobItem[] = [];
  private listeners: Set<Listener> = new Set();
  private pendingRefresh: boolean = false;

  addAppliedJob(job: Job) {
    if (!job || !job.id) return;
    const exists = this.appliedJobs.some((item) => item.jobId === job.id || item.job?.id === job.id);
    if (!exists) {
      const newItem: AppliedJobItem = {
        id: `opt-${job.id}-${Date.now()}`,
        jobId: job.id,
        job,
        status: 'applied',
        appliedAt: new Date().toISOString(),
      };
      this.appliedJobs = [newItem, ...this.appliedJobs];
    }
    this.pendingRefresh = true;
    this.notify();
  }

  getAppliedJobs(): AppliedJobItem[] {
    return this.appliedJobs;
  }

  setAppliedJobs(items: any[]) {
    if (!Array.isArray(items)) return;

    const formatted: AppliedJobItem[] = items.map((item) => {
      if (item && item.jobId && item.job) {
        return item as AppliedJobItem;
      }
      return {
        id: item?.id,
        jobId: item?.id,
        job: item,
        status: item?.status || 'applied',
        appliedAt: item?.appliedAt || item?.created_at || new Date().toISOString(),
        interviewDate: item?.interviewDate,
        interviewTime: item?.interviewTime,
        venueAddress: item?.venueAddress,
        mapsLink: item?.mapsLink,
      };
    });

    const serverJobIds = new Set(formatted.map((f) => f.jobId || f.job?.id).filter(Boolean));
    const optimisticUnsynced = this.appliedJobs.filter(
      (opt) => !serverJobIds.has(opt.jobId) && !serverJobIds.has(opt.job?.id)
    );

    this.appliedJobs = [...optimisticUnsynced, ...formatted];
    this.pendingRefresh = false;
    this.notify();
  }

  hasApplied(jobId: string): boolean {
    if (!jobId) return false;
    return this.appliedJobs.some((item) => item.jobId === jobId || item.job?.id === jobId);
  }

  clear() {
    this.appliedJobs = [];
    this.pendingRefresh = false;
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
