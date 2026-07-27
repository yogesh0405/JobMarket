import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { UserRole } from '../../types';

import { ForgotPasswordModal } from '../../components/auth/ForgotPasswordModal';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { login, currentUser } = useAuth();
  const { showToast } = useToast();

  const roleParam = searchParams.get('role') as UserRole;
  const role: UserRole = (roleParam === 'candidate' || roleParam === 'employer') ? roleParam : 'candidate';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);

  useEffect(() => {
    // Clear demo credentials — users must log in with real credentials
    setEmail('');
    setPassword('');
  }, [role]);

  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please enter both email and password', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const result = await login(email, password, role);
      if (result.success) {
        showToast(`Welcome back, ${result.user?.name}!`, 'success');
        if (result.user?.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/dashboard');
        }
      } else {
        showToast(result.error || 'Login failed. Please check your credentials.', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-brand" onClick={() => navigate('/')}>
          <div className="auth-brand-logo">JM</div>
          <span className="auth-brand-text">JobMarket</span>
        </div>
        <div className="auth-left-content">
          <h1>Welcome back to India's <span>Industrial Job Network</span></h1>
          <p>
            Log in to manage shifts, view worker Aadhaar credentials, check commission ledger reports, or apply to plants nearby.
          </p>
          <div className="auth-illustration">
            <div className="stat-card" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)', color: 'white', padding: '16px 20px', borderRadius: '12px' }}>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10B981', fontWeight: 'bold' }}>✓</div>
                <div>
                  <h4 style={{ margin: 0, fontWeight: '700', fontSize: '15px' }}>Verified Listings</h4>
                  <p style={{ margin: '2px 0 0 0', color: 'rgba(255,255,255,0.6)', fontSize: '12px' }}>GST and Aadhaar verified candidates & plants</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Background shapes */}
        <div className="auth-float-shape"></div>
        <div className="auth-float-shape"></div>
        <div className="auth-float-shape"></div>
      </div>

      <div className="auth-right">
        <div className="auth-form-container">
          <div className="auth-welcome">SECURE LOGIN</div>
          <h2 className="auth-title">Log In to <span>JobMarket</span></h2>

          {/* Role selector */}
          <div className="auth-role-toggle">
            {(['candidate', 'employer'] as UserRole[]).map(r => (
              <button
                key={r}
                type="button"
                className={`role-btn ${role === r ? 'active' : ''}`}
                onClick={() => setSearchParams({ role: r })}
              >
                {r === 'candidate' ? 'Worker' : 'Employer'}
              </button>
            ))}
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  )}
                </button>
              </div>
            </div>
            
            <div className="auth-form-footer">
              <label className="form-checkbox">
                <input type="checkbox" defaultChecked /> Remember me
              </label>
              <a
                href="#"
                className="auth-forgot"
                onClick={(e) => {
                  e.preventDefault();
                  setIsForgotModalOpen(true);
                }}
              >
                Forgot Password?
              </a>
            </div>
            
            <button type="submit" className="btn btn-primary btn-lg auth-submit" disabled={isLoading} style={{ background: 'var(--gradient-accent)' }}>
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="auth-switch">
            No account? <Link to={`/signup?role=${role}`}>Sign up</Link>
          </div>

        </div>
      </div>

      {/* Forgot Password Email OTP Modal */}
      <ForgotPasswordModal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
      />
    </div>
  );
};

export default LoginPage;
