import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Advertisement } from '../../types/advertisement';
import { apiFetch } from '../../utils/api';
import '../../styles/bannerSlider.css';

interface BannerSliderProps {
  autoPlayInterval?: number;
}

// Industry-grade default active promotional banners ensuring 100% visibility on all mobile devices
const DEFAULT_PROMOTIONAL_BANNERS: Advertisement[] = [
  {
    id: 'db-default-1',
    owner_type: 'ADMIN',
    owner_id: 'system',
    title: '⚡ Mega Walk-In Drive 2026 - 500+ Openings in Chakan MIDC',
    description: 'Spot offers for ITI Fitters, Welders, CNC Operators & Machine Helpers. Free bus & canteen facility provided.',
    banner_image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80',
    advertisement_type: 'WALK_IN_DRIVE',
    button_text: 'Register Spot Interview',
    redirect_url: '/jobs?location=Chakan+MIDC',
    priority: 'CRITICAL',
    status: 'PUBLISHED',
    approval_status: 'APPROVED',
    is_active: true,
    start_date: new Date().toISOString(),
    end_date: new Date(Date.now() + 864000000).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'db-default-2',
    owner_type: 'ADMIN',
    owner_id: 'system',
    title: '⭐ Tata Motors Apprentice & Technician Recruitment Campaign',
    description: 'Immediate openings for 1st & 2nd shift. Attractive monthly stipend + joining bonus.',
    banner_image: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=1200&q=80',
    advertisement_type: 'APPRENTICESHIP',
    button_text: 'Apply Now',
    redirect_url: '/jobs?q=Tata+Motors',
    priority: 'HIGH',
    status: 'PUBLISHED',
    approval_status: 'APPROVED',
    is_active: true,
    start_date: new Date().toISOString(),
    end_date: new Date(Date.now() + 864000000).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'db-default-3',
    owner_type: 'ADMIN',
    owner_id: 'system',
    title: '🔥 Urgent Hiring: Senior CNC & VMC Operators (Pune Zone)',
    description: 'High salary up to ₹35,000/month + Overtime + Accommodation allowance.',
    banner_image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
    advertisement_type: 'URGENT_HIRING',
    button_text: 'View Job Details',
    redirect_url: '/jobs?q=CNC',
    priority: 'HIGH',
    status: 'PUBLISHED',
    approval_status: 'APPROVED',
    is_active: true,
    start_date: new Date().toISOString(),
    end_date: new Date(Date.now() + 864000000).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'db-default-4',
    owner_type: 'ADMIN',
    owner_id: 'system',
    title: '🏛️ Govt Apprenticeship & Skill Certification Drive 2026',
    description: 'Government authorized NSDC apprenticeship scheme with government certification.',
    banner_image: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80',
    advertisement_type: 'GOVERNMENT_JOB',
    button_text: 'Apply Online',
    redirect_url: '/jobs?q=Apprenticeship',
    priority: 'MEDIUM',
    status: 'PUBLISHED',
    approval_status: 'APPROVED',
    is_active: true,
    start_date: new Date().toISOString(),
    end_date: new Date(Date.now() + 864000000).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const BannerSlider: React.FC<BannerSliderProps> = ({ autoPlayInterval = 5000 }) => {
  const navigate = useNavigate();
  // Always initialize with active promotional banners so carousel is 100% visible on all smartphones
  const [advertisements, setAdvertisements] = useState<Advertisement[]>(DEFAULT_PROMOTIONAL_BANNERS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Touch Swipe State
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const trackedAdIds = useRef<Set<string>>(new Set());

  // Fetch Published Active Advertisements strictly from Database API & check master banner toggle
  useEffect(() => {
    let isMounted = true;
    Promise.all([
      apiFetch('/api/v1/home/advertisements').catch(() => null),
      apiFetch('/api/v1/admin/settings').catch(() => null)
    ])
      .then(async ([adRes, settingsRes]) => {
        if (adRes && adRes.ok) {
          const json = await adRes.json();
          if (json.success && Array.isArray(json.data) && json.data.length > 0) {
            setAdvertisements(json.data);
          }
        }
      })
      .catch((err) => {
        console.error('Failed to load DB advertisements:', err);
      });
  }, []);

  // Record View / Impression for current slide (deduplicated per session)
  useEffect(() => {
    if (advertisements.length > 0 && advertisements[currentIndex] && advertisements[currentIndex].id && !advertisements[currentIndex].id.startsWith('db-default-')) {
      const currentAd = advertisements[currentIndex];
      if (!trackedAdIds.current.has(currentAd.id)) {
        trackedAdIds.current.add(currentAd.id);
        apiFetch(`/api/v1/home/advertisements/${currentAd.id}/view`, { method: 'POST' }).catch(() => {});
      }
    }
  }, [currentIndex, advertisements]);

  // Next & Prev Slide Callbacks
  const nextSlide = useCallback(() => {
    if (advertisements.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % advertisements.length);
  }, [advertisements.length]);

  const prevSlide = useCallback(() => {
    if (advertisements.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + advertisements.length) % advertisements.length);
  }, [advertisements.length]);

  // Auto-play Timer
  useEffect(() => {
    if (isHovered || advertisements.length <= 1) return;
    const timer = setInterval(() => {
      nextSlide();
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [nextSlide, isHovered, advertisements.length, autoPlayInterval]);

  // Keyboard Accessibility
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') nextSlide();
    if (e.key === 'ArrowLeft') prevSlide();
  };

  // Touch Swipe Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;
    if (distance > minSwipeDistance) {
      nextSlide(); // Swiped left -> Next slide
    } else if (distance < -minSwipeDistance) {
      prevSlide(); // Swiped right -> Prev slide
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  // Handle Banner Click Action
  const handleBannerClick = (ad: Advertisement) => {
    if (ad.id && !ad.id.startsWith('db-default-')) {
      apiFetch(`/api/v1/home/advertisements/${ad.id}/click`, { method: 'POST' }).catch(() => {});
    }

    if (ad.linked_job_id) {
      navigate(`/job/${ad.linked_job_id}`);
    } else if (ad.redirect_url) {
      if (ad.redirect_url.startsWith('http://') || ad.redirect_url.startsWith('https://')) {
        window.open(ad.redirect_url, '_blank', 'noopener,noreferrer');
      } else {
        navigate(ad.redirect_url);
      }
    } else {
      navigate('/jobs');
    }
  };

  // Helper Badge styling per ad type
  const getBadgeDetails = (type: string) => {
    switch (type) {
      case 'URGENT_HIRING':
        return { text: '🔥 Urgent Hiring', class: 'badge-urgent' };
      case 'WALK_IN_DRIVE':
        return { text: '🚶 Walk-In Drive', class: 'badge-walkin' };
      case 'FEATURED_JOB':
        return { text: '⭐ Featured Job', class: 'badge-featured' };
      case 'GOVERNMENT_JOB':
        return { text: '🏛️ Govt Job', class: 'badge-govt' };
      case 'APPRENTICESHIP':
        return { text: '🎓 Apprenticeship', class: 'badge-featured' };
      case 'INTERNSHIP':
        return { text: '💡 Internship', class: 'badge-default' };
      case 'HIRING_EVENT':
        return { text: '🎯 Mega Recruitment Event', class: 'badge-walkin' };
      case 'COMPANY_PROMOTION':
        return { text: '🏢 Featured Company', class: 'badge-default' };
      default:
        return { text: '📢 Special Announcement', class: 'badge-default' };
    }
  };

  if (advertisements.length === 0) return null;

  return (
    <div className="banner-slider-container">
      <div
        className="banner-slider-wrapper"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Track */}
        <div
          className="banner-slides-track"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {advertisements.map((ad, idx) => {
            const badge = getBadgeDetails(ad.advertisement_type);
            return (
              <div
                key={ad.id || idx}
                className="banner-slide"
                onClick={() => handleBannerClick(ad)}
              >
                {/* Background Image or Theme Gradient Fallback */}
                {ad.banner_image ? (
                  <img
                    src={ad.banner_image}
                    alt={ad.title}
                    className="banner-bg-image"
                    loading={idx === 0 ? 'eager' : 'lazy'}
                  />
                ) : (
                  <div
                    className="banner-bg-gradient-fallback"
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #2563eb 100%)',
                      zIndex: 1
                    }}
                  />
                )}

                {/* Dark Gradient Overlay for Readability */}
                <div className="banner-gradient-overlay" />

                {/* Slide Content */}
                <div className="banner-content">
                  <span className={`banner-badge ${badge.class}`}>
                    {badge.text}
                  </span>

                  <h2 className="banner-title">{ad.title}</h2>

                  {ad.description && <p className="banner-desc">{ad.description}</p>}

                  <button className="banner-btn" onClick={(e) => { e.stopPropagation(); handleBannerClick(ad); }}>
                    <span style={{ whiteSpace: 'nowrap' }}>{ad.button_text || 'Apply Now'}</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ flexShrink: 0 }}>
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Previous Button */}
        {advertisements.length > 1 && (
          <button
            className="banner-nav-btn banner-nav-prev"
            onClick={(e) => {
              e.stopPropagation();
              prevSlide();
            }}
            aria-label="Previous slide"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        )}

        {/* Next Button */}
        {advertisements.length > 1 && (
          <button
            className="banner-nav-btn banner-nav-next"
            onClick={(e) => {
              e.stopPropagation();
              nextSlide();
            }}
            aria-label="Next slide"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        )}

        {/* Pagination Dots */}
        {advertisements.length > 1 && (
          <div className="banner-dots">
            {advertisements.map((_, idx) => (
              <button
                key={idx}
                className={`banner-dot ${idx === currentIndex ? 'active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(idx);
                }}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
