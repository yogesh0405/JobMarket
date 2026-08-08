import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { CompanyDefaultLogo } from '../company/CompanyDefaultLogo';

interface MobileSearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
  onSelectSearch: (query: string, location?: string, id?: string) => void;
}

const POPULAR_SUGGESTED_TRADES = [
  'CNC Operator',
  'Industrial Electrician',
  'TIG/MIG Welder',
  'ITI Fitter',
  'Quality Inspector',
  'Maintenance Engineer',
  'Machine Helper',
  'Turner & Machinist'
];

const POPULAR_MIDC_ZONES = [
  'Chakan MIDC',
  'Bhosari MIDC',
  'Waluj MIDC',
  'Taloja MIDC',
  'Ranjangaon MIDC',
  'Pimpri Industrial Zone'
];

export const MobileSearchOverlay: React.FC<MobileSearchOverlayProps> = ({
  isOpen,
  onClose,
  initialQuery = '',
  onSelectSearch
}) => {
  const { state } = useStore();
  const navigate = useNavigate();

  const [query, setQuery] = useState(initialQuery);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync initial query & load recent searches from localStorage
  useEffect(() => {
    if (isOpen) {
      setQuery(initialQuery);
      try {
        const saved = localStorage.getItem('jobmarket_recent_searches');
        if (saved) {
          setRecentSearches(JSON.parse(saved));
        }
      } catch (e) {
        console.error('Failed to parse recent searches:', e);
      }
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, initialQuery]);

  // Save new search query to recent searches
  const saveRecentSearch = (searchTerm: string) => {
    const term = searchTerm.trim();
    if (!term) return;
    const updated = [term, ...recentSearches.filter(s => s.toLowerCase() !== term.toLowerCase())].slice(0, 6);
    setRecentSearches(updated);
    try {
      localStorage.setItem('jobmarket_recent_searches', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save recent searches:', e);
    }
  };

  // Clear all recent searches
  const clearRecentSearches = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem('jobmarket_recent_searches');
    } catch (e) {
      console.error('Failed to clear recent searches:', e);
    }
  };

  // Delete single recent search
  const removeRecentSearch = (e: React.MouseEvent, termToRemove: string) => {
    e.stopPropagation();
    const updated = recentSearches.filter(s => s !== termToRemove);
    setRecentSearches(updated);
    try {
      localStorage.setItem('jobmarket_recent_searches', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to remove recent search:', e);
    }
  };

  const handleExecuteSearch = (searchTerm: string, location?: string, id?: string) => {
    saveRecentSearch(searchTerm);
    onClose();
    if (id) {
      navigate(`/job/${id}`);
    } else {
      onSelectSearch(searchTerm, location);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      handleExecuteSearch(query.trim());
    }
  };

  // Filter matching live jobs, trades & locations
  const liveResults = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return { jobs: [], trades: [], locations: [] };

    const jobs = state.jobs
      .filter(j =>
        j.title.toLowerCase().includes(trimmed) ||
        j.company.toLowerCase().includes(trimmed) ||
        j.industry.toLowerCase().includes(trimmed) ||
        (j.trade && j.trade.toLowerCase().includes(trimmed)) ||
        (j.skills && j.skills.some(s => s.toLowerCase().includes(trimmed)))
      )
      .slice(0, 8);

    const trades = POPULAR_SUGGESTED_TRADES
      .filter(t => t.toLowerCase().includes(trimmed))
      .slice(0, 6);

    const locations = Array.from(
      new Set(state.jobs.map(j => j.location).filter(Boolean))
    )
      .filter(l => l.toLowerCase().includes(trimmed))
      .slice(0, 6);

    return { jobs, trades, locations };
  }, [query, state.jobs]);

  if (!isOpen) return null;

  return createPortal(
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 999999,
      background: '#F8FAFC',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      overflowX: 'hidden',
      width: '100vw',
      maxWidth: '100%'
    }}>
      {/* Dynamic responsive grid CSS rules */}
      <style>{`
        .search-grid-responsive {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
          gap: 10px;
          width: 100%;
          box-sizing: border-box;
        }
        @media (max-width: 640px) {
          .search-grid-responsive {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      {/* Header Bar - Centered Container & Responsive Padding */}
      <div style={{
        background: '#ffffff',
        borderBottom: '1.5px solid #CBD5E1',
        boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        width: '100%',
        boxSizing: 'border-box'
      }}>
        <div style={{
          maxWidth: '1000px',
          margin: '0 auto',
          padding: '0 12px',
          height: '56px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          {/* Back Arrow Button */}
          <button
            onClick={onClose}
            type="button"
            style={{
              background: 'none',
              border: 'none',
              padding: '6px 4px',
              cursor: 'pointer',
              color: '#0F172A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 0,
              flexShrink: 0
            }}
            aria-label="Back"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
          </button>

          {/* Search Input Box Form */}
          <form onSubmit={handleFormSubmit} style={{ flex: 1, margin: 0, display: 'flex', alignItems: 'center', height: '100%', minWidth: 0 }}>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search jobs, trades, companies..."
              style={{
                width: '100%',
                border: 'none',
                outline: 'none',
                fontSize: '15px',
                fontWeight: '500',
                color: '#0F172A',
                background: 'transparent',
                padding: '8px 0',
                borderRadius: 0
              }}
            />
          </form>

          {/* Clear / Voice Search Button */}
          {query ? (
            <button
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              type="button"
              style={{
                background: '#F1F5F9',
                border: 'none',
                width: '28px',
                height: '28px',
                borderRadius: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#475569',
                flexShrink: 0
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                if (navigator.mediaDevices && (window as any).webkitSpeechRecognition) {
                  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
                  const recognition = new SpeechRecognition();
                  recognition.start();
                  recognition.onresult = (event: any) => {
                    const transcript = event.results[0][0].transcript;
                    setQuery(transcript);
                  };
                }
              }}
              style={{
                background: 'none',
                border: 'none',
                padding: '6px',
                color: '#64748B',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                borderRadius: 0,
                flexShrink: 0
              }}
              title="Voice Search"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Main Overlay Body - Centered Container Layout */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '16px 12px', background: '#F8FAFC', width: '100%', boxSizing: 'border-box' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '22px', width: '100%', boxSizing: 'border-box' }}>
          
          {query.trim() === '' ? (
            /* Default Mode: Recent Searches at Top, followed by Popular Trades & Industrial Hubs */
            <>
              {/* 1. Recent Searches */}
              {recentSearches.length > 0 && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <div style={{ fontSize: '11.5px', fontWeight: '800', color: '#475569', letterSpacing: '0.6px', textTransform: 'uppercase' }}>
                      RECENT SEARCHES
                    </div>
                    <button
                      onClick={clearRecentSearches}
                      style={{ background: 'none', border: 'none', color: '#EF4444', fontSize: '12px', fontWeight: '700', cursor: 'pointer', borderRadius: 0 }}
                    >
                      Clear history
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', background: '#ffffff', border: '1.5px solid #CBD5E1', borderRadius: 0, width: '100%', boxSizing: 'border-box' }}>
                    {recentSearches.map((term, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleExecuteSearch(term)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '12px 14px',
                          borderBottom: idx === recentSearches.length - 1 ? 'none' : '1px solid #E2E8F0',
                          cursor: 'pointer',
                          background: '#ffffff',
                          transition: 'background 0.15s ease',
                          width: '100%',
                          boxSizing: 'border-box'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                          <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: 0,
                            background: '#F1F5F9',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#64748B',
                            flexShrink: 0
                          }}>
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="12" r="10" />
                              <polyline points="12 6 12 12 16 14" />
                            </svg>
                          </div>
                          <span style={{ fontSize: '14px', fontWeight: '600', color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{term}</span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setQuery(term);
                              inputRef.current?.focus();
                            }}
                            style={{ background: 'none', border: 'none', padding: '4px', cursor: 'pointer', color: '#94A3B8', borderRadius: 0 }}
                            title="Insert term into search bar"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <line x1="7" y1="17" x2="17" y2="7" />
                              <polyline points="7 7 17 7 17 17" />
                            </svg>
                          </button>
                          <button
                            onClick={(e) => removeRecentSearch(e, term)}
                            style={{ background: 'none', border: 'none', padding: '4px', cursor: 'pointer', color: '#CBD5E1', borderRadius: 0 }}
                            title="Delete from history"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <line x1="18" y1="6" x2="6" y2="18" />
                              <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 2. Popular ITI Trades & Roles */}
              <div>
                <div style={{ fontSize: '11.5px', fontWeight: '800', color: '#475569', letterSpacing: '0.6px', marginBottom: '10px', textTransform: 'uppercase' }}>
                  POPULAR ITI TRADES & ROLES
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', width: '100%', boxSizing: 'border-box' }}>
                  {POPULAR_SUGGESTED_TRADES.map(trade => (
                    <button
                      key={trade}
                      onClick={() => handleExecuteSearch(trade)}
                      style={{
                        background: '#ffffff',
                        color: '#0F172A',
                        border: '1.5px solid #CBD5E1',
                        borderRadius: 0,
                        padding: '8px 14px',
                        fontSize: '13px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                        transition: 'all 0.2s ease',
                        boxSizing: 'border-box'
                      }}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2.5">
                        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                      </svg>
                      <span>{trade}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Top Industrial Hubs & MIDC Zones */}
              <div>
                <div style={{ fontSize: '11.5px', fontWeight: '800', color: '#475569', letterSpacing: '0.6px', marginBottom: '10px', textTransform: 'uppercase' }}>
                  TOP INDUSTRIAL HUBS & MIDC ZONES
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', width: '100%', boxSizing: 'border-box' }}>
                  {POPULAR_MIDC_ZONES.map(zone => (
                    <button
                      key={zone}
                      onClick={() => handleExecuteSearch('', zone)}
                      style={{
                        background: '#ffffff',
                        color: '#0F172A',
                        border: '1.5px solid #CBD5E1',
                        borderRadius: 0,
                        padding: '8px 14px',
                        fontSize: '13px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                        transition: 'all 0.2s ease',
                        boxSizing: 'border-box'
                      }}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      <span>{zone}</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            /* Live Instant Search Results Mode */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', width: '100%', boxSizing: 'border-box' }}>
              {/* Direct Execute Item Card */}
              <div
                onClick={() => handleExecuteSearch(query)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  background: '#ffffff',
                  border: '1.5px solid #2563EB',
                  borderRadius: 0,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(37, 99, 235, 0.1)',
                  width: '100%',
                  boxSizing: 'border-box'
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2.5" style={{ flexShrink: 0 }}>
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <div style={{ fontSize: '14.5px', fontWeight: '700', color: '#1D4ED8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  Search all results for &quot;{query}&quot;
                </div>
              </div>

              {/* Jobs Match Section */}
              {liveResults.jobs.length > 0 && (
                <div style={{ width: '100%', boxSizing: 'border-box' }}>
                  <div style={{ fontSize: '11.5px', fontWeight: '800', color: '#475569', letterSpacing: '0.6px', marginBottom: '10px', textTransform: 'uppercase' }}>
                    MATCHING VACANCIES ({liveResults.jobs.length})
                  </div>
                  <div className="search-grid-responsive">
                    {liveResults.jobs.map(job => (
                      <div
                        key={job.id}
                        onClick={() => handleExecuteSearch(job.title, undefined, job.id)}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px',
                          padding: '12px 14px',
                          borderRadius: 0,
                          border: '1.5px solid #CBD5E1',
                          cursor: 'pointer',
                          background: '#ffffff',
                          boxShadow: '0 2px 6px rgba(15, 23, 42, 0.04)',
                          width: '100%',
                          boxSizing: 'border-box',
                          overflow: 'hidden'
                        }}
                      >
                        {/* Top Row: Logo + Title + Salary Badge */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', width: '100%' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0, overflow: 'hidden' }}>
                            <div style={{ width: '34px', height: '34px', flexShrink: 0 }}>
                              <CompanyDefaultLogo logoUrl={job.companyLogo} companyName={job.company} size={34} borderRadius="0px" />
                            </div>
                            <div style={{ fontSize: '14px', fontWeight: '700', color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {job.title}
                            </div>
                          </div>
                          <div style={{ fontSize: '11.5px', fontWeight: '700', color: '#059669', background: '#ECFDF5', border: '1px solid #A7F3D0', padding: '3px 8px', borderRadius: 0, flexShrink: 0, whiteSpace: 'nowrap' }}>
                            ₹{Math.round(job.salaryMin / 1000)}k-₹{Math.round(job.salaryMax / 1000)}k
                          </div>
                        </div>

                        {/* Bottom Row: Company Name & Location */}
                        <div style={{ fontSize: '12px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }}>
                          <span style={{ fontWeight: '600', color: '#475569', flexShrink: 0 }}>{job.company}</span>
                          <span style={{ color: '#94A3B8' }}>•</span>
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{job.location}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Trades Match Section */}
              {liveResults.trades.length > 0 && (
                <div style={{ width: '100%', boxSizing: 'border-box' }}>
                  <div style={{ fontSize: '11.5px', fontWeight: '800', color: '#475569', letterSpacing: '0.6px', marginBottom: '10px', textTransform: 'uppercase' }}>
                    SPECIALTY TRADES
                  </div>
                  <div className="search-grid-responsive">
                    {liveResults.trades.map(trade => (
                      <div
                        key={trade}
                        onClick={() => handleExecuteSearch(trade)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '11px 14px',
                          borderRadius: 0,
                          border: '1.5px solid #CBD5E1',
                          cursor: 'pointer',
                          background: '#ffffff',
                          width: '100%',
                          boxSizing: 'border-box',
                          overflow: 'hidden'
                        }}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" style={{ flexShrink: 0 }}>
                          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                        </svg>
                        <span style={{ fontSize: '13.5px', fontWeight: '600', color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{trade}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Locations Match Section */}
              {liveResults.locations.length > 0 && (
                <div style={{ width: '100%', boxSizing: 'border-box' }}>
                  <div style={{ fontSize: '11.5px', fontWeight: '800', color: '#475569', letterSpacing: '0.6px', marginBottom: '10px', textTransform: 'uppercase' }}>
                    MATCHING LOCATIONS
                  </div>
                  <div className="search-grid-responsive">
                    {liveResults.locations.map(loc => (
                      <div
                        key={loc}
                        onClick={() => handleExecuteSearch('', loc)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '11px 14px',
                          borderRadius: 0,
                          border: '1.5px solid #CBD5E1',
                          cursor: 'pointer',
                          background: '#ffffff',
                          width: '100%',
                          boxSizing: 'border-box',
                          overflow: 'hidden'
                        }}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.2" style={{ flexShrink: 0 }}>
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                        <span style={{ fontSize: '13.5px', fontWeight: '600', color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{loc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty state fallback - 100% Clickable Navigation to Search */}
              {liveResults.jobs.length === 0 && liveResults.trades.length === 0 && liveResults.locations.length === 0 && (
                <div
                  onClick={() => handleExecuteSearch(query)}
                  style={{
                    padding: '28px 16px',
                    textAlign: 'center',
                    color: '#64748B',
                    background: '#ffffff',
                    border: '1.5px solid #2563EB',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.08)',
                    transition: 'all 0.2s ease',
                    width: '100%',
                    boxSizing: 'border-box'
                  }}
                >
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" style={{ margin: '0 auto 10px auto', display: 'block' }}>
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <div style={{ fontSize: '15px', fontWeight: '800', color: '#1D4ED8' }}>Search all factory listings for &quot;{query}&quot;</div>
                  <div style={{ fontSize: '12.5px', color: '#475569', marginTop: '4px', fontWeight: '600' }}>Tap here or press enter to search across all job listings</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
export default MobileSearchOverlay;
