import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Advertisement } from '../../types/advertisement';
import { apiFetch } from '../../utils/api';
import '../../styles/bannerSlider.css';

interface BannerSliderProps {
  autoPlayInterval?: number;
}

const DEFAULT_PROMOTIONAL_BANNERS: Advertisement[] = [
  {
    id: 'db-default-1',
    owner_type: 'ADMIN',
    owner_id: 'system',
    title: '⚡ Mega Walk-In Drive 2026 - 500+ Openings in Chakan MIDC',
    description: 'Spot offers for ITI Fitters, Welders, CNC Operators & Machine Helpers. Free bus & canteen facility provided.',
    banner_image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=70&fm=webp',
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
    banner_image: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=70&fm=webp',
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
    banner_image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=70&fm=webp',
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
    banner_image: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=70&fm=webp',
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

export const BannerSlider: React.FC<BannerSliderProps> = ({ autoPlayInterval = 4500 }) => {
  const navigate = useNavigate();
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const isTouchDevice = useRef(false);
  const trackedAdIds = useRef<Set<string>>(new Set());

  const filterValidNonExpiredBanners = useCallback((ads: Advertisement[]): Advertisement[] => {
    const now = Date.now();
    return ads.filter(ad => {
      if (ad.is_active === false) return false;
      const status = (ad.status || ad.approval_status || '').toUpperCase();
      if (status !== 'APPROVED' && status !== 'PUBLISHED') return false;

      if (ad.end_date) {
        const endTime = new Date(ad.end_date).getTime();
        if (!isNaN(endTime) && endTime <= now) {
          return false;
        }
      }

      if (ad.start_date) {
        const startTime = new Date(ad.start_date).getTime();
        if (!isNaN(startTime) && startTime > now + 3600000) {
          return false;
        }
      }

      return true;
    });
  }, []);

  useEffect(() => {
    let isMounted = true;
    apiFetch('/api/v1/home/advertisements')
      .then(async (adRes) => {
        if (!isMounted) return;
        if (adRes && adRes.ok) {
          const json = await adRes.json();
          if (json.success && Array.isArray(json.data)) {
            const activeDbBanners = filterValidNonExpiredBanners(json.data);
            setAdvertisements(activeDbBanners.length > 0 ? activeDbBanners : DEFAULT_PROMOTIONAL_BANNERS);
          } else {
            setAdvertisements(DEFAULT_PROMOTIONAL_BANNERS);
          }
        } else {
          setAdvertisements(DEFAULT_PROMOTIONAL_BANNERS);
        }
      })
      .catch(() => {
        if (isMounted) setAdvertisements(DEFAULT_PROMOTIONAL_BANNERS);
      });

    return () => { isMounted = false; };
  }, [filterValidNonExpiredBanners]);

  const activeCount = advertisements.length;

  const nextSlide = useCallback(() => {
    if (activeCount === 0) return;
    setCurrentIndex((prev) => (prev + 1) % activeCount);
  }, [activeCount]);

  const prevSlide = useCallback(() => {
    if (activeCount === 0) return;
    setCurrentIndex((prev) => (prev - 1 + activeCount) % activeCount);
  }, [activeCount]);

  useEffect(() => {
    if (isHovered || activeCount <= 1) return;
    const timer = setInterval(() => {
      nextSlide();
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [isHovered, activeCount, autoPlayInterval, nextSlide]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      prevSlide();
    } else if (e.key === 'ArrowRight') {
      nextSlide();
    }
  };

  const handleMouseEnter = () => {
    if (!isTouchDevice.current) setIsHovered(true);
  };

  const handleMouseLeave = () => {
    if (!isTouchDevice.current) setIsHovered(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    isTouchDevice.current = true;
    setIsHovered(true);
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current !== null && touchEndX.current !== null) {
      const diffX = touchStartX.current - touchEndX.current;
      const minSwipeDistance = 40;
      if (diffX > minSwipeDistance) {
        nextSlide();
      } else if (diffX < -minSwipeDistance) {
        prevSlide();
      }
    }
    touchStartX.current = null;
    touchEndX.current = null;
    
    setTimeout(() => {
      setIsHovered(false);
      isTouchDevice.current = false;
    }, 400);
  };

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

  if (advertisements.length === 0) return null;

  return (
    <div className="banner-slider-container">
      <div
        className="banner-slider-wrapper"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="banner-slides-track"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {advertisements.map((ad, idx) => {
            const rawUri = ad.banner_image?.trim();
            const validUri = rawUri && rawUri.length > 5 ? rawUri : 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80';
            const badgeText = (ad.advertisement_type || 'PROMOTIONAL').replace(/_/g, ' ');

            return (
              <div
                key={ad.id || idx}
                className="banner-slide"
                onClick={() => handleBannerClick(ad)}
              >
                <img
                  src={validUri}
                  alt={ad.title}
                  className="banner-bg-image"
                  loading={idx === 0 ? 'eager' : 'lazy'}
                />

                <div className="banner-gradient-overlay" />

                <div className="banner-content">
                  <div className="promo-badge-orange">
                    {badgeText}
                  </div>

                  <h2 className="banner-title">{ad.title}</h2>

                  {ad.description && <p className="banner-desc">{ad.description}</p>}

                  <button className="promo-action-btn-blue" onClick={(e) => { e.stopPropagation(); handleBannerClick(ad); }}>
                    <span>{ad.button_text || 'Apply Now'}</span>
                    <ArrowRight size={14} color="#FFFFFF" strokeWidth={2.2} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {advertisements.length > 1 && (
        <div className="banner-dots-row">
          {advertisements.map((_, idx) => (
            <button
              key={idx}
              className={`banner-dot-item ${idx === currentIndex ? 'active' : ''}`}
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
  );
};
