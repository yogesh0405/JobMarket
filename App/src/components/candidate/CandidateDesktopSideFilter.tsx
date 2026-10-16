import React, { useState, useMemo } from 'react';
import {
  ChevronUp,
  ChevronDown,
  Search,
  X,
  Check,
  RotateCcw,
} from 'lucide-react';
import {
  LOCATION_FILTER_OPTIONS,
  INDUSTRY_FILTER_OPTIONS,
  TRADE_FILTER_OPTIONS,
  EDUCATION_FILTER_OPTIONS,
  EXPERIENCE_FILTER_OPTIONS,
  AVAILABILITY_FILTER_OPTIONS,
  matchesLocation,
  matchesIndustry,
  matchesTrade,
  matchesEducation,
  matchesExperience,
  matchesAvailability,
} from '../../features/dashboard/DashboardPage';

export interface CandidateDesktopSideFilterProps {
  activeIndustry: string | null;
  activeEducation: string | null;
  activeExp: string | null;
  activeLocation: string | null;
  activeTrade: string | null;
  activeAvailability: string | null;

  onSelectIndustry: (ind: string | null) => void;
  onSelectEducation: (edu: string | null) => void;
  onSelectExp: (exp: string | null) => void;
  onSelectLocation: (loc: string | null) => void;
  onSelectTrade: (trade: string | null) => void;
  onSelectAvailability: (avail: string | null) => void;
  onResetFilters: () => void;

  allCandidates: any[];
  activeFilterCount: number;
}

