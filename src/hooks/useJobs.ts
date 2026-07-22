import { useCallback } from 'react';
import { useStore } from '../store/useStore';
import { Job, JobType, WorkMode } from '../types';
import { generateId, getCompanyColor } from '../utils/helpers';

export interface JobFilters {
  keyword?: string;
  location?: string;
  jobType?: string; // Comma separated
  workMode?: string; // Comma separated
  experience?: string; // years limit
  salaryMin?: string;
  industry?: string; // Comma separated
  sort?: string;
}

export const useJobs = () => {
  const { state, dispatch } = useStore();

  const getJobs = useCallback((filters: JobFilters = {}) => {
    let jobs = [...state.jobs].filter(j => j.status === 'active');

    if (filters.keyword) {
      const kw = filters.keyword.toLowerCase();
      jobs = jobs.filter(j =>
        j.title.toLowerCase().includes(kw) ||
        j.company.toLowerCase().includes(kw) ||
        j.description.toLowerCase().includes(kw) ||
        (j.skills && j.skills.some(s => s.toLowerCase().includes(kw)))
      );
    }

    if (filters.location) {
      const loc = filters.location.toLowerCase();
      jobs = jobs.filter(j => j.location.toLowerCase().includes(loc));
    }

    if (filters.jobType) {
      const types = filters.jobType.split(',');
      jobs = jobs.filter(j => types.includes(j.jobType));
    }

    if (filters.workMode) {
      const modes = filters.workMode.split(',');
      jobs = jobs.filter(j => modes.includes(j.workMode));
    }

    if (filters.experience) {
      const exp = parseInt(filters.experience);
      jobs = jobs.filter(j => j.minExperience <= exp && j.maxExperience >= exp);
    }

    if (filters.salaryMin) {
      jobs = jobs.filter(j => j.salaryMax >= parseInt(filters.salaryMin || '0'));
    }

    if (filters.industry) {
      const industries = filters.industry.split(',');
      jobs = jobs.filter(j => industries.includes(j.industry));
    }

    // Sort
    switch (filters.sort) {
      case 'salary-high':
        jobs.sort((a, b) => (b.salaryMax || 0) - (a.salaryMax || 0));
        break;
      case 'salary-low':
        jobs.sort((a, b) => (a.salaryMin || 0) - (b.salaryMin || 0));
        break;
      case 'oldest':
        jobs.sort((a, b) => new Date(a.postedAt).getTime() - new Date(b.postedAt).getTime());
        break;
      default: // newest
        jobs.sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime());
    }

    return jobs;
  }, [state.jobs]);

  const getJobById = useCallback((id: string) => {
    return state.jobs.find(j => j.id === id);
  }, [state.jobs]);

  const getJobsByEmployer = useCallback((employerId: string) => {
    return state.jobs.filter(j => j.employerId === employerId);
  }, [state.jobs]);

  const createJob = useCallback((jobData: Omit<Job, 'id' | 'employerId' | 'company' | 'companyLogo' | 'companyColor' | 'status' | 'applicants' | 'views' | 'postedAt'>) => {
    const user = state.currentUser;
    if (!user || user.role !== 'employer') return null;

    const companyName = user.companyName || user.name;
    const job: Job = {
      id: generateId(),
      employerId: user.id,
      company: companyName,
      companyLogo: companyName[0],
      companyColor: getCompanyColor(companyName),
      ...jobData,
      status: 'active',
      applicants: [],
      views: Math.floor(Math.random() * 200) + 10,
      postedAt: new Date().toISOString()
    };

    dispatch({ type: 'CREATE_JOB', payload: job });
    return job;
  }, [state.currentUser, dispatch]);

  const updateJob = useCallback((id: string, updates: Partial<Job>) => {
    const job = state.jobs.find(j => j.id === id);
    if (!job) return null;

    const updatedJob = { ...job, ...updates } as Job;
    dispatch({ type: 'UPDATE_JOB', payload: updatedJob });
    return updatedJob;
  }, [state.jobs, dispatch]);

  const deleteJob = useCallback((id: string) => {
    dispatch({ type: 'DELETE_JOB', payload: id });
  }, [dispatch]);

  const applyToJob = useCallback((jobId: string) => {
    const user = state.currentUser;
    if (!user) return { success: false, error: 'Please login to apply' };
    if (user.role !== 'candidate') return { success: false, error: 'Only candidates can apply' };

    const job = getJobById(jobId);
    if (!job) return { success: false, error: 'Job not found' };

    if (user.appliedJobs && user.appliedJobs.includes(jobId)) {
      return { success: false, error: 'Already applied to this job' };
    }

    const applicant = {
      userId: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      appliedAt: new Date().toISOString(),
      status: 'applied'
    };

    dispatch({ type: 'APPLY_JOB', payload: { jobId, applicant } });
    return { success: true };
  }, [state.currentUser, getJobById, dispatch]);

  const updateApplicantStatus = useCallback((jobId: string, applicantUserId: string, newStatus: string) => {
    const job = state.jobs.find(j => j.id === jobId);
    if (!job) return null;

    const updatedApplicants = (job.applicants || []).map(app => 
      app.userId === applicantUserId ? { ...app, status: newStatus } : app
    );

    const updatedJob = { ...job, applicants: updatedApplicants } as Job;
    dispatch({ type: 'UPDATE_JOB', payload: updatedJob });
    return updatedJob;
  }, [state.jobs, dispatch]);

  const toggleSaveJob = useCallback((jobId: string) => {
    const user = state.currentUser;
    if (!user) return false;

    dispatch({ type: 'TOGGLE_SAVE_JOB', payload: { jobId } });
    return !(user.savedJobs || []).includes(jobId);
  }, [state.currentUser, dispatch]);

  const isJobSaved = useCallback((jobId: string) => {
    const user = state.currentUser;
    return !!(user && user.savedJobs && user.savedJobs.includes(jobId));
  }, [state.currentUser]);

  const getAppliedJobs = useCallback(() => {
    const user = state.currentUser;
    if (!user || !user.appliedJobs) return [];
    return user.appliedJobs.map(id => getJobById(id)).filter(Boolean) as Job[];
  }, [state.currentUser, getJobById]);

  const getSavedJobs = useCallback(() => {
    const user = state.currentUser;
    if (!user || !user.savedJobs) return [];
    return user.savedJobs.map(id => getJobById(id)).filter(Boolean) as Job[];
  }, [state.currentUser, getJobById]);

  return {
    getJobs,
    getJobById,
    getJobsByEmployer,
    createJob,
    updateJob,
    deleteJob,
    applyToJob,
    updateApplicantStatus,
    toggleSaveJob,
    isJobSaved,
    getAppliedJobs,
    getSavedJobs
  };
};
