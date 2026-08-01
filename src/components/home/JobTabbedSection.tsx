import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Job } from '../../types';
import { JobCard } from '../job/JobCard';
import { getStoredRoleTabSettings, RoleTabSetting } from '../../modules/admin/utils/roleTabSettings';

import { apiFetch, safeParseJson } from '../../utils/api';

interface JobTabbedSectionProps {
  jobs: Job[];
}

interface DynamicCategory {
  id: string;
  label: string;
  count: number;
  priority: number;
  targetUrl: string;
  filterFn: (job: Job) => boolean;
}

export const JobTabbedSection: React.FC<JobTabbedSectionProps> = ({ jobs }) => {
  const navigate = useNavigate();
  const [activeTabId, setActiveTabId] = useState<string>('all');
  const scrollRowRef = useRef<HTMLDivElement>(null);
  const [tabSettings, setTabSettings] = useState<RoleTabSetting[]>([]);

  // Load and listen for real-time Admin Role Tab Settings from DB & LocalStorage
  useEffect(() => {
    const loadSettings = () => {
      setTabSettings(getStoredRoleTabSettings());

      // Sync from Database API (Public Settings Endpoint)
      apiFetch('/api/v1/settings')
        .then(res => safeParseJson(res))
        .then(({ ok, data: json }) => {
          if (ok && json.success && json.data && json.data.role_tabs_config) {
            try {
              const parsed = JSON.parse(json.data.role_tabs_config);
              if (Array.isArray(parsed) && parsed.length > 0) {
                setTabSettings(parsed);
                localStorage.setItem('jobmarket_role_tab_settings', JSON.stringify(parsed));
              }
            } catch (e) {
              console.error('Error parsing backend role_tabs_config:', e);
            }
          }
        })
        .catch(err => console.error('Error fetching settings in JobTabbedSection:', err));
    };
    loadSettings();
    window.addEventListener('roleTabSettingsUpdated', loadSettings);
    window.addEventListener('storage', loadSettings);
    return () => {
      window.removeEventListener('roleTabSettingsUpdated', loadSettings);
      window.removeEventListener('storage', loadSettings);
    };
  }, []);

  // Active jobs in DB
  const activeJobs = useMemo(() => {
    return jobs.filter(j => j.status === 'active' || !j.status);
  }, [jobs]);

  // Dynamically extract and order categories strictly according to Admin Tab Settings!
  const categories: DynamicCategory[] = useMemo(() => {
    // Effective settings: Admin settings from DB/LocalStorage OR Defaults
    const effectiveSettings = (tabSettings && tabSettings.length > 0) 
      ? tabSettings 
      : getStoredRoleTabSettings();

    // Sort settings by priority (1, 2, 3...)
    const sortedSettings = [...effectiveSettings].sort((a, b) => a.priority - b.priority);

    const result: DynamicCategory[] = [];
    const processedIds = new Set<string>();

    // 1. Process configured tabs in exact Admin Priority Order
    sortedSettings.forEach(setting => {
      // If disabled by Admin, skip it completely!
      if (!setting.enabled) {
        processedIds.add(setting.id.toLowerCase());
        processedIds.add(setting.label.toLowerCase());
        return;
      }

      processedIds.add(setting.id.toLowerCase());
      processedIds.add(setting.label.toLowerCase());

      const labelClean = setting.label.trim();
      const idClean = setting.id.trim();

      let filterFn: (job: Job) => boolean;

      if (idClean === 'all') {
        filterFn = (j: Job) => j.status === 'active' || !j.status;
      } else {
        filterFn = (j: Job) => {
          const t = (j.trade || '').trim().toLowerCase();
          const ind = (j.industry || '').trim().toLowerCase();
          const title = (j.title || '').toLowerCase();
          const needleId = idClean.toLowerCase();
          const needleLabel = labelClean.toLowerCase();

          return t === needleId || t === needleLabel || 
                 ind === needleId || ind === needleLabel || 
                 t.includes(needleId) || t.includes(needleLabel) ||
                 title.includes(needleId) || title.includes(needleLabel);
        };
      }

      const matchingCount = activeJobs.filter(filterFn).length;

      result.push({
        id: setting.id,
        label: setting.label,
        count: matchingCount,
        priority: setting.priority,
        targetUrl: setting.id === 'all' ? '/jobs' : `/jobs?keyword=${encodeURIComponent(setting.label)}`,
        filterFn
      });
    });

    // 2. Discover any additional active DB job trades not yet configured in admin settings
    const discoveredTrades = new Map<string, (j: Job) => boolean>();
    activeJobs.forEach(job => {
      if (job.trade && job.trade.trim()) {
        const trade = job.trade.trim();
        const tradeLower = trade.toLowerCase();
        if (!processedIds.has(tradeLower)) {
          discoveredTrades.set(trade, (j: Job) => (j.trade || '').trim().toLowerCase() === tradeLower || (j.title || '').toLowerCase().includes(tradeLower));
        }
      }
    });

    // Append discovered DB trades at the end
    let nextPriority = result.length + 1;
    discoveredTrades.forEach((filterFn, tradeName) => {
      const matchingCount = activeJobs.filter(filterFn).length;
      if (matchingCount > 0) {
        result.push({
          id: tradeName,
          label: tradeName,
          count: matchingCount,
          priority: nextPriority++,
          targetUrl: `/jobs?keyword=${encodeURIComponent(tradeName)}`,
          filterFn
        });
      }
    });

    return result;
  }, [activeJobs, tabSettings]);

  // Active selected category
  const activeCategory = useMemo(() => {
    return categories.find(c => c.id === activeTabId) || categories[0];
  }, [categories, activeTabId]);

  // Real Database Jobs for active category (max 10)
  const categoryJobs = useMemo(() => {
    if (!activeCategory) return [];
    if (activeCategory.id === 'all') {
      return activeJobs.slice(0, 10);
    }
    return activeJobs.filter(activeCategory.filterFn).slice(0, 10);
  }, [activeJobs, activeCategory]);

  if (categories.length === 0) {
    return null;
  }

  return (
    <section className="job-tabbed-section" style={{ padding: '36px 0 32px 0', background: '#F8FAFC', borderTop: '1px solid #E2E8F0', borderBottom: '1px solid #E2E8F0' }}>
      <div className="container" style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 16px' }}>
        
        {/* Section Header with Professional Icon Badge & Mobile Alignment */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px',
          marginBottom: '20px'
        }}>
          {/* Professional Icon Badge Container */}
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
            border: '1px solid #BFDBFE',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 6px rgba(37, 99, 235, 0.1)',
            flexShrink: 0,
            marginTop: '2px'
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
            </svg>
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h2 style={{
                fontSize: 'clamp(19px, 4vw, 24px)',
                fontWeight: '800',
                color: '#0F172A',
                letterSpacing: '-0.02em',
                margin: 0,
                lineHeight: '1.25'
              }}>
                Popular Role Picks
              </h2>
              <span style={{
                fontSize: '10.5px',
                fontWeight: '800',
                letterSpacing: '0.4px',
                textTransform: 'uppercase',
                padding: '2px 8px',
                borderRadius: '9999px',
                background: '#EEF1FF',
                color: '#2563eb',
                whiteSpace: 'nowrap'
              }}>
                Verified Jobs
              </span>
            </div>
            <p style={{
              margin: '3px 0 0 0',
              fontSize: '13px',
              color: '#64748B',
              fontWeight: '500',
              lineHeight: '1.45',
              maxWidth: '640px'
            }}>
              Explore top verified job opportunities categorized by available roles in the database
            </p>
          </div>
        </div>

        {/* Slanted Folder Tab Menu (Exact Search Jobs Button Theme Color: #2563eb to #1d4ed8) */}
        <div style={{
          position: 'relative',
          marginBottom: '24px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            overflowX: 'auto',
            padding: '4px 4px 8px 4px',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch'
          }}>
            {categories.map((cat) => {
              const isActive = activeCategory.id === cat.id;

              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveTabId(cat.id)}
                  style={{
                    flexShrink: 0,
                    position: 'relative',
                    padding: '8px 18px',
                    fontSize: '13px',
                    fontWeight: isActive ? '800' : '700',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease',
                    border: isActive ? '1.5px solid #344BFD' : '1.5px solid #cbd5e1',
                    outline: 'none',
                    borderRadius: '4px',
                    background: isActive ? '#344BFD' : '#FFFFFF',
                    color: isActive ? '#FFFFFF' : '#475569',
                    boxShadow: isActive 
                      ? '0 4px 12px rgba(52, 75, 253, 0.25)' 
                      : '0 2px 4px rgba(15, 23, 42, 0.04)',
                    zIndex: isActive ? 3 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = '#eef2ff';
                      e.currentTarget.style.borderColor = '#344BFD';
                      e.currentTarget.style.color = '#344BFD';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = '#FFFFFF';
                      e.currentTarget.style.borderColor = '#cbd5e1';
                      e.currentTarget.style.color = '#475569';
                    }
                  }}
                >
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <span style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: isActive ? '#FFFFFF' : '#344BFD',
                      display: 'inline-block'
                    }} />
                    <span>{cat.label}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* HORIZONTAL CARDS SLIDER ROW (Real DB Jobs Only - Uniform Card Heights) */}
        {categoryJobs.length > 0 && (
          <div
            ref={scrollRowRef}
            style={{
              display: 'flex',
              alignItems: 'stretch',
              gap: '14px',
              overflowX: 'auto',
              scrollSnapType: 'x mandatory',
              paddingBottom: '10px',
              marginBottom: '12px',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            {categoryJobs.map((job) => (
              <div
                key={job.id}
                style={{
                  flex: '0 0 290px',
                  width: '290px',
                  minHeight: '240px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignSelf: 'stretch',
                  scrollSnapAlign: 'start'
                }}
              >
                <JobCard job={job} />
              </div>
            ))}

            {/* End of Carousel "See All" Action Card */}
            <div
              onClick={() => navigate(activeCategory.targetUrl)}
              style={{
                flex: '0 0 200px',
                width: '200px',
                alignSelf: 'stretch',
                minHeight: '260px',
                scrollSnapAlign: 'start',
                background: '#FFFFFF',
                border: '1.5px dashed #344BFD',
                borderRadius: '6px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                cursor: 'pointer',
                padding: '24px',
                textAlign: 'center',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 12px rgba(15, 23, 42, 0.05)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#eef2ff';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#FFFFFF';
                e.currentTarget.style.transform = 'none';
              }}
            >
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '6px',
                background: '#344BFD',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(52, 75, 253, 0.25)'
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                </svg>
              </div>
              <div>
                <span style={{ fontSize: '15px', fontWeight: '800', color: '#0F172A', display: 'block' }}>
                  View All Jobs
                </span>
                <span style={{ fontSize: '12px', color: '#64748B', fontWeight: '600' }}>
                  {activeCategory.label}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Bottom See All Button */}
        {activeCategory && (
          <div style={{ textAlign: 'center', marginTop: '4px' }}>
            <button
              onClick={() => navigate(activeCategory.targetUrl)}
              style={{
                width: '100%',
                maxWidth: '480px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '12px 24px',
                borderRadius: '6px',
                background: '#FFFFFF',
                border: '1.5px solid #cbd5e1',
                color: '#0F172A',
                fontSize: '14.5px',
                fontWeight: '700',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(15, 23, 42, 0.06), 0 1px 3px rgba(15, 23, 42, 0.04)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#344BFD';
                e.currentTarget.style.color = '#344BFD';
                e.currentTarget.style.background = '#eef2ff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#cbd5e1';
                e.currentTarget.style.color = '#0F172A';
                e.currentTarget.style.background = '#FFFFFF';
              }}
            >
              <span>{activeCategory.label.toLowerCase().includes('all') ? 'Explore All Opportunities' : `See All ${activeCategory.label} Jobs`}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#344BFD" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </button>
          </div>
        )}

      </div>
    </section>
  );
};



