import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { Job } from '../../types';

const POPULAR_TRADES = [
  'Fitter',
  'Welder',
  'CNC Operator',
  'Electrician',
  'Turner',
  'Machinist',
  'Quality Inspector',
  'Helper'
];

const MIDC_LOCATIONS = [
  'Bhosari MIDC, Pune',
  'Chakan MIDC, Pune',
  'Taloja MIDC, Navi Mumbai',
  'Thane Belapur MIDC',
  'Waluj MIDC, Chhatrapati Sambhajinagar',
  'Ranjangaon MIDC',
  'Pimpri Industrial Area'
];

interface SuggestionItem {
  type: 'job' | 'trade' | 'location' | 'view_all';
  label: string;
  sublabel?: string;
  id?: string;
  jobData?: Job;
}

export const HeaderSearchBar: React.FC = () => {
  const { state } = useStore();
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut listener (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute matched items based on current query
  const suggestions = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    
    // Matched Jobs
    const matchingJobs: SuggestionItem[] = state.jobs
      .filter((job) => {
        if (!trimmed) return false;
        return (
          job.title.toLowerCase().includes(trimmed) ||
          job.company.toLowerCase().includes(trimmed) ||
          job.industry.toLowerCase().includes(trimmed) ||
          job.skills?.some((s) => s.toLowerCase().includes(trimmed))
        );
      })
      .slice(0, 4)
      .map((job) => ({
        type: 'job',
        label: job.title,
        sublabel: `${job.company} • ${job.location}`,
        id: job.id,
        jobData: job
      }));

    // Matched Trades
    const matchingTrades: SuggestionItem[] = POPULAR_TRADES
      .filter((trade) => !trimmed || trade.toLowerCase().includes(trimmed))
      .slice(0, trimmed ? 3 : 5)
      .map((trade) => ({
        type: 'trade',
        label: trade,
        sublabel: 'ITI Trade / Specialty'
      }));

    // Dynamic Locations: combines default popular MIDC clusters + dynamic locations from posted jobs
    const allLocations = Array.from(
      new Set([
        ...MIDC_LOCATIONS,
        ...state.jobs.map((j) => j.location).filter(Boolean),
        ...state.jobs.map((j) => j.midcZone).filter((z): z is string => Boolean(z))
      ])
    );

    const matchingLocations: SuggestionItem[] = allLocations
      .filter((loc) => trimmed && loc.toLowerCase().includes(trimmed))
      .slice(0, 4)
      .map((loc) => ({
        type: 'location',
        label: loc,
        sublabel: 'Industrial Zone / Location'
      }));

    return {
      jobs: matchingJobs,
      trades: matchingTrades,
      locations: matchingLocations
    };
  }, [query, state.jobs]);

  // Flattened items array for smooth arrow key navigation
  const flatItems = useMemo(() => {
    const items: SuggestionItem[] = [];
    
    if (query.trim()) {
      items.push(...suggestions.jobs);
      items.push(...suggestions.trades);
      items.push(...suggestions.locations);
      items.push({
        type: 'view_all',
        label: `Search all results for "${query.trim()}"`,
        sublabel: 'View matching jobs'
      });
    } else {
      items.push(...suggestions.trades);
    }
    
    return items;
  }, [query, suggestions]);

  // Reset keyboard selection index when flat items change
  useEffect(() => {
    setSelectedIndex(-1);
  }, [query]);

  const handleSelect = (item: SuggestionItem) => {
    setIsOpen(false);
    setQuery('');
    
    if (item.type === 'job' && item.id) {
      navigate(`/job/${item.id}`);
    } else if (item.type === 'trade') {
      navigate(`/jobs?keyword=${encodeURIComponent(item.label)}`);
    } else if (item.type === 'location') {
      navigate(`/jobs?location=${encodeURIComponent(item.label)}`);
    } else {
      navigate(`/jobs?keyword=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIndex >= 0 && selectedIndex < flatItems.length) {
      handleSelect(flatItems[selectedIndex]);
    } else if (query.trim()) {
      setIsOpen(false);
      navigate(`/jobs?keyword=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown') {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < flatItems.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : flatItems.length - 1));
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className="header-search-container" ref={containerRef}>
      <form className="header-search-form" onSubmit={handleSubmit}>
        <div className="header-search-input-wrapper">
          <svg className="header-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            className="header-search-input"
            placeholder="Search jobs, trades, companies..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
          />
          {query ? (
            <button
              type="button"
              className="header-search-clear"
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              title="Clear search"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          ) : (
            <kbd className="header-search-kbd">⌘K</kbd>
          )}
        </div>
      </form>

      {/* Autocomplete Suggestions Dropdown */}
      {isOpen && (
        <div className="header-search-dropdown">
          {query.trim() === '' ? (
            // Empty query: Show popular trade tags & quick filters
            <div className="dropdown-section">
              <div className="dropdown-section-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                POPULAR ITI TRADES
              </div>
              <div className="popular-trades-grid">
                {suggestions.trades.map((item, idx) => {
                  const isSelected = selectedIndex === idx;
                  return (
                    <div
                      key={item.label}
                      className={`trade-chip ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleSelect(item)}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
                        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                      </svg>
                      <span>{item.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            // Search query present
            <>
              {/* Jobs section */}
              {suggestions.jobs.length > 0 && (
                <div className="dropdown-section">
                  <div className="dropdown-section-title">MATCHING JOBS</div>
                  {suggestions.jobs.map((item) => {
                    const itemFlatIndex = flatItems.findIndex((fi) => fi === item);
                    const isSelected = selectedIndex === itemFlatIndex;
                    return (
                      <div
                        key={`job-${item.id}`}
                        className={`suggestion-item ${isSelected ? 'selected' : ''}`}
                        onClick={() => handleSelect(item)}
                      >
                        <div className="item-icon job-icon">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                            <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                          </svg>
                        </div>
                        <div className="item-content">
                          <div className="item-title">{item.label}</div>
                          <div className="item-subtitle">{item.sublabel}</div>
                        </div>
                        {item.jobData && (
                          <div className="item-badge">
                            ₹{Math.round(item.jobData.salaryMin / 1000)}k-₹{Math.round(item.jobData.salaryMax / 1000)}k
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Trades section */}
              {suggestions.trades.length > 0 && (
                <div className="dropdown-section">
                  <div className="dropdown-section-title">TRADES & SPECIALTIES</div>
                  {suggestions.trades.map((item) => {
                    const itemFlatIndex = flatItems.findIndex((fi) => fi === item);
                    const isSelected = selectedIndex === itemFlatIndex;
                    return (
                      <div
                        key={`trade-${item.label}`}
                        className={`suggestion-item ${isSelected ? 'selected' : ''}`}
                        onClick={() => handleSelect(item)}
                      >
                        <div className="item-icon trade-icon">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                          </svg>
                        </div>
                        <div className="item-content">
                          <div className="item-title">{item.label}</div>
                          <div className="item-subtitle">{item.sublabel}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Locations section */}
              {suggestions.locations.length > 0 && (
                <div className="dropdown-section">
                  <div className="dropdown-section-title">INDUSTRIAL ZONES</div>
                  {suggestions.locations.map((item) => {
                    const itemFlatIndex = flatItems.findIndex((fi) => fi === item);
                    const isSelected = selectedIndex === itemFlatIndex;
                    return (
                      <div
                        key={`loc-${item.label}`}
                        className={`suggestion-item ${isSelected ? 'selected' : ''}`}
                        onClick={() => handleSelect(item)}
                      >
                        <div className="item-icon location-icon">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                            <circle cx="12" cy="10" r="3" />
                          </svg>
                        </div>
                        <div className="item-content">
                          <div className="item-title">{item.label}</div>
                          <div className="item-subtitle">{item.sublabel}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* No matches */}
              {suggestions.jobs.length === 0 &&
                suggestions.trades.length === 0 &&
                suggestions.locations.length === 0 && (
                  <div className="dropdown-no-results">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="24" height="24">
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <span>No exact matches for &quot;{query}&quot;</span>
                  </div>
                )}

              {/* View all footer */}
              {flatItems.length > 0 && (
                <div
                  className={`dropdown-footer ${
                    selectedIndex === flatItems.length - 1 ? 'selected' : ''
                  }`}
                  onClick={() =>
                    handleSelect({
                      type: 'view_all',
                      label: query,
                      sublabel: 'View all'
                    })
                  }
                >
                  <span>
                    Search all vacancies for <strong>&quot;{query}&quot;</strong>
                  </span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};
export default HeaderSearchBar;
