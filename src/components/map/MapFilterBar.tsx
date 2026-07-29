import React, { useState, useEffect } from 'react';
import { Search, Navigation, Filter, X } from 'lucide-react';

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
      {/* Primary Search Input Row */}
      <div className="map-search-row">
        <div className="map-search-input-wrapper">
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
