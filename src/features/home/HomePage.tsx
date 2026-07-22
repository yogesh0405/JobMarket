import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { useJobs } from '../../hooks/useJobs';
import { JobCard } from '../../components/job/JobCard';
import { formatNumber } from '../../utils/helpers';
import { useTranslation } from '../../utils/translations';
import { initialHospitalCategories, initialHotelCategories, initialSchoolCategories } from '../../store/seedData';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useStore();
  const { getJobs } = useJobs();
  const t = useTranslation(state.language);

  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [industry, setIndustry] = useState('');
  const [education, setEducation] = useState('');

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
      {/* Hero */}
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
                <div className="search-field">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                  <input
                    type="text"
                    placeholder={t.searchPlaceholder}
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                  />
                </div>
                <div className="search-field" ref={industryRef}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: '#2563eb' }}>
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                  </svg>
                  <div style={{ position: 'relative', flex: 1, width: '100%' }}>
                    <div
                      onClick={() => setIndustryDropdownOpen(!industryDropdownOpen)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: industry ? 'var(--text-primary)' : 'var(--text-tertiary)',
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: 'var(--fs-base)',
                        padding: '10px 0',
                        cursor: 'pointer',
                        userSelect: 'none'
                      }}
                    >
                      <span>{industry || 'Select Industry'}</span>
                      <svg 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        style={{ 
                          width: 16, 
                          height: 16, 
                          color: 'var(--text-secondary)',
                          transform: industryDropdownOpen ? 'rotate(180deg)' : 'none',
                          transition: 'transform 0.2s ease',
                          pointerEvents: 'none'
                        }}
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
                <div className="search-field" ref={educationRef}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: '#2563eb' }}>
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                    <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/>
                  </svg>
                  <div style={{ position: 'relative', flex: 1, width: '100%' }}>
                    <div
                      onClick={() => setEducationDropdownOpen(!educationDropdownOpen)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: education ? 'var(--text-primary)' : 'var(--text-tertiary)',
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: 'var(--fs-base)',
                        padding: '10px 0',
                        cursor: 'pointer',
                        userSelect: 'none'
                      }}
                    >
                      <span>{education || 'Select Education'}</span>
                      <svg 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        style={{ 
                          width: 16, 
                          height: 16, 
                          color: 'var(--text-secondary)',
                          transform: educationDropdownOpen ? 'rotate(180deg)' : 'none',
                          transition: 'transform 0.2s ease',
                          pointerEvents: 'none'
                        }}
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
                <div className="search-field">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
                  {t.searchBtn}
                </button>
              </form>
            </div>

            <div className="hero-tags">
              <span>{t.popular}:</span>
              <span className="hero-tag" onClick={() => quickSearch('Fitter')}>Fitter</span>
              <span className="hero-tag" onClick={() => quickSearch('Welder')}>Welder</span>
              <span className="hero-tag" onClick={() => quickSearch('CNC Operator')}>CNC Operator</span>
              <span className="hero-tag" onClick={() => quickSearch('Electrician')}>Electrician</span>
              <span className="hero-tag" onClick={() => quickSearch('Helper')}>Helper</span>
            </div>
          </div>
        </div>
      </section>

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
                <div className="category-header">
                  <div className="category-icon">{cat.icon}</div>
                  <h3>{cat.name}</h3>
                </div>
                <p className="category-count-text">
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
                <div className="qualification-header">
                  <span className="qualification-icon">{q.icon}</span>
                  <h4>{q.name}</h4>
                </div>
                <p className="qualification-count-text">
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
            {initialHospitalCategories.map((q, i) => (
              <div
                key={q.name}
                className={`qualification-card color-index-${i % 6}`}
                onClick={() => navigate(`/jobs?keyword=${encodeURIComponent(q.name)}`)}
              >
                <div className="qualification-header">
                  <span className="qualification-icon">{q.icon}</span>
                  <h4>{q.name}</h4>
                </div>
                <p className="qualification-count-text">
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
            {initialHotelCategories.map((q, i) => (
              <div
                key={q.name}
                className={`qualification-card color-index-${(i + 2) % 6}`}
                onClick={() => navigate(`/jobs?keyword=${encodeURIComponent(q.name)}`)}
              >
                <div className="qualification-header">
                  <span className="qualification-icon">{q.icon}</span>
                  <h4>{q.name}</h4>
                </div>
                <p className="qualification-count-text">
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
            {initialSchoolCategories.map((q, i) => (
              <div
                key={q.name}
                className={`qualification-card color-index-${(i + 4) % 6}`}
                onClick={() => navigate(`/jobs?keyword=${encodeURIComponent(q.name)}`)}
              >
                <div className="qualification-header">
                  <span className="qualification-icon">{q.icon}</span>
                  <h4>{q.name}</h4>
                </div>
                <p className="qualification-count-text">
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

      <hr className="section-divider" />

      {/* CTA */}
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
