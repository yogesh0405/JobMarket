import React, { useState, useMemo } from 'react';
import {
  ChevronUp,
  ChevronDown,
  Search,
  X,
  Check,
  RotateCcw,
} from 'lucide-react';
import { JobFilterValues } from './JobFilterModal';
import { Job } from '../../types';
import { matchesJobFilter } from '../../features/jobs/JobSearchPage';

interface JobDesktopSideFilterProps {
  currentFilters: JobFilterValues;
  onApplyFilters: (filters: JobFilterValues) => void;
  onResetFilters: () => void;
  allJobs: Job[];
  activeFilterCount: number;
}

export const JobDesktopSideFilter: React.FC<JobDesktopSideFilterProps> = ({
  currentFilters,
  onApplyFilters,
  onResetFilters,
  allJobs,
  activeFilterCount,
}) => {
  // Accordion toggle states
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({
    location: true,
    industry: true,
    trade: true,
    education: true,
    jobType: true,
    workMode: true,
    experience: true,
    perks: true,
  });

  // Show more states
  const [showMoreLocation, setShowMoreLocation] = useState(false);
  const [showMoreIndustry, setShowMoreIndustry] = useState(false);
  const [showMoreTrade, setShowMoreTrade] = useState(false);
  const [showMoreEdu, setShowMoreEdu] = useState(false);

  // Search terms within sections
  const [locationSearch, setLocationSearch] = useState('');
  const [industrySearch, setIndustrySearch] = useState('');
  const [tradeSearch, setTradeSearch] = useState('');

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // 1. Real Locations with counts from allJobs
  const availableLocationsWithCounts = useMemo(() => {
    const locCandidates = [
      'Waluj MIDC',
      'Chikalthana MIDC',
      'Shendra MIDC',
      'Railway Station MIDC',
      'Chhatrapati Sambhajinagar',
      'Jalna Road',
      'Pune',
    ];

    return locCandidates
      .map((loc) => ({
        loc,
        count: allJobs.filter((j) => matchesJobFilter(j, { midcZone: loc })).length,
      }))
      .filter((item) => item.count > 0)
      .sort((a, b) => b.count - a.count);
  }, [allJobs]);

  // 2. Real Industries with counts from allJobs
  const availableIndustriesWithCounts = useMemo(() => {
    const indSet = new Set<string>();
    allJobs.forEach((j) => {
      const ind = (j.industry || (j as any).industryType)?.trim();
      if (ind) indSet.add(ind);
    });

    return Array.from(indSet)
      .map((ind) => ({
        ind,
        count: allJobs.filter((j) => matchesJobFilter(j, { industry: ind })).length,
      }))
      .filter((item) => item.count > 0)
      .sort((a, b) => b.count - a.count);
  }, [allJobs]);

  // 3. Real Trades / Roles with counts from allJobs
  const availableTradesWithCounts = useMemo(() => {
    const tradeSet = new Set<string>();
    allJobs.forEach((j) => {
      const t = (j.trade || j.title)?.trim();
      if (t) tradeSet.add(t);
    });

    return Array.from(tradeSet)
      .map((trade) => ({
        trade,
        count: allJobs.filter((j) => matchesJobFilter(j, { trade })).length,
      }))
      .filter((item) => item.count > 0)
      .sort((a, b) => b.count - a.count);
  }, [allJobs]);

  // 4. Real Education with counts from allJobs
  const availableEduWithCounts = useMemo(() => {
    const eduCandidates = [
      'Doctorate / PhD',
      'Post Graduate / ME / M.Tech / MBA',
      'BE / B.Tech Graduate',
      'Diploma in Engineering',
      'ITI Certified',
      '12th / HSC Pass',
      '10th / SSC Pass',
    ];

    return eduCandidates
      .map((edu) => ({
        edu,
        count: allJobs.filter((j) => matchesJobFilter(j, { education: edu })).length,
      }))
      .filter((item) => item.count > 0)
      .sort((a, b) => b.count - a.count);
  }, [allJobs]);

  // 5. Real Job Types with counts from allJobs
  const availableJobTypesWithCounts = useMemo(() => {
    const candidates = ['Full-time', 'Part-time', 'Contract', 'Apprenticeship', 'Internship'];
    return candidates
      .map((type) => ({
        type,
        count: allJobs.filter((j) => matchesJobFilter(j, { jobType: type })).length,
      }))
      .filter((item) => item.count > 0);
  }, [allJobs]);

  // 6. Real Work Modes with counts from allJobs
  const availableWorkModesWithCounts = useMemo(() => {
    const candidates = ['On-site', 'Hybrid', 'Remote'];
    return candidates
      .map((mode) => ({
        mode,
        count: allJobs.filter((j) => matchesJobFilter(j, { workMode: mode })).length,
      }))
      .filter((item) => item.count > 0);
  }, [allJobs]);

  // 7. Real Experience Ranges with counts from allJobs
  const availableExperiencesWithCounts = useMemo(() => {
    const candidates = ['Fresher (0 Years)', '1–3 Years', '3–5 Years', '5+ Years'];
    return candidates
      .map((exp) => ({
        exp,
        count: allJobs.filter((j) => matchesJobFilter(j, { minExperience: exp })).length,
      }))
      .filter((item) => item.count > 0);
  }, [allJobs]);

  // 8. Real Perks with counts from allJobs
  const busCount = useMemo(() => allJobs.filter((j) => matchesJobFilter(j, { busFacility: true })).length, [allJobs]);
  const canteenCount = useMemo(() => allJobs.filter((j) => matchesJobFilter(j, { canteen: true })).length, [allJobs]);
  const hostelCount = useMemo(() => allJobs.filter((j) => matchesJobFilter(j, { accommodation: true })).length, [allJobs]);
  const otCount = useMemo(() => allJobs.filter((j) => matchesJobFilter(j, { overtime: true })).length, [allJobs]);

  // Filtered lists via search
  const filteredLocations = useMemo(() => {
    if (!locationSearch.trim()) return availableLocationsWithCounts;
    return availableLocationsWithCounts.filter((item) =>
      item.loc.toLowerCase().includes(locationSearch.toLowerCase())
    );
  }, [availableLocationsWithCounts, locationSearch]);

  const displayedLocations = showMoreLocation ? filteredLocations : filteredLocations.slice(0, 5);

  const filteredIndustries = useMemo(() => {
    if (!industrySearch.trim()) return availableIndustriesWithCounts;
    return availableIndustriesWithCounts.filter((item) =>
      item.ind.toLowerCase().includes(industrySearch.toLowerCase())
    );
  }, [availableIndustriesWithCounts, industrySearch]);

  const displayedIndustries = showMoreIndustry ? filteredIndustries : filteredIndustries.slice(0, 5);

  const filteredTrades = useMemo(() => {
    if (!tradeSearch.trim()) return availableTradesWithCounts;
    return availableTradesWithCounts.filter((item) =>
      item.trade.toLowerCase().includes(tradeSearch.toLowerCase())
    );
  }, [availableTradesWithCounts, tradeSearch]);

  const displayedTrades = showMoreTrade ? filteredTrades : filteredTrades.slice(0, 5);

  const displayedEdu = showMoreEdu ? availableEduWithCounts : availableEduWithCounts.slice(0, 5);

  return (
    <aside
      className="desktop-side-filter"
      style={{
        width: '280px',
        flexShrink: 0,
        backgroundColor: '#FFFFFF',
        border: '1px solid #CBD5E1',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.05)',
        padding: '18px 16px',
        boxSizing: 'border-box',
        position: 'sticky',
        top: '80px',
        maxHeight: 'calc(100vh - 100px)',
        overflowY: 'auto',
        overflowX: 'hidden',
      }}
    >
      <style>{`
        .desktop-side-filter::-webkit-scrollbar {
          width: 5px;
        }
        .desktop-side-filter::-webkit-scrollbar-track {
          background: #F8FAFC;
        }
        .desktop-side-filter::-webkit-scrollbar-thumb {
          background: #CBD5E1;
          border-radius: 4px;
        }
        .desktop-side-filter::-webkit-scrollbar-thumb:hover {
          background: #94A3B8;
        }
        .filter-checkbox-row {
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 6px 4px;
          border-radius: 4px;
          cursor: pointer;
          transition: background-color 0.15s ease;
          user-select: none;
        }
        .filter-checkbox-row:hover {
          background-color: #F8FAFC;
        }
        .filter-search-input {
          width: 100%;
          height: 34px;
          padding: 0 10px 0 32px;
          border-radius: 20px;
          border: 1px solid #CBD5E1;
          font-size: 12px;
          color: #0F172A;
          background-color: #FFFFFF;
          outline: none;
          box-sizing: border-box;
          transition: border-color 0.15s ease;
        }
        .filter-search-input:focus {
          border-color: #1764E8;
        }
        .filter-search-input::placeholder {
          color: #94A3B8;
        }
      `}</style>

      {/* Header: All Filters & Clear All */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingBottom: '14px',
          borderBottom: '1px solid #E2E8F0',
          marginBottom: '14px',
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: '16px',
            fontWeight: 800,
            color: '#0F172A',
            letterSpacing: '-0.2px',
          }}
        >
          All Filters
        </h2>

        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={onResetFilters}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#1764E8',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <RotateCcw size={12} />
            Clear All
          </button>
        )}
      </div>

      {/* 1. Location / MIDC Zone Section */}
      {availableLocationsWithCounts.length > 0 && (
        <div style={{ borderBottom: '1px solid #F1F5F9', paddingBottom: '14px', marginBottom: '14px' }}>
          <div
            onClick={() => toggleSection('location')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              userSelect: 'none',
              padding: '2px 0',
            }}
          >
            <span style={{ fontSize: '13.5px', fontWeight: 700, color: '#0F172A' }}>Location</span>
            {openSections.location ? (
              <ChevronUp size={16} color="#64748B" />
            ) : (
              <ChevronDown size={16} color="#64748B" />
            )}
          </div>

          {openSections.location && (
            <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ position: 'relative', width: '100%' }}>
                <Search
                  size={14}
                  color="#64748B"
                  style={{ position: 'absolute', left: '11px', top: '10px' }}
                />
                <input
                  type="text"
                  placeholder="Search Location"
                  value={locationSearch}
                  onChange={(e) => setLocationSearch(e.target.value)}
                  className="filter-search-input"
                />
                {locationSearch && (
                  <button
                    type="button"
                    onClick={() => setLocationSearch('')}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '9px',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    <X size={14} color="#64748B" />
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {displayedLocations.map(({ loc, count }) => {
                  const isChecked = currentFilters.midcZone === loc;

                  return (
                    <div
                      key={loc}
                      className="filter-checkbox-row"
                      onClick={() => {
                        onApplyFilters({
                          ...currentFilters,
                          midcZone: isChecked ? 'All Locations' : loc,
                        });
                      }}
                    >
                      <div
                        style={{
                          width: '16px',
                          height: '16px',
                          borderRadius: '3px',
                          border: isChecked ? '1.5px solid #1764E8' : '1.5px solid #94A3B8',
                          backgroundColor: isChecked ? '#1764E8' : '#FFFFFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {isChecked && <Check size={12} color="#FFFFFF" strokeWidth={3} />}
                      </div>

                      <span
                        style={{
                          fontSize: '13px',
                          color: isChecked ? '#0F172A' : '#334155',
                          fontWeight: isChecked ? 600 : 400,
                          lineHeight: '18px',
                          flex: 1,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {loc}{' '}
                        <span style={{ color: '#64748B', fontWeight: 500, fontSize: '12px' }}>
                          ({count})
                        </span>
                      </span>
                    </div>
                  );
                })}

                {filteredLocations.length > 5 && (
                  <button
                    type="button"
                    onClick={() => setShowMoreLocation(!showMoreLocation)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#1764E8',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      textAlign: 'left',
                      padding: '6px 4px 2px 4px',
                    }}
                  >
                    {showMoreLocation ? 'Show less' : `+${filteredLocations.length - 5} more`}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. Industry Section */}
      {availableIndustriesWithCounts.length > 0 && (
        <div style={{ borderBottom: '1px solid #F1F5F9', paddingBottom: '14px', marginBottom: '14px' }}>
          <div
            onClick={() => toggleSection('industry')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              userSelect: 'none',
              padding: '2px 0',
            }}
          >
            <span style={{ fontSize: '13.5px', fontWeight: 700, color: '#0F172A' }}>Industry</span>
            {openSections.industry ? (
              <ChevronUp size={16} color="#64748B" />
            ) : (
              <ChevronDown size={16} color="#64748B" />
            )}
          </div>

          {openSections.industry && (
            <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ position: 'relative', width: '100%' }}>
                <Search
                  size={14}
                  color="#64748B"
                  style={{ position: 'absolute', left: '11px', top: '10px' }}
                />
                <input
                  type="text"
                  placeholder="Search Industry"
                  value={industrySearch}
                  onChange={(e) => setIndustrySearch(e.target.value)}
                  className="filter-search-input"
                />
                {industrySearch && (
                  <button
                    type="button"
                    onClick={() => setIndustrySearch('')}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '9px',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    <X size={14} color="#64748B" />
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {displayedIndustries.map(({ ind, count }) => {
                  const isChecked = currentFilters.industry === ind;

                  return (
                    <div
                      key={ind}
                      className="filter-checkbox-row"
                      onClick={() => {
                        onApplyFilters({
                          ...currentFilters,
                          industry: isChecked ? 'All Industries' : ind,
                        });
                      }}
                    >
                      <div
                        style={{
                          width: '16px',
                          height: '16px',
                          borderRadius: '3px',
                          border: isChecked ? '1.5px solid #1764E8' : '1.5px solid #94A3B8',
                          backgroundColor: isChecked ? '#1764E8' : '#FFFFFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {isChecked && <Check size={12} color="#FFFFFF" strokeWidth={3} />}
                      </div>

                      <span
                        style={{
                          fontSize: '13px',
                          color: isChecked ? '#0F172A' : '#334155',
                          fontWeight: isChecked ? 600 : 400,
                          lineHeight: '18px',
                          flex: 1,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {ind}{' '}
                        <span style={{ color: '#64748B', fontWeight: 500, fontSize: '12px' }}>
                          ({count})
                        </span>
                      </span>
                    </div>
                  );
                })}

                {filteredIndustries.length > 5 && (
                  <button
                    type="button"
                    onClick={() => setShowMoreIndustry(!showMoreIndustry)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#1764E8',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      textAlign: 'left',
                      padding: '6px 4px 2px 4px',
                    }}
                  >
                    {showMoreIndustry ? 'Show less' : `+${filteredIndustries.length - 5} more`}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. Trade / Role Section */}
      {availableTradesWithCounts.length > 0 && (
        <div style={{ borderBottom: '1px solid #F1F5F9', paddingBottom: '14px', marginBottom: '14px' }}>
          <div
            onClick={() => toggleSection('trade')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              userSelect: 'none',
              padding: '2px 0',
            }}
          >
            <span style={{ fontSize: '13.5px', fontWeight: 700, color: '#0F172A' }}>Trade / Role</span>
            {openSections.trade ? (
              <ChevronUp size={16} color="#64748B" />
            ) : (
              <ChevronDown size={16} color="#64748B" />
            )}
          </div>

          {openSections.trade && (
            <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ position: 'relative', width: '100%' }}>
                <Search
                  size={14}
                  color="#64748B"
                  style={{ position: 'absolute', left: '11px', top: '10px' }}
                />
                <input
                  type="text"
                  placeholder="Search Trade / Role"
                  value={tradeSearch}
                  onChange={(e) => setTradeSearch(e.target.value)}
                  className="filter-search-input"
                />
                {tradeSearch && (
                  <button
                    type="button"
                    onClick={() => setTradeSearch('')}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '9px',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    <X size={14} color="#64748B" />
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {displayedTrades.map(({ trade, count }) => {
                  const isChecked = currentFilters.trade === trade;

                  return (
                    <div
                      key={trade}
                      className="filter-checkbox-row"
                      onClick={() => {
                        onApplyFilters({
                          ...currentFilters,
                          trade: isChecked ? 'All Trades' : trade,
                        });
                      }}
                    >
                      <div
                        style={{
                          width: '16px',
                          height: '16px',
                          borderRadius: '3px',
                          border: isChecked ? '1.5px solid #1764E8' : '1.5px solid #94A3B8',
                          backgroundColor: isChecked ? '#1764E8' : '#FFFFFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {isChecked && <Check size={12} color="#FFFFFF" strokeWidth={3} />}
                      </div>

                      <span
                        style={{
                          fontSize: '13px',
                          color: isChecked ? '#0F172A' : '#334155',
                          fontWeight: isChecked ? 600 : 400,
                          lineHeight: '18px',
                          flex: 1,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {trade}{' '}
                        <span style={{ color: '#64748B', fontWeight: 500, fontSize: '12px' }}>
                          ({count})
                        </span>
                      </span>
                    </div>
                  );
                })}

                {filteredTrades.length > 5 && (
                  <button
                    type="button"
                    onClick={() => setShowMoreTrade(!showMoreTrade)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#1764E8',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      textAlign: 'left',
                      padding: '6px 4px 2px 4px',
                    }}
                  >
                    {showMoreTrade ? 'Show less' : `+${filteredTrades.length - 5} more`}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. Education Level Section */}
      {availableEduWithCounts.length > 0 && (
        <div style={{ borderBottom: '1px solid #F1F5F9', paddingBottom: '14px', marginBottom: '14px' }}>
          <div
            onClick={() => toggleSection('education')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              userSelect: 'none',
              padding: '2px 0',
            }}
          >
            <span style={{ fontSize: '13.5px', fontWeight: 700, color: '#0F172A' }}>Education</span>
            {openSections.education ? (
              <ChevronUp size={16} color="#64748B" />
            ) : (
              <ChevronDown size={16} color="#64748B" />
            )}
          </div>

          {openSections.education && (
            <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column' }}>
              {displayedEdu.map(({ edu, count }) => {
                const isChecked = currentFilters.education === edu;

                return (
                  <div
                    key={edu}
                    className="filter-checkbox-row"
                    onClick={() => {
                      onApplyFilters({
                        ...currentFilters,
                        education: isChecked ? 'All Education Levels' : edu,
                      });
                    }}
                  >
                    <div
                      style={{
                        width: '16px',
                        height: '16px',
                        borderRadius: '3px',
                        border: isChecked ? '1.5px solid #1764E8' : '1.5px solid #94A3B8',
                        backgroundColor: isChecked ? '#1764E8' : '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {isChecked && <Check size={12} color="#FFFFFF" strokeWidth={3} />}
                    </div>

                    <span
                      style={{
                        fontSize: '13px',
                        color: isChecked ? '#0F172A' : '#334155',
                        fontWeight: isChecked ? 600 : 400,
                        lineHeight: '18px',
                        flex: 1,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {edu}{' '}
                      <span style={{ color: '#64748B', fontWeight: 500, fontSize: '12px' }}>
                        ({count})
                      </span>
                    </span>
                  </div>
                );
              })}

              {availableEduWithCounts.length > 5 && (
                <button
                  type="button"
                  onClick={() => setShowMoreEdu(!showMoreEdu)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#1764E8',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    textAlign: 'left',
                    padding: '6px 4px 2px 4px',
                  }}
                >
                  {showMoreEdu ? 'Show less' : `+${availableEduWithCounts.length - 5} more`}
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* 5. Job Type Section */}
      {availableJobTypesWithCounts.length > 0 && (
        <div style={{ borderBottom: '1px solid #F1F5F9', paddingBottom: '14px', marginBottom: '14px' }}>
          <div
            onClick={() => toggleSection('jobType')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              userSelect: 'none',
              padding: '2px 0',
            }}
          >
            <span style={{ fontSize: '13.5px', fontWeight: 700, color: '#0F172A' }}>Job type</span>
            {openSections.jobType ? (
              <ChevronUp size={16} color="#64748B" />
            ) : (
              <ChevronDown size={16} color="#64748B" />
            )}
          </div>

          {openSections.jobType && (
            <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column' }}>
              {availableJobTypesWithCounts.map(({ type, count }) => {
                const isChecked = currentFilters.jobType === type;

                return (
                  <div
                    key={type}
                    className="filter-checkbox-row"
                    onClick={() => {
                      onApplyFilters({
                        ...currentFilters,
                        jobType: isChecked ? 'All Types' : type,
                      });
                    }}
                  >
                    <div
                      style={{
                        width: '16px',
                        height: '16px',
                        borderRadius: '3px',
                        border: isChecked ? '1.5px solid #1764E8' : '1.5px solid #94A3B8',
                        backgroundColor: isChecked ? '#1764E8' : '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {isChecked && <Check size={12} color="#FFFFFF" strokeWidth={3} />}
                    </div>

                    <span
                      style={{
                        fontSize: '13px',
                        color: isChecked ? '#0F172A' : '#334155',
                        fontWeight: isChecked ? 600 : 400,
                        lineHeight: '18px',
                        flex: 1,
                      }}
                    >
                      {type}{' '}
                      <span style={{ color: '#64748B', fontWeight: 500, fontSize: '12px' }}>
                        ({count})
                      </span>
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 6. Work Mode Section */}
      {availableWorkModesWithCounts.length > 0 && (
        <div style={{ borderBottom: '1px solid #F1F5F9', paddingBottom: '14px', marginBottom: '14px' }}>
          <div
            onClick={() => toggleSection('workMode')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              userSelect: 'none',
              padding: '2px 0',
            }}
          >
            <span style={{ fontSize: '13.5px', fontWeight: 700, color: '#0F172A' }}>Work mode</span>
            {openSections.workMode ? (
              <ChevronUp size={16} color="#64748B" />
            ) : (
              <ChevronDown size={16} color="#64748B" />
            )}
          </div>

          {openSections.workMode && (
            <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column' }}>
              {availableWorkModesWithCounts.map(({ mode, count }) => {
                const isChecked = currentFilters.workMode === mode;

                return (
                  <div
                    key={mode}
                    className="filter-checkbox-row"
                    onClick={() => {
                      onApplyFilters({
                        ...currentFilters,
                        workMode: isChecked ? 'All Modes' : mode,
                      });
                    }}
                  >
                    <div
                      style={{
                        width: '16px',
                        height: '16px',
                        borderRadius: '3px',
                        border: isChecked ? '1.5px solid #1764E8' : '1.5px solid #94A3B8',
                        backgroundColor: isChecked ? '#1764E8' : '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {isChecked && <Check size={12} color="#FFFFFF" strokeWidth={3} />}
                    </div>

                    <span
                      style={{
                        fontSize: '13px',
                        color: isChecked ? '#0F172A' : '#334155',
                        fontWeight: isChecked ? 600 : 400,
                        lineHeight: '18px',
                        flex: 1,
                      }}
                    >
                      {mode}{' '}
                      <span style={{ color: '#64748B', fontWeight: 500, fontSize: '12px' }}>
                        ({count})
                      </span>
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 7. Experience Section */}
      {availableExperiencesWithCounts.length > 0 && (
        <div style={{ borderBottom: '1px solid #F1F5F9', paddingBottom: '14px', marginBottom: '14px' }}>
          <div
            onClick={() => toggleSection('experience')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              userSelect: 'none',
              padding: '2px 0',
            }}
          >
            <span style={{ fontSize: '13.5px', fontWeight: 700, color: '#0F172A' }}>Experience</span>
            {openSections.experience ? (
              <ChevronUp size={16} color="#64748B" />
            ) : (
              <ChevronDown size={16} color="#64748B" />
            )}
          </div>

          {openSections.experience && (
            <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column' }}>
              {availableExperiencesWithCounts.map(({ exp, count }) => {
                const isChecked = currentFilters.minExperience === exp;

                return (
                  <div
                    key={exp}
                    className="filter-checkbox-row"
                    onClick={() => {
                      onApplyFilters({
                        ...currentFilters,
                        minExperience: isChecked ? 'All Experience' : exp,
                      });
                    }}
                  >
                    <div
                      style={{
                        width: '16px',
                        height: '16px',
                        borderRadius: '3px',
                        border: isChecked ? '1.5px solid #1764E8' : '1.5px solid #94A3B8',
                        backgroundColor: isChecked ? '#1764E8' : '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {isChecked && <Check size={12} color="#FFFFFF" strokeWidth={3} />}
                    </div>

                    <span
                      style={{
                        fontSize: '13px',
                        color: isChecked ? '#0F172A' : '#334155',
                        fontWeight: isChecked ? 600 : 400,
                        lineHeight: '18px',
                        flex: 1,
                      }}
                    >
                      {exp}{' '}
                      <span style={{ color: '#64748B', fontWeight: 500, fontSize: '12px' }}>
                        ({count})
                      </span>
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 8. Perks & Benefits Section */}
      <div style={{ paddingBottom: '6px' }}>
        <div
          onClick={() => toggleSection('perks')}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            userSelect: 'none',
            padding: '2px 0',
          }}
        >
          <span style={{ fontSize: '13.5px', fontWeight: 700, color: '#0F172A' }}>Perks & Facilities</span>
          {openSections.perks ? (
            <ChevronUp size={16} color="#64748B" />
          ) : (
            <ChevronDown size={16} color="#64748B" />
          )}
        </div>

        {openSections.perks && (
          <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column' }}>
            <div
              className="filter-checkbox-row"
              onClick={() => {
                onApplyFilters({
                  ...currentFilters,
                  busFacility: !currentFilters.busFacility,
                });
              }}
            >
              <div
                style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '3px',
                  border: currentFilters.busFacility ? '1.5px solid #1764E8' : '1.5px solid #94A3B8',
                  backgroundColor: currentFilters.busFacility ? '#1764E8' : '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {currentFilters.busFacility && <Check size={12} color="#FFFFFF" strokeWidth={3} />}
              </div>
              <span style={{ fontSize: '13px', color: '#334155', flex: 1 }}>
                Bus / Transport ({busCount})
              </span>
            </div>

            <div
              className="filter-checkbox-row"
              onClick={() => {
                onApplyFilters({
                  ...currentFilters,
                  canteen: !currentFilters.canteen,
                });
              }}
            >
              <div
                style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '3px',
                  border: currentFilters.canteen ? '1.5px solid #1764E8' : '1.5px solid #94A3B8',
                  backgroundColor: currentFilters.canteen ? '#1764E8' : '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {currentFilters.canteen && <Check size={12} color="#FFFFFF" strokeWidth={3} />}
              </div>
              <span style={{ fontSize: '13px', color: '#334155', flex: 1 }}>
                Canteen Facility ({canteenCount})
              </span>
            </div>

            <div
              className="filter-checkbox-row"
              onClick={() => {
                onApplyFilters({
                  ...currentFilters,
                  accommodation: !currentFilters.accommodation,
                });
              }}
            >
              <div
                style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '3px',
                  border: currentFilters.accommodation ? '1.5px solid #1764E8' : '1.5px solid #94A3B8',
                  backgroundColor: currentFilters.accommodation ? '#1764E8' : '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {currentFilters.accommodation && <Check size={12} color="#FFFFFF" strokeWidth={3} />}
              </div>
              <span style={{ fontSize: '13px', color: '#334155', flex: 1 }}>
                Hostel / Accommodation ({hostelCount})
              </span>
            </div>

            <div
              className="filter-checkbox-row"
              onClick={() => {
                onApplyFilters({
                  ...currentFilters,
                  overtime: !currentFilters.overtime,
                });
              }}
            >
              <div
                style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '3px',
                  border: currentFilters.overtime ? '1.5px solid #1764E8' : '1.5px solid #94A3B8',
                  backgroundColor: currentFilters.overtime ? '#1764E8' : '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {currentFilters.overtime && <Check size={12} color="#FFFFFF" strokeWidth={3} />}
              </div>
              <span style={{ fontSize: '13px', color: '#334155', flex: 1 }}>
                Overtime (OT) Option ({otCount})
              </span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
