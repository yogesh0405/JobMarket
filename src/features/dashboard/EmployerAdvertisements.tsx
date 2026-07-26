import React, { useState, useEffect, useRef } from 'react';
import { Advertisement, AdvertisementType, AdvertisementPriority, AdvertisementAnalytics } from '../../types/advertisement';
import { apiFetch } from '../../utils/api';
import { useToast } from '../../hooks/useToast';
import { Job } from '../../types';

interface EmployerAdvertisementsProps {
  employerJobs: Job[];
}

export const EmployerAdvertisements: React.FC<EmployerAdvertisementsProps> = ({ employerJobs }) => {
  const { showToast } = useToast();
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [analytics, setAnalytics] = useState<AdvertisementAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modal states
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<Advertisement | null>(null);
  const [selectedAdForAnalytics, setSelectedAdForAnalytics] = useState<Advertisement | null>(null);

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

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [adsRes, analyticsRes] = await Promise.all([
        apiFetch('/api/v1/employer/advertisements'),
        apiFetch('/api/v1/employer/advertisements/analytics'),
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
      console.error('Error loading employer advertisements:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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
        loadData();
      } else {
        showToast(json.message || 'Failed to save advertisement', 'error');
      }
    } catch (err) {
      showToast('An unexpected error occurred while saving advertisement', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this promotional banner?')) return;

    setSubmittingId(id);
    try {
      const res = await apiFetch(`/api/v1/employer/advertisements/${id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (res.ok && json.success) {
        showToast('Advertisement banner deleted successfully', 'info');
        loadData();
      } else {
        showToast(json.message || 'Failed to delete advertisement', 'error');
      }
    } catch (err) {
      showToast('Error deleting advertisement', 'error');
    } finally {
      setSubmittingId(null);
    }
  };

  const getStatusPill = (status: string) => {
    switch (status) {
      case 'APPROVED':
      case 'PUBLISHED':
        return <span className="status-pill status-approved" style={{ background: '#dcfce7', color: '#15803d', padding: '4px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 'bold' }}>Live / Active</span>;
      case 'PENDING_APPROVAL':
      case 'SUBMITTED':
        return <span className="status-pill status-pending" style={{ background: '#fef3c7', color: '#b45309', padding: '4px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 'bold' }}>Pending Approval</span>;
      case 'REJECTED':
        return <span className="status-pill status-rejected" style={{ background: '#fee2e2', color: '#b91c1c', padding: '4px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 'bold' }}>Rejected</span>;
      case 'EXPIRED':
        return <span className="status-pill status-expired" style={{ background: '#f1f5f9', color: '#64748b', padding: '4px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 'bold' }}>Expired</span>;
      default:
        return <span className="status-pill" style={{ background: '#f1f5f9', color: '#475569', padding: '4px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 'bold' }}>{status}</span>;
    }
  };

  return (
    <div className="employer-ads-container" style={{ padding: '1rem 0' }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-primary)' }}>
            Promotional Banners & Advertisements
          </h2>
          <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Boost your job visibility with Flipkart-style homepage promotional slider banners
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="btn btn-primary"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            background: 'var(--primary)',
            color: 'white',
            fontWeight: 'bold',
            borderRadius: '10px',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Create New Banner
        </button>
      </div>

      {/* Performance Analytics Stat Cards */}
      {analytics && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ background: 'var(--card-bg, #ffffff)', border: '1px solid var(--border-color, #e2e8f0)', padding: '1.25rem', borderRadius: '14px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Total Banners</div>
            <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--primary)', marginTop: '4px' }}>{analytics.total_advertisements}</div>
          </div>
          <div style={{ background: 'var(--card-bg, #ffffff)', border: '1px solid var(--border-color, #e2e8f0)', padding: '1.25rem', borderRadius: '14px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Active Live</div>
            <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#16a34a', marginTop: '4px' }}>{analytics.active_advertisements}</div>
          </div>
          <div style={{ background: 'var(--card-bg, #ffffff)', border: '1px solid var(--border-color, #e2e8f0)', padding: '1.25rem', borderRadius: '14px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Pending Review</div>
            <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#d97706', marginTop: '4px' }}>{analytics.pending_approval}</div>
          </div>
          <div style={{ background: 'var(--card-bg, #ffffff)', border: '1px solid var(--border-color, #e2e8f0)', padding: '1.25rem', borderRadius: '14px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Total Views</div>
            <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#2563eb', marginTop: '4px' }}>{analytics.total_views.toLocaleString()}</div>
          </div>
          <div style={{ background: 'var(--card-bg, #ffffff)', border: '1px solid var(--border-color, #e2e8f0)', padding: '1.25rem', borderRadius: '14px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Total Clicks</div>
            <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#9333ea', marginTop: '4px' }}>{analytics.total_clicks.toLocaleString()}</div>
          </div>
          <div style={{ background: 'var(--card-bg, #ffffff)', border: '1px solid var(--border-color, #e2e8f0)', padding: '1.25rem', borderRadius: '14px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Avg Click Rate (CTR)</div>
            <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0284c7', marginTop: '4px' }}>{analytics.avg_ctr}%</div>
          </div>
        </div>
      )}

      {/* Advertisements List */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>Loading promotional banners...</div>
      ) : advertisements.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'var(--card-bg, #ffffff)', borderRadius: '16px', border: '2px dashed var(--border-color, #e2e8f0)' }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
          </svg>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '1.2rem', fontWeight: '700' }}>No Promotional Banners Created Yet</h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '450px', margin: '0 auto 1.5rem auto', fontSize: '0.9rem' }}>
            Promote your urgent hiring campaigns or walk-in drives right on the homepage hero slider for maximum candidate reach.
          </p>
          <button onClick={openCreateModal} className="btn btn-primary" style={{ padding: '10px 20px', borderRadius: '10px', fontWeight: 'bold' }}>
            Create Your First Banner
          </button>
        </div>
      ) : (
        <div style={{ background: 'var(--card-bg, #ffffff)', borderRadius: '16px', border: '1px solid var(--border-color, #e2e8f0)', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead>
                <tr style={{ background: 'var(--table-header-bg, #f8fafc)', borderBottom: '1px solid var(--border-color, #e2e8f0)' }}>
                  <th style={{ padding: '14px 16px', fontWeight: '700' }}>Banner Preview</th>
                  <th style={{ padding: '14px 16px', fontWeight: '700' }}>Title & Type</th>
                  <th style={{ padding: '14px 16px', fontWeight: '700' }}>Status</th>
                  <th style={{ padding: '14px 16px', fontWeight: '700' }}>Schedule Dates</th>
                  <th style={{ padding: '14px 16px', fontWeight: '700' }}>Performance</th>
                  <th style={{ padding: '14px 16px', fontWeight: '700', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {advertisements.map((ad) => (
                  <tr key={ad.id} style={{ borderBottom: '1px solid var(--border-color, #f1f5f9)' }}>
                    {/* Preview Thumbnail */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ width: '120px', height: '60px', borderRadius: '8px', overflow: 'hidden', background: '#0f172a', position: 'relative' }}>
                        {ad.banner_image ? (
                          <img src={ad.banner_image} alt={ad.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #2563eb 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', fontSize: '10px', fontWeight: 'bold', padding: '4px', textAlign: 'center' }}>
                            Theme Gradient
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Title & Type */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' }}>{ad.title}</div>
                      <div style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: '600' }}>{ad.advertisement_type.replace('_', ' ')}</div>
                      {ad.job_title && (
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                          Linked: {ad.job_title}
                        </div>
                      )}
                    </td>

                    {/* Status */}
                    <td style={{ padding: '14px 16px' }}>
                      {getStatusPill(ad.status)}
                      {ad.status === 'REJECTED' && ad.rejection_reason && (
                        <div style={{ marginTop: '6px', fontSize: '11px', color: '#dc2626', background: '#fef2f2', padding: '4px 8px', borderRadius: '6px', maxWidth: '200px' }}>
                          <strong>Reason:</strong> {ad.rejection_reason}
                        </div>
                      )}
                    </td>

                    {/* Dates */}
                    <td style={{ padding: '14px 16px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                      <div><strong>Start:</strong> {new Date(ad.start_date).toLocaleDateString()}</div>
                      <div><strong>End:</strong> {new Date(ad.end_date).toLocaleDateString()}</div>
                    </td>

                    {/* Performance Metrics */}
                    <td style={{ padding: '14px 16px', fontSize: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px', color: 'var(--text-secondary)' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--primary)', flexShrink: 0 }}>
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                        </svg>
                        <span>Views: <strong>{ad.views_count || 0}</strong></span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px', color: 'var(--text-secondary)' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: '#16a34a', flexShrink: 0 }}>
                          <path d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5"/>
                        </svg>
                        <span>Clicks: <strong>{ad.clicks_count || 0}</strong></span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: '#2563eb', flexShrink: 0 }}>
                          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
                        </svg>
                        <span>CTR: <strong>{ad.ctr || 0}%</strong></span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => setSelectedAdForAnalytics(ad)}
                          title="View Analytics"
                          style={{ background: '#eff6ff', color: '#2563eb', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}
                        >
                          Analytics
                        </button>
                        <button
                          onClick={() => openEditModal(ad)}
                          style={{ background: '#f8fafc', color: '#334155', border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}
                        >
                          {ad.status === 'REJECTED' ? 'Edit & Resubmit' : 'Edit'}
                        </button>
                        <button
                          onClick={() => handleDelete(ad.id)}
                          disabled={submittingId === ad.id}
                          style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px', display: 'inline-flex', alignItems: 'center' }}
                        >
                          {submittingId === ad.id && renderSpinner('#dc2626')}
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {formModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: 'var(--card-bg, #ffffff)', borderRadius: '20px', width: '100%', maxWidth: '680px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.35rem', fontWeight: '800' }}>
                {editingAd ? 'Edit & Resubmit Advertisement' : 'Create Promotional Banner'}
              </h3>
              <button onClick={() => setFormModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* ADMIN MODERATION REJECTION FEEDBACK NOTICE */}
              {editingAd && editingAd.status === 'REJECTED' && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderLeft: '4px solid #dc2626', borderRadius: '12px', padding: '16px 20px' }}>
                  <div style={{ fontSize: '13px', fontWeight: '800', color: '#991b1b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>⚠️ Admin Moderation Feedback</span>
                  </div>
                  <div style={{ fontSize: '14px', color: '#7f1d1d', fontWeight: '700', lineHeight: '1.4' }}>
                    {editingAd.rejection_reason || 'Please review image resolution, title clarity, and details before resubmitting.'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#991b1b', marginTop: '8px', lineHeight: '1.4' }}>
                    Update your banner details below and click <strong>"Update & Resubmit for Approval"</strong> to send it back to the admin team for priority review.
                  </div>
                </div>
              )}
              {/* Image Upload (Optional) */}
              <div>
                <label style={{ display: 'block', fontWeight: '700', marginBottom: '6px', fontSize: '13px' }}>Banner Image (Optional - PNG, JPG, WEBP - Max 5MB)</label>
                {bannerImage ? (
                  <div style={{ position: 'relative', width: '100%', height: '180px', borderRadius: '12px', overflow: 'hidden', background: '#0f172a', marginBottom: '8px' }}>
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
                    style={{ border: '2px dashed var(--primary)', borderRadius: '12px', padding: '1.5rem', textAlign: 'center', background: 'var(--primary-50, #eff6ff)', cursor: 'pointer' }}
                  >
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--primary)', marginBottom: '6px' }}>
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    <div style={{ fontWeight: '700', color: 'var(--primary)' }}>Click to upload custom banner image (Optional)</div>
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
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color, #cbd5e1)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: '700', marginBottom: '6px', fontSize: '13px' }}>Advertisement Type *</label>
                  <select
                    value={advertisementType}
                    onChange={(e) => setAdvertisementType(e.target.value as AdvertisementType)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color, #cbd5e1)' }}
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
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color, #cbd5e1)', fontFamily: 'inherit' }}
                />
              </div>

              {/* Linked Job Selection */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: '700', marginBottom: '6px', fontSize: '13px' }}>Link to Posted Job (Optional)</label>
                  <select
                    value={linkedJobId}
                    onChange={(e) => setLinkedJobId(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color, #cbd5e1)' }}
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
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color, #cbd5e1)', opacity: linkedJobId ? 0.6 : 1 }}
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
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color, #cbd5e1)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: '700', marginBottom: '6px', fontSize: '13px' }}>Priority Level</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as AdvertisementPriority)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color, #cbd5e1)' }}
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
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color, #cbd5e1)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: '700', marginBottom: '6px', fontSize: '13px' }}>Expiry End Date & Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color, #cbd5e1)' }}
                  />
                </div>
              </div>

              {/* REAL-TIME INTERACTIVE LIVE PREVIEW BOX */}
              <div style={{ marginTop: '12px', padding: '16px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a', marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    👁️ Real-Time Banner Preview
                  </span>
                  <span style={{ fontSize: '11px', color: '#2563eb', fontWeight: '700', background: '#eff6ff', padding: '2px 8px', borderRadius: '999px' }}>
                    Live Homepage View
                  </span>
                </div>

                <div style={{ position: 'relative', width: '100%', height: '170px', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 8px 24px rgba(15, 23, 42, 0.15)' }}>
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
                      {advertisementType.replace('_', ' ')}
                    </span>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '800', textShadow: '0 2px 4px rgba(0,0,0,0.5)', color: '#ffffff' }}>
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
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
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
                  style={{ padding: '10px 24px', borderRadius: '8px', background: 'var(--primary)', color: 'white', border: 'none', fontWeight: 'bold', cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}
                >
                  {isSubmitting && renderSpinner('white')}
                  {isSubmitting ? 'Submitting...' : editingAd ? 'Update & Resubmit' : 'Submit for Admin Approval'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ANALYTICS MODAL */}
      {selectedAdForAnalytics && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: 'var(--card-bg, #ffffff)', borderRadius: '20px', width: '100%', maxWidth: '520px', padding: '2rem', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800' }}>Banner Performance Analytics</h3>
              <button onClick={() => setSelectedAdForAnalytics(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontWeight: '700', fontSize: '1.1rem', marginBottom: '4px' }}>{selectedAdForAnalytics.title}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Created on {new Date(selectedAdForAnalytics.created_at).toLocaleDateString()}</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', textAlign: 'center', marginBottom: '1.5rem' }}>
              <div>
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold' }}>VIEWS</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#2563eb', marginTop: '4px' }}>{selectedAdForAnalytics.views_count || 0}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold' }}>CLICKS</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#9333ea', marginTop: '4px' }}>{selectedAdForAnalytics.clicks_count || 0}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold' }}>CTR</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#16a34a', marginTop: '4px' }}>{selectedAdForAnalytics.ctr || 0}%</div>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <button onClick={() => setSelectedAdForAnalytics(null)} style={{ padding: '8px 18px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