export const CandidateDesktopSideFilter: React.FC<CandidateDesktopSideFilterProps> = ({
  activeIndustry,
  activeEducation,
  activeExp,
  activeLocation,
  activeTrade,
  activeAvailability,
  onSelectIndustry,
  onSelectEducation,
  onSelectExp,
  onSelectLocation,
  onSelectTrade,
  onSelectAvailability,
  onResetFilters,
  allCandidates,
  activeFilterCount,
}) => {
  // Accordion toggle states
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({
    location: true,
    industry: true,
    trade: true,
    education: true,
    experience: true,
    availability: true,
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

  // 1. Locations with counts
  const availableLocationsWithCounts = useMemo(() => {
    const list = LOCATION_FILTER_OPTIONS.filter((loc) => loc !== 'All Locations');
    return list
      .map((loc) => ({
        loc,
        count: allCandidates.filter((c) => matchesLocation(c, loc)).length,
      }))
      .sort((a, b) => b.count - a.count);
  }, [allCandidates]);

  // 2. Industries with counts
  const availableIndustriesWithCounts = useMemo(() => {
    const list = INDUSTRY_FILTER_OPTIONS.filter((ind) => ind !== 'All Industries');
    return list
      .map((ind) => ({
        ind,
        count: allCandidates.filter((c) => matchesIndustry(c, ind)).length,
      }))
      .sort((a, b) => b.count - a.count);
  }, [allCandidates]);

  // 3. Trades with counts
  const availableTradesWithCounts = useMemo(() => {
    const list = TRADE_FILTER_OPTIONS.filter((trade) => trade !== 'All Trades');
    return list
      .map((trade) => ({
        trade,
        count: allCandidates.filter((c) => matchesTrade(c, trade)).length,
      }))
      .sort((a, b) => b.count - a.count);
  }, [allCandidates]);

  // 4. Education with counts
  const availableEduWithCounts = useMemo(() => {
    const list = EDUCATION_FILTER_OPTIONS.filter((edu) => edu !== 'All Education Levels');
    return list
      .map((edu) => ({
        edu,
        count: allCandidates.filter((c) => matchesEducation(c, edu)).length,
      }))
      .sort((a, b) => b.count - a.count);
  }, [allCandidates]);

  // 5. Experience with counts
  const availableExpWithCounts = useMemo(() => {
    const list = EXPERIENCE_FILTER_OPTIONS.filter((exp) => exp !== 'All Experience');
    return list.map((exp) => ({
      exp,
      count: allCandidates.filter((c) => matchesExperience(c, exp)).length,
    }));
  }, [allCandidates]);

  // 6. Availability with counts
  const availableAvailWithCounts = useMemo(() => {
    const list = AVAILABILITY_FILTER_OPTIONS.filter((avail) => avail !== 'All Availability');
    return list.map((avail) => ({
      avail,
      count: allCandidates.filter((c) => matchesAvailability(c, avail)).length,
    }));
  }, [allCandidates]);

  // Filtered lists by search
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
      className="candidate-desktop-side-filter"
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
        .candidate-desktop-side-filter::-webkit-scrollbar {
          width: 5px;
        }
        .candidate-desktop-side-filter::-webkit-scrollbar-track {
          background: #F8FAFC;
        }
        .candidate-desktop-side-filter::-webkit-scrollbar-thumb {
          background: #CBD5E1;
          border-radius: 4px;
        }
        .candidate-desktop-side-filter::-webkit-scrollbar-thumb:hover {
          background: #94A3B8;
        }
        .candidate-filter-checkbox-row {
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 6px 4px;
          border-radius: 4px;
          cursor: pointer;
          transition: background-color 0.15s ease;
          user-select: none;
        }
        .candidate-filter-checkbox-row:hover {
          background-color: #F8FAFC;
        }
        .candidate-filter-search-input {
          width: 100%;
          height: 36px;
          padding: 0 10px 0 32px;
          border-radius: 20px;
          border: 1px solid #CBD5E1;
          font-size: 13px;
          color: #0F172A;
          background-color: #FFFFFF;
          outline: none;
          box-sizing: border-box;
          transition: border-color 0.15s ease;
        }
        .candidate-filter-search-input:focus {
          border-color: #1764E8;
        }
        .candidate-filter-search-input::placeholder {
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h2
            style={{
              margin: 0,
              fontSize: '17px',
              fontWeight: 800,
              color: '#0F172A',
              letterSpacing: '-0.2px',
            }}
          >
            All Filters
          </h2>
          {activeFilterCount > 0 && (
            <span
              style={{
                backgroundColor: '#1764E8',
                color: '#FFFFFF',
                fontSize: '11px',
                fontWeight: 700,
                padding: '2px 7px',
                borderRadius: '12px',
              }}
            >
              {activeFilterCount}
            </span>
          )}
        </div>

        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={onResetFilters}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#1764E8',
              fontSize: '13px',
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
          <span style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A' }}>Location</span>
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
                className="candidate-filter-search-input"
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
                const isChecked = activeLocation === loc;

                return (
                  <div
                    key={loc}
                    className="candidate-filter-checkbox-row"
                    onClick={() => {
                      onSelectLocation(isChecked ? null : loc);
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
                        fontSize: '13.5px',
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

      {/* 2. Industry Section */}
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
          <span style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A' }}>Industry</span>
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
                className="candidate-filter-search-input"
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
                const isChecked = activeIndustry === ind;

                return (
                  <div
                    key={ind}
                    className="candidate-filter-checkbox-row"
                    onClick={() => {
                      onSelectIndustry(isChecked ? null : ind);
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
                        fontSize: '13.5px',
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

      {/* 3. Trade / Role Section */}
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
          <span style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A' }}>Trade / Role</span>
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
                placeholder="Search Trade"
                value={tradeSearch}
                onChange={(e) => setTradeSearch(e.target.value)}
                className="candidate-filter-search-input"
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
                const isChecked = activeTrade === trade;

                return (
                  <div
                    key={trade}
                    className="candidate-filter-checkbox-row"
                    onClick={() => {
                      onSelectTrade(isChecked ? null : trade);
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
                        fontSize: '13.5px',
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

      {/* 4. Education Section */}
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
          <span style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A' }}>Education</span>
          {openSections.education ? (
            <ChevronUp size={16} color="#64748B" />
          ) : (
            <ChevronDown size={16} color="#64748B" />
          )}
        </div>

        {openSections.education && (
          <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column' }}>
            {displayedEdu.map(({ edu, count }) => {
              const isChecked = activeEducation === edu;

              return (
                <div
                  key={edu}
                  className="candidate-filter-checkbox-row"
                  onClick={() => {
                    onSelectEducation(isChecked ? null : edu);
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
                      fontSize: '13.5px',
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

      {/* 5. Experience Section */}
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
          <span style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A' }}>Experience</span>
          {openSections.experience ? (
            <ChevronUp size={16} color="#64748B" />
          ) : (
            <ChevronDown size={16} color="#64748B" />
          )}
        </div>

        {openSections.experience && (
          <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column' }}>
            {availableExpWithCounts.map(({ exp, count }) => {
              const isChecked = activeExp === exp;

              return (
                <div
                  key={exp}
                  className="candidate-filter-checkbox-row"
                  onClick={() => {
                    onSelectExp(isChecked ? null : exp);
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
                      fontSize: '13.5px',
                      color: isChecked ? '#0F172A' : '#334155',
                      fontWeight: isChecked ? 600 : 400,
                      lineHeight: '18px',
                      flex: 1,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
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

      {/* 6. Availability Section */}
      <div>
        <div
          onClick={() => toggleSection('availability')}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            userSelect: 'none',
            padding: '2px 0',
          }}
        >
          <span style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A' }}>Availability</span>
          {openSections.availability ? (
            <ChevronUp size={16} color="#64748B" />
          ) : (
            <ChevronDown size={16} color="#64748B" />
          )}
        </div>

        {openSections.availability && (
          <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column' }}>
            {availableAvailWithCounts.map(({ avail, count }) => {
              const isChecked = activeAvailability === avail;

              return (
                <div
                  key={avail}
                  className="candidate-filter-checkbox-row"
                  onClick={() => {
                    onSelectAvailability(isChecked ? null : avail);
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
                      fontSize: '13.5px',
                      color: isChecked ? '#0F172A' : '#334155',
                      fontWeight: isChecked ? 600 : 400,
                      lineHeight: '18px',
                      flex: 1,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {avail}{' '}
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
    </aside>
  );
};
