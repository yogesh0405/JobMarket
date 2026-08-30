import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, Link } from 'react-router-dom';
import {
  Bell,
  MoreVertical,
  ArrowLeft,
  X,
  ChevronRight,
  User,
  Briefcase,
  Calendar,
  Bookmark,
  FileText,
  PlusCircle,
  Users,
  Building2,
  Shield,
  HelpCircle,
  LogOut,
  LayoutDashboard,
  Sparkles
} from 'lucide-react';
import { JobMarketLogoSvg } from './JobMarketLogoSvg';
import { NavbarNotificationBell } from '../Layout/NavbarNotificationBell';
import { useAuth } from '../../hooks/useAuth';
import { getInitials } from '../../utils/helpers';
import { apiFetch } from '../../utils/api';

interface MobileHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  unreadCount?: number;
  onBellClick?: () => void;
  onMenuClick?: () => void;
  hideRightActions?: boolean;
  hideBell?: boolean;
  hideMenu?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  title,
  subtitle,
  showBack = false,
  onBack,
  unreadCount: propUnreadCount,
  onBellClick,
  onMenuClick,
  hideRightActions = false,
  hideBell = false,
  hideMenu = false,
  style,
  className,
}) => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(propUnreadCount ?? 0);

  // Fetch unread count if not explicitly passed
  useEffect(() => {
    if (propUnreadCount !== undefined) {
      setUnreadCount(propUnreadCount);
      return;
    }
    if (!currentUser?.id) return;
    apiFetch('/api/v1/notifications')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        const list = Array.isArray(data) ? data : (data?.data || []);
        if (Array.isArray(list)) {
          const unread = list.filter((n: any) => !n.read).length;
          setUnreadCount(unread);
        }
      })
      .catch(() => {});
  }, [currentUser?.id, propUnreadCount]);

  const handleMenuTrigger = () => {
    if (onMenuClick) {
      onMenuClick();
    } else {
      setDrawerOpen(true);
    }
  };

  const closeDrawer = (cb?: () => void) => {
    setDrawerOpen(false);
    if (cb) setTimeout(cb, 200);
  };

  const displayName = currentUser?.name || currentUser?.companyName || 'Guest User';
  const displayEmail = currentUser?.email || 'guest@jobmarket.in';
  const userRole = (currentUser?.role || 'candidate').toLowerCase();

  return (
    <>
      <div className={`applied-mobile-header ${className || ''}`} style={style}>
        {/* Left: Brand Logo / Back Button + Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minHeight: '34px' }}>
          {showBack ? (
            <button
              onClick={onBack || (() => navigate(-1))}
              style={{
                background: 'transparent',
                border: 'none',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#0F172A',
                marginRight: '2px',
              }}
              title="Go Back"
            >
              <ArrowLeft size={22} color="#0F172A" strokeWidth={2.2} />
            </button>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <JobMarketLogoSvg size={24} />
            </div>
          )}
          <h1 style={{
            margin: 0,
            padding: 0,
            fontSize: '14.5px',
            fontWeight: 750,
            color: '#0F172A',
            letterSpacing: '-0.2px',
            lineHeight: '1.2',
            display: 'flex',
            alignItems: 'center'
          }}>
            {title}
          </h1>
        </div>

        {/* Right: Bell Icon & Three Dot Menu Icon (100% Mobile App Match) */}
        {!hideRightActions && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {!hideBell && (
              onBellClick ? (
                <div 
                  onClick={onBellClick}
                  style={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '32px',
                    height: '32px',
                    cursor: 'pointer',
                    borderRadius: '50%',
                  }}
                  title="Notifications"
                >
                  <Bell size={19} color="#334155" strokeWidth={2} />
                  {unreadCount > 0 && (
                    <span style={{
                      position: 'absolute',
                      top: '0px',
                      right: '0px',
                      backgroundColor: '#EF4444',
                      color: '#FFFFFF',
                      fontSize: '8.5px',
                      fontWeight: 800,
                      minWidth: '15px',
                      height: '15px',
                      borderRadius: '999px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '0 3px',
                      boxSizing: 'border-box'
                    }}>
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </div>
              ) : (
                <NavbarNotificationBell />
              )
            )}

            {/* Three-Dot Menu Button */}
            {!hideMenu && (
              <button
                onClick={handleMenuTrigger}
                style={{
                  background: 'transparent',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  color: '#0F172A',
                  padding: 0
                }}
                title="Menu"
              >
                <MoreVertical size={22} color="#0F172A" strokeWidth={2.2} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Built-in Platform Workspace Slide-Out Drawer Portal (Exact Mobile App UI) */}
      {drawerOpen && createPortal(
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 999999,
          display: 'flex',
          justifyContent: 'flex-end',
          animation: 'fadeIn 0.2s ease forwards'
        }}>
          {/* Backdrop */}
          <div 
            onClick={() => closeDrawer()}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.45)',
              backdropFilter: 'blur(2px)'
            }}
          />

          {/* Slide Panel */}
          <div style={{
            position: 'relative',
            width: '320px',
            maxWidth: '85vw',
            height: '100%',
            backgroundColor: '#FFFFFF',
            boxShadow: '-4px 0 24px rgba(15, 23, 42, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1000000,
            overflowY: 'auto'
          }}>
            {/* Top Close Row */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '16px 16px 8px 16px' }}>
              <button
                onClick={() => closeDrawer()}
                style={{
                  background: 'transparent',
                  border: 'none',
                  padding: '6px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  color: '#64748B',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title="Close"
              >
                <X size={20} color="#64748B" />
              </button>
            </div>

            {/* User Profile Header Block */}
            <div 
              onClick={() => closeDrawer(() => navigate(userRole === 'candidate' ? '/dashboard?tab=profile' : '/dashboard?tab=profile'))}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '0 16px 16px 16px',
                borderBottom: '1px solid #F1F5F9',
                cursor: 'pointer'
              }}
            >
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                backgroundColor: '#344BFD',
                color: '#FFFFFF',
                fontWeight: 800,
                fontSize: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                flexShrink: 0,
                boxShadow: '0 2px 6px rgba(52, 75, 253, 0.2)'
              }}>
                {currentUser?.profilePictureUrl && typeof currentUser.profilePictureUrl === 'string' ? (
                  <img 
                    src={currentUser.profilePictureUrl} 
                    alt={displayName} 
                    referrerPolicy="no-referrer"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  getInitials(displayName)
                )}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {displayName}
                </div>
                <div style={{ fontSize: '12px', color: '#64748B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {displayEmail}
                </div>
              </div>

              <ChevronRight size={16} color="#94A3B8" />
            </div>

            {/* Menu Groups */}
            <div style={{ flex: 1, padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ fontSize: '10.5px', fontWeight: 800, color: '#94A3B8', letterSpacing: '0.8px', padding: '8px 4px 4px 4px' }}>
                PLATFORM WORKSPACE
              </div>

              {/* Dynamic RBAC Items */}
              {userRole === 'candidate' ? (
                <>
                  <div 
                    onClick={() => closeDrawer(() => navigate('/dashboard?tab=profile'))}
                    style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 8px', borderRadius: '8px', cursor: 'pointer', backgroundColor: '#EFF6FF', color: '#1764E8' }}
                  >
                    <User size={18} color="#1764E8" />
                    <span style={{ flex: 1, fontSize: '13.5px', fontWeight: 700 }}>My Profile & Bio-Data</span>
                    <ChevronRight size={14} color="#1764E8" />
                  </div>

                  <div 
                    onClick={() => closeDrawer(() => navigate('/dashboard'))}
                    style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 8px', borderRadius: '8px', cursor: 'pointer', color: '#334155' }}
                  >
                    <LayoutDashboard size={18} color="#64748B" />
                    <span style={{ flex: 1, fontSize: '13.5px', fontWeight: 600 }}>Candidate Dashboard</span>
                    <ChevronRight size={14} color="#94A3B8" />
                  </div>

                  <div 
                    onClick={() => closeDrawer(() => navigate('/jobs'))}
                    style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 8px', borderRadius: '8px', cursor: 'pointer', color: '#334155' }}
                  >
                    <Briefcase size={18} color="#64748B" />
                    <span style={{ flex: 1, fontSize: '13.5px', fontWeight: 600 }}>Find Job Vacancies</span>
                    <ChevronRight size={14} color="#94A3B8" />
                  </div>

                  <div 
                    onClick={() => closeDrawer(() => navigate('/dashboard?tab=saved'))}
                    style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 8px', borderRadius: '8px', cursor: 'pointer', color: '#334155' }}
                  >
                    <Bookmark size={18} color="#64748B" />
                    <span style={{ flex: 1, fontSize: '13.5px', fontWeight: 600 }}>Saved Jobs</span>
                    <ChevronRight size={14} color="#94A3B8" />
                  </div>

                  <div 
                    onClick={() => closeDrawer(() => navigate('/dashboard?tab=interviews'))}
                    style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 8px', borderRadius: '8px', cursor: 'pointer', color: '#334155' }}
                  >
                    <Calendar size={18} color="#64748B" />
                    <span style={{ flex: 1, fontSize: '13.5px', fontWeight: 600 }}>Scheduled Interviews</span>
                    <ChevronRight size={14} color="#94A3B8" />
                  </div>

                  <div 
                    onClick={() => closeDrawer(() => navigate('/resume'))}
                    style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 8px', borderRadius: '8px', cursor: 'pointer', color: '#334155' }}
                  >
                    <FileText size={18} color="#64748B" />
                    <span style={{ flex: 1, fontSize: '13.5px', fontWeight: 600 }}>My Resume Document</span>
                    <ChevronRight size={14} color="#94A3B8" />
                  </div>
                </>
              ) : (
                <>
                  <div 
                    onClick={() => closeDrawer(() => navigate('/dashboard?tab=profile'))}
                    style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 8px', borderRadius: '8px', cursor: 'pointer', backgroundColor: '#EFF6FF', color: '#1764E8' }}
                  >
                    <Building2 size={18} color="#1764E8" />
                    <span style={{ flex: 1, fontSize: '13.5px', fontWeight: 700 }}>Company Profile</span>
                    <ChevronRight size={14} color="#1764E8" />
                  </div>

                  <div 
                    onClick={() => closeDrawer(() => navigate('/post-job'))}
                    style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 8px', borderRadius: '8px', cursor: 'pointer', color: '#334155' }}
                  >
                    <PlusCircle size={18} color="#64748B" />
                    <span style={{ flex: 1, fontSize: '13.5px', fontWeight: 600 }}>Post a New Vacancy</span>
                    <ChevronRight size={14} color="#94A3B8" />
                  </div>

                  <div 
                    onClick={() => closeDrawer(() => navigate('/dashboard?tab=manage'))}
                    style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 8px', borderRadius: '8px', cursor: 'pointer', color: '#334155' }}
                  >
                    <Briefcase size={18} color="#64748B" />
                    <span style={{ flex: 1, fontSize: '13.5px', fontWeight: 600 }}>Manage Job Postings</span>
                    <ChevronRight size={14} color="#94A3B8" />
                  </div>

                  <div 
                    onClick={() => closeDrawer(() => navigate('/dashboard?tab=applicants'))}
                    style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 8px', borderRadius: '8px', cursor: 'pointer', color: '#334155' }}
                  >
                    <Users size={18} color="#64748B" />
                    <span style={{ flex: 1, fontSize: '13.5px', fontWeight: 600 }}>Candidate Applications</span>
                    <ChevronRight size={14} color="#94A3B8" />
                  </div>

                  <div 
                    onClick={() => closeDrawer(() => navigate('/dashboard?tab=interviews'))}
                    style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 8px', borderRadius: '8px', cursor: 'pointer', color: '#334155' }}
                  >
                    <Calendar size={18} color="#64748B" />
                    <span style={{ flex: 1, fontSize: '13.5px', fontWeight: 600 }}>Scheduled Interviews</span>
                    <ChevronRight size={14} color="#94A3B8" />
                  </div>
                </>
              )}

              <div style={{ height: '1px', backgroundColor: '#F1F5F9', margin: '8px 0' }} />

              <div style={{ fontSize: '10.5px', fontWeight: 800, color: '#94A3B8', letterSpacing: '0.8px', padding: '8px 4px 4px 4px' }}>
                ACCOUNT & SUPPORT
              </div>

              <div 
                onClick={() => closeDrawer(() => navigate('/companies'))}
                style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 8px', borderRadius: '8px', cursor: 'pointer', color: '#334155' }}
              >
                <Building2 size={18} color="#64748B" />
                <span style={{ flex: 1, fontSize: '13.5px', fontWeight: 600 }}>Top Companies</span>
                <ChevronRight size={14} color="#94A3B8" />
              </div>

              <div 
                onClick={() => closeDrawer(() => navigate('/security'))}
                style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 8px', borderRadius: '8px', cursor: 'pointer', color: '#334155' }}
              >
                <Shield size={18} color="#64748B" />
                <span style={{ flex: 1, fontSize: '13.5px', fontWeight: 600 }}>Security & Sessions</span>
                <ChevronRight size={14} color="#94A3B8" />
              </div>

              <div 
                onClick={() => closeDrawer(() => navigate('/contact'))}
                style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 8px', borderRadius: '8px', cursor: 'pointer', color: '#334155' }}
              >
                <HelpCircle size={18} color="#64748B" />
                <span style={{ flex: 1, fontSize: '13.5px', fontWeight: 600 }}>Help & Support</span>
                <ChevronRight size={14} color="#94A3B8" />
              </div>
            </div>

            {/* Logout Footer */}
            {currentUser && (
              <div style={{ padding: '16px', borderTop: '1px solid #F1F5F9' }}>
                <button
                  onClick={() => {
                    closeDrawer();
                    logout();
                    navigate('/login');
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '12px',
                    borderRadius: '8px',
                    backgroundColor: '#FEF2F2',
                    border: '1px solid #FEE2E2',
                    color: '#DC2626',
                    fontSize: '13.5px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  <LogOut size={16} color="#DC2626" />
                  <span>Log Out</span>
                </button>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
};
