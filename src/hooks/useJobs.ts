import { useCallback } from 'react';
import { useStore } from '../store/useStore';
import { apiFetch } from '../utils/api';
import { Job } from '../types';

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
        (j.location && j.location.toLowerCase().includes(kw)) ||
        (j.industry && j.industry.toLowerCase().includes(kw)) ||
        (j.trade && j.trade.toLowerCase().includes(kw)) ||
        (j.workMode && j.workMode.toLowerCase().includes(kw)) ||
        (j.jobType && j.jobType.toLowerCase().includes(kw)) ||
        (j.midcZone && j.midcZone.toLowerCase().includes(kw)) ||
        (j.skills && j.skills.some(s => s.toLowerCase().includes(kw)))
      );
    }

    if (filters.location) {
      const locs = filters.location.toLowerCase().split(',');
      jobs = jobs.filter(j => locs.some(loc => j.location.toLowerCase().includes(loc)));
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
      const salMin = parseInt(filters.salaryMin || '0');
      const monthlySalMin = salMin >= 100000 ? Math.round(salMin / 12) : salMin;
      jobs = jobs.filter(j => j.salaryMax >= monthlySalMin);
    }

    if (filters.industry) {
      const industries = filters.industry.toLowerCase().split(',');
      jobs = jobs.filter(j => industries.includes(j.industry.toLowerCase()));
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

  const createJob = useCallback(async (jobData: any) => {
    try {
      const res = await apiFetch('/api/v1/jobs', {
        method: 'POST',
        body: JSON.stringify(jobData)
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to create job');
      dispatch({ type: 'CREATE_JOB', payload: json.data });
      return json.data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }, [dispatch]);

  const updateJob = useCallback(async (id: string, updates: any) => {
    try {
      const res = await apiFetch(`/api/v1/jobs/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to update job');
      dispatch({ type: 'UPDATE_JOB', payload: json.data });
      return json.data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }, [dispatch]);

  const deleteJob = useCallback(async (id: string) => {
    try {
      const res = await apiFetch(`/api/v1/jobs/${id}`, {
        method: 'DELETE'
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to delete job');
      dispatch({ type: 'DELETE_JOB', payload: id });
      return true;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }, [dispatch]);

  const applyToJob = useCallback(async (jobId: string) => {
    const user = state.currentUser;
    if (!user) return { success: false, error: 'Please login to apply' };
    if (user.role !== 'candidate') return { success: false, error: 'Only candidates can apply' };

    try {
      const res = await apiFetch(`/api/v1/jobs/${jobId}/apply`, {
        method: 'POST'
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to apply to job');

      const applicant = {
        userId: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        appliedAt: new Date().toISOString(),
        status: 'applied',
        resume: user.resume || null
      };

      dispatch({ type: 'APPLY_JOB', payload: { jobId, applicant } });
      return { success: true };
    } catch (err: any) {
      console.error(err);
      return { success: false, error: err.message || 'Failed to apply' };
    }
  }, [state.currentUser, dispatch]);

  const updateApplicantStatus = useCallback(async (jobId: string, applicantUserId: string, newStatus: string) => {
    try {
      const res = await apiFetch(`/api/v1/jobs/${jobId}/applicants/${applicantUserId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to update applicant status');

      const job = state.jobs.find(j => j.id === jobId);
      if (job) {
        const updatedApplicants = (job.applicants || []).map(app => 
          app.userId === applicantUserId ? { ...app, status: newStatus as any } : app
        );
        dispatch({ type: 'UPDATE_JOB', payload: { ...job, applicants: updatedApplicants } });
      }
      return true;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }, [state.jobs, dispatch]);

  const fetchEmployerJobs = useCallback(async () => {
    try {
      const res = await apiFetch('/api/v1/jobs/my-jobs/all');
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to fetch my jobs');
      dispatch({ type: 'SET_JOBS', payload: json.data });
      return json.data;
    } catch (err) {
      console.error('Error fetching employer jobs:', err);
    }
  }, [dispatch]);

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

  const scheduleInterview = useCallback(async (jobId: string, applicantUserId: string, details: { interviewDate: string, interviewTime: string, venueAddress: string, mapsLink?: string }) => {
    try {
      const res = await apiFetch(`/api/v1/jobs/${jobId}/applicants/${applicantUserId}/interview`, {
        method: 'POST',
        body: JSON.stringify(details)
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to schedule interview');

      const job = state.jobs.find(j => j.id === jobId);
      if (job) {
        const updatedApplicants = (job.applicants || []).map(app => 
          app.userId === applicantUserId ? { ...app, status: 'shortlisted' as any } : app
        );
        dispatch({ type: 'UPDATE_JOB', payload: { ...job, applicants: updatedApplicants } });
      }
      return { success: true };
    } catch (err: any) {
      console.error(err);
      return { success: false, error: err.message || 'Failed to schedule interview' };
    }
  }, [state.jobs, dispatch]);

  const sendCustomEmail = useCallback(async (jobId: string, applicantUserId: string, details: { subject: string, message: string }) => {
    try {
      const res = await apiFetch(`/api/v1/jobs/${jobId}/applicants/${applicantUserId}/email`, {
        method: 'POST',
        body: JSON.stringify(details)
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to send email');
      return { success: true };
    } catch (err: any) {
      console.error(err);
      return { success: false, error: err.message || 'Failed to send email' };
    }
  }, []);

  const getAllCandidates = useCallback(async () => {
    try {
      const res = await apiFetch('/api/v1/jobs/workers/all');
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to fetch candidates');
      return json.data;
    } catch (err: any) {
      console.error(err);
      throw err;
    }
  }, []);

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
    getSavedJobs,
    fetchEmployerJobs,
    scheduleInterview,
    sendCustomEmail,
    getAllCandidates
  };
};
