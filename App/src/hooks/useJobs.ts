import { useCallback } from 'react';
import { useStore } from '../store/useStore';
import { apiFetch, safeParseJson } from '../utils/api';
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
    let jobs = [...state.jobs].filter(j => j.status === 'active' || !j.status || (j.status as string) === 'approved');

    if (filters.keyword && filters.keyword.trim()) {
      const kwTokens = filters.keyword.toLowerCase().trim().split(/\s+/).filter(Boolean);
      jobs = jobs.filter(j => {
        const fullJobText = [
          j.title,
          j.company,
          j.description,
          j.location,
          j.industry,
          (j as any).industryType,
          j.trade,
          j.workMode,
          j.jobType,
          j.midcZone,
          (j as any).shiftDetails,
          (j as any).educationRequirement,
          ...(j.skills || [])
        ].filter(Boolean).join(' ').toLowerCase();

        return kwTokens.every(token => fullJobText.includes(token));
      });
    }

    if (filters.location && filters.location.trim()) {
      const locs = filters.location.toLowerCase().split(',').map(l => l.trim()).filter(Boolean);
      jobs = jobs.filter(j => {
        const jLoc = (j.location || '').toLowerCase();
        return locs.some(loc => jLoc.includes(loc) || loc.includes(jLoc));
      });
    }

    if (filters.jobType && filters.jobType.trim()) {
      const types = filters.jobType.split(',').map(t => t.toLowerCase().replace(/[^a-z0-9]/g, ''));
      jobs = jobs.filter(j => {
        const jType = (j.jobType || 'Full-time').toLowerCase().replace(/[^a-z0-9]/g, '');
        return types.some(t => jType.includes(t) || t.includes(jType));
      });
    }

    if (filters.workMode && filters.workMode.trim()) {
      const modes = filters.workMode.split(',').map(m => m.toLowerCase().replace(/[^a-z0-9]/g, ''));
      jobs = jobs.filter(j => {
        const jMode = (j.workMode || 'On-site').toLowerCase().replace(/[^a-z0-9]/g, '');
        return modes.some(m => jMode.includes(m) || m.includes(jMode));
      });
    }

    if (filters.experience) {
      const exp = parseInt(filters.experience);
      if (!isNaN(exp)) {
        jobs = jobs.filter(j => (j.minExperience ?? 0) <= exp && (j.maxExperience ?? 99) >= exp);
      }
    }

    if (filters.salaryMin) {
      const salMin = parseInt(filters.salaryMin || '0');
      if (!isNaN(salMin) && salMin > 0) {
        const monthlySalMin = salMin >= 100000 ? Math.round(salMin / 12) : salMin;
        jobs = jobs.filter(j => (j.salaryMax || j.salaryMin || 0) >= monthlySalMin);
      }
    }

    if (filters.industry && filters.industry.trim()) {
      const industries = filters.industry.toLowerCase().split(',').map(i => i.trim()).filter(Boolean);
      jobs = jobs.filter(j => {
        const jInd = (j.industry || (j as any).industryType || j.trade || j.title || '').toLowerCase();
        return industries.some(ind => jInd.includes(ind) || ind.includes(jInd));
      });
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

  const fetchJobById = useCallback(async (id: string) => {
    try {
      const res = await apiFetch(`/api/v1/jobs/${id}`);
      const json = await res.json();
      const payload = json.data || (json.id ? json : json.job);
      if (res.ok && payload) {
        const existingIndex = state.jobs.findIndex(j => j.id === id);
        if (existingIndex >= 0) {
          const updatedJobs = [...state.jobs];
          updatedJobs[existingIndex] = payload;
          dispatch({ type: 'SET_JOBS', payload: updatedJobs });
        } else {
          dispatch({ type: 'SET_JOBS', payload: [...state.jobs, payload] });
        }
        return payload;
      }
    } catch (err) {
      console.error(`Error fetching job ${id}:`, err);
    }
    return state.jobs.find(j => j.id === id) || null;
  }, [dispatch, state.jobs]);

  const getJobsByEmployer = useCallback((employerId: string) => {
    return state.jobs.filter(j => j.employerId === employerId || (j as any).employer_id === employerId);
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

  const fetchCandidateAppliedJobs = useCallback(async () => {
    try {
      const res = await apiFetch('/api/v1/jobs/applied/my-applications');
      const json = await res.json();
      if (res.ok && Array.isArray(json.data)) {
        const fetchedMap = new Map(json.data.map((j: any) => [j.id, j]));
        const updatedJobs = state.jobs.map(j => {
          const match = fetchedMap.get(j.id);
          return match ? { ...j, ...(match as any) } : j;
        });
        const existingIds = new Set(state.jobs.map(j => j.id));
        const brandNewJobs = json.data.filter((j: any) => !existingIds.has(j.id));
        dispatch({ type: 'SET_JOBS', payload: [...updatedJobs, ...brandNewJobs] });
        return json.data;
      }
    } catch (err) {
      console.error('Error fetching candidate applied jobs:', err);
    }
  }, [dispatch, state.jobs]);

  const fetchCandidateSavedJobs = useCallback(async () => {
    try {
      const res = await apiFetch('/api/v1/jobs/saved/my-saved');
      const json = await res.json();
      if (res.ok && Array.isArray(json.data)) {
        const savedIds = json.data.map((j: any) => j.id);
        
        if (state.currentUser) {
          dispatch({
            type: 'UPDATE_USER',
            payload: { id: state.currentUser.id, savedJobs: savedIds }
          });
        }

        const fetchedMap = new Map(json.data.map((j: any) => [j.id, j]));
        const updatedJobs = state.jobs.map(j => {
          const match = fetchedMap.get(j.id);
          return match ? { ...j, ...(match as any) } : j;
        });
        const existingIds = new Set(state.jobs.map(j => j.id));
        const brandNewJobs = json.data.filter((j: any) => !existingIds.has(j.id));
        dispatch({ type: 'SET_JOBS', payload: [...updatedJobs, ...brandNewJobs] });
        return json.data;
      }
    } catch (err) {
      console.error('Error fetching candidate saved jobs:', err);
    }
  }, [dispatch, state.currentUser, state.jobs]);

  const toggleSaveJob = useCallback((jobId: string): boolean => {
    const user = state.currentUser;
    if (!user) return false;

    const isCurrentlySaved = (user.savedJobs || []).includes(jobId);
    const willBeSaved = !isCurrentlySaved;

    // 1. Optimistically update React store state immediately (0ms delay)
    dispatch({ type: 'TOGGLE_SAVE_JOB', payload: { jobId } });

    // 2. Sync with PostgreSQL database asynchronously in background
    apiFetch(`/api/v1/jobs/${jobId}/save`, { method: 'POST' }).catch((err) => {
      console.error('Failed to sync saved job with database:', err);
      // Revert optimistic update only on network error
      dispatch({ type: 'TOGGLE_SAVE_JOB', payload: { jobId } });
    });

    // 3. Return new state boolean instantly (0ms)
    return willBeSaved;
  }, [state.currentUser, dispatch]);

  const isJobSaved = useCallback((jobId: string) => {
    const user = state.currentUser;
    return !!(user && user.savedJobs && user.savedJobs.includes(jobId));
  }, [state.currentUser]);

  const getAppliedJobs = useCallback(() => {
    const user = state.currentUser;
    if (!user) return [];
    const appliedIds = user.appliedJobs || [];
    const appliedWithStatus = user.appliedJobsWithStatus || [];
    const allAppliedIds = Array.from(new Set([
      ...appliedIds,
      ...appliedWithStatus.map((a: any) => a.jobId)
    ]));
    return allAppliedIds.map(id => getJobById(id)).filter(Boolean) as Job[];
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
          app.userId === applicantUserId ? { 
            ...app, 
            status: 'shortlisted' as any,
            interviewDate: details.interviewDate,
            interviewTime: details.interviewTime,
            venueAddress: details.venueAddress,
            mapsLink: details.mapsLink
          } : app
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
      const { ok, data } = await safeParseJson<any>(res);
      if (ok && Array.isArray(data?.data) && data.data.length > 0) {
        return data.data;
      }
      if (ok && Array.isArray(data) && data.length > 0) {
        return data;
      }
      const candidatesFromStore = state.users.filter(u => u.role === 'candidate' && u.isResumePublic !== false);
      if (candidatesFromStore.length > 0) return candidatesFromStore;
      return [];
    } catch (err: any) {
      console.error('getAllCandidates error:', err);
      return state.users.filter(u => u.role === 'candidate' && u.isResumePublic !== false);
    }
  }, [state.users]);

  return {
    getJobs,
    getJobById,
    fetchJobById,
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
    fetchCandidateAppliedJobs,
    fetchCandidateSavedJobs,
    scheduleInterview,
    sendCustomEmail,
    getAllCandidates
  };
};
