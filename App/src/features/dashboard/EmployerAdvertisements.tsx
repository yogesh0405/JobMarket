import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Megaphone,
  CheckCircle2,
  Clock,
  Eye,
  MousePointerClick,
  TrendingUp,
  Calendar,
  Briefcase,
  Plus,
  Trash2,
  Edit,
  BarChart3,
  AlertCircle,
  Sparkles,
  ExternalLink,
  Layers,
  Check,
  X,
  ArrowRight,
  ArrowLeft,
  EyeOff,
  RotateCw,
  XCircle,
} from 'lucide-react';
import { Advertisement, AdvertisementType, AdvertisementPriority, AdvertisementAnalytics } from '../../types/advertisement';
import { apiFetch } from '../../utils/api';
import { useToast } from '../../hooks/useToast';
import { Job } from '../../types';

interface EmployerAdvertisementsProps {
  employerJobs: Job[];
}

type FilterStatus = 'ALL' | 'LIVE' | 'REVIEW' | 'REJECTED' | 'UNPUBLISHED' | 'PAST';

export const EmployerAdvertisements: React.FC<EmployerAdvertisementsProps> = ({ employerJobs }) => {
  const { showToast } = useToast();
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [analytics, setAnalytics] = useState<AdvertisementAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('ALL');

  // Modal states
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<Advertisement | null>(null);
  const [selectedAdForAnalytics, setSelectedAdForAnalytics] = useState<Advertisement | null>(null);
  const [loadingFreshAnalytics, setLoadingFreshAnalytics] = useState(false);

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [bannerImage, setBannerImage] = useState('');
  const [advertisementType, setAdvertisementType] = useState<AdvertisementType>('FEATURED_JOB');
  const [linkedJobId, setLinkedJobId] = useState('');
  const [redirectUrl, setRedirectUrl] = useState('');
  const [buttonText, setButtonText] = useState('Apply Now');
  const [priority, setPriority] = useState<AdvertisementPriority>('MEDIUM');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const renderSpinner = (color = 'currentColor') => (
    <svg style={{ animation: 'spin 0.8s linear infinite', width: '13px', height: '13px', display: 'inline-block', verticalAlign: 'middle', marginRight: '5px' }} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="3" opacity="0.25" />
      <path fill={color} d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );

  // Helper Predicates (100% Match to Mobile App Lifecycle)
  const isAdLive = (b: Advertisement) => {
    const s = (b.status || (b as any).approval_status || '').toUpperCase();
    const isApproved = s === 'APPROVED' || s === 'PUBLISHED';
    const notExpired = !b.end_date || new Date(b.end_date).getTime() >= new Date().getTime();
    return isApproved && b.is_active === true && notExpired;
  };

  const isAdPast = (b: Advertisement) => {
    const s = (b.status || (b as any).approval_status || '').toUpperCase();
    const isExpiredStatus = s === 'EXPIRED';
    const isDateExpired = b.end_date ? new Date(b.end_date).getTime() < new Date().getTime() : false;
    return isExpiredStatus || isDateExpired;
  };

  const isAdRejected = (b: Advertisement) => {
    const s = (b.status || (b as any).approval_status || '').toUpperCase();
    return s === 'REJECTED';
  };

  const isAdResubmitted = (b: Advertisement) => {
    const s = (b.status || (b as any).approval_status || '').toUpperCase();
    return s === 'RESUBMITTED';
  };

  const isAdUnpublished = (b: Advertisement) => {
    if (isAdLive(b) || isAdPast(b) || isAdRejected(b)) return false;
    const s = (b.status || (b as any).approval_status || '').toUpperCase();
    return s === 'UNPUBLISHED' || ((s === 'DRAFT' || s === 'APPROVED' || s === 'PUBLISHED') && b.is_active === false);
  };

  const isAdReview = (b: Advertisement) => {
    return !isAdLive(b) && !isAdPast(b) && !isAdRejected(b) && !isAdUnpublished(b);
  };

  const loadData = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const [adsRes, analyticsRes] = await Promise.all([
        apiFetch('/api/v1/employer/advertisements'),
        apiFetch('/api/v1/employer/advertisements/analytics'),
      ]);

      if (adsRes.ok) {
        const json = await adsRes.json();
        if (json.success && Array.isArray(json.data)) setAdvertisements(json.data);
      }
      if (analyticsRes.ok) {
        const json = await analyticsRes.json();
        if (json.success) setAnalytics(json.data);
      }
    } catch (err) {
      console.error('Error loading employer advertisements:', err);
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, []);

  // Initial Load + Real-Time 5-Second Polling (exact match to Mobile App)
  useEffect(() => {
    loadData(false);
    const interval = setInterval(() => {
      loadData(true);
    }, 5000);
    return () => clearInterval(interval);
  }, [loadData]);

  // Real-Time Analytics Polling (4-second interval when analytics modal is open)
  useEffect(() => {
    if (!selectedAdForAnalytics) return;
    const adId = selectedAdForAnalytics.id;
    const fetchFresh = async (silent = false) => {
      if (!silent) setLoadingFreshAnalytics(true);
      try {
        const res = await apiFetch(`/api/v1/employer/advertisements/${adId}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            setSelectedAdForAnalytics(json.data);
          }
        }
      } catch {
      } finally {
        if (!silent) setLoadingFreshAnalytics(false);
      }
    };

    fetchFresh(false);
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchFresh(true);
      }
    }, 15000);
    return () => clearInterval(timer);
  }, [selectedAdForAnalytics?.id]);

  // Filtered ads list (100% Real Database Lifecycle)
  const filteredAds = useMemo(() => {
    if (filterStatus === 'LIVE') return advertisements.filter(isAdLive);
    if (filterStatus === 'REVIEW') return advertisements.filter(isAdReview);
    if (filterStatus === 'REJECTED') return advertisements.filter(isAdRejected);
    if (filterStatus === 'UNPUBLISHED') return advertisements.filter(isAdUnpublished);
    if (filterStatus === 'PAST') return advertisements.filter(isAdPast);
    return advertisements;
  }, [advertisements, filterStatus]);

  // Status counts for tabs
  const statusCounts = useMemo(() => {
    return {
      all: advertisements.length,
      live: advertisements.filter(isAdLive).length,
      review: advertisements.filter(isAdReview).length,
      rejected: advertisements.filter(isAdRejected).length,
      unpublished: advertisements.filter(isAdUnpublished).length,
      past: advertisements.filter(isAdPast).length,
    };
  }, [advertisements]);

  // Preset default dates for new ads (starts today, ends in 14 days)
  const openCreateModal = () => {
    setEditingAd(null);
    setTitle('');
    setDescription('');
    setBannerImage('');
    setAdvertisementType('FEATURED_JOB');
    setLinkedJobId('');
    setRedirectUrl('');
    setButtonText('Apply Now');
    setPriority('MEDIUM');
    setTargetAudience('');

    const now = new Date();
    const future = new Date();
    future.setDate(now.getDate() + 14);

    setStartDate(now.toISOString().slice(0, 16));
    setEndDate(future.toISOString().slice(0, 16));

    setFormModalOpen(true);
  };

  const openEditModal = (ad: Advertisement) => {
    setEditingAd(ad);
    setTitle(ad.title);
    setDescription(ad.description || '');
    setBannerImage(ad.banner_image);
    setAdvertisementType(ad.advertisement_type);
    setLinkedJobId(ad.linked_job_id || '');
    setRedirectUrl(ad.redirect_url || '');
    setButtonText(ad.button_text || 'Apply Now');
    setPriority(ad.priority);
    setTargetAudience(ad.target_audience || '');

    setStartDate(new Date(ad.start_date).toISOString().slice(0, 16));
    setEndDate(new Date(ad.end_date).toISOString().slice(0, 16));

    setFormModalOpen(true);
  };

  // Image Upload Handler (PNG, JPG, WEBP < 5MB)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast('Image size exceeds maximum 5MB limit', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setBannerImage(result);
      showToast('Banner image uploaded successfully', 'success');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!title.trim()) {
      showToast('Please enter an advertisement title', 'warning');
      return;
    }
    if (!startDate || !endDate) {
      showToast('Please select valid start and end dates', 'warning');
      return;
    }
    if (new Date(endDate) <= new Date(startDate)) {
      showToast('End date must be after start date', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title,
        description,
        banner_image: bannerImage,
        advertisement_type: advertisementType,
        linked_job_id: linkedJobId || undefined,
        redirect_url: redirectUrl || undefined,
        button_text: buttonText,
        priority,
        start_date: new Date(startDate).toISOString(),
        end_date: new Date(endDate).toISOString(),
        target_audience: targetAudience,
      };

      const url = editingAd
        ? `/api/v1/employer/advertisements/${editingAd.id}`
        : '/api/v1/employer/advertisements';
      const method = editingAd ? 'PUT' : 'POST';

      const res = await apiFetch(url, {
        method,
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        showToast(
          editingAd
            ? 'Advertisement updated and resubmitted for approval'
            : 'Advertisement created and submitted for admin review!',
          'success'
        );
        window.dispatchEvent(new CustomEvent('notifications-updated'));
        setFormModalOpen(false);
        loadData(false);
      } else {
        showToast(json.message || 'Failed to save advertisement', 'error');
      }
    } catch (err) {
      showToast('An unexpected error occurred while saving advertisement', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, bannerTitle?: string) => {
    if (!window.confirm(`Are you sure you want to delete "${bannerTitle || 'this promotional banner'}"? This action cannot be undone.`)) return;

    setSubmittingId(id);
    try {
      const res = await apiFetch(`/api/v1/employer/advertisements/${id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (res.ok && json.success) {
        showToast('Advertisement banner deleted successfully', 'info');
        loadData(false);
      } else {
        showToast(json.message || 'Failed to delete advertisement', 'error');
      }
    } catch (err) {
      showToast('Error deleting advertisement', 'error');
    } finally {
      setSubmittingId(null);
    }
  };

  const getStatusPill = (ad: Advertisement) => {
    const isLive = isAdLive(ad);
    const isPast = isAdPast(ad);
    const isRejected = isAdRejected(ad);
    const isResubmitted = isAdResubmitted(ad);
    const isUnpublished = isAdUnpublished(ad);

    if (isLive) {
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#DCFCE7', color: '#15803D', border: '1px solid #BBF7D0', padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '700' }}>
          <CheckCircle2 size={12} strokeWidth={2.4} />
          Live
        </span>
      );
    }
    if (isPast) {
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#F1F5F9', color: '#64748B', border: '1px solid #E2E8F0', padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '700' }}>
          <Calendar size={12} strokeWidth={2.4} />
          Expired
        </span>
      );
    }
    if (isResubmitted) {
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE', padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '700' }}>
          <RotateCw size={11} strokeWidth={2.5} />
          Resubmitted
        </span>
      );
    }
    if (isRejected) {
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#FEE2E2', color: '#DC2626', border: '1px solid #FECACA', padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '700' }}>
          <XCircle size={12} strokeWidth={2.4} />
          Rejected
        </span>
      );
    }
    if (isUnpublished) {
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#FEF3C7', color: '#D97706', border: '1px solid #FDE68A', padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '700' }}>
          <EyeOff size={12} strokeWidth={2.4} />
          Unpublished
        </span>
      );
    }
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#FEF3C7', color: '#B45309', border: '1px solid #FDE68A', padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '700' }}>
        <Clock size={12} strokeWidth={2.4} />
        In Review
      </span>
    );
  };

  return (
    <div className="employer-ads-container" style={{ minHeight: '100%', background: 'var(--bg-page, #F8FAFC)', padding: '0.5rem 0 2rem 0' }}>
      <style>{`
        @media (max-width: 768px) {
          .employer-ads-container {
            background: #F8FAFC !important;
            padding: 0 0 40px 0 !important;
          }
          .mobile-header-bar {
            background: #FFFFFF !important;
            border-bottom: 1px solid #E2E8F0 !important;
            padding: 12px 16px !important;
            margin: 0 !important;
            position: sticky !important;
            top: 0 !important;
            z-index: 40 !important;
          }
          .mobile-tabs-container {
            background: #FFFFFF !important;
            border-bottom: 1px solid #E2E8F0 !important;
            padding: 10px 16px !important;
            margin: 0 0 14px 0 !important;
          }
          .mobile-banners-list {
            padding: 0 16px 100px 16px !important;
            gap: 14px !important;
          }
        }
      `}</style>

      {/* Clean Mobile App Header */}
      <div className="mobile-header-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Back Navigation */}
          <Link
            to="/dashboard?tab=candidates"
            className="mobile-only-back-link"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              background: 'transparent',
              color: '#0F172A',
              border: 'none',
              textDecoration: 'none',
              cursor: 'pointer',
              boxShadow: 'none',
              padding: 0,
              flexShrink: 0
            }}
            title="Back to Dashboard"
          >
            <ArrowLeft size={22} strokeWidth={2.4} />
          </Link>

          <div>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0F172A', letterSpacing: '-0.2px', lineHeight: 1.2 }}>
              Promotional Banners
            </h2>
            <p style={{ margin: '1px 0 0 0', color: '#64748B', fontSize: '11.5px', fontWeight: '500' }}>
              Urgent hiring ads on homepage slider
            </p>
          </div>
        </div>

        <button
          onClick={openCreateModal}
          className="desktop-only-btn"
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: '9px 15px',
            background: '#2563EB',
            color: '#FFFFFF',
            fontWeight: '700',
            fontSize: '0.84rem',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)',
            transition: 'background 0.2s',
            flexShrink: 0
          }}
        >
          <Plus size={16} strokeWidth={2.5} />
          <span>Create</span>
        </button>
      </div>

      {/* Desktop Metric Strip (Desktop only) */}
      {analytics && (
        <div className="desktop-banners-metrics" style={{
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '10px',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          marginBottom: '16px',
          boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A' }}>{analytics.total_advertisements}</div>
            <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>Total Banners</div>
          </div>
          <div style={{ width: '1px', height: '24px', background: '#E2E8F0' }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '20px', fontWeight: '800', color: '#2563EB' }}>{analytics.total_views.toLocaleString()}</div>
            <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>Total Views</div>
          </div>
          <div style={{ width: '1px', height: '24px', background: '#E2E8F0' }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '20px', fontWeight: '800', color: '#059669' }}>{analytics.avg_ctr}%</div>
            <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>Avg Click Rate</div>
          </div>
        </div>
      )}

      {/* Filter Tabs Row */}
      <div className="mobile-tabs-container" style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '6px', marginBottom: '14px', scrollbarWidth: 'none' }}>
        {[
          { key: 'ALL', label: 'All', count: statusCounts.all },
          { key: 'LIVE', label: 'Live', count: statusCounts.live },
          { key: 'REVIEW', label: 'In Review', count: statusCounts.review },
          { key: 'REJECTED', label: 'Rejected', count: statusCounts.rejected },
          { key: 'UNPUBLISHED', label: 'Unpublished', count: statusCounts.unpublished },
          { key: 'PAST', label: 'Past & Expired', count: statusCounts.past },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilterStatus(tab.key as FilterStatus)}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              border: filterStatus === tab.key ? '1px solid #2563EB' : '1px solid #CBD5E1',
              background: filterStatus === tab.key ? '#2563EB' : '#FFFFFF',
              color: filterStatus === tab.key ? '#FFFFFF' : '#334155',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease'
            }}
          >
            <span>{tab.label}</span>
            <span style={{
              background: filterStatus === tab.key ? 'rgba(255,255,255,0.25)' : '#F1F5F9',
              color: filterStatus === tab.key ? '#FFFFFF' : '#64748B',
              padding: '1px 6px',
              borderRadius: '10px',
              fontSize: '11px',
              fontWeight: '800'
            }}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Advertisements List */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', background: '#FFFFFF', borderRadius: '10px', border: '1px solid #E2E8F0', color: '#64748B', fontSize: '0.9rem' }}>
          {renderSpinner('#2563EB')} Loading promotional banners...
        </div>
      ) : filteredAds.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 1.5rem', background: '#FFFFFF', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
            <Megaphone size={24} />
          </div>
          <h3 style={{ margin: '0 0 6px 0', fontSize: '1.05rem', fontWeight: '800', color: '#0F172A' }}>
            {filterStatus === 'ALL' ? 'No Promotional Banners Created Yet' : `No ${filterStatus.replace('_', ' ')} Banners Found`}
          </h3>
          <p style={{ color: '#64748B', maxWidth: '420px', margin: '0 auto 1.25rem auto', fontSize: '0.85rem', lineHeight: 1.4 }}>
            Promote your urgent plant hiring drives or walk-in interviews on the homepage hero slider for maximum reach.
          </p>
          <button
            onClick={openCreateModal}
            style={{
              padding: '9px 18px',
              background: '#2563EB',
              color: '#FFFFFF',
              borderRadius: '8px',
              fontWeight: '700',
              fontSize: '0.85rem',
              border: 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Plus size={16} />
            Create Your First Banner
          </button>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="desktop-banners-table" style={{ background: '#FFFFFF', borderRadius: '10px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                    <th style={{ padding: '12px 16px', fontWeight: '700', color: '#475569', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Banner Preview</th>
                    <th style={{ padding: '12px 16px', fontWeight: '700', color: '#475569', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Title & Type</th>
                    <th style={{ padding: '12px 16px', fontWeight: '700', color: '#475569', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</th>
                    <th style={{ padding: '12px 16px', fontWeight: '700', color: '#475569', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Schedule</th>
                    <th style={{ padding: '12px 16px', fontWeight: '700', color: '#475569', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Performance</th>
                    <th style={{ padding: '12px 16px', fontWeight: '700', color: '#475569', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAds.map((ad) => (
                    <tr key={ad.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      {/* Thumbnail */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ width: '130px', height: '65px', borderRadius: '6px', overflow: 'hidden', background: '#0F172A', position: 'relative', border: '1px solid #E2E8F0', cursor: 'pointer' }} onClick={() => setSelectedAdForAnalytics(ad)}>
                          <img
                            src={
                              ad.banner_image && ad.banner_image.trim().length > 5
                                ? ad.banner_image.trim()
                                : 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80'
                            }
                            alt={ad.title}
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src =
                                'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80';
                            }}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        </div>
                      </td>

                      {/* Title & Type */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: '800', color: '#0F172A', marginBottom: '3px' }}>{ad.title}</div>
                        <div style={{ fontSize: '12px', color: '#2563EB', fontWeight: '700' }}>
                          {(ad.advertisement_type || 'FEATURED_JOB').replace(/_/g, ' ')}
                        </div>
                        {ad.job_title && (
                          <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Briefcase size={12} color="#2563EB" />
                            <span>{ad.job_title}</span>
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td style={{ padding: '14px 16px' }}>
                        <div>{getStatusPill(ad)}</div>
                        <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px', fontWeight: '600' }}>
                          Priority: {ad.priority}
                        </div>
                      </td>

                      {/* Schedule Dates */}
                      <td style={{ padding: '14px 16px', fontSize: '12px', color: '#475569' }}>
                        <div><strong>Start:</strong> {new Date(ad.start_date).toLocaleDateString()}</div>
                        <div><strong>End:</strong> {new Date(ad.end_date).toLocaleDateString()}</div>
                      </td>

                      {/* Performance */}
                      <td style={{ padding: '14px 16px', fontSize: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px', color: '#475569' }}>
                          <Eye size={13} color="#2563EB" />
                          <span>Views: <strong>{ad.views_count || 0}</strong></span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px', color: '#475569' }}>
                          <MousePointerClick size={13} color="#16A34A" />
                          <span>Clicks: <strong>{ad.clicks_count || 0}</strong></span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#475569' }}>
                          <TrendingUp size={13} color="#7C3AED" />
                          <span>CTR: <strong>{ad.ctr || 0}%</strong></span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                          <button
                            onClick={() => setSelectedAdForAnalytics(ad)}
                            style={{ background: '#EFF6FF', color: '#2563EB', border: '1px solid #DBEAFE', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontWeight: '700', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                            <BarChart3 size={13} /> Analytics
                          </button>
                          <button
                            onClick={() => openEditModal(ad)}
                            style={{ background: '#F8FAFC', color: '#334155', border: '1px solid #CBD5E1', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontWeight: '700', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                            <Edit size={13} /> {isAdRejected(ad) || isAdUnpublished(ad) ? 'Edit & Resubmit' : 'Edit'}
                          </button>
                          {(isAdPast(ad) || isAdRejected(ad)) && (
                            <button
                              onClick={() => handleDelete(ad.id, ad.title)}
                              disabled={submittingId === ad.id}
                              style={{ background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA', padding: '6px 8px', borderRadius: '6px', cursor: 'pointer', fontWeight: '700', fontSize: '12px', display: 'inline-flex', alignItems: 'center' }}
                              title="Delete"
                            >
                              {submittingId === ad.id ? renderSpinner('#DC2626') : <Trash2 size={13} />}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Premium Mobile Cards View (100% exact match to Mobile App) */}
          <div className="mobile-banners-list" style={{ paddingBottom: '70px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {filteredAds.map((ad) => {
              const reasonText = (
                ad.rejection_reason ||
                (ad as any).rejectionReason ||
                (ad as any).unpublish_reason ||
                (ad as any).unpublishReason ||
                (ad as any).admin_reason ||
                (ad as any).adminReason ||
                (ad as any).notes ||
                (ad as any).reason ||
                ''
              ).trim();

              return (
                <div
                  key={ad.id}
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
                    display: 'flex',
                    flexDirection: 'column',
                    width: '100%',
                    boxSizing: 'border-box'
                  }}
                >
                  {/* 1. 16:9 Image Thumbnail with Badge & Status Overlays */}
                  <div style={{ position: 'relative', width: '100%', height: '145px', background: '#0F172A' }}>
                    <img
                      src={
                        ad.banner_image && ad.banner_image.trim().length > 5
                          ? ad.banner_image.trim()
                          : 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80'
                      }
                      alt={ad.title}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80';
                      }}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />

                    {/* Gradient Overlay for Title */}
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15,23,42,0.9) 0%, rgba(15,23,42,0.3) 60%, transparent 100%)' }} />

                    {/* Top Floating Badges */}
                    <div style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 2 }}>
                      <span style={{ background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)', color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.2)', padding: '3px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                        {(ad.advertisement_type || 'FEATURED_JOB').replace(/_/g, ' ')}
                      </span>
                    </div>

                    <div style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 2 }}>
                      {getStatusPill(ad)}
                    </div>

                    {/* Banner Title on Image */}
                    <div style={{ position: 'absolute', bottom: '8px', left: '10px', right: '10px', zIndex: 2 }}>
                      <div style={{ fontSize: '13.5px', fontWeight: '800', color: '#FFFFFF', textShadow: '0 1px 3px rgba(0,0,0,0.6)', lineHeight: '18px' }}>
                        {ad.title}
                      </div>
                    </div>
                  </div>

                  {/* 2. Card Details Area */}
                  <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {/* Linked Job Row */}
                    <div style={{ fontSize: '12.5px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Briefcase size={14} color="#2563EB" />
                      <span>Linked: <strong style={{ color: '#0F172A', fontWeight: '700' }}>{ad.job_title || 'Direct Application'}</strong></span>
                    </div>

                    {/* 3. Reason for Rejection Notice if applicable */}
                    {isAdRejected(ad) && (
                      <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderLeft: '3.5px solid #DC2626', borderRadius: '6px', padding: '8px 10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '3px', fontWeight: '800', color: '#991B1B', textTransform: 'uppercase', fontSize: '11.5px', letterSpacing: '0.3px' }}>
                          <AlertCircle size={13} color="#DC2626" strokeWidth={2.5} />
                          <span>Reason for Rejection</span>
                        </div>
                        <div style={{ color: '#7F1D1D', fontWeight: '500', fontSize: '12px', lineHeight: '17px' }}>
                          {reasonText || 'This advertisement banner did not meet platform guidelines. Please update the details and resubmit.'}
                        </div>
                      </div>
                    )}

                    {/* 4. Reason for Unpublishing Notice if applicable */}
                    {isAdUnpublished(ad) && (
                      <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderLeft: '3.5px solid #D97706', borderRadius: '6px', padding: '8px 10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '3px', fontWeight: '800', color: '#92400E', textTransform: 'uppercase', fontSize: '11.5px', letterSpacing: '0.3px' }}>
                          <EyeOff size={13} color="#D97706" strokeWidth={2.5} />
                          <span>Reason for Unpublishing</span>
                        </div>
                        <div style={{ color: '#78350F', fontWeight: '500', fontSize: '12px', lineHeight: '17px' }}>
                          {reasonText || 'This banner was unpublished from the homepage by an administrator. You can edit and resubmit it.'}
                        </div>
                      </div>
                    )}

                    {/* 5. Campaign Expired Notice if applicable */}
                    {isAdPast(ad) && (
                      <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderLeft: '3.5px solid #64748B', borderRadius: '6px', padding: '8px 10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '3px', fontWeight: '800', color: '#475569', textTransform: 'uppercase', fontSize: '11.5px', letterSpacing: '0.3px' }}>
                          <Calendar size={13} color="#64748B" strokeWidth={2.5} />
                          <span>Campaign Expired</span>
                        </div>
                        <div style={{ color: '#475569', fontWeight: '500', fontSize: '12px', lineHeight: '17px' }}>
                          This banner campaign duration has ended. You can update dates to resubmit or run a new campaign.
                        </div>
                      </div>
                    )}

                    {/* 6. Resubmitted Notice if applicable */}
                    {isAdResubmitted(ad) && (
                      <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderLeft: '3.5px solid #1D4ED8', borderRadius: '6px', padding: '8px 10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '3px', fontWeight: '800', color: '#1E40AF', textTransform: 'uppercase', fontSize: '11.5px', letterSpacing: '0.3px' }}>
                          <RotateCw size={12} color="#1D4ED8" strokeWidth={2.4} />
                          <span>Resubmitted for Review</span>
                        </div>
                        <div style={{ color: '#1E3A8A', fontWeight: '500', fontSize: '12px', lineHeight: '17px' }}>
                          You have resubmitted this advertisement with changes. It is currently under moderation review by administrators.
                        </div>
                      </div>
                    )}

                    {/* Date & Priority Box */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC', borderRadius: '6px', padding: '7px 10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748B', fontWeight: '600', fontSize: '12px' }}>
                        <Calendar size={13} />
                        <span>{new Date(ad.start_date).toLocaleDateString()} - {new Date(ad.end_date).toLocaleDateString()}</span>
                      </div>
                      <span style={{ fontWeight: '800', color: '#2563EB', fontSize: '11px' }}>
                        Priority: {ad.priority}
                      </span>
                    </div>

                    {/* 7. Action Buttons (Analytics, Edit, Delete) */}
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', paddingTop: '2px' }}>
                      <button
                        onClick={() => setSelectedAdForAnalytics(ad)}
                        style={{ flex: 1.2, padding: '8px 12px', borderRadius: '6px', border: '1px solid #DBEAFE', background: '#EFF6FF', color: '#2563EB', fontWeight: '700', fontSize: '12.5px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                      >
                        <BarChart3 size={14} />
                        <span>Analytics</span>
                      </button>
                      <button
                        onClick={() => openEditModal(ad)}
                        style={{ flex: 1.2, padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', background: '#FFFFFF', color: '#334155', fontWeight: '700', fontSize: '12.5px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                      >
                        <Edit size={14} />
                        <span>{isAdRejected(ad) || isAdUnpublished(ad) ? 'Edit & Resubmit' : 'Edit'}</span>
                      </button>
                      {(isAdPast(ad) || isAdRejected(ad)) && (
                        <button
                          onClick={() => handleDelete(ad.id, ad.title)}
                          disabled={submittingId === ad.id}
                          style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #FECACA', background: '#FFFFFF', color: '#DC2626', fontWeight: '700', fontSize: '12.5px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          title="Delete Banner"
                        >
                          {submittingId === ad.id ? renderSpinner('#DC2626') : <Trash2 size={14} />}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Floating Action Button (FAB) for Mobile View */}
      <button
        className="mobile-fab-btn"
        onClick={openCreateModal}
        style={{
          position: 'fixed',
          right: '20px',
          bottom: '28px',
          width: '54px',
          height: '54px',
          borderRadius: '50%',
          background: '#2563EB',
          color: '#FFFFFF',
          border: 'none',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 14px rgba(37, 99, 235, 0.45)',
          cursor: 'pointer',
          zIndex: 999,
        }}
        title="Create Promotional Banner"
      >
        <Plus size={24} strokeWidth={2.6} />
      </button>

      {/* CREATE / EDIT MODAL */}
      {formModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: 'var(--card-bg, #ffffff)', borderRadius: '16px', width: '100%', maxWidth: '680px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.35rem', fontWeight: '800' }}>
                {editingAd ? (isAdRejected(editingAd) || isAdUnpublished(editingAd) ? 'Edit & Resubmit Advertisement' : 'Edit Promotional Banner') : 'Create Promotional Banner'}
              </h3>
              <button onClick={() => setFormModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* ADMIN MODERATION FEEDBACK NOTICE WHEN EDITING REJECTED OR UNPUBLISHED */}
              {editingAd && (isAdRejected(editingAd) || isAdUnpublished(editingAd)) && (
                <div style={{ background: isAdRejected(editingAd) ? '#FEF2F2' : '#FFFBEB', border: `1px solid ${isAdRejected(editingAd) ? '#FECACA' : '#FDE68A'}`, borderLeft: `4px solid ${isAdRejected(editingAd) ? '#DC2626' : '#D97706'}`, borderRadius: '10px', padding: '14px 18px' }}>
                  <div style={{ fontSize: '12px', fontWeight: '800', color: isAdRejected(editingAd) ? '#991B1B' : '#92400E', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {isAdRejected(editingAd) ? <AlertCircle size={14} /> : <EyeOff size={14} />}
                    <span>Admin Moderation Feedback</span>
                  </div>
                  <div style={{ fontSize: '13.5px', color: isAdRejected(editingAd) ? '#7F1D1D' : '#78350F', fontWeight: '700', lineHeight: '1.4' }}>
                    {editingAd.rejection_reason || (editingAd as any).rejectionReason || (editingAd as any).unpublish_reason || (editingAd as any).unpublishReason || (editingAd as any).reason || 'Please review banner image clarity, headline, and details before resubmitting.'}
                  </div>
                  <div style={{ fontSize: '12px', color: isAdRejected(editingAd) ? '#991B1B' : '#92400E', marginTop: '6px', lineHeight: '1.4' }}>
                    Update your banner details below and click <strong>"Update & Resubmit for Approval"</strong> to send it to the admin team for priority review.
                  </div>
                </div>
              )}

              {/* Image Upload */}
              <div>
                <label style={{ display: 'block', fontWeight: '700', marginBottom: '6px', fontSize: '13px' }}>Banner Image (PNG, JPG, WEBP - Max 5MB)</label>
                {bannerImage ? (
                  <div style={{ position: 'relative', width: '100%', height: '180px', borderRadius: '10px', overflow: 'hidden', background: '#0f172a', marginBottom: '8px' }}>
                    <img src={bannerImage} alt="Banner Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button
                      type="button"
                      onClick={() => setBannerImage('')}
                      style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(239, 68, 68, 0.9)', color: 'white', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    style={{ border: '2px dashed #2563EB', borderRadius: '10px', padding: '1.5rem', textAlign: 'center', background: '#EFF6FF', cursor: 'pointer' }}
                  >
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" style={{ marginBottom: '6px' }}>
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    <div style={{ fontWeight: '700', color: '#2563EB' }}>Click to upload custom banner image (Optional)</div>
                    <div style={{ fontSize: '12px', color: '#475569', marginTop: '4px' }}>If skipped, a sleek theme gradient banner will be generated automatically.</div>
                  </div>
                )}
                <input ref={fileInputRef} type="file" accept="image/png, image/jpeg, image/webp" onChange={handleImageUpload} style={{ display: 'none' }} />
              </div>

              {/* Title & Type */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: '700', marginBottom: '6px', fontSize: '13px' }}>Banner Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mega Walk-In Drive for CNC Operators"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: '700', marginBottom: '6px', fontSize: '13px' }}>Advertisement Type *</label>
                  <select
                    value={advertisementType}
                    onChange={(e) => setAdvertisementType(e.target.value as AdvertisementType)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  >
                    <option value="FEATURED_JOB">Featured Job</option>
                    <option value="URGENT_HIRING">Urgent Hiring</option>
                    <option value="WALK_IN_DRIVE">Walk-In Drive</option>
                    <option value="COMPANY_PROMOTION">Company Promotion</option>
                    <option value="APPRENTICESHIP">Apprenticeship Drive</option>
                    <option value="INTERNSHIP">Internship Campaign</option>
                    <option value="HIRING_EVENT">Mega Recruitment Event</option>
                    <option value="GOVERNMENT_JOB">Government Job Alert</option>
                    <option value="PROMOTIONAL_BANNER">General Promotional Banner</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label style={{ display: 'block', fontWeight: '700', marginBottom: '6px', fontSize: '13px' }}>Short Description</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Spot offer for 50+ openings in Chakan MIDC with bus & canteen facility."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontFamily: 'inherit' }}
                />
              </div>

              {/* Linked Job Selection */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: '700', marginBottom: '6px', fontSize: '13px' }}>Link to Posted Job (Optional)</label>
                  <select
                    value={linkedJobId}
                    onChange={(e) => setLinkedJobId(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  >
                    <option value="">-- None (Custom Redirect) --</option>
                    {employerJobs.map((j) => (
                      <option key={j.id} value={j.id}>
                        {j.title} ({j.location})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: '700', marginBottom: '6px', fontSize: '13px' }}>Custom Redirect URL (If no job linked)</label>
                  <input
                    type="text"
                    placeholder="https://company.com/careers"
                    value={redirectUrl}
                    onChange={(e) => setRedirectUrl(e.target.value)}
                    disabled={!!linkedJobId}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', opacity: linkedJobId ? 0.6 : 1 }}
                  />
                </div>
              </div>

              {/* Button Text & Priority */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: '700', marginBottom: '6px', fontSize: '13px' }}>Button CTA Text</label>
                  <input
                    type="text"
                    placeholder="Apply Now / Register Today"
                    value={buttonText}
                    onChange={(e) => setButtonText(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: '700', marginBottom: '6px', fontSize: '13px' }}>Priority Level</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as AdvertisementPriority)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium (Standard)</option>
                    <option value="HIGH">High (Top Slider)</option>
                    <option value="CRITICAL">Critical (Urgent Alert)</option>
                  </select>
                </div>
              </div>

              {/* Start & End Dates */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: '700', marginBottom: '6px', fontSize: '13px' }}>Publish Start Date & Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: '700', marginBottom: '6px', fontSize: '13px' }}>Expiry End Date & Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              {/* REAL-TIME INTERACTIVE LIVE PREVIEW BOX */}
              <div style={{ marginTop: '6px', padding: '14px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '12.5px', fontWeight: '800', color: '#0f172a', marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    👁️ Real-Time Banner Preview
                  </span>
                  <span style={{ fontSize: '11px', color: '#2563eb', fontWeight: '700', background: '#eff6ff', padding: '2px 8px', borderRadius: '999px' }}>
                    Live Homepage View
                  </span>
                </div>

                <div style={{ position: 'relative', width: '100%', height: '160px', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(15, 23, 42, 0.12)' }}>
                  {bannerImage ? (
                    <img src={bannerImage} alt="Banner Live Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #2563eb 100%)' }} />
                  )}

                  {/* Dark gradient overlay */}
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(15, 23, 42, 0.9) 0%, rgba(15, 23, 42, 0.5) 65%, transparent 100%)' }} />

                  {/* Content overlay */}
                  <div style={{ position: 'absolute', inset: 0, padding: '16px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'center', zIndex: 10, color: '#ffffff' }}>
                    <span style={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', background: 'rgba(255, 255, 255, 0.2)', color: '#ffffff', padding: '2px 8px', borderRadius: '999px', width: 'fit-content', marginBottom: '6px' }}>
                      {advertisementType.replace(/_/g, ' ')}
                    </span>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: '800', textShadow: '0 2px 4px rgba(0,0,0,0.5)', color: '#ffffff' }}>
                      {title || 'Your Banner Title Here'}
                    </h4>
                    <p style={{ margin: '0 0 10px 0', fontSize: '12px', color: 'rgba(255,255,255,0.85)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', maxWidth: '420px' }}>
                      {description || 'Your promotional banner description will appear here on the homepage.'}
                    </p>
                    <button type="button" style={{ background: '#ffffff', color: '#1e3a8a', border: 'none', padding: '6px 14px', borderRadius: '8px', fontWeight: '800', fontSize: '12px', width: 'fit-content', cursor: 'default' }}>
                      {buttonText || 'Apply Now'} →
                    </button>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setFormModalOpen(false)}
                  style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{ padding: '10px 24px', borderRadius: '8px', background: '#2563EB', color: 'white', border: 'none', fontWeight: 'bold', cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}
                >
                  {isSubmitting && renderSpinner('white')}
                  {isSubmitting
                    ? 'Submitting...'
                    : editingAd
                    ? isAdRejected(editingAd) || isAdUnpublished(editingAd)
                      ? 'Update & Resubmit for Approval'
                      : 'Update Banner'
                    : 'Submit for Admin Approval'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REAL-TIME BANNER ANALYTICS MODAL (100% Match to Mobile App BannerAnalyticsModal) */}
      {selectedAdForAnalytics && (() => {
        const current = selectedAdForAnalytics;
        const views = Number(current.views_count ?? (current as any).views ?? 0);
        const clicks = Number(current.clicks_count ?? (current as any).clicks ?? 0);
        const ctr = views > 0 ? ((clicks / views) * 100).toFixed(2) : '0.00';

        const isLive = isAdLive(current);
        const isPast = isAdPast(current);
        const isRejected = isAdRejected(current);
        const isResubmitted = isAdResubmitted(current);
        const isUnpublished = isAdUnpublished(current);

        const reasonText = (
          current.rejection_reason ||
          (current as any).rejectionReason ||
          (current as any).unpublish_reason ||
          (current as any).unpublishReason ||
          (current as any).admin_reason ||
          (current as any).adminReason ||
          (current as any).notes ||
          (current as any).reason ||
          ''
        ).trim();

        const displayStatusLabel = isLive
          ? 'LIVE ON HOMEPAGE'
          : isPast
          ? 'EXPIRED'
          : isResubmitted
          ? 'RESUBMITTED (PENDING APPROVAL)'
          : isRejected
          ? 'REJECTED'
          : isUnpublished
          ? 'UNPUBLISHED (INACTIVE)'
          : 'IN REVIEW (PENDING APPROVAL)';

        return (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <div style={{ background: '#FFFFFF', borderRadius: '16px', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto', padding: '1.5rem', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)' }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid #F1F5F9', marginBottom: '14px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '800', color: '#0F172A' }}>Real-Time Banner Analytics</h3>
                    {loadingFreshAnalytics && <div style={{ width: '12px', height: '12px', border: '2px solid #2563EB', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />}
                  </div>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748B' }}>{current.title}</p>
                </div>
                <button onClick={() => setSelectedAdForAnalytics(null)} style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#F1F5F9', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748B' }}>✕</button>
              </div>

              {/* KPI Cards (Views, Clicks, CTR) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '16px' }}>
                <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '12px 8px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '4px' }}>
                    <div style={{ width: '26px', height: '26px', borderRadius: '6px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563EB' }}>
                      <Eye size={15} />
                    </div>
                    <span style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A' }}>{views.toLocaleString()}</span>
                  </div>
                  <div style={{ fontSize: '10.5px', color: '#64748B', fontWeight: '700' }}>Total Views</div>
                </div>

                <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '12px 8px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '4px' }}>
                    <div style={{ width: '26px', height: '26px', borderRadius: '6px', background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16A34A' }}>
                      <MousePointerClick size={15} />
                    </div>
                    <span style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A' }}>{clicks.toLocaleString()}</span>
                  </div>
                  <div style={{ fontSize: '10.5px', color: '#64748B', fontWeight: '700' }}>Total Clicks</div>
                </div>

                <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '12px 8px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '4px' }}>
                    <div style={{ width: '26px', height: '26px', borderRadius: '6px', background: '#FFFBEB', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D97706' }}>
                      <TrendingUp size={15} />
                    </div>
                    <span style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A' }}>{ctr}%</span>
                  </div>
                  <div style={{ fontSize: '10.5px', color: '#64748B', fontWeight: '700' }}>Click Rate (CTR)</div>
                </div>
              </div>

              {/* Admin Feedback Notice in Analytics if applicable */}
              {isRejected && (
                <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderLeft: '3.5px solid #DC2626', borderRadius: '6px', padding: '10px 12px', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '4px', fontWeight: '800', color: '#991B1B', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.3px' }}>
                    <AlertCircle size={13} color="#DC2626" strokeWidth={2.5} />
                    <span>Admin Rejection Reason</span>
                  </div>
                  <div style={{ color: '#7F1D1D', fontSize: '12px', fontWeight: '500', lineHeight: 1.4 }}>
                    {reasonText || 'This advertisement banner did not meet platform guidelines. Please update the details and resubmit.'}
                  </div>
                </div>
              )}

              {isUnpublished && (
                <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderLeft: '3.5px solid #D97706', borderRadius: '6px', padding: '10px 12px', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '4px', fontWeight: '800', color: '#92400E', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.3px' }}>
                    <EyeOff size={13} color="#D97706" strokeWidth={2.5} />
                    <span>Admin Unpublish Reason</span>
                  </div>
                  <div style={{ color: '#78350F', fontSize: '12px', fontWeight: '500', lineHeight: 1.4 }}>
                    {reasonText || 'This banner was unpublished from the homepage by an administrator. You can edit and resubmit it.'}
                  </div>
                </div>
              )}

              {/* Campaign Performance Specs */}
              <div style={{ background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0', padding: '12px 14px', marginBottom: '16px', fontSize: '12px' }}>
                <div style={{ fontSize: '11px', fontWeight: '800', color: '#94A3B8', letterSpacing: '0.5px', marginBottom: '8px' }}>CAMPAIGN SPECIFICATIONS</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #E2E8F0' }}>
                  <span style={{ color: '#64748B', fontWeight: '600' }}>Ad Type:</span>
                  <span style={{ fontWeight: '700', color: '#0F172A' }}>{(current.advertisement_type || 'FEATURED_JOB').replace(/_/g, ' ')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #E2E8F0' }}>
                  <span style={{ color: '#64748B', fontWeight: '600' }}>Linked Job:</span>
                  <span style={{ fontWeight: '700', color: '#0F172A' }}>{current.job_title || 'Direct Application'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #E2E8F0' }}>
                  <span style={{ color: '#64748B', fontWeight: '600' }}>Duration:</span>
                  <span style={{ fontWeight: '700', color: '#0F172A' }}>{new Date(current.start_date).toLocaleDateString()} → {new Date(current.end_date).toLocaleDateString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #E2E8F0' }}>
                  <span style={{ color: '#64748B', fontWeight: '600' }}>Target Audience:</span>
                  <span style={{ fontWeight: '700', color: '#0F172A' }}>{current.target_audience || 'All Platform Users'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0' }}>
                  <span style={{ color: '#64748B', fontWeight: '600' }}>Live Status:</span>
                  <span style={{ fontWeight: '800', color: isLive ? '#16A34A' : isResubmitted ? '#1D4ED8' : isRejected ? '#DC2626' : '#D97706' }}>
                    {displayStatusLabel}
                  </span>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <button onClick={() => setSelectedAdForAnalytics(null)} style={{ padding: '9px 20px', background: '#EFF6FF', color: '#2563EB', border: '1px solid #DBEAFE', borderRadius: '8px', fontWeight: '700', fontSize: '13px', cursor: 'pointer', width: '100%' }}>
                  Close Analytics
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
