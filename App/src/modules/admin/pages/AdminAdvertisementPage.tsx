import React, { useState, useEffect } from 'react';
import { Advertisement, AdvertisementType, AdvertisementPriority, AdvertisementAnalytics } from '../../../types/advertisement';
import { apiFetch } from '../../../utils/api';
import { useToast } from '../../../hooks/useToast';
import '../../../styles/bannerSlider.css';

export const AdminAdvertisementPage: React.FC = () => {
  const { showToast } = useToast();
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [analytics, setAnalytics] = useState<AdvertisementAnalytics | null>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'all' | 'analytics'>('pending');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [previewAd, setPreviewAd] = useState<Advertisement | null>(null);
  const [rejectingAd, setRejectingAd] = useState<Advertisement | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
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

  // Handle Approve
  const handleApprove = async (id: string) => {
    setSubmittingActionKey(`approve-${id}`);
    try {
      const res = await apiFetch(`/api/v1/admin/advertisements/${id}/approve`, {
        method: 'PATCH',
      });
      const json = await res.json();
      if (res.ok && json.success) {
        showToast('Advertisement approved and published to homepage!', 'success');
        window.dispatchEvent(new CustomEvent('notifications-updated'));
        if (previewAd?.id === id) setPreviewAd(null);
        loadData();
      } else {
        showToast(json.message || 'Failed to approve advertisement', 'error');
      }
    } catch (err) {
      showToast('Error approving advertisement', 'error');
    } finally {
      setSubmittingActionKey(null);
    }
  };

  // Handle Reject Submit
  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingAd || !rejectionReason.trim()) {
      showToast('Please provide a valid rejection reason', 'warning');
      return;
    }

    setSubmittingActionKey(`reject-${rejectingAd.id}`);
    try {
      const res = await apiFetch(`/api/v1/admin/advertisements/${rejectingAd.id}/reject`, {
        method: 'PATCH',
        body: JSON.stringify({ reason: rejectionReason }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        showToast('Advertisement rejected and employer notified', 'info');
        window.dispatchEvent(new CustomEvent('notifications-updated'));
        setRejectingAd(null);
        setRejectionReason('');
        if (previewAd?.id === rejectingAd.id) setPreviewAd(null);
        loadData();
      } else {
        showToast(json.message || 'Failed to reject advertisement', 'error');
      }
    } catch (err) {
      showToast('Error rejecting advertisement', 'error');
    } finally {
      setSubmittingActionKey(null);
    }
  };

  // Handle Unpublish (Live Banners -> Set to Inactive/Unpublished)
  const handleUnpublish = async (id: string) => {
    if (!window.confirm('Unpublish this advertisement banner from the homepage?')) return;
    setSubmittingActionKey(`unpublish-${id}`);
    try {
      const res = await apiFetch(`/api/v1/admin/advertisements/${id}/unpublish`, {
        method: 'PATCH',
      });
      const json = await res.json();
      if (res.ok && json.success) {
        showToast('Advertisement unpublished (Set to Inactive)', 'info');
        window.dispatchEvent(new CustomEvent('notifications-updated'));
        if (previewAd?.id === id) setPreviewAd(null);
        loadData();
      } else {
        showToast(json.message || 'Failed to unpublish advertisement', 'error');
      }
    } catch (err) {
      showToast('Error unpublishing advertisement', 'error');
    } finally {
      setSubmittingActionKey(null);
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

  const handleAdminCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) { showToast('Title required', 'warning'); return; }
    if (!bannerImage) { showToast('Banner image required', 'warning'); return; }
    if (!startDate || !endDate) { showToast('Valid dates required', 'warning'); return; }

    setSubmittingActionKey('create-banner');
    try {
      const payload = {
        title,
        description,
        banner_image: bannerImage,
        advertisement_type: advertisementType,
        redirect_url: redirectUrl || undefined,
        button_text: buttonText,
        priority,
        start_date: new Date(startDate).toISOString(),
        end_date: new Date(endDate).toISOString(),
        target_audience: targetAudience,
        status: 'APPROVED', // Admin banners auto-published
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

  // Filter list per tab
  const displayedAds = advertisements.filter((ad) => {
    if (activeTab === 'pending') {
      return ad.status === 'PENDING_APPROVAL' || ad.status === 'SUBMITTED';
    }
    return true;
  });

  const getStatusPill = (status: string) => {
    switch (status) {
      case 'APPROVED':
      case 'PUBLISHED':
        return <span style={{ background: '#dcfce7', color: '#15803d', padding: '4px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 'bold' }}>Live / Active</span>;
      case 'PENDING_APPROVAL':
      case 'SUBMITTED':
        return <span style={{ background: '#fef3c7', color: '#b45309', padding: '4px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 'bold' }}>Pending Approval</span>;
      case 'REJECTED':
        return <span style={{ background: '#fee2e2', color: '#b91c1c', padding: '4px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 'bold' }}>Rejected</span>;
      case 'DRAFT':
      case 'UNPUBLISHED':
      case 'INACTIVE':
      default:
        return <span style={{ background: '#f1f5f9', color: '#475569', padding: '4px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 'bold' }}>Inactive / Unpublished</span>;
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
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '2px solid #e2e8f0', marginBottom: '1.5rem' }}>
        <button
          onClick={() => setActiveTab('pending')}
          style={{ padding: '10px 16px', background: 'none', border: 'none', borderBottom: activeTab === 'pending' ? '3px solid #2563eb' : 'none', fontWeight: 'bold', color: activeTab === 'pending' ? '#2563eb' : '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <span>Pending Approvals</span>
          {analytics && analytics.pending_approval > 0 && (
            <span style={{ background: '#ef4444', color: 'white', borderRadius: '999px', padding: '2px 8px', fontSize: '11px' }}>{analytics.pending_approval}</span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('all')}
          style={{ padding: '10px 16px', background: 'none', border: 'none', borderBottom: activeTab === 'all' ? '3px solid #2563eb' : 'none', fontWeight: 'bold', color: activeTab === 'all' ? '#2563eb' : '#64748b', cursor: 'pointer' }}
        >
          All Advertisements
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
                    <img src={top.banner_image} alt={top.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
                          <img src={ad.banner_image} alt={ad.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
                        <div style={{ marginBottom: '4px' }}>{getStatusPill(ad.status)}</div>
                        <div style={{ fontSize: '11px', color: '#475569', fontWeight: 'bold' }}>Priority: {ad.priority}</div>
                      </td>

                      {/* Schedule Dates */}
                      <td style={{ padding: '14px 16px', fontSize: '12px', color: '#64748b' }}>
                        <div>From: {new Date(ad.start_date).toLocaleDateString()}</div>
                        <div>To: {new Date(ad.end_date).toLocaleDateString()}</div>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => setPreviewAd(ad)}
                            style={{ background: '#f8fafc', color: '#334155', border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}
                          >
                            Preview
                          </button>
                          {/* Action Buttons per Status Rules */}
                          {(ad.status === 'PENDING_APPROVAL' || ad.status === 'SUBMITTED' || ad.status === 'DRAFT' || ad.status === 'EXPIRED') && (
                            <button
                              onClick={() => handleApprove(ad.id)}
                              disabled={!!submittingActionKey}
                              style={{ background: '#16a34a', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px', display: 'inline-flex', alignItems: 'center' }}
                            >
                              {submittingActionKey === `approve-${ad.id}` && renderSpinner('white')}
                              {ad.status === 'DRAFT' || ad.status === 'EXPIRED' ? 'Publish' : 'Approve'}
                            </button>
                          )}
                          {(ad.status === 'PENDING_APPROVAL' || ad.status === 'SUBMITTED') && (
                            <button
                              onClick={() => { setRejectingAd(ad); setRejectionReason(''); }}
                              disabled={!!submittingActionKey}
                              style={{ background: '#dc2626', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px', display: 'inline-flex', alignItems: 'center' }}
                            >
                              {submittingActionKey === `reject-${ad.id}` && renderSpinner('white')}
                              Reject
                            </button>
                          )}
                          {(ad.status === 'APPROVED' || ad.status === 'PUBLISHED') && (
                            <button
                              onClick={() => handleUnpublish(ad.id)}
                              disabled={!!submittingActionKey}
                              style={{ background: '#d97706', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px', display: 'inline-flex', alignItems: 'center' }}
                            >
                              {submittingActionKey === `unpublish-${ad.id}` && renderSpinner('white')}
                              Unpublish
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(ad.id)}
                            disabled={!!submittingActionKey}
                            style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px', display: 'inline-flex', alignItems: 'center' }}
                          >
                            {submittingActionKey === `delete-${ad.id}` && renderSpinner('#dc2626')}
                            Delete
                          </button>
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
              {previewAd.banner_image ? (
                <img src={previewAd.banner_image} alt={previewAd.title} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #2563eb 100%)' }} />
              )}
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
              <div><strong>Start Date:</strong> {new Date(previewAd.start_date).toLocaleString()}</div>
              <div><strong>Expiry Date:</strong> {new Date(previewAd.end_date).toLocaleString()}</div>
              <div><strong>Target Audience:</strong> {previewAd.target_audience || 'All Candidates'}</div>
              <div><strong>Redirect Destination:</strong> {previewAd.linked_job_id ? `/job/${previewAd.linked_job_id}` : previewAd.redirect_url || '/jobs'}</div>
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              {(previewAd.status === 'PENDING_APPROVAL' || previewAd.status === 'SUBMITTED' || previewAd.status === 'DRAFT' || previewAd.status === 'EXPIRED') && (
                <button
                  onClick={() => handleApprove(previewAd.id)}
                  disabled={!!submittingActionKey}
                  style={{ padding: '10px 22px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}
                >
                  {submittingActionKey === `approve-${previewAd.id}` && renderSpinner('white')}
                  {previewAd.status === 'DRAFT' || previewAd.status === 'EXPIRED' ? 'Publish Now' : 'Approve & Publish Now'}
                </button>
              )}
              {(previewAd.status === 'PENDING_APPROVAL' || previewAd.status === 'SUBMITTED') && (
                <button
                  onClick={() => { setRejectingAd(previewAd); setRejectionReason(''); }}
                  disabled={!!submittingActionKey}
                  style={{ padding: '10px 22px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}
                >
                  {submittingActionKey === `reject-${previewAd.id}` && renderSpinner('white')}
                  Reject Submission
                </button>
              )}
              {(previewAd.status === 'APPROVED' || previewAd.status === 'PUBLISHED') && (
                <button
                  onClick={() => handleUnpublish(previewAd.id)}
                  disabled={!!submittingActionKey}
                  style={{ padding: '10px 22px', background: '#d97706', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}
                >
                  {submittingActionKey === `unpublish-${previewAd.id}` && renderSpinner('white')}
                  Unpublish Banner
                </button>
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
                  onClick={() => setRejectingAd(null)}
                  style={{ padding: '8px 16px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAction}
                  style={{ padding: '8px 20px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  {isSubmittingAction ? 'Rejecting...' : 'Confirm Rejection'}
                </button>
              </div>
            </form>
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
                <button type="submit" disabled={isSubmittingAction} style={{ padding: '10px 24px', borderRadius: '8px', background: '#2563eb', color: 'white', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
                  {isSubmittingAction ? 'Publishing...' : 'Publish Banner to Homepage'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
