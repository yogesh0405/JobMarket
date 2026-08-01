import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Navigation, Filter, X, LayoutGrid, List, Map } from 'lucide-react';

interface MapFilterBarProps {
  onSearchChange: (query: string) => void;
  onRadiusChange: (radius: number | null) => void;
  onWorkModeChange: (mode: string) => void;
  onJobTypeChange: (type: string) => void;
  onUseMyLocation: () => void;
  selectedRadius: number | null;
  selectedWorkMode: string;
  selectedJobType: string;
  isLocating: boolean;
  totalVisibleCount: number;
}

export const MapFilterBar: React.FC<MapFilterBarProps> = ({
  onSearchChange,
  onRadiusChange,
  onWorkModeChange,
  onJobTypeChange,
  onUseMyLocation,
  selectedRadius,
  selectedWorkMode,
  selectedJobType,
  isLocating,
  totalVisibleCount
}) => {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState('');

  // 300ms Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      onSearchChange(searchInput);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchInput, onSearchChange]);

  return (
    <div className="map-filter-bar">
      {/* Primary Search Input & View Switcher Row */}
      <div className="map-search-row" style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        <div className="map-search-input-wrapper" style={{ flex: 1, minWidth: '220px' }}>
          <Search className="map-search-icon" />
          <input
            type="text"
            className="map-search-input"
            placeholder="Search title, company, skills, locality, PIN..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          {searchInput && (
            <button
              onClick={() => setSearchInput('')}
              className="map-search-clear-btn"
              aria-label="Clear search"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* View Mode Switcher Pills */}
        <div style={{ display: 'inline-flex', background: '#F1F5F9', padding: '3px', borderRadius: '0.4rem', border: '1px solid #E2E8F0', gap: '3px', flexShrink: 0 }}>
          <button
            type="button"
            style={{
              background: 'transparent',
              color: '#64748B',
              boxShadow: 'none',
              padding: '6px 12px',
              borderRadius: '0.3rem',
              border: 'none',
              fontWeight: '600',
              fontSize: '12.5px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              transition: 'all 0.18s ease'
            }}
            onClick={() => navigate('/jobs?view=grid')}
          >
            <LayoutGrid size={14} strokeWidth={2.2} />
            <span>Grid</span>
          </button>
          <button
            type="button"
            style={{
              background: 'transparent',
              color: '#64748B',
              boxShadow: 'none',
              padding: '6px 12px',
              borderRadius: '0.3rem',
              border: 'none',
              fontWeight: '600',
              fontSize: '12.5px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              transition: 'all 0.18s ease'
            }}
            onClick={() => navigate('/jobs?view=list')}
          >
            <List size={14} strokeWidth={2.2} />
            <span>List</span>
          </button>
          <button
            type="button"
            style={{
              background: '#ffffff',
              color: '#344BFD',
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
              padding: '6px 12px',
              borderRadius: '0.3rem',
              border: 'none',
              fontWeight: '600',
              fontSize: '12.5px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              transition: 'all 0.18s ease'
            }}
            onClick={() => {}}
          >
            <Map size={14} strokeWidth={2.2} />
            <span>Map</span>
          </button>
        </div>
      </div>

      {/* Horizontally Scrollable Filter Pills Row */}
      <div className="map-filters-scroll-row">
        {/* Radius Filter */}
        <select
          className={`map-filter-pill-select ${selectedRadius ? 'active' : ''}`}
          value={selectedRadius || ''}
          onChange={(e) => onRadiusChange(e.target.value ? Number(e.target.value) : null)}
        >
          <option value="">Distance: All</option>
          <option value="5">Within 5 km</option>
          <option value="10">Within 10 km</option>
          <option value="20">Within 20 km</option>
          <option value="50">Within 50 km</option>
          <option value="100">Within 100 km</option>
        </select>

        {/* Work Mode Filter */}
        <select
          className={`map-filter-pill-select ${selectedWorkMode !== 'All' ? 'active' : ''}`}
          value={selectedWorkMode}
          onChange={(e) => onWorkModeChange(e.target.value)}
        >
          <option value="All">Mode: All</option>
          <option value="On-site">On-site</option>
          <option value="Hybrid">Hybrid</option>
          <option value="Remote">Remote</option>
        </select>

        {/* Job Type Filter */}
        <select
          className={`map-filter-pill-select ${selectedJobType !== 'All' ? 'active' : ''}`}
          value={selectedJobType}
          onChange={(e) => onJobTypeChange(e.target.value)}
        >
          <option value="All">Type: All</option>
          <option value="Full-time">Full-time</option>
          <option value="Part-time">Part-time</option>
          <option value="Contract">Contract</option>
          <option value="Internship">Internship</option>
        </select>

        {/* Use My Location Button */}
        <button className="map-location-btn" onClick={onUseMyLocation} disabled={isLocating}>
          <Navigation size={13} className={isLocating ? 'animate-spin' : ''} />
          <span>{isLocating ? 'Locating...' : 'Near Me'}</span>
        </button>

        {/* Jobs Visible Counter */}
        <div className="map-jobs-count-pill">
          <span className="map-jobs-count-num">
            {totalVisibleCount}
          </span>
          <span className="map-jobs-count-label">{totalVisibleCount === 1 ? 'Job' : 'Jobs'}</span>
        </div>
      </div>
    </div>
  );
};
