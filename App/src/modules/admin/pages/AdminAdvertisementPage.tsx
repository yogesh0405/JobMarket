import React, { useState, useEffect } from 'react';
import { Advertisement, AdvertisementType, AdvertisementPriority, AdvertisementAnalytics } from '../../../types/advertisement';
import { apiFetch } from '../../../utils/api';
import { useToast } from '../../../hooks/useToast';
import '../../../styles/bannerSlider.css';

export const AdminAdvertisementPage: React.FC = () => {
  const { showToast } = useToast();
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [analytics, setAnalytics] = useState<AdvertisementAnalytics | null>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'live' | 'unpublished' | 'past' | 'all' | 'analytics'>('pending');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [previewAd, setPreviewAd] = useState<Advertisement | null>(null);
  const [rejectingAd, setRejectingAd] = useState<Advertisement | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [unpublishingAd, setUnpublishingAd] = useState<Advertisement | null>(null);
  const [unpublishReason, setUnpublishReason] = useState('');
  const [approvingAd, setApprovingAd] = useState<Advertisement | null>(null);
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);

  // Admin Direct Banner Creation Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [bannerImage, setBannerImage] = useState('');
  const [advertisementType, setAdvertisementType] = useState<AdvertisementType>('ADMIN_ANNOUNCEMENT');
  const [redirectUrl, setRedirectUrl] = useState('');
  const [buttonText, setButtonText] = useState('Learn More');
  const [priority, setPriority] = useState<AdvertisementPriority>('HIGH');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [targetAudience, setTargetAudience] = useState('All Platform Users');

  const [submittingActionKey, setSubmittingActionKey] = useState<string | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const renderSpinner = (color = 'currentColor') => (
    <svg style={{ animation: 'spin 0.8s linear infinite', width: '13px', height: '13px', display: 'inline-block', verticalAlign: 'middle', marginRight: '5px' }} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="3" opacity="0.25" />
      <path fill={color} d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [adsRes, analyticsRes] = await Promise.all([
        apiFetch(`/api/v1/admin/advertisements${statusFilter !== 'ALL' ? `?status=${statusFilter}` : ''}`),
        apiFetch('/api/v1/admin/advertisements/analytics'),
      ]);

      if (adsRes.ok) {
        const json = await adsRes.json();
        if (json.success) setAdvertisements(json.data);
      }
      if (analyticsRes.ok) {
        const json = await analyticsRes.json();
        if (json.success) setAnalytics(json.data);
      }
    } catch (err) {
      console.error('Error loading admin advertisements:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  // Handle Approve Confirm
  const handleConfirmApprove = async () => {
    if (!approvingAd || submittingActionKey || isSubmittingAction) return;
    const id = approvingAd.id;
    setSubmittingActionKey(`approve-${id}`);
    setIsSubmittingAction(true);
    try {
      const res = await apiFetch(`/api/v1/admin/advertisements/${id}/approve`, {
        method: 'PATCH',
      });
      const json = await res.json();
      if (res.ok && json.success) {
        showToast('Advertisement approved and published to homepage!', 'success');
        window.dispatchEvent(new CustomEvent('notifications-updated'));
        setApprovingAd(null);
        if (previewAd?.id === id) setPreviewAd(null);
        loadData();
      } else {
        showToast(json.message || 'Failed to approve advertisement', 'error');
      }
    } catch (err) {
      showToast('Error approving advertisement', 'error');
    } finally {
      setSubmittingActionKey(null);
      setIsSubmittingAction(false);
    }
  };

  // Handle Reject Submit
  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submittingActionKey || isSubmittingAction) return;
    if (!rejectingAd || !rejectionReason.trim()) {
      showToast('Please provide a valid rejection reason', 'warning');
      return;
    }

    const adId = rejectingAd.id;
    setSubmittingActionKey(`reject-${adId}`);
    setIsSubmittingAction(true);
    try {
      const res = await apiFetch(`/api/v1/admin/advertisements/${adId}/reject`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectionReason.trim() }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        showToast('Advertisement rejected and employer notified', 'info');
        window.dispatchEvent(new CustomEvent('notifications-updated'));
        setRejectingAd(null);
        setRejectionReason('');
        if (previewAd?.id === adId) setPreviewAd(null);
        loadData();
      } else {
        showToast(json.message || 'Failed to reject advertisement', 'error');
      }
    } catch (err) {
      showToast('Error rejecting advertisement', 'error');
    } finally {
      setSubmittingActionKey(null);
      setIsSubmittingAction(false);
    }
  };

  // Handle Unpublish Submit with Reason
  const handleUnpublishSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submittingActionKey || isSubmittingAction) return;
    if (!unpublishingAd) return;

    const adId = unpublishingAd.id;
    setSubmittingActionKey(`unpublish-${adId}`);
    setIsSubmittingAction(true);
    try {
      const res = await apiFetch(`/api/v1/admin/advertisements/${adId}/unpublish`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: unpublishReason.trim() }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        showToast('Advertisement banner unpublished and employer notified', 'info');
        window.dispatchEvent(new CustomEvent('notifications-updated'));
        setUnpublishingAd(null);
        setUnpublishReason('');
        if (previewAd?.id === adId) setPreviewAd(null);
        loadData();
      } else {
        showToast(json.message || 'Failed to unpublish advertisement', 'error');
      }
    } catch (err) {
      showToast('Error unpublishing advertisement', 'error');
    } finally {
      setSubmittingActionKey(null);
      setIsSubmittingAction(false);
    }
  };

  // Handle Delete
  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this banner?')) return;

    setSubmittingActionKey(`delete-${id}`);
    try {
      const res = await apiFetch(`/api/v1/admin/advertisements/${id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (res.ok && json.success) {
        showToast('Advertisement banner deleted', 'info');
        window.dispatchEvent(new CustomEvent('notifications-updated'));
        if (previewAd?.id === id) setPreviewAd(null);
        loadData();
      } else {
        showToast(json.message || 'Failed to delete advertisement', 'error');
      }
    } catch (err) {
      showToast('Error deleting advertisement', 'error');
    } finally {
      setSubmittingActionKey(null);
    }
  };

  // Handle Admin Direct Banner Creation
  const openCreateModal = () => {
    setTitle('');
    setDescription('');
    setBannerImage('');
    setAdvertisementType('ADMIN_ANNOUNCEMENT');
    setRedirectUrl('');
    setButtonText('Learn More');
    setPriority('HIGH');
    setTargetAudience('All Platform Users');

    const now = new Date();
    const future = new Date();
    future.setDate(now.getDate() + 30);

    setStartDate(now.toISOString().slice(0, 16));
    setEndDate(future.toISOString().slice(0, 16));

    setCreateModalOpen(true);
  };

  const handleCreateAdminBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submittingActionKey === 'create-banner') return;

    if (!title.trim()) { showToast('Title required', 'warning'); return; }
    if (!startDate || !endDate) { showToast('Valid dates required', 'warning'); return; }

    setSubmittingActionKey('create-banner');
    try {
      const defaultImage = 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80';
      const payload: any = {
        title,
        description: description || undefined,
        banner_image: bannerImage && bannerImage.trim().length > 5 ? bannerImage.trim() : defaultImage,
        advertisement_type: advertisementType,
        redirect_url: redirectUrl || undefined,
        button_text: buttonText || 'Learn More',
        priority,
        start_date: new Date(startDate).toISOString(),
        end_date: new Date(endDate).toISOString(),
        target_audience: targetAudience || undefined,
        status: 'APPROVED', // Admin created ads are auto-approved
      };

      const res = await apiFetch('/api/v1/admin/advertisements', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        showToast('Admin announcement banner published live!', 'success');
        window.dispatchEvent(new CustomEvent('notifications-updated'));
        setCreateModalOpen(false);
        setTitle('');
        setDescription('');
        setBannerImage('');
        setRedirectUrl('');
        loadData();
      } else {
        showToast(json.message || 'Failed to create banner', 'error');
      }
    } catch (err) {
      showToast('Error creating announcement banner', 'error');
    } finally {
      setSubmittingActionKey(null);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image exceeds 5MB max size', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setBannerImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const isAdLive = (ad: Advertisement) => {
    const isLiveStatus = (ad.status === 'APPROVED' || ad.status === 'PUBLISHED') && ad.is_active === true;
    const notExpired = !ad.end_date || new Date(ad.end_date).getTime() >= new Date().getTime();
    return isLiveStatus && notExpired;
  };

  const isAdPending = (ad: Advertisement) => {
    return ad.status === 'PENDING_APPROVAL' || ad.status === 'SUBMITTED' || ad.status === 'RESUBMITTED';
  };

  const isAdUnpublished = (ad: Advertisement) => {
    if (isAdPending(ad) || isAdLive(ad)) return false;
    return ad.status === 'UNPUBLISHED' || (!ad.is_active && (ad.status === 'DRAFT' || ad.status === 'APPROVED' || ad.status === 'PUBLISHED'));
  };

  const isAdPast = (ad: Advertisement) => {
    if (isAdPending(ad) || isAdLive(ad)) return false;
    const isExpired = ad.status === 'EXPIRED' || (ad.end_date && new Date(ad.end_date).getTime() < new Date().getTime());
    return isExpired || ad.status === 'REJECTED';
  };

  const countPending = advertisements.filter((ad) => isAdPending(ad)).length;
  const countLive = advertisements.filter((ad) => isAdLive(ad)).length;
  const countUnpublished = advertisements.filter((ad) => isAdUnpublished(ad)).length;
  const countPast = advertisements.filter((ad) => isAdPast(ad)).length;

  // Filter list per tab
  const displayedAds = advertisements.filter((ad) => {
    if (activeTab === 'pending') {
      return isAdPending(ad);
    }
    if (activeTab === 'live') {
      return isAdLive(ad);
    }
    if (activeTab === 'unpublished') {
      return isAdUnpublished(ad);
    }
    if (activeTab === 'past') {
      return isAdPast(ad);
    }
    return true;
  });

  const getStatusPill = (status: string, ad?: Advertisement) => {
    if (ad && isAdLive(ad)) {
      return <span style={{ background: '#dcfce7', color: '#15803d', padding: '4px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 'bold' }}>Live / Active</span>;
    }
    if (ad && isAdUnpublished(ad)) {
      return <span style={{ background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a', padding: '4px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 'bold' }}>Unpublished</span>;
    }
    if (ad && ad.end_date && new Date(ad.end_date).getTime() < new Date().getTime()) {
      return <span style={{ background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca', padding: '4px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 'bold' }}>Expired</span>;
    }
    switch (status) {
      case 'APPROVED':
      case 'PUBLISHED':
        return <span style={{ background: '#dcfce7', color: '#15803d', padding: '4px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 'bold' }}>Live / Active</span>;
      case 'RESUBMITTED':
        return <span style={{ background: '#e0e7ff', color: '#3730a3', padding: '4px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 'bold' }}>Resubmitted</span>;
      case 'PENDING_APPROVAL':
      case 'SUBMITTED':
        return <span style={{ background: '#fef3c7', color: '#b45309', padding: '4px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 'bold' }}>Pending Approval</span>;
      case 'REJECTED':
        return <span style={{ background: '#fee2e2', color: '#b91c1c', padding: '4px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 'bold' }}>Rejected</span>;
      case 'EXPIRED':
        return <span style={{ background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca', padding: '4px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 'bold' }}>Expired</span>;
      case 'UNPUBLISHED':
        return <span style={{ background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a', padding: '4px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 'bold' }}>Unpublished</span>;
      case 'DRAFT':
      case 'INACTIVE':
      default:
        return <span style={{ background: '#f1f5f9', color: '#475569', padding: '4px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 'bold' }}>Inactive / Draft</span>;
    }
  };

  return (
    <div style={{ padding: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-primary)' }}>
            Advertisement & Banner Moderation
          </h1>
          <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Review employer banner submissions, approve homepage placements, and track performance analytics.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          style={{ padding: '10px 20px', background: 'var(--primary, #2563eb)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <span>+ Create Admin Announcement Banner</span>
        </button>
      </div>

      {/* System Analytics Overview Cards */}
      {isLoading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '120px', gap: '12px', background: 'white', borderRadius: '14px', border: '1px solid #e2e8f0', marginBottom: '2rem' }}>
          <div style={{ width: '28px', height: '28px', border: '3px solid #e2e8f0', borderTop: '3px solid #2563eb', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
          <span style={{ fontSize: '14px', fontWeight: '600', color: '#64748b' }}>Fetching real-time advertisement analytics from database...</span>
        </div>
      ) : analytics && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ background: 'white', padding: '1.25rem', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>Total Banners</div>
            <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#1e293b', marginTop: '4px' }}>{analytics.total_advertisements}</div>
          </div>
          <div style={{ background: 'white', padding: '1.25rem', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>Pending Moderation</div>
            <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#d97706', marginTop: '4px' }}>{analytics.pending_approval}</div>
          </div>
          <div style={{ background: 'white', padding: '1.25rem', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>Live Homepage Ads</div>
            <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#16a34a', marginTop: '4px' }}>{analytics.active_advertisements}</div>
          </div>
          <div style={{ background: 'white', padding: '1.25rem', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>System Total Views</div>
            <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#2563eb', marginTop: '4px' }}>{analytics.total_views.toLocaleString()}</div>
          </div>
          <div style={{ background: 'white', padding: '1.25rem', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>System Total Clicks</div>
            <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#9333ea', marginTop: '4px' }}>{analytics.total_clicks.toLocaleString()}</div>
          </div>
          <div style={{ background: 'white', padding: '1.25rem', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>Platform Avg CTR</div>
            <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0284c7', marginTop: '4px' }}>{analytics.avg_ctr}%</div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.75rem', borderBottom: '2px solid #e2e8f0', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveTab('pending')}
          style={{ padding: '10px 16px', background: 'none', border: 'none', borderBottom: activeTab === 'pending' ? '3px solid #2563eb' : 'none', fontWeight: 'bold', color: activeTab === 'pending' ? '#2563eb' : '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <span>Pending Approvals</span>
          {countPending > 0 && (
            <span style={{ background: '#ef4444', color: 'white', borderRadius: '999px', padding: '2px 8px', fontSize: '11px' }}>{countPending}</span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('live')}
          style={{ padding: '10px 16px', background: 'none', border: 'none', borderBottom: activeTab === 'live' ? '3px solid #16a34a' : 'none', fontWeight: 'bold', color: activeTab === 'live' ? '#16a34a' : '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <span>Live Banners</span>
          {countLive > 0 && (
            <span style={{ background: '#16a34a', color: 'white', borderRadius: '999px', padding: '2px 8px', fontSize: '11px' }}>{countLive}</span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('unpublished')}
          style={{ padding: '10px 16px', background: 'none', border: 'none', borderBottom: activeTab === 'unpublished' ? '3px solid #d97706' : 'none', fontWeight: 'bold', color: activeTab === 'unpublished' ? '#d97706' : '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <span>Unpublished Banners</span>
          {countUnpublished > 0 && (
            <span style={{ background: '#d97706', color: 'white', borderRadius: '999px', padding: '2px 8px', fontSize: '11px' }}>{countUnpublished}</span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('past')}
          style={{ padding: '10px 16px', background: 'none', border: 'none', borderBottom: activeTab === 'past' ? '3px solid #64748b' : 'none', fontWeight: 'bold', color: activeTab === 'past' ? '#0f172a' : '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <span>Past & Expired Banners</span>
          {countPast > 0 && (
            <span style={{ background: '#94a3b8', color: 'white', borderRadius: '999px', padding: '2px 8px', fontSize: '11px' }}>{countPast}</span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('all')}
          style={{ padding: '10px 16px', background: 'none', border: 'none', borderBottom: activeTab === 'all' ? '3px solid #2563eb' : 'none', fontWeight: 'bold', color: activeTab === 'all' ? '#2563eb' : '#64748b', cursor: 'pointer' }}
        >
          All Advertisements ({advertisements.length})
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          style={{ padding: '10px 16px', background: 'none', border: 'none', borderBottom: activeTab === 'analytics' ? '3px solid #2563eb' : 'none', fontWeight: 'bold', color: activeTab === 'analytics' ? '#2563eb' : '#64748b', cursor: 'pointer' }}
        >
          Top Performing Ads
        </button>
      </div>

      {/* Main Content View */}
      {activeTab === 'analytics' ? (
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.5rem' }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.2rem', fontWeight: '700' }}>Top 5 Most Clicked Banners</h3>
          {analytics?.top_clicked && analytics.top_clicked.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {analytics.top_clicked.map((top, idx) => (
                <div key={top.id || idx} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#64748b', width: '24px' }}>#{idx + 1}</div>
                  <div style={{ width: '90px', height: '50px', borderRadius: '8px', overflow: 'hidden', background: '#0f172a' }}>
                    <img
                      src={top.banner_image && top.banner_image.trim().length > 5 ? top.banner_image.trim() : 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80'}
                      alt={top.title}
                      onError={(e) => { (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80'; }}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '700', color: '#1e293b' }}>{top.title}</div>
                    <div style={{ fontSize: '12px', color: '#2563eb', fontWeight: 'bold' }}>{top.advertisement_type.replace('_', ' ')}</div>
                  </div>
                  <div style={{ textAlign: 'right', display: 'flex', gap: '1.5rem' }}>
                    <div><div style={{ fontSize: '10px', color: '#64748b', fontWeight: 'bold' }}>VIEWS</div><div style={{ fontSize: '1rem', fontWeight: '800' }}>{top.views_count}</div></div>
                    <div><div style={{ fontSize: '10px', color: '#64748b', fontWeight: 'bold' }}>CLICKS</div><div style={{ fontSize: '1rem', fontWeight: '800', color: '#9333ea' }}>{top.clicks_count}</div></div>
                    <div><div style={{ fontSize: '10px', color: '#64748b', fontWeight: 'bold' }}>CTR</div><div style={{ fontSize: '1rem', fontWeight: '800', color: '#16a34a' }}>{top.ctr}%</div></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ color: '#64748b' }}>No analytics data logged yet.</div>
          )}
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          {isLoading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Loading advertisement requests...</div>
          ) : displayedAds.length === 0 ? (
            <div style={{ padding: '4rem 2rem', textAlign: 'center', color: '#64748b' }}>
              <h3>No {activeTab === 'pending' ? 'Pending' : ''} Advertisements Found</h3>
              <p style={{ fontSize: '0.9rem' }}>All submitted employer banners have been processed.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ padding: '14px 16px', fontWeight: '700' }}>Banner</th>
                    <th style={{ padding: '14px 16px', fontWeight: '700' }}>Title & Type</th>
                    <th style={{ padding: '14px 16px', fontWeight: '700' }}>Owner / Employer</th>
                    <th style={{ padding: '14px 16px', fontWeight: '700' }}>Priority & Status</th>
                    <th style={{ padding: '14px 16px', fontWeight: '700' }}>Publish Schedule</th>
                    <th style={{ padding: '14px 16px', fontWeight: '700', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedAds.map((ad) => (
                    <tr key={ad.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      {/* Banner Thumbnail */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ width: '110px', height: '55px', borderRadius: '8px', overflow: 'hidden', background: '#0f172a', cursor: 'pointer' }} onClick={() => setPreviewAd(ad)}>
                          <img
                            src={ad.banner_image && ad.banner_image.trim().length > 5 ? ad.banner_image.trim() : 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80'}
                            alt={ad.title}
                            onError={(e) => { (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80'; }}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        </div>
                      </td>

                      {/* Title & Type */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: '700', color: '#1e293b', marginBottom: '2px' }}>{ad.title}</div>
                        <div style={{ fontSize: '12px', color: '#2563eb', fontWeight: 'bold' }}>{ad.advertisement_type.replace('_', ' ')}</div>
                      </td>

                      {/* Employer */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: '700', color: '#1e293b' }}>{ad.company_name || ad.employer_name || (ad.owner_type === 'ADMIN' ? 'Platform Admin' : 'Employer')}</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>{ad.owner_type}</div>
                      </td>

                      {/* Priority & Status */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ marginBottom: '4px' }}>{getStatusPill(ad.status, ad)}</div>
                        <div style={{ fontSize: '11px', color: '#475569', fontWeight: 'bold' }}>Priority: {ad.priority}</div>
                      </td>

                      {/* Schedule Dates */}
                      <td style={{ padding: '14px 16px', fontSize: '12px', color: '#64748b' }}>
                        <div>From: {new Date(ad.start_date).toLocaleDateString()}</div>
                        <div>To: {new Date(ad.end_date).toLocaleDateString()}</div>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                          <button
                            onClick={() => setPreviewAd(ad)}
                            style={{ background: '#f8fafc', color: '#334155', border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}
                          >
                            Preview
                          </button>

                          {/* 1. Pending / Resubmitted Actions */}
                          {isAdPending(ad) && (
                            <>
                              <button
                                onClick={() => setApprovingAd(ad)}
                                disabled={!!submittingActionKey}
                                style={{ background: '#16a34a', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px', display: 'inline-flex', alignItems: 'center' }}
                              >
                                {submittingActionKey === `approve-${ad.id}` && renderSpinner('white')}
                                Approve
                              </button>
                              <button
                                onClick={() => { setRejectingAd(ad); setRejectionReason(''); }}
                                disabled={!!submittingActionKey}
                                style={{ background: '#dc2626', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px', display: 'inline-flex', alignItems: 'center' }}
                              >
                                {submittingActionKey === `reject-${ad.id}` && renderSpinner('white')}
                                Reject
                              </button>
                            </>
                          )}

                          {/* 2. Live Active Banner Actions: ONLY UNPUBLISH (Live banners cannot be deleted) */}
                          {isAdLive(ad) && (
                            <button
                              onClick={() => { setUnpublishingAd(ad); setUnpublishReason(''); }}
                              disabled={!!submittingActionKey}
                              style={{ background: '#d97706', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px', display: 'inline-flex', alignItems: 'center' }}
                            >
                              {submittingActionKey === `unpublish-${ad.id}` && renderSpinner('white')}
                              Unpublish
                            </button>
                          )}

                          {/* 3. Unpublished Banner Actions: ONLY PUBLISH (No delete option in unpublished section) */}
                          {isAdUnpublished(ad) && (
                            <button
                              onClick={() => setApprovingAd(ad)}
                              disabled={!!submittingActionKey}
                              style={{ background: '#2563eb', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px', display: 'inline-flex', alignItems: 'center' }}
                            >
                              {submittingActionKey === `approve-${ad.id}` && renderSpinner('white')}
                              Publish Live
                            </button>
                          )}

                          {/* 4. Past / Expired Actions: Can Re-publish and CAN DELETE */}
                          {isAdPast(ad) && (
                            <>
                              <button
                                onClick={() => setApprovingAd(ad)}
                                disabled={!!submittingActionKey}
                                style={{ background: '#2563eb', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px', display: 'inline-flex', alignItems: 'center' }}
                              >
                                {submittingActionKey === `approve-${ad.id}` && renderSpinner('white')}
                                Re-publish
                              </button>
                              <button
                                onClick={() => handleDelete(ad.id)}
                                disabled={!!submittingActionKey}
                                style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px', display: 'inline-flex', alignItems: 'center' }}
                              >
                                {submittingActionKey === `delete-${ad.id}` && renderSpinner('#dc2626')}
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* PREVIEW MODAL */}
      {previewAd && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: 'white', borderRadius: '24px', width: '100%', maxWidth: '850px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.35rem', fontWeight: '800' }}>Banner Homepage Live Preview</h3>
                <p style={{ margin: '2px 0 0 0', color: '#64748b', fontSize: '0.85rem' }}>Exact visual rendering on the JobMarket homepage hero section</p>
              </div>
              <button onClick={() => setPreviewAd(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
            </div>

            {/* Exact rendered Banner Card Preview */}
            <div style={{ borderRadius: '20px', overflow: 'hidden', height: '280px', position: 'relative', background: '#0f172a', marginBottom: '1.5rem', boxShadow: '0 12px 32px rgba(15, 23, 42, 0.25)' }}>
              <img
                src={
                  previewAd.banner_image && previewAd.banner_image.trim().length > 5
                    ? previewAd.banner_image.trim()
                    : 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80'
                }
                alt={previewAd.title}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80';
                }}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
              />
              {/* Dark Gradient Overlay */}
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(15, 23, 42, 0.92) 0%, rgba(15, 23, 42, 0.6) 65%, transparent 100%)', zIndex: 2 }} />

              {/* Slide Content Overlay */}
              <div style={{ position: 'absolute', inset: 0, zIndex: 3, padding: '24px 32px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', color: '#ffffff', maxWidth: '580px' }}>
                <span style={{ background: '#2563eb', color: '#ffffff', padding: '4px 12px', borderRadius: '999px', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px', boxShadow: '0 2px 8px rgba(37, 99, 235, 0.4)' }}>
                  {previewAd.advertisement_type.replace('_', ' ')}
                </span>
                <h2 style={{ fontSize: '1.7rem', fontWeight: '800', color: '#ffffff', margin: '0 0 8px 0', lineHeight: 1.2, textShadow: '0 2px 6px rgba(0,0,0,0.7)' }}>
                  {previewAd.title}
                </h2>
                {previewAd.description && (
                  <p style={{ fontSize: '0.92rem', color: 'rgba(255,255,255,0.9)', margin: '0 0 18px 0', lineHeight: 1.45, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}>
                    {previewAd.description}
                  </p>
                )}
                <button type="button" style={{ padding: '10px 22px', background: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.35)', cursor: 'default' }}>
                  <span>{previewAd.button_text || 'Apply Now'}</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Details Table */}
            <div style={{ background: '#f8fafc', borderRadius: '14px', padding: '1.25rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '13px', marginBottom: '1.5rem' }}>
              <div><strong>Owner / Employer:</strong> {previewAd.company_name || previewAd.employer_name || 'Admin'}</div>
              <div><strong>Status:</strong> {previewAd.status}</div>
              <div><strong>Linked Job:</strong> {previewAd.job_title ? `${previewAd.job_title} (${previewAd.job_location})` : 'None (External Redirect)'}</div>
              <div><strong>Priority:</strong> {previewAd.priority}</div>
            </div>

            {/* Metadata Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem', background: '#f8fafc', padding: '1.25rem', borderRadius: '12px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Title</span>
                <p style={{ margin: '2px 0 0 0', fontWeight: '600', color: '#0f172a' }}>{previewAd.title}</p>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Target Audience</span>
                <p style={{ margin: '2px 0 0 0', fontWeight: '600', color: '#0f172a' }}>{previewAd.target_audience || 'All Platform Users'}</p>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Priority Level</span>
                <p style={{ margin: '2px 0 0 0', fontWeight: '600', color: '#0f172a' }}>{previewAd.priority}</p>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Created By</span>
                <p style={{ margin: '2px 0 0 0', fontWeight: '600', color: '#0f172a' }}>{previewAd.owner_type === 'ADMIN' ? '🛡️ Admin' : '🏢 Employer'}</p>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Date Range</span>
                <p style={{ margin: '2px 0 0 0', fontWeight: '600', color: '#0f172a', fontSize: '0.85rem' }}>
                  {previewAd.start_date ? new Date(previewAd.start_date).toLocaleDateString() : 'Immediate'} - {previewAd.end_date ? new Date(previewAd.end_date).toLocaleDateString() : 'Continuous'}
                </p>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Call to Action</span>
                <p style={{ margin: '2px 0 0 0', fontWeight: '600', color: '#2563eb', fontSize: '0.85rem' }}>
                  {previewAd.button_text || 'Learn More'} &rarr; <span style={{ color: '#64748b', fontSize: '0.8rem' }}>({previewAd.redirect_url})</span>
                </p>
              </div>
            </div>

            {previewAd.description && (
              <div style={{ marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Description / Caption</span>
                <p style={{ margin: '4px 0 0 0', color: '#334155', lineHeight: '1.5' }}>{previewAd.description}</p>
              </div>
            )}

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem', flexWrap: 'wrap' }}>
              {/* 1. Pending Submissions */}
              {isAdPending(previewAd) && (
                <>
                  <button
                    onClick={() => setApprovingAd(previewAd)}
                    disabled={!!submittingActionKey}
                    style={{ padding: '10px 22px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}
                  >
                    {submittingActionKey === `approve-${previewAd.id}` && renderSpinner('white')}
                    Approve & Publish Live
                  </button>
                  <button
                    onClick={() => { setRejectingAd(previewAd); setRejectionReason(''); }}
                    disabled={!!submittingActionKey}
                    style={{ padding: '10px 22px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}
                  >
                    {submittingActionKey === `reject-${previewAd.id}` && renderSpinner('white')}
                    Reject Submission
                  </button>
                </>
              )}

              {/* 2. Live Active Banner: ONLY Unpublish (Cannot Delete Live Banners) */}
              {isAdLive(previewAd) && (
                <button
                  onClick={() => { setUnpublishingAd(previewAd); setUnpublishReason(''); }}
                  disabled={!!submittingActionKey}
                  style={{ padding: '10px 22px', background: '#d97706', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}
                >
                  {submittingActionKey === `unpublish-${previewAd.id}` && renderSpinner('white')}
                  Unpublish Banner
                </button>
              )}

              {/* 3. Unpublished Banner: ONLY Publish (No delete option in unpublished section) */}
              {isAdUnpublished(previewAd) && (
                <button
                  onClick={() => setApprovingAd(previewAd)}
                  disabled={!!submittingActionKey}
                  style={{ padding: '10px 22px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}
                >
                  {submittingActionKey === `approve-${previewAd.id}` && renderSpinner('white')}
                  Publish Live
                </button>
              )}

              {/* 4. Past & Expired Banners: Can Re-publish or Delete */}
              {isAdPast(previewAd) && (
                <>
                  <button
                    onClick={() => setApprovingAd(previewAd)}
                    disabled={!!submittingActionKey}
                    style={{ padding: '10px 22px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}
                  >
                    {submittingActionKey === `approve-${previewAd.id}` && renderSpinner('white')}
                    Re-publish Live
                  </button>
                  <button
                    onClick={() => handleDelete(previewAd.id)}
                    disabled={!!submittingActionKey}
                    style={{ padding: '10px 22px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}
                  >
                    {submittingActionKey === `delete-${previewAd.id}` && renderSpinner('#dc2626')}
                    Delete Banner
                  </button>
                </>
              )}

              <button onClick={() => setPreviewAd(null)} style={{ padding: '10px 20px', background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECTION REASON MODAL */}
      {rejectingAd && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: 'white', borderRadius: '20px', width: '100%', maxWidth: '500px', padding: '2rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem', fontWeight: '800', color: '#dc2626' }}>
              Reject Advertisement Submission
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1rem' }}>
              Provide a clear reason for rejecting "{rejectingAd.title}". The employer will receive an automated notification to revise and resubmit.
            </p>

            <form onSubmit={handleRejectSubmit}>
              <textarea
                required
                rows={4}
                placeholder="e.g., Banner image resolution is low / Text on banner contains misleading salary information."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', marginBottom: '1.25rem', fontFamily: 'inherit' }}
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button
                  type="button"
                  disabled={!!submittingActionKey || isSubmittingAction}
                  onClick={() => setRejectingAd(null)}
                  style={{ padding: '8px 16px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: 'bold', cursor: (submittingActionKey || isSubmittingAction) ? 'not-allowed' : 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!!submittingActionKey || isSubmittingAction}
                  style={{
                    padding: '8px 20px',
                    background: (submittingActionKey || isSubmittingAction) ? '#94a3b8' : '#dc2626',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    cursor: (submittingActionKey || isSubmittingAction) ? 'not-allowed' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  {(submittingActionKey === `reject-${rejectingAd.id}` || isSubmittingAction) && renderSpinner('white')}
                  {(submittingActionKey === `reject-${rejectingAd.id}` || isSubmittingAction) ? 'Rejecting...' : 'Confirm Rejection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* UNPUBLISH REASON MODAL */}
      {unpublishingAd && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: 'white', borderRadius: '20px', width: '100%', maxWidth: '500px', padding: '2rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem', fontWeight: '800', color: '#d97706' }}>
              Unpublish Advertisement Banner
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1rem' }}>
              Provide a reason for unpublishing "{unpublishingAd.title}". The banner will be taken down from the homepage and the employer will receive an email and in-app notice.
            </p>

            <form onSubmit={handleUnpublishSubmit}>
              <textarea
                required
                rows={4}
                placeholder="e.g., Campaign duration ended / Moderation policy violation / Promotional banner content out of date."
                value={unpublishReason}
                onChange={(e) => setUnpublishReason(e.target.value)}
                style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', marginBottom: '1.25rem', fontFamily: 'inherit' }}
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button
                  type="button"
                  disabled={!!submittingActionKey || isSubmittingAction}
                  onClick={() => setUnpublishingAd(null)}
                  style={{ padding: '8px 16px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: 'bold', cursor: (submittingActionKey || isSubmittingAction) ? 'not-allowed' : 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!!submittingActionKey || isSubmittingAction}
                  style={{
                    padding: '8px 20px',
                    background: (submittingActionKey || isSubmittingAction) ? '#94a3b8' : '#d97706',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    cursor: (submittingActionKey || isSubmittingAction) ? 'not-allowed' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  {(submittingActionKey === `unpublish-${unpublishingAd.id}` || isSubmittingAction) && renderSpinner('white')}
                  {(submittingActionKey === `unpublish-${unpublishingAd.id}` || isSubmittingAction) ? 'Unpublishing...' : 'Confirm Unpublish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* APPROVAL & PUBLICATION CONFIRMATION MODAL */}
      {approvingAd && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: 'white', borderRadius: '16px', width: '100%', maxWidth: '520px', padding: '1.75rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.25rem' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800', color: '#0f172a' }}>
                  Approve & Publish Advertisement
                </h3>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  Live homepage publication confirmation
                </span>
              </div>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 14px', marginBottom: '1.25rem' }}>
              <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '0.95rem', marginBottom: '4px' }}>
                {approvingAd.title}
              </div>
              <div style={{ fontSize: '0.825rem', color: '#64748b' }}>
                Owner: <span style={{ fontWeight: '600', color: '#334155' }}>{approvingAd.company_name || approvingAd.employer_name || approvingAd.owner_type || 'Employer'}</span>
              </div>
              {approvingAd.job_title && (
                <div style={{ fontSize: '0.825rem', color: '#64748b', marginTop: '2px' }}>
                  Linked Job: <span style={{ fontWeight: '600', color: '#334155' }}>{approvingAd.job_title}</span>
                </div>
              )}
            </div>

            <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: '1.5', margin: '0 0 1.5rem 0' }}>
              Are you sure you want to approve this advertisement? It will go live immediately on the platform's homepage carousel and an approval confirmation email with in-app notification will be sent to the employer.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                disabled={!!submittingActionKey || isSubmittingAction}
                onClick={() => setApprovingAd(null)}
                style={{ padding: '9px 18px', background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: 'bold', fontSize: '13px', cursor: (submittingActionKey || isSubmittingAction) ? 'not-allowed' : 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!!submittingActionKey || isSubmittingAction}
                onClick={handleConfirmApprove}
                style={{
                  padding: '9px 22px',
                  background: (submittingActionKey || isSubmittingAction) ? '#94a3b8' : '#16a34a',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  fontSize: '13px',
                  cursor: (submittingActionKey || isSubmittingAction) ? 'not-allowed' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                {(submittingActionKey === `approve-${approvingAd.id}` || isSubmittingAction) && renderSpinner('white')}
                {(submittingActionKey === `approve-${approvingAd.id}` || isSubmittingAction) ? 'Publishing Live...' : 'Confirm & Publish Live'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADMIN DIRECT BANNER CREATION MODAL */}
      {createModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: 'white', borderRadius: '20px', width: '100%', maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.35rem', fontWeight: '800' }}>Create Admin Announcement Banner</h3>
              <button onClick={() => setCreateModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleAdminCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Image Upload */}
              <div>
                <label style={{ display: 'block', fontWeight: '700', marginBottom: '6px', fontSize: '13px' }}>Banner Image *</label>
                {bannerImage ? (
                  <div style={{ position: 'relative', width: '100%', height: '160px', borderRadius: '12px', overflow: 'hidden', background: '#0f172a' }}>
                    <img src={bannerImage} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button type="button" onClick={() => setBannerImage('')} style={{ position: 'absolute', top: '10px', right: '10px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer' }}>✕</button>
                  </div>
                ) : (
                  <div onClick={() => fileInputRef.current?.click()} style={{ border: '2px dashed #2563eb', borderRadius: '12px', padding: '1.5rem', textAlign: 'center', background: '#eff6ff', cursor: 'pointer' }}>
                    <div style={{ fontWeight: '700', color: '#2563eb' }}>Click to upload admin banner image</div>
                  </div>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
              </div>

              {/* Title & Type */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: '700', marginBottom: '6px', fontSize: '13px' }}>Banner Title *</label>
                  <input type="text" required placeholder="e.g. Mega Job Fair 2026 - Pune" value={title} onChange={(e) => setTitle(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: '700', marginBottom: '6px', fontSize: '13px' }}>Banner Type</label>
                  <select value={advertisementType} onChange={(e) => setAdvertisementType(e.target.value as AdvertisementType)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                    <option value="ADMIN_ANNOUNCEMENT">Admin Announcement</option>
                    <option value="PLATFORM_UPDATE">Platform Update</option>
                    <option value="HIRING_EVENT">Mega Hiring Event</option>
                    <option value="GOVERNMENT_JOB">Government Job Drive</option>
                    <option value="PROMOTIONAL_BANNER">Platform Promotion</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label style={{ display: 'block', fontWeight: '700', marginBottom: '6px', fontSize: '13px' }}>Short Description</label>
                <textarea rows={2} placeholder="Optional short summary..." value={description} onChange={(e) => setDescription(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontFamily: 'inherit' }} />
              </div>

              {/* Redirect URL & Button Text */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: '700', marginBottom: '6px', fontSize: '13px' }}>Redirect URL or Route</label>
                  <input type="text" placeholder="/jobs or https://..." value={redirectUrl} onChange={(e) => setRedirectUrl(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: '700', marginBottom: '6px', fontSize: '13px' }}>Button CTA Text</label>
                  <input type="text" placeholder="Learn More / Register Now" value={buttonText} onChange={(e) => setButtonText(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                </div>
              </div>

              {/* Start & End Dates */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: '700', marginBottom: '6px', fontSize: '13px' }}>Start Date *</label>
                  <input type="datetime-local" required value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: '700', marginBottom: '6px', fontSize: '13px' }}>End Date *</label>
                  <input type="datetime-local" required value={endDate} onChange={(e) => setEndDate(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setCreateModalOpen(false)} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', fontWeight: 'bold' }}>Cancel</button>
                <button
                  type="submit"
                  disabled={submittingActionKey === 'create-banner'}
                  style={{
                    padding: '10px 24px',
                    borderRadius: '8px',
                    background: submittingActionKey === 'create-banner' ? '#94a3b8' : '#2563eb',
                    color: 'white',
                    border: 'none',
                    fontWeight: 'bold',
                    cursor: submittingActionKey === 'create-banner' ? 'not-allowed' : 'pointer',
                    opacity: submittingActionKey === 'create-banner' ? 0.7 : 1,
                  }}
                >
                  {submittingActionKey === 'create-banner' ? (
                    <>
                      {renderSpinner('#ffffff')} Publishing Banner...
                    </>
                  ) : (
                    'Publish Banner to Homepage'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
