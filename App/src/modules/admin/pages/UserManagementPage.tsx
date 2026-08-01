import React, { useEffect, useState, useCallback } from 'react';
import { AdminApiService } from '../services/adminApi';
import { useToast } from '../../../hooks/useToast';
import { getInitials } from '../../../utils/helpers';
import { ResumePreviewModal } from '../../../components/profile/ResumePreviewModal';

export const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [loading, setLoading] = useState(true);
  const [previewResume, setPreviewResume] = useState<any>(null);
  const [previewUserId, setPreviewUserId] = useState<string>('');

  // Filters
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');
  const [verified, setVerified] = useState('');

  // Details drawer
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerLoading, setDrawerLoading] = useState(false);

  const { showToast } = useToast();

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await AdminApiService.getUsers({
        page,
        limit,
        search,
        role,
        status,
        verified
      });
      setUsers(res.data || []);
      setTotal(res.total || 0);
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch users', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, role, status, verified, showToast]);

  useEffect(() => {
    fetchUsers();
  }, [page, role, status, verified]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleClearFilters = () => {
    setSearch('');
    setRole('');
    setStatus('');
    setVerified('');
    setPage(1);
  };

  const handleOpenDrawer = async (userId: string) => {
    try {
      setDrawerLoading(true);
      setDrawerOpen(true);
      const details = await AdminApiService.getUser(userId);
      setSelectedUser(details);
    } catch (err: any) {
      showToast('Failed to fetch user details', 'error');
      setDrawerOpen(false);
    } finally {
      setDrawerLoading(false);
    }
  };

  const handleStatusChange = async (userId: string, newStatus: 'ACTIVE' | 'INACTIVE' | 'BLOCKED') => {
    try {
      await AdminApiService.updateUserStatus(userId, newStatus);
      showToast(`User status successfully updated to ${newStatus}`, 'success');
      
      // Update drawer state if open
      if (selectedUser && selectedUser.profile.id === userId) {
        setSelectedUser((prev: any) => ({
          ...prev,
          profile: { ...prev.profile, status: newStatus }
        }));
      }
      fetchUsers();
    } catch (err: any) {
      showToast(err.message || 'Failed to update user status', 'error');
    }
  };

  const handleResetPassword = async (userId: string) => {
    if (!window.confirm('Are you sure you want to reset this user\'s password?')) return;
    try {
      const res = await AdminApiService.resetUserPassword(userId);
      window.alert(`Password successfully reset! Temporary Password: ${res.tempPassword}\n\nPlease copy this password and share it with the user.`);
    } catch (err: any) {
      showToast(err.message || 'Failed to reset password', 'error');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('WARNING: Deleting a user will permanently remove their profile, jobs, and application records. This action cannot be undone. Are you sure you want to proceed?')) return;
    try {
      await AdminApiService.deleteUser(userId);
      showToast('User deleted successfully', 'success');
      setDrawerOpen(false);
      fetchUsers();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete user', 'error');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-primary)' }}>User Management</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Monitor profiles, manage roles, and review audit/session details</p>
      </div>

      {/* Advanced Filters Toolbar */}
      <div className="admin-card" style={{ marginBottom: '24px' }}>
        <form onSubmit={handleSearchSubmit} className="filter-toolbar" style={{ background: 'var(--surface)' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
            <input
              type="text"
              placeholder="Search by name, email, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="navbar-search-input"
              style={{ width: '100%', paddingLeft: '12px' }}
            />
          </div>

          <select className="filter-select" value={role} onChange={(e) => { setRole(e.target.value); setPage(1); }}>
            <option value="">All Roles</option>
            <option value="candidate">Worker</option>
            <option value="employer">Employer</option>
            <option value="admin">Admin</option>
          </select>

          <select className="filter-select" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="BLOCKED">Blocked</option>
          </select>

          <select className="filter-select" value={verified} onChange={(e) => { setVerified(e.target.value); setPage(1); }}>
            <option value="">Verification</option>
            <option value="true">Aadhaar Verified</option>
            <option value="false">Unverified</option>
          </select>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="submit" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '13px' }}>
              Apply
            </button>
            <button type="button" className="btn btn-outline" style={{ padding: '8px 16px', fontSize: '13px' }} onClick={handleClearFilters}>
              Clear
            </button>
          </div>
        </form>
      </div>

      {/* Users Table */}
      <div className="admin-card">
        {loading ? (
          <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} style={{ height: '35px', background: '#e2e8f0', borderRadius: '4px', animation: 'pulse 1.5s infinite' }}></div>
            ))}
          </div>
        ) : users.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No users found matching the query filters.
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Avatar</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Verification</th>
                  <th>Joined Date</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#344bfd', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '12px', overflow: 'hidden' }}>
                        {u.profile_picture_url ? (
                          <img src={u.profile_picture_url} alt={u.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          getInitials(u.name)
                        )}
                      </div>
                    </td>
                    <td><strong style={{ cursor: 'pointer', color: 'var(--primary)' }} onClick={() => handleOpenDrawer(u.id)}>{u.name}</strong></td>
                    <td>{u.email}</td>
                    <td>{u.phone || '—'}</td>
                    <td>
                      <span className="status-badge" style={{ background: u.role === 'admin' ? '#e0e4ff' : u.role === 'employer' ? '#fef3c7' : '#d1fae5', color: u.role === 'admin' ? '#1a2eb8' : u.role === 'employer' ? '#b45309' : '#047857' }}>
                        {u.role === 'candidate' ? 'Worker' : u.role}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${u.status === 'ACTIVE' ? 'status-active' : u.status === 'BLOCKED' ? 'status-blocked' : 'status-pending'}`}>
                        {u.status}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${u.aadhaar_verified ? 'status-verified' : 'status-rejected'}`}>
                        {u.aadhaar_verified ? 'Verified' : 'Not Verified'}
                      </span>
                    </td>
                    <td>{new Date(u.created_at).toLocaleDateString()}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button className="action-btn edit" title="View Profile Drawer" onClick={() => handleOpenDrawer(u.id)} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '6px' }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        </button>
                        {u.status === 'BLOCKED' ? (
                          <button className="action-btn" title="Unblock User" onClick={() => handleStatusChange(u.id, 'ACTIVE')} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '6px', color: 'var(--success)' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            </svg>
                          </button>
                        ) : (
                          <button className="action-btn" title="Block User" onClick={() => handleStatusChange(u.id, 'BLOCKED')} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '6px', color: 'var(--danger)' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="10" />
                              <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                            </svg>
                          </button>
                        )}
                        <button className="action-btn delete" title="Delete User Profile" onClick={() => handleDeleteUser(u.id)} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '6px', color: 'var(--danger)' }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            <line x1="10" y1="11" x2="10" y2="17" />
                            <line x1="14" y1="11" x2="14" y2="17" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination Controls */}
            <div className="table-pagination">
              <span>Showing {users.length} of {total} users</span>
              <div className="pagination-btn-group">
                <button className="pagination-btn" onClick={() => setPage(p => Math.max(p - 1, 1))} disabled={page === 1}>
                  Previous
                </button>
                <span style={{ display: 'flex', alignItems: 'center', padding: '0 8px' }}>Page {page} of {Math.ceil(total / limit) || 1}</span>
                <button className="pagination-btn" onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / limit)}>
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Details Drawer Overlay */}
      {drawerOpen && (
        <div className="drawer-backdrop" onClick={() => setDrawerOpen(false)}>
          <div className="admin-drawer" style={{ width: '650px' }} onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <h2 className="drawer-title">User Account Dossier</h2>
              <button className="drawer-close-btn" onClick={() => setDrawerOpen(false)}>✕</button>
            </div>

            {drawerLoading ? (
              <div style={{ padding: '80px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
                <div className="spinner" style={{
                  width: '40px',
                  height: '40px',
                  border: '3px solid var(--border-light)',
                  borderTop: '3px solid var(--primary)',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: '500' }}>Loading user dossier...</div>
              </div>
            ) : selectedUser ? (
              <div className="drawer-body">
                {/* 1. Profile header */}
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center', background: 'var(--border-light)', padding: '16px', borderRadius: '8px' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 'bold', overflow: 'hidden' }}>
                    {selectedUser.profile.profile_picture_url ? (
                      <img src={selectedUser.profile.profile_picture_url} alt={selectedUser.profile.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      getInitials(selectedUser.profile.name)
                    )}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: '800' }}>{selectedUser.profile.name}</h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>ID: {selectedUser.profile.id}</p>
                    <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                      <span className="status-badge status-active">{selectedUser.profile.role}</span>
                      <span className={`status-badge ${selectedUser.profile.status === 'ACTIVE' ? 'status-active' : 'status-blocked'}`}>{selectedUser.profile.status}</span>
                    </div>
                  </div>
                </div>

                {/* 2. Personal & Profile Stats */}
                <div className="drawer-section">
                  <span className="drawer-section-title">Account Information</span>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 12px', fontSize: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px', color: 'var(--primary)', flexShrink: 0 }}>
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                        <polyline points="22,6 12,13 2,6" />
                      </svg>
                      <strong>Email:</strong>&nbsp;{selectedUser.profile.email}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px', color: 'var(--primary)', flexShrink: 0 }}>
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>
                      <strong>Phone:</strong>&nbsp;{selectedUser.profile.phone || 'None'}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px', color: 'var(--primary)', flexShrink: 0 }}>
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                      <strong>Joined:</strong>&nbsp;{new Date(selectedUser.profile.created_at).toLocaleDateString()}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px', color: 'var(--primary)', flexShrink: 0 }}>
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      </svg>
                      <strong>Verification:</strong>&nbsp;{selectedUser.profile.aadhaar_verified ? 'Verified ✓' : 'Unverified'}
                    </div>
                  </div>
                </div>

                {/* 3. Professional Info (Candidate specific) */}
                {selectedUser.profile.role?.toLowerCase() === 'candidate' && (
                  <>
                    <div className="drawer-section">
                      <span className="drawer-section-title">Professional Profile</span>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px', color: 'var(--primary)', flexShrink: 0 }}>
                            <path d="M12 20h9" />
                            <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                          </svg>
                          <strong>Headline:</strong>&nbsp;{selectedUser.profile.headline || 'None'}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px', color: 'var(--primary)', flexShrink: 0 }}>
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                            <circle cx="12" cy="10" r="3" />
                          </svg>
                          <strong>Location:</strong>&nbsp;{selectedUser.profile.location || 'None'}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px', color: 'var(--primary)', flexShrink: 0 }}>
                            <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                          </svg>
                          <strong>Trade Specialization:</strong>&nbsp;{selectedUser.profile.trade_specialization || 'None'}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px', color: 'var(--primary)', flexShrink: 0 }}>
                            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                          </svg>
                          <strong>Skills:</strong>&nbsp;{selectedUser.profile.skills?.join(', ') || 'None'}
                        </div>
                      </div>
                    </div>

                    <div className="drawer-section">
                      <span className="drawer-section-title">Work Experience</span>
                      {selectedUser.profile.experience && selectedUser.profile.experience.length > 0 ? (
                        selectedUser.profile.experience.map((exp: any, i: number) => (
                          <div key={i} style={{ background: 'var(--border-light)', padding: '12px', borderRadius: '4px', fontSize: '13px' }}>
                            <strong>{exp.title}</strong> at {exp.company} ({exp.duration})
                            <p style={{ marginTop: '4px', color: 'var(--text-secondary)' }}>{exp.description}</p>
                          </div>
                        ))
                      ) : <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>No experience details uploaded</p>}
                    </div>

                    <div className="drawer-section">
                      <span className="drawer-section-title">Education History</span>
                      {selectedUser.profile.education && selectedUser.profile.education.length > 0 ? (
                        selectedUser.profile.education.map((edu: any, i: number) => (
                          <div key={i} style={{ background: 'var(--border-light)', padding: '12px', borderRadius: '4px', fontSize: '13px', marginBottom: '8px' }}>
                            <strong>{edu.degree}</strong> {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ''} at {edu.institution} ({edu.year})
                            {edu.description && <p style={{ marginTop: '4px', color: 'var(--text-secondary)' }}>{edu.description}</p>}
                          </div>
                        ))
                      ) : <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>No education details uploaded</p>}
                    </div>

                    <div className="drawer-section">
                      <span className="drawer-section-title">Resume Metadata</span>
                      {selectedUser.profile.resume ? (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--border-light)', padding: '10px 14px', borderRadius: '4px', fontSize: '13px' }}>
                          <span>📄 {selectedUser.profile.resume.name} ({selectedUser.profile.resume.size})</span>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <button className="btn btn-outline" style={{ padding: '4px 8px', fontSize: '11px', background: 'var(--surface)', border: '1px solid var(--border)' }} onClick={() => { setPreviewResume(selectedUser.profile.resume); setPreviewUserId(selectedUser.profile.id); }}>
                              View Resume
                            </button>
                            <span className="status-badge status-active">Uploaded</span>
                          </div>
                        </div>
                      ) : <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>No resume uploaded</p>}
                    </div>
                  </>
                )}

                {/* 4. Employer specific details */}
                {selectedUser.profile.role?.toLowerCase() === 'employer' && (
                  <div className="drawer-section">
                    <span className="drawer-section-title">Company Profile</span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px', color: 'var(--primary)', flexShrink: 0 }}>
                          <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
                          <line x1="9" y1="22" x2="9" y2="16" />
                          <line x1="15" y1="22" x2="15" y2="16" />
                          <line x1="9" y1="16" x2="15" y2="16" />
                          <path d="M8 6h2v2H8V6zm4 0h2v2h-2V6zm4 0h2v2h-2V6zM8 10h2v2H8v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2z" />
                        </svg>
                        <strong>Company:</strong>&nbsp;{selectedUser.profile.company_name || 'None'}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px', color: 'var(--primary)', flexShrink: 0 }}>
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                          <line x1="16" y1="13" x2="8" y2="13" />
                          <line x1="16" y1="17" x2="8" y2="17" />
                        </svg>
                        <strong>GST Number:</strong>&nbsp;{selectedUser.profile.gst_number || 'None'}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : null}

            <div style={{ padding: '20px', borderTop: '1px solid var(--border)', display: 'flex', gap: '8px' }}>
              {selectedUser && selectedUser.profile.status === 'BLOCKED' ? (
                <button className="btn btn-outline" style={{ flex: 1, borderColor: 'var(--success)', color: 'var(--success)' }} onClick={() => handleStatusChange(selectedUser.profile.id, 'ACTIVE')}>
                  Unlock Account
                </button>
              ) : (
                <button className="btn" style={{ flex: 1, background: 'var(--danger)', color: 'white' }} onClick={() => selectedUser && handleStatusChange(selectedUser.profile.id, 'BLOCKED')}>
                  Deactivate & Block
                </button>
              )}
              <button className="btn" style={{ flex: 1, background: 'var(--danger)', color: 'white' }} onClick={() => selectedUser && handleDeleteUser(selectedUser.profile.id)}>
                Delete Permanent
              </button>
            </div>
          </div>
        </div>
      )}
      {previewResume && (
        <ResumePreviewModal
          resume={previewResume}
          userId={previewUserId}
          onClose={() => {
            setPreviewResume(null);
            setPreviewUserId('');
          }}
        />
      )}
    </div>
  );
};
export default UserManagementPage;
