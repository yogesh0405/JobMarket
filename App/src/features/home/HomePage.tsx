import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { useJobs } from '../../hooks/useJobs';
import { useAuth } from '../../hooks/useAuth';
import { JobCard } from '../../components/job/JobCard';
import { formatNumber } from '../../utils/helpers';
import { useTranslation } from '../../utils/translations';
import { initialHospitalCategories, initialHotelCategories, initialSchoolCategories } from '../../store/seedData';
import { BannerSlider } from '../../components/home/BannerSlider';
import { JobTabbedSection } from '../../components/home/JobTabbedSection';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useStore();
  const { getJobs } = useJobs();
  const { currentUser } = useAuth();
  const t = useTranslation(state.language);

  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [industry, setIndustry] = useState('');
  const [education, setEducation] = useState('');

  const getCategoryIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('fitter')) {
      return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--primary)' }}><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></svg>;
    }
    if (n.includes('welder')) {
      return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--primary)' }}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>;
    }
    if (n.includes('cnc')) {
      return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--primary)' }}><rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>;
    }
    if (n.includes('electrician')) {
      return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--primary)' }}><path d="M18.36 6.64a9 9 0 1 1-12.73 0" /><line x1="12" y1="2" x2="12" y2="12" /></svg>;
    }
    if (n.includes('machinist')) {
      return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--primary)' }}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>;
    }
    if (n.includes('helper') || n.includes('loader')) {
      return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--primary)' }}><polyline points="22 12 16 12 14 15 10 15 8 12 2 12" /><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" /></svg>;
    }
    if (n.includes('inspector')) {
      return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--primary)' }}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /><path d="M11 8v5" /><line x1="11" y1="16" x2="11" y2="16" /></svg>;
    }
    if (n.includes('apprentice')) {
      return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--primary)' }}><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" /></svg>;
    }
    if (n.includes('driver') || n.includes('forklift')) {
      return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--primary)' }}><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="2" /><path d="M12 2v20M2 12h20" /></svg>;
    }
    if (n.includes('security')) {
      return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--primary)' }}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>;
    }
    if (n.includes('store') || n.includes('keeper')) {
      return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--primary)' }}><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg>;
    }
    if (n.includes('technician')) {
      return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--primary)' }}><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></svg>;
    }
    if (n.includes('hospital') || n.includes('nurse') || n.includes('ward') || n.includes('assistant')) {
      return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--primary)' }}><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>;
    }
    if (n.includes('hotel') || n.includes('cook') || n.includes('waiter') || n.includes('housekeeping')) {
      return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--primary)' }}><path d="M18 8h1a4 4 0 0 1 0 8h-1" /><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" /></svg>;
    }
    if (n.includes('school') || n.includes('college') || n.includes('teacher') || n.includes('librarian') || n.includes('peon')) {
      return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--primary)' }}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>;
    }
    if (n.includes('office') || n.includes('clerk') || n.includes('receptionist')) {
      return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--primary)' }}><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>;
    }
    return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--primary)' }}><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>;
  };

  const getQualificationIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('pass') || n.includes('10th') || n.includes('12th')) {
      return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--primary)' }}><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" /></svg>;
    }
    if (n.includes('com') || n.includes('bba') || n.includes('mba') || n.includes('commerce') || n.includes('business')) {
      return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--primary)' }}><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>;
    }
    if (n.includes('ba') && !n.includes('bba')) {
      return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--primary)' }}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>;
    }
    if (n.includes('b.e') || n.includes('tech') || n.includes('engineering')) {
      return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--primary)' }}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>;
    }
    if (n.includes('diploma') || n.includes('vocational') || n.includes('course')) {
      return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--primary)' }}><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" /><path d="M8 12l3 3 5-5" /></svg>;
    }
    if (n.includes('bca') || n.includes('mca') || n.includes('b.sc') || n.includes('computer') || n.includes('science')) {
      return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--primary)' }}><rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>;
    }
    return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--primary)' }}><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" /></svg>;
  };

  const [industryDropdownOpen, setIndustryDropdownOpen] = useState(false);
  const industryRef = useRef<HTMLDivElement>(null);
  
  const [educationDropdownOpen, setEducationDropdownOpen] = useState(false);
  const educationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (industryRef.current && !industryRef.current.contains(e.target as Node)) {
        setIndustryDropdownOpen(false);
      }
      if (educationRef.current && !educationRef.current.contains(e.target as Node)) {
        setEducationDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const industries = [
    "IT & Software",
    "Marketing",
    "Finance",
    "Healthcare",
    "Education",
    "Design & Creative",
    "Logistics",
    "Construction",
    "Automotive",
    "FMCG",
    "Agriculture",
    "HR & Admin",
    "Manufacturing",
    "Mechanical & Assembly",
    "Electricals"
  ];

  const educations = [
    "10th Pass",
    "12th Pass",
    "ITI",
    "Diploma",
    "Graduate"
  ];

  const featuredJobs = getJobs().filter(j => j.featured).slice(0, 6);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    let query = '/jobs?';
    if (keyword) query += `keyword=${encodeURIComponent(keyword)}&`;
    if (location) query += `location=${encodeURIComponent(location)}&`;
    if (industry) query += `industry=${encodeURIComponent(industry)}&`;
    if (education) query += `education=${encodeURIComponent(education)}&`;
    navigate(query.slice(0, -1) || '/jobs');
  };

  const quickSearch = (kw: string) => {
    navigate(`/jobs?keyword=${encodeURIComponent(kw)}`);
  };

  // Scroll-reveal animation
  useEffect(() => {
    const reveals = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    reveals.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="homepage-wrapper">
      {/* Enterprise Promotional Banner Carousel Slider - Immediately below Header */}
      <div style={{ paddingTop: '0.5rem' }}>
        <BannerSlider />
      </div>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-mesh-overlay"></div>
        <div className="hero-particles">
          <div className="hero-particle"></div>
          <div className="hero-particle"></div>
          <div className="hero-particle"></div>
          <div className="hero-particle"></div>
          <div className="hero-particle"></div>
        </div>

        <div className="container">
          <div className="hero-content">
            <div className="hero-badge">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
              <span>{t.tagline}</span>
            </div>
            <h1>{t.heroTitle}</h1>
            <p className="hero-subtitle">
              {t.heroSubtitle}
            </p>

            <div className="hero-search">
              <form className="search-bar" onSubmit={handleSearch}>
                <div className="search-field keyword-field">
                  <svg className="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                  <input
                    type="text"
                    placeholder={t.searchPlaceholder}
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                  />
                </div>
                <div className="search-field select-field industry-field" ref={industryRef}>
                  <svg className="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                  </svg>
                  <div className="select-container">
                    <div
                      onClick={() => setIndustryDropdownOpen(!industryDropdownOpen)}
                      className="custom-select-trigger"
                    >
                      <span className={industry ? "select-value" : "select-placeholder"}>
                        {industry || 'Select Industry'}
                      </span>
                      <svg 
                        className={`select-arrow ${industryDropdownOpen ? 'open' : ''}`}
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                      >
                        <polyline points="6 9 12 15 18 9"/>
                      </svg>
                    </div>
                    {industryDropdownOpen && (
                      <div className="custom-select-dropdown">
                        <div
                          onClick={() => {
                            setIndustry('');
                            setIndustryDropdownOpen(false);
                          }}
                          className={`custom-select-option ${industry === '' ? 'active' : ''}`}
                        >
                          Select Industry
                        </div>
                        {industries.map((ind) => (
                          <div
                            key={ind}
                            onClick={() => {
                              setIndustry(ind);
                              setIndustryDropdownOpen(false);
                            }}
                            className={`custom-select-option ${industry === ind ? 'active' : ''}`}
                          >
                            {ind}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="search-field select-field education-field" ref={educationRef}>
                  <svg className="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                    <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/>
                  </svg>
                  <div className="select-container">
                    <div
                      onClick={() => setEducationDropdownOpen(!educationDropdownOpen)}
                      className="custom-select-trigger"
                    >
                      <span className={education ? "select-value" : "select-placeholder"}>
                        {education || 'Select Education'}
                      </span>
                      <svg 
                        className={`select-arrow ${educationDropdownOpen ? 'open' : ''}`}
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                      >
                        <polyline points="6 9 12 15 18 9"/>
                      </svg>
                    </div>
                    {educationDropdownOpen && (
                      <div className="custom-select-dropdown">
                        <div
                          onClick={() => {
                            setEducation('');
                            setEducationDropdownOpen(false);
                          }}
                          className={`custom-select-option ${education === '' ? 'active' : ''}`}
                        >
                          Select Education
                        </div>
                        {educations.map((ed) => (
                          <div
                            key={ed}
                            onClick={() => {
                              setEducation(ed);
                              setEducationDropdownOpen(false);
                            }}
                            className={`custom-select-option ${education === ed ? 'active' : ''}`}
                          >
                            {ed}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="search-field location-field">
                  <svg className="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                  </svg>
                  <input
                    type="text"
                    placeholder={t.locationPlaceholder}
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
                <button type="submit" className="search-btn">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                  <span>{t.searchBtn}</span>
                </button>
              </form>
            </div>

            <div className="hero-tags">
              <span>{t.popular}:</span>
              <span className="hero-tag" onClick={() => quickSearch('Fitter')}>Fitter</span>
              <span className="hero-tag" onClick={() => quickSearch('Welder')}>Welder</span>
              <span className="hero-tag" onClick={() => quickSearch('CNC Operator')}>CNC Operator</span>
              <span className="hero-tag" onClick={() => quickSearch('Electrician')}>Electrician</span>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Role Picks Section - Passing all available DB jobs */}
      <JobTabbedSection jobs={getJobs()} />

      {/* Stats Section */}
      <StatsSection totalJobs={state.jobs.length} totalCompanies={state.companies.length} totalCandidates={state.users.length} t={t} />

      <hr className="section-divider" />

      {/* Categories Section */}
      <section className="categories-section reveal">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">{t.popular}</span>
            <h2 className="section-title">{t.categoriesHeader}</h2>
            <p className="section-subtitle">{t.categoriesSubtitle}</p>
          </div>
          <div className="grid grid-4" style={{ gap: 'var(--space-6)' }}>
            {state.categories.map((cat) => (
              <div
                key={cat.name}
                className="category-card"
                onClick={() => navigate(`/jobs?keyword=${encodeURIComponent(cat.name)}`)}
              >
                <div className="category-header" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div className="category-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', background: 'var(--primary-50)', borderRadius: 'var(--radius-lg)', flexShrink: 0 }}>
                    {getCategoryIcon(cat.name)}
                  </div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700' }}>{cat.name}</h3>
                </div>
                <p className="category-count-text" style={{ marginTop: '12px' }}>
                  <strong>{formatNumber(cat.count)}</strong> open positions
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <hr className="section-divider" />

      {/* Qualifications Section */}
      <section className="qualifications-section reveal">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Education</span>
            <h2 className="section-title">Browse Jobs by Qualification</h2>
            <p className="section-subtitle">Find jobs matching your school education or college degree</p>
          </div>
          
          <div className="qualifications-grid">
            {(state.qualifications || []).map((q, i) => (
              <div
                key={q.name}
                className={`qualification-card color-index-${i % 6}`}
                onClick={() => navigate(`/jobs?keyword=${encodeURIComponent(q.name.replace(' Jobs', ''))}`)}
              >
                <div className="qualification-header" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span className="qualification-icon" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', background: 'rgba(255,255,255,0.2)', borderRadius: '50%', flexShrink: 0 }}>
                    {getQualificationIcon(q.name)}
                  </span>
                  <h4 style={{ margin: 0 }}>{q.name}</h4>
                </div>
                <p className="qualification-count-text" style={{ marginTop: '10px' }}>
                  <strong>{formatNumber(q.count)}</strong> Job Openings
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <hr className="section-divider" />

      {/* Hospital Jobs Section */}
      <section className="qualifications-section reveal">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Hospital</span>
            <h2 className="section-title">Hospital & Healthcare Jobs</h2>
            <p className="section-subtitle">Browse medical, nursing, administration and support staff jobs</p>
          </div>
          
          <div className="qualifications-grid">
            {initialHospitalCategories.slice(0, 3).map((q, i) => (
              <div
                key={q.name}
                className={`qualification-card color-index-${i % 6}`}
                onClick={() => navigate(`/jobs?keyword=${encodeURIComponent(q.name)}`)}
              >
                <div className="qualification-header" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span className="qualification-icon" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', background: 'rgba(255,255,255,0.2)', borderRadius: '50%', flexShrink: 0 }}>
                    {getCategoryIcon(q.name)}
                  </span>
                  <h4 style={{ margin: 0 }}>{q.name}</h4>
                </div>
                <p className="qualification-count-text" style={{ marginTop: '10px' }}>
                  <strong>{formatNumber(q.count)}</strong> Job Openings
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <hr className="section-divider" />

      {/* Hotel Jobs Section */}
      <section className="qualifications-section reveal">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Hotel</span>
            <h2 className="section-title">Hotel, Restaurant & Catering Jobs</h2>
            <p className="section-subtitle">Find jobs in top hotels, cafes, pantries, and food companies</p>
          </div>
          
          <div className="qualifications-grid">
            {initialHotelCategories.slice(0, 3).map((q, i) => (
              <div
                key={q.name}
                className={`qualification-card color-index-${(i + 2) % 6}`}
                onClick={() => navigate(`/jobs?keyword=${encodeURIComponent(q.name)}`)}
              >
                <div className="qualification-header" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span className="qualification-icon" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', background: 'rgba(255,255,255,0.2)', borderRadius: '50%', flexShrink: 0 }}>
                    {getCategoryIcon(q.name)}
                  </span>
                  <h4 style={{ margin: 0 }}>{q.name}</h4>
                </div>
                <p className="qualification-count-text" style={{ marginTop: '10px' }}>
                  <strong>{formatNumber(q.count)}</strong> Job Openings
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <hr className="section-divider" />

      {/* School & College Jobs Section */}
      <section className="qualifications-section reveal">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">School & College</span>
            <h2 className="section-title">School, College & Education Jobs</h2>
            <p className="section-subtitle">Browse teaching, clerical, administrative and security roles in academic institutes</p>
          </div>
          
          <div className="qualifications-grid">
            {initialSchoolCategories.slice(0, 3).map((q, i) => (
              <div
                key={q.name}
                className={`qualification-card color-index-${(i + 4) % 6}`}
                onClick={() => navigate(`/jobs?keyword=${encodeURIComponent(q.name)}`)}
              >
                <div className="qualification-header" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span className="qualification-icon" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', background: 'rgba(255,255,255,0.2)', borderRadius: '50%', flexShrink: 0 }}>
                    {getCategoryIcon(q.name)}
                  </span>
                  <h4 style={{ margin: 0 }}>{q.name}</h4>
                </div>
                <p className="qualification-count-text" style={{ marginTop: '10px' }}>
                  <strong>{formatNumber(q.count)}</strong> Job Openings
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <hr className="section-divider" />

      {/* Featured Jobs Section */}
      <section className="featured-section reveal">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">{t.findJobs}</span>
            <h2 className="section-title">Urgent Factory Vacancies</h2>
            <p className="section-subtitle">Verified plant positions with direct walk-in dates and OT options</p>
          </div>
          <div className="grid grid-2" style={{ gap: 'var(--space-6)' }}>
            {featuredJobs.map(job => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
          <div className="featured-action-bar">
            <Link to="/jobs" className="btn btn-primary btn-lg btn-pill btn-glow">
              {t.findJobs}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginLeft: 8 }}>
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </Link>
          </div>
        </div>
      </section>

      <hr className="section-divider" />

      {/* Companies Section */}
      <section className="companies-section reveal">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">{t.statsFactories}</span>
            <h2 className="section-title">Industrial Companies Hiring</h2>
            <p className="section-subtitle">Apply directly to top manufacturing plants and engineering factories</p>
          </div>
          <div className="company-logo-grid">
            {state.companies.slice(0, 12).map(c => (
              <div
                key={c.name}
                className="company-logo-card"
                onClick={() => navigate(`/jobs?keyword=${encodeURIComponent(c.name)}`)}
              >
                <div className="company-logo-icon" style={{ background: c.color }}>
                  {c.name[0]}
                </div>
                <h4>{c.name}</h4>
                <p>{c.industry}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <hr className="section-divider" />

      {/* How it Works */}
      <section className="how-section reveal">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">FAQ</span>
            <h2 className="section-title">{t.stepsHeader}</h2>
            <p className="section-subtitle">Get connected directly to factory managers and supervisors</p>
          </div>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number-wrapper">
                <div className="step-number">1</div>
              </div>
              <h3>1. Register Profile</h3>
              <p>Enter your ITI trade, preferred shifts, and select transport or accommodation needs.</p>
            </div>
            <div className="step-card">
              <div className="step-number-wrapper">
                <div className="step-number">2</div>
              </div>
              <h3>2. Direct Apply</h3>
              <p>Review factory details (hostels, canteen, OT pay) and apply with one click.</p>
            </div>
            <div className="step-card">
              <div className="step-number-wrapper">
                <div className="step-number">3</div>
              </div>
              <h3>3. Attend Walk-in</h3>
              <p>Receive interview dates and walk-in locations via WhatsApp automatically.</p>
            </div>
          </div>
        </div>
      </section>

      <hr className="section-divider" />

      {/* Categories Directory */}
      <section className="categories-directory-section reveal">
        <div className="container">
          <div className="directory-grid">
            <div className="directory-column">
              <h3>Popular categories</h3>
              <ul className="directory-list">
                <li><span className="directory-item" onClick={() => quickSearch('IT')}>IT jobs</span></li>
                <li><span className="directory-item" onClick={() => quickSearch('Sales')}>Sales jobs</span></li>
                <li><span className="directory-item" onClick={() => quickSearch('Marketing')}>Marketing jobs</span></li>
                <li><span className="directory-item" onClick={() => quickSearch('Data Science')}>Data Science jobs</span></li>
                <li><span className="directory-item" onClick={() => quickSearch('HR')}>HR jobs</span></li>
                <li><span className="directory-item" onClick={() => quickSearch('Engineering')}>Engineering jobs</span></li>
              </ul>
            </div>
            <div className="directory-column">
              <h3>Jobs in demand</h3>
              <ul className="directory-list">
                <li><span className="directory-item" onClick={() => quickSearch('Fresher')}>Fresher jobs</span></li>
                <li><span className="directory-item" onClick={() => quickSearch('MNC')}>MNC jobs</span></li>
                <li><span className="directory-item" onClick={() => quickSearch('Remote')}>Remote jobs</span></li>
                <li><span className="directory-item" onClick={() => quickSearch('Work from home')}>Work from home jobs</span></li>
                <li><span className="directory-item" onClick={() => quickSearch('Walk-in')}>Walk-in jobs</span></li>
                <li><span className="directory-item" onClick={() => quickSearch('Part-time')}>Part-time jobs</span></li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA (Shown only before user login/signup) */}
      {!currentUser && (
        <>
          <hr className="section-divider" />
          <section className="cta-section reveal">
            <div className="container">
              <div className="cta-card">
                <div className="cta-glow-effect"></div>
                <h2>{t.ctaHeader}</h2>
                <p>{t.ctaSub}</p>
                <div className="cta-buttons">
                  <Link to="/signup?role=candidate" className="btn btn-primary btn-lg btn-pill btn-white">{t.signup}</Link>
                  <Link to="/signup?role=employer" className="btn btn-secondary btn-lg btn-pill btn-outline-white">{t.postJob}</Link>
                </div>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
};

// Animated Stats Section sub-component
interface StatsSectionProps {
  totalJobs: number;
  totalCompanies: number;
  totalCandidates: number;
  t: any;
}

const StatsSection: React.FC<StatsSectionProps> = ({ totalJobs, totalCompanies, totalCandidates, t }) => {
  const [jobsCount, setJobsCount] = useState(0);
  const [companiesCount, setCompaniesCount] = useState(0);
  const [candidatesCount, setCandidatesCount] = useState(0);
  const [placementsCount, setPlacementsCount] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          animate(totalJobs * 10, setJobsCount);
          animate(totalCompanies * 15, setCompaniesCount);
          animate(totalCandidates * 230, setCandidatesCount);
          animate((totalJobs + totalCandidates) * 35, setPlacementsCount);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);

    return () => observer.disconnect();
  }, [totalJobs, totalCompanies, totalCandidates, hasAnimated]);

  const animate = (target: number, setter: React.Dispatch<React.SetStateAction<number>>, duration = 1500) => {
    let start = 0;
    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      setter(Math.floor(eased * target));
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setter(target);
      }
    };
    requestAnimationFrame(step);
  };

  return (
    <section className="stats-section" ref={sectionRef}>
      <div className="container">
        <div className="stats-grid">
          <div className="stat-item glow-blue">
            <div className="stat-number">{formatNumber(jobsCount)}+</div>
            <div className="stat-label">{t.statsActiveJobs}</div>
          </div>
          <div className="stat-item glow-green">
            <div className="stat-number">{formatNumber(companiesCount)}+</div>
            <div className="stat-label">{t.statsFactories}</div>
          </div>
          <div className="stat-item glow-violet">
            <div className="stat-number">{formatNumber(candidatesCount)}+</div>
            <div className="stat-label">{t.statsWorkers}</div>
          </div>
          <div className="stat-item glow-orange">
            <div className="stat-number">{formatNumber(placementsCount)}+</div>
            <div className="stat-label">{t.statsPlacements}</div>
          </div>
        </div>
      </div>
    </section>
  );
};
export default HomePage;
