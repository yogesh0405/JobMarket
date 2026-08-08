import React, { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../../utils/api';
import { useToast } from '../../hooks/useToast';
import { useStore } from '../../store/useStore';
import { MapFilterBar } from '../../components/map/MapFilterBar';
import { JobMapSidebar } from '../../components/map/JobMapSidebar';
import { InteractiveJobMap } from '../../components/map/InteractiveJobMap';
import { JobMapBottomSheet } from '../../components/map/JobMapBottomSheet';
import '../../styles/map.css';

export const JobMapPage: React.FC = () => {
  const { showToast } = useToast();
  const { state } = useStore();

  const [jobs, setJobs] = useState<any[]>([]);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [mapBounds, setMapBounds] = useState<{ north: number; south: number; east: number; west: number } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [radius, setRadius] = useState<number | null>(null);
  const [workMode, setWorkMode] = useState('All');
  const [jobType, setJobType] = useState('All');
  const [userCoordinates, setUserCoordinates] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch Visible Jobs based on Viewport Bounds or Nearby Radius Search
  const fetchJobs = useCallback(async () => {
    try {
      setIsLoading(true);

      let url = '';
      if (radius && userCoordinates) {
        // Radius Search API
        const params = new URLSearchParams({
          latitude: userCoordinates.latitude.toString(),
          longitude: userCoordinates.longitude.toString(),
          radius: radius.toString(),
          ...(searchQuery && { search: searchQuery }),
          ...(workMode !== 'All' && { workMode })
        });
        url = `/api/v1/jobs/nearby?${params.toString()}`;
      } else {
        // Viewport Bounding Box Search API
        const params = new URLSearchParams({
          ...(mapBounds && {
            north: mapBounds.north.toString(),
            south: mapBounds.south.toString(),
            east: mapBounds.east.toString(),
            west: mapBounds.west.toString()
          }),
          ...(searchQuery && { search: searchQuery }),
          ...(workMode !== 'All' && { workMode }),
          ...(jobType !== 'All' && { jobType })
        });
        url = `/api/v1/jobs/map?${params.toString()}`;
      }

      const res = await apiFetch(url);
      if (res.ok) {
        const json = await res.json();
        const rawJobs = Array.isArray(json) ? json : (json.data || []);
        if (rawJobs && rawJobs.length > 0) {
          setJobs(rawJobs);
          return;
        }
      }
      
      // Fallback: If API returns empty or non-200, load jobs with coordinates from store
      const storeJobs = (state.jobs || []).filter((j: any) => j && j.latitude && j.longitude);
      setJobs(storeJobs);
    } catch (error) {
      console.error('Error fetching map jobs:', error);
      const storeJobs = (state.jobs || []).filter((j: any) => j && j.latitude && j.longitude);
      setJobs(storeJobs);
    } finally {
      setIsLoading(false);
    }
  }, [mapBounds, radius, userCoordinates, searchQuery, workMode, jobType, state.jobs]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // Handle Geolocation API
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      showToast('Geolocation is not supported by your browser', 'error');
      return;
    }

    setIsLocating(true);
    showToast('Fetching your location...', 'info');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
        setUserCoordinates(coords);
        setRadius(20); // Default to 20km radius search
        setIsLocating(false);
        showToast('Located successfully! Showing nearby jobs within 20km', 'success');
      },
      (error) => {
        setIsLocating(false);
        console.warn('Geolocation error:', error);
        showToast('Unable to retrieve location. Please check location permissions.', 'warning');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSaveJob = async (jobId: string) => {
    try {
      const res = await apiFetch(`/api/v1/jobs/${jobId}/save`, { method: 'POST' });
      if (res.ok) {
        const json = await res.json();
        showToast(json.message || 'Job save status updated', 'success');
      } else {
        showToast('Failed to save job', 'error');
      }
    } catch (err) {
      showToast('Error saving job', 'error');
    }
  };

  return (
    <div className="job-map-page-container">
      {/* Top Filter & Search Bar */}
      <MapFilterBar
        onSearchChange={setSearchQuery}
        onRadiusChange={setRadius}
        onWorkModeChange={setWorkMode}
        onJobTypeChange={setJobType}
        onUseMyLocation={handleUseMyLocation}
        selectedRadius={radius}
        selectedWorkMode={workMode}
        selectedJobType={jobType}
        isLocating={isLocating}
        totalVisibleCount={jobs.length}
      />

      {/* Main Content Layout */}
      <div className="map-main-content">
        {/* Desktop Left Sidebar */}
        <JobMapSidebar
          jobs={jobs}
          activeJobId={activeJobId}
          onSelectJob={(job) => setActiveJobId(job.id)}
        />

        {/* Interactive Leaflet OpenStreetMap Container */}
        <InteractiveJobMap
          jobs={jobs}
          activeJobId={activeJobId}
          onSelectJob={(job) => setActiveJobId(job.id)}
          onBoundsChange={setMapBounds}
          userCoordinates={userCoordinates}
          onSaveJob={handleSaveJob}
        />

        {/* Mobile Bottom Sheet Drawer */}
        <JobMapBottomSheet
          jobs={jobs}
          activeJobId={activeJobId}
          onSelectJob={(job) => setActiveJobId(job.id)}
        />
      </div>
    </div>
  );
};
export default JobMapPage;
