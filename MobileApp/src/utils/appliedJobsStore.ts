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
      const targetStatus = item?.applicationStatus || item?.application_status || item?.status || item?.job?.applicationStatus || item?.job?.status || 'applied';
      const targetJobId = item?.jobId || item?.job_id || item?.job?.id || item?.id;
      const actualJob = item?.job || item;

      return {
        id: item?.id || targetJobId,
        jobId: targetJobId,
        job: actualJob,
        status: targetStatus as any,
        appliedAt: item?.appliedAt || item?.applied_at || item?.created_at || new Date().toISOString(),
        interviewDate: item?.interviewDate || item?.interview_date,
        interviewTime: item?.interviewTime || item?.interview_time,
        venueAddress: item?.venueAddress || item?.venue_address,
        mapsLink: item?.mapsLink || item?.maps_link,
      };
    });

    const serverJobIds = new Set(formatted.map((f) => f.jobId || f.job?.id).filter(Boolean));
    const optimisticUnsynced = this.appliedJobs.filter(
      (opt) => !serverJobIds.has(opt.jobId) && !serverJobIds.has(opt.job?.id)
    );

    this.appliedJobs = [...formatted, ...optimisticUnsynced];
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
