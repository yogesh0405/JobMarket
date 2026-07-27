import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation, Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { useToast } from '../../../hooks/useToast';
import '../styles/admin.css';

export const AdminLayout: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  // Enforce ADMIN role check on mount and update
  useEffect(() => {
    if (currentUser) {
      const role = (currentUser.role || '').toLowerCase().trim();
      if (role !== 'admin') {
        showToast('Admin privileges required. Please log in as Admin.', 'warning');
      }
    }
  }, [currentUser, showToast]);

  const token = localStorage.getItem('accessToken');
  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  if (!currentUser) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', color: '#ffffff' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '36px', height: '36px', border: '3.5px solid rgba(255, 255, 255, 0.2)', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ fontWeight: '600', fontSize: '14px', color: '#94a3b8' }}>Verifying Admin Access...</p>
        </div>
      </div>
    );
  }

  const userRole = (currentUser.role || '').toLowerCase().trim();
  if (userRole !== 'admin') {
    return <Navigate to="/admin/login" replace />;
  }

  const handleLogout = () => {
    logout();
    showToast('Logged out from Admin Portal', 'info');
    navigate('/admin/login');
  };

  // Generate breadcrumb title based on path
  const getBreadcrumbTitle = () => {
    const path = location.pathname;
    if (path.includes('/dashboard')) return 'Dashboard';
    if (path.includes('/job-approvals')) return 'Job Approvals';
    if (path.includes('/advertisements')) return 'Advertisement Approval';
    if (path.includes('/jobs')) return 'Platform Jobs';
    if (path.includes('/users')) return 'User Management';
    if (path.includes('/employers')) return 'Employer Directory';
    if (path.includes('/workers')) return 'Worker Roster';
    if (path.includes('/categories')) return 'Categories & Skills';
    if (path.includes('/reports')) return 'User Reports';
    if (path.includes('/settings')) return 'System Settings';
    if (path.includes('/support')) return 'Support Tickets';
    if (path.includes('/broadcast')) return 'Broadcast Notifications';
    return 'Admin';
  };

  const menuGroups = [
    {
      group: 'Overview',
      items: [
        {
          label: 'Dashboard',
          path: '/admin/dashboard',
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/>
            </svg>
          )
        }
      ]
    },
    {
      group: 'Moderation & Jobs',
      items: [
        {
          label: 'Job Approvals',
          path: '/admin/job-approvals',
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M9 15l2 2 4-4"/>
            </svg>
          )
        },
        {
          label: 'Advertisement Approval',
          path: '/admin/advertisements',
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><path d="M12 11h.01"/>
            </svg>
          )
        },
        {
          label: 'Platform Jobs',
          path: '/admin/jobs',
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
            </svg>
          )
        }
      ]
    },
    {
      group: 'User Directory',
      items: [
        {
          label: 'User Management',
          path: '/admin/users',
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          )
        },
        {
          label: 'Employer Directory',
          path: '/admin/employers',
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 21h18"/><path d="M9 8h1"/><path d="M9 12h1"/><path d="M9 16h1"/><path d="M14 8h1"/><path d="M14 12h1"/><path d="M14 16h1"/><path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"/>
            </svg>
          )
        },
        {
          label: 'Worker Roster',
          path: '/admin/workers',
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
          )
        }
      ]
    },
    {
      group: 'Platform Settings',
      items: [
        {
          label: 'Categories & Skills',
          path: '/admin/categories',
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 6h16M4 12h16M4 18h7"/>
            </svg>
          )
        },
        {
          label: 'System Settings',
          path: '/admin/settings',
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
          )
        },
        {
          label: 'Support Tickets',
          path: '/admin/support',
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          )
        },
        {
          label: 'Broadcast Notifications',
          path: '/admin/broadcast',
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 12A10 10 0 0 0 12 2v10z"/><path d="M12 2A10 10 0 0 0 2 12h10z"/><path d="M12 12L2.1 12.1"/>
            </svg>
          )
        }
      ]
    }
  ];

  return (
    <div className={`admin-layout ${collapsed ? 'collapsed' : ''}`}>
      {/* Left Sidebar */}
      <aside className={`admin-sidebar ${collapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand" onClick={() => navigate('/admin/dashboard')}>
            <div className="sidebar-brand-logo">JM</div>
            <span className="sidebar-brand-text">JobMarket</span>
          </div>
          <button className="sidebar-collapse-btn" onClick={() => setCollapsed(!collapsed)} aria-label="Toggle sidebar">
            {collapsed ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
            )}
          </button>
        </div>

        <nav className="sidebar-menu">
          {menuGroups.map(group => (
            <React.Fragment key={group.group}>
              <div className="sidebar-group-title">{group.group}</div>
              {group.items.map(item => {
                const isActive = location.pathname === item.path || (item.path !== '/admin/dashboard' && location.pathname.startsWith(item.path));
                return (
                  <button
                    key={item.label}
                    className={`sidebar-menu-item ${isActive ? 'active' : ''}`}
                    onClick={() => navigate(item.path)}
                    title={collapsed ? item.label : undefined}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </React.Fragment>
          ))}

          <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <button 
              className="sidebar-menu-item" 
              onClick={handleLogout} 
              style={{ color: '#ef4444' }}
              title={collapsed ? 'Logout' : undefined}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              <span>Logout</span>
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="admin-main">
        {/* Top Navbar */}
        <header className="admin-navbar">
          <div className="navbar-left">
            <div className="breadcrumb">
              <span>Admin</span>
              <span className="breadcrumb-separator">/</span>
              <span className="breadcrumb-active">{getBreadcrumbTitle()}</span>
            </div>
          </div>

          <div className="navbar-right">
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginRight: '12px' }}>
              <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>{currentUser.name}</span>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{currentUser.email}</span>
            </div>
            <div className="sidebar-brand-logo" style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
              {currentUser.name[0]}
            </div>
          </div>
        </header>

        {/* Content Outlet */}
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
export default AdminLayout;
