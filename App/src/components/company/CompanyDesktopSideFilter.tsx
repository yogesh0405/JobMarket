import React, { useState, useMemo } from 'react';
import {
  ChevronUp,
  ChevronDown,
  Search,
  X,
  Check,
  RotateCcw,
} from 'lucide-react';
import { matchesCompanyFilter } from '../../features/company/CompaniesDirectoryPage';

export interface CompanyFilterState {
  midcZone: string;
  industry: string;
  companyType: string;
  companySize: string;
  onlyHiring: boolean;
}

interface CompanyDesktopSideFilterProps {
  filters: CompanyFilterState;
  onFilterChange: (newFilters: CompanyFilterState) => void;
  onReset: () => void;
  companies: any[];
  activeFilterCount: number;
}

export const CompanyDesktopSideFilter: React.FC<CompanyDesktopSideFilterProps> = ({
  filters,
  onFilterChange,
  onReset,
  companies,
  activeFilterCount,
}) => {
  // Accordion toggle states
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({
    companyType: true,
    location: true,
    industry: true,
    companySize: true,
    hiring: true,
  });

  // Show more states
  const [showMoreType, setShowMoreType] = useState(false);
  const [showMoreLocation, setShowMoreLocation] = useState(false);
  const [showMoreIndustry, setShowMoreIndustry] = useState(false);
  const [showMoreSize, setShowMoreSize] = useState(false);

  // Search terms within sections
  const [locationSearch, setLocationSearch] = useState('');
  const [industrySearch, setIndustrySearch] = useState('');
  const [typeSearch, setTypeSearch] = useState('');

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // 1. Dynamic Real Company Types from database
  const availableTypesWithCounts = useMemo(() => {
    const typeSet = new Set<string>();
    companies.forEach((c) => {
      const t = c.company_type || c.companyType;
      if (t && t.trim()) typeSet.add(t.trim());
    });

    const candidates = Array.from(typeSet);
    if (candidates.length === 0) {
      candidates.push('Private Limited', 'LLP');
    }

    return candidates
      .map((type) => ({
        type,
        count: companies.filter((c) => matchesCompanyFilter(c, { companyType: type })).length,
      }))
      .filter((item) => item.count > 0)
      .sort((a, b) => b.count - a.count);
  }, [companies]);

  // 2. Real Locations from database
  const availableLocationsWithCounts = useMemo(() => {
    const locCandidates = [
      'Waluj MIDC',
      'Chikalthana MIDC',
      'Shendra MIDC',
      'Railway Station MIDC',
      'Jalna Road',
      'Chhatrapati Sambhajinagar',
      'Pune',
      'Jalna',
    ];

    return locCandidates
      .map((loc) => ({
        loc,
        count: companies.filter((c) => matchesCompanyFilter(c, { midcZone: loc })).length,
      }))
      .filter((item) => item.count > 0)
      .sort((a, b) => b.count - a.count);
  }, [companies]);

  // 3. Dynamic Real Industries from database
  const availableIndustriesWithCounts = useMemo(() => {
    const indSet = new Set<string>();
    companies.forEach((c) => {
      const ind = c.industry?.trim();
      if (ind) indSet.add(ind);
    });

    return Array.from(indSet)
      .map((ind) => ({
        ind,
        count: companies.filter((c) => matchesCompanyFilter(c, { industry: ind })).length,
      }))
      .filter((item) => item.count > 0)
      .sort((a, b) => b.count - a.count);
  }, [companies]);

  // 4. Dynamic Real Sizes from database
  const availableSizesWithCounts = useMemo(() => {
    const sizeSet = new Set<string>();
    companies.forEach((c) => {
      const s = c.company_size || c.companySize;
      if (s && s.trim()) sizeSet.add(s.trim());
    });

    return Array.from(sizeSet)
      .map((size) => ({
        size,
        count: companies.filter((c) => matchesCompanyFilter(c, { companySize: size })).length,
      }))
      .filter((item) => item.count > 0)
      .sort((a, b) => b.count - a.count);
  }, [companies]);

  // 5. Actively Hiring Real Count
  const hiringCount = useMemo(() => {
    return companies.filter((c) => matchesCompanyFilter(c, { onlyHiring: true })).length;
  }, [companies]);

  // Search filtered lists
  const filteredTypes = useMemo(() => {
    if (!typeSearch.trim()) return availableTypesWithCounts;
    return availableTypesWithCounts.filter((item) =>
      item.type.toLowerCase().includes(typeSearch.toLowerCase())
    );
  }, [availableTypesWithCounts, typeSearch]);

  const displayedTypes = showMoreType ? filteredTypes : filteredTypes.slice(0, 5);

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

  const displayedSizes = showMoreSize ? availableSizesWithCounts : availableSizesWithCounts.slice(0, 5);

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
            onClick={onReset}
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

      {/* 1. Company Type Section */}
      {availableTypesWithCounts.length > 0 && (
        <div style={{ borderBottom: '1px solid #F1F5F9', paddingBottom: '14px', marginBottom: '14px' }}>
          <div
            onClick={() => toggleSection('companyType')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              userSelect: 'none',
              padding: '2px 0',
            }}
          >
            <span style={{ fontSize: '13.5px', fontWeight: 700, color: '#0F172A' }}>Company type</span>
            {openSections.companyType ? (
              <ChevronUp size={16} color="#64748B" />
            ) : (
              <ChevronDown size={16} color="#64748B" />
            )}
          </div>

          {openSections.companyType && (
            <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column' }}>
              {displayedTypes.map(({ type, count }) => {
                const isChecked = filters.companyType === type;

                return (
                  <div
                    key={type}
                    className="filter-checkbox-row"
                    onClick={() => {
                      onFilterChange({
                        ...filters,
                        companyType: isChecked ? 'All Types' : type,
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

              {filteredTypes.length > 5 && (
                <button
                  type="button"
                  onClick={() => setShowMoreType(!showMoreType)}
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
                  {showMoreType ? 'Show less' : `+${filteredTypes.length - 5} more`}
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* 2. Location Section */}
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
              {/* Search Location Input Pill */}
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

              {/* Checkboxes List */}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {displayedLocations.map(({ loc, count }) => {
                  const isChecked = filters.midcZone === loc;

                  return (
                    <div
                      key={loc}
                      className="filter-checkbox-row"
                      onClick={() => {
                        onFilterChange({
                          ...filters,
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

      {/* 3. Industry Section */}
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
                  const isChecked = filters.industry === ind;

                  return (
                    <div
                      key={ind}
                      className="filter-checkbox-row"
                      onClick={() => {
                        onFilterChange({
                          ...filters,
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

      {/* 4. Company Size Section */}
      {availableSizesWithCounts.length > 0 && (
        <div style={{ borderBottom: '1px solid #F1F5F9', paddingBottom: '14px', marginBottom: '14px' }}>
          <div
            onClick={() => toggleSection('companySize')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              userSelect: 'none',
              padding: '2px 0',
            }}
          >
            <span style={{ fontSize: '13.5px', fontWeight: 700, color: '#0F172A' }}>Company size</span>
            {openSections.companySize ? (
              <ChevronUp size={16} color="#64748B" />
            ) : (
              <ChevronDown size={16} color="#64748B" />
            )}
          </div>

          {openSections.companySize && (
            <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column' }}>
              {displayedSizes.map(({ size, count }) => {
                const isChecked = filters.companySize === size;

                return (
                  <div
                    key={size}
                    className="filter-checkbox-row"
                    onClick={() => {
                      onFilterChange({
                        ...filters,
                        companySize: isChecked ? 'All Sizes' : size,
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
                      {size}{' '}
                      <span style={{ color: '#64748B', fontWeight: 500, fontSize: '12px' }}>
                        ({count})
                      </span>
                    </span>
                  </div>
                );
              })}

              {availableSizesWithCounts.length > 5 && (
                <button
                  type="button"
                  onClick={() => setShowMoreSize(!showMoreSize)}
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
                  {showMoreSize ? 'Show less' : `+${availableSizesWithCounts.length - 5} more`}
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* 5. Actively Hiring Section */}
      <div style={{ paddingBottom: '6px' }}>
        <div
          className="filter-checkbox-row"
          onClick={() => {
            onFilterChange({
              ...filters,
              onlyHiring: !filters.onlyHiring,
            });
          }}
          style={{ padding: '4px 0' }}
        >
          <div
            style={{
              width: '16px',
              height: '16px',
              borderRadius: '3px',
              border: filters.onlyHiring ? '1.5px solid #1764E8' : '1.5px solid #94A3B8',
              backgroundColor: filters.onlyHiring ? '#1764E8' : '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              transition: 'all 0.15s ease',
            }}
          >
            {filters.onlyHiring && <Check size={12} color="#FFFFFF" strokeWidth={3} />}
          </div>

          <span
            style={{
              fontSize: '13px',
              color: filters.onlyHiring ? '#0F172A' : '#334155',
              fontWeight: filters.onlyHiring ? 700 : 500,
              lineHeight: '18px',
              flex: 1,
            }}
          >
            Actively Hiring Only{' '}
            <span style={{ color: '#1764E8', fontWeight: 700, fontSize: '12px' }}>
              ({hiringCount})
            </span>
          </span>
        </div>
      </div>
    </aside>
  );
};
